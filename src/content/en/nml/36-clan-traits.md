---
title: Clan traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbclanroses:
order: 110
---

# Clan traits :wbclanroses:

A **clan** is a bloodline: a family that grew large enough to be its own thing, with its own banner, its own colour and its own reputation. A clan trait is what that bloodline carries.

Clan traits are the closest thing in the game to a hereditary superpower, and they are the only trait system with a built-in **male / female split**.

| | |
| --- | --- |
| Library | `AssetManager.clan_traits` |
| Class | `ClanTrait` |
| Groups | `AssetManager.clan_trait_groups`, class `ClanTraitGroupAsset` |
| Owner at runtime | `Clan`, in `World.world.clans` |
| Locale prefix | `clan_trait_` |
| Default icon folder | `ui/Icons/clan_traits/` |

## Registering one

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

Clan `base_stats` merge into every member of the clan, so this is a real stat system unlike religion. See the merge order on **[Stats reference](#/nml/stats)**.

## The male / female split

The two fields no other trait class has:

```csharp
trait.base_stats["health"] = 20;           // every member
trait.base_stats_male["damage"] = 6;       // males only
trait.base_stats_female["intelligence"] = 4;   // females only
```

`Actor.updateStats()` merges `clan.base_stats`, then `clan.base_stats_male` **or** `clan.base_stats_female` depending on the unit's sex. Both extra blocks exist from the start, they are not allocated in `add()`, so you can write to them whenever.

## Decisions: what a clan *does*

Vanilla clan traits lean on decisions rather than actions, because a clan is a social thing:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");

// addDecision() stores an id; the library resolved ids at startup, before your mod
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("banish_unruly_clan_members") };
```

A decision is an AI choice in `AssetManager.decisions_library`. Two vanilla clan traits, `blood_pact` and `deathbound`, are the same trait with a different decision and are declared opposites of each other. That shape is worth copying: two traits, one axis, mutually exclusive.

## Combat and effect hooks

```csharp
// every hit a clan member lands
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// on a timer, on every clan member
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Guard for null, return `false` when you did nothing. These run for every member of every clan that has the trait.

## Locked behind an achievement

Several vanilla clan traits are rewards rather than defaults:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

A locked trait still exists and still works; the player just cannot pick it in the editor until the achievement is done. `BaseTraitLibrary` also auto-sets `rarity = R3_Legendary` on anything locked this way, so your reward looks the part :gold_star:.

## The vanilla groups

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Your own tab: see **[Trait groups & tabs](#/nml/trait-groups)**, with `AssetManager.clan_trait_groups` and `ClanTraitGroupAsset`.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Handing it out

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

A unit's clan is on `actor.clan`, and `actor.hasClan()` tells you whether it has one at all, plenty of units never join one.

> [!TIP] Clans are small, so you can be generous
> A culture covers a continent; a clan covers a family, and `limit_clan_members` caps how big it gets. A clan trait can be much stronger than a culture trait for the same amount of world-breaking, which makes clans the right home for the dramatic stuff :PES5_Menace:.

## New clans rolling a trait on their own

Besides handing it out yourself, a clan trait can set `spawn_random_trait_allowed` to be rolled when a new clan forms, the same way a culture rolls its starting traits. Same trap as on every other trait page:

> [!WARNING] `spawn_random_trait_allowed` is read once, at startup
> New clans roll their starting traits from a pool that `BaseTraitLibrary.linkAssets()` builds while the game loads, before your mod exists. Setting the flag on your trait changes nothing on its own: your trait is never in that pool, and it never turns up on a new clan by chance. Put it in yourself, weighted the way vanilla does it:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` is `protected`, so this compiles against the publicized assembly NML already builds your mod with. `spawn_random_rate` defaults to `5`: raise it and the trait turns up more often.
