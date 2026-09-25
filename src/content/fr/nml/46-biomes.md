---
title: Biomes
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbflowerbud:
order: 171
---

# Biomes :wbflowerbud:

Un biome, c'est la partie du monde à laquelle tout le reste s'accroche : quel sol il peint, quels arbres et plantes y poussent, quelles créatures y entrent, et quels traits reçoit ce qui y naît. Un mod de biome ? Dans cette économie ? Oui, et c'est moins de travail qu'il n'y paraît, parce qu'un biome est surtout une liste d'ids des autres :PESgn_Noice:.

Cette page crée les **Champs de Braise** : deux tuiles (tile) à eux, leurs propres graines, quelques créatures de savane, et un trait pour tout ce qui y naît.

## Les morceaux

Un biome n'est pas un asset, c'en est quatre qui pointent les uns vers les autres :

| Morceau | Bibliothèque (library) | Ce qu'il fait |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | Le biome lui-même : ce qui pousse, ce qui apparaît, comment il s'étend |
| Deux `TopTileType` | `top_tiles` | Le sol qu'il peint : un **bas** et un **haut** |
| `DropAsset` | `drops` | Les graines qui tombent et transforment le sol en votre biome |
| `GodPower` | `powers` | Le bouton avec lequel le joueur lance les graines |

Les tuiles disent à quel biome elles appartiennent (`biome_id`), et le biome dit quelles tuiles sont les siennes (`tile_low`, `tile_high`). Les deux sens doivent être d'accord.

## Le code

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

            // Inherit source tile sprites so rendering never encounters a null TileSprites
            TopTileType source = AssetManager.top_tiles.get(pFrom);
            if (source != null) tile.sprites = source.sprites;

            // your art in GameResources/tiles/<id>/, loaded at startup in the vanilla case
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + tile.id);
            if (variations != null && variations.Length > 0)
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

Ajoutez `HelloBiomes.Initialize();` dans `OnModLoad`, puis donnez un bouton au pouvoir comme à n'importe quel autre : **[Onglets et boutons de pouvoirs](#/nml/power-buttons)**.

> [!WARNING] L'ordre dans Initialize compte
> Les tuiles sont clonées avant que le biome existe, donc leur `biome_asset` est défini **après** `add()`. Liez-le plus tôt et vous liez `null`, et une tuile avec un biome nul ne fait rien pousser et ne fait apparaître personne, sans la moindre erreur :wbfacepalm:.

## Les champs qui comptent

| Champ | Ce qu'il fait |
| --- | --- |
| `tile_low` / `tile_high` | Les deux tuiles de sol que peint ce biome. Sol bas et sol haut |
| `localized_key` | Sa clé de texte, passée en snake_case. `biome_hello_ember` reste tel quel |
| `spread_biome` | S'étend tout seul aux tuiles voisines |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Quels objets qui tombent peuvent l'emporter ailleurs |
| `generator_pot_amount` | Combien de tickets il a dans le générateur de monde. 0 = jamais tiré pour un nouveau monde |
| `grow_strength` | La force avec laquelle il pousse en s'étendant. 6 par défaut |
| `cold_biome` / `dark_biome` | Des drapeaux que d'autres systèmes vérifient. À mettre seulement s'il est vraiment froid ou sombre |
| `special_biome` | Marque les cas à part qui ne sont pas un biome vert normal. Vanilla l'utilise pour le sable et les collines |
| `subspecies_name_suffix` | Des terminaisons latines pour les sous-espèces (subspecies) qui évoluent ici |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Les traits que peut recevoir ce qui est fondé ici |

### Ce qui pousse et ce qui apparaît

`addTree`, `addPlant`, `addBush` et `addMineral` prennent un id de bâtiment (building) et un poids. `addUnit` ajoute la faune, `addSapientUnit` les espèces qui peuvent fonder une civilisation ici. Le poids n'est pas un pourcentage, c'est combien de fois l'id entre dans le sac : `addUnit("buffalo", 2)` rend le buffle deux fois plus probable que la hyène.

N'importe quel id marche, y compris vos propres créatures de **[Acteurs personnalisés](#/nml/custom-actors)**, tant qu'elles sont enregistrées avant le biome.

## Le texte

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## Vos propres images

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

Les tuiles suivent les mêmes règles que dans **[Tuiles et terrain](#/nml/tiles)** : le nom du dossier est l'id de la tuile, et chaque PNG dedans est une variante. Sautez les images pendant les tests, et les clones gardent les sprites de l'herbe, juste avec votre couleur sur la minicarte.

## Le tester

Créez un nouveau monde plusieurs fois et cherchez votre couleur. Avec `generator_pot_amount = 3` contre 8 pour l'herbe, il ne sortira pas à chaque fois, alors pour tester, lancez plutôt vos graines sur de l'herbe. Elle devrait changer, faire pousser des arbres de savane, et au bout d'un moment des hyènes arrivent.

> [!NOTE] Ce que je n'ai pas couvert
> Les biomes rampants, ceux que des bâtiments répandent comme la corruption, passent par un autre chemin (`grow_creep_type` sur le bâtiment). C'est une page à part, et je ne l'ai pas encore écrite :PES2_Shrug:.
