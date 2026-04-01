import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { HabitProvider } from "./src/context/HabitContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HabitProvider>
          <AppNavigator />
        </HabitProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}