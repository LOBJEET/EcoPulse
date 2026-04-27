import { View, TextInput, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // SignUp specific fields
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");

  const { login, register } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    // Validation
    if (isSignUp) {
      if (!name.trim()) {
        Alert.alert("Error", "Please enter your name");
        return;
      }
      if (!email || !validateEmail(email)) {
        Alert.alert("Error", "Please enter a valid email");
        return;
      }
      if (!validatePassword(password)) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
    } else {
      if (!email || !validateEmail(email)) {
        Alert.alert("Error", "Please enter a valid email");
        return;
      }
      if (!password) {
        Alert.alert("Error", "Please enter your password");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await register({
          email,
          password,
          displayName: name,
          phoneNumber: phoneNumber || undefined,
          bio: bio || undefined,
        });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    // Clear form when switching
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setPhoneNumber("");
    setBio("");
    setIsSignUp(!isSignUp);
  };

  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top","bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer,{paddingBottom: insets.bottom}]}
      >
        <View style={styles.header}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.appName}>EcoPulse</Text>
        <Text style={styles.tagline}>Be the Change You Want to See</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>{isSignUp ? "Join the Movement" : "Welcome Back"}</Text>

        {isSignUp && (
          <>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
            <TextInput
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#999"
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />
            <TextInput
              placeholder="Bio (Optional)"
              placeholderTextColor="#999"
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </>
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {isSignUp && (
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
        )}

        <PrimaryButton
          title={loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          onPress={handleAuth}
        />

        <TouchableOpacity onPress={handleToggle} disabled={loading}>
          <Text style={styles.toggleText}>
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  formContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  bioInput: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 20,
    textAlign: "center",
    fontWeight: "600",
  },
});