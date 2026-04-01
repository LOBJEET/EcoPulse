import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { communityService, CommunityGroup, groupToRouteParams } from "../services/communityService";
import type { GroupChatsStackParamList } from "../navigation/types";

const GROUPS_LOAD_TIMEOUT_MS = 12_000;

function previewInGroupLine(description: string, maxChars = 76): string {
  const d = description.trim() || "No description yet.";
  const short = d.length > maxChars ? `${d.slice(0, maxChars - 1).trim()}…` : d;
  return `In this group: ${short}`;
}

type Props = NativeStackScreenProps<GroupChatsStackParamList, "GroupChatsList">;

function rootNavigateLogin(navigation: Props["navigation"]) {
  navigation.getParent()?.getParent()?.getParent()?.navigate("Login");
}

export default function GroupChatsListScreen({ navigation }: Props) {
  const { user, loading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createMilestones, setCreateMilestones] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!user) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const name = g.name.toLowerCase();
      const desc = (g.description || "").toLowerCase();
      const inMilestones = g.milestones.some((m) => m.toLowerCase().includes(q));
      return name.includes(q) || desc.includes(q) || inMilestones;
    });
  }, [user, groups, searchQuery]);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setGroupsLoading(false);
      setGroupsError(null);
      return;
    }

    let cancelled = false;
    setGroupsLoading(true);
    setGroupsError(null);

    const loadTimeout = setTimeout(() => {
      if (cancelled) return;
      setGroupsLoading(false);
      setGroupsError(
        (prev) =>
          prev ??
          "Still waiting for groups. Check your connection and Firestore rules, or try again."
      );
    }, GROUPS_LOAD_TIMEOUT_MS);

    let unsub: (() => void) | undefined;
    try {
      unsub = communityService.subscribeToGroups(
        (list) => {
          if (cancelled) return;
          clearTimeout(loadTimeout);
          setGroups(list);
          setGroupsError(null);
          setGroupsLoading(false);
        },
        (err) => {
          if (cancelled) return;
          clearTimeout(loadTimeout);
          setGroupsError(err.message || "Could not load community groups.");
          setGroupsLoading(false);
        }
      );
    } catch {
      clearTimeout(loadTimeout);
      setGroupsError("Could not subscribe to community groups.");
      setGroupsLoading(false);
    }

    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
      unsub?.();
    };
  }, [user]);

  useEffect(() => {
    if (!createOpen) setSavingGroup(false);
  }, [createOpen]);

  const goLogin = useCallback(() => {
    rootNavigateLogin(navigation);
  }, [navigation]);

  const resetCreateForm = () => {
    setCreateName("");
    setCreateDescription("");
    setCreateMilestones("");
  };

  const handleCreateGroup = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to create a community group.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: goLogin },
      ]);
      return;
    }
    const milestones = createMilestones
      .split(/\n|,/)
      .map((m) => m.trim())
      .filter(Boolean);
    setSavingGroup(true);
    try {
      await communityService.createGroup({
        name: createName,
        description: createDescription,
        milestones,
        userId: user.uid,
      });
      resetCreateForm();
      setCreateOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create group";
      Alert.alert("Could not create group", msg);
    } finally {
      setSavingGroup(false);
    }
  };

  const renderCommunityRow = ({ item }: { item: CommunityGroup }) => {
    const isMember = user ? item.memberIds.includes(user.uid) : false;
    const isCreator = user ? item.createdBy === user.uid : false;
    return (
      <TouchableOpacity
        style={styles.communityRow}
        activeOpacity={0.65}
        onPress={() =>
          navigation.navigate("GroupCommunityDetail", { group: groupToRouteParams(item) })
        }
      >
        <View style={styles.communityRowBody}>
          <View style={styles.communityRowTop}>
            <Text style={styles.communityRowTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.communityRowMembers}>{item.memberIds.length} members</Text>
          </View>
          <Text style={styles.communityRowPreview} numberOfLines={2}>
            {previewInGroupLine(item.description)}
          </Text>
          {(isCreator || isMember) && (
            <Text style={styles.communityRowTags} numberOfLines={1}>
              {[isCreator ? "You created this" : null, isMember ? "Joined" : null]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </View>
        <Text style={styles.communityRowChevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups by name or description"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Clear search"
            >
              <MaterialCommunityIcons name="close-circle" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, styles.sectionTitleInline]}>Community groups</Text>
          <TouchableOpacity
            style={styles.createChip}
            onPress={() => {
              if (!user) {
                Alert.alert("Sign in required", "Sign in to create a group.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign in", onPress: goLogin },
                ]);
                return;
              }
              setCreateOpen(true);
            }}
          >
            <Text style={styles.createChipText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        {!user && (
          <View style={styles.authBanner}>
            <Text style={styles.authBannerText}>
              Sign in to see groups, join them, create new ones, and use group chat.
            </Text>
            <TouchableOpacity onPress={goLogin} style={styles.authBannerBtn}>
              <Text style={styles.authBannerBtnText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        )}

        {user && groupsError ? <Text style={styles.errorText}>{groupsError}</Text> : null}
        {user && !authLoading && groupsLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Loading groups…</Text>
          </View>
        ) : null}
        {user && !groupsLoading && !groupsError && groups.length === 0 ? (
          <View style={styles.emptyGroupsBox}>
            <Text style={styles.emptyGroupsTitle}>No community groups yet</Text>
            <Text style={styles.emptyGroups}>
              Create a group with + Create — everyone signed in can see it, join, and chat together.
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={filteredGroups}
        keyExtractor={(g) => g.id}
        renderItem={renderCommunityRow}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          user &&
          !authLoading &&
          !groupsLoading &&
          !groupsError &&
          groups.length > 0 &&
          searchQuery.trim() ? (
            <View style={styles.noSearchWrap}>
              <MaterialCommunityIcons name="text-search" size={40} color={colors.textSecondary} />
              <Text style={styles.noSearchTitle}>No matching groups</Text>
              <Text style={styles.noSearchText}>
                Nothing matches &quot;{searchQuery.trim()}&quot;. Try another name or keyword.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 12 }}
        keyboardShouldPersistTaps="handled"
      />

      <Modal
        visible={createOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (savingGroup) return;
          setCreateOpen(false);
          resetCreateForm();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New community group</Text>
            <Text style={styles.modalHint}>Visible to all signed-in users. Anyone can join and chat.</Text>
            <TextInput
              style={styles.input}
              placeholder="Community name"
              placeholderTextColor="#999"
              value={createName}
              onChangeText={setCreateName}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Description"
              placeholderTextColor="#999"
              value={createDescription}
              onChangeText={setCreateDescription}
              multiline
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Milestones (one per line)"
              placeholderTextColor="#999"
              value={createMilestones}
              onChangeText={setCreateMilestones}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setCreateOpen(false);
                  resetCreateForm();
                }}
                disabled={savingGroup}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, savingGroup && styles.modalSaveDisabled]}
                onPress={handleCreateGroup}
                disabled={savingGroup || !createName.trim()}
              >
                {savingGroup ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    marginBottom: 14,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
    paddingVertical: 0,
  },
  noSearchWrap: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noSearchTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textDark,
    marginTop: 12,
    marginBottom: 6,
  },
  noSearchText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 8,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  sectionTitleInline: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  createChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createChipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  authBanner: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  authBannerText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 10,
  },
  authBannerBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  authBannerBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 13,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  emptyGroupsBox: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  emptyGroupsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 8,
  },
  emptyGroups: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  communityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  communityRowBody: {
    flex: 1,
    marginRight: 8,
  },
  communityRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  communityRowTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.textDark,
  },
  communityRowMembers: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    marginLeft: 8,
  },
  communityRowPreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  communityRowTags: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  communityRowChevron: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: "300",
    marginTop: -4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textDark,
    marginBottom: 6,
  },
  modalHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 12,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  modalSave: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  modalSaveDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
