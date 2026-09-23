---
title: Custom buildings
group: Game Content
subgroup: Actors, Buildings & AI
icon: :wbcities:
order: 142
---

# Custom buildings :wbcities:

Buildings are where modding WorldBox stops being "change a number" and starts being "this asset has a hundred and forty fields and most of them do nothing for my case" :PES2_Weary:.

So we do not build one from scratch. We clone one that already works.

## Clone first, tweak after

`clone(newId, sourceId)` copies every field of the original, renames it, **and registers it**. That last part matters:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

Everything you do not set stays exactly as it was on `temple_human`, which is a working city building. That is the entire trick.

> [!WARNING] Do not call `add()` after `clone()`
> `clone()` already registered the copy. Calling `AssetManager.buildings.add(shrine)` afterwards registers it a second time, which makes the library drop the first copy and log `duplicate asset - overwriting...`. It still works, but it is noise in your log and the first thing anyone reviewing your code will point at.

## What to clone from

The library has `$…$` templates as well as finished buildings:

| Source | For |
| --- | --- |
| `$building$` | The bare base |
| `$city_building$` | Anything a city builds. `well` and `mine` use it |
| `$city_colored_building$` | Same, but tinted by kingdom colour |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Per-culture civ buildings |
| `$building_creep$` | Creep structures |
| `$mineral$` | Mineable rocks |
| `$resource$`, `$flora_small$` | Harvestable nature |
| `tree_green_1` | Every vanilla tree is cloned from this one |

Finished buildings worth cloning: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Cloning the closest relative is ten minutes of reading that saves an evening of fields that do nothing.

## The fields, by what you want

### What kind of building it is

| Field | What it does |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | It belongs to a city, so it gets kingdom colours, zones and jobs |
| `type` | A free-text tag the game's own lists group by |
| `kingdom`, `civ_kingdom` | Restrict it to one faction |
| `ignored_by_cities` | Cities never build or count it |

### Housing and use

| Field | What it does |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Whether and how many citizens live in it |
| `housing_happiness` | Mood bonus from living there |
| `storage`, `storage_only_food`, `is_stockpile` | Whether it stores resources |
| `book_slots` | Library capacity |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | Boat production |
| `spawn_units`, `spawn_units_asset` | It spawns creatures |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | It shoots |

### Building and placing it

| Field | What it does |
| --- | --- |
| `cost`, `construction_progress_needed` | What a city pays and how long it takes |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | Upgrade chains, like `house_human_0` through `_5` |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | Where in a town it goes |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | Placement rules |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | How many may exist |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | Terrain rules |
| `build_road_to` | The city runs a road to it |

### Nature and growth

| Field | What it does |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | It appears on its own as the world runs |
| `growth_time`, `has_resources_grown_to_collect` | Fruit and crop cycles |
| `biome_tags_growth`, `has_biome_tags` | Which biomes grow it |
| `resources_given`, `addResource(id, amount, pNewList)` | What harvesting it yields |
| `can_be_chopped_down`, `gatherable` | Whether units may harvest it |
| `grow_creep` and its `grow_creep_*` siblings | Creep spreading behaviour |

### Damage and death

| Field | What it does |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | What hurts it |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | What it leaves behind |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | How it goes away |
| `loot_generation` | What drops when it dies |

### Look

| Field | What it does |
| --- | --- |
| `sprite_path` + `main_path` | Where the sprite lives |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Which sprite atlas |
| `scale_base`, `bonus_z`, `random_flip` | Size, draw order, mirroring |
| `shadow`, `shadow_bound`, `shadow_distortion` | The shadow |
| `has_kingdom_color` | Tinted by the owning kingdom |
| `draw_light_area`, `draw_light_size` | Glow |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | Animation |

### Behaviour

| Field | What it does |
| --- | --- |
| `step_action`, `has_step_action` | Your own code, on the building's own tick |
| `base_stats` | Stats the building contributes |
| `priority` | Where it sits in the city's build queue |

## Sprites

Buildings load their art from `sprite_path`, used **exactly as written**. Only when you leave `sprite_path` empty does the game fall back to `main_path + id`. Put your art under `GameResources/buildings/hello_shrine/` and give it a bottom-centre pivot in your `sprites.json`, or your shrine floats above the ground like a ghost :aPES_GhostDance:. See **[Sprites & resources](#/nml/sprites-and-resources)**.

## Your own sprite

Pick one of the two shapes below and do not mix them. The loader is literally: use `sprite_path` if it has anything in it, otherwise use `main_path + id`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

The **file names are the format**. The loader splits each name on `_`: the part before is the kind (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`, and `mini` for the minimap), the number after is the animation frame. `mini_0` has to be exactly as many pixels as the building covers tiles, 5x4 for anything cloned from `temple_human`; leave it out and the minimap throws `NullReferenceException` in `Building.getColorForMinimap()` every time it redraws. `main_0`, `main_1`, `main_2` is a three-frame animation. A file called anything else is not a frame, and a folder with no `main_0` gives the building nothing to draw.

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

Mix them, folder in `main_path` and an empty `sprite_path`, and the game looks for `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Load the frames yourself, after setting the path
> The game fills `building_sprites` for every building in its own preload, which runs before your mod. A building you register afterwards has an empty frame list, and the first time one is placed the game dies in `Building.setAnimData()` with `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Call `shrine.loadBuildingSprites();` once `sprite_path` is set.
>
> Its sibling is `atlas_asset`, the sprite atlas that paints the building in its owner's colour. The library links it in `checkAtlasLink()`, also at startup. Skip it and the building places fine, then throws `NullReferenceException` in `DynamicSprites.getRecoloredBuilding()` on **every frame it is on screen**.

Give it a **bottom-centre pivot** in your `sprites.json`, or your shrine floats above the ground like a ghost (see **[Sprites & resources](#/nml/sprites-and-resources)**).

## Putting one on the map

`World.world.buildings.addBuilding(...)` is marked `internal`, so this compiles when you reference a **publicized** `Assembly-CSharp.dll` (see the note in **[Status effects](#/nml/status-effects)**):

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Always ask `canBuildFrom` first. Dropping a building on water, on another building, or on a tile a city has claimed for something else gives you a world that looks fine and breaks three minutes later :PES_OhShit:.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Read the original before you clone it
> Open `BuildingLibrary` in **dnSpy** and look at how `house_human_0`, `tree_green_1` and `mineral_stone` differ. Every vanilla building is constructed there in plain C#, which makes it the best field-by-field documentation that exists :PES_Smart:.
