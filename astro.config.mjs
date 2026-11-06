// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stripandstreet.com',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !/\/(thanks|404)\/?$/.test(page) })],
  build: { format: 'directory' },
});
