---
title: Biomas
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbflowerbud:
order: 171
---

# Biomas :wbflowerbud:

Um bioma é a parte do mundo de onde todo o resto pendura: que chão ele pinta, que árvores e plantas crescem nele, que criaturas aparecem e que traços ganha quem nasce lá. Um mod de bioma? Nessa economia? Sim, e dá menos trabalho do que parece, porque um bioma é principalmente uma lista de ids dos outros :PESgn_Noice:.

Esta página cria os **Campos de Brasa**: dois tiles próprios, sementes próprias, algumas criaturas de savana e um traço para tudo que nasce lá.

## As peças

Um bioma não é um asset, são quatro que apontam uns para os outros:

| Peça | Biblioteca | O que faz |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | O bioma em si: o que cresce, o que aparece, como se espalha |
| Dois `TopTileType` | `top_tiles` | O chão que ele pinta: um **baixo** e um **alto** |
| `DropAsset` | `drops` | As sementes que caem e transformam o chão no seu bioma |
| `GodPower` | `powers` | O botão que o jogador usa para jogar as sementes |

Os tiles dizem a que bioma pertencem (`biome_id`), e o bioma diz quais tiles são dele (`tile_low`, `tile_high`). Os dois lados precisam concordar.

## O código

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

Adicione `HelloBiomes.Initialize();` ao `OnModLoad` e depois dê um botão ao poder como a qualquer outro: **[Abas e botões de poderes](#/nml/power-buttons)**.

> [!WARNING] A ordem dentro do Initialize importa
> Os tiles são clonados antes de o bioma existir, então o `biome_asset` deles é definido **depois** do `add()`. Ligue antes e você liga a `null`, e um tile com bioma nulo não faz nada crescer nem aparecer, sem nenhum erro :wbfacepalm:.

## Os campos que importam

| Campo | O que faz |
| --- | --- |
| `tile_low` / `tile_high` | Os dois tiles de chão que este bioma pinta. Chão baixo e chão alto |
| `localized_key` | A chave de texto dele, convertida para snake_case. `biome_hello_ember` fica igual |
| `spread_biome` | Se espalha sozinho para os tiles vizinhos |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Quais coisas que caem podem levá-lo para outro lugar |
| `generator_pot_amount` | Quantos bilhetes ele tem no gerador de mundos. 0 = nunca sorteado para um mundo novo |
| `grow_strength` | A força com que empurra ao se espalhar. Padrão 6 |
| `cold_biome` / `dark_biome` | Marcações que outros sistemas checam. Só ligue se for mesmo frio ou escuro |
| `special_biome` | Marca os diferentes, que não são um bioma verde normal. O vanilla usa para areia e colinas |
| `subspecies_name_suffix` | Terminações meio latinas para subespécies que evoluem aqui |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Traços que o que for fundado aqui pode ganhar |

### O que cresce e o que aparece

`addTree`, `addPlant`, `addBush` e `addMineral` recebem um id de construção e um peso. `addUnit` adiciona animais selvagens, `addSapientUnit` as espécies que podem fundar uma civilização aqui. O peso não é porcentagem, é quantas vezes o id entra no saco: `addUnit("buffalo", 2)` deixa o búfalo duas vezes mais provável que a hiena.

Qualquer id funciona, inclusive as suas criaturas de **[Atores personalizados](#/nml/custom-actors)**, desde que registradas antes do bioma.

## O texto

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## A sua arte

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

Os tiles seguem as mesmas regras de **[Tiles e terreno](#/nml/tiles)**: o nome da pasta é o id do tile, e cada PNG dentro é uma variação. Pule a arte enquanto testa e os clones ficam com os sprites da grama, só que com a sua cor no minimapa.

## Testando

Crie um mundo novo algumas vezes e procure a sua cor. Com `generator_pot_amount = 3` contra os 8 da grama, ele não vai aparecer sempre, então para testar jogue as suas sementes em um pouco de grama. Ela deve mudar, começar a crescer árvores de savana, e depois de um tempo aparecem hienas.

> [!NOTE] O que eu não cobri
> Biomas que se espalham a partir de construções, como a corrupção, usam outro caminho (`grow_creep_type` na construção). Isso é uma página à parte, e eu ainda não escrevi :PES2_Shrug:.
