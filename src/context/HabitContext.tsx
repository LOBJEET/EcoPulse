import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { habitService } from "../services/habitService";
import { communityAnalyticsService } from "../services/communityAnalyticsService";

export interface Habit {
  id: string;
  icon: string;
  title: string;
  category: string;
  completed: boolean;
  carbonReduction: number;
}

export type HabitContextType = {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
};

const HabitContext = createContext<HabitContextType>({
  habits: [],
  addHabit: () => {},
  removeHabit: () => {},
  toggleHabit: () => {},
  updateHabit: () => {},
});

const DEFAULT_HABITS: Habit[] = [
  { id: "1", icon: "🚴", title: "Bike to work", category: "transport", completed: false, carbonReduction: 2.5 },
  { id: "2", icon: "🌱", title: "Use plastic-free utensils", category: "food", completed: false, carbonReduction: 0.8 },
  { id: "3", icon: "💡", title: "Turn off unused lights", category: "energy", completed: false, carbonReduction: 1.2 },
  { id: "4", icon: "♻️", title: "Recycle projects", category: "household", completed: false, carbonReduction: 0.5 },
  { id: "5", icon: "🍽️", title: "Eat vegetarian meal", category: "food", completed: false, carbonReduction: 1.5 },
  { id: "6", icon: "🚗", title: "Carpool or use transit", category: "transport", completed: false, carbonReduction: 3.0 },
  { id: "7", icon: "🌍", title: "Reduce plastic usage", category: "household", completed: false, carbonReduction: 0.7 },
  { id: "8", icon: "⏱️", title: "Take shorter showers", category: "household", completed: false, carbonReduction: 0.3 },
];

export const HabitProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);

  // date string YYYY-MM-DD
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    // optionally update date at midnight
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      setCurrentDate(today);
    }, 60_000); // check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) {
      // reset to defaults when logged out
      setHabits(DEFAULT_HABITS.map(h => ({ ...h, completed: false })));
      return;
    }

    // load both the user's stored habit list and today's completions
    (async () => {
      // first get list; fallback to defaults if none
      const stored = await habitService.getUserHabitList(user.uid);
      const baseHabits: Habit[] =
        stored && stored.length > 0
          ? stored.map((h: any) => ({ ...h, completed: false }))
          : DEFAULT_HABITS.map(h => ({ ...h }));

      const comps = await habitService.getUserHabits(user.uid, currentDate);
      setHabits(
        baseHabits.map(h => ({ ...h, completed: comps[h.id] || false }))
      );
    })();
  }, [user, currentDate]);

  const addHabit = (habit: Habit) => {
    setHabits(prev => {
      const updated = [...prev, habit];
      if (user) {
        habitService.saveUserHabitList(user.uid, updated);
      }
      return updated;
    });
  };

  const removeHabit = (id: string) => {
    setHabits(prev => {
      const updated = prev.filter(h => h.id !== id);
      if (user) {
        habitService.saveUserHabitList(user.uid, updated);
      }
      return updated;
    });
  };

  const toggleHabit = async (id: string) => {
    if (!user) {
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
      );
      return;
    }

    let payload: { carbon: number; completedDelta: 1 | -1 } | undefined;

    setHabits((prev) => {
      const habit = prev.find((h) => h.id === id);
      if (!habit) return prev;
      const newCompleted = !habit.completed;
      habitService.setHabitCompletion(user.uid, currentDate, id, newCompleted);
      payload = { carbon: habit.carbonReduction, completedDelta: newCompleted ? 1 : -1 };
      return prev.map((h) => (h.id === id ? { ...h, completed: newCompleted } : h));
    });

    if (payload) {
      try {
        await communityAnalyticsService.applyHabitCompletionDelta(
          user,
          payload.carbon,
          payload.completedDelta
        );
      } catch (err) {
        console.warn("[habits] community analytics", err);
      }
    }
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => {
      const updated = prev.map(h => (h.id === id ? { ...h, ...updates } : h));
      if (user) {
        habitService.saveUserHabitList(user.uid, updated);
      }
      return updated;
    });
  };

  return (
    <HabitContext.Provider value={{ habits, addHabit, removeHabit, toggleHabit, updateHabit }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
