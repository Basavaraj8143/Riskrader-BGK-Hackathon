"""
generate_icons.py — Run once to generate RiskRadar extension icons.
Requires Pillow: pip install Pillow

Usage: python generate_icons.py
Creates icons/icon16.png, icons/icon48.png, icons/icon128.png
"""

from PIL import Image, ImageDraw  # noqa: E402 — Pillow installed, run: pip install Pillow
import os, math

os.makedirs("icons", exist_ok=True)

def draw_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Background circle
    d.ellipse([0, 0, size - 1, size - 1], fill="#0f172a")

    # Shield body (simplified polygon)
    cx, cy = size / 2, size / 2
    s = size * 0.38

    shield = [
        (cx, cy - s),               # top centre
        (cx + s, cy - s * 0.55),    # top right
        (cx + s, cy + s * 0.15),    # mid right
        (cx, cy + s),               # bottom tip
        (cx - s, cy + s * 0.15),    # mid left
        (cx - s, cy - s * 0.55),    # top left
    ]
    d.polygon(shield, fill="#ef4444")

    # Inner highlight (lighter gradient feel)
    inner = [(x * 0.72 + cx * 0.28, y * 0.72 + cy * 0.28) for x, y in shield]
    d.polygon(inner, fill="#f97316")

    # White radar dot in centre
    r = max(1, size * 0.06)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="white")

    return img


for sz in [16, 48, 128]:
    draw_icon(sz).save(f"icons/icon{sz}.png")
    print(f"Generated icons/icon{sz}.png")

print("Done.")
