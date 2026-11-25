import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Port CODEship's own code is scrambled in production browser builds, so a
 * copy of the downloaded files is hard to read or reuse. Only the game's
 * folders are scrambled (not libraries or the rest of the site), with light
 * settings that don't slow the game down.
 */
const SCRAMBLED = [path.join(here, "src/components/games/port-codeship"), path.join(here, "src/lib/games/port")];
const SCRAMBLE_OPTIONS = {
  compact: true,
  identifierNamesGenerator: "hexadecimal",
  stringArray: true,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: ["base64"],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  splitStrings: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  renameGlobals: false,
  transformObjectKeys: false,
  numbersToExpressions: false,
  sourceMap: false,
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.module.rules.push({
        test: /\.(ts|tsx|js|jsx)$/,
        include: SCRAMBLED,
        // These two load other files on demand (the 3D engine, Blockly, Python), and the
        // bundler must still be able to read those paths, so they stay unscrambled.
        exclude: [/PortCodeship\.tsx$/, /port\.worker\.ts$/],
        enforce: "post",
        use: { loader: path.join(here, "node_modules/webpack-obfuscator/dist/loader/index.js"), options: SCRAMBLE_OPTIONS },
      });
    }
    return config;
  },
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
      // The free coding games section launched as "Code Hour" and was renamed "Ship It! Arcade".
      { source: "/code-hour", destination: "/ship-it", permanent: true },
      { source: "/code-hour/:path*", destination: "/ship-it/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
