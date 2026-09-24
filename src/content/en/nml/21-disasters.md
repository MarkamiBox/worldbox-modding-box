---
title: Disasters
group: Game Content
subgroup: World & Civilizations
icon: :wbmeteorite:
order: 184
---

# Disasters :wbmeteorite:

A disaster is something the world does to itself: a tornado, a heatwave, a meteorite. The game rolls for them as time passes, so unlike a god power, **nobody has to click anything**. You set the conditions, the world does the rest.

## Add one

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

Stage it in `Main.cs` (see **[The finished mod](#/nml/all-together)**), load a world with at least one city and a hundred units, and wait. Eventually the sky starts dropping embers on its own :wbfireskull:.

### The fields

`rate` and `chance` are the two you will fiddle with most. The warning at the bottom of the page explains why.

| Field | What it does |
| --- | --- |
| `rate` | Weight in the draw. Higher means picked more often relative to the others |
| `chance` | A second roll once it has been picked |
| `min_world_population` / `min_world_cities` | Conditions before it can happen at all |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | The id of a `WorldLogAsset`: the line in the world log. **Not** a locale key, see below |
| `action` | Your code. This is the disaster |
| `spawn_asset_unit` + `units_min`/`units_max` | Shortcut for "spawn N of this creature" |
| `max_existing_units` | Don't spawn more if this many already exist |
| `ages_allow` / `ages_forbid` | Restrict it to world ages, e.g. only in the Age of Ash |

Restricting to an age is done after building the asset:

```csharp
emberStorm.ages_allow.Add("age_ash");
emberStorm.ages_allow.Add("age_chaos");
```

## Spawning creatures instead of writing an action

If your disaster is "a bunch of things show up", you do not need any code:

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 3,
    chance = 0.5f,
    type = DisasterType.Other,
    world_log = "disaster_hello_wolf_year",
    spawn_asset_unit = "wolf",
    units_min = 5,
    units_max = 12,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"No code" is almost true. A disaster **always** needs an `action`, because the disaster roll calls it without a null check: leave it empty and the first time yours is picked, `NullReferenceException`. Vanilla's creature disasters all point at the library's own `simpleUnitAssetSpawnUsingIslands`, which reads `spawn_asset_unit`, `units_min`, `units_max` and `max_existing_units`, and writes the world log line for you. So can yours.

## The line in the world log

`world_log` is not the text. It is the **id of a `WorldLogAsset`** in `AssetManager.world_log_library`, and that asset points at the text. Name one that does not exist, and the moment the disaster logs itself, `WorldLog.logDisaster()` builds a message around `null` and throws `NullReferenceException` :wbfacepalm:.

Vanilla disasters clone one template, `$basic_disaster$`, which already has the warning colour and the "disasters" group. So does `HelloDisasters` above:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Then something has to write the line. The vanilla spawners call `WorldLog.logDisaster(pAsset, tile)` themselves. A custom `action` does not, so yours calls it once, with the tile the storm started on: that is the spot the log's "go there" button jumps to.

| `WorldLogAsset` field | What it does |
| --- | --- |
| `locale_id` | The text key. Falls back to the id when empty |
| `path_icon` | The icon at the start of the line |
| `color` | The line's colour. The template's is the warning one |
| `group` | Which filter of the world log it belongs to |
| `random_ids` | Pick one of several texts: `<locale_id>_1`, `_2`... |

The wolf example needs the same two things: its own cloned log asset under `disaster_hello_wolf_year`, and a `worldlog_disaster_hello_wolf_year` text. The vanilla spawner writes the line for it.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Write it like a news headline, not a description. "Embers fall from the sky" beats "an ember-related event has started". It is the line the player reads in the world log.

> [!WARNING] Test with the numbers turned up
> `rate = 4, chance = 0.5f` means you might wait twenty minutes to see your own disaster. While developing, crank `rate` way up and drop the minimums to zero, then put them back before you publish :PES2_EvilPlan:.
