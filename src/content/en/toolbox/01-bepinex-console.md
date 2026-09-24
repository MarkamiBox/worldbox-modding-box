---
title: The live console (BepInEx)
group: Overview
subgroup: External Tools & Setup
icon: :wbvideo:
order: 5
---

# The live console :wbvideo:

Opening `Player.log` in Notepad after every test is painful. (I do that ngl  :23062-durrr: ) **BepInEx** gives you a black console window that prints while the game runs, so your log line appears the moment your code runs it.

This is a ten minute setup you do once, and then keep for the rest of your modding life.

## What BepInEx is

A mod loader that hooks into Unity games before they start. WorldBox modders use it for three things: the live console, **[UnityExplorer](#/toolbox/unity-explorer)**, and standalone **[BepInEx modding](#/toolbox/bepinex-modding)**. NML can install it for you when a mod needs it, but doing it yourself means you control the settings.

## Install it

1. On the [official BepInEx releases page](https://github.com/BepInEx/BepInEx/releases), scroll to **Assets** and take the file named `BepInEx_win_x64_5.4.x.x.zip`. That exact shape: **win**, **x64**, **5**. The `x86`, `unix`, `macos` and `BepInEx 6 / IL2CPP` builds all look tempting and none of them work here :PES5_Dumb:.
2. Right-click the zip → **Properties** → tick **Unblock** if that checkbox is there, then unzip it **into the WorldBox folder**, the one with `worldbox.exe` (default Steam path: `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, or right-click WorldBox in Steam → **Manage** → **Browse local files**). You should end up with:

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **Start the game once and close it.** This first run is what generates the config files. Nothing visible happens, that is normal :hmm:.

## Turn the console on

Open `BepInEx/config/BepInEx.cfg` in any text editor, find the `[Logging.Console]` section, and set:

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

Start the game again. A second window opens next to it, and it is already printing.

## Reading it

Right now, even without any mods created yet, launching the game will show BepInEx and NeoModLoader booting up:

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

If you see these lines, congratulations, your live console is up and running!

Later, once you write your first mod in the **[Your first mod](#/nml/your-first-mod)** guide, you will see your own mod compiling and greeting you right in the flood:

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

Three habits that make the console actually useful:

- **Prefix every log** with your mod name, like `[MyMod]`, so you can find your own lines instantly.
- **Log at the start and the end** of each setup step. If you see "registering traits" but never "traits registered", you know exactly where it died.
- **Keep the console on a second monitor** (or half the screen). Watching a line appear the instant you click a button is the fastest debugging there is  :memes: .

## How you will use it (Quick preview)

Once you set up your mod files in **[Your first mod](#/nml/your-first-mod)**, you can add live logs to test game events:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // Left mouse button, once per click
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

Every click prints a line in the console the instant it happens. That instant feedback loop is why BepInEx is so essential!
