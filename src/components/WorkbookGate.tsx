"use client";

import ClassPasswordForm, { useClassAccess } from "@/components/ClassPasswordForm";

interface Props {
  program: string;
  level: string;
  fileUrl: string;
  fileName: string;
}

/**
 * Password form for one program's workbook. The password is checked on the
 * server (/api/workbooks/login), which sets an HttpOnly cookie; the PDF itself
 * is only decrypted for a browser holding that cookie (/api/workbooks/download).
 */
export default function WorkbookGate({ program, level, fileUrl, fileName }: Props) {
  const [status, setStatus] = useClassAccess(program);

  if (status === "checking") {
    return <div className="h-64" aria-busy="true" />;
  }

  if (status === "locked") {
    return (
      <ClassPasswordForm program={program} level={level} action="Unlock workbook" onUnlock={() => setStatus("open")} />
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">Unlocked</p>
      <h2 className="font-display text-2xl font-extrabold text-[#001532] mt-2">{level} · Semester 1 workbook</h2>
      <a
        href={fileUrl}
        download={fileName}
        className="mt-6 inline-flex items-center justify-center px-7 py-3.5 text-lg font-bold bg-[#F4D734] text-[#001532] hover:bg-[#E6C51E] shadow-lg"
      >
        Download the workbook (PDF)
      </a>

      <h3 className="font-display text-xl font-extrabold text-[#001532] mt-10">How to fill it in</h3>
      <ol className="list-decimal pl-5 mt-3 space-y-2 text-base text-gray-700">
        <li>
          Download the workbook and <strong>save it on your computer</strong> (for example in Documents) so your work is
          kept between classes.
        </li>
        <li>
          Open the saved file in a PDF app: <strong>Adobe Acrobat Reader</strong> (free, Windows and Mac),{" "}
          <strong>Preview</strong> on a Mac, or <strong>Microsoft Edge</strong> / <strong>Google Chrome</strong>.
        </li>
        <li>Click on any line or box to type in it. Click a checkbox to tick it. Explorers can tap a star box to colour in a star.</li>
        <li>
          Choose <strong>File → Save</strong> (or the save/download button in Edge and Chrome) before you close it. Next week, open the
          same saved file and keep going.
        </li>
      </ol>
      <p className="text-base text-gray-600 mt-5">
        You can also print it and write on it by hand. For drawing pages, use your PDF app&apos;s draw or markup tool, or print that page.
      </p>
    </div>
  );
}
