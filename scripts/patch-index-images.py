#!/usr/bin/env python3
"""Add WebP sources and lazy-loading to index.html images."""
from __future__ import annotations

import re
from pathlib import Path

INDEX = Path(__file__).resolve().parents[1] / "index.html"

WEBP_IMAGES = {
    "location1.png",
    "location2.png",
    "location3.png",
    "location4.png",
    "location5.png",
    "location6.png",
    "reason.png",
    "couple.png",
    "isolated.png",
    "gilli.png",
    "semiyak81.png",
    "ubud51.png",
    "kuta61.png",
    "conggu.png",
    "volcano.png",
    "nusa61.png",
    "travel1.png",
    "map.png",
    "group.png",
    "blog_card.png",
    "blog_card1.png",
    "blog_card2.png",
    "blog_card3.png",
    "insta_pic1.png",
    "insta_pic2.png",
    "insta_pic3.png",
}


def picture_tag(src: str, attrs: str) -> str:
    webp = src.replace(".png", ".webp")
    return (
        f'<picture><source srcset="assets/images/{webp}" type="image/webp" />'
        f'<img {attrs} src="assets/images/{src}" loading="lazy" decoding="async" /></picture>'
    )


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")

    for name in WEBP_IMAGES:
        pattern = rf'<img([^>]*?)src="assets/images/{re.escape(name)}"([^>]*?)>'

        def repl(m, n=name):
            attrs = f"{m.group(1).strip()} {m.group(2).strip()}".strip()
            if "loading=" in attrs or "<picture>" in attrs:
                return m.group(0)
            return picture_tag(n, attrs)

        text = re.sub(pattern, repl, text)

    # pravatar external - lazy only
    text = re.sub(
        r'(<img src="https://i\.pravatar\.cc/[^"]+")',
        r'\1 loading="lazy" decoding="async"',
        text,
    )
    text = re.sub(
        r'(<img src="https://images\.unsplash\.com/[^"]+")',
        r'\1 loading="lazy" decoding="async"',
        text,
    )

    INDEX.write_text(text, encoding="utf-8", newline="\n")
    print("index.html images patched")


if __name__ == "__main__":
    main()
