import type { AuditPayload } from "@/types/audit";

const DB_NAME = "ExtraLeadDB";
const STORE_NAME = "audits";
const DB_VERSION = 1;

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window environment"));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface SavedAudit {
  id: string;
  url: string;
  auditedAt: string;
  archived: boolean;
  payload: AuditPayload;
}

export async function saveAudit(payload: AuditPayload): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const saved: SavedAudit = {
        id: `${payload.url}-${payload.auditedAt}`,
        url: payload.url,
        auditedAt: payload.auditedAt,
        archived: false,
        payload,
      };
      const req = store.put(saved);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save audit:", err);
  }
}

export async function getAudits(): Promise<SavedAudit[]> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result as SavedAudit[]).sort(
          (a, b) => new Date(b.auditedAt).getTime() - new Date(a.auditedAt).getTime()
        );
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to get audits:", err);
    return [];
  }
}

export async function deleteAudit(id: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function toggleArchiveAudit(id: string, archived: boolean): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const data = getReq.result as SavedAudit;
      if (data) {
        data.archived = archived;
        store.put(data);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
