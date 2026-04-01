import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// date string format YYYY-MM-DD
function getDocId(userId: string, dateStr: string) {
  return `${userId}_${dateStr}`;
}

export const habitService = {
  // habit completion data is kept per-user, per-day
  async getUserHabits(userId: string, dateStr: string): Promise<{ [id: string]: boolean }> {
    const docRef = doc(db, "userHabits", getDocId(userId, dateStr));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.completions || {};
    }
    return {};
  },

  async setHabitCompletion(
    userId: string,
    dateStr: string,
    habitId: string,
    completed: boolean
  ) {
    const docRef = doc(db, "userHabits", getDocId(userId, dateStr));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, {
        [`completions.${habitId}`]: completed,
      });
    } else {
      // create document with this completion
      await setDoc(docRef, { completions: { [habitId]: completed } });
    }
  },

  // persistent list of habits for a user (not date‑specific)
  async getUserHabitList(userId: string): Promise<any[]> {
    const docRef = doc(db, "userHabitLists", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.habits || [];
    }
    return [];
  },

  async saveUserHabitList(userId: string, habits: any[]) {
    const docRef = doc(db, "userHabitLists", userId);
    await setDoc(docRef, { habits });
  },

  /**
   * Consecutive days (including today if empty) with at least one habit marked complete.
   * Uses the same YYYY-MM-DD keys as daily completions (`userHabits`).
   */
  async getCompletionStreak(userId: string, maxDays = 120): Promise<number> {
    const dateStrUtcOffset = (dayOffset: number): string => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - dayOffset);
      return d.toISOString().slice(0, 10);
    };

    let streak = 0;
    for (let dayOffset = 0; dayOffset < maxDays; dayOffset++) {
      const dateStr = dateStrUtcOffset(dayOffset);
      const comps = await this.getUserHabits(userId, dateStr);
      const hasAny = Object.values(comps).some(Boolean);
      if (hasAny) {
        streak++;
      } else if (dayOffset === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  },
};
