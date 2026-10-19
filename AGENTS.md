# Portfolio

Joseph Doan's portfolio site: Astro 7, static output, deployed to the hosting platform it showcases.

## Rules

- Content lives in `src/content/` (Markdown + frontmatter, schemas in `src/content.config.ts`). Change words there, not in templates.
- Run `npm test` (type-check, build, link check, Lighthouse ≥ 95) before opening a PR. CI runs the same checks and `main` requires them.
- Never commit to `main` directly. Work on a branch and open a PR that says `Closes #<issue>`.
- Never publish the phone number: not in content, not in `public/resume.pdf`.
- Dark mode is the default and is "the porch light being on": the lamp, glow and switch all read from the theme tokens in `src/styles/global.css`. Keep them in sync.

## Agent skills

### Issue tracker

GitHub Issues on JDoan03/portfolio, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created only when needed. See `docs/agents/domain.md`.
