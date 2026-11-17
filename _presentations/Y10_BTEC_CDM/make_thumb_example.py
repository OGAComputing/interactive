"""Before-and-after example for Lesson 3.2's Photoshop task ("Two thumbnails, two needs").

Imitates what students do in Photoshop, on a different image from theirs (The Traitors still, not
the Planet Earth III thumbnail), so they see the goal without a copy to trace:
  1. adjustment layers: contrast, saturation and a purple-teal colour grade (Gradient Map look)
  2. a cut-out from another image: the thinking face from the Photo Bank's photo_window.jpg
  3. type: a bold title and a strap line
The "after" promises social interaction: a show you guess along with, together.

    python _presentations/Y10_BTEC_CDM/make_thumb_example.py

Reads and writes images/ (git-ignored): thumb_example_before.jpg, thumb_example_after.jpg,
thumb_example_pair.jpg (both side by side, labelled, for the page and the deck).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

IMG = Path(__file__).resolve().parent / 'images'
FONTS = Path('C:/Windows/Fonts')
W, H = 1280, 720


def cover(im, w, h, focus=(0.5, 0.5)):
    """Scale and crop to fill w × h, keeping the focus point in view."""
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = min(max(0, round(im.width * focus[0] - w / 2)), im.width - w)
    y = min(max(0, round(im.height * focus[1] - h / 2)), im.height - h)
    return im.crop((x, y, x + w, y + h))


def grade(im):
    """Brightness/Contrast, Vibrance and a Gradient Map (shadows purple, highlights warm gold)."""
    im = ImageEnhance.Contrast(im).enhance(1.35)
    im = ImageEnhance.Color(im).enhance(1.3)
    mapped = ImageOps.colorize(ImageOps.grayscale(im), black='#1a0633', mid='#7a2e8f', white='#ffd27a')
    return Image.blend(im, mapped, 0.45)


def cutout(src, box, size, ring=10):
    """A face cut out as a circle with a white outline, as YouTube thumbnails do."""
    face = cover(src.crop(box), size, size)
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new('RGBA', (size + 2 * ring, size + 2 * ring), (0, 0, 0, 0))
    ImageDraw.Draw(out).ellipse((0, 0, size + 2 * ring - 1, size + 2 * ring - 1), fill='white')
    out.paste(face, (ring, ring), mask)
    return out


def shout(draw, xy, text, font, fill='white', stroke='#14051f', width=8):
    draw.text(xy, text, font=font, fill=fill, stroke_width=width, stroke_fill=stroke)


before = cover(Image.open(IMG / 'traitors_uk_still.jpg').convert('RGB'), W, H, focus=(0.47, 0.5))
before.save(IMG / 'thumb_example_before.jpg', quality=90)

after = grade(before).convert('RGBA')
# A soft dark panel down the left, behind the title, so it reads on a busy picture (the host's face stays clear).
shade = Image.new('L', (W, H), 0)
ImageDraw.Draw(shade).rectangle((0, 0, 470, H), fill=175)
after = Image.composite(Image.new('RGBA', (W, H), (10, 0, 20, 255)), after, shade.filter(ImageFilter.GaussianBlur(40)))

face = cutout(Image.open(IMG / 'photo_window.jpg').convert('RGB'), (150, 150, 2400, 2400), 330)
after.alpha_composite(face, (W - face.width - 40, H - face.height - 40))

d = ImageDraw.Draw(after)
shout(d, (36, 40), "WHO'S", ImageFont.truetype(str(FONTS / 'impact.ttf'), 120))
shout(d, (36, 170), 'THE', ImageFont.truetype(str(FONTS / 'impact.ttf'), 120))
shout(d, (36, 300), 'TRAITOR?', ImageFont.truetype(str(FONTS / 'impact.ttf'), 118), fill='#ffd27a')
strap = ImageFont.truetype(str(FONTS / 'arialbd.ttf'), 40)
d.rounded_rectangle((36, H - 150, 520, H - 86), radius=12, fill='#e8263b')
d.text((56, H - 142), 'Guess together. Tonight.', font=strap, fill='white')
after = after.convert('RGB')
after.save(IMG / 'thumb_example_after.jpg', quality=90)

# Side by side with labels, for the page and the deck.
pw, gap, lab = 640, 24, 64
pair = Image.new('RGB', (2 * pw + gap, round(H * pw / W) + lab), 'white')
lf = ImageFont.truetype(str(FONTS / 'arialbd.ttf'), 30)
d = ImageDraw.Draw(pair)
for n, (im, text) in enumerate([(before, 'BEFORE'), (after, 'AFTER: promises social interaction')]):
    x = n * (pw + gap)
    d.text((x, 14), text, font=lf, fill='#14051f')
    pair.paste(im.resize((pw, round(H * pw / W)), Image.LANCZOS), (x, lab))
pair.save(IMG / 'thumb_example_pair.jpg', quality=90)
print('made', *(f'thumb_example_{k}.jpg' for k in ('before', 'after', 'pair')))
