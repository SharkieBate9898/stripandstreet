// Builds photo versions of Pinterest pins at deploy time.
//
// For every pin in pins/pins.json with "photo": true, this fetches the linked
// post's hero photo (its Unsplash heroImage), lays the pin out with the photo on
// top and the text below, and writes public/pins/<id>.png, replacing the
// text-only fallback made by render.py. It runs before `astro build` (see the
// "build" script in package.json), so Netlify, which can reach Unsplash, always
// publishes the photo versions.
//
// If a photo can't be downloaded (for example in a sandbox without internet),
// the pin keeps its text-only PNG and the build continues.
// For local design checks, put a JPEG at scripts/pins/.cache/<post-slug>.jpg.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p) => readFileSync(root + p);
const pins = JSON.parse(read('pins/pins.json'));

const fonts = [
  { name: 'Narrow', data: read('node_modules/@fontsource/archivo-narrow/files/archivo-narrow-latin-700-normal.woff'), weight: 700 },
  { name: 'Archivo', data: read('node_modules/@fontsource/archivo/files/archivo-latin-500-normal.woff'), weight: 500 },
  { name: 'Archivo', data: read('node_modules/@fontsource/archivo/files/archivo-latin-800-normal.woff'), weight: 800 },
];
const logo = `data:image/png;base64,${read('public/logo-square.png').toString('base64')}`;

const THEMES = {
  dark: { bg: '#0b0b0b', fg: '#f7f7f7', muted: '#c9c9c9', accent: '#f8d858', kicker: '#f80000', rule: '#2a2a2a', btn: '#f80000', num: '#f80000' },
  red: { bg: '#c40000', fg: '#ffffff', muted: '#ffe1e1', accent: '#f8d858', kicker: '#0b0b0b', rule: '#e23a3a', btn: '#0b0b0b', num: '#f8d858' },
  light: { bg: '#f4f1ea', fg: '#111111', muted: '#4a4a4a', accent: '#c40000', kicker: '#c40000', rule: '#d9d3c7', btn: '#111111', num: '#c40000' },
};

const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, children } });
const img = (src, style) => ({ type: 'img', props: { src, style } });

function heroUrl(post, width, height) {
  const md = readFileSync(`${root}src/content/blog/${post}.md`, 'utf8');
  const m = md.match(/^heroImage:\s*"?([^"\n]+)"?/m);
  if (!m) return null;
  const base = m[1].split('?')[0];
  return `${base}?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`;
}

async function photoFor(post, width, height) {
  const cached = `${root}scripts/pins/.cache/${post}.jpg`;
  if (existsSync(cached)) return `data:image/jpeg;base64,${readFileSync(cached).toString('base64')}`;
  const url = heroUrl(post, width, height);
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

function headline(p, t, size) {
  // Split into words; color the characters inside the accent range. A word that
  // is only partly accented (e.g. "AP2:") becomes two spans with no gap.
  const text = p.headline;
  const a0 = p.accent && text.includes(p.accent) ? text.indexOf(p.accent) : -1;
  const a1 = a0 < 0 ? -1 : a0 + p.accent.length;
  const words = [];
  for (const m of text.matchAll(/\S+/g)) {
    const s = m.index;
    const e = s + m[0].length;
    const segs = [];
    let i = s;
    for (const cut of [a0, a1, e].filter((c) => c > s && c <= e).sort((x, y) => x - y)) {
      if (cut > i) segs.push([text.slice(i, cut), i >= a0 && i < a1 ? t.accent : t.fg]);
      i = cut;
    }
    words.push(h('div', { marginRight: size * 0.22 }, segs.map(([str, color]) => h('span', { color }, str))));
  }
  return h('div', { flexWrap: 'wrap', fontFamily: 'Narrow', fontWeight: 700, fontSize: size, lineHeight: 0.98, textTransform: 'uppercase', letterSpacing: -1 }, words);
}

function headlineSize(p) {
  const n = p.headline.length;
  if (p.layout === 'list') return n <= 26 ? 96 : n <= 38 ? 84 : 74;
  if (p.layout === 'stat') return n <= 26 ? 92 : 80;
  return n <= 24 ? 124 : n <= 34 ? 110 : n <= 44 ? 96 : 86;
}

function layout(p, photo) {
  const t = THEMES[p.style];
  const photoH = p.layout === 'list' ? 560 : p.layout === 'stat' ? 600 : 700;
  const body = [headline(p, t, headlineSize(p))];
  if (p.layout === 'stat') {
    body.push(h('div', { fontFamily: 'Narrow', fontWeight: 700, fontSize: 150, lineHeight: 1, color: t.accent, marginTop: 18 }, p.stat));
    body.push(h('div', { fontFamily: 'Archivo', fontWeight: 800, fontSize: 34, marginTop: 6 }, p.statLabel));
  } else if (p.layout === 'list') {
    body.push(
      h('div', { flexDirection: 'column', marginTop: 26 },
        p.items.map((it, i) =>
          h('div', { alignItems: 'center', fontFamily: 'Archivo', fontWeight: 800, fontSize: 36, padding: '9px 0', borderBottom: `2px solid ${t.rule}` }, [
            h('div', { color: t.num, width: 46, fontSize: 40 }, String(i + 1)),
            h('div', {}, it),
          ]),
        ),
      ),
    );
  } else if (p.sub) {
    body.push(h('div', { fontFamily: 'Archivo', fontWeight: 500, fontSize: 36, lineHeight: 1.3, color: t.muted, marginTop: 26 }, p.sub));
  }
  return h('div', { width: 1000, height: 1500, flexDirection: 'column', background: t.bg, color: t.fg, position: 'relative' }, [
    h('div', { width: 1000, height: photoH, position: 'relative' }, [
      img(photo, { width: 1000, height: photoH, objectFit: 'cover' }),
      h('div', { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), ${t.bg})` }, []),
      h('div', { position: 'absolute', top: 44, left: 56, alignItems: 'center' }, [
        img(logo, { width: 104, height: 104, borderRadius: 52, border: '4px solid #ffffff' }),
        h('div', { marginLeft: 18, background: t.kicker === '#0b0b0b' ? '#0b0b0b' : '#f80000', color: '#ffffff', fontFamily: 'Archivo', fontWeight: 800, fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', padding: '12px 20px', borderRadius: 6 }, p.kicker),
      ]),
    ]),
    h('div', { flexDirection: 'column', padding: '10px 64px 0' }, body),
    h('div', { position: 'absolute', left: 64, right: 64, bottom: 64, justifyContent: 'space-between', alignItems: 'center' }, [
      h('div', { background: t.btn, color: '#ffffff', fontFamily: 'Archivo', fontWeight: 800, fontSize: 32, padding: '20px 32px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: 2 }, p.cta || 'Read the guide'),
      h('div', { fontFamily: 'Archivo', fontWeight: 800, fontSize: 32, color: t.accent }, 'stripandstreet.com'),
    ]),
    h('div', { position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, backgroundImage: 'linear-gradient(90deg, #f80000 70%, #f8d858 70%)' }, []),
  ]);
}

const only = process.argv.slice(2);
let made = 0;
let skipped = 0;
for (const p of pins) {
  if (!p.photo || (only.length && !only.includes(p.id))) continue;
  const photoH = p.layout === 'list' ? 560 : p.layout === 'stat' ? 600 : 700;
  const photo = await photoFor(p.post, 1000, photoH);
  if (!photo) {
    skipped++;
    continue;
  }
  const svg = await satori(layout(p, photo), { width: 1000, height: 1500, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } }).render().asPng();
  writeFileSync(`${root}public/pins/${p.id}.png`, png);
  made++;
}
console.log(`[photo-pins] built ${made} photo pins${skipped ? `, ${skipped} kept text-only (photo unavailable)` : ''}`);
