import { CURRICULUM_TRANSLATIONS } from "./translations";
import type {
  LessonBranches,
  LessonRubricLevel,
  LevelCurriculum,
  LevelSlug,
  Locale,
  Misconception,
  ProvincialTags,
  RawLesson,
  RawLevelCurriculum,
  Semester,
  Strand,
} from "./types";

/**
 * Phase 1 mastery-graph data spine. Kept as a companion layer rather than edited
 * into the Phase 0 lesson literals directly (see supabase/schema.sql's own note
 * on this) — applyMasteryGraph() merges it onto each LevelCurriculum at read time.
 *
 * What's hand-authored vs. computed, and why:
 * - provincialTags: hand-authored per level×semester from the 4 crosswalk PDFs
 *   (Ontario is embedded in each Curriculum Guide already; BC/AB/QC come from
 *   Crosswalk_BC.pdf / Crosswalk_AB.pdf / Crosswalk_QC.pdf) — genuinely sourced,
 *   not invented. The crosswalks map at semester granularity, so all 4 classes
 *   in a semester share that semester's tags.
 * - strand: hand-assigned per level×semester, directly from each crosswalk's own
 *   framework-dimension language for that semester (e.g. BC's "Computational
 *   thinking — data & models" → strand "data") — not arbitrary.
 * - misconceptions: hand-authored per lesson (80 total) — the one part that
 *   can't be derived, since it's genuine pedagogical content about what a
 *   learner at that lesson typically gets wrong.
 * - capstoneGate, prerequisites, branches, rubric, locales: computed below from
 *   fields the Phase 0 lesson data already has (semester, orderIndex,
 *   accommodationNotes, objective/assess, CURRICULUM_TRANSLATIONS) — see the
 *   compute* functions. This keeps the 80-lesson enrichment honest (no risk of
 *   an orphan/cyclic prerequisite typo) instead of hand-typing graph edges.
 */

function tags(on: string, bc: string, ab: string, qc: string): ProvincialTags {
  const split = (s: string) => s.split(/;\s*/).filter(Boolean);
  return { ON: split(on), BC: split(bc), AB: split(ab), QC: split(qc) };
}

export const PROVINCIAL_TAGS: Record<LevelSlug, Record<Semester, ProvincialTags>> = {
  explorers: {
    "1": tags(
      "Math C3 Coding — sequential events (Gr1 C3.1); read/alter code (C3.2); Language: oral communication",
      "Applied Design — make: follow a sequence of steps (early algorithms)",
      "CS: algorithms — represent steps in order",
      "Developing technological skills — operate step-by-step with digital tools"
    ),
    "2": tags(
      "Math C3 events; Language: vocabulary/audience; Tech & Society: kindness/citizenship",
      "Applied Technologies — use tools to make things happen (event/trigger)",
      "CS: programming — cause/effect and triggers",
      "Producing content — create interactive content (triggers)"
    ),
    "3": tags(
      "Math C3 conditions; D Data (sort/classify); B Number (count); Science: environment",
      "Computational thinking — simple decisions; sort and classify",
      "CS: algorithms — decisions; classify/sort data",
      "Solving problems — simple logic; classify information"
    ),
    "4": tags(
      "Math C3 events; E Spatial Sense (position/direction); Social Studies: community; Cyber: private/share",
      "Applied Design — represent place/space; sequence directions",
      "CS: represent information; CTF — create a digital product (map)",
      "Producing content — represent place/space digitally"
    ),
    capstone: tags(
      "Math C3 (integrate sequence/events/conditions); A SEL; Language: presenting/explaining",
      "Applied Design full cycle — ideate, prototype, test, share; computational thinking integrated",
      "CTF full challenge cycle + CS concepts integrated (design, build, share)",
      "Mobilizing digital competency — design, produce, evaluate and share a solution"
    ),
  },
  builders: {
    "1": tags(
      "Math C3.1–C3.2 Coding (Gr2-3): sequential events; Language: informational writing, digital citizenship; Science & Tech: STEM investigation/digital tools",
      "Applied Design — prototype structure; Applied Technologies (building pages)",
      "CS: data representation; CTF — build/create a digital product",
      "Producing content — structure a digital document; ethical citizenship (footprint)"
    ),
    "2": tags(
      "Math C3 Coding (Gr2-3): conditional statements; Strand B/D data; Science & Tech: air and water; Language: reading/oral explanation",
      "Computational thinking — use data to decide; Applied Design (style/iterate)",
      "CS: data → decisions; CTF — design & iterate",
      "Solving problems — use data to decide; produce/style content"
    ),
    "3": tags(
      "Math C3 Coding (Gr2-3): structuring/altering code; Language: informational writing/text features; Science & Tech: growth and changes in animals (Gr2)",
      "Applied Design — organize information for an audience",
      "CS: organize/represent information; CTF — communicate a product",
      "Producing content — organize information for a purpose"
    ),
    "4": tags(
      "Math C3 Coding (Gr2-3): events/altering code; Language: persuasive writing/media literacy; Science & Tech: plants/animals in local environment",
      "Applied Design — design for a purpose/audience; share",
      "CTF: create a product for an audience/purpose; CS: media",
      "Communicating — persuade an audience; produce content"
    ),
    capstone: tags(
      "Math C3 Coding (Gr2-3): sequence, events, debugging; Language: planning/informational writing/oral presentation; Social Studies: local community",
      "Applied Design full cycle — ideate, prototype, test, share; computational thinking integrated",
      "CTF full challenge cycle + CS concepts integrated (design, build, share)",
      "Mobilizing digital competency — design, produce, evaluate and share a solution"
    ),
  },
  developers: {
    "1": tags(
      "Math C3 Coding (Gr4-5): variables, defined processes, events; Language: reading/oral explanation of code; SEL (Strand A): self-management and focus",
      "Computational thinking — variables and events; Applied Design (build & test)",
      "CS: programming — variables & events; CTF — build & test",
      "Solving problems — build interactive tools (variables/events)"
    ),
    "2": tags(
      "Math C3 Coding (Gr4-5): input/output, operators; Math B: operations fluency; Health & Physical Education: healthy eating literacy",
      "Computational thinking — computation with operators; input/output",
      "CS: computation with operators; input/output",
      "Solving problems — compute; transform input into output"
    ),
    "3": tags(
      "Math C3 Coding (Gr4-5): conditionals, arrays, boolean logic; Language: media literacy/critical thinking; Tech & Society: algorithms, misinformation, AI-generated media",
      "Computational thinking — conditionals & lists; digital literacy (evaluate media)",
      "CS: conditionals & lists; impacts of technology (misinformation/AI)",
      "Developing critical thinking — evaluate media & information; ethical citizenship (AI/misinformation)"
    ),
    "4": tags(
      "Math C3 Coding (Gr4-5): arrays, loops; Math Strand F: financial literacy; Language: explaining reasoning",
      "Computational thinking — lists & repetition; financial-literacy application",
      "CS: lists & repetition; CTF financial-literacy application",
      "Solving problems — process lists; apply to real (financial) contexts"
    ),
    capstone: tags(
      "Math C3 Coding (Gr4-5): integrate variables/events/conditionals/arrays, debugging; Language: planning and oral presentation; Design: design-thinking process",
      "Applied Design full cycle — ideate, prototype, test, share; computational thinking integrated",
      "CTF full challenge cycle + CS concepts integrated (design, build, share)",
      "Mobilizing digital competency — design, produce, evaluate and share a solution"
    ),
  },
  engineers: {
    "1": tags(
      "Math C3 Coding (Gr6-8): subprograms, nested conditionals; Technology & Society: cybersecurity, data protection; Language: explaining technical ideas clearly",
      "Programming 6–9 — functions & conditionals; safe/ethical use of technology",
      "CS: subprograms & conditions; cybersecurity & safe practices",
      "Acting as an ethical citizen — security & safe practices; solve problems with functions"
    ),
    "2": tags(
      "Technology & Society: artificial intelligence, bias, ethics of data; Math: data literacy/interpreting results; Science & Tech (STEM): investigation and testing",
      "Computational thinking — data & models; impacts of technology (bias/ethics)",
      "CS: data & models; impacts of technology (AI bias/ethics)",
      "Developing critical thinking about AI — models, data & bias; ethical citizenship"
    ),
    "3": tags(
      "Math C3 Coding (Gr6-8): data structures (dictionaries); Technology & Society: responsible AI, privacy; Language: purpose, audience, clear communication",
      "Programming — data structures; ethical & responsible technology use",
      "CS: data structures; responsible & ethical technology use",
      "Acting as an ethical citizen — responsible AI & privacy; produce a digital tool"
    ),
    "4": tags(
      "Math C3 Coding (Gr6-8): lists, loops; Strand D data & statistics; Science & Tech: data-driven investigation; Language: evidence-based reasoning",
      "Computational thinking — data collection, analysis & visualization",
      "CS: data collection, analysis & representation",
      "Solving problems — collect, analyze and represent data"
    ),
    capstone: tags(
      "Math C3 Coding (Gr6-8): integrate subprograms/data structures/debugging; Technology & Society: responsible AI, cybersecurity, ethics; Language & Design: pitching, iteration, systems design",
      "Applied Design full cycle — ideate, prototype, test, share; computational thinking integrated",
      "CTF full challenge cycle + CS concepts integrated (design, build, share)",
      "Mobilizing digital competency — design, produce, evaluate and share a solution"
    ),
  },
};

export const STRAND_BY_SEMESTER: Record<LevelSlug, Record<Semester, Strand>> = {
  explorers: { "1": "programming", "2": "society", "3": "data", "4": "design", capstone: "design" },
  builders: { "1": "programming", "2": "data", "3": "design", "4": "society", capstone: "design" },
  developers: { "1": "programming", "2": "programming", "3": "society", "4": "data", capstone: "design" },
  engineers: { "1": "programming", "2": "data", "3": "society", "4": "data", capstone: "design" },
};

export const MISCONCEPTIONS: Record<string, Misconception> = {
  "explorers-s1-c1": { id: "steps-can-be-any-order", name: "Order doesn't matter", signal: "Places blocks in a working-looking sequence without checking that each step happens before the one that depends on it." },
  "explorers-s1-c2": { id: "code-runs-without-starting", name: "Code runs on its own", signal: "Expects the robot to act after adding Move/Say blocks with no Start block placed." },
  "explorers-s1-c3": { id: "one-block-does-everything", name: "One block should do the whole job", signal: "Tries to make a single block (e.g. one Say) stand in for the whole chore instead of chaining several." },
  "explorers-s1-c4": { id: "bug-means-failure", name: "A bug means I did it wrong", signal: "Becomes discouraged or hides the program rather than treating the mistake as something to fix." },
  "explorers-s2-c1": { id: "kind-online-different-from-real-life", name: "Online words don't need to be as kind", signal: "Picks a message that they wouldn't say to someone's face." },
  "explorers-s2-c2": { id: "sound-blocks-replace-say", name: "Sound blocks make it talk", signal: "Uses Pop/Record expecting the sprite to speak instead of using Say." },
  "explorers-s2-c3": { id: "any-tap-triggers-any-message", name: "Every tap gives the same message", signal: "Expects a different character's message to show when tapping the first character." },
  "explorers-s2-c4": { id: "cards-dont-need-a-recipient", name: "A card doesn't need a 'for'", signal: "Can't say who the card is for when asked." },
  "explorers-s3-c1": { id: "one-bin-fits-all", name: "Any bin works for any item", signal: "Sorts every item into the same bin rather than matching by category." },
  "explorers-s3-c2": { id: "touching-anything-triggers-feedback", name: "Any touch gives feedback", signal: "Expects 'Yes!' when two unrelated objects touch, not just item+correct bin." },
  "explorers-s3-c3": { id: "counting-only-counts-wrong-sorts", name: "The counter tracks anything", signal: "Can't explain what number the counter is supposed to show." },
  "explorers-s3-c4": { id: "recycling-doesnt-matter-for-the-game", name: "It's just a game", signal: "Can't connect the game to an actual recycling choice they could make." },
  "explorers-s4-c1": { id: "near-and-far-are-fixed", name: "Near/far never change", signal: "Calls the same place both near and far without reference to a starting point." },
  "explorers-s4-c2": { id: "facts-are-static-decoration", name: "The fact is just decoration", signal: "Doesn't connect tapping the place to hearing its fact." },
  "explorers-s4-c3": { id: "one-move-block-covers-any-distance", name: "One Move block goes anywhere", signal: "Places a single Move block and expects the sprite to reach a far-away place." },
  "explorers-s4-c4": { id: "anything-about-me-is-safe-to-share", name: "Anything true is safe to share", signal: "Includes their exact address or similar private detail on the map." },
  "explorers-capstone-c1": { id: "bigger-topic-is-better", name: "A bigger topic is better", signal: "Picks a broad topic ('everything I know') instead of one clear thing to teach." },
  "explorers-capstone-c2": { id: "say-block-alone-is-teaching", name: "One Say block is teaching", signal: "Builds a single message and considers the teaching part done." },
  "explorers-capstone-c3": { id: "feedback-only-for-games", name: "Feedback is only for games", signal: "Doesn't see how the recycling-sorter feedback idea applies to their own app." },
  "explorers-capstone-c4": { id: "presenting-is-just-showing-not-explaining", name: "Showing it is the same as explaining it", signal: "Runs the app for the audience without describing how the code works." },

  "builders-s1-c1": { id: "tags-are-just-labels-not-instructions", name: "Tags are just labels", signal: "Treats tag names as decoration rather than instructions the browser follows." },
  "builders-s1-c2": { id: "closing-tags-are-optional", name: "Closing tags are optional", signal: "Leaves a tag unclosed and doesn't expect it to affect the page." },
  "builders-s1-c3": { id: "tag-order-on-page-doesnt-matter", name: "Tag order doesn't matter", signal: "Places the image before the heading and doesn't expect the visual order to change." },
  "builders-s1-c4": { id: "if-its-true-its-fine-to-post", name: "True facts are always safe to post", signal: "Includes a private detail because 'it's true about me'." },
  "builders-s2-c1": { id: "css-changes-the-content-not-the-look", name: "CSS changes the words", signal: "Expects changing a color value to change the text content itself." },
  "builders-s2-c2": { id: "the-page-invents-the-weather", name: "The page makes up the weather", signal: "Doesn't distinguish the data the page reads from the advice it decides on." },
  "builders-s2-c3": { id: "else-runs-every-time-too", name: "Else runs every time too", signal: "Expects both the if and else messages to show at once." },
  "builders-s2-c4": { id: "brighter-colours-are-always-better", name: "Brighter is always better", signal: "Picks a low-contrast bright-on-bright combo without checking readability." },
  "builders-s3-c1": { id: "h1-and-h2-are-interchangeable", name: "h1 and h2 are interchangeable", signal: "Uses <h2> for the page's main title instead of <h1>." },
  "builders-s3-c2": { id: "a-list-is-just-a-paragraph-with-dashes", name: "A list is a paragraph with dashes", signal: "Types dashes inside a <p> instead of using <ul>/<li>." },
  "builders-s3-c3": { id: "longer-writing-is-more-helpful", name: "Longer is more helpful", signal: "Keeps a filler sentence because it 'adds more words' rather than useful info." },
  "builders-s3-c4": { id: "any-order-of-sections-is-fine", name: "Section order doesn't matter", signal: "Can't explain why their sections are in that order." },
  "builders-s4-c1": { id: "a-headline-just-states-the-topic", name: "A headline just names the topic", signal: "Writes 'Bees' instead of a claim that grabs attention." },
  "builders-s4-c2": { id: "opinions-count-as-reasons", name: "An opinion counts as a reason", signal: "Writes 'bees are cool' instead of a fact that supports the cause." },
  "builders-s4-c3": { id: "any-link-is-a-call-to-action", name: "Any link is a call to action", signal: "Adds an <a> link with no specific ask attached to it." },
  "builders-s4-c4": { id: "bold-styling-fixes-a-weak-message", name: "Bold styling fixes a weak message", signal: "Relies on large red text instead of stronger reasons." },
  "builders-capstone-c1": { id: "the-helper-must-be-famous", name: "The helper must be famous", signal: "Struggles to pick a helper because they're looking for someone well-known." },
  "builders-capstone-c2": { id: "every-page-can-have-the-same-content", name: "Every page can say the same thing", signal: "Repeats the same content across Home/About/How-to-Help." },
  "builders-capstone-c3": { id: "typing-a-page-name-links-it", name: "Typing a page's name links to it", signal: "Writes 'Go to About' as plain text instead of an <a> tag." },
  "builders-capstone-c4": { id: "if-it-looks-right-it-works", name: "If it looks right, it works", signal: "Skips clicking through links, judging only by how the page looks." },

  "developers-s1-c1": { id: "a-variable-can-only-be-set-once", name: "A variable can only be set once", signal: "Declares a new variable instead of reassigning the existing one." },
  "developers-s1-c2": { id: "a-function-runs-as-soon-as-its-written", name: "A function runs when it's defined", signal: "Expects output immediately after writing function start(){}, before it's called." },
  "developers-s1-c3": { id: "onclick-runs-continuously", name: "onclick keeps running", signal: "Expects the handler to fire repeatedly without further clicks." },
  "developers-s1-c4": { id: "more-variables-always-means-a-better-tool", name: "More variables make it better", signal: "Adds variables the timer doesn't use, unrelated to its purpose." },
  "developers-s2-c1": { id: "plus-always-means-addition", name: "+ always adds numbers", signal: "Is surprised when + joins two pieces of text instead of adding them." },
  "developers-s2-c2": { id: "input-and-output-are-the-same-value", name: "Output just repeats the input", signal: "Expects the displayed result to be identical to what was typed in." },
  "developers-s2-c3": { id: "any-formula-that-runs-is-correct", name: "If it runs, it's correct", signal: "Accepts a formula's result without checking it answers the actual question." },
  "developers-s2-c4": { id: "the-calculator-only-needs-to-work-once", name: "One working test is enough", signal: "Stops testing after the first input produces any number." },
  "developers-s3-c1": { id: "if-and-else-can-both-run", name: "if and else can both run", signal: "Expects both branches' messages to appear for one answer." },
  "developers-s3-c2": { id: "true-and-false-are-just-words", name: "true/false are just text", signal: "Writes \"true\" (a string) where a boolean true is required." },
  "developers-s3-c3": { id: "official-looking-means-true", name: "Official-looking means true", signal: "Trusts a headline because of its formatting, not its source." },
  "developers-s3-c4": { id: "an-array-must-be-the-same-length-as-the-page", name: "The array must match a fixed layout", signal: "Believes the quiz must have a specific number of questions rather than however many the array holds." },
  "developers-s4-c1": { id: "array-indexing-starts-at-1", name: "Arrays start at index 1", signal: "Asks for item[1] expecting the first element." },
  "developers-s4-c2": { id: "a-loop-must-be-written-once-per-item", name: "You need one loop per item", signal: "Writes repeated code blocks instead of one loop body." },
  "developers-s4-c3": { id: "spending-less-always-means-a-better-budget", name: "Spending less is always better", signal: "Flags a necessary expense (like rent) as 'bad' without weighing needs vs wants." },
  "developers-s4-c4": { id: "the-tracker-just-needs-a-total", name: "A total is the whole deliverable", signal: "Stops at the running total without computing balance or advice." },
  "developers-capstone-c1": { id: "the-problem-must-be-original", name: "The problem must be brand new", signal: "Rejects real, common problems because 'someone probably already solved that'." },
  "developers-capstone-c2": { id: "more-tools-used-means-a-better-app", name: "More tools used is better", signal: "Adds an array or event that the feature doesn't actually need." },
  "developers-capstone-c3": { id: "console-log-statements-must-be-removed-before-it-works", name: "console.log breaks the program", signal: "Deletes debug prints thinking they're the cause of a bug." },
  "developers-capstone-c4": { id: "one-successful-test-means-its-bug-free", name: "One good run means it's finished", signal: "Declares the app done after a single successful click-through." },

  "engineers-s1-c1": { id: "indentation-is-just-style", name: "Indentation is just style", signal: "Indents inconsistently and is surprised Python raises an error." },
  "engineers-s1-c2": { id: "elif-order-doesnt-matter", name: "elif order doesn't matter", signal: "Writes a narrower elif condition after a broader one that already matches it." },
  "engineers-s1-c3": { id: "a-complex-looking-password-is-automatically-strong", name: "Complex-looking means strong", signal: "Rates a short password with symbols as 'strong' despite its length." },
  "engineers-s1-c4": { id: "hashing-is-the-same-as-encryption", name: "Hashing can be reversed", signal: "Describes hashing as something a site could 'unscramble' to see the password." },
  "engineers-s2-c1": { id: "the-model-understands-meaning-like-a-person", name: "The model understands like a person", signal: "Says the model 'knows' what a cat is rather than recognizing patterns in labelled examples." },
  "engineers-s2-c2": { id: "any-confidence-score-means-the-answer-is-correct", name: "A confidence score guarantees correctness", signal: "Treats a 90% confidence output as certainly correct." },
  "engineers-s2-c3": { id: "more-data-always-fixes-bias", name: "More data always fixes bias", signal: "Suggests adding more of the same unbalanced data rather than rebalancing." },
  "engineers-s2-c4": { id: "the-model-is-done-once-it-runs", name: "It's done once it runs", signal: "Stops after the classifier runs once, without checking accuracy per class." },
  "engineers-s3-c1": { id: "a-dictionary-is-just-a-list-with-extra-steps", name: "A dict is just a fancier list", signal: "Tries to look up a value by position instead of by key." },
  "engineers-s3-c2": { id: "the-bot-understands-any-phrasing", name: "The bot understands any phrasing", signal: "Expects a correct reply to a message with no matching intent." },
  "engineers-s3-c3": { id: "a-longer-prompt-is-always-a-better-prompt", name: "Longer prompts are always better", signal: "Pads a prompt with extra words that don't add clarity." },
  "engineers-s3-c4": { id: "a-friendly-tone-makes-a-bot-trustworthy-with-any-data", name: "A friendly tone means it's safe to share anything", signal: "Has the bot request personal info because it 'seems nice'." },
  "engineers-s4-c1": { id: "the-loop-variable-holds-the-whole-list", name: "The loop variable holds the whole list", signal: "Tries to print the entire list from inside the loop using the item variable." },
  "engineers-s4-c2": { id: "the-average-represents-every-value", name: "The average represents every value", signal: "Assumes every data point is close to the mean, ignoring spread." },
  "engineers-s4-c3": { id: "a-visible-trend-proves-a-cause", name: "A trend proves a cause", signal: "States the chart 'proves' one thing caused another." },
  "engineers-s4-c4": { id: "any-insight-the-data-shows-is-worth-stating", name: "Any pattern is worth stating", signal: "States an insight the small dataset doesn't actually support." },
  "engineers-capstone-c1": { id: "a-good-challenge-must-be-globally-scaled", name: "The challenge must be global", signal: "Rejects a real, scoped local problem as 'too small' for an SDG challenge." },
  "engineers-capstone-c2": { id: "the-fanciest-tool-is-the-right-tool", name: "The fanciest tool is the right one", signal: "Reaches for an AI model when a simple if/else would solve the problem." },
  "engineers-capstone-c3": { id: "security-is-a-final-step-not-a-design-choice", name: "Security is a final step", signal: "Plans to 'add security at the end' instead of designing it in from the start." },
  "engineers-capstone-c4": { id: "a-working-demo-is-the-same-as-a-pitch", name: "A demo is the same as a pitch", signal: "Runs the prototype for the audience without explaining the problem or impact." },
};

function computePrerequisites(level: RawLevelCurriculum): Record<string, string[]> {
  const sorted = [...level.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const result: Record<string, string[]> = {};
  sorted.forEach((lesson, i) => {
    result[lesson.id] = i === 0 ? [] : [sorted[i - 1].id];
  });
  return result;
}

function computeBranches(lesson: RawLesson): LessonBranches {
  const notes = lesson.accommodationNotes ?? {};
  return {
    stretch: notes.gifted ?? "Extend the activity with one added feature or edge case.",
    support: notes.dyslexia ?? notes.anxiety ?? notes.adhd ?? notes.asd ?? "Provide a starter template and allow spoken answers.",
  };
}

function computeRubric(lesson: RawLesson): LessonRubricLevel[] {
  return [
    { level: "emerging", criteria: `Attempts ${lesson.objective.toLowerCase().replace(/\.$/, "")} with support.` },
    { level: "developing", criteria: `${lesson.objective} — with some prompting.` },
    {
      level: "secure",
      criteria: lesson.assess ? `${lesson.objective} — independently. Evidence: ${lesson.assess}` : `${lesson.objective} — independently.`,
    },
  ];
}

function computeLocales(level: LevelSlug, lessonId: string): Locale[] {
  const hasFR = Boolean(CURRICULUM_TRANSLATIONS[level]?.fr?.lessons[lessonId]);
  return hasFR ? ["en", "fr"] : ["en"];
}

/** Merges the mastery-graph layer onto a Phase 0 RawLevelCurriculum. */
export function applyMasteryGraph(level: RawLevelCurriculum): LevelCurriculum {
  const prerequisites = computePrerequisites(level);
  return {
    ...level,
    lessons: level.lessons.map((lesson) => {
      const misconception = MISCONCEPTIONS[lesson.id];
      if (!misconception) {
        throw new Error(`No mastery-graph misconception authored for lesson "${lesson.id}"`);
      }
      return {
        ...lesson,
        strand: STRAND_BY_SEMESTER[level.level][lesson.semester],
        capstoneGate: lesson.semester === "capstone",
        prerequisites: prerequisites[lesson.id],
        misconceptions: [misconception],
        branches: computeBranches(lesson),
        rubric: computeRubric(lesson),
        provincialTags: PROVINCIAL_TAGS[level.level][lesson.semester],
        locales: computeLocales(level.level, lesson.id),
      };
    }),
  };
}
