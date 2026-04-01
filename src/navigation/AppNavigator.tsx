import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import HabitsScreen from "../screens/HabitsScreen";
import CommunityScreen from "../screens/CommunityScreen";
import CommunityGroupDetailScreen from "../screens/CommunityGroupDetailScreen";
import GroupChatsListScreen from "../screens/GroupChatsListScreen";
import GroupChatRoomScreen from "../screens/GroupChatRoomScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme/colors";
import type { GroupChatsStackParamList } from "./types";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const GroupChatsStack = createNativeStackNavigator<GroupChatsStackParamList>();

function GroupChatsStackNavigator() {
  return (
    <GroupChatsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "700" as const },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" },
      }}
    >
      <GroupChatsStack.Screen
        name="GroupChatsList"
        component={GroupChatsListScreen}
        options={{ headerShown: false }}
      />
      <GroupChatsStack.Screen
        name="GroupCommunityDetail"
        component={CommunityGroupDetailScreen}
        options={({ route }) => ({
          title: route.params.group.name,
          headerBackTitle: "Chats",
        })}
      />
      <GroupChatsStack.Screen
        name="GroupChatRoom"
        component={GroupChatRoomScreen}
        options={{ headerBackTitle: "Back" }}
      />
    </GroupChatsStack.Navigator>
  );
}

// Main App Tab Navigation
function MainAppNavigator() {
  const insets = require("react-native-safe-area-context").useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          borderTopWidth: 1,
          paddingBottom: 5 + insets.bottom,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HabitsTab"
        component={HabitsScreen}
        options={{
          tabBarLabel: "Habits",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="checkbox-marked-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GroupChatsTab"
        component={GroupChatsStackNavigator}
        options={{
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="forum-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          tabBarLabel: "Community",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="earth" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainApp" component={MainAppNavigator} />
    </Stack.Navigator>
  );
}
