/**
 * Hand-written to match supabase/schema.sql (Phase 0). No live project exists yet
 * to run `supabase gen types` against — replace this file with generated types
 * once a real project is provisioned and the schema has been applied.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type LevelSlug = "explorers" | "builders" | "developers" | "engineers";
export type Semester = "1" | "2" | "3" | "4" | "capstone";

export interface RubricCriterion {
  criterion: string;
  description: string;
}

export interface AccommodationNotes {
  adhd?: string;
  asd?: string;
  dyslexia?: string;
  anxiety?: string;
  gifted?: string;
}

export type PassRule = { type: "min_points"; min: number; of: number } | { type: "all_criteria" };

// Phase 1: mastery graph (mirrors src/data/academy/curriculum/types.ts — kept
// independent since this file describes the Supabase wire shape, not app types).
export type Strand = "programming" | "networks" | "data" | "society" | "design";
export interface Misconception {
  id: string;
  name: string;
  signal: string;
}
export interface LessonBranches {
  stretch: string;
  support: string;
}
export interface LessonRubricLevel {
  level: "emerging" | "developing" | "secure";
  criteria: string;
}
export interface ProvincialTags {
  ON: string[];
  BC: string[];
  AB: string[];
  QC: string[];
}

type TableDef<Row extends Record<string, unknown>> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      levels: TableDef<{
        slug: LevelSlug;
        name: string;
        grade_band: string;
        coding_space: string;
        accent_colour: string;
        order_index: number;
      }>;
      theory_units: TableDef<{
        id: string;
        level: LevelSlug;
        semester: Semester;
        title: string;
        body_md: string;
      }>;
      lessons: TableDef<{
        id: string;
        level: LevelSlug;
        semester: Semester;
        class_number: number;
        order_index: number;
        title: string;
        objective: string;
        align: string | null;
        warm_up: string | null;
        teach: string | null;
        activity: string | null;
        practice: string | null;
        reflect: string | null;
        assess: string | null;
        home: string | null;
        accommodation_notes: AccommodationNotes;
        // Phase 1: mastery graph
        strand: Strand | null;
        capstone_gate: boolean;
        prerequisites: string[];
        misconceptions: Misconception[];
        branches: LessonBranches | null;
        mastery_rubric: LessonRubricLevel[];
        provincial_tags: ProvincialTags | null;
        locales: string[];
      }>;
      block_puzzles: TableDef<{
        id: string;
        lesson_id: string;
        block_set: Json;
        goal: Json;
        par: number;
        starter: Json | null;
      }>;
      projects: TableDef<{
        id: string;
        level: LevelSlug;
        semester: Semester;
        title: string;
        brief: string;
        success_criteria: string;
        rubric: RubricCriterion[];
        extension: string | null;
      }>;
      quizzes: TableDef<{
        id: string;
        level: LevelSlug;
        semester: Semester;
        quiz_number: number;
        kind: "formative" | "summative";
      }>;
      quiz_questions: TableDef<{
        id: string;
        quiz_id: string;
        order_index: number;
        prompt: string;
        choices: string[];
        answer: string;
        explanation: string | null;
      }>;
      capstones: TableDef<{
        id: string;
        level: LevelSlug;
        title: string;
        description: string;
        rubric: RubricCriterion[];
        pass_rule: PassRule;
      }>;
      schools: TableDef<{ id: string; name: string }>;
      school_admins: TableDef<{ id: string; auth_user_id: string; school_id: string; display_name: string }>;
      teachers: TableDef<{
        id: string;
        auth_user_id: string;
        school_id: string | null;
        display_name: string;
      }>;
      parents: TableDef<{ id: string; auth_user_id: string; display_name: string }>;
      students: TableDef<{
        id: string;
        auth_user_id: string | null;
        level: LevelSlug;
        display_name: string;
        join_pin_hash: string;
      }>;
      parent_students: TableDef<{ parent_id: string; student_id: string }>;
      classes: TableDef<{
        id: string;
        teacher_id: string;
        school_id: string | null;
        name: string;
        level: LevelSlug;
        semester: Semester;
        class_code: string;
      }>;
      enrollments: TableDef<{ student_id: string; class_id: string }>;
      mastery_state: TableDef<{
        student_id: string;
        lesson_id: string;
        status: "not_started" | "in_progress" | "mastered";
        proficiency_level: "support" | "core" | "stretch" | null;
        misconception_flags: string[];
        last_attempt_at: string | null;
      }>;
      lesson_attempts: TableDef<{
        id: string;
        student_id: string;
        lesson_id: string;
        attempt_data: Json;
        created_at: string;
      }>;
      project_submissions: TableDef<{
        student_id: string;
        project_id: string;
        self_check: Record<string, boolean>;
        status: "in_progress" | "submitted" | "passed";
        marked_by: string | null;
        updated_at: string;
      }>;
      quiz_results: TableDef<{
        student_id: string;
        quiz_id: string;
        score: number;
        total: number;
        passed: boolean;
        completed_at: string;
      }>;
      capstone_results: TableDef<{
        student_id: string;
        capstone_id: string;
        rubric_scores: Record<string, number>;
        passed: boolean;
        presented_at: string | null;
      }>;
      certificates: TableDef<{
        id: string;
        student_id: string;
        level: LevelSlug;
        capstone_id: string;
        issued_at: string;
      }>;
      session_notes: TableDef<{
        id: string;
        class_id: string;
        teacher_id: string;
        note: string;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
