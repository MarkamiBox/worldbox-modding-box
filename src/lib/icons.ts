/**
 * Discord-style inline custom icons system for markdown.
 * Use syntax `:token:` anywhere in any markdown page.
 *
 * HOW TO ADD NEW ICONS:
 * 1. Add an entry to CUSTOM_ICONS below with your icon name and:
 *    - An SVG string, OR
 *    - A path to an image in public/icons/ (e.g. '/icons/pepe.png'), OR
 *    - An external URL, OR
 *    - An emoji character.
 * 2. OR simply place your image into `public/icons/{name}.png` (or .svg, .gif, .webp).
 */

const strokeSvg = (path: string, stroke: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon">${path}</svg>`;

const fillSvg = (path: string, fill: string, viewBox = '0 0 24 24') =>
  `<svg viewBox="${viewBox}" fill="${fill}" class="inline-icon">${path}</svg>`;

/**
 * Built-in Discord-style gaming and modding icons.
 */
export const BUILTIN_ICONS: Record<string, string> = {
  // WorldBox & Modding platforms
  worldbox: strokeSvg(
    '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    '#22c55e',
  ),
  nml: strokeSvg('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>', '#3b82f6'),
  ncms: strokeSvg('<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>', '#a855f7'),
  discord: fillSvg(
    '<path d="M20.3 4.5A19 19 0 0 0 15.6 3l-.2.4a13 13 0 0 1 4 2 18 18 0 0 0-14.8 0 13 13 0 0 1 4-2L8.4 3a19 19 0 0 0-4.7 1.5C.7 9 0 13.3.3 17.6a19 19 0 0 0 5.8 2.9l1.2-1.9a12 12 0 0 1-2-.9l.5-.4a13 13 0 0 0 11.4 0l.5.4a12 12 0 0 1-2 1l1.2 1.8a19 19 0 0 0 5.8-2.9c.4-5-.7-9.3-2.4-13.1M8.3 15c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3m7.4 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3"/>',
    '#5865F2',
  ),
  github: fillSvg(
    '<path d="M12 2A10 10 0 0 0 8.8 21.5c.5.1.7-.2.7-.5v-1.7C6.7 19.9 6.1 18 6.1 18c-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8 0-.7.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2"/>',
    'currentColor',
  ),
  steam: fillSvg(
    '<path d="M12 2a10 10 0 0 0-10 9.8c0 3.9 2.3 7.3 5.7 8.9l2.7-3.9a3.5 3.5 0 0 1 2.1.2l3.4-4.9a4.5 4.5 0 1 1 4.1 6.3 4.5 4.5 0 0 1-4.5-4.4l-5 3.5a3.5 3.5 0 1 1-6.4 1.3A10 10 0 1 0 12 2"/>',
    '#1da1f2',
  ),
  csharp: strokeSvg(
    '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 9 3 3-3 3"/><path d="M14 9h3v6h-3"/>',
    '#9333ea',
  ),
  unity: strokeSvg(
    '<path d="m12 2 8 5v10l-8 5-8-5V7z"/><path d="m12 12 8-5"/><path d="m12 12-8-5"/><path d="M12 12v10"/>',
    '#06b6d4',
  ),

  // Game & Mod elements
  mod: strokeSvg(
    '<path d="m10.5 4.5 2-2 3.5 3.5-2 2a2.1 2.1 0 0 0 0 3l.5.5a2.1 2.1 0 0 1 0 3l-2 2-3.5-3.5 2-2a2.1 2.1 0 0 0 0-3l-.5-.5a2.1 2.1 0 0 1 0-3z"/>',
    '#f59e0b',
  ),
  trait: strokeSvg(
    '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
    '#eab308',
  ),
  actor: strokeSvg(
    '<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>',
    '#ec4899',
  ),
  sword: strokeSvg(
    '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/>',
    '#ef4444',
  ),
  shield: strokeSvg(
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    '#3b82f6',
  ),
  crown: strokeSvg(
    '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"/>',
    '#eab308',
  ),
  fire: strokeSvg(
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    '#f97316',
  ),
  zap: strokeSvg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', '#eab308'),
  heart: fillSvg(
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    '#ef4444',
  ),
  star: fillSvg(
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    '#eab308',
  ),
  hammer: strokeSvg(
    '<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.36 6.36"/><path d="m8 6 2-2 7 7-2 2Z"/>',
    '#8b5cf6',
  ),
  gear: strokeSvg(
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    '#64748b',
  ),
  bug: strokeSvg(
    '<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>',
    '#ef4444',
  ),
  sparkles: strokeSvg(
    '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28z"/>',
    '#a855f7',
  ),
  rocket: strokeSvg(
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    '#3b82f6',
  ),
  check: strokeSvg('<path d="M20 6 9 17l-5-5"/>', '#22c55e'),
  warning: strokeSvg(
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
    '#f59e0b',
  ),
};

/**
 * Auto-detected icons dropped into `src/custom-icons/`.
 * Any .png, .svg, .webp, .gif, or .jpg file dropped into that folder
 * automatically becomes usable as `:filename:` with zero configuration!
 */
// Auto-import all image files dropped into src/custom-icons/
const droppedFiles = import.meta.glob<string>('../custom-icons/*.{png,svg,webp,gif,jpg,jpeg}', {
  eager: true,
  import: 'default',
});

// Auto-import any .json files dropped into src/custom-icons/ (e.g. emojis.json: { "skull": "💀" })
const droppedJson = import.meta.glob<Record<string, string>>('../custom-icons/*.json', {
  eager: true,
  import: 'default',
});

export const DROPPED_ICONS: Record<string, string> = {};

// Load JSON emoji mappings
for (const dict of Object.values(droppedJson)) {
  if (typeof dict === 'object' && dict !== null) {
    for (const [k, v] of Object.entries(dict)) {
      DROPPED_ICONS[k] = v;
      DROPPED_ICONS[k.toLowerCase()] = v;
    }
  }
}

// Load image files with automatic normalization (spaces, underscores, hyphens, lowercase)
for (const [path, url] of Object.entries(droppedFiles)) {
  const filename = path.split('/').pop();
  if (filename) {
    const raw = filename.replace(/\.[^.]+$/, '');
    DROPPED_ICONS[raw] = url;
    DROPPED_ICONS[raw.toLowerCase()] = url;

    // "Doggo dance" -> "doggo_dance", "Doggo_dance"
    const withUnderscore = raw.replace(/\s+/g, '_');
    DROPPED_ICONS[withUnderscore] = url;
    DROPPED_ICONS[withUnderscore.toLowerCase()] = url;

    // "Doggo dance" -> "doggo-dance"
    const withHyphen = raw.replace(/\s+/g, '-');
    DROPPED_ICONS[withHyphen] = url;
    DROPPED_ICONS[withHyphen.toLowerCase()] = url;

    // "Doggo dance" -> "doggodance"
    const withoutSpaces = raw.replace(/\s+/g, '');
    DROPPED_ICONS[withoutSpaces] = url;
    DROPPED_ICONS[withoutSpaces.toLowerCase()] = url;

    // Downloaded packs keep prefixes in filenames (e.g. "5368-nerd", "aPES_Beer", "PES_Clap", "aPESXMas_Santa")
    // Register the clean readable name too, without losing the full name.
    const cleanPrefix = raw.replace(/^(\d+|apesxmas|apes|pes)[-_]/i, '');
    if (cleanPrefix && cleanPrefix !== raw) {
      for (const variant of [
        cleanPrefix,
        cleanPrefix.replace(/\s+/g, '_'),
        cleanPrefix.replace(/\s+/g, '-'),
        cleanPrefix.replace(/\s+/g, ''),
      ]) {
        if (!DROPPED_ICONS[variant]) DROPPED_ICONS[variant] = url;
        if (!DROPPED_ICONS[variant.toLowerCase()]) DROPPED_ICONS[variant.toLowerCase()] = url;
      }
    }
  }
}

/**
 * USER CUSTOM ICONS REGISTRY:
 * Add any custom icons here manually if needed!
 */
export const CUSTOM_ICONS: Record<string, string> = {
  // Manual overrides or external URLs
};

/**
 * Replace `:token:` with a Discord-style inline icon or image.
 * If the icon matches a registered SVG, custom image, or public icon file,
 * it is rendered with a smooth Discord-like hover effect and title tooltip.
 */
const TOKEN = /:([a-zA-Z0-9_+-]+):/g;

export function formatIcon(name: string, content: string): string {
  // If it's an SVG string
  if (content.trim().startsWith('<svg')) {
    return `<span class="discord-icon" title=":${name}:">${content}</span>`;
  }
  // If it's an image file or URL (png, svg, webp, gif, http...)
  if (
    content.startsWith('/') ||
    content.startsWith('http') ||
    content.startsWith('data:') ||
    /\.(png|svg|webp|gif|jpg|jpeg)$/i.test(content)
  ) {
    return `<img src="${content}" class="discord-icon" alt=":${name}:" title=":${name}:" loading="lazy" />`;
  }
  // If it's emoji or raw text
  return `<span class="discord-icon" title=":${name}:">${content}</span>`;
}

export const replaceIcons = (html: string): string =>
  html.replace(TOKEN, (match, name: string) => {
    const key = name.trim();
    const lower = key.toLowerCase();
    const normalized = lower.replace(/[-_]/g, '');
    const cleanPrefix = key.replace(/^(\d+|apesxmas|apes|pes)[-_]/i, '');
    const cleanLower = cleanPrefix.toLowerCase();
    const cleanNorm = cleanLower.replace(/[-_]/g, '');

    // 1. Check auto-detected icons from src/custom-icons/ folder
    const dropped =
      DROPPED_ICONS[key] ??
      DROPPED_ICONS[lower] ??
      DROPPED_ICONS[key.replace(/-/g, '_')] ??
      DROPPED_ICONS[normalized] ??
      DROPPED_ICONS[cleanPrefix] ??
      DROPPED_ICONS[cleanLower] ??
      DROPPED_ICONS[cleanNorm];
    if (dropped) return formatIcon(key, dropped);

    // 2. Check manual custom icons registry
    const custom =
      CUSTOM_ICONS[key] ??
      CUSTOM_ICONS[lower] ??
      CUSTOM_ICONS[key.replace(/-/g, '_')] ??
      CUSTOM_ICONS[normalized] ??
      CUSTOM_ICONS[cleanPrefix] ??
      CUSTOM_ICONS[cleanLower] ??
      CUSTOM_ICONS[cleanNorm];
    if (custom) return formatIcon(key, custom);

    // 3. Check built-in icons
    const builtin =
      BUILTIN_ICONS[key] ??
      BUILTIN_ICONS[lower] ??
      BUILTIN_ICONS[key.replace(/-/g, '_')] ??
      BUILTIN_ICONS[normalized];
    if (builtin) return formatIcon(key, builtin);

    return match;
  });

export type EmojiCategory = 'worldbox' | 'pepe' | 'gif_meme' | 'modding' | 'standard';

export interface EmojiItem {
  key: string;
  name: string;
  category: EmojiCategory;
  preview: string;
  type: 'image' | 'svg' | 'text';
}

export function getEmojiCatalog(): EmojiItem[] {
  const items: EmojiItem[] = [];
  const seen = new Set<string>();

  // 1. Dropped custom icons and GIFs
  for (const [path, url] of Object.entries(droppedFiles)) {
    const filename = path.split('/').pop();
    if (!filename) continue;
    const raw = filename.replace(/\.[^.]+$/, '');
    const cleanKey = raw.replace(/\s+/g, '_');
    const lowerKey = cleanKey.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);

      let category: EmojiCategory = 'gif_meme';
      if (lowerKey.startsWith('wb') || lowerKey.includes('worldbox')) {
        category = 'worldbox';
      } else if (
        lowerKey.includes('pepe') ||
        lowerKey.startsWith('pes') ||
        lowerKey.startsWith('apes') ||
        lowerKey === 'poggers'
      ) {
        category = 'pepe';
      }

      items.push({
        key: cleanKey,
        name: raw,
        category,
        preview: url,
        type: 'image',
      });
    }
  }

  // 2. Built-in modding icons
  for (const [key, svg] of Object.entries(BUILTIN_ICONS)) {
    if (!seen.has(key)) {
      seen.add(key);
      items.push({
        key,
        name: key,
        category: 'modding',
        preview: svg,
        type: 'svg',
      });
    }
  }

  // 3. Standard emojis
  const standardEmojis = [
    '📘', '📄', '💻', '⚙️', '🚀', '💡', '⚠️', '🛑', 'ℹ️', '🔧', '🔨', '🎮',
    '🕹️', '📦', '🔍', '📝', '✨', '🌟', '💀', '🤡', '🔥', '⚡', '💎', '👑',
    '🎯', '📌', '🏷️', '✅', '❌', '👀', '🤝', '🎉', '🏆', '🍕', '☕', '❤️'
  ];
  for (const em of standardEmojis) {
    items.push({
      key: em,
      name: em,
      category: 'standard',
      preview: em,
      type: 'text',
    });
  }

  return items;
}
