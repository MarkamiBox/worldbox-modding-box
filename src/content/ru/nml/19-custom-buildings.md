---
title: Кастомные постройки
group: Игровой контент
subgroup: Актеры, здания и ИИ
icon: :wbcities:
order: 142
---

# Кастомные постройки :wbcities:

Постройки - это то место, где моддинг WorldBox перестает быть простым "измени одно число" и превращается в "у этого ассета сто сорок полей, и большинство из них ничего не делает для моей задачи" :PES2_Weary:.

Поэтому мы не создаем постройки с нуля. Мы клонируем уже работающее здание (building).

## Сначала клонируем, затем настраиваем

`clone(newId, sourceId)` копирует все поля оригинала, переименовывает копию **и регистрирует её**. Последнее важно:

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

Всё, что вы не задали, остаётся точно таким же, как у `temple_human`, а это работающее городское здание. В этом весь фокус.

> [!WARNING] Не вызывайте `add()` после `clone()`
> `clone()` уже зарегистрировал копию. Вызов `AssetManager.buildings.add(shrine)` после этого регистрирует её второй раз, из-за чего библиотека (library) выбрасывает первую копию и пишет в лог `duplicate asset - overwriting...`. Работать всё равно будет, но это шум в логе и первое, на что укажет любой, кто будет проверять ваш код.

## Что брать за основу для клонирования

В библиотеке есть как шаблоны вида `$…$`, так и готовые здания:

| Источник | Назначение |
| --- | --- |
| `$building$` | Голый каркас здания |
| `$city_building$` | Всё, что строит город. Используется для `well` и `mine` |
| `$city_colored_building$` | То же самое, но с окраской в цвет королевства (kingdom) |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Городские здания конкретных рас |
| `$building_creep$` | Биомные (biome) заражения (крип) |
| `$mineral$` | Камни и рудные жилы |
| `$resource$`, `$flora_small$` | Собираемые природные ресурсы (resource) |
| `tree_green_1` | От него клонируются все стандартные деревья |

Готовые постройки, которые стоит клонировать: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Потратить десять минут на поиск ближайшего аналога гораздо полезнее, чем целый вечер разбираться с неработающими полями.

## Поля в зависимости от ваших задач

### Тип постройки

| Поле | Что делает |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | Принадлежит городу: получает цвета королевства, зоны и рабочие места |
| `type` | Текстовый тег, по которому списки игры группируют здания |
| `kingdom`, `civ_kingdom` | Ограничение по конкретной фракции |
| `ignored_by_cities` | Города никогда не строят и не учитывают его |

### Жилье и использование

| Поле | Что делает |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Могут ли в нем жить жители и сколько |
| `housing_happiness` | Бонус к счастью жителей |
| `storage`, `storage_only_food`, `is_stockpile` | Работает ли как склад ресурсов |
| `book_slots` | Вместимость книг в библиотеке |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | Производство лодок |
| `spawn_units`, `spawn_units_asset` | Спавнит существ |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | Функции атакующей башни |

### Строительство и размещение

| Поле | Что делает |
| --- | --- |
| `cost`, `construction_progress_needed` | Стоимость в ресурсах и время постройки |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | Цепочки улучшений, как у домов `house_human_0` - `_5` |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | Где в черте города оно строится |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | Правила размещения и замены |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Лимиты на количество построек |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | Правила проходимости и грунта |
| `build_road_to` | Прокладывает ли город к нему дорогу |

### Природа и рост

| Поле | Что делает |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | Появляется ли само по себе со временем |
| `growth_time`, `has_resources_grown_to_collect` | Циклы созревания плодов и урожая |
| `biome_tags_growth`, `has_biome_tags` | В каких биомах может расти |
| `resources_given`, `addResource(id, amount, pNewList)` | Ресурсы при сборе |
| `can_be_chopped_down`, `gatherable` | Можно ли срубить или собрать |
| `grow_creep` и родственные поля `grow_creep_*` | Логика разрастания заражения |

### Урон и разрушение

| Поле | Что делает |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | Что наносит урон постройке |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | Что остается после уничтожения |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | Как удаляется с карты |
| `loot_generation` | Какой лут выпадает при сносе |

### Внешний вид

| Поле | Что делает |
| --- | --- |
| `sprite_path` + `main_path` | Путь к спрайту |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Используемый атлас спрайтов |
| `scale_base`, `bonus_z`, `random_flip` | Масштаб, порядок отрисовки, отражение |
| `shadow`, `shadow_bound`, `shadow_distortion` | Тень здания |
| `has_kingdom_color` | Окрашивание в цвет королевства-владельца |
| `draw_light_area`, `draw_light_size` | Свечение здания |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | Анимации |

### Поведение

| Поле | Что делает |
| --- | --- |
| `step_action`, `has_step_action` | Собственный код на каждый тик постройки |
| `base_stats` | Характеристики (stats), даваемые зданием |
| `priority` | Приоритет в очереди строительства города |

## Спрайты

Здания загружают графику из `sprite_path`, который используется **ровно так, как написан**. Только если оставить `sprite_path` пустым, игра откатывается на `main_path + id`. Положите графику в `GameResources/buildings/hello_shrine/` и задайте ей точку привязки внизу по центру в `sprites.json`, иначе ваше святилище будет парить над землёй как призрак :aPES_GhostDance:. См. **[Спрайты и ресурсы](#/nml/sprites-and-resources)**.

## Свой собственный спрайт

Выберите одну из двух форм ниже и не смешивайте их. Загрузчик буквально делает так: берёт `sprite_path`, если в нём что-то есть, иначе `main_path + id`.

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

**Имена файлов и есть формат**. Загрузчик делит каждое имя по `_`: часть до - это вид (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special` и `mini` для мини-карты), число после - кадр анимации. `mini_0` должен быть ровно столько пикселей, сколько клеток (tile) занимает здание, 5x4 для всего, что клонировано из `temple_human`; не положите его, и мини-карта при каждой перерисовке будет бросать `NullReferenceException` в `Building.getColorForMinimap()`. `main_0`, `main_1`, `main_2` - это анимация из трёх кадров. Файл с любым другим именем - не кадр, а папка без `main_0` не даёт зданию ничего для отрисовки.

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

Смешаете их, папку в `main_path` и пустой `sprite_path`, и игра будет искать `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Загружайте кадры сами, после того как задали путь
> Игра заполняет `building_sprites` для каждого здания в собственной предзагрузке, которая идёт до вашего мода. У здания, зарегистрированного позже, список кадров пуст, и при первой же установке игра падает в `Building.setAnimData()` с `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Вызовите `shrine.loadBuildingSprites();`, как только задан `sprite_path`.
>
> Его родственник - `atlas_asset`, атлас спрайтов, который перекрашивает здание в цвет владельца. Библиотека связывает его в `checkAtlasLink()`, тоже при запуске. Пропустите это, и здание нормально ставится, а потом бросает `NullReferenceException` в `DynamicSprites.getRecoloredBuilding()` на **каждом кадре, пока оно на экране**.

Задайте ему **точку привязки внизу по центру** в `sprites.json`, иначе ваше святилище будет парить над землёй как призрак (см. **[Спрайты и ресурсы](#/nml/sprites-and-resources)**).

## Размещение на карте

Метод `World.world.buildings.addBuilding(...)` помечен как `internal`, поэтому компилируется только при ссылке на **publicized** библиотеку `Assembly-CSharp.dll` - см. примечание на странице **[Эффекты состояния](#/nml/status-effects)**:

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Всегда предварительно проверяйте `canBuildFrom`. Спавн здания на воде, поверх другого строения или на зарезервированном городом тайле приведет к миру, который выглядит нормально первые тридцать секунд, а через три минуты намертво ломается :PES_OhShit:.


## Как заставить города строить здание

Божественная сила (GodPower), спавнящая святилище — это забавно на один вечер. Святилище, которое города строят сами, когда вырастают до нужного размера — это настоящий мод. Города выбирают, что строить, опираясь на две вещи, и вашего здания пока нет ни в одной из них:

| | Что содержит |
| --- | --- |
| **Приказ на строительство** (`AssetManager.city_build_orders`) | Список ключей заказов вроде `order_temple`, с требованиями к населению и числу построек для каждого |
| **Архитектура** (`AssetManager.architecture_library`) | Какое здание означает ключ заказа для данной расы: `order_temple` означает `temple_human` у людей, и другое здание у орков |

Поэтому вы придумываете ключ заказа, учите каждую архитектуру тому, что он означает, и добавляете его в приказы на строительство:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // Собственный тип, чтобы город считал святилища отдельно, а не как храмы
    shrine.type = "type_hello_shrine";

    // Поиск архитектуры — это простой словарь: неизвестный ключ выдаст ошибку для каждого города
    // этой расы. Добавьте его для всех, даже для тех, кто никогда до него не дорастёт.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // тот же лимит, что у храма: 1 штука, 50 жителей, 15 зданий в городе
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

Вызовите `AddToCities()` в конце `Initialize()`, после клонирования.

В отличие от многих других разделов этого руководства, здесь нет скрытых ловушек инициализации: `CityBehBuild.calcPossibleBuildings()` считывает список строительных заказов каждого города каждый раз, когда оценивает возможность постройки, поэтому заказ, добавленный при загрузке, сразу виден первому же проверяющему городу. Городу по-прежнему нужно оплатить стоимость здания (`cost`) и выполнить все числовые требования заказа; если это невозможно, он молча пропустит ваше святилище :PES5_Hmmmm:.

| Аргумент `addBuilding(...)` | Что делает |
| --- | --- |
| `pID` | Ключ заказа, а не id здания |
| `pLimitType` | Сколько таких зданий может быть в городе. Храм использует `1` |
| `pPop` | Минимальное население |
| `pBuildings` | Минимальное количество уже построенных зданий в городе |
| `pCheckFullVillage` | Только когда все дома заполнены |
| `pCheckHouseLimit` | Для жилья: пропускать, пока жилья хватает, останавливаться на лимите домов |
| `pMinZones` | Минимальный размер города в зонах |

## Тексты

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Изучите оригинал перед клонированием
> Откройте класс `BuildingLibrary` в **dnSpy** и посмотрите, чем отличаются `house_human_0`, `tree_green_1` и `mineral_stone`. Каждое ванильное здание создано там на чистом C#, что делает этот класс лучшей документацией по всем существующим полям :PES_Smart:.
