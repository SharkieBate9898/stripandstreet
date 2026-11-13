// ─────────────────────────────────────────────────────────────
// Site settings. Edit this file to change site-wide details.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'Strip and Street',
  url: 'https://stripandstreet.com',
  tagline: 'Car culture for people who actually wrench.',
  description:
    'Strip and Street covers project cars, buyer’s guides, mods and car culture — straight talk for enthusiasts building something of their own.',
  locale: 'en_US',
  founded: 2019,
  ogImage: '/og-default.png',
  facebook: 'https://www.facebook.com/stripandstreet',
  instagram: 'https://www.instagram.com/stripandstreet',
};

// Paste your Mailchimp embedded-form action URL here
// (Mailchimp → Audience → Signup forms → Embedded forms → copy the
// URL inside action="..."). While empty, signups are collected by
// Netlify Forms instead (Netlify dashboard → Forms → newsletter).
export const MAILCHIMP_ACTION = '';

// Private visitor stats. Create a free Cloudflare account → Web Analytics →
// Add a site → stripandstreet.com → choose "Manual setup" (not "Automatic") →
// copy the token from the snippet and paste it here. Only you can see the dashboard.
export const CLOUDFLARE_ANALYTICS_TOKEN = '';

// Google Analytics 4 Measurement ID (starts with G-). Leave empty to turn GA off.
export const GA_MEASUREMENT_ID = 'G-2V43ETT5NN';

// Google Search Console HTML-tag verification code (just the content="..." value).
export const GSC_VERIFICATION = '';

// AdSense. Set ADS_ENABLED to true and fill in your publisher ID
// (ca-pub-XXXXXXXXXXXXXXXX) and slot IDs once AdSense approves the site.
export const ADS = {
  enabled: false,
  client: '',
  slots: { inArticle: '', sidebar: '' },
};

export const CATEGORIES = [
  { slug: 'builds', name: 'Builds', blurb: 'Project cars from bare shell to street-ready.', color: '#f80000' },
  { slug: 'car-culture', name: 'Car Culture', blurb: 'Scenes, history and the people behind the wheel.', color: '#f8d858' },
  { slug: 'buyers-guides', name: 'Buyer’s Guides', blurb: 'What to buy, what to avoid and what to pay.', color: '#f7f7f7' },
  { slug: 'how-to', name: 'How-To', blurb: 'Garage-floor guides you can actually follow.', color: '#ff5c5c' },
  { slug: 'gear-and-parts', name: 'Gear & Parts', blurb: 'Parts, tools and gear worth your money.', color: '#c9a227' },
  { slug: 'news', name: 'News', blurb: 'What’s happening in the enthusiast world.', color: '#8a8a8a' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;
