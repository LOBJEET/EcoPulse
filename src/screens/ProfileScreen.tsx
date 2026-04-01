import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Switch,
  Alert,
  Share,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  communityAnalyticsService,
  levelFromCarbon,
  type UserPublicProfile,
} from "../services/communityAnalyticsService";
import { habitService } from "../services/habitService";
import { profilePreferencesService } from "../services/profilePreferencesService";

const MONTHLY_CO2_GOAL_KG = 100;

const AVATAR_OPTIONS = ["🌱", "🌍", "🌿", "♻️", "🚴", "🦊", "🐢", "⭐"];

type MenuKey =
  | "account"
  | "habits"
  | "community"
  | "invite"
  | "help"
  | "legal";

function formatMemberSince(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [publicProfile, setPublicProfile] = useState<UserPublicProfile | null>(null);
  const [streak, setStreak] = useState(0);
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [avatarModal, setAvatarModal] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    profilePreferencesService.load().then((p) => {
      setNotifications(p.notificationsEnabled);
      setPrivateProfile(p.privateProfile);
      setPrefsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setPublicProfile(null);
      return;
    }
    const unsub = communityAnalyticsService.subscribeToUserPublicProfile(user.uid, setPublicProfile);
    return unsub;
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      habitService.getCompletionStreak(user.uid).then(setStreak).catch(() => setStreak(0));
    }, [user])
  );

  const displayName = useMemo(() => {
    if (!user) return "Guest";
    return (
      publicProfile?.displayName?.trim() ||
      user.displayName?.trim() ||
      user.email?.split("@")[0] ||
      "EcoPulse member"
    );
  }, [user, publicProfile]);

  const email = user?.email ?? "";
  const carbon = publicProfile?.carbonReduced ?? 0;
  const habitsDone = publicProfile?.habitsCompleted ?? 0;
  const level = levelFromCarbon(carbon);
  const monthKey = currentMonthKey();
  const monthCarbon = publicProfile?.monthlyCarbon?.[monthKey] ?? 0;
  const monthProgressPct = Math.min(100, Math.round((monthCarbon / MONTHLY_CO2_GOAL_KG) * 100));

  const badges = useMemo(
    () => [
      { emoji: "🌱", name: "Eco Starter", unlocked: habitsDone >= 1 },
      { emoji: "🌿", name: "Guardian", unlocked: carbon >= 40 },
      { emoji: "♻️", name: "Recycler", unlocked: habitsDone >= 25 },
      { emoji: "🔥", name: "Hot Streak", unlocked: streak >= 7 },
      { emoji: "🏆", name: "Champion", unlocked: carbon >= 180 },
    ],
    [habitsDone, carbon, streak]
  );

  const stats = useMemo(
    () => [
      { label: "Total CO₂ reduced", value: `${carbon} kg`, icon: "leaf" as const },
      { label: "Habit check-ins", value: habitsDone.toLocaleString(), icon: "check-decagram" as const },
      { label: "Day streak", value: streak > 0 ? `${streak} days` : "Start today", icon: "fire" as const },
      { label: "Level", value: `${level}`, icon: "star-four-points" as const },
    ],
    [carbon, habitsDone, streak, level]
  );

  const setNotif = async (v: boolean) => {
    setNotifications(v);
    await profilePreferencesService.saveNotifications(v);
  };

  const setPrivate = async (v: boolean) => {
    setPrivateProfile(v);
    await profilePreferencesService.savePrivateProfile(v);
  };

  const resetToLogin = () => {
    let nav: typeof navigation = navigation;
    while (typeof nav.getParent === "function" && nav.getParent()) {
      nav = nav.getParent();
    }
    if (typeof nav.reset === "function") {
      nav.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  const onLogout = async () => {
    Alert.alert("Sign out", "You will need to sign in again to use EcoPulse.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            resetToLogin();
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Could not sign out.");
          }
        },
      },
    ]);
  };

  const openMenu = (key: MenuKey) => {
    switch (key) {
      case "account":
        Alert.alert(
          "Account",
          `Signed in as\n${email || "—"}\n\nTo change your password or email, use Firebase Authentication in your project console, or add an “update password” flow later.`,
          [{ text: "OK" }]
        );
        break;
      case "habits":
        navigation.navigate("HabitsTab");
        break;
      case "community":
        navigation.navigate("CommunityTab");
        break;
      case "invite":
        Share.share({
          message: `I'm cutting my footprint with EcoPulse — join me and track eco habits together!`,
          title: "EcoPulse",
        }).catch(() => {});
        break;
      case "help":
        Linking.openURL("mailto:support@ecopulse.app?subject=EcoPulse%20help").catch(() => {
          Alert.alert("Help", "Email us at support@ecopulse.app");
        });
        break;
      case "legal":
        Alert.alert(
          "Terms & privacy",
          "EcoPulse is a demo / capstone project. Do not enter sensitive personal data. Carbon estimates are approximate. By using the app you agree to use it responsibly.",
          [{ text: "OK" }]
        );
        break;
    }
  };

  const pickAvatar = async (emoji: string) => {
    if (!user) return;
    setSavingAvatar(true);
    try {
      await communityAnalyticsService.updateAvatar(user, emoji);
      setAvatarModal(false);
    } catch (e: any) {
      Alert.alert("Could not update avatar", e?.message ?? "Try again.");
    } finally {
      setSavingAvatar(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.emptyWrap}>
          <MaterialCommunityIcons name="account-off-outline" size={56} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Not signed in</Text>
          <Text style={styles.emptySub}>Open the app from the login screen to view your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatar = publicProfile?.avatar || "🌱";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBg} />
          <View style={styles.heroInner}>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => setAvatarModal(true)}
              activeOpacity={0.85}
              accessibilityLabel="Change avatar"
            >
              <Text style={styles.avatarEmoji}>{avatar}</Text>
              <View style={styles.avatarEdit}>
                <MaterialCommunityIcons name="camera-outline" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroEmail} numberOfLines={1}>
              {email}
            </Text>
            <View style={styles.levelPill}>
              <MaterialCommunityIcons name="shield-star" size={16} color="#fff" />
              <Text style={[styles.levelPillText, styles.levelPillTextSpaced]}>Level {level}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardHeading}>Your impact</Text>
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCell}>
                <View style={styles.statIconWrap}>
                  <MaterialCommunityIcons name={s.icon} size={22} color={colors.primaryDark} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={20}
              color={colors.textDark}
              style={styles.sectionHeaderIcon}
            />
            <Text style={styles.sectionTitle}>This month</Text>
          </View>
          <Text style={styles.sectionCaption}>
            CO₂ logged this calendar month (habits + action logs). Goal: {MONTHLY_CO2_GOAL_KG} kg.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${monthProgressPct}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressMeta}>
              {monthCarbon.toFixed(1)} / {MONTHLY_CO2_GOAL_KG} kg
            </Text>
            <Text style={styles.progressPct}>{monthProgressPct}%</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={20}
              color={colors.textDark}
              style={styles.sectionHeaderIcon}
            />
            <Text style={styles.sectionTitle}>Badges</Text>
          </View>
          <View style={styles.badgesRow}>
            {badges.map((b) => (
              <View key={b.name} style={[styles.badgeChip, !b.unlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeName} numberOfLines={2}>
                  {b.name}
                </Text>
                {!b.unlocked && (
                  <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textSecondary} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="tune-variant"
              size={20}
              color={colors.textDark}
              style={styles.sectionHeaderIcon}
            />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          {!prefsLoaded ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            <>
              <View style={styles.prefRow}>
                <View style={styles.prefTextCol}>
                  <Text style={styles.prefLabel}>Push notifications</Text>
                  <Text style={styles.prefHint}>Notifications are sent to your device</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotif}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.prefDivider} />
              <View style={styles.prefRow}>
                <View style={styles.prefTextCol}>
                  <Text style={styles.prefLabel}>Private profile</Text>
                  <Text style={styles.prefHint}>Profile is hidden from the community leaderboard</Text>
                </View>
                <Switch
                  value={privateProfile}
                  onValueChange={setPrivate}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { marginBottom: 4, marginLeft: 0 }]}>More</Text>
          <MenuRow
            icon="account-cog-outline"
            label="Account"
            onPress={() => openMenu("account")}
          />
          <MenuRow
            icon="flag-checkered"
            label="Goals & habits"
            onPress={() => openMenu("habits")}
          />
          <MenuRow
            icon="earth"
            label="Community & stats"
            onPress={() => openMenu("community")}
          />
          <MenuRow
            icon="account-multiple-plus-outline"
            label="Invite friends"
            onPress={() => openMenu("invite")}
          />
          <MenuRow icon="lifebuoy" label="Help & support" onPress={() => openMenu("help")} />
          <MenuRow
            icon="file-document-outline"
            label="Terms & privacy"
            onPress={() => openMenu("legal")}
            isLast
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.9}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.footerMeta}>EcoPulse v1.0.0 · Member since {formatMemberSince(user.metadata?.creationTime)}</Text>
      </ScrollView>

      <Modal visible={avatarModal} transparent animationType="fade" onRequestClose={() => setAvatarModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => !savingAvatar && setAvatarModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choose avatar</Text>
            <View style={styles.emojiGrid}>
              {AVATAR_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, avatar === e && styles.emojiBtnActive]}
                  onPress={() => pickAvatar(e)}
                  disabled={savingAvatar}
                >
                  <Text style={styles.emojiBtnText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {savingAvatar && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
            <TouchableOpacity style={styles.modalClose} onPress={() => setAvatarModal(false)} disabled={savingAvatar}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, isLast && styles.menuRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.primaryDark} />
      <Text style={styles.menuLabel}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  hero: {
    marginBottom: 8,
  },
  heroBg: {
    height: 120,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroInner: {
    alignItems: "center",
    marginTop: -52,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 52,
  },
  avatarEdit: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  heroName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: colors.textDark,
  },
  heroEmail: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
    maxWidth: "90%",
  },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelPillText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  levelPillTextSpaced: {
    marginLeft: 6,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  statCell: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textDark,
  },
  sectionCaption: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  progressPct: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  badgeChip: {
    width: "31%",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  badgeLocked: {
    opacity: 0.45,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textDark,
    textAlign: "center",
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  prefTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  prefLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  prefHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  prefDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
    marginLeft: 12,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
    paddingVertical: 15,
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
  footerMeta: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 20,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 16,
    textAlign: "center",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emojiBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    margin: 5,
  },
  emojiBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen,
  },
  emojiBtnText: {
    fontSize: 28,
  },
  modalClose: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
