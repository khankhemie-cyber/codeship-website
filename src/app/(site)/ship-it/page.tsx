import { ArcadeHub } from "@/components/games/arcade-hub";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Ship It! Arcade: Free Coding Games for Kids",
  description:
    "Free coding and AI games for kids: drive a bus with picture blocks (ages 4–6), write real JavaScript to rescue a moon rover, learn to prompt and fact-check AI, build your own app, or train an AI robot. No sign-up, nothing to install.",
  path: "/ship-it/",
});

export default function ShipItPage() {
  return (
    <div className="ship-it">
      <ArcadeHub />
    </div>
  );
}
