---
title: Culture traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbtiphat:
order: 106
---

# Culture traits :wbtiphat:

A **culture** is the shared habits of a group of cities. It decides what they build, what they forge, how they inherit, what they read and what they value. A culture trait is one of those habits.

Of the seven trait systems, culture is the one with the widest reach. A culture spreads with cities, survives its founder, and merges its stats into every single unit that belongs to it. If you want a mod whose effect ripples through a world over an hour of play, this is the library.

| | |
| --- | --- |
| Library | `AssetManager.culture_traits` |
| Class | `CultureTrait` |
| Groups | `AssetManager.culture_trait_groups`, class `CultureTraitGroupAsset` |
| Owner at runtime | `Culture`, in `World.world.cultures` |
| Locale prefix | `culture_trait_` |
| Default icon folder | `ui/Icons/culture_traits/` |

## Registering one

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // higher sorts to the top of its group
                spawn_random_trait_allowed = false,  // never handed out by chance
                can_be_given = true,                 // the player can add it in the editor
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Warning below: this reaches farmers as well as soldiers.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` is read once, at startup
> New cultures roll their starting traits from a pool that `BaseTraitLibrary.linkAssets()` builds while the game loads, before your mod exists. Setting the flag on your trait changes nothing on its own: your trait is never in that pool, and it never turns up on a founder by chance. Put it in yourself, weighted the way vanilla does it:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.culture_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` is `protected`, so this compiles against the publicized assembly NML already builds your mod with. `spawn_random_rate` defaults to `5`: raise it and the trait turns up more often.

Everything on **[Custom traits](#/nml/custom-traits)** applies here too: `add()` before stats, `path_icon` is not filled in for you, ids get prefixed. What follows is what makes culture traits different.

> [!WARNING] `base_stats` on a culture trait reaches everybody
> `Actor.updateStats()` merges `culture.base_stats` into every unit of that culture. Every unit. A "+5 damage" doctrine also arms the bakers.
>
> If the bonus should only apply to some members, put nothing in `base_stats` and gate it yourself in a Harmony Postfix on `Actor.updateStats`, see **[Harmony patches](#/nml/harmony-patches)**. If it should apply to the culture as a group rather than to its people, use `base_stats_meta` instead, see **[Stats reference](#/nml/stats)**.

## Steering what a culture forges

This is the field culture traits have and nothing else does, and it is the cleanest way to make a culture *feel* different without touching a single weapon:

```csharp
trait.value = 10f;                       // how strongly the preference weighs
trait.addWeaponSubtype("sword");         // prefer a whole weapon class
trait.addWeaponSpecial("hello_relic");   // or one specific item id
```

Both helpers set `is_weapon_trait = true` for you. The crafting code reads the culture's preferred weapons when a city decides what to make, so this changes the weapon in a soldier's hand rather than a number on it. `bow_lovers` and `spear_lovers` in vanilla are exactly this.

| Field | What it does |
| --- | --- |
| `is_weapon_trait` | Marks the trait as a weapon preference |
| `related_weapon_subtype_ids` | Preferred weapon classes. `addWeaponSubtype` appends here |
| `related_weapons_ids` | Preferred specific item ids. `addWeaponSpecial` appends here |
| `value` | How heavily the preference counts |

## Steering how a culture builds

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Takes a `PassableZoneChecker` and sets `town_layout_plan = true`. This is how vanilla's city-layout traits work: pillared towns, road-heavy towns.

It is the deepest hook on this page and the one most likely to fight another mod, because a culture can only follow one layout plan at a time. Check `town_layout_plan` on the traits the culture already holds before assuming yours is the only one.

## The vanilla groups

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Your own tab: see **[Trait groups & tabs](#/nml/trait-groups)**, with `AssetManager.culture_trait_groups` and `CultureTraitGroupAsset`.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Handing it out

```csharp
// every creature of this kind starts with it
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// or at runtime, on cultures that already exist
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` and `addTrait` take either the id string or the asset.

## Checking a culture trait from a unit

`Actor` has a shortcut for exactly this, because it is such a common question:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] Culture or subspecies?
> Both spread, but not the same way. A **culture** trait spreads with cities and can be adopted by anyone who joins. A **subspecies** trait spreads by breeding and cannot. "Elves shoot better because that is how they were raised" is culture; "elves shoot better because of their eyes" is subspecies. See **[Subspecies traits](#/nml/subspecies-traits)** :catnoted:.
