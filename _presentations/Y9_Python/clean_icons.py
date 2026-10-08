"""Rebuild each pillar icon's alpha from the circle's geometry (see ppt-guidelines.md §9).

Finds the coloured circle (pixels that are neither transparent nor near-white),
computes its centre and radius, and replaces the alpha with a 4x-supersampled
geometric disc, so the edge is a clean 1px anti-aliased ring with no halo and
the white glyph inside stays opaque. Output is upscaled to 512px.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Pictures"
OUT = Path(__file__).parent / "icons"
NAMES = ["ClarityOfLearningIntentions", "NewInformation", "DeliberatePractice", "RecapAndRecall", "Feedback"]
SIZE = 512

for name in NAMES:
    im = Image.open(SRC / f"{name}.png").convert("RGBA")
    w, h = im.size
    px = im.load()
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 128 and min(r, g, b) < 235:   # coloured circle pixel
                xs.append(x); ys.append(y)
    x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    rad = ((x1 - x0) + (y1 - y0)) / 4
    # crop a square around the true circle, upscale, then apply a geometric mask
    sq = im.crop((round(cx - rad), round(cy - rad), round(cx + rad), round(cy + rad)))
    sq = sq.resize((SIZE, SIZE), Image.LANCZOS)
    big = Image.new("L", (SIZE * 4, SIZE * 4), 0)
    ImageDraw.Draw(big).ellipse((2, 2, SIZE * 4 - 3, SIZE * 4 - 3), fill=255)
    mask = big.resize((SIZE, SIZE), Image.LANCZOS)
    rgb = sq.convert("RGB")
    # fill any transparent pixels inside the disc with the nearest edge colour (no dark fringe)
    flat = Image.new("RGB", (SIZE, SIZE), rgb.getpixel((SIZE // 2, SIZE // 12)))
    flat.paste(rgb, (0, 0), sq.getchannel("A"))
    out = flat.convert("RGBA"); out.putalpha(mask)
    out.save(OUT / f"{name}.png")
    print(name, f"circle centre=({cx:.1f},{cy:.1f}) r={rad:.1f}")
