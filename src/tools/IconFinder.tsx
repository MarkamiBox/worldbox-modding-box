import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, Palette, Search } from 'lucide-react';
import { buildIndex, search, type Indexed } from '../lib/naturalSearch.ts';
import { t } from '../lib/i18n.ts';
import type { Language } from '../types/index.ts';

interface Icon {
  p: string;
  /** Set when the game loads this path by name in its own code. */
  u?: 1;
}

/** A path the game itself loads is a safer bet than a stray export nobody references. */
const boost = (i: Icon) => (i.u ? 1.4 : 1);


/** `ui/Icons/iconFire` -> `ui/Icons`, so the folder can be dimmed and the name highlighted. */
const folderOf = (p: string) => p.slice(0, p.lastIndexOf('/')) || '/';
const nameOf = (p: string) => p.slice(p.lastIndexOf('/') + 1);

export const IconFinder: React.FC<{ language: Language }> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [icons, setIcons] = useState<Icon[] | null>(null);
  const [copied, setCopied] = useState('');
  const deferred = useDeferredValue(query);

  useEffect(() => {
    let live = true;
    import('../data/icons.json').then((mod) => {
      if (live) setIcons(mod.default as Icon[]);
    });
    return () => {
      live = false;
    };
  }, []);

  const index: Array<Indexed<Icon>> = useMemo(
    () => (icons ? buildIndex(icons, (i) => nameOf(i.p), (i) => i.p) : []),
    [icons],
  );

  const results = useMemo(
    () => (icons ? (deferred.trim() ? search(deferred, index, 120, boost).map((h) => h.item) : icons) : []),
    [deferred, index, icons],
  );

  const copy = (p: string) => {
    navigator.clipboard.writeText(p);
    setCopied(p);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="my-6 rounded-xl border border-line bg-surface/40 overflow-hidden">
      <div className="p-4 space-y-3 border-b border-line">
        <div className="flex items-center gap-2 text-sm font-medium text-fg">
          <Palette className="w-4 h-4 text-brand" />
          <span>{t(language, 'iconSearch')}</span>
          {icons && (
            <span className="text-xs text-faint font-normal">
              {icons.length.toLocaleString()} {t(language, 'pathsCount')}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(language, 'iconSearchPlaceholder')}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-line bg-bg text-sm text-fg placeholder:text-faint outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 transition-all"
          />
        </div>
      </div>

      {!icons ? (
        <p className="p-6 text-center text-xs text-faint flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t(language, 'loadingIcons')}
        </p>
      ) : results.length === 0 ? (
        <p className="p-6 text-center text-xs text-faint">
          {t(language, 'noIconsFound')}
        </p>
      ) : (
        <ul className="divide-y divide-line/60 max-h-[28rem] overflow-y-auto">
          {results.map((icon) => (
            <li
              key={icon.p}
              className="px-4 py-2 flex items-center gap-2 hover:bg-surface/70 transition-colors group"
            >
              <div className="min-w-0 flex-1 font-mono text-[13px] truncate">
                <span className="text-faint">{folderOf(icon.p)}/</span>
                <span className="text-brand font-medium">{nameOf(icon.p)}</span>
              </div>
              <button
                onClick={() => copy(icon.p)}
                title={t(language, 'copyPath')}
                className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted hover:text-fg transition-opacity cursor-pointer"
              >
                {copied === icon.p ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="px-4 py-2 border-t border-line text-[11px] text-faint">
        {t(language, 'iconFooterHint')}
      </p>
    </div>
  );
};
