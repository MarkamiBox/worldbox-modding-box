---
title: Kacheln & Terrain
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbrockies:
order: 170
---

# Kacheln & Terrain :wbrockies:

Die Spielkarte ist ein Gitter aus `WorldTile`, und jede Kachel (tile) trägt **zwei** übereinander gestapelte Typen:

| Ebene | Feld auf der Kachel | Bibliothek (library) | Klasse | Beispiele |
| --- | --- | --- | --- | --- |
| Boden | `main_type` | `AssetManager.tiles` | `TileType` | Erde, Sand, Felsen, tiefer Ozean, Lava |
| Oben | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, Mauern |

Beide basieren im Kern auf derselben Basisklasse (`TileTypeBase`), sodass alles auf dieser Seite für beide funktioniert. Der einzige Unterschied besteht darin, auf welcher Schicht sie liegen, was durch `layer_type` bestimmt wird.

Wenn du eine neue Art von *Boden* hinzufügen willst, ist das ein `TileType`. Wenn du etwas willst, das **auf** dem Boden liegt (eine Straße, eine Mauer, ein Feld, Moos), ist das ein `TopTileType` - und fast immer das, was du wirklich suchst.

## Klonen, nicht neu bauen

Ein Kacheltyp besitzt an die hundert Felder, von denen die meisten nur für eine einzige Vanilla-Kachel von Bedeutung sind. Ich werde nicht alle hundert auflisten. Klone die am nächsten verwandte Vorlage:

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

            // color and has_biome_tags are [NonSerialized], so clone() skips them, and linkAssets()
            // worked them out at startup. Without this the minimap draws your tile see-through.
            moss.color = Toolbox.makeColor(moss.color_hex);
            moss.has_biome_tags = moss.biome_tags != null && moss.biome_tags.Count > 0;

            // Inherit source tile sprites so rendering never encounters a null TileSprites
            TopTileType source = AssetManager.top_tiles.get("grass_low");
            if (source != null) moss.sprites = source.sprites;

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations != null && variations.Length > 0)
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

> [!WARNING] Ein Biom-Tile braucht sein verknüpftes Biom
> Ein geklontes Gras-Tile übernimmt `is_biome = true` und die `biome_id`, aber das `BiomeAsset` selbst wird nur in `TopTileLibrary.linkAssets()` nachgeschlagen, einmal, beim Laden. Ohne diese Zeile läuft alles, bis ein Tier auf deinem Tile spawnt: sein Artname bekommt das Biom-Suffix, das Biom ist `null`, und der Spawn stirbt mit `NullReferenceException` in `Subspecies.generateName()` :wbfacepalm:.
>
> Die Bilder haben dasselbe Problem. `TopTileLibrary` macht aus den PNGs in `tiles/<id>/` beim Start `sprites`, also malt das Tile ohne den letzten Block zwar, und dann wirft der Karten-Renderer in `WorldTilemap.getVariation()` für jedes sichtbare Tile davon.


## Die wichtigsten Felder

### Welche Art von Objekt es ist

| Feld | Was es tut |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` oder die obere Ebene. Bestimmt die zuständige Bibliothek |
| `ground`, `liquid`, `ocean`, `lava` | Grundlegende Kategoriefilter, nach denen das ganze Spiel verzweigt |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Geländefamilien-Flags |
| `road`, `wall`, `farm_field` | Struktur-Flags. Die Stadt-KI liest diese aus |
| `block`, `block_height` | Ob es Bewegung blockiert und wie hoch es gezeichnet wird |
| `is_biome`, `can_be_biome`, `biome_id` | Verknüpft die Kachel mit einem Biom |
| `biome_tags`, `has_biome_tags` | Welche Biome diese Kachel wachsen lassen |

### Wie es sich verhält

Fang hier an, wenn deine Kachel eine Gameplay-Idee ist und nicht nur eine neue Farbe.

| Feld | Was es tut |
| --- | --- |
| `walk_multiplier` | Bewegungsgeschwindigkeit darauf. `1.0` ist normal, kleiner ist langsamer |
| `damage_units`, `damage` | Ob das Betreten schmerzt und um wie viel |
| `damaged_when_walked` | Die Kachel selbst nutzt sich beim Begehen ab |
| `step_action`, `step_action_chance` | Eigener Code bei jedem Schritt darauf |
| `unit_death_action` | Eigener Code, wenn eine Einheit darauf stirbt |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Feuerverhalten |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Eisverhalten |
| `remove_on_heat`, `terraform_after_fire` | Was Hitze und Feuer hinterlassen |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Explosionsverhalten |
| `strength` | Wie viel Schaden es aushält. Von Mauer-Mods für Haltbarkeit genutzt |
| `cost` | Wegfindungskosten |

### Was der Spieler damit tun kann

| Feld | Was es tut |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Welches Werkzeug es entfernt |
| `allowed_to_be_finger_copied` | Ob das Finger-Kopierwerkzeug es aufnehmen kann |
| `can_build_on`, `can_be_farm` | Ob eine Stadt die Kachel bebauen/nutzen darf |
| `only_allowed_to_build_with_tag` | Beschränkt Bauen auf einen bestimmten Tag |

### Übergänge & Verwandlung

| Feld | Was es tut |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | Wozu es bei Wachstum oder Erosion wird |
| `freeze_to_id` | Wozu es gefriert |
| `fill_to_ocean`, `can_be_filled_with_ocean` | Wozu es unter Wasser wird |
| `lava_increase` / `lava_decrease` / `lava_level` | Eigene Entwicklungsstufen für Lava |

### Aussehen

| Feld | Was es tut |
| --- | --- |
| `color_hex` | Minimap- und Tönungsfarbe |
| `edge_color_hex` | Umrissfarbe bei Übergängen zu anderen Kacheln |
| `render_z`, `draw_layer_name` | Zeichenreihenfolge. `setDrawLayer(...)` ist der Helfer |
| `force_edge_variation`, `force_edge_variation_frame` | Fixiert eine Randgrafik-Variante |

## Code ausführen, wenn etwas darauf tritt

```csharp
moss.step_action_chance = 0.05f;   // 5 % aller Schritte
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

Es gelten dieselben Regeln wie für jede Aktion in diesem Leitfaden: Zuerst auf null prüfen, `false` zurückgeben wenn nichts getan wurde, und daran denken, dass dies für jede Einheit auf jeder Kachel dieses Typs läuft.

## Eigene Texturen

Kacheln sind eine Ausnahme: Es gibt **überhaupt kein Pfad-Feld**. Das Spiel sucht nach einem Ordner, der exakt nach der **ID** der Kachel benannt ist, und lädt alle Bilder darin als Variationen.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- exakt die ID der Kachel
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

Im Code muss nichts konfiguriert werden. Benenne den Ordner nach der registrierten ID und die Kachel findet ihn automatisch.

Mehrere Dateien im Ordner werden zu Zufallsvariationen, was verhindert, dass eine Fläche wie eine monotone Tapete aussieht. Eine einzelne Datei funktioniert ebenfalls. Boden- und Oberflächenkacheln laden beide auf diese Weise.

`color_hex` ist unabhängig davon und bleibt wichtig: Es bestimmt die Minimap-Farbe und färbt die Kachel ein, wenn das Spiel sie abtönt.

## Kacheln zur Laufzeit verändern

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // obere Schicht ändern
tile.setTileType(AssetManager.tiles.get("sand"));                // Boden ändern
tile.setTileTypes("sand", null);                                 // Boden setzen und obere Schicht leeren
```

Alle drei Methoden sind öffentlich. Das Ändern einer Kachel markiert den Chunk als geändert und der Renderer aktualisiert ihn automatisch.

### Auslesen, was vorhanden ist

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

Sowohl `main_type` als auch `top_type` können `null` sein. Prüfe sie, bevor du darauf zugreifst. Das ist der häufigste Absturz in Mods, die die Karte durchlaufen :PES2_F:.

## Terraform-Optionen

Ein `TerraformOptions` in `AssetManager.terraform` ist ein benanntes Paket zum "Bereinigen dieser Kachel", das von Gotteskräften und Projektilen (projectile) genutzt wird:

| Feld | Was es tut |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Bauwerke entfernen |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Überreste entfernen |
| `destroy_buildings`, `make_ruins` | Was mit Gebäuden (building) geschieht |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Zustände entfernen |
| `add_burned`, `add_heat`, `flash` | Zustände hinzufügen |

Ein `ProjectileAsset` referenziert eine Option in `terraform_option` mit einer `terraform_range`, wodurch ein Explosivpfeil den getroffenen Boden säubert.

## Biome

Ein `BiomeAsset` in `AssetManager.biome_library` bestimmt, welche Kacheln wo entstehen. Eine Kachel wird einem Biom über `setBiome("biome_forest")` oder durch passende `biome_tags` zugeordnet. Das Klonen eines bestehenden Bioms und Austauschen der Kachel-IDs ist viel kürzer als ein Neubau - und die Regel "Klonen registriert automatisch" gilt auch hier.

> [!TIP] Die meisten Mods spielen sich auf den oberen Kacheln ab
> Fast alles, was Modder tatsächlich bauen (Mauern, Straßen, Felder, Verderbnis, die sich über Kontinente ausbreitet), ist eine obere Kachel mit einer `step_action` und ein wenig Platzierungslogik. Neue Bodentypen sind seltener, schwerer stimmig zu gestalten und interagieren mit dem Weltgenerator auf Weisen, die du dir nicht gewünscht hast :PES3_Yikes:.
