---
title: Достижения
group: Игровой контент
subgroup: Финальные штрихи
icon: :gold_star:
order: 220
---

# Достижения :gold_star:

Да, мод может добавлять собственные достижения (achievement) (ачивки). Они отображаются в окне достижений игры, всплывают точно так же, как настоящие, и сохраняются в файле прогресса игрока. Обязательно прочтите предупреждение внизу страницы перед публикацией.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

Десять огоньков живы одновременно — и достижение разблокируется. Топ-10 достижений всех времён :trollface:.

## Что игра не делает автоматически

- **Ключ локализации.** Метод `post_init()` автоматически формирует `locale_key` из ID для всех оригинальных достижений. У вашего ассета это поле останется `null`, и в окне не будет текста — задайте его вручную.
- **Окно достижений.** Окно достижений считывает `achievements_list` каждой группы, заполненный методом `linkAssets()` при запуске. Добавьте ваше достижение в группу, иначе оно разблокируется, но его никто не увидит.
- **Проверка условий.** Игра не знает, *когда* нужно проверять ваше достижение: в оригинале `check()` вызывается в тех местах кода, где меняются условия. HelloBox использует **[поведение мира](#/nml/world-ages)**, которое проверяет условия каждые 30 секунд (этого более чем достаточно для условия «существует 10 особей»). Для разового события вызывайте `check()` прямо в момент его совершения.

| Поле | Что делает |
| --- | --- |
| `group` | Категория в окне: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | Иконка, полный путь к спрайту |
| `action` | Ваше условие. `check()` разблокирует достижение, если возвращено `true`; вызов `check()` без `action` разблокирует его мгновенно |
| `hidden` | Отображает строку «Скрытое достижение» вместо описания до момента открытия |
| `locale_key` | Ключ названия. Описание берется из `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] Они записываются в реальный прогресс игрока
> Разблокировка запускает оригинальный игровой код: ID записывается в файл прогресса игрока, а игра отправляет запрос в Steam на разблокировку достижения с этим ID. У Steam нет достижения с вашим ID, поэтому на стороне Steam ничего не произойдет, но вызов будет совершен и в логе появится строка `Unlocking in Steam: <id>`. Игра также отправляет ID в аналитику. А пока включен закон «проклятого мира», достижения не разблокируются вовсе, включая ваши.

Ничего из этого не ломает игру. Однако это настоящий файл прогресса игрока — не создавайте десятки пустых ачивок и никогда не разблокируйте то, чего игрок не совершал :PESgn_ReadRules:.
