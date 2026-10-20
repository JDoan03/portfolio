import type { APIRoute } from 'astro';
import css from '../styles/global.css?raw';
import { getProfile } from '../lib/profile';
import { darkTheme, renderSocialPreview } from '../lib/social-preview';

// The link-preview image (og:image), drawn at build time from profile.md and the dark theme tokens.
export const GET: APIRoute = async () => {
  const png = await renderSocialPreview(await getProfile(), darkTheme(css));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
