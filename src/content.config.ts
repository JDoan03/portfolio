import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Everything on the home page that isn't a job or a project: one Markdown file, all frontmatter.
const profile = defineCollection({
  loader: glob({ base: './src/content/profile', pattern: '*.md' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    location: z.string(),
    description: z.string(),
    hook: z.string(), // wrap a phrase in *asterisks* to give it the porch-light glow
    subhook: z.string(),
    intro: z.string(),
    offTheClock: z.string(),
    toolbox: z.array(z.object({ label: z.string(), items: z.array(z.string()) })),
    education: z.object({
      school: z.string(),
      degree: z.string(),
      start: z.string().regex(/^\d{4}-\d{2}$/),
      end: z.string().regex(/^\d{4}-\d{2}$/),
      note: z.string().optional(),
    }),
    contact: z.object({
      heading: z.string(),
      blurb: z.string(),
      email: z.email().nullable(),
      linkedin: z.url(),
      github: z.url().nullable(),
      resume: z.string().nullable(),
    }),
  }),
});

const jobs = defineCollection({
  loader: glob({ base: './src/content/jobs', pattern: '*.md' }),
  schema: z.object({
    org: z.string(),
    location: z.string(),
    // Newest role first. Months are "2024-11"; end: null means present.
    roles: z
      .array(
        z.object({
          title: z.string(),
          start: z.string().regex(/^\d{4}-\d{2}$/),
          end: z.string().regex(/^\d{4}-\d{2}$/).nullable(),
        }),
      )
      .min(1),
    order: z.number(), // 1 = top of the page
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(['in-progress', 'live', 'archived']),
    section: z.enum(['building', 'earlier']),
    meta: z.string().optional(),
    stack: z.array(z.string()).default([]),
    repo: z.url().optional(),
    live: z.url().optional(),
    page: z.boolean().default(false), // true = gets its own /projects/<file-name> page
    order: z.number().default(0),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false), // drafts show in `npm run dev` only
  }),
});

export const collections = { profile, jobs, projects, notes };
