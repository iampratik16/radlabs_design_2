"""Request body for gemini-2.5-flash-image. Separate file because a heredoc
inside a heredoc needs delimiters that do not collide, and this is cheaper.

    _img_body.py "<prompt>" [aspect]     aspect defaults to 3:4
"""
import json, sys

print(json.dumps({
    "contents": [{"role": "user", "parts": [{"text": sys.argv[1]}]}],
    "generationConfig": {
        "responseModalities": ["IMAGE"],
        "imageConfig": {"aspectRatio": sys.argv[2] if len(sys.argv) > 2 else "3:4"},
    },
}))
