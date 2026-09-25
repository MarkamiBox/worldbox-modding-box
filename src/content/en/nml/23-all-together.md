---
title: The finished mod
group: Game Content
subgroup: Finishing Touches
icon: :wbpeak:
order: 222
---

# The finished mod :wbpeak:

If you followed the pages in order, you have been adding one file at a time to the same mod since **[Your first mod](#/nml/your-first-mod)**. This page is the assembly: what HelloBox looks like when every piece is in, and how the pieces call each other.

## What you built

Forty-odd files, and this is what they add up to in game. Every row is a page or a section of this guide :wbpeak:.

| What | Where you see it |
| --- | --- |
| An actor trait, and a tab of your own to hold it | The unit inspector, trait list |
| Culture, religion, subspecies, clan, language and kingdom traits | Their own windows, one per system |
| A weapon, its enchantment and a category for both | A unit's hands, the equipment tabs |
| A status effect | Above the creature's head, with its own icon |
| Drops, a cloud that rains them and a projectile | The map, mid-air, mid-fight |
| A tile | The terrain, under everything |
| A food recipe | A city's stores |
| A world law | The World Laws window |
| A god power, its tab and its button | The power bar at the bottom |
| A window | Wherever you decide to put it |
| A building | A city, once somebody builds it |
| A kingdom and a creature that belongs to it | The map, spawning and fighting |
| A disaster | The disasters menu |
| Its own AI job | The creature, walking somewhere on purpose |
| A Harmony patch | Nowhere, which is the point: it changes a rule quietly |
| A trait that remembers, in the save | The unit, fifty hits later |
| A decision, a city job and a tool in hand | Wisps wandering with a torch, one keeper per city |
| A combat action | Units with the swift trait, throwing embers before they close in |
| A gene, a personality, a book type, a culture banner part | The genome, rulers, libraries, flags |
| Opinion, loyalty and a happiness event | The diplomacy and city breakdowns |
| A plot | The plot list, when a leader throws an ember festival |
| A world age and a world behaviour | The age wheel, and the world's own timer |
| An achievement | The achievements window, at ten wisps |
| A brush, a tooltip and a hotkey | The brush rotation, the panel on hover, F6 |

## Take it with you

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">Download HelloBox</span>
    <span class="dl-sub">The finished mod, every file on this page. Unzip into <code>worldbox\Mods\</code> and start the game.</span>
  </span>
</a>

It is generated from the code blocks in this guide, so it is the same code you have been copying, not a separate copy that drifts. Read it, break it, delete the two thirds you do not want.

The advanced pages also show optional recipes: **[manual patches](#/nml/harmony-patches)**, **[timers and coroutines](#/nml/update-loops)**, **[map generation](#/nml/map-generation)**, **[game options](#/nml/game-options)** and **[working with other mods](#/nml/other-mods)**. Those are things to add when you need them. They are not enabled in this download.

> [!WARNING] It's a demo
> Publishing HelloBox as-is helps nobody: it is twenty features that each do one small thing badly on purpose. Change the ids, change the name, keep the parts you actually wanted  :wbbru:.

## The folder

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs, the whole thing

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Silence harmless missing NML UI keys from logging Debug.LogError and popping the console on language switch
            AssetManager.missing_locale_keys.Add("Information Title");
            AssetManager.missing_locale_keys.Add("NeoModList Title");
            AssetManager.missing_locale_keys.Add("WorkshopMods Title");
            AssetManager.missing_locale_keys.Add("ModUpload Title");
            AssetManager.missing_locale_keys.Add("ModUploadingProgress Title");
            AssetManager.missing_locale_keys.Add("ModUploadAuthentication Title");
            AssetManager.missing_locale_keys.Add("nml_authentication");
            AssetManager.missing_locale_keys.Add("ModConfigure Title");

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Why that order

Three files in that folder never appear in the list above, and that is correct:

| File | Who calls it |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` finds it by its attributes. You never call a patch yourself |
| `HelloSettings.cs` | The config loader writes into it when the player moves a slider |
| `HelloWindow.cs` | Its own button builds it the first time somebody opens it |

Your text needs no stage either: NML loads `Locales/en.json` before it knocks on `OnModLoad`, so every key is already there. Everything else is dependencies, and the order is not decoration:

1. **Groups before the things in them**, because an asset whose `group_id` points at nothing has no tab to be drawn in.
2. **Drops before clouds**, because a cloud names the drop it rains.
3. **Resources before items and buildings**, because both cost resources.
4. **Modifiers before items**, because a weapon lists the modifiers it can roll.
5. **Kingdoms before actors**, because an actor names its wild and civ kingdoms.
6. **Powers before their buttons**: `PowerButtonCreator` looks the power up by id, and a button bound to a missing power is a dead button.
7. **Anything the AI uses before the AI**, since a task refers to traits and statuses by id.
8. **Actors and the AI before decisions, city jobs and tools**, because those point at a creature and a task that must already exist.
9. **The world age after the cloud, the law and the status** its effects use. Plots, politics and achievements only look things up while the game runs, so they could go anywhere after their own dependencies.

When something does not show up in game, "did I register it after the thing that needed it?" is the second question to ask, right after "is it in the log?" :PES2_HmmmmNoted:.

## The check-list before you call it done

| | |
| --- | --- |
| Log | Start the game, search for `HelloBox`. You want "ready", and **no** `Exception` |
| Text | Nothing in game shows a raw key like `trait_hello_x` |
| Icons | No invisible holes in the power bar |
| Settings | Delete `mods_config/<GUID>.config`, restart, confirm the defaults are sane |
| Clean world | Load a fresh map and run it at full speed for five minutes, then re-read the log |
| Other mods | Turn a couple on. If you patch anything, somebody else patches it too |

Then go to **[Publishing your mod](#/nml/publishing)** and let other people break it :aPES3_VictoryPog:.

## Where to go next

- Delete the parts of HelloBox you do not care about. It was a demo, not a real mod.
- Pick **one** of them and make it good. A mod that does one thing well beats one that does twelve things badly.
- Read the vanilla code for whatever you picked (**[Reading the game's code](#/toolbox/reading-the-game-code)**). Everything you still do not know is written in there :PESgn_ReadRules:.
