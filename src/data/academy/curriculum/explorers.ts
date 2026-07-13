import { makeBlockPuzzle } from "./makeBlockPuzzle";
import type { RawLevelCurriculum } from "./types";

/**
 * Transcribed from Explorers_Curriculum_Guide.pdf (the "Complete Teaching Document").
 * Quiz 1/Quiz 2 for Semester 1 and Quiz 1 for Semester 2 are verbatim from the guide.
 * The remaining quizzes (S2 Quiz 2, S3, S4, Capstone) are marked `authored: true` —
 * the guide only gives topic summaries for those ("e.g. ... etc."), so questions were
 * written to match the documented topics/answers in the same style as the verbatim
 * ones, per the agreed approach for levels without inline quiz text.
 */
export const explorers: RawLevelCurriculum = {
  level: "explorers",
  name: "Explorers",
  gradeBand: "K–Grade 1",
  codingSpace: "CODEship Blocks (visual)",
  accentColour: "#E5A823",
  orderIndex: 1,

  theoryUnits: [
    {
      id: "explorers-s1-theory",
      level: "explorers",
      semester: "1",
      title: "Code is instructions in order",
      bodyMd:
        "What an instruction is; why order matters (unplugged: 'make a jam sandwich' gone wrong); " +
        "computers only do exactly what we say; gentle AI seed — 'smart helpers like voice assistants " +
        "follow instructions too.'",
    },
    {
      id: "explorers-s2-theory",
      level: "explorers",
      semester: "2",
      title: "Screens can carry kindness",
      bodyMd:
        "Words matter online too; kind vs. unkind messages; a first 'digital citizenship' seed — " +
        "'we're kind on screens, like in person'; ask a grown-up if something feels wrong.",
    },
    {
      id: "explorers-s3-theory",
      level: "explorers",
      semester: "3",
      title: "Computers can check and decide",
      bodyMd: "A rule = 'if this, then that'; sorting into groups (data categories); why recycling right matters.",
    },
    {
      id: "explorers-s4-theory",
      level: "explorers",
      semester: "4",
      title: "Maps and place",
      bodyMd:
        "Near/far, left/right/up/down (spatial); a map shows real places; a first 'private vs. share' " +
        "cyber seed — 'we don't share exactly where we live with strangers online.'",
    },
    {
      id: "explorers-capstone-theory",
      level: "explorers",
      semester: "capstone",
      title: "I'm a coder now",
      bodyMd: "Recap the big ideas (order, triggers, rules, sharing kindly & safely); 'what will you teach?'",
    },
  ],

  lessons: [
    // Semester 1 — My Helpful Robot
    {
      id: "explorers-s1-c1",
      level: "explorers",
      semester: "1",
      classNumber: 1,
      orderIndex: 1,
      title: "Instructions in order (unplugged + first blocks)",
      objective: "Put steps in sequence; place first blocks.",
      align: "Math C3 sequential events; Language oral",
      warmUp: "Act out 'get ready for school' steps out of order — fix them.",
      teach: "Order matters.",
      activity: "Drag 3 Move blocks (Move Right/Up, Hop) so the robot travels to the toy.",
      practice: "Reorder blocks to change the path (worksheet).",
      reflect: "What happened when order changed?",
      assess: "Exit — point to 'what comes first.'",
      home: "Tell a grown-up 3 steps of a chore, in order.",
      accommodationNotes: {
        adhd: "One block at a time.",
        dyslexia: "Steps as picture cards.",
        anxiety: "Starter template provided.",
        gifted: "Add a 4th step.",
      },
    },
    {
      id: "explorers-s1-c2",
      level: "explorers",
      semester: "1",
      classNumber: 2,
      orderIndex: 2,
      title: "Trigger blocks: Start on Tap / Start on Green Flag",
      objective: "Start code with a trigger block.",
      warmUp: "'When I clap, you freeze' (event game).",
      teach: "'Start on Tap' (tap the robot) or 'Start on Green Flag' starts the code.",
      activity: "Start on Tap → the robot uses Say to say 'I'll help!' and moves.",
      practice: "Change what it says.",
      reflect: "What starts the code?",
      assess: "Which block starts it?",
      home: "Draw your helpful robot.",
      accommodationNotes: { anxiety: "Starter provided.", gifted: "Add a sound." },
    },
    {
      id: "explorers-s1-c3",
      level: "explorers",
      semester: "1",
      classNumber: 3,
      orderIndex: 3,
      title: "Make it do the chore (sequence a task)",
      objective: "Sequence 4–5 blocks into a chore animation.",
      align: "Math C3 sequence; Data (a 'job' = ordered steps)",
      activity:
        "Robot travels to the toys (Move/Hop) → Say 'I'll help!' → moves to the bin " +
        "(the visual block set has no pick-up block; show helping with Say/Grow).",
      practice: "Add one more helpful action.",
      reflect: "Which real chore did you code?",
      assess: "Robot completes the sequence.",
      accommodationNotes: { dyslexia: "No writing required.", gifted: "Second chore." },
    },
    {
      id: "explorers-s1-c4",
      level: "explorers",
      semester: "1",
      classNumber: 4,
      orderIndex: 4,
      title: "Test, fix, share",
      objective: "Find & fix one bug; present.",
      teach: "'Debug' = find the mistake.",
      activity: "Fix a broken robot (teacher-planted bug); finish own.",
      reflect: "Show a partner.",
      assess: "Working robot + names one fix.",
      home: "Show family at next visit.",
      accommodationNotes: { asd: "Share to one partner.", anxiety: "Celebrate any fix." },
      aiEra: [
        {
          skill: "spotting-confident-wrong-answers",
          activity:
            "Teacher-narrated puppet moment (unplugged, no live AI): a 'smart helper' puppet confidently says " +
            "a triangle has 4 sides. Class checks its work together, just like checking the robot's bug — smart " +
            "helpers can sound sure and still be wrong.",
        },
      ],
    },

    // Semester 2 — Kindness Cards
    {
      id: "explorers-s2-c1",
      level: "explorers",
      semester: "2",
      classNumber: 1,
      orderIndex: 5,
      title: "What makes a kind message?",
      objective: "Name kind words; build a card sprite that says one.",
      align: "Language oral/vocabulary; Tech & Society (kindness online)",
      warmUp: "Sort word cards kind/unkind (SEL).",
      activity: "Start on Tap → card uses Say for a kind message.",
      practice: "Add a second message.",
      accommodationNotes: { dyslexia: "Pick words from pictures.", gifted: "Second message." },
    },
    {
      id: "explorers-s2-c2",
      level: "explorers",
      semester: "2",
      classNumber: 2,
      orderIndex: 6,
      title: "Add feeling with sound & colour",
      objective: "Page/background change (Go to Page) + Sound on tap.",
      align: "Math (patterns of colour); Arts cross-link",
      activity: "Tap → Go to Page (new colours) + Pop/Record sound.",
      practice: "A colour pattern (loop seed).",
    },
    {
      id: "explorers-s2-c3",
      level: "explorers",
      semester: "2",
      classNumber: 3,
      orderIndex: 7,
      title: "Make it interactive (trigger blocks)",
      objective: "Multiple tappable characters, each with Start on Tap.",
      align: "Math C3 (triggers/events)",
      activity: "Tap different characters → different kind messages (Say).",
      accommodationNotes: { adhd: "One part at a time." },
    },
    {
      id: "explorers-s2-c4",
      level: "explorers",
      semester: "2",
      classNumber: 4,
      orderIndex: 8,
      title: "Who's it for? Personalize + share",
      objective: "Choose a recipient; test; present.",
      align: "Language (audience)",
      reflect: "Who will you send kindness to?",
      accommodationNotes: { anxiety: "Template card provided." },
    },

    // Semester 3 — Recycling Sorter
    {
      id: "explorers-s3-c1",
      level: "explorers",
      semester: "3",
      classNumber: 1,
      orderIndex: 9,
      title: "Sorting is grouping",
      objective: "Sort real items into categories (unplugged) → name the rule.",
      align: "Math Strand D (sort/data), C3 (conditions)",
      activity: "Drag pictures into paper/recycling/compost.",
      practice: "A 4th category.",
    },
    {
      id: "explorers-s3-c2",
      level: "explorers",
      semester: "3",
      classNumber: 2,
      orderIndex: 10,
      title: "'Start on Bump' gives feedback",
      objective: "Item touches correct bin → 'Yes!'; wrong bin → 'Try again.'",
      align: "Math C3 (cause & effect); the visual block set Start on Bump",
      activity: "Build the check for one item.",
      accommodationNotes: { anxiety: "Starter provided." },
    },
    {
      id: "explorers-s3-c3",
      level: "explorers",
      semester: "3",
      classNumber: 3,
      orderIndex: 11,
      title: "More items, keep score of 'good sorts'",
      objective: "Add items; count correct (number sense).",
      align: "Math B (counting)",
      activity: "Add 2 more items + a happy counter.",
      practice: "Show the count.",
    },
    {
      id: "explorers-s3-c4",
      level: "explorers",
      semester: "3",
      classNumber: 4,
      orderIndex: 12,
      title: "Playtest & the 'why'",
      objective: "Test the game; connect to real recycling.",
      reflect: "One thing you'll recycle right now.",
      accommodationNotes: { asd: "Clear rubric + routine." },
    },

    // Semester 4 — My Neighbourhood Map
    {
      id: "explorers-s4-c1",
      level: "explorers",
      semester: "4",
      classNumber: 1,
      orderIndex: 13,
      title: "My places (plan the map)",
      objective: "Name 3–4 places (home area, park, school, store); position on a grid.",
      align: "Math E (spatial), Social Studies (community)",
      activity: "Place sprites on a backdrop map.",
      accommodationNotes: { dyslexia: "Picture icons for places." },
    },
    {
      id: "explorers-s4-c2",
      level: "explorers",
      semester: "4",
      classNumber: 2,
      orderIndex: 14,
      title: "Click a place, learn a fact",
      objective: "Start on Tap on a place → it uses Say to tell a fact.",
      align: "Math C3 events; Language (speaking facts)",
      activity: "Add facts to 2 places.",
      practice: "Add a sound per place.",
    },
    {
      id: "explorers-s4-c3",
      level: "explorers",
      semester: "4",
      classNumber: 3,
      orderIndex: 15,
      title: "Get around (simple navigation)",
      objective: "Move a character between places with Move blocks.",
      align: "Math E/C3",
      activity: "Move blocks (Right/Left/Up/Down) to move the sprite park→school.",
      accommodationNotes: { adhd: "One route at a time." },
    },
    {
      id: "explorers-s4-c4",
      level: "explorers",
      semester: "4",
      classNumber: 4,
      orderIndex: 16,
      title: "Stay safe + share",
      objective: "The private-vs-share rule; present the map.",
      reflect: "Which places are okay to show?",
      accommodationNotes: { asd: "Explicit examples of ok/not-ok." },
    },

    // Capstone — Explorer's Show-and-Tell App
    {
      id: "explorers-capstone-c1",
      level: "explorers",
      semester: "capstone",
      classNumber: 1,
      orderIndex: 17,
      title: "Plan",
      objective: "Choose one thing to teach (a chore, kindness, recycling, or a place); storyboard 3 screens.",
      accommodationNotes: { anxiety: "Templates provided; choice honours interest." },
    },
    {
      id: "explorers-capstone-c2",
      level: "explorers",
      semester: "capstone",
      classNumber: 2,
      orderIndex: 18,
      title: "Build core",
      objective: "Trigger start (Start on Tap/Green Flag) + sequence + a Say that teaches.",
      practice: "Add a sound.",
    },
    {
      id: "explorers-capstone-c3",
      level: "explorers",
      semester: "capstone",
      classNumber: 3,
      orderIndex: 19,
      title: "Add interaction + a check",
      objective: "Clickable choice → feedback (uses the Semester 3 idea).",
      accommodationNotes: { adhd: "Checklist of parts." },
    },
    {
      id: "explorers-capstone-c4",
      level: "explorers",
      semester: "capstone",
      classNumber: 4,
      orderIndex: 20,
      title: "Test & present",
      objective: "Debug; present to the group/parents at the showcase.",
      accommodationNotes: { asd: "Present to one adult if preferred.", anxiety: "Present to one adult if preferred." },
    },
  ],

  blockPuzzles: [
    makeBlockPuzzle(
      "explorers-s1-c1-puzzle",
      "explorers-s1-c1",
      [
        { block: "move_right" },
        { block: "move_left" },
        { block: "move_up" },
        { block: "move_down" },
        { block: "hop" },
      ],
      { description: "Get the robot to the toy.", state: { x: 1, y: 1 } }
    ),
    makeBlockPuzzle(
      "explorers-s1-c2-puzzle",
      "explorers-s1-c2",
      [
        { block: "start_tap" },
        { block: "start_green_flag" },
        { block: "say", arg: "I'll help!" },
        { block: "move_right" },
      ],
      { description: "Tap the robot and have it say hello.", state: { started: true, said: "I'll help!" }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s1-c3-puzzle",
      "explorers-s1-c3",
      [{ block: "start_green_flag" }, { block: "move_right" }, { block: "say", arg: "I'll help!" }, { block: "grow" }],
      { description: "Sequence the chore: start, travel, and say what you're doing.", state: { x: 2, said: "I'll help!" }, mustUse: ["start_green_flag"] }
    ),
    makeBlockPuzzle(
      "explorers-s1-c4-puzzle",
      "explorers-s1-c4",
      [{ block: "start_tap" }, { block: "say", arg: "Fixed it!" }, { block: "show" }, { block: "hide" }],
      { description: "Fix the broken robot so it shows itself and says it's fixed.", state: { shown: true, said: "Fixed it!" }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s2-c1-puzzle",
      "explorers-s2-c1",
      [{ block: "start_tap" }, { block: "say", arg: "You matter!" }, { block: "say", arg: "Meh." }],
      { description: "Make the card say something kind.", state: { started: true, said: "You matter!" }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s2-c2-puzzle",
      "explorers-s2-c2",
      [{ block: "start_tap" }, { block: "go_to_page", arg: "sunshine" }, { block: "pop" }, { block: "record" }],
      { description: "Add colour and sound to the kindness card.", state: { page: "sunshine", soundPlayed: true }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s2-c3-puzzle",
      "explorers-s2-c3",
      [{ block: "start_bump" }, { block: "start_tap" }, { block: "say", arg: "Great job!" }],
      { description: "A second character reacts when touched.", state: { started: true, said: "Great job!" }, mustUse: ["start_bump"] }
    ),
    makeBlockPuzzle(
      "explorers-s2-c4-puzzle",
      "explorers-s2-c4",
      [{ block: "start_tap" }, { block: "say", arg: "For my friend!" }, { block: "show" }],
      { description: "Personalize the card for its recipient.", state: { said: "For my friend!", shown: true }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s3-c1-puzzle",
      "explorers-s3-c1",
      [{ block: "go_to_page", arg: "paper" }, { block: "go_to_page", arg: "compost" }, { block: "go_to_page", arg: "trash" }],
      { description: "Sort the item into the paper-recycling bin.", state: { page: "paper" } }
    ),
    makeBlockPuzzle(
      "explorers-s3-c2-puzzle",
      "explorers-s3-c2",
      [{ block: "start_bump" }, { block: "say", arg: "Yes!" }, { block: "say", arg: "Try again." }],
      { description: "Give feedback when the item touches the right bin.", state: { started: true, said: "Yes!" }, mustUse: ["start_bump"] }
    ),
    makeBlockPuzzle(
      "explorers-s3-c3-puzzle",
      "explorers-s3-c3",
      [{ block: "start_bump" }, { block: "say", arg: "2 sorted!" }, { block: "grow" }],
      { description: "Show the count of correct sorts.", state: { started: true, said: "2 sorted!" }, mustUse: ["start_bump"] }
    ),
    makeBlockPuzzle(
      "explorers-s3-c4-puzzle",
      "explorers-s3-c4",
      [{ block: "start_tap" }, { block: "say", arg: "I recycle paper!" }],
      { description: "Explain the real-world point of the game.", state: { said: "I recycle paper!" }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s4-c1-puzzle",
      "explorers-s4-c1",
      [{ block: "move_right" }, { block: "move_left" }, { block: "move_up" }, { block: "move_down" }],
      { description: "Place a place-marker on the map grid.", state: { x: 2, y: 1 } }
    ),
    makeBlockPuzzle(
      "explorers-s4-c2-puzzle",
      "explorers-s4-c2",
      [{ block: "start_tap" }, { block: "say", arg: "This is the park!" }],
      { description: "Tap a place to hear a fact about it.", state: { started: true, said: "This is the park!" }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-s4-c3-puzzle",
      "explorers-s4-c3",
      [{ block: "move_right" }, { block: "move_left" }, { block: "move_up" }, { block: "move_down" }, { block: "hop" }],
      { description: "Move the character from the park to the school.", state: { x: 3, y: 0 } }
    ),
    makeBlockPuzzle(
      "explorers-s4-c4-puzzle",
      "explorers-s4-c4",
      [{ block: "start_tap" }, { block: "say", arg: "That's private!" }, { block: "hide" }, { block: "show" }],
      { description: "Apply the private-vs-share rule.", state: { said: "That's private!", shown: true }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-capstone-c1-puzzle",
      "explorers-capstone-c1",
      [{ block: "go_to_page", arg: "plan" }, { block: "go_to_page", arg: "build" }],
      { description: "Start the storyboard on the plan screen.", state: { page: "plan" } }
    ),
    makeBlockPuzzle(
      "explorers-capstone-c2-puzzle",
      "explorers-capstone-c2",
      [{ block: "start_tap" }, { block: "start_green_flag" }, { block: "say", arg: "Let me teach you!" }],
      { description: "Build the app's core: trigger + a teaching message.", state: { started: true, said: "Let me teach you!" }, mustUse: ["start_tap"] }
    ),
    makeBlockPuzzle(
      "explorers-capstone-c3-puzzle",
      "explorers-capstone-c3",
      [{ block: "start_bump" }, { block: "say", arg: "Great job!" }, { block: "say", arg: "Try again." }],
      { description: "Add an interactive check with feedback.", state: { started: true, said: "Great job!" }, mustUse: ["start_bump"] }
    ),
    makeBlockPuzzle(
      "explorers-capstone-c4-puzzle",
      "explorers-capstone-c4",
      [{ block: "start_tap" }, { block: "say", arg: "I did it!" }, { block: "show" }, { block: "pop" }],
      { description: "Finish and present the app.", state: { said: "I did it!", shown: true, soundPlayed: true }, mustUse: ["start_tap"] }
    ),
  ],

  projects: [
    {
      id: "explorers-s1-project",
      level: "explorers",
      semester: "1",
      title: "My Helpful Robot",
      brief: "Code a robot that does one real chore.",
      successCriteria:
        "Uses a trigger block (Start on Tap/Green Flag) + at least 3 ordered Move/Looks blocks; robot completes " +
        "a helpful task; child can tell what it does.",
      rubric: [
        { criterion: "Starts on tap/green flag", description: "Uses a trigger block to begin." },
        { criterion: "Steps in order", description: "Blocks are sequenced correctly." },
        { criterion: "Does a real chore", description: "The robot completes a recognizable helpful task." },
        { criterion: "Can explain it", description: "Child can describe what the robot does." },
      ],
      extension: "Add a sound or second chore.",
    },
    {
      id: "explorers-s2-project",
      level: "explorers",
      semester: "2",
      title: "Kindness Cards",
      brief: "Build an interactive digital card that shares kindness.",
      successCriteria: "Uses triggers (Start on Tap) + at least 2 kind messages + a sound/colour change; child names who it's for.",
      rubric: [
        { criterion: "Interactive", description: "Card responds to a tap." },
        { criterion: "2+ kind messages", description: "At least two distinct kind messages." },
        { criterion: "Adds feeling", description: "Uses sound or colour change." },
        { criterion: "Has an audience", description: "Child names who the card is for." },
      ],
    },
    {
      id: "explorers-s3-project",
      level: "explorers",
      semester: "3",
      title: "Recycling Sorter",
      brief: "A sorting game that rewards correct recycling.",
      successCriteria:
        "At least 3 items; 'if touching correct bin → positive feedback,' else try again; a count/celebration for " +
        "correct sorts; child explains the real-world point.",
      rubric: [
        { criterion: "Sorts ≥3 items", description: "At least three items can be sorted." },
        { criterion: "Gives right/wrong feedback", description: "Correct and incorrect bins respond differently." },
        { criterion: "Counts good sorts", description: "A running count/celebration for correct sorts." },
        { criterion: "Explains why recycling matters", description: "Child connects the game to the real world." },
      ],
    },
    {
      id: "explorers-s4-project",
      level: "explorers",
      semester: "4",
      title: "My Neighbourhood Map",
      brief: "An interactive map of real places you know.",
      successCriteria:
        "≥3 clickable places, each says a fact; a character can move between two; child follows the " +
        "'don't share exact home details' rule.",
      rubric: [
        { criterion: "≥3 places", description: "At least three clickable places on the map." },
        { criterion: "Click→fact works", description: "Tapping a place tells a fact." },
        { criterion: "Can navigate", description: "A character can move between places." },
        { criterion: "Applies the safety rule", description: "Follows the private-vs-share rule." },
      ],
    },
  ],

  quizzes: [
    {
      id: "explorers-s1-q1",
      level: "explorers",
      semester: "1",
      quizNumber: 1,
      kind: "formative",
      questions: [
        { prompt: "Instructions should be in the right…", choices: ["order", "colour"], answer: "order" },
        { prompt: "Which block starts the code when you tap the robot?", choices: ["Start on Tap", "Say"], answer: "Start on Tap" },
        { prompt: "Does the computer do exactly what we tell it?", choices: ["yes", "no"], answer: "yes" },
        { prompt: "Making a sandwich needs steps in…", choices: ["order", "no order"], answer: "order" },
        { prompt: "'Move' makes the robot…", choices: ["talk", "move"], answer: "move" },
        { prompt: "If steps are mixed up, the robot will…", choices: ["do the wrong thing", "be fine"], answer: "do the wrong thing" },
        { prompt: "A voice helper follows…", choices: ["instructions", "nothing"], answer: "instructions" },
        { prompt: "'Say' makes the robot…", choices: ["move", "talk"], answer: "talk" },
        { prompt: "We start the robot's code with a…", choices: ["Start block (Green Flag / Tap)", "End block"], answer: "Start block (Green Flag / Tap)" },
        { prompt: "Fixing a mistake in code is called…", choices: ["debug", "delete"], answer: "debug", explanation: "Great trying! Let's look again together." },
      ],
    },
    {
      id: "explorers-s1-q2",
      level: "explorers",
      semester: "1",
      quizNumber: 2,
      kind: "summative",
      questions: [
        { prompt: "Put in order: pick up → walk → drop. What's first?", choices: ["pick up", "walk"], answer: "pick up" },
        { prompt: "What starts the code?", choices: ["a trigger block (Start on Tap / Green Flag)", "a Say block"], answer: "a trigger block (Start on Tap / Green Flag)" },
        { prompt: "Robot goes to the bin using which block?", choices: ["move", "say"], answer: "move" },
        { prompt: "To make the robot talk we use…", choices: ["say", "move"], answer: "say" },
        { prompt: "Code is a list of…", choices: ["instructions", "colours"], answer: "instructions" },
        { prompt: "If the robot skips a step, we should…", choices: ["fix/debug it", "ignore it"], answer: "fix/debug it" },
        { prompt: "Order in code matters:", choices: ["true", "false"], answer: "true" },
        { prompt: "A helpful robot in our project does a…", choices: ["chore/helpful job", "dance"], answer: "chore/helpful job" },
        { prompt: "Testing means we…", choices: ["try it and look for mistakes", "delete it"], answer: "try it and look for mistakes" },
        { prompt: "Computers do what we…", choices: ["tell them", "guess"], answer: "tell them" },
      ],
    },
    {
      id: "explorers-s2-q1",
      level: "explorers",
      semester: "2",
      quizNumber: 1,
      kind: "formative",
      questions: [
        { prompt: "Kind words make people feel…", choices: ["good", "bad"], answer: "good" },
        { prompt: "'Start on Tap' is a…", choices: ["trigger (start) block", "colour block"], answer: "trigger (start) block" },
        { prompt: "On screens we should be…", choices: ["kind", "silent"], answer: "kind" },
        { prompt: "If a message feels mean, tell a…", choices: ["grown-up", "friend only"], answer: "grown-up" },
        { prompt: "'Say' makes the card…", choices: ["talk", "move"], answer: "talk" },
        { prompt: "A sound block adds…", choices: ["sound", "colour"], answer: "sound" },
        { prompt: "Tapping the card is a…", choices: ["trigger/action", "mistake"], answer: "trigger/action" },
        { prompt: "Kind or unkind: 'You did great!'", choices: ["kind", "unkind"], answer: "kind" },
        { prompt: "Colours can show a…", choices: ["feeling/pattern", "sound"], answer: "feeling/pattern" },
        { prompt: "Being kind online is like being kind…", choices: ["in person", "never"], answer: "in person" },
      ],
    },
    {
      id: "explorers-s2-q2",
      level: "explorers",
      semester: "2",
      quizNumber: 2,
      kind: "summative",
      authored: true,
      questions: [
        { prompt: "What happens first: 'Start on Tap' or 'Say'?", choices: ["Start on Tap", "Say"], answer: "Start on Tap" },
        { prompt: "A kindness card should have an…", choices: ["audience (who it's for)", "engine"], answer: "audience (who it's for)" },
        { prompt: "Which is a kind message?", choices: ["'You matter!'", "'Go away.'"], answer: "'You matter!'" },
        { prompt: "If you're not sure a message is okay, you should…", choices: ["ask a grown-up", "send it anyway"], answer: "ask a grown-up" },
        { prompt: "What starts a card's response?", choices: ["a trigger block", "a colour"], answer: "a trigger block" },
        { prompt: "Being kind online is a part of…", choices: ["digital citizenship", "recess"], answer: "digital citizenship" },
        { prompt: "A card can show feeling with sound or…", choices: ["colour", "silence"], answer: "colour" },
        { prompt: "Choosing who a card is for is called picking your…", choices: ["audience", "trigger"], answer: "audience" },
        { prompt: "Unkind words should be…", choices: ["changed to kind ones", "shared widely"], answer: "changed to kind ones" },
        { prompt: "What block did we use to make the card talk?", choices: ["Say", "Move"], answer: "Say" },
      ],
    },
    {
      id: "explorers-s3-q1",
      level: "explorers",
      semester: "3",
      quizNumber: 1,
      kind: "formative",
      authored: true,
      questions: [
        { prompt: "A rule is: if this then…", choices: ["that", "nothing"], answer: "that" },
        { prompt: "Sorting means putting things into…", choices: ["groups", "one pile"], answer: "groups" },
        { prompt: "Recycling helps the…", choices: ["planet/environment", "robot"], answer: "planet/environment" },
        { prompt: "'Start on Bump' with the right bin gives…", choices: ["feedback/yes", "nothing"], answer: "feedback/yes" },
        { prompt: "Counting correct sorts uses…", choices: ["numbers", "colours"], answer: "numbers" },
        { prompt: "Paper goes in the…", choices: ["paper-recycling bin", "compost bin"], answer: "paper-recycling bin" },
        { prompt: "A wrong-bin touch should give…", choices: ["'try again' feedback", "no response"], answer: "'try again' feedback" },
        { prompt: "How many bins does a good sorter need at least?", choices: ["3", "1"], answer: "3" },
        { prompt: "Sorting into categories is part of…", choices: ["data", "art"], answer: "data" },
        { prompt: "Why does recycling right matter?", choices: ["it helps the environment", "it's fun only"], answer: "it helps the environment" },
      ],
    },
    {
      id: "explorers-s3-q2",
      level: "explorers",
      semester: "3",
      quizNumber: 2,
      kind: "summative",
      authored: true,
      questions: [
        { prompt: "'If touching the right bin, then…'", choices: ["give positive feedback", "do nothing"], answer: "give positive feedback" },
        { prompt: "Which block checks when two things touch?", choices: ["Start on Bump", "Say"], answer: "Start on Bump" },
        { prompt: "A can goes in the…", choices: ["recycling bin", "compost bin"], answer: "recycling bin" },
        { prompt: "Counting correct sorts helps us know…", choices: ["how well we're doing", "the weather"], answer: "how well we're doing" },
        { prompt: "The real-world purpose of the game is…", choices: ["to recycle right", "to win points only"], answer: "to recycle right" },
        { prompt: "A rule in code is also called an…", choices: ["if-then", "instruction only"], answer: "if-then" },
        { prompt: "How many items should the finished game sort, at least?", choices: ["3", "1"], answer: "3" },
        { prompt: "What message fits a correct sort?", choices: ["'Yes!'", "'Try again.'"], answer: "'Yes!'" },
        { prompt: "Sorting is a kind of…", choices: ["decision-making", "guessing"], answer: "decision-making" },
        { prompt: "Recycling right is a choice that helps…", choices: ["everyone", "no one"], answer: "everyone" },
      ],
    },
    {
      id: "explorers-s4-q1",
      level: "explorers",
      semester: "4",
      quizNumber: 1,
      kind: "formative",
      authored: true,
      questions: [
        { prompt: "Tapping a place (Start on Tap) lets you hear a…", choices: ["fact", "song only"], answer: "fact" },
        { prompt: "A map shows real…", choices: ["places", "colours"], answer: "places" },
        { prompt: "We keep our exact home address…", choices: ["private", "public"], answer: "private" },
        { prompt: "'Up' and 'down' are…", choices: ["position words", "kind words"], answer: "position words" },
        { prompt: "Which block moves a character on the map?", choices: ["Move", "Say"], answer: "Move" },
        { prompt: "A place near you is…", choices: ["close/near", "far"], answer: "close/near" },
        { prompt: "A school and a park are both examples of…", choices: ["community places", "colours"], answer: "community places" },
        { prompt: "'Left' and 'right' are…", choices: ["position words", "trigger blocks"], answer: "position words" },
        { prompt: "Why don't we share our exact address online?", choices: ["to stay safe", "it's not allowed to talk"], answer: "to stay safe" },
        { prompt: "A fact about a place is shared using which block?", choices: ["Say", "Hide"], answer: "Say" },
      ],
    },
    {
      id: "explorers-s4-q2",
      level: "explorers",
      semester: "4",
      quizNumber: 2,
      kind: "summative",
      authored: true,
      questions: [
        { prompt: "To go from the park to the school, the character should…", choices: ["move between them", "stay still"], answer: "move between them" },
        { prompt: "Tapping a place triggers…", choices: ["an event (a fact)", "nothing"], answer: "an event (a fact)" },
        { prompt: "A finished map should have at least how many places?", choices: ["3", "1"], answer: "3" },
        { prompt: "Which is safe to share about your home?", choices: ["your neighbourhood", "your exact address"], answer: "your neighbourhood" },
        { prompt: "Which block direction moves a character down?", choices: ["Move Down", "Move Up"], answer: "Move Down" },
        { prompt: "A community place you visit often is your…", choices: ["school", "a stranger's house"], answer: "school" },
        { prompt: "If unsure whether something is safe to share, ask a…", choices: ["grown-up", "no one"], answer: "grown-up" },
        { prompt: "What makes a map interactive?", choices: ["clickable places", "just colours"], answer: "clickable places" },
        { prompt: "Position words help us describe…", choices: ["where things are", "how things sound"], answer: "where things are" },
        { prompt: "Explaining your map to someone is called…", choices: ["presenting", "hiding"], answer: "presenting" },
      ],
    },
    {
      id: "explorers-capstone-q1",
      level: "explorers",
      semester: "capstone",
      quizNumber: 1,
      kind: "formative",
      authored: true,
      questions: [
        { prompt: "Code needs steps in the right…", choices: ["order", "colour"], answer: "order" },
        { prompt: "A trigger block…", choices: ["starts the code", "ends the code"], answer: "starts the code" },
        { prompt: "A rule that gives feedback is an…", choices: ["if-then", "instruction only"], answer: "if-then" },
        { prompt: "Being kind online means…", choices: ["kindness online", "ignoring others"], answer: "kindness online" },
        { prompt: "We keep our exact address…", choices: ["private", "public"], answer: "private" },
        { prompt: "Finding and fixing a mistake is called…", choices: ["debugging", "deleting"], answer: "debugging" },
        { prompt: "'Say' makes a sprite…", choices: ["talk", "move"], answer: "talk" },
        { prompt: "Counting things uses…", choices: ["numbers", "colours"], answer: "numbers" },
        { prompt: "Sorting means putting things into…", choices: ["groups", "a pile"], answer: "groups" },
        { prompt: "What starts a sprite's code?", choices: ["a trigger block", "a Say block"], answer: "a trigger block" },
      ],
    },
    {
      id: "explorers-capstone-q2",
      level: "explorers",
      semester: "capstone",
      quizNumber: 2,
      kind: "summative",
      authored: true,
      questions: [
        { prompt: "Which skill does a clickable choice with feedback use?", choices: ["the Semester 3 check/feedback idea", "nothing new"], answer: "the Semester 3 check/feedback idea" },
        { prompt: "The kind/safe choice for sharing online is to…", choices: ["ask a grown-up first", "share everything"], answer: "ask a grown-up first" },
        { prompt: "Put in order: plan → build → test →", choices: ["present", "delete"], answer: "present" },
        { prompt: "The best feedback for a correct answer is…", choices: ["'Great job!'", "silence"], answer: "'Great job!'" },
        { prompt: "The purpose of the Show-and-Tell App is to…", choices: ["teach something clearly", "just move around"], answer: "teach something clearly" },
        { prompt: "A capstone app should use how many of the 4 learned skills, at least?", choices: ["3", "1"], answer: "3" },
        { prompt: "Presenting your app means…", choices: ["explaining your code to others", "hiding it"], answer: "explaining your code to others" },
        { prompt: "A trigger block is needed to…", choices: ["start the app", "end the app"], answer: "start the app" },
        { prompt: "Debugging before presenting helps make sure the app…", choices: ["works correctly", "looks colourful only"], answer: "works correctly" },
        { prompt: "Passing the capstone means you're ready for…", choices: ["Builders", "Engineers"], answer: "Builders" },
      ],
    },
  ],

  capstone: {
    id: "explorers-capstone",
    level: "explorers",
    title: "Explorer's Show-and-Tell App",
    description:
      "Teach someone else one thing you learned. Integrates all 4 semesters: sequence (S1) + triggers & Say/Sound " +
      "(S2) + a simple check/feedback (S3) + Start on Tap & Move positioning (S4).",
    rubric: [
      { criterion: "Uses ≥3 skills", description: "At least 3 of the 4 learned skills (sequence, event, feedback, click-a-place)." },
      { criterion: "Teaches something clearly", description: "Teaches one clear thing." },
      { criterion: "Interactive", description: "The app responds to interaction." },
      { criterion: "Presents & explains", description: "Child presents it and explains their code." },
      { criterion: "Shows kindness/safety awareness", description: "Demonstrates the level's kindness/safety lessons." },
    ],
    passRule: { type: "min_points", min: 4, of: 5 },
  },
};
