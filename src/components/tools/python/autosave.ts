/**
 * Crash net for "I closed the tab by accident": a copy of the editor in this
 * browser's localStorage. It is per computer and per browser profile, which
 * is why the UI says "Saved on this computer" and never just "Saved".
 * Between classes, work moves by share link or downloaded file.
 */

const AUTOSAVE_KEY = "codeship-python-autosave";

export type Autosave = { code: string; savedAt: number };

export function readAutosave(): Autosave | null {
  try {
    const raw = window.localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data?.code === "string" ? { code: data.code, savedAt: Number(data.savedAt) || 0 } : null;
  } catch {
    return null;
  }
}

/** Returns the save time, or null if this browser refused (private mode, storage full or blocked). */
export function writeAutosave(code: string): number | null {
  const savedAt = Date.now();
  try {
    window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ code, savedAt }));
    return savedAt;
  } catch {
    return null;
  }
}
