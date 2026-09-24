---
title: Кастомный ИИ и поведение
group: Игровой контент
subgroup: Актеры, здания и ИИ
icon: :wbgoldenbrain:
order: 144
---

# Кастомный ИИ и поведение :wbgoldenbrain:

Здесь начинается самое сложное. Всё остальное в этом руководстве добавляло в игру *вещи и свойства*. Этот раздел добавляет **решения**: то, что существо будет делать дальше, само по себе, бесконечно, в мире, который оно делит с тысячами других созданий. Никакого давления :PES_MonkaSweat:.

## Как устроено мышление в игре

Три уровня, от общего к частному, плюс тот, что стоит рядом. У меня ушло на это больше времени, чем хочется признавать:

| Уровень | Что это | Библиотека |
| --- | --- | --- |
| **Работа** (`ActorJob`) | Общая деятельность существа: "быть горожанином", "быть солдатом" | `AssetManager.job_actor` |
| **Задача** (`BehaviourTaskActor`) | Конкретная цель внутри работы: "пойти поесть", "построить дом" | `AssetManager.tasks_actor` |
| **Действие** (`BehaviourActionActor`) | Один шаг задачи, выполняемый каждый тик и возвращающий следующий шаг | прикрепляется к задаче |

Работа содержит задачи, задача содержит действия (Behaviours), а действия выполняются по порядку, пока одно из них не скажет остановиться.

## Написание действия (Behaviour)

Действие - это класс с одним-единственным методом. Он принимает актера, выполняет одно небольшое действие и возвращает `BehResult`:

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```
`PickTile` — это и есть весь смысл упражнения: единственная часть, которую игра не делает за вас. Всё остальное в файле — проводка.

> [!WARNING] `beh_tile_target` — internal
> Поле, в которое пишет behaviour, помечено `internal` в сборке игры, так что это компилируется против **publicized** `Assembly-CSharp.dll` (см. заметку в **[Эффекты статуса](#/nml/status-effects)**). Без неё компилятор отвергнет строку, и цель придётся держать в своём поле :PES5_Noted:.


| Результат | Значение |
| --- | --- |
| `BehResult.Continue` | Перейти к следующему действию в этой задаче |
| `BehResult.Stop` | Завершить выполнение на этот тик |
| `BehResult.RepeatStep` | Запустить меня снова в следующем тике |
| `BehResult.Skip` | Пропустить следующее действие |
| `BehResult.StepBack` | Вернуться на шаг назад |
| `BehResult.RestartTask` | Начать задачу сначала |

## Связывание задачи (Task) и работы (Job)

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```

Обратите внимание на второе действие: **переиспользуйте ванильные узлы**. В игре уже есть готовые действия для ходьбы к тайлу, наложения статуса, поиска здания или атаки цели. Написать логику решения и позаимствовать реализацию шагов - это разница между одними выходными и целым месяцем работы.

## Как заставить существо выполнять вашу работу

Вам не нужно ничего патчить через Harmony. ИИ каждого существа запрашивает свою следующую работу через делегат, так что вам достаточно просто подменить этот делегат:

```csharp
// перехватываем управление
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // сбросить то, что существо делало, и запросить работу прямо сейчас

// возвращаем управление обратно
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] Перехват нужно периодически подтверждать
> Бой (и некоторые другие механики) сбрасывают текущую работу по завершении, заставляя существо просить новую. Если ваш делегат по-прежнему установлен, оно снова получит вашу работу. Но если другой мод или код перетер делегат, управление пропадет: проверяйте его периодически, а не надейтесь на вечный захват :PES5_Noted:.

## Решения: пусть существо само выбирает вашу задачу

Подмена делегата работы — это жесткий перехват контроля. Чаще вам нужно более мягкое поведение: сделать вашу задачу еще одним вариантом, который существо само взвешивает наряду с поиском еды, сном и боем. Это называется **решением (Decision)**, и именно так игра управляет поведением юнитов.

Решение определяет *когда*. Задача, которую вы уже написали, определяет *как*. Когда мозг выбирает решение, он запускает задачу с тем же ID или с ID из `task_id`.

```csharp Mods/HelloBox/Code/HelloDecisions.cs
namespace HelloBox
{
    public static class HelloDecisions
    {
        public const string WANDER = "hello_decide_wander";

        public static void Initialize()
        {
            if (AssetManager.decisions_library.has(WANDER)) return;

            DecisionAsset wander = new DecisionAsset
            {
                id = WANDER,
                task_id = HelloAI.TASK,                  // the decision says when, the task says how
                priority = NeuroLayer.Layer_1_Low,
                path_icon = "ui/Icons/iconHelloDrive",
                cooldown = 20,                           // seconds before this unit may pick it again
                weight = 1f,
                unique = true,                           // only the actors you give it to, below
                action_check_launch = (Actor pActor) => pActor != null && pActor.isAlive() && !pActor.isFighting()
            };

            AssetManager.decisions_library.add(wander);

            // linkAssets() fills these three for every decision, at startup, before your mod.
            // decision_index is where each unit keeps this decision's cooldown: left at 0, yours
            // would share it with the first vanilla decision.
            wander.decision_index = AssetManager.decisions_library.list.IndexOf(wander);
            wander.priority_int_cached = (int)wander.priority;
            wander.has_weight_custom = wander.weight_calculate_custom != null;

            // who gets it: every wisp, through its actor asset
            ActorAsset wisp = AssetManager.actor_library.get("hello_wisp");
            if (wisp != null) wisp.addDecision(WANDER);
        }
    }
}
```

| Поле | Что делает |
| --- | --- |
| `task_id` | Какую задачу запускать. Пустое поле запустит задачу с тем же ID, что и у решения |
| `priority` | Уровень слоя, от `NeuroLayer.Layer_0_Minimal` до `Layer_4_Critical`. Обычно конкурируют только решения на высшем из доступных слоев |
| `weight` / `weight_calculate_custom` | Привлекательность по сравнению с другими на том же слое (константа или формула) |
| `action_check_launch` | Ваше условие. `false` исключает решение из выбора на этом тике |
| `cooldown` | Секунды до того, как тот же юнит сможет выбрать это решение снова |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Быстрые встроенные проверки перед вызовом вашего делегата |
| `unique` | Исключает решение из списков для всех подряд существ. Для модов всегда `true` |

> [!WARNING] Три поля, которые игра заполняет при старте
> `DecisionsLibrary.linkAssets()` присваивает индексы решениям, копирует `priority` в `priority_int_cached` и выставляет `has_weight_custom` при запуске до модов. Если пропустить три строки после `add()`, ваше решение разделит кулдаун с первым ванильным решением, упадет на низший слой и проигнорирует пользовательский вес :wbfacepalm:.

> [!WARNING] У уже существующих юнитов остался ровно один свободный слот
> Каждый юнит хранит кулдауны решений в массиве, размер которого округляется до степени двойки при создании. В ваниле 127 решений, поэтому массив вмещает 128: ровно на **одно** больше. Ранее существовавший юнит при получении второго кастомного решения упадет с `IndexOutOfRangeException`. Новые юниты создаются с правильным размером массива, поэтому HelloBox привязывает решение к собственному существу, а не к общей черте.

Решение передается существу через объект-носитель. `ActorAsset` получает его через `addDecision()`. **С чертами всё иначе**: они разрешают свои ID при старте, поэтому для черты массив нужно задать вручную:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## Профессии в городах

Горожане получают работу от города, а не от собственного интеллекта. Город оценивает нужды, открывает вакансии (строители, фермеры, шахтеры...) и распределяет их. **Профессия горожанина (Citizen Job)** — это одна из таких вакансий, а нанятый юнит выполняет `ActorJob` с тем же ID. Один и тот же id с обеих сторон: в этом весь фокус.

```csharp Mods/HelloBox/Code/HelloCityJobs.cs
using ai.behaviours;   // CityBehCheckCitizenTasks
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCityJobs
    {
        public const string KEEPER = "hello_ember_keeper";

        public static void Initialize()
        {
            if (AssetManager.citizen_job_library.has(KEEPER)) return;

            // What the citizen does once hired: an actor job with the same id
            ActorJob work = new ActorJob { id = KEEPER };
            work.addTask(HelloAI.TASK);
            work.addTask("end_job");
            AssetManager.job_actor.add(work);

            CitizenJobAsset keeper = new CitizenJobAsset
            {
                id = KEEPER,
                path_icon = "ui/Icons/iconHelloDrive"
            };
            AssetManager.citizen_job_library.add(keeper);

            // post_init() and linkAssets() did these two at startup
            keeper.unit_job_default = KEEPER;
            AssetManager.citizen_job_library.list_priority_normal.Add(keeper);
        }

        // A city hands out job slots in one behaviour, from a fixed list of vanilla jobs.
        // Nothing ever opens a slot for yours unless you add it after that list.
        [HarmonyPatch(typeof(CityBehCheckCitizenTasks), nameof(CityBehCheckCitizenTasks.execute))]
        public static class Patch_CitizenTasks
        {
            public static void Postfix(City pCity)
            {
                if (pCity == null || pCity.status.population_adults < 10) return;

                CitizenJobAsset keeper = AssetManager.citizen_job_library.get(KEEPER);
                if (keeper == null) return;

                // one keeper per city, recomputed every time the city recounts its jobs
                if (pCity.jobs.countCurrentJobs(keeper) == 0) pCity.jobs.addToJob(keeper, 1);
            }
        }
    }
}
```

Три важные вещи, компенсирующие запуск игры до мода:

1. **`unit_job_default`** — это `ActorJob`, выполняемый нанятым жителем. `post_init()` копирует туда ID.
2. **`list_priority_normal`** — список вакансий для жителей (создается `linkAssets()`). Профессии с `priority` > 0 попадают в `list_priority_high` и выдаются первыми.
3. **Вакансии.** `CityBehCheckCitizenTasks.execute()` открывает вакансии из фиксированного ванильного списка. Постфикс Harmony добавляет вакансию для вашей профессии.

| Поле | Что делает |
| --- | --- |
| `priority` / `priority_no_food` | Выше 0: предлагается раньше обычных, либо только при нехватке еды |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Кто может занять должность |
| `should_be_assigned` | Ваше условие назначения конкретному юниту |
| `common_job` | `false` полностью скрывает профессию из обычных списков |
| `path_icon` | Иконка в окне занятости города |

## Тексты

Название задачи отображается в окне юнита как текущее занятие, так что игрок будет читать его чаще любой другой вашей строки. Решение заимствует имя запускаемой им задачи:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## Правила, как не убить производительность

В мире могут жить тысячи существ. Ваше действие будет выполняться для каждого из них, каждый тик. «Производительность? Впервые слышу, это едят?» - хорошая шутка, пока её не съедает ваш мод. Большинство модов, мои тоже, гоняют огромные циклы каждый тик и на приличном ПК им это сходит с рук. Поведению это с рук не сойдёт.

- **Считайте тяжелую логику по своему расписанию, а не в `execute`.** Запускайте ресурсоемкие расчеты в `Update()` по таймеру, сохраняйте результат и заставляйте `execute` просто считывать готовый ответ.
- **Распределяйте нагрузку.** Если вам нужно обсчитать 40 существ, считайте по 10 штук за проход на протяжении четырех кадров, а не все 40 разом.
- **Выходите как можно раньше.** Первые строки `execute` должны содержать легкие проверки, позволяющие мгновенно вернуть `Stop` или `Continue`.
- **Никогда не выделяйте память в горячем цикле.** Создание новых списков и лямбда-выражений на каждом тике, помноженное на тысячи существ, похоронит ваш фреймрейт под лавиной сборщика мусора.

> [!TIP] Сначала черта, затем поведение
> Дайте существам, которыми вы управляете, видимую черту (см. **[Кастомные черты](#/nml/custom-traits)**), чтобы игрок видел ваших юнитов, а *вы сами* могли с первого взгляда понять, на тех ли существах работает ваш код :pepeOK:.
