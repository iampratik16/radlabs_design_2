#!/bin/bash
# =============================================================================
# Atmosphere images for the work mosaic — one per client, generated with
# gemini-2.5-flash-image on Vertex (Imagen is not enabled on this project).
#
# WHAT THESE ARE, AND ARE NOT. Each image evokes the client's *sector*, not
# the client's premises, product or collateral. No marquee that claims to be
# Chigwell Hall, no knitwear carrying a Bassi label, no invented packaging.
# The real sites still carry the case pages, in device frames, captured live.
# Keep it that way: generating a client's actual work is inventing a
# deliverable they never received.
#
# Aspect follows the tile the image lands in: 16:9 for the full and eight
# spans, 4:5 for the four spans.
# =============================================================================
set -euo pipefail

PROJECT="${VEO_PROJECT:-radlabs-497004}"
LOCATION="${VEO_LOCATION:-us-central1}"
MODEL="${IMG_MODEL:-gemini-2.5-flash-image}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/public/img/work/atmos"
mkdir -p "$OUT" "$ROOT/.veo"

SHOTS=(
"chigwell-marquees|16:9|A large white event marquee glowing softly from within at blue hour on the lawn of an English country estate, mature oaks in silhouette, long shadows across cut grass, warm light spilling from the open entrance, low mist across the field, cinematic editorial photography, medium format, no people, no text, no logos, no signage, no banners."
"pink-tree-media|4:5|An editorial still life on a pale marble table in a sunlit studio: a fanned stack of heavy uncoated paper, a brass ruler, a glass of water catching the light, one stem of dried blossom in a slim vase, soft morning shadow raking across the surface, muted warm palette, vertical composition, medium format, no text, no printing, no logos, no lettering."
"swifty-beats|16:9|A darkened professional recording studio at night, a long analogue mixing console lit by a single warm lamp, faders catching the light, acoustic panelling and deep shadow behind, a faint glow reflected on the desk surface, cinematic, very shallow depth of field, no people, no text, no logos, no screen content."
"beam-global|16:9|The atrium of a modern financial headquarters at dusk, pale stone floor and full-height glass, a sculptural staircase, city lights beginning outside, long clean reflections, architectural photography, cool restrained palette, no people, no text, no logos, no signage."
"neo-eco-cleaning|4:5|The entrance hall of a London mansion block in early morning light, polished stone floor reflecting tall sash windows, a brass handrail, white painted joinery, immaculate and empty, soft daylight, architectural interior photography, vertical composition, no people, no text, no logos, no signage, no numbers."
"bassi-clothing|16:9|Folded fine merino knitwear in natural oatmeal and charcoal tones stacked on a dark walnut surface, a single raking light across the ribbing, loose yarn and a wooden spool to one side, deep shadow behind, editorial product photography, medium format, very shallow depth of field, no text, no labels, no tags, no logos, no branding."
"chigwell-marquees-craft|4:3|A long banqueting table set beneath a marquee ceiling for an evening reception, white linen, cut glassware, low candlelight running the length of the table, swagged lining above, warm and quiet, editorial event photography, no people, no text, no logos, no place cards, no printed menus."
"chigwell-marquees-scene|4:5|An English country house seen across a wide lawn at golden hour, mature cedars framing the view, warm light on brick and sash windows, long shadows on mown grass, vertical composition, editorial architectural photography, no people, no text, no logos, no signage."
"pink-tree-media-craft|4:3|An overhead flat lay of blank brand collateral in muted dusty-rose and ecru on a pale plaster surface: folded uncoated cards, a swatch book fanned open, a brass bulldog clip, a length of ribbon, soft directional daylight, editorial still life, every surface blank, no text, no printing, no logos, no lettering."
"pink-tree-media-scene|4:5|A bright minimal studio office corner, a pale oak desk set against a tall window, a linen curtain moving slightly, a single plant, warm morning light raking across the floorboards, vertical composition, calm and uncluttered, interior photography, no people, no text, no logos, no screens."
"swifty-beats-craft|4:3|Extreme macro of a vinyl record turning on a professional turntable, the stylus in the groove, warm low light raking across the surface, deep shadow behind, cinematic music photography, no text, no label artwork, no logos, no lettering."
"swifty-beats-scene|4:5|A dark club interior an hour before doors, an empty floor, a single beam of light cutting through haze from above, speaker stacks in silhouette, deep shadow, cinematic, vertical composition, no people, no text, no logos, no signage."
"beam-global-craft|4:3|An overhead shot of an empty boardroom table in glass and brushed steel, a closed leather folio, a glass of water, a fountain pen, cold north light from a window out of frame, restrained corporate still life, no documents, no text, no logos, no lettering."
"beam-global-scene|4:5|A financial district at dusk seen from a high window, glass towers with lit windows, the city grid falling away below, cool blue hour palette, vertical composition, architectural photography, no people, no text, no logos, no signage."
"neo-eco-cleaning-craft|4:3|Close detail of a polished brass handrail meeting a stone stair nosing in a period London hallway, morning light raking across the stone, immaculate paintwork behind, shallow depth of field, architectural detail photography, no people, no text, no logos, no numbers."
"neo-eco-cleaning-scene|4:5|A red brick London mansion block facade seen from across the street in clear morning light, sash windows, stone banding, railings and a clipped hedge at pavement level, vertical composition, architectural photography, no people, no text, no logos, no signage, no house numbers."
"bassi-clothing-craft|4:3|Extreme macro of fine knitted ribbing in oatmeal merino wool, raking light revealing the stitch structure and the depth of the pile, deep shadow falling away behind, editorial textile photography, no text, no labels, no tags, no logos."
"bassi-clothing-scene|4:5|An industrial knitting workshop in soft daylight, rows of cones of yarn in natural and charcoal tones stacked on steel racks, machinery out of focus beyond, dust in the light, vertical composition, documentary industrial photography, no people, no text, no logos, no signage."
)

TOKEN="$(gcloud auth application-default print-access-token 2>/dev/null || gcloud auth print-access-token 2>/dev/null)"
[ -z "$TOKEN" ] && { echo "No access token." >&2; exit 1; }

API="https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}"

for shot in "${SHOTS[@]}"; do
  name="${shot%%|*}"; rest="${shot#*|}"
  aspect="${rest%%|*}"; prompt="${rest#*|}"
  out="$OUT/${name}.jpg"
  [ -f "$out" ] && { echo "skip $name"; continue; }
  echo "==> $name  ($aspect)"

  body=$(python3 "$ROOT/tools/_img_body.py" "$prompt" "$aspect")

  curl -sS -X POST "${API}:generateContent" \
    -H "Authorization: Bearer ${TOKEN}" -H "x-goog-user-project: ${PROJECT}" \
    -H "Content-Type: application/json" -d "$body" > "$ROOT/.veo/${name}-atmos.json"

  if python3 "$ROOT/tools/_img_save.py" "$ROOT/.veo/${name}-atmos.json" "$out"; then
    echo "   saved $(du -h "$out" | cut -f1)"
  else
    echo "   no image for $name" >&2
  fi
done
