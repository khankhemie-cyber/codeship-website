import Link from "next/link";

/** Academy-only chrome — deliberately isolated from the main site nav, same pattern as LPHeader. */
export default function AcademyHeader() {
  return (
    <header className="bg-[#001532] text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/academy" className="font-semibold tracking-tight">
          CODEship Academy <span className="text-[#E5A823]">Learning</span>
        </Link>
        <nav aria-label="Academy" className="flex gap-4 text-sm">
          <Link href="/academy/levels" className="hover:text-[#E5A823]">
            Levels
          </Link>
          <Link href="/academy/join" className="hover:text-[#E5A823]">
            Join a class
          </Link>
          <Link href="/academy/login" className="hover:text-[#E5A823]">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
