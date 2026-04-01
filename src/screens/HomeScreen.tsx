import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useHabits } from "../context/HabitContext";
import { logService, ActionLog } from "../services/logService";
import { Timestamp } from "firebase/firestore";

const OPTIMISTIC_ID_PREFIX = "optimistic-";

/** Keep local “pending” rows until Firestore snapshot includes a matching log. */
function mergeServerLogsWithOptimistic(prev: ActionLog[], server: ActionLog[]): ActionLog[] {
  const optimistic = prev.filter((l) => l.id.startsWith(OPTIMISTIC_ID_PREFIX));
  const kept = optimistic.filter((o) => {
    const matched = server.some(
      (s) =>
        s.category === o.category &&
        Math.abs(s.carbon - o.carbon) < 0.001 &&
        Math.abs(s.createdAt.toMillis() - o.createdAt.toMillis()) < 120_000
    );
    return !matched;
  });
  const merged = [...kept, ...server];
  merged.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  return merged;
}

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function logToDate(log: ActionLog): Date {
  try {
    return log.createdAt.toDate();
  } catch {
    return new Date();
  }
}

function startOfLocalWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay();
  x.setDate(x.getDate() - dow);
  return x;
}

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  category: string;
}

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { habits } = useHabits();

  // persisted action logs from Firestore (capped server-side for speed)
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [logsReady, setLogsReady] = useState(false);
  // weather information
  const [weather, setWeather] = useState<{ temp?: number; desc?: string }>({});

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLogsReady(true);
      return;
    }
    setLogsReady(false);
    const unsub = logService.subscribeToActionLogs(
      user.uid,
      (serverLogs) => {
        setLogs((prev) => mergeServerLogsWithOptimistic(prev, serverLogs));
      },
      { onFirstLoad: () => setLogsReady(true) }
    );
    return unsub;
  }, [user]);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const key = "UEDCS2B5AAFTCB3BZZQLM2ZL8";
        const res = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${key}&include=current`
        );
        const data = await res.json();
        if (data && data.currentConditions) {
          setWeather({ temp: data.currentConditions.temp, desc: data.currentConditions.conditions });
        }
      } catch (e) {
        console.warn("weather fetch failed", e);
      }
    };

    // request location permission and fetch
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      fetchWeather(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const quickActions: QuickAction[] = [
    { id: "1", icon: "🚗", label: "Log Transport", category: "transport" },
    { id: "2", icon: "🍽️", label: "Log Food", category: "food" },
    { id: "3", icon: "⚡", label: "Log Energy", category: "energy" },
    { id: "4", icon: "♻️", label: "Log Household", category: "household" },
  ];

  // Calculate stats from habits
  const habitsCompleted = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const progressPercentage = totalHabits > 0 ? (habitsCompleted / totalHabits) * 100 : 0;
  const userName = user?.displayName || "User";

  // logs totals per day/week — local calendar + memoized so we do not re-filter on unrelated renders
  const { dailyTotal, weeklyTotal } = useMemo(() => {
    const now = new Date();
    const todayKey = localYmd(now);
    const weekStart = startOfLocalWeek(now);

    let daySum = 0;
    let weekSum = 0;
    for (const l of logs) {
      const d = logToDate(l);
      if (localYmd(d) === todayKey) {
        daySum += l.carbon;
      }
      if (d >= weekStart && d <= now) {
        weekSum += l.carbon;
      }
    }
    return { dailyTotal: daySum, weeklyTotal: weekSum };
  }, [logs]);

  // carbon score computed from habits + firestore logs
  const habitCarbon = habits
    .filter(h => h.completed)
    .reduce((sum, h) => sum + h.carbonReduction, 0);
  const logCarbon = logs.reduce((sum, a) => sum + a.carbon, 0);
  const carbonScore = Math.round(habitCarbon + logCarbon);

  const actionCarbon: { [key: string]: number } = {
    transport: 1.0,
    food: 0.5,
    energy: 0.8,
    household: 0.4,
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to log actions.");
      return;
    }
    const carbon = actionCarbon[action.category] || 0;
    const optimisticId = `${OPTIMISTIC_ID_PREFIX}${Date.now()}`;
    const optimistic: ActionLog = {
      id: optimisticId,
      category: action.category,
      carbon,
      createdAt: Timestamp.fromDate(new Date()),
    };
    setLogs((prev) => [optimistic, ...prev]);

    try {
      await logService.addActionLog(user.uid, action.category, carbon);
    } catch (e: any) {
      setLogs((prev) => prev.filter((l) => l.id !== optimisticId));
      Alert.alert("Error", e?.message ?? "Could not log action.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top","bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: insets.bottom}}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName.split(' ')[0]}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Text>
          {weather.temp !== undefined && (
            <Text style={styles.weather}>{weather.temp}°C, {weather.desc}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Carbon Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Daily Carbon Score</Text>
        <Text style={styles.scoreValue}>{carbonScore}</Text>
        <View style={styles.scoreBar}>
          <View style={[styles.scoreProgress, { width: `${carbonScore}%` }]} />
        </View>
        <Text style={styles.scoreHint}>Great job! Keep making an impact today.</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{habitsCompleted}</Text>
          <Text style={styles.statLabel}>Habits Done</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Math.round(progressPercentage)}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>
      {/* Daily/Weekly Totals */}
      <View style={styles.totalsRow}>
        {!logsReady ? (
          <View style={styles.totalsLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.totalsLoadingText}>Loading activity…</Text>
          </View>
        ) : (
          <>
            <Text style={styles.totalsText}>Today: {dailyTotal.toFixed(1)}kg</Text>
            <Text style={styles.totalsText}>This week: {weeklyTotal.toFixed(1)}kg</Text>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => handleQuickAction(action)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Eco Tip</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Transport Tip</Text>
          <Text style={styles.tipText}>Walking or cycling for short trips can reduce your carbon footprint by up to 5kg per week!</Text>
        </View>
      </View>

      {/* Activity Log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Log</Text>
        {logs.length === 0 ? (
          <Text style={styles.noLog}>No actions logged yet.</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logText}>
                {log.category} - {log.carbon}kg
              </Text>
              <Text style={styles.logTime}>{logToDate(log).toLocaleString()}</Text>
            </View>
          ))
        )}
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
    // no fixed padding at top; safe area handles it
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: 24,
  },
  scoreCard: {
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  scoreBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginVertical: 12,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  scoreHint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  weather: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
    minHeight: 32,
  },
  totalsLoading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  totalsLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalsText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: "600",
    textAlign: "center",
  },
  tipCard: {
    backgroundColor: "#e8f4f8",
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: colors.textDark,
    lineHeight: 20,
  },
  noLog: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  logItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logText: {
    fontSize: 14,
    color: colors.textDark,
  },
  logTime: {
    fontSize: 12,
    color: "#999",
  },
});