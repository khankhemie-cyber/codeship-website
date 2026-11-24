/**
 * Every marketing photo on the site, in one place. Files live in
 * public/images. To use your own class photos, drop a file in public/images
 * and change the path here: every page that shows that photo updates.
 *
 * Current files are free Unsplash License photos, saved locally.
 */
export const IMAGES = {
  heroRobot: { src: "/images/hero-robot.webp", alt: "A group of kids gathered around a robot they are programming" },
  kidLaptop: { src: "/images/kid-laptop.webp", alt: "A smiling boy coding on a laptop" },
  kidsBuilding: { src: "/images/kids-building.webp", alt: "Two girls building a colourful project together" },
  girlHeadphones: { src: "/images/girl-headphones.webp", alt: "A girl with headphones in a live online class" },
  girlCoding: { src: "/images/girl-coding.webp", alt: "A girl writing code on a laptop" },
  robotsTablet: { src: "/images/robots-tablet.webp", alt: "A boy programming small robots from a tablet" },
  robotsGirl: { src: "/images/robots-girl.webp", alt: "A child coding a robot with a tablet app" },
  blockCode: { src: "/images/block-code.webp", alt: "Block code on a tablet next to robot parts" },
  camp: { src: "/images/camp.webp", alt: "Kids crowded around a 3D printer at camp" },
  lego: { src: "/images/lego.webp", alt: "A boy building with bricks and a build guide" },
  robotBubbles: { src: "/images/robot-bubbles.webp", alt: "A happy child playing with a robot blowing bubbles" },
} as const;

export type ImageKey = keyof typeof IMAGES;
