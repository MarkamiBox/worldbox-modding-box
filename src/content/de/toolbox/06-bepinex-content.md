---
title: Inhalte mit BepInEx hinzufügen
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# Inhalte mit BepInEx hinzufügen :wbhammer:

Ein BepInEx-Plugin kann Merkmale (trait), Gegenstände (item) und Mächte (GodPower) hinzufügen wie jede NML-Mod. Es muss nur die drei Aufgaben von Hand erledigen, die NML still für dich übernimmt: auf das Spiel warten, den Text laden und die Grafiken laden. Diese Seite macht alle drei für dasselbe Merkmal **Swift**, das die Seite **[Eigene Merkmale](#/nml/custom-traits)** baut, damit du beide Zeile für Zeile vergleichen kannst.

Wenn du noch kein Projekt hast, fang bei **[Modding mit BepInEx](#/toolbox/bepinex-modding)** an.

## Der richtige Moment

`Awake()` deines Plugins läuft sehr früh, bevor WorldBox auch nur eine Asset-Bibliothek (library) gebaut hat. `AssetManager.traits` ist dort noch null, und es anzufassen gibt eine `NullReferenceException`, bevor überhaupt das Hauptmenü erscheint.

Der Moment, den du willst, ist das Ende von `AssetManager.init()`. Diese eine öffentliche Methode baut jede Bibliothek und ruft dann bei jeder `post_init()` und `linkAssets()` auf. Ein Harmony-Postfix darauf läuft direkt danach, genau da, wo auch `OnModLoad` einer NML-Mod läuft. Alles, was die NML-Seiten zu "das Spiel hat das beim Start gemacht, bevor deine Mod existierte, also mach es selbst" sagen, gilt hier Wort für Wort.

## Der Code

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

Bauen, Spiel starten, eine Einheit öffnen, und Swift steht im Tab `physique`, mit Name, Beschreibung und Icon.

> [!NOTE] `LocalizedTextManager.instance.language` ist internal
> Es kompiliert, weil das Projekt aus **[Modding mit BepInEx](#/toolbox/bepinex-modding)** das Spiel publicized. Ohne den Publicizer müsstest du dir die Sprache selbst merken.

## Die drei Aufgaben einzeln

### Auf das Spiel warten

| NML | BepInEx |
| --- | --- |
| `OnModLoad()` läuft, wenn die Bibliotheken bereit sind | Ein Postfix auf `AssetManager.init()` |
| NML sorgt dafür, dass es einmal läuft | Deine Aufgabe: Die Variable `done` verhindert einen zweiten Lauf, wenn `Awake()` es schon aufgerufen hat |

Wenn du etwas im falschen Moment registrierst, sagt es dir das Log: Eine `NullReferenceException`, die auf `AssetManager.<irgendwas>` zeigt, heißt zu früh.

### Text

NML liest deinen Ordner `Locales/` und wendet ihn bei jedem Sprachwechsel neu an. In BepInEx machst du beides selbst, und der Patch auf `setLanguage` ist der Teil, den alle vergessen: Auf Englisch funktioniert alles, der Spieler wechselt auf Italienisch, und dein Merkmal heißt plötzlich `trait_hello_swift` :wbfacepalm:.

Die Schlüsselnamen sind dieselben wie überall im Guide, die Tabelle auf **[Lokalisierung](#/nml/localization)** gilt also weiter. `LocalizedTextManager.add` macht den Schlüssel für dich zu snake_case, wie bei den Dateien des Spiels.

### Deine eigenen Grafiken

In BepInEx gibt es keinen Ordner `GameResources/`. Was es gibt, ist `SpriteTextureLoader.addSprite(path, bytes)`: Es liest ein PNG von irgendwo und registriert es unter jedem Pfad, den du willst, mit Pivot in der Mitte und Pixel-Art-Filterung. Danach findet `path_icon = "ui/Icons/iconHelloSwift"` es wie ein Vanilla-Sprite.

Zwei Regeln:

- **Registrier es, bevor irgendetwas nach diesem Pfad fragt.** Das Spiel merkt sich jeden Pfad, den es nachgeschlagen hat, auch einen gescheiterten, und `addSprite` lehnt einen Pfad ab, den es sich schon gemerkt hat. Ganz oben in `Register()` ist es sicher.
- **Es ist ein Bild, kein Ordner voller Frames.** Icons, Gegenstands-Icons und Macht-Buttons sind einzelne Bilder, die funktionieren. Alles, was der Guide als **Ordner** markiert (Drop-Animationen, Statuseffekte, Projektile, Kacheln, Gebäude-Sprites), wird mit `getSpriteList()` geladen, und das füllt `addSprite` nicht. Borg dir dafür einen Vanilla-Pfad, oder mach diesen Teil deiner Mod mit NML.

Leg das PNG neben deine `.dll`:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

Damit der Build es auch kopiert, füg eine Zeile zum Ziel `CopyToGame` in deiner `.csproj` hinzu:

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## Was von NML nicht mitkommt

Manche Seiten stützen sich auf NML-Helfer, die es in BepInEx nicht gibt. Das machst du stattdessen:

| Die NML-Seite benutzt | In BepInEx |
| --- | --- |
| Ordner `Locales/` | Das Muster `AddText()` von oben |
| `GameResources/` | `SpriteTextureLoader.addSprite` für einzelne Bilder, Vanilla-Pfade für Ordner |
| `TabManager`, `PowerButtonCreator` (Macht-Buttons) | Kein Gegenstück. Bau die Oberfläche selbst mit Unity, oder mach die Buttons zu einem Teil einer NML-Mod |
| Einstellungsfenster `ModConfig` | `Config.Bind()` von BepInEx, bearbeitet in der `.cfg`-Datei |
| Eigene Speicherdaten | Die spieleigenen `data.set` / `data.get` an Einheiten funktionieren genauso, siehe **[Dinge speichern](#/nml/saving-data)** |
| Reload-Button | Keiner. Schließen, bauen, starten |

Alles, was reiner Spielcode ist, und das ist der Großteil jeder Seite, funktioniert unverändert: Assets, Werte, Status, Harmony-Patches, KI, Weltgesetze.

Wenn es kaputtgeht, hat **[Debugging & Veröffentlichen](#/toolbox/bepinex-publishing)** die Fehler, denen du am wahrscheinlichsten begegnest.
