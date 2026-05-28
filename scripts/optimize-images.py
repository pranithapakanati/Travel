#!/usr/bin/env python3
"""Convert TRIPON images to WebP and resize oversized assets (homepage priority)."""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"

# max width by filename (homepage + common UI)
MAX_WIDTH = {
    "img1.png": 1920,
    "travel1.png": 1200,
    "reason.png": 1200,
    "gilli.png": 960,
    "couple.png": 800,
    "isolated.png": 800,
    "semiyak81.png": 800,
    "ubud51.png": 800,
    "kuta61.png": 800,
    "conggu.png": 800,
    "volcano.png": 800,
    "nusa61.png": 800,
    "group.png": 1000,
    "map.png": 800,
    "location1.png": 640,
    "location2.png": 640,
    "location3.png": 640,
    "location4.png": 640,
    "location5.png": 640,
    "location6.png": 640,
    "blog_card.png": 720,
    "blog_card1.png": 720,
    "blog_card2.png": 720,
    "blog_card3.png": 720,
    "insta_pic1.png": 400,
    "insta_pic2.png": 400,
    "insta_pic3.png": 400,
}

DEFAULT_MAX = 1400
QUALITY = 82


def optimize_file(path: Path) -> tuple[str, int, int]:
    max_w = MAX_WIDTH.get(path.name, DEFAULT_MAX)
    im = Image.open(path)
    has_alpha = im.mode in ("RGBA", "LA", "P")
    if has_alpha:
        im = im.convert("RGBA")
    else:
        im = im.convert("RGB")

    w, h = im.size
    if w > max_w:
        nh = max(1, int(h * max_w / w))
        im = im.resize((max_w, nh), Image.Resampling.LANCZOS)

    out = path.with_suffix(".webp")
    save_kw = {"quality": QUALITY, "method": 6}
    if has_alpha:
        im.save(out, "WEBP", **save_kw)
    else:
        im.save(out, "WEBP", **save_kw)

    before = path.stat().st_size
    after = out.stat().st_size
    return out.name, before, after


def main() -> None:
    targets = list(MAX_WIDTH.keys())
    if len(sys.argv) > 1:
        targets = sys.argv[1:]

    total_before = 0
    total_after = 0
    for name in targets:
        path = IMG / name
        if not path.is_file():
            print(f"skip (missing): {name}")
            continue
        out_name, before, after = optimize_file(path)
        total_before += before
        total_after += after
        print(f"{name} -> {out_name}: {before // 1024}KB -> {after // 1024}KB")

    print(f"Total: {total_before // 1024}KB -> {total_after // 1024}KB")


if __name__ == "__main__":
    main()
