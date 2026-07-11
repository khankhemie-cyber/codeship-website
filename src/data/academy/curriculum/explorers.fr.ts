import type { LevelTranslation } from "./types";

/**
 * Transcribed from the real Trousse Explorateurs (Explorateurs_Guide_Pedagogique.pdf)
 * — a genuine Québec French kit, not a direct translation of the English guide.
 * It uses Québec's Cadre de référence de la compétence numérique throughout and
 * its own French-language project names/framing. Quiz question text isn't
 * inlined in the guide (same as Builders/Developers/Engineers) — questions
 * below are authored in French to match the guide's documented topics/rubric,
 * same disclosed approach used for the English quizzes without inline text.
 */
export const explorersFR: LevelTranslation = {
  locale: "fr",
  name: "Explorateurs",
  gradeBand: "Maternelle–1re année",
  codingSpace: "Blocs visuels CODEship",

  theoryUnits: {
    "explorers-s1-theory": {
      title: "Le code, ce sont des instructions dans l'ordre",
      bodyMd:
        "Un ordinateur fait exactement ce qu'on lui dit; l'ordre des instructions compte. Un déclencheur " +
        "démarre le code; déboguer, c'est trouver et corriger une erreur.",
    },
    "explorers-s2-theory": {
      title: "Les écrans peuvent porter la gentillesse",
      bodyMd:
        "Les mots comptent aussi en ligne : on utilise des mots gentils à l'écran. Toucher est un " +
        "déclencheur; Dire affiche un message; le public est la personne visée. Si un message semble " +
        "méchant, on parle à un adulte de confiance.",
    },
    "explorers-s3-theory": {
      title: "L'ordinateur peut vérifier et décider",
      bodyMd:
        "Une règle dit à l'ordinateur quoi faire : si ceci, alors cela. Trier, c'est mettre en groupes. " +
        "« Oui! » ou « Réessaie » est de la rétroaction. Bien recycler aide la planète.",
    },
    "explorers-s4-theory": {
      title: "Les cartes montrent des lieux réels — en sécurité",
      bodyMd:
        "Une carte montre de vrais lieux; on se déplace avec des directions. On garde son adresse exacte " +
        "privée et en sécurité; si un inconnu la demande, on parle à un adulte.",
    },
    "explorers-capstone-theory": {
      title: "Je peux créer quelque chose qui enseigne",
      bodyMd:
        "L'élève a appris à mettre les étapes dans l'ordre, à utiliser des déclencheurs, à créer des " +
        "règles, et à être gentil et prudent. Le projet synthèse rassemble tout pour enseigner une chose claire.",
    },
  },

  lessons: {
    "explorers-s1-c1": {
      title: "Mets dans l'ordre",
      objective: "Ordonner des étapes.",
      align: "Mathématiques (séquences), littératie orale",
      warmUp: "« Et si on mettait les bas après les souliers? »",
      teach: "L'ordre compte.",
      activity: "Ranger un objet dans l'ordre.",
      practice: "Numéroter/dessiner.",
      reflect: "Quelle étape en premier?",
      assess: "Pointer la 1re étape.",
      home: undefined,
    },
    "explorers-s1-c2": {
      title: "Quel bloc démarre?",
      objective: "Reconnaître un déclencheur.",
      warmUp: "« Qu'est-ce qui fait partir le code? »",
      teach: "Démarrer au toucher/drapeau vert.",
      activity: "Démarrer au toucher.",
      practice: "Encercler + associer.",
      assess: "Encercler le déclencheur.",
    },
    "explorers-s1-c3": {
      title: "Les étapes de ma tâche",
      objective: "Ordonner une vraie tâche.",
      warmUp: "Nommer une corvée.",
      teach: "Premier/ensuite/dernier.",
      activity: "Coder la tâche.",
      practice: "Dessiner 3 étapes.",
      assess: "Nommer sa tâche.",
    },
    "explorers-s1-c4": {
      title: "Trouve le bogue",
      objective: "Repérer une erreur d'ordre.",
      warmUp: "Étapes mêlées.",
      teach: "Déboguer.",
      activity: "Corriger l'ordre.",
      practice: "Encercler l'erreur.",
      assess: "Réécrire dans l'ordre.",
    },

    "explorers-s2-c1": {
      title: "Mots gentils",
      objective: "Distinguer mots gentils/pas gentils.",
      align: "Littératie; citoyenneté",
      warmUp: "« Comment un mot gentil fait sentir? »",
      activity: "Écrire un message gentil.",
      assess: "Encercler un mot gentil.",
    },
    "explorers-s2-c2": {
      title: "Ajoute un son",
      objective: "Ajouter un son (Pop).",
      align: "Mathématiques (motifs)",
      warmUp: "Compléter un motif de couleurs.",
      activity: "Ajouter Pop.",
      assess: "Encercler le bloc son.",
    },
    "explorers-s2-c3": {
      title: "Touche et dis",
      objective: "Relier un toucher à un message.",
      activity: "Toucher → Dire.",
      practice: "Associer.",
      assess: "Associer un toucher à un message.",
    },
    "explorers-s2-c4": {
      title: "Pour qui est ma carte?",
      objective: "Nommer un public.",
      align: "Littératie",
      activity: "Personnaliser la carte.",
      assess: "Nommer le destinataire.",
    },

    "explorers-s3-c1": {
      title: "Trie comme il faut",
      objective: "Classer des objets.",
      align: "Sciences (environnement); mathématiques (tri)",
      activity: "Associer objet/bac.",
      assess: "Ordonner un tri.",
    },
    "explorers-s3-c2": {
      title: "Quand ils se touchent",
      objective: "Utiliser Démarrer au contact + une règle.",
      activity: "Si contact → Dire.",
      practice: "Finir la règle.",
      assess: "Compléter « si… alors… ».",
    },
    "explorers-s3-c3": {
      title: "Compte les bons tris",
      objective: "Compter les réussites (maths).",
      activity: "Rétroaction sur bon tri.",
      practice: "Colorier + écrire le nombre.",
      assess: "Écrire un nombre.",
    },
    "explorers-s3-c4": {
      title: "Je peux recycler",
      objective: "Relier au monde réel.",
      align: "Sciences",
      practice: "Dessiner ce qu'on recyclera.",
      assess: "Nommer un geste.",
    },

    "explorers-s4-c1": {
      title: "Des lieux près de moi",
      objective: "Proche/loin.",
      align: "Univers social; mathématiques (position)",
      activity: "Placer des lieux.",
      assess: "Encercler proche/loin.",
    },
    "explorers-s4-c2": {
      title: "Touche et apprends",
      objective: "Toucher → Dire un fait.",
      activity: "Associer lieu/fait.",
      assess: "Associer un lieu à son fait.",
    },
    "explorers-s4-c3": {
      title: "Trace un trajet",
      objective: "Suite de directions.",
      activity: "Déplacer d'un lieu à l'autre.",
      practice: "Flèches + directions.",
      assess: "Donner 2 directions.",
    },
    "explorers-s4-c4": {
      title: "Correct à partager?",
      objective: "Public vs privé.",
      align: "Citoyenneté numérique",
      practice: "Trier partager/privé.",
      assess: "Nommer une info à garder privée.",
    },

    "explorers-capstone-c1": {
      title: "Ma grande idée",
      objective: "Choisir ce qu'on enseignera.",
      activity: "Créer l'appli.",
      assess: "Nommer le sujet.",
    },
    "explorers-capstone-c2": {
      title: "Mes 3 écrans",
      objective: "Planifier 3 écrans.",
      practice: "Dessiner chaque écran.",
      assess: "Décrire un écran.",
    },
    "explorers-capstone-c3": {
      title: "Mon plan de blocs",
      objective: "Choisir et ordonner les blocs.",
      activity: "Assembler.",
      assess: "Montrer l'ordre.",
    },
    "explorers-capstone-c4": {
      title: "Teste et présente",
      objective: "Tester, corriger, présenter.",
      activity: "Corriger un bogue.",
      practice: "Liste de vérification.",
      assess: "Grille synthèse (4 critères).",
    },
  },

  blockPuzzleGoals: {
    "explorers-s1-c1-puzzle": "Range le robot dans le bon ordre.",
    "explorers-s1-c2-puzzle": "Touche le robot pour qu'il dise bonjour.",
    "explorers-s1-c3-puzzle": "Ordonne la tâche : démarre, déplace-toi et dis ce que tu fais.",
    "explorers-s1-c4-puzzle": "Corrige le robot brisé pour qu'il s'affiche et dise qu'il est réparé.",
    "explorers-s2-c1-puzzle": "Fais dire quelque chose de gentil à la carte.",
    "explorers-s2-c2-puzzle": "Ajoute de la couleur et du son à la carte de gentillesse.",
    "explorers-s2-c3-puzzle": "Un deuxième personnage réagit au toucher.",
    "explorers-s2-c4-puzzle": "Personnalise la carte pour son destinataire.",
    "explorers-s3-c1-puzzle": "Trie l'objet dans le bac de recyclage du papier.",
    "explorers-s3-c2-puzzle": "Donne une rétroaction quand l'objet touche le bon bac.",
    "explorers-s3-c3-puzzle": "Affiche le compte des bons tris.",
    "explorers-s3-c4-puzzle": "Explique le sens réel du jeu.",
    "explorers-s4-c1-puzzle": "Place un repère de lieu sur la grille de la carte.",
    "explorers-s4-c2-puzzle": "Touche un lieu pour entendre un fait à son sujet.",
    "explorers-s4-c3-puzzle": "Déplace le personnage du parc à l'école.",
    "explorers-s4-c4-puzzle": "Applique la règle du privé vs partagé.",
    "explorers-capstone-c1-puzzle": "Commence le scénarimage sur l'écran de planification.",
    "explorers-capstone-c2-puzzle": "Construis le cœur de l'appli : déclencheur + message qui enseigne.",
    "explorers-capstone-c3-puzzle": "Ajoute une vérification interactive avec rétroaction.",
    "explorers-capstone-c4-puzzle": "Termine et présente l'appli.",
  },

  projects: {
    "explorers-s1-project": {
      title: "Mon robot serviable",
      brief: "Coder un robot qui fait une vraie tâche.",
      successCriteria: "Bon déclencheur, étapes ordonnées, et l'élève peut l'expliquer.",
      rubric: [
        { criterion: "Démarre au toucher / drapeau vert", description: "Utilise un bloc déclencheur pour commencer." },
        { criterion: "Étapes dans l'ordre", description: "Les blocs sont bien séquencés." },
        { criterion: "Fait une vraie tâche", description: "Le robot accomplit une tâche reconnaissable." },
        { criterion: "Peut l'expliquer", description: "L'élève peut décrire ce que fait le robot." },
      ],
      extension: "Ajouter une étape ou un son.",
    },
    "explorers-s2-project": {
      title: "Cartes de gentillesse",
      brief: "Créer une carte numérique interactive qui partage de la gentillesse.",
      successCriteria: "Un déclencheur, deux messages gentils, un son, et un public nommé.",
      rubric: [
        { criterion: "Interactive", description: "La carte répond au toucher." },
        { criterion: "2+ messages gentils", description: "Au moins deux messages distincts." },
        { criterion: "Ajoute du sentiment", description: "Utilise le son ou un changement de page." },
        { criterion: "Nomme un public", description: "L'élève nomme le destinataire." },
      ],
    },
    "explorers-s3-project": {
      title: "Trieur de recyclage",
      brief: "Un jeu de tri qui récompense le bon recyclage.",
      successCriteria: "Trie 3+ objets, donne une rétroaction bon/mauvais, compte les bons tris, explique pourquoi c'est important.",
      rubric: [
        { criterion: "Trie ≥3 objets", description: "Au moins trois objets peuvent être triés." },
        { criterion: "Rétroaction bon/mauvais", description: "Le bon et le mauvais bac réagissent différemment." },
        { criterion: "Compte les bons tris", description: "Un compteur suit les bons tris." },
        { criterion: "Explique pourquoi c'est important", description: "L'élève relie le jeu au monde réel." },
      ],
    },
    "explorers-s4-project": {
      title: "La carte de mon quartier",
      brief: "Une carte interactive de vrais lieux que tu connais.",
      successCriteria: "≥3 lieux cliquables, chacun dit un fait; un personnage peut se déplacer entre deux; règle du privé appliquée.",
      rubric: [
        { criterion: "≥3 lieux", description: "Au moins trois lieux cliquables sur la carte." },
        { criterion: "Toucher → fait", description: "Toucher un lieu révèle un fait." },
        { criterion: "Peut se déplacer", description: "Un personnage peut se déplacer entre les lieux." },
        { criterion: "Applique la règle du privé", description: "Respecte la règle de ne pas partager l'adresse exacte." },
      ],
    },
  },

  quizzes: {
    "explorers-s1-q1": [
      { prompt: "Les instructions doivent être dans le bon…", choices: ["ordre", "couleur"], answer: "ordre" },
      { prompt: "Quel bloc démarre le code quand on touche le robot?", choices: ["Démarrer au toucher", "Dire"], answer: "Démarrer au toucher" },
      { prompt: "L'ordinateur fait-il exactement ce qu'on lui dit?", choices: ["oui", "non"], answer: "oui" },
      { prompt: "Ranger ses souliers avant ses bas, est-ce dans l'ordre?", choices: ["non", "oui"], answer: "non" },
      { prompt: "Le bloc « Dire » fait…", choices: ["parler le robot", "bouger le robot"], answer: "parler le robot" },
      { prompt: "Si les étapes sont mêlées, le robot va…", choices: ["faire la mauvaise chose", "toujours bien fonctionner"], answer: "faire la mauvaise chose" },
      { prompt: "On démarre le code du robot avec un…", choices: ["bloc déclencheur", "bloc de fin"], answer: "bloc déclencheur" },
      { prompt: "Corriger une erreur dans le code s'appelle…", choices: ["déboguer", "effacer"], answer: "déboguer" },
      { prompt: "Une corvée a besoin d'étapes en…", choices: ["ordre", "désordre"], answer: "ordre" },
      { prompt: "Le bloc « Démarrer au toucher » sert à…", choices: ["démarrer le code", "arrêter le code"], answer: "démarrer le code" },
    ],
    "explorers-s1-q2": [
      { prompt: "Quelle est la 1re étape d'une tâche codée dans l'ordre?", choices: ["celle qu'on place en premier", "n'importe laquelle"], answer: "celle qu'on place en premier" },
      { prompt: "Le robot serviable doit faire une…", choices: ["vraie tâche", "danse seulement"], answer: "vraie tâche" },
      { prompt: "Tester le code, c'est…", choices: ["essayer et chercher des erreurs", "l'effacer"], answer: "essayer et chercher des erreurs" },
      { prompt: "L'ordre dans le code, est-ce important?", choices: ["vrai", "faux"], answer: "vrai" },
      { prompt: "Pour faire parler le robot, on utilise…", choices: ["Dire", "Déplacer"], answer: "Dire" },
      { prompt: "Le code est une liste de…", choices: ["instructions", "couleurs"], answer: "instructions" },
      { prompt: "Si le robot saute une étape, il faut la…", choices: ["corriger", "ignorer"], answer: "corriger" },
      { prompt: "L'élève peut expliquer son robot : cela fait partie de la…", choices: ["grille du projet", "récréation"], answer: "grille du projet" },
      { prompt: "Un déclencheur fait quoi au code?", choices: ["il le démarre", "il l'efface"], answer: "il le démarre" },
      { prompt: "L'ordinateur fait ce qu'on lui…", choices: ["dit", "devine"], answer: "dit" },
    ],
    "explorers-s2-q1": [
      { prompt: "Les mots gentils font sentir les gens…", choices: ["bien", "mal"], answer: "bien" },
      { prompt: "Toucher la carte est un…", choices: ["déclencheur", "bloc de couleur"], answer: "déclencheur" },
      { prompt: "À l'écran, on devrait être…", choices: ["gentil", "silencieux"], answer: "gentil" },
      { prompt: "Si un message semble méchant, on en parle à un…", choices: ["adulte de confiance", "personne"], answer: "adulte de confiance" },
      { prompt: "Le bloc « Dire » fait…", choices: ["parler la carte", "bouger la carte"], answer: "parler la carte" },
      { prompt: "Le bloc son ajoute…", choices: ["un son", "une couleur"], answer: "un son" },
      { prompt: "« Bravo, tu as réussi! » est un message…", choices: ["gentil", "pas gentil"], answer: "gentil" },
      { prompt: "Une couleur peut montrer un…", choices: ["sentiment", "son"], answer: "sentiment" },
      { prompt: "Être gentil en ligne, c'est comme être gentil…", choices: ["en personne", "jamais"], answer: "en personne" },
      { prompt: "Le public d'une carte, c'est…", choices: ["à qui elle est destinée", "sa couleur"], answer: "à qui elle est destinée" },
    ],
    "explorers-s2-q2": [
      { prompt: "Qu'est-ce qui arrive en premier : toucher ou Dire?", choices: ["toucher", "Dire"], answer: "toucher" },
      { prompt: "Une carte de gentillesse devrait avoir un…", choices: ["public (destinataire)", "moteur"], answer: "public (destinataire)" },
      { prompt: "Lequel est un message gentil?", choices: ["« Tu comptes! »", "« Va-t'en. »"], answer: "« Tu comptes! »" },
      { prompt: "Si on n'est pas sûr qu'un message est correct, il faut…", choices: ["demander à un adulte", "l'envoyer quand même"], answer: "demander à un adulte" },
      { prompt: "Qu'est-ce qui démarre la réponse d'une carte?", choices: ["un bloc déclencheur", "une couleur"], answer: "un bloc déclencheur" },
      { prompt: "Être gentil en ligne fait partie de la…", choices: ["citoyenneté numérique", "récréation"], answer: "citoyenneté numérique" },
      { prompt: "Une carte peut montrer un sentiment avec le son ou la…", choices: ["couleur", "silence"], answer: "couleur" },
      { prompt: "Choisir à qui la carte est destinée s'appelle choisir son…", choices: ["public", "déclencheur"], answer: "public" },
      { prompt: "Un message pas gentil devrait être…", choices: ["changé pour un message gentil", "partagé à tous"], answer: "changé pour un message gentil" },
      { prompt: "Quel bloc a fait parler la carte?", choices: ["Dire", "Déplacer"], answer: "Dire" },
    ],
    "explorers-s3-q1": [
      { prompt: "Une règle, c'est : si ceci, alors…", choices: ["cela", "rien"], answer: "cela" },
      { prompt: "Trier veut dire mettre en…", choices: ["groupes", "un seul tas"], answer: "groupes" },
      { prompt: "Bien recycler aide la…", choices: ["planète", "robot"], answer: "planète" },
      { prompt: "Toucher le bon bac donne une…", choices: ["rétroaction positive", "rien du tout"], answer: "rétroaction positive" },
      { prompt: "Compter les bons tris utilise des…", choices: ["nombres", "couleurs"], answer: "nombres" },
      { prompt: "Le papier va dans le bac…", choices: ["de recyclage du papier", "de compost"], answer: "de recyclage du papier" },
      { prompt: "Toucher le mauvais bac devrait donner…", choices: ["« Réessaie »", "aucune réponse"], answer: "« Réessaie »" },
      { prompt: "Combien de bacs faut-il, au minimum, pour un bon trieur?", choices: ["3", "1"], answer: "3" },
      { prompt: "Trier en catégories fait partie des…", choices: ["données", "arts"], answer: "données" },
      { prompt: "Pourquoi bien recycler est-il important?", choices: ["ça aide l'environnement", "c'est amusant seulement"], answer: "ça aide l'environnement" },
    ],
    "explorers-s3-q2": [
      { prompt: "« Si ça touche le bon bac, alors… »", choices: ["donne une rétroaction positive", "ne fais rien"], answer: "donne une rétroaction positive" },
      { prompt: "Quel bloc vérifie quand deux choses se touchent?", choices: ["Démarrer au contact", "Dire"], answer: "Démarrer au contact" },
      { prompt: "Une canette va dans le bac de…", choices: ["recyclage", "compost"], answer: "recyclage" },
      { prompt: "Compter les bons tris aide à savoir…", choices: ["comment on réussit", "la météo"], answer: "comment on réussit" },
      { prompt: "Le but réel du jeu est de…", choices: ["bien recycler", "gagner des points seulement"], answer: "bien recycler" },
      { prompt: "Une règle en code s'appelle aussi un…", choices: ["si-alors", "instruction seulement"], answer: "si-alors" },
      { prompt: "Combien d'objets le jeu fini doit-il trier, au minimum?", choices: ["3", "1"], answer: "3" },
      { prompt: "Quel message convient à un bon tri?", choices: ["« Oui! »", "« Réessaie. »"], answer: "« Oui! »" },
      { prompt: "Trier est une forme de…", choices: ["prise de décision", "hasard"], answer: "prise de décision" },
      { prompt: "Bien recycler est un choix qui aide…", choices: ["tout le monde", "personne"], answer: "tout le monde" },
    ],
    "explorers-s4-q1": [
      { prompt: "Toucher un lieu (Démarrer au toucher) permet d'entendre un…", choices: ["fait", "chant seulement"], answer: "fait" },
      { prompt: "Une carte montre de vrais…", choices: ["lieux", "couleurs"], answer: "lieux" },
      { prompt: "On garde son adresse exacte…", choices: ["privée", "publique"], answer: "privée" },
      { prompt: "« Haut » et « bas » sont des mots de…", choices: ["position", "gentillesse"], answer: "position" },
      { prompt: "Quel bloc déplace un personnage sur la carte?", choices: ["Déplacer", "Dire"], answer: "Déplacer" },
      { prompt: "Un lieu tout près est…", choices: ["proche", "loin"], answer: "proche" },
      { prompt: "Une école et un parc sont des exemples de…", choices: ["lieux de la communauté", "couleurs"], answer: "lieux de la communauté" },
      { prompt: "« Gauche » et « droite » sont des mots de…", choices: ["position", "déclencheur"], answer: "position" },
      { prompt: "Pourquoi ne partage-t-on pas son adresse exacte en ligne?", choices: ["pour rester en sécurité", "ce n'est pas permis de parler"], answer: "pour rester en sécurité" },
      { prompt: "Un fait sur un lieu est partagé avec quel bloc?", choices: ["Dire", "Cacher"], answer: "Dire" },
    ],
    "explorers-s4-q2": [
      { prompt: "Pour aller du parc à l'école, le personnage doit…", choices: ["se déplacer entre les deux", "rester immobile"], answer: "se déplacer entre les deux" },
      { prompt: "Toucher un lieu déclenche…", choices: ["un événement (un fait)", "rien"], answer: "un événement (un fait)" },
      { prompt: "Une carte terminée doit avoir au moins combien de lieux?", choices: ["3", "1"], answer: "3" },
      { prompt: "Qu'est-ce qui est correct à partager sur son quartier?", choices: ["le nom du quartier", "l'adresse exacte"], answer: "le nom du quartier" },
      { prompt: "Quel bloc déplace un personnage vers le bas?", choices: ["Déplacer bas", "Déplacer haut"], answer: "Déplacer bas" },
      { prompt: "Un lieu qu'on visite souvent est son…", choices: ["école", "la maison d'un inconnu"], answer: "école" },
      { prompt: "Si on n'est pas certain qu'une info est sécuritaire à partager, on demande à un…", choices: ["adulte", "personne"], answer: "adulte" },
      { prompt: "Qu'est-ce qui rend une carte interactive?", choices: ["des lieux cliquables", "seulement des couleurs"], answer: "des lieux cliquables" },
      { prompt: "Les mots de position aident à décrire…", choices: ["où sont les choses", "comment elles sonnent"], answer: "où sont les choses" },
      { prompt: "Expliquer sa carte à quelqu'un s'appelle…", choices: ["présenter", "cacher"], answer: "présenter" },
    ],
    "explorers-capstone-q1": [
      { prompt: "Le code a besoin d'étapes dans le bon…", choices: ["ordre", "couleur"], answer: "ordre" },
      { prompt: "Un bloc déclencheur…", choices: ["démarre le code", "termine le code"], answer: "démarre le code" },
      { prompt: "Une règle qui donne une rétroaction est un…", choices: ["si-alors", "instruction seulement"], answer: "si-alors" },
      { prompt: "Être gentil en ligne, c'est de la…", choices: ["gentillesse en ligne", "indifférence"], answer: "gentillesse en ligne" },
      { prompt: "On garde son adresse exacte…", choices: ["privée", "publique"], answer: "privée" },
      { prompt: "Trouver et corriger une erreur s'appelle…", choices: ["déboguer", "effacer"], answer: "déboguer" },
      { prompt: "Le bloc « Dire » fait…", choices: ["parler un personnage", "bouger un personnage"], answer: "parler un personnage" },
      { prompt: "Compter des choses utilise des…", choices: ["nombres", "couleurs"], answer: "nombres" },
      { prompt: "Trier veut dire mettre en…", choices: ["groupes", "un seul tas"], answer: "groupes" },
      { prompt: "Qu'est-ce qui démarre le code d'un personnage?", choices: ["un bloc déclencheur", "un bloc Dire"], answer: "un bloc déclencheur" },
    ],
    "explorers-capstone-q2": [
      { prompt: "Quelle habileté utilise un choix cliquable avec rétroaction?", choices: ["l'idée de vérification du semestre 3", "rien de nouveau"], answer: "l'idée de vérification du semestre 3" },
      { prompt: "Le choix gentil et sécuritaire pour partager en ligne est de…", choices: ["demander d'abord à un adulte", "tout partager"], answer: "demander d'abord à un adulte" },
      { prompt: "Mets en ordre : planifier → construire → tester →", choices: ["présenter", "effacer"], answer: "présenter" },
      { prompt: "Quelle est la meilleure rétroaction pour une bonne réponse?", choices: ["« Bravo! »", "le silence"], answer: "« Bravo! »" },
      { prompt: "Le but de l'appli montre-et-raconte est de…", choices: ["enseigner clairement une chose", "seulement bouger"], answer: "enseigner clairement une chose" },
      { prompt: "Une appli synthèse doit utiliser au moins combien des 4 habiletés apprises?", choices: ["3", "1"], answer: "3" },
      { prompt: "Présenter son appli veut dire…", choices: ["expliquer son code aux autres", "la cacher"], answer: "expliquer son code aux autres" },
      { prompt: "Un bloc déclencheur est nécessaire pour…", choices: ["démarrer l'appli", "terminer l'appli"], answer: "démarrer l'appli" },
      { prompt: "Déboguer avant de présenter aide à s'assurer que l'appli…", choices: ["fonctionne correctement", "est seulement colorée"], answer: "fonctionne correctement" },
      { prompt: "Réussir le projet synthèse veut dire être prêt pour…", choices: ["les Bâtisseurs", "les Ingénieurs"], answer: "les Bâtisseurs" },
    ],
  },

  capstone: {
    title: "Appli montre-et-raconte",
    description:
      "Une appli qui enseigne une chose — la porte de passage vers les Bâtisseurs, qui intègre les quatre " +
      "semestres : séquence, déclencheurs, règles/rétroaction, et déplacement.",
    rubric: [
      { criterion: "Utilise ≥3 habiletés apprises", description: "Au moins 3 des 4 habiletés apprises (séquence, événement, rétroaction, lieu cliquable)." },
      { criterion: "Enseigne clairement", description: "Enseigne une chose claire." },
      { criterion: "Interactive", description: "L'appli répond à l'interaction." },
      { criterion: "Présente et explique", description: "L'élève présente l'appli et explique son code." },
      { criterion: "Montre la gentillesse/sécurité", description: "Démontre les leçons de gentillesse et de sécurité du niveau." },
    ],
  },
};
