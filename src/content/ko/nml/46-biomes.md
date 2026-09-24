---
title: 생물 군계
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbflowerbud:
order: 171
---

# 생물 군계 :wbflowerbud:

생물 군계는 세계의 나머지 모든 것이 매달려 있는 부분입니다: 어떤 땅을 칠하는지, 그 위에 어떤 나무와 식물이 자라는지, 어떤 생물이 들어오는지, 그곳에서 태어난 것들이 어떤 특성을 얻는지. 군계 모드? 이 경제에? 네, 게다가 보기보다 일이 적습니다. 군계는 대부분 남들의 ID 목록이니까요 :PESgn_Noice:.

이 페이지에서는 **잿불 들판**을 만듭니다: 자기만의 타일 두 개, 자기만의 씨앗, 사바나 생물 몇 종, 그리고 그곳에서 태어나는 모든 것에 붙는 특성 하나.

## 구성 요소

군계는 에셋 하나가 아니라, 서로를 가리키는 에셋 네 개입니다:

| 요소 | 라이브러리 | 하는 일 |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | 군계 자체: 무엇이 자라고, 무엇이 나타나고, 어떻게 퍼지는지 |
| `TopTileType` 두 개 | `top_tiles` | 칠하는 땅: **낮은** 것 하나와 **높은** 것 하나 |
| `DropAsset` | `drops` | 떨어져서 땅을 여러분의 군계로 바꾸는 씨앗 |
| `GodPower` | `powers` | 플레이어가 씨앗을 뿌리는 버튼 |

타일은 자기가 어느 군계에 속하는지(`biome_id`)를, 군계는 어떤 타일이 자기 것인지(`tile_low`, `tile_high`)를 가지고 있습니다. 양쪽이 일치해야 합니다.

## 코드

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

`HelloBiomes.Initialize();` 를 `OnModLoad` 에 추가하고, 다른 권능처럼 버튼을 달아 주세요: **[권능 탭과 버튼](#/nml/power-buttons)**.

> [!WARNING] Initialize 안의 순서가 중요합니다
> 타일은 군계가 존재하기 전에 복제되므로, `biome_asset` 은 `add()` **뒤에** 설정합니다. 먼저 연결하면 `null` 과 연결되고, 군계가 null인 타일은 아무것도 키우지 않고 아무도 나타나게 하지 않습니다. 오류는 하나도 없습니다 :wbfacepalm:.

## 중요한 필드

| 필드 | 하는 일 |
| --- | --- |
| `tile_low` / `tile_high` | 이 군계가 칠하는 땅 타일 두 개. 낮은 땅과 높은 땅 |
| `localized_key` | 텍스트 키. snake_case 로 바뀝니다. `biome_hello_ember` 는 그대로입니다 |
| `spread_biome` | 이웃 타일로 저절로 퍼짐 |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | 어떤 낙하물이 이걸 다른 곳으로 옮길 수 있는지 |
| `generator_pot_amount` | 세계 생성기에서 가진 추첨권 수. 0 = 새 세계에서 절대 뽑히지 않음 |
| `grow_strength` | 퍼질 때 밀어붙이는 힘. 기본값 6 |
| `cold_biome` / `dark_biome` | 다른 시스템이 확인하는 플래그. 정말 춥거나 어두울 때만 설정 |
| `special_biome` | 일반적인 초록 군계가 아닌 특이한 것 표시. 바닐라는 모래와 언덕에 씁니다 |
| `subspecies_name_suffix` | 여기서 진화한 아종에 붙는 라틴어풍 어미 |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | 여기서 세워진 것들이 얻을 수 있는 특성 |

### 무엇이 자라고 무엇이 나타나는지

`addTree`, `addPlant`, `addBush`, `addMineral` 은 건물 ID와 가중치를 받습니다. `addUnit` 은 야생 동물을, `addSapientUnit` 은 여기서 문명을 세울 수 있는 종족을 추가합니다. 가중치는 퍼센트가 아니라 ID가 주머니에 들어가는 횟수입니다: `addUnit("buffalo", 2)` 이면 물소가 하이에나보다 두 배 잘 나옵니다.

어떤 ID든 됩니다. **[사용자 정의 액터](#/nml/custom-actors)** 에서 만든 여러분의 생물도, 군계보다 먼저 등록되어 있다면 괜찮습니다.

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## 직접 만든 그림

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

타일은 **[타일과 지형](#/nml/tiles)** 과 같은 규칙을 따릅니다: 폴더 이름이 타일 ID이고, 안의 PNG 하나하나가 변형입니다. 테스트하는 동안 그림을 건너뛰면, 복제본은 풀 스프라이트를 그대로 쓰고 미니맵의 색만 여러분의 색이 됩니다.

## 테스트

새 세계를 몇 번 만들어 보고 여러분의 색을 찾아보세요. 풀의 8에 비해 `generator_pot_amount = 3` 이라 매번 나오지는 않으니, 테스트할 때는 차라리 풀 위에 씨앗을 뿌리세요. 풀이 바뀌고, 사바나 나무가 자라기 시작하고, 잠시 후 하이에나가 들어올 겁니다.

> [!NOTE] 다루지 않은 것
> 오염처럼 건물이 퍼뜨리는 크리프 군계는 다른 경로(건물의 `grow_creep_type`)를 씁니다. 그건 별도의 페이지이고, 아직 쓰지 않았습니다 :PES2_Shrug:.
