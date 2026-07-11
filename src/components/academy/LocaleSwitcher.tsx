import Link from "next/link";
import type { Locale } from "@/data/academy/curriculum";

const LABEL: Record<Locale, string> = { en: "English", fr: "Français" };

export default function LocaleSwitcher({
  available,
  current,
  basePath,
}: {
  available: Locale[];
  current: Locale;
  basePath: string;
}) {
  if (available.length < 2) return null;
  return (
    <nav aria-label={current === "fr" ? "Changer de langue" : "Change language"} className="flex gap-2 text-sm">
      {available.map((locale) => (
        <Link
          key={locale}
          href={locale === "en" ? basePath : `${basePath}?lang=${locale}`}
          aria-current={locale === current ? "true" : undefined}
          className={
            locale === current
              ? "font-semibold text-[#001532] underline"
              : "text-[#138A9A] hover:underline"
          }
        >
          {LABEL[locale]}
        </Link>
      ))}
    </nav>
  );
}
