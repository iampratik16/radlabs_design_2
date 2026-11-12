#!/bin/bash
# =============================================================================
# RadLabs Design — atmosphere clips for the case study pages
#
# One short, original clip per project, generated with Veo on Vertex AI. The
# case pages pick these up by existence: write public/video/work-<slug>.mp4
# and the atmosphere band appears on the next build. Nothing to edit in
# lib/projects.ts.
#
# The prompts are written to sit next to the client's own site on the page, so
# they are deliberately abstract — material, light and place, not a product
# shot that would compete with the work itself.
#
# PREREQUISITE — credentials. The service account on this machine
#   radlabs-vertex@radlabs-497004.iam.gserviceaccount.com
# returns "invalid_grant: Invalid JWT Signature", meaning its key was rotated
# or deleted. Fix with EITHER:
#   gcloud auth activate-service-account --key-file=/path/to/new-key.json
#   gcloud auth application-default login
#
# Then:
#   ./tools/generate-work-veo.sh
#
# Cost: Veo bills per second generated. Six 8-second clips is 48 seconds a run.
# =============================================================================
set -euo pipefail

PROJECT="${VEO_PROJECT:-radlabs-497004}"
LOCATION="${VEO_LOCATION:-us-central1}"
MODEL="${VEO_MODEL:-veo-3.1-generate-001}"
BUCKET="${VEO_BUCKET:-}"
DURATION="${VEO_DURATION:-8}"
VEO_RES="${VEO_RES:-1080p}"   # the API defaults to 720p if this is omitted
# Veo 3.1 GA. Veo 3.0 and Veo 2.0 carried retirement dates of 30 June 2026, so
# do not fall back to them without checking they still exist.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$ROOT/.veo/work"
mkdir -p "$WORK"

API="https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}"

SHOTS=(
"chigwell-marquees|Cinematic aerial drone shot at dusk over the grounds of an English country estate, a large white event marquee glowing warmly from within on a wide lawn, mature oaks and cedars in silhouette, last light on the horizon, slow push in, shot on ARRI Alexa, serene and expensive, no people, no text, no logos"
"pink-tree-media|Extreme macro of deep crimson ink meeting heavy cotton paper under a raking warm key light, fibres and grain visible, the ink spreading very slowly, shallow depth of field, cinematic studio lighting on a dark ground, abstract and editorial, no text, no logos, no lettering"
"swifty-beats|Slow dolly across a darkened recording studio, the faders of a large analogue mixing desk catching a single warm light, dust in the beam, a monitor speaker cone moving almost imperceptibly, deep shadow, very shallow depth of field, cinematic, no people, no text, no logos"
"beam-global|Slow vertical tilt up the glass facade of a modern office tower at first light, cold geometric reflections of cloud sliding across the panels, precise and repeating, long lens, cinematic, muted blues with a warm sun edge, no people, no text, no logos, no signage"
"neo-eco-cleaning|Morning sunlight moving slowly across the polished stone floor of an empty modern residential lobby, tall glass, a single large planted fern, clean reflections, dust motes in the light, calm and ordered, locked-off cinematic shot, no people, no text, no logos"
"bassi-clothing|Extreme macro of fine merino knitwear, individual yarn loops in raking warm light, slow lateral drift across the cloth revealing the stitch structure, natural fibre texture, very shallow depth of field, cinematic product photography on a dark ground, no text, no logos, no labels"
)

# Application Default Credentials first — see note in generate-hero-veo.sh.
TOKEN="$(gcloud auth application-default print-access-token 2>/dev/null || gcloud auth print-access-token 2>/dev/null)"
if [ -z "$TOKEN" ]; then
  echo "No access token. Re-authenticate (see header of this script)." >&2
  exit 1
fi

# Same grade as the hero, so these sit in the same film as everything else.
GRADE="eq=contrast=1.10:saturation=0.86:gamma=0.96,colorbalance=rs=-0.03:bs=0.05:rm=0.02:bm=-0.01:rh=0.05:bh=-0.04,vignette=PI/5"

for shot in "${SHOTS[@]}"; do
  slug="${shot%%|*}"
  prompt="${shot#*|}"
  raw="$WORK/${slug}.mp4"
  out="$ROOT/public/video/work-${slug}.mp4"

  if [ -f "$out" ]; then echo "skip $slug (already built)"; continue; fi
  echo "==> $slug"

  params="{\"aspectRatio\":\"16:9\",\"resolution\":\"${VEO_RES}\",\"sampleCount\":1,\"durationSeconds\":${DURATION},\"generateAudio\":false"
  [ -n "$BUCKET" ] && params="${params},\"storageUri\":\"${BUCKET}/work/${slug}/\""
  params="${params}}"

  body=$(cat <<JSON
{"instances":[{"prompt":$(printf '%s' "$prompt" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}],"parameters":${params}}
JSON
)

  op=$(curl -sS -X POST "${API}:predictLongRunning" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "x-goog-user-project: ${PROJECT}" \
        -H "Content-Type: application/json" \
        -d "$body" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("name",""))')

  if [ -z "$op" ]; then echo "   submit failed for $slug" >&2; continue; fi

  for _ in $(seq 1 60); do
    sleep 10
    resp=$(curl -sS -X POST "${API}:fetchPredictOperation" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "x-goog-user-project: ${PROJECT}" \
            -H "Content-Type: application/json" \
            -d "{\"operationName\":\"${op}\"}")
    done_flag=$(printf '%s' "$resp" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("done",False))')
    [ "$done_flag" = "True" ] && break
    printf '.'
  done
  echo

  printf '%s' "$resp" > "$WORK/${slug}.json"
  uri=$(python3 - "$WORK/${slug}.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
vids=d.get("response",{}).get("videos") or d.get("response",{}).get("generatedSamples") or []
for v in vids:
    u=v.get("gcsUri") or (v.get("video") or {}).get("uri")
    if u: print(u); break
PY
)

  if [ -n "$uri" ]; then
    gcloud storage cp "$uri" "$raw"
  else
    python3 - "$WORK/${slug}.json" "$raw" <<'PY'
import base64,json,sys
d=json.load(open(sys.argv[1]))
vids=d.get("response",{}).get("videos") or d.get("response",{}).get("generatedSamples") or []
for v in vids:
    b=v.get("bytesBase64Encoded") or (v.get("video") or {}).get("bytesBase64Encoded")
    if b:
        open(sys.argv[2],"wb").write(base64.b64decode(b)); break
else:
    print("no video payload; inspect the .json", file=sys.stderr)
PY
  fi

  [ -f "$raw" ] || { echo "   nothing downloaded for $slug" >&2; continue; }

  # 960px wide and CRF 31 to match the other background loops — these play
  # dimmed behind a line of type, so the bitrate is better spent elsewhere.
  ffmpeg -v error -i "$raw" -vf "scale=960:-2,$GRADE" -an \
    -c:v libx264 -crf 31 -preset slow -pix_fmt yuv420p -movflags +faststart \
    -y "$out" </dev/null

  echo "   wrote public/video/work-${slug}.mp4 ($(du -h "$out" | cut -f1))"
done

echo
echo "Done. Rebuild to pick the clips up — the case pages render the"
echo "atmosphere band for any project that now has a file."
