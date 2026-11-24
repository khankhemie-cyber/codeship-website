/**
 * Game pictures: Microsoft Fluent Emoji 3D artwork (MIT licence), saved in
 * public/art as <codepoints>.webp. Used instead of system emoji so every
 * device shows the same illustrated style.
 */

/** Artwork files available in public/art (code points, no FE0F). */
const AVAILABLE = new Set(["1f308", "1f30b", "1f30d", "1f319", "1f31f", "1f331", "1f33f", "1f342", "1f349", "1f34c", "1f34e", "1f353", "1f354", "1f355", "1f35e", "1f369", "1f36a", "1f36c", "1f37e", "1f381", "1f389", "1f3a2", "1f3a8", "1f3ae", "1f3af", "1f3b2", "1f3b5", "1f3b6", "1f3c0", "1f3c1", "1f3c6", "1f3d7", "1f3f7", "1f409", "1f40d", "1f41e", "1f422", "1f423", "1f431", "1f436", "1f439", "1f43c", "1f446", "1f44b", "1f44d", "1f44e", "1f451", "1f466", "1f467", "1f476", "1f47e", "1f48e", "1f4a1", "1f4a6", "1f4ac", "1f4ad", "1f4c4", "1f4ca", "1f4cb", "1f4ce", "1f4cf", "1f4d3", "1f4d8", "1f4da", "1f4dc", "1f4e5", "1f4e6", "1f4f0", "1f4f1", "1f500", "1f501", "1f50a", "1f50b", "1f50d", "1f50e", "1f510", "1f511", "1f512", "1f522", "1f524", "1f525", "1f529", "1f537", "1f575", "1f58d", "1f5bc", "1f5d1", "1f600", "1f604", "1f60e", "1f621", "1f622", "1f634", "1f635-200d-1f4ab", "1f642", "1f648", "1f680", "1f68c", "1f699", "1f6f0", "1f914", "1f916", "1f937", "1f955", "1f95a", "1f964", "1f96b", "1f973", "1f984", "1f98a", "1f9c1", "1f9d0", "1f9d1-200d-1f680", "1f9d1-200d-2708", "1f9d2", "1f9e0", "1f9e9", "1f9ea", "1f9f1", "1f9f4", "1f9f9", "1f9fd", "1fa79", "1faa3", "1fab4", "1fad9", "2194", "2328", "23f0", "2600", "2615", "267b", "2696", "26a0", "26a1", "26bd", "2705", "2709", "270f", "2728", "274c", "2764", "2795", "2796", "2b50"]);

const SEQ = /(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2194}-\u{21AA}\u{23F0}\u{231A}\u{2328}\u{23E9}-\u{23FA}\u{2B06}\u{2934}\u{2935}]\u{FE0F}?(?:\u{200D}[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\u{FE0F}?)*)/gu;

/** "♻️" -> "267b"; null when there is no artwork for it. */
export function artName(emoji: string): string | null {
  const name = Array.from(emoji)
    .filter((c) => c !== "\uFE0F")
    .map((c) => c.codePointAt(0)!.toString(16).padStart(4, "0"))
    .join("-");
  return AVAILABLE.has(name) ? name : null;
}

/** One picture. Decorative by default; pass `alt` when it carries meaning. */
export function Art({ e, size = 32, alt = "", className = "" }: { e: string; size?: number | string; alt?: string; className?: string }) {
  const name = artName(e);
  if (!name) return null;
  const dim = typeof size === "number" ? `${size}px` : size;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/art/${name}.webp`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      loading="lazy"
      className={`inline-block select-none align-[-0.2em] ${className}`}
      style={{ width: dim, height: dim }}
    />
  );
}

/**
 * Text that may contain emoji: each emoji with artwork becomes an inline
 * picture at text size; any without artwork is dropped.
 */
export function ArtText({ text, size = "1.15em" }: { text: string; size?: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(SEQ)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(<Art key={i++} e={m[0]} size={size} className="mx-[0.05em]" />);
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Text with every emoji removed (for aria labels, titles and plain strings). */
export function stripEmoji(text: string) {
  return text.replace(SEQ, "").replace(/\s{2,}/g, " ").trim();
}

/** A rounded, filled star (replaces the ★ character). */
export function StarIcon({ on = true, className = "h-[1em] w-[1em]" }: { on?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
        fill={on ? "#F4B400" : "rgba(0,21,50,0.12)"}
        stroke={on ? "#C98A00" : "transparent"}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
