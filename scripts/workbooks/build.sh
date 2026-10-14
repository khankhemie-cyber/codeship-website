#!/usr/bin/env sh
# Rebuild the fillable Semester 1 workbooks served (password-gated) at /workbooks.
#
# 1. Put the original PDFs in scripts/workbooks/private/source/ (gitignored: this repo is public).
# 2. WORKBOOK_FILE_KEY=<the site's key> sh scripts/workbooks/build.sh   (needs: pip install pymupdf)
#
# Fillable PDFs land in scripts/workbooks/private/fillable/ for checking; only the encrypted
# copies in public/workbooks/encrypted/ are committed.
set -e
cd "$(dirname "$0")"
SRC=private/source
OUT=private/fillable
mkdir -p "$OUT"
for p in Builders Developers Engineers; do
  lower=$(echo "$p" | tr 'A-Z' 'a-z')
  python3 make_fillable.py "$SRC/CODEship_${p}_S1_Student_Workbook.pdf" "$OUT/codeship-${lower}-s1-workbook.pdf" "CODEship ${p} · Semester 1 Student Workbook"
done
python3 make_fillable.py "$SRC/CODEship_Explorers_S1_Child_Workbook.pdf" "$OUT/codeship-explorers-s1-workbook.pdf" "CODEship Explorers · Semester 1 Workbook"
node encrypt.mjs
