"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/academy/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="mt-6 max-w-sm rounded-md bg-white p-4 text-[#2E3440] shadow-sm">
        Check <strong>{email}</strong> for a sign-in link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#001532]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-[#138A9A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#138A9A]"
        />
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-700">
          {supabase
            ? "Couldn't send the sign-in link. Try again."
            : "The learning platform isn't connected to Supabase yet — ask an admin to finish setup."}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[#001532] px-4 py-2 font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send sign-in link"}
      </button>
      <p className="text-xs text-[#2E3440]">
        Teacher, parent, and school admin accounts are provisioned by CODEship staff — contact your
        program coordinator if you don&apos;t have access yet.
      </p>
    </form>
  );
}
