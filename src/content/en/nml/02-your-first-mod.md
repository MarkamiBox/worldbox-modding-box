---
title: Your first mod
group: NML Modding
subgroup: Core Workflow
icon: :wbchosen:
order: 22
---

# Your first mod :wbchosen:

Everything in this guide is built on **one single mod**. We start it here, and every later page adds one file to it.

By the end HelloBox has about twenty files in it, and you will have written every line yourself: an actor trait and a culture trait with a tab of their own, a weapon and an enchantment for it, a status effect, drops, a cloud, a tile, a food recipe, a projectile, a world law, a god power with its own button, a window, a settings panel, a building, a faction, a creature, a disaster, its own AI, and a Harmony patch to bend a rule the game thought was settled.

That is more than any real mod needs, which is the point. You take the two or three parts you actually wanted and delete the rest :PES4_DeleteThis:.

The mod is called **HelloBox**. Let's make it exist.

> [!NOTE] Never written code before?
> That is fine. Read the "what this line does" bullets under each block and copy the code exactly. Programming is 90% copying something that works and changing one thing at a time :PES2_Legit:.

> [!TIP] Or start from the template
> If you would rather not create the files by hand, take the empty scaffold and skip to step 4. Reading the next three steps is still worth it: they explain what is inside it.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">Download the empty mod template</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code>, and the folders NML looks for. Nothing else.</span>
>   </span>
> </a>

## 1. Make the folder

Go to your WorldBox folder (the one with `worldbox.exe`), open `Mods/`, and create a folder called `HelloBox`. Inside it, create one folder called `Code`.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- your mod
        ├── mod.json       <- the ID card (next step)
        └── Code/          <- your .cs files live here
```

## 2. The ID card: mod.json

Create a file called `mod.json` in `HelloBox/` and paste this. Change `author` to your name.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** is what players see in the mod list.
- **`GUID`** is a unique id. Use `com.yourname.hellobox` and never change it again.

Without this file, NML acts like your mod does not exist :pepeno:.

> [!WARNING] Notepad will try to name it `mod.json.txt`
> In the Save dialog, set **Save as type** to **All Files (\*.\*)** before typing the name. Then check it in Explorer: if you cannot see the `.json` part, turn on **View → File name extensions** so Windows stops hiding them. A file called `mod.json.txt` is invisible to NML, and this catches nearly everybody once :PESgn_Oops:.

## 3. The code: Main.cs

Create `Code/Main.cs` and paste this:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### What each line does

- **`using NeoModLoader.api;`**: "I want to use NML's tools in this file". Without it, the computer does not know what `BasicMod` is.
- **`namespace HelloBox`**: a surname for your code, so your `Main` never collides with somebody else's `Main`.
- **`public class Main : BasicMod<Main>`**: your mod. The `: BasicMod<Main>` part means "I am an NML mod, give me the free stuff" (logging, settings, translations).
- **`protected override void OnModLoad()`**: the door NML knocks on when the game starts. Everything your mod sets up goes inside these `{ }`.
- **`LogInfo(...)`**: prints a line to the log with your mod's name attached. This is how you find out whether any of this worked.

## 4. Run it

Start WorldBox and open the **Mods** window from the main menu. **HelloBox** should be in the list, and already switched on. A mod you put in `Mods/` yourself is enabled the first time NML finds it.

That window is also where you turn a mod **off** later. Clicking the icon toggles it, and most mods only notice after a restart.

> [!WARNING] No Mods window at all? Experimental Mode is off
> NML only loads mods when **Settings -> Experimental Mode** is on, and the game **turns it off by itself after every WorldBox update**: it compares the saved `last_used_version` with the version you just launched and, when they differ, writes the flag back to `false`. So "my mod worked yesterday and I changed nothing" is almost always this. Turn it back on and restart.

> [!TIP] Not in the list at all?
> Then NML never saw it. Nine times out of ten that is `mod.json.txt` instead of `mod.json`, or the folder sitting somewhere other than `worldbox\Mods/`. Full list on **[Troubleshooting](#/troubleshooting)**.

## 5. Check it ran

Your line should now be in the log:

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

To find that file, paste this into the Windows Explorer address bar:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

Open `Player.log` in Notepad and press **Ctrl+F** for `HelloBox`.

If you see that line, you are a modder now :PESgn_Congrats:. If you don't, go to **[Logs & debugging](#/nml/logs-and-debugging)**, that page exists exactly for this moment.

## 6. How every later page fits in

From here on, each page gives you **one new file** in `Code/` and **one new line** in `OnModLoad`. The pattern is always the same:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // added by the Custom traits page
    HelloItems.Initialize();    // added by the Custom items page
    // ...and so on
}
```

Each new file looks like this, always:

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // the code from that page goes here
        }
    }
}
```

> [!TIP] One thing at a time
> Add one file, start the game, check the log, then move on. If you add five things at once and the game breaks, you have five suspects. If you add one, you have one :aPES_Detect:.
