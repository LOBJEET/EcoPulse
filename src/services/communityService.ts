import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export type CommunityGroup = {
  id: string;
  name: string;
  description: string;
  milestones: string[];
  memberIds: string[];
  createdBy: string;
  createdAt: Date | null;
};

/** Serializable snapshot for React Navigation params */
export type CommunityGroupRouteParams = {
  id: string;
  name: string;
  description: string;
  milestones: string[];
  memberIds: string[];
  createdBy: string;
  createdAtIso: string | null;
};

export function groupToRouteParams(g: CommunityGroup): CommunityGroupRouteParams {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    milestones: [...g.milestones],
    memberIds: [...g.memberIds],
    createdBy: g.createdBy,
    createdAtIso: g.createdAt ? g.createdAt.toISOString() : null,
  };
}

export function routeParamsToGroup(p: CommunityGroupRouteParams): CommunityGroup {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    milestones: p.milestones,
    memberIds: [...p.memberIds],
    createdBy: p.createdBy,
    createdAt: p.createdAtIso ? new Date(p.createdAtIso) : null,
  };
}

const GROUPS_COLLECTION = "communityGroups";

const DEFAULT_WRITE_TIMEOUT_MS = 25_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (t !== undefined) clearTimeout(t);
  });
}

function mapDoc(id: string, data: Record<string, unknown>): CommunityGroup {
  const createdAt = data.createdAt;
  let date: Date | null = null;
  if (createdAt instanceof Timestamp) {
    date = createdAt.toDate();
  }
  return {
    id,
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    milestones: Array.isArray(data.milestones) ? (data.milestones as string[]).filter(Boolean) : [],
    memberIds: Array.isArray(data.memberIds) ? (data.memberIds as string[]) : [],
    createdBy: String(data.createdBy ?? ""),
    createdAt: date,
  };
}

export const communityService = {
  subscribeToGroups(
    onData: (groups: CommunityGroup[]) => void,
    onError?: (e: Error) => void
  ): () => void {
    // Listen on the whole collection (no orderBy) so an empty DB and missing indexes
    // on `createdAt` still deliver a first snapshot immediately; sort client-side.
    const col = collection(db, GROUPS_COLLECTION);
    return onSnapshot(
      col,
      (snap) => {
        const groups = snap.docs
          .map((d) => mapDoc(d.id, d.data() as Record<string, unknown>))
          .sort((a, b) => {
            const ta = a.createdAt?.getTime() ?? 0;
            const tb = b.createdAt?.getTime() ?? 0;
            return tb - ta;
          });
        onData(groups);
      },
      (err) => {
        onError?.(err);
      }
    );
  },

  async createGroup(input: {
    name: string;
    description: string;
    milestones: string[];
    userId: string;
  }): Promise<void> {
    const name = input.name.trim();
    const description = input.description.trim();
    if (!name) throw new Error("Community name is required");

    // Client Timestamp avoids serverTimestamp() round-trip delays on RN.
    // Long timeout only so a stuck Firestore client always settles and the UI spinner stops.
    const CREATE_TIMEOUT_MS = 90_000;
    await withTimeout(
      addDoc(collection(db, GROUPS_COLLECTION), {
        name,
        description,
        milestones: input.milestones.map((m) => m.trim()).filter(Boolean),
        memberIds: [input.userId],
        createdBy: input.userId,
        createdAt: Timestamp.now(),
      }),
      CREATE_TIMEOUT_MS,
      "Firestore did not respond in time. Enable long polling is set in firebase.ts; also check internet, Expo env keys, and Firestore rules."
    );
  },

  async joinGroup(groupId: string, userId: string): Promise<void> {
    const ref = doc(db, GROUPS_COLLECTION, groupId);
    await withTimeout(
      updateDoc(ref, {
        memberIds: arrayUnion(userId),
      }),
      DEFAULT_WRITE_TIMEOUT_MS,
      "Could not join this group in time. Check your connection and Firestore rules."
    );
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const ref = doc(db, GROUPS_COLLECTION, groupId);
    await withTimeout(
      updateDoc(ref, {
        memberIds: arrayRemove(userId),
      }),
      DEFAULT_WRITE_TIMEOUT_MS,
      "Could not leave this group in time. Check your connection and Firestore rules."
    );
  },

  /** Only the document creator should call this; enforce with Firestore security rules. */
  async deleteGroup(groupId: string): Promise<void> {
    await withTimeout(
      deleteDoc(doc(db, GROUPS_COLLECTION, groupId)),
      DEFAULT_WRITE_TIMEOUT_MS,
      "Could not delete this group in time. Check your connection and Firestore rules."
    );
  },
};
