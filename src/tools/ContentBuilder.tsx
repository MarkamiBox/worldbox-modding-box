import { useMemo, useState } from 'react';
import { ExternalLink, FileImage, Folder, MessageSquare, MessageSquareOff, Plus, X } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { LANGS, type Lang } from '../lib/i18n';
import { Dropdown } from './contentBuilder/Dropdown';
import { tr } from './contentBuilder/i18n';
import { DEFS, STATS, type Def, type Field, type StatRow, type Values } from './contentBuilder/defs';
import { stripCSharpComments } from './contentBuilder/stripComments';

interface Strings {
  type: string;
  ns: string;
  name: string;
  desc: string;
  localeFile: string;
  stat: string;
  addStat: string;
  code: string;
  text: string;
  art: string;
  noArt: string;
  folder: string;
  file: string;
  main: string;
  mainHint: string;
  notes: string;
  page: string;
  noText: string;
  search: string;
  removeComments: string;
  noComments: string;
}

const T: Record<Lang, Strings> = {
  en: {
    type: 'What do you want to make?', ns: 'Your mod namespace', name: 'Name (what players read)', desc: 'Description',
    localeFile: 'Language of this text', stat: 'stat', addStat: 'Add a stat', code: 'The code', text: 'The text',
    art: 'Where your art goes', noArt: 'Nothing to draw for this one.', folder: 'folder', file: 'file',
    main: 'Add to Main.cs', mainHint: 'Inside OnModLoad(), in the order your content depends on each other.',
    notes: 'Good to know', page: 'Full explanation', noText: 'This one has no text of its own.', search: 'Search...',
    removeComments: 'Remove comments', noComments: 'Comments hidden',
  },
  it: {
    type: 'Cosa vuoi creare?', ns: 'Namespace della tua mod', name: 'Nome (quello che legge il giocatore)', desc: 'Descrizione',
    localeFile: 'Lingua di questo testo', stat: 'statistica', addStat: 'Aggiungi una statistica', code: 'Il codice', text: 'Il testo',
    art: 'Dove va la grafica', noArt: 'Qui non c\'è niente da disegnare.', folder: 'cartella', file: 'file',
    main: 'Da aggiungere a Main.cs', mainHint: 'Dentro OnModLoad(), nell\'ordine in cui i contenuti dipendono l\'uno dall\'altro.',
    notes: 'Da sapere', page: 'Spiegazione completa', noText: 'Questo contenuto non ha un testo suo.', search: 'Cerca...',
    removeComments: 'Togli commenti', noComments: 'Senza commenti',
  },
  es: {
    type: '¿Qué quieres crear?', ns: 'Namespace de tu mod', name: 'Nombre (lo que lee el jugador)', desc: 'Descripción',
    localeFile: 'Idioma de este texto', stat: 'estadística', addStat: 'Añadir una estadística', code: 'El código', text: 'El texto',
    art: 'Dónde va tu arte', noArt: 'Aquí no hay nada que dibujar.', folder: 'carpeta', file: 'archivo',
    main: 'Añadir a Main.cs', mainHint: 'Dentro de OnModLoad(), en el orden en que tu contenido depende de sí mismo.',
    notes: 'Conviene saber', page: 'Explicación completa', noText: 'Este no tiene texto propio.', search: 'Buscar...',
    removeComments: 'Quitar comentarios', noComments: 'Sin comentarios',
  },
  pt: {
    type: 'O que você quer criar?', ns: 'Namespace do seu mod', name: 'Nome (o que o jogador lê)', desc: 'Descrição',
    localeFile: 'Idioma deste texto', stat: 'atributo', addStat: 'Adicionar um atributo', code: 'O código', text: 'O texto',
    art: 'Onde fica a sua arte', noArt: 'Nada para desenhar neste.', folder: 'pasta', file: 'arquivo',
    main: 'Adicionar ao Main.cs', mainHint: 'Dentro de OnModLoad(), na ordem em que o conteúdo depende um do outro.',
    notes: 'Bom saber', page: 'Explicação completa', noText: 'Este não tem texto próprio.', search: 'Buscar...',
    removeComments: 'Remover comentários', noComments: 'Sem comentários',
  },
  de: {
    type: 'Was willst du bauen?', ns: 'Namespace deiner Mod', name: 'Name (was Spieler lesen)', desc: 'Beschreibung',
    localeFile: 'Sprache dieses Texts', stat: 'Wert', addStat: 'Wert hinzufügen', code: 'Der Code', text: 'Der Text',
    art: 'Wohin deine Grafiken gehören', noArt: 'Hier gibt es nichts zu zeichnen.', folder: 'Ordner', file: 'Datei',
    main: 'In Main.cs einfügen', mainHint: 'In OnModLoad(), in der Reihenfolge, in der deine Inhalte voneinander abhängen.',
    notes: 'Gut zu wissen', page: 'Ganze Erklärung', noText: 'Das hier hat keinen eigenen Text.', search: 'Suchen...',
    removeComments: 'Kommentare entfernen', noComments: 'Ohne Kommentare',
  },
  fr: {
    type: 'Que voulez-vous créer ?', ns: 'Namespace de votre mod', name: 'Nom (ce que lit le joueur)', desc: 'Description',
    localeFile: 'Langue de ce texte', stat: 'statistique', addStat: 'Ajouter une statistique', code: 'Le code', text: 'Le texte',
    art: 'Où vont vos images', noArt: 'Rien à dessiner pour celui-ci.', folder: 'dossier', file: 'fichier',
    main: 'À ajouter dans Main.cs', mainHint: 'Dans OnModLoad(), dans l\'ordre où votre contenu dépend de lui-même.',
    notes: 'Bon à savoir', page: 'Explication complète', noText: 'Celui-ci n\'a pas de texte à lui.', search: 'Rechercher...',
    removeComments: 'Supprimer les commentaires', noComments: 'Sans commentaires',
  },
  ru: {
    type: 'Что вы хотите создать?', ns: 'Namespace вашего мода', name: 'Название (то, что видит игрок)', desc: 'Описание',
    localeFile: 'Язык этого текста', stat: 'характеристика', addStat: 'Добавить характеристику', code: 'Код', text: 'Текст',
    art: 'Куда класть графику', noArt: 'Здесь рисовать нечего.', folder: 'папка', file: 'файл',
    main: 'Добавить в Main.cs', mainHint: 'Внутри OnModLoad(), в том порядке, в котором контент зависит друг от друга.',
    notes: 'Полезно знать', page: 'Полное объяснение', noText: 'У этого нет собственного текста.', search: 'Поиск...',
    removeComments: 'Убрать комментарии', noComments: 'Без комментариев',
  },
  zh: {
    type: '你想做什么？', ns: '你的 mod 命名空间', name: '名称（玩家看到的）', desc: '描述',
    localeFile: '这段文字的语言', stat: '属性', addStat: '添加属性', code: '代码', text: '文本',
    art: '美术资源放在哪里', noArt: '这个不需要画图。', folder: '文件夹', file: '文件',
    main: '添加到 Main.cs', mainHint: '放在 OnModLoad() 里，按内容之间的依赖顺序排列。',
    notes: '须知', page: '完整说明', noText: '这个没有自己的文本。', search: '搜索...',
    removeComments: '移除注释', noComments: '无注释',
  },
  ja: {
    type: '何を作りますか？', ns: 'modの名前空間', name: '名前（プレイヤーが読むもの）', desc: '説明',
    localeFile: 'このテキストの言語', stat: 'ステータス', addStat: 'ステータスを追加', code: 'コード', text: 'テキスト',
    art: '画像の置き場所', noArt: 'これには描くものがありません。', folder: 'フォルダ', file: 'ファイル',
    main: 'Main.cs に追加', mainHint: 'OnModLoad() の中に、コンテンツ同士の依存順で並べます。',
    notes: '知っておくこと', page: '詳しい説明', noText: 'これには独自のテキストがありません。', search: '検索...',
    removeComments: 'コメントを削除', noComments: 'コメントなし',
  },
  ko: {
    type: '무엇을 만들까요?', ns: '모드 네임스페이스', name: '이름 (플레이어가 읽는 것)', desc: '설명',
    localeFile: '이 텍스트의 언어', stat: '능력치', addStat: '능력치 추가', code: '코드', text: '텍스트',
    art: '그림 파일 위치', noArt: '이건 그릴 것이 없습니다.', folder: '폴더', file: '파일',
    main: 'Main.cs에 추가', mainHint: 'OnModLoad() 안에, 콘텐츠끼리 의존하는 순서대로 넣으세요.',
    notes: '알아 둘 것', page: '자세한 설명', noText: '이건 자체 텍스트가 없습니다.', search: '검색...',
    removeComments: '주석 제거', noComments: '주석 없음',
  },
};

const input =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-faint';
/** Field labels are C# names, so they keep their exact spelling. */
const fieldCls = 'mb-1 block font-mono text-xs text-faint';

const defaults = (def: Def): Values => {
  const v: Values = { name: '', desc: '' };
  for (const fl of def.fields) v[fl.key] = Array.isArray(fl.def) ? [] : fl.def;
  return v;
};

function FieldInput({ field, value, onChange, t, lang }: {
  field: Field;
  lang: Lang;
  value: Values[string];
  onChange: (x: Values[string]) => void;
  t: Strings;
}) {
  switch (field.kind) {
    case 'bool':
      return (
        <label className="flex items-center gap-2 text-sm cursor-pointer sm:col-span-2">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span className="font-mono text-xs">{tr(lang, field.label)}</span>
        </label>
      );
    case 'num':
      return (
        <label>
          <span className={fieldCls}>{tr(lang, field.label)}</span>
          <input type="number" step="any" value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} className={input} />
        </label>
      );
    case 'color':
      return (
        <label>
          <span className={fieldCls}>{tr(lang, field.label)}</span>
          <div className="flex gap-2">
            <input type="color" value={String(value)} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-9 w-12 cursor-pointer rounded border border-line bg-surface" />
            <input value={String(value)} onChange={(e) => onChange(e.target.value)} className={input} />
          </div>
        </label>
      );
    case 'select':
      return (
        <div>
          <span className={fieldCls}>{tr(lang, field.label)}</span>
          <Dropdown
            value={String(value)}
            options={(field.options ?? []).map((o) => ({ value: o, label: tr(lang, o) }))}
            onChange={(x) => onChange(x)}
            free={field.free}
            placeholder={t.search}
          />
        </div>
      );
    case 'stats': {
      const rows = (value as StatRow[]) ?? [];
      const set = (next: StatRow[]) => onChange(next);
      return (
        <div className="sm:col-span-2">
          <span className={fieldCls}>{tr(lang, field.label)}</span>
          <div className="flex flex-col gap-2">
            {rows.map((r, idx) => (
              <div key={idx} className="flex gap-2">
                <Dropdown
                  className="flex-1"
                  value={r.stat}
                  options={STATS.map((st) => ({ value: st }))}
                  onChange={(x) => set(rows.map((y, j) => (j === idx ? { ...y, stat: x } : y)))}
                  placeholder={t.search}
                />
                <input
                  type="number"
                  step="any"
                  value={r.value}
                  onChange={(e) => set(rows.map((x, j) => (j === idx ? { ...x, value: Number(e.target.value) } : x)))}
                  className="w-28 shrink-0 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <button type="button" onClick={() => set(rows.filter((_, j) => j !== idx))} className="shrink-0 rounded-md border border-line px-2 text-faint hover:text-brand cursor-pointer" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => set([...rows, { stat: 'damage', value: 5 }])} className="flex w-fit items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm hover:border-brand hover:text-brand cursor-pointer">
              <Plus className="h-4 w-4" /> {t.addStat}
            </button>
          </div>
        </div>
      );
    }
    default:
      return (
        <label>
          <span className={fieldCls}>{tr(lang, field.label)}</span>
          <input value={String(value)} onChange={(e) => onChange(e.target.value)} className={input} />
        </label>
      );
  }
}

/** Pick a content type, fill a form, get the code, the text and where the art goes. */
export function ContentBuilder({ language }: { language: Lang }) {
  const t = T[language] ?? T.en;
  const [key, setKey] = useState(DEFS[0].key);
  const [ns, setNs] = useState('MyMod');
  const [localeLang, setLocaleLang] = useState<Lang>(language);
  const [values, setValues] = useState<Record<string, Values>>({});
  const [noComments, setNoComments] = useState(false);

  const def = DEFS.find((d) => d.key === key) ?? DEFS[0];
  const v = values[def.key] ?? defaults(def);
  const set = (k: string, x: Values[string]) => setValues((all) => ({ ...all, [def.key]: { ...v, [k]: x } }));

  const namespace = ns.trim().replace(/[^A-Za-z0-9_.]/g, '') || 'MyMod';
  const out = useMemo(() => def.gen(v, namespace), [def, v, namespace]);

  const codeToDisplay = useMemo(() => {
    return noComments ? stripCSharpComments(out.code) : out.code;
  }, [out.code, noComments]);

  const rawMain = useMemo(() => {
    return out.main.join('\n') + (out.mainExtra ? `\n\n// ${namespace}.Main, next to OnModLoad()\n${out.mainExtra}` : '');
  }, [out.main, out.mainExtra, namespace]);

  const mainToDisplay = useMemo(() => {
    return noComments ? stripCSharpComments(rawMain) : rawMain;
  }, [rawMain, noComments]);

  const locale = useMemo(() => {
    const entries = out.locale.map(([k, text], idx): [string, string] => {
      if (text) return [k, text];
      if (idx === 0) return [k, String(v.name || '')];
      if (idx === 1) return [k, String(v.desc || '')];
      return [k, ''];
    });
    return JSON.stringify(Object.fromEntries(entries), null, 2);
  }, [out, v]);

  return (
    <div className="my-6 rounded-xl border border-line bg-raised p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className={labelCls}>{t.type}</span>
          <Dropdown
            value={def.key}
            options={DEFS.map((d) => ({ value: d.key, label: tr(language, d.label), group: tr(language, d.cat) }))}
            onChange={setKey}
            placeholder={t.search}
          />
        </div>
        <label>
          <span className={labelCls}>{t.ns}</span>
          <input value={ns} onChange={(e) => setNs(e.target.value)} className={input} />
        </label>
      </div>

      <div className="mt-2">
        <a href={`#/${def.page}`} className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
          {t.page} <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        {def.text !== 'none' && (
          <>
            <label>
              <span className={labelCls}>{t.name}</span>
              <input value={String(v.name)} onChange={(e) => set('name', e.target.value)} className={input} />
            </label>
            <div>
              <span className={labelCls}>{t.localeFile}</span>
              <Dropdown
                value={localeLang}
                options={LANGS.map((l) => ({ value: l }))}
                onChange={(x) => setLocaleLang(x as Lang)}
              />
            </div>
            {def.text === 'both' && (
              <label className="sm:col-span-2">
                <span className={labelCls}>{t.desc}</span>
                <input value={String(v.desc)} onChange={(e) => set('desc', e.target.value)} className={input} />
              </label>
            )}
          </>
        )}
        {def.fields.map((fl) => (
          <FieldInput key={fl.key} field={fl} value={v[fl.key]} onChange={(x) => set(fl.key, x)} t={t} lang={language} />
        ))}
      </div>

      <div className="mt-6 mb-1 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{t.code}</h4>
        <button
          type="button"
          onClick={() => setNoComments((s) => !s)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
            noComments
              ? 'border-brand bg-brand-soft text-brand shadow-xs'
              : 'border-line bg-surface text-muted hover:text-fg hover:border-line/80'
          }`}
          title={noComments ? t.noComments : t.removeComments}
        >
          {noComments ? <MessageSquareOff className="w-3.5 h-3.5 text-brand" /> : <MessageSquare className="w-3.5 h-3.5" />}
          <span>{noComments ? t.noComments : t.removeComments}</span>
        </button>
      </div>
      <CodeBlock initialCode={codeToDisplay} language="csharp" filename={`Mods/${namespace}/${out.file}`} />

      <h4 className="mt-6 mb-1 text-sm font-semibold">{t.text}</h4>
      {out.locale.length ? (
        <CodeBlock initialCode={locale} language="json" filename={`Mods/${namespace}/Locales/${localeLang}.json`} />
      ) : (
        <p className="text-sm text-faint">{t.noText}</p>
      )}

      <h4 className="mt-6 mb-2 text-sm font-semibold">{t.art}</h4>
      {out.art.length ? (
        <ul className="flex flex-col gap-1.5">
          {out.art.map((a) => (
            <li key={a.path} className="flex items-start gap-2 text-sm">
              {a.folder ? <Folder className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> : <FileImage className="mt-0.5 h-4 w-4 shrink-0 text-brand" />}
              <span>
                <code className="break-all">Mods/{namespace}/{a.path}</code>
                <span className="text-faint"> ({a.folder ? t.folder : t.file}: {tr(language, a.what)})</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-faint">{t.noArt}</p>
      )}

      <h4 className="mt-6 mb-1 text-sm font-semibold">{t.main}</h4>
      <p className="mb-1 text-xs text-faint">{t.mainHint}</p>
      <CodeBlock
        initialCode={mainToDisplay}
        language="csharp"
        filename={`Mods/${namespace}/Code/Main.cs`}
      />

      {out.notes.length > 0 && (
        <>
          <h4 className="mt-6 mb-1 text-sm font-semibold">{t.notes}</h4>
          <ul className="list-disc pl-5 text-sm text-muted">
            {out.notes.map((n) => <li key={n}>{tr(language, n)}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
