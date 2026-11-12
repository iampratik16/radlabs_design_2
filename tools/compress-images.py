#!/usr/bin/env python3
"""
Re-encode the generated imagery to a sane weight.

gemini-2.5-flash-image returns near-lossless JPEG: 1.4 MB for an 864x1184
frame, which is roughly eight times what that picture needs. That did not
show while Next's optimizer was re-encoding everything on the fly — and the
moment the optimizer stopped (Vercel returns 402 once the Hobby transform
quota is spent) the full-weight originals went to the browser.

With `images.unoptimized` set, the file on disk IS what ships, so it has to be
right here. Quality 82 progressive is visually indistinguishable at these
sizes and lands around 200 KB.

The site captures in public/img/work are left alone: they are already
efficient (240 KB for a 1280x5356 strip) and re-encoding screenshot text is
exactly where JPEG artefacts show.
"""
from pathlib import Path
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TARGETS = [ROOT / "public" / "img" / "services", ROOT / "public" / "img" / "work" / "atmos"]
QUALITY = 82
MAX_EDGE = 1600          # nothing is displayed larger than this

def main() -> int:
    before = after = 0
    for folder in TARGETS:
        for src in sorted(folder.glob("*.jpg")):
            start = src.stat().st_size
            before += start

            im = Image.open(src).convert("RGB")
            if max(im.size) > MAX_EDGE:
                im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)

            # No exif= argument: that is how the metadata gets dropped.
            im.save(src, "JPEG", quality=QUALITY, optimize=True, progressive=True)

            end = src.stat().st_size
            after += end
            print(f"  {start/1048576:5.2f} -> {end/1048576:5.2f} MB  {src.name}")

    if not before:
        print("nothing to do", file=sys.stderr)
        return 1
    print(f"\ntotal {before/1048576:.1f} MB -> {after/1048576:.1f} MB "
          f"({100 - after*100/before:.0f}% smaller)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
