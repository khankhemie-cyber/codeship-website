// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
"use client";

import { useState } from "react";
import { AISLES, type BlockColor } from "@/lib/games/port/missions";

/** Portside Market prices, in coins. */
export const FOOD_PRICES: Record<string, number> = {
  rice: 3, beans: 3, pasta: 4, flour: 3, milk: 4, cheese: 6, yogurt: 5, eggs: 5,
  apples: 2, bananas: 2, mangoes: 4, oranges: 3, bread: 4, cookies: 5, crackers: 4, cereal: 6,
};
const COLORS: { c: BlockColor; price: number; swatch: string }[] = [
  { c: "white", price: 30, swatch: "#f3f1ea" },
  { c: "teal", price: 40, swatch: "#1f8a9e" },
  { c: "yellow", price: 40, swatch: "#f5c33d" },
  { c: "glass", price: 60, swatch: "#9fd8ef" },
];

/**
 * The Portside Market register: spend the coins you earn on groceries for your
 * fridge at home, or on new block colours for building.
 */
export default function ShopPanel({
  coins,
  pantry,
  owned,
  onBuyFood,
  onBuyColor,
  onClose,
}: {
  coins: number;
  pantry: Record<string, number>;
  owned: BlockColor[];
  onBuyFood: (item: string) => void;
  onBuyColor: (c: BlockColor) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"food" | "blocks">("food");
  const inFridge = Object.entries(pantry).filter(([, n]) => n > 0);

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#0d1b2a] p-5 shadow-2xl ring-1 ring-white/15" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber">Portside Market register</div>
            <h2 className="text-2xl font-extrabold">What would you like?</h2>
            <p className="mt-1 font-bold text-amber">You have {coins} coins</p>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold">Close (Esc)</button>
        </div>

        <div className="mt-4 flex rounded-lg bg-white/10 p-1" role="tablist">
          {(["food", "blocks"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-bold ${tab === t ? "bg-amber text-navy" : "text-white/80"}`}>
              {t === "food" ? "Groceries" : "Building blocks"}
            </button>
          ))}
        </div>

        {tab === "food" ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {AISLES.map((row, a) => (
                <div key={a} className="rounded-xl bg-white/5 p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">Aisle {a + 1}</div>
                  <ul className="mt-1 grid gap-1">
                    {row.map((item) => (
                      <li key={item} className="flex items-center justify-between gap-2">
                        <span>
                          {item} <span className="text-white/60">· {FOOD_PRICES[item]} coins</span>
                        </span>
                        <button
                          onClick={() => onBuyFood(item)}
                          disabled={coins < FOOD_PRICES[item]}
                          className="rounded-md bg-amber px-2 py-0.5 text-xs font-bold text-navy disabled:opacity-40"
                        >
                          Buy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-white/75">
              <span className="font-bold text-white">Your fridge:</span>{" "}
              {inFridge.length ? inFridge.map(([k, n]) => `${k} ×${n}`).join(", ") : "empty"}
            </p>
          </>
        ) : (
          <div className="mt-4 grid gap-2">
            <p className="text-sm text-white/75">Brick, wood and stone are free. Unlock more colours for building by hand.</p>
            {COLORS.map(({ c, price, swatch }) => {
              const has = owned.includes(c);
              return (
                <div key={c} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3">
                  <span className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-md ring-2 ring-white/20" style={{ background: swatch }} aria-hidden />
                    <span className="font-bold">{c[0].toUpperCase() + c.slice(1)} blocks</span>
                  </span>
                  {has ? (
                    <span className="text-sm font-bold text-emerald-300">Unlocked</span>
                  ) : (
                    <button onClick={() => onBuyColor(c)} disabled={coins < price} className="rounded-md bg-amber px-3 py-1 text-sm font-bold text-navy disabled:opacity-40">
                      Buy · {price} coins
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-xs text-white/60">Earn coins by finishing challenges, finding bits, lighting lookouts and cleaning the beach. A coded Shore Bot earns coins every tide.</p>
      </div>
    </div>
  );
}
