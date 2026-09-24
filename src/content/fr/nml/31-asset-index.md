---
title: Toutes les bibliothèques d'assets
group: Contenu du jeu
subgroup: Architecture et statistiques
icon: :wbworld:
order: 94
---

# Toutes les bibliothèques d'assets :wbworld:

`AssetManager` est l'annuaire universel de tout ce qui peut exister dans le jeu. Il gère **129 bibliothèques**, et chacune d'elles se compose d'une `List` assortie d'un `Dictionary` que votre mod peut consulter, altérer et étendre.

Cette page en dresse l'inventaire intégral. Vous n'en toucherez jamais la majorité, et moi non plus. Quel mur de tableaux :wbbre:. L'objectif est simple : lorsque vous voulez modifier un pan de WorldBox, la première interrogation est toujours « dans quelle bibliothèque cela se trouve-t-il ? », et la réponse figure ici.

## Prérequis

**[Bibliothèques d'assets](#/nml/asset-libraries)** détaille leur fonctionnement commun : `has`, `get`, `add`, `clone`, modèles, réordonnancement et les quatre règles universelles. Consultez cette page d'abord. La présente page n'est qu'un répertoire.

Le résumé :

```csharp
AssetManager.traits.has("hello_swift");            // est-il enregistré ?
AssetManager.traits.get("hello_swift");            // le récupérer (null si absent)
AssetManager.traits.add(myTrait);                  // en enregistrer un nouveau
AssetManager.traits.clone("hello_new", "brave");   // cloner l'existant ET enregistrer la copie
AssetManager.traits.list;                          // chaque asset, dans l'ordre
AssetManager.traits.dict;                          // chaque asset, par id
```

---

## Créatures et traits

Celles que vous ouvrirez vraiment sont les quatre premières. Les autres sont là pour que vous arrêtiez de deviner les noms :PES2_Shrug:.

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Chaque type de créature. **[Acteurs personnalisés](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Traits d'acteurs. **[Traits personnalisés](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Leurs onglets. **[Groupes de traits et onglets](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Traits de sous-espèces et graphismes. **[Traits de sous-espèces](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Leurs onglets |
| `phenotype_library` | `PhenotypeAsset` | Variantes de peau et de couleur |
| `gene_library` | `GeneAsset` | Gènes |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Types de chromosomes |
| `trait_rains` | `TraitRainAsset` | Événements de "pluie de traits" |
| `personalities` | `PersonalityAsset` | Personnalités des unités |
| `professions` | `ProfessionAsset` | Métiers exercés par les citoyens |
| `base_stats_library` | `BaseStatAsset` | Chaque statistique. **[Référence des statistiques](#/nml/stats)** |

## Sociétés

Tout ce à quoi un groupe d'unités peut appartenir. Les six premières ont leur propre page. Les autres, vous les croiserez quand une de ces pages vous enverra ici.

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Types de factions. **[Royaumes et factions](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Politiques du royaume. **[Traits de royaume](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Cultures. **[Traits culturels](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Religions. **[Traits religieux](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Clans. **[Traits de clan](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Langues. **[Traits de langue](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | Style visuel des bâtiments d'une culture |
| `city_build_orders` | `CityBuildOrderAsset` | Ce qu'une nouvelle cité bâtit, dans l'ordre |
| `war_types_library` | `WarTypeAsset` | Motifs et types de guerres |
| `loyalty_library` | `LoyaltyAsset` | Facteurs de loyauté |
| `opinion_library` | `OpinionAsset` | Facteurs d'opinion |
| `happiness_library` | `HappinessAsset` | Facteurs de bonheur |
| `plots_library` / `plot_category_library` | `PlotAsset` | Complots des unités et méta-systèmes |
| `decisions_library` | `DecisionAsset` | Prises de décision de l'IA |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | Sujets de conversation entre unités |
| `book_types` | `BookTypeAsset` | Genres de livres |
| `knowledge_library` | `KnowledgeAsset` | Fenêtre du savoir |

## Éléments du monde

Si vous pouvez cliquer dessus sur la carte, ça vit ici.

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Chaque bâtiment. **[Bâtiments personnalisés](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Couche de sol. **[Tuiles et terrain](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Couche de surface |
| `tile_tile_effects` | `TileEffectAsset` | Effets par tuile |
| `terraform` | `TerraformOptions` | Règles de nettoyage de terrain |
| `biome_library` | `BiomeAsset` | Biomes |
| `resources` | `ResourceAsset` | Nourriture, matériaux, monnaie. **[Ressources et nourriture](#/nml/resources)** |
| `clouds` | `CloudAsset` | Météo. **[Nuages et météo](#/nml/clouds)** |
| `drops` | `DropAsset` | Objets qui tombent. **[Gouttes et objets tombants](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Catastrophes. **[Catastrophes](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Objets qui volent. **[Projectiles, sorts et effets](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Effets visuels |
| `months` | `MonthAsset` | Le calendrier |
| `era_library` | `WorldAgeAsset` | Âges du monde |
| `time_scales` | `WorldTimeScaleAsset` | Vitesses de jeu |
| `map_sizes` | `MapSizeAsset` | Tailles de carte |
| `map_gen_settings` / `map_gen_templates` | `MapGenSettingsAsset` | Génération de cartes |
| `world_behaviours` | `WorldBehaviourAsset` | Comportements globaux d'arrière-plan |
| `sim_globals_library` | `SimGlobalAsset` | Constantes générales de simulation |

## Équipement et combat

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Armes, armures, matériaux. **[Objets personnalisés](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Enchantements. **[Enchantements d'armes](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Catégories d'équipement. **[Groupes d'objets et onglets](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Outils de travail tenus en main |
| `status` | `StatusAsset` | Effets de statut. **[Effets de statut](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Sorts lancés par les unités |
| `combat_action_library` | `CombatActionAsset` | Mouvements martiaux |
| `rarity_library` | `RarityAsset` | Niveaux de rareté |

## Outils du joueur

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `powers` | `GodPower` | Pouvoirs divins. **[Pouvoirs divins](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Onglets de la barre inférieure. **[Onglets et boutons de pouvoirs](#/nml/power-buttons)** |
| `world_laws_library` / `world_law_groups` | `WorldLawAsset` | Lois du monde. **[Lois du monde](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Tailles de pinceaux |
| `hotkey_library` | `HotkeyAsset` | Raccourcis clavier |
| `debug_tool_library` | `DebugToolAsset` | Outils de débogage |

## Intelligence Artificielle

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | IA des créatures. **[IA et comportements personnalisés](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | IA des cités |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | IA des royaumes |
| `citizen_job_library` | `CitizenJobAsset` | Tâches des citoyens |
| `neural_layers` | `NeuralLayerAsset` | Visualiseur des couches neuronales |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | Banc d'essai d'IA interne du jeu |

## Interface

L'interface du jeu, sous forme d'assets. Pratique à lire, effrayante à modifier :PES_MonkaSweat:.

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Fenêtres. **[Fenêtres personnalisées](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | Fenêtres de listes (royaumes, cités, …) |
| `tooltips` | `TooltipAsset` | Agencements des infobulles |
| `nameplates_library` | `NameplateAsset` | Plaques de nom au-dessus des unités |
| `options_library` | `OptionAsset` | Paramètres du jeu |
| `color_style_library` | `ColorStyleAsset` | Styles de couleur de l'interface |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Sprites créés dynamiquement |
| `quantum_sprites` | `QuantumSpriteAsset` | Variantes de sprites |
| `meta_type_library` | `MetaTypeAsset` | Les méta-systèmes eux-mêmes (culture, religion, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Options de l'éditeur de méta |
| `meta_representation_library` | `MetaRepresentationAsset` | Rendu graphique d'un méta |
| `meta_text_report_library` | `MetaTextReportAsset` | Rapports écrits sur les métas |
| `architect_mood_library` | `ArchitectMood` | Humeurs en mode architecte |

## Bannières et couleurs

Une bibliothèque par thème, contenant toutes les deux mêmes types d'assets :

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → tous `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → tous `ColorAsset`

## Noms, paroles et histoire

La partie de WorldBox qui écrit les histoires. Personne ne la réclame jusqu'au jour où ses créatures doivent porter de vrais noms.

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Générateurs de noms |
| `name_sets` | `NameSetAsset` | Banques de noms sources |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | Formation et dérive des patronymes |
| `linguistics_library` | `LinguisticsAsset` | Structure linguistique |
| `words_library` | `WordAsset` | Mots |
| `sentences_library` | `SentenceAsset` | Phrases |
| `story_library` | `StoryAsset` | Histoires procédurales |
| `world_log_library` | `WorldLogAsset` | Types d'entrées du journal du monde |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Chroniques historiques |
| `history_groups` | `HistoryGroupAsset` | Catégories d'archives |
| `graph_time_library` | `GraphTimeAsset` | Échelles temporelles des graphiques |
| `statistics_library` | `StatisticsAsset` | Statistiques compilées |

## Audio, langues et progression

| Bibliothèque | Asset | Contenu |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Pistes musicales |
| `game_language_library` | `GameLanguageAsset` | Langues de l'interface du jeu |
| `locale_groups_library` | `LocaleGroupAsset` | Groupements linguistiques |
| `achievements` / `achievement_groups` | `Achievement` | Succès |
| `signals` | `SignalAsset` | Système interne de signaux |

---

## Trouver la bonne bibliothèque

1. **Devinez le nom commun.** Presque chaque bibliothèque porte le nom exact de ce qu'elle contient.
2. **Affichez son contenu.** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` liste tous les IDs en deux lignes.
3. **Lisez le `init()` de la bibliothèque.** Chaque asset vanilla y est instancié en C# pur : c'est la documentation la plus limpide sur l'utilité exacte d'un champ. Voir **[Lire le code du jeu](#/toolbox/reading-the-game-code)**.

> [!TIP] Modifier avant d'ajouter
> Une part considérable du modding se résume à un `get()` suivi de la modification de trois champs sur un asset déjà présent. C'est plus court, bien plus résistant aux mises à jour du jeu et ne demande aucun dessin supplémentaire :PES2_Wise:.
