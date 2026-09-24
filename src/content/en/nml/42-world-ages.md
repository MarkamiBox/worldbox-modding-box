---
title: World ages & behaviours
group: Game Content
subgroup: World & Civilizations
icon: :wbsunblessed:
order: 174
---

# World ages & behaviours :wbsunblessed:

Two things belong to the world itself rather than to anybody living in it. A **world age** is the era on the age wheel: the Age of Hope, the Age of Ash, with their weather, their light and their rules. A **world behaviour** is a piece of code the world runs on a timer, forever: it is how vanilla schedules disasters, migrants and road decay.

One file, both of them:

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## World ages

The Age of Embers rains embers every eight seconds, darkens the screen with ash, spreads fire twice as fast and keeps cities a little more loyal. A new world may put it on slot 4 of its wheel, and the wheel's randomize button can roll it anywhere. Subtlety was never the point of HelloBox :wbfireskull:.

> [!WARNING] Three things the library did at startup
> `post_init()` sets every age's background from its id, and `linkAssets()` builds `list_only_normal` (the pool for the random "unknown" age) and `pool_by_slots` (the pools a new world fills its wheel from). A new age is in none of them. Skip the background and the wheel shows an empty piece; skip the pools and the age exists but no world ever rolls it.

> [!NOTE] The list of ages to pick from
> The ages window builds one button per age when it wakes up, and the game preloads that window. I have not checked whether it wakes up before or after mods load, so whether yours gets a button there is something to look at in game, not something I will promise. The wheel, the random pools and the special effect do not depend on it.

| Field | What it does |
| --- | --- |
| `rate` | Weight when an age is picked at random |
| `default_slots` | Which wheel slots (1 to 8) a new world may put it in |
| `clouds` + `cloud_interval` | The clouds it spawns, and how often |
| `special_effect_action` + `special_effect_interval` | Your code, on a timer, while the age lasts |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | The look: darkness, rain, snow, ash, sun |
| `title_color`, `light_color` | The colour of its name, and of the light |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Numbers added to the world's politics and plants |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | The rules it bends |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Switches other systems check. Crops only grow while `flag_crops_grow` is true |

The text keys are `<id>_title` and `<id>_description`.

## World behaviours

A behaviour is two numbers and a delegate: run `action` every `interval` seconds, plus up to `interval_random` more. It pauses with the world unless you set `stop_when_world_on_pause = false`, and `action_world_clear` runs when a new world is loaded.

> [!WARNING] The manager is created at startup
> The world keeps one `WorldBehaviour` timer per asset, created by `createManagers()` when the map first wakes up, before your mod. Yours has `manager == null`, and the world's update loop calls it anyway: `NullReferenceException`, every frame, for as long as the game runs :wbfacepalm:. The one line after `add()` fixes it.

HelloBox's behaviour does nothing while its world law is off. That is the pattern worth copying: the check is cheap, so let the timer run and decide inside the action.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

For code that should run on its own schedule without being part of the world, like UI, NML's `Update()` on your main class is still the simpler place: see **[The finished mod](#/nml/all-together)** :PES_OkHand:.
