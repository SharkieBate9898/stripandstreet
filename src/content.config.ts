import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(170),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['builds', 'car-culture', 'buyers-guides', 'how-to', 'gear-and-parts', 'news']),
    tags: z.array(z.string()).default([]),
    keyword: z.string().optional(),
    // Every post must have a photo. The build fails without one.
    heroImage: z.string().min(1, 'Every post needs a heroImage (see POSTING.md)'),
    heroAlt: z.string().min(1, 'Describe the photo in heroAlt'),
    heroCredit: z.string().min(1, 'Credit the photographer in heroCredit'),
    heroCreditUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { blog };
