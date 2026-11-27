"""Render Pinterest pin images (1000x1500 PNG) from pins/pins.json.

Usage (from the repo root, after `npm ci`):
    python3 scripts/pins/render.py            # render any pin whose image is missing
    python3 scripts/pins/render.py --all      # re-render every pin
    python3 scripts/pins/render.py ID [ID..]  # render specific pins

Needs Python Playwright and a Chromium/Chrome browser. If Chrome is not at
/usr/bin/google-chrome, Playwright's own Chromium is used (`python3 -m playwright install chromium`).
"""
import html
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PINS = ROOT / "pins" / "pins.json"
OUT = ROOT / "public" / "pins"
FONT = ROOT / "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2"
LOGO = ROOT / "public" / "logo-square.png"

THEMES = {
    "dark": dict(bg="#0b0b0b", fg="#f7f7f7", muted="#c9c9c9", accent="#f8d858", kicker="#f80000", rule="#262626", btn="#f80000", btnfg="#ffffff", num="#f80000"),
    "red": dict(bg="#d10000", fg="#ffffff", muted="#ffe1e1", accent="#f8d858", kicker="#f8d858", rule="#ff4a4a", btn="#0b0b0b", btnfg="#ffffff", num="#f8d858"),
    "light": dict(bg="#f4f1ea", fg="#111111", muted="#4a4a4a", accent="#d10000", kicker="#d10000", rule="#d9d3c7", btn="#111111", btnfg="#ffffff", num="#d10000"),
}

CSS = """
@font-face{font-family:Archivo;src:url('%(font)s');font-weight:100 900;font-stretch:62%% 125%%}
*{margin:0;box-sizing:border-box}
body{width:1000px;height:1500px;background:%(bg)s;color:%(fg)s;font-family:Archivo,sans-serif;position:relative;overflow:hidden}
.stripe{position:absolute;left:0;right:0;height:16px}
.top{display:flex;align-items:center;gap:22px;padding:70px 80px 0}
.top img{width:116px;height:116px;border-radius:50%%}
.top span{font-size:30px;font-weight:800;letter-spacing:5px;color:%(kicker)s;text-transform:uppercase}
.wrap{position:absolute;left:80px;right:80px;top:250px;bottom:230px;display:flex;flex-direction:column;justify-content:center}
h1{font-weight:900;font-stretch:78%%;text-transform:uppercase;line-height:.96;font-size:%(h1)spx}
h1 em{font-style:normal;color:%(accent)s}
.sub{margin-top:36px;font-size:40px;line-height:1.3;font-weight:500;color:%(muted)s}
.stat{font-weight:900;font-stretch:75%%;font-size:230px;line-height:.9;color:%(accent)s;margin-top:40px}
.statlabel{font-size:40px;font-weight:700;margin-top:14px}
ol{margin-top:46px;padding:0;list-style:none;counter-reset:n}
li{counter-increment:n;display:flex;align-items:baseline;gap:26px;font-size:44px;font-weight:700;padding:13px 0;border-bottom:2px solid %(rule)s}
li::before{content:counter(n);color:%(num)s;font-weight:900;font-size:48px;width:40px;flex:none}
.foot{position:absolute;bottom:84px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center;gap:30px}
.btn{background:%(btn)s;color:%(btnfg)s;font-weight:800;font-size:34px;padding:22px 34px;border-radius:8px;text-transform:uppercase;letter-spacing:2px;white-space:nowrap}
.url{font-size:34px;font-weight:800;color:%(accent)s}
"""


def headline_html(p):
    text = html.escape(p["headline"])
    acc = p.get("accent")
    if acc and acc in p["headline"]:
        a = html.escape(acc)
        text = text.replace(a, f"<em>{a}</em>", 1)
    return text


def h1_size(p):
    n = len(p["headline"])
    if p["layout"] == "big":
        return 150 if n <= 26 else 128 if n <= 36 else 112 if n <= 46 else 98
    return 104 if n <= 30 else 92 if n <= 40 else 80


def page(p):
    t = dict(THEMES[p["style"]])
    t["font"] = FONT.as_uri()
    t["h1"] = h1_size(p)
    body = [f'<h1>{headline_html(p)}</h1>']
    if p["layout"] == "stat":
        body.append(f'<div class="stat">{html.escape(p["stat"])}</div><div class="statlabel">{html.escape(p["statLabel"])}</div>')
    if p.get("sub"):
        body.append(f'<div class="sub">{html.escape(p["sub"])}</div>')
    if p["layout"] == "list":
        body.append("<ol>" + "".join(f"<li>{html.escape(i)}</li>" for i in p["items"]) + "</ol>")
    stripe_a = f'linear-gradient(90deg,#f80000 70%,#f8d858 70%)' if p["style"] != "red" else "linear-gradient(90deg,#0b0b0b 70%,#f8d858 70%)"
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS % t}</style></head><body>
<div class="stripe" style="top:0;background:{stripe_a}"></div>
<div class="top"><img src="{LOGO.as_uri()}"><span>{html.escape(p["kicker"])}</span></div>
<div class="wrap">{''.join(body)}</div>
<div class="foot"><div class="btn">{html.escape(p.get("cta") or "Read the guide")}</div><div class="url">stripandstreet.com</div></div>
</body></html>"""


def main(argv):
    pins = json.loads(PINS.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    if "--all" in argv:
        todo = pins
    elif argv:
        todo = [p for p in pins if p["id"] in argv]
    else:
        todo = [p for p in pins if not (OUT / f"{p['id']}.png").exists()]
    if not todo:
        print("Nothing to render.")
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        chrome = "/usr/bin/google-chrome"
        browser = pw.chromium.launch(executable_path=chrome) if os.path.exists(chrome) else pw.chromium.launch()
        pg = browser.new_page(viewport={"width": 1000, "height": 1500})
        for p in todo:
            tmp = OUT / f".{p['id']}.html"
            tmp.write_text(page(p))
            pg.goto(tmp.as_uri())
            pg.wait_for_timeout(300)
            # Shrink the headline until the content block fits above the footer.
            for _ in range(12):
                over = pg.evaluate("(()=>{const w=document.querySelector('.wrap');return w.scrollHeight>w.clientHeight})()")
                if not over:
                    break
                pg.evaluate("(()=>{const h=document.querySelector('h1');h.style.fontSize=(parseFloat(getComputedStyle(h).fontSize)*0.92)+'px'})()")
            pg.screenshot(path=str(OUT / f"{p['id']}.png"))
            tmp.unlink()
            print("rendered", p["id"])
        browser.close()


if __name__ == "__main__":
    main(sys.argv[1:])
