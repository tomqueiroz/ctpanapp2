"""Validate authored assessments against the exact, published PDFs (no DB writes).

Usage: python scripts/verify-assessment-bank.py <current-pdfs-directory>
The authoritative source is supabase/assessments/20261019-bank.psv.
This validator deliberately checks evidence text as well as structural invariants.
"""
import collections
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
BANK_VERSION = "pdf-current-20261019-v1"
FINAL_ID = "56ce49d1-9272-55f0-b9e5-e126e7cc927b"

def normalize(text):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower())

def load_bank(pdf_dir):
    rows = []
    counts = collections.Counter()
    for line in (PROJECT / "supabase/assessments/20261019-bank.psv").read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        chapter, page, question, correct, *tail = line.split("|")
        distractors, evidence = tail[:4], tail[4]
        chapter, page = int(chapter), int(page)
        assert len(tail) == 5, (chapter, question, "five alternatives and evidence required")
        options = [correct] + distractors
        assert len({re.sub(r"\s+", " ", o).strip().casefold() for o in options}) == 5, (chapter, question, "duplicate alternatives")
        text_pages = (pdf_dir / f"chapter-{chapter}.txt").read_text().split("\f")
        assert normalize(evidence) in normalize(text_pages[page - 1]), (chapter, page, evidence)
        counts[chapter] += 1
        rows.append(dict(chapter=chapter, page=page, question=question, options=options,
                         correct_answer=0, evidence=evidence, order_index=counts[chapter]-1,
                         pdf_sha256=hashlib.sha256((pdf_dir / f"chapter-{chapter}.pdf").read_bytes()).hexdigest()))
    assert counts == {n: 10 for n in range(1, 13)}, counts
    assert len({r["question"] for r in rows}) == 120
    return rows

def load_final(pdf_dir):
    rows = []
    for line in (PROJECT / "supabase/assessments/20261019-final.psv").read_text().splitlines():
        if not line or line.startswith("#"):
            continue
        references, question, *options = line.split("|")
        assert len(options) == 5
        assert len({o.strip().casefold() for o in options}) == 5
        sources = []
        for ref in references.split("~"):
            chapter, page, evidence = ref.split(":", 2)
            chapter, page = int(chapter), int(page)
            pages = (pdf_dir / f"chapter-{chapter}.txt").read_text().split("\f")
            assert normalize(evidence) in normalize(pages[page-1]), (chapter, page, evidence)
            sources.append(dict(chapter=chapter, page=page, evidence=evidence,
                pdf_sha256=hashlib.sha256((pdf_dir / f"chapter-{chapter}.pdf").read_bytes()).hexdigest()))
        rows.append(dict(chapter=0, question=question, options=options, correct_answer=0,
                         order_index=len(rows), sources=sources))
    assert len(rows) == 10
    assert {s["chapter"] for row in rows for s in row["sources"]} == set(range(1,13))
    return rows

if __name__ == "__main__":
    rows = load_bank(Path(sys.argv[1]))
    final = load_final(Path(sys.argv[1]))
    print(json.dumps({"ok": True, "chapter_exams": 12, "questions": len(rows),
                      "alternatives_each": 5, "page_evidence_checks": len(rows),
                      "final_questions": len(final), "final_source_chapters": 12,
                      "bank_version": BANK_VERSION}, ensure_ascii=False))
