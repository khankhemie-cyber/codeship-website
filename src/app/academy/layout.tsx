import AcademyHeader from "@/components/academy/AcademyHeader";

/**
 * The learning platform's own chrome — like /lp and /gy, this replaces (does
 * not extend) the main site's Navigation/Footer. Never linked from the main
 * site nav; this is a separate authenticated product surface.
 */
export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AcademyHeader />
      <main id="main-content" className="min-h-screen bg-[#FAF8F4]">
        {children}
      </main>
    </>
  );
}
