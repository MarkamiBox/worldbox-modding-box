---
title: Install NML
group: NML Modding
icon: :wbhammer:
order: 1
---

# Install NML :wbhammer:

**NML** (NeoModLoader) is the program that makes WorldBox mods work. You install NML once, and after that installing a mod is just copying a folder.

This page assumes you have never done any of this. If you know what a `.dll` is, skip to **[the short version](#the-short-version)** :PES_OkHand:.

> [!NOTE] Windows, Mac, and Linux (Steam Deck)
> Mods work on the **Steam version for Windows, Mac, and Linux** (including Steam Deck / SteamOS). Not on phones, not on tablets, not on consoles.

## The short version

1. In game: **Settings → Experimental Mode → on**.
2. Download `NeoModLoader.dll` from the [official release page](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest).
3. Put it in `worldbox_Data/StreamingAssets/Mods/` inside your WorldBox folder.
4. Delete anything with `NCMS` in the name from that same folder.
5. Start the game. Mods now go in the `Mods` folder next to `worldbox.exe`.

That is the whole thing. The rest of the page is the same five steps, with every click written down.

---

## Windows

### Step 1. Turn on Experimental Mode

1. Start WorldBox the normal way, from Steam.
2. Open the game's **Settings** window.
3. Look through the list for **Experimental Mode** and turn it on.
4. Close the game.

Without this switch the game does not even look for mods. No error, no message, just nothing :PES5_Hmmmm:.

> [!WARNING] There are two folders called Mods
> This one, inside `worldbox_Data\StreamingAssets\Mods/`, is for **NML itself** (specifically `NeoModLoader.dll`) and nothing else. The one where you put your **mods** is a separate folder, located directly in the game root next to `worldbox.exe` (`worldbox\Mods/`). It does not exist yet; NML creates it automatically the first time you start the game. Putting a mod in `StreamingAssets\Mods/`, or NML in `worldbox\Mods/`, is the most common mistake on this page.

### Step 2. Download NML

1. Open this link: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. It always points to the newest NML, so you can bookmark it.
2. Scroll down to the section called **Assets**. If it is folded, click it to open it.
3. Click **NeoModLoader.dll**. It downloads like any other file, usually into your **Downloads** folder.

You only need that one file. The page also lists files ending in `.pdb`, `.xml` and "Source code": ignore them.

> [!WARNING] Only from that link
> A `.dll` is a program. Download NML **only** from the GitHub page above, never from a random site or a file somebody sent you in a chat. If your browser asks "keep this file?", it is asking because it is a `.dll`, and from that page the answer is keep.

### Step 3. Open the WorldBox folder

This is the folder where Steam installed the game. You never have to search for it:

1. Open **Steam** and go to your **Library**.
2. **Right-click** WorldBox in the list on the left.
3. Click **Manage**, then **Browse local files**.

A window opens with the game's files in it. You know you are in the right place if you can see a file called `worldbox` (or `worldbox.exe`) and a folder called `worldbox_Data`. On most PCs this window is:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Keep this window open. From now on, "the WorldBox folder" means this one.

> [!TIP] Make Windows show file extensions
> By default Windows hides the end of file names, so `NeoModLoader.dll` shows up as just `NeoModLoader`. That makes every guide harder to follow. In the folder window, click **View** at the top, then tick **File name extensions** (on Windows 11: **View → Show → File name extensions**). Nothing breaks, you just see the full names now.

### Step 4. Put NML in the right place

1. In the WorldBox folder, double-click **worldbox_Data**.
2. Double-click **StreamingAssets**.
3. Double-click **Mods**.
4. Now open your **Downloads** folder in a second window, and drag **NeoModLoader.dll** into this `Mods` window.

It should end up here:

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     the game's own, leave it
            └── NeoModLoader.dll     <- the one you just added
```

If you do not see `test_asset_load` in there, you are in the wrong folder. Go back to the WorldBox folder and try again.

**While you are in this folder:** if there is anything with **NCMS** in its name (for example `NCMS_memload.dll`, or a folder called `NCMS`), delete it. NCMS is the old mod loader, it is dead, and NML can already run the old NCMS mods :PES2_Shrug:.

> [!WARNING] There are two folders called Mods
> This one, inside `worldbox_Data\StreamingAssets\Mods/`, is for **NML itself** (specifically `NeoModLoader.dll`) and nothing else. The one where you put your **mods** is a separate folder, located directly in the game root next to `worldbox.exe` (`worldbox\Mods/`). It does not exist yet; NML creates it automatically the first time you start the game. Putting a mod in `StreamingAssets\Mods/`, or NML in `worldbox\Mods/`, is the most common mistake on this page.

### Step 5. Start the game and check

Start WorldBox from Steam, and give it a little longer than usual the first time.

You did it right if:

- While the world loads, the game shows the message **Experimental mode is enabled**.
- There is a new button with the **NML logo** among the tab buttons at the bottom of the screen. Click it: that is where your mod list lives.
- Back in the WorldBox folder, there is now a new, empty folder called **Mods**, right next to `worldbox.exe`.
- In `worldbox_Data\StreamingAssets\Mods/` NML made a folder called **NML** for its own stuff. Do not touch it.

If none of that happened, jump to **[It did not work](#it-did-not-work)**.

---

## Mac

The same five steps. Only the folder is hidden in a different place, because on a Mac the whole game is packed into one app icon.

1. **Experimental Mode**: exactly like Windows, **[Step 1](#step-1-turn-on-experimental-mode)**. The warning about updates applies to you too.
2. **Download** `NeoModLoader.dll` from the [same release page](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). It is the same file for Windows and Mac.
3. **Open the WorldBox folder**: Steam → Library → right-click WorldBox → **Manage → Browse local files**. A Finder window opens.
4. **Get inside the app**: right-click the **worldbox** app icon and choose **Show Package Contents**. Then open **Contents → Resources → Data → StreamingAssets → Mods**, and drag `NeoModLoader.dll` in there. Delete anything with `NCMS` in the name while you are there.
5. **Start the game** and check the same things as **[Step 5](#step-5-start-the-game-and-check)**. The new `Mods` folder for your mods appears in the WorldBox folder, next to the app, not inside it.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML goes here
└── Mods/                        <- your mods go here
```

---

## Linux & Steam Deck

The exact same logic. Steam on Linux installs the game into your user directory, and on Steam Deck you just switch to Desktop Mode first.

1. **Experimental Mode**: exactly like Windows, **[Step 1](#step-1-turn-on-experimental-mode)**.
2. **Download** `NeoModLoader.dll` from the [official release page](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest). It is the same file across all platforms.
3. **Open the WorldBox folder**:
   - **Desktop Linux**: Steam → Library → right-click WorldBox → **Manage → Browse local files**.
   - **Steam Deck**: Press the **STEAM button → Power → Switch to Desktop**. Open Steam in Desktop Mode, go to Library → right-click WorldBox (or left trackpad / trigger) → **Manage → Browse local files**.
   The folder path is usually:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **Put NML in place**: Open `worldbox_Data → StreamingAssets → Mods`, and drag `NeoModLoader.dll` in there. Delete anything with `NCMS` in the name while you are there.
5. **Start the game** (on Steam Deck, you can return to Gaming Mode) and check the same things as **[Step 5](#step-5-start-the-game-and-check)**. The new `Mods` folder for your mods appears in the main WorldBox folder, next to the executable.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## Installing a mod

Now the easy part, and the part you will do over and over.

1. Download the mod. Read its description first: some mods need something extra, and the author usually says so.
2. Su Windows: right-click it → **Extract All**. On Mac: double-click it. On Linux / Steam Deck: right-click → **Extract here** (or use Ark).
3. Drag the folder you got into **`worldbox\Mods/`**, the one next to `worldbox.exe`.
4. Start the game.

A mod folder always has a file called `mod.json` somewhere inside it. That is how NML recognises it. If the zip gave you a folder inside a folder, that is fine, NML looks inside.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] Try it with HelloBox
> Not sure it works? The mod this guide builds is a ready-made test. Download it from **[The finished mod](#/nml/all-together)**, unzip it into `Mods`, start the game. If a new power tab full of silly buttons shows up, everything is installed right :wbpeak:.

**To remove a mod**, close the game and delete its folder from `Mods`. **To turn one off without deleting it**, use the NML mod list in game.

**Workshop mods** work too: subscribe on the Steam Workshop and NML picks them up, no copying needed.

---

## It did not work

Go through these in order. The first one fixes most people.

| What you see | What to do |
| --- | --- |
| No NML button, no `Mods` folder next to `worldbox.exe` | Experimental Mode is off. Turn it on, restart. Also after every game update |
| Still nothing, Experimental Mode is on | `NeoModLoader.dll` is in the wrong folder. It must be in `worldbox_Data\StreamingAssets\Mods/`, next to `test_asset_load` |
| The file is called `NeoModLoader.dll.dll` or `NeoModLoader (1).dll` | Rename it to exactly `NeoModLoader.dll` |
| NML is there, but a mod does not show up | The mod is in the wrong `Mods`. It goes in the one next to `worldbox.exe`, as a folder with `mod.json` inside, not as a `.zip` |
| NML says a mod "has been disabled due to an error" | The mod is broken or too old for your game version. Check for an update of that mod, or ask its author |
| Everything broke right after a WorldBox update | Turn Experimental Mode back on. Then wait for your mods to update: an update of the game often breaks old mods for a few days |

Still stuck? **[Troubleshooting](#/troubleshooting)** has the long list, and **[Logs & debugging](#/nml/logs-and-debugging)** shows where the game writes down what went wrong. When you ask for help, say which mods you use, what you did right before it broke, and include the error text. "It doesn't work" is not something anybody can fix, including me :PESgn_ReadRules:.

---

## Questions people always ask

**Can I use NML and BepInEx together?**
Yes. They do not get in each other's way. Two individual *mods* can still clash, but that is the mods, not the loaders.

**The mod says it needs BepInEx, not NML.**
Then it does not go in `Mods`. Install BepInEx as shown in **[The live console (BepInEx)](#/toolbox/bepinex-console)** (Windows), start the game once, and put that mod in `BepInEx\plugins/`. The mod's description says which loader it wants.

**NML or NCMS?**
NML. NCMS stopped being updated and does not work on current versions of the game. NML runs the old NCMS mods anyway, so you lose nothing.

**Do I need to reinstall NML for every mod?**
No. Once is enough. After that, every mod is just a folder in `Mods`.

**Do I need to update NML?**
Normally no. NML checks for a new version every time the game starts and replaces itself (that is the `NeoModLoader.AutoUpdate_memload.dll` that appears next to it). If that ever fails, download the new `NeoModLoader.dll` from the same link and replace the old one by hand.

**Will mods break my saves?**
They can. A save made with a mod may not load properly once you remove that mod. Keep a copy of worlds you care about before trying something new :PES_MonkaSweat:.

Want to make mods instead of just using them? That starts at **[Getting started](#/getting-started)**.
