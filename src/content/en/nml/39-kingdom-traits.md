---
title: Kingdom traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbcrown:
order: 114
---

# Kingdom traits :wbcrown:

A **kingdom trait** is policy. Not a belief, not a bloodline: a decision the crown has made that applies to the whole realm.

Vanilla only uses it for one thing, tax rates, which makes this the smallest and the emptiest of the seven trait systems, and therefore the most interesting place to put a new one. Nobody is competing for the space :wbsmirk:.

| | |
| --- | --- |
| Library | `AssetManager.kingdoms_traits` |
| Class | `KingdomTrait` |
| Groups | `AssetManager.kingdoms_traits_groups`, class `KingdomTraitGroupAsset` |
| Owner at runtime | `Kingdom`, in `World.world.kingdoms` |
| Locale prefix | `kingdom_trait_` |
| Default icon folder | `ui/Icons/kingdom_traits/` |

> [!WARNING] Kingdom stats do not reach units
> Like religion, `kingdom.base_stats` is never merged into an `Actor`. The kingdom-level numbers you see in game come from the **king's own stats** (`king.stats["cities"]` and friends), not from the kingdom's trait block.
>
> So a kingdom trait changes the realm through its own fields and through code, not through `base_stats`.

## The tax fields

The three fields only kingdom traits have, and the whole of what vanilla does with this system:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Field | What it does |
| --- | --- |
| `is_local_tax_trait` | This trait sets the kingdom's **local** tax rate |
| `is_tribute_tax_trait` | This trait sets the kingdom's **tribute** rate |
| `tax_rate` | The rate itself, as a fraction |

The kingdom recalculates both rates from scratch whenever its traits change: it starts from the global default in `SimGlobals`, then walks its traits and lets each matching one **overwrite** the value.

> [!WARNING] Last one wins, so declare your opposites
> Tax traits do not add up. If a kingdom holds two `is_local_tax_trait` traits, whichever comes later in its trait set silently wins, and which one that is depends on iteration order.
>
> Every vanilla tax trait declares the other one as its opposite for exactly this reason. Do the same, on both sides, or your rate will sometimes apply and sometimes not :PES5_HmmmmNo:.

## Registering one properly

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` is read once, at startup
> New kingdoms roll their starting traits from a pool that `BaseTraitLibrary.linkAssets()` builds while the game loads, before your mod exists. Setting the flag on your trait changes nothing on its own: your trait is never in that pool, and it never turns up by chance. Put it in yourself, weighted the way vanilla does it:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` is `protected`, so this compiles against the publicized assembly NML already builds your mod with. `spawn_random_rate` defaults to `5`: raise it and the trait turns up more often.

## Making a policy that actually does something

Since `base_stats` is out, a kingdom trait earns its keep one of two ways. Both are more work than a number, and both are worth it.

**A decision**, which is the tidy option:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**A Harmony patch that reads the trait**, which is how you build a real policy system. Patch whatever the crown's behaviour actually consults, and check the kingdom's traits there:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

That is the pattern for every kingdom policy that is not a tax rate: the trait is the switch, and your patch is the behaviour. See **[Harmony patches](#/nml/harmony-patches)**.

## The vanilla groups

`tribute` · `local_tax` · `miscellaneous` · `fate`

Four groups, two of which are the tax pair. If you are building more than one or two policies, give them a tab of their own, see **[Trait groups & tabs](#/nml/trait-groups)**, with `AssetManager.kingdoms_traits_groups` and `KingdomTraitGroupAsset`.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Handing it out

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

The kingdom asset a faction was built from is a separate thing, see **[Kingdoms & factions](#/nml/kingdoms)**.

> [!TIP] The empty room
> Six of the seven trait systems are crowded with vanilla content you have to work around. This one has five traits in it. If you want a mod that feels like it belongs in the game and does not fight anything, a set of kingdom policies is the cheapest way there :PES2_Cash:.
