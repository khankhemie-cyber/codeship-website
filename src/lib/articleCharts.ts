/**
 * HTML-string builders for charts, tables and checklists inside article `content`.
 *
 * Charts are plain HTML/CSS bars (no images, no JS): they stay readable at phone
 * width, screen readers can read them, and search/AI crawlers can read the numbers.
 * Each chart also carries a "View the data" table with the exact figures.
 * Styles live in `globals.css` under `.article-content .chart`.
 */

export interface ChartRow {
  label: string;
  value: number;
  /** Text shown on the bar. Defaults to `${value}${unit}`. */
  display?: string;
  tone?: "primary" | "dark" | "accent";
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function barChart({
  title,
  rows,
  unit = "",
  max,
  caption,
  source,
  valueHeader = "Value",
}: {
  title: string;
  rows: ChartRow[];
  unit?: string;
  /** Value that fills the whole track. Defaults to the largest row. */
  max?: number;
  /** One-sentence plain reading of the chart. */
  caption: string;
  /** Source line, may contain a link. */
  source: string;
  valueHeader?: string;
}): string {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  const label = (r: ChartRow) => r.display ?? `${r.value}${unit}`;
  const bars = rows
    .map((r) => {
      // Longest bar fills 70% of the track, leaving room for the value label beside it.
      const pct = Math.max(1.5, Math.min(70, (r.value / top) * 70));
      return `<div class="chart-row"><span class="chart-label">${esc(r.label)}</span><span class="chart-track"><span class="chart-bar chart-bar--${r.tone ?? "primary"}" style="width:${pct.toFixed(1)}%"></span><span class="chart-value">${esc(label(r))}</span></span></div>`;
    })
    .join("");
  const tableRows = rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${esc(label(r))}</td></tr>`).join("");
  return `<figure class="chart">
<p class="chart-title">${esc(title)}</p>
<div class="chart-bars" aria-hidden="true">${bars}</div>
<figcaption><span class="chart-caption">${esc(caption)}</span> <span class="chart-source">Source: ${source}</span></figcaption>
<details class="chart-data"><summary>View the data</summary><div class="table-wrap"><table><caption>${esc(title)}</caption><thead><tr><th scope="col">Group</th><th scope="col">${esc(valueHeader)}</th></tr></thead><tbody>${tableRows}</tbody></table></div></details>
</figure>`;
}

export function dataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  /** Cells may contain trusted inline HTML (links, <strong>). */
  rows: string[][];
}): string {
  const head = headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`)
    .join("");
  return `<div class="table-wrap"><table><caption>${esc(caption)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** A tickable checklist. Native checkboxes, so it works without JavaScript and prints cleanly. */
export function checklist({ title, intro, items }: { title: string; intro?: string; items: string[] }): string {
  const li = items.map((t) => `<li><label><input type="checkbox" /> <span>${t}</span></label></li>`).join("");
  return `<section class="checklist" aria-label="${esc(title)}">
<p class="checklist-title">${esc(title)}</p>
${intro ? `<p class="checklist-intro">${intro}</p>` : ""}
<ul>${li}</ul>
</section>`;
}

/** Numbered process steps rendered as a vertical flow diagram. */
export function steps({ title, items }: { title: string; items: { name: string; text: string }[] }): string {
  const li = items.map((s) => `<li><strong>${esc(s.name)}</strong><span>${s.text}</span></li>`).join("");
  return `<figure class="steps"><p class="chart-title">${esc(title)}</p><ol>${li}</ol></figure>`;
}
