import { BotTrainer } from "@/components/games/bot-trainer";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Bot Trainer: Python and AI Game for Kids",
  description: "A free coding game for kids: warm up with Python, train an AI sorting robot with data, discover AI bias, and write if/elif/else rules.",
  path: "/ship-it/bot-trainer/",
});

export default function Page() {
  return <BotTrainer />;
}
