"""Cut the AlexCraft robot source images into part images for every tier.

    python chop_robot.py <repo>/_side/AlexCraft/robot [preview.png]

Writes robot/<skin>/<part>.webp (+ head_off.webp: eyes unlit) for wooden, iron and steel,
and robot/layout.json. The page copies layout.json into its LAYOUT constant.

All tiers share the wooden robot's frame (476 x 737 px), so parts of different tiers can be
mixed on one robot. Each iron/steel part keeps its own shape, is scaled to about the size of
the wooden part (geometric mean of the width and height ratios) and is pinned to the joint
it hangs from: arms by the shoulder, legs and head by their top, the antenna by its base.
The gem goes in whichever body is built, so each body records where its socket is.
"""
import sys, os, json
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
PREVIEW = sys.argv[2] if len(sys.argv) > 2 else None
FRAME = (466, 15, 942, 752)          # wooden robot frame in wooden_robot_source.jpg
FW, FH = FRAME[2] - FRAME[0], FRAME[3] - FRAME[1]


def box(x0, y0, x1, y1):
    return lambda yy, xx: (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)


def steel_body(yy, xx):
    # torso above the hips, plus the hip bowl, which overlaps the tops of the legs
    bowl = Image.new('L', (1024, 1024), 0)
    ImageDraw.Draw(bowl).polygon([(350, 680), (355, 680), (375, 705), (420, 725), (465, 752), (480, 760),
                                  (540, 760), (560, 752), (600, 730), (650, 705), (672, 680), (705, 680)], fill=255)
    bowl = bowl.filter(ImageFilter.MaxFilter(13))   # take the bowl's dark outline too
    return (box(318, 400, 707, 681)(yy, xx)) | (np.array(bowl).astype(bool) & (yy >= 680))


def steel_leg(x0, x1):
    body = None
    def f(yy, xx):
        nonlocal body
        if body is None:
            body = steel_body(yy, xx)
        return box(x0, 680, x1, 1000)(yy, xx) & ~body
    return f


SKINS = {
    'wooden': dict(src='wooden_robot_source.jpg',
        parts=dict(leg_left=box(560, 557, 703, 752), leg_right=box(705, 557, 850, 752), body=box(549, 327, 859, 557),
                   arm_left=box(466, 337, 549, 630), arm_right=box(859, 337, 942, 630), head=box(578, 129, 830, 327),
                   antenna=box(660, 15, 750, 129)),
        eyes=[(647, 217, 27), (760, 220, 27)], gem=(704, 421, 33),
        off_eye=(52, 36, 22), socket=(60, 38, 22)),
    'iron': dict(src='iron_robot_source.jpg',
        parts=dict(leg_left=box(300, 760, 512, 995), leg_right=box(512, 760, 725, 995), body=box(300, 420, 725, 755),
                   arm_left=box(130, 420, 305, 900), arm_right=box(720, 420, 895, 900), head=box(300, 162, 725, 415),
                   antenna=box(440, 20, 580, 162)),
        eyes=[(432, 275, 24), (590, 275, 24)], gem=(513, 545, 40),
        off_eye=(40, 34, 30), socket=(34, 28, 24)),
    'steel': dict(src='steel_robot_source.jpg',
        parts=dict(leg_left=steel_leg(330, 512), leg_right=steel_leg(512, 700), body=steel_body,
                   arm_left=box(150, 400, 318, 875), arm_right=box(707, 400, 875, 875), head=box(320, 174, 705, 400),
                   antenna=box(440, 30, 585, 174)),
        eyes=[(437, 275, 34), (587, 275, 34)], gem=(511, 545, 44),
        off_eye=(26, 40, 66), socket=(22, 34, 58)),
}
# where each part is pinned to the wooden part's box: (horizontal, vertical)
ANCHOR = dict(leg_left=('centre', 'top'), leg_right=('centre', 'top'), body=('centre', 'top'),
              arm_left=('right', 'top'), arm_right=('left', 'top'), head=('centre', 'top'),
              antenna=('centre', 'bottom'))
PARTS = list(ANCHOR)


def cut_background(rgb):
    a = np.array(rgb).astype(int)
    near = (a.min(axis=2) >= 228).astype(np.uint8) * 255
    m = Image.fromarray(near, 'L').copy()
    for seed in [(0, 0), (m.width - 1, 0), (0, m.height - 1), (m.width - 1, m.height - 1)]:
        ImageDraw.floodfill(m, seed, 128)
    bg = np.array(m) == 128
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    alpha = np.array(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8)))
    alpha[bg & (alpha < 40)] = 0
    return np.dstack([a.astype(np.uint8), alpha])


def circle(shape, cx, cy, r):
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    return np.clip(r + 0.5 - np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2), 0, 1)


def dark_glass(arr, cx, cy, r, colour):
    """Paint an unlit glass circle (dark, slightly lighter at the top)."""
    cm = circle(arr.shape, cx, cy, r)
    yy, xx = np.mgrid[0:arr.shape[0], 0:arr.shape[1]]
    d = np.clip(np.sqrt((xx - cx) ** 2 + (yy - cy + r * .25) ** 2) / r, 0, 1.4)
    for c in range(3):
        fill = colour[c] * (1.25 - .45 * d)
        arr[..., c] = (arr[..., c] * (1 - cm) + fill * cm).astype(np.uint8)


def drop_specks(arr, min_frac=0.02):
    """Clear bits of a part smaller than min_frac of it (slivers left by a cut line)."""
    solid = (arr[..., 3] > 20).astype(np.uint8) * 255
    lab = Image.fromarray(solid, 'L').copy()
    total, k = solid.astype(bool).sum(), 0
    while k < 250:
        ys, xs = np.where(np.array(lab) == 255)
        if not len(ys):
            break
        k += 1
        ImageDraw.floodfill(lab, (int(xs[0]), int(ys[0])), k)
        piece = np.array(lab) == k
        if piece.sum() < min_frac * total:
            arr[..., 3][piece] = 0


def tight(mask):
    ys, xs = np.where(mask)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


wooden_boxes = {}
layout = {}
for skin, cfg in SKINS.items():
    os.makedirs(f'{OUT}/{skin}', exist_ok=True)
    rgba = cut_background(Image.open(os.path.join(HERE, cfg['src'])).convert('RGB'))
    h, w = rgba.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    gx, gy, gr = cfg['gem']
    layout[skin] = {}
    for part in PARTS:
        region = cfg['parts'][part](yy, xx)
        arr = rgba.copy()
        arr[..., 3] = np.where(region, arr[..., 3], 0)
        drop_specks(arr)
        if part == 'body':
            dark_glass(arr, gx, gy, gr, cfg['socket'])
        x0, y0, x1, y1 = tight(arr[..., 3] > 20)
        variants = {part: arr}
        if part == 'head':
            off = arr.copy()
            for ex, ey, er in cfg['eyes']:
                dark_glass(off, ex, ey, er, cfg['off_eye'])
            variants['head_off'] = off
        for name, v in variants.items():
            Image.fromarray(v[y0:y1, x0:x1]).save(f'{OUT}/{skin}/{name}.webp', 'WEBP', quality=86, method=6)

        pw, ph = x1 - x0, y1 - y0
        if skin == 'wooden':
            wooden_boxes[part] = (x0 - FRAME[0], y0 - FRAME[1], pw, ph)
            L, T, W = x0 - FRAME[0], y0 - FRAME[1], pw
        else:
            bx, by, bw, bh = wooden_boxes[part]
            s = ((bw / pw) * (bh / ph)) ** .5
            W, H = pw * s, ph * s
            ax, ay = ANCHOR[part]
            L = bx + (bw - W) / 2 if ax == 'centre' else bx if ax == 'left' else bx + bw - W
            T = by if ay == 'top' else by + bh - H
        entry = dict(left=round(L / FW * 100, 3), top=round(T / FH * 100, 3), width=round(W / FW * 100, 3),
                     ratio=round(ph / pw, 4))
        if part == 'body':   # socket centre and size as fractions of the body image
            entry['socket'] = dict(x=round((gx - x0) / pw, 4), y=round((gy - y0) / ph, 4), d=round(2 * gr / pw, 4))
        layout[skin][part] = entry

    # gem: just the glass, square, cut from the original image
    g = rgba.copy()
    g[..., 3] = (circle(g.shape, gx, gy, gr) * 255).astype(np.uint8)
    Image.fromarray(g[gy - gr - 1:gy + gr + 1, gx - gr - 1:gx + gr + 1]).save(f'{OUT}/{skin}/gem.webp', 'WEBP', quality=88, method=6)

json.dump(dict(frame=[FW, FH], skins=layout), open(f'{OUT}/layout.json', 'w'), indent=1)
old = f'{OUT}/wooden/layout.json'
if os.path.exists(old):
    os.remove(old)

if PREVIEW:
    # one robot per tier plus a mixed one, side by side
    sheet = Image.new('RGBA', (FW * 4, FH), (90, 150, 210, 255))
    mixes = [{p: 'wooden' for p in PARTS}, {p: 'iron' for p in PARTS}, {p: 'steel' for p in PARTS},
             dict(leg_left='steel', leg_right='iron', body='wooden', arm_left='iron', arm_right='steel',
                  head='steel', antenna='iron', gem='iron')]
    order = ['arm_left', 'arm_right', 'leg_left', 'leg_right', 'body', 'gem', 'antenna', 'head']
    for i, mix in enumerate(mixes):
        mix.setdefault('gem', mix['body'])
        for part in order:
            skin = mix[part]
            if part == 'gem':
                b = layout[mix['body']]['body']
                bwp = b['width'] / 100 * FW
                bim = Image.open(f'{OUT}/{mix["body"]}/body.webp')
                bhp = bwp * bim.height / bim.width
                d = b['socket']['d'] * bwp
                cx = b['left'] / 100 * FW + b['socket']['x'] * bwp
                cy = b['top'] / 100 * FH + b['socket']['y'] * bhp
                im = Image.open(f'{OUT}/{skin}/gem.webp').convert('RGBA').resize((round(d), round(d)))
                sheet.alpha_composite(im, (i * FW + round(cx - d / 2), round(cy - d / 2)))
                continue
            L = layout[skin][part]
            im = Image.open(f'{OUT}/{skin}/{part}.webp').convert('RGBA')
            nw = round(L['width'] / 100 * FW)
            im = im.resize((nw, round(im.height * nw / im.width)))
            sheet.alpha_composite(im, (i * FW + round(L['left'] / 100 * FW), round(L['top'] / 100 * FH)))
    sheet.save(PREVIEW)
print(json.dumps(layout))
