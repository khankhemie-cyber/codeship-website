import { AppStudio } from "@/components/games/app-studio";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "App Studio: Build Your Own App, Free for Kids",
  description: "A free coding game for kids: design an app with buttons, variables and lists, see the real JavaScript behind it, and download it to share.",
  path: "/ship-it/app-studio/",
});

export default function Page() {
  return <AppStudio />;
}
