---
title: 生物群系
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbflowerbud:
order: 171
---

# 生物群系 :wbflowerbud:

生物群系是世界里其他一切都挂在它上面的那一层：它铺什么地面，上面长什么树和植物，会有哪些生物走进来，出生在那里的东西会得到哪些特质。做群系 mod？这年头？是的，而且比看起来省事，因为一个群系基本上就是一份别人 id 的清单 :PESgn_Noice:。

这一页要做的是**余烬原野**：两块自己的地块、自己的种子、几种草原生物，以及一个给在那里出生的一切的特质。

## 组成部分

群系不是一个资产，而是四个互相指向的资产：

| 部分 | 库 | 作用 |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | 群系本身：长什么、生成什么、怎么扩散 |
| 两个 `TopTileType` | `top_tiles` | 它铺的地面：一块**低地**和一块**高地** |
| `DropAsset` | `drops` | 落下来把地面变成你的群系的种子 |
| `GodPower` | `powers` | 玩家用来撒种子的按钮 |

地块说明自己属于哪个群系（`biome_id`），群系说明哪些地块是自己的（`tile_low`、`tile_high`）。两个方向必须一致。

## 代码

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

把 `HelloBiomes.Initialize();` 加进 `OnModLoad`，然后像其他神力一样给它一个按钮：**[神力标签页与按钮](#/nml/power-buttons)**。

> [!WARNING] Initialize 里的顺序很重要
> 地块在群系存在之前就被克隆了，所以它们的 `biome_asset` 要在 `add()` **之后**设置。提前链接的话链接到的是 `null`，而群系为空的地块什么都不长、什么都不生成，而且一个错误都不报 :wbfacepalm:。

## 重要字段

| 字段 | 作用 |
| --- | --- |
| `tile_low` / `tile_high` | 这个群系铺的两块地面。低地和高地 |
| `localized_key` | 它的文本键，会被转成 snake_case。`biome_hello_ember` 保持不变 |
| `spread_biome` | 自己向相邻地块扩散 |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | 哪些掉落物能把它带到别处 |
| `generator_pot_amount` | 它在世界生成器里有几张签。0 = 新世界永远抽不到 |
| `grow_strength` | 扩散时推进的力度。默认 6 |
| `cold_biome` / `dark_biome` | 其他系统会检查的标记。只有真的寒冷或黑暗时才设置 |
| `special_biome` | 标记那些不是普通绿色群系的特殊群系。原版用在沙地和丘陵上 |
| `subspecies_name_suffix` | 在这里演化出的亚种使用的拉丁风格词尾 |
| `spawn_trait_actor`、`spawn_trait_subspecies`、`spawn_trait_culture`、`spawn_trait_clan`、`spawn_trait_language`、`spawn_trait_religion` | 在这里建立的东西可能获得的特质 |

### 长什么、生成什么

`addTree`、`addPlant`、`addBush` 和 `addMineral` 接收一个建筑 id 和一个权重。`addUnit` 添加野生动物，`addSapientUnit` 添加能在这里建立文明的物种。权重不是百分比，而是这个 id 放进袋子里的次数：`addUnit("buffalo", 2)` 让水牛出现的概率是鬣狗的两倍。

任何 id 都可以，包括你在 **[自定义生物](#/nml/custom-actors)** 里做的生物，只要它们在群系之前注册。

## 文本

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## 你自己的美术资源

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

地块遵循和 **[地块与地形](#/nml/tiles)** 相同的规则：文件夹名就是地块 id，里面每张 PNG 是一种变体。测试时先不做美术的话，克隆体会沿用草地的贴图，只是在小地图上显示你的颜色。

## 测试

多建几次新世界，找找你的颜色。`generator_pot_amount = 3` 对上草地的 8，不会每次都出现，所以测试时不如直接把种子撒在草地上。草地应该会变过来，开始长草原树，过一会儿鬣狗就会走进来。

> [!NOTE] 我还没讲的部分
> 蔓延型群系，也就是像腐化那样由建筑扩散的群系，走的是另一条路（建筑上的 `grow_creep_type`）。那是另一页的内容，我还没写 :PES2_Shrug:。
