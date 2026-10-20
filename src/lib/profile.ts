import { getEntry } from 'astro:content';

/** profile.md's frontmatter: everything on the home page that isn't a job or a project. */
export async function getProfile() {
  const profile = await getEntry('profile', 'profile');
  if (!profile) throw new Error('src/content/profile/profile.md is missing');
  return profile.data;
}
