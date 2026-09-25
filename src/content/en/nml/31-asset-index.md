---
title: Every asset library
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 94
---

# Every asset library :wbworld:

`AssetManager` is the game's index of everything that can exist. It holds **129 libraries**, and every one of them is a `List` plus a `Dictionary` you can read, edit and add to from your mod.

This page is the whole list. Most of it you will never touch. The point is that when you want to change something in WorldBox, the first question is always "which library is it in?", and the answer is on this page.

## Before this page

**[Asset libraries](#/nml/asset-libraries)** covers how any of them is used: `has`, `get`, `add`, `clone`, templates, reordering, and the four rules that hold for all 129. Read that one first. This page is only the index.

The short version:

```csharp
AssetManager.traits.has("hello_swift");            // is it registered?
AssetManager.traits.get("hello_swift");            // fetch it (null if missing)
AssetManager.traits.add(myTrait);                  // register a new one
AssetManager.traits.clone("hello_new", "strong");   // copy an existing one AND register the copy
AssetManager.traits.list;                          // every asset, in order
AssetManager.traits.dict;                          // every asset, by id
```

---

## Creatures and their traits

The ones you will actually open are the first four. The rest are here so you stop guessing names :PES2_Shrug:.

| Library | Asset | What it holds |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Every creature type. **[Custom actors](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Actor traits. **[Custom traits](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Their tabs. **[Trait groups & tabs](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Subspecies traits, including their art. **[Subspecies traits](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Their tabs |
| `phenotype_library` | `PhenotypeAsset` | Skin and colour variants |
| `gene_library` | `GeneAsset` | Genes |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Chromosome kinds |
| `trait_rains` | `TraitRainAsset` | The "rain of traits" events |
| `personalities` | `PersonalityAsset` | Unit personalities |
| `professions` | `ProfessionAsset` | Jobs a citizen can hold |
| `base_stats_library` | `BaseStatAsset` | Every stat. **[Stats reference](#/nml/stats)** |

## Societies

The five trait libraries are the friendly ones, each with its own page. Everything below `language_traits` is the deep end.

| Library | Asset | What it holds |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Faction types. **[Kingdoms & factions](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Kingdom policy. **[Kingdom traits](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Cultures. **[Culture traits](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Religions. **[Religion traits](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Clans. **[Clan traits](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Languages. **[Language traits](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | What a culture's buildings look like |
| `city_build_orders` | `CityBuildOrderAsset` | What a new city builds, in order |
| `war_types_library` | `WarTypeAsset` | Kinds of war. **[War types](#/nml/war-types)** |
| `loyalty_library` | `LoyaltyAsset` | Loyalty sources |
| `opinion_library` | `OpinionAsset` | Opinion sources |
| `happiness_library` | `HappinessAsset` | Happiness sources |
| `plots_library` | `PlotAsset` | Schemes rulers start and pay for. **[Plots](#/nml/plots)** |
| `plot_category_library` | `PlotCategoryAsset` | The sections of the plots window. **[Plots](#/nml/plots)** |
| `decisions_library` | `DecisionAsset` | AI decisions |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | What units talk about |
| `book_types` | `BookTypeAsset` | Kinds of book. **[Books](#/nml/books)** |
| `knowledge_library` | `KnowledgeAsset` | The knowledge window |

## Things in the world

Everything that sits on the map, falls on it, or flies over it. `buildings` and `tiles` are the two you will hit first.

| Library | Asset | What it holds |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Every building. **[Custom buildings](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Ground layer. **[Tiles & terrain](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Top layer |
| `tile_tile_effects` | `TileEffectAsset` | Per-tile effects |
| `terraform` | `TerraformOptions` | Named terrain clean-ups |
| `biome_library` | `BiomeAsset` | Biomes. **[Biomes](#/nml/biomes)** |
| `resources` | `ResourceAsset` | Food, materials, currency. **[Resources & food](#/nml/resources)** |
| `clouds` | `CloudAsset` | Weather. **[Clouds & weather](#/nml/clouds)** |
| `drops` | `DropAsset` | Falling things. **[Drops & falling things](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Disasters. **[Disasters](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Flying things. **[Projectiles, spells & effects](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Visual effects |
| `months` | `MonthAsset` | The calendar |
| `era_library` | `WorldAgeAsset` | World ages |
| `time_scales` | `WorldTimeScaleAsset` | Game speeds. "Faster" walks `list` in order and, outside debug mode, never reaches the last entry (vanilla's `x40`). A speed you append becomes that unreachable one: `Insert` it before the last |
| `map_sizes` | `MapSizeAsset` | The sizes in the new-world window. **[Map generation](#/nml/map-generation)** |
| `map_gen_templates` | `MapGenTemplate` | World shapes: `continent`, `islands`, `donut`... **[Map generation](#/nml/map-generation)** |
| `map_gen_settings` | `MapGenSettingsAsset` | The sliders and switches under a template. **[Map generation](#/nml/map-generation)** |
| `world_behaviours` | `WorldBehaviourAsset` | World-level background behaviour |
| `sim_globals_library` | `SimGlobalAsset` | Global simulation constants |

## Items and combat

| Library | Asset | What it holds |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Weapons, armour, materials. **[Custom items](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Enchantments. **[Weapon enchantments](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Equipment categories. **[Item groups & tabs](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Tools units hold for work |
| `status` | `StatusAsset` | Status effects. **[Status effects](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Spells units cast |
| `combat_action_library` | `CombatActionAsset` | Combat moves |
| `rarity_library` | `RarityAsset` | Rarity tiers |

## The player's tools

| Library | Asset | What it holds |
| --- | --- | --- |
| `powers` | `GodPower` | God powers. **[God powers](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Bottom-bar tabs. **[Power tabs & buttons](#/nml/power-buttons)** |
| `world_laws_library` | `WorldLawAsset` | World laws. **[World laws](#/nml/world-laws)** |
| `world_law_groups` | `WorldLawGroupAsset` | The tabs of the World Laws window. **[World laws](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Brush sizes |
| `hotkey_library` | `HotkeyAsset` | Keyboard shortcuts |
| `debug_tool_library` | `DebugToolAsset` | Debug tools |

## AI

| Library | Asset | What it holds |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | Unit AI. **[Custom AI & behaviours](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | City AI |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | Kingdom AI |
| `citizen_job_library` | `CitizenJobAsset` | Citizen work |
| `neural_layers` | `NeuralLayerAsset` | The neural layer debug view |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | The game's own AI test harness |

## Interface

`window_library` and `options_library` have pages here. The rest works, but touch it only when you really mean it :PES5_Hmmmm:.

| Library | Asset | What it holds |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Windows. **[Custom windows](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | The list windows (kingdoms, cities, …) |
| `tooltips` | `TooltipAsset` | Tooltip layouts |
| `nameplates_library` | `NameplateAsset` | The name banners map modes draw over kingdoms, cities, clans... One per `MetaType`: its `add()` throws for a map mode that already has one, so edit the vanilla plate with `get()` |
| `options_library` | `OptionAsset` | The game's own settings window. **[Game options](#/nml/game-options)** |
| `color_style_library` | `ColorStyleAsset` | UI colour styles |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Runtime-generated sprites |
| `quantum_sprites` | `QuantumSpriteAsset` | Sprite variants |
| `meta_type_library` | `MetaTypeAsset` | The meta systems themselves (culture, religion, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Meta editor options |
| `meta_representation_library` | `MetaRepresentationAsset` | How a meta is drawn |
| `meta_text_report_library` | `MetaTextReportAsset` | Meta text reports |
| `architect_mood_library` | `ArchitectMood` | Architect mode moods |

## Banners and colours

One library each, all holding the same two asset types:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → all `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → all `ColorAsset`

## Names, words and history

The part of the game that writes the history books. Holy amount of libraries for a game about throwing meteors at people.

| Library | Asset | What it holds |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Name generators. **[Name generators](#/nml/name-generators)** |
| `name_sets` | `NameSetAsset` | Name pools they draw from |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | How names form and drift |
| `linguistics_library` | `LinguisticsAsset` | Language construction |
| `words_library` | `WordAsset` | Words |
| `sentences_library` | `SentenceAsset` | Sentences |
| `story_library` | `StoryAsset` | Generated stories |
| `world_log_library` | `WorldLogAsset` | World log entry types |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Recorded history |
| `history_groups` | `HistoryGroupAsset` | History categories |
| `graph_time_library` | `GraphTimeAsset` | Graph time ranges |
| `statistics_library` | `StatisticsAsset` | Tracked statistics |

## Sound, language and progress

| Library | Asset | What it holds |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Music tracks |
| `game_language_library` | `GameLanguageAsset` | The game's UI languages |
| `locale_groups_library` | `LocaleGroupAsset` | Locale groupings |
| `achievements` / `achievement_groups` | `Achievement` | Achievements |
| `signals` | `SignalAsset` | The internal signal system |

---

## How to find the right one

1. **Guess the noun.** Nearly every library is named after what it holds.
2. **Print what is in it.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` is a two-line answer to "what ids exist".
3. **Read the library's `init()`.** Every vanilla asset is constructed there in plain C#, so it is the best documentation that exists for what a field is actually for. See **[Reading the game's code](#/toolbox/reading-the-game-code)**.

> [!TIP] Edit before you add
> A surprising amount of modding is `get()` followed by changing three fields on something that already exists. It is shorter, it survives game updates better, and it does not need art :PES2_Wise:.
