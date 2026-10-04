/**
 * Interface text for CODEship Blocks. Children don't read these: every
 * block and button is identified by its picture and colour. The words are
 * for the adult, which is why "icons only" mode can drop block labels.
 */

export type UiLang = "en" | "fr";

export type BlockType =
  | "start_tap"
  | "start_flag"
  | "start_bump"
  | "start_message"
  | "move_right"
  | "move_left"
  | "move_up"
  | "move_down"
  | "go_home"
  | "say"
  | "record"
  | "pop"
  | "grow"
  | "shrink"
  | "hide"
  | "show"
  | "wait"
  | "go_page"
  | "repeat"
  | "send_message";

const BLOCK_LABELS: Record<UiLang, Record<BlockType, string>> = {
  en: {
    start_tap: "Start on Tap",
    start_flag: "Start on Green Flag",
    start_bump: "Start on Bump",
    start_message: "Start on Message",
    move_right: "Move Right",
    move_left: "Move Left",
    move_up: "Move Up",
    move_down: "Move Down",
    go_home: "Go Home",
    say: "Say",
    record: "Record",
    pop: "Pop",
    grow: "Grow",
    shrink: "Shrink",
    hide: "Hide",
    show: "Show",
    wait: "Wait",
    go_page: "Go to Page",
    repeat: "Repeat",
    send_message: "Send Message",
  },
  fr: {
    start_tap: "Démarrer au toucher",
    start_flag: "Démarrer au drapeau vert",
    start_bump: "Démarrer au contact",
    start_message: "Démarrer au message",
    move_right: "Aller à droite",
    move_left: "Aller à gauche",
    move_up: "Monter",
    move_down: "Descendre",
    go_home: "Retour à l'accueil",
    say: "Dire",
    record: "Ma voix",
    pop: "Pop",
    grow: "Grandir",
    shrink: "Rapetisser",
    hide: "Cacher",
    show: "Montrer",
    wait: "Attendre",
    go_page: "Aller à la page",
    repeat: "Répéter",
    send_message: "Envoyer un message",
  },
};

export const blockLabel = (lang: UiLang, type: BlockType) => BLOCK_LABELS[lang][type];

export const STRINGS = {
  en: {
    title: "Blocks",
    greenFlag: "Green flag: start this page",
    stop: "Stop",
    undo: "Undo",
    redo: "Redo",
    zoomIn: "Bigger blocks",
    zoomOut: "Smaller blocks",
    save: "Save",
    saveHint: "Download this project as a file",
    open: "Open",
    openHint: "Open a saved project file",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    linkHasRecordings: "This project has voice recordings, which can't go in a link. Use Save to download the file.",
    linkTooBig: "This project is too big for a link. Use Save to download the file.",
    linkCopyFailed: "Copy this link:",
    settings: "Adult settings",
    language: "Language",
    labels: "Block labels",
    labelsWords: "Pictures and words",
    labelsIcons: "Pictures only",
    semester: "Blocks shown",
    semesterAll: "All twenty",
    semesterUpTo: (n: number) => `Semester ${n}${n > 1 ? ` (with 1–${n - 1})` : ""}`,
    micSetup: "Set up microphone",
    micReady: "Microphone ready. It won't ask again on this computer unless the browser setting changes.",
    projectName: "Project name (for the file)",
    savedHere: (t: string) => `Saved on this computer · ${t}`,
    notSavedYet: "Not saved on this computer yet",
    openedFromFile: "Opened from a file · not saved on this computer yet",
    openedFromLink: "Opened from a link · not saved on this computer yet",
    saveFailed: "This browser won't save here. Use Save to download the file.",
    blocksFor: "Blocks for",
    page: "Page",
    pageMap: "Page 1 · map",
    addPage: "Add a page",
    deletePage: "Remove this page",
    tapAgainToRemove: "Tap again to remove",
    background: "Background",
    characters: "Characters",
    addCharacter: "Add a character",
    removeCharacter: "Remove this character",
    alsoOnOtherPages: "Already in this project",
    newCharacter: "New character",
    hiding: "Hiding",
    close: "Close",
    done: "Done",
    dropToOpen: "Drop a project file to open it",
    notAProject: "That file isn't a CODEship Blocks project.",
    brokenLink: "This link is broken or was cut short, so it couldn't be opened.",
    openConfirm: "Open this project? It replaces the one on screen. (Undo can't bring the old one back, so Save it first if you need it.)",
    // Recording
    recordTitle: "Record a voice",
    recordStart: "Record",
    recordStop: "Stop",
    recordPlay: "Play",
    recordNone: "No recording yet. Press the red button and talk.",
    recordHave: (s: string) => `Recorded ${s} s. Play it back, or record again as many times as you like.`,
    recording: (s: number) => `Recording… ${s} s left`,
    tooQuiet: "Very quiet. Move closer to the microphone.",
    micBlocked:
      "The microphone is blocked for this site. Allow it in the browser's site settings (choose “Allow on every visit”), or use a Say block this week and record next week.",
    micMissing: "No microphone was found on this device. Use a Say block this week and record next week.",
    micFailed: (why: string) => `The microphone didn't start (${why}). Use a Say block this week and record next week.`,
    tagline: "DREAM. CODE. ACHIEVE.",
  },
  fr: {
    title: "Blocs",
    greenFlag: "Drapeau vert : démarrer cette page",
    stop: "Arrêter",
    undo: "Annuler",
    redo: "Rétablir",
    zoomIn: "Blocs plus grands",
    zoomOut: "Blocs plus petits",
    save: "Enregistrer",
    saveHint: "Télécharger ce projet dans un fichier",
    open: "Ouvrir",
    openHint: "Ouvrir un fichier de projet",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    linkHasRecordings: "Ce projet contient des enregistrements de voix, qui ne tiennent pas dans un lien. Utilisez Enregistrer pour télécharger le fichier.",
    linkTooBig: "Ce projet est trop gros pour un lien. Utilisez Enregistrer pour télécharger le fichier.",
    linkCopyFailed: "Copiez ce lien :",
    settings: "Réglages pour l'adulte",
    language: "Langue",
    labels: "Texte des blocs",
    labelsWords: "Images et mots",
    labelsIcons: "Images seulement",
    semester: "Blocs affichés",
    semesterAll: "Les vingt",
    semesterUpTo: (n: number) => `Session ${n}${n > 1 ? ` (avec 1 à ${n - 1})` : ""}`,
    micSetup: "Préparer le micro",
    micReady: "Micro prêt. Il ne redemandera pas sur cet ordinateur, sauf si le réglage du navigateur change.",
    projectName: "Nom du projet (pour le fichier)",
    savedHere: (t: string) => `Enregistré sur cet ordinateur · ${t}`,
    notSavedYet: "Pas encore enregistré sur cet ordinateur",
    openedFromFile: "Ouvert depuis un fichier · pas encore enregistré sur cet ordinateur",
    openedFromLink: "Ouvert depuis un lien · pas encore enregistré sur cet ordinateur",
    saveFailed: "Ce navigateur n'enregistre pas ici. Utilisez Enregistrer pour télécharger le fichier.",
    blocksFor: "Blocs de",
    page: "Page",
    pageMap: "Page 1 · carte",
    addPage: "Ajouter une page",
    deletePage: "Retirer cette page",
    tapAgainToRemove: "Touchez encore pour retirer",
    background: "Décor",
    characters: "Personnages",
    addCharacter: "Ajouter un personnage",
    removeCharacter: "Retirer ce personnage",
    alsoOnOtherPages: "Déjà dans ce projet",
    newCharacter: "Nouveau personnage",
    hiding: "Caché",
    close: "Fermer",
    done: "Terminé",
    dropToOpen: "Déposez un fichier de projet pour l'ouvrir",
    notAProject: "Ce fichier n'est pas un projet CODEship Blocs.",
    brokenLink: "Ce lien est abîmé ou coupé, il n'a pas pu être ouvert.",
    openConfirm: "Ouvrir ce projet ? Il remplace celui à l'écran. (Annuler ne peut pas le ramener : enregistrez-le d'abord si besoin.)",
    recordTitle: "Enregistrer une voix",
    recordStart: "Enregistrer",
    recordStop: "Arrêter",
    recordPlay: "Écouter",
    recordNone: "Pas encore d'enregistrement. Appuyez sur le bouton rouge et parlez.",
    recordHave: (s: string) => `Enregistré : ${s} s. Écoutez-le, ou recommencez autant de fois que vous voulez.`,
    recording: (s: number) => `Enregistrement… encore ${s} s`,
    tooQuiet: "Très faible. Rapprochez-vous du micro.",
    micBlocked:
      "Le micro est bloqué pour ce site. Autorisez-le dans les réglages du site (choisir « Toujours autoriser »), ou utilisez un bloc Dire cette semaine et enregistrez la semaine prochaine.",
    micMissing: "Aucun micro n'a été trouvé sur cet appareil. Utilisez un bloc Dire cette semaine et enregistrez la semaine prochaine.",
    micFailed: (why: string) => `Le micro n'a pas démarré (${why}). Utilisez un bloc Dire cette semaine et enregistrez la semaine prochaine.`,
    tagline: "DREAM. CODE. ACHIEVE.",
  },
};

export type Strings = (typeof STRINGS)["en"];
