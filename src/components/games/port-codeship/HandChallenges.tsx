// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
"use client";

import { useState } from "react";
import { APPOINTMENTS, BILLS, fewestBills, mayEnter, permitFee, permitProblem, type BankWorld, type LibraryWorld, type PermitWorld, type SecurityWorld } from "@/lib/games/port/missions";

/**
 * The indoor challenges done by hand (1 star). Each one is the same job the
 * bot does, so kids feel how slow and fiddly it is before they code it.
 */

type Props = { onDone: () => void; onClose: () => void; say: (who: string, text: string, tone?: "good" | "bad" | "info") => void };

function Shell({ title, who, children, onClose }: { title: string; who: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#0d1b2a] p-5 shadow-2xl ring-1 ring-white/15">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber">By hand · {who}</div>
            <h2 className="text-2xl font-extrabold">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold">Stop (Esc)</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function HandSecurity({ onDone, onClose, say, world }: Props & { world: SecurityWorld }) {
  const visitors = world.visitors;
  const [i, setI] = useState(0);
  const v = visitors[i];
  const choose = (letIn: boolean) => {
    if (mayEnter(v) !== letIn) {
      say("Officer Grant", letIn ? `Not so fast: ${APPOINTMENTS.includes(v.name) ? `${v.name} has no photo ID` : `${v.name} isn't on today's board`}.` : `${v.name} is on the board and has ID. Let them through!`, "bad");
      return;
    }
    say("Officer Grant", letIn ? `Welcome in, ${v.name}.` : `${v.name}, the front desk will help you.`, "good");
    if (i + 1 >= visitors.length) onDone();
    else setI(i + 1);
  };
  return (
    <Shell title="Work the security gate" who="Officer Grant" onClose={onClose}>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/5 p-3 text-sm">
          <div className="font-bold text-amber">Today&apos;s appointments</div>
          <ul className="mt-1 grid gap-0.5">{APPOINTMENTS.map((n) => <li key={n}>{n}</li>)}</ul>
          <p className="mt-2 text-white/70">Let someone in only if they&apos;re on the board AND show photo ID.</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-navy">
          <div className="text-xs font-bold uppercase text-gray-500">Visitor {i + 1} of {visitors.length}</div>
          <div className="mt-1 text-2xl font-extrabold">{v.name}</div>
          <div className={`mt-2 inline-block rounded-md px-2 py-1 text-sm font-bold ${v.id ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{v.id ? "Shows photo ID" : "No photo ID"}</div>
          <div className="mt-4 grid gap-2">
            <button onClick={() => choose(true)} className="rounded-lg bg-emerald-500 px-3 py-2 font-bold text-white">Open the gate</button>
            <button onClick={() => choose(false)} className="rounded-lg bg-navy px-3 py-2 font-bold text-white">Send to the front desk</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function HandBank({ onDone, onClose, say, world }: Props & { world: BankWorld }) {
  const amounts = world.amounts;
  const [c, setC] = useState(0);
  const [given, setGiven] = useState<number[]>([]);
  const owed = amounts[c];
  const paid = given.reduce((a, b) => a + b, 0);
  const give = (b: number) => {
    if (paid + b > owed) return say("Mr. Mensah", `A ${b} bill is too much: only ${owed - paid} left to pay.`, "bad");
    const next = [...given, b];
    if (paid + b < owed) return setGiven(next);
    const best = fewestBills(owed);
    if (next.length > best) {
      say("Mr. Mensah", `That's ${owed} exactly, but in ${next.length} bills. It can be done with ${best}. Try again with bigger bills first.`, "bad");
      return setGiven([]);
    }
    say("Mr. Mensah", `Perfect: ${owed} in ${next.length} bills.`, "good");
    setGiven([]);
    if (c + 1 >= amounts.length) onDone();
    else setC(c + 1);
  };
  return (
    <Shell title="Make change by hand" who="Mr. Mensah" onClose={onClose}>
      <div className="mt-4 rounded-xl bg-white p-4 text-navy">
        <div className="text-xs font-bold uppercase text-gray-500">Customer {c + 1} of {amounts.length}</div>
        <div className="mt-1 text-xl font-extrabold">Owed: {owed} coins</div>
        <div className="mt-1">Paid so far: <strong>{paid}</strong> · {given.length} bill{given.length === 1 ? "" : "s"} {given.length ? `(${given.join(" + ")})` : ""}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {BILLS.map((b) => (
            <button key={b} onClick={() => give(b)} className="rounded-lg bg-amber px-4 py-2 text-lg font-extrabold text-navy">{b}</button>
          ))}
          <button onClick={() => setGiven([])} className="rounded-lg bg-gray-200 px-3 py-2 font-bold">Start over</button>
        </div>
        <p className="mt-3 text-sm text-gray-600">Pay exactly what&apos;s owed using the fewest bills.</p>
      </div>
    </Shell>
  );
}

export function HandLibrary({ onDone, onClose, say, onOrder, world }: Props & { onOrder: (order: number[]) => void; world: LibraryWorld }) {
  const [order, setOrder] = useState(() => [...world.books]);
  const [picked, setPicked] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const click = (i: number) => {
    if (picked === null) return setPicked(i);
    if (picked === i) return setPicked(null);
    const next = [...order];
    [next[picked], next[i]] = [next[i], next[picked]];
    setOrder(next);
    onOrder(next);
    setPicked(null);
    setMoves(moves + 1);
    if (next.every((n, k) => k === 0 || next[k - 1] <= n)) {
      say("Mrs. Thompson", `Sorted in ${moves + 1} swaps. Lovely!`, "good");
      onDone();
    }
  };
  return (
    <Shell title="Sort the returns shelf" who="Mrs. Thompson" onClose={onClose}>
      <p className="mt-3 text-sm text-white/75">Click a book, then another, to swap them. Smallest number on the left.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {order.map((n, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            aria-pressed={picked === i}
            className={`flex h-24 w-12 flex-col items-center justify-end rounded-md pb-2 font-mono text-sm font-bold ${picked === i ? "bg-amber text-navy ring-4 ring-amber/50" : "bg-[#2f6f8f] text-white"}`}
          >
            <span className="text-[10px] opacity-70">{i}</span>
            {n}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-white/70">Swaps so far: {moves}</p>
    </Shell>
  );
}

export function HandPermit({ onDone, onClose, say, world }: Props & { world: PermitWorld }) {
  const apps = world.applications;
  const [i, setI] = useState(0);
  const a = apps[i];
  const fee = permitFee(a);
  const choose = (approve: boolean) => {
    const problem = permitProblem(a);
    if (approve && problem) return say("Ms. Joseph", `Not so fast: ${problem}.`, "bad");
    if (!approve && !problem) return say("Ms. Joseph", `${a.name} meets every rule. That one should be approved!`, "bad");
    say("Ms. Joseph", approve ? `Approved: ${a.name}.` : `Refused: ${a.name} (${problem}).`, "good");
    if (i + 1 >= apps.length) onDone();
    else setI(i + 1);
  };
  const row = (label: string, value: string) => (
    <div className="flex justify-between gap-3 border-b border-gray-200 py-1"><span className="text-gray-600">{label}</span><strong>{value}</strong></div>
  );
  return (
    <Shell title="Check building permits" who="Ms. Joseph" onClose={onClose}>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/5 p-3 text-sm">
          <div className="font-bold text-amber">Permit rules</div>
          <ol className="mt-1 list-decimal space-y-1 pl-4">
            <li>The lot must be cleared.</li>
            <li>The building must fit with 1 block of space on every side: width + 2 and depth + 2 must fit the lot.</li>
            <li>The fee is 2 coins per square: width × depth × 2. They must have enough coins.</li>
          </ol>
        </div>
        <div className="rounded-xl bg-white p-4 text-sm text-navy">
          <div className="text-xs font-bold uppercase text-gray-500">Application {i + 1} of {apps.length}</div>
          <div className="mt-1 text-xl font-extrabold">{a.name}</div>
          <div className="mt-2">
            {row("Lot size", `${a.lotW} × ${a.lotD}`)}
            {row("Building size", `${a.buildW} × ${a.buildD}`)}
            {row("Lot cleared?", a.cleared ? "Yes" : "No")}
            {row("Coins they have", String(a.coins))}
            {row("Fee", `${a.buildW} × ${a.buildD} × 2 = ${fee}`)}
          </div>
          <div className="mt-4 grid gap-2">
            <button onClick={() => choose(true)} className="rounded-lg bg-emerald-500 px-3 py-2 font-bold text-white">Approve</button>
            <button onClick={() => choose(false)} className="rounded-lg bg-rose-600 px-3 py-2 font-bold text-white">Deny</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
