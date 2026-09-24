---
title: Biome
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbflowerbud:
order: 171
---

# Biome :wbflowerbud:

Ein Biom ist der Teil der Welt, an dem alles andere hängt: welchen Boden es malt, welche Bäume und Pflanzen darauf wachsen, welche Kreaturen hereinwandern und welche Merkmale alles bekommt, was dort geboren wird. Eine Biom-Mod? In dieser Wirtschaftslage? Ja, und es ist weniger Arbeit, als es aussieht, denn ein Biom ist vor allem eine Liste von IDs anderer Leute :PESgn_Noice:.

Diese Seite baut die **Glutfelder**: zwei eigene Kacheln, eigene Samen, ein paar Savannen-Kreaturen und ein Merkmal für alles, was dort geboren wird.

## Die Teile

Ein Biom ist nicht ein Asset, sondern vier, die aufeinander zeigen:

| Teil | Bibliothek | Was es macht |
| --- | --- | --- |
| `BiomeAsset` | `biome_library` | Das Biom selbst: was wächst, was spawnt, wie es sich ausbreitet |
| Zwei `TopTileType` | `top_tiles` | Der Boden, den es malt: ein **niedriger** und ein **hoher** |
| `DropAsset` | `drops` | Die Samen, die fallen und Boden in dein Biom verwandeln |
| `GodPower` | `powers` | Der Button, mit dem der Spieler die Samen wirft |

Die Kacheln sagen, zu welchem Biom sie gehören (`biome_id`), und das Biom sagt, welche Kacheln seine eigenen sind (`tile_low`, `tile_high`). Beide Richtungen müssen übereinstimmen.

## Der Code

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

Füg `HelloBiomes.Initialize();` zu `OnModLoad` hinzu und gib der Macht dann einen Button wie jeder anderen: **[Macht-Tabs & Buttons](#/nml/power-buttons)**.

> [!WARNING] Die Reihenfolge in Initialize zählt
> Die Kacheln werden geklont, bevor das Biom existiert, also wird ihr `biome_asset` **nach** `add()` gesetzt. Verknüpfst du es früher, verknüpfst du mit `null`, und eine Kachel mit null-Biom lässt nichts wachsen und spawnt niemanden, ohne einen einzigen Fehler :wbfacepalm:.

## Die wichtigen Felder

| Feld | Was es macht |
| --- | --- |
| `tile_low` / `tile_high` | Die zwei Bodenkacheln, die dieses Biom malt. Niedriger und hoher Boden |
| `localized_key` | Sein Textschlüssel, in snake_case umgewandelt. `biome_hello_ember` bleibt, wie es ist |
| `spread_biome` | Breitet sich von selbst auf Nachbarkacheln aus |
| `spread_by_drops_water` / `_fire` / `_curse` / `_blessing` / `_acid` ... | Welche fallenden Drops es woandershin tragen können |
| `generator_pot_amount` | Wie viele Lose es im Weltgenerator bekommt. 0 = nie für eine neue Welt gezogen |
| `grow_strength` | Wie stark es beim Ausbreiten drückt. Standard 6 |
| `cold_biome` / `dark_biome` | Flags, die andere Systeme prüfen. Nur setzen, wenn es wirklich kalt oder dunkel ist |
| `special_biome` | Markiert die Sonderfälle, die kein normales grünes Biom sind. Vanilla nutzt es für Sand und Hügel |
| `subspecies_name_suffix` | Lateinisch klingende Endungen für Unterarten, die sich hier entwickeln |
| `spawn_trait_actor`, `spawn_trait_subspecies`, `spawn_trait_culture`, `spawn_trait_clan`, `spawn_trait_language`, `spawn_trait_religion` | Merkmale, die hier Gegründetes bekommen kann |

### Was wächst und was spawnt

`addTree`, `addPlant`, `addBush` und `addMineral` nehmen eine Gebäude-ID und ein Gewicht. `addUnit` fügt Wildtiere hinzu, `addSapientUnit` die Arten, die hier eine Zivilisation gründen können. Das Gewicht ist kein Prozentwert, sondern wie oft die ID in den Beutel kommt: `addUnit("buffalo", 2)` macht Büffel doppelt so wahrscheinlich wie die Hyäne.

Jede ID funktioniert, auch deine eigenen Kreaturen aus **[Eigene Akteure](#/nml/custom-actors)**, solange sie vor dem Biom registriert werden.

## Der Text

```json Mods/HelloBox/Locales/en.json
{
  "biome_hello_ember": "Ember Fields",
  "biome_hello_ember_description": "Warm ground that never quite stopped smouldering.",
  "seeds_hello_ember": "Ember Seeds",
  "seeds_hello_ember_description": "Turns the ground into Ember Fields."
}
```

## Deine eigenen Grafiken

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── tiles/
    │   ├── hello_ember_low/      <- variations, one PNG each
    │   └── hello_ember_high/
    └── ui/Icons/
        └── iconHelloSeeds.png
```

Die Kacheln folgen denselben Regeln wie bei **[Kacheln & Terrain](#/nml/tiles)**: Der Ordnername ist die Kachel-ID, und jedes PNG darin ist eine Variante. Lass die Grafiken beim Testen weg, dann behalten die Klone die Gras-Sprites, nur in deiner Farbe auf der Minikarte.

## Testen

Erstell ein paar Mal eine neue Welt und such nach deiner Farbe. Mit `generator_pot_amount = 3` gegen die 8 vom Gras taucht es nicht jedes Mal auf, also wirf zum Testen lieber deine Samen auf etwas Gras. Es sollte sich verwandeln, Savannenbäume wachsen lassen, und nach einer Weile wandern Hyänen herein.

> [!NOTE] Was ich nicht behandelt habe
> Kriech-Biome, die Gebäude wie die Verderbnis ausbreiten, laufen über einen anderen Weg (`grow_creep_type` am Gebäude). Das ist eine eigene Seite, und die habe ich noch nicht geschrieben :PES2_Shrug:.
