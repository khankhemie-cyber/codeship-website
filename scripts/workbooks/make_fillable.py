"""Add AcroForm fields to the CODEship workbooks (Chrome-printed, no forms).

Detects, per page:
  - writing lines (thin light-blue/grey rules)  -> single-line text field above the line
  - empty checkbox squares (navy stroke)         -> checkbox
  - dashed boxes / empty navy outlined boxes     -> multi-line text field
  - "Done" column cells in tracker tables        -> checkbox
  - dotted blanks ("It ..........")             -> text field over the dots
Empty star boxes (a digit label in the corner) become checkboxes that show an
orange star when ticked.

usage: python3 make_fillable.py IN.pdf OUT.pdf "PDF title" [preview-png-prefix]
needs: pip install pymupdf   (see "Student workbooks" in README.md)
"""
import sys, re, pymupdf

WRITE_COLS = {(0.623, 0.69, 0.78), (0.835, 0.863, 0.902), (0.365, 0.439, 0.514)}
NAVY = (0.004, 0.059, 0.165)

def rc(c):
    return tuple(round(x, 3) for x in c) if c else None

def overlap_x(a, b):
    return max(0, min(a.x1, b.x1) - max(a.x0, b.x0))

def draw_star(doc, xref):
    """Replace a checkbox's ticked look with an orange ZapfDingbats star (glyph 'H')."""
    typ, val = doc.xref_get_key(xref, "AP/N")
    on = [k for k in re.findall(r"/([A-Za-z0-9]+)\s+\d+ 0 R", val) if k != "Off"]
    r = doc.xref_get_key(xref, "Rect")[1].strip("[] ").split()
    w, h = float(r[2]) - float(r[0]), float(r[3]) - float(r[1])
    size = min(w, h) * 1.05
    doc.xref_set_key(xref, "MK/CA", "(H)")
    doc.xref_set_key(xref, "DA", "(0.835 0.518 0.004 rg /ZaDb 0 Tf)")
    for name in on:
        sx = int(doc.xref_get_key(xref, f"AP/N/{name}")[1].split()[0])
        doc.xref_set_key(sx, "Resources", "<</Font<</ZaDb<</Type/Font/Subtype/Type1/BaseFont/ZapfDingbats>>>>>>")
        x0 = (w - size * 0.82) / 2; y0 = (h - size * 0.72) / 2
        doc.update_stream(sx, f"q 0.835 0.518 0.004 rg BT /ZaDb {size:.2f} Tf {x0:.2f} {y0:.2f} Td (H) Tj ET Q".encode())

def main(src, dst, title="", preview=None):
    doc = pymupdf.open(src)
    total = {}
    for pno, page in enumerate(doc):
        draws = page.get_drawings()
        tlines = []
        for b in page.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                txt = "".join(s["text"] for s in l["spans"]).strip()
                if txt:
                    tlines.append((pymupdf.Rect(l["bbox"]), txt, l["spans"]))
        hlines, boxes, areas = [], [], []
        seen = set()
        for d in draws:
            r = d["rect"]; n = len(d["items"])
            col = rc(d.get("fill") or d.get("color"))
            key = (round(r.x0), round(r.y0), round(r.x1), round(r.y1))
            if r.height < 1.6 and r.width > 40 and n == 1 and col in WRITE_COLS:
                hlines.append(r)
            elif d["type"] == "s" and col == NAVY and 9 < r.width < 16 and abs(r.width - r.height) < 1.5:
                boxes.append(r)
            elif r.width > 30 and r.height > 30 and key not in seen and (
                (sum(it[0] == "l" for it in d["items"]) > 20 and d["type"] in ("f", "s", "fs") and col != (1.0, 1.0, 1.0))      # dashed outline
                or (d["type"] in ("s", "fs") and rc(d.get("color")) == NAVY
                    and rc(d.get("fill")) in (None, (1.0, 1.0, 1.0))
                    and any(it[0] == "l" for it in d["items"]))):                             # solid navy outline
                if (d["type"] == "fs" and rc(d.get("color")) != NAVY) or (d["type"] == "f" and d.get("fill_opacity", 1) < 1):
                    continue
                seen.add(key); areas.append(r)

        # rules inside an outlined shape (e.g. a drawn stack of code blocks) are not writing lines
        outlines = [d["rect"] for d in draws if d["type"] == "s" and rc(d.get("color")) == NAVY
                    and d["rect"].width > 30 and d["rect"].height > 30]
        pix = page.get_pixmap(dpi=36)
        sx = pix.width / page.rect.width
        def shade(x, y):
            c = pix.pixel(min(pix.width - 1, int(x * sx)), min(pix.height - 1, int(y * sx)))
            return sum(c[:3]) / 3
        hlines = [h for h in hlines if not (any(o.contains(h) for o in outlines)
                                            and shade((h.x0 + h.x1) / 2, h.y0 - 4) < 250)]
        fields = []   # (kind, rect, tooltip)
        def label_above(r, maxd=60):
            best = None
            for tr, txt, _ in tlines:
                if tr.y1 <= r.y0 + 2 and r.y0 - tr.y1 < maxd and overlap_x(tr, r) > 5:
                    if best is None or tr.y1 > best[0].y1:
                        best = (tr, txt)
            return best[1] if best else ""

        # writing lines
        for r in hlines:
            obst = [tr for tr, _, _ in tlines if tr.y1 <= r.y0 + 1 and overlap_x(tr, r) > 2]
            obst += [h for h in hlines if h is not r and h.y1 <= r.y0 and overlap_x(h, r) > 10]
            top = max([o.y1 for o in obst if r.y0 - o.y1 < 40], default=r.y0 - 20)
            h = min(r.y0 - top - 1.5, 18)
            if h < 8:
                continue
            fr = pymupdf.Rect(r.x0, r.y0 - h, r.x1, r.y0)
            fields.append(("text", fr, ""))
        # checkboxes, drawn or typed as a ballot-box glyph
        for tr, txt, spans in tlines:
            for sp in spans:
                if sp["text"].strip() == "\u2610":
                    b = pymupdf.Rect(sp["bbox"]); c = (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2
                    boxes.append(pymupdf.Rect(c[0] - 7, c[1] - 6, c[0] + 7, c[1] + 8))
        for r in boxes:
            fields.append(("check", r, ""))
        # areas
        def inside(a, r, pad=1):
            return a.x0 >= r.x0 - pad and a.y0 >= r.y0 - pad and a.x1 <= r.x1 + pad and a.y1 <= r.y1 + pad
        for r in areas:
            if any(inside(h, r) for h in hlines) or any(inside(b, r) for b in boxes):
                continue
            if any(inside(a, r) and a != r for a in areas):
                continue   # a container of other areas (e.g. step grid)
            inner = [tr for tr, _, _ in tlines if inside(tr, r)]
            top = r.y0 + 4
            for tr in inner:
                if tr.y0 - r.y0 < 20:          # small label/number in the top edge
                    top = max(top, tr.y1 + 2) if tr.width > 30 else top
                else:
                    top = None; break
            if top is None:
                continue
            fr = pymupdf.Rect(r.x0 + 4, top, r.x1 - 4, r.y1 - 4)
            # skip the label column of a number box: keep away from tiny digits
            if fr.height < 20 or fr.width < 30:
                continue
            small = fr.height < 130 and fr.width < 130 and any(re.fullmatch(r"\d", x) and inside(t, r) for t, x, _ in tlines)
            fields.append(("star" if small else "area", fr, ""))
        # dotted blanks
        for tr, txt, spans in tlines:
            for s in spans:
                m = re.search(r"[.…]{5,}", s["text"])
                if m:
                    sb = pymupdf.Rect(s["bbox"])
                    n = len(s["text"]) or 1
                    x0 = sb.x0 + sb.width * m.start() / n
                    x1 = sb.x0 + sb.width * m.end() / n
                    fields.append(("text", pymupdf.Rect(x0, sb.y0 - 2, x1, sb.y1 + 1), ""))
        # empty right-hand cells next to "Class N" labels (link tables)
        grey = [d["rect"] for d in draws if rc(d.get("fill")) == (0.812, 0.843, 0.886)
                and d["rect"].height < 1.6 and d["rect"].width > 40]
        for i, (tr, txt, _) in enumerate(tlines):
            if txt == "Class" and i + 1 < len(tlines) and re.fullmatch(r"\d", tlines[i + 1][1]):
                tops = [g for g in grey if tr.y0 - 10 < g.y0 <= tr.y0 and g.x0 > tr.x1]
                if not tops:
                    continue
                t = min(tops, key=lambda g: g.x0)
                bots = [g for g in grey if abs(g.x0 - t.x0) < 2 and g.y0 > t.y0 + 10]
                if not bots:
                    continue
                b = min(bots, key=lambda g: g.y0)
                fields.append(("text", pymupdf.Rect(t.x0 + 4, t.y1 + 2, t.x1 - 4, b.y0 - 2), ""))
        # "Done" column in tracker tables
        for tr, txt, _ in tlines:
            if txt == "Done":
                col_x0, col_x1 = tr.x0 - 6, tr.x1 + 12
                rows = sorted({round(t.y0) for t, x, _ in tlines
                               if re.fullmatch(r"\d", x) and t.y0 > tr.y1 and t.y0 - tr.y1 < 260
                               and t.x1 < col_x0 and col_x0 - t.x0 < 320})
                for y in rows:
                    cx = (col_x0 + col_x1) / 2
                    fields.append(("check", pymupdf.Rect(cx - 6, y - 1, cx + 6, y + 11), ""))

        # dark-background detection
        def dark(r):
            x = min(pix.width - 1, int((r.x0 + r.x1) / 2 * sx)); y = min(pix.height - 1, int((r.y0 + r.y1) / 2 * sx))
            c = pix.pixel(x, y)
            return sum(c[:3]) / 3 < 90

        fields = [f for f in fields if not (f[0] == "area" and dark(f[1]))]
        counters = {}
        stars = []
        for kind, fr, tip in fields:
            counters[kind] = counters.get(kind, 0) + 1
            w = pymupdf.Widget()
            w.field_name = f"p{pno+1}_{kind}{counters[kind]}"
            w.rect = fr
            w.border_width = 0
            w.border_color = None
            w.fill_color = None
            w.field_label = tip or label_above(fr) or f"Page {pno+1}"
            if kind in ("check", "star"):
                w.field_type = pymupdf.PDF_WIDGET_TYPE_CHECKBOX
                w.text_color = (0.835, 0.518, 0.004) if kind == "star" else NAVY
                w.field_value = False
                if kind == "star":
                    # centre a square inside the box
                    s = min(fr.width, fr.height) * 0.8
                    cx, cy = (fr.x0 + fr.x1) / 2, (fr.y0 + fr.y1) / 2 + 3
                    w.rect = pymupdf.Rect(cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2)
                    w.button_caption = "H"   # ZapfDingbats star
            else:
                w.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
                w.text_font = "Helv"
                w.text_color = (1, 1, 1) if dark(fr) else NAVY
                if kind == "area":
                    w.field_flags = pymupdf.PDF_TX_FIELD_IS_MULTILINE
                    w.text_fontsize = 11
                else:
                    w.text_fontsize = 0
            page.add_widget(w)
            if kind == "star":
                stars.append(w.field_name)
        for wd in page.widgets():
            if wd.field_name in stars:
                draw_star(doc, wd.xref)
        total[pno + 1] = counters
    # default resources so every viewer can draw the typed text (Helvetica, ZapfDingbats ticks/stars)
    cat = doc.pdf_catalog()
    doc.xref_set_key(cat, "AcroForm/DR", "<</Font<</Helv<</Type/Font/Subtype/Type1/BaseFont/Helvetica"
                     "/Encoding/WinAnsiEncoding>>/ZaDb<</Type/Font/Subtype/Type1/BaseFont/ZapfDingbats>>>>>>")
    doc.xref_set_key(cat, "AcroForm/DA", "(/Helv 0 Tf 0 g)")
    doc.set_metadata({**doc.metadata, "title": title or "CODEship Student Workbook"})
    doc.save(dst, garbage=3, deflate=True)
    for k, v in total.items():
        print(k, v)
    if preview:
        out = pymupdf.open(dst)
        for pno, page in enumerate(out):
            for w in page.widgets():
                page.draw_rect(w.rect, color=(1, 0, 0) if w.field_type == pymupdf.PDF_WIDGET_TYPE_TEXT else (0, 0.7, 0), width=0.8)
            page.get_pixmap(dpi=60).save(f"{preview}-{pno+1:02d}.png")

if __name__ == "__main__":
    main(*sys.argv[1:])
