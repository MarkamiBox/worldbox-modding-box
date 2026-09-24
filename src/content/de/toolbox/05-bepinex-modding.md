---
title: Modding mit BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding mit BepInEx :PES5_BigBrain:

Der größte Teil dieses Leitfadens erklärt dir, wie du Mods für **NeoModLoader** schreibst. Mit NML kannst du einfach `.cs`-Dateien im Editor bearbeiten, das Spiel starten und zusehen, wie dein Code automatisch kompiliert wird.

BepInEx interessiert sich nicht für deine Gefühle :PES2_Shrug:. Es ist das bewährte, universelle Unity-Modding-Framework. Eine BepInEx-Mod zu schreiben bedeutet, ein vollwertiges C#-Projekt anzulegen, eine eigene `.dll` zu kompilieren und diese in `BepInEx/plugins/` abzulegen. Du verlierst das Hot-Reloading und die vorgefertigten Asset-Hilfen, erhältst aber die volle Kontrolle über den Unity-Prozess, bevor das Spiel überhaupt weiß, dass es läuft.

## BepInEx im Vergleich zu NeoModLoader

Bevor du einen Nachmittag mit der Einrichtung einer Build-Pipeline verbringst, wähle das richtige Werkzeug:

| Du möchtest... | Wähle | Grund |
| --- | --- | --- |
| Eigenschaften (trait), Gegenstände (item), Gottkräfte, Kreaturen oder Biome hinzufügen | **NML** | NML bietet `AssetManager`, automatisch lokalisierte Texte, Sprites und Speicherhelfer frei Haus |
| Entwicklertools, Overlays oder tiefgreifende Engine-Hooks bauen | **BepInEx** | BepInEx lädt auf Mono-Ebene, noch bevor WorldBox initialisiert wird |
| Code einfach im Editor tippen und speichern | **NML** | NML kompiliert C#-Quelldateien zur Laufzeit |
| Ein vorkompiliertes Binär-Plugin mit reinen Unity-Komponenten verteilen | **BepInEx** | Du kontrollierst Compiler, Abhängigkeiten und Build-Ziele selbst |

Wenn du Spielinhalte hinzufügen möchtest, schreibe eine NML-Mod. Wenn du Tools wie UnityExplorer entwickelst, ist BepInEx deine Heimat.

## 1. Voraussetzungen

1. Installiere **BepInEx 5 (Mono x64)** und aktiviere die Konsole wie auf **[Die Live-Konsole (BepInEx)](#/toolbox/bepinex-console)** beschrieben.
2. Installiere das **[.NET SDK](https://dotnet.microsoft.com/)** (oder Visual Studio mit .NET-Desktopentwicklung). Du benötigst einen echten C#-Compiler.

## 2. Projekt einrichten

Öffne ein Terminal in deinem Projektordner und erstelle eine neue Klassenbibliothek:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Öffne `HelloBepInEx.csproj` in deinem Editor und binde die Spiel- und BepInEx-Bibliotheken ein:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
  </PropertyGroup>

  <ItemGroup>
    <!-- Game assemblies from worldbox_Data/Managed -->
    <Reference Include="Assembly-CSharp">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\Assembly-CSharp.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="UnityEngine.CoreModule">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\worldbox_Data\Managed\UnityEngine.CoreModule.dll</HintPath>
      <Private>false</Private>
    </Reference>

    <!-- BepInEx and Harmony from BepInEx/core -->
    <Reference Include="BepInEx">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\BepInEx.dll</HintPath>
      <Private>false</Private>
    </Reference>
    <Reference Include="0Harmony">
      <HintPath>C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\core\0Harmony.dll</HintPath>
      <Private>false</Private>
    </Reference>
  </ItemGroup>
</Project>
```

Passe die Pfade an, falls deine Steam-Bibliothek auf einem anderen Laufwerk liegt. `<Private>false</Private>` verhindert, dass die gesamten Unity-Bibliotheken in deinen Release-Ordner kopiert werden :PESgn_SMH:.

## 3. Das Plugin-Grundgerüst

Ein BepInEx-Plugin ist eine Klasse, die von `BaseUnityPlugin` erbt und mit dem `[BepInPlugin]`-Attribut versehen ist:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            configEnableLogs = Config.Bind(
                "General",
                "EnableLogs",
                true,
                "Print debug messages to the BepInEx console."
            );

            configHotkey = Config.Bind(
                "Controls",
                "ToggleKey",
                KeyCode.F7,
                "Key to press to trigger the plugin action."
            );

            if (configEnableLogs.Value)
            {
                Logger.LogInfo($"{PLUGIN_NAME} loaded successfully!");
            }

            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Die wichtigsten Bausteine

- **`BaseUnityPlugin`**: erbt direkt von Unitys `MonoBehaviour`. Dein Plugin ist eine aktive Komponente auf einem persistenten `GameObject`, das Szenenwechsel übersteht.
- **`[BepInPlugin(guid, name, version)]`**: teilt BepInEx den Namen deiner Mod und eine eindeutige Kennung mit. Nutze die Reverse-Domain-Notation (`com.autor.modname`).
- **`Logger.LogInfo()`**: schreibt direkt in die Live-Konsole von BepInEx und in `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: registriert typisierte Einstellungen. Beim ersten Start erzeugt BepInEx automatisch eine saubere Datei `BepInEx/config/com.example.hellobepinex.cfg`.

## 4. Das Spiel mit Harmony patchen

In BepInEx ist Harmony direkt in `BepInEx/core/0Harmony.dll` enthalten. Füge eine Patch-Klasse hinzu:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [HarmonyPatch(typeof(World), nameof(World.init))]
    public static class WorldInitPatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] World initialized from BepInEx patch!");
        }
    }
}
```

Da `Plugin.cs` die Methode `harmony.PatchAll()` aufruft, durchsucht BepInEx deine kompilierte Assembly und wendet alle Patch-Attribute automatisch an.

## 5. Bauen und installieren

Kompiliere dein Projekt über das Terminal:

```bash
dotnet build -c Release
```

Deine fertige `.dll` liegt in `bin/Release/net472/HelloBepInEx.dll`.

1. Öffne deinen WorldBox-Ordner: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Erstelle in `BepInEx/plugins/` einen Unterordner namens `HelloBepInEx`.
3. Kopiere `HelloBepInEx.dll` nach `BepInEx/plugins/HelloBepInEx/`.

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Starte das Spiel mit aktivierter Konsole. BepInEx lädt dein Plugin sofort:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## Harte Fakten über BepInEx-Modding

- **Kein Hot-Reload**: Jede Codeänderung erfordert das Schließen von WorldBox, `dotnet build` und den Neustart des Spiels.
- **`HideManagerGameObject`**: Achte in `BepInEx/config/BepInEx.cfg` darauf, dass `HideManagerGameObject = true` gesetzt ist, damit Unity das BepInEx-Root-Objekt nicht versehentlich zerstört :PES5_Hmmmm:.
- **Zusammenleben mit NML**: NML und BepInEx laufen problemlos nebeneinander im selben Spielverzeichnis.
- **Zugriff auf Spiel-Assets**: BepInEx arbeitet auf der reinen Unity-Ebene. Um WorldBox-Kreaturen oder Items zu erzeugen, musst du warten, bis der `AssetManager` initialisiert ist, oder `NeoModLoader.dll` referenzieren.
