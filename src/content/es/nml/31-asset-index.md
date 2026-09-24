---
title: Todas las bibliotecas de assets
group: Contenido del juego
subgroup: Arquitectura y estadísticas
icon: :wbworld:
order: 94
---

# Todas las bibliotecas de assets :wbworld:

`AssetManager` es el índice del juego de todo lo que puede existir. Alberga **129 bibliotecas**, y cada una de ellas es una `List` más un `Dictionary` que puedes leer, editar y ampliar desde tu mod.

Esta página es el índice completo. La mayor parte jamás la tocarás. El propósito es que cuando quieras cambiar algo en WorldBox, la primera pregunta siempre sea "¿en qué biblioteca está?", y la respuesta esté en esta página.

## Antes de esta página

**[Bibliotecas de assets](#/nml/asset-libraries)** explica cómo se utiliza cualquiera de ellas: `has`, `get`, `add`, `clone`, plantillas, reordenación y las cuatro reglas universales para las 129. Lee esa página primero. Esta es solo el índice de referencia.

La versión corta:

```csharp
AssetManager.traits.has("hello_swift");            // ¿está registrado?
AssetManager.traits.get("hello_swift");            // obtenerlo (null si no existe)
AssetManager.traits.add(myTrait);                  // registrar uno nuevo
AssetManager.traits.clone("hello_new", "brave");   // copiar uno existente Y registrar la copia
AssetManager.traits.list;                          // cada asset, en orden
AssetManager.traits.dict;                          // cada asset, por su id
```

---

## Criaturas y sus rasgos

Los que realmente vas a abrir son los primeros cuatro. Los demás están aquí para que no tengas que adivinar nombres :PES2_Shrug:.


| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Cada tipo de criatura. **[Actores personalizados](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Rasgos de criaturas. **[Rasgos personalizados](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Sus pestañas. **[Grupos de rasgos y pestañas](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Rasgos de subespecies y su arte. **[Rasgos de subespecies](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Sus pestañas |
| `phenotype_library` | `PhenotypeAsset` | Variantes de piel y color |
| `gene_library` | `GeneAsset` | Genes |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Tipos de cromosomas |
| `trait_rains` | `TraitRainAsset` | Eventos de "lluvia de rasgos" |
| `personalities` | `PersonalityAsset` | Personalidades de las unidades |
| `professions` | `ProfessionAsset` | Oficios que ejerce un ciudadano |
| `base_stats_library` | `BaseStatAsset` | Cada estadística. **[Referencia de estadísticas](#/nml/stats)** |

## Sociedades

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Tipos de facción. **[Reinos y facciones](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Políticas del reino. **[Rasgos de reinos](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Culturas. **[Rasgos culturales](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Religiones. **[Rasgos religiosos](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Clanes. **[Rasgos de clanes](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Idiomas. **[Rasgos de idioma](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | Apariencia de los edificios de una cultura |
| `city_build_orders` | `CityBuildOrderAsset` | Qué construye una ciudad nueva y en qué orden |
| `war_types_library` | `WarTypeAsset` | Tipos de guerra. **[Tipos de guerra](#/nml/war-types)** |
| `loyalty_library` | `LoyaltyAsset` | Fuentes de lealtad |
| `opinion_library` | `OpinionAsset` | Fuentes de opinión |
| `happiness_library` | `HappinessAsset` | Fuentes de felicidad |
| `plots_library` / `plot_category_library` | `PlotAsset` | Conspiraciones que traman unidades y sistemas |
| `decisions_library` | `DecisionAsset` | Decisiones de la IA |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | Temas de conversación entre unidades |
| `book_types` | `BookTypeAsset` | Tipos de libros. **[Libros](#/nml/books)** |
| `knowledge_library` | `KnowledgeAsset` | La ventana de conocimiento |

## Elementos en el mundo

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Cada edificio. **[Edificios personalizados](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Capa de suelo. **[Casillas y terreno](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Capa superior |
| `tile_tile_effects` | `TileEffectAsset` | Efectos por casilla |
| `terraform` | `TerraformOptions` | Reglas de limpieza de terreno |
| `biome_library` | `BiomeAsset` | Biomas. **[Biomas](#/nml/biomes)** |
| `resources` | `ResourceAsset` | Comida, materiales, dinero. **[Recursos y comida](#/nml/resources)** |
| `clouds` | `CloudAsset` | Clima. **[Nubes y clima](#/nml/clouds)** |
| `drops` | `DropAsset` | Cosas que caen. **[Gotas y cosas que caen](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Desastres. **[Desastres](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Objetos que vuelan. **[Proyectiles, hechizos y efectos](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Efectos visuales |
| `months` | `MonthAsset` | El calendario |
| `era_library` | `WorldAgeAsset` | Eras del mundo |
| `time_scales` | `WorldTimeScaleAsset` | Velocidades de simulación |
| `map_sizes` | `MapSizeAsset` | Tamaños de mapa |
| `map_gen_settings` / `map_gen_templates` | `MapGenSettingsAsset` | Generación de mundos |
| `world_behaviours` | `WorldBehaviourAsset` | Comportamientos de fondo globales |
| `sim_globals_library` | `SimGlobalAsset` | Constantes globales de simulación |

## Objetos y combate

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Armas, armaduras, materiales. **[Objetos personalizados](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Encantamientos. **[Encantamientos de armas](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Categorías de equipo. **[Grupos de objetos y pestañas](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Herramientas laborales que portan unidades |
| `status` | `StatusAsset` | Efectos de estado. **[Efectos de estado](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Hechizos que conjuran las unidades |
| `combat_action_library` | `CombatActionAsset` | Movimientos de combate |
| `rarity_library` | `RarityAsset` | Grados de rareza |

## Herramientas del jugador

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `powers` | `GodPower` | Poderes divinos. **[Poderes divinos](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Pestañas inferiores. **[Pestañas y botones de poderes](#/nml/power-buttons)** |
| `world_laws_library` / `world_law_groups` | `WorldLawAsset` | Leyes del mundo. **[Leyes del mundo](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Tamaños de pincel |
| `hotkey_library` | `HotkeyAsset` | Atajos de teclado |
| `debug_tool_library` | `DebugToolAsset` | Herramientas de depuración |

## Inteligencia Artificial

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | IA de unidades. **[IA y comportamientos personalizados](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | IA de ciudades |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | IA de reinos |
| `citizen_job_library` | `CitizenJobAsset` | Trabajo civil |
| `neural_layers` | `NeuralLayerAsset` | Vista de capas neuronales de depuración |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | Banco de pruebas de IA interno del juego |

## Interfaz de usuario

Solo `window_library` tiene una página aquí. Lo demás funciona, pero tócalo solo si sabes lo que haces :PES5_Hmmmm:.


| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Ventanas. **[Ventanas personalizadas](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | Ventanas de listas (reinos, ciudades, …) |
| `tooltips` | `TooltipAsset` | Diseños de cuadros de información |
| `nameplates_library` | `NameplateAsset` | Placas de nombre sobre unidades |
| `options_library` | `OptionAsset` | Ajustes de configuración del juego |
| `color_style_library` | `ColorStyleAsset` | Estilos de color de la interfaz |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Sprites generados en tiempo de ejecución |
| `quantum_sprites` | `QuantumSpriteAsset` | Variantes de sprites |
| `meta_type_library` | `MetaTypeAsset` | Sistemas meta (cultura, religión, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Opciones del editor de metas |
| `meta_representation_library` | `MetaRepresentationAsset` | Representación gráfica de un meta |
| `meta_text_report_library` | `MetaTextReportAsset` | Informes de texto de metas |
| `architect_mood_library` | `ArchitectMood` | Estados de ánimo en modo arquitecto |

## Estandartes y colores

Una biblioteca para cada ámbito, todas conteniendo los mismos dos tipos de asset:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → todos `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → todos `ColorAsset`

## Nombres, palabras e historia

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Generadores de nombres. **[Generadores de nombres](#/nml/name-generators)** |
| `name_sets` | `NameSetAsset` | Bancos de nombres de los que beben |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | Evolución y formación de nombres |
| `linguistics_library` | `LinguisticsAsset` | Construcción lingüística |
| `words_library` | `WordAsset` | Palabras |
| `sentences_library` | `SentenceAsset` | Frases |
| `story_library` | `StoryAsset` | Historias generadas |
| `world_log_library` | `WorldLogAsset` | Tipos de entradas en el registro del mundo |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Historia registrada |
| `history_groups` | `HistoryGroupAsset` | Categorías históricas |
| `graph_time_library` | `GraphTimeAsset` | Rangos temporales de gráficas |
| `statistics_library` | `StatisticsAsset` | Estadísticas monitorizadas |

## Sonido, idiomas y logros

| Biblioteca | Asset | Qué contiene |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Pistas musicales |
| `game_language_library` | `GameLanguageAsset` | Idiomas disponibles en la interfaz |
| `locale_groups_library` | `LocaleGroupAsset` | Agrupaciones de idiomas |
| `achievements` / `achievement_groups` | `Achievement` | Logros |
| `signals` | `SignalAsset` | El sistema interno de señales |

---

## Cómo encontrar la adecuada

1. **Adivina el sustantivo.** Casi todas las bibliotecas llevan el nombre exacto de lo que almacenan.
2. **Imprime su contenido.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` resuelve qué IDs existen en solo dos líneas.
3. **Lee el método `init()` de la biblioteca.** Cada asset vanilla se construye allí en C# directo: es la mejor documentación real para entender para qué sirve cada campo. Ver **[Leer el código del juego](#/toolbox/reading-the-game-code)**.

> [!TIP] Modificar antes de crear
> Gran parte del modding consiste en hacer `get()` y modificar tres campos en algo que ya existe. Es más breve, sobrevive mejor a las actualizaciones y no requiere ilustraciones nuevas :PES2_Wise:.
