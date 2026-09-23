---
title: Eigene Gebäude
group: Spielinhalte
subgroup: Akteure, Gebäude & KI
icon: :wbcities:
order: 142
---

# Eigene Gebäude :wbcities:

Bei Gebäuden hört das WorldBox-Modding auf, ein simples "Ändere eine Zahl" zu sein, und wird zu "Dieses Asset hat einhundertvierzig Felder und die meisten davon tun für meinen Fall überhaupt nichts" :PES2_Weary:.

Wir bauen ein Gebäude also nicht von Grund auf neu. Wir klonen eines, das bereits funktioniert.

## Erst klonen, dann anpassen

`clone(newId, sourceId)` kopiert jedes Feld des Originals, benennt es um **und registriert es**. Dieser letzte Teil ist entscheidend:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

Alles, was du nicht explizit setzt, bleibt exakt so wie bei `temple_human`, einem voll funktionsfähigen Stadtgebäude. Das ist der ganze Trick.

> [!WARNING] Rufe nach clone() nicht add() auf
> `clone()` hat die Kopie bereits registriert. Ein anschließendes `AssetManager.buildings.add(shrine)` registriert sie ein zweites Mal, wodurch die Bibliothek die erste Kopie verwirft und `duplicate asset - overwriting...` protokolliert. Es funktioniert zwar trotzdem, aber es erzeugt Müll in deinem Log und ist das Erste, worauf jeder beim Code-Review zeigen wird.

## Was als Klonbasis taugt

Die Bibliothek verfügt sowohl über `$…$`-Vorlagen als auch über fertige Gebäude:

| Quelle | Verwendungszweck |
| --- | --- |
| `$building$` | Die nackte Basis |
| `$city_building$` | Alles, was eine Stadt baut. `well` und `mine` nutzen dies |
| `$city_colored_building$` | Dasselbe, aber eingefärbt in der Farbe des Königreichs |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Kulturbezogene Zivilisationsgebäude |
| `$building_creep$` | Kriecher-Strukturen (Creep) |
| `$mineral$` | Abbaubare Felsen und Erze |
| `$resource$`, `$flora_small$` | Erntbare Natur |
| `tree_green_1` | Jeder Vanilla-Baum wird von diesem geklont |

Fertige Gebäude, die sich zum Klonen lohnen: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Das Klonen des nächstliegenden Verwandten kostet zehn Minuten Lektüre und erspart dir einen ganzen Abend voller wirkungsloser Felder.

## Die Felder nach Verwendungszweck

### Welche Art von Gebäude es ist

| Feld | Was es bewirkt |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | Gehört zu einer Stadt, erhält also Königreichsfarben, Zonen und Arbeitsplätze |
| `type` | Ein freier Text-Tag, nach dem die Listen des Spiels gruppieren |
| `kingdom`, `civ_kingdom` | Beschränkt es auf eine bestimmte Fraktion |
| `ignored_by_cities` | Städte bauen oder zählen es niemals |

### Wohnraum und Nutzen

| Feld | Was es bewirkt |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Ob und wie viele Bürger darin wohnen |
| `housing_happiness` | Zufriedenheitsbonus durch das Wohnen dort |
| `storage`, `storage_only_food`, `is_stockpile` | Ob es Ressourcen lagert |
| `book_slots` | Bibliothekskapazität für Bücher |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | Schiffsproduktion |
| `spawn_units`, `spawn_units_asset` | Spawnt Einheiten und Kreaturen |
| `tower`, `tower_projectile`, `tower_projectile_reload` … | Turm-Angriff und Schießen |

### Bauen und Platzieren

| Feld | Was es bewirkt |
| --- | --- |
| `cost`, `construction_progress_needed` | Kosten der Stadt und benötigte Bauzeit |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from` … | Upgrade-Ketten, wie `house_human_0` bis `_5` |
| `build_place_borders`, `build_place_center` … | Wo in der Stadt es platziert wird |
| `build_prefer_replace_house`, `check_for_close_building` … | Platzierungsregeln |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Wie viele davon existieren dürfen |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks` … | Geländeregeln |
| `build_road_to` | Die Stadt baut eine Straße dorthin |

### Natur und Wachstum

| Feld | Was es bewirkt |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | Wächst im Spielverlauf von selbst |
| `growth_time`, `has_resources_grown_to_collect` | Frucht- und Erntezyklen |
| `biome_tags_growth`, `has_biome_tags` | In welchen Biomen es wächst |
| `resources_given`, `addResource(id, amount, pNewList)` | Ressourcenertrag beim Abbauen |
| `can_be_chopped_down`, `gatherable` | Ob Einheiten es fällen oder abernten können |
| `grow_creep` und seine `grow_creep_*`-Verwandten | Ausbreitungsverhalten von Kriechern |

### Schaden und Zerstörung

| Feld | Was es bewirkt |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid` … | Was das Gebäude beschädigt |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin` … | Was nach der Zerstörung übrig bleibt |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | Wie es verschwindet |
| `loot_generation` | Was beim Einsturz gedroppt wird |

### Aussehen

| Feld | Was es bewirkt |
| --- | --- |
| `sprite_path` + `main_path` | Wo das Sprite liegt |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Welcher Sprite-Atlas genutzt wird |
| `scale_base`, `bonus_z`, `random_flip` | Größe, Render-Reihenfolge, Spiegelung |
| `shadow`, `shadow_bound`, `shadow_distortion` | Der Schatten |
| `has_kingdom_color` | Wird in der Farbe des herrschenden Königreichs getönt |
| `draw_light_area`, `draw_light_size` | Lichtschein |
| `has_special_animation_state`, `animation_speed` … | Animation |

### Verhalten

| Feld | Was es bewirkt |
| --- | --- |
| `step_action`, `has_step_action` | Eigener Code beim Tick des Gebäudes |
| `base_stats` | Stats, die das Gebäude beisteuert |
| `priority` | Priorität in der Bau-Warteschlange der Stadt |

## Sprites

Gebäude suchen ihre Grafik unter `main_path + sprite_path`, also `buildings/hello_shrine`. Lege dein PNG unter `GameResources/buildings/hello_shrine.png` ab und es wird wie jedes Vanilla-Gebäude aufgelöst. Gib ihm in deiner `sprites.json` einen Drehpunkt unten in der Mitte (bottom-centre pivot), sonst schwebt dein Schrein wie ein Geist über dem Boden :aPES_GhostDance:. Siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**.

## Dein eigenes Sprite

Gebäude sind das einzige Asset, das **zwei** Felder aneinanderklebt: `main_path + sprite_path`. `main_path` ist standardmäßig bereits `buildings/`, daher ist `sprite_path` nur der reine Dateiname.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

Die **Dateinamen sind das Format**. Der Loader teilt jeden Namen an `_`: davor steht die Art (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`), danach die Nummer des Animationsframes. `main_0`, `main_1`, `main_2` ist eine Animation mit drei Frames. Eine anders benannte Datei ist kein Frame, und ein Ordner ohne `main_0` gibt dem Gebäude nichts zum Zeichnen. `mini` ist das Minimap-Symbol: `mini_0` muss genau so viele Pixel haben, wie das Gebäude Tiles belegt, 5x4 für alles, was von `temple_human` geklont ist. Fehlt es, wirft die Minimap bei jedem Neuzeichnen `NullReferenceException` in `Building.getColorForMinimap()`.

```csharp
shrine.main_path = "buildings/";       // der Standard, du änderst ihn selten
shrine.sprite_path = "hello_shrine";   // NICHT "buildings/hello_shrine"
```

Mischst du beide, Ordner in `main_path` und leeres `sprite_path`, sucht das Spiel nach `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Lade die Frames selbst, nachdem der Pfad gesetzt ist
> Das Spiel füllt `building_sprites` für jedes Gebäude im eigenen Preload, der vor deiner Mod läuft. Ein Gebäude, das du danach registrierst, hat eine leere Frame-Liste, und beim ersten Platzieren stirbt das Spiel in `Building.setAnimData()` mit `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Ruf `shrine.loadBuildingSprites();` auf, sobald `sprite_path` gesetzt ist.
>
> Sein Geschwister ist `atlas_asset`, der Sprite-Atlas, der das Gebäude in der Farbe seines Besitzers einfärbt. Die Library verknüpft ihn in `checkAtlasLink()`, ebenfalls beim Start. Ohne ihn lässt sich das Gebäude platzieren und wirft dann `NullReferenceException` in `DynamicSprites.getRecoloredBuilding()`, **in jedem Frame, in dem es zu sehen ist**.


Gib ihm in deiner `sprites.json` einen **Drehpunkt unten in der Mitte**, sonst schwebt dein Schrein wie ein Geist über dem Boden (siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**).

## Ein Gebäude auf der Karte platzieren

`World.world.buildings.addBuilding(...)` ist als `internal` markiert, kompiliert also nur mit einer **publicized** `Assembly-CSharp.dll` (siehe den Hinweis in **[Statuseffekte](#/nml/status-effects)**):

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Frage immer zuerst `canBuildFrom` ab. Ein Gebäude auf Wasser, auf ein anderes Gebäude oder auf ein von einer Stadt beanspruchtes Feld zu setzen, erzeugt eine Welt, die anfangs gut aussieht und drei Minuten später kaputtgeht :PES_OhShit:.


## Städte das Gebäude bauen lassen

Eine göttliche Kraft, die deinen Schrein platziert, ist ein netter Zeitvertreib. Ein Schrein, den Städte eigenständig bauen, sobald sie groß genug sind, ist eine Mod. Städte entscheiden anhand zweier Komponenten, was sie bauen, und dein Gebäude fehlt bisher in beiden:

| | Was darin enthalten ist |
| --- | --- |
| Ein **Bauauftrag** (`AssetManager.city_build_orders`) | Eine Liste von Auftragsschlüsseln wie `order_temple` samt Einwohner- und Gebäudeanforderungen |
| Eine **Architektur** (`AssetManager.architecture_library`) | Welches Gebäude ein Auftragsschlüssel für diese Rasse bedeutet: `order_temple` ist `temple_human` bei Menschen, etwas anderes bei Orks |

Du erfindest also einen Auftragsschlüssel, bringst jeder Architektur bei, was er bedeutet, und fügst ihn den Bauaufträgen hinzu:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // Eigener Typ, damit die Stadt Schreine gegen ihr eigenes Limit zählt, nicht gegen Tempel
    shrine.type = "type_hello_shrine";

    // Die Architektursuche ist ein einfaches Wörterbuch: Ein unbekannter Schlüssel wirft einen Fehler für jede Stadt
    // dieser Rasse. Lehre ihn allen Architekturen, auch denen, die ihn nie erreichen werden.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // dasselbe Limit wie beim Tempel: 1 Exemplar, 50 Einwohner, 15 Gebäude in der Stadt
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

Rufe `AddToCities()` am Ende von `Initialize()` nach dem Klonen auf.

Im Gegensatz zu vielem anderen in diesem Guide gibt es hier keine Start-Falle: `CityBehBuild.calcPossibleBuildings()` liest die Bauauftragsliste jeder Stadt jedes Mal neu aus, wenn sie über einen Bau nachdenkt. Ein beim Laden hinzugefügter Auftrag wird also sofort von der ersten prüfenden Stadt gesehen. Die Stadt muss dennoch die Baukosten (`cost`) bezahlen und jede Zahl der Bedingung erfüllen; kann sie das nicht, überspringt sie deinen Schrein lautlos :PES5_Hmmmm:.

| Argument von `addBuilding(...)` | Was es bewirkt |
| --- | --- |
| `pID` | Der Auftragsschlüssel, nicht die Gebäude-ID |
| `pLimitType` | Wie viele die Stadt besitzen darf. Der Tempel nutzt `1` |
| `pPop` | Mindesteinwohnerzahl |
| `pBuildings` | Mindestanzahl bereits vorhandener Gebäude in der Stadt |
| `pCheckFullVillage` | Nur wenn alle Häuser voll belegt sind |
| `pCheckHouseLimit` | Für Wohnhäuser: Überspringen, solange kein Wohnraummangel herrscht, Stopp am Häuserlimit |
| `pMinZones` | Mindestgröße der Stadt in Zonen |

## Die Texte

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Lies das Original, bevor du es klonst
> Öffne die `BuildingLibrary` in **dnSpy** und sieh dir an, wie sich `house_human_0`, `tree_green_1` und `mineral_stone` unterscheiden. Jedes Vanilla-Gebäude wird dort in reinem C# konstruiert - die beste Feld-für-Feld-Dokumentation, die existiert :PES_Smart:.
