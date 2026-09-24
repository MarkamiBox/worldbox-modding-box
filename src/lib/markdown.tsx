import { useMemo } from 'react';
import { Marked, type Renderer } from 'marked';
import { CodeBlock } from '../components/CodeBlock';
import { MethodFinder } from '../tools/MethodFinder';
import { IconFinder } from '../tools/IconFinder';
import { FeedbackForm } from '../tools/FeedbackForm';
import { AssetFields } from '../tools/AssetFields';
import { HarmonyPatchBuilder } from '../tools/HarmonyPatchBuilder';
import { useLang, type Lang } from './i18n';
import { replaceIcons } from './icons';

/** Widgets embeddable in markdown with a `::tool:methods::` line. */
const TOOLS: Record<string, React.FC<{ language: Lang }>> = {
  methods: MethodFinder,
  icons: IconFinder,
  harmony: HarmonyPatchBuilder,
  feedback: FeedbackForm,
  fields: AssetFields,
};

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Strip tags and decode the entities marked adds, for plain-text uses like the table of contents. */
const plain = (html: string): string =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);

const ALERT = /^\s*\[!(NOTE|INFO|TIP|WARNING|DANGER)\][ \t]*([^\r\n<]*)/i;
const ALERT_STYLE: Record<string, [cls: string, icon: string, label: string]> = {
  NOTE: ['callout-note', 'ℹ️', 'Note'],
  INFO: ['callout-note', 'ℹ️', 'Info'],
  TIP: ['callout-tip', '💡', 'Tip'],
  WARNING: ['callout-warning', '⚠️', 'Warning'],
  DANGER: ['callout-danger', '🛑', 'Danger'],
};

/** Markdown -> HTML, collecting headings for the table of contents. */
function toHtml(md: string, headings: Heading[]): string {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(this: Renderer, { tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        // plain() first: marked escapes an apostrophe to &#39;, which would leave "39" in the id
        const id = slugify(plain(text));
        if (depth >= 2 && depth <= 3) headings.push({ id, text: plain(text), level: depth });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      blockquote(this: Renderer, { tokens }) {
        const inner = this.parser.parse(tokens);
        const clean = inner.replace(/^<p>\s*/, '');
        const m = ALERT.exec(clean);
        if (!m) return `<blockquote>${inner}</blockquote>`;
        const [cls, icon, label] = ALERT_STYLE[m[1].toUpperCase()] || ['callout-note', 'ℹ️', 'Note'];
        const titleText = m[2].trim();
        const title = `${icon} ${titleText || label}`;
        const body = inner.replace(/^(<p>)?\s*\[!(NOTE|INFO|TIP|WARNING|DANGER)\][ \t]*[^\r\n<]*[\r\n]*/i, '$1');
        return `<blockquote class="${cls}"><p class="callout-title">${title}</p>${body}</blockquote>`;
      },
    },
  });
  // Wide tables scroll inside their own box instead of pushing the whole page sideways on phones.
  const html = marked
    .parse(md, { async: false })
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');
  return replaceIcons(html);
}

type Segment =
  | { kind: 'html'; html: string }
  | { kind: 'code'; lang: string; code: string; file?: string }
  | { kind: 'tool'; name: string };

/** Fenced blocks become interactive <CodeBlock>, `::tool:name::` lines become widgets. */
function parse(md: string): { segments: Segment[]; headings: Heading[] } {
  const headings: Heading[] = [];
  const segments: Segment[] = [];

  const pushProse = (text: string) => {
    for (const part of text.split(/^::tool:([a-z-]+)::[ \t]*$/gim)) {
      if (!part) continue;
      if (TOOLS[part]) segments.push({ kind: 'tool', name: part });
      else if (part.trim()) segments.push({ kind: 'html', html: toHtml(part, headings) });
    }
  };

  // The leading `[ \t]*` matters: a fence indented inside a list item used to fall through to
  // marked, which renders a bare <pre> with none of the CodeBlock chrome around it.
  const fence = /^([ \t]*)```(\w*)[ \t]*([^\n]*)\n([\s\S]*?)^[ \t]*```[ \t]*$/gm;
  let last = 0;
  for (let m = fence.exec(md); m; m = fence.exec(md)) {
    pushProse(md.slice(last, m.index));
    // An indented fence indents its body too; drop that indent so the code reads straight.
    const indent = m[1];
    const body = indent ? m[4].replace(new RegExp(`^${indent}`, 'gm'), '') : m[4];
    segments.push({ kind: 'code', lang: m[2] || 'csharp', file: m[3].trim() || undefined, code: body.replace(/\s+$/, '') });
    last = m.index + m[0].length;
  }
  pushProse(md.slice(last));
  return { segments, headings };
}

/**
 * A page's frontmatter `icon:`, which is either a plain emoji or a `:token:` from the
 * icon pack. Renders the pack image when the token resolves, and the raw text otherwise.
 */
export function PageIcon({ icon, className }: { icon: string; className?: string }) {
  const html = replaceIcons(icon);
  if (html === icon) return <span className={className}>{icon}</span>;
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function useMarkdown(md: string) {
  return useMemo(() => parse(md), [md]);
}

export function Markdown({ segments }: { segments: Segment[] }) {
  const lang = useLang();

  // In-page links like [jump](#some-heading). Routing lives in the hash, so letting the browser
  // follow them would be read as "navigate to the page named some-heading" and 404. Scroll instead.
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest('a');
    const href = link?.getAttribute('href');
    if (!href || !href.startsWith('#') || href.startsWith('#/')) return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="prose" onClick={onClick}>
      {segments.map((s, i) => {
        if (s.kind === 'code') return <CodeBlock key={i} initialCode={s.code} language={s.lang} filename={s.file} />;
        if (s.kind === 'tool') {
          const Tool = TOOLS[s.name];
          return <Tool key={i} language={lang} />;
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} />;
      })}
    </div>
  );
}
