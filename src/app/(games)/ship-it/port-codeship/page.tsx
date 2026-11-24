import PortCodeship from "@/components/games/port-codeship/PortCodeship";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Port CODEship: 3D Open-World Coding Game for Kids",
  description:
    "A free 3D open-world coding game: explore a seaside town, climb anything, build your house and program robots with real Python or JavaScript to help the townsfolk.",
  path: "/ship-it/port-codeship/",
});

export default function Page() {
  return <PortCodeship />;
}
