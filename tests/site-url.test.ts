// Canonical URLs, og:url, og:image and the sitemap are all built from SITE_URL. A deployed build
// (one made on CI) that fell back to localhost would look fine and pass every other check, but
// search engines and link previews couldn't reach any of it. So `astro build` must refuse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const astro = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

/** Runs `astro build` with SITE_URL and CI set (or unset) as given; returns its exit code and output. */
function build({ CI, SITE_URL }: { CI?: string; SITE_URL?: string }) {
  const env = { ...process.env, CI, SITE_URL };
  if (CI === undefined) delete env.CI;
  if (SITE_URL === undefined) delete env.SITE_URL;
  const result = spawnSync(process.execPath, [astro, 'build'], { cwd: root, env, encoding: 'utf8' });
  return { status: result.status, output: result.stdout + result.stderr };
}

test('a CI build stops when SITE_URL is missing', () => {
  const { status, output } = build({ CI: 'true' });
  assert.notEqual(status, 0, 'the build should have failed');
  assert.match(output, /SITE_URL is not set/);
});

test('a CI build stops when SITE_URL points at localhost', () => {
  const { status, output } = build({ CI: 'true', SITE_URL: 'http://localhost:4321' });
  assert.notEqual(status, 0, 'the build should have failed');
  assert.match(output, /SITE_URL points at localhost/);
});

test('a build stops when SITE_URL is not a full http(s) URL', () => {
  for (const SITE_URL of ['josephdoan.dev', 'josephdoan.dev:443']) {
    const { status, output } = build({ SITE_URL });
    assert.notEqual(status, 0, `the build should have failed for ${SITE_URL}`);
    assert.match(output, /SITE_URL must be a full URL/);
  }
});
