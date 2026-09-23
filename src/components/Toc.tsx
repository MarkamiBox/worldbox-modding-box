import { useEffect, useState } from 'react';
import type { Heading } from '../lib/markdown';
import { useT } from '../lib/i18n';
import { replaceIcons } from '../lib/icons';

interface TocProps {
  headings: Heading[];
  width?: number;
  isCollapsed?: boolean;
  onStartResize?: (e: React.MouseEvent) => void;
  onResetWidth?: () => void;
}

export function Toc({
  headings,
  width = 240,
  isCollapsed = false,
  onStartResize,
  onResetWidth,
}: TocProps) {
  const t = useT();
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!headings.length) return;

    let ticking = false;

    const updateActive = () => {
      // 1. If scrolled near the bottom of the page, activate the last heading
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollPosition >= documentHeight - 50) {
        setActive(headings[headings.length - 1].id);
        ticking = false;
        return;
      }

      // 2. If at the very top of the page
      if (window.scrollY < 80) {
        setActive(headings[0].id);
        ticking = false;
        return;
      }

      // 3. Find the heading currently in view (top <= 100px header offset)
      const offset = 100;
      let currentActive = headings[0].id;

      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= offset) {
          currentActive = h.id;
        } else {
          break;
        }
      }

      setActive(currentActive);
      ticking = false;
    };

    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActive);
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings]);

  if (headings.length < 2 || isCollapsed) return null;

  return (
    <aside
      aria-label={t('onThisPage')}
      style={{ width: `${width}px` }}
      className="hidden xl:block shrink-0 relative border-l border-line group/toc"
    >
      {/* Resize drag handle: sits strictly in the outer gap with 0px overlap */}
      {onStartResize && (
        <div
          onMouseDown={onStartResize}
          onDoubleClick={onResetWidth}
          title={t('resizeHandleTooltip')}
          className="absolute top-0 right-full -mr-[2px] w-2.5 h-full cursor-col-resize select-none z-10 flex items-center justify-center group/handle"
        >
          <div className="sticky top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-line/60 group-hover/handle:bg-brand group-hover/handle:scale-y-125 transition-all" />
        </div>
      )}

      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain py-6 pl-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            {t('onThisPage')}
          </span>
        </div>

        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            // scroll manually: changing location.hash would be read as a route change
            onClick={(e) => {
              e.preventDefault();
              setActive(h.id);
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-current={active === h.id ? 'location' : undefined}
            className={`block py-1 text-sm border-l-2 transition-colors ${h.level === 3 ? 'pl-6' : 'pl-3'} ${
              active === h.id ? 'border-brand text-brand' : 'border-line text-muted hover:text-fg'
            }`}
            dangerouslySetInnerHTML={{ __html: replaceIcons(h.text) }}
          />
        ))}
      </div>
    </aside>
  );
}
