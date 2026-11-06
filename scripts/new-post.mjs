// Usage: npm run new-post -- "Post Title" category
// Creates src/content/blog/<slug>.md with the frontmatter filled in.
import { writeFileSync, existsSync } from 'node:fs';

const [title, category = 'car-culture'] = process.argv.slice(2);
if (!title) {
  console.error('Usage: npm run new-post -- "Post Title" category');
  process.exit(1);
}
const slug = title.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const file = `src/content/blog/${slug}.md`;
if (existsSync(file)) {
  console.error(`${file} already exists`);
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  file,
  `---
title: "${title.replace(/"/g, '\\"')}"
description: "One or two sentences, under 160 characters, that make someone want to click."
pubDate: ${today}
category: ${category}
tags: []
keyword: ""
heroImage: "https://images.unsplash.com/PHOTO-ID?w=1600&q=80&auto=format&fit=crop"
heroAlt: "Describe the photo"
heroCredit: "Photographer Name"
heroCreditUrl: "https://unsplash.com/photos/PHOTO-PAGE-ID"
draft: true
faq: []
---

Write the intro here.

## First section
`,
);
console.log(`Created ${file} (draft: true — set to false to publish)`);
