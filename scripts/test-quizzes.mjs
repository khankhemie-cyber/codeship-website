// Checks the quiz answer keys in src/data/quizzes.ts.   npm run test:quizzes
// Every "choice" answer must point at a real option, and the right answers must
// not follow a pattern a student could guess: in each quiz, no one position may
// hold more than half of the multiple-choice answers, and the same position may
// not be the answer three questions in a row. True/false questions are left out
// of the position checks, since True always comes first.
import "./blocks/ts-resolve.mjs";
const { QUIZZES } = await import("../src/data/quizzes.ts");

let failed = 0;
for (const quiz of QUIZZES) {
  const name = `${quiz.program}/${quiz.slug}`;
  const problems = [];
  const ids = new Set();
  const positions = [];
  for (const q of quiz.questions) {
    if (ids.has(q.id)) problems.push(`duplicate id ${q.id}`);
    ids.add(q.id);
    if (q.type !== "choice") continue;
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
      problems.push(`${q.id}: answer ${q.answer} is not one of its ${q.options.length} options`);
    }
    if (new Set(q.options).size !== q.options.length) problems.push(`${q.id}: repeated option`);
    const trueFalse = q.options.length === 2 && q.options[0] === "True" && q.options[1] === "False";
    if (!trueFalse) positions.push([q.id, q.answer]);
  }
  const counts = {};
  for (const [, a] of positions) counts[a] = (counts[a] ?? 0) + 1;
  for (const [a, n] of Object.entries(counts)) {
    if (n > positions.length / 2) problems.push(`option ${Number(a) + 1} is the answer ${n} times out of ${positions.length}`);
  }
  for (let i = 2; i < positions.length; i++) {
    const [id, a] = positions[i];
    if (a === positions[i - 1][1] && a === positions[i - 2][1]) problems.push(`${positions[i - 2][0]}–${id}: option ${a + 1} three in a row`);
  }
  const summary = positions.map(([, a]) => "ABCD"[a]).join("");
  if (problems.length) {
    failed++;
    console.log(`FAIL  ${name}  ${summary}\n      ${problems.join("\n      ")}`);
  } else console.log(`ok    ${name}  ${summary}`);
}
if (failed) process.exit(1);
