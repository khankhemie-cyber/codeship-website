import type { Metadata } from "next";
import JoinForm from "./JoinForm";

export const metadata: Metadata = { title: "Join your class", robots: { index: false, follow: false } };

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#001532]">Join your class</h1>
      <p className="mt-2 max-w-lg text-[#2E3440]">
        No email needed — enter the class code and PIN your teacher gave you.
      </p>
      <JoinForm />
    </div>
  );
}
