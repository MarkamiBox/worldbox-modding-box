---
title: Kingdoms & factions
group: Game Content
subgroup: World & Civilizations
icon: :wbkingdoms:
order: 178
---

# Kingdoms & factions :wbkingdoms:

Every unit in WorldBox belongs to a kingdom. Not just the civilised ones: wolves belong to a wolf kingdom, bandits to a bandit kingdom, and a neutral chicken belongs to a neutral one. A `KingdomAsset` is the **type** of faction, not one kingdom on the map.

That is the distinction to hold on to:

| | |
| --- | --- |
| `KingdomAsset` in `AssetManager.kingdoms` | The template. "What an orc kingdom is" |
| `Kingdom` in `World.world.kingdoms` | One actual kingdom in the running world, with a name, a colour and cities |

You register the first. The game creates the second.

## Cloning one

Like actors, kingdoms have `$TEMPLATE$` ids for exactly this:

| Template | For |
| --- | --- |
| `$TEMPLATE_CIV$` | A civilisation faction |
| `$TEMPLATE_CIV_NEW$` | The newer animal-civ style |
| `$TEMPLATE_NOMAD$` | The wild stage before a creature settles |
| `$TEMPLATE_MOB$` | A hostile faction |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Hostile to some things, friendly to civs |
| `$TEMPLATE_ANIMAL$` | Wildlife |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Wildlife that will not start fights |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // The settled faction.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // The wild stage, before they found a city.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` has already set `nomads = true`, `civ = false` and `mobs = true` for you, so you never write those. That is worth saying out loud because it catches people: **`civ`, `nomads`, `mobs` and friends are `bool` fields, not tags.** `wild.nomads = true` is a field. `wild.addTag("nomads")` is a tag nothing in the game reads, and it fails silently :aPES_Liar:.

Then point your actor at them, which is the step that actually connects the two:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Without that, your creature spawns into whatever kingdom its donor used, which is usually "human" and usually confusing.

## The fields

### What kind of faction it is

| Field | What it does |
| --- | --- |
| `civ` | Founds cities, fights wars, has a leader |
| `nomads` | The wandering stage before settling |
| `nature` | Wildlife |
| `mobs` | Hostile monsters |
| `neutral` | Attacks nobody unprovoked |
| `abandoned`, `concept` | Bookkeeping factions, not real ones |
| `brain` | The AI-controlled meta faction |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | Which bucket the game's own lists put it in |

### How it behaves

| Field | What it does |
| --- | --- |
| `always_attack_each_other` | Two kingdoms of this type are permanently hostile |
| `units_always_looking_for_enemies` | Units never stop hunting |
| `count_as_danger` | Whether other factions treat it as a threat. `true` by default |
| `friendship_for_everyone` | Friendly to everything |
| `force_look_all_chunks` | Units scan the whole map, not just nearby. Expensive |
| `building_attractor_id` | A building type that draws them in |

### Tags: who fights who

This is the important part, and it is not a stat, it is three sets of strings:

```csharp
kingdom.addTag("civ");             // what I am
kingdom.addFriendlyTag("neutral"); // who I like
kingdom.addEnemyTag("orc");        // who I hate
```

Two kingdoms compare tags to decide their default stance. A faction with no tags likes nobody, hates nobody, and does nothing interesting.

### Look

| Field | What it does |
| --- | --- |
| `path_icon`, `show_icon` | The faction icon. `setIcon(path)` sets both |
| `default_kingdom_color`, `default_civ_color_index` | The starting colour |
| `color_building` | Tint applied to their buildings |

## The rest of the faction wiring

A kingdom asset on its own is a label. These are the other libraries a full faction touches, and they each have their own asset type:

| What | Library | Used for |
| --- | --- | --- |
| Banners | `AssetManager.kingdom_banners_library` | The generated flag |
| Colours | `AssetManager.kingdom_colors_library` | The palette kingdoms are assigned from |
| Kingdom traits | `AssetManager.kingdoms_traits` | Policy, mostly tax. See **[Kingdom traits](#/nml/kingdom-traits)** |
| Kingdom jobs | `AssetManager.job_kingdom` | What the faction's AI is working on |
| Kingdom tasks | `AssetManager.tasks_kingdom` | The behaviour tree behind those jobs |
| War types | `AssetManager.war_types_library` | The kinds of war that can be declared |
| Architecture | `AssetManager.architecture_library` | What their buildings look like |
| Build orders | `AssetManager.city_build_orders` | What a new city builds, and in what order |
| Name generators | `AssetManager.name_generator`, `AssetManager.name_sets` | How kingdoms, cities and people are named |

Reuse the vanilla ones until you have a reason not to. `banner_id = "human"` on your actor asset gives you a working flag generator for free.

## Touching kingdoms at runtime

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` is an extension method meaning "this object has been destroyed but something still holds a reference to it". Check it in every loop over kingdoms, cities, armies or units. It is the difference between a mod that works and a mod that throws once an hour :aPES2_Sweat:.

## Personalities

A king and a city leader get a **personality**: a label and a handful of `personality_*` stats that steer how aggressive or diplomatic the kingdom plays. Registering one is three lines. Getting anybody to *have* it is the problem: `Actor.updateStats()` picks one of four vanilla ids by name, every time the stats change.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

The postfix runs after every stats update, so the swap sticks. It takes the vanilla personality's numbers back out before adding yours, otherwise the ruler would carry both. `s_personality` and `mergeStats()` are `internal`: this compiles against the **publicized** assembly NML uses.

## Opinion, loyalty and happiness

Three small libraries decide how the politics feel, and all three are lists of little calculators:

| Library | Called for | Returns |
| --- | --- | --- |
| `AssetManager.opinion_library` | Every pair of kingdoms | Points of opinion one has of the other |
| `AssetManager.loyalty_library` | Every city | Points of loyalty to its kingdom |
| `AssetManager.happiness_library` | Events that happen to a unit | A fixed change in happiness |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

Opinion and loyalty are summed from the whole list each time, so `add()` is all they need, and each one shows up as its own line in the game's breakdown, using `translation_key`, or `translation_key_negative` when the number is below zero. Happiness events fire when your code calls `actor.changeHappiness("hello_warm_embers")`, which the festival in **[Plots](#/nml/plots)** does.

> [!WARNING] Happiness entries are numbered at startup
> A unit's happiness history stores the entry's *number*, not its id, and `HappinessLibrary.post_init()` hands the numbers out once. Yours is left at 0, so the history would show it as the first vanilla entry. Set `index` yourself.

## Banners for the other systems

Kingdoms are not the only things with a banner: cultures, religions, clans, languages, subspecies and families each have their own library of parts, `AssetManager.culture_banners_library` and friends. Each has one `main` asset with lists of paths, and a new culture rolls an index into them.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

Paths are loaded one at a time when a banner is drawn, so there is nothing to refresh. An index past the end of the list falls back to 0, which is why a save made with your mod still opens without it. Match the size of the vanilla parts: read one off in **[UnityExplorer](#/toolbox/unity-explorer)** before you draw yours.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] You probably do not need a new kingdom asset
> A new creature needs one. A new *behaviour* does not: most "faction" mods are better done as kingdom traits, a culture, or a Harmony patch on the diplomacy checks. Add a kingdom asset when your creature needs its own place in the world, not when you want existing kingdoms to act differently.
