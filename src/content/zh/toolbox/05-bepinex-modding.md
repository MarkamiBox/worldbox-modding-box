---
title: BepInEx 模组开发
group: BepInEx Modding
icon: :PES5_BigBrain:
order: 1
---

# BepInEx 模组开发 :PES5_BigBrain:

这份指南大部分内容教你为 **NeoModLoader** 写 mod。用 NML，你在记事本里写普通的 `.cs` 文件，启动游戏，代码就会自动编译。

BepInEx 才不管你的感受 :PES2_Shrug:。它是老牌的、通用的 Unity 模组框架。写 BepInEx mod 意味着搭一个真正的 C# 项目，自己编译 `.dll`，然后放进 `BepInEx/plugins/`。你会失去即时热重载和方便的资产（asset）工具，但能在游戏还没意识到自己醒来之前，就完全掌控 Unity 进程。

指南的这一部分有三页：这一页让插件跑起来，**[用 BepInEx 添加内容](#/toolbox/bepinex-content)** 让它往游戏里加真正的东西，**[调试与发布](#/toolbox/bepinex-publishing)** 把它交到别人手上。

## BepInEx 还是 NeoModLoader

在花一下午搭构建流程之前，先选对工具：

| 你想要... | 选 | 原因 |
| --- | --- | --- |
| 添加特质（trait）、物品（item）、神力（GodPower）、生物或群系 | **NML** | NML 免费给你：正确时机的 `AssetManager`、`Locales` 文件夹、`GameResources/`、按钮和存档工具 |
| 做开发者工具、叠加界面或引擎钩子 | **BepInEx** | BepInEx 在 Mono 层启动，早于 WorldBox 初始化 |
| 只用记事本改代码然后保存 | **NML** | NML 在运行时编译 C# 源文件 |
| 发布一个预编译的、只用 Unity 组件的插件 | **BepInEx** | 编译选项、依赖和构建目标都由你自己掌控 |

如果你要加游戏内容，就写 NML mod。如果你在做 UnityExplorer 这样的工具，或者真心喜欢看终端里的 MSBuild 输出，那 BepInEx 就是你的归宿。用 BepInEx *也能*加内容，下一页会讲怎么做，但 NML 白送的东西你得自己手搓。

## 1. 准备工作

1. 安装 **BepInEx 5 (Mono x64)**，并按照 **[实时控制台（BepInEx）](#/toolbox/bepinex-console)** 里的说明打开控制台。启动一次游戏，让 BepInEx 创建它的文件夹。
2. 安装 **[.NET SDK](https://dotnet.microsoft.com/)**（或装了 .NET 桌面开发的 Visual Studio）。BepInEx 插件需要真正的 C# 编译器。

## 2. 搭建项目

在你存放项目的文件夹里打开终端，新建一个类库：

```bash
dotnet new classlib -n HelloBepInEx
cd HelloBepInEx
```

然后把 `HelloBepInEx.csproj` 的内容全部换成下面这些。它使用和游戏相同的 .NET 版本，只需写一次 WorldBox 文件夹路径，并且每次构建都会替你做三件事：

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

每一部分的作用：

- 每个游戏引用上的 **`Private="false"`**：构建输出不会把游戏的整个引擎复制一份进去 :PESgn_SMH:。
- **`Publicize="true"`**：指南里的 NML 页面经常用到游戏的 `internal` 成员，因为 NML 是对着"公开化"（publicized）的游戏编译的。你的 BepInEx 项目默认不会这样，除非你要求。加上这个，同样的代码在这里也能编译。`PackageReference` 里的版本号是我写这页时最新的稳定版；如果 NuGet 报错，就用它提供的最新版。
- **`UnityEngine*.dll`**：Unity 被拆成很多模块文件。`Input` 在 `UnityEngine.InputLegacyModule.dll` 里，界面在 `UnityEngine.UI.dll` 里，等等。全部引用可以省掉找"类型不存在"的麻烦。
- **`CopyToGame`**：不用再手动复制 `.dll`。构建、启动游戏，完事。

## 3. 插件骨架

BepInEx 插件是一个继承 `BaseUnityPlugin` 并带有 `[BepInPlugin]` 特性的类：

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

### 逐个拆解

- **`BaseUnityPlugin`**：直接继承 Unity 的 `MonoBehaviour`。你的插件是挂在一个常驻 `GameObject` 上的活动组件，切换场景也不会消失。
- **`[BepInPlugin(guid, name, version)]`**：告诉 BepInEx 你的 mod 叫什么、唯一标识是什么。用反向域名格式（`com.author.modname`），并且发布后永远不要改 GUID：配置文件和其他插件的依赖都靠它。
- **`[BepInProcess("worldbox.exe")]`**：只在 WorldBox 里加载。这里无害，还能避免有人把你的插件放进别的游戏的 BepInEx 里时出现莫名其妙的崩溃。
- **`Logger.LogInfo()`**：直接输出到 BepInEx 的实时控制台，并写入 `BepInEx/LogOutput.log`。
- **`Config.Bind()`**：创建一个带类型的设置项。插件第一次运行时，BepInEx 会生成一个干净的 `BepInEx/config/com.example.hellobepinex.cfg` 文件，玩家可以编辑。

## 4. 用 Harmony 挂钩游戏

在 BepInEx 里，Harmony 直接自带在 `BepInEx/core/0Harmony.dll`。在项目任意位置加一个补丁类：

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

因为 `Plugin.cs` 调用了 `harmony.PatchAll()`，Harmony 会扫描你编译出的程序集，应用里面所有的补丁类。你在 **[Harmony 补丁](#/nml/harmony-patches)** 里学到的一切在这里同样适用：神奇的参数名、Prefix 和 Postfix、不要破坏其他 mod 的规则。

## 5. 构建与部署

在命令行编译项目：

```bash
dotnet build -c Release
```

你的 `.dll` 会生成在 `bin/Release/net472/HelloBepInEx.dll`，`CopyToGame` 这一步会把它直接放进游戏：

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

打开控制台启动游戏。你会看到 BepInEx 找到并加载了你的程序集：

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

> [!WARNING] 构建前先关闭游戏
> WorldBox 运行时会占用你的 `.dll`，复制步骤会报错 "the process cannot access the file"。关游戏、构建、再启动。这就是 BepInEx 的整个开发循环 :PES2_Weary:。

## BepInEx 模组开发的残酷真相

- **没有热重载**：改一行代码就得关掉 WorldBox、运行 `dotnet build`、再启动游戏。如果你在调战斗平衡或特质数值，很快就会烦。**[调试与发布](#/toolbox/bepinex-publishing)** 里有一个半解决方案。
- **`HideManagerGameObject`**：在 `BepInEx/config/BepInEx.cfg` 的 `[Chainloader]` 下设置 `HideManagerGameObject = true`。不设的话，Unity 的某些清理流程可能会销毁 BepInEx 的根对象，悄无声息地干掉你的插件 :PES5_Hmmmm:。
- **与 NML 共存**：NML 和 BepInEx 可以和平共处在同一个游戏文件夹里。内容 mod 用 NML，UnityExplorer 这类开发工具用 BepInEx，互不打架。
- **访问游戏资产**：你的插件醒来时，游戏还没建好它的资产库（library）。在 `Awake()` 里碰 `AssetManager` 只会拿到 null。下一页 **[用 BepInEx 添加内容](#/toolbox/bepinex-content)** 会告诉你挂钩的准确时机。
