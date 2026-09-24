---
title: Todas as bibliotecas de assets
group: Conteúdo do jogo
subgroup: Arquitetura e atributos
icon: :wbworld:
order: 94
---

# Todas as bibliotecas de assets :wbworld:

O `AssetManager` é o catálogo geral de tudo o que pode existir no jogo. Ele abriga **129 bibliotecas**, e cada uma delas é uma `List` combinada com um `Dictionary` que você pode ler, editar e expandir a partir do seu mod.

Esta página é o índice completo. Você nunca encostará na maior parte delas, e eu também não. Que muralha de tabelas :wbbre:. A razão de ser desta página é que, quando você quiser mudar algo no WorldBox, a primeira pergunta será sempre "em qual biblioteca isso fica?", e a resposta está aqui.

## Antes desta página

**[Bibliotecas de assets](#/nml/asset-libraries)** ensina como qualquer uma delas é utilizada: `has`, `get`, `add`, `clone`, modelos, reordenação e as quatro regras de ouro válidas para todas as 129. Leia aquela página primeiro. Esta aqui é apenas o catálogo.

A versão resumida:

```csharp
AssetManager.traits.has("hello_swift");            // está registrado?
AssetManager.traits.get("hello_swift");            // busca o objeto (null se não existir)
AssetManager.traits.add(myTrait);                  // registra um novo
AssetManager.traits.clone("hello_new", "brave");   // copia um existente E registra a cópia
AssetManager.traits.list;                          // cada asset, em ordem
AssetManager.traits.dict;                          // cada asset, por id
```

---

## Criaturas e seus traços

As que você vai abrir de verdade são as quatro primeiras. O resto está aqui para você parar de chutar nomes :PES2_Shrug:.

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Cada tipo de criatura. **[Atores personalizados](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Traços de criaturas. **[Traços personalizados](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Suas abas. **[Grupos de traços e abas](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Traços de subespécies e suas artes. **[Traços de subespécies](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Suas abas |
| `phenotype_library` | `PhenotypeAsset` | Variantes de pele e cor |
| `gene_library` | `GeneAsset` | Genes |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Tipos de cromossomos |
| `trait_rains` | `TraitRainAsset` | Eventos de "chuva de traços" |
| `personalities` | `PersonalityAsset` | Personalidades das unidades |
| `professions` | `ProfessionAsset` | Profissões dos cidadãos |
| `base_stats_library` | `BaseStatAsset` | Todos os atributos. **[Referência de atributos](#/nml/stats)** |

## Sociedades

Tudo a que um grupo de unidades pode pertencer. As seis primeiras têm página própria. O resto você encontra quando uma dessas páginas manda você para cá.

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Tipos de facção. **[Reinos e facções](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Políticas do reino. **[Traços de reino](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Culturas. **[Traços culturais](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Religiões. **[Traços religiosos](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Clãs. **[Traços de clã](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Idiomas. **[Traços de idioma](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | Visual das construções de cada cultura |
| `city_build_orders` | `CityBuildOrderAsset` | O que uma nova cidade constrói e em que ordem |
| `war_types_library` | `WarTypeAsset` | Tipos de guerra |
| `loyalty_library` | `LoyaltyAsset` | Fontes de lealdade |
| `opinion_library` | `OpinionAsset` | Fontes de opinião |
| `happiness_library` | `HappinessAsset` | Fontes de felicidade |
| `plots_library` / `plot_category_library` | `PlotAsset` | Conspirações tramadas por unidades e sistemas |
| `decisions_library` | `DecisionAsset` | Tomadas de decisão da IA |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | Temas de conversa entre unidades |
| `book_types` | `BookTypeAsset` | Tipos de livros |
| `knowledge_library` | `KnowledgeAsset` | A janela de conhecimento |

## Elementos no mundo

Se dá para clicar no mapa, mora aqui.

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Cada construção. **[Construções personalizadas](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Camada de chão. **[Ladrilhos e terreno](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Camada de topo de superfície |
| `tile_tile_effects` | `TileEffectAsset` | Efeitos por ladrilho |
| `terraform` | `TerraformOptions` | Regras de limpeza de terreno |
| `biome_library` | `BiomeAsset` | Biomas |
| `resources` | `ResourceAsset` | Comida, materiais, moeda. **[Recursos e comida](#/nml/resources)** |
| `clouds` | `CloudAsset` | Clima. **[Nuvens e clima](#/nml/clouds)** |
| `drops` | `DropAsset` | Coisas que caem. **[Gotas e coisas caindo](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Desastres. **[Desastres](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Objetos que voam. **[Projéteis, feitiços e efeitos](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Efeitos visuais |
| `months` | `MonthAsset` | O calendário |
| `era_library` | `WorldAgeAsset` | Eras do mundo |
| `time_scales` | `WorldTimeScaleAsset` | Velocidades de simulação |
| `map_sizes` | `MapSizeAsset` | Tamanhos de mapa |
| `map_gen_settings` / `map_gen_templates` | `MapGenSettingsAsset` | Geração de mundos |
| `world_behaviours` | `WorldBehaviourAsset` | Comportamentos globais de fundo |
| `sim_globals_library` | `SimGlobalAsset` | Constantes globais da simulação |

## Itens e combate

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Armas, armaduras, materiais. **[Itens personalizados](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Encantamentos. **[Encantamentos de armas](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Categorias de equipamento. **[Grupos de itens e abas](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Ferramentas empunhadas para trabalho |
| `status` | `StatusAsset` | Efeitos de status. **[Efeitos de status](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Feitiços conjurados por unidades |
| `combat_action_library` | `CombatActionAsset` | Golpes de combate |
| `rarity_library` | `RarityAsset` | Graus de raridade |

## Ferramentas do jogador

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `powers` | `GodPower` | Poderes divinos. **[Poderes divinos](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Abas da barra inferior. **[Abas e botões de poderes](#/nml/power-buttons)** |
| `world_laws_library` / `world_law_groups` | `WorldLawAsset` | Leis do mundo. **[Leis do mundo](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Tamanhos de pincel |
| `hotkey_library` | `HotkeyAsset` | Atalhos de teclado |
| `debug_tool_library` | `DebugToolAsset` | Ferramentas de depuração |

## Inteligência Artificial

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | IA de criaturas. **[IA e comportamentos personalizados](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | IA de cidades |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | IA de reinos |
| `citizen_job_library` | `CitizenJobAsset` | Trabalho civil |
| `neural_layers` | `NeuralLayerAsset` | Visualizador de camadas neurais |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | Ambiente interno de testes de IA |

## Interface

A interface do próprio jogo, como assets. Útil de ler, assustadora de editar :PES_MonkaSweat:.

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Janelas. **[Janelas personalizadas](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | Janelas de listas (reinos, cidades, …) |
| `tooltips` | `TooltipAsset` | Layouts de dicas de interface |
| `nameplates_library` | `NameplateAsset` | Placas de nome sobre unidades |
| `options_library` | `OptionAsset` | Configurações do jogo |
| `color_style_library` | `ColorStyleAsset` | Estilos de cores da interface |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Sprites gerados em tempo de execução |
| `quantum_sprites` | `QuantumSpriteAsset` | Variações de sprites |
| `meta_type_library` | `MetaTypeAsset` | Os próprios meta-sistemas (cultura, religião, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Opções do editor de metas |
| `meta_representation_library` | `MetaRepresentationAsset` | Renderização visual de um meta |
| `meta_text_report_library` | `MetaTextReportAsset` | Relatórios de texto dos metas |
| `architect_mood_library` | `ArchitectMood` | Modos do arquiteto |

## Estandartes e cores

Uma biblioteca para cada finalidade, todas utilizando os dois mesmos tipos de asset:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → todos `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → todos `ColorAsset`

## Nomes, palavras e história

A parte do WorldBox que escreve as histórias. Ninguém liga para ela até querer que suas criaturas tenham nomes decentes.

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Geradores de nomes |
| `name_sets` | `NameSetAsset` | Bancos de nomes dos quais se alimentam |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | Evolução onomástica |
| `linguistics_library` | `LinguisticsAsset` | Construção linguística |
| `words_library` | `WordAsset` | Palavras |
| `sentences_library` | `SentenceAsset` | Frases |
| `story_library` | `StoryAsset` | Crônicas geradas |
| `world_log_library` | `WorldLogAsset` | Tipos de registro do mundo |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Histórico registrado |
| `history_groups` | `HistoryGroupAsset` | Categorias históricas |
| `graph_time_library` | `GraphTimeAsset` | Intervalos de tempo dos gráficos |
| `statistics_library` | `StatisticsAsset` | Estatísticas registradas |

## Som, idiomas e conquistas

| Biblioteca | Asset | O que contém |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Faixas musicais |
| `game_language_library` | `GameLanguageAsset` | Idiomas da interface |
| `locale_groups_library` | `LocaleGroupAsset` | Agrupamentos de localização |
| `achievements` / `achievement_groups` | `Achievement` | Conquistas |
| `signals` | `SignalAsset` | Sistema interno de sinais |

---

## Como encontrar a biblioteca certa

1. **Adivinhe o substantivo.** Praticamente todas as bibliotecas levam exatamente o nome do que guardam.
2. **Imprima o que tem dentro.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` responde quais IDs existem em duas linhas.
3. **Leia o método `init()` da biblioteca.** Cada asset vanilla é instanciado lá em C# limpo: é o melhor guia real para saber para que serve cada campo. Veja **[Lendo o código do jogo](#/toolbox/reading-the-game-code)**.

> [!TIP] Modifique antes de criar do zero
> Uma quantidade impressionante de modding se resume a um `get()` seguido da alteração de três campos em algo que já existe. É mais rápido, sobrevive muito melhor às atualizações do jogo e não requer novos desenhos :PES2_Wise:.
