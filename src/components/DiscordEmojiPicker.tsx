import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Smile, Sparkles, Gamepad2, Globe, Image as ImageIcon } from 'lucide-react';
import { getEmojiCatalog, type EmojiItem, type EmojiCategory } from '../lib/icons.ts';

export type EmojiTab = 'all' | EmojiCategory;

interface Props {
  onSelect: (token: string) => void;
  onClose: () => void;
  initialTab?: EmojiTab;
}

export function DiscordEmojiPicker({ onSelect, onClose, initialTab = 'all' }: Props) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<EmojiTab>(initialTab);
  const [hovered, setHovered] = useState<EmojiItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const catalog = useMemo(() => getEmojiCatalog(), []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const counts = useMemo(() => {
    return {
      all: catalog.length,
      worldbox: catalog.filter((i) => i.category === 'worldbox').length,
      pepe: catalog.filter((i) => i.category === 'pepe').length,
      gif_meme: catalog.filter((i) => i.category === 'gif_meme').length,
      modding: catalog.filter((i) => i.category === 'modding').length,
      standard: catalog.filter((i) => i.category === 'standard').length,
    };
  }, [catalog]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((item) => {
      if (activeTab !== 'all' && item.category !== activeTab) return false;
      if (!q) return true;
      return item.key.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
  }, [catalog, search, activeTab]);

  const handlePick = (item: EmojiItem) => {
    if (item.type === 'text') {
      onSelect(item.key);
    } else {
      onSelect(`:${item.key}:`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-[360px] sm:w-[520px] rounded-2xl border border-line bg-raised shadow-2xl overflow-hidden flex flex-col z-50 text-fg select-none animate-in fade-in zoom-in-95 duration-150"
      style={{ maxHeight: '500px' }}
    >
      {/* Header with Search */}
      <div className="p-3 border-b border-line bg-surface flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${catalog.length}+ icons (WorldBox, Pepe, GIFs)...`}
            className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-line bg-bg text-fg placeholder:text-faint outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
          />
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-lg grid place-items-center hover:bg-surface text-faint hover:text-fg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-line bg-surface/70 text-xs font-medium overflow-x-auto shrink-0 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-brand text-white font-semibold shadow-xs'
              : 'text-muted hover:text-fg hover:bg-surface'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('worldbox')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'worldbox'
              ? 'bg-brand text-white font-semibold shadow-xs'
              : 'text-muted hover:text-fg hover:bg-surface'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>WorldBox ({counts.worldbox})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pepe')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'pepe'
              ? 'bg-brand text-white font-semibold shadow-xs'
              : 'text-muted hover:text-fg hover:bg-surface'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pepe ({counts.pepe})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gif_meme')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'gif_meme'
              ? 'bg-brand text-white font-semibold shadow-xs'
              : 'text-muted hover:text-fg hover:bg-surface'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>GIF & Memes ({counts.gif_meme})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('modding')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'modding'
              ? 'bg-brand text-white font-semibold shadow-xs'
              : 'text-muted hover:text-fg hover:bg-surface'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Modding ({counts.modding})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('standard')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'standard'
              ? 'bg-brand text-white font-semibold shadow-xs'
              : 'text-muted hover:text-fg hover:bg-surface'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>Standard ({counts.standard})</span>
        </button>
      </div>

      {/* High-visibility Emoji & GIF Grid */}
      <div className="flex-1 p-3 overflow-y-auto min-h-[240px] max-h-[300px] bg-bg/40">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-faint">
            No icon found for &quot;{search}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {filtered.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handlePick(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered((cur) => (cur?.key === item.key ? null : cur))}
                title={`:${item.key}:`}
                className="h-14 rounded-xl border border-line/70 bg-surface/90 hover:bg-brand/15 hover:border-brand flex flex-col items-center justify-center p-1 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95 group relative"
              >
                {item.type === 'image' && (
                  <img
                    src={item.preview}
                    alt={item.name}
                    className="w-9 h-9 object-contain pointer-events-none drop-shadow-sm rounded"
                    loading="lazy"
                  />
                )}
                {item.type === 'svg' && (
                  <span
                    className="w-8 h-8 flex items-center justify-center text-brand pointer-events-none drop-shadow-xs"
                    dangerouslySetInnerHTML={{ __html: item.preview }}
                  />
                )}
                {item.type === 'text' && (
                  <span className="text-2xl pointer-events-none select-none leading-none">
                    {item.preview}
                  </span>
                )}
                <span className="text-[9px] font-mono text-faint group-hover:text-brand truncate w-full text-center mt-0.5 px-0.5">
                  {item.key.slice(0, 10)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Large Clear Footer Preview Bar */}
      <div className="h-14 px-3 border-t border-line bg-surface flex items-center gap-3 shrink-0">
        {hovered ? (
          <>
            <div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center shrink-0 p-1 shadow-xs">
              {hovered.type === 'image' && (
                <img src={hovered.preview} alt="" className="w-8 h-8 object-contain" />
              )}
              {hovered.type === 'svg' && (
                <span
                  className="w-7 h-7 flex items-center justify-center text-brand"
                  dangerouslySetInnerHTML={{ __html: hovered.preview }}
                />
              )}
              {hovered.type === 'text' && <span className="text-2xl">{hovered.preview}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-fg truncate">{hovered.name}</p>
              <p className="text-xs font-mono text-brand truncate font-semibold">
                {hovered.type === 'text' ? hovered.key : `:${hovered.key}:`}
              </p>
            </div>
            <span className="text-[11px] text-faint font-medium px-2 py-1 rounded-md bg-bg border border-line shrink-0">
              Clicca per inserire
            </span>
          </>
        ) : (
          <p className="text-xs text-faint flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Hover an icon to enlarge it, click to insert it into the text</span>
          </p>
        )}
      </div>
    </div>
  );
}
