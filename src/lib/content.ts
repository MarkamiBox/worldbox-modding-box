import contentIndex from 'virtual:content-index';
import type { Lang } from './i18n';

export interface Page {
  slug: string;
  lang: Lang;
  filePath: string;
  title: string;
  group?: string;
  subgroup?: string;
  icon?: string;
  tag?: string;
  order: number;
}

export interface NavSubGroup {
  name: string;
  order: number;
  pages: Page[];
}

export type NavItem =
  | { type: 'page'; page: Page; order: number }
  | { type: 'subgroup'; name: string; order: number; pages: Page[] };

export interface NavGroup {
  name?: string;
  order: number;
  items: NavItem[];
  pages: Page[];
  subgroups?: NavSubGroup[];
  allPages: Page[];
  tag?: string;
  isComingSoon?: boolean;
}

// Every page's frontmatter, built from disk by vite-plugins/content-index.js. Metadata only:
// the nav needs every page in every language, a reader needs the body of exactly one.
export const PAGES: Page[] = contentIndex;

// The bodies stay behind loaders. Vite gives each language its own chunk (see vite.config.ts),
// so reading a page downloads that language and nothing else.
const bodyLoaders = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const bodyCache = new Map<string, string>();

const keyOf = (page: Page) => `../content/${page.lang}/${page.filePath}`;

/** Strip the frontmatter fence the loader hands back with the raw file. */
function stripFrontmatter(raw: string): string {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw);
  return m ? raw.slice(m[0].length) : raw;
}

/** The body of one page. Resolves from cache after the first read of that language. */
export async function loadBody(page: Page): Promise<string> {
  const key = keyOf(page);
  const cached = bodyCache.get(key);
  if (cached !== undefined) return cached;

  const loader = bodyLoaders[key];
  if (!loader) return '';

  const body = stripFrontmatter(await loader());
  bodyCache.set(key, body);
  return body;
}

/** Invalidate or update body cache after editor save, so views update immediately in-memory. */
export function updateCachedBody(page: Page, newBody: string) {
  const key = keyOf(page);
  bodyCache.set(key, newBody);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('wb:content-updated', {
        detail: { slug: page.slug, lang: page.lang, body: newBody },
      }),
    );
  }
}

/** Every body the reader can currently see, keyed by slug. Used by the search palette. */
export async function loadBodies(pages: Page[]): Promise<Map<string, string>> {
  const bodies = await Promise.all(pages.map(loadBody));
  return new Map(pages.map((p, i) => [p.slug, bodies[i]]));
}

/** Page in the requested language, falling back to English, then to any language that has it. */
export function getPage(slug: string, lang: Lang): Page | undefined {
  return (
    PAGES.find((p) => p.slug === slug && p.lang === lang) ??
    PAGES.find((p) => p.slug === slug && p.lang === 'en') ??
    PAGES.find((p) => p.slug === slug)
  );
}

/** One entry per slug, in the requested language when it exists (untranslated pages stay listed). */
export const pagesFor = (lang: Lang): Page[] =>
  [...new Set(PAGES.map((p) => p.slug))].map((s) => getPage(s, lang)!);

export function getNav(lang: Lang): NavGroup[] {
  const groups = new Map<
    string,
    {
      name?: string;
      order: number;
      directPages: Page[];
      subgroupMap: Map<string, { name: string; order: number; pages: Page[] }>;
    }
  >();

  const sortPages = (pages: Page[]) =>
    pages.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.slug === HOME_SLUG) return -1;
      if (b.slug === HOME_SLUG) return 1;
      if (a.filePath && b.filePath && a.filePath !== b.filePath) {
        return a.filePath.localeCompare(b.filePath);
      }
      return a.slug.localeCompare(b.slug);
    });

  // Determine current language's overview group name (e.g. "Panoramica" in IT, "Overview" in EN)
  const homePage = getPage(HOME_SLUG, lang);
  const localizedOverviewGroupName = homePage?.group || 'Overview';
  const overviewAliases = new Set([
    'Overview',
    'Panoramica',
    '概览',
    'Обзор',
    'Visão Geral',
    '개요',
    '概要',
    "Vue d'ensemble",
    'Resumen',
    'Übersicht',
  ]);

  for (const p of pagesFor(lang)) {
    let groupName = p.group;
    // Normalize overview alias so fallback pages in EN stay in the current language's overview group
    if (groupName && overviewAliases.has(groupName)) {
      groupName = localizedOverviewGroupName;
    }

    const key = groupName ?? '';
    const g = groups.get(key) ?? {
      name: groupName,
      order: p.order,
      directPages: [] as Page[],
      subgroupMap: new Map<string, { name: string; order: number; pages: Page[] }>(),
    };
    g.order = Math.min(g.order, p.order);

    if (p.subgroup) {
      const sub = g.subgroupMap.get(p.subgroup) ?? {
        name: p.subgroup,
        order: p.order,
        pages: [] as Page[],
      };
      sub.order = Math.min(sub.order, p.order);
      sub.pages.push(p);
      g.subgroupMap.set(p.subgroup, sub);
    } else {
      g.directPages.push(p);
    }

    groups.set(key, g);
  }

  const res = [...groups.values()]
    .map((g) => {
      const sortedDirectPages = sortPages(g.directPages);
      const sortedSubgroups = [...g.subgroupMap.values()]
        .map((sub) => ({
          ...sub,
          pages: sortPages(sub.pages),
        }))
        .sort((a, b) => a.order - b.order);

      // Build unified items list ordered by order
      const items: NavItem[] = [
        ...sortedDirectPages.map((page) => ({
          type: 'page' as const,
          page,
          order: page.order,
        })),
        ...sortedSubgroups.map((sub) => ({
          type: 'subgroup' as const,
          name: sub.name,
          order: sub.order,
          pages: sub.pages,
        })),
      ].sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        if (a.type === 'page' && a.page.slug === HOME_SLUG) return -1;
        if (b.type === 'page' && b.page.slug === HOME_SLUG) return 1;
        return 0;
      });

      // allPages preserves the EXACT visual order of items (direct pages + subfolder contents)
      const allPages: Page[] = [];
      for (const item of items) {
        if (item.type === 'page') {
          allPages.push(item.page);
        } else {
          allPages.push(...item.pages);
        }
      }

      const mapped: NavGroup = {
        name: g.name,
        order: g.name === 'BepInEx Modding' ? 20 : g.order,
        items,
        pages: sortedDirectPages,
        subgroups: sortedSubgroups.length > 0 ? sortedSubgroups : undefined,
        allPages,
        tag: g.name === 'BepInEx Modding' ? 'Working on...' : undefined,
      };
      return mapped;
    });

  // Inject placeholder groups if not already present
  const hasBepInEx = res.some((g) => g.name === 'BepInEx Modding');
  if (!hasBepInEx) {
    res.push({
      name: 'BepInEx Modding',
      order: 20,
      items: [],
      pages: [],
      allPages: [],
      tag: 'Working on...',
      isComingSoon: false,
    });
  }

  res.push({
    name: 'VibeCoding Modding',
    order: 25,
    items: [],
    pages: [],
    allPages: [],
    tag: 'Coming soon',
    isComingSoon: true,
  });

  return res.sort((a, b) => a.order - b.order);
}

export const HOME_SLUG = 'index';

/** Returns the previous and next pages in reading order according to navigation hierarchy. */
export function getPrevNextPages(slug: string, lang: Lang): { prev?: Page; next?: Page } {
  const nav = getNav(lang);
  const flatPages: Page[] = [];
  for (const g of nav) {
    if (g.allPages) {
      flatPages.push(...g.allPages);
    }
  }

  const idx = flatPages.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? flatPages[idx - 1] : undefined,
    next: idx < flatPages.length - 1 ? flatPages[idx + 1] : undefined,
  };
}
