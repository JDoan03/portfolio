import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import css from '../styles/global.css?raw';
import { darkTheme, renderSocialPreview } from '../lib/social-preview';

// The link-preview image (og:image), drawn at build time from profile.md and the dark theme tokens.
export const GET: APIRoute = async () => {
  const profile = await getEntry('profile', 'profile');
  if (!profile) throw new Error('src/content/profile/profile.md is missing');
  const png = await renderSocialPreview(profile.data, darkTheme(css));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
