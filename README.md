# Portfolio

Joseph Doan's portfolio. Built with [Astro](https://astro.build), deployed as static files to the hosting platform it showcases.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321, drafts included
npm run build    # static site in dist/
npm run check    # type-check .astro and .ts files
npm test         # everything CI runs: type-check, build, link-preview checks, link check, Lighthouse
```

## Checks (CI)

Every pull request and push to `main` runs [.github/workflows/ci.yml](.github/workflows/ci.yml). It fails if:

- a content file doesn't match its schema, or the types don't check;
- a page is missing the tags that give shared links a preview image, or that image isn't a 1200×630 PNG under 300 KB ([tests/](tests/));
- any link on the built site is broken (LinkedIn is skipped because it blocks bots);
- any of the three pages scores below **95** in Lighthouse performance, accessibility, best practices or SEO (mobile, median of 3 runs);
- a page ships more than 20 KB of JavaScript.

Thresholds live in [lighthouserc.json](lighthouserc.json). Full HTML reports are saved to `.lighthouseci/reports/` locally, and attached to each CI run as the `lighthouse-reports` artifact.

## How it's organised

Standard Astro layout. Everything is rendered to plain HTML at build time; the only JavaScript visitors download is the theme switch and the porch-light clock (under 2 KB together).

```
src/
├── content.config.ts   # schema for every content collection (Zod); the build fails on bad content
├── content/            # the words: Markdown files, one per job / project / note
├── pages/              # file-based routing: index.astro → /, projects/[id].astro → /projects/<id>/
├── layouts/            # page shells: Base (<html>, <head>, theme bootstrap), Page (sub-pages)
├── components/         # reusable pieces: lamp, theme switch, porch-light time, header
├── lib/                # plain TypeScript: sunset maths, formatting, note queries, link-preview image
└── styles/global.css   # design tokens (colours, fonts) and base styles
public/                 # copied as-is: favicon, robots.txt, later resume.pdf
tests/                  # checks on the built site (node --test), run after the build
```

## Edit the content

Everything you'd normally change is Markdown in `src/content/`. Edit a file (in GitHub's web editor works fine, even on a phone), commit, and CI redeploys.

| What | Where |
|---|---|
| Hook, intro, toolbox, education, off-the-clock line, contact links | `src/content/profile/profile.md` (frontmatter) |
| Jobs, one file each | `src/content/jobs/*.md`: roles in frontmatter, bullets in the body |
| Projects, one file each | `src/content/projects/*.md`: `page: true` gives it a case-study page |
| Homelab notes | `src/content/notes/*.md`: `draft: true` keeps it out of the live site |

If a field is missing or malformed, `npm run build` fails and names the file and field.

The image LinkedIn, Slack and iMessage show for a shared link (`/social-preview.png`) is drawn at build time from the name, role, location and hook in `profile.md` and the dark theme tokens, so it never needs editing by hand.

## The porch light

Dark mode is the default and is styled as the porch light being on. The "switches on at" time is calculated from Sacramento's sunset (`src/lib/sunset.ts`): at build time as a fallback, and again in the visitor's browser.
