"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CERTIFICATE_ASSET_PATHS,
  CERTIFICATE_KINDS,
  CERTIFICATE_PROGRAMS,
  certificateFileName,
  describeCertificate,
  renderCertificatePdf,
  validateCertificateFields,
  type CertificateAssets,
  type CertificateFields,
  type CertificateKind,
} from "@/lib/certificates/certificate";
import { getProgram } from "@/data/programs";

const STORAGE_KEY = "codeshipCertificatesPassword";

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function readStoredPassword(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storePassword(value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode etc.: the password just isn't remembered across reloads.
  }
}

async function verifyPassword(password: string): Promise<"ok" | "wrong" | "not_configured" | "error"> {
  try {
    const res = await fetch("/api/certificates/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) return "ok";
    if (res.status === 401) return "wrong";
    if (res.status === 500) return "not_configured";
    return "error";
  } catch {
    return "error";
  }
}

export default function CertificateStudio() {
  const [password, setPassword] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = readStoredPassword();
    if (!stored) {
      setChecking(false);
      return;
    }
    verifyPassword(stored).then((r) => {
      if (r === "ok") setPassword(stored);
      else storePassword(null);
      setChecking(false);
    });
  }, []);

  if (checking) return <div className="min-h-screen bg-[#0D1B2A]" />;
  if (!password) {
    return (
      <Gate
        onUnlock={(p) => {
          storePassword(p);
          setPassword(p);
        }}
      />
    );
  }
  return (
    <Studio
      password={password}
      onSignOut={() => {
        storePassword(null);
        setPassword(null);
      }}
    />
  );
}

function Gate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    setLoading(true);
    setError("");
    const r = await verifyPassword(value);
    setLoading(false);
    if (r === "ok") onUnlock(value);
    else if (r === "wrong") {
      setError("Incorrect password. Please try again.");
      setValue("");
    } else if (r === "not_configured") setError("The staff password isn't set up on the server yet (CERTIFICATES_PASSWORD).");
    else setError("Could not reach the server. Please try again.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0D1B2A] px-4 py-10">
      <Image src="/logo-nav.png" alt="CODEship Academy" width={160} height={160} className="mb-8 h-20 w-auto" priority />
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl"
      >
        <p className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-[3px] text-[#F4D734]">Staff only</p>
        <h1 className="mb-2 text-center text-2xl font-black text-white">Certificates</h1>
        <p className="mb-6 text-center text-sm text-white/60">Enter the staff password to issue certificates.</p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Staff password"
          autoComplete="current-password"
          autoFocus
          className={`mb-3 w-full rounded-lg border-2 bg-white/[0.07] px-4 py-3 font-semibold text-white outline-none placeholder:text-white/40 ${
            error ? "border-red-500" : "border-white/15 focus:border-[#F4D734]"
          }`}
        />
        {error && <p className="mb-3 text-center text-xs font-semibold text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="w-full rounded-lg bg-[#F4D734] py-3 text-sm font-black uppercase tracking-wider text-[#0D1B2A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

interface SentRecord {
  at: string;
  childName: string;
  email: string;
  what: string;
}

function Studio({ password, onSignOut }: { password: string; onSignOut: () => void }) {
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState(CERTIFICATE_PROGRAMS[0].slug as string);
  const [kind, setKind] = useState<CertificateKind>("semester-1");
  const [completionDate, setCompletionDate] = useState(todayIso);
  const [instructorName, setInstructorName] = useState("");
  const [note, setNote] = useState("");

  const [assets, setAssets] = useState<CertificateAssets | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sent, setSent] = useState<SentRecord[]>([]);

  const fields: CertificateFields = useMemo(
    () => ({ childName, program, kind, completionDate, instructorName }),
    [childName, program, kind, completionDate, instructorName],
  );
  // The preview shows a sample name until one is typed, so the layout is visible straight away.
  const previewFields = useMemo(() => ({ ...fields, childName: childName.trim() || "Student Name" }), [fields, childName]);

  useEffect(() => {
    Promise.all(
      [CERTIFICATE_ASSET_PATHS.logo, CERTIFICATE_ASSET_PATHS.seal].map((p) =>
        fetch(p).then((r) => {
          if (!r.ok) throw new Error(p);
          return r.arrayBuffer();
        }),
      ),
    )
      .then(([logoPng, sealPng]) => setAssets({ logoPng, sealPng }))
      .catch(() => setPreviewError("Could not load the certificate artwork. Reload the page."));
  }, []);

  // Re-render the preview shortly after the details stop changing.
  useEffect(() => {
    if (!assets) return;
    let cancelled = false;
    let url: string | null = null;
    const timer = setTimeout(async () => {
      try {
        const bytes = await renderCertificatePdf(previewFields, assets);
        if (cancelled) return;
        url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
        setPreviewUrl(url);
        setPreviewError("");
      } catch (e) {
        if (!cancelled) setPreviewError(e instanceof Error ? e.message : "Could not build the preview.");
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (url) setTimeout(() => URL.revokeObjectURL(url!), 1000);
    };
  }, [assets, previewFields]);

  const selectedProgram = getProgram(program)!;
  const fieldProblem = validateCertificateFields(fields);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const download = useCallback(async () => {
    if (!assets || fieldProblem) return;
    try {
      const bytes = await renderCertificatePdf(fields, assets);
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = certificateFileName(fields);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setStatus({ type: "error", text: e instanceof Error ? e.message : "Could not build the PDF." });
    }
  }, [assets, fields, fieldProblem]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (fieldProblem) return setStatus({ type: "error", text: fieldProblem });
    if (!emailOk) return setStatus({ type: "error", text: "Enter a valid parent/guardian email address." });
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/certificates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email: email.trim(), parentName, note, fields }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        const what = describeCertificate(selectedProgram, kind);
        setSent((s) => [{ at: new Date().toLocaleTimeString(), childName: childName.trim(), email: email.trim(), what }, ...s]);
        setStatus({ type: "success", text: `Sent! ${childName.trim()}'s ${what} certificate is on its way to ${email.trim()}.` });
        // Ready for the next child in the same class: keep program, type, date and instructor.
        setChildName("");
        setParentName("");
        setEmail("");
        setNote("");
      } else {
        if (res.status === 401) onSignOut();
        setStatus({ type: "error", text: body.error ?? `Sending failed (${res.status}).` });
      }
    } catch {
      setStatus({ type: "error", text: "Could not reach the server. Please try again." });
    }
    setSending(false);
  };

  const label = "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600";
  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-900 outline-none focus:border-[#138A9A] focus:ring-2 focus:ring-[#138A9A]/20";
  const chip = (active: boolean) =>
    `rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${
      active ? "border-[#0D1B2A] bg-[#0D1B2A] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[#0D1B2A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image src="/logo-nav.png" alt="CODEship Academy" width={160} height={160} className="h-10 w-auto" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#F4D734]">Staff</p>
              <h1 className="text-lg font-black leading-tight text-white">Certificates</h1>
            </div>
          </div>
          <button onClick={onSignOut} className="text-sm font-semibold text-white/70 hover:text-white">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form onSubmit={send} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
          <section>
            <span className={label}>Program</span>
            <div className="grid grid-cols-2 gap-2">
              {CERTIFICATE_PROGRAMS.map((p) => (
                <button key={p.slug} type="button" onClick={() => setProgram(p.slug)} className={chip(program === p.slug)}>
                  <span className="block">{p.level}</span>
                  <span className={`block text-[11px] font-medium ${program === p.slug ? "text-white/70" : "text-slate-500"}`}>
                    {p.gradeBand}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <span className={label}>Certificate</span>
            <div className="grid grid-cols-4 gap-2">
              {CERTIFICATE_KINDS.filter((k) => k.value !== "program").map((k) => (
                <button key={k.value} type="button" onClick={() => setKind(k.value)} className={chip(kind === k.value)}>
                  {k.label.replace("Semester ", "Sem ")}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setKind("program")} className={`mt-2 w-full ${chip(kind === "program")}`}>
              🎓 Full program completion
            </button>
            <p className="mt-2 text-xs text-slate-500">
              {kind === "program"
                ? `All 4 semesters + capstone: ${selectedProgram.capstone.title}`
                : `Project: ${selectedProgram.semesters.find((s) => s.number === Number(kind.slice(-1)))!.project}`}
            </p>
          </section>

          <section className="space-y-3">
            <div>
              <label htmlFor="childName" className={label}>
                Child&apos;s name (as printed)
              </label>
              <input id="childName" className={input} value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="e.g. Amelia Johnson" maxLength={60} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date" className={label}>
                  Completion date
                </label>
                <input id="date" type="date" className={input} value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
              </div>
              <div>
                <label htmlFor="instructor" className={label}>
                  Instructor <span className="font-medium normal-case text-slate-400">(optional)</span>
                </label>
                <input id="instructor" className={input} value={instructorName} onChange={(e) => setInstructorName(e.target.value)} placeholder="e.g. Ms. Khan" maxLength={60} />
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-5">
            <div>
              <label htmlFor="email" className={label}>
                Parent / guardian email
              </label>
              <input id="email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@example.com" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="parentName" className={label}>
                Parent / guardian name <span className="font-medium normal-case text-slate-400">(optional, for the greeting)</span>
              </label>
              <input id="parentName" className={input} value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Sarah" maxLength={80} />
            </div>
            <div>
              <label htmlFor="note" className={label}>
                Personal note <span className="font-medium normal-case text-slate-400">(optional, added to the email)</span>
              </label>
              <textarea id="note" rows={3} className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Amelia's robot dance was the highlight of demo day!" maxLength={1000} />
            </div>
          </section>

          {status && (
            <div
              role="status"
              className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {status.text}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={sending || !!fieldProblem || !emailOk}
              className="flex-1 rounded-lg bg-[#F4D734] px-4 py-3 text-sm font-black uppercase tracking-wide text-[#0D1B2A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending…" : "✉️ Email certificate"}
            </button>
            <button
              type="button"
              onClick={download}
              disabled={!assets || !!fieldProblem}
              className="rounded-lg border-2 border-[#0D1B2A] px-4 py-3 text-sm font-bold text-[#0D1B2A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download PDF
            </button>
          </div>
          {fieldProblem && childName.trim() && <p className="text-xs text-red-600">{fieldProblem}</p>}
        </form>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
              <h2 className="text-sm font-bold text-slate-700">Preview</h2>
              <span className="flex items-center gap-3 text-xs text-slate-500">
                {describeCertificate(selectedProgram, kind)}
                {previewUrl && (
                  // Some phone browsers can't show a PDF inline; this opens it in their viewer.
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#138A9A] hover:underline">
                    Open ↗
                  </a>
                )}
              </span>
            </div>
            {previewError ? (
              <p className="p-6 text-sm font-semibold text-red-700">{previewError}</p>
            ) : previewUrl ? (
              <iframe
                title="Certificate preview"
                src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="aspect-[792/640] w-full bg-slate-200"
              />
            ) : (
              <div className="flex aspect-[792/612] items-center justify-center text-sm text-slate-500">Loading preview…</div>
            )}
          </div>

          {sent.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-bold text-slate-700">Sent this session</h2>
              <ul className="divide-y divide-slate-100 text-sm">
                {sent.map((r, i) => (
                  <li key={i} className="flex flex-wrap justify-between gap-x-4 py-2">
                    <span>
                      <strong>{r.childName}</strong> · {r.what}
                    </span>
                    <span className="text-slate-500">
                      {r.email} · {r.at}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
