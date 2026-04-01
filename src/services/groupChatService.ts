import {
  addDoc,
  collection,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const GROUPS_COLLECTION = "communityGroups";
const MESSAGES_SUB = "messages";

export type GroupChatMessage = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date | null;
};

function mapMessage(id: string, data: Record<string, unknown>): GroupChatMessage {
  const createdAt = data.createdAt;
  let date: Date | null = null;
  if (createdAt instanceof Timestamp) {
    date = createdAt.toDate();
  }
  return {
    id,
    text: String(data.text ?? ""),
    userId: String(data.userId ?? ""),
    userName: String(data.userName ?? "Member"),
    createdAt: date,
  };
}

export const groupChatService = {
  subscribeMessages(
    groupId: string,
    onData: (messages: GroupChatMessage[]) => void,
    onError?: (e: Error) => void
  ): () => void {
    const col = collection(db, GROUPS_COLLECTION, groupId, MESSAGES_SUB);
    return onSnapshot(
      col,
      (snap) => {
        const messages = snap.docs
          .map((d) => mapMessage(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => {
            const ta = a.createdAt?.getTime() ?? 0;
            const tb = b.createdAt?.getTime() ?? 0;
            return ta - tb;
          });
        onData(messages);
      },
      (err) => onError?.(err)
    );
  },

  async sendMessage(groupId: string, input: { userId: string; userName: string; text: string }): Promise<void> {
    const text = input.text.trim();
    if (!text) return;
    await addDoc(collection(db, GROUPS_COLLECTION, groupId, MESSAGES_SUB), {
      text,
      userId: input.userId,
      userName: input.userName.trim() || "Member",
      createdAt: Timestamp.now(),
    });
  },
};
