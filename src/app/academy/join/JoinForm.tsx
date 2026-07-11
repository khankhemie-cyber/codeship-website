"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function JoinForm() {
  const router = useRouter();
  const [classCode, setClassCode] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus("error");
      setErrorMessage("The learning platform isn't connected to Supabase yet — ask an adult to finish setup.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError || !signInData.session) {
      setStatus("error");
      setErrorMessage("Couldn't start a session. Try again.");
      return;
    }

    const response = await fetch("/api/academy/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${signInData.session.access_token}`,
      },
      body: JSON.stringify({ classCode, pin }),
    });

    if (!response.ok) {
      setStatus("error");
      setErrorMessage("That class code and PIN didn't match. Check with your teacher and try again.");
      await supabase.auth.signOut();
      return;
    }

    router.push("/academy/me");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
      <div>
        <label htmlFor="classCode" className="block text-sm font-medium text-[#001532]">
          Class code
        </label>
        <input
          id="classCode"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          required
          autoComplete="off"
          className="mt-1 w-full rounded-md border border-[#138A9A] px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-[#138A9A]"
        />
      </div>
      <div>
        <label htmlFor="pin" className="block text-sm font-medium text-[#001532]">
          Your PIN
        </label>
        <input
          id="pin"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          inputMode="numeric"
          autoComplete="off"
          className="mt-1 w-full rounded-md border border-[#138A9A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#138A9A]"
        />
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[#001532] px-4 py-2 font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Join my class"}
      </button>
    </form>
  );
}
