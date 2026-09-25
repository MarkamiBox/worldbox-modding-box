---
title: ИИ королевства
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbdiplomacyhandshake:
order: 180
---

# ИИ королевства :wbdiplomacyhandshake:

ИИ существ работает на отдельных юнитах: поиск пищи, путь к дереву или бой. ИИ королевства управляет всей цивилизацией. Именно он решает, когда объявлять войны, расширять границы, основывать колонии, заключать союзы или отправлять армии в походы.

Как и ИИ юнитов, он строится на работах (jobs) и задачах (tasks), но каждый шаг принимает `Kingdom`, а не `Actor`.

## Работы против задач

Логика королевства разделена на две библиотеки ассетов:

| Понятие | Класс | Библиотека | Назначение |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | Именованный набор задач, выполняемых королевством |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | Конкретная стратегическая цель с набором действий |
| **Kingdom behaviour** | `BehaviourActionKingdom` | внутри задачи | Отдельное действие, оцениваемое каждый тик |

Ванильные цивилизации используют работу `"civ"` (`AssetManager.job_kingdom.get("civ")`). Каждый ход королевство последовательно оценивает задачи своей работы.

## Написание поведения королевства

Поведение королевства наследуется от `BehaviourActionKingdom` и переопределяет `execute(Kingdom pKingdom)`:

```csharp
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloKingdomTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.hasEnemies()) return BehResult.Stop;

            if (pKingdom.data.gold > 500)
            {
                pKingdom.data.gold -= 50;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }
}
```

### Коды возврата

| Результат | Что делает ИИ королевства |
| --- | --- |
| `BehResult.Continue` | Переходит к следующему действию в задаче |
| `BehResult.Stop` | Завершает выполнение задачи на текущем тике |
| `BehResult.RepeatStep` | Повторяет действие на следующем тике |
| `BehResult.Skip` | Пропускает следующее действие и идёт дальше |

## Код

Этот файл создает задачу королевства и добавляет её в ванильную работу `"civ"`:

```csharp Mods/HelloBox/Code/HelloKingdomAI.cs
using System;
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloCheckTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.capital == null || pKingdom.king == null) return BehResult.Stop;

            // Example directive: if the kingdom has plenty of gold, donate to treasury
            if (pKingdom.data.gold > 300)
            {
                pKingdom.data.gold += 10;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }

    public static class HelloKingdomAI
    {
        public const string TASK_ID = "hello_kingdom_tribute";

        public static void Initialize()
        {
            if (AssetManager.tasks_kingdom.has(TASK_ID)) return;

            // 1. Define the task
            BehaviourTaskKingdom task = new BehaviourTaskKingdom
            {
                id = TASK_ID
            };

            // 2. Add steps
            task.addBeh(new BehHelloCheckTribute());

            AssetManager.tasks_kingdom.add(task);

            // 3. Inject into the civ kingdom job
            KingdomJob civJob = AssetManager.job_kingdom.get("civ");
            if (civJob != null && !civJob.tasks.Contains(TASK_ID))
            {
                civJob.tasks.Add(TASK_ID);
            }
        }
    }
}
```

## Создание собственной работы королевства

При создании новой расы или фракции монстров в `AssetManager.kingdoms` вы можете задать ей уникальную работу:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Затем укажите `job_id = "hello_faction_job"` в вашем `KingdomAsset` в **[Королевствах](#/nml/kingdoms)** :PESgn_Noice:.

## Подводные камни

- **Всегда проверяйте `isRekt()`**: Королевство может пасть в любой момент симуляции. Никогда не обращайтесь к его данным без `pKingdom != null && !pKingdom.isRekt()`.
- **Проверяйте столицу и короля**: Многие операции ожидают `capital` и `king`. Если они уничтожены, прямой вызов приведет к `NullReferenceException`.
- **Не перегружайте тики**: Если юнит оценивается локально, то королевство охватывает весь континент. Тяжелые циклы по всем юнитам мира внутри поведения вызовут заметные просадки FPS :aPES2_Sweat:.
