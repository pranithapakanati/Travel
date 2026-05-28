#!/usr/bin/env python3
"""Patch TRIPON HTML files for faster font/CSS loading."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

OLD_FONT = re.compile(
    r'<link\s+href="https://fonts\.googleapis\.com/css2\?family=Caveat[^"]+"\s+rel="stylesheet"\s*/>',
    re.I,
)

NEW_FONT_BLOCK = """<link rel="preload" as="style"
    href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Poppins:wght@400;500;600;700&display=swap"
    onload="this.onload=null;this.rel='stylesheet'" />
  <noscript>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Poppins:wght@400;500;600;700&display=swap" />
  </noscript>"""

FA_LINK = re.compile(
    r'\s*<link[^>]+font-awesome[^>]+>\s*',
    re.I,
)

PERF_SCRIPT = '  <script src="{prefix}assets/js/perf.js"></script>\n'

GSAP_SCRIPTS = re.compile(
    r'\s*<script[^>]+gsap[^>]+></script>\s*',
    re.I,
)


def prefix_for(path: Path) -> str:
    rel = path.relative_to(ROOT)
    depth = len(rel.parts) - 1
    if depth <= 0:
        return ""
    return "../" * depth


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    prefix = prefix_for(path)

    if "fonts.googleapis.com/css2" in text and "rel=\"preload\" as=\"style\"" not in text:
        text = OLD_FONT.sub(NEW_FONT_BLOCK, text)
        # Poppins-only pages
        text = re.sub(
            r'<link href="https://fonts\.googleapis\.com/css2\?family=Poppins[^"]+" rel="stylesheet" />',
            NEW_FONT_BLOCK.replace("Caveat:wght@700&", ""),
            text,
            flags=re.I,
        )

    text = FA_LINK.sub("\n", text)

    if "perf.js" not in text and "</head>" in text:
        perf = PERF_SCRIPT.format(prefix=prefix)
        if "package-details.css" in text and path.name == "index.html":
            text = text.replace(
                '  <link rel="stylesheet" href="assets/css/package-details.css" />\n', ""
            )
        text = text.replace("</head>", f"{perf}{'</head>'}")

    if path.name == "index.html":
        text = GSAP_SCRIPTS.sub("\n", text)
        text = re.sub(
            r'<script src="assets/js/includes\.js"></script>\s*<script defer>\s*document\.addEventListener',
            '<script src="assets/js/includes.js" defer></script>\n  <script defer>\n    document.addEventListener',
            text,
        )

    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def main() -> None:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if "node_modules" in path.parts:
            continue
        if patch_file(path):
            changed += 1
            print(f"patched: {path.relative_to(ROOT)}")
    print(f"Done. {changed} file(s) updated.")


if __name__ == "__main__":
    main()
