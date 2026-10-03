// Acceptance cases for /tools/python, taken from the Engineers Semester 1
// lesson plans. Shared by test-python.mjs (Node, fast) and
// test-python-e2e.mjs (the real page in Chromium). If one of these starts
// failing, a lesson is broken: fix the tool, not the test.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => fs.readFileSync(path.join(here, "python-fixtures", name), "utf8");

export const PROJECT = fixture("semester1_project.py");
export const PROJECT_OUTPUT = fixture("semester1_project.expected.txt");

export const INPUT_MESSAGE = "input() does not work here. Put the value in a variable at the top of your file instead.";

// Test 1: the complete semester project, exact output.
export const projectCase = { name: "1. Semester 1 project", code: PROJECT, output: PROJECT_OUTPUT, error: null };

// Test 2: rating boundaries. The last two are the argument of the semester.
const withPassword = (pw) => PROJECT.replace('test_password = "sunshine123"', `test_password = ${JSON.stringify(pw)}`);
export const ratingCases = [
  ["cat", "WEAK"],
  ["sunshine123", "WEAK"],
  ["Password1234", "OKAY"],
  ["Tr0ub4dor&3", "WEAK"],
  ["correct horse battery staple", "STRONG"],
].map(([pw, rating]) => ({ name: `2. ${pw} -> ${rating}`, code: withPassword(pw), outputIncludes: `Rating: ${rating}\n`, error: null }));

// Test 3: each error with its real message and line number. `mustShow` is the
// workbook's string; `line` is where Python reports it.
export const errorCases = [
  { name: "3. leading spaces", code: '  print("x")', mustShow: "IndentationError: unexpected indent", line: 1 },
  {
    name: "3. unindented return",
    code: 'def rate(password):\nreturn "WEAK"',
    mustShow: "IndentationError: expected an indented block",
    line: 2,
  },
  { name: "3. misspelt name", code: "print(passwrd)", mustShow: "NameError: name 'passwrd' is not defined", line: 1 },
  { name: "3. missing colon", code: 'def rate(password)\n    return "WEAK"', mustShow: "SyntaxError: expected ':'", line: 1 },
  { name: "3. = instead of ==", code: 'length = 16\nif length = 16:\n    print("sixteen")', mustShow: "SyntaxError: invalid syntax", line: 2 },
  { name: "3. len of an int", code: "print(len(12345))", mustShow: "TypeError: object of type 'int' has no len()", line: 1 },
].map((c) => ({ ...c, error: true }));

// Test 4: silent failures. No error, wrong answer, exactly like real Python.
export const silentCases = [
  {
    name: "4. print instead of return gives None",
    code: [
      "def rate(length):",
      "    if length >= 16:",
      '        print("STRONG")',
      "    else:",
      '        print("WEAK")',
      "",
      "rating = rate(20)",
      'print("Rating:", rating)',
      "",
    ].join("\n"),
    output: "STRONG\nRating: None\n",
    error: null,
  },
  {
    name: "4. >= 12 above >= 16 makes STRONG unreachable",
    code: [
      "def rate(length):",
      "    if length >= 12:",
      '        return "OKAY"',
      "    elif length >= 16:",
      '        return "STRONG"',
      "    else:",
      '        return "WEAK"',
      "",
      "print(rate(28))",
      "",
    ].join("\n"),
    output: "OKAY\n",
    error: null,
  },
  {
    name: "4. isdigit without () is always truthy",
    code: ["has_digit = False", 'for character in "abc":', "    if character.isdigit:", "        has_digit = True", "print(has_digit)", ""].join(
      "\n",
    ),
    output: "True\n",
    error: null,
  },
];

// input() must fail fast with the plain message, keeping earlier output.
export const inputCase = {
  name: "input() fails well",
  code: 'print("before")\npassword = input("Password? ")\nprint(password)',
  output: "before\n",
  inputMessage: true,
};

export const ALL_RUN_CASES = [projectCase, ...ratingCases, ...errorCases, ...silentCases, inputCase];

/** Returns a list of problems (empty = pass) for one case's result. */
export function checkResult(c, { output, error }) {
  const problems = [];
  if (c.inputMessage) {
    if (error !== INPUT_MESSAGE) problems.push(`expected the input() message, got ${JSON.stringify(error)}`);
  } else if (c.error) {
    if (!error) problems.push("expected an error, got none");
    else {
      if (!error.includes(c.mustShow)) problems.push(`error does not contain ${JSON.stringify(c.mustShow)}`);
      if (!error.includes(`File "checker.py", line ${c.line}`)) problems.push(`error does not point at checker.py line ${c.line}`);
      if (/pyodide|runner\.py|<exec>|_pyodide|worker/i.test(error)) problems.push("error still shows interpreter frames");
    }
  } else if (error) {
    problems.push(`unexpected error:\n${error}`);
  }
  if (c.output !== undefined && output !== c.output) problems.push(`output was ${JSON.stringify(output)}, expected ${JSON.stringify(c.output)}`);
  if (c.outputIncludes && !output.includes(c.outputIncludes)) problems.push(`output lacks ${JSON.stringify(c.outputIncludes)}: ${JSON.stringify(output)}`);
  return problems;
}
