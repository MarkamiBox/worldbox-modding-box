import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, Search, Terminal } from 'lucide-react';
import { buildIndex, searchWithPins, type Indexed } from '../lib/naturalSearch.ts';
import { t } from '../lib/i18n.ts';
import type { Language } from '../types/index.ts';

interface Method {
  c: string;
  n: string;
  r: string;
  p: string;
  v: 'public' | 'internal';
}


/** A modder can call a public method directly; an internal one needs a publicized dll. */
const boost = (m: Method) => (m.v === 'public' ? 1.25 : 1);
const keyOf = (m: Method) => `${m.c}.${m.n}`;

export const MethodFinder: React.FC<{ language: Language }> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [onlyPublic, setOnlyPublic] = useState(false);
  const [copied, setCopied] = useState('');
  const deferred = useDeferredValue(query);

  // 800 KB of signatures: fetched when the tool is opened, never in the main bundle.
  useEffect(() => {
    let live = true;
    import('../data/methods.json').then((mod) => {
      if (live) setMethods(mod.default as Method[]);
    });
    return () => {
      live = false;
    };
  }, []);

  const index: Array<Indexed<Method>> = useMemo(
    () => (methods ? buildIndex(methods, (m) => `${m.n} ${m.c}`, (m) => `${m.c} ${m.p} ${m.r}`) : []),
    [methods],
  );

  const results = useMemo(
    () => (methods ? searchWithPins(deferred, index, methods, keyOf, 80, boost) : []),
    [deferred, index, methods],
  );

  const shown = onlyPublic ? results.filter((m) => m.v === 'public') : results;

  const copy = (m: Method) => {
    const key = `${keyOf(m)}(${m.p})`;
    navigator.clipboard.writeText(`${m.c}.${m.n}`);
    setCopied(key);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="my-6 rounded-xl border border-line bg-surface/40 overflow-hidden">
      <div className="p-4 space-y-3 border-b border-line">
        <div className="flex items-center gap-2 text-sm font-medium text-fg">
          <Terminal className="w-4 h-4 text-brand" />
          <span>{t(language, 'methodSearch')}</span>
          {methods && (
            <span className="text-xs text-faint font-normal">
              {methods.length.toLocaleString()} {t(language, 'methodsCount')}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(language, 'methodSearchPlaceholder')}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-line bg-bg text-sm text-fg placeholder:text-faint outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 transition-all"
          />
        </div>

        <div className="flex items-center">
          <label className="ml-auto flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none">
            <input type="checkbox" checked={onlyPublic} onChange={(e) => setOnlyPublic(e.target.checked)} />
            <span>{t(language, 'publicOnly')}</span>
          </label>
        </div>
      </div>

      {!methods ? (
        <p className="p-6 text-center text-xs text-faint flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t(language, 'loadingMethods')}
        </p>
      ) : !query.trim() ? (
        <p className="p-6 text-center text-xs text-faint">
          {t(language, 'methodSearchHint')}
        </p>
      ) : shown.length === 0 ? (
        <p className="p-6 text-center text-xs text-faint">
          {t(language, 'noMethodsFound')}
        </p>
      ) : (
        <ul className="divide-y divide-line/60 max-h-[28rem] overflow-y-auto">
          {shown.map((m, i) => (
            <li key={`${keyOf(m)}-${i}`} className="px-4 py-2.5 hover:bg-surface/70 transition-colors group">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 font-mono text-[13px] leading-relaxed">
                  <span className="text-faint">{m.c}.</span>
                  <span className="text-brand font-medium">{m.n}</span>
                  <span className="text-muted">({m.p})</span>
                </div>
                <button
                  onClick={() => copy(m)}
                  title={t(language, 'copy')}
                  className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted hover:text-fg transition-opacity cursor-pointer"
                >
                  {copied === `${keyOf(m)}(${m.p})` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                <span className="font-mono text-faint">{m.r}</span>
                {m.v === 'internal' && (
                  <span
                    className="px-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                    title={t(language, 'internalMethodBadge')}
                  >
                    internal
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
