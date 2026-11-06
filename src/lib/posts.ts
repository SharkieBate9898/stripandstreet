import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. Drafts and future-dated posts are hidden. */
export async function getPosts(): Promise<Post[]> {
  const now = Date.now();
  const posts = await getCollection('blog', ({ data }) => !data.draft && data.pubDate.valueOf() <= now);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function readingTime(body = ''): number {
  const words = body.replace(/[#>*_`\-\[\]()!]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Related posts: same category first, then shared tags, then newest. */
export function related(post: Post, all: Post[], n = 3): Post[] {
  const score = (p: Post) =>
    (p.data.category === post.data.category ? 3 : 0) +
    p.data.tags.filter((t) => post.data.tags.includes(t)).length;
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .slice(0, n)
    .map(({ p }) => p);
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
