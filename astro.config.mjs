// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical URLs, og:url, og:image and the sitemap are built from SITE_URL. CI sets it to the production
// address (.github/workflows/ci.yml) and CI builds are the ones that get deployed, so there it must be
// the public address; local builds fall back to the dev server.
// tests/site-url.test.ts checks that a bad SITE_URL stops the build.
function siteUrl() {
  const { SITE_URL, CI } = process.env;
  if (!SITE_URL) {
    if (CI) throw new Error('SITE_URL is not set. CI builds get deployed, so set it to the public address (e.g. https://josephdoan.dev).');
    return 'http://localhost:4321';
  }
  const url = URL.parse(SITE_URL);
  if (url?.protocol !== 'https:' && url?.protocol !== 'http:') {
    throw new Error(`SITE_URL must be a full URL like https://josephdoan.dev, not "${SITE_URL}".`);
  }
  if (CI && url.hostname === 'localhost') {
    throw new Error(`SITE_URL points at localhost (${SITE_URL}). CI builds get deployed, so set it to the public address.`);
  }
  return SITE_URL;
}

export default defineConfig({
  site: siteUrl(),
  integrations: [sitemap()],
});
