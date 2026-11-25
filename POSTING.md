# How to publish a Strip and Street post

Follow this checklist for every new post, including the automated daily posts.
The site will **refuse to build** if a post is missing its photo, photo description
or photo credit, so a post without a photo can never go live.

## 1. Pick the topic
Take the next unused topic from `content-plan.md` (once it exists) and mark it done when the post is published.

## 2. Write the post
- File: `src/content/blog/<url-slug>.md`. The file name becomes the URL.
- 1,000–2,000 words, conversational enthusiast voice, clear `##` sections, specific and useful (no filler).
- Fill in `title`, `description` (under 160 characters), `pubDate`, `category`, `tags`, `keyword` and 3–5 `faq` entries.
- Check facts, specs and prices against current sources. Say "as of <month year>" for prices.
- Link to 1–3 related Strip and Street posts.
- Then add a link **to the new post** from 1–2 older related posts, in a sentence where it fits naturally (never a bare "related posts" list). Every post should have at least two other posts linking to it.
- Affiliate links:
  - **Tire Rack (CJ, approved).** For tires, wheels, brakes and suspension Tire Rack sells, link straight to the product page with this deep link, writing it as raw HTML so it gets the right `rel`:
    `<a href="https://www.jdoqocy.com/click-101929748-15734228?url=ENCODED_TIRERACK_URL" rel="sponsored nofollow noopener" target="_blank">Product name</a>`
    `ENCODED_TIRERACK_URL` is the URL-encoded Tire Rack page, e.g. `https%3A%2F%2Fwww.tirerack.com%2Ftires%2Ffalken-azenis-rt660-plus`. Tire pages follow `https://www.tirerack.com/tires/<make>-<model>` (lowercase, hyphens, `+` becomes `-plus`). Only link a product page you are confident exists; otherwise link the brand page `https://www.tirerack.com/tires/brands/<make>`.
  - Everything else: placeholder `[Product name](#affiliate)` until a real program is approved.

## 3. Add a photo (required)
1. Search Unsplash with the license filter set to free: `https://unsplash.com/s/photos/<search>?license=free&orientation=landscape`
2. Only use photos that say **"Free to use under the Unsplash License"**. Never use **Unsplash+** photos, and never use photos from Google Images or other sites.
3. Pick a photo that matches the post (the actual car model when possible, landscape, good quality).
4. Copy the image ID from the image address (it looks like `photo-1616646187794-d3007d1923a9`).
5. Add to the post's frontmatter:

```yaml
heroImage: "https://images.unsplash.com/<photo-id>?w=1600&q=80&auto=format&fit=crop"
heroAlt: "Plain description of what's in the photo (for Google and screen readers)"
heroCredit: "Photographer Name"
heroCreditUrl: "https://unsplash.com/photos/<photo-page-id>"
```

Avoid reusing a photo that another post already uses.

## 4. Check and publish
- Run `npm run build`. If it fails, fix it. **Never publish a post when the build fails.**
- Commit and push to GitHub. Netlify publishes automatically.
- Write a 2–3 sentence Facebook caption with the post link.
