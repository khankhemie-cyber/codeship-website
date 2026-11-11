import type { Line } from "./story";

/**
 * The CODEship Adventure story: Captain Kai and Bolt the robot need fuel
 * crystals and a working star map to fly the CODEship home.
 *
 * Lines are short, one idea each, so they work read aloud to a five-year-old.
 */

export type TutorialStep = { target: string; match: string; hint: { en: string; fr: string } };

export type Chapter = {
  id: "rover" | "stitch";
  title: { en: string; fr: string };
  place: { en: string; fr: string };
  intro: Line[];
  /** Story beats shown before a level (0-based level index). */
  before: Record<number, Line[]>;
  outro: Line[];
  /** Guided steps for the chapter's first level. */
  tutorial: TutorialStep[];
};

export const PROLOGUE: Line[] = [
  { who: "kai", en: "Hi! I'm Captain Kai, pilot of the CODEship.", fr: "Salut ! Je suis la capitaine Kai, pilote du CODEship." },
  { who: "bolt", en: "Beep boop! I'm Bolt, the ship's robot.", fr: "Bip boup ! Je suis Bolt, le robot du vaisseau." },
  { who: "kai", en: "Our ship needs fuel and a star map to fly home.", fr: "Notre vaisseau a besoin de carburant et d'une carte du ciel pour rentrer." },
  { who: "bolt", en: "Robots need code to know what to do. Will you be our coder?", fr: "Les robots ont besoin de code pour savoir quoi faire. Veux-tu être notre codeur ?" },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "rover",
    title: { en: "Rover Roads", fr: "Routes du rover" },
    place: { en: "Planet Pebble", fr: "Planète Caillou" },
    intro: [
      { who: "kai", en: "We landed on Planet Pebble. Our rover is far from the base!", fr: "Nous sommes sur la planète Caillou. Notre rover est loin de la base !" },
      { who: "bolt", en: "The rover follows roads all by itself.", fr: "Le rover suit les routes tout seul." },
      { who: "bolt", en: "Build a road from the rover to the base. Then press Go!", fr: "Construis une route du rover jusqu'à la base. Puis appuie sur Go !" },
    ],
    before: {
      2: [{ who: "kai", en: "Roads can turn! Use a corner piece to change direction.", fr: "Les routes peuvent tourner ! Utilise un virage pour changer de direction." }],
      4: [
        { who: "bolt", en: "Shiny crystals! They are fuel for our ship.", fr: "Des cristaux brillants ! C'est le carburant du vaisseau." },
        { who: "bolt", en: "Make the road go over every crystal.", fr: "Fais passer la route sur chaque cristal." },
      ],
      5: [{ who: "kai", en: "Watch out for rocks. Roads can't go through them!", fr: "Attention aux rochers. Les routes ne passent pas dessus !" }],
      6: [{ who: "kai", en: "We're almost out of road pieces. Count them carefully!", fr: "Il nous reste peu de morceaux de route. Compte-les bien !" }],
      7: [
        { who: "bolt", en: "Oh no! A dust storm mixed up the road.", fr: "Oh non ! Une tempête de poussière a mélangé la route." },
        { who: "bolt", en: "Find the wrong piece and fix it. That's called debugging!", fr: "Trouve le mauvais morceau et répare-le. Ça s'appelle déboguer !" },
      ],
      9: [{ who: "kai", en: "Last trip! Get both crystals and come home.", fr: "Dernier voyage ! Prends les deux cristaux et reviens." }],
    },
    outro: [
      { who: "kai", en: "The rover is home with all the crystals. Amazing coding!", fr: "Le rover est rentré avec tous les cristaux. Super code !" },
      { who: "bolt", en: "Fuel tanks: full! Next stop: the star map.", fr: "Réservoirs : pleins ! Prochaine étape : la carte du ciel." },
    ],
    tutorial: [
      { target: "piece--", match: "piece:-", hint: { en: "Tap the straight road", fr: "Touche la route droite" } },
      { target: "cell-2,2", match: "cell:2,2", hint: { en: "Now tap the square next to the rover", fr: "Touche la case à côté du rover" } },
      { target: "cell-3,2", match: "cell:3,2", hint: { en: "One more road square", fr: "Encore une case de route" } },
      { target: "go", match: "go", hint: { en: "Press Go!", fr: "Appuie sur Go !" } },
    ],
  },
  {
    id: "stitch",
    title: { en: "Star Stitch", fr: "Couture d'étoiles" },
    place: { en: "The Night Sky", fr: "Le ciel de nuit" },
    intro: [
      { who: "kai", en: "To fly home we need the star map. But the stars came apart!", fr: "Pour rentrer, il faut la carte du ciel. Mais les étoiles se sont détachées !" },
      { who: "bolt", en: "Join the stars with one stretchy line.", fr: "Relie les étoiles avec une seule ligne élastique." },
      { who: "bolt", en: "Don't lift your finger: each new star joins on to the last one.", fr: "Ne lève pas le doigt : chaque nouvelle étoile se relie à la précédente." },
    ],
    before: {
      3: [
        { who: "bolt", en: "Tricky one! Where you start matters.", fr: "Celle-ci est difficile ! L'endroit où tu commences compte." },
        { who: "kai", en: "If you get stuck, press Start over and try a different star.", fr: "Si tu es bloqué, appuie sur Recommencer et essaie une autre étoile." },
      ],
      5: [
        { who: "kai", en: "Bolt found a code card!", fr: "Bolt a trouvé une carte de code !" },
        { who: "bolt", en: "Tap the stars in the same order as the card. What picture will it make?", fr: "Touche les étoiles dans l'ordre de la carte. Quelle image va apparaître ?" },
      ],
      9: [{ who: "bolt", en: "The last code card is a secret picture. Follow it carefully!", fr: "La dernière carte de code cache une image secrète. Suis-la bien !" }],
    },
    outro: [
      { who: "kai", en: "The star map is fixed. It's the CODEship!", fr: "La carte du ciel est réparée. C'est le CODEship !" },
      { who: "bolt", en: "Three, two, one... blast off! Thank you, coder!", fr: "Trois, deux, un... décollage ! Merci, codeur !" },
    ],
    tutorial: [
      { target: "peg-0", match: "peg:0", hint: { en: "Tap a star to start", fr: "Touche une étoile pour commencer" } },
      { target: "peg-1", match: "peg:1", hint: { en: "Tap the top star to stretch the line", fr: "Touche l'étoile du haut pour étirer la ligne" } },
      { target: "peg-2", match: "peg:2", hint: { en: "Now this star", fr: "Maintenant cette étoile" } },
      { target: "peg-0", match: "peg:0", hint: { en: "Back to the first star to finish!", fr: "Retourne à la première étoile pour finir !" } },
    ],
  },
];
