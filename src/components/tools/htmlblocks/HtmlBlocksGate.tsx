"use client";

import dynamic from "next/dynamic";
import ClassPasswordForm, { useClassAccess } from "@/components/ClassPasswordForm";

const HtmlBlocksApp = dynamic(() => import("./HtmlBlocksApp"), { ssr: false, loading: () => <div className="min-h-[100dvh] bg-[#001432]" /> });

/**
 * HTML Blocks is for enrolled Builders students: the Builders class password
 * (the same one as the Builders workbook, quizzes and Robot Lab, checked on
 * the server, which sets an HttpOnly cookie) opens it. A device that already
 * unlocked Builders goes straight in.
 */
export default function HtmlBlocksGate() {
  const [status, setStatus] = useClassAccess("builders");

  if (status === "open") return <HtmlBlocksApp />;
  if (status === "checking") return <div className="min-h-[100dvh] bg-[#001432]" aria-busy="true" />;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#001432] text-[#E6EDF7]">
      <header className="flex items-center gap-2 border-b border-white/10 bg-[#012C61] px-4 py-2">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
          <span className="block h-7 w-6 bg-no-repeat" style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }} />
        </span>
        <h1 className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
          CODEship <span className="text-[#F0D030]">HTML Blocks</span>
        </h1>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-lg">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#F0D030]">For CODEship Builders</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold">Build a real web page from tag cards.</h2>
          <p className="mt-2 text-[15px] text-white/70">Enter the Builders class password your instructor gave you. You only need to do this once on this device.</p>
          <div className="mt-5 text-[#001432] [&>div]:max-w-none [&>div]:rounded-2xl">
            <ClassPasswordForm program="builders" level="Builders" action="Open HTML Blocks" onUnlock={() => setStatus("open")} />
          </div>
          <p className="mt-6 text-sm text-white/60">
            Not a CODEship student yet? <a href="/programs/" className="font-bold text-[#F0D030] hover:underline">See our programs</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
