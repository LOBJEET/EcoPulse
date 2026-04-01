import type { User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const GLOBAL_STATS_PATH = ["communityStats", "global"] as const;
const USER_PUBLIC_COLLECTION = "userPublicStats";

function globalDoc() {
  return doc(db, GLOBAL_STATS_PATH[0], GLOBAL_STATS_PATH[1]);
}

function userPublicDoc(uid: string) {
  return doc(db, USER_PUBLIC_COLLECTION, uid);
}

export type CommunityGlobalStats = {
  totalUsers: number;
  totalCarbonReduced: number;
  habitsCompleted: number;
  monthlyCarbon: Record<string, number>;
};

export type PublicLeaderboardEntry = {
  id: string;
  name: string;
  avatar: string;
  carbonReduced: number;
  level: number;
  badges: number;
};

/** Live profile row in `userPublicStats/{uid}` (leaderboard + profile screen). */
export type UserPublicProfile = {
  displayName: string;
  avatar: string;
  carbonReduced: number;
  habitsCompleted: number;
  monthlyCarbon: Record<string, number>;
};

export function levelFromCarbon(carbon: number): number {
  return Math.min(99, Math.max(1, 1 + Math.floor(Math.max(0, carbon) / 60)));
}

export function badgesFromHabitsCompleted(habits: number): number {
  return Math.min(5, Math.max(0, Math.floor(Math.max(0, habits) / 15)));
}

function currentMonthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

export function monthlyTrendPercent(monthlyCarbon: Record<string, number> | undefined): number | null {
  if (!monthlyCarbon || typeof monthlyCarbon !== "object") return null;
  const keys = Object.keys(monthlyCarbon).filter((k) => /^\d{4}-\d{2}$/.test(k)).sort();
  if (keys.length < 2) return null;
  const cur = keys[keys.length - 1];
  const prev = keys[keys.length - 2];
  const a = Number(monthlyCarbon[cur]) || 0;
  const b = Number(monthlyCarbon[prev]) || 0;
  if (b === 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 1000) / 10;
}

const defaultGlobal = (): CommunityGlobalStats => ({
  totalUsers: 0,
  totalCarbonReduced: 0,
  habitsCompleted: 0,
  monthlyCarbon: {},
});

function mapGlobal(data: Record<string, unknown> | undefined): CommunityGlobalStats {
  if (!data) return defaultGlobal();
  const mc = data.monthlyCarbon;
  return {
    totalUsers: Number(data.totalUsers) || 0,
    totalCarbonReduced: Number(data.totalCarbonReduced) || 0,
    habitsCompleted: Number(data.habitsCompleted) || 0,
    monthlyCarbon: mc && typeof mc === "object" && !Array.isArray(mc) ? (mc as Record<string, number>) : {},
  };
}

function mapUserPublic(data: Record<string, unknown> | undefined): UserPublicProfile {
  const mc = data?.monthlyCarbon;
  return {
    displayName: String(data?.displayName ?? "EcoPulse member"),
    avatar: String(data?.avatar ?? "🌱"),
    carbonReduced: Math.round((Number(data?.carbonReduced) || 0) * 10) / 10,
    habitsCompleted: Number(data?.habitsCompleted) || 0,
    monthlyCarbon: mc && typeof mc === "object" && !Array.isArray(mc) ? (mc as Record<string, number>) : {},
  };
}

const defaultUserPublic = (): UserPublicProfile => ({
  displayName: "EcoPulse member",
  avatar: "🌱",
  carbonReduced: 0,
  habitsCompleted: 0,
  monthlyCarbon: {},
});

export const communityAnalyticsService = {
  /** Creates `userPublicStats/{uid}` and bumps `communityStats/global.totalUsers` once per new account. */
  async ensureUserPublicStats(user: User): Promise<void> {
    const ref = userPublicDoc(user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return;

    const displayName = user.displayName?.trim() || "EcoPulse member";

    await setDoc(ref, {
      displayName,
      avatar: "🌱",
      carbonReduced: 0,
      habitsCompleted: 0,
      updatedAt: serverTimestamp(),
    });

    await setDoc(
      globalDoc(),
      {
        totalUsers: increment(1),
      },
      { merge: true }
    );
  },

  /**
   * Call when a daily habit is toggled. `deltaCompleted` is +1 when marking done, -1 when undone.
   * Carbon change is habitCarbonKg * deltaCompleted.
   */
  async applyHabitCompletionDelta(user: User, habitCarbonKg: number, deltaCompleted: 1 | -1): Promise<void> {
    const deltaC = habitCarbonKg * deltaCompleted;
    await this.ensureUserPublicStats(user);

    const uRef = userPublicDoc(user.uid);
    const monthField = `monthlyCarbon.${currentMonthKey()}`;

    await setDoc(
      uRef,
      {
        displayName: user.displayName?.trim() || "EcoPulse member",
        carbonReduced: increment(deltaC),
        habitsCompleted: increment(deltaCompleted),
        [monthField]: increment(deltaC),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      globalDoc(),
      {
        totalCarbonReduced: increment(deltaC),
        habitsCompleted: increment(deltaCompleted),
        [monthField]: increment(deltaC),
      },
      { merge: true }
    );
  },

  /** Call after logging a transport / manual action with positive carbon (kg). */
  async applyActionLogCarbon(user: User, carbonKg: number): Promise<void> {
    if (carbonKg <= 0) return;
    await this.ensureUserPublicStats(user);

    const uRef = userPublicDoc(user.uid);
    const monthField = `monthlyCarbon.${currentMonthKey()}`;

    await setDoc(
      uRef,
      {
        displayName: user.displayName?.trim() || "EcoPulse member",
        carbonReduced: increment(carbonKg),
        [monthField]: increment(carbonKg),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      globalDoc(),
      {
        totalCarbonReduced: increment(carbonKg),
        [monthField]: increment(carbonKg),
      },
      { merge: true }
    );
  },

  async updateAvatar(user: User, avatarEmoji: string): Promise<void> {
    await this.ensureUserPublicStats(user);
    await setDoc(
      userPublicDoc(user.uid),
      {
        avatar: avatarEmoji.trim().slice(0, 8) || "🌱",
        displayName: user.displayName?.trim() || "EcoPulse member",
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  subscribeToUserPublicProfile(
    uid: string,
    onData: (profile: UserPublicProfile) => void,
    onError?: (e: Error) => void
  ): () => void {
    return onSnapshot(
      userPublicDoc(uid),
      (snap) => {
        if (!snap.exists()) {
          onData(defaultUserPublic());
          return;
        }
        onData(mapUserPublic(snap.data() as Record<string, unknown>));
      },
      (err) => {
        console.warn("[communityAnalytics] user profile", err);
        onError?.(err as Error);
        onData(defaultUserPublic());
      }
    );
  },

  subscribeToGlobalStats(
    onData: (stats: CommunityGlobalStats) => void,
    onError?: (e: Error) => void
  ): () => void {
    return onSnapshot(
      globalDoc(),
      (snap) => {
        onData(mapGlobal(snap.data() as Record<string, unknown> | undefined));
      },
      (err) => {
        console.warn("[communityAnalytics] global stats", err);
        onError?.(err as Error);
        onData(defaultGlobal());
      }
    );
  },

  subscribeToTopContributors(
    displayMax: number,
    onData: (entries: PublicLeaderboardEntry[]) => void,
    onError?: (e: Error) => void
  ): () => void {
    const queryLimit = Math.min(50, Math.max(displayMax * 6, displayMax));
    const q = query(
      collection(db, USER_PUBLIC_COLLECTION),
      orderBy("carbonReduced", "desc"),
      limit(queryLimit)
    );
    return onSnapshot(
      q,
      (snap) => {
        const entries: PublicLeaderboardEntry[] = [];
        snap.forEach((d) => {
          const data = d.data() as Record<string, unknown>;
          const carbon = Number(data.carbonReduced) || 0;
          const habits = Number(data.habitsCompleted) || 0;
          if (carbon <= 0) return;
          entries.push({
            id: d.id,
            name: String(data.displayName || "Member"),
            avatar: String(data.avatar || "🌿"),
            carbonReduced: Math.round(carbon * 10) / 10,
            level: levelFromCarbon(carbon),
            badges: badgesFromHabitsCompleted(habits),
          });
        });
        onData(entries.slice(0, displayMax));
      },
      (err) => {
        console.warn("[communityAnalytics] leaderboard", err);
        onError?.(err as Error);
        onData([]);
      }
    );
  },
};
