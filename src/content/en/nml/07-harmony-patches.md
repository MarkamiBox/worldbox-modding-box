---
title: Harmony patches
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbhammer:
order: 42
---

# Harmony patches :wbhammer:

Everything on the other pages **adds** things to WorldBox: a trait, a weapon, a building. Harmony is for the other half of modding: **changing what the game already does**.

You cannot edit the game's code. It is compiled, it ships as `Assembly-CSharp.dll`, and if you edited it the next update would overwrite you. Harmony is the library that lets you attach your own code to a method that already exists, while the game is running.

> [!NOTE] Never written code before?
> Read "What a method is" and "The sticky note", then go build something from the **Game Content** pages instead and come back. Harmony is not hard, but it is the first thing that can break *other people's* mods, and you will write better patches once you have seen how the game's own assets are put together :PES_Wise:.

## What a method is

A **method** is one named action inside the game's code. Some real ones:

| Method | When the game runs it |
| --- | --- |
| `Actor.updateStats()` | Every time a unit's numbers need recalculating |
| `Actor.getHit(...)` | Every time a unit takes damage |
| `City.makeWarrior(...)` | Every time a town turns a citizen into a soldier |

The game calls thousands of these per second. Every one of them is a place you could hook into.

## The sticky note

Picture a method as a page in the game's recipe book. Harmony does not rewrite the page. It staples two blank notes to it:

```text
┌─────────────────────────────┐
│  YOUR PREFIX                │  <- runs BEFORE the game's code
├─────────────────────────────┤
│  the game's original code   │  <- untouched
├─────────────────────────────┤
│  YOUR POSTFIX               │  <- runs AFTER the game's code
└─────────────────────────────┘
```

- A **Prefix** sees the incoming values before the game does. It can change them, and it can cancel the whole thing.
- A **Postfix** sees the result after the game is finished. It can change that result, or just react to it.

That is 95% of Harmony. The rest of this page is details.

## Turning Harmony on

One line, once, in `OnModLoad`. It scans your own mod for patches and applies every one it finds:

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

            // "com.yourname.hellobox" is your GUID. Harmony labels your patches with it,
            // so when something conflicts the log says whose fault it is.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` means "only my own files". It is not optional decoration: without it `PatchAll()` scans whatever assembly it was called from, and on a bad day that is somebody else's :PESgn_Yikes:.

## Your first patch, line by line

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
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Six things are happening:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: the address. "The method called `updateStats`, on the class called `Actor`." A line in square brackets is an *attribute*: a label the computer reads, not code that runs.
- **`public static class Patch_Actor_UpdateStats`**: a container. The name is yours and changes nothing, but future-you will thank present-you for `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: this name is **not** yours. Harmony looks for a method spelled exactly `Prefix`, `Postfix` or `Finalizer`. Write `postfix` and nothing happens, with no error :PESgn_ButWhy:.
- **`Actor __instance`**: **two** underscores. This is the specific unit the game is working on right now. Without it you know *that* a unit's stats were recalculated, but not *whose*.
- **`if (!__instance.hasTrait(...)) return;`**: get out early. Your patch runs for every unit in the world, forever. Make the common case one check and a `return`.
- **`stats["speed"] += 20f;`**: the actual change. `updateStats` clears and rebuilds the stat block at the top, so adding in a Postfix lands on a fresh slate instead of compounding every tick.

> [!DANGER] `updateStats` does not run on the main thread
> The game registers it as a **parallel** job (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, and `Config.parallel_jobs_updater` is `true` by default), so your Postfix runs on a worker thread, on many units at once. Inside it, touch **only that unit's own numbers**. Calling Unity (`Time.time`, `transform`, `Destroy`, `Resources.Load`), the game's random helper `Randy`, or writing into a shared list of yours is a crash that only shows up on somebody else's machine.
>
> If you need any of that, queue the unit and do the work in your own `Update()`:
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

## The magic parameter names

Harmony fills your parameters in **by name**. These are the ones that matter, and the underscores are part of the name:

| Name | What you get |
| --- | --- |
| `__instance` | The object the method was called on. Omit it for a `static` method, which has none |
| `__result` | The method's return value. Declare it `ref` to change it. Postfix only |
| `___someField` | **Three** underscores: a private field of that object, spelled exactly as the game spells it |
| `__state` | A value your Prefix stashes for your own Postfix to pick up |
| any real parameter name | The argument the caller passed, spelled **exactly** as the game spells it |

That last row is what people trip on. If the game declares `getHit(float pDamage, ...)`, your parameter must be called `pDamage`. Not `damage`, not `pDmg`. You may list only the parameters you care about and skip the rest, but the ones you list must match, and in this game they nearly all start with `p`.

## Changing a result

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref means "you may write to this", and what you write is what the caller receives.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Adjust, do not assign. `__result *= 1.5f` still behaves if another mod patched the same method. `__result = 12f` throws their work away and starts an argument in your comments section.

## Changing a number the game hard-codes

Half the "can somebody make a mod that..." requests are one number. "Cities grow too big" is this, straight from the game's own `City`:

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

A method that returns a constant is the easiest thing in the game to change. You do not touch the constant, you adjust what comes out:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // half-size towns

        public static void Postfix(ref int __result)
        {
            // 999 is the debug "unlimited zone range" switch. Leave the player's cheat alone
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Put `SCALE` behind a slider from **[Mod settings](#/nml/mod-config)** and players tune it themselves.

Finding the method is the real work. Search **dnSpy** for the number you see in game (13 zones, 2 weapons, 5 years), or for the noun in the rule ("zone", "limit", "max"). A constant sitting in a small method is a Postfix. A constant buried in the middle of a long one is a transpiler, and that is where this page stops :PES2_Shrug:.

## Cancelling the original

A Prefix that returns `bool` decides whether the game's own code runs at all:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = skip the game's getHit entirely. The unit takes no damage.
        return false;
    }
}
```

Note the shape of the guard: the interesting case returns `false`, and **every other case returns `true`**. Forget that `return true` and you have disabled damage for the entire world.

> [!WARNING] `return false` is the nuclear option
> It does not skip *your* version of the method. It skips **everybody's**: the game's code, and every other mod's Prefix and Postfix on that method. A vanilla method usually does five things you never read, and cancelling it silently disables all five.
>
> Before writing `return false`, check whether a Postfix would do. "Heal the damage back afterwards" breaks far less than "there was never any damage" :PES3_Balance:.

## Two ways to write the method name

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public method
[HarmonyPatch(typeof(Actor), "updateStats")]             // anything else
```

`nameof` is better, because a typo becomes a compile error instead of a patch that quietly never applies. But `nameof` only works on members your code is allowed to see, and much of WorldBox is `internal` or `private`. For those the plain string is the only option, so check the spelling against the real code in **[Reading the game's code](#/toolbox/reading-the-game-code)**.

## When two methods share a name

Then class + name is ambiguous and Harmony refuses to guess. Spell out the parameter types:

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

## Patches that need a before and an after

`__state` is a value your Prefix hands to your Postfix, for that same call. Use it to remember what something looked like before the game touched it:

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
        if (__instance.stats["health"] < __state) { /* something took health away */ }
    }
}
```

## When it does not work

| What you see | What it usually is |
| --- | --- |
| Nothing happens, nothing in the log | `Postfix` misspelled, or you never called `PatchAll` |
| `HarmonyException` / `MissingMethodException` at startup | That class or method name does not exist. Check it in dnSpy |
| `Ambiguous match found` | Two overloads. Add the `Type[]` argument shown above |
| `NullReferenceException` inside your patch | `__instance` or one of its fields is null. Patches run in states you never see in normal play: mid-load, mid-death, on an object being destroyed |
| The game runs at 3 FPS | You patched something that runs thousands of times a second and did real work inside it |
| Works alone, breaks with another mod on | One of you returns `false`, or both of you assign `__result` instead of adjusting it |

## Rules that keep you welcome

- **Postfix by default.** Reach for a Prefix only when you need to change an argument or stop the method.
- **Adjust, never assign.** `+=`, `*=`, `Math.Min(...)`. Someone else patched this too.
- **Guard for null, always.** Your patch will run during world load and during a unit's death.
- **Cheap check first.** The first line of a hot patch should be the test that lets you `return`.
- **Patch the narrowest method that does the job.** Patching `Actor.updateStats` for one trait's speed is fine. Patching the world update to do the same thing is how a mod gets uninstalled.
- **Keep your patches in one file.** When somebody reports a conflict you want to read one file, not twelve.

> [!NOTE] Patching a library's `has`, `get`, `add`, `clone` or `post_init` is pointless
> It only affects calls made after your mod loads, never the vanilla registration that already happened by then. See **[Asset libraries](#/nml/asset-libraries)**.

## What we are not covering

**Transpilers** rewrite a method's compiled instructions one at a time. They are genuinely powerful, they are how you change a number buried in the middle of a method that exposes nothing, and they break on almost every game update. If you ever reach the point of needing one, you will not need this page :PES5_BigBrain:.
