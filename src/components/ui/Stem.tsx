import type { ProgramSlug } from "@/data/locations";

/**
 * STEM visual language, drawn from the circuit-brain mark in the logo:
 * circuit traces with round nodes, a faint dot grid, and one icon per level.
 * All decorative pieces are aria-hidden.
 */

/** Circuit traces ending in nodes. Position it with className (absolute, size, opacity). */
export function CircuitLines({ className = "", color = "#F4D734" }: { className?: string; color?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox="0 0 240 240"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M0 40h70l20 20v40h60" />
      <path d="M0 90h40l20 20h50" />
      <path d="M0 150h90l20-20h40" />
      <path d="M0 200h60l20-20v-30" />
      <path d="M120 0v30l20 20h60" />
      <path d="M200 240v-50l-20-20h-40" />
      <circle cx="150" cy="100" r="6" fill={color} />
      <circle cx="110" cy="110" r="6" />
      <circle cx="150" cy="130" r="6" />
      <circle cx="80" cy="150" r="6" fill={color} />
      <circle cx="200" cy="50" r="6" />
      <circle cx="140" cy="170" r="6" fill={color} />
    </svg>
  );
}

/** A small "</>" mark used beside eyebrows and labels. */
export function CodeMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" strokeLinecap="square" />
    </svg>
  );
}

const LEVEL_PATHS: Record<ProgramSlug, React.ReactNode> = {
  // Snap-together blocks
  explorers: (
    <>
      <rect x="3" y="12" width="8" height="8" />
      <rect x="13" y="12" width="8" height="8" />
      <rect x="8" y="3" width="8" height="8" />
    </>
  ),
  // Markup tag
  builders: <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />,
  // Code braces
  developers: (
    <path d="M9 3H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h2M15 3h2a2 2 0 012 2v4a2 2 0 002 2 2 2 0 00-2 2v4a2 2 0 01-2 2h-2" />
  ),
  // Chip (Python, AI)
  engineers: (
    <>
      <rect x="6" y="6" width="12" height="12" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
};

export function LevelIcon({ slug, className = "" }: { slug: ProgramSlug; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {LEVEL_PATHS[slug]}
    </svg>
  );
}

/** Photos of kids for each level; the same classroom set used across the site. */
export const LEVEL_PHOTO: Record<ProgramSlug, { src: string; alt: string }> = {
  explorers: {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    alt: "Young children learning together in a classroom",
  },
  builders: {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    alt: "Kids working on a project together",
  },
  developers: {
    src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    alt: "Students focused on a coding lesson",
  },
  engineers: {
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    alt: "A robot built and programmed by students",
  },
};
