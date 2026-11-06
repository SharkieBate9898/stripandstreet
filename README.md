# Strip and Street — stripandstreet.com

A fast static blog built with [Astro](https://astro.build), hosted free on Netlify.
Every push to GitHub rebuilds and publishes the site automatically.

## Run it on your computer

1. Install Node.js 22 or newer from https://nodejs.org
2. In this folder, run `npm install` once.
3. Run `npm run dev` and open http://localhost:4321

## Add a post

**Every post needs a photo.** See `POSTING.md` for the full checklist, including how to pick and credit an Unsplash photo. The build fails if a post has no photo.

Posts are Markdown files in `src/content/blog/`. The file name becomes the URL:
`best-first-project-cars.md` → `stripandstreet.com/best-first-project-cars/`

Quick start: `npm run new-post -- "My Post Title" buyers-guides`

Frontmatter fields:

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Under 70 characters is best for Google. |
| `description` | yes | Under 160 characters. Used as the meta description. |
| `pubDate` | yes | `2026-11-05`. Posts dated in the future stay hidden until a build runs on/after that date. |
| `category` | yes | `builds`, `car-culture`, `buyers-guides`, `how-to`, `gear-and-parts`, `news` |
| `tags` | no | `[miata, budget, suspension]` |
| `keyword` | no | The main search phrase the post targets. |
| `heroImage` | **yes** | An Unsplash image URL (see `POSTING.md`) or `/images/my-photo.jpg` for your own photo in `public/images/`. |
| `heroAlt` / `heroCredit` | **yes** | Image description and photographer name. |
| `heroCreditUrl` | no | Link to the photo's Unsplash page. |
| `featured` | no | `true` pins the post as the big homepage story. |
| `draft` | no | `true` hides the post. |
| `faq` | no | List of `- q: "Question?"` / `  a: "Answer."` pairs. Shown at the end and added as FAQ schema. |

### Affiliate links

Until you have a real affiliate link, write the placeholder as
`[Product name](#affiliate)`. It shows as a dashed amber link so it's easy to spot.
Replace `#affiliate` with your real link later. The affiliate disclosure box appears automatically
on any post that contains `#affiliate`, `amzn.to`, or Amazon links.

## Site settings

Everything site-wide lives in `src/consts.ts`:

- `MAILCHIMP_ACTION`: paste your Mailchimp embedded-form URL. Until then, signups are collected by
  Netlify Forms (Netlify dashboard → Forms).
- `GSC_VERIFICATION`: your Google Search Console verification code.
- `ADS`: set `enabled: true` and fill in your AdSense publisher ID and slot IDs once approved.
- Category names, colors, and descriptions.

## SEO built in

Per-page titles, meta descriptions, and canonical URLs · Open Graph and Twitter cards · Article,
BreadcrumbList, FAQPage, Organization, and WebSite schema · `sitemap-index.xml` · `robots.txt` ·
RSS feed at `/rss.xml` · clean URLs · self-hosted fonts (no third-party requests).

## Deploy (one-time)

1. Create a GitHub repo and push this folder to it.
2. In Netlify: **Add new site → Import an existing project → GitHub** → pick the repo.
   Build settings are read from `netlify.toml` automatically.
3. In Netlify: **Domain management → Add a domain** → `stripandstreet.com`, then follow
   Netlify's DNS instructions at your domain registrar.
4. In Netlify: **Forms** → enable form detection so the contact and newsletter forms work.
