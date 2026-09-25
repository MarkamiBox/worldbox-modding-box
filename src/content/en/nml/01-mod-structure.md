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

## How a mod is organised

```text
HelloBox/
├── mod.json          <- The ID card of your mod (mandatory)
├── icon.png          <- The preview mod icon
├── Code/             <- The folder where you put your horrible code
├── Locales/          <- Text and translation files (en.json, etc.)
└── GameResources/    <- Custom textures, icons, pixel art and sounds
```

Every mod needs `mod.json`. HelloBox also needs its C# entry point. Make the other folders when you actually need them. A mod with just `mod.json` and `Code/` is a real mod. Empty folders impress nobody.

#### What each folder does

- **`mod.json`**: The ID card. Without this, NML will pretend your mod doesn't even exist.
- **`icon.png`**: The preview image displayed in the in-game mod menu.
- **`Code/`**: The folder where you put all your `.cs` source code files (like `Main.cs`). NML actually compiles any `.cs` file it finds anywhere in your mod, subfolders included (skipping `bin/`, `obj/`, `Properties/`, `packages/` and any folder whose name starts with a dot). So `.cs` files sitting loose next to `mod.json` work too, and some mods do that, but putting them in `Code/` is how you keep your project from turning into a landfill. **NML compiles source when needed and can reuse its compiled cache.** You do not need a separate build step for this guide.
- **`Locales/`**: Where your translation files live (like `en.json`). Without this, all your items and traits will show up in-game as raw placeholder keys.
- **`GameResources/`**: All your custom textures, pixel art, trait icons, weapon sprites and sounds. The name has to be exactly that, it is the one NML looks for. See **[Sprites & resources](#/nml/sprites-and-resources)**.

> [!WARNING] Folder names are case-sensitive, just not on your PC
> Windows does not care whether you wrote `Locales` or `locales`. Linux does. NML looks for `Locales` and `GameResources` spelled exactly like that, so a mod that works for you can have no text and no sprites for somebody else. Match the capitals above and the problem never exists.

#### Folders you will meet in other people's mods

You do not need any of these to start. You will see them when you open somebody else's mod, so here is what they are.

| Folder | What it does |
| --- | --- |
| `Assemblies/` | Third-party managed libraries for source mods. NML collects `.dll` files directly inside this folder as compiler references and attempts to load them. This is not a place for game or NML DLLs |
| `GameResourcesReplace/` | NML loads it exactly like `GameResources/`, right after it. NML files the name under NCMS compatibility. In a new mod, just use `GameResources/` |
| `EmbededResources/` | Yes, misspelled, and it has to be. Files in there are packed into an **NCMS-style** mod's compiled code. The checked source compiler reads it only on its NCMS compatibility branch. It is not automatic embedding for HelloBox's `BasicMod` code. `EmbeddedResources/` is not the folder name used by that branch |

#### Shipping a `.dll` instead of source

In the checked loader, a file ending in `.dll` **directly next to `mod.json`** selects the precompiled route. NML skips source compilation and loads the root DLLs. Put your compiled HelloBox DLL there and leave `Code/` out of the release. See **[Publishing your mod](#/nml/publishing)** for build and packaging checks.

> [!WARNING] One stray .dll turns off your code
> This is also why a library dropped next to `mod.json` "breaks" a source mod: NML sees the `.dll`, skips `Code/`, and none of your changes ever load. Libraries go in `Assemblies/`, never in the mod root.


### The manifest

The `mod.json` file is required by NeoModLoader to identify your mod :pepeOK:. It sits right in the root of your mod folder.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### What do these fields mean?

| Field | What it does |
| --- | --- |
| `name` | Display name, here `HelloBox` |
| `author` | Your name |
| `version` | Release version. Bump it when you publish |
| `description` | Short description |
| `iconPath` | Icon path relative to the mod folder |
| `GUID` | Stable identity. NML normalises it into `UID`; for this example, `COM_YOURNAME_HELLOBOX`. Keep it unchanged after release |
| `RepoUrl` | Repository or support URL metadata. Check its display in the NML version you ship against |
| `Dependencies` | Required mod IDs. The documented source workflow requires them to compile successfully |
| `OptionalDependencies` | Optional mod IDs. NML can provide their references and compiler symbols during source compilation |
| `IncompatibleWith` | Conflict declarations. Do not assume identical enforcement across loader versions |
| `UsePublicizedAssembly` | Defaults to `true` in the checked loader. Adds NML's publicised game assembly reference during source compilation |

> [!WARNING] Check conflict handling before filling the list
> The bundled docs describe `IncompatibleWith` as unfinished. The installed loader has a removal pass which removes a mod with a non-empty list before looking up the listed IDs. Leave the example empty. Test your exact loader with the conflicting mod both present and absent before shipping a declaration.

#### ModType and targetGameBuild

The checked enum contains `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX` and `RESOURCE_PACK`. The default is `NEOMOD`; root DLL detection selects `COMPILED_NEOMOD`.

An enum name is not a working recipe. The checked `LoadMod` method handles the two NeoMod types and rejects the other values on that route. Leave `ModType` out of HelloBox's manifest. This guide does not claim that setting `RESOURCE_PACK` alone creates a working texture pack.

`targetGameBuild` has a JSON mapping in the assembly, but the checked file-based constructor does not copy it into the active declaration. Do not use it as a compatibility gate. State the game build and NML version you tested in your release notes.

#### Manifest keys are not interchangeable

The checked declaration maps `GUID` to its runtime `UID`. It has no mappings for `id`, `mainClass`, `modLoader`, `gameVersion` or `homepage`, and its file-based constructor does not consume those keys. They are not substitutes for the fields above.

NML finds a suitable entry-point type in the assembly. A `mainClass` string does not select it. Keep the manifest small instead of importing another loader's schema.

#### Dependency symbols

For the **ASCII IDs used here**, NML uppercases letters and replaces punctuation with underscores: `com.yourname.hellobox-extra` becomes `COM_YOURNAME_HELLOBOX_EXTRA`. Do not extend that rule to every Unicode character; the checked normaliser preserves some of them.

During source compilation, NML defines an optional dependency's symbol when that ID has an entry in its compiler-reference map. Installation alone is not the test. It can also retry a failed compilation without optional dependencies.

> [!WARNING] A misspelled symbol silently removes code
> An unknown `#if` symbol is false. Check the dependency ID, the `OptionalDependencies` list and the normalised symbol. A successful compilation does not prove your integration was included.

See **[Working alongside other mods](#/nml/other-mods)** for a complete example and the separate runtime check.

#### Things that break a mod folder

- **Shipping game or loader DLLs.** Do not include `Assembly-CSharp.dll`, its publicised copy, `NeoModLoader.dll`, Unity DLLs or other DLLs copied from the game's `Managed/` folder. Reference local copies when building; keep them out of the zip. NML's additional-library loader has special cases and deduplication, so copying a DLL is not a reliable way to replace the loaded version.
- **Nested manifests.** NML first checks the mod folder's own `mod.json`. Only if it is absent does it search below that folder. With multiple nested matches, the checked loader warns and uses the first result. Do not depend on that order. Ship one manifest at `HelloBox/mod.json`.
- **Source backups inside the mod.** A `dist/`, `backup/` or `old/` folder can contribute duplicate C# classes to source compilation. Keep release staging and backups outside the installed mod.
- **Hardcoded paths.** Inside your `BasicMod` class, use `GetDeclaration().FolderPath` and `Path.Combine` for packaged files. The game's `StreamingAssets/mods` directory is the native loader location, not HelloBox's folder.
- **Paths which escape the package.** Use relative icon and resource paths with matching capitalisation. Do not ship absolute paths or `..` segments. `Path.Combine` joins paths; it does not check that player-supplied input stays inside your folder.

> [!NOTE] What was checked
> Folder and compiler behaviour here was traced through the installed NML assembly, file version `1.2.0.1`, informational commit `cd47a1a6c437718d38e8f29240bdb761d543e09a`, alongside the bundled NML docs. This is not a promise about every release.


## Some nerd stuff :elpepehacker:

Every mod needs one C# file that says "hi, I am a mod". This is the whole thing:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
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
- **`namespace HelloBox`**: A surname for your code. Somebody else's mod can also have a `Main` class, and the namespace is what keeps the two from colliding.
- **`public class Main`**: In C#, all code lives inside "classes". A class is just a blueprint or a recipe with a name.
- **`: BasicMod<Main>`**: your mod's official badge. It tells NML *"I am a legitimate mod"*, and in exchange NML hands you logging, settings, staged loading and translations for free. The `<Main>` bit just repeats your own class name. Yes, that is odd looking, and yes, you always write it that way.
- **`protected override void OnModLoad()`**: The big moment. When WorldBox boots, NML knocks on this door once. Everything your mod sets up (traits, items, powers) goes inside these `{ }`.
- **`LogInfo(...)`**: Prints a line to the log with your mod's name already attached. This is how you find out whether any of this worked. See **[Logs & debugging](#/nml/logs-and-debugging)**.

> [!TIP] The long way round
> You will see older mods written like this instead. Yes, I am old enough to remember when this was normal:
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
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` is the raw interface, and `BasicMod<T>` is a ready-made class that implements it and adds the convenient parts. Both work. Use `BasicMod` unless you have a reason not to, and now you know what the other one is when you see it in somebody's source :PES5_Noted:.

## Next step

You have seen the shape. Now build one for real: **[Your first mod](#/nml/your-first-mod)**. 
