import { useEffect } from 'react';
import { X } from 'lucide-react';
import { SidebarContent } from './Sidebar';
import { href } from '../lib/router';
import { useT } from '../lib/i18n';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  slug: string;
}

export function MobileDrawer({ open, onClose, slug }: MobileDrawerProps) {
  const t = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label={t('menu')}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative w-72 max-w-[80vw] bg-bg border-r border-line shadow-2xl flex flex-col z-10 h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-line shrink-0">
          <a
            href={href('index')}
            onClick={onClose}
            className="flex items-center gap-2.5 font-semibold text-fg"
          >
            <img src="./logo.png" alt="Worldbox Modding-Box" className="w-5 h-5 rounded-md object-contain" />
            <span className="text-sm">Worldbox Modding-Box</span>
          </a>
          <button
            onClick={onClose}
            aria-label={t('closeMenu')}
            className="w-8 h-8 grid place-items-center rounded-md border border-line text-muted hover:text-fg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarContent slug={slug} onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
