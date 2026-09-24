---
title: Alle Asset-Bibliotheken
group: Spielinhalte
subgroup: Architektur & Statistiken
icon: :wbworld:
order: 94
---

# Alle Asset-Bibliotheken :wbworld:

`AssetManager` ist das Verzeichnis des Spiels für alles, was existieren kann. Er enthält **129 Bibliotheken**, und jede davon ist eine `List` plus ein `Dictionary`, die du von deiner Mod aus lesen, bearbeiten und erweitern kannst.

Diese Seite ist der vollständige Index. Den Großteil davon wirst du nie anrühren. Der Zweck ist: Wenn du etwas in WorldBox ändern willst, lautet die erste Frage immer "in welcher Bibliothek liegt es?" - und die Antwort steht auf dieser Seite.

## Vor dieser Seite

**[Asset-Bibliotheken](#/nml/asset-libraries)** erklärt, wie jede davon verwendet wird: `has`, `get`, `add`, `clone`, Vorlagen, Umsortieren und die vier Regeln, die für alle 129 gelten. Lies zuerst jene Seite. Diese Seite hier ist nur der Index.

Die Kurzfassung:

```csharp
AssetManager.traits.has("hello_swift");            // ist es registriert?
AssetManager.traits.get("hello_swift");            // abrufen (null, falls nicht vorhanden)
AssetManager.traits.add(myTrait);                  // ein neues registrieren
AssetManager.traits.clone("hello_new", "brave");   // ein bestehendes kopieren UND die Kopie registrieren
AssetManager.traits.list;                          // jedes Asset, der Reihe nach
AssetManager.traits.dict;                          // jedes Asset, nach ID
```

---

## Kreaturen und ihre Eigenschaften

Die ersten vier wirst du tatsächlich öffnen. Der Rest steht hier, damit du keine Namen raten musst :PES2_Shrug:.


| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Jeder Kreaturentyp. **[Eigene Akteure](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Akteurseigenschaften. **[Eigene Eigenschaften](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Deren Tabs. **[Eigenschaftsgruppen & Tabs](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Unterarteigenschaften, inklusive Grafiken. **[Unterarteigenschaften](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Deren Tabs |
| `phenotype_library` | `PhenotypeAsset` | Haut- und Farbvarianten |
| `gene_library` | `GeneAsset` | Gene |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Chromosomentypen |
| `trait_rains` | `TraitRainAsset` | Ereignisse für "Eigenschaften-Regen" |
| `personalities` | `PersonalityAsset` | Persönlichkeiten von Einheiten |
| `professions` | `ProfessionAsset` | Berufe von Bürgern |
| `base_stats_library` | `BaseStatAsset` | Alle Werte. **[Statistiken-Referenz](#/nml/stats)** |

## Gesellschaften

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Fraktionstypen. **[Königreiche & Fraktionen](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Königreichspolitik. **[Königreicheigenschaften](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Kulturen. **[Kultureigenschaften](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Religionen. **[Religionseigenschaften](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Clans. **[Claneigenschaften](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Sprachen. **[Spracheigenschaften](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | Aussehen der Kulturgebäude |
| `city_build_orders` | `CityBuildOrderAsset` | Was eine neue Stadt baut, der Reihe nach |
| `war_types_library` | `WarTypeAsset` | Kriegsarten. **[Kriegsarten](#/nml/war-types)** |
| `loyalty_library` | `LoyaltyAsset` | Loyalitätsquellen |
| `opinion_library` | `OpinionAsset` | Meinungsquellen |
| `happiness_library` | `HappinessAsset` | Zufriedenheitsquellen |
| `plots_library` / `plot_category_library` | `PlotAsset` | Verschwörungen von Einheiten und Systemen |
| `decisions_library` | `DecisionAsset` | KI-Entscheidungen |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | Worüber Einheiten sprechen |
| `book_types` | `BookTypeAsset` | Bucharten. **[Bücher](#/nml/books)** |
| `knowledge_library` | `KnowledgeAsset` | Das Wissensfenster |

## Dinge in der Welt

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Jedes Gebäude. **[Eigene Gebäude](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Bodenschicht. **[Kacheln & Terrain](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Oberflächenschicht |
| `tile_tile_effects` | `TileEffectAsset` | Effekte pro Kachel |
| `terraform` | `TerraformOptions` | Benannte Terrainbereinigungen |
| `biome_library` | `BiomeAsset` | Biome. **[Biome](#/nml/biomes)** |
| `resources` | `ResourceAsset` | Nahrung, Materialien, Währung. **[Ressourcen & Nahrung](#/nml/resources)** |
| `clouds` | `CloudAsset` | Wetter. **[Wolken & Wetter](#/nml/clouds)** |
| `drops` | `DropAsset` | Fallende Objekte. **[Drops & fallende Objekte](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Katastrophen. **[Katastrophen](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Fliegende Objekte. **[Projektile, Zauber & Effekte](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Visuelle Effekte |
| `months` | `MonthAsset` | Der Kalender |
| `era_library` | `WorldAgeAsset` | Zeitalter der Welt |
| `time_scales` | `WorldTimeScaleAsset` | Spielgeschwindigkeiten |
| `map_sizes` | `MapSizeAsset` | Kartengrößen |
| `map_gen_settings` / `map_gen_templates` | `MapGenSettingsAsset` | Weltgenerierung |
| `world_behaviours` | `WorldBehaviourAsset` | Hintergrundverhalten auf Weltebene |
| `sim_globals_library` | `SimGlobalAsset` | Globale Simulationskonstanten |

## Gegenstände und Kampf

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Waffen, Rüstung, Materialien. **[Eigene Gegenstände](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Verzauberungen. **[Waffen-Verzauberungen](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Ausrüstungskategorien. **[Gegenstandsgruppen & Tabs](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Werkzeuge, die Einheiten bei der Arbeit halten |
| `status` | `StatusAsset` | Status-Effekte. **[Status-Effekte](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Zauber, die Einheiten wirken |
| `combat_action_library` | `CombatActionAsset` | Kampfaktionen |
| `rarity_library` | `RarityAsset` | Seltenheitsstufen |

## Werkzeuge des Spielers

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `powers` | `GodPower` | Gotteskräfte. **[Gotteskräfte](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Leisten-Tabs unten. **[Kräfte-Tabs & Buttons](#/nml/power-buttons)** |
| `world_laws_library` / `world_law_groups` | `WorldLawAsset` | Weltgesetze. **[Weltgesetze](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Pinselgrößen |
| `hotkey_library` | `HotkeyAsset` | Tastaturkürzel |
| `debug_tool_library` | `DebugToolAsset` | Debug-Werkzeuge |

## KI

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | Einheiten-KI. **[Eigene KI & Verhaltensweisen](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | Stadt-KI |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | Königreich-KI |
| `citizen_job_library` | `CitizenJobAsset` | Bürgerarbeit |
| `neural_layers` | `NeuralLayerAsset` | Ansicht der neuronalen Schichten im Debugger |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | Eigene KI-Testumgebung des Spiels |

## Benutzeroberfläche

Nur `window_library` hat hier eine eigene Seite. Der Rest funktioniert, aber fasse ihn nur mit Bedacht an :PES5_Hmmmm:.


| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Fenster. **[Eigene Fenster](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | Die Listenfenster (Königreiche, Städte, …) |
| `tooltips` | `TooltipAsset` | Tooltip-Layouts |
| `nameplates_library` | `NameplateAsset` | Namensschilder über Einheiten |
| `options_library` | `OptionAsset` | Spieleinstellungen |
| `color_style_library` | `ColorStyleAsset` | Farbpaletten für UI |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Zur Laufzeit generierte Sprites |
| `quantum_sprites` | `QuantumSpriteAsset` | Sprite-Varianten |
| `meta_type_library` | `MetaTypeAsset` | Die Meta-Systeme selbst (Kultur, Religion, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Optionen des Meta-Editors |
| `meta_representation_library` | `MetaRepresentationAsset` | Wie ein Meta-System gezeichnet wird |
| `meta_text_report_library` | `MetaTextReportAsset` | Textberichte über Metas |
| `architect_mood_library` | `ArchitectMood` | Stimmungen im Architektenmodus |

## Banner und Farben

Jeweils eine Bibliothek, die alle dieselben zwei Asset-Typen enthalten:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → alle `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → alle `ColorAsset`

## Namen, Worte und Geschichte

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Namensgeneratoren. **[Namensgeneratoren](#/nml/name-generators)** |
| `name_sets` | `NameSetAsset` | Namenspools, aus denen sie schöpfen |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | Wie Namen entstehen und sich verändern |
| `linguistics_library` | `LinguisticsAsset` | Sprachaufbau |
| `words_library` | `WordAsset` | Wörter |
| `sentences_library` | `SentenceAsset` | Sätze |
| `story_library` | `StoryAsset` | Generierte Geschichten |
| `world_log_library` | `WorldLogAsset` | Typen von Welt-Log-Einträgen |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Aufgezeichnete Geschichte |
| `history_groups` | `HistoryGroupAsset` | Geschichtskategorien |
| `graph_time_library` | `GraphTimeAsset` | Zeitbereiche für Diagramme |
| `statistics_library` | `StatisticsAsset` | Erfasste Statistiken |

## Sound, Sprache und Fortschritt

| Bibliothek | Asset | Was sie enthält |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Musikstücke |
| `game_language_library` | `GameLanguageAsset` | Die UI-Sprachen des Spiels |
| `locale_groups_library` | `LocaleGroupAsset` | Lokalisierungsgruppierungen |
| `achievements` / `achievement_groups` | `Achievement` | Errungenschaften |
| `signals` | `SignalAsset` | Das interne Signalsystem |

---

## Wie man die richtige findet

1. **Errate das Substantiv.** Fast jede Bibliothek ist genau nach dem benannt, was sie verwaltet.
2. **Lass dir den Inhalt ausgeben.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` beantwortet "welche IDs gibt es" in zwei Zeilen.
3. **Lies das `init()` der Bibliothek.** Jedes Vanilla-Asset wird dort in purem C# erzeugt - es ist die beste Dokumentation dafür, wozu ein Feld tatsächlich dient. Siehe **[Den Spielcode lesen](#/toolbox/reading-the-game-code)**.

> [!TIP] Bearbeiten vor Neuanlegen
> Ein überraschend großer Teil des Moddings besteht aus `get()`, gefolgt vom Anpassen dreier Felder an etwas bereits Vorhandenem. Es ist kürzer, übersteht Spiel-Updates besser und erfordert keine Grafiken :PES2_Wise:.
