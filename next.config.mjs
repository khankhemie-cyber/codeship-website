/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // Inlined into server and client bundles alike, so date-gated UI (the
  // November free trial) renders the same HTML on both before it re-checks
  // the visitor's clock.
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "videos.pexels.com",
      },
    ],
  },
  // The Trinidad landing pages were reorganized from five marketing-angle slugs
  // into the four grade-band program pages (/tt/explorers, /tt/builders,
  // /tt/developers, /tt/engineers). Redirect the retired slugs to the /tt
  // program index so old links and any indexed URLs still resolve.
  // public/_headers covers every static page, but Cloudflare Pages does not
  // apply it to responses from Functions. These are the edge-rendered routes
  // (runtime = "edge"), so they get the same security headers here. Keep the
  // values in sync with public/_headers, and do not widen the sources to
  // static pages, or those responses would carry each header twice.
  async headers() {
    const security = [
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)" },
    ];
    return ["/register/", "/waitlist/", "/api/:path*"].map((source) => ({ source, headers: security }));
  },
  async redirects() {
    const retiredTrinidadSlugs = [
      "online-coding-classes",
      "math-language-arts-coding",
      "sea-digital-skills",
      "computer-classes-for-kids",
      "online-stem-classes",
    ];
    return [
      ...retiredTrinidadSlugs.map((slug) => ({
        source: `/tt/${slug}`,
        destination: "/tt",
        permanent: true,
      })),
      // Merged into their main pages during the 2026 site cleanup.
      { source: "/programs/weekly-classes", destination: "/programs", permanent: true },
      { source: "/programs/school-workshops", destination: "/schools", permanent: true },
      // The student editor was renamed from "Web Playground" to "CODEship Launchpad".
      // Browsers carry the #code=... fragment across the redirect, so saved links still open.
      { source: "/tools/web-playground", destination: "/tools/launchpad", permanent: true },
    ];
  },
};

export default nextConfig;
