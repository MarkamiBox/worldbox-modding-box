import { useEffect, useState } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { Toc } from './components/Toc';
import { SearchModal } from './components/SearchModal';
import { MobileDrawer } from './components/MobileDrawer';
import { PageEditorModal } from './components/PageEditorModal';
import { NewPageModal } from './components/NewPageModal';
import { getPage, getPrevNextPages, HOME_SLUG, loadBody, type Page } from './lib/content';
import { href, useRoute } from './lib/router';
import { LangCtx, t, type Lang } from './lib/i18n';
import { Markdown, PageIcon, useMarkdown } from './lib/markdown';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const safeGet = <T extends string>(key: string, fallback: T): T => {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
};

/** The body of the page being read. Empty for one frame the first time a language is opened. */
function usePageBody(page: Page | undefined): string {
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!page) {
      setBody('');
      return;
    }
    let current = true;
    loadBody(page).then((text) => {
      if (current) setBody(text);
    });

    const handleContentUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ slug: string; lang: string; body: string }>;
      if (ce.detail && ce.detail.slug === page.slug && ce.detail.lang === page.lang) {
        setBody(ce.detail.body);
      }
    };

    window.addEventListener('wb:content-updated', handleContentUpdate);
    return () => {
      current = false;
      window.removeEventListener('wb:content-updated', handleContentUpdate);
    };
  }, [page]);

  return body;
}

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage restrictions in strict private mode
  }
};

export default function App() {
  const isDev = import.meta.env.DEV;
  const [theme, setTheme] = useState(() => safeGet<'light' | 'dark'>('wb_theme', 'light'));
  const [lang, setLang] = useState(() => safeGet<Lang>('wb_lang', 'en'));
  const [search, setSearch] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [showEditorTools, setShowEditorTools] = useState(
    () => safeGet<'true' | 'false'>('wb_show_editor_tools', 'true') === 'true',
  );
  const [toolsToast, setToolsToast] = useState<string | null>(null);

  // Sidebar & TOC Width and Collapse state
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = safeGet('wb_sidebar_width', '260');
    const n = Number(saved);
    return !isNaN(n) && n >= 180 && n <= 520 ? n : 260;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => safeGet<'true' | 'false'>('wb_sidebar_collapsed', 'false') === 'true',
  );

  const [tocWidth, setTocWidth] = useState<number>(() => {
    const saved = safeGet('wb_toc_width', '240');
    const n = Number(saved);
    return !isNaN(n) && n >= 160 && n <= 460 ? n : 240;
  });
  const [tocCollapsed, setTocCollapsed] = useState<boolean>(
    () => safeGet<'true' | 'false'>('wb_toc_collapsed', 'false') === 'true',
  );

  const slug = useRoute();
  const page = getPage(slug, lang);
  const body = usePageBody(page);
  const { segments, headings } = useMarkdown(body);
  const { prev: prevPage, next: nextPage } = getPrevNextPages(slug, lang);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    safeSet('wb_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    safeSet('wb_lang', lang);
  }, [lang]);

  useEffect(() => {
    safeSet('wb_show_editor_tools', showEditorTools ? 'true' : 'false');
  }, [showEditorTools]);

  useEffect(() => {
    safeSet('wb_sidebar_width', String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    safeSet('wb_sidebar_collapsed', sidebarCollapsed ? 'true' : 'false');
  }, [sidebarCollapsed]);

  useEffect(() => {
    safeSet('wb_toc_width', String(tocWidth));
  }, [tocWidth]);

  useEffect(() => {
    safeSet('wb_toc_collapsed', tocCollapsed ? 'true' : 'false');
  }, [tocCollapsed]);

  // Resizing mouse drag handlers
  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMove = (moveEv: MouseEvent) => {
      const delta = moveEv.clientX - startX;
      const nextW = Math.min(520, Math.max(180, startW + delta));
      setSidebarWidth(nextW);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTocResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = tocWidth;

    const onMove = (moveEv: MouseEvent) => {
      const delta = startX - moveEv.clientX;
      const nextW = Math.min(460, Math.max(160, startW + delta));
      setTocWidth(nextW);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Press 'ù' or 'Ù' (when not typing) to toggle editing tools view
      if (!isTyping && (e.key === 'ù' || e.key === 'Ù')) {
        e.preventDefault();
        setShowEditorTools((prev) => {
          const next = !prev;
          setToolsToast(
            next
              ? lang === 'it'
                ? 'Editor tools shown (press ù to hide)'
                : 'Editor tools visible (press ù to hide)'
              : lang === 'it'
                ? 'Editor tools hidden (press ù to show)'
                : 'Editor tools hidden (press ù to show)',
          );
          setTimeout(() => setToolsToast(null), 2500);
          return next;
        });
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        if (!showEditorTools) return;
        e.preventDefault();
        setEditorOpen((s) => !s);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        if (!showEditorTools) return;
        e.preventDefault();
        setNewPageOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showEditorTools]);

  const handleResetAll = () => {
    // 1. Reset sidebar & TOC widths and collapse states to default
    setSidebarWidth(260);
    setSidebarCollapsed(false);
    setTocWidth(240);
    setTocCollapsed(false);

    // 2. Clear relevant localStorage values
    try {
      localStorage.removeItem('wb_sidebar_width');
      localStorage.removeItem('wb_sidebar_collapsed');
      localStorage.removeItem('wb_sidebar_collapsed_groups');
      localStorage.removeItem('wb_sidebar_collapsed_subs');
      localStorage.removeItem('wb_toc_width');
      localStorage.removeItem('wb_toc_collapsed');
    } catch {}

    // 3. Dispatch global reset event to reset all code blocks and sidebars
    window.dispatchEvent(new CustomEvent('wb-reset-all'));

    // 4. Show friendly confirmation toast
    setToolsToast(t(lang, 'resetAllToast'));
    setTimeout(() => setToolsToast(null), 3000);
  };

  return (
    <LangCtx value={lang}>
      {/* Skip link for screen readers and keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        {t(lang, 'skipToContent')}
      </a>

      <Topbar
        theme={theme}
        setTheme={setTheme}
        setLang={setLang}
        onSearch={() => setSearch(true)}
        onOpenNav={() => setMobileNav(true)}
        onEditPage={isDev && showEditorTools ? () => setEditorOpen(true) : undefined}
        onNewPage={isDev && showEditorTools ? () => setNewPageOpen(true) : undefined}
        onResetAll={handleResetAll}
        slug={slug}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        tocCollapsed={tocCollapsed}
        onToggleToc={() => setTocCollapsed((c) => !c)}
        hasToc={headings.length >= 2}
      />

      <div className="w-full flex px-4 lg:px-6 gap-8">
        <Sidebar
          slug={slug}
          onNewPage={isDev && showEditorTools ? () => setNewPageOpen(true) : undefined}
          width={sidebarWidth}
          isCollapsed={sidebarCollapsed}
          onStartResize={handleSidebarResizeStart}
          onResetWidth={() => setSidebarWidth(260)}
        />

        <main id="main-content" className="flex-1 min-w-0 py-10 outline-none">
          <div className="w-full">
            {page ? (
              <>
                {page.lang !== lang && (
                  <p className="mb-6 rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted">
                    {t(lang, 'translationMissing')}
                  </p>
                )}
                <Markdown segments={segments} />

                {/* Bottom Previous / Next Page Navigation */}
                {(prevPage || nextPage) && (
                  <nav aria-label="Pagination" className="mt-14 pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prevPage ? (
                      <a
                        href={href(prevPage.slug)}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-col gap-1.5 p-4 rounded-xl border border-line bg-surface/40 hover:bg-surface hover:border-brand/60 transition-all text-left shadow-xs"
                      >
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted group-hover:text-brand transition-colors">
                          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                          <span>{t(lang, 'previousPage')}</span>
                        </span>
                        <span className="text-sm font-semibold text-fg group-hover:text-brand truncate transition-colors flex items-center gap-1.5">
                          {prevPage.icon && <PageIcon icon={prevPage.icon} className="text-xs shrink-0 leading-none" />}
                          <span className="truncate">{prevPage.title}</span>
                        </span>
                      </a>
                    ) : (
                      <div />
                    )}

                    {nextPage && (
                      <a
                        href={href(nextPage.slug)}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-col gap-1.5 p-4 rounded-xl border border-line bg-surface/40 hover:bg-surface hover:border-brand/60 transition-all text-right sm:col-start-2 shadow-xs"
                      >
                        <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-muted group-hover:text-brand transition-colors">
                          <span>{t(lang, 'nextPage')}</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="text-sm font-semibold text-fg group-hover:text-brand truncate transition-colors flex items-center justify-end gap-1.5">
                          <span className="truncate">{nextPage.title}</span>
                          {nextPage.icon && <PageIcon icon={nextPage.icon} className="text-xs shrink-0 leading-none" />}
                        </span>
                      </a>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="py-24 text-center">
                <p className="text-muted">{t(lang, 'notFound')}</p>
                <a href={href(HOME_SLUG)} className="mt-4 inline-block text-brand text-sm hover:underline">
                  {t(lang, 'backHome')}
                </a>
              </div>
            )}
          </div>
        </main>

        <Toc
          headings={headings}
          width={tocWidth}
          isCollapsed={tocCollapsed}
          onStartResize={handleTocResizeStart}
          onResetWidth={() => setTocWidth(240)}
        />
      </div>

      <MobileDrawer
        open={mobileNav}
        onClose={() => setMobileNav(false)}
        slug={slug}
        onNewPage={isDev && showEditorTools ? () => setNewPageOpen(true) : undefined}
      />
      <SearchModal open={search} onClose={() => setSearch(false)} />

      {isDev && showEditorTools && page && (
        <PageEditorModal
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          page={page}
          currentLang={lang}
        />
      )}

      {isDev && showEditorTools && (
        <NewPageModal
          open={newPageOpen}
          onClose={() => setNewPageOpen(false)}
          onCreated={(newSlug) => {
            window.location.hash = href(newSlug);
            setTimeout(() => {
              setEditorOpen(true);
            }, 200);
          }}
        />
      )}

      {/* Floating Toast Notification when toggling editing tools */}
      {toolsToast && (
        <div className="fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-xl bg-surface border border-line shadow-xl text-xs text-fg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="font-medium">{toolsToast}</span>
        </div>
      )}
    </LangCtx>
  );
}
