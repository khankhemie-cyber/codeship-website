import { RoverRescue } from "@/components/games/rover-rescue";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Rover Rescue: Learn JavaScript, Free Coding Game",
  description: "A free coding game for kids: write real JavaScript (loops, functions, if statements and variables) to guide a stranded moon rover home.",
  path: "/ship-it/rover-rescue/",
});

export default function Page() {
  return (
    <div className="arcade-light">
      <RoverRescue />
    </div>
  );
}
