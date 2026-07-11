/**
 * Upserts the curriculum content data files into Supabase via the service-role
 * key. Manual step — run this yourself once SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * point at a real project with supabase/schema.sql already applied:
 *
 *   npm run seed:academy
 *
 * Idempotent (upsert on primary key) — safe to re-run after editing content.
 */
import { createClient } from "@supabase/supabase-js";
import { CURRICULUM_LEVELS } from "../src/data/academy/curriculum";

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — see .env.example.");
    process.exit(1);
  }
  const supabase = createClient(url, serviceRoleKey);

  for (const level of CURRICULUM_LEVELS) {
    console.log(`Seeding ${level.level}…`);

    const { error: levelError } = await supabase.from("levels").upsert({
      slug: level.level,
      name: level.name,
      grade_band: level.gradeBand,
      coding_space: level.codingSpace,
      accent_colour: level.accentColour,
      order_index: level.orderIndex,
    });
    if (levelError) throw levelError;

    const { error: theoryError } = await supabase.from("theory_units").upsert(
      level.theoryUnits.map((t) => ({
        id: t.id,
        level: t.level,
        semester: t.semester,
        title: t.title,
        body_md: t.bodyMd,
      }))
    );
    if (theoryError) throw theoryError;

    const { error: lessonsError } = await supabase.from("lessons").upsert(
      level.lessons.map((l) => ({
        id: l.id,
        level: l.level,
        semester: l.semester,
        class_number: l.classNumber,
        order_index: l.orderIndex,
        title: l.title,
        objective: l.objective,
        align: l.align ?? null,
        warm_up: l.warmUp ?? null,
        teach: l.teach ?? null,
        activity: l.activity ?? null,
        practice: l.practice ?? null,
        reflect: l.reflect ?? null,
        assess: l.assess ?? null,
        home: l.home ?? null,
        accommodation_notes: l.accommodationNotes ?? {},
      }))
    );
    if (lessonsError) throw lessonsError;

    const { error: blocksError } = await supabase.from("block_puzzles").upsert(
      level.blockPuzzles.map((p) => ({
        id: p.id,
        lesson_id: p.lessonId,
        block_set: p.blockSet,
        goal: p.goal,
        par: p.par,
        starter: p.starter ?? null,
      }))
    );
    if (blocksError) throw blocksError;

    const { error: projectsError } = await supabase.from("projects").upsert(
      level.projects.map((p) => ({
        id: p.id,
        level: p.level,
        semester: p.semester,
        title: p.title,
        brief: p.brief,
        success_criteria: p.successCriteria,
        rubric: p.rubric,
        extension: p.extension ?? null,
      }))
    );
    if (projectsError) throw projectsError;

    const { error: quizzesError } = await supabase.from("quizzes").upsert(
      level.quizzes.map((q) => ({
        id: q.id,
        level: q.level,
        semester: q.semester,
        quiz_number: q.quizNumber,
        kind: q.kind,
      }))
    );
    if (quizzesError) throw quizzesError;

    const questionRows = level.quizzes.flatMap((q) =>
      q.questions.map((question, index) => ({
        id: `${q.id}-q${index + 1}`,
        quiz_id: q.id,
        order_index: index + 1,
        prompt: question.prompt,
        choices: question.choices,
        answer: question.answer,
        explanation: question.explanation ?? null,
      }))
    );
    const { error: questionsError } = await supabase.from("quiz_questions").upsert(questionRows);
    if (questionsError) throw questionsError;

    const { error: capstoneError } = await supabase.from("capstones").upsert({
      id: level.capstone.id,
      level: level.capstone.level,
      title: level.capstone.title,
      description: level.capstone.description,
      rubric: level.capstone.rubric,
      pass_rule: level.capstone.passRule,
    });
    if (capstoneError) throw capstoneError;
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
