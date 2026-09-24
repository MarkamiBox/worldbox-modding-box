---
title: BepInEx modding
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx modding  :PES5_BigBrain: 

Most of this guide teaches you how to write mods for **NeoModLoader**. NML lets you write plain `.cs` files in Notepad, start the game, and watch your code compile automatically.

BepInEx does not care about your feelings :PES2_Shrug:. It is the veteran, universal Unity modding framework. Writing a BepInEx mod means setting up a proper C# project, compiling your own `.dll`, and dropping it into `BepInEx/plugins/`. You lose the instant hot-reload and the easy asset helpers, but you gain total control over the Unity process before the game even knows it is awake.

## BepInEx vs NeoModLoader

Before you spend an afternoon setting up a build pipeline, pick the right tool for the job:

| You want to... | Pick | Why |
| --- | --- | --- |
| Add traits, items, god powers, creatures, or biomes | **NML** | NML gives you `AssetManager`, auto-localized text, sprites, and save-data helpers for free |
| Build developer tools, overlays, or engine hooks | **BepInEx** | BepInEx boots at the Mono runtime level before WorldBox initializes |
| Edit code with just Notepad and press save | **NML** | NML compiles C# source files at runtime |
| Ship a precompiled binary plugin with raw Unity components | **BepInEx** | You control the compiler flags, dependencies, and build target yourself |

If you are adding game content, write an NML mod. If you are building a tool like UnityExplorer, or you really enjoy watching MSBuild output in your terminal, BepInEx is where you belong.

## 1. Prerequisites

1. Install **BepInEx 5 (Mono x64)** and turn on the console as explained on **[The live console (BepInEx)](#/toolbox/bepinex-console)**.
2. Install the **[.NET SDK](https://dotnet.microsoft.com/)** (or Visual Studio with .NET desktop development). You need a real C# compiler for BepInEx plugins.

## 2. Setting up the project

Open a terminal in a folder where you keep your projects and generate a new class library:

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

Open `HelloBepInEx.csproj` in your editor and reference the game and BepInEx assemblies:

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

Adjust the paths if your Steam library is on another drive. Setting `<Private>false</Private>` on references ensures your build output does not copy the game's entire engine into your release folder :PESgn_SMH:.

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
- **`[BepInPlugin(guid, name, version)]`**: tells BepInEx what your mod is called and its unique identifier. Follow reverse-domain naming (`com.author.modname`).
- **`Logger.LogInfo()`**: streams directly into the live BepInEx console and writes to `BepInEx/LogOutput.log`.
- **`Config.Bind()`**: creates a typed setting entry. The first time your plugin runs, BepInEx generates a clean `BepInEx/config/com.example.hellobepinex.cfg` file that players can edit.

## 4. Hooking the game with Harmony

In BepInEx, Harmony is bundled right in `BepInEx/core/0Harmony.dll`. Add a patch class anywhere in your project:

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

Because `Plugin.cs` called `harmony.PatchAll()`, BepInEx scans your compiled assembly and applies all patch attributes automatically on start.

## 5. Building and deploying

Compile your project from the command line:

```bash
dotnet build -c Release
```

Your compiled `.dll` is created at `bin/Release/net472/HelloBepInEx.dll`.

1. Go to your WorldBox folder: `C:\Program Files (x86)\Steam\steamapps\common\worldbox\`.
2. Inside `BepInEx/plugins/`, create a folder named `HelloBepInEx`.
3. Copy `HelloBepInEx.dll` into `BepInEx/plugins/HelloBepInEx/`.

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

## Hard truths about BepInEx modding

- **No hot reload**: changing a line of code means closing WorldBox, running `dotnet build`, and launching the game again. If you are tuning combat balance or trait numbers, this gets old fast.
- **`HideManagerGameObject`**: in `BepInEx/config/BepInEx.cfg`, ensure `HideManagerGameObject = true` is set. Without it, some Unity cleanup routines can destroy BepInEx's root object and kill your plugin quietly :PES5_Hmmmm:.
- **Playing alongside NML**: NML and BepInEx live happily in the same game folder. You can run NML for your content mods and BepInEx for development tools like UnityExplorer without them fighting each other.
- **Accessing game assets**: BepInEx runs at the raw Unity layer. If you want to spawn creatures, register items, or edit traits from a BepInEx plugin, you must wait until WorldBox finishes initializing its `AssetManager`, or reference `NeoModLoader.dll` and let NML do the heavy lifting.
