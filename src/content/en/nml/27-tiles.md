---
title: Tiles & terrain
group: Game Content
subgroup: World & Civilizations
icon: :wbrockies:
order: 170
---

# Tiles & terrain :wbrockies:

The map is a grid of `WorldTile`, and every tile carries **two** types stacked on each other:

| Layer | Field on the tile | Library | Class | Examples |
| --- | --- | --- | --- | --- |
| Ground | `main_type` | `AssetManager.tiles` | `TileType` | soil, sand, rocks, deep ocean, lava |
| Top | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, walls |

Both are the same class underneath (`TileTypeBase`), so everything on this page works for either. The difference is only which layer they sit on, and that is decided by `layer_type`.

If you want to add a new kind of *ground*, that is a `TileType`. If you want something that sits **on** ground (a road, a wall, a crop, a moss), that is a `TopTileType`, and it is usually what you actually want.

## Clone, do not build

A tile type has around a hundred fields, most of which only matter for one vanilla tile. I am not going to list all hundred. Clone the closest relative:

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] A biome tile needs its biome linked
> Cloning a grass tile copies `is_biome = true` and the `biome_id`, but the `BiomeAsset` itself is only looked up in `TopTileLibrary.linkAssets()`, once, while the game loads. Skip that line and everything works until an animal is spawned on your tile: its species name gets the biome's suffix, the biome is `null`, and the spawn dies with `NullReferenceException` in `Subspecies.generateName()` :wbfacepalm:.
>
> The pictures have the same problem. `TopTileLibrary` turns the PNGs in `tiles/<id>/` into `sprites` during startup, so without the last block the tile paints fine and then the map renderer throws in `WorldTilemap.getVariation()` for every tile of it on screen.


## The fields worth knowing

### What kind of thing it is

| Field | What it does |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` or the top layer. Decides which library it belongs in |
| `ground`, `liquid`, `ocean`, `lava` | Broad category flags the whole game branches on |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Terrain family flags |
| `road`, `wall`, `farm_field` | Structure flags. The city AI reads these |
| `block`, `block_height` | Whether it stops movement, and how tall it draws |
| `is_biome`, `can_be_biome`, `biome_id` | Ties the tile to a biome |
| `biome_tags`, `has_biome_tags` | Which biomes will grow this tile |

### How it behaves

Start here if your tile is a gameplay idea and not just a new colour.

| Field | What it does |
| --- | --- |
| `walk_multiplier` | Movement speed on it. `1.0` is normal, lower is slower |
| `damage_units`, `damage` | Whether standing on it hurts, and by how much |
| `damaged_when_walked` | The tile itself wears down when walked on |
| `step_action`, `step_action_chance` | Your own code, every time something steps on it |
| `unit_death_action` | Your own code when something dies on it |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Fire behaviour |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Ice behaviour |
| `remove_on_heat`, `terraform_after_fire` | What heat and fire leave behind |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Detonation |
| `strength` | How much abuse it takes. Also what a wall mod reads for durability |
| `cost` | Pathfinding cost |

### What the player can do to it

| Field | What it does |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Which tool clears it |
| `allowed_to_be_finger_copied` | Whether the copy tool can pick it up |
| `can_build_on`, `can_be_farm` | Whether a city may use the tile |
| `only_allowed_to_build_with_tag` | Restricts building to one tag |

### Transitions

| Field | What it does |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | What it becomes when it grows or erodes |
| `freeze_to_id` | What it becomes when frozen |
| `fill_to_ocean`, `can_be_filled_with_ocean` | What it becomes underwater |
| `lava_increase` / `lava_decrease` / `lava_level` | Lava's own progression chain |

### Look

| Field | What it does |
| --- | --- |
| `color_hex` | Minimap and tint colour |
| `edge_color_hex` | The outline where it meets something else |
| `render_z`, `draw_layer_name` | Draw order. `setDrawLayer(...)` is the helper |
| `force_edge_variation`, `force_edge_variation_frame` | Locks the edge sprite variant |

## Running code when something steps on it

```csharp
moss.step_action_chance = 0.05f;   // 5% of steps
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

Same rules as every other action in this guide: guard for null first, return `false` when you did nothing, and remember this runs for every unit walking on every tile of this type.

## Your own art

Tiles are the odd one out: there is **no path field at all**. The game looks for a folder named after the tile's **id**, and loads everything inside it as variations.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- the tile's id, exactly
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

Nothing to set in code. Name the folder after the id you registered and the tile finds it.

Several files in that folder become random variations, which is what stops a field of your tile looking like wallpaper. One file works too. Ground tiles and top tiles both load this way.

`color_hex` is separate and still matters: it is what the minimap draws, and it is what tints the tile when the game needs to.

## Changing tiles at runtime

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // change the top layer
tile.setTileType(AssetManager.tiles.get("sand"));                // change the ground
tile.setTileTypes("sand", null);                                 // ground, and clear the top
```

All three are public. Changing a tile marks its chunk dirty and the renderer picks it up on its own.

### Reading what is there

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

Both `main_type` and `top_type` can be `null`. Check before you touch them. This is the single most common crash in any mod that walks the map :PES2_F:.

## Terraform options

A `TerraformOptions` in `AssetManager.terraform` is a named bundle of "clean this tile up", used by god powers and projectiles:

| Field | What it does |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Strip structures |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Strip leftovers |
| `destroy_buildings`, `make_ruins` | What happens to what is built there |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Strip states |
| `add_burned`, `add_heat`, `flash` | Add states |

A `ProjectileAsset` names one in `terraform_option` with a `terraform_range`, which is how an explosive arrow clears the ground it lands on.

## Biomes

A `BiomeAsset` in `AssetManager.biome_library` is what decides which tiles appear where. A tile joins a biome through `setBiome("biome_forest")` or by carrying the right `biome_tags`. Cloning an existing biome and swapping its tile ids is a much shorter path than building one, and the same "clone registers for you" rule applies.

> [!TIP] Top tiles are where the mods are
> Almost everything people actually build (walls, roads, crops, corruption spreading across a continent) is a top tile with a `step_action` and a bit of code deciding where to place it. New ground types are rarer, harder to make look right, and interact with the world generator in ways you did not ask for :PES3_Yikes:.
 
