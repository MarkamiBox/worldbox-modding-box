---
title: Stats reference
group: Game Content
subgroup: Architecture & Stats
icon: :wbstonks:
order: 92
---

# Stats reference :wbstonks:

Almost every asset you register has a `base_stats` block, and almost every page after this one writes into it. This is the list of what you are allowed to put in there. Everything else is a crash waiting for its moment :PES5_Hmmmm:.

## How base_stats works

`base_stats` is a dictionary of `string` to `float`. The key must be one of the stat ids below. Writing an unknown key is **not** harmless: the setter looks the id up in `base_stats_library`, gets `null` back, and throws a `NullReferenceException` right there in your `Initialize()`.

So a stat typo does not quietly do nothing. It takes your whole registration stage down, and everything after that line never runs. Keep your stat names in `const string` fields if you use one in more than one place.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, not x0.25
```

## Where a unit's numbers come from

`Actor.updateStats()` clears the unit's stat block and rebuilds it from scratch, in this exact order. I still look this table up every time:

| # | Source | Note |
| --- | --- | --- |
| 1 | **Subspecies**, plus its male or female block | If the unit has one |
| 1b | **Actor asset** | Only when there is **no** subspecies. The subspecies *replaces* it, it does not stack on top |
| 2 | **Clan**, plus its male or female block | |
| 3 | **Language** | |
| 4 | **Culture** | |
| 5 | Leader attributes from the unit's own data | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | Every **status effect** on it | |
| 7 | The **default attack** item | Only when unarmed |
| 8 | Every **actor trait** | Era-gated traits are skipped when their era is not active |
| 9 | Its **personality** | |
| 10 | Every **equipped item**, with its modifiers | |

Two things people get wrong here:

- **A subspecies replaces the actor asset's stats.** Put a number on `human` and a unit with a subspecies never sees it.
- **Religion is not on this list.** A religion trait's `base_stats` never reaches a unit. See **[Religion traits](#/nml/religion-traits)**.

Two more consequences:

- A flat stat like `damage` is a **bonus**, not a final value. `damage = 15` on a trait means "+15 on top of whatever else".
- A `multiplier_*` stat is a **fraction added to 1.0**. `multiplier_health = 0.5` is +50%. `multiplier_health = -0.5` is half health.

> [!WARNING] `base_stats` does not exist until the asset is registered
> On a hand-built asset the stat block is allocated inside `add()`. Write to `base_stats` before that and you get a `NullReferenceException`. `clone()` calls `add()` for you, so after a clone you are already safe. This is the single most common crash in WorldBox modding.

## Combat

`damage` and `armor` do most of the work. The rest is for when you want a trait to feel different, not just bigger.

| Stat | What it does |
| --- | --- |
| `damage` | Flat damage per hit |
| `damage_range` | Random spread added on top of `damage` |
| `attack_speed` | How fast attacks come out |
| `accuracy` | Chance to actually land the hit |
| `critical_chance` | Chance of a critical hit |
| `critical_damage_multiplier` | How much harder a critical hits |
| `armor` | Flat damage reduction |
| `range` | Attack reach |
| `throwing_range` | Reach for thrown weapons |
| `targets` | How many things one attack can hit |
| `projectiles` | How many projectiles are fired at once |
| `knockback` | How far a hit pushes the target |
| `recoil` | How far a hit pushes *you* |
| `skill_combat` | Combat skill level |
| `skill_spell` | Spellcasting skill level |
| `status_chance` | Chance for an attached status effect to apply |
| `area_of_effect` | Splash radius |

## Body

| Stat | What it does |
| --- | --- |
| `health` | Maximum health |
| `stamina` | Maximum stamina |
| `mana` | Maximum mana |
| `speed` | Movement speed |
| `mass`, `mass_2` | Physical mass, used by knockback and physics |
| `size` | Hitbox size |
| `scale` | Rendered size |
| `max_nutrition` | How much food the unit can hold |
| `metabolic_rate` | How fast it burns that food |
| `construction_speed` | How fast it builds |
| `experience` | Experience gained |

## Life cycle

| Stat | What it does |
| --- | --- |
| `lifespan` | How long it lives |
| `maturation` | How fast it grows up |
| `age_adult` | Age at which it counts as an adult |
| `age_breeding` | Age at which it can breed |
| `birth_rate` | How often offspring happen |
| `offspring` | How many per birth |
| `multiplier_offspring` | Percentage change to that count |
| `mutation` | Chance of a subspecies mutation |
| `happiness` | Base mood |

## Civilisation only

These do nothing on an animal. The game marks them `used_only_for_civs`. Give a wolf `diplomacy` and you get a very well-spoken wolf that nobody listens to :wbwolf:.

| Stat | What it does |
| --- | --- |
| `diplomacy` | Leader attribute: negotiation |
| `warfare` | Leader attribute: war |
| `stewardship` | Leader attribute: running the place |
| `intelligence` | Leader attribute: learning |
| `army` | Army size contribution |
| `cities` | How many cities the kingdom aims for |
| `bonus_towers` | Extra towers a city may build |
| `limit_population` | Population ceiling |
| `limit_clan_members` | Clan size ceiling |
| `loyalty_traits` | Loyalty from traits |
| `loyalty_mood` | Loyalty from mood |
| `opinion` | Baseline opinion of others |
| `multiplier_diplomacy` | Percentage change to diplomacy |
| `multiplier_supply_timer` | How long army supplies last |
| `personality_aggression` | Hidden AI personality weight |
| `personality_administration` | Hidden AI personality weight |
| `personality_diplomatic` | Hidden AI personality weight |
| `personality_rationality` | Hidden AI personality weight |

## Multipliers

All of these are fractions added to 1.0, so `0.25` means +25%.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats vs base_stats_meta

Every trait carries **two** stat blocks, and picking the wrong one is the most common balance bug in a meta-trait mod:

| Block | Where it ends up |
| --- | --- |
| `base_stats` | Merged into the owner, and from there into **every unit** that belongs to it |
| `base_stats_meta` | Stays on the owner. Read by the culture, clan or subspecies itself, never by a unit |

```csharp
trait.base_stats["damage"] = 5;             // every member of this culture hits harder. Farmers too
trait.base_stats_meta["construction_speed"] = 10;   // the group builds faster. Nobody's damage changes
```

If a bonus should apply to some members and not others (only warriors, only adults), neither block can express that. Use a Harmony Postfix on `Actor.updateStats` and gate it yourself. See **[Harmony patches](#/nml/harmony-patches)**.

## Tags: the stats that are not numbers

A `base_stats` block also carries a set of **tags**, which are flags rather than values. They merge the same way stats do, so a trait can hand a unit fire immunity the same way it hands it damage:

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

The ones the game itself reads:

| Group | Tags |
| --- | --- |
| Immunity | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| Movement | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| Mind | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| Behaviour | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| Diet | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| Reproduction | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| Nature | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| Building | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

Unlike a stat name, an unknown tag is harmless, it just never matches anything. That also means a typo here fails silently, so copy them exactly. Pick your poison :PES2_Shrug:.

## Reading a unit's live values

`base_stats` is the *recipe*. `stats` on a live `Actor` is the *result*, after everything has been summed:

```csharp
float finalDamage = actor.stats["damage"];
```

That is also what you adjust from a Harmony Postfix on `Actor.updateStats` (see **[Harmony patches](#/nml/harmony-patches)**).

## Adding your own stat

You can register a new `BaseStatAsset` in `AssetManager.base_stats_library`, and it will show up in the inspector and be summed like any other. What it will **not** do is have any effect: nothing in the game reads a stat it does not know about. A custom stat is only useful as a number you then read yourself, from your own Harmony patch or your own behaviour.

Most of the time the answer is "use an existing stat", and the second answer is "keep your own dictionary". I have not found a third one yet.
