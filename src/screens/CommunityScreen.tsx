import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, StyleSheet, FlatList, Text, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "../context/HabitContext";
import { useAuth } from "../context/AuthContext";
import {
  communityAnalyticsService,
  monthlyTrendPercent,
  type CommunityGlobalStats,
  type PublicLeaderboardEntry,
} from "../services/communityAnalyticsService";

const EMPTY_GLOBAL: CommunityGlobalStats = {
  totalUsers: 0,
  totalCarbonReduced: 0,
  habitsCompleted: 0,
  monthlyCarbon: {},
};

/** Shared community targets; progress uses live `totalCarbonReduced` from Firestore. */
const COMMUNITY_MILESTONE_DEFS = [
  { id: "m5k", icon: "🌱", title: "5,000 kg collective CO₂", targetKg: 5000 },
  { id: "m15k", icon: "🌿", title: "15,000 kg collective CO₂", targetKg: 15000 },
  { id: "m50k", icon: "🌍", title: "50,000 kg collective CO₂", targetKg: 50000 },
] as const;

const LEADERBOARD_SIZE = 5;

export default function CommunityScreen() {
  const { habits } = useHabits();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [globalStats, setGlobalStats] = useState<CommunityGlobalStats>(EMPTY_GLOBAL);
  const [topContributors, setTopContributors] = useState<PublicLeaderboardEntry[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGlobalStats(EMPTY_GLOBAL);
      setTopContributors([]);
      setLiveLoading(false);
      return;
    }

    setLiveLoading(true);
    const unsubs: (() => void)[] = [];

    unsubs.push(
      communityAnalyticsService.subscribeToGlobalStats((stats) => {
        setGlobalStats(stats);
        setLiveLoading(false);
      })
    );

    unsubs.push(
      communityAnalyticsService.subscribeToTopContributors(LEADERBOARD_SIZE, (entries) => {
        setTopContributors(entries);
        setLiveLoading(false);
      })
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user]);

  const treeEquivalents = Math.max(1, Math.round(globalStats.totalCarbonReduced / 22));
  const monthTrend = monthlyTrendPercent(globalStats.monthlyCarbon);
  const trendLabel =
    monthTrend === null ? "—" : `${monthTrend > 0 ? "+" : ""}${monthTrend}%`;

  const completedToday = habits.filter((h) => h.completed).length;
  const carbonToday = habits.filter((h) => h.completed).reduce((s, h) => s + h.carbonReduction, 0);
  const allHabitsDoneToday = habits.length > 0 && habits.every((h) => h.completed);

  const yourAchievements = useMemo(
    () => [
      {
        id: "1",
        emoji: "🌱",
        name: "Eco Starter",
        description: "Complete at least 1 habit today",
        unlocked: completedToday >= 1,
      },
      {
        id: "2",
        emoji: "🌿",
        name: "Guardian",
        description: "Save 3kg+ CO₂ from habits today",
        unlocked: carbonToday >= 3,
      },
      {
        id: "3",
        emoji: "🌍",
        name: "Planet Hero",
        description: "Complete 4+ habits today",
        unlocked: completedToday >= 4,
      },
      {
        id: "4",
        emoji: "♻️",
        name: "All In",
        description: "Complete every habit on your list today",
        unlocked: allHabitsDoneToday,
      },
    ],
    [completedToday, carbonToday, allHabitsDoneToday]
  );

  const renderContributor = ({ item, index }: { item: PublicLeaderboardEntry; index: number }) => (
    <View style={styles.contributorCard}>
      <View style={styles.ranking}>
        <Text style={styles.rankingNumber}>{index + 1}</Text>
      </View>
      <Text style={styles.contributorAvatar}>{item.avatar}</Text>
      <View style={styles.contributorInfo}>
        <Text style={styles.contributorName}>{item.name}</Text>
        <View style={styles.badgesContainer}>
          {Array(item.badges)
            .fill(0)
            .map((_, i) => (
              <Text key={i} style={styles.badgeIcon}>
                ⭐
              </Text>
            ))}
        </View>
      </View>
      <View style={styles.contributorStats}>
        <Text style={styles.levelBadge}>Lvl {item.level}</Text>
        <Text style={styles.carbonValue}>{item.carbonReduced}kg</Text>
      </View>
    </View>
  );

  const renderAchievement = ({ item }: { item: (typeof yourAchievements)[0] }) => (
    <View style={[styles.achievementBox, !item.unlocked && styles.achievementLocked]}>
      <Text style={styles.achievementEmoji}>{item.emoji}</Text>
      <Text style={styles.achievementName}>{item.name}</Text>
      <Text style={styles.achievementDesc}>{item.description}</Text>
      <Text style={styles.achievementStatus}>{item.unlocked ? "Unlocked" : "Locked"}</Text>
    </View>
  );

  const renderMilestone = (m: (typeof COMMUNITY_MILESTONE_DEFS)[number]) => {
    const total = globalStats.totalCarbonReduced;
    const pct = Math.min(100, Math.round((total / m.targetKg) * 100));
    const done = total >= m.targetKg;
    return (
      <View key={m.id} style={[styles.milestoneCard, done && styles.milestoneCardDone]}>
        <Text style={styles.milestoneIcon}>{m.icon}</Text>
        <View style={styles.milestoneContent}>
          <Text style={styles.milestoneTitle}>{m.title}</Text>
          <View style={styles.milestoneBar}>
            <View style={[styles.milestoneProgress, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.milestoneText}>
            {done ? "Unlocked — " : ""}
            {pct}% toward goal · {total.toLocaleString()} / {m.targetKg.toLocaleString()} kg logged
          </Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.signInTitle}>Community</Text>
          <Text style={styles.signInHint}>Sign in to see live EcoPulse impact and the contributor leaderboard.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSubtitle}>
            Collective impact, leaders, and milestones — create groups and chat from the Chats tab
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall impact on the globe</Text>
          <Text style={styles.sectionHint}>
            {globalStats.totalUsers.toLocaleString()} EcoPulse members tracked in the app. Together you have logged{" "}
            {globalStats.totalCarbonReduced.toLocaleString()} kg CO₂ reduced — roughly {treeEquivalents} tree-years of CO₂
            absorbed per year at this collective pace.
          </Text>
          {liveLoading && (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.inlineLoadingText}>Syncing live stats…</Text>
            </View>
          )}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🌍</Text>
              <Text style={styles.statValue}>{globalStats.totalCarbonReduced.toLocaleString()}kg</Text>
              <Text style={styles.statLabel}>CO₂ reduced (all users)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🌱</Text>
              <Text style={styles.statValue}>{globalStats.habitsCompleted.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Habit check-ins logged</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>{trendLabel}</Text>
              <Text style={styles.statLabel}>Vs last month</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top contributors</Text>
          <Text style={styles.sectionHint}>Members ranked by CO₂ logged from habits and action logs.</Text>
          {topContributors.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No one on the board yet. Complete habits or log transport actions — scores update for everyone in real
                time.
              </Text>
            </View>
          ) : (
            <FlatList
              data={topContributors}
              renderItem={renderContributor}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your achievements</Text>
          <Text style={styles.sectionHint}>{"Progress updates from today's habits on your list."}</Text>
          <FlatList
            data={yourAchievements}
            renderItem={renderAchievement}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.achievementRow}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community milestones</Text>
          <Text style={styles.sectionHint}>Shared goals driven by the same live total CO₂ figure as above.</Text>
          {COMMUNITY_MILESTONE_DEFS.map(renderMilestone)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  signInTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 10,
  },
  signInHint: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  inlineLoadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  statsSection: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contributorCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  ranking: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankingNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  contributorAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
  },
  badgesContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  contributorStats: {
    alignItems: "flex-end",
  },
  levelBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  carbonValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#27ae60",
  },
  achievementRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  achievementBox: {
    width: "48%",
    aspectRatio: 0.95,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.45,
  },
  achievementEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 4,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
  achievementStatus: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  milestoneCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneCardDone: {
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  milestoneIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 8,
  },
  milestoneBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  milestoneProgress: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  milestoneText: {
    fontSize: 12,
    color: "#666",
  },
});
