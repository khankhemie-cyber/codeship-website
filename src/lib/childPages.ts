/**
 * Pages children use directly: the coding tools, quizzes, workbooks and the
 * Ship It! Arcade games (/ship-it/<game>/, but not the /ship-it/ landing page,
 * which is a public page for families). No analytics or advertising tags run
 * on them, whatever the cookie choice (a child can click "Accept all" too).
 * Keep CHILD_PATH_PATTERN_SOURCE in sync with the prefixes: the root layout
 * inlines it before React loads.
 */
export const CHILD_PATH_PREFIXES = ["/tools", "/quizzes", "/workbooks", "/ship-it/*"] as const;

export const CHILD_PATH_PATTERN_SOURCE = "^/(tools|quizzes|workbooks)(/|$)|^/ship-it/[^/]+";

const CHILD_PATH_PATTERN = new RegExp(CHILD_PATH_PATTERN_SOURCE);

export function isChildPath(pathname: string | null | undefined): boolean {
  return !!pathname && CHILD_PATH_PATTERN.test(pathname);
}
