/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
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
  async redirects() {
    const retiredTrinidadSlugs = [
      "online-coding-classes",
      "math-language-arts-coding",
      "sea-digital-skills",
      "computer-classes-for-kids",
      "online-stem-classes",
    ];
    return retiredTrinidadSlugs.map((slug) => ({
      source: `/tt/${slug}`,
      destination: "/tt",
      permanent: true,
    }));
  },
};

export default nextConfig;
