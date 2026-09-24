---
title: Заговоры
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbrebellion:
order: 180
---

# Заговоры :wbrebellion:

**Заговор** (plot) — это замысел, который правитель начинает, финансирует и развивает в течение некоторого времени: восстание, объявление войны, заключение союза. Когда шкала прогресса заполняется, запускается ваш код. Всё между «кто-то мог бы» и «кто-то сделал» берет на себя механика игры — и именно поэтому её выгодно использовать: игрок видит ваш заговор в общем списке интриг с автором, шкалой прогресса и знаменем совершенно бесплатно.

## Добавление заговора

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

Лидер с десятью монетами, городом и свободным временем теперь может организовать фестиваль углей. По его завершении настроение всех жителей города улучшится благодаря событию счастья из **[Королевства и фракции](#/nml/kingdoms)**, а на организатора посыплются угли — ведь это всё еще HelloBox.

> [!WARNING] `check_is_possible` обязателен
> `PlotAsset.checkIsPossible()` вызывается без проверки на null каждый раз, когда правитель рассматривает ваш заговор. Если вы его не укажете, первый же правитель, обративший внимание на заговор, вызовет `NullReferenceException`. Если условий нет, просто верните `true`. Да, даже тогда.

> [!WARNING] Базовый список формируется при запуске
> Правители выбирают заговоры исключительно из `plots_library.basic_plots` (плюс обряды своей религии). Метод `linkAssets()` наполняет этот список всеми заговорами с флагом `is_basic_plot` один раз при старте игры, еще до загрузки вашего мода. Одного флага недостаточно: добавьте заговор в список вручную.

## Поля заговора

### Кто может начать

| Поле | Что делает |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | Разрешенные роли. Если ничего не задано, заговор никто не сможет начать |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Пороговые требования к автору |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Требования к характеристикам. По умолчанию 2 |
| `money_cost` | Стоимость запуска в золоте (бесплатно при принудительном запуске игроком) |
| `requires_diplomacy` / `requires_rebellion` | Доступно только при включенном соответствующем мировом законе |
| `check_is_possible` | Ваше условие старта. Обязательно |

### Как протекает заговор

| Поле | Что делает |
| --- | --- |
| `progress_needed` | Необходимый объем работы для срабатывания |
| `check_should_continue` | Проверяется в процессе. `false` отменяет заговор |
| `action` | Выполняется при полном заполнении шкалы. Возвращает `true` при успехе |
| `post_action` | Выполняется после успешного завершения `action` |
| `try_to_start_advanced` | Заменяет стандартный старт для заговоров с целью: оригинальное восстание задает здесь `target_kingdom` |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Проверяет, жива ли цель заговора |

### Внешний вид и категория

| Поле | Что делает |
| --- | --- |
| `path_icon` | Иконка в списке заговоров и на знамени |
| `group_id` | Категория: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | Вес при случайном выборе среди других заговоров |
| `is_basic_plot` | Доступен любому лидеру. Иначе происходит только как религиозный обряд, см. **[Черты религий](#/nml/religion-traits)** |

## Тексты локализации

Для заговора требуется три ключа локализации: название, описание текущего процесса и общее описание. В строке текущего процесса переменные `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` и `$target_kingdom$` подставляются автоматически.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Тестирование принудительным запуском
> Ожидание, пока правитель сам решит начать ваш заговор, может занять немало времени. Выберите персонажа и запустите заговор вручную через вкладку заговоров в его окне: персонаж по-прежнему должен иметь подходящую роль, а `check_can_be_forced` (опционально) определяет доступность кнопки, но принудительный заговор не требует золота. Это самый быстрый способ проверить работу вашего `action` :PES2_EvilPlan:.
