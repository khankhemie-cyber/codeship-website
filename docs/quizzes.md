# Online quizzes

Students take quizzes at **/quizzes/** and submit them online. Instructors see the results at **/quizzes/results/**.

## How it works

- **Students** open `/quizzes/`, choose their quiz, and enter their program's **class password**. This is the same
  password as the workbooks (`WORKBOOK_PASSWORD_<PROGRAM>`), and a device that already unlocked the workbook skips it.
  They type their name (and their class, if they want), answer the questions, and press **Submit my quiz**.
- **Marking:** the server marks the multiple-choice and true/false questions. The student sees their score and which
  questions they got right, but not the correct answers. The answer key never reaches the browser. Written answers
  go to the instructor without a mark.
- **Instructors** open `/quizzes/results/`, enter `QUIZ_INSTRUCTOR_PASSWORD`, choose a quiz, and can filter by class.
  For each student they can open the answers (wrong choices show the right answer), download everything as a CSV
  for Excel or Google Sheets, or delete a submission (for example a test run).
- Unfinished answers are saved on the student's device, so a refresh does not lose them.

## One-time setup (Cloudflare dashboard)

1. **Create the database:** Workers & Pages → D1 → *Create database*, named for example `codeship-quizzes`.
   You don't need to create the table yourself, because the site creates it on the first submission.
   (`migrations/0001_quiz_submissions.sql` has the same schema if you'd rather run it in the D1 console.)
2. **Bind it to the site:** Workers & Pages → *codeship-website* → Settings → Bindings → *Add* → D1 database.
   Variable name **`QUIZ_DB`**, database `codeship-quizzes`. Add it for Production (and Preview if you test there).
3. **Instructor password:** Settings → Variables and Secrets → add **`QUIZ_INSTRUCTOR_PASSWORD`** (type *Secret*).
4. **Class passwords:** these are the existing `WORKBOOK_PASSWORD_EXPLORERS`, `_BUILDERS`, `_DEVELOPERS`, and
   `_ENGINEERS` variables.
5. **Redeploy** so the binding and variables take effect.

Until steps 1–3 are done, students see "Quizzes are not switched on yet" and the results page shows a setup message.

## Editing quizzes

All quizzes are in `src/data/quizzes.ts`: two per program for Semester 1 (week 4 and week 8). Each question is either
`"choice"` (with `options` and `answer`, the 0-based index of the correct option) or `"short"` (a written answer).
Add a quiz by adding an entry. Its page appears at `/quizzes/<program>/<slug>/`.

Don't change the question `id`s of a quiz that students have already taken. Saved answers are stored by id.

Note that the repository is public, so the answer key in `quizzes.ts` can be read on GitHub. That is fine for low-stakes
class check-ins. Don't use these quizzes for anything that has to be cheat-proof.
