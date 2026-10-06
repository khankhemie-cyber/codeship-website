/**
 * What each level asks, shown (and read aloud) when the level opens. Written
 * for 4–5 year olds: one or two short sentences, everyday words, no more
 * than about ten words each. A prompt says WHAT to do, not the blocks to
 * use. The bridge levels say the bridge comes by itself a little after the
 * start, because nothing else on screen can tell a child that.
 *
 * Every level in levels.ts must have both languages (the tests check).
 */

import type { UiLang } from "./i18n";

export const LEVEL_PROMPTS: Record<string, Record<UiLang, string>> = {
  // Semester 1: robot → star
  "s1-1": { en: "Help the robot get to the star.", fr: "Aide le robot à aller jusqu'à l'étoile." },
  "s1-2": { en: "The star is far away. Count the squares!", fr: "L'étoile est loin. Compte les cases !" },
  "s1-3": { en: "Go up to the star.", fr: "Monte jusqu'à l'étoile." },
  "s1-4": { en: "Go to the star. You need to turn!", fr: "Va jusqu'à l'étoile. Il faut tourner !" },
  "s1-5": { en: "A big rock is in the way. Go around it!", fr: "Un gros rocher bloque le chemin. Fais le tour !" },
  "s1-6": { en: "Climb the steps to the star.", fr: "Monte les marches jusqu'à l'étoile." },
  "s1-7": { en: "Get both apples. Then go to the star.", fr: "Prends les deux pommes. Puis va à l'étoile." },

  // Semester 2: cat → star
  "s2-1": { en: "The door is very small. Can you fit?", fr: "La porte est toute petite. Peux-tu passer ?" },
  "s2-2": { en: "Find the little door. Go to the star.", fr: "Trouve la petite porte. Va jusqu'à l'étoile." },
  // The bridge comes by itself after the green flag; the child's job is to Wait for it.
  "s2-3": { en: "The bridge comes a little after you start. Wait for it!", fr: "Le pont arrive un peu après le départ. Attends-le !" },
  "s2-4": { en: "Wait for the bridge. Then go up to the star.", fr: "Attends le pont. Puis monte jusqu'à l'étoile." },
  "s2-5": { en: "Get small for the door. Wait for the bridge to come!", fr: "Deviens petit pour la porte. Attends que le pont arrive !" },
  "s2-6": { en: "Get both apples. Then go to the star.", fr: "Prends les deux pommes. Puis va à l'étoile." },

  // Semester 3: can → recycling bin
  "s3-1": { en: "Take the can all the way to the bin.", fr: "Emmène la canette jusqu'au bac." },
  "s3-2": { en: "Go up, up, up to the bin.", fr: "Monte, monte, monte jusqu'au bac." },
  "s3-3": { en: "Climb the big steps to the bin.", fr: "Monte les grandes marches jusqu'au bac." },
  "s3-4": { en: "Go to the ladder. When you bump it, climb up!", fr: "Va jusqu'à l'échelle. Quand tu la touches, grimpe !" },
  "s3-5": { en: "Shh! Hide to sneak past the dog. Show at the bin!", fr: "Chut ! Cache-toi pour passer le chien. Montre-toi au bac !" },
  "s3-6": { en: "Get the apples on the steps. Then go to the bin.", fr: "Prends les pommes sur les marches. Puis va au bac." },
  "s3-7": { en: "A long road and a dog. Get to the bin!", fr: "Une longue route et un chien. Va jusqu'au bac !" },

  // Semester 4: car → places in the neighbourhood
  "s4-1": { en: "The gate is blue. Send a blue message to open it!", fr: "La barrière est bleue. Envoie un message bleu pour l'ouvrir !" },
  "s4-2": { en: "Two gates! Open them both. Drive to the library.", fr: "Deux barrières ! Ouvre-les. Roule jusqu'à la bibliothèque." },
  "s4-3": { en: "Open the yellow gate. Drive to school.", fr: "Ouvre la barrière jaune. Roule jusqu'à l'école." },
  "s4-4": { en: "A gate, a little door and a dog. Drive home!", fr: "Une barrière, une petite porte et un chien. Rentre à la maison !" },
  "s4-5": { en: "Open both gates. Drive to the library.", fr: "Ouvre les deux barrières. Roule jusqu'à la bibliothèque." },
  "s4-6": { en: "Open the gates. Get all the apples. Go to school!", fr: "Ouvre les barrières. Prends toutes les pommes. Va à l'école !" },
};

/** Reads a prompt aloud with the device's own voice, if it has one. Returns false if it can't. */
export function speak(text: string, lang: UiLang): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "fr" ? "fr-CA" : "en-CA";
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) utterance.voice = voice;
  utterance.rate = 0.85; // a little slower, for young listeners
  synth.speak(utterance);
  return true;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
