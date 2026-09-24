---
title: Religion traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbpray:
order: 108
---

# Religion traits :wbpray:

A **religion** belongs to cities and kingdoms, spreads by conversion, writes books, and can perform **rites**: world-altering plots its followers attempt on their own. A religion trait is one belief.

| | |
| --- | --- |
| Library | `AssetManager.religion_traits` |
| Class | `ReligionTrait` |
| Groups | `AssetManager.religion_trait_groups`, class `ReligionTraitGroupAsset` |
| Owner at runtime | `Religion`, in `World.world.religions` |
| Locale prefix | `religion_trait_` |
| Default icon folder | `ui/Icons/religion_traits/` |

> [!WARNING] Religion stats do not reach units
> This is the one trait system whose `base_stats` never lands on an `Actor`. `Actor.updateStats()` merges subspecies, clan, language and culture. **Religion is not in that list.**
>
> So a religion trait changes the world through what it *does* (a rite, a transformation, an action hook), not through numbers. Writing `base_stats["damage"] = 10` on one is a silent no-op, and it is the most common wasted afternoon on this page :PES4_BigSad:.

## Registering one

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // the rite followers may attempt
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` is read once, at startup
> New religions roll their starting traits from a pool that `BaseTraitLibrary.linkAssets()` builds while the game loads, before your mod exists. Setting the flag on your trait changes nothing on its own: your trait is never in that pool, and it never turns up on a founder by chance. Put it in yourself, weighted the way vanilla does it:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.religion_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` is `protected`, so this compiles against the publicized assembly NML already builds your mod with. `spawn_random_rate` defaults to `5`: raise it and the trait turns up more often.

## Rites: the `plot_id` field

A religion trait with a `plot_id` becomes a **rite**. The religion collects its rites into `possible_rites`, and leaders and priests attempt them on their own when the plot's conditions are met. You write the belief, the priests do the rest :wbpray:.

```csharp
trait.plot_id = "summon_meteor_rain";
```

The id points at `AssetManager.plots_library`. Vanilla rites reuse existing plots - `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` - and you can do the same, or register your own `PlotAsset` first.

The plot decides who may attempt it and how hard it is:

| PlotAsset field | What it does |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Who may start it |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Attribute gates |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Standing gates |
| `progress_needed`, `money_cost` | How long and how expensive |
| `pot_rate`, `rarity` | How often the AI picks it |
| `check_is_possible`, `check_should_continue` | Your own conditions |

## Transformations: the `transformation_biome_id` field

The other field unique to religion traits. It marks the trait as a transformation and names the biome the faith spreads:

```csharp
trait.transformation_biome_id = "biome_desert";
```

Vanilla uses this for `sands_of_ruin` (desert), `shadowroot` (corrupted), `echo_of_the_void` (singularity), `infernal_rot` (infernal) and `cosmic_radiation` (wasteland). A religion with one of these slowly rewrites the terrain its followers live on, which is the largest visible effect any single trait in the game has.

## Making one *do* something

Since stats are out, the action hooks are how a religion trait earns its place. They are the same ones every trait has:

```csharp
// every few seconds, on each follower
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// when a follower dies
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

A religion trait can also grant a spell or a decision, which is usually a better fit than a timer:

```csharp
trait.addSpell("hello_bolt");           // see Projectiles, spells & effects
trait.addDecision("burn_tumors");       // an AI decision followers may take

// both lists hold ids; the library resolved them at startup, before your mod
trait.linkSpells();
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("burn_tumors") };
```

## The vanilla groups

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Your own tab: see **[Trait groups & tabs](#/nml/trait-groups)**, with `AssetManager.religion_trait_groups` and `ReligionTraitGroupAsset`.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Handing it out

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

A `Religion` also exposes `cities`, `kingdoms`, `books` and `possible_rites`, which is usually what you want to read when your own code needs to know what a faith is up to.

> [!TIP] Rites are the point
> A religion that only changes numbers is invisible. A religion whose priests occasionally summon a meteor storm is the thing people post screenshots of. Spend your effort on `plot_id` :aPES_Flames:.
