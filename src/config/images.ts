/**
 * Every marketing photo on the site, in one place. Files live in
 * public/images. To use your own class photos, drop a file in public/images
 * and change the path here: every page that shows that photo updates.
 *
 * Current files are free Unsplash License photos, saved locally.
 */
export const IMAGES = {
  heroRobot: { src: "/images/hero-robot.jpg", alt: "A group of kids gathered around a robot they are programming" },
  kidLaptop: { src: "/images/kid-laptop.jpg", alt: "A smiling boy coding on a laptop" },
  kidsBuilding: { src: "/images/kids-building.jpg", alt: "Two girls building a colourful project together" },
  girlHeadphones: { src: "/images/girl-headphones.jpg", alt: "A girl with headphones in a live online class" },
  girlCoding: { src: "/images/girl-coding.jpg", alt: "A girl writing code on a laptop" },
  robotsTablet: { src: "/images/robots-tablet.jpg", alt: "A boy programming small robots from a tablet" },
  robotsGirl: { src: "/images/robots-girl.jpg", alt: "A child coding a robot with a tablet app" },
  blockCode: { src: "/images/block-code.jpg", alt: "Block code on a tablet next to robot parts" },
  camp: { src: "/images/camp.jpg", alt: "Kids crowded around a 3D printer at camp" },
  lego: { src: "/images/lego.jpg", alt: "A boy building with bricks and a build guide" },
  robotBubbles: { src: "/images/robot-bubbles.jpg", alt: "A happy child playing with a robot blowing bubbles" },
} as const;

export type ImageKey = keyof typeof IMAGES;
