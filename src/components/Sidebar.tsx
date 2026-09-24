import { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { getNav, type NavItem } from '../lib/content';
import { href } from '../lib/router';
import { useLang, useT } from '../lib/i18n';
import { PageIcon } from '../lib/markdown';

interface SidebarContentProps {
  slug: string;
  onNavigate?: () => void;
  onNewPage?: () => void;
}

const safeGetJson = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeSetJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export function SidebarContent({ slug, onNavigate, onNewPage }: SidebarContentProps) {
  const lang = useLang();
  const t = useT();
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    safeGetJson<Record<string, boolean>>('wb_sidebar_collapsed_groups', {}),
  );
  const q = filter.trim().toLowerCase();

  const [collapsedSubs, setCollapsedSubs] = useState<Record<string, boolean>>(() =>
    safeGetJson<Record<string, boolean>>('wb_sidebar_collapsed_subs', {}),
  );

  useEffect(() => {
    safeSetJson('wb_sidebar_collapsed_groups', collapsed);
  }, [collapsed]);

  useEffect(() => {
    safeSetJson('wb_sidebar_collapsed_subs', collapsedSubs);
  }, [collapsedSubs]);

  useEffect(() => {
    const onReset = () => {
      setFilter('');
      setCollapsed({});
      setCollapsedSubs({});
      try {
        localStorage.removeItem('wb_sidebar_collapsed_groups');
        localStorage.removeItem('wb_sidebar_collapsed_subs');
      } catch {
        // ignore
      }
    };
    window.addEventListener('wb-reset-all', onReset);
    return () => window.removeEventListener('wb-reset-all', onReset);
  }, []);

  useEffect(() => {
    for (const g of getNav(lang)) {
      for (const item of g.items) {
        if (item.type === 'subgroup' && item.pages.some((p) => p.slug === slug)) {
          const subKey = `${g.name ?? 'root'}__${item.name}`;
          setCollapsedSubs((prev) => (prev[subKey] ? { ...prev, [subKey]: false } : prev));
        }
      }
    }
  }, [slug, lang]);

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSubgroup = (key: string) => {
    setCollapsedSubs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = getNav(lang)
    .map((g) => {
      if (g.isComingSoon) {
        const matches = !q || Boolean(g.name?.toLowerCase().includes(q));
        return {
          ...g,
          items: [],
          hasAnyPages: matches,
        };
      }

      const filteredItems: NavItem[] = [];
      for (const item of g.items) {
        if (item.type === 'page') {
          if (!q || item.page.title.toLowerCase().includes(q)) {
            filteredItems.push(item);
          }
        } else {
          const matchingPages = q
            ? item.pages.filter((p) => p.title.toLowerCase().includes(q))
            : item.pages;
          if (matchingPages.length > 0) {
            filteredItems.push({
              ...item,
              pages: matchingPages,
            });
          }
        }
      }

      return {
        ...g,
        items: filteredItems,
        hasAnyPages: filteredItems.length > 0,
      };
    })
    .filter((g) => g.hasAnyPages);

  return (
    <nav aria-label={t('documentation')} className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('filter')}
          aria-label={t('filter')}
          className="w-full h-8 px-3 rounded-md border border-line bg-surface text-sm text-fg placeholder:text-faint outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 transition-all"
        />
      </div>

      {onNewPage && (
        <button
          type="button"
          onClick={onNewPage}
          className="w-full flex items-center justify-center gap-1.5 h-7.5 mb-3 px-2 rounded-md border border-dashed border-line hover:border-brand bg-surface/40 hover:bg-brand-soft text-xs font-medium text-muted hover:text-brand transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('newPage')}</span>
        </button>
      )}

      {q && groups.length === 0 && (
        <p className="px-3 py-6 text-center text-xs text-faint">
          {t('noFilterResults')}
        </p>
      )}

      {groups.map((g) => {
        const groupKey = g.name ?? 'root';
        // When user is searching, always expand groups so matches are visible
        const isCollapsed = !q && Boolean(collapsed[groupKey]);

        return (
          <div key={groupKey} className="mb-4">
            {g.isComingSoon ? (
              <div className="w-full flex items-center justify-between px-2.5 py-1 mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint rounded select-none cursor-default">
                <span className="truncate">{g.name}</span>
                <span className="text-[9px] font-medium tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 select-none normal-case">
                  {g.tag || t('comingSoon')}
                </span>
              </div>
            ) : g.name ? (
              <button
                type="button"
                onClick={() => toggleGroup(groupKey)}
                aria-expanded={!isCollapsed}
                className="w-full flex items-center justify-between px-2.5 py-1 mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint hover:text-fg hover:bg-surface/60 rounded transition-colors text-left select-none group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className="truncate">{g.name}</span>
                  {g.tag && (
                    <span className="text-[9px] font-medium tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 select-none normal-case">
                      {g.tag}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-faint transition-transform duration-200 shrink-0 ${
                    isCollapsed ? '-rotate-90' : 'rotate-0'
                  }`}
                />
              </button>
            ) : null}

            {!isCollapsed && (
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  if (item.type === 'page') {
                    const p = item.page;
                    const isActive = p.slug === slug;
                    return (
                      <a
                        key={p.slug}
                        href={href(p.slug)}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        title={p.title}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-brand-soft text-brand font-medium'
                            : 'text-muted hover:text-fg hover:bg-surface'
                        }`}
                      >
                        {p.icon && <PageIcon icon={p.icon} className="text-xs shrink-0 leading-none" />}
                        <span className="truncate flex-1">{p.title}</span>
                        {p.tag && (
                          <span className="text-[9px] font-medium tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 select-none">
                            {p.tag}
                          </span>
                        )}
                      </a>
                    );
                  }

                  // Subgroup (expandable folder)
                  const sub = item;
                  const subKey = `${groupKey}__${sub.name}`;
                  const isSubActive = sub.pages.some((p) => p.slug === slug);
                  const isSubCollapsed = !q && Boolean(collapsedSubs[subKey]);

                  return (
                    <div key={subKey} className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleSubgroup(subKey)}
                        aria-expanded={!isSubCollapsed}
                        className={`w-full flex items-center justify-between px-2.5 py-1 text-xs font-semibold rounded transition-colors text-left select-none cursor-pointer ${
                          isSubActive
                            ? 'text-brand bg-brand-soft/40 hover:bg-brand-soft/60'
                            : 'text-muted hover:text-fg hover:bg-surface/60'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="text-[11px]">{isSubCollapsed ? '📁' : '📂'}</span>
                          <span className="truncate">{sub.name}</span>
                        </span>
                        <ChevronDown
                          className={`w-3 h-3 text-faint transition-transform duration-200 shrink-0 ${
                            isSubCollapsed ? '-rotate-90' : 'rotate-0'
                          }`}
                        />
                      </button>

                      {!isSubCollapsed && (
                        <div className="pl-3 mt-0.5 border-l border-line/60 ml-3.5 space-y-0.5">
                          {sub.pages.map((p) => {
                            const isActive = p.slug === slug;
                            return (
                              <a
                                key={p.slug}
                                href={href(p.slug)}
                                onClick={onNavigate}
                                aria-current={isActive ? 'page' : undefined}
                                title={p.title}
                                className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-colors ${
                                  isActive
                                    ? 'bg-brand-soft text-brand font-medium'
                                    : 'text-muted hover:text-fg hover:bg-surface'
                                }`}
                              >
                                {p.icon && <PageIcon icon={p.icon} className="text-xs shrink-0 leading-none" />}
                                <span className="truncate flex-1">{p.title}</span>
                                {p.tag && (
                                  <span className="text-[9px] font-medium tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0 select-none">
                                    {p.tag}
                                  </span>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  slug: string;
  onNewPage?: () => void;
  width?: number;
  isCollapsed?: boolean;
  onStartResize?: (e: React.MouseEvent) => void;
  onResetWidth?: () => void;
}

export function Sidebar({
  slug,
  onNewPage,
  width = 260,
  isCollapsed = false,
  onStartResize,
  onResetWidth,
}: SidebarProps) {
  if (isCollapsed) return null;

  return (
    <aside
      style={{ width: `${width}px` }}
      className="hidden lg:block shrink-0 relative border-r border-line group/sidebar"
    >
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain py-6 pr-4 pl-1">
        <SidebarContent
          slug={slug}
          onNewPage={onNewPage}
        />
      </div>

      {/* Resize drag handle: sits strictly in the outer gap with 0px overlap on the sidebar scrollbar */}
      {onStartResize && (
        <div
          onMouseDown={onStartResize}
          onDoubleClick={onResetWidth}
          title="Drag to resize (double click to reset)"
          className="absolute top-0 left-full -ml-[2px] w-2.5 h-full cursor-col-resize select-none z-10 flex items-center justify-center group/handle"
        >
          <div className="sticky top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-line/60 group-hover/handle:bg-brand group-hover/handle:scale-y-125 transition-all" />
        </div>
      )}
    </aside>
  );
}
