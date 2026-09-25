---
title: Every frame
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbyawn:
order: 43
---

# Every frame :wbyawn:

Your main class is a Unity component. `BasicMod<T>` derives from `MonoBehaviour`, so if you write an `Update()` method on it, Unity calls it once per frame. From the first second after launch until the game closes, sixty times a second, whether there is a world or not.

That is the place for anything that is not a reaction to something: a check every in-game month, a queue from a Harmony patch, a key press. It is also the easiest way in modding to turn somebody's game into a slideshow :wbfacepalm:.

## The guard

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: past startup. worldLoading: no world half cleared or half built
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Check | What it keeps you out of |
| --- | --- |
| `World.world != null` | No map instance exists yet |
| `Config.game_loaded` | The first moments after launch, before the game has started its first world |
| `Config.worldLoading` | The loading screen. A world is being cleared, generated or loaded, and the unit lists are being emptied and refilled under your feet |

`Config.worldLoading` is `SmoothLoader.isLoading()`, the same check the game's own `MapBox.Update()` makes before it simulates anything. The guard in **[Logs & debugging](#/nml/logs-and-debugging)** covers startup; add the loading check and you also stay out of every world load after that.

## Not every frame

Most things do not need sixty checks a second. Pick a clock and run on it.

| Clock | What it does |
| --- | --- |
| `Time.deltaTime` | Real seconds since last frame. Keeps running when the game is paused, ignores the speed setting. The game never touches `Time.timeScale` |
| `World.world.getCurWorldTime()` | World seconds, as a `double`. Stops while the game is paused or a window is open, runs faster at higher speeds. 5 is a month, 60 is a year |

World time for anything that happens *in* the world. Here, every unit with the grudge trait from **[Remembering things](#/nml/saving-data)** forgets one hit a month:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // world seconds: one in-game month
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

            // a backwards clock resets the baseline without firing a tick
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

Keep the `PatchAll` call from **[Harmony patches](#/nml/harmony-patches)**: `ResetClock` runs after every generated or loaded world, even one with an equal or later timestamp. The first tick waits a full interval in that world. A backwards-clock check alone cannot detect every load.

Pause, speed and open windows are all handled, because the world clock already obeys them. Real time for things that are not in the world, like a label that blinks:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Checking for pause yourself
> `Config.paused` is the pause button and nothing else. The simulation also stops while a window is open; `World.world.isPaused()` covers both, but it is `internal`, so it needs the publicized assembly NML compiles you against. Using world time saves you the question.

## Coroutines

A coroutine is a method that can wait halfway through. Your main class is a `MonoBehaviour`, so it can start one:

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
                // checked after every wait: the unit had a whole second to die
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` waits in real seconds, and since the game never changes `Time.timeScale`, it does not stop for pause and does not care about game speed. The coroutine also keeps running if the player loads another world halfway through. Hence the check after every `yield`, not just before the first one :PES2_F:.

## Keys

`Input.GetKeyDown(KeyCode.F7)` in `Update()` works. It also fires while the player is typing a unit's name in a text field, and the player cannot change the key. The game's own hotkeys skip keys while a text field has focus, so a `HotkeyAsset` gets that for free. See **[Custom windows](#/nml/custom-windows)** for registering one. Keep `GetKeyDown` for a debug key only you will ever press.

## Heavy work

- **Loop over units on a timer, never every frame.** Ten thousand units times sixty frames is six hundred thousand checks a second, for a trait maybe three units have.
- **Cheap check first.** Same rule as a Harmony patch: the first line is the one that lets you `return`.
- **Parallel code queues, `Update()` drains.** A Postfix on a parallel method like `Actor.updateStats` must not touch Unity or shared state, see **[Harmony patches](#/nml/harmony-patches)**. It queues the unit, and the main thread picks it up here:

```csharp
// pending is the ConcurrentQueue your patch fills
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // now Unity, Randy and your own lists are safe to touch
}
```

What you do once you are in the loop is **[The world at runtime](#/nml/world-at-runtime)**. What you want to still be there after a save and load is **[Remembering things](#/nml/saving-data)** :PES_OkHand:.
