import ByteBay from "@/components/games/byte-bay/ByteBay";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Byte Bay: 3D Open-World Coding Game for Kids",
  description:
    "A free 3D open-world coding game: explore a seaside town, climb anything, build your house and program robots with real Python or JavaScript to help the townsfolk.",
  path: "/ship-it/byte-bay/",
});

export default function Page() {
  return <ByteBay />;
}
