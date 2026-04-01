import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_NOTIFICATIONS = "ecopulse_prefs_notifications";
const KEY_PRIVATE = "ecopulse_prefs_private_profile";

export const profilePreferencesService = {
  async load(): Promise<{ notificationsEnabled: boolean; privateProfile: boolean }> {
    try {
      const [n, p] = await Promise.all([
        AsyncStorage.getItem(KEY_NOTIFICATIONS),
        AsyncStorage.getItem(KEY_PRIVATE),
      ]);
      return {
        notificationsEnabled: n !== "false",
        privateProfile: p === "true",
      };
    } catch {
      return { notificationsEnabled: true, privateProfile: false };
    }
  },

  async saveNotifications(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEY_NOTIFICATIONS, enabled ? "true" : "false");
  },

  async savePrivateProfile(privateProfile: boolean): Promise<void> {
    await AsyncStorage.setItem(KEY_PRIVATE, privateProfile ? "true" : "false");
  },
};
