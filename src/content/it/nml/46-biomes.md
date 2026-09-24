---
title: Biomi
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbflowerbud:
order: 171
---

# Biomi :wbflowerbud:

Un bioma (biome) è la parte del mondo a cui è appeso tutto il resto: quale terreno dipinge, quali alberi e piante ci crescono, quali creature ci arrivano e quali tratti (trait) prende chi ci nasce. Una mod di biomi? In questa economia? Sì, ed è meno lavoro di quanto sembri, perché un bioma è soprattutto una lista di id di altri :PESgn_Noice:.

Questa pagina crea i **Campi di Brace**: due caselle (tile) sue, i suoi semi, qualche creatura della savana e un tratto per tutto quello che ci nasce.

## I pezzi

Un bioma non è un asset, sono quattro che puntano l'uno all'altro:

| Pezzo | Libreria (library) | Cosa fa |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | Il bioma vero e proprio: cosa cresce, cosa compare, come si espande |
| Due `TopTileType` | `top_tiles` | Il terreno che dipinge: uno **basso** e uno **alto** |
| `DropAsset` | `drops` | I semi che cadono e trasformano il terreno nel tuo bioma |
| `GodPower` | `powers` | Il pulsante con cui il giocatore lancia i semi |

Le caselle dicono a quale bioma appartengono (`biome_id`), e il bioma dice quali caselle sono sue (`tile_low`, `tile_high`). Le due direzioni devono combaciare.

## Il codice

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

Aggiungi `HelloBiomes.Initialize();` a `OnModLoad`, poi dai al potere un pulsante come a qualsiasi altro: **[Schede e pulsanti dei poteri](#/nml/power-buttons)**.

> [!WARNING] L'ordine dentro Initialize conta
> Le caselle vengono clonate prima che il bioma esista, quindi il loro `biome_asset` viene impostato **dopo** `add()`. Se lo colleghi prima colleghi `null`, e una casella con bioma nullo non fa crescere niente e non fa comparire nessuno, senza un solo errore :wbfacepalm:.

## I campi che contano

| Campo | Cosa fa |
| --- | --- |
| `tile_low` / `tile_high` | Le due caselle di terreno che dipinge questo bioma. Terreno basso e terreno alto |
| `localized_key` | La sua chiave di testo, trasformata in snake_case. `biome_hello_ember` resta così |
| `spread_biome` | Si espande da solo nelle caselle vicine |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Quali oggetti che cadono possono portarlo altrove |
| `generator_pot_amount` | Quanti biglietti ha nel generatore di mondi. 0 = mai estratto per un mondo nuovo |
| `grow_strength` | Quanto spinge quando si espande. Predefinito 6 |
| `cold_biome` / `dark_biome` | Flag che controllano altri sistemi. Mettili solo se è davvero freddo o buio |
| `special_biome` | Segna quelli strani che non sono un normale bioma verde. Vanilla lo usa per sabbia e colline |
| `subspecies_name_suffix` | Finali in latino per le sottospecie (subspecies) che si evolvono qui |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Tratti che può prendere chi viene fondato qui |

### Cosa cresce e cosa compare

`addTree`, `addPlant`, `addBush` e `addMineral` prendono un id di edificio (building) e un peso. `addUnit` aggiunge la fauna, `addSapientUnit` le specie che possono fondare una civiltà qui. Il peso non è una percentuale, è quante volte l'id finisce nel sacchetto: `addUnit("buffalo", 2)` rende il bufalo due volte più probabile della iena.

Va bene qualsiasi id, anche le tue creature di **[Attori personalizzati](#/nml/custom-actors)**, purché siano registrate prima del bioma.

## Il testo

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## La tua grafica

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

Le caselle seguono le stesse regole di **[Caselle e terreno](#/nml/tiles)**: il nome della cartella è l'id della casella, e ogni PNG dentro è una variante. Se salti la grafica mentre provi, i cloni tengono gli sprite dell'erba, solo col tuo colore sulla minimappa.

## Provarlo

Crea un mondo nuovo un po' di volte e cerca il tuo colore. Con `generator_pot_amount = 3` contro gli 8 dell'erba non uscirà sempre, quindi per provare lancia i tuoi semi su un po' d'erba. Dovrebbe cambiare, cominciare a far crescere alberi della savana, e dopo un po' arrivano le iene.

> [!NOTE] Cosa non ho coperto
> I biomi che si espandono dagli edifici, come la corruzione, seguono un'altra strada (`grow_creep_type` sull'edificio). È una pagina a parte e non l'ho ancora scritta :PES2_Shrug:.
