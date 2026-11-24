import { ArcadeHub } from "@/components/games/arcade-hub";
import { pageMetadata } from "@/lib/pageMetadata";
import { itemListSchema } from "@/lib/schema";

const GAMES = [
  { name: "Bus Buddies Road Trip", url: "https://www.codeshipacademy.com/ship-it/bus-buddies/", description: "Ages 4–6. Picture-block coding game: sequencing, loops and debugging. No reading needed." },
  { name: "Rover Rescue", url: "https://www.codeshipacademy.com/ship-it/rover-rescue/", description: "Grades 4–8. Type real JavaScript to guide a moon rover: loops, functions, conditionals, variables." },
  { name: "Prompt Pilot", url: "https://www.codeshipacademy.com/ship-it/prompt-pilot/", description: "Ages 7–10. Learn to prompt an AI clearly, ask for sources and catch AI mistakes." },
  { name: "App Studio", url: "https://www.codeshipacademy.com/ship-it/app-studio/", description: "Grades 4–8. Build your own app with events, variables and lists, then see the JavaScript." },
  { name: "Bot Trainer", url: "https://www.codeshipacademy.com/ship-it/bot-trainer/", description: "Grades 6–8. Python basics, then train a sorting robot with data and learn about AI bias." },
];

export const metadata = pageMetadata({
  title: "Ship It! Arcade: Free Coding Games for Kids",
  description:
    "Free coding and AI games for kids: drive a bus with picture blocks (ages 4–6), write real JavaScript to rescue a moon rover, learn to prompt and fact-check AI, build your own app, or train an AI robot. No sign-up, nothing to install.",
  path: "/ship-it/",
});

export default function ShipItPage() {
  return (
    <div className="ship-it">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(GAMES)) }} />
      <ArcadeHub />
    </div>
  );
}
