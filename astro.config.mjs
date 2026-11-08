// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Read post frontmatter so the sitemap can list each post's last-updated
// date and skip category pages that don't have any posts yet.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const posts = {};
const usedCategories = new Set();
for (const file of readdirSync(blogDir).filter((f) => f.endsWith('.md'))) {
  const fm = readFileSync(new URL(file, blogDir), 'utf8').split('---')[1] ?? '';
  const get = (key) => fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim();
  if (get('draft') === 'true') continue;
  const date = get('updatedDate') ?? get('pubDate');
  posts[file.replace(/\.md$/, '')] = date;
  if (get('category')) usedCategories.add(get('category'));
}

export default defineConfig({
  site: 'https://stripandstreet.com',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: (page) => {
        if (/\/(thanks|404)\/?$/.test(page)) return false;
        const cat = page.match(/\/category\/([^/]+)\/?$/);
        return !cat || usedCategories.has(cat[1]);
      },
      serialize: (item) => {
        const slug = new URL(item.url).pathname.replace(/^\/|\/$/g, '');
        if (posts[slug]) item.lastmod = new Date(posts[slug]).toISOString();
        return item;
      },
    }),
  ],
  build: { format: 'directory' },
});
