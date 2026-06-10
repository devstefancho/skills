#!/usr/bin/env python3
"""Append an entry to wiki/log.md (append-only).

Usage:
  append_log.py <wiki_root> <op> <description>

<description> must not contain newlines (would break the heading).
Optional body bullets via stdin.
"""
import datetime
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: append_log.py <wiki_root> <op> <description>", file=sys.stderr)
        return 2

    root = Path(sys.argv[1]).expanduser().resolve()
    op, description = sys.argv[2], sys.argv[3]
    if "\n" in description:
        print("refuse: description must not contain newlines", file=sys.stderr)
        return 2
    log = root / "wiki" / "log.md"
    if not log.exists():
        print(f"refuse: {log} does not exist", file=sys.stderr)
        return 1

    today = datetime.date.today().isoformat()
    body = sys.stdin.read() if not sys.stdin.isatty() else ""

    entry = f"\n## [{today}] {op} | {description}\n"
    if body.strip():
        entry += body if body.endswith("\n") else body + "\n"

    with log.open("a", encoding="utf-8") as f:
        f.write(entry)
    print(f"ok: appended to {log}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
