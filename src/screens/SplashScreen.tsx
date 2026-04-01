import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen({ navigation }: any) {
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      // after splash delay redirect based on auth state
      if (loading) {
        // still determining auth; just go to login and let auth listener handle redirect later
        navigation.replace("Login");
      } else {
        navigation.replace(user ? "MainApp" : "Login");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, user, loading]);

  return (
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      <View style={styles.content}>
        <Text style={styles.leafEmoji}>🌿</Text>
        <Text style={styles.logo}>EcoPulse</Text>
        <Text style={styles.subtitle}>Small Steps, Global Changes</Text>
      </View>
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 40,
  },
  leafEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 10,
  },
  loader: {
    position: "absolute",
    bottom: 60,
  },
});