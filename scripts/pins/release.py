"""Release the next queued Pinterest pin (or a specific one) by marking it live.

Usage (from the repo root):
    python3 scripts/pins/release.py              # release 1 pin, dated today (America/New_York)
    python3 scripts/pins/release.py 3            # release 3 pins
    python3 scripts/pins/release.py --id ID      # release one specific pin

Which pin goes next:
  1. Pins for posts that have no live pin yet (new posts go first).
  2. Otherwise the post whose most recent live pin is oldest, so posts rotate.
  3. Within a post, pins go in the order they appear in pins/pins.json.
A pin is only released if its image exists in public/pins/.
"""
import json
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
PINS = ROOT / "pins" / "pins.json"
IMG = ROOT / "public" / "pins"


def today():
    return datetime.now(ZoneInfo("America/New_York")).date().isoformat()


def pick(pins):
    queued = [p for p in pins if p["status"] == "queued" and (IMG / f"{p['id']}.png").exists()]
    if not queued:
        return None
    last_live = {}
    for p in pins:
        if p["status"] == "live" and p.get("publishedOn"):
            last_live[p["post"]] = max(last_live.get(p["post"], ""), p["publishedOn"])
    order = {p["id"]: i for i, p in enumerate(pins)}
    # Posts with no live pin sort first (""), then oldest last-live date.
    return min(queued, key=lambda p: (last_live.get(p["post"], ""), order[p["id"]]))


def main(argv):
    pins = json.loads(PINS.read_text())
    released = []
    if "--id" in argv:
        pid = argv[argv.index("--id") + 1]
        p = next(p for p in pins if p["id"] == pid)
        p["status"], p["publishedOn"] = "live", today()
        released.append(p["id"])
    else:
        n = int(argv[0]) if argv else 1
        for _ in range(n):
            p = pick(pins)
            if not p:
                break
            p["status"], p["publishedOn"] = "live", today()
            released.append(p["id"])
    PINS.write_text(json.dumps(pins, indent=2, ensure_ascii=False) + "\n")
    queued = sum(1 for p in pins if p["status"] == "queued")
    print("released:", ", ".join(released) or "nothing", f"| still queued: {queued}")


if __name__ == "__main__":
    main(sys.argv[1:])
