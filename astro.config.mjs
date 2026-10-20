// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// CI sets SITE_URL to the production address (see .github/workflows/ci.yml); local builds fall back to the dev server.
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  integrations: [sitemap()],
});
