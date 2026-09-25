---
title: Патчи Harmony
group: NML Моддинг
subgroup: Продвинутые техники и публикация
icon: :wbhammer:
order: 42
---

# Патчи Harmony :wbhammer:

Всё на других страницах **добавляет** что-то в WorldBox: черту (trait), оружие, здание (building). Harmony нужен для второй половины моддинга: **изменения того, что игра уже делает**.

Вы не можете напрямую редактировать код игры. Он скомпилирован, поставляется в виде `Assembly-CSharp.dll`, и первое же обновление снесёт все ваши правки. Harmony — это библиотека (library), позволяющая подключить ваш собственный код к уже существующему методу прямо во время работы (job) игры.

> [!NOTE] Никогда раньше не писали код?
> Прочтите «Что такое метод» и «Аналогия со стикером», затем сделайте что-нибудь из страниц **Игровой контент** и возвращайтесь позже. Harmony не так уж сложен, но это первый инструмент, способный сломать моды *других авторов*, и ваши патчи будут куда чище, когда вы увидите, как устроены ассеты самой игры :PES_Wise:.

## Что такое метод

**Метод** — это именованное действие внутри кода игры. Вот несколько реальных примеров:

| Метод | Когда игра его вызывает |
| --- | --- |
| `Actor.updateStats()` | Каждый раз, когда нужно пересчитать характеристики (stats) существа |
| `Actor.getHit(...)` | Каждый раз, когда существо получает урон |
| `City.makeWarrior(...)` | Каждый раз, когда город превращает жителя в воина |

Игра вызывает тысячи таких методов в секунду. К каждому из них можно подключиться.

## Стикер-напоминание

Представьте метод как страницу в книге (book) рецептов игры. Harmony не переписывает страницу. Он прикрепляет к ней два стикера:

```text
┌─────────────────────────────┐
│  ВАШ PREFIX                 │  <- выполняется ДО кода игры
├─────────────────────────────┤
│  оригинальный код игры      │  <- нетронут
├─────────────────────────────┤
│  ВАШ POSTFIX                │  <- выполняется ПОСЛЕ кода игры
└─────────────────────────────┘
```

- **Prefix** видит входящие параметры до того, как их обработает игра. Он может их изменить или вовсе отменить выполнение метода.
- **Postfix** видит результат после того, как игра закончила работу. Он может скорректировать этот результат или просто отреагировать на него.

Это 95 % возможностей Harmony. Всё остальное на этой странице — практические нюансы.

## Включение Harmony

Всего одна строчка, один раз в `OnModLoad`. Она сканирует ваш мод на наличие патчей и применяет каждый найденный:

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" — это ваш GUID. Harmony помечает им ваши патчи,
            // поэтому при конфликте в логе сразу видно, кто виноват.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` означает «только мои собственные файлы». Это не декорация: без этого параметра `PatchAll()` сканирует сборку, из которой был вызван, и в неудачный день это окажется чужой мод :PESgn_Yikes:.

## Ваш первый патч, строка за строкой

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Здесь происходит шесть вещей:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: адрес. «Метод `updateStats` в классе `Actor`». Строка в квадратных скобках - это *атрибут*: метка, которую читает компьютер, а не выполняемый код.
- **`public static class Patch_Actor_UpdateStats`**: контейнер. Имя ваше и ни на что не влияет, но вы из будущего скажете спасибо за `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: это имя **не** ваше, если вы его не пометили меткой. Без метки Harmony ищет метод, названный ровно `Prefix`, `Postfix` или `Finalizer`. Напишите `postfix`, и ничего не произойдёт, причём без ошибки :PESgn_ButWhy:. Решение - метка, см. «Свои имена методов патча» ниже.
- **`Actor __instance`**: **два** подчёркивания. Это конкретный юнит, с которым игра работает прямо сейчас. Без него вы знаете, *что* характеристики юнита пересчитаны, но не знаете, *чьи*.
- **`if (!__instance.hasTrait(...)) return;`**: выходите пораньше. Ваш патч выполняется для каждого юнита мира, вечно. Сделайте обычный случай одной проверкой и `return`.
- **`stats["speed"] += 20f;`**: само изменение. `updateStats` в начале очищает и заново собирает блок характеристик, поэтому прибавка в Postfix ложится на чистый лист, а не накапливается каждый тик.

> [!DANGER] `updateStats` выполняется не в главном потоке
> Игра регистрирует его как **параллельную** задачу (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, а `Config.parallel_jobs_updater` по умолчанию `true`), поэтому ваш Postfix работает в рабочем потоке, сразу на многих юнитах. Внутри трогайте **только числа этого юнита**. Вызов Unity (`Time.time`, `transform`, `Destroy`, `Resources.Load`), игрового генератора случайных чисел `Randy` или запись в ваш общий список - это краш, который проявится только на чужом компьютере.
>
> Если вам нужно что-то из этого, поставьте юнит в очередь и выполните работу в своём `Update()`:
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## Магические имена параметров

Harmony сопоставляет параметры **по имени**. Вот те, что имеют значение (подчёркивания являются частью имени):

| Имя | Что вы получаете |
| --- | --- |
| `__instance` | Объект, у которого был вызван метод. Для `static` методов опускается |
| `__result` | Возвращаемое значение метода. Объявите с `ref`, чтобы изменить. Только в Postfix |
| `___someField` | **Три** подчёркивания: приватное поле этого объекта, названное в точности как в игре |
| `__state` | Значение, которое Prefix передаёт вашему Postfix в рамках этого же вызова |
| любое реальное имя параметра | Аргумент, переданный вызывающей стороной, названный **в точности** как в игре |

На последней строке спотыкаются чаще всего, снова и снова. Если в игре объявлено `getHit(float pDamage, ...)`, ваш параметр обязан называться `pDamage`. Не `damage` и не `pDmg`. Вы можете перечислить только нужные аргументы и опустить остальные, но указанные имена должны совпадать до буквы (в WorldBox почти все они начинаются с `p`).

## Изменение результата

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref означает «сюда можно записывать», и записанное вами значение вернётся вызывающей стороне.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Корректируйте, а не перезаписывайте наглухо. `__result *= 1.5f` прекрасно уживётся с другим модом, пропатчившим этот же метод. `__result = 12f` уничтожит их работу и породит споры в комментариях к моду.


## Изменение захардкоженного числа в игре

Половина запросов в духе «кто-нибудь может сделать мод, который...» — это просто одно число. Нет ничего невозможного, просто никто ещё этого не сделал :wbbru:. «Города растут слишком большими» — это буквально вот этот метод из класса игры `City`:

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

Метод, возвращающий константу — самое простое, что можно пропатчить в игре. Вы не трогаете константу, а корректируете то, что он возвращает:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // города вдвое меньше

        public static void Postfix(ref int __result)
        {
            // 999 — это опция отладки "unlimited zone range". Не ломайте чит игрока
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Привяжите `SCALE` к ползунку в **[Конфигурации мода](#/nml/mod-config)**, и игроки смогут настраивать его сами.

Найти метод — вот в чём настоящая работа. Ищите в **dnSpy** число, которое видите в игре (13 зон, 2 оружия, 5 лет), или существительное правила ("zone", "limit", "max"). Константа в маленьком методе — это Postfix. Константа, спрятанная в середине длинного метода, требует transpiler, и на этом данная страница останавливается :PES2_Shrug:.

## Отмена оригинального метода

Prefix, возвращающий `bool`, решает, будет ли вообще выполняться оригинальный код игры:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = полностью пропустить оригинальный getHit. Существо не получит урона.
        return false;
    }
}
```

Обратите внимание на логику: особый случай возвращает `false`, а **все остальные случаи возвращают `true`**. Забудете этот `return true` — и отключите получение урона для всего мира.

> [!WARNING] `return false` — это ядерное оружие
> Он пропускает не только *вашу* версию метода. Он пропускает код игры **для всех**. Postfix любого другого мода на этом методе всё равно выполнится, реагируя на вызов, которого никогда не было. Ванильный метод обычно делает пять скрытых вещей, о которых вы даже не догадываетесь, и его отмена сломает все пять.
>
> Прежде чем писать `return false`, подумайте, нельзя ли обойтись Postfix-ом. «Залечить полученный урон сразу после удара» ломает куда меньше систем, чем «урона вообще никогда не было» :PES3_Balance:.

## Два способа указать имя метода

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // публичный метод
[HarmonyPatch(typeof(Actor), "updateStats")]             // всё остальное
```

`nameof` предпочтительнее, потому что опечатка станет ошибкой компиляции, а не патчем, который молча никогда не сработает. Но `nameof` работает только с доступными для вашего кода членами классов, а большая часть WorldBox помечена как `internal` или `private`. Для них строковое имя — единственный вариант, поэтому сверяйте названия с реальным кодом в **[Чтение кода игры](#/toolbox/reading-the-game-code)**.

## Свои имена методов патча

Магические имена `Prefix` и `Postfix` — это соглашение, а не требование. Поставьте метку на методе и называйте его как хотите:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`, `[HarmonyPostfix]` и `[HarmonyFinalizer]` существуют все. С меткой имя метода — это только для вас, и проблема «опечатался в `Postfix`, ничего не произошло» исчезает. Это также позволяет держать в одном классе Prefix и Postfix для разных целей без конфликта имён. Примерно половина модов делает именно так, и это та половина, которая никогда не теряет вечер из-за строчной `p`.

## Когда у двух методов одно имя

Тогда сочетание «класс + имя» неоднозначно. Harmony откажется гадать, и ваш мод умрёт при запуске с `AmbiguousMatchException`. У `Actor` есть два метода `addTrait`:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Укажите типы параметров того, что вам нужен, **все** из них, включая те, что со значением по умолчанию:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

Другие реальные перегрузки, на которых люди спотыкаются: `TileZone.isGoodForNewCity()` и `isGoodForNewCity(Actor pActor)`, а также `SaveManager.loadWorld()` и `loadWorld(string pPath, bool pLoadWorkshop = false)` (оба `internal`, поэтому только строковые имена). Если сомневаетесь, поищите имя метода по всему классу, прежде чем писать атрибут.

## Патчи, требующие «до» и «после»

`__state` — это значение, которое Prefix передаёт Postfix-у в рамках одного вызова. Используйте его, чтобы запомнить состояние до того, как игра успела его изменить:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* кто-то нанёс урон здоровью */ }
    }
}
```

## Свойства и конструкторы

Не всё — обычный метод. `Actor.is_moving` — это свойство: выглядит как поле, но блок `get` выполняется каждый раз, когда кто-то его читает. Скажите Harmony, какая половина вам нужна:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

После этого — обычный патч, и `ref bool __result` — это то, что получает читающий код. `MethodType.Setter` — вторая половина. `MethodType.Constructor` патчит конструктор класса, где `__instance` — это создаваемый объект; если у класса несколько конструкторов, добавьте после него `Type[]`, точно как для перегрузки.

## Приватные поля и методы

Ваш патч может увидеть приватное поле `__instance`, если запросить его как параметр: **три** подчёркивания, затем имя поля в точности как в игре. Игра начинает большинство приватных полей со своего `_`, так что приватное поле юнита `_hover_timer` становится **четырьмя**:

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref`, если хотите в него писать. Читать это неудобно, но это абсолютно корректно.

Вне патча то же самое достают `AccessTools` и `Traverse` (оба из `HarmonyLib`):

```csharp
// изредка: Traverse короткий и медленный
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// каждый кадр: постройте аксессор один раз, и он почти так же быстр, как обычное поле
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // это ref, так что это запись

// приватный метод: рефлексии нужны все аргументы, включая значения по умолчанию
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

Строка называет то, что компилятор проверить не может. Если обновление переименует `_hover_timer`, вы узнаете об этом во время выполнения. Альтернатива — **публицированная** `Assembly-CSharp.dll`, где `internal` и `private` становятся видимыми, и переименование снова становится ошибкой компиляции.

## Патчинг вручную

`[HarmonyPatch]` вместе с `PatchAll` — лёгкий путь. Другой путь — найти метод самостоятельно и вызвать `Patch`:

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // существуют две перегрузки addTrait, так что типы обязательны
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null означает, что обновление его переименовало: теряем одну функцию, а не весь мод
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result равен false, если юнит уже её имел или противоположность её заблокировала
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Тот же id Harmony, что и в вашем `PatchAll`, те же правила для имён параметров. Что вы получаете — это `if` посередине. Обращайтесь к этому, когда:

- **Цель может не существовать.** Метод, который, как вы подозреваете, следующее обновление переместит, или живущий в *другом моде*. `AccessTools.TypeByName("TheirNamespace.TheirClass")` вернёт `null`, когда этого мода нет, и вы просто пропускаете патч. См. **[Другие моды](#/nml/other-mods)**.
- **Патч зависит от настройки.** Патчить, только если игрок включил функцию в **[Настройках мода](#/nml/mod-config)**.
- **Вы хотите знать, что всё сработало.** Отсутствующая цель `PatchAll` бросает исключение, и патчи, до которых он не дошёл, никогда не применятся. Здесь же отсутствующий метод — это одна строка в логе.

## Когда несколько модов патчат один метод

Внутри каждого вида патча Harmony упорядочивает их по приоритету, **сначала самый высокий**, по умолчанию `Normal`. Явные зависимости `[HarmonyBefore]` и `[HarmonyAfter]` могут изменить этот порядок:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Обычные приоритеты: `First`, `High`, `Normal`, `Low`, `Last`. Это важно, когда порядок меняет ответ:

- Postfix, который **ограничивает** результат (`Mathf.Min(__result, 20)`), хочет `Priority.Last`, чтобы обычно ограничивать после Postfix-ов с более высоким приоритетом. Он не может гарантировать, что окажется последним против другого патча с `Last` или явных зависимостей порядка.
- Prefix, который **проверяет** что-то и может вернуть `false`, хочет `Priority.First` или `High`, чтобы решать заранее. Не полагайтесь на это как на гарантию того, что другие Prefix-ы будут пропущены: NML поставляется с HarmonyX, который [выполняет все Prefix-ы](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes) даже когда один из них вернул `false`.

Устанавливайте приоритет только при наличии причины. Если каждый мод просит `First`, вы снова оказываетесь там, где никто не первый :PES3_Balance:.

## Finalizer: перехват того, что бросает игра

Finalizer выполняется после всего остального, **даже если метод выбросил исключение**. Он получает исключение, и всё, что он вернёт, будет выброшено дальше:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // сохраняем сбой после его логирования
        return __exception;
    }
}
```

Это логирует сбой, не скрывая его. Возврат `null` подавил бы исключение, включая сбои из других патчей. Делайте так только для конкретного сбоя, от которого вы действительно можете оправиться. Метод, выбросивший исключение на середине, уже сделал половину своей работы, и проглатывание исключения оставляет мир в этом состоянии :PESgn_Yikes:.

## Методы, которые моды патчат чаще всего

Среди модов, которые я просмотрел, эти встречаются снова и снова. Сигнатуры взяты прямо из кода игры.

| Цель | Что нужно знать |
| --- | --- |
| `City.update(float pElapsed)` | Публичный. Выполняется каждый кадр для каждого города. Сначала дешёвая проверка |
| `MapBox.Update()` | **Приватный**, поэтому `"Update"` строкой. Выполняется каждый кадр, один раз. См. **[Каждый кадр](#/nml/update-loops)**, прежде чем его патчить |
| `Actor.updateStats()` | **Internal**. Выполняется в параллельной задаче, см. предупреждение выше |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**. Каждый удар по каждому юниту |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Приватный**, `"die"` строкой |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Публичный |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Публичный статический, возвращает `bool`. Без `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**, возвращает `War` |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Публичный, возвращает `War` |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Публичный. Также выполняется во время загрузки сохранения, проверяйте `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Публичный |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Публичный статический, возвращает ребёнка |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Публичный, возвращает новый `Actor`. Через него проходит каждый спавн |

`private` и `internal` цели прекрасно патчатся по строковому имени, и ваши параметры всё равно привязываются по имени. Чего вы не можете без публицированной сборки — это написать `nameof(...)` для них или трогать их `internal`-члены внутри тела своего патча.

> [!NOTE] `World` — это держатель, `MapBox` — цель
> `typeof(World)` — валидный C#, даже несмотря на то, что `World` статичен. Это неверная цель для Harmony в случае `Update` или `finishMakingWorld`: эти методы принадлежат `MapBox`, типу, который возвращает `World.world`. Неверная цель падает, когда Harmony применяет патч, а не когда C# компилирует `typeof`.

## Что делать, если не работает

Прежде чем винить Harmony, прочитайте лог. Это редко Harmony :PES5_Noted:.

| Симптом | Типичная причина |
| --- | --- |
| Ничего не происходит, лог пуст | Опечатка в слове `Postfix` без метки `[HarmonyPostfix]`, или забыли вызвать `PatchAll` |
| `HarmonyException` / `MissingMethodException` при запуске | Класса или метода с таким именем не существует. Проверьте в dnSpy |
| `AmbiguousMatchException` / `Ambiguous match found` | Несколько перегрузок метода. Добавьте аргумент `Type[]`, как показано выше |
| Краш, который случается только на чужих компьютерах | Postfix на `Actor.updateStats`, трогающий Unity, `Randy` или общий список из рабочего потока |
| `NullReferenceException` внутри патча | `__instance` или одно из его полей равно null. Патчи выполняются в состояниях, не встречающихся при обычной игре: во время загрузки, смерти, удаления объектов |
| Игра падает до 3 FPS | Вы пропатчили метод, вызываемый тысячи раз в секунду, и повесили туда тяжёлые вычисления |
| Работает в одиночку, ломается с другим модом | Кто-то возвращает `false` или оба мода перезаписывают `__result` вместо корректировки |

## Правила хорошего тона

- **Postfix по умолчанию.** Берите Prefix, только когда нужно изменить аргумент или остановить метод.
- **Корректируйте, никогда не присваивайте.** `+=`, `*=`, `Math.Min(...)`. Кто-то ещё тоже это пропатчил.
- **Всегда проверяйте на null.** Ваш патч будет выполняться во время загрузки мира и во время смерти юнита.
- **Сначала дешёвая проверка.** Первая строка горячего патча должна быть проверкой, после которой можно сделать `return`. `City.update` и `MapBox.Update` - два метода, которые моды патчат чаще всего, и оба выполняются каждый кадр. Поиск в словаре там - нормально. Цикл по всем юнитам - нет.
- **Патчите самый узкий метод, который решает задачу.** Патчить `Actor.updateStats` ради скорости одной черты - нормально. Патчить обновление всего мира ради того же - верный способ добиться удаления мода.
- **Держите патчи в одном файле.** Когда кто-то сообщит о конфликте, вы захотите читать один файл, а не двенадцать. Пожалейте себя из будущего. Делайте, как я говорю, а не как сделаны мои старые моды :trollface:.

> [!NOTE] Патчить `has`, `get`, `add`, `clone` или `post_init` библиотеки бессмысленно
> Это влияет только на вызовы после загрузки вашего мода, но никогда на ванильную регистрацию, которая к тому моменту уже прошла. См. **[Библиотеки ассетов](#/nml/asset-libraries)**.

## Транспайлеры: изменение инструкций

Транспайлер переписывает IL, скомпилированные инструкции внутри метода. Используйте его, когда изменение нужно внести посередине, и ни Prefix, ни Postfix не могут этого выразить. Он выполняется, когда Harmony строит заменяющий метод, а не на каждом игровом тике, и может выполниться снова, когда добавляется другой транспайлер.

Вот сигнатура внутри вашего класса патча. Она намеренно пропускает всё насквозь:

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

Для настоящей переделки:

1. Изучите IL цели в dnSpy. Сопоставляйте последовательность опкодов и конкретный операнд поля или метода, а не "инструкцию 42" или каждое вхождение одного числа.
2. Собирайте совпадения **до** редактирования. Явно проверяйте ожидаемое количество. Если ожидаете одно, а нашли ноль или два - залогируйте несовпадение и верните нетронутый вход. Никогда не выпускайте половину переделки.
3. Сохраняйте метки переходов, блоки исключений, а также типы и баланс стека вычислений. Замена, которая выглядит правильно в C#, всё ещё может быть невалидным IL.
4. Тестируйте пути и совпадения, и несовпадения, а затем тестируйте с другими патчами на том же методе.

[Документация Harmony по транспайлерам](https://harmony.pardeike.net/articles/patching-transpiler.html) описывает API инструкций. Обновление игры - повод проверить паттерн заново, а не сдвинуть магический индекс на три :PES5_BigBrain:.

NML поставляется с **HarmonyX**, форком Harmony. Основной API патчей общий, но поведение может отличаться, включая пропуск Prefix-ов. Следующая остановка, если несколько модов будут трогать одно и то же: **[Другие моды](#/nml/other-mods)**.
