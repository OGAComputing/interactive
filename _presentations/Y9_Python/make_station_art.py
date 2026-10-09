"""Station state art: full-slide transparent overlays for sz_kit.cjs's station layers.

    python make_station_art.py   -> station/*.png  (1600 x 900 = the 13.333" x 7.5" slide at 120 px/in)

Every layer keeps to the frame (edges, corners, the strip above the title). The middle of the
slide stays clear, so code, terminals and memory boxes are never drawn over. See README.md,
"Station state".
"""
import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, PPI = 1600, 900, 120
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'station')
os.makedirs(OUT, exist_ok=True)


def save(img, name):
    img.save(os.path.join(OUT, name + '.png'), optimize=True)
    print('wrote station/' + name + '.png')


def rgba(rgb, alpha):
    """Solid colour image with the given 0..1 alpha array."""
    a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    arr = np.zeros((H, W, 4), np.uint8)
    arr[..., :3] = rgb
    arr[..., 3] = a
    return Image.fromarray(arr, 'RGBA')


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def clip_to_frame(img, band=0.5, corner=1.3):
    """Keep only the frame: a band along each edge plus a quarter-circle in each corner (inches),
    fading out over 0.15", so nothing is drawn where slide content sits."""
    edge = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, H - 1 - yy)) / PPI
    keep = np.clip((band - edge) / 0.15, 0, 1)
    for cx, cy in ((0, 0), (W, 0), (0, H), (W, H)):
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / PPI
        keep = np.maximum(keep, np.clip((corner - d) / 0.15, 0, 1))
    arr = np.array(img)
    arr[..., 3] = (arr[..., 3] * keep).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')


# ── Frost: icy corners with crystal branches (Chapter 1) ──────────────────────
def frost():
    rnd = random.Random(7)
    alpha = np.zeros((H, W), np.float32)
    # (corner x, corner y, radius in px, peak alpha). Top-left is weakest: the title starts there.
    corners = [(0, 0, 150, 0.22), (W, 0, 290, 0.42), (0, H, 330, 0.48), (W, H, 300, 0.45)]
    for cx, cy, r, peak in corners:
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
        alpha = np.maximum(alpha, peak * np.clip(1 - d, 0, 1) ** 1.6)
    base = rgba((200, 228, 255), alpha)
    # crystal branches growing in from each corner
    lines = Image.new('RGBA', (W, H))
    dr = ImageDraw.Draw(lines)

    def branch(x, y, ang, length, depth):
        if depth == 0 or length < 6:
            return
        x2, y2 = x + math.cos(ang) * length, y + math.sin(ang) * length
        dr.line([(x, y), (x2, y2)], fill=(225, 240, 255, 95 + depth * 22), width=max(1, depth // 2))
        for turn in (-0.62, 0.62):
            if rnd.random() < 0.8:
                branch(x2, y2, ang + turn + rnd.uniform(-0.15, 0.15), length * rnd.uniform(0.5, 0.68), depth - 1)
        branch(x2, y2, ang + rnd.uniform(-0.12, 0.12), length * 0.72, depth - 1)

    for cx, cy, r, _ in corners[1:]:  # no crystals top-left: the status line and title start there
        toward = math.atan2(H / 2 - cy, W / 2 - cx)
        for k in range(7 if r > 200 else 4):
            ang = toward + rnd.uniform(-0.75, 0.75)
            branch(cx, cy, ang, r * rnd.uniform(0.26, 0.36), 6)
    lines = lines.filter(ImageFilter.GaussianBlur(0.6))
    save(clip_to_frame(Image.alpha_composite(base, lines), band=0.4, corner=1.5), 'frost')


# ── Edge glow: alarm light around the frame (amber = alert, red = lockdown) ──
def edge(name, rgb, peak):
    d = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, H - 1 - yy)) / (0.65 * PPI)
    save(rgba(rgb, peak * np.clip(1 - d, 0, 1) ** 1.8), name)


# ── Hazard stripes along the top and bottom edges (Chapter 3 lockdown) ──────
def hazard():
    img = Image.new('RGBA', (W, H))
    dr = ImageDraw.Draw(img)
    band = int(0.1 * PPI)
    for y0 in (0, H - band):
        dr.rectangle([0, y0, W, y0 + band], fill=(20, 20, 24, 255))
        for x in range(-band * 2, W + band * 2, 36):
            dr.polygon([(x, y0 + band), (x + 18, y0 + band), (x + 18 + band, y0), (x + band, y0)], fill=(232, 180, 50, 255))
    save(img, 'hazard')


# ── Signal static: faint scanlines + glitch bars in the margins (Chapter 4) ──
def static():
    rnd = random.Random(4)
    alpha = np.where((yy.astype(int) % 4) == 0, 0.12, 0.0).astype(np.float32)
    img = rgba((190, 220, 255), alpha)
    dr = ImageDraw.Draw(img)
    margin = int(0.6 * PPI)
    for _ in range(48):  # torn bars, only at the left / right edges and the strip above the title
        h = rnd.randint(2, 10)
        y = rnd.randint(0, H - h)
        w = rnd.randint(20, margin)
        x = rnd.choice([0, W - w])
        col = rnd.choice([(86, 180, 233), (255, 107, 107), (230, 230, 230)])
        dr.rectangle([x, y, x + w, y + h], fill=col + (rnd.randint(80, 170),))
    save(clip_to_frame(img, band=0.6), 'static')


# ── Hull breach: cracks from the corners + claw gouges (Chapter 5) ──────────
def cracks():
    rnd = random.Random(11)
    img = Image.new('RGBA', (W, H))
    dark = ImageDraw.Draw(img)

    def crack(x, y, ang, length, width, depth):
        pts = [(x, y)]
        for _ in range(int(length / 14)):
            ang += rnd.uniform(-0.35, 0.35)
            x, y = x + math.cos(ang) * 14, y + math.sin(ang) * 14
            pts.append((x, y))
            if depth and rnd.random() < 0.14:
                crack(x, y, ang + rnd.choice([-1, 1]) * rnd.uniform(0.5, 1.1), length * 0.45, max(1, width - 1), depth - 1)
        dark.line([(px + 2, py + 2) for px, py in pts], fill=(0, 0, 0, 190), width=width + 2)
        dark.line(pts, fill=(215, 215, 225, 195), width=width)

    crack(0, H - 40, -0.55, 380, 4, 2)
    crack(0, 260, -0.2, 160, 2, 1)
    crack(60, H, -1.15, 240, 2, 2)
    crack(W, 120, 2.6, 300, 4, 2)
    crack(W, H - 60, 3.5, 200, 2, 1)
    # four claw gouges, left edge
    for i in range(4):
        x0, y0 = 10 + i * 15, 370 + i * 10
        pts = [(x0 + 22 * math.sin(t / 10), y0 + t * 12) for t in range(0, 19)]
        dark.line([(px + 2, py + 2) for px, py in pts], fill=(0, 0, 0, 200), width=6)
        dark.line(pts, fill=(190, 60, 60, 210), width=4)
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    save(clip_to_frame(img, band=0.6, corner=1.6), 'cracks')


frost()
edge('edge_amber', (230, 159, 0), 0.58)
edge('edge_red', (220, 50, 50), 0.64)
hazard()
static()
cracks()
