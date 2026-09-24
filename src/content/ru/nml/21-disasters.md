---
title: Катастрофы
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbmeteorite:
order: 184
---

# Катастрофы :wbmeteorite:

Бедствие — это событие, которое мир устраивает сам себе: торнадо, волна жары, метеорит. Игра периодически разыгрывает их появление с течением времени, поэтому, в отличие от сил бога, **игроку не нужно никуда кликать**. Вы задаете условия, а мир делает всё остальное.

## Добавление бедствия

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

Зарегистрируйте его в `Main.cs` (см. **[Готовый мод](#/nml/all-together)**), загрузите мир хотя бы с одним городом и сотней жителей и подождите. Рано или поздно с неба сами собой начнут падать тлеющие угли :wbfireskull:.

### Поля

`rate` и `chance` - те два поля, которые вы будете крутить чаще всего. Предупреждение внизу страницы объясняет почему.

| Поле | Что делает |
| --- | --- |
| `rate` | Вес в жеребьёвке. Чем выше, тем чаще выбирается по сравнению с остальными |
| `chance` | Второй бросок после того, как его выбрали |
| `min_world_population` / `min_world_cities` | Условия, без которых оно вообще не может случиться |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | Id ассета `WorldLogAsset`: строка в журнале мира. **Не** ключ локализации, см. ниже |
| `action` | Ваш код. Это и есть бедствие |
| `spawn_asset_unit` + `units_min`/`units_max` | Сокращение для «заспавнить N этих существ» |
| `max_existing_units` | Не спавнить больше, если столько уже есть |
| `ages_allow` / `ages_forbid` | Ограничивает его эпохами (world age) мира, например только Эпохой Пепла |

Ограничение по эпохе задаётся после создания ассета:

```csharp
emberStorm.ages_allow.Add("age_ash");
emberStorm.ages_allow.Add("age_chaos");
```

## Спавн существ без кода

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

"Без кода" — почти правда. Бедствию **всегда** требуется `action`, потому что игровой генератор вызывает его без проверки на null: оставьте поле пустым, и при первом же выпадении вашего бедствия игра упадет с `NullReferenceException`. Все ванильные бедствия с существами ссылаются на стандартный метод `simpleUnitAssetSpawnUsingIslands`, который считывает `spawn_asset_unit`, `units_min`, `units_max` и `max_existing_units`, а также сам делает запись в журнал мира.

## Запись в журнале мира

`world_log` — это не текст сообщения. Это **ID ассета `WorldLogAsset`** в `AssetManager.world_log_library`, и уже этот ассет ссылается на ключ локализации. Если указать несуществующий ID, в момент срабатывания бедствия метод `WorldLog.logDisaster()` попытается собрать сообщение вокруг `null` и выбросит `NullReferenceException` :wbfacepalm:.

Ванильные бедствия клонируют базовый шаблон `$basic_disaster$`, в котором уже настроен цвет предупреждения и категория "disasters". В `HelloDisasters` выше делается то же самое:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Затем эту запись нужно залогировать. Стандартные спавнеры сами вызывают `WorldLog.logDisaster(pAsset, tile)`. Кастомный `action` этого не делает, поэтому в коде мы вызываем его вручную, передавая тайл начала бури — именно к нему будет перемещать камера по клику на запись в журнале.

| Поле `WorldLogAsset` | Что делает |
| --- | --- |
| `locale_id` | Ключ текста. Если пустой, используется сам ID |
| `path_icon` | Иконка в начале строки журнала |
| `color` | Цвет строки. В шаблоне используется цвет предупреждения |
| `group` | В какую категорию/вкладку журнала попадает сообщение |
| `random_ids` | Случайный выбор одного из нескольких текстов: `<locale_id>_1`, `_2`... |

Примеру с волками нужны те же две вещи: собственный клонированный лог-ассет `disaster_hello_wolf_year` и ключ текста `worldlog_disaster_hello_wolf_year`. Стандартный спавнер запишет строчку сам.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Пишите текст как новостной заголовок, а не как сухое описание. «С неба падают угли» лучше, чем «началось событие, связанное с углями». Именно эту фразу игрок увидит в журнале событий мира.

> [!WARNING] Для тестов выкручивайте шансы на максимум
> `rate = 4, chance = 0.5f` означает, что вы можете прождать двадцать минут, пока бедствие соизволит произойти. Во время разработки задирайте `rate` повыше и сбрасывайте минимумы на ноль, а перед публикацией верните баланс на место :PES2_EvilPlan:.
