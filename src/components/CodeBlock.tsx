import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, CircleX, Copy, Play, RotateCcw, X } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-json';
import { useT } from '../lib/i18n';
import { checkCode, type Diagnostic } from '../utils/csharpCheck.ts';

interface Props {
  initialCode: string;
  language?: string;
  filename?: string;
  /** Code blocks are editable by default; ```text blocks are not. */
  editable?: boolean;
}

export function CodeBlock({ initialCode, language = 'csharp', filename, editable }: Props) {
  const t = useT();
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  /** null = never checked. An empty array = checked and clean. */
  const [report, setReport] = useState<Diagnostic[] | null>(null);

  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  // Moving to another page reuses this component instance, so the new prop has to win
  // over the state - otherwise the block keeps showing the previous page's code.
  useEffect(() => {
    setCode(initialCode);
    setCustomHeight(null);
    setReport(null);
  }, [initialCode]);

  // Reset all changes when global reset is triggered
  useEffect(() => {
    const onReset = () => {
      setCode(initialCode);
      setCustomHeight(null);
      setReport(null);
    };
    window.addEventListener('wb-reset-all', onReset);
    return () => window.removeEventListener('wb-reset-all', onReset);
  }, [initialCode]);

  const canEdit = editable ?? language !== 'text';

  // Normalize code and highlight with Prism
  const displayHtml = useMemo(() => {
    const grammar = Prism.languages[language];
    const normalized = code.replace(/\r\n/g, '\n');
    const highlighted = grammar ? Prism.highlight(normalized, grammar, language) : normalized;
    // Trailing newline must have a space or placeholder so the last line renders full height in <pre>
    return normalized.endsWith('\n') ? highlighted + ' ' : highlighted;
  }, [code, language]);

  /** Editing invalidates whatever the last check said, so the panel never goes stale. */
  const edit = (next: string) => {
    setCode(next);
    if (report) setReport(null);
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard indentation support for code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: dedent 4 spaces on current line
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        if (code.slice(lineStart, lineStart + 4) === '    ') {
          const next = code.slice(0, lineStart) + code.slice(lineStart + 4);
          edit(next);
          setTimeout(() => {
            textarea.selectionStart = Math.max(lineStart, start - 4);
            textarea.selectionEnd = Math.max(lineStart, end - 4);
          }, 0);
        }
      } else {
        // Tab: insert 4 spaces
        const next = code.substring(0, start) + '    ' + code.substring(end);
        edit(next);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    }
  };

  // Scroll synchronization between textarea, highlighted <pre>, and line numbers gutter
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollLeft, scrollTop } = textareaRef.current;
    if (preRef.current) {
      preRef.current.scrollLeft = scrollLeft;
      preRef.current.scrollTop = scrollTop;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const btn =
    'h-7 px-2 rounded-md text-xs text-muted hover:text-fg hover:bg-line/60 flex items-center gap-1.5 transition-colors cursor-pointer';

  const lineCount = Math.max(1, code.split('\n').length);
  const editorHeight = lineCount * 22 + 24;

  const canCheck = language === 'csharp' || language === 'json';
  const runCheck = () => setReport(checkCode(code, language));

  const errorCount = report?.filter((d) => d.severity === 'error').length ?? 0;
  const warningCount = report?.filter((d) => d.severity === 'warning').length ?? 0;

  return (
    <div className="my-5 rounded-lg border border-line overflow-hidden bg-[var(--code-bg)] shadow-xs">
      {/* Top Header Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-line bg-surface select-none">
        <span className="font-mono text-xs text-muted font-medium">{filename || language}</span>
        <div className="ml-auto flex items-center gap-1">
          {canCheck && (
            <button onClick={runCheck} className={btn} title="Check this code">
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Check</span>
            </button>
          )}
          {canEdit && code !== initialCode && (
            <button
              onClick={() => {
                setCode(initialCode);
                setReport(null);
              }}
              className={btn}
              title={t('reset')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={copy} className={btn} title={t('copy')}>
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {canEdit ? (
        <div
          className="flex items-stretch overflow-hidden bg-[var(--code-bg)]"
          style={{ height: customHeight ? `${customHeight}px` : `${Math.min(650, Math.max(70, editorHeight))}px` }}
        >
          {/* Line numbers gutter */}
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="code-block-gutter text-right text-faint/50 border-r border-line/40 shrink-0 bg-surface/25 overflow-hidden select-none"
            style={{ width: lineCount >= 100 ? '48px' : '40px' }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="code-block-gutter-num">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Container with pixel-perfect overlay */}
          <div className="code-block-editor relative flex-1 min-w-0 h-full overflow-hidden">
            {/* Syntax Highlighted View */}
            <pre
              ref={preRef}
              aria-hidden="true"
              className="absolute inset-0 select-none pointer-events-none overflow-hidden"
              dangerouslySetInnerHTML={{ __html: displayHtml }}
            />

            {/* Live Directly-Editable Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => edit(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent resize-none overflow-auto"
              style={{
                color: 'transparent',
                caretColor: 'var(--fg)',
              }}
            />
          </div>
        </div>
      ) : (
        <pre className="m-0 p-4 overflow-x-auto font-mono text-[13px] leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: displayHtml }} />
        </pre>
      )}

      {/* Check report. No fix button on purpose: a wrong autofix is worse than no check. */}
      {report && (
        <div className="border-t border-line bg-surface/60 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-line/50 font-medium">
            {report.length === 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-600 dark:text-emerald-400">
                  No problems found.
                </span>
              </>
            ) : (
              <>
                {errorCount > 0 ? (
                  <CircleX className="w-3.5 h-3.5 text-red-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className={errorCount > 0 ? 'text-red-500' : 'text-amber-500'}>
                  {errorCount > 0 && `${errorCount} error${errorCount === 1 ? '' : 's'}`}
                  {errorCount > 0 && warningCount > 0 && ', '}
                  {warningCount > 0 && `${warningCount} warning${warningCount === 1 ? '' : 's'}`}
                </span>
              </>
            )}
            <button
              onClick={() => setReport(null)}
              className="ml-auto text-muted hover:text-fg cursor-pointer"
              aria-label="Close the check report"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {report.length > 0 && (
            <ul className="max-h-48 overflow-y-auto py-1">
              {report.map((d, i) => (
                <li key={i} className="flex gap-2 px-3 py-1 items-start">
                  <span className="font-mono text-faint shrink-0 tabular-nums">
                    {d.line}:{d.column}
                  </span>
                  <span
                    className={`font-mono shrink-0 ${
                      d.severity === 'error' ? 'text-red-500' : 'text-amber-500'
                    }`}
                  >
                    {d.ruleId}
                  </span>
                  <span className="text-muted">{d.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
