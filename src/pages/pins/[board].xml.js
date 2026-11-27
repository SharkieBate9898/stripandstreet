// Pinterest auto-publish feeds: one RSS feed per Pinterest board.
// Pinterest reads /pins/<board>.xml once a day and turns new items into Pins.
// Pins live in pins/pins.json; only pins with status "live" appear here.
// See pins/README.md.
import { statSync } from 'node:fs';
import { SITE } from '../../consts';
import boards from '../../../pins/boards.json';
import pins from '../../../pins/pins.json';

export function getStaticPaths() {
  return Object.keys(boards).map((board) => ({ params: { board } }));
}

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function GET({ params }) {
  const board = params.board;
  const live = pins
    .filter((p) => p.board === board && p.status === 'live' && p.publishedOn)
    .sort((a, b) => (a.publishedOn < b.publishedOn ? 1 : -1));

  const items = live
    .map((p) => {
      const img = `${SITE.url}/pins/${p.id}.png`;
      let length = 0;
      try {
        length = statSync(new URL(`../../../public/pins/${p.id}.png`, import.meta.url)).size;
      } catch {}
      // Each Pin gets its own UTM'd link so Pinterest treats it as a separate item
      // and Analytics can tell which design brought the click.
      const link = `${SITE.url}/${p.post}/?utm_source=pinterest&utm_medium=social&utm_campaign=${encodeURIComponent(p.board)}&utm_content=${encodeURIComponent(p.id)}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">stripandstreet-pin-${esc(p.id)}</guid>
      <pubDate>${new Date(`${p.publishedOn}T12:00:00-05:00`).toUTCString()}</pubDate>
      <description><![CDATA[<img src="${img}" alt="${esc(p.title)}" /><p>${esc(p.description)}</p>]]></description>
      <enclosure url="${img}" length="${length}" type="image/png" />
      <media:content url="${img}" medium="image" type="image/png" width="1000" height="1500" />
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}: ${esc(boards[board])}</title>
    <link>${SITE.url}/</link>
    <atom:link href="${SITE.url}/pins/${board}.xml" rel="self" type="application/rss+xml" />
    <description>${esc(boards[board])} from ${esc(SITE.name)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
