---
title: Logs & debugging
group: NML Modding
subgroup: Core Workflow
icon: :wbdebugburger:
order: 24
---

# Logs & debugging :wbdebugburger:

The log is the only thing in modding that always tells you the truth. It answers the one question you will ask a thousand times: **did my code actually run?**

## Printing a line

Two ways, both end up in the same file.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML: puts your mod name in front for you
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity: you add the prefix yourself
        }
    }
}
```

Not using `BasicMod`? `NeoModLoader.services.LogService` has the same `LogInfo`, `LogWarning`, `LogError`, plus `LogStackTraceAsError` for the full trace.

## What a healthy log looks like

Start the game with the mod above and search `Player.log` for `HelloBox`. You want to see something like this:

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

Line by line: NML compiled the files in `Code/`, loaded your resources, then knocked on `OnModLoad`, which printed your line. The numbered lines are NML timing each step: the number after `=` is seconds, and some of them come out red in the log. **Red here does not mean broken**, it only means that step was the slow one :hmm:.

The line that matters is your own. If `[HelloBox]: HelloBox is alive!` is missing, keep reading.

## When your code does not compile

Before your mod can run at all, NML has to build it. A typo stops it there, and it tells you exactly where:

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

Read it right to left: **`; expected`** is the problem, **`(9,42)`** is line 9, character 42, and **`Code\Main.cs`** is the file. Open that file, go to that line, put the semicolon in.

The useful line is the **first** one. `Failed to compile mod HelloBox` underneath is just the summary. People read that one, panic, and miss the answer sitting directly above it :PES4_1IQ:.

## What a broken log looks like

Once it compiles, this is the other thing you will see a lot :PES2_F::

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

Scary looking, but it is a sentence:

- **`NullReferenceException`**: you used something that was empty. 95% of the errors you will ever get.
- **`at HelloBox.HelloTraits.Initialize ()`**: the method it happened in.
- **`in HelloTraits.cs:24`**: **line 24 of your own file**. Read that line. Something on it is `null`.
- The lines below are who called who, newest first. Your own filenames are the ones worth reading.

The classic cause of exactly this one: touching `base_stats` on an asset before adding it to its library. Details on the **[Custom traits](#/nml/custom-traits)** page.

## Where the logs live

| File | Where | What it is |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | This run |
| `Player-prev.log` | same folder | The **previous** run - the one that just crashed :aPES_Flatline: |
| `logs/error_*.log` | same folder, in `logs/` | One file per error the game caught |
| `mods_config/<GUID>.config` | same folder | The player's saved settings for your mod |

Paste `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` into the Windows Explorer address bar to get there.

## A live console instead of a log file

Reading a file after the fact is slow. With **BepInEx** you get a black console window that prints while you play, so you see your line appear the instant you click your button. It takes two minutes to set up: **[BepInEx console](#/toolbox/bepinex-console)**.

Want to click on the game's own windows and read their values live? That is **[UnityExplorer](#/toolbox/unity-explorer)**.

## Don't let one broken thing kill the whole mod

`OnModLoad` runs top to bottom. If line 3 throws, lines 4 to 20 never run, and half your mod silently does not exist. Give each part its own safety net:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// Runs one step and, if it explodes, writes down which step it was and keeps going.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

Now a broken trait costs you the trait, not the mod, and the log names the guilty step:

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## Don't touch the world before it exists

`OnModLoad` runs **before** there is a world. No map, no units, nothing. Touch them there and you crash before the main menu :surprised_pikachu:. Anything that runs every frame needs a guard:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // still in the menu
    if (World.world == null || World.world.units == null) return;  // no world yet
    if (MapBox.instance == null) return;

    // from here on it is safe to touch the world
}
```

## Reloading code without restarting

Restarting WorldBox to test one changed line is most of what modding costs. Ask anybody who has done it forty times in one evening. NML can recompile your mod while the game runs, and swap in the methods you marked.

1. Your main class implements `IReloadable`, which is one method, `Reload()`. HelloBox's does, in **[The finished mod](#/nml/all-together)**.
2. The reload button only shows while `Config.isEditor` is `true`. HelloBox flips it from a `DevReload` switch that ships as `false`.
3. Mark the methods you want swapped with `[Hotfixable]`, from `NeoModLoader.api.attributes`:

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // edit this while the game runs, press reload, watch the next creature use it
}
```

Then change the method, save, and press your mod's reload button in NML's mod list. NML recompiles, patches the marked methods, and calls `Reload()`. Anything that is not marked keeps running the old code.

> [!WARNING] `Config.isEditor` is the game's own switch
> It tells WorldBox it is running inside the Unity editor, and a few systems believe it: some UI takes its phone layout, some objects destroy themselves on start. Turn it on for your own testing and never in a mod you publish.

What it cannot do: `Awake`, `Update` and other Unity callbacks, constructors, and anything the game already built from your old code. An asset registered at load time keeps the delegates it was given then, so `Reload()` is where you put them back yourself.

## The errors everybody gets

| What you see | What it means |
| --- | --- |
| Mod is not in the list | No `mod.json`, or it is not valid JSON (a comma too many :pepeclown:) |
| Mod is listed, nothing happens | `OnModLoad` threw. Search the log for your prefix, then for `Exception` |
| `Failed to compile mod ...` | A typo in your C#. The real error is the line **above** it |
| `NullReferenceException` on a new asset | You touched `base_stats` before `add()` - the library is what creates it |
| Text shows as `trait_whatever` | Missing translation, see **[Localization](#/nml/localization)** |
| Your button is an invisible hole | The sprite path is wrong, so the icon came back `null` |
| Works for you, for nobody else | You hardcoded a path with your username in it :homerhide: |
