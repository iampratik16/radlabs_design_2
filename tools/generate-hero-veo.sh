#!/bin/bash
# =============================================================================
# RadLabs Design — the 35-second hero film
#
# STRUCTURE (the brief)
#   0:00–0:05  London, daylight
#   0:05–0:10  underwater couture
#   0:10–0:20  watches, jewellery, presentation boxes
#   0:20–0:25  yachts
#   0:25–0:35  merchandising, intercut with aviation and automotive
#
# PACE. The three reference films were measured before this was written:
#   Hudson Wright Easton  35s   45 cuts   0.8s average
#   Luxury Marketing House 56s  64 cuts   0.9s average
#   LUUX Media            30s   42 cuts   0.7s average
# They cut roughly once a second, hard, with occasional bursts of 0.2s and
# occasional holds past two seconds. This edit is 38 cuts over 35s — a 0.92s
# average — with one deliberate four-shot burst inside the jewellery block.
# The previous hero dissolved every 2.4s and registered zero hard cuts; that
# is why it read as a screensaver next to these.
#
# THE LOOP. HWE and LUUX both open on black, so whatever the last frame is it
# cuts into darkness and the seam disappears. This does the same: 0.35s of
# black at the head, a fade to black at the tail. No crossfade needed.
#
# BRAND MARKS. A badge is part of what the model thinks "supercar" means, so
# `no logos` argues with the prior and loses — the same way it lost three times
# on the jewellery box (see README). The F shots therefore frame the badge out
# rather than ask for it to be absent: rear haunch, wheel macro, aerial
# distance, cabin interior. Jets carry their registration and livery on the
# tail, so the tail stays out of frame too. Check a regenerated F clip at
# several timestamps — a clean t=0 proves nothing.
#
# PREREQUISITE — credentials. The service account on this machine
#   radlabs-vertex@radlabs-497004.iam.gserviceaccount.com
# returns "invalid_grant: Invalid JWT Signature": its key was rotated or
# deleted. Fix with EITHER:
#   gcloud auth activate-service-account --key-file=/path/to/new-key.json
#   gcloud auth application-default login
# then re-run this script.
#
# COST. 23 clips at 8 seconds is 184 seconds of generation per full run.
# Already-generated clips are skipped, so a re-cut costs nothing.
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
WORK="$ROOT/.veo"
mkdir -p "$WORK/clips" "$WORK/beats"

API="https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}"

# --- The shot list ----------------------------------------------------------
SHOTS=(
"A1|Cinematic aerial drone shot over the City of London on a bright clear morning, the Thames curving through glass towers, Tower Bridge in the middle distance, sunlight raking across the facades, slow forward push, shot on ARRI Alexa, crisp and expensive, no text, no logos, no signage"
"A2|Low angle looking straight up a canyon of London glass office towers, clouds sliding across the mirrored facades, strong geometry and repetition, bright daylight, slow upward tilt, cinematic, no people, no text, no logos"
"A3|Cinematic aerial tracking along the Thames toward Canary Wharf at mid morning, water catching the light, bridges passing beneath, clean blue sky, steady forward motion, no text, no logos"
"B1|A woman in a flowing deep cobalt blue silk gown suspended underwater in a sunlit swimming pool, arms outstretched and weightless, the long gown billowing and trailing around her, bright caustic light rippling across the pale pool floor, clear turquoise water, shot slightly from below, serene and elegant, high-end fashion campaign film, underwater cinema rig, no text, no logos"
"B2|Close underwater shot of deep cobalt blue silk unfurling slowly around a woman turning in a sunlit pool, the fabric catching refracted light, caustics dancing on the tiled floor behind, clear bright water, very shallow depth of field, elegant and weightless, high-end fashion campaign film, no text, no logos"
"B3|Looking up through clear turquoise water toward the surface, the sun a hard starburst through the ripples, a single swimmer in silhouette crossing the light far above, deep blue falling away below, slow upward drift, cinematic underwater cinematography, no text, no logos"
"C1|Extreme macro of an exposed skeletonised mechanical watch movement in brushed titanium, visible gear train and ruby jewels, a tourbillon cage turning slowly, single raking key light, very shallow depth of field, completely unbranded, no maker name, no text, no logos, no lettering on the dial"
"C2|Extreme macro of a diamond necklace resting on folded charcoal silk, a single warm raking light travelling slowly across the stones, fingers entering frame to lift the chain, deep shadow all around, very shallow depth of field, cinematic jewellery photography. No box, no case, no packaging, no card, no label, no paper, no flat surface of any kind in frame. Nothing in shot carries text, lettering, a logo, a monogram or an engraving."
"C3|Extreme macro of a heavy polished gold bracelet resting on dark velvet, a single raking light travelling slowly across the links, tiny specular highlights, cinematic jewellery photography, no text, no logos"
"C4|Close shot of hands closing the lid of a rigid presentation box and drawing a wide grosgrain ribbon taut, matte card and soft shadow, warm key light, very shallow depth of field, cinematic, no text, no logos, no printing on the box"
"C5|Extreme macro of a watch case rotating slowly on a turntable under a soft strip light, brushed and polished surfaces alternating as it turns, deep shadow behind, cinematic product film, completely unbranded, no text, no logos"
"D1|Top-down aerial drone shot directly above a white motor tender carving a long curving wake across deep blue open water, bright midday sun, the wake foaming white against navy, slow descent, cinematic, no text, no logos"
"D2|Looking out from the shaded aft deck of a superyacht at anchor off a rocky Mediterranean coast, a table set with fruit and glassware in the foreground, turquoise water and pale cliffs beyond, bright clear day, slow drift forward, cinematic, no people, no text, no logos"
"D3|Wide aerial of a large white motor yacht underway on open ocean under a tall cumulus sky, long clean wake trailing behind, late afternoon light, slow orbit, cinematic colour grade, no text, no logos"
"E1|Extreme macro of gold foil blocking catching the light on the lid of a matte charcoal rigid box, the surface drifting slowly through a raking beam, abstract and tactile, cinematic product photography, no readable text, no logos, no lettering"
"E2|Close overhead shot of a stack of thick cotton-card printed pieces being fanned slowly across a stone surface by a hand, deckled edges and heavy stock, soft directional light, cinematic, no readable text, no logos"
"E3|Close shot of hands folding soft tissue paper closed over an empty rigid gift box and drawing a wide satin ribbon across the lid, matte card and tissue only, warm soft light, very shallow depth of field, cinematic unboxing film. The box is empty. No product, no vessel, no jar, no bottle, no candle, no tin, no label, no card and no printed surface anywhere in frame. Nothing in shot carries text, lettering, a logo or a monogram."
"E4|A lid being lifted slowly from a presentation box to reveal tissue and a wrapped object inside, shot from a low three-quarter angle, warm key light and deep shadow, cinematic, no text, no logos, no printing"

"F1|Cinematic shot of a private jet standing on wet tarmac at dusk, framed on the nose and forward fuselage only with the airstair lowered and warm cabin light spilling down onto the apron, plain polished white paint holding the last blue of the sky, runway edge lights soft and out of focus behind, slow dolly past at wingtip height, shot on ARRI Alexa. The tail and rear fuselage stay out of frame. Unpainted white fuselage, no livery, no stripe, no registration letters, no numbers, no text, no logos"
"F2|Interior of a private jet cabin at altitude, cream leather club seats and polished walnut veneer, a crystal tumbler on the side table catching light from an oval window, soft late afternoon sun raking down the cabin, very shallow depth of field, slow drift forward, cinematic, no people, no screens, no text, no logos"
"F3|Low tracking shot alongside an angular wedge-shaped mid-engine supercar accelerating through a lit road tunnel at night, framed tight on the rear wheel arch and flank, matte black bodywork, wide rear haunch, taillights smearing into the wet asphalt reflections, strong motion blur, cinematic automotive film. The nose, the tail panel and the number plate stay out of frame. No badge, no emblem, no text, no logos"
"F4|Extreme macro of a forged alloy wheel and low profile tyre on a mid-engine supercar, the wheel turning slowly as a single raking light travels across the spokes, a carbon ceramic brake disc glowing faintly behind, wet asphalt beneath, the tyre sidewall falling away into deep shadow, very shallow depth of field, cinematic automotive detail film, no centre cap emblem, no text, no logos, no lettering"
"F5|Aerial drone shot looking straight down from high above an empty coastal mountain road at golden hour, a deep orange angular wedge-shaped supercar tracking along one long sweeping curve far below, seen from directly overhead so that only the roof, the engine glass and the rear wing are visible, the sea catching the light at the edge of frame, the car small within a wide landscape, slow drift, cinematic colour grade. The drone stays directly above the car, so the rear fascia and the number plate never face the lens. No badge, no emblem, no text, no logos, no lettering")

# --- Generate ---------------------------------------------------------------
# Application Default Credentials first. `gcloud auth print-access-token`
# uses whatever account is *active*, which on this machine is a service
# account whose key was revoked — ADC is both the correct credential for an
# application and the one that actually works here.
TOKEN="$(gcloud auth application-default print-access-token 2>/dev/null || gcloud auth print-access-token 2>/dev/null)"
[ -z "$TOKEN" ] && { echo "No access token. Re-authenticate (see header)." >&2; exit 1; }

for shot in "${SHOTS[@]}"; do
  name="${shot%%|*}"
  # VEO_ONLY=A1 generates just that shot — use it to verify the pipeline
  # before committing to a full run.
  [ -n "${VEO_ONLY:-}" ] && [ "$name" != "$VEO_ONLY" ] && continue
  prompt="${shot#*|}"
  out="$WORK/clips/${name}.mp4"
  [ -f "$out" ] && { echo "skip $name"; continue; }
  echo "==> $name"

  params="{\"aspectRatio\":\"16:9\",\"resolution\":\"${VEO_RES}\",\"sampleCount\":1,\"durationSeconds\":${DURATION},\"generateAudio\":false"
  [ -n "$BUCKET" ] && params="${params},\"storageUri\":\"${BUCKET}/${name}/\""
  params="${params}}"

  body=$(cat <<JSON
{"instances":[{"prompt":$(printf '%s' "$prompt" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}],"parameters":${params}}
JSON
)

  op=$(curl -sS -X POST "${API}:predictLongRunning" \
        -H "Authorization: Bearer ${TOKEN}" -H "x-goog-user-project: ${PROJECT}" -H "Content-Type: application/json" \
        -d "$body" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("name",""))')
  [ -z "$op" ] && { echo "   submit failed for $name" >&2; continue; }

  for _ in $(seq 1 60); do
    sleep 10
    resp=$(curl -sS -X POST "${API}:fetchPredictOperation" \
            -H "Authorization: Bearer ${TOKEN}" -H "x-goog-user-project: ${PROJECT}" -H "Content-Type: application/json" \
            -d "{\"operationName\":\"${op}\"}")
    done_flag=$(printf '%s' "$resp" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("done",False))')
    [ "$done_flag" = "True" ] && break
    printf '.'
  done
  echo

  printf '%s' "$resp" > "$WORK/${name}.json"
  uri=$(python3 - "$WORK/${name}.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
vids=d.get("response",{}).get("videos") or d.get("response",{}).get("generatedSamples") or []
for v in vids:
    u=v.get("gcsUri") or (v.get("video") or {}).get("uri")
    if u: print(u); break
PY
)
  if [ -n "$uri" ]; then
    gcloud storage cp "$uri" "$out"
  else
    python3 - "$WORK/${name}.json" "$out" <<'PY'
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
  [ -f "$out" ] && echo "   saved $(du -h "$out" | cut -f1)"
done

bash "$ROOT/tools/cut-hero.sh"
