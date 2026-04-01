import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { groupChatService, GroupChatMessage } from "../services/groupChatService";
import type { GroupChatsStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<GroupChatsStackParamList, "GroupChatRoom">;

export default function GroupChatRoomScreen({ navigation, route }: Props) {
  const { group } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<GroupChatMessage>>(null);

  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Member";

  useEffect(() => {
    navigation.setOptions({ title: group.name });
  }, [navigation, group.name]);

  useEffect(() => {
    const unsub = groupChatService.subscribeMessages(
      group.id,
      (list) => {
        setMessages(list);
        setChatError(null);
        setLoading(false);
      },
      (err) => {
        setChatError(err.message || "Could not load messages.");
        setLoading(false);
      }
    );
    return unsub;
  }, [group.id]);

  const send = async () => {
    if (!user) {
      Alert.alert("Sign in required", "You must be signed in to send messages.");
      return;
    }
    if (!group.memberIds.includes(user.uid)) {
      Alert.alert("Not a member", "Join this community to chat.");
      return;
    }
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      await groupChatService.sendMessage(group.id, {
        userId: user.uid,
        userName: displayName,
        text,
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Send failed";
      Alert.alert("Could not send", msg);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: GroupChatMessage }) => {
      const isMine = user?.uid === item.userId;
      const isAdmin = item.userId === group.createdBy;
      const time =
        item.createdAt?.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }) ?? "";

      return (
        <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
            {!isMine && (
              <View style={styles.nameRow}>
                <Text style={styles.senderName} numberOfLines={1}>
                  {item.userName}
                </Text>
                {isAdmin && (
                  <View style={styles.adminTag}>
                    <Text style={styles.adminTagText}>Admin</Text>
                  </View>
                )}
              </View>
            )}
            {isMine && isAdmin && (
              <Text style={styles.adminSelfLabel}>You · Admin</Text>
            )}
            <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.text}</Text>
            <Text style={[styles.timeText, isMine && styles.timeTextMine]}>{time}</Text>
          </View>
        </View>
      );
    },
    [user?.uid, group.createdBy]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.roomMeta}>
          <Text style={styles.roomMetaText}>
            {group.memberIds.length} members · Global group chat (everyone sees all messages)
          </Text>
        </View>
        {chatError ? (
          <Text style={styles.chatError} numberOfLines={2}>
            {chatError}
          </Text>
        ) : null}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 8, paddingTop: 12 },
            ]}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={styles.emptyChat}>
                No messages yet. Say hello to everyone in this group.
              </Text>
            }
          />
        )}

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.input}
            placeholder="Message the group…"
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            editable={!!user && !sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending || !user) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!input.trim() || sending || !user}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendBtnText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatError: {
    marginHorizontal: 12,
    marginTop: 8,
    color: colors.error,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  emptyChat: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 40,
    paddingHorizontal: 24,
    fontSize: 15,
  },
  msgRow: {
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "flex-start",
  },
  msgRowMine: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomMeta: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 17,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  senderName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textDark,
    maxWidth: "70%",
  },
  adminTag: {
    backgroundColor: "rgba(46, 204, 113, 0.25)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  adminTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  adminSelfLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  msgText: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 22,
  },
  msgTextMine: {
    color: "#fff",
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  timeTextMine: {
    color: "rgba(255,255,255,0.8)",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: colors.textDark,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
