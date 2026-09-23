import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, Search, Zap } from 'lucide-react';
import { buildIndex, searchWithPins, type Indexed } from '../lib/naturalSearch.ts';
import type { Language } from '../types/index.ts';

export interface Method {
  c: string;
  n: string;
  r: string;
  p: string;
  v: 'public' | 'internal';
}

interface ParsedParam {
  type: string;
  name: string;
  defaultValue?: string;
}

const boost = (m: Method) => (m.v === 'public' ? 1.25 : 1);
const keyOf = (m: Method) => `${m.c}.${m.n}`;

function parseParams(paramStr: string): ParsedParam[] {
  if (!paramStr || !paramStr.trim()) return [];
  const parts = paramStr.split(',').map((s) => s.trim()).filter(Boolean);
  const result: ParsedParam[] = [];

  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    let decl = eqIdx !== -1 ? part.slice(0, eqIdx).trim() : part;
    const defaultValue = eqIdx !== -1 ? part.slice(eqIdx + 1).trim() : undefined;

    const tokens = decl.split(/\s+/);
    if (tokens.length >= 2) {
      const name = tokens[tokens.length - 1];
      const type = tokens.slice(0, tokens.length - 1).join(' ');
      result.push({ type, name, defaultValue });
    } else if (tokens.length === 1) {
      result.push({ type: tokens[0], name: `p${tokens[0]}`, defaultValue });
    }
  }
  return result;
}

function mapTypeNameToCsharpTypeof(typeStr: string): string {
  const clean = typeStr.replace(/\s+/g, ' ').replace(/\b(ref|out|in|params)\s+/g, '').trim();
  switch (clean) {
    case 'int': return 'typeof(int)';
    case 'float': return 'typeof(float)';
    case 'double': return 'typeof(double)';
    case 'bool': return 'typeof(bool)';
    case 'string': return 'typeof(string)';
    case 'long': return 'typeof(long)';
    case 'byte': return 'typeof(byte)';
    case 'short': return 'typeof(short)';
    case 'uint': return 'typeof(uint)';
    case 'ulong': return 'typeof(ulong)';
    case 'char': return 'typeof(char)';
    case 'object': return 'typeof(object)';
    case 'void': return 'typeof(void)';
    default: return `typeof(${clean})`;
  }
}

const I18N: Record<
  string,
  {
    title: string;
    methodsCount: (n: number) => string;
    searchPlaceholder: string;
    loading: string;
    emptyPrompt: string;
    target: string;
    prefix: string;
    postfix: string;
    both: string;
    cancelWarning: string;
    params: string;
    internalWarn: string;
    workerWarn: string;
    polymorphicWarn: string;
    overloadWarn: string;
    copy: string;
    copied: string;
  }
> = {
  en: {
    title: 'Harmony patch builder',
    methodsCount: (n) => `${n.toLocaleString()} methods`,
    searchPlaceholder: 'Search class or method (e.g. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Loading methods...',
    emptyPrompt: 'Search and pick a method above.',
    target: 'Target:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Both',
    cancelWarning: '(can cancel)',
    params: 'Params:',
    internalWarn: 'Requires a publicized Assembly-CSharp.dll or patch with string literal.',
    workerWarn: 'Runs in parallel. Touch only instance data, do not call Unity GameObject or UI methods directly.',
    polymorphicWarn: 'Also exists or overridden across simulation classes (BaseSimObject, Actor, Building).',
    overloadWarn: 'Explicit parameter types Type[] included in the patch attribute.',
    copy: 'Copy',
    copied: 'Copied',
  },
  it: {
    title: 'Generatore patch Harmony',
    methodsCount: (n) => `${n.toLocaleString()} metodi`,
    searchPlaceholder: 'Cerca classe o metodo (es. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Caricamento metodi in corso...',
    emptyPrompt: 'Cerca e seleziona un metodo in alto.',
    target: 'Bersaglio:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Entrambi',
    cancelWarning: '(può annullare)',
    params: 'Parametri:',
    internalWarn: 'Richiede una DLL Assembly-CSharp pubblicizzata o patch con stringa letterale.',
    workerWarn: 'Eseguito in parallelo su worker thread: modifica solo dati locali dell\'unità.',
    polymorphicWarn: 'Presente o sovrascritto nelle classi di simulazione (BaseSimObject, Actor, Building).',
    overloadWarn: 'Array di tipi Type[] incluso nell\'attributo per risolvere l\'overload.',
    copy: 'Copia',
    copied: 'Copiato',
  },
  de: {
    title: 'Harmony-Patch-Generator',
    methodsCount: (n) => `${n.toLocaleString()} Methoden`,
    searchPlaceholder: 'Klasse oder Methode suchen (z. B. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Methoden werden geladen...',
    emptyPrompt: 'Oben suchen und eine Methode auswählen.',
    target: 'Ziel:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Beide',
    cancelWarning: '(kann abbrechen)',
    params: 'Parameter:',
    internalWarn: 'Erfordert eine publicized Assembly-CSharp.dll oder String-Literal im Patch.',
    workerWarn: 'Läuft parallel auf Worker-Threads: Nur Instanzdaten bearbeiten, keine Unity-UI.',
    polymorphicWarn: 'Existiert oder überschrieben in Simulationsklassen (BaseSimObject, Actor, Building).',
    overloadWarn: 'Explizite Parametertypen Type[] im Patch-Attribut für Overloads enthalten.',
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
  es: {
    title: 'Generador de parches Harmony',
    methodsCount: (n) => `${n.toLocaleString()} métodos`,
    searchPlaceholder: 'Buscar clase o método (ej. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Cargando métodos...',
    emptyPrompt: 'Busca y selecciona un método arriba.',
    target: 'Objetivo:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Ambos',
    cancelWarning: '(puede cancelar)',
    params: 'Parámetros:',
    internalWarn: 'Requiere una Assembly-CSharp.dll publicitada o parche con cadena literal.',
    workerWarn: 'Se ejecuta en hilos de trabajo paralelos: modifica solo datos de la instancia.',
    polymorphicWarn: 'Existe o se sobrescribe en clases de simulación (BaseSimObject, Actor, Building).',
    overloadWarn: 'Tipos explícitos Type[] incluidos en el atributo para sobrecargas.',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  fr: {
    title: 'Générateur de patchs Harmony',
    methodsCount: (n) => `${n.toLocaleString()} méthodes`,
    searchPlaceholder: 'Rechercher une classe ou méthode (ex. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Chargement des méthodes...',
    emptyPrompt: 'Recherchez et sélectionnez une méthode ci-dessus.',
    target: 'Cible :',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Les deux',
    cancelWarning: '(peut annuler)',
    params: 'Paramètres :',
    internalWarn: 'Nécessite une Assembly-CSharp.dll publicisée ou un patch avec nom littéral.',
    workerWarn: 'S\'exécute en parallèle : touchez uniquement aux données locales de l\'unité.',
    polymorphicWarn: 'Existe ou surchargé dans les classes de simulation (BaseSimObject, Actor, Building).',
    overloadWarn: 'Types explicites Type[] inclus dans l\'attribut de patch pour les surcharges.',
    copy: 'Copier',
    copied: 'Copié',
  },
  ja: {
    title: 'Harmony パッチビルダー',
    methodsCount: (n) => `${n.toLocaleString()} 個のメソッド`,
    searchPlaceholder: 'クラスやメソッド名で検索（例: Actor.getHit, updateStats, makeWarrior）...',
    loading: 'メソッドを読み込み中...',
    emptyPrompt: '上の検索欄からメソッドを選択してください。',
    target: '対象:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: '両方',
    cancelWarning: '（処理を中断可能）',
    params: '引数:',
    internalWarn: 'Publicized された Assembly-CSharp.dll または文字列でのパッチ指定が必要です。',
    workerWarn: '並列スレッドで実行されます。インスタンスの数値のみ変更し、Unity API呼び出しは避けてください。',
    polymorphicWarn: 'シミュレーション基本クラス（BaseSimObject, Actor, Building）でオーバーライドされています。',
    overloadWarn: 'オーバーロードを解決するため、Type[] 配列がパッチ属性に含まれています。',
    copy: 'コピー',
    copied: 'コピー完了',
  },
  ko: {
    title: 'Harmony 패치 빌더',
    methodsCount: (n) => `${n.toLocaleString()}개 메서드`,
    searchPlaceholder: '클래스 또는 메서드 검색 (예: Actor.getHit, updateStats, makeWarrior)...',
    loading: '메서드 목록 불러오는 중...',
    emptyPrompt: '위 검색창에서 메서드를 선택하세요.',
    target: '대상:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: '모두',
    cancelWarning: '(원래 메서드 취소 가능)',
    params: '매개변수:',
    internalWarn: 'Publicized 된 Assembly-CSharp.dll 또는 문자열 리터럴 패치가 필요합니다.',
    workerWarn: '병렬 워커 스레드에서 실행됩니다. 인스턴스 로컬 데이터만 수정하고 Unity API 호출을 피하세요.',
    polymorphicWarn: '시뮬레이션 기본 클래스(BaseSimObject, Actor, Building) 전반에 걸쳐 오버라이드되어 있습니다.',
    overloadWarn: '오버로드 구분을 위해 명시적 Type[] 배열이 패치 속성에 포함되었습니다.',
    copy: '복사',
    copied: '복사됨',
  },
  pt: {
    title: 'Gerador de patches Harmony',
    methodsCount: (n) => `${n.toLocaleString()} métodos`,
    searchPlaceholder: 'Buscar classe ou método (ex. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Carregando métodos...',
    emptyPrompt: 'Pesquise e selecione um método acima.',
    target: 'Alvo:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Ambos',
    cancelWarning: '(pode cancelar)',
    params: 'Parâmetros:',
    internalWarn: 'Requer uma Assembly-CSharp.dll publicitada ou patch com literal de string.',
    workerWarn: 'Executa em threads de trabalho paralelas: altere apenas dados locais da unidade.',
    polymorphicWarn: 'Existe ou foi sobrescrito nas classes de simulação (BaseSimObject, Actor, Building).',
    overloadWarn: 'Tipos explícitos Type[] incluídos no atributo de patch para sobrecargas.',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  ru: {
    title: 'Генератор патчей Harmony',
    methodsCount: (n) => `${n.toLocaleString()} методов`,
    searchPlaceholder: 'Поиск по классу или методу (напр. Actor.getHit, updateStats, makeWarrior)...',
    loading: 'Загрузка методов...',
    emptyPrompt: 'Найдите и выберите метод в поиске выше.',
    target: 'Цель:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: 'Оба',
    cancelWarning: '(может отменить)',
    params: 'Параметры:',
    internalWarn: 'Требуется publicized Assembly-CSharp.dll или строковый литерал в атрибуте.',
    workerWarn: 'Работает параллельно в потоках: меняйте только локальные данные экземпляра.',
    polymorphicWarn: 'Переопределен в классах симуляции (BaseSimObject, Actor, Building).',
    overloadWarn: 'Для разрешения перегрузок в атрибут добавлен массив Type[].',
    copy: 'Копировать',
    copied: 'Скопировано',
  },
  zh: {
    title: 'Harmony 补丁生成器',
    methodsCount: (n) => `${n.toLocaleString()} 个方法`,
    searchPlaceholder: '搜索类名或方法（例如 Actor.getHit, updateStats, makeWarrior）...',
    loading: '正在加载方法列表...',
    emptyPrompt: '请在上方搜索并选择一个方法。',
    target: '目标:',
    prefix: 'Prefix',
    postfix: 'Postfix',
    both: '两者均生成',
    cancelWarning: '（可拦截原方法）',
    params: '参数:',
    internalWarn: '需要 Publicized 的 Assembly-CSharp.dll 或使用字符串字面量打补丁。',
    workerWarn: '在并行工作线程中执行：仅可修改实例本地数值，切勿直接调用 Unity API。',
    polymorphicWarn: '在仿真基础类（BaseSimObject, Actor, Building）中均存在重写实现。',
    overloadWarn: '已在补丁特性中自动注入显式 Type[] 类型数组以精准匹配重载。',
    copy: '复制',
    copied: '已复制',
  },
};

export const HarmonyPatchBuilder: React.FC<{ language: Language }> = ({ language }) => {
  const t = I18N[language] ?? I18N.en;
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [query, setQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [patchType, setPatchType] = useState<'prefix' | 'postfix' | 'both'>('postfix');
  const [includeInstance, setIncludeInstance] = useState(true);
  const [includeResult, setIncludeResult] = useState(true);
  const [prefixReturnsBool, setPrefixReturnsBool] = useState(true);
  const [selectedParamNames, setSelectedParamNames] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let live = true;
    import('../data/methods.json').then((mod) => {
      if (live) {
        const list = mod.default as Method[];
        setMethods(list);
        const found = list.find((m) => m.c === 'Actor' && m.n === 'getHit') || list[0];
        if (found) {
          setSelectedMethod(found);
        }
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const index: Array<Indexed<Method>> = useMemo(
    () => (methods ? buildIndex(methods, (m) => `${m.n} ${m.c}`, (m) => `${m.c} ${m.p} ${m.r}`) : []),
    [methods],
  );

  const searchResults = useMemo(
    () => (methods && deferredQuery.trim() ? searchWithPins(deferredQuery, index, methods, keyOf, 50, boost) : []),
    [deferredQuery, index, methods],
  );

  const parsedParams = useMemo(
    () => (selectedMethod ? parseParams(selectedMethod.p) : []),
    [selectedMethod],
  );

  useEffect(() => {
    if (selectedMethod) {
      const initial: Record<string, boolean> = {};
      for (const p of parsedParams) {
        initial[p.name] = true;
      }
      setSelectedParamNames(initial);
    }
  }, [selectedMethod, parsedParams]);

  const hasOverloads = useMemo(() => {
    if (!methods || !selectedMethod) return false;
    const sameName = methods.filter((m) => m.c === selectedMethod.c && m.n === selectedMethod.n);
    return sameName.length > 1;
  }, [methods, selectedMethod]);

  const isParallelJob = useMemo(() => {
    if (!selectedMethod) return false;
    const name = selectedMethod.n.toLowerCase();
    const cls = selectedMethod.c.toLowerCase();
    return (
      name.includes('updatestats') ||
      name.includes('updateage') ||
      name.includes('job') ||
      name.includes('pathfind') ||
      name.includes('beh_') ||
      name.includes('action_') ||
      cls.includes('actorjob') ||
      cls.includes('task') ||
      cls.includes('worker')
    );
  }, [selectedMethod]);

  const isPolymorphic = useMemo(() => {
    if (!selectedMethod) return false;
    const hierarchy = ['basesimobject', 'actor', 'building', 'city', 'kingdom', 'tile'];
    return (
      hierarchy.includes(selectedMethod.c.toLowerCase()) ||
      ['gethit', 'killhimself', 'die', 'update', 'settile', 'destroy'].includes(selectedMethod.n.toLowerCase())
    );
  }, [selectedMethod]);

  const generatedCode = useMemo(() => {
    if (!selectedMethod) return '';

    const { c, n, r, v } = selectedMethod;
    const isInternal = v === 'internal';
    const hasReturn = r !== 'void';
    const chosenParams = parsedParams.filter((p) => selectedParamNames[p.name]);

    const patchClass = `Patch_${c}_${n.charAt(0).toUpperCase() + n.slice(1)}`;

    let patchAttr = '';
    if (hasOverloads) {
      const typeList = parsedParams.map((p) => mapTypeNameToCsharpTypeof(p.type)).join(', ');
      patchAttr = isInternal
        ? `[HarmonyPatch(typeof(${c}), "${n}", new System.Type[] { ${typeList} })]`
        : `[HarmonyPatch(typeof(${c}), nameof(${c}.${n}), new System.Type[] { ${typeList} })]`;
    } else {
      patchAttr = isInternal
        ? `[HarmonyPatch(typeof(${c}), "${n}")]`
        : `[HarmonyPatch(typeof(${c}), nameof(${c}.${n}))]`;
    }

    const prefixParams: string[] = [];
    const postfixParams: string[] = [];

    if (includeInstance) {
      prefixParams.push(`${c} __instance`);
      postfixParams.push(`${c} __instance`);
    }

    for (const p of chosenParams) {
      prefixParams.push(`${p.type} ${p.name}`);
      postfixParams.push(`${p.type} ${p.name}`);
    }

    if (includeResult && hasReturn) {
      postfixParams.push(`ref ${r} __result`);
    }

    const lines: string[] = [
      `using HarmonyLib;`,
      ``,
      `namespace HelloBox`,
      `{`,
      `    ${patchAttr}`,
      `    public static class ${patchClass}`,
      `    {`,
    ];

    if (patchType === 'prefix' || patchType === 'both') {
      const returnType = prefixReturnsBool ? 'bool' : 'void';
      const sig = `        public static ${returnType} Prefix(${prefixParams.join(', ')})`;
      lines.push(sig);
      lines.push(`        {`);
      if (includeInstance) {
        lines.push(`            if (__instance == null) return${prefixReturnsBool ? ' true' : ''};`);
        lines.push(``);
      }
      lines.push(`            // Prefix logic runs before original code`);
      if (isParallelJob) {
        lines.push(`            // Runs in worker thread: touch only unit data, avoid Unity API`);
      }
      if (prefixReturnsBool) {
        lines.push(`            return true; // return false to cancel original method`);
      }
      lines.push(`        }`);
    }

    if (patchType === 'both') {
      lines.push(``);
    }

    if (patchType === 'postfix' || patchType === 'both') {
      const sig = `        public static void Postfix(${postfixParams.join(', ')})`;
      lines.push(sig);
      lines.push(`        {`);
      if (includeInstance) {
        lines.push(`            if (__instance == null) return;`);
        lines.push(``);
      }
      lines.push(`            // Postfix logic runs after original code`);
      if (includeResult && hasReturn) {
        lines.push(`            // __result can be adjusted here`);
      }
      lines.push(`        }`);
    }

    lines.push(`    }`);
    lines.push(`}`);

    return lines.join('\n');
  }, [
    selectedMethod,
    parsedParams,
    selectedParamNames,
    patchType,
    includeInstance,
    includeResult,
    prefixReturnsBool,
    hasOverloads,
    isParallelJob,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="my-6 rounded-xl border border-line bg-surface/40 overflow-hidden">
      {/* Header */}
      <div className="p-4 space-y-3 border-b border-line">
        <div className="flex items-center gap-2 text-sm font-medium text-fg">
          <Zap className="w-4 h-4 text-brand" />
          <span>{t.title}</span>
          {methods && (
            <span className="text-xs text-faint font-normal">
              {t.methodsCount(methods.length)}
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-line bg-bg text-sm text-fg placeholder:text-faint outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 transition-all"
          />
        </div>

        {/* Method search list if typing */}
        {searchResults.length > 0 && (
          <ul className="divide-y divide-line/60 max-h-48 overflow-y-auto rounded-lg border border-line bg-surface/70">
            {searchResults.map((m, idx) => (
              <li key={`${keyOf(m)}-${idx}`}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod(m);
                    setQuery('');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-surface transition-colors cursor-pointer text-xs ${
                    selectedMethod === m ? 'bg-brand/10 text-brand' : 'text-fg'
                  }`}
                >
                  <div className="font-mono truncate">
                    <span className="text-faint">{m.c}.</span>
                    <span className="text-brand font-medium">{m.n}</span>
                    <span className="text-muted text-[11px]">({m.p})</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="font-mono text-faint text-[10px]">{m.r}</span>
                    {m.v === 'internal' && (
                      <span className="px-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[10px]">
                        internal
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!methods ? (
        <p className="p-6 text-center text-xs text-faint flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t.loading}
        </p>
      ) : !selectedMethod ? (
        <p className="p-6 text-center text-xs text-faint">
          {t.emptyPrompt}
        </p>
      ) : (
        <div className="divide-y divide-line/60">
          {/* Active target banner */}
          <div className="px-4 py-3 bg-surface/20 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="text-faint">{t.target}</span>
              <span className="text-brand font-medium">{selectedMethod.c}.{selectedMethod.n}</span>
              <span className="text-muted text-[11px]">({selectedMethod.p})</span>
              <span className="text-faint text-[11px]">→ {selectedMethod.r}</span>
              {selectedMethod.v === 'internal' && (
                <span className="px-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[10px]">
                  internal
                </span>
              )}
            </div>

            {/* Patch Type switch */}
            <div className="flex items-center gap-1 bg-surface rounded-md border border-line p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPatchType('prefix')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  patchType === 'prefix' ? 'bg-brand text-white font-medium' : 'text-muted hover:text-fg'
                }`}
              >
                {t.prefix}
              </button>
              <button
                type="button"
                onClick={() => setPatchType('postfix')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  patchType === 'postfix' ? 'bg-brand text-white font-medium' : 'text-muted hover:text-fg'
                }`}
              >
                {t.postfix}
              </button>
              <button
                type="button"
                onClick={() => setPatchType('both')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  patchType === 'both' ? 'bg-brand text-white font-medium' : 'text-muted hover:text-fg'
                }`}
              >
                {t.both}
              </button>
            </div>
          </div>

          {/* Options toolbar */}
          <div className="px-4 py-2.5 bg-surface/10 flex items-center gap-4 flex-wrap text-xs text-muted">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeInstance}
                onChange={(e) => setIncludeInstance(e.target.checked)}
              />
              <span><code>__instance</code></span>
            </label>

            {selectedMethod.r !== 'void' && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeResult}
                  onChange={(e) => setIncludeResult(e.target.checked)}
                />
                <span><code>ref __result</code></span>
              </label>
            )}

            {(patchType === 'prefix' || patchType === 'both') && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefixReturnsBool}
                  onChange={(e) => setPrefixReturnsBool(e.target.checked)}
                />
                <span><code>bool Prefix</code> {t.cancelWarning}</span>
              </label>
            )}

            {parsedParams.length > 0 && (
              <div className="flex items-center gap-2 pl-2 border-l border-line/60">
                <span className="text-faint text-[11px]">{t.params}</span>
                {parsedParams.map((p) => (
                  <label key={p.name} className="flex items-center gap-1 cursor-pointer select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={!!selectedParamNames[p.name]}
                      onChange={(e) =>
                        setSelectedParamNames((cur) => ({ ...cur, [p.name]: e.target.checked }))
                      }
                    />
                    <code className="text-fg">{p.name}</code>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Warnings (if any) */}
          {(selectedMethod.v === 'internal' || isParallelJob || isPolymorphic || hasOverloads) && (
            <div className="px-4 py-2 bg-surface/30 space-y-1 text-xs text-faint">
              {selectedMethod.v === 'internal' && (
                <p>
                  <span className="text-amber-500 font-medium">Internal:</span> {t.internalWarn}
                </p>
              )}
              {isParallelJob && (
                <p>
                  <span className="text-amber-500 font-medium">Worker thread:</span> {t.workerWarn}
                </p>
              )}
              {isPolymorphic && (
                <p>
                  <span className="text-muted font-medium">Polymorphic:</span> {t.polymorphicWarn}
                </p>
              )}
              {hasOverloads && (
                <p>
                  <span className="text-muted font-medium">Overloads:</span> {t.overloadWarn}
                </p>
              )}
            </div>
          )}

          {/* Code Output block */}
          <div className="bg-bg">
            <div className="px-4 py-2 border-b border-line/60 flex items-center justify-between text-xs font-mono text-faint">
              <span>Mods/HelloBox/Code/Patch_{selectedMethod.c}_{selectedMethod.n.charAt(0).toUpperCase() + selectedMethod.n.slice(1)}.cs</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-muted hover:text-fg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copy}</span>
              </button>
            </div>
            <pre className="p-4 font-mono text-xs leading-relaxed text-fg overflow-x-auto select-text whitespace-pre">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
