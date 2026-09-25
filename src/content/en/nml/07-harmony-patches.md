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
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Six things are happening:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: the address. "The method called `updateStats`, on the class called `Actor`." A line in square brackets is an *attribute*: a label the computer reads, not code that runs.
- **`public static class Patch_Actor_UpdateStats`**: a container. The name is yours and changes nothing, but future-you will thank present-you for `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: this name is **not** yours, unless you label it. Without a label Harmony looks for a method spelled exactly `Prefix`, `Postfix` or `Finalizer`. Write `postfix` and nothing happens, with no error :PESgn_ButWhy:. The fix is the label, in "Naming the patch methods yourself" below.
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

That last row is what people trip on, over and over. If the game declares `getHit(float pDamage, ...)`, your parameter must be called `pDamage`. Not `damage`, not `pDmg`. You may list only the parameters you care about and skip the rest, but the ones you list must match, and in this game they nearly all start with `p`.

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

Half the "can somebody make a mod that..." requests are one number. Nothing is impossible, somebody just has not made it yet :wbbru:. "Cities grow too big" is this, straight from the game's own `City`:

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
> It does not skip *your* version of the method. It skips the game's code **for everybody**. Every other mod's Postfix on that method still runs, reacting to a call that never happened. A vanilla method usually does five things you never read, and cancelling it silently disables all five.
>
> Before writing `return false`, check whether a Postfix would do. "Heal the damage back afterwards" breaks far less than "there was never any damage" :PES3_Balance:.

## Two ways to write the method name

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public method
[HarmonyPatch(typeof(Actor), "updateStats")]             // anything else
```

`nameof` is better, because a typo becomes a compile error instead of a patch that quietly never applies. But `nameof` only works on members your code is allowed to see, and much of WorldBox is `internal` or `private`. For those the plain string is the only option, so check the spelling against the real code in **[Reading the game's code](#/toolbox/reading-the-game-code)**.

## Naming the patch methods yourself

The magic names `Prefix` and `Postfix` are a convention, not a requirement. Put a label on the method and call it whatever you like:

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

`[HarmonyPrefix]`, `[HarmonyPostfix]` and `[HarmonyFinalizer]` all exist. With the label, the method name is just for you, and the "misspelled `Postfix`, nothing happens" problem is gone. It also lets you keep a Prefix and a Postfix for different targets in one class without the names fighting. About half the mods out there do it this way, and they are the half that never lose an evening to a lowercase `p`.

## When two methods share a name

Then class + name is ambiguous. Harmony refuses to guess and your mod dies at startup with an `AmbiguousMatchException`. `Actor` has two `addTrait` methods:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Spell out the parameter types of the one you mean, **all** of them, including the ones with a default value:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

Other real overloads that catch people: `TileZone.isGoodForNewCity()` and `isGoodForNewCity(Actor pActor)`, and `SaveManager.loadWorld()` and `loadWorld(string pPath, bool pLoadWorkshop = false)` (both `internal`, so string names only). When in doubt, search the class for the method name before you write the attribute.

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

## Properties and constructors

Not everything is a plain method. `Actor.is_moving` is a property: it looks like a field, but a `get` block runs every time somebody reads it. Tell Harmony which half you want:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

After that it is a normal patch, and `ref bool __result` is what the reader gets back. `MethodType.Setter` is the other half. `MethodType.Constructor` patches a class's constructor, where `__instance` is the object being built; if the class has several constructors, add the `Type[]` after it just like an overload.

## Private fields and methods

Your patch can see a private field of `__instance` by asking for it as a parameter: **three** underscores, then the field name exactly as the game spells it. The game starts most private fields with its own `_`, so the unit's private `_hover_timer` becomes **four**:

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref` if you want to write to it. It is fiddly to read and perfectly correct.

Outside a patch, `AccessTools` and `Traverse` (both in `HarmonyLib`) reach the same things:

```csharp
// once in a while: Traverse is short and slow
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// every frame: build the accessor once, then it is almost as fast as a normal field
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // it is a ref, so this writes

// a private method: reflection wants every argument, defaults included
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

A string names something the compiler cannot check. If an update renames `_hover_timer`, you find out at runtime. The alternative is a **publicized** `Assembly-CSharp.dll`, where `internal` and `private` become visible and a rename is a compile error again.

## Patching by hand

`[HarmonyPatch]` plus `PatchAll` is the easy way. The other way is to find the method yourself and call `Patch`:

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
            // two addTrait overloads exist, so the types are not optional
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null means an update renamed it: lose one feature, not the whole mod
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result is false when the unit already had it or an opposite blocked it
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Same Harmony id as your `PatchAll`, same rules for parameter names. What you gain is the `if` in the middle. Reach for it when:

- **The target might not exist.** A method you suspect the next update will move, or one that lives in *another mod*. `AccessTools.TypeByName("TheirNamespace.TheirClass")` returns `null` when that mod is not installed, and you simply skip the patch. See **[Other mods](#/nml/other-mods)**.
- **The patch depends on a setting.** Only patch if the player turned the feature on in **[Mod settings](#/nml/mod-config)**.
- **You want to know it worked.** A missing `PatchAll` target throws, and the patches it had not reached yet are never applied. Here, one missing method is one log line.

## When several mods patch the same method

Within each patch kind, Harmony orders patches by priority, **highest first**, with `Normal` as the default. Explicit `[HarmonyBefore]` and `[HarmonyAfter]` dependencies can change that order:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Common priorities are `First`, `High`, `Normal`, `Low`, `Last`. It matters when order changes the answer:

- A Postfix that **clamps** a result (`Mathf.Min(__result, 20)`) wants `Priority.Last`, so it normally clamps after higher-priority Postfixes. It cannot guarantee being last against another `Last` patch or explicit ordering dependencies.
- A Prefix that **checks** something and may `return false` wants `Priority.First` or `High`, so it decides early. Do not use it as a guarantee that other Prefixes will be skipped: NML ships HarmonyX, which [runs all Prefixes](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes) even when one returns `false`.

Only set it when you have a reason. If every mod asks for `First`, you are back to nobody being first :PES3_Balance:.

## Finalizers: catching what the game throws

A Finalizer runs after everything else, **even if the method threw an exception**. It gets the exception, and whatever it returns is what gets thrown:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // preserve the failure after logging it
        return __exception;
    }
}
```

This logs the failure without hiding it. Returning `null` would suppress the exception, including failures from other patches. Only do that for a specific failure you can actually recover from. A method that threw halfway has already done half its work, and swallowing the exception leaves the world in that state :PESgn_Yikes:.

## Methods mods patch most

Across the mods I went through, these come up again and again. Signatures are straight from the game code.

| Target | What to know |
| --- | --- |
| `City.update(float pElapsed)` | Public. Runs every frame for every city. Cheap check first |
| `MapBox.Update()` | **Private**, so `"Update"` as a string. Runs every frame, once. See **[Update loops](#/nml/update-loops)** before you patch it |
| `Actor.updateStats()` | **Internal**. Runs in a parallel job, see the warning at the top |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**. Every hit on every unit |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Private**, `"die"` as a string |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Public |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Public static, returns `bool`. No `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**, returns the `War` |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Public, returns the `War` |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Public. Also runs while a save loads, check `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Public |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Public static, returns the baby |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Public, returns the new `Actor`. Every spawn goes through it |

`private` and `internal` targets patch fine with a string name, and your parameters still bind by name. What you cannot do without a publicized assembly is write `nameof(...)` for them, or touch their `internal` members inside your patch body.

> [!NOTE] `World` is the holder, `MapBox` is the target
> `typeof(World)` is valid C#, even though `World` is static. It is the wrong Harmony target for `Update` or `finishMakingWorld`: those methods belong to `MapBox`, the type returned by `World.world`. A wrong target fails when Harmony applies the patch, not when C# compiles `typeof`.

## When it does not work

Before you blame Harmony, read the log. It is rarely Harmony :PES5_Noted:.

| What you see | What it usually is |
| --- | --- |
| Nothing happens, nothing in the log | `Postfix` misspelled with no `[HarmonyPostfix]` label, or you never called `PatchAll` |
| `HarmonyException` / `MissingMethodException` at startup | That class or method name does not exist. Check it in dnSpy |
| `AmbiguousMatchException` / `Ambiguous match found` | Two overloads. Add the `Type[]` argument shown above |
| Crash that only happens on other people's machines | A Postfix on `Actor.updateStats` touching Unity, `Randy` or a shared list from a worker thread |
| `NullReferenceException` inside your patch | `__instance` or one of its fields is null. Patches run in states you never see in normal play: mid-load, mid-death, on an object being destroyed |
| The game runs at 3 FPS | You patched something that runs thousands of times a second and did real work inside it |
| Works alone, breaks with another mod on | One of you returns `false`, or both of you assign `__result` instead of adjusting it |

## Rules that keep you welcome

- **Postfix by default.** Reach for a Prefix only when you need to change an argument or stop the method.
- **Adjust, never assign.** `+=`, `*=`, `Math.Min(...)`. Someone else patched this too.
- **Guard for null, always.** Your patch will run during world load and during a unit's death.
- **Cheap check first.** The first line of a hot patch should be the test that lets you `return`. `City.update` and `MapBox.Update` are the two methods mods patch most, and both run every frame. A dictionary lookup there is fine. A loop over every unit is not.
- **Patch the narrowest method that does the job.** Patching `Actor.updateStats` for one trait's speed is fine. Patching the world update to do the same thing is how a mod gets uninstalled.
- **Keep your patches in one file.** When somebody reports a conflict you want to read one file, not twelve. Be nice to future you. Do as I say, not as my old mods do :trollface:.

> [!NOTE] Patching a library's `has`, `get`, `add`, `clone` or `post_init` is pointless
> It only affects calls made after your mod loads, never the vanilla registration that already happened by then. See **[Asset libraries](#/nml/asset-libraries)**.

## Transpilers: changing the instructions

A transpiler rewrites IL, the compiled instructions inside a method. Use it when the change belongs in the middle and neither a Prefix nor a Postfix can express it. It runs when Harmony builds the replacement method, not on every game tick, and may run again when another transpiler is added.

This is the signature, inside your patch class. It deliberately passes everything through:

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

For an actual rewrite:

1. Inspect the target's IL in dnSpy. Match an opcode sequence and the specific field or method operand, not "instruction 42" or every occurrence of one number.
2. Collect matches **before** editing. Check the expected count explicitly. If you expect one and find zero or two, log the mismatch and return the untouched input. Never emit half a rewrite.
3. Preserve branch labels, exception blocks and the evaluation stack's types and balance. A replacement that looks right in C# can still be invalid IL.
4. Test the match and mismatch paths, then test with other patches on the same method.

The [Harmony transpiler docs](https://harmony.pardeike.net/articles/patching-transpiler.html) cover the instruction API. A game update is a reason to check the pattern again, not move the magic index by three :PES5_BigBrain:.

NML ships **HarmonyX**, a fork of Harmony. The core patch API is shared, but behaviour can differ, including Prefix skipping. Next stop, if more than one mod is going to touch the same thing: **[Other mods](#/nml/other-mods)**.
