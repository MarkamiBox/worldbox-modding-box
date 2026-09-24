---
title: Биомы
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbflowerbud:
order: 171
---

# Биомы :wbflowerbud:

Биом (biome) это та часть мира, на которой держится всё остальное: какую землю он рисует, какие деревья и растения на нём растут, какие существа туда приходят и какие черты (trait) получает всё, что там рождается. Мод на биом? В такой экономике? Да, и работы меньше, чем кажется, потому что биом это в основном список чужих id :PESgn_Noice:.

На этой странице мы делаем **Тлеющие поля**: две свои клетки (tile), свои семена, немного существ из саванны и черту для всех, кто там родится.

## Из чего он состоит

Биом это не один ассет, а четыре, которые ссылаются друг на друга:

| Часть | Библиотека (library) | Что делает |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | Сам биом: что растёт, кто появляется, как он распространяется |
| Два `TopTileType` | `top_tiles` | Земля, которую он рисует: **низкая** и **высокая** |
| `DropAsset` | `drops` | Семена, которые падают и превращают землю в ваш биом |
| `GodPower` | `powers` | Кнопка, которой игрок бросает семена |

Клетки говорят, к какому биому они относятся (`biome_id`), а биом говорит, какие клетки его (`tile_low`, `tile_high`). Оба направления должны совпадать.

## Код

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

Добавьте `HelloBiomes.Initialize();` в `OnModLoad`, а потом дайте силе кнопку, как любой другой: **[Вкладки и кнопки сил](#/nml/power-buttons)**.

> [!WARNING] Порядок внутри Initialize важен
> Клетки клонируются до того, как появляется биом, поэтому их `biome_asset` задаётся **после** `add()`. Свяжете раньше, и свяжете с `null`, а клетка с пустым биомом ничего не выращивает и никого не порождает, без единой ошибки :wbfacepalm:.

## Важные поля

| Поле | Что делает |
| --- | --- |
| `tile_low` / `tile_high` | Две клетки земли, которые рисует этот биом. Низкая и высокая земля |
| `localized_key` | Его ключ текста, переведённый в snake_case. `biome_hello_ember` остаётся как есть |
| `spread_biome` | Сам расползается на соседние клетки |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Какие падающие предметы могут перенести его в другое место |
| `generator_pot_amount` | Сколько билетов у него в генераторе мира. 0 = никогда не выпадает в новом мире |
| `grow_strength` | С какой силой он давит при распространении. По умолчанию 6 |
| `cold_biome` / `dark_biome` | Флаги, которые проверяют другие системы. Ставьте, только если он правда холодный или тёмный |
| `special_biome` | Отмечает особые биомы, которые не обычные зелёные. Ваниль использует его для песка и холмов |
| `subspecies_name_suffix` | Латинские окончания для подвидов (subspecies), которые тут развиваются |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Черты, которые может получить то, что основано здесь |

### Что растёт и кто появляется

`addTree`, `addPlant`, `addBush` и `addMineral` принимают id здания (building) и вес. `addUnit` добавляет диких животных, `addSapientUnit` виды, которые могут основать здесь цивилизацию. Вес это не процент, а сколько раз id попадает в мешок: `addUnit("buffalo", 2)` делает буйвола вдвое вероятнее гиены.

Подходит любой id, в том числе ваши собственные существа со страницы **[Свои существа](#/nml/custom-actors)**, если они зарегистрированы раньше биома.

## Текст

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## Своя графика

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

Клетки подчиняются тем же правилам, что и в **[Клетки и местность](#/nml/tiles)**: имя папки это id клетки, а каждый PNG внутри это один вариант. Пропустите графику на время тестов, и клоны оставят спрайты травы, только вашего цвета на мини-карте.

## Проверка

Создайте новый мир несколько раз и поищите свой цвет. С `generator_pot_amount = 3` против 8 у травы он будет выпадать не каждый раз, так что для проверки лучше бросьте семена на траву. Она должна смениться, начнут расти деревья саванны, а через какое-то время придут гиены.

> [!NOTE] Что я не разобрал
> Ползучие биомы, которые распространяют здания, как порча, работают по-другому (`grow_creep_type` у здания). Это отдельная страница, и я её ещё не написал :PES2_Shrug:.
