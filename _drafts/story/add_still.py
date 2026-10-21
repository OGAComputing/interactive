"""Inline a generated story still into a Station Zero page.

    python _drafts/story/add_still.py <page.html> <cam key> <image> [x0,y0,x1,y1]

e.g.
    python _drafts/story/add_still.py Y9/Python/L2_Selection/1_Proximity_PRIMM.html warden _drafts/story/px_p_warden.png

Crops the image to 16:9 (from the centre), scales it to 960x540, saves it as WebP (quality
stepped down until it's at most ~70 KB) and puts the data URI into that key's src in the
page's CAMS. The entry must already be there, with its label and alt (src '' until now);
running it again replaces the picture. Keep the source image here in _drafts/story/.
The optional box (in the source image's pixels) is cut out first, e.g. to trim black bars a
generator added; the 16:9 centre crop then applies to that.
"""
import base64
import io
import re
import sys

from PIL import Image

W, H = 960, 540
MAX_BYTES = 70_000


def webp_data_uri(path, box=None):
    im = Image.open(path).convert('RGB')
    if box:
        im = im.crop(box)
    w, h = im.size
    if w * H > h * W:   # too wide: trim the sides
        nw = round(h * W / H)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:               # too tall: trim top and bottom
        nh = round(w * H / W)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((W, H), Image.LANCZOS)
    for quality in (76, 68, 60, 52, 44, 36):
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=quality, method=6)
        if buf.tell() <= MAX_BYTES:
            break
    data = base64.b64encode(buf.getvalue()).decode('ascii')
    return 'data:image/webp;base64,' + data, buf.tell(), quality


def main(page, key, image, box=None):
    with open(page, encoding='utf-8', newline='') as f:
        s = f.read()
    start = s.find('  const CAMS = {')
    if start < 0:
        sys.exit(f'{page}: no CAMS block')
    end = s.index('\n  };', start)
    m = re.search(r'\n\s+' + re.escape(key) + r':\s*\{', s[start:end])
    if not m:
        sys.exit(f"{page}: CAMS has no entry '{key}' (add it with its label, alt and src: '' first)")
    entry_start = start + m.end()
    entry_end = s.index('}', entry_start)   # labels, alts and base64 never contain '}'
    entry = s[entry_start:entry_end]
    src = re.search(r"src:\s*'[^']*'", entry)
    if not src:
        sys.exit(f"{page}: '{key}' has no quoted src to fill (is it shared, like src: DOOR_SRC?)")
    uri, size, quality = webp_data_uri(image, tuple(int(n) for n in box.split(',')) if box else None)
    entry = entry[:src.start()] + f"src: '{uri}'" + entry[src.end():]
    s = s[:entry_start] + entry + s[entry_end:]
    with open(page, 'w', encoding='utf-8', newline='') as f:
        f.write(s)
    print(f"{key}: {W}x{H} WebP, quality {quality}, {size / 1024:.0f} KB -> {page}")


if __name__ == '__main__':
    if len(sys.argv) not in (4, 5):
        sys.exit(__doc__)
    main(*sys.argv[1:])
