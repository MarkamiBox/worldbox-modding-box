---
title: Adding content from BepInEx
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Adding content from BepInEx :wbhammer:

A BepInEx plugin can add traits, items and powers like any NML mod. It just has to do by hand the three jobs NML quietly does for you: wait for the game, load the text, and load the art. This page does all three for the same **Swift** trait the **[Custom traits](#/nml/custom-traits)** page builds, so you can compare the two line by line.

If you have not set up a project yet, start at **[BepInEx modding](#/toolbox/bepinex-modding)**.

## The right moment

Your plugin's `Awake()` runs very early, before WorldBox has built a single asset library. `AssetManager.traits` is still null there, and touching it is a `NullReferenceException` before the main menu even shows up.

The moment you want is the end of `AssetManager.init()`. That one public method builds every library, then runs every library's `post_init()` and `linkAssets()`. A Harmony Postfix on it runs right after, which is exactly where an NML mod's `OnModLoad` lives too. Everything the NML pages say about "the game did this at startup, before your mod existed, so do it yourself" applies here word for word.

## The code

```csharp Plugin.cs
using System.IO;
using BepInEx;
using HarmonyLib;

namespace HelloBepInEx
{
    [BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public static HelloPlugin Instance;

        /** The folder your .dll sits in, for loading your own files. */
        public static string Folder => Path.GetDirectoryName(Instance.Info.Location);

        private void Awake()
        {
            Instance = this;
            new Harmony("com.example.hellobepinex").PatchAll();

            // Installed while the game was already running? The libraries exist, go now.
            if (InitLibraries.initiated) HelloContent.Register();
        }
    }

    [HarmonyPatch(typeof(AssetManager), nameof(AssetManager.init))]
    public static class AssetsReadyPatch
    {
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.Register();
    }

    [HarmonyPatch(typeof(LocalizedTextManager), nameof(LocalizedTextManager.setLanguage))]
    public static class LanguagePatch
    {
        // setLanguage throws the whole text table away and reloads it from the game files,
        // so our lines have to go back in after every language change.
        [HarmonyPostfix]
        public static void Postfix() => HelloContent.AddText();
    }
}
```

```csharp HelloContent.cs
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace HelloBepInEx
{
    public static class HelloContent
    {
        public const string SWIFT = "hello_swift";
        private const string ICON = "ui/Icons/iconHelloSwift";
        private static bool done;

        /** Text per language. English is the fallback for everything else. */
        private static readonly Dictionary<string, Dictionary<string, string>> Text =
            new Dictionary<string, Dictionary<string, string>>
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Swift",
                    ["trait_hello_swift_info"] = "Moves like the world owes it money."
                },
                ["it"] = new Dictionary<string, string>
                {
                    ["trait_hello_swift"] = "Rapido",
                    ["trait_hello_swift_info"] = "Si muove come se il mondo gli dovesse dei soldi."
                }
            };

        public static void Register()
        {
            if (done) return;
            done = true;

            // 1. The art, before anything asks for it. See "Your own art" below.
            string png = Path.Combine(HelloPlugin.Folder, "iconHelloSwift.png");
            if (File.Exists(png)) SpriteTextureLoader.addSprite(ICON, File.ReadAllBytes(png));

            // 2. The trait: exactly the Custom traits page, nothing BepInEx-specific.
            if (!AssetManager.traits.has(SWIFT))
            {
                ActorTrait swift = new ActorTrait
                {
                    id = SWIFT,
                    needs_to_be_explored = false,
                    path_icon = ICON,
                    group_id = "physique",
                    rate_birth = 0,
                    can_be_given = true,
                    can_be_removed = true
                };
                AssetManager.traits.add(swift);
                swift.base_stats["speed"] = 20f;
            }

            // 3. The text for the language that is already loaded.
            AddText();
        }

        public static void AddText()
        {
            if (LocalizedTextManager.instance == null) return;

            string lang = LocalizedTextManager.instance.language;
            if (!Text.TryGetValue(lang, out Dictionary<string, string> lines)) lines = Text["en"];

            foreach (KeyValuePair<string, string> line in lines)
            {
                // pReplace: true, or a second call logs "Already exists" for every line
                LocalizedTextManager.add(line.Key, line.Value, pReplace: true);
            }
        }
    }
}
```

Build it, start the game, open a unit, and Swift is in the `physique` tab with its name, description and icon.

> [!NOTE] `LocalizedTextManager.instance.language` is internal
> It compiles because the project from **[BepInEx modding](#/toolbox/bepinex-modding)** publicizes the game. Without the publicizer you would have to remember the language yourself.

## The three jobs, one by one

### Waiting for the game

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` runs when the libraries are ready | A Postfix on `AssetManager.init()` |
| NML makes sure it runs once | Your job: the `done` flag stops a second run if `Awake()` already called it |

If you register something at the wrong moment, the log tells you: a `NullReferenceException` pointing at `AssetManager.<something>` means too early.

### Text

NML reads your `Locales/` folder and re-applies it on every language change. In BepInEx you do both yourself, and the patch on `setLanguage` is the part everybody forgets: everything works in English, the player switches to Italian, and your trait is suddenly called `trait_hello_swift` :wbfacepalm:.

The key names are the same as everywhere else in the guide, so the table on **[Localization](#/nml/localization)** still applies. `LocalizedTextManager.add` turns the key into snake_case for you, like the game's own files.

### Your own art

There is no `GameResources/` folder in BepInEx. What there is, is `SpriteTextureLoader.addSprite(path, bytes)`: it reads a PNG from anywhere and registers it under any path you like, with a centre pivot and pixel-art filtering. After that, `path_icon = "ui/Icons/iconHelloSwift"` finds it like a vanilla sprite.

Two rules:

- **Register it before anything asks for that path.** The game remembers every path it has looked up, even a failed one, and `addSprite` refuses a path that is already remembered. Doing it at the top of `Register()` is safe.
- **It is one image, not a folder of frames.** Icons, item icons and power buttons are single images, so they work. Anything the guide marks as a **folder** (drop animations, status effects, projectiles, tiles, building sprites) is loaded with `getSpriteList()`, which `addSprite` does not fill. For those, borrow a vanilla path, or make that part of your mod with NML.

Put the PNG next to your `.dll`:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

To have the build copy it too, add a line to the `CopyToGame` target in your `.csproj`:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## What does not carry over from NML

Some pages lean on NML helpers that do not exist in BepInEx. Here is what to do instead:

| NML page uses | In BepInEx |
| --- | --- |
| `Locales/` folder | The `AddText()` pattern above |
| `GameResources/` | `SpriteTextureLoader.addSprite` for single images, vanilla paths for folders |
| `TabManager`, `PowerButtonCreator` (power buttons) | No equivalent. Build the UI yourself with Unity, or make the buttons part of an NML mod |
| `ModConfig` settings window | BepInEx's `Config.Bind()`, edited in the `.cfg` file |
| Custom save data | The game's own `data.set` / `data.get` on units work the same, see **[Saving data](#/nml/saving-data)** |
| Reload button | None. Close, build, start |

Everything that is plain game code, which is most of every page, works unchanged: assets, stats, statuses, Harmony patches, AI, world laws.

When it breaks, **[Debugging & publishing](#/toolbox/bepinex-publishing)** has the errors you are most likely to meet.
