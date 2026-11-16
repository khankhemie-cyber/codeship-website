/**
 * Pages children use directly: the coding tools, quizzes, workbooks and the
 * Code Hour games (/code-hour/<game>/, but not the /code-hour/ landing page,
 * which is a public page for families). No analytics or advertising tags run
 * on them, whatever the cookie choice (a child can click "Accept all" too).
 * Keep CHILD_PATH_PATTERN_SOURCE in sync with the prefixes: the root layout
 * inlines it before React loads.
 */
export const CHILD_PATH_PREFIXES = ["/tools", "/quizzes", "/workbooks", "/code-hour/*"] as const;

export const CHILD_PATH_PATTERN_SOURCE = "^/(tools|quizzes|workbooks)(/|$)|^/code-hour/[^/]+";

const CHILD_PATH_PATTERN = new RegExp(CHILD_PATH_PATTERN_SOURCE);

export function isChildPath(pathname: string | null | undefined): boolean {
  return !!pathname && CHILD_PATH_PATTERN.test(pathname);
}
