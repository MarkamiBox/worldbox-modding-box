---
title: Other mods
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbmodders:
order: 45
---

# Other mods :wbmodders:

Your mod does not live in an empty world. A player might install HelloBox next to twenty other mods, half of which are also trying to change combat, tweak world laws, or add new traits.

Sometimes you want to coordinate with them: enable extra features if a partner mod is installed, safely patch their methods without crashing if they are missing, or make sure your assets register in the right order.

There are two ways to talk to other mods: at compile time through `mod.json`, or at runtime through code.

## Declaring dependencies in mod.json

The cleanest integration is declaring the relationship in your `mod.json`:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| Key | What it does |
| --- | --- |
| `Dependencies` | Hard requirement. NML guarantees those mods load **before** yours. If any is missing or fails to compile, NML refuses to load your mod at all |
| `OptionalDependencies` | Soft requirement. If the other mod is installed, NML loads it before yours **and** defines a compiler symbol for it. If missing, your mod still loads normally |
| `IncompatibleWith` | Blocklist. If any mod in this list is present, NML flags a conflict and stops both from running together |

### The compile-time #if symbol

When a mod listed in `OptionalDependencies` is installed and compiled, NML defines a preprocessor constant for you.

The symbol is the other mod's GUID converted to uppercase, with all non-alphanumeric characters replaced by underscores:

| GUID in `mod.json` | Defined compiler symbol |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

Wrap your integration code in `#if`:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compiled only when that mod is present and active
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Safe to reference their types directly here
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] Misspelled symbols fail silently
> If you write `#if COM_FRIEND_COOL_MOD` instead of `#if COM_FRIEND_COOLMOD`, the compiler sees an undefined symbol and quietly strips your code block. It will never run, with zero errors or warnings in the log :PES4_1IQ:. Always double-check the exact GUID conversion.

## Checking at runtime

The `#if` trick only works when NML compiles your mod from source, and only when the other mod is declared in `OptionalDependencies`.

If you ship a precompiled `.dll`, or want to check for mods dynamically without recompiling, check at runtime.

### Checking loaded assemblies

You can check if the other mod's assembly is loaded into the current AppDomain:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

Or ask Harmony's `AccessTools` if one of their classes exists:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

If `AccessTools.TypeByName` returns a non-null `Type`, their code is loaded and ready.

## Harmony patching another mod

Patching a vanilla method is straightforward. Patching a method that lives in another mod has one massive trap :wbfacepalm:.

If you write a normal patch class referencing their type:

```csharp
// NEVER do this for an optional mod!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

The Mono runtime tries to resolve `PartnerMod.SomeClass` as soon as it loads your patch class. If the player does not have that mod installed, your entire mod crashes with a `TypeLoadException` or `FileNotFoundException` before your `Initialize()` even finishes!

Instead, patch it **manually** with `AccessTools`:

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // The other mod is not installed. Skip peacefully.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Runs after their method, only if their mod is installed
        }
    }
}
```

Manual patching keeps the type reference string-based, so the runtime never tries to load a missing assembly.

## The load order trap

When you clone or reference another mod's content, timing is everything.

```csharp
// If their mod hasn't run Initialize() yet, this throws NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML loads mods in dependency order. If you put the other mod in `Dependencies` or `OptionalDependencies`, NML guarantees their `Initialize()` runs **before** yours.

If you did *not* declare them as a dependency, load order between mods is unspecified. Always:
1. Declare the other mod in `OptionalDependencies`.
2. Guard with `AssetManager.traits.has(...)` before cloning or reading their assets.

## Sharing data without conflicts

WorldBox gives you flexible dictionaries for storing custom data on actors (`actor.data`) and on worlds (`World.world.map_stats.custom_data`).

Every mod shares those same dictionaries. If you write:

```csharp
// Bad: someone else might use "level" too
actor.data.set("level", 5);
```

Another mod might write to `"level"` on the same frame with completely different assumptions.

Always namespace your custom data keys with your mod prefix:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

Next: **[Publishing your mod](#/nml/publishing)** or manage simulation speed and options in **[Game options & time scales](#/nml/game-options)**.
