// Checks the built site (run `npm run build` first): the image that LinkedIn, Slack and iMessage
// show when someone shares a link, and the <head> tags that point them at it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);

/** <meta property|name="key" content="value"> tags, keyed by property or name. */
function metaTags(html: string): Map<string, string> {
  const tags = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/g)) {
    const key = /\b(?:property|name)="([^"]+)"/.exec(tag)?.[1];
    const content = /\bcontent="([^"]*)"/.exec(tag)?.[1];
    if (key && content !== undefined) tags.set(key, content);
  }
  return tags;
}

/** Width and height from a PNG's header, or null if the bytes aren't a PNG. */
function pngSize(bytes: Buffer): { width: number; height: number } | null {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!bytes.subarray(0, 8).equals(signature) || bytes.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test('the social preview image is a 1200×630 PNG', async () => {
  const image = await readFile(new URL('social-preview.png', dist));
  assert.deepEqual(pngSize(image), { width: 1200, height: 630 });
});

test('the social preview image is small enough for every app to show', async () => {
  // WhatsApp and some chat apps quietly drop preview images over about 300 KB.
  const image = await readFile(new URL('social-preview.png', dist));
  assert.ok(image.length < 300_000, `social-preview.png is ${Math.round(image.length / 1000)} KB`);
});

test('every page points link previews at the image', async (t) => {
  const pages = (await readdir(dist, { recursive: true }))
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.replaceAll('\\', '/'));
  assert.ok(pages.length > 0, 'no built pages: run `npm run build` first');

  for (const page of pages) {
    await t.test(page, async () => {
      const tags = metaTags(await readFile(new URL(page, dist), 'utf8'));

      // Crawlers don't resolve relative URLs, so the image URL must be absolute.
      const src = tags.get('og:image') ?? '';
      assert.match(src, /^https?:\/\//, 'og:image must be an absolute URL');
      const image = await readFile(new URL(new URL(src).pathname.slice(1), dist));
      assert.deepEqual(pngSize(image), { width: 1200, height: 630 });

      assert.equal(tags.get('og:image:width'), '1200');
      assert.equal(tags.get('og:image:height'), '630');
      assert.ok(tags.get('og:image:alt'), 'og:image:alt must describe the image');
      assert.equal(tags.get('twitter:card'), 'summary_large_image');
    });
  }
});
