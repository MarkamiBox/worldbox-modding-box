import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface Option {
  value: string;
  label?: string;
  group?: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  /** Also accept a typed value that is not in the list. */
  free?: boolean;
  /** Text for the search box. */
  placeholder?: string;
  className?: string;
}

/**
 * A themed replacement for <select> and <datalist>. The native pop-ups ignore the site's
 * colours and look different on every OS; this one follows the theme and can be searched.
 */
export function Dropdown({ value, options, onChange, free, placeholder = 'Search...', className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const searchable = free || options.length > 8;

  const current = options.find((o) => o.value === value);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q ? options.filter((o) => `${o.label ?? ''} ${o.value}`.toLowerCase().includes(q)) : options;
    // a typed value that is not an option can still be picked when free text is allowed
    if (free && q && !options.some((o) => o.value.toLowerCase() === q)) {
      return [{ value: query.trim(), label: `"${query.trim()}"` }, ...hits];
    }
    return hits;
  }, [options, query, free]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const idx = options.findIndex((o) => o.value === value);
    setActive(idx < 0 ? 0 : idx);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(a + 1, shown.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      if (shown[active]) pick(shown[active].value);
    }
  };

  let lastGroup: string | undefined;

  return (
    <div ref={root} className={`not-prose relative min-w-0 ${className}`} onKeyDown={onKey}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 rounded-md border bg-surface px-3 py-2 text-left text-sm outline-none cursor-pointer ${
          open ? 'border-brand' : 'border-line hover:border-brand focus:border-brand'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{current?.label ?? (value || ' ')}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-md border border-line bg-raised shadow-lg">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="h-3.5 w-3.5 shrink-0 text-faint" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder={placeholder}
                className="w-full bg-transparent py-2 text-sm outline-none"
              />
            </div>
          )}
          <ul ref={list} className="m-0 max-h-64 list-none overflow-y-auto p-0 py-1" role="listbox">
            {shown.map((o, i) => {
              const header = o.group && o.group !== lastGroup ? o.group : null;
              lastGroup = o.group;
              return (
                <li key={`${o.group ?? ''}-${o.value}-${i}`} className="m-0 p-0">
                  {header && (
                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">{header}</div>
                  )}
                  <button
                    type="button"
                    data-i={i}
                    role="option"
                    aria-selected={o.value === value}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(o.value)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm cursor-pointer ${
                      i === active ? 'bg-surface text-brand' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{o.label ?? o.value}</span>
                    {o.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-brand" />}
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-3 py-2 text-sm text-faint">-</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
