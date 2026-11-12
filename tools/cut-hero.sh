#!/bin/bash
# =============================================================================
# Assemble the 35-second hero from the generated clips plus the real client
# sites. Run by generate-hero-veo.sh, or on its own once .veo/clips is full.
#
# The edit is a flat list of beats: source | in-point | duration. Hard cuts
# throughout — no dissolves. 38 beats over 35s is a 0.92s average, which is
# what the three reference films actually do (measured, not guessed).
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Two source pools. `.veo/clips` holds Veo output, `.veo/stock` the licensed
# footage the first cut was built from. A beat prefers the Veo clip and falls
# back to stock, so originals can replace stock one shot at a time instead of
# all at once — and generating never collides with what is already there.
CLIPS="$ROOT/.veo/clips"
STOCK="$ROOT/.veo/stock"
BEATS="$ROOT/.veo/beats"
mkdir -p "$CLIPS" "$STOCK"
mkdir -p "$BEATS"
rm -f "$BEATS"/*.mp4 "$BEATS/list.txt"

# The watch macro was re-cut out of the first hero film, which this script has
# since overwritten. It is kept in tools/source so a re-cut still works even if
# .veo is deleted; everything else is re-downloadable from the IDs in README.
[ -f "$STOCK/C1.mp4" ] || cp "$ROOT/tools/source/watch-movement.mp4" "$STOCK/C1.mp4"

# W1..W5 are the client sites presented as studio device mockups, composed
# from the captures in public/img/work. Built on demand, so a fresh clone can
# re-cut without them having been generated first.
[ -f "$STOCK/W1.mp4" ] || python3 "$ROOT/tools/make-site-mockups.py"

GRADE="eq=contrast=1.10:saturation=0.86:gamma=0.96,colorbalance=rs=-0.03:bs=0.05:rm=0.02:bm=-0.01:rh=0.05:bh=-0.04,vignette=PI/5"
NORM="scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=25,format=yuv420p"
ENC=(-c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p)

# --- The edit ---------------------------------------------------------------
# source | in-point | duration.  Blocks follow the brief:
#   A London day · B underwater couture · C watches and boxes · D yachts
#   E merchandising · F aviation and automotive · W the client sites
BEATS_LIST=(
  # A — London, daylight (3.00s / 75f)
  "A1|2.0|1.00" "A2|3.0|0.92" "A3|1.0|1.08"
  # B — underwater couture (2.48s / 62f). Two beats rather than five, but it
  # keeps the 1.6s hold, which is still the longest in the film.
  "B1|1.0|1.60" "B2|3.0|0.88"
  # C — watches, jewellery, boxes (10.00s / 250f), four-shot burst at the centre
  "C1|0.10|1.00" "C2|1.0|1.12" "C3|1.0|0.88" "C4|3.0|1.00" "C5|4.0|0.92" "C2|2.6|0.80"
  "C1|1.35|0.24" "C3|4.5|0.24" "C5|10.0|0.24" "C4|9.0|0.24"
  "C2|4.4|1.20" "C3|5.6|1.12" "C5|13.0|1.00"
  # D — yachts (5.00s / 125f)
  "D1|8.0|1.12" "D2|2.0|1.00" "D3|3.0|1.20" "D1|40.0|0.80" "D2|8.0|0.88"
  # E/F/W — merchandising and the luxury register against the work itself
  # (13.88s / 347f, plus the 0.24s black tail). The three sources alternate,
  # so a site mockup never sits next to another site mockup.
  "E1|2.0|0.80" "W1|0.2|1.04" "F1|1.5|1.00" "E2|4.0|0.80" "W2|0.6|1.00"
  "F4|2.2|0.88" "E3|3.0|0.80" "W3|0.3|1.00" "F5|1.0|1.00" "E4|2.0|0.80"
  "W4|0.8|1.00" "F2|2.0|0.80" "E1|12.0|0.72" "W5|0.4|1.04" "F3|1.5|1.00"
  "E2|14.0|0.20"
)

# Open on black. HWE and LUUX both do this, and it is why their loops have no
# visible seam: whatever the last frame is, it cuts into darkness.
# NORM matters here, not just on the beats: without it lavfi's black is
# written as Y=0 while the faded tail lands on Y=16, and the loop steps
# #101010 -> #000000 at the seam. Same pipeline, same black.
ffmpeg -v error -f lavfi -i "color=c=black:s=1920x1080:r=25" -t 0.4 \
  -vf "${NORM}" -an "${ENC[@]}" -y "$BEATS/000-black.mp4" </dev/null
echo "file '$BEATS/000-black.mp4'" > "$BEATS/list.txt"

n=1
total=0.4
last=$(( ${#BEATS_LIST[@]} - 1 ))
for idx in "${!BEATS_LIST[@]}"; do
  beat="${BEATS_LIST[$idx]}"
  name="${beat%%|*}"; rest="${beat#*|}"
  tin="${rest%%|*}"; dur="${rest##*|}"
  src="$CLIPS/${name}.mp4"
  [ -f "$src" ] || src="$STOCK/${name}.mp4"
  if [ ! -f "$src" ]; then echo "   missing clip $name, skipping beat" >&2; continue; fi

  # A Veo clip is 8s; the stock it replaces runs up to 68s. Clamp so a beat
  # written for the long source still lands inside the short one.
  sdur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  tin=$(python3 -c "print(round(min($tin, max(0, $sdur - $dur - 0.05)), 2))")

  vf="${NORM},${GRADE}"
  # Fade the final beat out across its whole length. The fade alone is not
  # enough to close the loop — concat re-times a sub-second beat and the last
  # rendered frame lands a frame or two short of black, which is why a real
  # black tail is appended after this loop.
  if [ "$idx" -eq "$last" ]; then
    vf="${vf},fade=t=out:st=0:d=${dur}"
  fi

  out=$(printf "%s/%03d-%s.mp4" "$BEATS" "$n" "$name")
  # -frames:v, not -t. Seeking to an in-point that is not frame-aligned makes
  # the first output frame land late, and -t then cuts a frame early — eight
  # beats came out one frame short that way, and the film lost a third of a
  # second. An explicit frame count is exact wherever the seek lands.
  nf=$(python3 -c "print(round($dur / 0.04))")
  ffmpeg -v error -ss "$tin" -i "$src" -frames:v "$nf" -vf "$vf" -an "${ENC[@]}" -y "$out" </dev/null
  echo "file '$out'" >> "$BEATS/list.txt"
  total=$(python3 -c "print(round($total + $dur, 2))")
  n=$((n+1))
done

# --- Final assembly ---------------------------------------------------------
#
# EVERY BEAT DURATION ABOVE IS A MULTIPLE OF 0.04s — one frame at 25fps. That
# is not cosmetic. A 0.9s beat is 22.5 frames, and the concat demuxer stitches
# by container duration, so half-frames accumulate until frames get dropped or
# held at a boundary. Beats are also cut with -frames:v rather than -t, because
# seeking to an in-point that is not frame-aligned makes -t cut a frame early.
#
# THE BLACK TAIL IS ENCODED SEPARATELY AND STREAM-COPIED ON. Encoding the whole
# film in one pass lifts its final flat-black frames from Y=16 to Y=30 — an
# end-of-stream artefact, not quantisation: forcing a keyframe there, disabling
# mb-tree, capping qmax and dropping CRF to 18 all produced exactly 30. The
# body and the tail are encoded as separate files and joined with -c copy, so
# nothing ever re-encodes the black. Both outputs need this, not just the
# desktop one.
TAIL=0.24

ffmpeg -v error -f concat -safe 0 -i "$BEATS/list.txt" -c copy \
  -y "$BEATS/rawbody.mp4" </dev/null

encode_film() {                       # out  crf  width  height
  local out="$1" crf="$2" w="$3" h="$4"
  ffmpeg -v error -i "$BEATS/rawbody.mp4" -vf "scale=${w}:${h},setsar=1" \
    -c:v libx264 -crf "$crf" -preset slow -pix_fmt yuv420p \
    -an -y "$BEATS/_body.mp4" </dev/null
  ffmpeg -v error -f lavfi -i "color=c=black:s=${w}x${h}:r=25" -t "$TAIL" \
    -vf "setsar=1,fps=25,format=yuv420p" \
    -c:v libx264 -crf "$crf" -preset slow -pix_fmt yuv420p \
    -an -y "$BEATS/_tail.mp4" </dev/null
  printf "file '%s'\nfile '%s'\n" "$BEATS/_body.mp4" "$BEATS/_tail.mp4" > "$BEATS/join.txt"
  ffmpeg -v error -f concat -safe 0 -i "$BEATS/join.txt" -c copy \
    -movflags +faststart -y "$out" </dev/null
}

total=$(python3 -c "print(round($total + $TAIL, 2))")
echo "==> assembling ${total}s, $((n-1)) cuts"

encode_film "$ROOT/public/video/hero.mp4"        28 1920 1080
encode_film "$ROOT/public/video/hero-mobile.mp4" 31 1024  576

# Poster from inside the first London shot, past the opening black.
ffmpeg -v error -ss 1.6 -i "$ROOT/public/video/hero.mp4" -frames:v 1 -q:v 3 \
  -y "$ROOT/public/img/hero-poster.jpg" </dev/null

echo "Done:"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$ROOT/public/video/hero.mp4"
