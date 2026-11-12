#!/usr/bin/env python3
"""
W1..W5 — the client sites as studio device mockups, for the hero's closing block.

The reference films present a site as a trio of phones on a lit sweep, not as a
flat scrolling capture. That is what this builds: the real captures from
public/img/work composited into drawn frames, so the footage is still the
actual work and only the presentation is staged.

Motion: one oversized stage is composed per site, then a 1920x1080 window pans
across it. One expensive composition, sixty cheap crops.
"""
import re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "public" / "img" / "work"
OUT = ROOT / ".veo" / "stock"
TMP = ROOT / ".veo" / "mock"

W, H = 1920, 1080
OVER = 1.12                      # stage is rendered this much larger than frame
SW, SH = int(W * OVER), int(H * OVER)
FPS, SECONDS = 25, 2.4
FRAMES = int(FPS * SECONDS)

# Slices are read from lib/projects.ts rather than repeated here. The case
# pages and this film have to agree on which part of a capture is worth
# showing, and two hand-maintained copies of that drift.
_TS = (ROOT / "lib" / "projects.ts").read_text()
_SLUGS = re.findall(r"slug: '([^']+)'", _TS)
_SLICES = [tuple(float(x) for x in m.split(","))
           for m in re.findall(r"phoneSlices: \[([0-9.,\s]+)\]", _TS)]
assert len(_SLUGS) == len(_SLICES) and _SLICES, "projects.ts: slugs/slices out of step"
_BY_SLUG = dict(zip(_SLUGS, _SLICES))

# Five of the six, in the order the hero cuts them.
SITES = [(slug, _BY_SLUG[slug]) for slug in (
    "chigwell-marquees", "neo-eco-cleaning", "bassi-clothing",
    "beam-global", "pink-tree-media",
)]

PHONE_H = 790
PHONE_W = int(PHONE_H * 390 / 844)
GAP = 72
LIFT = 34                        # middle phone sits proud of the other two


def sweep() -> Image.Image:
    """Warm studio sweep: a vertical ramp with a soft light pool behind the trio."""
    base = Image.new("RGB", (SW, SH))
    d = ImageDraw.Draw(base)
    top, bottom = (233, 229, 222), (150, 144, 135)
    for y in range(SH):
        k = y / SH
        d.line([(0, y), (SW, y)],
               fill=tuple(int(top[i] + (bottom[i] - top[i]) * (k ** 1.25)) for i in range(3)))
    pool = Image.new("L", (SW, SH), 0)
    ImageDraw.Draw(pool).ellipse(
        [SW * 0.12, SH * 0.02, SW * 0.88, SH * 0.90], fill=120)
    pool = pool.filter(ImageFilter.GaussianBlur(170))
    return Image.composite(Image.new("RGB", (SW, SH), (255, 253, 250)), base, pool)


def phone(screen: Image.Image) -> Image.Image:
    """One device: body, bezel, screen, dynamic island — all proportional to width."""
    pad = int(PHONE_W * 0.26)                      # room for the drop shadow
    card = Image.new("RGBA", (PHONE_W + pad * 2, PHONE_H + pad * 2), (0, 0, 0, 0))

    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [pad, pad + int(PHONE_H * 0.03), pad + PHONE_W, pad + PHONE_H + int(PHONE_H * 0.03)],
        radius=int(PHONE_W * 0.13), fill=(26, 22, 18, 150))
    card.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(int(PHONE_W * 0.09))))

    body = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle(
        [pad, pad, pad + PHONE_W, pad + PHONE_H],
        radius=int(PHONE_W * 0.13), fill=(22, 22, 26, 255))
    card.alpha_composite(body)

    bez = int(PHONE_W * 0.034)
    sw_, sh_ = PHONE_W - bez * 2, PHONE_H - bez * 2
    mask = Image.new("L", (sw_, sh_), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, sw_, sh_], radius=int(PHONE_W * 0.105), fill=255)
    card.paste(screen.resize((sw_, sh_), Image.LANCZOS), (pad + bez, pad + bez), mask)

    iw, ih = int(PHONE_W * 0.30), int(PHONE_W * 0.082)
    ix = pad + (PHONE_W - iw) // 2
    iy = pad + bez + int(PHONE_W * 0.030)
    ImageDraw.Draw(card).rounded_rectangle(
        [ix, iy, ix + iw, iy + ih], radius=ih // 2, fill=(8, 8, 10, 255))
    return card


def screens(slug: str, slices) -> list[Image.Image]:
    """Three windows onto the capture, at the measured offsets."""
    cap = Image.open(WORK / f"{slug}-phone.jpg").convert("RGB")
    bez = int(PHONE_W * 0.034)
    target_w, target_h = PHONE_W - bez * 2, PHONE_H - bez * 2
    scaled_h = int(cap.height * target_w / cap.width)
    cap = cap.resize((target_w, scaled_h), Image.LANCZOS)
    out = []
    for s in slices:
        y = int(max(0, min(scaled_h - target_h, s * (scaled_h - target_h))))
        out.append(cap.crop((0, y, target_w, y + target_h)))
    return out


def stage(slug: str, slices) -> Image.Image:
    bg = sweep()
    cards = [phone(s) for s in screens(slug, slices)]
    total = PHONE_W * 3 + GAP * 2
    x0 = (SW - total) // 2
    y0 = (SH - PHONE_H) // 2
    for i, card in enumerate(cards):
        pad = int(PHONE_W * 0.26)
        x = x0 + i * (PHONE_W + GAP) - pad
        y = y0 - (LIFT if i == 1 else 0) - pad
        bg.paste(card, (x, y), card)
    return bg


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for n, (slug, slices) in enumerate(SITES, start=1):
        dst = OUT / f"W{n}.mp4"
        src = WORK / f"{slug}-phone.jpg"
        if not src.exists():
            print(f"missing {src}", file=sys.stderr)
            continue
        print(f"==> W{n}  {slug}")
        frames = TMP / f"W{n}"
        frames.mkdir(parents=True, exist_ok=True)
        for f in frames.glob("*.jpg"):
            f.unlink()

        st = stage(slug, slices)
        # Pan the window diagonally across the oversized stage: a slow push
        # that reads as motion without ever showing an edge.
        for i in range(FRAMES):
            t = i / (FRAMES - 1)
            x = int((SW - W) * (0.5 + 0.22 * (t - 0.5)))
            y = int((SH - H) * (0.78 - 0.50 * t))
            st.crop((x, y, x + W, y + H)).save(frames / f"{i:03d}.jpg", quality=94)

        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-framerate", str(FPS),
            "-i", str(frames / "%03d.jpg"),
            "-c:v", "libx264", "-crf", "16", "-preset", "medium",
            "-pix_fmt", "yuv420p", str(dst),
        ], check=True)
        print(f"    {dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
