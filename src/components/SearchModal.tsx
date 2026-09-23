import { useEffect, useRef, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { loadBodies, pagesFor, type Page } from '../lib/content';
import { href } from '../lib/router';
import { useLang, useT } from '../lib/i18n';

/** Full-text search over the bundled markdown. Shows only matching file titles. */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useLang();
  const t = useT();
  const [q, setQ] = useState('');
  const [bodies, setBodies] = useState<Map<string, string> | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      input.current?.focus();
    } else {
      setQ('');
    }
  }, [open]);

  // Titles match immediately; full text needs this language's chunk, fetched once when opened.
  useEffect(() => {
    if (!open) return;
    let current = true;
    loadBodies(pagesFor(lang)).then((loaded) => {
      if (current) setBodies(loaded);
    });
    return () => {
      current = false;
    };
  }, [open, lang]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const query = q.trim().toLowerCase();
  const results: { page: Page; score: number }[] = !query
    ? []
    : pagesFor(lang)
        .map((p) => {
          const titleMatch = p.title.toLowerCase().indexOf(query);
          const bodyMatch = (bodies?.get(p.slug) ?? '').toLowerCase().indexOf(query);
          if (titleMatch < 0 && bodyMatch < 0) return null;
          return {
            page: p,
            score: titleMatch >= 0 ? 0 : 1,
          };
        })
        .filter((r): r is { page: Page; score: number } => r !== null)
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs pt-[12vh] px-4 flex items-start justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('search')}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-line bg-raised shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-line bg-surface/50">
          <Search className="w-4 h-4 text-faint shrink-0" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('search')}
            className="flex-1 h-12 bg-transparent outline-none text-sm text-fg placeholder:text-faint"
          />
          <kbd className="text-[10px] border border-line rounded px-1.5 py-0.5 text-faint font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2" aria-live="polite">
          {query && !results.length && (
            <p className="p-6 text-sm text-faint text-center">{t('noResults')}</p>
          )}
          {results.map((r) => (
            <a
              key={r.page.slug}
              href={href(r.page.slug)}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-surface text-fg transition-colors group cursor-pointer"
            >
              <FileText className="w-4 h-4 text-brand shrink-0" />
              <span className="text-sm font-medium truncate group-hover:text-brand transition-colors">
                {r.page.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
