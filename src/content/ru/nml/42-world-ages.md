---
title: Эпохи мира и поведение мира
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbsunblessed:
order: 174
---

# Эпохи мира и поведение мира :wbsunblessed:

Две вещи принадлежат самому миру, а не живущим в нем существам. **Эпоха мира** (world age) — это эра на колесе эпох: Эпоха Надежды, Эпоха Пепла, со своей погодой, освещением и правилами. **Поведение мира** (world behaviour) — это фрагмент кода, который мир выполняет по таймеру: именно так игра планирует катастрофы (disaster), появление мигрантов и разрушение дорог.

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## Эпохи мира

Эпоха Углей каждые восемь секунд вызывает дождь из углей, затемняет экран пеплом, ускоряет распространение огня вдвое и делает города чуть более лояльными. Новый мир может разместить ее в слоте 4 своего колеса, а случайный выбор колеса может поставить ее в любую позицию. Скромность никогда не была целью HelloBox :wbfireskull:.

> [!WARNING] Три вещи, которые библиотека (library) сделала при запуске
> `post_init()` задает фон каждой эпохи по ее ID, а `linkAssets()` собирает `list_only_normal` (пул для случайной неизвестной эпохи) и `pool_by_slots` (пулы, из которых новый мир заполняет колесо). Новой эпохи нет ни в одном из них. Если пропустить фон, на колесе появится пустой фрагмент; если пропустить пулы, эпоха будет существовать, но ни один мир ее никогда не выберет.

> [!NOTE] Список доступных эпох для выбора
> Окно выбора эпох создает по одной кнопке на эпоху при открытии, и игра предзагружает это окно. Я не проверял, инициализируется ли оно до или после модов, поэтому появится ли там кнопка вашей эпохи — проверяйте в игре. Колесо, случайные пулы и спецэффекты от этого не зависят.

| Поле | Что делает |
| --- | --- |
| `rate` | Вес при случайном выборе эпохи |
| `default_slots` | В какие слоты колеса (1–8) новый мир может ее поместить |
| `clouds` + `cloud_interval` | Создаваемые облака (cloud) и интервал их появления |
| `special_effect_action` + `special_effect_interval` | Ваш периодический код, пока активна эпоха |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | Визуальные эффекты: тьма, дождь, снег, пепел, солнце |
| `title_color`, `light_color` | Цвет названия и цвет окружающего света |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | Бонусы к политике и росту растительности |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | Изменяемые правила мира |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | Переключатели для других систем (урожай растет только при `flag_crops_grow` = true) |

Ключи локализации — `<id>_title` и `<id>_description`.

## Поведение мира

Поведение мира — это два числа и делегат: запускать `action` каждые `interval` секунд плюс до `interval_random` секунд случайной вариации. Оно ставится на паузу вместе с игрой, если не указано `stop_when_world_on_pause = false`, а `action_world_clear` выполняется при загрузке нового мира.

> [!WARNING] Менеджер создается при запуске игры
> Мир хранит один таймер `WorldBehaviour` на каждый ассет, созданный методом `createManagers()` при первой загрузке карты, еще до вашего мода. У вашего ассета `manager == null`, и цикл обновления мира всё равно вызывает его: `NullReferenceException` каждый кадр :wbfacepalm:. Одна строка сразу после `add()` исправляет это.

Поведение в HelloBox ничего не делает, пока выключен соответствующий мировой закон. Это рекомендуемый шаблон: проверка условий очень быстрая, поэтому пусть таймер тикает, а решение принимается внутри action.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

Для кода, который должен выполняться по собственному расписанию вне мира (например, интерфейс), метод `Update()` NML в главном классе мода остается более простым выбором: см. **[Готовый мод](#/nml/all-together)** :PES_OkHand:.
