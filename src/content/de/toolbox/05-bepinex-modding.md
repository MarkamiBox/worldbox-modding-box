---
title: Modding mit BepInEx
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# Modding mit BepInEx :PES5_BigBrain:

Der größte Teil dieses Guides zeigt dir, wie du Mods für **NeoModLoader** schreibst. Mit NML schreibst du einfache `.cs`-Dateien im Editor, startest das Spiel und siehst zu, wie dein Code automatisch kompiliert wird.

BepInEx ist deine Gefühlslage egal :PES2_Shrug:. Es ist das alteingesessene, universelle Modding-Framework für Unity. Eine BepInEx-Mod heißt: ein richtiges C#-Projekt aufsetzen, deine eigene `.dll` kompilieren und sie in `BepInEx/plugins/` legen. Du verlierst das sofortige Neuladen und die bequemen Asset-Helfer, gewinnst aber volle Kontrolle über den Unity-Prozess, bevor das Spiel überhaupt weiß, dass es wach ist.

Dieser Teil des Guides hat drei Seiten: Diese hier bringt ein Plugin zum Laufen, **[Inhalte mit BepInEx hinzufügen](#/toolbox/bepinex-content)** lässt es echte Dinge ins Spiel bringen, und **[Debugging & Veröffentlichen](#/toolbox/bepinex-publishing)** bringt es zu anderen Leuten.

## BepInEx oder NeoModLoader

Bevor du einen Nachmittag mit einer Build-Pipeline verbringst, wähl das richtige Werkzeug:

| Du willst... | Nimm | Warum |
| --- | --- | --- |
| Merkmale (trait), Gegenstände (item), Mächte (GodPower), Kreaturen oder Biome hinzufügen | **NML** | NML gibt dir `AssetManager` im richtigen Moment, einen `Locales`-Ordner, `GameResources/`, Buttons und Speicher-Helfer gratis |
| Entwickler-Tools, Overlays oder Engine-Hooks bauen | **BepInEx** | BepInEx startet auf Mono-Ebene, bevor WorldBox sich initialisiert |
| Code nur im Editor schreiben und speichern | **NML** | NML kompiliert C#-Quelldateien zur Laufzeit |
| Ein fertig kompiliertes Plugin mit reinen Unity-Komponenten ausliefern | **BepInEx** | Du kontrollierst Compiler-Flags, Abhängigkeiten und Build-Ziel selbst |

Wenn du Spielinhalte hinzufügst, schreib eine NML-Mod. Wenn du ein Tool wie UnityExplorer baust oder MSBuild-Ausgaben im Terminal einfach liebst, gehörst du zu BepInEx. Du *kannst* auch mit BepInEx Inhalte hinzufügen, die nächste Seite zeigt wie, aber du baust von Hand nach, was NML dir schenkt.

## 1. Voraussetzungen

1. Installier **BepInEx 5 (Mono x64)** und schalt die Konsole ein, wie auf **[Die Live-Konsole (BepInEx)](#/toolbox/bepinex-console)** erklärt. Starte das Spiel einmal, damit BepInEx seine Ordner anlegt.
2. Installier das **[.NET SDK](https://dotnet.microsoft.com/)** (oder Visual Studio mit .NET-Desktopentwicklung). Für BepInEx-Plugins brauchst du einen echten C#-Compiler.

## 2. Das Projekt einrichten

Öffne ein Terminal in dem Ordner, in dem du deine Projekte aufbewahrst, und erstell eine neue Klassenbibliothek:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Ersetz dann den ganzen Inhalt von `HelloBepInEx.csproj` durch das hier. Es zielt auf dieselbe .NET-Version wie das Spiel, zeigt ein einziges Mal auf deinen WorldBox-Ordner und erledigt bei jedem Build drei Aufgaben für dich:

```xml HelloBepInEx.csproj
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net472</TargetFramework>
    <AssemblyName>HelloBepInEx</AssemblyName>
    <Version>1.0.0</Version>
    <LangVersion>latest</LangVersion>
    <!-- Your WorldBox folder. Change this one line if Steam lives on another drive. -->
    <GameDir>C:\Program Files (x86)\Steam\steamapps\common\worldbox</GameDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Lets you build for net472 without installing the old .NET Framework developer pack -->
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.3" PrivateAssets="all" />
    <!-- Makes internal and private game code visible to your compiler, like NML does -->
    <PackageReference Include="BepInEx.AssemblyPublicizer.MSBuild" Version="0.4.3" PrivateAssets="all" />
  </ItemGroup>

  <ItemGroup>
    <!-- The game, publicized -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\Assembly-CSharp.dll" Publicize="true" Private="false" />
    <!-- Every Unity module: UnityEngine.dll alone does not have Input, UI or ImageConversion -->
    <Reference Include="$(GameDir)\worldbox_Data\Managed\UnityEngine*.dll" Private="false" />
    <!-- BepInEx and Harmony -->
    <Reference Include="$(GameDir)\BepInEx\core\BepInEx.dll" Private="false" />
    <Reference Include="$(GameDir)\BepInEx\core\0Harmony.dll" Private="false" />
  </ItemGroup>

  <!-- After every build, copy the plugin straight into the game -->
  <Target Name="CopyToGame" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
  </Target>
</Project>
```

Wofür die einzelnen Teile da sind:

- **`Private="false"`** an jeder Spielreferenz: Dein Build-Ordner kopiert nicht die komplette Engine des Spiels mit :PESgn_SMH:.
- **`Publicize="true"`**: Die NML-Seiten des Guides benutzen ständig `internal`-Mitglieder des Spiels, weil NML gegen ein "publicized" Spiel kompiliert. Dein BepInEx-Projekt tut das nicht, außer du verlangst es. Hiermit kompiliert derselbe Code auch hier. Die Versionsnummern in `PackageReference` waren beim Schreiben die neuesten stabilen; wenn NuGet meckert, nimm die neueste, die es anbietet.
- **`UnityEngine*.dll`**: Unity ist in viele Moduldateien aufgeteilt. `Input` steckt in `UnityEngine.InputLegacyModule.dll`, die UI in `UnityEngine.UI.dll` und so weiter. Alle zu referenzieren erspart dir die Suche nach "Typ nicht gefunden".
- **`CopyToGame`**: Nie wieder die `.dll` von Hand kopieren. Bauen, Spiel starten, fertig.

## 3. Das Plugin-Gerüst

Ein BepInEx-Plugin ist eine Klasse, die von `BaseUnityPlugin` erbt und das Attribut `[BepInPlugin]` trägt:

```csharp Plugin.cs
using BepInEx;
using BepInEx.Configuration;
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    [BepInPlugin(PLUGIN_GUID, PLUGIN_NAME, PLUGIN_VERSION)]
    [BepInProcess("worldbox.exe")]
    public class HelloPlugin : BaseUnityPlugin
    {
        public const string PLUGIN_GUID = "com.example.hellobepinex";
        public const string PLUGIN_NAME = "HelloBepInEx";
        public const string PLUGIN_VERSION = "1.0.0";

        // BepInEx manages configuration files automatically
        private ConfigEntry<bool> configEnableLogs;
        private ConfigEntry<KeyCode> configHotkey;

        private void Awake()
        {
            // Bind configuration: section, key, default value, description
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

            // Apply any Harmony patches in this assembly
            Harmony harmony = new Harmony(PLUGIN_GUID);
            harmony.PatchAll();
        }

        private void Update()
        {
            // Standard Unity Update cycle
            if (Input.GetKeyDown(configHotkey.Value))
            {
                Logger.LogInfo("Hotkey pressed from BepInEx!");
            }
        }
    }
}
```

### Die Teile einzeln

- **`BaseUnityPlugin`**: erbt direkt von Unitys `MonoBehaviour`. Dein Plugin ist eine aktive Komponente an einem dauerhaften `GameObject`, das Szenenwechsel überlebt.
- **`[BepInPlugin(guid, name, version)]`**: sagt BepInEx, wie deine Mod heißt und welche eindeutige Kennung sie hat. Nimm die umgekehrte Domain-Schreibweise (`com.author.modname`) und ändere die GUID nach der Veröffentlichung nie: Die Config-Datei und die Abhängigkeiten anderer Plugins hängen daran.
- **`[BepInProcess("worldbox.exe")]`**: nur in WorldBox laden. Hier harmlos, und es erspart einen verwirrenden Absturz, wenn jemand dein Plugin ins BepInEx eines anderen Spiels legt.
- **`Logger.LogInfo()`**: schreibt direkt in die Live-Konsole von BepInEx und in `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: legt eine typisierte Einstellung an. Beim ersten Start erzeugt BepInEx eine saubere Datei `BepInEx/config/com.example.hellobepinex.cfg`, die Spieler bearbeiten können.

## 4. Das Spiel mit Harmony einhaken

Bei BepInEx liegt Harmony direkt in `BepInEx/core/0Harmony.dll`. Leg irgendwo in deinem Projekt eine Patch-Klasse an:

```csharp Patches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBepInEx
{
    // MapBox.startTheGame runs once the world exists: it is where the game sets Config.game_loaded
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.startTheGame))]
    public static class StartTheGamePatch
    {
        [HarmonyPostfix]
        public static void Postfix()
        {
            Debug.Log("[HelloBepInEx] The world is ready!");
        }
    }
}
```

Weil `Plugin.cs` `harmony.PatchAll()` aufgerufen hat, durchsucht Harmony deine kompilierte Assembly und wendet jede Patch-Klasse darin an. Alles, was du von **[Harmony-Patches](#/nml/harmony-patches)** kennst, funktioniert hier genauso: die magischen Parameternamen, Prefix und Postfix, die Regeln, andere Mods nicht kaputtzumachen.

## 5. Bauen und installieren

Kompilier dein Projekt in der Kommandozeile:

```bash
dotnet build -c Release
```

Deine `.dll` entsteht unter `bin/Release/net472/HelloBepInEx.dll`, und der Schritt `CopyToGame` legt sie direkt ins Spiel:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Starte das Spiel mit eingeschalteter Konsole. Du siehst, wie BepInEx deine Assembly findet und lädt:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Schließ das Spiel, bevor du baust
> Solange WorldBox läuft, hält es deine `.dll` offen, und das Kopieren scheitert mit "the process cannot access the file". Spiel schließen, bauen, wieder starten. Das ist der ganze Entwicklungskreislauf bei BepInEx :PES2_Weary:.

## Harte Wahrheiten über BepInEx-Modding

- **Kein Hot Reload**: Eine Zeile ändern heißt WorldBox schließen, `dotnet build` ausführen und das Spiel wieder starten. Wenn du Kampfwerte oder Merkmalszahlen feinjustierst, nervt das schnell. Einen halben Ausweg gibt es auf **[Debugging & Veröffentlichen](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`**: Setz in `BepInEx/config/BepInEx.cfg` unter `[Chainloader]` `HideManagerGameObject = true`. Ohne das können manche Unity-Aufräumroutinen das Wurzelobjekt von BepInEx zerstören und dein Plugin still abschalten :PES5_Hmmmm:.
- **Zusammen mit NML**: NML und BepInEx leben friedlich im selben Spielordner. Du kannst NML für deine Inhalts-Mods und BepInEx für Entwickler-Tools wie UnityExplorer benutzen, ohne dass sie sich streiten.
- **Zugriff auf Spiel-Assets**: Dein Plugin wacht auf, bevor das Spiel seine Asset-Bibliotheken (library) gebaut hat. Fass `AssetManager` in `Awake()` an und du bekommst nulls. Die nächste Seite, **[Inhalte mit BepInEx hinzufügen](#/toolbox/bepinex-content)**, zeigt den genauen Moment zum Einhaken.
