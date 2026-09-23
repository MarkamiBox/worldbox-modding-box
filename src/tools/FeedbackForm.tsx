import { useState } from 'react';
import { Check, Copy, ExternalLink, MessageSquare } from 'lucide-react';
import { DISCORD_URL, ISSUES_URL, NEW_ISSUE_URL } from '../config';
import type { Lang } from '../lib/i18n';

type Kind = 'wrong' | 'missing' | 'tool' | 'other';

type Text = Partial<Record<Lang, string>> & { en: string };

const KINDS: Record<Kind, { label: Text; labelGh: string; hint: Text }> = {
  wrong: {
    label: {
      en: 'Something is wrong',
      it: 'Qualcosa è sbagliato',
      de: 'Etwas ist fehlerhaft',
      es: 'Algo está mal',
      fr: 'Quelque chose est incorrect',
      ja: '間違い・不具合の報告',
      ko: '오류가 있습니다',
      pt: 'Algo está incorreto',
      ru: 'Что-то работает не так',
      zh: '内容有误或存在 Bug',
    },
    labelGh: 'docs-error',
    hint: {
      en: 'Code that does not compile, a name that does not exist, a step that does not work.',
      it: 'Codice che non compila, un nome che non esiste, un passaggio che non funziona.',
      de: 'Code, der nicht kompiliert, ein unbekannter Name oder ein Schritt, der fehlschlägt.',
      es: 'Código que no compila, un nombre inexistente o un paso que no funciona.',
      fr: 'Code qui ne compile pas, un nom inexistant ou une étape qui échoue.',
      ja: 'コンパイルできないコード、存在しない名前、動かない手順など。',
      ko: '컴파일되지 않는 코드, 존재하지 않는 이름, 작동하지 않는 단계 등.',
      pt: 'Código que não compila, um nome que não existe ou uma etapa que não funciona.',
      ru: 'Код не компилируется, несуществующее имя API или неработающий шаг.',
      zh: '代码无法编译、使用了不存在的 API 名称或步骤无效。',
    },
  },
  missing: {
    label: {
      en: 'Something is missing',
      it: 'Manca qualcosa',
      de: 'Etwas fehlt',
      es: 'Falta algo',
      fr: 'Quelque chose manque',
      ja: '不足・追加リクエスト',
      ko: '누락된 내용이 있습니다',
      pt: 'Falta alguma informação',
      ru: 'Чего-то не хватает',
      zh: '缺少必要内容',
    },
    labelGh: 'docs-request',
    hint: {
      en: 'A topic the guide does not cover yet, or a part that is too short to follow.',
      it: 'Un argomento non ancora coperto, o una parte troppo breve da seguire.',
      de: 'Ein Thema, das noch fehlt, oder ein Abschnitt, der zu kurz geraten ist.',
      es: 'Un tema aún no tratado o una sección demasiado resumida para seguirla.',
      fr: 'Un sujet non encore abordé ou une section trop courte pour être suivie.',
      ja: 'まだ掲載されていないトピックや、説明が短すぎて分かりにくい部分。',
      ko: '가이드에서 아직 다루지 않은 주제나 너무 간략하여 따라하기 어려운 부분.',
      pt: 'Um tópico ainda não abordado ou uma seção muito curta para acompanhar.',
      ru: 'Тема, которая еще не описана, или слишком краткий раздел.',
      zh: '指南尚未涵盖的主题，或内容过于简短难以理解的部分。',
    },
  },
  tool: {
    label: {
      en: 'Tool idea',
      it: 'Idea per un tool',
      de: 'Tool-Idee',
      es: 'Idea de herramienta',
      fr: 'Idée d\'outil',
      ja: '便利ツールの提案',
      ko: '도구 아이디어 제안',
      pt: 'Ideia de ferramenta',
      ru: 'Идея для инструмента',
      zh: '开发工具建议',
    },
    labelGh: 'tool-request',
    hint: {
      en: 'Something you keep doing by hand that the site could do for you.',
      it: 'Qualcosa che fai sempre a mano e che il sito potrebbe fare per te.',
      de: 'Etwas, das du ständig manuell machst und die Website automatisieren könnte.',
      es: 'Algo que siempre haces a mano y que el sitio web podría automatizar.',
      fr: 'Une tâche manuelle répétitive que le site pourrait automatiser pour vous.',
      ja: '手作業で行っている面倒な作業で、サイト上で自動化してほしいこと。',
      ko: '수동으로 반복하는 작업 중 사이트에서 자동화해 주었으면 하는 기능.',
      pt: 'Algo repetitivo que você faz manualmente e o site poderia gerar.',
      ru: 'Что-то, что вы делаете вручную и что сайт мог бы автоматизировать.',
      zh: '日常开发中繁琐的手动操作，希望能由网站工具自动生成。',
    },
  },
  other: {
    label: {
      en: 'Anything else',
      it: 'Altro',
      de: 'Sonstiges',
      es: 'Otros',
      fr: 'Autre',
      ja: 'その他',
      ko: '기타',
      pt: 'Outro assunto',
      ru: 'Другое',
      zh: '其他反馈',
    },
    labelGh: 'feedback',
    hint: {
      en: 'Site bugs, layout, translations, ideas.',
      it: 'Bug del sito, layout, traduzioni, idee.',
      de: 'Website-Fehler, Layout, Übersetzungen, Ideen.',
      es: 'Errores del sitio, diseño, traducciones, sugerencias.',
      fr: 'Bugs du site, mise en page, traductions, suggestions.',
      ja: 'サイトのバグ、レイアウト、翻訳の改善、自由なアイデアなど。',
      ko: '사이트 오류, 레이아웃, 번역 수정, 자유로운 아이디어 등.',
      pt: 'Bugs do site, layout, traduções, ideias gerais.',
      ru: 'Ошибки сайта, оформление, перевод, предложения.',
      zh: '网站 Bug、排版布局、翻译润色或其他任何想法。',
    },
  },
};

const EN = {
  kind: 'What is this about?',
  title: 'One line summary',
  titlePh: 'e.g. The trait example crashes on start',
  page: 'Which page? (optional)',
  body: 'Details',
  bodyPh: 'What you did, what you expected, what happened instead. Paste the log line if you have one.',
  open: 'Open on GitHub',
  copy: 'Copy as text',
  copied: 'Copied',
  browse: 'Read what people already asked',
  needTitle: 'Add a short summary first.',
  privacy:
    'Nothing is sent from this page. The button opens a prefilled GitHub issue in a new tab, and you decide whether to post it. No account? Copy the text and send it however you like.',
};

/** Languages with no entry here fall back to English rather than showing empty labels. */
const T: Partial<Record<Lang, typeof EN>> & { en: typeof EN } = {
  en: EN,
  it: {
    kind: 'Di cosa si tratta?',
    title: 'Riassunto in una riga',
    titlePh: 'es. L\'esempio del trait crasha all\'avvio',
    page: 'Quale pagina? (opzionale)',
    body: 'Dettagli',
    bodyPh: 'Cosa hai fatto, cosa ti aspettavi, cosa è successo. Incolla la riga di log se ce l\'hai.',
    open: 'Apri su GitHub',
    copy: 'Copia come testo',
    copied: 'Copiato',
    browse: 'Leggi cosa hanno già chiesto gli altri',
    needTitle: 'Scrivi prima un riassunto breve.',
    privacy:
      'Da questa pagina non parte nulla. Il pulsante apre una issue GitHub già compilata in una nuova scheda, e decidi tu se pubblicarla. Niente account? Copia il testo e mandalo come preferisci.',
  },
  de: {
    kind: 'Worum geht es?',
    title: 'Kurze Zusammenfassung',
    titlePh: 'z. B. Trait-Beispiel stürzt beim Start ab',
    page: 'Welche Seite? (optional)',
    body: 'Details',
    bodyPh: 'Was hast du gemacht, was hast du erwartet, was ist passiert? Logzeile einfügen falls vorhanden.',
    open: 'Auf GitHub öffnen',
    copy: 'Als Text kopieren',
    copied: 'Kopiert',
    browse: 'Bereits eingereichte Fragen ansehen',
    needTitle: 'Bitte zuerst eine kurze Zusammenfassung eingeben.',
    privacy:
      'Von dieser Seite wird nichts direkt gesendet. Der Button öffnet ein vorausgefülltes GitHub-Issue in einem neuen Tab. Kein Account? Text kopieren und beliebig einsenden.',
  },
  es: {
    kind: '¿De qué se trata?',
    title: 'Resumen en una línea',
    titlePh: 'ej. El ejemplo del rasgo falla al iniciar',
    page: '¿Qué página? (opcional)',
    body: 'Detalles',
    bodyPh: 'Qué hiciste, qué esperabas y qué ocurrió en su lugar. Pega la línea del registro si la tienes.',
    open: 'Abrir en GitHub',
    copy: 'Copiar como texto',
    copied: 'Copiado',
    browse: 'Ver preguntas ya enviadas',
    needTitle: 'Añade primero un breve resumen.',
    privacy:
      'No se envía nada desde esta página. El botón abre una incidencia de GitHub precompletada en una nueva pestaña. ¿Sin cuenta? Copia el texto y envíalo como prefieras.',
  },
  fr: {
    kind: 'De quoi s\'agit-il ?',
    title: 'Résumé en une ligne',
    titlePh: 'ex. L\'exemple de trait plante au démarrage',
    page: 'Quelle page ? (optionnel)',
    body: 'Détails',
    bodyPh: 'Ce que vous avez fait, ce que vous attendiez, ce qui s\'est passé. Collez la ligne de log si disponible.',
    open: 'Ouvrir sur GitHub',
    copy: 'Copier en texte',
    copied: 'Copié',
    browse: 'Voir les retours déjà soumis',
    needTitle: 'Ajoutez d\'abord un court résumé.',
    privacy:
      'Rien n\'est envoyé depuis cette page. Le bouton ouvre une issue GitHub préremplie dans un nouvel onglet. Pas de compte ? Copiez le texte et envoyez-le par le moyen de votre choix.',
  },
  ja: {
    kind: 'トピックの分類',
    title: '一行要約',
    titlePh: '例: 特性のサンプルコードが起動時にクラッシュする',
    page: '対象ページ（任意）',
    body: '詳細内容',
    bodyPh: '行った手順、期待した結果、実際の挙動を教えてください。エラーログがあれば貼り付けてください。',
    open: 'GitHub で開く',
    copy: 'テキストをコピー',
    copied: 'コピー完了',
    browse: '既存の Issue を確認',
    needTitle: 'まず短い要約を入力してください。',
    privacy:
      'このページから直接データが送信されることはありません。ボタンを押すと内容が事前入力された GitHub Issue が開きます。アカウントをお持ちでない場合はテキストをコピーしてご自由にお送りください。',
  },
  ko: {
    kind: '어떤 주제인가요?',
    title: '한 줄 요약',
    titlePh: '예: 특성 예제 코드가 실행 시 충돌함',
    page: '대상 페이지 (선택사항)',
    body: '상세 내용',
    bodyPh: '수행한 작업, 기대했던 결과, 실제로 일어난 현상을 적어주세요. 로그가 있다면 함께 붙여넣어 주세요.',
    open: 'GitHub에서 열기',
    copy: '텍스트로 복사',
    copied: '복사됨',
    browse: '등록된 문의 목록 보기',
    needTitle: '먼저 짧은 요약을 입력하세요.',
    privacy:
      '이 페이지에서 데이터가 직접 전송되지 않습니다. 버튼을 누르면 내용이 미리 채워진 GitHub Issue가 새 탭에서 열립니다. 계정이 없으신가요? 텍스트를 복사하여 전달해 주세요.',
  },
  pt: {
    kind: 'Sobre o que é?',
    title: 'Resumo em uma linha',
    titlePh: 'ex. O exemplo de traço trava ao iniciar',
    page: 'Qual página? (opcional)',
    body: 'Detalhes',
    bodyPh: 'O que você fez, o que esperava e o que aconteceu. Cole a linha do log se tiver.',
    open: 'Abrir no GitHub',
    copy: 'Copiar como texto',
    copied: 'Copiado',
    browse: 'Ver o que outros já perguntaram',
    needTitle: 'Adicione um resumo curto primeiro.',
    privacy:
      'Nada é enviado diretamente desta página. O botão abre uma issue pré-preenchida no GitHub em uma nova aba. Sem conta? Copie o texto e envie como preferir.',
  },
  ru: {
    kind: 'О чем речь?',
    title: 'Краткая суть в одну строку',
    titlePh: 'напр. Пример черты падает при запуске',
    page: 'Какая страница? (необязательно)',
    body: 'Подробности',
    bodyPh: 'Что вы сделали, чего ожидали и что произошло на самом деле. Вставьте строку из лога при наличии.',
    open: 'Открыть на GitHub',
    copy: 'Скопировать как текст',
    copied: 'Скопировано',
    browse: 'Посмотреть созданные обращения',
    needTitle: 'Сначала напишите краткое описание.',
    privacy:
      'С этой страницы ничего не отправляется напрямую. Кнопка открывает заполненную форму GitHub Issue в новой вкладке. Нет аккаунта? Скопируйте текст и отправьте удобным способом.',
  },
  zh: {
    kind: '反馈类型',
    title: '一句话概要',
    titlePh: '例如：特质示例代码在启动时发生崩溃',
    page: '所在页面（可选）',
    body: '详细描述',
    bodyPh: '请描述你的操作步骤、预期结果以及实际发生的问题。如果有日志行请一并粘贴。',
    open: '在 GitHub 上打开',
    copy: '复制为文本',
    copied: '已复制',
    browse: '查看已有的反馈与提问',
    needTitle: '请先填写简要概述。',
    privacy:
      '本页面不会在后台静默发送任何数据。点击按钮将在新标签页中打开已预填好的 GitHub Issue。没有账号？可直接复制文本并通过其他渠道反馈。',
  },
};

/** Feedback form. Builds a prefilled GitHub issue URL: no backend, no data stored here. */
export function FeedbackForm({ language }: { language: Lang }) {
  const t = T[language] ?? T.en;
  const [kind, setKind] = useState<Kind>('wrong');
  const [title, setTitle] = useState('');
  const [page, setPage] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  const issueBody = [page.trim() ? `**Page:** ${page.trim()}` : '', body.trim()].filter(Boolean).join('\n\n');

  const issueUrl =
    `${NEW_ISSUE_URL}?labels=${encodeURIComponent(KINDS[kind].labelGh)}` +
    `&title=${encodeURIComponent(title.trim())}` +
    `&body=${encodeURIComponent(issueBody)}`;

  const copy = () => {
    navigator.clipboard.writeText(`[${KINDS[kind].labelGh}] ${title.trim()}\n\n${issueBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const field = 'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand';

  return (
    <div className="my-6 rounded-xl border border-line bg-raised p-4 sm:p-5">
      <fieldset className="mb-4">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t.kind}</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(KINDS) as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                kind === k
                  ? 'border-brand bg-brand-soft text-brand font-medium'
                  : 'border-line text-muted hover:text-fg hover:bg-surface'
              }`}
            >
              {KINDS[k].label[language] ?? KINDS[k].label.en}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">{KINDS[kind].hint[language] ?? KINDS[kind].hint.en}</p>
      </fieldset>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-faint">{t.title}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePh} className={field} />
      </label>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-faint">{t.page}</span>
        <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="Custom traits" className={field} />
      </label>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-faint">{t.body}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.bodyPh}
          rows={6}
          className={`${field} resize-y font-mono text-[13px]`}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={title.trim() ? issueUrl : undefined}
          target="_blank"
          rel="noreferrer noopener"
          aria-disabled={!title.trim()}
          onClick={(e) => {
            if (!title.trim()) e.preventDefault();
          }}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            title.trim()
              ? 'bg-brand text-white hover:opacity-90 cursor-pointer'
              : 'bg-surface text-faint cursor-not-allowed'
          }`}
        >
          <ExternalLink className="h-4 w-4" />
          {t.open}
        </a>

        <button
          type="button"
          onClick={copy}
          disabled={!title.trim()}
          className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-muted hover:text-fg disabled:opacity-50 cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? t.copied : t.copy}
        </button>

        <a
          href={ISSUES_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-muted hover:text-fg"
        >
          <MessageSquare className="h-4 w-4" />
          {t.browse}
        </a>

        {DISCORD_URL && (
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md border border-line px-3 py-2 text-sm text-muted hover:text-fg"
          >
            Discord
          </a>
        )}
      </div>

      {!title.trim() && <p className="mt-2 text-xs text-faint">{t.needTitle}</p>}

      <p className="mt-4 border-t border-line pt-3 text-xs text-muted">{t.privacy}</p>
    </div>
  );
}
