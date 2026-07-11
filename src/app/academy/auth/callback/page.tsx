"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAcademySession } from "@/lib/academy/session";

/** Lands here after a magic-link click; routes each role to its own dashboard. */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    (async () => {
      const session = await getAcademySession();
      if (!session) {
        setMessage(
          "You're signed in, but this email isn't linked to a teacher, parent, or school admin account yet. Contact your program coordinator."
        );
        return;
      }
      const destination =
        session.role === "teacher"
          ? "/academy/teacher"
          : session.role === "parent"
            ? "/academy/parent"
            : session.role === "school_admin"
              ? "/academy/admin"
              : "/academy/me";
      router.replace(destination);
    })();
  }, [router]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-[#2E3440]">{message}</p>
    </div>
  );
}
