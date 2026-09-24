---
title: Biomas
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbflowerbud:
order: 171
---

# Biomas :wbflowerbud:

Un bioma es la parte del mundo de la que cuelga todo lo demás: qué suelo pinta, qué árboles y plantas crecen en él, qué criaturas entran y qué rasgos recibe lo que nace allí. ¿Un mod de biomas? ¿En esta economía? Sí, y es menos trabajo del que parece, porque un bioma es sobre todo una lista de ids de otros :PESgn_Noice:.

Esta página crea los **Campos de Brasa**: dos casillas propias, sus propias semillas, algunas criaturas de sabana y un rasgo para todo lo que nazca allí.

## Las piezas

Un bioma no es un asset, son cuatro que se apuntan entre sí:

| Pieza | Librería | Qué hace |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | El bioma en sí: qué crece, qué aparece, cómo se extiende |
| Dos `TopTileType` | `top_tiles` | El suelo que pinta: uno **bajo** y uno **alto** |
| `DropAsset` | `drops` | Las semillas que caen y convierten el suelo en tu bioma |
| `GodPower` | `powers` | El botón con el que el jugador lanza las semillas |

Las casillas dicen a qué bioma pertenecen (`biome_id`) y el bioma dice qué casillas son suyas (`tile_low`, `tile_high`). Las dos direcciones tienen que coincidir.

## El código

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

Añade `HelloBiomes.Initialize();` a `OnModLoad` y luego dale al poder un botón como a cualquier otro: **[Pestañas y botones de poderes](#/nml/power-buttons)**.

> [!WARNING] El orden dentro de Initialize importa
> Las casillas se clonan antes de que exista el bioma, así que su `biome_asset` se asigna **después** de `add()`. Si lo enlazas antes, enlazas a `null`, y una casilla con bioma nulo no hace crecer nada ni aparecer a nadie, sin un solo error :wbfacepalm:.

## Los campos que importan

| Campo | Qué hace |
| --- | --- |
| `tile_low` / `tile_high` | Las dos casillas de suelo que pinta este bioma. Suelo bajo y suelo alto |
| `localized_key` | Su clave de texto, pasada a snake_case. `biome_hello_ember` se queda igual |
| `spread_biome` | Se extiende solo a las casillas vecinas |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Qué objetos que caen pueden llevarlo a otro sitio |
| `generator_pot_amount` | Cuántos boletos tiene en el generador de mundos. 0 = nunca sale en un mundo nuevo |
| `grow_strength` | Con cuánta fuerza empuja al extenderse. Por defecto 6 |
| `cold_biome` / `dark_biome` | Marcas que revisan otros sistemas. Ponlas solo si de verdad es frío u oscuro |
| `special_biome` | Marca los raros que no son un bioma verde normal. Vanilla lo usa para arena y colinas |
| `subspecies_name_suffix` | Terminaciones latinas para las subespecies que evolucionan aquí |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Rasgos que puede recibir lo que se funda aquí |

### Qué crece y qué aparece

`addTree`, `addPlant`, `addBush` y `addMineral` reciben un id de edificio y un peso. `addUnit` añade fauna, `addSapientUnit` añade las especies que pueden fundar una civilización aquí. El peso no es un porcentaje, es cuántas veces entra el id en la bolsa: `addUnit("buffalo", 2)` hace el búfalo el doble de probable que la hiena.

Sirve cualquier id, también tus propias criaturas de **[Actores personalizados](#/nml/custom-actors)**, siempre que se registren antes que el bioma.

## El texto

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## Tu propio arte

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

Las casillas siguen las mismas reglas que en **[Casillas y terreno](#/nml/tiles)**: el nombre de la carpeta es el id de la casilla y cada PNG dentro es una variación. Si te saltas el arte mientras pruebas, los clones se quedan con los sprites de la hierba, solo que con tu color en el minimapa.

## Probarlo

Crea un mundo nuevo varias veces y busca tu color. Con `generator_pot_amount = 3` contra los 8 de la hierba no saldrá siempre, así que para probar mejor lanza tus semillas sobre algo de hierba. Debería cambiar, empezar a crecer árboles de sabana y, al rato, entrar hienas.

> [!NOTE] Lo que no he cubierto
> Los biomas de plaga, los que los edificios extienden como la corrupción, van por otro camino (`grow_creep_type` en el edificio). Eso es una página aparte y todavía no la he escrito :PES2_Shrug:.
