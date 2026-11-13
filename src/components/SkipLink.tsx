/** First focusable element on the page: lets keyboard users jump past the header. */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#F4D734] focus:px-4 focus:py-2 focus:font-bold focus:text-[#001532]"
    >
      Skip to main content
    </a>
  );
}
