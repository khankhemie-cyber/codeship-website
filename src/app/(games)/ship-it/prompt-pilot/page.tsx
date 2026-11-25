import { PromptPilot } from "@/components/games/prompt-pilot";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Prompt Pilot: AI Skills Game for Kids 7–10",
  description:
    "A free game for kids ages 7–10: learn to ask AI clear questions, ask for sources, catch AI mistakes, and use AI to grow your own ideas.",
  path: "/ship-it/prompt-pilot/",
});

export default function Page() {
  return (
    <div className="arcade-light">
      <PromptPilot />
    </div>
  );
}
