import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Save,
  Check,
  Smile,
  Code,
  Code2,
  AlertCircle,
  Table as TableIcon,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Columns,
  Eye,
  Edit3,
  Heading2,
  Heading3,
  Link2,
} from 'lucide-react';
import { DiscordEmojiPicker, type EmojiTab } from './DiscordEmojiPicker.tsx';
import { Markdown, useMarkdown, PageIcon } from '../lib/markdown';
import { getNav, getPage, loadBody, updateCachedBody, type Page } from '../lib/content';
import { useLang, useT, type Lang } from '../lib/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  page: Page;
  currentLang: Lang;
  onSaved?: (updatedPage: Partial<Page>) => void;
}

export function PageEditorModal({ open, onClose, page, currentLang, onSaved }: Props) {
  const lang = useLang();
  const t = useT();

  const [editorLang, setEditorLang] = useState<Lang>(currentLang || page.lang || 'en');
  const [title, setTitle] = useState(page.title);
  const [group, setGroup] = useState(page.group ?? '');
  const [subgroup, setSubgroup] = useState(page.subgroup ?? '');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [customGroup, setCustomGroup] = useState('');
  const [icon, setIcon] = useState(page.icon ?? '📄');
  const [order, setOrder] = useState<number>(page.order ?? 99);
  const [tag, setTag] = useState(page.tag ?? '');
  const [body, setBody] = useState('');

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerTab, setEmojiPickerTab] = useState<EmojiTab>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);
  const selectionRef = useRef({ start: 0, end: 0 });

  // Sync state ONLY when opening or switching page, NOT on background re-renders or HMR
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const activeLang = currentLang || page.lang || 'en';
      setEditorLang(activeLang);
      const targetPage = getPage(page.slug, activeLang) ?? page;
      setTitle(targetPage.title);
      setGroup(targetPage.group ?? '');
      setSubgroup(targetPage.subgroup ?? '');
      setIsCustomGroup(false);
      setCustomGroup('');
      setIcon(targetPage.icon ?? '📄');
      setOrder(targetPage.order ?? 99);
      setTag(targetPage.tag ?? '');
      loadBody(targetPage).then((text) => {
        setBody(text);
        selectionRef.current = { start: text.length, end: text.length };
      });
      setSaveStatus('idle');
      setStatusMessage('');
      setShowEmojiPicker(false);
    }
    prevOpenRef.current = open;
  }, [open, page.slug, currentLang]);

  // Switch between English and Italian editing inside modal
  const switchEditorLang = (newLang: Lang) => {
    setEditorLang(newLang);
    const targetPage = getPage(page.slug, newLang) ?? getPage(page.slug, 'en') ?? page;
    if (targetPage) {
      setTitle(targetPage.title);
      setGroup(targetPage.group ?? '');
      setSubgroup(targetPage.subgroup ?? '');
      setIcon(targetPage.icon ?? '📄');
      setOrder(targetPage.order ?? 99);
      setTag(targetPage.tag ?? '');
      loadBody(targetPage).then((text) => {
        setBody(text);
        selectionRef.current = { start: text.length, end: text.length };
      });
    }
  };

  // Localized templates based on active editing language
  const isItalian = editorLang === 'it';
  const templates = {
    note: isItalian
      ? '\n\n> [!NOTE] Nota informativa\n> Inserisci qui le tue informazioni.\n\n'
      : '\n\n> [!NOTE] Note\n> Add your information here.\n\n',
    tip: isItalian
      ? '\n\n> [!TIP] Suggerimento utile\n> Ecco un trucco pratico da seguire.\n\n'
      : '\n\n> [!TIP] Useful Tip\n> Here is a practical tip to follow.\n\n',
    warning: isItalian
      ? '\n\n> [!WARNING] Attenzione\n> Presta attenzione a questo passaggio per evitare errori.\n\n'
      : '\n\n> [!WARNING] Warning\n> Pay attention to this step to avoid errors.\n\n',
    danger: isItalian
      ? '\n\n> [!DANGER] Pericolo\n> Informazione critica per evitare crash o errori.\n\n'
      : '\n\n> [!DANGER] Danger\n> Critical information to prevent crashes.\n\n',
    section: isItalian ? '\n\n## Titolo Sezione\n\n' : '\n\n## Section Title\n\n',
    subsection: isItalian ? '\n\n### Titolo Sottosezione\n\n' : '\n\n### Subsection Title\n\n',
    // Code samples stay in English in every language: C# identifiers and log strings are English.
    code: '\n\n```csharp Mods/HelloBox/Code/Main.cs\nusing NeoModLoader.api;\n\nnamespace HelloBox\n{\n    public class Main : BasicMod<Main>\n    {\n        protected override void OnModLoad()\n        {\n            LogInfo(\"HelloBox is alive!\");\n        }\n    }\n}\n```\n\n',
    table: isItalian
      ? '\n\n| Colonna 1 | Colonna 2 |\n| --- | --- |\n| Valore A | Descrizione A |\n| Valore B | Descrizione B |\n\n'
      : '\n\n| Column 1 | Column 2 |\n| --- | --- |\n| Value A | Description A |\n| Value B | Description B |\n\n',
    quote: isItalian
      ? '\n> Testo della citazione in evidenza\n\n'
      : '\n> Highlighted quote text\n\n',
    todo: isItalian
      ? '\n- [ ] Da completare\n- [x] Già completato\n\n'
      : '\n- [ ] To do\n- [x] Completed\n\n',
    list: isItalian
      ? '\n- Elemento 1\n- Elemento 2\n- Elemento 3\n\n'
      : '\n- Item 1\n- Item 2\n- Item 3\n\n',
    orderedList: isItalian
      ? '\n1. Primo elemento\n2. Secondo elemento\n3. Terzo elemento\n\n'
      : '\n1. First item\n2. Second item\n3. Third item\n\n',
  };

  // Keep track of cursor position when user selects, types or clicks in textarea
  const updateSelection = () => {
    if (textareaRef.current) {
      selectionRef.current = {
        start: textareaRef.current.selectionStart ?? 0,
        end: textareaRef.current.selectionEnd ?? 0,
      };
    }
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiContainerRef.current &&
        !emojiContainerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showEmojiPicker]);

  // Existing groups for category selection
  const existingGroups = useMemo(() => {
    const nav = getNav(lang);
    const set = new Set<string>();
    for (const g of nav) {
      if (g.name) set.add(g.name);
    }
    return Array.from(set);
  }, [lang]);

  // Real-time markdown preview parse
  const { segments } = useMarkdown(body);

  // Insert text at cursor position in textarea
  const insertText = useCallback(
    (textToInsert: string, cursorOffset = 0) => {
      const el = textareaRef.current;
      if (!el) {
        setBody((prev) => prev + textToInsert);
        return;
      }

      const start = selectionRef.current.start;
      const end = selectionRef.current.end;
      const cur = el.value;

      const updated = cur.slice(0, start) + textToInsert + cur.slice(end);
      setBody(updated);

      const newPos = start + textToInsert.length + cursorOffset;
      selectionRef.current = { start: newPos, end: newPos };

      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(newPos, newPos);
      });
    },
    [],
  );

  // Wrap selected text or insert snippet
  const wrapText = useCallback(
    (before: string, after: string, defaultText = '') => {
      const el = textareaRef.current;
      if (!el) return;

      const start = selectionRef.current.start;
      const end = selectionRef.current.end;
      const cur = el.value;
      const selected = cur.slice(start, end);

      if (selected) {
        const updated = cur.slice(0, start) + before + selected + after + cur.slice(end);
        setBody(updated);
        const newStart = start + before.length;
        const newEnd = end + before.length;
        selectionRef.current = { start: newStart, end: newEnd };
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(newStart, newEnd);
        });
      } else {
        const snippet = before + defaultText + after;
        const updated = cur.slice(0, start) + snippet + cur.slice(end);
        setBody(updated);
        const newStart = start + before.length;
        const newEnd = newStart + defaultText.length;
        selectionRef.current = { start: newStart, end: newEnd };
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(newStart, newEnd);
        });
      }
    },
    [],
  );

  // Save handler
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');

    const finalGroup = isCustomGroup ? customGroup.trim() : group.trim();

    const payload = {
      lang: editorLang,
      slug: page.slug,
      filePath: page.filePath,
      title: title.trim() || 'Untitled',
      group: finalGroup || undefined,
      subgroup: subgroup.trim() || undefined,
      icon: icon.trim() || undefined,
      order: typeof order === 'number' && !isNaN(order) ? order : page.order,
      tag: tag.trim() || undefined,
      body,
    };

    try {
      const res = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const json = await res.json();
      if (json.ok) {
        setSaveStatus('success');
        setStatusMessage(
          editorLang === 'it'
            ? 'Saved to the Italian file (src/content/it/)!'
            : 'Saved successfully in English file (src/content/en/)!',
        );
        updateCachedBody({ ...page, lang: editorLang }, body);
        onSaved?.({
          title: payload.title,
          group: payload.group,
          subgroup: payload.subgroup,
          icon: payload.icon,
          order: payload.order,
          tag: payload.tag,
        });
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err: unknown) {
      setSaveStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Save failed: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcuts (Ctrl+S to save, Ctrl+B bold, Ctrl+I italic, Escape to close)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        wrapText('**', '**', isItalian ? 'grassetto' : 'bold');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        wrapText('*', '*', isItalian ? 'corsivo' : 'italic');
      } else if (e.key === 'Escape' && !showEmojiPicker) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSave, wrapText, showEmojiPicker, isItalian, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('editPage')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-7xl max-h-[95vh] bg-surface rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden text-fg">
        {/* Top Header Bar */}
        <header className="px-4 py-2.5 border-b border-line bg-surface flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 grid place-items-center shrink-0">
              <Edit3 className="w-4 h-4 text-brand" />
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Icon field */}
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                title="Icon (emoji or :token:)"
                className="w-8 h-8 text-center text-base rounded-lg border border-line bg-bg focus:border-brand outline-none shrink-0"
              />

              {/* Title field */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title..."
                className="flex-1 font-semibold text-sm sm:text-base bg-transparent border-b border-transparent hover:border-line focus:border-brand px-1.5 py-0.5 outline-none transition-colors truncate min-w-[120px]"
              />

              {/* Language Selector: EN vs IT */}
              <div className="flex items-center rounded-lg border border-line bg-bg p-0.5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => switchEditorLang('en')}
                  title="Edit the English version (src/content/en/)"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    editorLang === 'en'
                      ? 'bg-brand text-white font-semibold shadow-xs'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span className="font-mono text-[11px]">EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchEditorLang('it')}
                  title="Edit the Italian version (src/content/it/)"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    editorLang === 'it'
                      ? 'bg-brand text-white font-semibold shadow-xs'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  <span>🇮🇹</span>
                  <span className="font-mono text-[11px]">IT</span>
                </button>
              </div>

              {/* Category / Group selector */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted shrink-0">
                <span className="shrink-0">Section:</span>
                {isCustomGroup ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={customGroup}
                      onChange={(e) => setCustomGroup(e.target.value)}
                      placeholder="New section name..."
                      className="h-7 px-2 text-xs rounded-md border border-line bg-bg text-fg outline-none focus:border-brand w-36"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomGroup(false)}
                      className="text-[11px] text-faint hover:text-fg px-1"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <select
                    value={group}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsCustomGroup(true);
                      } else {
                        setGroup(e.target.value);
                      }
                    }}
                    className="h-7 px-2 text-xs rounded-md border border-line bg-bg text-fg outline-none focus:border-brand cursor-pointer"
                  >
                    <option value="">(None)</option>
                    {existingGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="__NEW__">+ New section...</option>
                  </select>
                )}
              </div>

              {/* Optional Subfolder / Subgroup */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted shrink-0">
                <span className="shrink-0">Folder:</span>
                <input
                  type="text"
                  value={subgroup}
                  onChange={(e) => setSubgroup(e.target.value)}
                  placeholder="Optional folder..."
                  title="Subfolder grouping (e.g. External Tools & Setup)"
                  className="h-7 px-2 text-xs rounded-md border border-line bg-bg text-fg outline-none focus:border-brand w-36"
                />
              </div>
            </div>
          </div>

          {/* View Mode & Save Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-lg border border-line p-0.5 bg-bg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                title="Editor only"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'edit' ? 'bg-surface font-medium text-brand shadow-xs' : 'text-muted hover:text-fg'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('editorOnly')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="Split view"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-surface font-medium text-brand shadow-xs' : 'text-muted hover:text-fg'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{t('splitView')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                title="Preview only"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'bg-surface font-medium text-brand shadow-xs' : 'text-muted hover:text-fg'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t('previewOnly')}</span>
              </button>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold text-white transition-all shadow-xs cursor-pointer ${
                saveStatus === 'success'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-brand hover:bg-brand/90 active:scale-95'
              }`}
            >
              {saveStatus === 'success' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('saved')}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? t('saving') : t('save')}</span>
                  <kbd className="hidden md:inline text-[9px] bg-white/20 px-1 py-0.5 rounded font-mono">
                    Ctrl+S
                  </kbd>
                </>
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close editor"
              className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-fg hover:bg-surface border border-transparent hover:border-line transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Rich Formatting Toolbar (No clipping, direct 1-click tools, language-aware templates) */}
        <div className="px-4 py-2 border-b border-line bg-surface/60 flex flex-wrap items-center gap-1.5 text-xs shrink-0 overflow-visible relative">
          {/* 1. Discord Emoji & GIF Picker with WorldBox and Pepe categories */}
          <div className="relative flex items-center gap-1" ref={emojiContainerRef}>
            <button
              type="button"
              onClick={() => {
                setEmojiPickerTab('all');
                setShowEmojiPicker((v) => !v);
              }}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-brand/10 hover:bg-brand/20 text-brand font-medium border border-brand/30 transition-colors cursor-pointer shrink-0"
              title="Add emoji or animated GIFs"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Emoji & GIF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmojiPickerTab('worldbox');
                setShowEmojiPicker(true);
              }}
              className="flex items-center gap-1 h-7 px-2 rounded-md bg-surface hover:bg-surface-raised border border-line text-[11px] text-muted hover:text-fg font-medium transition-colors cursor-pointer shrink-0"
              title="WorldBox icons & emojis"
            >
              <span>🌍 WorldBox</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmojiPickerTab('pepe');
                setShowEmojiPicker(true);
              }}
              className="flex items-center gap-1 h-7 px-2 rounded-md bg-surface hover:bg-surface-raised border border-line text-[11px] text-muted hover:text-fg font-medium transition-colors cursor-pointer shrink-0"
              title="Pepe emojis & reactions"
            >
              <span>🐸 Pepe</span>
            </button>

            {showEmojiPicker && (
              <div className="absolute left-0 top-full mt-2 z-50 shadow-2xl">
                <DiscordEmojiPicker
                  initialTab={emojiPickerTab}
                  onSelect={(token) => {
                    insertText(` ${token} `);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-line mx-0.5 shrink-0" />

          {/* 2. Sezioni H2 / H3 */}
          <div className="flex items-center gap-0.5 border border-line rounded-lg p-0.5 bg-bg/60 shrink-0">
            <button
              type="button"
              onClick={() => insertText(templates.section)}
              className="flex items-center gap-1 h-6 px-2 rounded hover:bg-surface text-muted hover:text-fg transition-colors cursor-pointer"
              title={isItalian ? 'Main section (## Title)' : 'Main section (## Title)'}
            >
              <Heading2 className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">{isItalian ? 'Sezione' : 'Section'}</span>
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.subsection)}
              className="flex items-center gap-1 h-6 px-2 rounded hover:bg-surface text-muted hover:text-fg transition-colors cursor-pointer"
              title={isItalian ? 'Subsection (### Subtitle)' : 'Subsection (### Subtitle)'}
            >
              <Heading3 className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">{isItalian ? 'Sottosezione' : 'Subsection'}</span>
            </button>
          </div>

          {/* 3. Formattazione Testo: Bold, Italic, Strikethrough, Inline Code */}
          <div className="flex items-center gap-0.5 border border-line rounded-lg p-0.5 bg-bg/60 shrink-0">
            <button
              type="button"
              onClick={() => wrapText('**', '**', isItalian ? 'grassetto' : 'bold')}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer font-bold"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapText('*', '*', isItalian ? 'corsivo' : 'italic')}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer italic"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapText('~~', '~~', isItalian ? 'barrato' : 'strikethrough')}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapText('`', '`', isItalian ? 'codice' : 'code')}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer font-mono text-[11px]"
              title="Inline code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. C# code block and table */}
          <div className="flex items-center gap-0.5 border border-line rounded-lg p-0.5 bg-bg/60 shrink-0">
            <button
              type="button"
              onClick={() => insertText(templates.code)}
              className="flex items-center gap-1 h-6 px-2 rounded hover:bg-surface text-muted hover:text-fg transition-colors cursor-pointer"
              title="Insert a C# code block"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden md:inline">C# Code</span>
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.table)}
              className="flex items-center gap-1 h-6 px-2 rounded hover:bg-surface text-muted hover:text-fg transition-colors cursor-pointer"
              title="Insert a Markdown table"
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">{isItalian ? 'Tabella' : 'Table'}</span>
            </button>
          </div>

          {/* 5. BOX AVVISO / CALLOUTS - Direct 1-click buttons with language-aware templates! */}
          <div className="flex items-center gap-0.5 border border-amber-500/30 rounded-lg p-0.5 bg-amber-500/10 shrink-0">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 px-1.5 flex items-center gap-1 select-none">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Box:</span>
            </span>
            <button
              type="button"
              onClick={() => insertText(templates.note)}
              className="h-6 px-1.5 rounded hover:bg-surface text-fg font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Note box (info)"
            >
              <span>ℹ️</span>
              <span>{isItalian ? 'Nota' : 'Note'}</span>
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.tip)}
              className="h-6 px-1.5 rounded hover:bg-surface text-fg font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Tip box"
            >
              <span>💡</span>
              <span>{isItalian ? 'Consiglio' : 'Tip'}</span>
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.warning)}
              className="h-6 px-1.5 rounded hover:bg-surface text-fg font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Warning box"
            >
              <span>⚠️</span>
              <span>{isItalian ? 'Avviso' : 'Warning'}</span>
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.danger)}
              className="h-6 px-1.5 rounded hover:bg-surface text-fg font-medium transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              title="Danger box"
            >
              <span>🛑</span>
              <span>{isItalian ? 'Pericolo' : 'Danger'}</span>
            </button>
          </div>

          {/* 6. Lists, quote, link and divider */}
          <div className="flex items-center gap-0.5 border border-line rounded-lg p-0.5 bg-bg/60 shrink-0">
            <button
              type="button"
              onClick={() => insertText(templates.list)}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.orderedList)}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Numbered list"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.todo)}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Checklist"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText(templates.quote)}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Blockquote (>)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapText('[', '](https://...)', isItalian ? 'testo link' : 'link text')}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Insert a link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n\n---\n\n')}
              className="w-6 h-6 rounded hover:bg-surface text-muted hover:text-fg grid place-items-center cursor-pointer"
              title="Divider (---)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status notification banner if any */}
        {statusMessage && (
          <div
            className={`px-4 py-1.5 text-xs flex items-center justify-between ${
              saveStatus === 'success'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-b border-emerald-500/20'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-b border-amber-500/20'
            }`}
          >
            <span className="font-medium">{statusMessage}</span>
            <button
              onClick={() => setStatusMessage('')}
              className="text-[11px] underline cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Main Work Area: Editor & Live Preview */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-bg">
          {/* Left Column: Markdown Editor */}
          {(viewMode === 'split' || viewMode === 'edit') && (
            <div
              className={`flex flex-col h-full overflow-hidden ${
                viewMode === 'split' ? 'w-full lg:w-1/2 border-r border-line' : 'w-full'
              }`}
            >
              <div className="px-3 py-1.5 bg-surface/40 border-b border-line/40 text-[11px] font-mono text-faint flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span>📝 Editor Markdown</span>
                  <span className="px-1.5 py-0.2 rounded bg-brand/15 text-brand font-bold uppercase text-[10px]">
                    {editorLang}
                  </span>
                </div>
                <span>{body.length} characters</span>
              </div>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  updateSelection();
                }}
                onSelect={updateSelection}
                onKeyUp={updateSelection}
                onMouseUp={updateSelection}
                onClick={updateSelection}
                onKeyDown={(e) => {
                  // Allow Tab indentation
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    insertText('  ');
                  }
                }}
                placeholder={
                  isItalian
                    ? 'Write the page content here... Insert an emoji with :icon_name: or use the buttons above.'
                    : 'Write page content here... Insert emojis with :icon_name: or use the buttons above.'
                }
                className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-xs sm:text-sm text-fg leading-relaxed placeholder:text-faint overflow-y-auto"
                spellCheck={false}
              />
            </div>
          )}

          {/* Right Column: Live Real-Time Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div
              className={`flex flex-col h-full overflow-hidden bg-surface/30 ${
                viewMode === 'split' ? 'hidden lg:flex w-1/2' : 'w-full'
              }`}
            >
              <div className="px-3 py-1.5 bg-surface/40 border-b border-line/40 text-[11px] font-mono text-faint flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand" />
                  <span>Live preview ({editorLang.toUpperCase()})</span>
                </span>
                <span className="text-[10px] text-emerald-500 font-medium">● In sync</span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                    {icon && <PageIcon icon={icon} />}
                    <span>{title || 'Page title'}</span>
                  </h1>
                  <Markdown segments={segments} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
