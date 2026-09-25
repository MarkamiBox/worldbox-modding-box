---
title: Debugging & publishing
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# Debugging & publishing :wbfireworks:

Your plugin builds. Now it has to load, work, and reach other people. This page is the errors you will actually meet, in the order you meet them, and then how to ship the thing.

## Where to look

| File | Where | What it is |
| --- | --- | --- |
| The console window | Opens with the game, if you turned it on | Everything, live. See **[The live console (BepInEx)](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | The same thing, saved. This is the one people ask you for |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Unity's own log, for crashes BepInEx did not catch |

Search `LogOutput.log` for your plugin's name first. The first error that mentions it is the one that matters, same rule as in **[Logs & debugging](#/nml/logs-and-debugging)**.

## When it does not build

| Error | What it means | Fix |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | Your PC has no .NET Framework 4.7.2 developer pack | The `Microsoft.NETFramework.ReferenceAssemblies` package from the **[project setup](#/toolbox/bepinex-modding)** |
| `CS0246: The type or namespace name 'Input' could not be found` | A Unity module is not referenced | Reference `UnityEngine*.dll`, not just `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | You used an `internal` game member | `Publicize="true"` on the `Assembly-CSharp` reference |
| `The process cannot access the file ... because it is being used by another process` | The game is running and holds your `.dll` | Close WorldBox, build again |
| `Could not find a part of the path` in the copy step | `GameDir` in your `.csproj` is wrong | Point it at the folder that has `worldbox.exe` in it |

## When it builds but does not load

Start the game and look for a `Loading [YourPlugin 1.0.0]` line. No line means BepInEx never picked your plugin up:

| What you see | Why |
| --- | --- |
| No line at all | The `.dll` is not inside `BepInEx/plugins/`, or BepInEx itself is not running (no console, no `LogOutput.log`) |
| No line, and the `.dll` is in the right place | The project targets the wrong framework. It must be `net472`, not `net8.0` or `netstandard2.1` |
| The line is there, then `Could not load file or assembly 'Something'` | You use a library that is not shipped with your plugin. Put its `.dll` next to yours in the plugin folder |
| Two plugins with the same GUID | BepInEx loads only one. Usually an old copy of your own plugin in another folder |

## When it loads but breaks

| Error | What it usually is |
| --- | --- |
| `NullReferenceException` at `AssetManager...` | You touched the game's libraries too early. Use the Postfix on `AssetManager.init()` from **[Adding content from BepInEx](#/toolbox/bepinex-content)** |
| `HarmonyException` / `Ambiguous match found` | A patch points at a method that does not exist or has twins. Same fixes as **[Harmony patches](#/nml/harmony-patches)** |
| `MissingMethodException` / `TypeLoadException` after a game update | The game changed under you. Walk through **[Updating after a game update](#/nml/game-updates)**, then rebuild |
| Your text shows raw keys after switching language | The Postfix on `LocalizedTextManager.setLanguage` is missing |
| Your icon is invisible | The sprite was registered after something already asked for its path, or it points at a folder |
| Everything works, then the plugin stops mid-game | `HideManagerGameObject = true` in `BepInEx/config/BepInEx.cfg` |

## A faster loop

Closing and reopening WorldBox for every change is the worst part of BepInEx. The **ScriptEngine** plugin from the BepInEx.Debug collection softens it: plugins placed in `BepInEx/scripts/` instead of `plugins/` can be reloaded with a hotkey while the game runs (check its readme for the current key).

It is great for tools, windows and overlays. For content it helps less: the game does not forget a trait you already registered, and every Harmony patch you applied stays applied unless your plugin removes it when it is unloaded (`harmony.UnpatchSelf()` in `OnDestroy()`). Use it while you build a UI, not while you tune a trait :PES2_Shrug:.

## Publishing

### What goes in the zip

Build the plugin in Release mode, then zip it so players can extract it straight into their game folder:

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

What does **not** go in:

- **BepInEx itself.** Players install it once, the same way you did. Link them to the **[console page](#/toolbox/bepinex-console)** and say which version: BepInEx 5, Mono, x64.
- **The game's files.** `Assembly-CSharp.dll`, the Unity modules, and especially the publicized copy the build made. They are the game's code, not yours to share. `Private="false"` in the `.csproj` already keeps them out of your build folder, so just do not add them by hand.
- **`BepInEx.dll` and `0Harmony.dll`.** BepInEx already has them.

### The version number

Bump it in two places, and keep them the same: the `version` in `[BepInPlugin]` (what the log and other plugins see) and `<Version>` in the `.csproj` (what the `.dll` file says). A plugin that logs `1.0.0` on its third release makes every bug report harder.

### Depending on another plugin

If your plugin needs another BepInEx plugin loaded first, say so, and BepInEx sorts the load order and refuses to load yours without it:

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

Add `BepInDependency.DependencyFlags.SoftDependency` as a second argument when the other plugin is optional and you only want to load after it if it is there.

### Where to upload

The same places as any other WorldBox mod, and the same advice: see **[Publishing](#/nml/publishing)**. The one extra line your description needs is "Requires BepInEx 5 (Mono x64)", right at the top. It saves you the "does not work" comments from people who installed it into an NML-only game :wbsalut:.
