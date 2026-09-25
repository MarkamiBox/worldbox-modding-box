---
title: BepInEx modding
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx modding  :PES5_BigBrain: 

Most of this guide teaches you how to write mods for **NeoModLoader**. NML lets you write plain `.cs` files in Notepad, start the game, and watch your code compile automatically.

BepInEx does not care about your feelings :PES2_Shrug:. It is the veteran, universal Unity modding framework. Writing a BepInEx mod means setting up a proper C# project, compiling your own `.dll`, and dropping it into `BepInEx/plugins/`. You lose the instant hot-reload and the easy asset helpers, but you gain total control over the Unity process before the game even knows it is awake.

This part of the guide has three pages: this one gets a plugin running, **[Adding content from BepInEx](#/toolbox/bepinex-content)** makes it add real things to the game, and **[Debugging & publishing](#/toolbox/bepinex-publishing)** gets it to other people.

## BepInEx vs NeoModLoader

Before you spend an afternoon setting up a build pipeline, pick the right tool for the job:

| You want to... | Pick | Why |
| --- | --- | --- |
| Add traits, items, god powers, creatures, or biomes | **NML** | NML gives you `AssetManager` at the right moment, a `Locales` folder, `GameResources/`, buttons and save-data helpers for free |
| Build developer tools, overlays, or engine hooks | **BepInEx** | BepInEx boots at the Mono runtime level before WorldBox initializes |
| Edit code with just Notepad and press save | **NML** | NML compiles C# source files at runtime |
| Ship a precompiled binary plugin with raw Unity components | **BepInEx** | You control the compiler flags, dependencies, and build target yourself |

If you are adding game content, write an NML mod. If you are building a tool like UnityExplorer, or you really enjoy watching MSBuild output in your terminal, BepInEx is where you belong. You *can* add content from BepInEx, the next page shows how, but you rebuild by hand what NML hands you for free.

## 1. Prerequisites

1. Install **BepInEx 5 (Mono x64)** and turn on the console as explained on **[The live console (BepInEx)](#/toolbox/bepinex-console)**. Start the game once, so BepInEx creates its folders.
2. Install the **[.NET SDK](https://dotnet.microsoft.com/)** (or Visual Studio with .NET desktop development). You need a real C# compiler for BepInEx plugins.

## 2. Setting up the project

Open a terminal in a folder where you keep your projects and generate a new class library:

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

Then replace everything in `HelloBepInEx.csproj` with this. It targets the same .NET version as the game, points at your WorldBox folder once, and does three jobs for you on every build:

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

What each part is for:

- **`Private="false"`** on every game reference: your build output does not copy the game's entire engine into your release folder :PESgn_SMH:.
- **`Publicize="true"`**: the guide's NML pages use `internal` game members all the time, because NML compiles against a publicized game. Your BepInEx project does not, unless you ask. With this, the same code compiles here too. The version numbers in `PackageReference` were the newest stable ones when I wrote this; if NuGet complains, take the newest it offers.
- **`UnityEngine*.dll`**: Unity is split into many module files. `Input` lives in `UnityEngine.InputLegacyModule.dll`, the UI in `UnityEngine.UI.dll`, and so on. Referencing them all saves you the "type not found" hunt.
- **`CopyToGame`**: no more copying the `.dll` by hand. Build, start the game, done.

## 3. The plugin skeleton

A BepInEx plugin is a class inheriting from `BaseUnityPlugin` decorated with the `[BepInPlugin]` attribute:

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

### Breaking down the parts

- **`BaseUnityPlugin`**: inherits directly from Unity's `MonoBehaviour`. Your plugin is an active component attached to a persistent `GameObject` that survives scene loads.
- **`[BepInPlugin(guid, name, version)]`**: tells BepInEx what your mod is called and its unique identifier. Follow reverse-domain naming (`com.author.modname`), and never change the GUID after release: the config file and other plugins' dependencies are keyed on it.
- **`[BepInProcess("worldbox.exe")]`**: only load inside WorldBox. Harmless here, and it saves a confusing crash if someone drops your plugin into another game's BepInEx.
- **`Logger.LogInfo()`**: streams directly into the live BepInEx console and writes to `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: creates a typed setting entry. The first time your plugin runs, BepInEx generates a clean `BepInEx/config/com.example.hellobepinex.cfg` file that players can edit.

## 4. Hooking the game with Harmony

In BepInEx, Harmony is bundled right in `BepInEx/core/0Harmony.dll`. Add a patch class anywhere in your project:

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

Because `Plugin.cs` called `harmony.PatchAll()`, Harmony scans your compiled assembly and applies every patch class in it. Everything you know from **[Harmony patches](#/nml/harmony-patches)** works the same here: the magic parameter names, Prefix and Postfix, the rules about not breaking other mods.

## 5. Building and deploying

Compile your project from the command line:

```bash
dotnet build -c Release
```

Your `.dll` is built at `bin/Release/net472/HelloBepInEx.dll`, and the `CopyToGame` step drops it straight into the game:

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

Start the game with the console enabled. You will see BepInEx find and load your assembly:

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] Close the game before you build
> While WorldBox runs, it holds your `.dll` open, and the copy step fails with "the process cannot access the file". Close the game, build, start it again. That is the whole BepInEx development loop :PES2_Weary:.

## Hard truths about BepInEx modding

- **No hot reload**: changing a line of code means closing WorldBox, running `dotnet build`, and launching the game again. If you are tuning combat balance or trait numbers, this gets old fast. There is a partial way around it on **[Debugging & publishing](#/toolbox/bepinex-publishing)**.
- **`HideManagerGameObject`**: in `BepInEx/config/BepInEx.cfg`, set `HideManagerGameObject = true` under `[Chainloader]`. Without it, some Unity cleanup routines can destroy BepInEx's root object and kill your plugin quietly :PES5_Hmmmm:.
- **Playing alongside NML**: NML and BepInEx live happily in the same game folder. You can run NML for your content mods and BepInEx for development tools like UnityExplorer without them fighting each other.
- **Accessing game assets**: your plugin wakes up before the game has built its asset libraries. Touch `AssetManager` in `Awake()` and you get nulls. The next page, **[Adding content from BepInEx](#/toolbox/bepinex-content)**, shows the exact moment to hook.
