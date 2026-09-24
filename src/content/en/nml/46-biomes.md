---
title: Biomes
group: Game Content
subgroup: World & Civilizations
icon: :wbflowerbud:
order: 171
---

# Biomes :wbflowerbud:

A biome is the part of the world everything else hangs off: which ground it paints, which trees and plants grow on it, which creatures wander in, and which traits the things born there pick up. Biome mod? In this economy? Yes, and it is less work than it looks, because a biome is mostly a list of other people's ids :PESgn_Noice:.

This page builds **Ember Fields**: its own two tiles, its own seeds, some savanna creatures, and a trait for anything born there.

## The pieces

A biome is not one asset, it is four that point at each other:

| Piece | Library | What it does |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | The biome itself: what grows, what spawns, how it spreads |
| Two `TopTileType` | `top_tiles` | The ground it paints: a **low** one and a **high** one |
| `DropAsset` | `drops` | The seeds that fall and turn ground into your biome |
| `GodPower` | `powers` | The button the player uses to throw the seeds |

The tiles say which biome they belong to (`biome_id`), and the biome says which tiles are its own (`tile_low`, `tile_high`). Both directions have to agree.

## The code

```csharp Mods/HelloBox/Code/HelloBiomes.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloBiomes
    {
        public const string BIOME = "biome_hello_ember";
        public const string LOW = "hello_ember_low";
        public const string HIGH = "hello_ember_high";
        public const string SEEDS = "seeds_hello_ember";

        public static void Initialize()
        {
            if (AssetManager.biome_library.has(BIOME)) return;

            // 1. The ground. Clone the grass pair and point both at your biome.
            TopTileType low = Tile(LOW, "grass_low", "#B5582A");
            TopTileType high = Tile(HIGH, "grass_high", "#8E4020");

            // 2. The biome.
            BiomeAsset biome = new BiomeAsset
            {
                id = BIOME,
                tile_low = LOW,
                tile_high = HIGH,
                localized_key = BIOME,              // its text key, in snake_case
                spread_biome = true,                // grows into the grass next to it
                spread_by_drops_water = true,
                generator_pot_amount = 3,           // how often new worlds roll it. Grass uses 8
                grow_type_selector_minerals = TileActionLibrary.getGrowTypeRandomMineral,
                grow_type_selector_trees = TileActionLibrary.getGrowTypeRandomTrees,
                grow_type_selector_plants = TileActionLibrary.getGrowTypeRandomPlants,
                grow_type_selector_bushes = TileActionLibrary.getGrowTypeRandomBushes,
                subspecies_name_suffix = new string[] { "cinereus", "ardens" }
            };
            AssetManager.biome_library.add(biome);

            // what grows and what walks in. The number is the weight
            biome.addTree("savanna_tree_1", 3);
            biome.addPlant("savanna_plant");
            biome.addBush("fruit_bush");
            biome.addMineral("mineral_stone", 4);
            biome.addUnit("hyena");
            biome.addUnit("buffalo", 2);
            biome.addSapientUnit("human");

            // born here, gets this. biome.addActorTrait() does the same, but it is internal:
            // fine inside NML, a compile error in your own .dll. The list works everywhere
            biome.spawn_trait_actor = new List<string> { "fire_proof" };

            // linkAssets() built the world generator's pool at startup, before your mod existed.
            for (int i = 0; i < biome.generator_pot_amount; i++)
            {
                BiomeLibrary.pool_biomes.Add(biome);
            }

            // now the tiles can link back to the biome that exists
            low.biome_asset = biome;
            high.biome_asset = biome;

            // 3. The seeds. Clone the grass seeds and aim them at your two tiles.
            DropAsset seeds = AssetManager.drops.clone(SEEDS, "seeds_grass");
            seeds.drop_type_low = LOW;
            seeds.drop_type_high = HIGH;
            // DropsLibrary.linkAssets() turns those ids into tiles at startup. Do it yourself.
            seeds.cached_drop_type_low = low;
            seeds.cached_drop_type_high = high;

            // 4. The power that throws them.
            GodPower power = AssetManager.powers.clone(SEEDS, "$template_seeds$");
            power.drop_id = SEEDS;
            power.name = SEEDS;                     // also its text key
            power.path_icon = "ui/Icons/iconHelloSeeds";
        }

        private static TopTileType Tile(string pId, string pFrom, string pColor)
        {
            TopTileType tile = AssetManager.top_tiles.clone(pId, pFrom);
            tile.setBiome(BIOME);
            tile.color_hex = pColor;

            // [NonSerialized] fields: clone() skips them and linkAssets() already ran.
            tile.color = Toolbox.makeColor(tile.color_hex);
            tile.has_biome_tags = tile.biome_tags != null && tile.biome_tags.Count > 0;

            // your art in GameResources/tiles/<id>/, loaded at startup in the vanilla case
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + tile.id);
            if (variations.Length > 0)
            {
                tile.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    tile.sprites.addVariation(variation, tile.id);
                }
            }
            return tile;
        }
    }
}
```

Add `HelloBiomes.Initialize();` to `OnModLoad`, then give the power a button like any other: **[Power tabs & buttons](#/nml/power-buttons)**.

> [!WARNING] Order inside Initialize matters
> The tiles are cloned before the biome exists, so their `biome_asset` is set **after** `add()`. Link it earlier and you link to `null`, and a tile with a null biome grows nothing and spawns nobody, without a single error :wbfacepalm:.

## The fields that matter

| Field | What it does |
| --- | --- |
| `tile_low` / `tile_high` | The two ground tiles this biome paints. Low ground and high ground |
| `localized_key` | Its text key, turned into snake_case. `biome_hello_ember` stays as it is |
| `spread_biome` | Spreads into neighbouring tiles on its own |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Which falling drops can carry it somewhere else |
| `generator_pot_amount` | How many tickets it gets in the world generator. 0 = never rolled for a new world |
| `grow_strength` | How hard it pushes when spreading. Default 6 |
| `cold_biome` / `dark_biome` | Flags other systems check. Set only if it really is cold or dark |
| `special_biome` | Marks the odd ones that are not a normal green biome. Vanilla uses it for sand and hills |
| `subspecies_name_suffix` | Latin-ish endings for subspecies that evolve here |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Traits things founded here can pick up |

### What grows and what spawns

`addTree`, `addPlant`, `addBush` and `addMineral` take a building id and a weight. `addUnit` adds wildlife, `addSapientUnit` adds the species that can start a civilisation here. The weight is not a percent, it is how many times the id goes in the bag: `addUnit("buffalo", 2)` makes buffalo twice as likely as the hyena.

Any id works, including your own creatures from **[Custom actors](#/nml/custom-actors)**, as long as they are registered before the biome.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## Your own art

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

The tiles follow the same rules as **[Tiles & terrain](#/nml/tiles)**: the folder name is the tile id, and every PNG in it is one variation. Skip the art while testing and the clones keep the grass sprites, only in your colour on the minimap.

## Testing it

Make a new world a few times and look for your colour. With `generator_pot_amount = 3` against grass's 8 it will not show up every time, so for testing, throw your seeds on some grass instead. It should turn, start growing savanna trees, and after a while hyenas wander in.

> [!NOTE] What I have not covered
> Creep biomes, the ones buildings spread like corruption, use a different path (`grow_creep_type` on the building). That is a page of its own and I have not written it yet :PES2_Shrug:.
