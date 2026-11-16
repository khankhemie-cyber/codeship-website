/**
 * Ship It! Arcade games (/ship-it/<game>/) are full-screen apps with their own
 * top bar, so they skip the main site Navigation/Footer. They are public and
 * indexable, but children play them directly, so they are child pages: see
 * CHILD_PATH_PATTERN_SOURCE in src/lib/childPages.ts (no analytics or ads).
 */
export default function GamesLayout({ children }: { children: React.ReactNode }) {
  // pb-40 keeps the last controls scrollable above the fixed cookie banner.
  return <div className="ship-it min-h-screen bg-[#161827] pb-40 text-white antialiased">{children}</div>;
}
