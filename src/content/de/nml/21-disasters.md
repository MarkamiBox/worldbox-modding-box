---
title: Katastrophen
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbmeteorite:
order: 184
---

# Katastrophen :wbmeteorite:

Eine Katastrophe ist ein Ereignis, das die Welt von selbst heimsucht: ein Tornado, eine Hitzewelle, ein Meteoriteneinschlag. Das Spiel würfelt im Laufe der Zeit automatisch Katastrophen aus, sodass im Gegensatz zu einer Gotteskraft **niemand auf etwas klicken muss**. Du legst die Bedingungen fest, die Welt erledigt den Rest.

## Eine hinzufügen

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

Binde es in `Main.cs` ein (siehe **[Die fertige Mod](#/nml/all-together)**), lade eine Welt mit mindestens einer Stadt und hundert Einheiten und warte ab. Nach einer Weile regnet der Himmel von ganz allein Funken :wbfireskull:.

### Die Felder

`rate` und `chance` sind die beiden, an denen du am meisten herumschraubst. Die Warnung unten auf der Seite erklärt, warum.

| Feld | Was es bewirkt |
| --- | --- |
| `rate` | Gewichtung: Wie oft es im Vergleich zu anderen Katastrophen gewählt wird |
| `chance` | Ein zweiter Würfelwurf, nachdem es ausgewählt wurde |
| `min_world_population` / `min_world_cities` | Bedingungen, bevor es überhaupt auftreten kann |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | Die ID eines `WorldLogAsset`: die Zeile im Weltprotokoll. **Kein** Textschlüssel, siehe unten |
| `action` | Dein Code. Das ist die eigentliche Katastrophe |
| `spawn_asset_unit` + `units_min`/`units_max` | Abkürzung für "Spawne N dieser Kreaturen" |
| `max_existing_units` | Spawne keine weiteren, wenn bereits so viele existieren |

## Spawne Kreaturen ohne eigenen Code

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"Kein Code" ist fast wahr. Eine Katastrophe benötigt **immer** eine `action`, da die Auswürfelung sie ohne Nullprüfung aufruft: Lässt du sie leer, wirft der erste Zufallstreffer eine `NullReferenceException`. Alle Kreaturen-Katastrophen des Hauptspiels verweisen auf die bibliothekseigene Methode `simpleUnitAssetSpawnUsingIslands`, die `spawn_asset_unit`, `units_min`, `units_max` und `max_existing_units` liest und den Weltprotokolleintrag für dich schreibt. Deine Katastrophe kann das genauso.

## Der Eintrag im Weltprotokoll

`world_log` ist nicht der eigentliche Text. Es ist die **ID eines `WorldLogAsset`** in `AssetManager.world_log_library`, und dieses Asset verweist auf den Textschlüssel. Gibst du eine nicht existierende ID an, baut `WorldLog.logDisaster()` im Moment des Auslösens eine Nachricht um `null` auf und wirft eine `NullReferenceException` :wbfacepalm:.

Katastrophen des Hauptspiels klonen eine gemeinsame Vorlage, `$basic_disaster$`, die bereits die Warnfarbe und die Kategorie "disasters" besitzt. Genauso macht es `HelloDisasters` oben:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Anschließend muss der Eintrag ins Protokoll geschrieben werden. Die Standard-Spawner rufen `WorldLog.logDisaster(pAsset, tile)` selbstständig auf. Eine eigene `action` tut das nicht automatisch, weshalb dein Code sie einmalig mit der Startkachel des Sturms aufruft: Dies ist die Kachel, zu der der "Hinspringen"-Button des Logs führt.

| Feld in `WorldLogAsset` | Was es bewirkt |
| --- | --- |
| `locale_id` | Der Lokalisierungsschlüssel. Fällt bei leerem Feld auf die ID zurück |
| `path_icon` | Das Icon am Anfang der Logzeile |
| `color` | Die Textfarbe der Zeile. Die Vorlage nutzt die Warnfarbe |
| `group` | Der Filter-Reiter des Weltprotokolls, zu dem der Eintrag gehört |
| `random_ids` | Wählt zufällig einen von mehreren Texten: `<locale_id>_1`, `_2`... |

Das Wolfs-Beispiel benötigt dieselben zwei Dinge: ein eigenes geklontes Log-Asset unter `disaster_hello_wolf_year` und den passenden `worldlog_disaster_hello_wolf_year`-Text. Der Standard-Spawner schreibt die Zeile automatisch.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Schreibe den Text wie eine Schlagzeile, nicht wie eine Beschreibung. "Glut fällt vom Himmel" schlägt "ein glutbezogenes Ereignis hat begonnen". Es ist die Zeile, die der Spieler im Weltprotokoll liest.

> [!WARNING] Teste mit hochgedrehten Wahrscheinlichkeiten
> `rate = 4, chance = 0.5f` bedeutet, dass du womöglich zwanzig Minuten warten musst, um deine eigene Katastrophe zu sehen. Drehe während der Entwicklung die `rate` stark nach oben und setze die Mindestanforderungen auf null. Vor der Veröffentlichung setzt du die Werte wieder zurück :PES2_EvilPlan:.
