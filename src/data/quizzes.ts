import type { ProgramSlug } from "./programs";

/**
 * Online quizzes, two per program per semester (see PROGRAM_STRUCTURE in
 * programs.ts). Students take them at /quizzes/<program>/<quiz>/ after
 * entering their program's class password (the same one as the workbooks).
 *
 * Question types:
 * - "choice": marked on the server against `answer` (the index of the right
 *   option).
 * - "short": a written answer the instructor reads.
 * - "code": the student writes code in a code box that starts with `starter`;
 *   `hint` is shown to them. Not auto-marked: instructors read it on
 *   /quizzes/results/ next to `sample`, a model answer.
 * `answer` and `sample` are stripped before a quiz is sent to the browser
 * (see toPublicQuiz in src/lib/quizzes.ts).
 *
 * Sizes: Explorers and Builders 10 questions; Developers and Engineers 20,
 * 6 of them (30%) writing code. Every question only uses what that program
 * has been taught by that week of Semester 1 (Explorers: the S1 blocks in
 * src/components/tools/blocks/levels.ts; Engineers: the S1 project in
 * scripts/python-fixtures/semester1_project.py).
 *
 * Note: this repository is public, so a determined student could find the
 * answer key here. These are low-stakes check-ins, so that is an accepted
 * trade-off; don't put anything here that must stay secret.
 */

export type CodeLanguage = "html" | "javascript" | "python";

export type QuizQuestion =
  | {
      id: string;
      type: "choice";
      prompt: string;
      /** Optional code (or an emoji picture) shown under the prompt, in a monospace block. */
      code?: string;
      options: string[];
      answer: number;
    }
  | {
      id: string;
      type: "short";
      prompt: string;
      code?: string;
    }
  | {
      id: string;
      type: "code";
      prompt: string;
      language: CodeLanguage;
      hint?: string;
      /** What the code box starts with. */
      starter?: string;
      /** Model answer, for instructors only. */
      sample: string;
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
  // ── Explorers (K–Grade 1), My Helpful Robot: sequencing, moving, debugging ──
  // Only Semester 1 blocks: Start on Tap, Start on Green Flag, Move Right/Left/Up/Down, Say, Pop, Grow.
  {
    slug: "s1-quiz-1",
    program: "explorers",
    semester: 1,
    number: 1,
    week: 4,
    title: "My Helpful Robot: Quiz 1",
    intro: "Ask a grown-up to read each question out loud with you. Look at the pictures, then pick the best answer.",
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
        prompt: "How many Move Right blocks does the robot need to get to the star?",
        code: "🤖 ⬜ ⬜ ⭐",
        options: ["2", "3", "4"],
        answer: 1,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "The star is above the robot. Which block do we use?",
        code: "⭐\n⬜\n🤖",
        options: ["Move Down", "Move Up", "Move Left"],
        answer: 1,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "The robot must go right 2 squares, then up 1 square. Which program is right?",
        code: "⬜ ⬜ ⭐\n🤖 ⬜ ⬜",
        options: [
          "Move Right, Move Right, Move Up",
          "Move Up, Move Up, Move Right",
          "Move Right, Move Up",
        ],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Your robot needs to get dressed. Which order makes sense?",
        options: ["Shoes, then socks", "Socks, then shoes", "It does not matter"],
        answer: 1,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "A rock is in the way! The robot can't walk through rocks. What should we do?",
        code: "🤖 🪨 ⭐",
        options: ["Go around the rock", "Keep pressing Move Right", "Give up"],
        answer: 0,
      },
      {
        id: "q7",
        type: "choice",
        prompt: "The robot stopped one square before the star. What is the bug?",
        code: "⬜ ⬜ 🤖 ⭐",
        options: ["We need one more Move Right block", "The star is broken", "The robot is tired"],
        answer: 0,
      },
      {
        id: "q8",
        type: "choice",
        prompt: "In coding, a bug is…",
        options: ["A mistake in our code", "An insect inside the computer", "A prize for winning"],
        answer: 0,
      },
      {
        id: "q9",
        type: "choice",
        prompt: "Mia's program is: Move Right, then Move Left. Where does the robot end up?",
        options: ["Back where it started", "Two squares to the right", "At the top"],
        answer: 0,
      },
      {
        id: "q10",
        type: "choice",
        prompt: "Our program doesn't work. What should we do first?",
        options: [
          "Watch what the robot really does, one step at a time",
          "Throw away all the blocks",
          "Press lots of buttons fast",
        ],
        answer: 0,
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
    intro: "Ask a grown-up to read each question out loud with you. Look at the pictures, then pick the best answer.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "Which block makes our code start when we press the green flag?",
        options: ["Start on Green Flag", "Start on Tap", "Move Up"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "The blocks under Start on Tap run when…",
        options: ["You tap the character", "You wait a long time", "The computer turns off"],
        answer: 0,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "Which block shows a speech bubble with words?",
        options: ["Say", "Pop", "Grow"],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Which block makes a sound?",
        options: ["Grow", "Pop", "Move Down"],
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Which block makes the character bigger?",
        options: ["Say", "Move Up", "Grow"],
        answer: 2,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "Get both apples, then go to the star. How many Move Right blocks do we need?",
        code: "🤖 🍎 ⬜ 🍎 ⭐",
        options: ["2", "3", "4"],
        answer: 2,
      },
      {
        id: "q7",
        type: "choice",
        prompt: "We pressed the green flag and nothing happened. Our blocks start with Start on Tap. How do we fix it?",
        options: [
          "Tap the character, or change it to Start on Green Flag",
          "Press the green flag harder",
          "Add more Move blocks",
        ],
        answer: 0,
      },
      {
        id: "q8",
        type: "choice",
        prompt: "The robot should say \"Hello!\" and then move. But it moved first. How do we fix it?",
        options: ["Put the Say block before the Move block", "Take the Say block away", "Add a Pop block"],
        answer: 0,
      },
      {
        id: "q9",
        type: "choice",
        prompt: "The robot got to the star but missed an apple. What is the bug?",
        code: "⬜ 🍎 ⬜\n🤖 ⬜ ⭐",
        options: ["The path doesn't go over the apple", "Apples are not allowed", "The star is in the wrong place"],
        answer: 0,
      },
      {
        id: "q10",
        type: "choice",
        prompt: "One app can have more than one start block (a trigger).",
        options: TRUE_FALSE,
        answer: 0,
      },
    ],
  },

  // ── Builders (Grades 2–3), All About Me Page: HTML tags and structure ──
  // Semester 1 is tags and page structure; CSS and lists are Semester 2, links Semester 3.
  {
    slug: "s1-quiz-1",
    program: "builders",
    semester: 1,
    number: 1,
    week: 4,
    title: "All About Me Page: Quiz 1",
    intro: "Pick the best answer for the first questions. Then write real HTML in the code boxes. Use the tips to help you!",
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
        prompt: "Which one is a closing tag?",
        options: ["<p>", "</p>", "<\\p>"],
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "What is missing from this code?",
        code: "<h1>All About Me",
        options: ["A closing tag: </h1>", "A picture", "Nothing, it is perfect"],
        answer: 0,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "How many headings are on this page?",
        code: "<h1>All About Me</h1>\n<p>I am 7.</p>\n<h2>My Family</h2>\n<p>I have a sister.</p>",
        options: ["1", "2", "4"],
        answer: 1,
      },
      {
        id: "q7",
        type: "code",
        language: "html",
        prompt: "Write a heading that says: All About Me",
        hint: "Start with <h1> and finish with </h1>. Put the words in the middle.",
        sample: "<h1>All About Me</h1>",
      },
      {
        id: "q8",
        type: "code",
        language: "html",
        prompt: "Finish this paragraph about your favourite food.",
        hint: "Type your food, then close the paragraph with </p>.",
        starter: "<p>My favourite food is ",
        sample: "<p>My favourite food is pizza.</p>",
      },
      {
        id: "q9",
        type: "code",
        language: "html",
        prompt: "This code has 2 bugs. Fix them!",
        hint: "Look closely at the closing tags. Each one needs a slash ( / ) and a > at the end.",
        starter: "<h1>My Pets<h1>\n<p>I have a cat.</p",
        sample: "<h1>My Pets</h1>\n<p>I have a cat.</p>",
      },
      {
        id: "q10",
        type: "code",
        language: "html",
        prompt: "Write a heading that says My Hobbies, then two paragraphs about things you like to do.",
        hint: "Use one <h2>…</h2>, then two <p>…</p>. Put each one on its own line.",
        sample: "<h2>My Hobbies</h2>\n<p>I like to swim.</p>\n<p>I like to draw dragons.</p>",
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
    intro: "Pick the best answer for the first questions. Then write real HTML in the code boxes. Use the tips to help you!",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "Which tag shows a picture on the page?",
        options: ["<img>", "<p>", "<h1>"],
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
        prompt: "Where do the words inside <title> show up?",
        options: ["On the browser tab", "In a big heading", "Under every picture"],
        answer: 0,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Why do we add alt text to a picture?",
        code: '<img src="dog.png" alt="My brown dog">',
        options: [
          "It tells people what the picture shows if they can't see it",
          "It makes the picture bigger",
          "It changes the picture's colour",
        ],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "Tags go inside other tags like boxes. Which code is put together the right way?",
        options: ["<body><h1>Hi!</h1></body>", "<body><h1>Hi!</body></h1>", "</body><h1>Hi!</h1><body>"],
        answer: 0,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "It is safe to put your home address on your All About Me page.",
        options: TRUE_FALSE,
        answer: 1,
      },
      {
        id: "q7",
        type: "code",
        language: "html",
        prompt: "Write the tag to show the picture cat.png with the alt text: My cat",
        hint: '<img> has no closing tag. It looks like <img src="..." alt="...">',
        sample: '<img src="cat.png" alt="My cat">',
      },
      {
        id: "q8",
        type: "code",
        language: "html",
        prompt: "Add a heading and a paragraph about you inside the body.",
        hint: "Type your new lines between <body> and </body>.",
        starter: "<html>\n  <head>\n    <title>All About Me</title>\n  </head>\n  <body>\n\n  </body>\n</html>",
        sample:
          "<html>\n  <head>\n    <title>All About Me</title>\n  </head>\n  <body>\n    <h1>Hi, I'm Sam!</h1>\n    <p>I am 8 and I love soccer.</p>\n  </body>\n</html>",
      },
      {
        id: "q9",
        type: "code",
        language: "html",
        prompt: "This page has 2 bugs. Fix them!",
        hint: "Check that every opening tag has a matching closing tag with the same name.",
        starter: "<body>\n  <h1>About Me</h2>\n  <p>I am 8 years old.\n</body>",
        sample: "<body>\n  <h1>About Me</h1>\n  <p>I am 8 years old.</p>\n</body>",
      },
      {
        id: "q10",
        type: "code",
        language: "html",
        prompt: "Write a part of your page about your favourite animal: a heading, a paragraph, and a picture.",
        hint: "Use <h2>…</h2>, then <p>…</p>, then <img src=\"…\" alt=\"…\">. Make up a picture name like fox.png.",
        sample: '<h2>My Favourite Animal</h2>\n<p>I love foxes because they are clever.</p>\n<img src="fox.png" alt="A red fox">',
      },
    ],
  },

  // ── Developers (Grades 4–5), Homework Timer & Focus Tool: variables, functions, events ──
  // Conditionals are Semester 2 and arrays/loops Semester 3, so no if or for here.
  {
    slug: "s1-quiz-1",
    program: "developers",
    semester: 1,
    number: 1,
    week: 4,
    title: "Homework Timer: Quiz 1",
    intro:
      "Questions 1–14: read the code carefully and pick the best answer. Questions 15–20: write your own JavaScript. Use the tips and starter code to help you.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What is a variable?",
        options: ["A box with a name that stores a value", "A kind of web browser", "A button on the page"],
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
        prompt: "Which kind of variable can NOT be given a new value later?",
        options: ["const", "let", "Both can always change"],
        answer: 0,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "What does this line do?",
        code: 'console.log("Focus!");',
        options: ["Shows Focus! in the console", "Makes a new button", "Stops the timer"],
        answer: 0,
      },
      {
        id: "q7",
        type: "choice",
        prompt: "What is the value of label?",
        code: 'let label = "Study " + "time";',
        options: ['"Study time"', '"Studytime"', "An error"],
        answer: 0,
      },
      {
        id: "q8",
        type: "choice",
        prompt: "What does this code print?",
        code: 'let a = "5";\nconsole.log(a + 1);',
        options: ["6", "51", "a1"],
        answer: 1,
      },
      {
        id: "q9",
        type: "choice",
        prompt: "Which is a good, working variable name?",
        options: ["timeLeft", "time left", "2time"],
        answer: 0,
      },
      {
        id: "q10",
        type: "choice",
        prompt: "What is the value of total at the end?",
        code: "let total = 3;\ntotal = total * 2;",
        options: ["5", "6", "32"],
        answer: 1,
      },
      {
        id: "q11",
        type: "choice",
        prompt: "What does this code print?",
        code: "let breaks = 0;\nbreaks = breaks + 1;\nbreaks = breaks + 1;\nconsole.log(breaks);",
        options: ["0", "1", "2"],
        answer: 2,
      },
      {
        id: "q12",
        type: "choice",
        prompt: "What does this code print?",
        code: 'let subject = "Math";\nconsole.log("Now studying: " + subject);',
        options: ["Now studying: Math", "Now studying: subject", "Math: Now studying"],
        answer: 0,
      },
      {
        id: "q13",
        type: "choice",
        prompt: "What does this line do?",
        code: 'const display = document.getElementById("timer");',
        options: [
          "Finds the part of the page with the id timer and stores it in display",
          "Makes a new timer that starts counting",
          "Deletes the timer from the page",
        ],
        answer: 0,
      },
      {
        id: "q14",
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
        id: "q15",
        type: "code",
        language: "javascript",
        prompt: "Make a variable called minutes and set it to 25.",
        hint: "Pattern: let name = value;",
        sample: "let minutes = 25;",
      },
      {
        id: "q16",
        type: "code",
        language: "javascript",
        prompt: "Make a variable called taskName that holds the text Read chapter 3, then print it with console.log.",
        hint: "Text needs quotes: \"like this\". Then console.log(taskName);",
        sample: 'let taskName = "Read chapter 3";\nconsole.log(taskName);',
      },
      {
        id: "q17",
        type: "code",
        language: "javascript",
        prompt: "Add 5 more minutes to minutes, then print it. It should print 25.",
        hint: "Use the variable on both sides: minutes = minutes + …",
        starter: "let minutes = 20;\n// add 5 more minutes here\n\n// print minutes here\n",
        sample: "let minutes = 20;\nminutes = minutes + 5;\nconsole.log(minutes);",
      },
      {
        id: "q18",
        type: "code",
        language: "javascript",
        prompt:
          "Make a variable minutes set to 2 and a variable seconds set to 30. Then make totalSeconds that works out the total number of seconds, and print it.",
        hint: "There are 60 seconds in a minute: minutes * 60 + seconds",
        sample: "let minutes = 2;\nlet seconds = 30;\nlet totalSeconds = minutes * 60 + seconds;\nconsole.log(totalSeconds);",
      },
      {
        id: "q19",
        type: "code",
        language: "javascript",
        prompt: "This code has 2 bugs. Fix it so it prints 10.",
        hint: "Variable names can't have spaces, and they must be spelled the same way every time (capitals count!).",
        starter: "let time left = 10;\nconsole.log(timeleft);",
        sample: "let timeLeft = 10;\nconsole.log(timeLeft);",
      },
      {
        id: "q20",
        type: "code",
        language: "javascript",
        prompt: "Make a variable greeting that joins \"Good job, \" and the name variable, then print it. It should print: Good job, Sam",
        hint: "Join text with +",
        starter: 'let name = "Sam";\n// make greeting here\n',
        sample: 'let name = "Sam";\nlet greeting = "Good job, " + name;\nconsole.log(greeting);',
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
    intro:
      "Questions 1–14: read the code carefully and pick the best answer. Questions 15–20: write your own JavaScript. Use the tips and starter code to help you.",
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
        code: 'function startTimer() {\n  console.log("Go!");\n}\nstartTimer();',
        options: ['Prints "Go!" once', 'Prints "Go!" forever', "Nothing, the function is never called"],
        answer: 0,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "What does this code print?",
        code: 'function sayHi() {\n  console.log("Hi");\n}',
        options: ["Hi", "Nothing, because sayHi is never called", "An error"],
        answer: 1,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "How do you call (run) a function named resetTimer?",
        options: ["resetTimer();", "function resetTimer;", "call resetTimer"],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "An event is something that happens that code can respond to. Which one is an event?",
        options: ["A user clicks a button", "A variable called total", "The word function"],
        answer: 0,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "What happens when the button is clicked?",
        code: 'button.addEventListener("click", startTimer);',
        options: ["startTimer runs", "The button disappears", "The page closes"],
        answer: 0,
      },
      {
        id: "q7",
        type: "choice",
        prompt: "What does this code print?",
        code: "function addMinutes(m) {\n  return m + 5;\n}\nconsole.log(addMinutes(10));",
        options: ["10", "15", "m + 5"],
        answer: 1,
      },
      {
        id: "q8",
        type: "choice",
        prompt: "What is the value of x?",
        code: "function double(n) {\n  return n * 2;\n}\nlet x = double(4);",
        options: ["4", "6", "8"],
        answer: 2,
      },
      {
        id: "q9",
        type: "choice",
        prompt: "Which event name do we use for a mouse click?",
        options: ['"click"', '"press"', '"mouse"'],
        answer: 0,
      },
      {
        id: "q10",
        type: "choice",
        prompt: "What does this line do?",
        code: "setInterval(tick, 1000);",
        options: ["Runs tick every second", "Runs tick 1000 times at once", "Waits 1000 seconds, then stops"],
        answer: 0,
      },
      {
        id: "q11",
        type: "choice",
        prompt: "What does this line do?",
        code: 'display.textContent = "Done!";',
        options: ["Changes the words in display to Done!", "Prints Done! in the console", "Makes a new variable called Done"],
        answer: 0,
      },
      {
        id: "q12",
        type: "choice",
        prompt: "Writing a function once lets you reuse it many times.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q13",
        type: "choice",
        prompt: "What does this code print?",
        code: "let count = 0;\nfunction addOne() {\n  count = count + 1;\n}\naddOne();\naddOne();\naddOne();\nconsole.log(count);",
        options: ["0", "1", "3"],
        answer: 2,
      },
      {
        id: "q14",
        type: "choice",
        prompt: "In function addMinutes(m), what is m?",
        options: [
          "A parameter: the value we give the function when we call it",
          "The name of the function",
          "A button on the page",
        ],
        answer: 0,
      },
      {
        id: "q15",
        type: "code",
        language: "javascript",
        prompt: "Write a function called sayFocus that prints Time to focus! Then call it.",
        hint: "function sayFocus() {\n  …\n}\nsayFocus();",
        sample: 'function sayFocus() {\n  console.log("Time to focus!");\n}\nsayFocus();',
      },
      {
        id: "q16",
        type: "code",
        language: "javascript",
        prompt: "Write a function called addBreak that takes minutes and returns minutes + 5.",
        hint: "Put the parameter in the brackets: function addBreak(minutes) { return … }",
        sample: "function addBreak(minutes) {\n  return minutes + 5;\n}",
      },
      {
        id: "q17",
        type: "code",
        language: "javascript",
        prompt: "Connect the Start button to startTimer, so the timer starts when the button is clicked.",
        hint: 'Use addEventListener with the "click" event. Don\'t put () after startTimer: we are naming it, not running it yet.',
        starter:
          'const button = document.getElementById("start");\n\nfunction startTimer() {\n  console.log("Timer started");\n}\n\n// connect the button to startTimer here\n',
        sample:
          'const button = document.getElementById("start");\n\nfunction startTimer() {\n  console.log("Timer started");\n}\n\nbutton.addEventListener("click", startTimer);',
      },
      {
        id: "q18",
        type: "code",
        language: "javascript",
        prompt: "This code has 2 bugs. Fix it so resetTimer runs.",
        hint: "Every { needs a matching }. And to run a function you need () after its name.",
        starter: "let timeLeft = 0;\n\nfunction resetTimer() {\n  timeLeft = 25;\n\nresetTimer;",
        sample: "let timeLeft = 0;\n\nfunction resetTimer() {\n  timeLeft = 25;\n}\n\nresetTimer();",
      },
      {
        id: "q19",
        type: "code",
        language: "javascript",
        prompt: "Write a function showTime that takes seconds and puts \"Time left: \" and the seconds into display.",
        hint: 'Inside the function: display.textContent = "Time left: " + seconds;',
        starter: 'const display = document.getElementById("display");\n\n// write showTime here\n',
        sample:
          'const display = document.getElementById("display");\n\nfunction showTime(seconds) {\n  display.textContent = "Time left: " + seconds;\n}',
      },
      {
        id: "q20",
        type: "code",
        language: "javascript",
        prompt:
          "Build a Pause button: find the button with the id pause, write a function pauseTimer that prints Paused, and make it run when the button is clicked.",
        hint: "Three steps: 1) document.getElementById  2) function pauseTimer() { … }  3) addEventListener",
        starter: "// 1. find the pause button\n\n// 2. write pauseTimer\n\n// 3. connect them\n",
        sample:
          'const pauseButton = document.getElementById("pause");\n\nfunction pauseTimer() {\n  console.log("Paused");\n}\n\npauseButton.addEventListener("click", pauseTimer);',
      },
    ],
  },

  // ── Engineers (Grades 6–8), Password Strength Checker: Python logic + cybersecurity ──
  // Built on the Semester 1 project (scripts/python-fixtures/semester1_project.py)
  // and the errors its lessons teach (scripts/python-cases.mjs).
  {
    slug: "s1-quiz-1",
    program: "engineers",
    semester: 1,
    number: 1,
    week: 4,
    title: "Password Strength Checker: Quiz 1",
    intro:
      "Questions 1–14: read the code carefully and pick the best answer. Questions 15–20: write your own Python. Use the tips and starter code, and indent with 4 spaces (the Tab key adds them). Never type a real password!",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "What does this code print?",
        code: 'test_password = "sunshine123"\nprint(len(test_password))',
        options: ["sunshine123", "11", "8"],
        answer: 1,
      },
      {
        id: "q2",
        type: "choice",
        prompt: 'What type of value is "hello123" in Python?',
        options: ["int", "str", "bool"],
        answer: 1,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "What type of value is has_digit?",
        code: "has_digit = False",
        options: ["str", "int", "bool"],
        answer: 2,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "What does this code print?",
        code: 'for character in "cat":\n    print(character)',
        options: ["cat", "c, a and t, each on its own line", "3"],
        answer: 1,
      },
      {
        id: "q5",
        type: "choice",
        prompt: 'What does "7".isdigit() return?',
        options: ["True", "False", "7"],
        answer: 0,
      },
      {
        id: "q6",
        type: "choice",
        prompt: 'What does "Q".isupper() return?',
        options: ["True", "False", "q"],
        answer: 0,
      },
      {
        id: "q7",
        type: "choice",
        prompt: "What is the value of score after this loop?",
        code: 'score = 0\nfor character in "a1b2":\n    if character.isdigit():\n        score = score + 1',
        options: ["0", "2", "4"],
        answer: 1,
      },
      {
        id: "q8",
        type: "choice",
        prompt: "The variable is called password. Which error does this line give?",
        code: "print(passwrd)",
        options: ["NameError", "IndentationError", "TypeError"],
        answer: 0,
      },
      {
        id: "q9",
        type: "choice",
        prompt: "This line starts with two spaces. Which error does it give?",
        code: '  print("x")',
        options: ["SyntaxError", "IndentationError: unexpected indent", "NameError"],
        answer: 1,
      },
      {
        id: "q10",
        type: "choice",
        prompt: "Which error does this give?",
        code: "print(len(12345))",
        options: ["TypeError: object of type 'int' has no len()", "NameError", "No error, it prints 5"],
        answer: 0,
      },
      {
        id: "q11",
        type: "choice",
        prompt: "This code prints True even though \"abc\" has no digits. Why?",
        code: 'has_digit = False\nfor character in "abc":\n    if character.isdigit:\n        has_digit = True\nprint(has_digit)',
        options: [
          "isdigit is missing its (), so it is never actually called",
          "\"abc\" really does contain a digit",
          "The for loop runs backwards",
        ],
        answer: 0,
      },
      {
        id: "q12",
        type: "choice",
        prompt: "Which password is the strongest?",
        options: ["Tr0ub4dor&3", "correct horse battery staple", "P@ssw0rd"],
        answer: 1,
      },
      {
        id: "q13",
        type: "choice",
        prompt: "Using the same password on every website is a safe habit.",
        options: TRUE_FALSE,
        answer: 1,
      },
      {
        id: "q14",
        type: "choice",
        prompt: "In our checker, what makes a password strong the fastest?",
        options: ["Making it longer", "Swapping letters for symbols, like $ for s", "Adding ! at the end"],
        answer: 0,
      },
      {
        id: "q15",
        type: "code",
        language: "python",
        prompt: "Make a variable test_password with a made-up password (not a real one!) and print how many characters it has.",
        hint: "len(…) counts the characters. print(len(test_password))",
        sample: 'test_password = "purple-tiger-42"\nprint(len(test_password))',
      },
      {
        id: "q16",
        type: "code",
        language: "python",
        prompt: 'Write a for loop that prints every character of the word "secure", one per line.',
        hint: "for character in …:  then indent the next line with 4 spaces.",
        sample: 'for character in "secure":\n    print(character)',
      },
      {
        id: "q17",
        type: "code",
        language: "python",
        prompt: "Finish the loop so has_digit becomes True if the password has a digit. It should print True.",
        hint: "Inside the loop: if character.isdigit():  then set has_digit = True (indent 8 spaces).",
        starter: 'has_digit = False\nfor character in "pass99":\n    # your if goes here\n\nprint(has_digit)',
        sample: 'has_digit = False\nfor character in "pass99":\n    if character.isdigit():\n        has_digit = True\n\nprint(has_digit)',
      },
      {
        id: "q18",
        type: "code",
        language: "python",
        prompt: "This code has 2 bugs. Fix it so it prints each character.",
        hint: "A for line ends with a colon, and the line inside the loop must be indented.",
        starter: 'test_password = "hello"\nfor character in test_password\nprint(character)',
        sample: 'test_password = "hello"\nfor character in test_password:\n    print(character)',
      },
      {
        id: "q19",
        type: "code",
        language: "python",
        prompt: 'Count how many uppercase letters are in "HeLLo" and print the count. It should print 3.',
        hint: "Start a counter at 0. Loop over the characters. If character.isupper(), add 1.",
        starter: "count_upper = 0\n",
        sample: 'count_upper = 0\nfor character in "HeLLo":\n    if character.isupper():\n        count_upper = count_upper + 1\nprint(count_upper)',
      },
      {
        id: "q20",
        type: "code",
        language: "python",
        prompt:
          'For the password "Sun1!", set has_digit, has_upper, has_lower and has_symbol the way our checker does, then print all four. They should all be True.',
        hint: "Use one if / elif / elif / else inside the loop: isdigit(), isupper(), islower(), and anything else is a symbol.",
        starter:
          'test_password = "Sun1!"\nhas_digit = False\nhas_upper = False\nhas_lower = False\nhas_symbol = False\n\nfor character in test_password:\n    # your if / elif / else goes here\n\nprint(has_digit, has_upper, has_lower, has_symbol)',
        sample:
          'test_password = "Sun1!"\nhas_digit = False\nhas_upper = False\nhas_lower = False\nhas_symbol = False\n\nfor character in test_password:\n    if character.isdigit():\n        has_digit = True\n    elif character.isupper():\n        has_upper = True\n    elif character.islower():\n        has_lower = True\n    else:\n        has_symbol = True\n\nprint(has_digit, has_upper, has_lower, has_symbol)',
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
    intro:
      "Questions 1–14: read the code carefully and pick the best answer. Questions 15–20: write your own Python. Use the tips and starter code, and indent with 4 spaces (the Tab key adds them). Never type a real password!",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "Using our checker's rate function, what does rate(20, 1) return?",
        code: 'def rate(length, variety):\n    if length >= 16:\n        return "STRONG"\n    elif length >= 12 and variety >= 2:\n        return "OKAY"\n    else:\n        return "WEAK"',
        options: ["STRONG", "OKAY", "WEAK"],
        answer: 0,
      },
      {
        id: "q2",
        type: "choice",
        prompt: "Using the same rate function, what does rate(13, 3) return?",
        options: ["STRONG", "OKAY", "WEAK"],
        answer: 1,
      },
      {
        id: "q3",
        type: "choice",
        prompt: "And what does rate(13, 1) return?",
        options: ["STRONG", "OKAY", "WEAK"],
        answer: 2,
      },
      {
        id: "q4",
        type: "choice",
        prompt: "rate(28) returns OKAY, but a 28-character password should be STRONG. Why?",
        code: 'def rate(length):\n    if length >= 12:\n        return "OKAY"\n    elif length >= 16:\n        return "STRONG"\n    else:\n        return "WEAK"',
        options: [
          "The first true condition wins, so the >= 16 check is never reached",
          "28 is too big for Python",
          "elif only works with small numbers",
        ],
        answer: 0,
      },
      {
        id: "q5",
        type: "choice",
        prompt: "This prints STRONG and then Rating: None. Why None?",
        code: 'def rate(length):\n    if length >= 16:\n        print("STRONG")\n    else:\n        print("WEAK")\n\nrating = rate(20)\nprint("Rating:", rating)',
        options: [
          "The function prints instead of returning, so it gives back nothing (None)",
          "20 is not a valid length",
          "print can't show text and a variable together",
        ],
        answer: 0,
      },
      {
        id: "q6",
        type: "choice",
        prompt: "Which error does this give, and why?",
        code: 'length = 16\nif length = 16:\n    print("sixteen")',
        options: [
          "SyntaxError: comparing needs == (one = means store a value)",
          "NameError: length is not defined",
          "No error: it prints sixteen",
        ],
        answer: 0,
      },
      {
        id: "q7",
        type: "choice",
        prompt: "What is missing from this line?",
        code: "def rate(password)",
        options: ["A colon : at the end", "A return", "Quotes around password"],
        answer: 0,
      },
      {
        id: "q8",
        type: "choice",
        prompt: "Which condition is True only when the password has 12 or more characters AND at least 2 kinds of character?",
        options: ["length >= 12 or variety >= 2", "length >= 12 and variety >= 2", "length < 12 and variety >= 2"],
        answer: 1,
      },
      {
        id: "q9",
        type: "choice",
        prompt: "What is variety at the end?",
        code: "has_digit = True\nhas_upper = False\nhas_lower = True\nhas_symbol = False\n\nvariety = 0\nif has_digit:\n    variety = variety + 1\nif has_upper:\n    variety = variety + 1\nif has_lower:\n    variety = variety + 1\nif has_symbol:\n    variety = variety + 1",
        options: ["1", "2", "4"],
        answer: 1,
      },
      {
        id: "q10",
        type: "choice",
        prompt: "What should a website store instead of your actual password?",
        options: ["A hash of it, like the one hashlib.sha256 makes", "The password written backwards", "Nothing at all"],
        answer: 0,
      },
      {
        id: "q11",
        type: "choice",
        prompt: "Why is storing hashes safer than storing passwords?",
        options: [
          "If hackers steal the list, they get hashes that can't easily be turned back into passwords",
          "Hashes are shorter, so they load faster",
          "Hashes can be read by anyone, so nobody needs a password",
        ],
        answer: 0,
      },
      {
        id: "q12",
        type: "choice",
        prompt: 'You get a message: "Your account is locked! Reply with your password to unlock it." What is this most likely?',
        options: ["A phishing scam", "A normal message from your school", "A software update"],
        answer: 0,
      },
      {
        id: "q13",
        type: "choice",
        prompt: "Two-factor authentication adds a second check, like a code sent to your phone.",
        options: TRUE_FALSE,
        answer: 0,
      },
      {
        id: "q14",
        type: "choice",
        prompt: 'Our checker rates "sunshine123" WEAK. Which change helps the most?',
        options: ['Add more words to make it longer', 'Change the s to $', 'Add ! at the end'],
        answer: 0,
      },
      {
        id: "q15",
        type: "code",
        language: "python",
        prompt: 'Write a function rate_length(length) that returns "LONG" if length is 12 or more, and "SHORT" otherwise.',
        hint: "def rate_length(length):\n    if …:\n        return …\n    else:\n        return …",
        sample: 'def rate_length(length):\n    if length >= 12:\n        return "LONG"\n    else:\n        return "SHORT"',
      },
      {
        id: "q16",
        type: "code",
        language: "python",
        prompt: "Finish the code so variety goes up by 1 for each kind of character the password has. It should print 2.",
        hint: "One if for each has_ variable. Inside each: variety = variety + 1",
        starter: "has_digit = True\nhas_symbol = True\n\nvariety = 0\n# add your two ifs here\n\nprint(variety)",
        sample:
          "has_digit = True\nhas_symbol = True\n\nvariety = 0\nif has_digit:\n    variety = variety + 1\nif has_symbol:\n    variety = variety + 1\n\nprint(variety)",
      },
      {
        id: "q17",
        type: "code",
        language: "python",
        prompt:
          'Print advice for the rating: "Make it longer." for WEAK, "Add another word." for OKAY, and "Good. Never reuse it." for anything else.',
        hint: 'if rating == "WEAK":  …  elif rating == "OKAY":  …  else:  …  (remember == for comparing)',
        starter: 'rating = "OKAY"\n',
        sample:
          'rating = "OKAY"\nif rating == "WEAK":\n    print("Make it longer.")\nelif rating == "OKAY":\n    print("Add another word.")\nelse:\n    print("Good. Never reuse it.")',
      },
      {
        id: "q18",
        type: "code",
        language: "python",
        prompt: "This rate function has 3 bugs. Fix them all.",
        hint: "Look for: a missing colon, checks in the wrong order (the first true one wins), and a print where there should be a return.",
        starter:
          'def rate(length)\n    if length >= 12:\n        return "OKAY"\n    elif length >= 16:\n        return "STRONG"\n    else:\n        print("WEAK")',
        sample:
          'def rate(length):\n    if length >= 16:\n        return "STRONG"\n    elif length >= 12:\n        return "OKAY"\n    else:\n        return "WEAK"',
      },
      {
        id: "q19",
        type: "code",
        language: "python",
        prompt: "Write a function contains_digit(password) that returns True if the password has at least one digit, and False if it has none.",
        hint: "Loop over the characters. If one isdigit(), return True straight away. After the loop, return False.",
        sample:
          "def contains_digit(password):\n    for character in password:\n        if character.isdigit():\n            return True\n    return False",
      },
      {
        id: "q20",
        type: "code",
        language: "python",
        prompt:
          "Design a new rule for our checker. Write the code for it, and add a # comment saying why it makes passwords safer.",
        hint: "Ideas: warn if the password is under 8 characters, or if it is exactly the same as checker_for. Use an if and a print.",
        starter: 'test_password = "sunshine123"\nchecker_for = "my game account"\n\n# my rule:\n',
        sample:
          'test_password = "sunshine123"\nchecker_for = "my game account"\n\n# my rule: very short passwords can be guessed in seconds\nif len(test_password) < 8:\n    print("Warning: too short to be safe.")',
      },
    ],
  },
];
