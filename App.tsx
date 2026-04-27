import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { HabitProvider } from "./src/context/HabitContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <HabitProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </HabitProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}