---
title: Looking inside the game (UnityExplorer)
group: Overview
subgroup: External Tools & Setup
icon: :wbeyeball:
order: 6
---

# Looking inside the game :wbeyeball:

**UnityExplorer** is an in-game inspector. It lets you pause on any screen, click on any window, button or unit, and read every value it has, live.

Why you want it: instead of guessing what a vanilla window is made of, you open it and *look*. Every "how did they do that?" question becomes a two minute answer.

## Install it

1. Get **BepInEx** working first, see **[The live console](#/toolbox/bepinex-console)**.
2. Download [**UnityExplorer for BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) (grab the `UnityExplorer.BepInEx5.Mono.zip` file from the releases page).
3. Extract the zip into  `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`. Make sure both `UnityExplorer.BIE5.Mono.dll` and its companion dependency `UniverseLib.Mono.dll` are placed inside!
4. Start the game and press **F7** (the default toggle key).

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## The three panels you will actually use

| Panel | What it is for |
| --- | --- |
| **Object Explorer → Scene Explorer** | The live tree of everything on screen. Your window is in here somewhere |
| **Inspector** | Click any object in the tree, see every component and every field, with the current values |
| **C# Console** | Type a line of C# and run it against the live game. No restart |

## Example 1: find out how a vanilla window is built

You want your own window to look like the game's. So:

1. In game, open the window you like (World Laws, for example).
2. Press F7, go to **Object Explorer → Scene Explorer**, and expand `CanvasMain` → `canvas_ui`.
3. Click through the children until the highlighted object is the window you opened.
4. In the Inspector, read its components: the `Image` with its nine-sliced sprite, the `RectTransform` sizes, the `ScrollRect`.

Now you know the sizes, the sprite path and the structure to copy on the **[Custom windows](#/nml/custom-windows)** page. This is how you avoid guessing anchors for three hours :PES5_Peek:.

## Example 2: read an asset's real field values

Open the **C# Console** and run:

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

In the UnityExplorer log output, you'll immediately see:

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

You just read the icon path and group of a vanilla trait, straight from the running game. Copy them into your own trait and it will sit in the same place in the UI, with an icon that exists.

## Example 3: test an idea before writing a mod for it

Still in the C# console:

```csharp UnityExplorer C# console
// spawn a wolf on the tile at x=100, y=100
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

If it works here, it will work in your mod. If it throws here, you just saved yourself a compile-and-restart cycle :aPES2_ThumbsUp:.

> [!TIP] Use it together with the console
> UnityExplorer answers "what is this made of?". The BepInEx console answers "did my code run?". Almost every modding problem is one of those two questions.
