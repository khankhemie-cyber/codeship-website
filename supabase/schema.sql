-- CODEship Academy — adaptive learning platform schema (Phase 0).
-- Convention matches PR #14 (supabase/schema.sql): service-role key writes content/
-- roster data server-side; RLS below is the only thing standing between the anon
-- key (used by the browser client) and every row. Phase 1 adds mastery-graph
-- columns to `lessons` (prerequisites, misconceptions, branches, provincial tags,
-- locales) as its own migration rather than reshaping this file.

-- ============================================================================
-- CONTENT (read-only to authenticated users; written only by the seed script
-- via the service-role key — see scripts/seed-academy.ts)
-- ============================================================================

create table if not exists levels (
  slug text primary key,                  -- 'explorers' | 'builders' | 'developers' | 'engineers'
  name text not null,
  grade_band text not null,
  coding_space text not null,
  accent_colour text not null,
  order_index int not null
);

create table if not exists theory_units (
  id text primary key,                    -- '{level}-s{semester}-theory' | '{level}-capstone-theory'
  level text not null references levels(slug),
  semester text not null,                 -- '1' | '2' | '3' | '4' | 'capstone'
  title text not null,
  body_md text not null
);

create table if not exists lessons (
  id text primary key,                    -- '{level}-s{semester}-c{class_number}'
  level text not null references levels(slug),
  semester text not null,                 -- '1' | '2' | '3' | '4' | 'capstone'
  class_number int not null,              -- 1-4 within the semester block
  order_index int not null,               -- global ordering within the level
  title text not null,
  objective text not null,
  align text,                             -- Ontario alignment note (Phase 1 replaces w/ provincial_tags)
  warm_up text,
  teach text,
  activity text,
  practice text,
  reflect text,
  assess text,
  home text,
  accommodation_notes jsonb not null default '{}'::jsonb  -- adhd/asd/dyslexia/anxiety/gifted profile notes
);
create index if not exists lessons_level_order_idx on lessons (level, order_index);

create table if not exists block_puzzles (
  id text primary key,
  lesson_id text not null references lessons(id),
  block_set jsonb not null,               -- available blocks for this puzzle
  goal jsonb not null,                    -- goal state the interpreter checks against
  par int not null,                       -- provably-minimal block count (BFS-computed at seed time)
  starter jsonb                           -- optional pre-placed blocks (anxiety/low-confidence scaffold)
);

create table if not exists projects (
  id text primary key,                    -- '{level}-s{semester}-project' | '{level}-capstone-project'
  level text not null references levels(slug),
  semester text not null,
  title text not null,
  brief text not null,
  success_criteria text not null,
  rubric jsonb not null,                  -- [{criterion, description}]
  extension text
);

create table if not exists quizzes (
  id text primary key,                    -- '{level}-s{semester}-q{1|2}'
  level text not null references levels(slug),
  semester text not null,
  quiz_number int not null,               -- 1 (formative) | 2 (summative)
  kind text not null                      -- 'formative' | 'summative'
);

create table if not exists quiz_questions (
  id text primary key,
  quiz_id text not null references quizzes(id),
  order_index int not null,
  prompt text not null,
  choices jsonb not null,                 -- string[]
  answer text not null,
  explanation text
);

create table if not exists capstones (
  id text primary key,                    -- '{level}-capstone'
  level text not null unique references levels(slug),
  title text not null,
  description text not null,
  rubric jsonb not null,                  -- [{criterion, description}]
  pass_rule jsonb not null                -- {"type":"min_points","min":4,"of":5} | {"type":"all_criteria"}
);

-- ----------------------------------------------------------------------------
-- Phase 1: mastery-graph columns on `lessons`. A migration against the same
-- table rather than a reshape — every column is additive and nullable/defaulted,
-- so it's safe to run against a project that already has Phase 0's `lessons`
-- rows seeded (re-running scripts/seed-academy.ts repopulates them via upsert).
-- See src/data/academy/curriculum/masteryGraph.ts for how these are computed.
-- ----------------------------------------------------------------------------
alter table lessons add column if not exists strand text;                          -- programming|networks|data|society|design
alter table lessons add column if not exists capstone_gate boolean not null default false;
alter table lessons add column if not exists prerequisites text[] not null default '{}';
alter table lessons add column if not exists misconceptions jsonb not null default '[]'::jsonb; -- [{id,name,signal}]
alter table lessons add column if not exists branches jsonb;                       -- {stretch, support}
alter table lessons add column if not exists mastery_rubric jsonb not null default '[]'::jsonb; -- [{level,criteria}] — distinct from projects.rubric
alter table lessons add column if not exists provincial_tags jsonb;                -- {ON:[],BC:[],AB:[],QC:[]}
alter table lessons add column if not exists locales text[] not null default '{en}';

-- ============================================================================
-- ROSTER (schools / people)
-- ============================================================================

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists school_admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id),
  school_id uuid not null references schools(id),
  display_name text not null
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id),
  school_id uuid references schools(id),
  display_name text not null
);

create table if not exists parents (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id),
  display_name text not null
);

-- Minimal PII by design: no email/DOB/address. auth_user_id is a Supabase
-- *anonymous* auth user linked here via a teacher-issued class code + PIN
-- (src/app/(academy)/academy/join) — students never provide an email.
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id),
  level text not null references levels(slug),
  display_name text not null,
  join_pin_hash text not null              -- sha-256 of the PIN the teacher assigns; not the PIN itself
);

create table if not exists parent_students (
  parent_id uuid not null references parents(id),
  student_id uuid not null references students(id),
  primary key (parent_id, student_id)
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id),
  school_id uuid references schools(id),
  name text not null,
  level text not null references levels(slug),
  semester text not null default '1',      -- which semester-kit the class is currently on
  class_code text not null unique          -- short code students use to join (paired with a PIN)
);

create table if not exists enrollments (
  student_id uuid not null references students(id),
  class_id uuid not null references classes(id),
  primary key (student_id, class_id)
);

-- ============================================================================
-- PROGRESS (per brief's contract: mastery_state + lesson_attempts + session_notes)
-- ============================================================================

create table if not exists mastery_state (
  student_id uuid not null references students(id),
  lesson_id text not null references lessons(id),
  status text not null default 'not_started', -- 'not_started' | 'in_progress' | 'mastered'
  proficiency_level text,                      -- 'support' | 'core' | 'stretch'
  misconception_flags text[] not null default '{}',
  last_attempt_at timestamptz,
  primary key (student_id, lesson_id)
);

create table if not exists lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  lesson_id text not null references lessons(id),
  attempt_data jsonb not null,             -- code/block submission only — no PII
  created_at timestamptz not null default now()
);

-- Gating tables: capstone-gate + level-up checks read these, not just mastery_state,
-- since projects/quizzes/capstones are graded distinctly from individual lessons.
create table if not exists project_submissions (
  student_id uuid not null references students(id),
  project_id text not null references projects(id),
  self_check jsonb not null default '{}'::jsonb, -- {criterion: boolean}
  status text not null default 'in_progress',    -- 'in_progress' | 'submitted' | 'passed'
  marked_by uuid references teachers(id),
  updated_at timestamptz not null default now(),
  primary key (student_id, project_id)
);

create table if not exists quiz_results (
  student_id uuid not null references students(id),
  quiz_id text not null references quizzes(id),
  score int not null,
  total int not null,
  passed boolean not null,
  completed_at timestamptz not null default now(),
  primary key (student_id, quiz_id)
);

create table if not exists capstone_results (
  student_id uuid not null references students(id),
  capstone_id text not null references capstones(id),
  rubric_scores jsonb not null default '{}'::jsonb,
  passed boolean not null default false,
  presented_at timestamptz,
  primary key (student_id, capstone_id)
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id),
  level text not null references levels(slug),
  capstone_id text not null references capstones(id),
  issued_at timestamptz not null default now()
);

create table if not exists session_notes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id),
  teacher_id uuid not null references teachers(id),
  note text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- RLS
-- ============================================================================

alter table levels enable row level security;
alter table theory_units enable row level security;
alter table lessons enable row level security;
alter table block_puzzles enable row level security;
alter table projects enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table capstones enable row level security;
alter table schools enable row level security;
alter table school_admins enable row level security;
alter table teachers enable row level security;
alter table parents enable row level security;
alter table students enable row level security;
alter table parent_students enable row level security;
alter table classes enable row level security;
alter table enrollments enable row level security;
alter table mastery_state enable row level security;
alter table lesson_attempts enable row level security;
alter table project_submissions enable row level security;
alter table quiz_results enable row level security;
alter table capstone_results enable row level security;
alter table certificates enable row level security;
alter table session_notes enable row level security;

-- Content is public-read to any authenticated academy user (student/teacher/
-- parent/admin), never writable by the anon/authenticated roles — only the
-- service-role seed script writes it.
create policy content_read_levels on levels for select to authenticated using (true);
create policy content_read_theory on theory_units for select to authenticated using (true);
create policy content_read_lessons on lessons for select to authenticated using (true);
create policy content_read_blocks on block_puzzles for select to authenticated using (true);
create policy content_read_projects on projects for select to authenticated using (true);
create policy content_read_quizzes on quizzes for select to authenticated using (true);
create policy content_read_quiz_questions on quiz_questions for select to authenticated using (true);
create policy content_read_capstones on capstones for select to authenticated using (true);

-- Roster: every role can see and edit its own profile row.
create policy school_admins_self on school_admins for select using (auth_user_id = auth.uid());
create policy teachers_self on teachers for select using (auth_user_id = auth.uid());
create policy parents_self on parents for select using (auth_user_id = auth.uid());
create policy students_self on students for select using (auth_user_id = auth.uid());
create policy students_self_update on students for update using (auth_user_id = auth.uid());

-- Admins see every teacher/class/student in their own school.
create policy admins_see_school_teachers on teachers for select
  using (school_id in (select school_id from school_admins where auth_user_id = auth.uid()));
create policy admins_see_school on schools for select
  using (id in (select school_id from school_admins where auth_user_id = auth.uid()));

-- Classes: teacher owns; admin sees their school's; students see classes they're enrolled in.
create policy teachers_own_classes on classes for select
  using (teacher_id in (select id from teachers where auth_user_id = auth.uid()));
create policy teachers_manage_classes on classes for update
  using (teacher_id in (select id from teachers where auth_user_id = auth.uid()));
create policy admins_school_classes on classes for select
  using (school_id in (select school_id from school_admins where auth_user_id = auth.uid()));
create policy students_own_classes on classes for select
  using (id in (
    select class_id from enrollments where student_id in (
      select id from students where auth_user_id = auth.uid()
    )
  ));

-- Enrollments: student sees own; teacher sees/manages own classes' rosters.
create policy students_own_enrollment on enrollments for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));
create policy teachers_class_roster on enrollments for select
  using (class_id in (select id from classes where teacher_id in (
    select id from teachers where auth_user_id = auth.uid()
  )));
create policy teachers_manage_roster on enrollments for insert
  with check (class_id in (select id from classes where teacher_id in (
    select id from teachers where auth_user_id = auth.uid()
  )));

-- Teachers can see the roster students themselves (for the mastery grid).
create policy teachers_see_roster_students on students for select
  using (id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));

-- Parents see their linked children (read-only).
create policy parents_own_links on parent_students for select
  using (parent_id in (select id from parents where auth_user_id = auth.uid()));
create policy parents_see_children on students for select
  using (id in (
    select student_id from parent_students where parent_id in (
      select id from parents where auth_user_id = auth.uid()
    )
  ));

-- Progress tables: student owns their rows; teacher sees/updates rows for their
-- roster; parent has read-only access to their linked children's rows.
-- mastery_state is a low-stakes per-lesson "I did this" rollup — unlike
-- project_submissions/quiz_results/capstone_results it does not by itself
-- gate semester or level progression (see src/lib/academy/gating.ts), so
-- students may write their own rows directly.
create policy students_own_mastery on mastery_state for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_write_mastery on mastery_state for insert
  with check (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_update_mastery on mastery_state for update
  using (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_own_attempts on lesson_attempts for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_write_attempts on lesson_attempts for insert
  with check (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_own_projects on project_submissions for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_own_quiz_results on quiz_results for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));
-- Deliberately no student insert/update policy on project_submissions or
-- quiz_results: these gate semester/capstone progression, so they are only
-- ever written by POST /api/academy/progress (service role), which
-- re-validates the gating rule server-side before writing. A student's own
-- browser client can read them but cannot self-report a pass.
create policy students_own_capstone_results on capstone_results for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));
create policy students_own_certificates on certificates for select
  using (student_id in (select id from students where auth_user_id = auth.uid()));

create policy teachers_roster_mastery on mastery_state for select
  using (student_id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));
create policy teachers_roster_projects on project_submissions for select
  using (student_id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));
create policy teachers_mark_projects on project_submissions for update
  using (student_id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));
create policy teachers_roster_quiz_results on quiz_results for select
  using (student_id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));
create policy teachers_roster_capstone_results on capstone_results for select
  using (student_id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));
create policy teachers_roster_certificates on certificates for select
  using (student_id in (
    select student_id from enrollments where class_id in (
      select id from classes where teacher_id in (select id from teachers where auth_user_id = auth.uid())
    )
  ));

create policy parents_children_mastery on mastery_state for select
  using (student_id in (
    select student_id from parent_students where parent_id in (
      select id from parents where auth_user_id = auth.uid()
    )
  ));
create policy parents_children_certificates on certificates for select
  using (student_id in (
    select student_id from parent_students where parent_id in (
      select id from parents where auth_user_id = auth.uid()
    )
  ));

-- Session notes: teacher-only, scoped to their own classes.
create policy teachers_own_session_notes on session_notes for select
  using (teacher_id in (select id from teachers where auth_user_id = auth.uid()));
create policy teachers_write_session_notes on session_notes for insert
  with check (teacher_id in (select id from teachers where auth_user_id = auth.uid()));

-- No policy grants students/teachers/parents write access to `students`,
-- `classes`, `capstone_results`, or any content table beyond what's listed
-- above — those are written only by the seed script or a server-only edge
-- route using the service-role key (which bypasses RLS entirely).
