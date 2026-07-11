import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#001532]">Teacher, parent & school admin sign-in</h1>
      <p className="mt-2 max-w-lg text-[#2E3440]">
        We&apos;ll email you a link — no password needed. Students should use{" "}
        <a href="/academy/join" className="underline">
          Join a class
        </a>{" "}
        instead.
      </p>
      <LoginForm />
    </div>
  );
}
