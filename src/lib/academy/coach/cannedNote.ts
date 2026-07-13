import type { NoteResult } from "./coachModel";

/** No model call — just whitespace/casing cleanup, clearly not AI-polished (see route's `fallback` flag). */
export function getCannedNote(rawNote: string): NoteResult {
  const trimmed = rawNote.trim().replace(/\s+/g, " ");
  if (!trimmed) return { polishedNote: "" };
  const capitalized = trimmed[0].toUpperCase() + trimmed.slice(1);
  const punctuated = /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
  return { polishedNote: punctuated };
}
