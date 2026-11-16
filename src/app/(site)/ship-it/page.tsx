import { ArcadeHub } from "@/components/games/arcade-hub";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Ship It! Arcade: Free Coding Games for Kids",
  description:
    "Free coding games for kids in Grades 4–8. Write real JavaScript to rescue a moon rover, build your own app, or train an AI robot with Python. No sign-up, nothing to install.",
  path: "/ship-it/",
});

export default function ShipItPage() {
  return (
    <div className="ship-it">
      <ArcadeHub />
    </div>
  );
}
