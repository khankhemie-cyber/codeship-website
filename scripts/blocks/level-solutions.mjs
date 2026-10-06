// Reference solutions for every level in src/components/tools/blocks/levels.ts.
// test-blocks.mjs runs each one and fails if a level can't be won (or can be
// won by doing nothing). These are the instructor's answer key, too.
const R = "move_right", L = "move_left", U = "move_up", D = "move_down";
const n = (k, step) => Array(k).fill(step);

export const SOLUTIONS = {
  "s1-1": [["start_tap", R, R]],
  "s1-2": [["start_tap", ...n(5, R)]],
  "s1-3": [["start_tap", ...n(4, U)]],
  "s1-4": [["start_flag", R, R, R, U, U, U]],
  "s1-5": [["start_tap", U, U, ...n(4, R), D, D]],
  "s1-6": [["start_tap", R, U, R, U, R, U, R, U]],
  "s1-7": [["start_tap", R, R, U, U, R, R, R]],
  "s2-1": [["start_tap", "shrink", ...n(6, R)]],
  "s2-2": [["start_tap", U, U, U, "shrink", ...n(7, R)]],
  "s2-3": [["start_flag", ["wait", 3], ...n(5, R)]],
  "s2-4": [["start_flag", ["wait", 3], ...n(5, U)]],
  "s2-5": [["start_flag", "shrink", ["wait", 2], ...n(7, R)]],
  "s2-6": [["start_tap", "shrink", ...n(6, R), U, U, U]],
  "s3-1": [["start_tap", ["repeat", 9, [R]]]],
  "s3-2": [["start_tap", ["repeat", 7, [U]]]],
  "s3-3": [["start_tap", ["repeat", 6, [R, U]]]],
  "s3-4": [["start_tap", ["repeat", 4, [R]]], ["start_bump", ["repeat", 5, [U]]]],
  "s3-5": [["start_tap", R, R, "hide", ...n(4, R), "show"]],
  "s3-6": [["start_tap", ["repeat", 4, [R, U]]]],
  "s3-7": [["start_tap", ["repeat", 4, [R]], "hide", R, R, "show", ["repeat", 3, [R]]]],
  "s4-1": [["start_tap", ["send_message", "blue"], ...n(6, R)]],
  "s4-2": [["start_tap", ["send_message", "blue"], ["send_message", "red"], ...n(7, R)]],
  "s4-3": [["start_tap", ["send_message", "yellow"], ["repeat", 9, [R]]]],
  "s4-4": [["start_tap", ["send_message", "green"], "shrink", ["repeat", 6, [R]], "hide", R, R, "show", R]],
  "s4-5": [["start_tap", ["send_message", "red"], ["send_message", "blue"], ["repeat", 8, [R]], ["repeat", 5, [U]], L]],
  "s4-6": [["start_tap", ["send_message", "red"], ["send_message", "yellow"], R, R, U, U, L, ["repeat", 3, [R, R]], ["repeat", 4, [U]], R]],
};

// Near misses that must NOT win: the mistake each level is built to catch.
export const NEAR_MISSES = {
  "s1-2": [["start_tap", ...n(4, R)]],
  "s1-5": [["start_tap", ...n(4, R)]],
  "s1-7": [["start_tap", ...n(5, R), U, U]],
  "s2-1": [["start_tap", ...n(6, R)]],
  "s2-3": [["start_flag", ...n(5, R)]],
  "s2-3 (too short a wait)": [["start_flag", ["wait", 2], ...n(5, R)]],
  "s2-5": [["start_flag", "shrink", ["wait", 1], ...n(7, R)]],
  "s3-1": [["start_tap", ["repeat", 8, [R]]]],
  "s3-5": [["start_tap", ...n(6, R)]],
  "s3-5 (never shows again)": [["start_tap", R, R, "hide", ...n(4, R)]],
  "s3-6": [["start_tap", ...n(4, R), ...n(4, U)]],
  "s4-1": [["start_tap", ["send_message", "red"], ...n(6, R)]],
  "s4-2": [["start_tap", ["send_message", "blue"], ...n(7, R)]],
  "s4-6": [["start_tap", ["send_message", "red"], ["send_message", "yellow"], R, R, U, U, ["repeat", 3, [R, R]], ["repeat", 4, [U]], R]],
};
