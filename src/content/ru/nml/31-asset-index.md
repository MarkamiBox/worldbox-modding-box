---
title: Все библиотеки ассетов
group: Игровой контент
subgroup: Архитектура и характеристики
icon: :wbworld:
order: 94
---

# Все библиотеки ассетов :wbworld:

Класс `AssetManager` — это главный каталог всего, что вообще может существовать в игре. Он содержит **129 библиотек (library)**, и каждая из них представляет собой `List` вместе с `Dictionary`, которые вы можете читать, модифицировать и дополнять из своего мода.

Эта страница — их полный реестр. К большинству из них вы никогда даже не прикоснетесь. Смысл в том, что когда вам нужно что-то изменить в WorldBox, первый вопрос всегда звучит так: «в какой библиотеке это лежит?», и ответ находится на этой странице.

## Перед этой страницей

Руководство **[Библиотеки ассетов](#/nml/asset-libraries)** объясняет общие принципы работы (job) с любой из них: `has`, `get`, `add`, `clone`, шаблоны, изменение порядка и четыре правила, действующие для всех 129 хранилищ. Обязательно прочтите его сначала. Данная страница — лишь справочный указатель.

Краткая выжимка:

```csharp
AssetManager.traits.has("hello_swift");            // зарегистрирован ли?
AssetManager.traits.get("hello_swift");            // получить объект (null, если отсутствует)
AssetManager.traits.add(myTrait);                  // зарегистрировать новый
AssetManager.traits.clone("hello_new", "strong");   // скопировать существующий И сразу зарегистрировать копию
AssetManager.traits.list;                          // каждый ассет по порядку
AssetManager.traits.dict;                          // каждый ассет по id
```

---

## Существа и их черты

На практике вам понадобятся только первые четыре. Остальные здесь, чтобы вы не гадали над именами :PES2_Shrug:.


| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | Все виды существ. **[Кастомные существа](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | Черты (trait) существ. **[Кастомные черты](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | Их вкладки. **[Группы черт и вкладки](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | Черты подвидов (subspecies) и их спрайты. **[Черты подвидов](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | Их вкладки |
| `phenotype_library` | `PhenotypeAsset` | Цветовые варианты кожи и шерсти |
| `gene_library` | `GeneAsset` | Гены |
| `chromosome_type_library` | `ChromosomeTypeAsset` | Разновидности хромосом |
| `trait_rains` | `TraitRainAsset` | События «дождя из черт» |
| `personalities` | `PersonalityAsset` | Личности существ |
| `professions` | `ProfessionAsset` | Профессии горожан |
| `base_stats_library` | `BaseStatAsset` | Все базовые статы. **[Справочник характеристик](#/nml/stats)** |

## Общество

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | Типы фракций. **[Королевства и фракции](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | Политики государств. **[Черты королевства](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | Культуры (culture). **[Черты культуры](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | Религии (religion). **[Черты религии](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | Кланы (clan). **[Черты клана](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | Языки. **[Черты языка](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | Внешний вид зданий (building) культур |
| `city_build_orders` | `CityBuildOrderAsset` | Очередь построек нового города |
| `war_types_library` | `WarTypeAsset` | Разновидности войн. **[Типы войн](#/nml/war-types)** |
| `loyalty_library` | `LoyaltyAsset` | Источники лояльности |
| `opinion_library` | `OpinionAsset` | Источники дипломатического мнения |
| `happiness_library` | `HappinessAsset` | Источники счастья |
| `plots_library` | `PlotAsset` | Заговоры, которые начинают и оплачивают правители. **[Заговоры](#/nml/plots)** |
| `plot_category_library` | `PlotCategoryAsset` | Разделы окна заговоров. **[Заговоры](#/nml/plots)** |
| `decisions_library` | `DecisionAsset` | Решения (decision) ИИ |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | Темы разговоров между существами |
| `book_types` | `BookTypeAsset` | Разновидности книг. **[Книги](#/nml/books)** |
| `knowledge_library` | `KnowledgeAsset` | Окно знаний |

## Объекты мира

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | Все постройки. **[Кастомные постройки](#/nml/custom-buildings)** |
| `tiles` | `TileType` | Слой грунта. **[Плитки и ландшафт](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | Поверхностный слой |
| `tile_tile_effects` | `TileEffectAsset` | Эффекты отдельных плиток |
| `terraform` | `TerraformOptions` | Наборы правил очистки ландшафта |
| `biome_library` | `BiomeAsset` | Биомы. **[Биомы](#/nml/biomes)** |
| `resources` | `ResourceAsset` | Пища, материалы, валюта. **[Ресурсы и еда](#/nml/resources)** |
| `clouds` | `CloudAsset` | Погода. **[Облака и погода](#/nml/clouds)** |
| `drops` | `DropAsset` | Падающие объекты. **[Капли и падающие объекты](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | Стихийные бедствия. **[Бедствия](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | Летящие объекты. **[Снаряды, заклинания и эффекты](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | Визуальные эффекты |
| `months` | `MonthAsset` | Календарь |
| `era_library` | `WorldAgeAsset` | Эпохи (world age) мира |
| `time_scales` | `WorldTimeScaleAsset` | Скорости игры. Кнопка "быстрее" обходит `list` по порядку и, вне отладочного режима, никогда не доходит до последней записи (ванильной `x40`). Скорость, добавленная в конец, станет этой недостижимой: вставляйте её через `Insert` перед последней |
| `map_sizes` | `MapSizeAsset` | Размеры в окне нового мира. **[Генерация карты](#/nml/map-generation)** |
| `map_gen_templates` | `MapGenTemplate` | Формы мира: `continent`, `islands`, `donut`... **[Генерация карты](#/nml/map-generation)** |
| `map_gen_settings` | `MapGenSettingsAsset` | Ползунки и переключатели под шаблоном. **[Генерация карты](#/nml/map-generation)** |
| `world_behaviours` | `WorldBehaviourAsset` | Фоновые глобальные процессы |
| `sim_globals_library` | `SimGlobalAsset` | Глобальные константы симуляции |

## Предметы и боевая система

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `items` | `EquipmentAsset` | Оружие, броня, материалы. **[Кастомные предметы](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | Чары. **[Чары для оружия](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | Категории снаряжения. **[Группы предметов и вкладки](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | Рабочие инструменты в руках существ |
| `status` | `StatusAsset` | Статусные (status) эффекты. **[Статусные эффекты](#/nml/status-effects)** |
| `spells` | `SpellAsset` | Заклинания (spell), творимые существами |
| `combat_action_library` | `CombatActionAsset` | Боевые приемы |
| `rarity_library` | `RarityAsset` | Степени редкости |

## Инструменты игрока

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `powers` | `GodPower` | Божественные силы (GodPower). **[Божественные силы](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | Вкладки нижней панели. **[Вкладки и кнопки сил](#/nml/power-buttons)** |
| `world_laws_library` | `WorldLawAsset` | Законы мира (world law). **[Законы мира](#/nml/world-laws)** |
| `world_law_groups` | `WorldLawGroupAsset` | Вкладки окна законов мира. **[Законы мира](#/nml/world-laws)** |
| `brush_library` | `BrushData` | Размеры кистей |
| `hotkey_library` | `HotkeyAsset` | Горячие клавиши |
| `debug_tool_library` | `DebugToolAsset` | Инструменты отладки |

## Искусственный интеллект

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | ИИ существ. **[Кастомный ИИ и поведение](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | ИИ городов |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | ИИ государств |
| `citizen_job_library` | `CitizenJobAsset` | Рутинный труд граждан |
| `neural_layers` | `NeuralLayerAsset` | Отладочный просмотр нейронных слоев |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | Встроенная тестовая среда ИИ |

## Интерфейс

У `window_library` и `options_library` есть свои страницы. Остальное работает, но трогайте это, только если точно уверены :PES5_Hmmmm:.


| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `window_library` | `WindowAsset` | Окна. **[Кастомные окна](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | Окна списков (государства, города, …) |
| `tooltips` | `TooltipAsset` | Разметка всплывающих подсказок |
| `nameplates_library` | `NameplateAsset` | Именные баннеры, которые режимы карты рисуют над королевствами, городами, кланами... По одному на `MetaType`: его `add()` бросает исключение для режима карты, у которого уже есть баннер, так что редактируйте ванильную табличку через `get()` |
| `options_library` | `OptionAsset` | Собственное окно настроек игры. **[Настройки игры](#/nml/game-options)** |
| `color_style_library` | `ColorStyleAsset` | Цветовые схемы интерфейса |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | Спрайты, генерируемые в реальном времени |
| `quantum_sprites` | `QuantumSpriteAsset` | Разновидности спрайтов |
| `meta_type_library` | `MetaTypeAsset` | Сами мета-системы (культура, религия, …) |
| `meta_customization_library` | `MetaCustomizationAsset` | Опции редактора мета-систем |
| `meta_representation_library` | `MetaRepresentationAsset` | Отрисовка мета-систем |
| `meta_text_report_library` | `MetaTextReportAsset` | Текстовые отчеты по мета-системам |
| `architect_mood_library` | `ArchitectMood` | Настроения в режиме архитектора |

## Знамена и цвета

По отдельной библиотеке на каждую сферу, причем все они хранят одинаковые два типа ассетов:

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → все `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → все `ColorAsset`

## Имена, язык и история

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | Генераторы имен. **[Генераторы имён](#/nml/name-generators)** |
| `name_sets` | `NameSetAsset` | Наборы имен, из которых они черпают слова |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | Формирование и эволюция имен |
| `linguistics_library` | `LinguisticsAsset` | Языковые структуры |
| `words_library` | `WordAsset` | Слова |
| `sentences_library` | `SentenceAsset` | Предложения |
| `story_library` | `StoryAsset` | Генерируемые летописи |
| `world_log_library` | `WorldLogAsset` | Типы записей в журнале мира |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | Зафиксированная хронология |
| `history_groups` | `HistoryGroupAsset` | Исторические категории |
| `graph_time_library` | `GraphTimeAsset` | Временные интервалы графиков |
| `statistics_library` | `StatisticsAsset` | Учитываемые статистические показатели |

## Звук, язык и достижения

| Библиотека | Ассет | Что содержит |
| --- | --- | --- |
| `music_box` | `MusicAsset` | Музыкальные треки |
| `game_language_library` | `GameLanguageAsset` | Языки интерфейса игры |
| `locale_groups_library` | `LocaleGroupAsset` | Группы локалей |
| `achievements` / `achievement_groups` | `Achievement` | Достижения (achievement) |
| `signals` | `SignalAsset` | Внутренняя система сигналов |

---

## Как найти нужную библиотеку

1. **Угадайте существительное.** Почти каждая библиотека названа в точности по тому, что она хранит.
2. **Выведите ее содержимое в лог.** Строка `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` даст исчерпывающий ответ на вопрос «какие id существуют».
3. **Загляните в метод `init()` библиотеки.** Каждый ванильный ассет создается там на чистом C# — это лучшая существующая документация того, для чего в действительности предназначено каждое поле. См. **[Чтение кода игры](#/toolbox/reading-the-game-code)**.

> [!TIP] Сначала меняйте существующее, а не создавайте с нуля
> Удивительно большая часть моддинга сводится к вызову `get()` с последующим изменением пары полей у уже существующего объекта. Это компактнее, гораздо лучше переживает патчи игры и не требует рисования новых спрайтов :PES2_Wise:.
