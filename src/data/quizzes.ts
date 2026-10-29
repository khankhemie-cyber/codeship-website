import type { ProgramSlug } from "./programs";

/**
 * Online quizzes, two per program per semester (see PROGRAM_STRUCTURE in
 * programs.ts). Students take them at /quizzes/<program>/<quiz>/ after
 * entering their program's class password (the same one as the workbooks).
 *
 * "choice" questions are marked on the server against `answer` (the index of
 * the right option); the answer key is stripped before a quiz is sent to the
 * browser (see toPublicQuiz in src/lib/quizzes.ts). "short" questions are not
 * auto-marked: instructors read them on /quizzes/results/.
 *
 * Note: this repository is public, so a determined student could find the
 * answer key here. These are low-stakes check-ins, so that is an accepted
 * trade-off; don't put anything here that must stay secret.
 */

export type QuizQuestion =
  | {
      id: string;
      type: "choice";
      prompt: string;
      /** Optional code shown under the prompt, in a monospace block. */
      code?: string;
      options: string[];
      answer: number;
    }
  | {
      id: string;
      type: "short";
      prompt: string;
      code?: string;
    };

export interface Quiz {
  /** URL segment under /quizzes/<program>/, unique within the program. */
  slug: string;
  program: ProgramSlug;
  semester: 1 | 2 | 3 | 4;
  number: 1 | 2;
  /** The class week the quiz is meant for. */
  week: number;
  title: string;
  intro: string;
  questions: QuizQuestion[];
}

const TRUE_FALSE = ["True", "False"];

export const QUIZZES: Quiz[] = [
  // ── Explorers (K–Grade 1): a grown-up can read the questions aloud ──
  {
    slug: "s1-quiz-1",
    program: "explorers",
    semester: 1,
    number: 1,
    week: 4,
    title: "My Helpful Robot: Quiz 1",
    intro: "Ask a grown-up to read each question out loud with you. Pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "A computer follows our instructions…",
        options: ["In order, one step at a time", "In any order it likes", "Only when it feels like it"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "Your robot needs to get dressed. Which order makes sense?",
        options: ["Shoes, then socks", "Socks, then shoes", "It does not matter"],
        answer: 1,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "What do we call a list of steps in the right order?",
        options: ["A sequence", "A picture", "A song"],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Your robot is facing right. Which block makes it go up?",
        options: ["Move left", "Move up", "Move down"],
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "If we mix up the steps, the robot might do the wrong thing.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q6",
        type: "short",
        prompt: "What job would you like your helpful robot to do? (A grown-up can type your answer.)",
      },
    ],
  },
  {
    slug: "s1-quiz-2",
    program: "explorers",
    semester: 1,
    number: 2,
    week: 8,
    title: "My Helpful Robot: Quiz 2",
    intro: "Ask a grown-up to read each question out loud with you. Pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "A trigger is something that makes code start. Which one is a trigger?",
        options: ["Clicking the green flag", "The colour blue", "A sleeping cat"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "\"When I tap the robot, it waves.\" What makes the robot wave?",
        options: ["Tapping the robot", "Waiting a long time", "Nothing at all"],
        answer: 0,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "The robot should go right 2 steps. It went left. What should we do?",
        options: ["Give up", "Change the block to move right", "Add more left blocks"],
        answer: 1,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Finding and fixing a mistake in our code is called…",
        options: ["Debugging", "Dancing", "Drawing"],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "One app can have more than one trigger.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q6",
        type: "short",
        prompt: "Tell us about your helpful robot. What does it do when you tap it?",
      },
    ],
  },

  // ── Builders (Grades 2–3): HTML structure ──
  {
    slug: "s1-quiz-1",
    program: "builders",
    semester: 1,
    number: 1,
    week: 4,
    title: "All About Me Page: Quiz 1",
    intro: "Read each question carefully and pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What does HTML do for a web page?",
        options: ["Gives the page its structure", "Plays music", "Turns the computer on"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "Which tag makes the biggest heading?",
        options: ["<p>", "<h1>", "<h6>"],
        answer: 1,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "Which tag do we use for a paragraph of writing?",
        options: ["<p>", "<img>", "<h1>"],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "What is missing from this code?",
        code: "<h1>All About Me",
        options: ["A closing tag: </h1>", "A picture", "Nothing, it is perfect"],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "A closing tag has a slash ( / ) in it.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q6",
        type: "short",
        prompt: "Write one sentence you put (or want to put) on your All About Me page.",
      },
    ],
  },
  {
    slug: "s1-quiz-2",
    program: "builders",
    semester: 1,
    number: 2,
    week: 8,
    title: "All About Me Page: Quiz 2",
    intro: "Read each question carefully and pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "Which tag shows a picture on the page?",
        options: ["<img>", "<p>", "<b>"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "Where does the content people see on a web page go?",
        options: ["Inside <body>", "Inside <title>", "Outside <html>"],
        answer: 0,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "What will this code show?",
        code: "<h1>My Pets</h1>\n<p>I have a dog.</p>",
        options: [
          "A heading \"My Pets\" and a sentence \"I have a dog.\"",
          "Only a picture of a dog",
          "Nothing, because there is an error",
        ],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Why do we use headings on a page?",
        options: ["To make the page slower", "To help readers find what they need", "To hide our writing"],
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "It is safe to put your home address on your All About Me page.",
        options: TRUE_FALSE,
        answer: 1,
      },
      {
        id: "q6",
        type: "short",
        prompt: "What is one thing you would add to your web page next, and which tag would you use?",
      },
    ],
  },

  // ── Developers (Grades 4–5): JavaScript variables, functions, events ──
  {
    slug: "s1-quiz-1",
    program: "developers",
    semester: 1,
    number: 1,
    week: 4,
    title: "Homework Timer: Quiz 1",
    intro: "Read each question and any code carefully, then pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What is a variable?",
        options: ["A box with a name that stores a value", "A kind of loop", "A web browser"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "What is the value of minutes after this code runs?",
        code: "let minutes = 10;\nminutes = minutes + 5;",
        options: ["10", "5", "15"],
        answer: 2,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "Which line makes a variable called seconds that starts at 0?",
        options: ["let seconds = 0;", "seconds let 0;", "0 = seconds;"],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "In JavaScript, \"25\" (with quotes) and 25 (without quotes) are the same type.",
        options: TRUE_FALSE,
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Why does our Homework Timer use a variable for the time left?",
        options: [
          "Because the time left changes while the timer runs",
          "Because variables make the page colourful",
          "Because the browser needs it to turn on",
        ],
        answer: 0,
      },
      {
        id: "q6",
        type: "short",
        prompt: "Name a variable your timer could use and say what it stores. (Example: score stores the points.)",
      },
    ],
  },
  {
    slug: "s1-quiz-2",
    program: "developers",
    semester: 1,
    number: 2,
    week: 8,
    title: "Homework Timer: Quiz 2",
    intro: "Read each question and any code carefully, then pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What is a function?",
        options: [
          "A named set of steps you can run whenever you need them",
          "A number that never changes",
          "A picture on the page",
        ],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "What does this code do?",
        code: "function startTimer() {\n  console.log(\"Go!\");\n}\nstartTimer();",
        options: ["Prints \"Go!\" once", "Prints \"Go!\" forever", "Nothing, the function is never called"],
        answer: 0,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "An event is something that happens that code can respond to. Which one is an event?",
        options: ["A user clicks a button", "A variable called total", "The word function"],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "What happens when the button is clicked?",
        code: "button.addEventListener(\"click\", startTimer);",
        options: ["startTimer runs", "The button disappears", "The page closes"],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Writing a function once lets you reuse it many times.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q6",
        type: "short",
        prompt: "Describe one event your Homework Timer responds to and what happens when it does.",
      },
    ],
  },

  // ── Engineers (Grades 6–8): Python logic + cybersecurity ──
  {
    slug: "s1-quiz-1",
    program: "engineers",
    semester: 1,
    number: 1,
    week: 4,
    title: "Password Strength Checker: Quiz 1",
    intro: "Read each question and any code carefully, then pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What does this Python code print?",
        code: "password = \"tiger\"\nprint(len(password))",
        options: ["tiger", "5", "6"],
        answer: 1,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "What does this code print?",
        code: "length = 12\nif length >= 8:\n    print(\"Long enough\")\nelse:\n    print(\"Too short\")",
        options: ["Long enough", "Too short", "Nothing"],
        answer: 0,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "What type of value is \"hello123\" in Python?",
        options: ["int", "str", "bool"],
        answer: 1,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Which password is the strongest?",
        options: ["password1", "Sunny-Maple-Kite-42!", "123456"],
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Using the same password on every website is a safe habit.",
        options: TRUE_FALSE,
        answer: 1,
      },
      {
        id: "q6",
        type: "short",
        prompt: "In your own words, what makes a password strong?",
      },
    ],
  },
  {
    slug: "s1-quiz-2",
    program: "engineers",
    semester: 1,
    number: 2,
    week: 8,
    title: "Password Strength Checker: Quiz 2",
    intro: "Read each question and any code carefully, then pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What does this code print?",
        code: "password = \"abc\"\nprint(password.isdigit())",
        options: ["True", "False", "abc"],
        answer: 1,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "What is the value of score after this loop?",
        code: "score = 0\nfor ch in \"a1b2\":\n    if ch.isdigit():\n        score = score + 1",
        options: ["0", "2", "4"],
        answer: 1,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "Which condition is True only when the password has 8 or more characters AND contains a digit?",
        options: [
          "len(pw) >= 8 or has_digit",
          "len(pw) >= 8 and has_digit",
          "len(pw) < 8 and has_digit",
        ],
        answer: 1,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "You get a message: \"Your account is locked! Reply with your password to unlock it.\" What is this most likely?",
        options: ["A phishing scam", "A normal message from your school", "A software update"],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Two-factor authentication adds a second check, like a code sent to your phone.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q6",
        type: "short",
        prompt: "Describe one rule your Password Strength Checker uses and why it makes passwords safer.",
      },
    ],
  },
];
