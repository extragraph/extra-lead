export const AUDIT_SOUND_STORAGE_KEY = "extralead:audit-sound";

export function readAuditSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(AUDIT_SOUND_STORAGE_KEY);
  if (v === "0") return false;
  if (v === "1") return true;
  return true;
}

export function writeAuditSoundPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIT_SOUND_STORAGE_KEY, enabled ? "1" : "0");
}
