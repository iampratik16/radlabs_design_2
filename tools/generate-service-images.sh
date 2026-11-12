#!/bin/bash
# =============================================================================
# The four service images for the home grid.
#
# Portrait 3:4 to match the editorial reference layout. Same credential story
# as the Veo script: Application Default Credentials, not the active gcloud
# account, plus x-goog-user-project for quota.
#
# MODEL. Imagen is not enabled on this project — every imagen-* and
# imagegeneration@* id returns 404. `gemini-2.5-flash-image` is, and is what
# this uses, through :generateContent with responseModalities IMAGE rather
# than Imagen's :predict. Probe before assuming a model exists here.
#
# The model brands product shots for the same reason Veo does, so the prompts
# frame the mark out rather than asking for it to be absent. Look at every
# generated file before shipping it.
# =============================================================================
set -euo pipefail

PROJECT="${VEO_PROJECT:-radlabs-497004}"
LOCATION="${VEO_LOCATION:-us-central1}"
MODEL="${IMG_MODEL:-gemini-2.5-flash-image}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/img/services"
mkdir -p "$OUT" "$ROOT/.veo"

SHOTS=(
"web|A slim open laptop on a dark walnut desk beside a stone coaster and a brass desk lamp, the screen a soft out-of-focus glow, warm low evening light raking across the surface, deep shadow behind, shot on medium format, editorial interior photography, very shallow depth of field, muted palette, vertical portrait composition. No readable screen content, no user interface, no text, no logos."
"growth|Long exposure light trails curving through a dark glass atrium at night, cool blue and warm amber streaks crossing strong architectural geometry, mirrored reflections, cinematic architectural photography, deep shadow, vertical portrait composition, no people, no text, no logos, no signage."
"brand|Overhead editorial still life of embossed paper swatches in muted ecru and charcoal fanned across a pale stone surface beside a steel rule and a bone folder, soft raking daylight, deep tactile texture, very shallow depth of field, restrained palette, vertical portrait composition. No text, no logos, no lettering, no printing of any kind."
"merch|A rigid charcoal presentation box with its lid tilted open beside a loose coil of wide grosgrain ribbon and folded tissue on a dark stone surface, a single warm raking light, deep shadow all around, editorial product still life, shot on medium format, vertical portrait composition. The box is blank. No text, no logos, no printing, no label, no monogram, no foil blocking."
)

TOKEN="$(gcloud auth application-default print-access-token 2>/dev/null || gcloud auth print-access-token 2>/dev/null)"
[ -z "$TOKEN" ] && { echo "No access token." >&2; exit 1; }

API="https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}"

for shot in "${SHOTS[@]}"; do
  name="${shot%%|*}"; prompt="${shot#*|}"
  out="$OUT/${name}.jpg"
  [ -f "$out" ] && { echo "skip $name"; continue; }
  echo "==> $name"

  body=$(python3 "$ROOT/tools/_img_body.py" "$prompt")

  curl -sS -X POST "${API}:generateContent" \
    -H "Authorization: Bearer ${TOKEN}" -H "x-goog-user-project: ${PROJECT}" \
    -H "Content-Type: application/json" -d "$body" > "$ROOT/.veo/${name}-img.json"

  if python3 "$ROOT/tools/_img_save.py" "$ROOT/.veo/${name}-img.json" "$out"; then
    echo "   saved $(du -h "$out" | cut -f1)"
  else
    echo "   no image for $name" >&2
  fi
done
