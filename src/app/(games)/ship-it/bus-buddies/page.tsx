import { BusBuddies } from "@/components/games/bus-buddies/BusBuddies";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Bus Buddies Road Trip: Free Coding Game for Ages 4–6",
  description:
    "A story coding game for ages 4 to 6. Put picture blocks in order to drive Bina the Bus, pick up friends and learn sequencing, debugging and loops. No reading needed, no sign-up.",
  path: "/ship-it/bus-buddies/",
});

export default function Page() {
  return <BusBuddies />;
}
