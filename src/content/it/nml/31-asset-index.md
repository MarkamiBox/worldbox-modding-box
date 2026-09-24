---
title: Tutte le librerie di asset
group: Contenuto di gioco
subgroup: Architettura e statistiche
icon: :wbworld:
order: 94
---

# Tutte le librerie di asset :wbworld:

`AssetManager` è l'indice generale del gioco di tutto ciò che può esistere. Contiene ben **129 librerie**, e ciascuna di esse è una `List` combinata con un `Dictionary` che puoi leggere, modificare ed estendere dalla tua mod.

Questa pagina rappresenta l'indice integrale. La maggior parte di queste librerie non la toccherai mai. Il punto è che quando desideri cambiare qualcosa in WorldBox, la prima domanda è sempre "in quale libreria si trova?", e la risposta è qui.

## Prima di questa pagina

**[Librerie di asset](#/nml/asset-libraries)** spiega come si usa qualsiasi libreria: `has`, `get`, `add`, `clone`, modelli, riordinamento e le quattro regole universali che valgono per tutte le 129. Leggi prima quella guida. Questa pagina funge da catalogo.

La sintesi pratica:

```csharp
AssetManager.traits.has("hello_swift");            // è registrato?
AssetManager.traits.get("hello_swift");            // recuperalo (null se assente)
AssetManager.traits.add(myTrait);                  // registrame uno nuovo
AssetManager.traits.clone("hello_new", "brave");   // copia un esistente E registra la copia
AssetManager.traits.list;                          // ogni asset, in ordine
AssetManager.traits.dict;                          // ogni asset, per id
```

---

## Creature e loro tratti

Quelli che aprirai davvero sono i primi quattro. Gli altri sono qui per non farti tirare a indovinare i nomi :PES2_Shrug:.


| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Ogni tipo di creatura. **[Attori personalizzati](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Tratti degli attori. **[Tratti personalizzati](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Le relative schede. **[Gruppi di tratti e schede](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Tratti delle sottospecie e relative texture. **[Tratti di sottospecie](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Le relative schede |
| `phenotype_library` | `PhenotypeAsset` | Varianti di pelle e colore |
| `gene_library` | `GeneAsset` | Geni |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Tipi di cromosomi |
| `trait_rains` | `TraitRainAsset` | Eventi di "pioggia di tratti" |
| `personalities` | `PersonalityAsset` | Personalità delle unità |
| `professions` | `ProfessionAsset` | Professioni svolte dai cittadini |
| `base_stats_library` | `BaseStatAsset` | Tutte le statistiche. **[Riferimento statistiche](#/nml/stats)** |

## Società

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Tipi di fazione. **[Regni e fazioni](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Politiche del regno. **[Tratti del regno](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Culture. **[Tratti culturali](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Religioni. **[Tratti religiosi](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Clan. **[Tratti del clan](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Lingue. **[Tratti della lingua](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | Aspetto degli edifici delle culture |
| `city_build_orders` | `CityBuildOrderAsset` | Cosa edifica una nuova città e con quale ordine |
| `war_types_library` | `WarTypeAsset` | Tipologie di guerra |
| `loyalty_library` | `LoyaltyAsset` | Fonti di lealtà |
| `opinion_library` | `OpinionAsset` | Fonti di opinione |
| `happiness_library` | `HappinessAsset` | Fonti di felicità |
| `plots_library` / `plot_category_library` | `PlotAsset` | Cospirazioni ordite da unità e sistemi |
| `decisions_library` | `DecisionAsset` | Decisioni prese dall'IA |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | Argomenti di discussione delle unità |
| `book_types` | `BookTypeAsset` | Tipi di libri |
| `knowledge_library` | `KnowledgeAsset` | La finestra della conoscenza |

## Elementi nel mondo

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Ogni edificio. **[Edifici personalizzati](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Strato del terreno. **[Caselle e terreno](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Strato superiore di superficie |
| `tile_tile_effects` | `TileEffectAsset` | Effetti specifici per casella |
| `terraform` | `TerraformOptions` | Pulizia preimpostata del terreno |
| `biome_library` | `BiomeAsset` | Biomi |
| `resources` | `ResourceAsset` | Cibo, materiali, valute. **[Risorse e cibo](#/nml/resources)** |
| `clouds` | `CloudAsset` | Meteo. **[Nuvole e meteo](#/nml/clouds)** |
| `drops` | `DropAsset` | Cose che cadono. **[Drop e oggetti cadenti](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Disastri. **[Disastri](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Cose che volano. **[Proiettili, incantesimi ed effetti](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Effetti visivi |
| `months` | `MonthAsset` | Il calendario |
| `era_library` | `WorldAgeAsset` | Ere del mondo |
| `time_scales` | `WorldTimeScaleAsset` | Velocità di scorrimento del tempo |
| `map_sizes` | `MapSizeAsset` | Dimensioni delle mappe |
| `map_gen_settings` / `map_gen_templates` | `MapGenSettingsAsset` | Generazione del mondo |
| `world_behaviours` | `WorldBehaviourAsset` | Comportamenti di fondo del mondo |
| `sim_globals_library` | `SimGlobalAsset` | Costanti globali di simulazione |

## Oggetti ed equipaggiamento

Solo `window_library` ha una pagina dedicata qui. Il resto funziona, ma toccalo solo se sai esattamente cosa fai :PES5_Hmmmm:.


| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Armi, armature, materiali. **[Oggetti personalizzati](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Incantamenti. **[Incantamenti delle armi](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Categorie di equipaggiamento. **[Gruppi di oggetti e schede](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Strumenti di lavoro tenuti in mano |
| `status` | `StatusAsset` | Effetti di stato. **[Effetti di stato](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Incantesimi lanciati dalle unità |
| `combat_action_library` | `CombatActionAsset` | Mosse da combattimento |
| `rarity_library` | `RarityAsset` | Gradi di rarità |

## Strumenti del giocatore

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `powers` | `GodPower` | Poteri divini. **[Poteri divini](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Schede della barra inferiore. **[Schede e pulsanti dei poteri](#/nml/power-buttons)** |
| `world_laws_library` / `world_law_groups` | `WorldLawAsset` | Leggi del mondo. **[Leggi del mondo](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Dimensioni dei pennelli |
| `hotkey_library` | `HotkeyAsset` | Scorciatoie da tastiera |
| `debug_tool_library` | `DebugToolAsset` | Strumenti di debug |

## Intelligenza Artificiale

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | IA delle unità. **[IA e comportamenti personalizzati](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | IA delle città |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | IA dei regni |
| `citizen_job_library` | `CitizenJobAsset` | Lavoro dei cittadini |
| `neural_layers` | `NeuralLayerAsset` | Visualizzatore dei livelli neurali di debug |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | Banco di test interno per l'IA |

## Interfaccia

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Finestre. **[Finestre personalizzate](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | Finestre di elenchi (regni, città, …) |
| `tooltips` | `TooltipAsset` | Layout dei tooltip |
| `nameplates_library` | `NameplateAsset` | Targhette col nome sopra le unità |
| `options_library` | `OptionAsset` | Impostazioni di gioco |
| `color_style_library` | `ColorStyleAsset` | Stili di colore dell'interfaccia |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Sprite generati a runtime |
| `quantum_sprites` | `QuantumSpriteAsset` | Varianti di sprite |
| `meta_type_library` | `MetaTypeAsset` | Sistemi meta stessi (cultura, religione, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Opzioni dell'editor dei meta |
| `meta_representation_library` | `MetaRepresentationAsset` | Resa visiva di un meta |
| `meta_text_report_library` | `MetaTextReportAsset` | Rapporti testuali sui meta |
| `architect_mood_library` | `ArchitectMood` | Stati d'animo della modalità architetto |

## Stendardi e colori

Una libreria per ciascun ambito, tutte contenenti i medesimi due tipi di asset:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → tutti `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → tutti `ColorAsset`

## Nomi, parole e storia

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Generatori di nomi |
| `name_sets` | `NameSetAsset` | Bacini di nomi da cui attingere |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | Evoluzione e genesi dei nomi |
| `linguistics_library` | `LinguisticsAsset` | Struttura linguistica |
| `words_library` | `WordAsset` | Parole |
| `sentences_library` | `SentenceAsset` | Frasi |
| `story_library` | `StoryAsset` | Storie generate |
| `world_log_library` | `WorldLogAsset` | Tipi di voci nel registro del mondo |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Cronache storiche |
| `history_groups` | `HistoryGroupAsset` | Categorie storiche |
| `graph_time_library` | `GraphTimeAsset` | Intervalli temporali dei grafici |
| `statistics_library` | `StatisticsAsset` | Statistiche monitorate |

## Audio, lingue e traguardi

| Libreria | Asset | Cosa contiene |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Brani musicali |
| `game_language_library` | `GameLanguageAsset` | Lingue dell'interfaccia |
| `locale_groups_library` | `LocaleGroupAsset` | Raggruppamenti di localizzazione |
| `achievements` / `achievement_groups` | `Achievement` | Obiettivi |
| `signals` | `SignalAsset` | Il sistema interno di segnali |

---

## Come trovare quella giusta

1. **Indovina il sostantivo.** Quasi ogni libreria porta esattamente il nome di ciò che contiene.
2. **Stampa i contenuti.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` scopre quali ID esistono in due righe.
3. **Leggi il metodo `init()` della libreria.** Ogni asset vanilla è istanziato lì in C# pulito: è la migliore documentazione esistente per capire a cosa serve ogni campo. Vedi **[Leggere il codice di gioco](#/toolbox/reading-the-game-code)**.

> [!TIP] Modifica prima di aggiungere
> Una quantità sorprendente di modding consiste in una `get()` seguita dalla modifica di tre campi su qualcosa che già esiste. È più compatto, resiste meglio agli aggiornamenti del gioco e non richiede nuovi disegni :PES2_Wise:.
