"""Pull the first inline image out of a generateContent response."""
import base64, json, sys

try:
    d = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(1)

for cand in d.get("candidates") or []:
    for part in (cand.get("content") or {}).get("parts") or []:
        b = (part.get("inlineData") or {}).get("data")
        if b:
            open(sys.argv[2], "wb").write(base64.b64decode(b))
            sys.exit(0)

print(json.dumps(d)[:400], file=sys.stderr)
sys.exit(1)
