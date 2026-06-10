#!/usr/bin/env python3
"""Audit wiki health.

Usage:
  lint_wiki.py <wiki_root> [--json]

Checks:
  errors:   broken_link, missing_frontmatter, invalid_slug
  warnings: orphan, missing_backlink, stale
  info:     unindexed

Frontmatter parsing is intentionally permissive — only the 5 required scalar
fields (title, slug, type, created, updated) are read. Lists/multiline YAML
in optional fields are not parsed; the LLM handles those at write time.
"""
import datetime
import json
import re
import sys
from pathlib import Path

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,49}$")
# wikilink target may include #anchor; strip anchor before resolving as slug
WIKILINK_RE = re.compile(r"\[\[([^\]\|#]+)(?:#[^\]\|]+)?(?:\|[^\]]+)?\]\]")
REQUIRED_FM = ("title", "slug", "type", "created", "updated")
STALE_DAYS = 90
TIME_WORDS = re.compile(r"current|latest|recent|now|today|최신|최근", re.I)


def parse_frontmatter(text: str):
    """Return (fm_dict, body). Tolerates EOF without trailing newline.

    Only top-level scalar `key: value` lines are captured — list/multiline
    YAML is ignored on purpose; the script consumers read scalars only.
    """
    if not text.startswith("---\n"):
        return {}, text
    body_start = -1
    for marker in ("\n---\n", "\n---"):
        idx = text.find(marker, 4)
        if idx >= 0:
            body_start = idx + len(marker)
            fm_text = text[4:idx]
            break
    if body_start < 0:
        return {}, text
    fm = {}
    for line in fm_text.split("\n"):
        if line.startswith((" ", "\t", "-")):
            continue  # nested / list continuation — skip
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        fm[k.strip()] = v.strip()
    return fm, text[body_start:]


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    json_out = "--json" in sys.argv[1:]
    if not args:
        print("usage: lint_wiki.py <wiki_root> [--json]", file=sys.stderr)
        return 2

    root = Path(args[0]).expanduser().resolve()
    pages_dir = root / "wiki" / "pages"
    index_path = root / "wiki" / "index.md"
    if not pages_dir.exists():
        print(f"refuse: {pages_dir} does not exist", file=sys.stderr)
        return 1

    pages = {}
    inbound: dict = {}
    for p in sorted(pages_dir.glob("*.md")):
        text = p.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(text)
        slug = p.stem
        links = set(WIKILINK_RE.findall(body))
        pages[slug] = {"path": str(p), "fm": fm, "body": body, "links": links}
        for tgt in links:
            inbound.setdefault(tgt, set()).add(slug)

    # also count inbound from index/overview so they're not flagged orphan
    for sys_page in (index_path, root / "wiki" / "overview.md"):
        if sys_page.exists():
            for tgt in WIKILINK_RE.findall(sys_page.read_text(encoding="utf-8")):
                inbound.setdefault(tgt, set()).add(sys_page.stem)

    errors, warnings, info = [], [], []
    today = datetime.date.today()

    for slug, p in pages.items():
        if not SLUG_RE.match(slug):
            errors.append({"check": "invalid_slug", "page": slug})
        missing = [k for k in REQUIRED_FM if k not in p["fm"]]
        if missing:
            errors.append({"check": "missing_frontmatter", "page": slug, "fields": missing})
        for tgt in p["links"]:
            if tgt not in pages:
                errors.append({"check": "broken_link", "page": slug, "target": tgt})
        if slug not in inbound and slug not in ("index", "overview"):
            warnings.append({"check": "orphan", "page": slug})
        for tgt in p["links"]:
            if tgt in pages and slug not in pages[tgt]["links"]:
                warnings.append({"check": "missing_backlink", "from": slug, "to": tgt})
        u = p["fm"].get("updated", "")
        try:
            ud = datetime.date.fromisoformat(u[:10])
            if (today - ud).days > STALE_DAYS and TIME_WORDS.search(p["body"]):
                warnings.append({"check": "stale", "page": slug, "updated": u})
        except ValueError:
            pass

    if index_path.exists():
        index_text = index_path.read_text(encoding="utf-8")
        for slug in pages:
            if slug in ("index", "overview"):
                continue
            if f"[[{slug}]]" not in index_text:
                info.append({"check": "unindexed", "page": slug})

    summary = {"scanned": len(pages), "errors": errors, "warnings": warnings, "info": info}

    if json_out:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0

    print(f"# Wiki Lint Report ({today})")
    print(f"Pages scanned: {len(pages)}\n")
    print(f"## Errors ({len(errors)})")
    for e in errors or [{"check": "(none)"}]:
        print(f"- {e}")
    print(f"\n## Warnings ({len(warnings)})")
    for w in warnings or [{"check": "(none)"}]:
        print(f"- {w}")
    print(f"\n## Info ({len(info)})")
    for i in info or [{"check": "(none)"}]:
        print(f"- {i}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
