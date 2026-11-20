import { VoiceSamples } from "@/components/games/bus-buddies/voice-samples";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata({
  title: "Bus Buddies: Voice Samples",
  description: "Internal page for choosing the character voices in Bus Buddies Road Trip.",
  path: "/ship-it/bus-buddies/voices/",
  noindex: true,
});

export default function Page() {
  return <VoiceSamples />;
}
