import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Visible breadcrumb trail (Home › Programs › Explorers) — pair with
 * breadcrumbSchema() from lib/schema.ts for the matching BreadcrumbList
 * JSON-LD. The last item renders as plain text (current page).
 */
export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-gray-500" aria-hidden="true">
                  ›
                </span>
              )}
              {isLast ? (
                <span className="text-gray-300" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="text-gray-400 hover:text-[#E5A823] transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
