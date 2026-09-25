---
title: Каждый кадр
group: NML Моддинг
subgroup: Продвинутые техники и публикация
icon: :wbyawn:
order: 43
---

# Каждый кадр :wbyawn:

Ваш главный класс - компонент Unity. `BasicMod<T>` наследуется от `MonoBehaviour`, так что если вы напишете в нём метод `Update()`, Unity будет вызывать его раз за кадр. С первой секунды после запуска и до закрытия игры, шестьдесят раз в секунду, есть мир или нет.

Это место для всего, что не является реакцией на событие: проверка раз в игровой месяц, очередь из Harmony-патча, нажатие клавиши. Это же и самый лёгкий способ в моддинге превратить чью-то игру в слайд-шоу :wbfacepalm:.

## Страховка

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: запуск позади. worldLoading: мир не наполовину очищен и не наполовину построен
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Проверка | От чего она вас спасает |
| --- | --- |
| `World.world != null` | Экземпляр карты ещё не существует |
| `Config.game_loaded` | Первые мгновения после запуска, до того как игра стартовала свой первый мир |
| `Config.worldLoading` | Экран загрузки. Мир очищается, генерируется или загружается, а списки юнитов опустошаются и наполняются прямо у вас под ногами |

`Config.worldLoading` - это `SmoothLoader.isLoading()`, та же проверка, которую делает собственный `MapBox.Update()` игры, прежде чем что-либо симулировать. Страховка из **[Логи и отладка](#/nml/logs-and-debugging)** покрывает запуск игры; добавьте проверку загрузки, и вы застрахованы также от каждой загрузки мира после этого.

## Не каждый кадр

Большинству вещей не нужны шестьдесят проверок в секунду. Выберите часы и работайте по ним.

| Часы | Что они делают |
| --- | --- |
| `Time.deltaTime` | Реальные секунды с прошлого кадра. Продолжают идти, пока игра на паузе, игнорируют настройку скорости. Игра никогда не трогает `Time.timeScale` |
| `World.world.getCurWorldTime()` | Секунды мира, как `double`. Останавливаются, пока игра на паузе или открыто окно, идут быстрее на высоких скоростях. 5 - это месяц, 60 - год |

Мировое время годится для всего, что происходит *в* мире. Вот пример: каждое существо с чертой злопамятности из **[Запоминаем вещи](#/nml/saving-data)** забывает один удар раз в месяц:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // секунды мира: один игровой месяц
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // часы, пошедшие назад, сбрасывают точку отсчёта без срабатывания тика
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

Оставьте вызов `PatchAll` из **[Harmony-патчи](#/nml/harmony-patches)**: `ResetClock` выполняется после каждого сгенерированного или загруженного мира, даже с равной или более поздней меткой времени. Первый тик в этом мире ждёт полный интервал. Одна лишь проверка на «часы пошли назад» не способна поймать каждую загрузку.

Пауза, скорость и открытые окна обрабатываются сами собой, потому что мировые часы уже их учитывают. Реальное время годится для того, что происходит не в мире, например для мигающей надписи:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Проверка паузы самостоятельно
> `Config.paused` - это только кнопка паузы и ничего больше. Симуляция также останавливается, пока открыто окно; `World.world.isPaused()` покрывает оба случая, но он `internal`, а значит нужна публицированная сборка, против которой NML вас и компилирует. Использование мирового времени избавляет от этого вопроса.

## Корутины

Корутина - это метод, который может остановиться на полпути. Ваш главный класс - `MonoBehaviour`, так что он умеет их запускать:

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // проверяется после каждого ожидания: у юнита была целая секунда, чтобы умереть
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` ждёт в реальных секундах, а поскольку игра никогда не меняет `Time.timeScale`, она не останавливается на паузе и не зависит от скорости игры. Корутина также продолжает работать, если игрок загрузит другой мир на полпути. Отсюда проверка после *каждого* `yield`, а не только перед первым :PES2_F:.

## Клавиши

`Input.GetKeyDown(KeyCode.F7)` в `Update()` работает. Но он же срабатывает, пока игрок вводит имя юнита в текстовое поле, и игрок не может сменить клавишу. Собственные горячие клавиши игры пропускают нажатия, пока в фокусе текстовое поле, и `HotkeyAsset` получает это бесплатно. См. **[Пользовательские окна](#/nml/custom-windows)** про регистрацию своей. Оставьте `GetKeyDown` только для отладочной клавиши, которую нажмёте лишь вы.

## Тяжёлая работа

- **Перебирайте юнитов по таймеру, никогда не каждый кадр.** Десять тысяч юнитов умножить на шестьдесят кадров - это шестьсот тысяч проверок в секунду ради черты, которая есть, может быть, у трёх юнитов.
- **Дешёвая проверка первой.** То же правило, что и для Harmony-патча: первая строка - та, что позволяет сделать `return`.
- **Параллельный код кладёт в очередь, `Update()` разбирает.** Postfix на параллельном методе вроде `Actor.updateStats` не должен трогать Unity или общее состояние, см. **[Harmony-патчи](#/nml/harmony-patches)**. Он кладёт юнита в очередь, а основной поток забирает его здесь:

```csharp
// pending - это ConcurrentQueue, который заполняет ваш патч
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // теперь Unity, Рэнди и ваши собственные списки трогать безопасно
}
```

Что делать, когда вы уже в цикле, - это **[Мир во время выполнения](#/nml/world-at-runtime)**. Что должно остаться после сохранения и загрузки - это **[Запоминаем вещи](#/nml/saving-data)** :PES_OkHand:.
