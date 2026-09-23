import { useState, useMemo } from 'react';
import { X, PlusCircle, Sparkles } from 'lucide-react';
import { getNav } from '../lib/content';
import { useLang, useT } from '../lib/i18n';
import { slugify } from '../lib/markdown';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (slug: string) => void;
}

export function NewPageModal({ open, onClose, onCreated }: Props) {
  const currentLang = useLang();
  const t = useT();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [group, setGroup] = useState('NML Modding');
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [icon, setIcon] = useState('📄');
  const [createBoth, setCreateBoth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Existing groups
  const existingGroups = useMemo(() => {
    const nav = getNav(currentLang);
    const set = new Set<string>();
    for (const g of nav) {
      if (g.name) set.add(g.name);
    }
    return Array.from(set);
  }, [currentLang]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustom) {
      const generated = slugify(val);
      // If in a sub-group like NML Modding, prefix or use direct slug
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError('Enter at least a title and a slug.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const finalGroup = isNewGroup ? newGroupName.trim() : group.trim();
    const finalSlug = slug.trim().replace(/^\/+|\/+$/g, '');

    const payload = {
      lang: currentLang,
      slug: finalSlug,
      title: title.trim(),
      group: finalGroup || undefined,
      icon: icon.trim() || '📄',
      order: 50,
      createBoth,
    };

    try {
      const res = await fetch('/api/content/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const json = await res.json();
      if (json.ok) {
        onClose();
        // Give Vite HMR a brief moment to register the new file
        setTimeout(() => {
          onCreated(json.slug || finalSlug);
        }, 150);
      } else {
        throw new Error(json.error || 'Could not create the page');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('newPage')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface rounded-2xl border border-line shadow-2xl overflow-hidden flex flex-col text-fg">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-line bg-surface/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 grid place-items-center">
              <PlusCircle className="w-4 h-4 text-brand" />
            </div>
            <h2 className="font-semibold text-sm sm:text-base">Create New Page</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-fg hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-medium mb-1 text-fg">Page Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Making a custom weapon"
              className="w-full h-9 px-3 rounded-lg border border-line bg-bg text-fg outline-none focus:border-brand transition-colors text-sm"
              autoFocus
            />
          </div>

          {/* Slug URL */}
          <div>
            <label className="block font-medium mb-1 text-fg">
              Slug URL <span className="text-faint font-normal">(page address)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-faint font-mono text-xs">#/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugCustom(true);
                }}
                placeholder="e.g. custom-weapons or nml/weapons"
                className="flex-1 h-9 px-3 rounded-lg border border-line bg-bg font-mono text-xs text-fg outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* Section / group */}
          <div>
            <label className="block font-medium mb-1 text-fg">Section</label>
            {isNewGroup ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New section name..."
                  className="flex-1 h-9 px-3 rounded-lg border border-line bg-bg text-fg outline-none focus:border-brand transition-colors text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsNewGroup(false)}
                  className="px-3 h-9 text-xs rounded-lg border border-line bg-surface hover:bg-surface/80 transition-colors"
                >
                  Usa esistente
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={group}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsNewGroup(true);
                    } else {
                      setGroup(e.target.value);
                    }
                  }}
                  className="flex-1 h-9 px-3 rounded-lg border border-line bg-bg text-fg outline-none focus:border-brand transition-colors text-xs cursor-pointer"
                >
                  <option value="">(No top-level section)</option>
                  {existingGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="__NEW__">+ Create new section...</option>
                </select>
              </div>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block font-medium mb-1 text-fg">Page Icon</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. ⚔️, 📘, :pepecool:..."
                className="w-16 h-9 text-center text-base rounded-lg border border-line bg-bg text-fg outline-none focus:border-brand transition-colors"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {['📘', '⚔️', '🛡️', '⚙️', '🚀', '💡', '🎮', '📦', '⭐'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className="w-8 h-8 rounded-md border border-line bg-surface hover:bg-brand/10 hover:border-brand transition-colors grid place-items-center text-sm cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Opzione sincronizzazione lingua */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createBoth}
                onChange={(e) => setCreateBoth(e.target.checked)}
                className="rounded border-line text-brand focus:ring-brand accent-brand"
              />
              <span>Also create the English template (fallback for every other language)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-lg border border-line bg-surface hover:bg-surface/80 text-xs font-medium text-fg transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-9 rounded-lg bg-brand hover:bg-brand/90 active:scale-95 text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create and start writing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
