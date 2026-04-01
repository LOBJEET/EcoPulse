import { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import {
  communityService,
  CommunityGroup,
  groupToRouteParams,
  routeParamsToGroup,
} from "../services/communityService";
import type { GroupChatsStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<GroupChatsStackParamList, "GroupCommunityDetail">;

export default function CommunityGroupDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [group, setGroup] = useState<CommunityGroup>(() => routeParamsToGroup(route.params.group));
  const [actionBusy, setActionBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    setGroup(routeParamsToGroup(route.params.group));
  }, [route.params.group.id, route.params.group.memberIds.join("-")]);

  const isMember = user ? group.memberIds.includes(user.uid) : false;
  const isCreator = user ? group.createdBy === user.uid : false;

  const goLogin = useCallback(() => {
    navigation.getParent()?.getParent()?.getParent()?.navigate("Login");
  }, [navigation]);

  const handleJoinToggle = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Sign in to join community groups.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: goLogin },
      ]);
      return;
    }
    setActionBusy(true);
    try {
      if (isMember) {
        await communityService.leaveGroup(group.id, user.uid);
        setGroup((g) => ({
          ...g,
          memberIds: g.memberIds.filter((id) => id !== user.uid),
        }));
      } else {
        await communityService.joinGroup(group.id, user.uid);
        setGroup((g) => ({
          ...g,
          memberIds: g.memberIds.includes(user.uid) ? g.memberIds : [...g.memberIds, user.uid],
        }));
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      Alert.alert("Error", msg);
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = () => {
    if (!user || !isCreator) return;
    Alert.alert(
      "Delete this community?",
      `"${group.name}" will be removed for everyone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setDeleteBusy(true);
              try {
                await communityService.deleteGroup(group.id);
                navigation.goBack();
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "Delete failed";
                Alert.alert("Could not delete group", msg);
              } finally {
                setDeleteBusy(false);
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {isCreator && <Text style={styles.creatorBadge}>You created this community</Text>}
        <Text style={styles.sectionLabel}>About</Text>
        <Text style={styles.description}>
          {group.description.trim() || "No description yet."}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{group.memberIds.length} members</Text>
          {user && isMember && (
            <Text style={styles.metaJoined}>{" · You're in this group"}</Text>
          )}
        </View>

        {group.milestones.length > 0 && (
          <View style={styles.milestoneSection}>
            <Text style={styles.sectionLabel}>Community milestones</Text>
            {group.milestones.map((m, i) => (
              <Text key={`m-${i}`} style={styles.milestoneLine}>
                • {m}
              </Text>
            ))}
          </View>
        )}

        {isMember && (
          <TouchableOpacity
            style={styles.openChatBtn}
            onPress={() =>
              navigation.navigate("GroupChatRoom", { group: groupToRouteParams(group) })
            }
          >
            <Text style={styles.openChatBtnText}>Open group chat</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.joinButton, isMember && styles.joinButtonJoined]}
            onPress={handleJoinToggle}
            disabled={!user || actionBusy || deleteBusy}
          >
            {actionBusy ? (
              <ActivityIndicator color={isMember ? colors.primary : "#fff"} />
            ) : (
              <Text style={[styles.joinButtonText, isMember && styles.joinButtonTextJoined]}>
                {isMember ? "Leave group" : "Join"}
              </Text>
            )}
          </TouchableOpacity>

          {isCreator && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              disabled={actionBusy || deleteBusy}
            >
              {deleteBusy ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text style={styles.deleteBtnText}>Delete community</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  creatorBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryDark,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  metaJoined: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  milestoneSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginBottom: 24,
  },
  milestoneLine: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  openChatBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  openChatBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  actions: {
    marginTop: 0,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  joinButtonJoined: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  joinButtonTextJoined: {
    color: colors.primary,
  },
  deleteBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: "#fff",
  },
  deleteBtnText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 15,
  },
});
