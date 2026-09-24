import { TEMPLATES } from './templates.ts';

// Every content type the Content builder can generate. Each generator writes the same code
// its guide page teaches, so the two never disagree: when a page changes, change it here too.

export type FieldKind = 'text' | 'num' | 'bool' | 'select' | 'color' | 'stats';

export interface Field {
  key: string;
  /** The C# field (or a short label) the value ends up in. */
  label: string;
  kind: FieldKind;
  def: string | number | boolean | StatRow[];
  options?: string[];
  /** Select that also accepts a typed value, for ids the guide cannot list completely. */
  free?: boolean;
}

export interface StatRow {
  stat: string;
  value: number;
}

export interface Art {
  /** Where the file goes, relative to the mod folder. */
  path: string;
  what: string;
  /** A folder of frames rather than one PNG. */
  folder: boolean;
}

export interface Output {
  file: string;
  code: string;
  locale: [string, string][];
  art: Art[];
  /** Lines for Main.cs. */
  main: string[];
  /** Extra Main.cs code that is not a single call, e.g. an Update method. */
  mainExtra?: string;
  notes: string[];
}

export type Values = Record<string, string | number | boolean | StatRow[]>;

export interface Def {
  key: string;
  label: string;
  cat: string;
  /** Guide page slug with the full explanation. */
  page: string;
  /** Whether the type has a player-visible name and description. */
  text: 'both' | 'name' | 'none';
  /** A guide file handed out renamed, rather than generated from a form. */
  template?: boolean;
  fields: Field[];
  gen: (v: Values, ns: string) => Output;
}

export const STATS = [
  'damage', 'damage_range', 'attack_speed', 'accuracy', 'critical_chance', 'critical_damage_multiplier',
  'armor', 'range', 'throwing_range', 'targets', 'projectiles', 'knockback', 'recoil', 'skill_combat',
  'skill_spell', 'status_chance', 'area_of_effect', 'health', 'stamina', 'mana', 'speed', 'mass', 'size',
  'scale', 'max_nutrition', 'metabolic_rate', 'construction_speed', 'experience', 'lifespan', 'maturation',
  'age_adult', 'age_breeding', 'birth_rate', 'offspring', 'mutation', 'happiness', 'diplomacy', 'warfare',
  'stewardship', 'intelligence', 'army', 'cities', 'bonus_towers', 'limit_population', 'limit_clan_members',
  'loyalty_traits', 'loyalty_mood', 'opinion', 'personality_aggression', 'personality_administration',
  'personality_diplomatic', 'personality_rationality', 'multiplier_health', 'multiplier_lifespan',
  'multiplier_stamina', 'multiplier_mana', 'multiplier_damage', 'multiplier_crit', 'multiplier_speed',
  'multiplier_attack_speed', 'multiplier_mass', 'multiplier_offspring', 'multiplier_diplomacy',
  'multiplier_supply_timer',
];

const RARITY = ['Rarity.R0_Normal', 'Rarity.R1_Rare', 'Rarity.R2_Epic', 'Rarity.R3_Legendary'];

// ------------------------------------------------------------------ helpers

export const cleanId = (s: string): string =>
  s.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'my_thing';

const pascal = (id: string): string =>
  id.split('_').filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('') || 'MyThing';

/** Class name from an id, without doubling a suffix the id already ends with. */
const named = (id: string, suffix: string): string => {
  const p = pascal(id);
  return p.endsWith(suffix) ? p : p + suffix;
};

/** A C# string literal. */
const q = (s: unknown): string => JSON.stringify(String(s ?? ''));

/** A C# float literal. */
const f = (n: unknown): string => {
  const x = Number(n) || 0;
  return `${Number.isInteger(x) ? x : x.toString()}f`;
};

const i = (n: unknown): string => String(Math.round(Number(n) || 0));
const b = (x: unknown): string => (x ? 'true' : 'false');
const s = (v: Values, k: string): string => String(v[k] ?? '').trim();
const csv = (x: string): string[] => x.split(',').map((p) => p.trim()).filter(Boolean);

const statLines = (v: Values, target: string, indent: string): string => {
  const rows = (v.stats as StatRow[] | undefined) ?? [];
  return rows
    .filter((r) => r.stat)
    .map((r) => `${indent}${target}.base_stats[${q(r.stat)}] = ${f(r.value)};`)
    .join('\n');
};

/** Wraps a body in the namespace and static class every page uses. */
const wrap = (ns: string, cls: string, body: string, usings: string[] = []): string =>
  `${usings.map((u) => `using ${u};\n`).join('')}${usings.length ? '\n' : ''}namespace ${ns}
{
    public static class ${cls}
    {
${body}
    }
}
`;

/** "ui/Icons/iconFoo" -> "GameResources/ui/Icons/iconFoo.png" */
const png = (path: string): string => `GameResources/${path.replace(/^\/+/, '')}.png`;

const idField = (def: string): Field => ({ key: 'id', label: 'id', kind: 'text', def });
const statsField: Field = { key: 'stats', label: 'base_stats', kind: 'stats', def: [] };
const iconField = (def: string): Field => ({ key: 'icon', label: 'path_icon', kind: 'text', def });

// ------------------------------------------------------------------ the seven trait systems

interface TraitKind {
  key: string;
  label: string;
  page: string;
  cls: string;
  library: string;
  prefix: string;
  groups: string[];
  group: string;
  stats: boolean;
  suffix: string;
}

const TRAIT_KINDS: TraitKind[] = [
  { key: 'actor_trait', label: 'Unit trait', page: 'nml/custom-traits', cls: 'ActorTrait', library: 'traits', prefix: 'trait', group: 'physique', stats: true, suffix: 'Trait',
    groups: ['cognitive', 'mind', 'spirit', 'physique', 'health', 'body', 'appearance', 'protection', 'skills', 'merits', 'acquired', 'fun', 'fate', 'miscellaneous', 'special'] },
  { key: 'subspecies_trait', label: 'Subspecies trait', page: 'nml/subspecies-traits', cls: 'SubspeciesTrait', library: 'subspecies_traits', prefix: 'subspecies_trait', group: 'body', stats: true, suffix: 'Subspecies',
    groups: ['body'] },
  { key: 'culture_trait', label: 'Culture trait', page: 'nml/culture-traits', cls: 'CultureTrait', library: 'culture_traits', prefix: 'culture_trait', group: 'warfare', stats: true, suffix: 'Culture',
    groups: ['harmony', 'architecture', 'town_plan', 'kingdom', 'buildings', 'succession', 'knowledge', 'warfare', 'weapons', 'craft', 'happiness', 'worldview', 'miscellaneous', 'fate', 'special'] },
  { key: 'religion_trait', label: 'Religion trait', page: 'nml/religion-traits', cls: 'ReligionTrait', library: 'religion_traits', prefix: 'religion_trait', group: 'destruction', stats: false, suffix: 'Religion',
    groups: ['harmony', 'creation', 'destruction', 'restoration', 'necromancy', 'protection', 'the_void', 'transformation', 'fate', 'special'] },
  { key: 'clan_trait', label: 'Clan trait', page: 'nml/clan-traits', cls: 'ClanTrait', library: 'clan_traits', prefix: 'clan_trait', group: 'body', stats: true, suffix: 'Clan',
    groups: ['spirit', 'mind', 'body', 'chaos', 'harmony', 'fate', 'special'] },
  { key: 'language_trait', label: 'Language trait', page: 'nml/language-traits', cls: 'LanguageTrait', library: 'language_traits', prefix: 'language_trait', group: 'knowledge', stats: true, suffix: 'Language',
    groups: ['knowledge', 'spirit', 'harmony', 'chaos', 'miscellaneous', 'fate', 'special'] },
  { key: 'kingdom_trait', label: 'Kingdom trait', page: 'nml/kingdom-traits', cls: 'KingdomTrait', library: 'kingdoms_traits', prefix: 'kingdom_trait', group: 'miscellaneous', stats: false, suffix: 'KingdomTrait',
    groups: ['tribute', 'local_tax', 'miscellaneous', 'fate'] },
];

const traitDef = (k: TraitKind): Def => {
  const fields: Field[] = [
    idField(`my_${k.key === 'actor_trait' ? 'trait' : k.key}`),
    { key: 'group', label: 'group_id', kind: 'select', def: k.group, options: k.groups, free: true },
    iconField(`ui/Icons/icon${k.suffix}`),
  ];
  if (k.key === 'actor_trait') {
    fields.push(
      { key: 'rate_birth', label: 'rate_birth', kind: 'num', def: 0 },
      { key: 'can_be_cured', label: 'can_be_cured', kind: 'bool', def: false },
      { key: 'opposite', label: 'opposite traits (ids, comma separated)', kind: 'text', def: '' },
      { key: 'effect', label: 'action_special_effect (a stub for your own code)', kind: 'bool', def: false },
    );
  } else {
    fields.push({ key: 'rarity', label: 'rarity', kind: 'select', def: 'Rarity.R1_Rare', options: RARITY });
  }
  if (k.key === 'subspecies_trait') {
    fields.push({ key: 'mutation', label: 'in_mutation_pot_add', kind: 'bool', def: true });
  }
  if (k.key === 'religion_trait') {
    fields.push({ key: 'plot', label: 'plot_id (optional)', kind: 'text', def: '' });
  }
  if (k.stats) fields.push(statsField);

  return {
    key: k.key,
    label: k.label,
    cat: 'Traits',
    page: k.page,
    text: 'both',
    fields,
    gen: (v, ns) => {
      const id = cleanId(s(v, 'id'));
      const cls = named(id, k.suffix);
      const icon = s(v, 'icon');
      const lines: string[] = [
        `                id = ID,`,
        `                needs_to_be_explored = false,   // already discovered, no exploring needed`,
        `                group_id = ${q(s(v, 'group'))},`,
        `                path_icon = ${q(icon)},`,
      ];
      if (k.key === 'actor_trait') {
        lines.push(
          `                rate_birth = ${i(v.rate_birth)},                     // 0 = never appears on its own`,
          `                can_be_given = true,                // the player can add it in the editor`,
          `                can_be_removed = true,`,
          `                can_be_cured = ${b(v.can_be_cured)}`,
        );
      } else {
        if (k.key === 'subspecies_trait') {
          lines.push(`                in_mutation_pot_add = ${b(v.mutation)},       // mutation can grant it`);
          lines.push(`                spawn_random_trait_allowed = true,`);
        } else {
          lines.push(`                spawn_random_trait_allowed = false,  // never handed out by chance`);
          lines.push(`                can_be_given = true,                 // the player can add it in the editor`);
          lines.push(`                can_be_removed = true,`);
        }
        if (k.key === 'religion_trait' && s(v, 'plot')) lines.push(`                plot_id = ${q(s(v, 'plot'))},      // the rite followers may attempt`);
        lines.push(`                rarity = ${s(v, 'rarity') || 'Rarity.R1_Rare'}`);
      }

      const after: string[] = [];
      const stats = k.stats ? statLines(v, 'trait', '            ') : '';
      if (stats) after.push('', '            // add() allocated the stat block, so stats go after it', stats);
      if (k.key === 'actor_trait') {
        for (const o of csv(s(v, 'opposite'))) after.push(`            trait.addOpposite(${q(cleanId(o))});`);
        if (v.effect) {
          after.push(
            '',
            '            // every few seconds, while the unit is alive',
            '            trait.special_effect_interval = 3f;',
            '            trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>',
            '            {',
            '                Actor actor = pSelf as Actor;',
            '                if (actor == null || !actor.isAlive()) return false;',
            '',
            '                // your code here',
            '                return true;',
            '            };',
          );
        }
      }

      const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            // Never register the same id twice.
            if (AssetManager.${k.library}.has(ID)) return;

            ${k.cls} trait = new ${k.cls}
            {
${lines.join('\n').replace(/,\s*$/, '')}
            };

            AssetManager.${k.library}.add(trait);${after.length ? '\n' + after.join('\n') : ''}
        }`;

      const notes: string[] = [];
      if (!k.groups.includes(s(v, 'group'))) {
        notes.push(`group_id "${s(v, 'group')}" is not a vanilla group. Create it first, before this trait, or the trait has nowhere to be drawn.`);
      }
      return {
        file: `Code/${cls}.cs`,
        code: wrap(ns, cls, body),
        locale: [
          [`${k.prefix}_${id}`, ''],
          [`${k.prefix}_${id}_info`, ''],
        ],
        art: [{ path: png(icon), what: 'icon', folder: false }],
        main: [`${cls}.Initialize();`],
        notes,
      };
    },
  };
};

// ------------------------------------------------------------------ everything else

const traitGroup: Def = {
  key: 'trait_group',
  label: 'Trait group (tab)',
  cat: 'Traits',
  page: 'nml/trait-groups',
  text: 'name',
  fields: [idField('my_traits'), { key: 'color', label: 'color', kind: 'color', def: '#7FE7C4' }],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Group');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(ID)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = ID,
                name = "trait_group_" + ID,   // the locale key, not the text
                color = ${q(s(v, 'color'))}
            });
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [[`trait_group_${id}`, '']],
      art: [],
      main: [`${cls}.Initialize();   // before the traits that sit in it`],
      notes: [`Put group_id = "${id}" on your unit traits to place them in this tab.`],
    };
  },
};

const item: Def = {
  key: 'item',
  label: 'Item',
  cat: 'Items',
  page: 'nml/custom-items',
  text: 'both',
  fields: [
    idField('my_sword'),
    { key: 'template', label: 'clone from', kind: 'select', def: '$sword', options: ['$sword', '$spear', '$amulet'], free: true },
    { key: 'material', label: 'material', kind: 'text', def: '' },
    { key: 'quality', label: 'quality', kind: 'select', def: 'Rarity.R1_Rare', options: RARITY },
    { key: 'value', label: 'equipment_value', kind: 'num', def: 30 },
    { key: 'cost_res', label: 'forge cost: resource id', kind: 'text', def: 'common_metals' },
    { key: 'cost_amount', label: 'forge cost: amount', kind: 'num', def: 4 },
    { key: 'sprite', label: 'path_gameplay_sprite', kind: 'text', def: 'items/weapons/w_my_sword' },
    iconField('ui/Icons/items/icon_my_sword'),
    statsField,
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Item');
    const sprite = s(v, 'sprite');
    const icon = s(v, 'icon');
    const material = s(v, 'material') ? cleanId(s(v, 'material')) : '';
    const stats = statLines(v, 'item', '            ');
    const res = cleanId(s(v, 'cost_res'));
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.items.has(ID)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset item = AssetManager.items.clone(ID, ${q(s(v, 'template'))});

            item.translation_key = ID;              // your own name, keeps the template's subtype${material ? `\n            item.material = ${q(material)};` : ''}
            item.equipment_value = ${i(v.value)};            // "how good is this" score the AI compares
            item.quality = ${s(v, 'quality')};        // minimum quality it can roll at
            item.needs_to_be_explored = false;      // visible immediately

            // what a city needs to forge it
            item.setCost(0, ${q(res)}, ${i(v.cost_amount)});
${stats ? `\n            // clone() already ran add(), so base_stats exists\n${stats}\n` : ''}
            // The game derives these two in post_init(), which ran before your mod existed.
            item.path_gameplay_sprite = ${q(sprite)};
            item.path_icon = ${q(icon)};

            // Cities forge from the subtype list, new weapons roll from the pools.
            // Skip this and nobody ever makes yours.
            AssetManager.items.equipment_by_subtypes[item.equipment_subtype].Add(item);
            if (item.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(item);
                AssetManager.items.pot_weapon_assets_unlocked.Add(item);
            }
        }`;
    const spriteName = sprite.split('/').pop() || id;
    const locale: [string, string][] = [
      [id, ''],
      [`${id}_description`, ''],
    ];
    if (material) locale.push([`item_mat_${material}`, '']);
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale,
      art: [
        { path: `GameResources/${sprite}/${spriteName}.png`, what: 'in-hand sprite, inside a folder named after it', folder: true },
        { path: png(icon), what: 'icon', folder: false },
      ],
      main: [`${cls}.Initialize();   // after the resources and modifiers it uses`],
      notes: [
        'Give the in-hand sprite a bottom-centre pivot (PivotX 0.5, PivotY 0.0) in a sprites.json next to its folder, or it floats out of the hand.',
        ...(material ? [`A new material needs its item_mat_${material} line, or the name shows a raw key.`] : []),
      ],
    };
  },
};

const modifier: Def = {
  key: 'modifier',
  label: 'Enchantment (item modifier)',
  cat: 'Items',
  page: 'nml/item-modifiers',
  text: 'name',
  fields: [
    idField('my_sharp'),
    { key: 'type', label: 'mod_type', kind: 'text', def: 'sharpness' },
    { key: 'rank', label: 'mod_rank', kind: 'num', def: 1 },
    { key: 'rarity', label: 'rarity (bigger = more common)', kind: 'num', def: 3 },
    { key: 'pool', label: 'pool', kind: 'select', def: 'weapon', options: ['weapon', 'armor', 'accessory'] },
    statsField,
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Modifier');
    const stats = statLines(v, 'mod', '            ');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(ID)) return;

            ItemModAsset mod = new ItemModAsset
            {
                id = ID,
                needs_to_be_explored = false,
                mod_type = ${q(s(v, 'type'))},          // same type: only the higher mod_rank shows up
                mod_rank = ${i(v.rank)},
                translation_key = ID,
                rarity = ${i(v.rarity)},
                pool = ${q(s(v, 'pool'))}
            };

            AssetManager.items_modifiers.add(mod);   // add() first${stats ? '\n' + stats : ''}

            // The generator reads the pools, which were filled before your mod existed.
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!mod.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // added rarity times over: that is the whole weighting system
                for (int i = 0; i < mod.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(mod);
                }
            }
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [[id, '']],
      art: [],
      main: [`${cls}.Initialize();   // before the items`],
      notes: ['The name is one short line in the item tooltip. Keep it to a word or two.'],
    };
  },
};

const itemGroup: Def = {
  key: 'item_group',
  label: 'Item group (category)',
  cat: 'Items',
  page: 'nml/item-groups',
  text: 'name',
  fields: [
    idField('my_relics'),
    { key: 'color', label: 'color', kind: 'color', def: '#BAFFDF' },
    { key: 'after', label: 'place after group', kind: 'text', def: 'amulet' },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'ItemGroup');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.item_groups.has(ID)) return;

            AssetManager.item_groups.add(new ItemGroupAsset
            {
                id = ID,
                name = "equipment_group_" + ID,   // the locale key, not the text
                color = ${q(s(v, 'color'))}
            });

            // The game filled its buckets before your mod existed. A new group has none.
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(ID))
                AssetManager.items.pot_equipment_by_groups_all[ID] = new List<EquipmentAsset>();
            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(ID))
                AssetManager.items.pot_equipment_by_groups_unlocked[ID] = new List<EquipmentAsset>();

            // add() puts a group last. This moves it next to a relative instead.
            ItemGroupAsset group = AssetManager.item_groups.get(ID);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == ${q(cleanId(s(v, 'after')))});
            if (group != null && index != -1)
            {
                AssetManager.item_groups.list.Remove(group);
                AssetManager.item_groups.list.Insert(index + 1, group);
            }
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['System.Collections.Generic']),
      locale: [[`equipment_group_${id}`, '']],
      art: [],
      main: [`${cls}.Initialize();   // before the items in it`],
      notes: [`Put item.group_id = "${id}" on your items to sort them here.`],
    };
  },
};

const status: Def = {
  key: 'status',
  label: 'Status effect',
  cat: 'Effects',
  page: 'nml/status-effects',
  text: 'both',
  fields: [
    idField('my_cursed'),
    { key: 'duration', label: 'duration (seconds)', kind: 'num', def: 20 },
    { key: 'tier', label: 'tier', kind: 'select', def: 'StatusTier.Basic', options: ['StatusTier.None', 'StatusTier.Basic', 'StatusTier.Advanced'] },
    { key: 'cure', label: 'can_be_cured', kind: 'bool', def: true },
    { key: 'dot', label: 'damage per second (0 = none)', kind: 'num', def: 0 },
    { key: 'texture', label: 'texture (frames folder)', kind: 'text', def: 'fx_my_status' },
    iconField('ui/Icons/iconMyStatus'),
    statsField,
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Status');
    const texture = s(v, 'texture').replace(/^effects\//, '');
    const icon = s(v, 'icon');
    const stats = statLines(v, 'status', '            ');
    const dot = Number(v.dot) || 0;
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.status.has(ID)) return;

            StatusAsset status = new StatusAsset
            {
                id = ID,

                // Statuses do NOT derive their locale keys from the id. Set both.
                locale_id = "status_title_" + ID,
                locale_description = "status_description_" + ID,

                texture = ${q(texture)},          // a folder of frames in GameResources/effects/
                path_icon = ${q(icon)},
                duration = ${f(v.duration)},                   // seconds, then it removes itself
                tier = ${s(v, 'tier')},
                can_be_cured = ${b(v.cure)},
                allow_timer_reset = true,              // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f
            };

            AssetManager.status.add(status);${stats ? '\n' + stats : ''}

            // The library does these two in its own post-init, before your mod existed.
            // Without them the first unit that gets the status throws every frame.
            status.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + status.texture);
            status.need_visual_render = true;${dot > 0 ? `

            status.action_interval = 1f;
            status.action = (BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pTarget as Actor;
                if (actor == null || !actor.isAlive()) return false;

                actor.changeHealth(-${i(dot)});
                return true;
            };` : ''}
        }

        /** Give the status to a unit. 0 = the asset's own duration. */
        public static void Apply(Actor pActor)
        {
            StatusAsset asset = AssetManager.status.get(ID);
            if (asset == null || pActor == null) return;
            World.world.statuses.newStatus(pActor, asset, 0f);
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [
        [`status_title_${id}`, ''],
        [`status_description_${id}`, ''],
      ],
      art: [
        { path: `GameResources/effects/${texture}/`, what: 'animation frames (one PNG per frame)', folder: true },
        { path: png(icon), what: 'icon', folder: false },
      ],
      main: [`${cls}.Initialize();`],
      notes: ['texture is written WITHOUT "effects/": the game adds it for you.'],
    };
  },
};

const POWER_ACTIONS = ['spawn a creature', 'drop something', 'earthquake', 'give a status to the nearest unit', 'empty (your code)'];

const power: Def = {
  key: 'power',
  label: 'God power + button',
  cat: 'Player tools',
  page: 'nml/god-powers',
  text: 'both',
  fields: [
    idField('my_power'),
    iconField('ui/Icons/iconMyPower'),
    { key: 'action', label: 'what a click does', kind: 'select', def: POWER_ACTIONS[0], options: POWER_ACTIONS },
    { key: 'target', label: 'creature, drop or status id', kind: 'text', def: 'wolf' },
    { key: 'hold', label: 'hold_action (repeats while held)', kind: 'bool', def: false },
    { key: 'tab', label: 'tab id', kind: 'text', def: 'my_tab' },
    { key: 'tab_name', label: 'tab name', kind: 'text', def: 'My mod' },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Power');
    const icon = s(v, 'icon');
    const target = cleanId(s(v, 'target'));
    const tab = cleanId(s(v, 'tab'));
    const iconName = icon.replace(/^ui\/Icons\//, '');
    let action = '';
    switch (s(v, 'action')) {
      case POWER_ACTIONS[0]:
        action = `World.world.units.spawnNewUnit(${q(target)}, pTile, pSpawnSound: true, pAdultAge: true);`;
        break;
      case POWER_ACTIONS[1]:
        action = `World.world.drop_manager.spawn(pTile, ${q(target)}, 15f, -1f, -1L);`;
        break;
      case POWER_ACTIONS[2]:
        action = `EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);`;
        break;
      case POWER_ACTIONS[3]:
        action = `Actor target = null;
                    foreach (Actor a in Finder.getUnitsFromChunk(pTile, 1, 4f))
                    {
                        if (a != null && a.isAlive()) { target = a; break; }
                    }
                    if (target == null) return false;
                    StatusAsset asset = AssetManager.status.get(${q(target)});
                    if (asset == null) return false;
                    World.world.statuses.newStatus(target, asset, 0f);`;
        break;
      default:
        action = '// your code here';
    }
    const body = `        public const string ID = ${q(id)};
        private const string TAB = ${q(tab)};
        private static PowersTab tab;
        private static bool laid_out;

        public static void Initialize()
        {
            if (AssetManager.powers.get(ID) == null)
            {
                GodPower power = new GodPower
                {
                    id = ID,
                    name = ID,                          // also the locale key
                    rank = PowerRank.Rank0_free,        // no unlock needed
                    path_icon = ${q(icon)},
                    unselect_when_window = true,        // drop the tool when a window opens
                    show_tool_sizes = false,${v.hold ? '\n                    hold_action = true,\n                    click_interval = 0.15f,          // seconds between repeats' : ''}

                    // what happens when the player clicks a tile with this tool armed
                    click_action = (WorldTile pTile, string pPowerID) =>
                    {
                        if (pTile == null) return false;
                        ${action}
                        return true;   // true = the click was used
                    }
                };
                AssetManager.powers.add(power);
            }

            if (tab != null) return;
            tab = TabManager.CreateTab(TAB, TAB, TAB + "_description", Icon(${q(iconName)}));
            if (tab == null) return;

            PowerButtonCreator.CreateGodPowerButton(ID, Icon(${q(iconName)}), tab.transform);
        }

        /** The tab cannot be laid out at mod load. Main.Update() calls this until it takes. */
        public static void LayoutWhenReady()
        {
            if (laid_out || tab == null) return;
            if (PowerTabController.instance == null) return;

            try
            {
                tab.recalc();
                tab.sortButtons();
                laid_out = true;
            }
            catch
            {
                // the UI is still loading
            }
        }

        /** A missing sprite is an invisible button, so never hand one back. */
        private static Sprite Icon(string pName)
        {
            Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
            if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
            return sprite;
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['NeoModLoader.api', 'NeoModLoader.General', 'NeoModLoader.General.UI.Tab', 'UnityEngine']),
      locale: [
        [id, ''],
        [`${id}_description`, ''],
        [tab, s(v, 'tab_name')],
        [`${tab}_description`, s(v, 'tab_name')],
      ],
      art: [{ path: png(icon), what: 'icon (the button and the tab use it)', folder: false }],
      main: [`${cls}.Initialize();`],
      mainExtra: `public void Update()
{
    ${cls}.LayoutWhenReady();
}`,
      notes: [
        'The last two locale lines are the tab: its name and its tooltip.',
        'The icon path must start with ui/Icons/, because the button loads it from there.',
        ...(s(v, 'action') === POWER_ACTIONS[3] ? ['The status id must exist before a click: register the status first.'] : []),
      ],
    };
  },
};

const law: Def = {
  key: 'world_law',
  label: 'World law',
  cat: 'Player tools',
  page: 'nml/world-laws',
  text: 'both',
  fields: [
    idField('world_law_my_law'),
    { key: 'group', label: 'group_id', kind: 'select', def: 'units', options: ['units', 'civilizations', 'spawn', 'diplomacy', 'nature'], free: true },
    { key: 'icon', label: 'icon_path', kind: 'text', def: 'ui/Icons/worldrules/icon_my_law' },
    { key: 'on', label: 'default_state (on for new worlds)', kind: 'bool', def: false },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id.replace(/^world_law_/, ''), 'Law');
    const icon = s(v, 'icon');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.world_laws_library.has(ID)) return;

            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = ID,
                needs_to_be_explored = false,
                group_id = ${q(s(v, 'group'))},                  // which tab it appears in
                icon_path = ${q(icon)},     // note: icon_path, not path_icon
                default_state = ${b(v.on)}
            });
        }

        /** Use this anywhere in your code to check the switch. */
        public static bool IsOn()
        {
            WorldLawAsset law = AssetManager.world_laws_library.get(ID);
            return law != null && law.isEnabled();
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [
        [`${id}_title`, ''],
        [`${id}_description`, ''],
      ],
      art: [{ path: png(icon), what: 'icon', folder: false }],
      main: [`${cls}.Initialize();`],
      notes: [`A law does nothing on its own. Check ${cls}.IsOn() in the code that should behave differently.`],
    };
  },
};

const drop: Def = {
  key: 'drop',
  label: 'Drop (falls from the sky)',
  cat: 'World',
  page: 'nml/drops-and-loot',
  text: 'none',
  fields: [
    idField('my_ember'),
    { key: 'speed', label: 'falling_speed', kind: 'num', def: 3.2 },
    { key: 'scale', label: 'default_scale', kind: 'num', def: 0.1 },
    { key: 'fire', label: 'sets the ground on fire where it lands', kind: 'bool', def: true },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Drop');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.drops.has(ID)) return;

            DropAsset drop = new DropAsset
            {
                id = ID,
                path_texture = "drops/" + ID,   // a FOLDER of frames in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = ${f(v.scale)},
                falling_speed = ${f(v.speed)},
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // what happens the moment it touches the ground
            drop.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                ${v.fire ? 'World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);' : '// your code here'}
            };

            AssetManager.drops.add(drop);
        }

        /** Drop one on a tile. */
        public static void Spawn(WorldTile pTile)
        {
            World.world.drop_manager.spawn(pTile, ID, 15f, -1f, -1L);
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['NeoModLoader.api', 'UnityEngine']),
      locale: [],
      art: [{ path: `GameResources/drops/${id}/${id}_0.png`, what: 'frames, one PNG each, in a folder of their own', folder: true }],
      main: [`${cls}.Initialize();   // before any cloud that rains it`],
      notes: ['A single loose PNG does not work: the drop falls invisibly. It must be a folder, even for one frame.'],
    };
  },
};

const cloud: Def = {
  key: 'cloud',
  label: 'Cloud',
  cat: 'World',
  page: 'nml/clouds',
  text: 'none',
  fields: [
    idField('my_cloud'),
    { key: 'color', label: 'color_hex', kind: 'color', def: '#D14219' },
    { key: 'drop', label: 'drop_id (what it rains)', kind: 'text', def: 'fire' },
    { key: 'sprite', label: 'sprite path', kind: 'text', def: 'effects/clouds/my_cloud' },
    { key: 'disaster', label: 'considered_disaster', kind: 'bool', def: false },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Cloud');
    const sprite = s(v, 'sprite');
    const body = `        public const string ID = ${q(id)};

        private static readonly string[] Sprites = new string[]
        {
            ${q(sprite)}
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(ID)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = ID,
                color_hex = ${q(s(v, 'color'))},
                max_alpha = 0.8f,
                drop_id = ${q(cleanId(s(v, 'drop')))},
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = ${b(v.disaster)},
                path_sprites = Sprites
            });

            // CloudLibrary does both of these at startup, before your mod existed.
            CloudAsset cloud = AssetManager.clouds.get(ID);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }

        /** Spawn one over a tile. */
        public static void Spawn(WorldTile pTile)
        {
            EffectsLibrary.spawn("fx_cloud", pTile, ID);
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['System.Collections.Generic', 'UnityEngine']),
      locale: [],
      art: [{ path: png(sprite), what: 'cloud sprite', folder: false }],
      main: [`${cls}.Initialize();   // after the drop it rains`],
      notes: [],
    };
  },
};

const resource: Def = {
  key: 'resource',
  label: 'Food',
  cat: 'World',
  page: 'nml/resources',
  text: 'name',
  fields: [
    idField('my_cake'),
    { key: 'ingredients', label: 'ingredients (ids, comma separated)', kind: 'text', def: 'wheat, honey' },
    { key: 'nutrition', label: 'restore_nutrition', kind: 'num', def: 140 },
    { key: 'happiness', label: 'restore_happiness', kind: 'num', def: 25 },
    { key: 'icon', label: 'path_icon', kind: 'text', def: 'iconMyCake' },
    { key: 'sprite', label: 'path_gameplay_sprite', kind: 'text', def: 'my_cake' },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Resource');
    const icon = s(v, 'icon');
    const sprite = s(v, 'sprite');
    const ing = csv(s(v, 'ingredients')).map((x) => q(cleanId(x)));
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.resources.has(ID)) return;

            ResourceAsset food = AssetManager.resources.clone(ID, "$TEMPLATE_FOOD$");

            food.path_icon = ${q(icon)};               // loaded exactly as written
            food.path_gameplay_sprite = ${q(sprite)};  // loaded as items/resources/<this>

            // The library derives this one in post_init(), which already ran.
            food.full_sprite_path = "items/resources/" + food.path_gameplay_sprite;
${ing.length ? `
            food.ingredients = new string[] { ${ing.join(', ')} };
            food.ingredients_amount = 1;
` : ''}
            food.restore_nutrition = ${i(v.nutrition)};
            food.restore_happiness = ${i(v.happiness)};
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [[id, '']],
      art: [
        { path: png(icon), what: 'inventory icon', folder: false },
        { path: `GameResources/items/resources/${sprite}/`, what: 'carried-in-hand frames', folder: true },
      ],
      main: [`${cls}.Initialize();   // before items and buildings that cost it`],
      notes: ['A culture only makes it if its production list includes it: see the Resources page.'],
    };
  },
};

const tile: Def = {
  key: 'tile',
  label: 'Top tile (ground cover)',
  cat: 'World',
  page: 'nml/tiles',
  text: 'none',
  fields: [
    idField('my_moss'),
    { key: 'color', label: 'color_hex', kind: 'color', def: '#2E6B3F' },
    { key: 'burn', label: 'burnable', kind: 'bool', def: true },
    { key: 'walk', label: 'walk_multiplier', kind: 'num', def: 0.8 },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Tile');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(ID)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType tile = AssetManager.top_tiles.clone(ID, "grass_low");

            tile.color_hex = ${q(s(v, 'color'))};
            tile.can_be_set_on_fire = ${b(v.burn)};
            tile.burnable = ${b(v.burn)};
            tile.walk_multiplier = ${f(v.walk)};
            tile.can_be_removed_with_sickle = true;
            tile.can_be_removed_with_spade = true;

            // The library links this at startup, before your mod existed.
            tile.biome_asset = AssetManager.biome_library.get(tile.biome_id);

            // [NonSerialized] fields: clone() skips them and linkAssets() already ran.
            tile.color = Toolbox.makeColor(tile.color_hex);
            tile.has_biome_tags = tile.biome_tags != null && tile.biome_tags.Count > 0;

            // Your variations in GameResources/tiles/<id>/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + tile.id);
            if (variations.Length > 0)
            {
                tile.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    tile.sprites.addVariation(variation, tile.id);
                }
            }
        }

        /** Paint it on a tile. */
        public static void Paint(WorldTile pTile)
        {
            TopTileType tile = AssetManager.top_tiles.get(ID);
            if (tile != null && pTile != null) pTile.setTopTileType(tile);
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['UnityEngine']),
      locale: [],
      art: [{ path: `GameResources/tiles/${id}/`, what: 'variations, one PNG each', folder: true }],
      main: [`${cls}.Initialize();`],
      notes: ['Tiles ignore path fields: the folder name must be the tile id.'],
    };
  },
};

const age: Def = {
  key: 'world_age',
  label: 'World age',
  cat: 'World',
  page: 'nml/world-ages',
  text: 'both',
  fields: [
    idField('age_my_age'),
    iconField('ui/Icons/iconMyAge'),
    { key: 'color', label: 'title_color', kind: 'color', def: '#D14219' },
    { key: 'rate', label: 'rate (how often it is picked)', kind: 'num', def: 2 },
    { key: 'ash', label: 'ash particles and overlay', kind: 'bool', def: false },
    { key: 'slot', label: 'wheel slot', kind: 'num', def: 4 },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id.replace(/^age_/, ''), 'Age');
    const icon = s(v, 'icon');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.era_library.has(ID)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = ID,
                path_icon = ${q(icon)},
                rate = ${i(v.rate)},${v.ash ? '\n                particles_ash = true,\n                overlay_ash = true,\n                era_effect_overlay_alpha = 0.2f,' : ''}
                title_color = Toolbox.makeColor(${q(s(v, 'color'))})
            };
            age.default_slots = new List<int> { ${i(v.slot)} };

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['System.Collections.Generic']),
      locale: [
        [`${id}_title`, ''],
        [`${id}_description`, ''],
      ],
      art: [{ path: png(icon), what: 'icon', folder: false }],
      main: [`${cls}.Initialize();   // after any cloud or status it uses`],
      notes: [],
    };
  },
};

const achievement: Def = {
  key: 'achievement',
  label: 'Achievement',
  cat: 'Progress',
  page: 'nml/achievements',
  text: 'both',
  fields: [
    idField('achievement_my_swarm'),
    { key: 'group', label: 'group', kind: 'select', def: 'creatures', options: ['creatures'], free: true },
    { key: 'icon', label: 'icon', kind: 'text', def: 'ui/Icons/iconMyAchievement' },
    { key: 'actor', label: 'unlocks when this many of a creature are alive: creature id', kind: 'text', def: 'wolf' },
    { key: 'count', label: '...how many', kind: 'num', def: 10 },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id.replace(/^achievement_/, ''), 'Achievement');
    const icon = s(v, 'icon');
    const body = `        public const string ID = ${q(id)};
        private const string WATCH = ID + "_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(ID)) return;

            Achievement achievement = new Achievement
            {
                id = ID,
                group = ${q(s(v, 'group'))},
                icon = ${q(icon)},
                locale_key = ID,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => Count() >= ${i(v.count)}
            };

            AssetManager.achievements.add(achievement);

            // the achievements window reads each group's list, filled at startup
            AssetManager.achievement_groups.get(achievement.group).achievements_list.Add(achievement);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!achievement.isUnlocked()) achievement.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int Count()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == ${q(cleanId(s(v, 'actor')))}) count++;
            }
            return count;
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body, ['System.Collections.Generic']),
      locale: [
        [id, ''],
        [`${id}_description`, ''],
      ],
      art: [{ path: png(icon), what: 'icon', folder: false }],
      main: [`${cls}.Initialize();`],
      notes: [],
    };
  },
};

const projectile: Def = {
  key: 'projectile',
  label: 'Projectile',
  cat: 'Effects',
  page: 'nml/projectiles-spells',
  text: 'none',
  fields: [
    idField('my_bolt'),
    { key: 'template', label: 'clone from', kind: 'select', def: 'firebomb', options: ['firebomb'], free: true },
    { key: 'texture', label: 'texture (frames folder)', kind: 'text', def: 'my_bolt' },
    { key: 'speed', label: 'speed', kind: 'num', def: 16 },
    { key: 'fire', label: 'sets the ground on fire on impact', kind: 'bool', def: true },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Projectile');
    const texture = s(v, 'texture').replace(/^effects\/projectiles\//, '');
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.projectiles.has(ID)) return;

            AssetManager.projectiles.clone(ID, ${q(s(v, 'template'))});

            ProjectileAsset bolt = AssetManager.projectiles.get(ID);
            bolt.texture = ${q(texture)};      // a folder of frames in GameResources/effects/projectiles/
            bolt.speed = ${f(v.speed)};
            bolt.look_at_target = true;

            bolt.impact_actions = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;
                ${v.fire ? 'World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);' : '// your code here'}
                return true;
            };
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [],
      art: [{ path: `GameResources/effects/projectiles/${texture}/`, what: 'frames, one PNG each', folder: true }],
      main: [`${cls}.Initialize();`],
      notes: ['A single PNG instead of a folder throws ArgumentOutOfRangeException the first time it flies.'],
    };
  },
};

const kingdom: Def = {
  key: 'kingdom',
  label: 'Kingdom (faction)',
  cat: 'World',
  page: 'nml/kingdoms',
  text: 'none',
  fields: [
    idField('my_faction'),
    { key: 'template', label: 'clone from', kind: 'select', def: '$TEMPLATE_CIV$', options: ['$TEMPLATE_CIV$', '$TEMPLATE_NOMAD$'] },
    { key: 'tag', label: 'own tag', kind: 'text', def: 'civ' },
    { key: 'friends', label: 'friendly tags (comma separated)', kind: 'text', def: 'civ' },
    { key: 'enemies', label: 'enemy tags (comma separated)', kind: 'text', def: 'orc' },
    { key: 'icon', label: 'icon', kind: 'text', def: 'ui/Icons/iconMyFaction' },
  ],
  gen: (v, ns) => {
    const id = cleanId(s(v, 'id'));
    const cls = named(id, 'Kingdom');
    const icon = s(v, 'icon');
    const lines = [
      `            kingdom.addTag(${q(cleanId(s(v, 'tag')))});`,
      ...csv(s(v, 'friends')).map((t) => `            kingdom.addFriendlyTag(${q(cleanId(t))});`),
      ...csv(s(v, 'enemies')).map((t) => `            kingdom.addEnemyTag(${q(cleanId(t))});`),
      `            kingdom.setIcon(${q(icon)});`,
    ];
    const body = `        public const string ID = ${q(id)};

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(ID)) return;

            KingdomAsset kingdom = AssetManager.kingdoms.clone(ID, ${q(s(v, 'template'))});
${lines.join('\n')}
        }`;
    return {
      file: `Code/${cls}.cs`,
      code: wrap(ns, cls, body),
      locale: [],
      art: [{ path: png(icon), what: 'icon', folder: false }],
      main: [`${cls}.Initialize();   // before the creatures that use it`],
      notes: ['A creature joins it by pointing its kingdom id here: see the Custom actors page.'],
    };
  },
};


// ------------------------------------------------------------------ templates
// These nine are the guide pages' own files, renamed. The interesting part of each one is your
// own logic, so the builder hands out the working skeleton and the page explains the rest.

interface TemplateKind {
  key: string;
  label: string;
  page: string;
  /** The class the template declares, e.g. HelloActors. */
  cls: string;
  /** How Main.cs uses it. */
  main: (cls: string) => string;
  /** Other HelloBox classes it talks to, which the reader has to make or replace. */
  needs: string[];
}

const TEMPLATE_KINDS: TemplateKind[] = [
  { key: 'actor', label: 'Creature', page: 'nml/custom-actors', cls: 'HelloActors', main: (c) => `${c}.Initialize();`, needs: [] },
  { key: 'building', label: 'Building', page: 'nml/custom-buildings', cls: 'HelloBuildings', main: (c) => `${c}.Initialize();`, needs: [] },
  { key: 'disaster', label: 'Disaster', page: 'nml/disasters', cls: 'HelloDisasters', main: (c) => `${c}.Initialize();`, needs: [] },
  { key: 'combat', label: 'Combat action & spell', page: 'nml/projectiles-spells', cls: 'HelloCombat', main: (c) => `${c}.Initialize();`, needs: ['HelloProjectiles', 'HelloTraits'] },
  { key: 'ai_job', label: 'AI job & task', page: 'nml/custom-ai', cls: 'HelloAI', main: (c) => `${c}.Initialize();`, needs: [] },
  { key: 'decision', label: 'AI decision', page: 'nml/custom-ai', cls: 'HelloDecisions', main: (c) => `${c}.Initialize();   // after the job and task it uses`, needs: ['HelloAI'] },
  { key: 'city_job', label: 'City job', page: 'nml/custom-ai', cls: 'HelloCityJobs', main: (c) => `${c}.Initialize();   // after the job and task it uses`, needs: ['HelloAI'] },
  { key: 'plot', label: 'Plot', page: 'nml/plots', cls: 'HelloPlots', main: (c) => `${c}.Initialize();`, needs: ['HelloPolitics'] },
  { key: 'window', label: 'Custom window', page: 'nml/custom-windows', cls: 'HelloWindow', main: (c) => `// no Initialize: open it from a button\nPowerButtonCreator.CreateSimpleButton("my_panel", ${c}.Toggle, Icon("iconMyPanel"), tab.transform);`, needs: [] },
];

/** HelloBox -> your namespace, Hello... -> your prefix, hello_ -> your prefix. */
const rename = (code: string, ns: string, prefix: string): string => {
  const lower = cleanId(prefix);
  const upper = pascal(lower);
  return code
    .replace(/\bHelloBox\b/g, ns)
    .replace(/Hello(?=[A-Z])/g, upper)
    .replace(/\bhellobox_/g, `${lower}_`)
    .replace(/\bhello_/g, `${lower}_`);
};

const templateDef = (k: TemplateKind): Def => ({
  key: k.key,
  label: k.label,
  cat: 'Templates (your logic inside)',
  page: k.page,
  text: 'none',
  template: true,
  fields: [{ key: 'prefix', label: 'id prefix (replaces "hello")', kind: 'text', def: 'my' }],
  gen: (v, ns) => {
    const prefix = s(v, 'prefix') || 'my';
    const cls = rename(k.cls, ns, prefix);
    return {
      file: `Code/${cls}.cs`,
      code: rename(TEMPLATES[k.key], ns, prefix),
      locale: [],
      art: [],
      main: [rename(k.main(k.cls), ns, prefix)],
      notes: [
        'This is the full working file from the guide page, renamed. The page explains every part and lists its text keys and art.',
        ...(k.needs.length
          ? [`It uses ${k.needs.map((n) => rename(n, ns, prefix)).join(' and ')} from other pages of the guide. Make those too, or swap in your own ids.`]
          : []),
      ],
    };
  },
});

export const DEFS: Def[] = [
  ...TRAIT_KINDS.map(traitDef),
  traitGroup,
  item,
  modifier,
  itemGroup,
  status,
  projectile,
  power,
  law,
  drop,
  cloud,
  resource,
  tile,
  age,
  kingdom,
  achievement,
  ...TEMPLATE_KINDS.map(templateDef),
];
