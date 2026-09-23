import { useMemo, useState } from 'react';
import { Check, Copy, Search } from 'lucide-react';
import rawAssets from '../data/assetFields.json';
import type { Lang } from '../lib/i18n';

interface Field {
  /** Type, e.g. `int`, `string`, `List<string>`. */
  t: string;
  /** Field name. */
  n: string;
  /** Default value as written in the game code, when it has one. */
  d?: string;
  /** Base class this field is inherited from, absent when the asset declares it itself. */
  from?: string;
}

interface AssetEntry {
  c: string;
  chain: string[];
  fields: Field[];
}

const ASSETS = rawAssets as AssetEntry[];

/** What each asset class is for, so the picker is readable by someone who is new. */
const ABOUT: Record<string, string> = {
  ActorTrait: 'Unit traits',
  ItemAsset: 'Weapons, armour, materials, modifiers',
  StatusAsset: 'Temporary status effects',
  GodPower: 'Powers in the bottom bar',
  BuildingAsset: 'Buildings, trees, minerals',
  ActorAsset: 'Creatures and races',
  DropAsset: 'Things that fall from the sky',
  DisasterAsset: 'World disasters',
  WorldLawAsset: 'Switches in the World Laws window',
  SpellAsset: 'Spells units cast',
  ProjectileAsset: 'Arrows and other flying things',
  SubspeciesTrait: 'Subspecies mutations',
  CultureTrait: 'Culture traits',
  KingdomTrait: 'Kingdom traits',
  ClanTrait: 'Clan traits',
  ReligionTrait: 'Religion traits',
  BehaviourTaskActor: 'AI tasks',
  ActorJob: 'AI jobs',
  TileType: 'Terrain tiles',
  ResourceAsset: 'Resources cities gather',
  CloudAsset: 'Clouds',
  TopTileType: 'Tiles drawn on top of terrain',
};

const T = {
  en: {
    pick: 'Asset type',
    filter: 'Filter fields by name or type...',
    inherited: 'inherited from',
    own: 'own fields',
    none: 'No field matches.',
    count: (n: number) => `${n} fields`,
    copied: 'Copied',
    hint: 'Generated from the decompiled game. If a field is not in this list, it does not exist.',
  },
  it: {
    pick: 'Tipo di asset',
    filter: 'Filtra per nome o tipo...',
    inherited: 'ereditato da',
    own: 'campi propri',
    none: 'Nessun campo corrisponde.',
    count: (n: number) => `${n} campi`,
    copied: 'Copiato',
    hint: 'Generato dal codice decompilato del gioco. Se un campo non è in questa lista, non esiste.',
  },
} as const;

/** Browser for the real fields of every asset class a mod can create. */
export function AssetFields({ language }: { language: Lang }) {
  const t = language === 'it' ? T.it : T.en;
  const [asset, setAsset] = useState(ASSETS[0]?.c ?? '');
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState('');

  const entry = ASSETS.find((a) => a.c === asset);

  const fields = useMemo(() => {
    if (!entry) return [];
    const q = query.trim().toLowerCase();
    if (!q) return entry.fields;
    return entry.fields.filter((f) => f.n.toLowerCase().includes(q) || f.t.toLowerCase().includes(q));
  }, [entry, query]);

  const copy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="my-6 rounded-xl border border-line bg-raised p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sm:w-64">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-faint">{t.pick}</span>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand cursor-pointer"
          >
            {ASSETS.map((a) => (
              <option key={a.c} value={a.c}>
                {a.c}
                {ABOUT[a.c] ? ` - ${ABOUT[a.c]}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-faint">
            {t.count(fields.length)}
          </span>
          <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 focus-within:border-brand">
            <Search className="h-4 w-4 shrink-0 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.filter}
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </div>
        </label>
      </div>

      {entry && (
        <p className="mt-3 font-mono text-xs text-faint">{entry.chain.join('  ->  ')}</p>
      )}

      <div className="mt-3 max-h-96 overflow-y-auto rounded-md border border-line">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {fields.map((f) => (
              <tr key={f.n} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="px-3 py-1.5 font-mono text-xs text-[var(--tok-type)] whitespace-nowrap">{f.t}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-fg">
                  <button
                    type="button"
                    onClick={() => copy(f.n)}
                    title="Copy"
                    className="flex items-center gap-1.5 hover:text-brand cursor-pointer"
                  >
                    {f.n}
                    {copied === f.n ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-1.5 font-mono text-xs text-muted">{f.d ? `= ${f.d}` : ''}</td>
                <td className="px-3 py-1.5 text-right text-xs text-faint whitespace-nowrap">
                  {f.from ? `${t.inherited} ${f.from}` : ''}
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-faint">{t.none}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-faint">{t.hint}</p>
    </div>
  );
}
