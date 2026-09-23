---
title: Mod structure
group: NML Modding
subgroup: Core Workflow
icon: :wbsavebuttonbox:
order: 20
---

# Mod structure :wbsavebuttonbox:

## Where mods live

Every mod is **one folder** inside `Mods/`, in your WorldBox folder:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

If that `Mods` folder is not there yet, make it yourself: right-click → New → Folder, call it exactly `Mods`. You create your own mod folder inside it, and you invent that name.

## How a mod is organized

```text
MyCoolMod/
├── mod.json          <- The ID card of your mod (mandatory)
├── icon.png          <- The preview mod icon
├── Code/             <- The folder where you put your horrible code
├── Locales/          <- Text and translation files (en.json, etc.)
└── GameResources/    <- Custom textures, icons, pixel art and sounds
```

Only `mod.json` is mandatory. Make the other folders when you actually need them. A mod with just `mod.json` and `Code/` is a real mod.

#### What each folder does

- **`mod.json`**: The ID card. Without this, NML will pretend your mod doesn't even exist.
- **`icon.png`**: The preview image displayed in the in-game mod menu.
- **`Code/`**: The folder where you put all your `.cs` source code files (like `Main.cs`). **NML compiles them for you every time the game starts**, so you never build a `.dll` yourself and you never need Visual Studio.
- **`Locales/`**: Where your translation files live (like `en.json`). Without this, all your items and traits will show up in-game as raw placeholder keys.
- **`GameResources/`**: All your custom textures, pixel art, trait icons, weapon sprites and sounds. The name has to be exactly that, it is the one NML looks for. See **[Sprites & resources](#/nml/sprites-and-resources)**.


### The manifest

The `mod.json` file is required by NeoModLoader to identify your mod :pepeOK:. It sits right in the root of your mod folder.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### What do these fields mean?

- **`name`**: The friendly display name of your mod shown in the in-game mod list.
- **`author`**: Your username or nickname. Take credit for your hard work!
- **`version`**: The version number of your mod (e.g. `"0.1.0"`). Increment this whenever you release an update.
- **`description`**: A short summary of what your mod does. Shows up in the in-game mod details window.
- **`iconPath`**: The relative path to your preview icon (usually `"icon.png"` sitting right in the mod root).
- **`GUID`**: A unique id for your mod, by convention `com.yourname.modname`, all lowercase. Think of it like your mod's social security number: it stops your mod colliding with somebody else's. **Pick it once and never change it**: the player's settings file is named after it.
- **`Dependencies`**: Other mod GUIDs that MUST be installed for your mod to run. If your mod is standalone, leave it as `[]`.
- **`OptionalDependencies`**: Mods that you support if they exist, but aren't strictly required.
- **`IncompatibleWith`**: A list of mod GUIDs that break your mod if enabled together. NML will warn the player if both are active.


## Some nerd stuff :elpepehacker:

Every mod needs one C# file that says "hi, I am a mod". This is the whole thing:

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

That is not a simplified version for the guide. That is what most shipped mods actually start with.

#### Breaking down the code

- **`using NeoModLoader.api;`**: Think of this like opening your toolbox before starting a project. Instead of typing `NeoModLoader.api.BasicMod` every single time, `using` tells the computer: *"keep NML's tools ready on the table."*
- **`namespace MyCoolMod`**: A surname for your code. Somebody else's mod can also have a `Main` class, and the namespace is what keeps the two from colliding.
- **`public class Main`**: In C#, all code lives inside "classes". A class is just a blueprint or a recipe with a name.
- **`: BasicMod<Main>`**: your mod's official badge. It tells NML *"I am a legitimate mod"*, and in exchange NML hands you logging, settings and translations for free. The `<Main>` bit just repeats your own class name. Yes, that is odd looking, and yes, you always write it that way.
- **`protected override void OnModLoad()`**: The big moment. When WorldBox boots, NML knocks on this door once. Everything your mod sets up (traits, items, powers) goes inside these `{ }`.
- **`LogInfo(...)`**: Prints a line to the log with your mod's name already attached. This is how you find out whether any of this worked. See **[Logs & debugging](#/nml/logs-and-debugging)**.

> [!TIP] The long way round
> You will see older mods written like this instead:
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
> }
> ```
> `IMod` is the raw interface, and `BasicMod<T>` is a ready-made class that implements it and adds the convenient parts. Both work. Use `BasicMod` unless you have a reason not to, and now you know what the other one is when you see it in somebody's source :PES5_Noted:.

## Next step

You have seen the shape. Now build one for real: **[Your first mod](#/nml/your-first-mod)**. 
