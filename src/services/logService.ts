import { auth, db } from "./firebase";
import { communityAnalyticsService } from "./communityAnalyticsService";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface ActionLog {
  id: string;
  category: string;
  carbon: number;
  createdAt: Timestamp;
}

const ACTION_COLLECTION = "actionLogs";

/** Max recent logs for Home (keeps reads fast). Increase if you need longer history on home. */
const HOME_LOG_LIMIT = 500;

/**
 * Firestore may deliver `createdAt: null` briefly while serverTimestamp() resolves.
 * Without a fallback, "today / this week" filters drop those rows and show 0 kg.
 */
function normalizeCreatedAt(raw: unknown): Timestamp {
  if (raw instanceof Timestamp) {
    return raw;
  }
  if (raw && typeof (raw as { toDate?: () => Date }).toDate === "function") {
    try {
      return Timestamp.fromDate((raw as { toDate: () => Date }).toDate());
    } catch {
      /* fall through */
    }
  }
  if (raw && typeof (raw as { seconds?: number }).seconds === "number") {
    const s = raw as { seconds: number; nanoseconds?: number };
    return new Timestamp(s.seconds, s.nanoseconds ?? 0);
  }
  return Timestamp.fromDate(new Date());
}

export const logService = {
  async addActionLog(userId: string, category: string, carbon: number) {
    const colRef = collection(db, ACTION_COLLECTION);
    // Client clock so the doc always has `createdAt` for orderBy queries and same-day filters.
    // (serverTimestamp() leaves the field empty briefly → row missing from listener → 0 kg today/week.)
    const docRef = await addDoc(colRef, {
      userId,
      category,
      carbon,
      createdAt: Timestamp.fromDate(new Date()),
    });
    // Don’t block the UI on community totals — they update in the background (still same network, but quick action returns faster).
    const u = auth.currentUser;
    if (u?.uid === userId && carbon > 0) {
      void communityAnalyticsService.applyActionLogCarbon(u, carbon).catch((err) => {
        console.warn("[logs] community analytics", err);
      });
    }
    return docRef;
  },

  subscribeToActionLogs(
    userId: string,
    callback: (logs: ActionLog[]) => void,
    options?: { maxDocuments?: number; onFirstLoad?: () => void }
  ) {
    const colRef = collection(db, ACTION_COLLECTION);
    const maxDocs = options?.maxDocuments ?? HOME_LOG_LIMIT;
    const q = query(
      colRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxDocs)
    );
    let first = true;
    return onSnapshot(
      q,
      (snapshot) => {
        const logs: ActionLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const carbon = Number(data.carbon) || 0;
          logs.push({
            id: docSnap.id,
            category: String(data.category ?? "action"),
            carbon,
            createdAt: normalizeCreatedAt(data.createdAt),
          });
        });
        callback(logs);
        if (first) {
          first = false;
          options?.onFirstLoad?.();
        }
      },
      (err) => {
        console.warn("[logService] actionLogs snapshot", err);
        callback([]);
        if (first) {
          first = false;
          options?.onFirstLoad?.();
        }
      }
    );
  },
};
