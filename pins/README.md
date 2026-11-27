# Pinterest pins

Pinterest auto-publishes from one RSS feed per board. Each feed lives at
`https://stripandstreet.com/pins/<board>.xml` and lists every pin in
`pins.json` with `"status": "live"` for that board. Pinterest checks the feeds
daily and turns new items into Pins.

| Feed key (`board`) | Pinterest board |
|---|---|
| `project-car-buyers-guides` | Project Car Buyer's Guides |
| `miata-mods-upgrades` | Miata Mods & Upgrades |
| `autocross-track-day-tips` | Autocross & Track Day Tips |
| `suspension-handling` | Suspension & Handling |
| `engine-swaps-power` | Engine Swaps & Power |
| `muscle-car-culture` | Muscle Car Culture |

## Files
- `pins.json`: every pin. `layout` is picked from the fields: `items` (a 3–5 item list) → list layout, `stat` + `statLabel` → big number layout, otherwise a big headline. `style` is `dark`, `red` or `light`. `accent` must be an exact substring of `headline`; it's highlighted.
- `boards.json`: feed key → board name.
- `../scripts/pins/render.py`: renders missing pin images to `public/pins/<id>.png` (1000×1500).
- `../scripts/pins/release.py`: marks the next queued pin live, dated today.

## Daily routine (the scheduled task does this)
1. For any post in `src/content/blog/` with no pins, add 3 pins to `pins.json` (one `dark`, one `red`, one `light`; different headlines and angles; `status: "queued"`, `publishedOn: null`).
2. `python3 scripts/pins/render.py` (renders only missing images). Check new images look right.
3. `python3 scripts/pins/release.py` (releases one pin).
4. `npm run build`, then commit and push. Netlify publishes; Pinterest picks it up within ~24 hours.

## Pin copy rules
- Original graphics only. Never other creators' photos or videos.
- Titles under 100 characters, search phrase first. Descriptions 1–2 natural sentences with the keyword.
- Only facts and prices that are in the linked post.
