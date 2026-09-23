import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Edit3, Menu, Moon, PanelLeft, PanelRight, PlusCircle, RotateCcw, Search, Sun } from 'lucide-react';
import { getNav } from '../lib/content';
import { href } from '../lib/router';
import { LANGUAGES, useLang, useT, type Lang } from '../lib/i18n';
import buildInfo from 'virtual:build-info';

interface Props {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  setLang: (l: Lang) => void;
  onSearch: () => void;
  onOpenNav?: () => void;
  onEditPage?: () => void;
  onNewPage?: () => void;
  onResetAll?: () => void;
  slug: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  tocCollapsed?: boolean;
  onToggleToc?: () => void;
  hasToc?: boolean;
}

export function Topbar({
  theme,
  setTheme,
  setLang,
  onSearch,
  onOpenNav,
  onEditPage,
  onNewPage,
  onResetAll,
  slug,
  sidebarCollapsed,
  onToggleSidebar,
  tocCollapsed,
  onToggleToc,
  hasToc,
}: Props) {
  const lang = useLang();
  const t = useT();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langMenuOpen]);

  // Filter out intro / getting-started pages so they never appear in the topbar
  const tabs = (getNav(lang).find((g) => !g.name)?.pages ?? []).filter(
    (p) => p.slug !== 'index' && p.slug !== 'getting-started',
  );

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 h-14 bg-bg/85 backdrop-blur border-b border-line">
      <div className="w-full h-full flex items-center gap-3 px-4 lg:px-6">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenNav}
          aria-label={t('openMenu')}
          className="lg:hidden w-8 h-8 grid place-items-center rounded-md border border-line text-muted hover:text-fg hover:bg-surface transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <a href={href('index')} className="flex items-center gap-2.5 font-semibold text-fg shrink-0 mr-4 hover:opacity-90 transition-opacity">
          <img src="./logo.png" alt="Worldbox Modding-Box" className="w-6 h-6 rounded-md object-contain shadow-xs" />
          <span>Worldbox Modding-Box</span>
        </a>

        {tabs.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
            {tabs.map((p) => (
              <a
                key={p.slug}
                href={href(p.slug)}
                className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${slug === p.slug ? 'text-brand font-medium' : 'text-muted hover:text-fg'
                  }`}
              >
                {p.title}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* New Page button */}
          {onNewPage && (
            <button
              onClick={onNewPage}
              title={t('newPage')}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-surface text-fg text-xs font-medium hover:border-brand hover:text-brand transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">{t('newPage')}</span>
            </button>
          )}

          {/* Edit Page button */}
          {onEditPage && (
            <button
              onClick={onEditPage}
              title={`${t('editPage')} (Ctrl+E)`}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-brand/10 border border-brand/30 text-brand text-xs font-medium hover:bg-brand/20 transition-colors cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('editPage')}</span>
              <kbd className="hidden md:inline text-[9px] border border-brand/30 rounded px-1 py-0.2 font-mono">
                Ctrl E
              </kbd>
            </button>
          )}

          {/* Sidebar & TOC Panel Toggles (near search on the left) */}
          <div className="flex items-center gap-1">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title={sidebarCollapsed ? t('showSidebar') : t('hideSidebar')}
                aria-label={t('toggleSidebarAria')}
                className={`hidden lg:grid place-items-center w-8 h-8 rounded-md border transition-all cursor-pointer shadow-xs ${
                  !sidebarCollapsed
                    ? 'border-brand/40 bg-brand-soft text-brand'
                    : 'border-line bg-surface text-muted hover:border-brand hover:text-brand'
                }`}
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {hasToc && onToggleToc && (
              <button
                type="button"
                onClick={onToggleToc}
                title={tocCollapsed ? t('showToc') : t('hideToc')}
                aria-label={t('toggleTocAria')}
                className={`hidden xl:grid place-items-center w-8 h-8 rounded-md border transition-all cursor-pointer shadow-xs ${
                  !tocCollapsed
                    ? 'border-brand/40 bg-brand-soft text-brand'
                    : 'border-line bg-surface text-muted hover:border-brand hover:text-brand'
                }`}
              >
                <PanelRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 1. Version Status Badge */}
          <div
            className="flex items-center h-8 px-2.5 rounded-md border border-line bg-surface text-xs font-mono text-muted select-none shadow-2xs"
            title={`Guide v0.${buildInfo.commitCount} (${buildInfo.commitHash}) | WorldBox ${buildInfo.gameVersion} | ${buildInfo.commitDate}`}
          >
            <span className="font-semibold text-fg">v0.{buildInfo.commitCount}</span>
            <span className="mx-1.5 text-line">|</span>
            <span>{buildInfo.gameVersion}</span>
          </div>

          {/* 2. Search */}
          <button
            onClick={onSearch}
            aria-label={t('search')}
            className="flex items-center gap-2 h-8 px-3 rounded-md border border-line bg-surface text-faint text-sm hover:border-brand hover:text-fg transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">{t('search')}</span>
            <kbd className="hidden sm:inline text-[10px] border border-line rounded px-1.5 py-0.5 font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* 3. 10 Languages Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setLangMenuOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              aria-label={t('language')}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-surface text-xs font-medium text-fg hover:border-brand transition-colors cursor-pointer"
            >
              <span className="text-sm leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.nativeName}</span>
              <span className="sm:hidden uppercase">{currentLang.code}</span>
              <ChevronDown
                className={`w-3 h-3 text-faint transition-transform duration-150 ${
                  langMenuOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>

            {langMenuOpen && (
              <div
                role="listbox"
                aria-label={t('language')}
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-line bg-raised shadow-xl py-1.5 z-50 max-h-72 overflow-y-auto"
              >
                {LANGUAGES.map((l) => {
                  const isSelected = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setLang(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-brand-soft text-brand font-medium'
                          : 'text-fg hover:bg-surface'
                      }`}
                    >
                      <span className="text-sm">{l.flag}</span>
                      <span className="flex-1 truncate">{l.nativeName}</span>
                      <span className="text-[10px] uppercase font-mono text-faint">
                        {l.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={t('theme')}
            aria-label={t('theme')}
            className="w-8 h-8 grid place-items-center rounded-md border border-line text-muted hover:text-fg bg-surface hover:bg-surface transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* 5. Reset / Reload */}
          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              title={t('resetAll')}
              aria-label={t('resetAll')}
              className="w-8 h-8 grid place-items-center rounded-md border border-line text-muted hover:text-brand hover:border-brand bg-surface transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
