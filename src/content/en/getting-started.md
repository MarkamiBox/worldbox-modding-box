---
title: Getting started
group: Overview
icon: :wbsalut:
order: 3
---

# Getting started :wbsalut:

What you need before writing your first line of code. Do these in order, it takes about fifteen minutes.

> [!NOTE] You do not need to know how to code yet
> And you do **not** need Visual Studio, a compiler, or any of that. NML reads the `.cs` text files in your mod folder and compiles them for you every time the game starts. **Notepad is a perfectly valid way to write your first mod** :PES_OkHand:. You can upgrade your tools later, once you actually miss something.

## 1. Find your WorldBox folder

You will be told to put files "in the WorldBox folder" about forty times in this guide, so find it once now:

**Steam → right-click WorldBox → Manage → Browse local files.**

An Explorer window opens on the folder that contains `worldbox.exe`. On most PCs that is:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Leave that window open, or pin it somewhere. Whenever this guide says *the WorldBox folder*, it means that one :gatoxd:.

## 2. Turn on Experimental Mode

Mods do not load without it. Not "work badly". They do not load at all: no error, nothing.

In game: open **Settings**, find **Experimental Mode**, turn it on. After every game update, check it again: the game switches it off by itself when the version changes.

## 3. Install NeoModLoader

**NML** is the thing that finds your mod, compiles it and runs it. Without NML there is no modding. Never done this before? **[Install NML](#/install-nml)** has every click written down, Mac included.

1. Download the latest `NeoModLoader.dll` from the [NML releases page](https://github.com/WorldBoxOpenMods/ModLoader/releases). One file, that is all you need.
2. In your WorldBox folder, go into `worldbox_Data\StreamingAssets\Mods/`.
3. Drop `NeoModLoader.dll` in there.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- here
```

Start the game. If it worked, there is a new button with the NML logo among the tabs at the bottom, and an empty `Mods` folder next to `worldbox.exe`. If there is not, re-check step 2 :PES5_Hmmmm:.

> [!TIP] Let Steam keep it updated
> There is also an [NML item on the Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469). Subscribing to it does not install NML on its own, but it does keep your copy up to date after you have done the manual install above.

## 4. A text editor

Anything that saves plain text works. In rough order of "nice to have":

| | |
| --- | --- |
| **Notepad** | Already on your PC. Genuinely enough for your first mod |
| **[VS Code](https://code.visualstudio.com/)** | Free, light, colours your code, tells you about typos. The sweet spot for most people |
| **Visual Studio** | The big one. Autocompletes game methods if you point it at the game's `.dll`. Overkill until you are writing a lot |

Whatever you pick: when you save a `.cs` file, make sure it is saved as `.cs` and **not** `.cs.txt`. Notepad does that to people :PESgn_SMH:.

## 5. That is it, go make something

Go to **[Mod structure](#/nml/mod-structure)** in the NML Modding section, then **[Your first mod](#/nml/your-first-mod)** :gatoxd: !

---

## Things to install later, not now

You do **not** need these to write a mod. Come back when a page tells you to.

- **[The live console (BepInEx)](#/toolbox/bepinex-console)**: a black window that prints your log lines while you play, instead of you opening a log file after. Get this one fairly early, it saves real time.
- **[UnityExplorer](#/toolbox/unity-explorer)**: click on anything in the game and read what it is made of.
- **[dnSpy or ILSpy](#/toolbox/reading-the-game-code)**: opens the game's own code so you can read how the developers did something.
- **[AssetRipper](#/toolbox/getting-the-sprites)**: pulls the game's sprites and sounds out so you can match their style.

> [!WARNING] NCMS is deprecated :sadcat:
> NCMS is no longer updated. Every guide here targets NML. You can still technically write a mod for NCMS, but nobody does that anymore :PES2_Shrug:.
