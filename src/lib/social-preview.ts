// The link-preview image: the porch light on, with the hook beside it. Drawn with Satori (HTML/CSS
// to SVG) and rasterised with sharp, at build time, so it always says what profile.md says.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { plainText } from './format';

/** The size LinkedIn, Slack and iMessage expect for a large link preview. */
export const SOCIAL_PREVIEW = { width: 1200, height: 630 } as const;

export interface PreviewContent {
  name: string;
  role: string;
  hook: string; // *asterisks* mark the phrase that glows, as on the home page
}

/** og:image:alt: what the card below draws, in words. */
export function previewAlt({ name, role, hook }: PreviewContent): string {
  return `${name}, ${role}: “${plainText(hook)}” beside a lit porch lamp.`;
}

const TOKENS = ['bg', 'fg', 'muted', 'accent', 'glow', 'bulb', 'lampfill'] as const;
export type Theme = Record<(typeof TOKENS)[number], string>;

/** The dark ("porch light on") tokens: the custom properties in global.css's plain :root block. */
export function darkTheme(css: string): Theme {
  const block = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
  const values = new Map(Array.from(block.matchAll(/--([\w-]+):\s*([^;]+);/g), ([, name, value]) => [name, value.trim()]));
  const theme = {} as Theme;
  for (const token of TOKENS) {
    const value = values.get(token);
    if (!value) throw new Error(`global.css :root is missing --${token}`);
    theme[token] = value;
  }
  return theme;
}

// Satori reads neither WOFF2 nor variable fonts, so the card uses the static Bricolage package
// rather than the variable one the site loads.
const require = createRequire(import.meta.url);
const loadFont = (weight: 600 | 800) =>
  readFile(require.resolve(`@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-${weight}-normal.woff`));

type Style = Record<string, string | number>;
type VNode = { type: string; props: { style?: Style; children?: VNode | string | (VNode | string)[] } };
const el = (type: string, style: Style, children?: VNode['props']['children']): VNode => ({
  type,
  props: { style, children },
});

/** "the *porch light*. Now" -> words, each a run of plain and glowing pieces ("light." is two). */
function words(text: string): { text: string; em: boolean }[][] {
  const result: { text: string; em: boolean }[][] = [[]];
  text.split(/\*(.+?)\*/).forEach((part, i) => {
    part.split(' ').forEach((chunk, j) => {
      if (j > 0) result.push([]);
      if (chunk) result[result.length - 1].push({ text: chunk, em: i % 2 === 1 });
    });
  });
  return result.filter((word) => word.length > 0);
}

// Where the lamp hangs on the card, and how much bigger it is than on the home page.
const LAMP = { top: 96, right: 132, scale: 3 };
// The bulb sits at (25, 44) inside the 60×92 lamp.
const BULB = { x: SOCIAL_PREVIEW.width - LAMP.right - (60 - 25) * LAMP.scale, y: LAMP.top + 44 * LAMP.scale };
// PorchLamp's halo fades out 62% of the way to the corner of its 360px box.
const HALO_RADIUS = 0.62 * Math.hypot(180, 180) * LAMP.scale;

/** PorchLamp.astro, scaled up: same shapes, same tokens, lit. Its halo is the card's background. */
function lamp(theme: Theme): VNode {
  const px = (n: number) => n * LAMP.scale;
  const part = (style: Style) => el('div', { position: 'absolute', ...style });
  return el('div', { display: 'flex', position: 'absolute', top: LAMP.top, right: LAMP.right, width: px(60), height: px(92) }, [
    part({ top: px(22), right: 0, width: px(20), height: px(6), borderRadius: px(3), background: theme.muted }),
    part({
      top: px(10),
      left: px(6),
      width: px(38),
      height: px(12),
      background: theme.muted,
      // The same trapezoid as polygon(18% 0, 82% 0, 100% 100%, 0 100%): Satori misplaces % points.
      clipPath: `polygon(${px(6.84)}px 0, ${px(31.16)}px 0, ${px(38)}px ${px(12)}px, 0 ${px(12)}px)`,
    }),
    part({
      top: px(22),
      left: px(10),
      width: px(30),
      height: px(46),
      border: `${px(2)}px solid ${theme.muted}`,
      borderRadius: `${px(3)}px ${px(3)}px ${px(9)}px ${px(9)}px`,
      background: theme.lampfill,
    }),
    part({
      top: px(33),
      left: px(19),
      width: px(12),
      height: px(22),
      borderRadius: '50%',
      background: theme.bulb,
      boxShadow: `0 0 ${px(14)}px ${px(5)}px ${theme.glow}, 0 0 ${px(70)}px ${px(26)}px ${theme.glow}`,
    }),
    part({ top: px(68), left: px(16), width: px(18), height: px(6), borderRadius: `0 0 ${px(4)}px ${px(4)}px`, background: theme.muted }),
  ]);
}

function card(content: PreviewContent, theme: Theme): VNode {
  const hook = words(content.hook).map((word) =>
    el(
      'div',
      { display: 'flex' },
      word.map((piece) =>
        el('span', piece.em ? { color: theme.accent, textShadow: `0 0 40px ${theme.glow}` } : {}, piece.text),
      ),
    ),
  );

  return el(
    'div',
    {
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: theme.bg,
      // Canvas-sized rather than a circle hanging off the edge, which sharp crops 630px below its top.
      backgroundImage: `radial-gradient(circle ${HALO_RADIUS}px at ${BULB.x}px ${BULB.y}px, ${theme.glow}, transparent)`,
      color: theme.fg,
      fontFamily: 'Bricolage Grotesque',
    },
    [
      lamp(theme),
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 80px',
        },
        [
          el('div', { fontSize: 32, fontWeight: 800, letterSpacing: '-0.01em' }, content.name),
          el(
            'div',
            {
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: '0.24em',
              maxWidth: 760,
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
            },
            hook,
          ),
          el('div', { fontSize: 28, fontWeight: 600, color: theme.muted }, content.role),
        ],
      ),
    ],
  );
}

export async function renderSocialPreview(content: PreviewContent, theme: Theme): Promise<Buffer> {
  const [semibold, extrabold] = await Promise.all([loadFont(600), loadFont(800)]);
  const svg = await satori(card(content, theme) as Parameters<typeof satori>[0], {
    ...SOCIAL_PREVIEW,
    fonts: [
      { name: 'Bricolage Grotesque', data: semibold, weight: 600, style: 'normal' },
      { name: 'Bricolage Grotesque', data: extrabold, weight: 800, style: 'normal' },
    ],
  });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
