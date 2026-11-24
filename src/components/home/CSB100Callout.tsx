/** Slim recognition band: CODEship Academy on the CSB100 2026 list. */
export default function CSB100Callout() {
  return (
    <aside aria-label="Recognition" className="bg-[#F4D734] text-[#001532]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <p className="text-base sm:text-lg font-semibold">
          <span aria-hidden="true">🏆 </span>
          Proud to be named to the <strong>Canada Small Business 100</strong> 2026 list.
        </p>
        <a
          href="https://www.canadasmallbusiness100.ca/csb100-2026/codeship-academy"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline decoration-2 underline-offset-4 hover:decoration-[#6E43A8]"
        >
          See our CSB100 profile<span className="sr-only"> (opens in a new tab)</span> →
        </a>
      </div>
    </aside>
  );
}
