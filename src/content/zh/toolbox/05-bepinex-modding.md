---
title: BepInEx 模组开发
group: 概览
subgroup: 外部工具与环境配置
icon: :csharp:
order: 9
---

# BepInEx 模组开发 :csharp:

本指南的大多数章节都在教你如何为 **NeoModLoader** 开发模组。NML 允许你在记事本里直接编写 `.cs` 源码文件，启动游戏即可实时自动编译。

而 BepInEx 可不会照顾你的小情绪 :PES2_Shrug:。它是 Unity 领域老牌且通用的底层模组加载框架。开发 BepInEx 模组意味着你需要搭建一个正经的 C# 工程，自行编译生成 `.dll` 二进制文件并放入 `BepInEx/plugins/` 目录。虽然你失去了 NML 的热重载与便捷的资源管理 API，但你获得了在 WorldBox 甚至还没意识到自己已启动之前就接管 Unity 进程的底层掌控力。

## BepInEx 与 NeoModLoader 对比

在花费一整个下午配置编译环境前，先挑对适合你需求的工具：

| 开发目标 | 推荐选择 | 核心理由 |
| --- | --- | --- |
| 添加特质、装备、神力、生物或地形群落 | **NML** | NML 开箱即用提供 `AssetManager`、多语言支持、贴图加载与存档扩展存储 |
| 制作开发者工具、UI 悬浮窗或引擎级底层 Hook | **BepInEx** | BepInEx 在 Mono 运行时级别加载，早于 WorldBox 的主逻辑初始化 |
| 只用记事本写代码，保存即生效 | **NML** | NML 在运行时自动调用 Roslyn 编译源码 |
| 分发包含原生 Unity 组件的预编译二进制插件 | **BepInEx** | 你可以完全自主控制编译器标志、项目依赖项与构建目标 |

如果是为游戏添加玩法内容，直接使用 NML。如果是开发类似 UnityExplorer 的底层辅助工具，BepInEx 才是最佳战场。

## 1. 前置准备

1. 按照 **[实时控制台 (BepInEx)](#/toolbox/bepinex-console)** 的教程安装 **BepInEx 5 (Mono x64)** 并开启日志控制台。
2. 安装 **[.NET SDK](https://dotnet.microsoft.com/)**（或安装带 .NET 桌面开发组件的 Visual Studio）。开发 BepInEx 插件需要真正的 C# 编译器。

## 2. 创建并配置项目

在终端中进入你的工作目录，创建一个新的类库项目：

```bash
dotnet new classlib -n HelloBepInEx -f net472
cd HelloBepInEx
```

在代码编辑器中打开 `HelloBepInEx.csproj`，配置对游戏核心程序集与 BepInEx 的引用：

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

如果你的 Steam 游戏安装在其他盘符，请相应调整路径。将引用的 `<Private>false</Private>` 属性设为 false，可以避免将游戏自带的巨大引擎程序集重复复制到最终输出目录中 :PESgn_SMH:。

## 3. 插件核心结构

一个标准的 BepInEx 插件必须继承自 `BaseUnityPlugin`，并附带 `[BepInPlugin]` 属性标记：

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
        public const string PLUGIN_GUID = "com.markami.hellobepinex";
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

### 关键代码解析

- **`BaseUnityPlugin`**：直接继承自 Unity 的 `MonoBehaviour`。你的模组类本质上是一个常驻后台且在场景切换时不被销毁的活体 `GameObject` 组件。
- **`[BepInPlugin(guid, name, version)]`**：声明模组名称与全局唯一的 GUID。通常推荐使用反向域名格式（如 `com.author.modname`）。
- **`Logger.LogInfo()`**：日志输出会实时同步刷新至黑色的 BepInEx 控制台窗口，并记录到 `BepInEx/LogOutput.log` 文件中。
- **`Config.Bind()`**：创建强类型配置项。首次运行插件时，BepInEx 会自动在 `BepInEx/config/com.markami.hellobepinex.cfg` 生成人类可读的配置文件供玩家修改。

## 4. 使用 Harmony 补丁修改游戏

BepInEx 已在 `BepInEx/core/0Harmony.dll` 中内置了 Harmony 库。直接在项目中新建补丁类：

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

由于在 `Plugin.cs` 中执行了 `harmony.PatchAll()`，BepInEx 启动时会自动扫描你的整个程序集并完成 Hook 注入。

## 5. 编译与安装运行

在终端中执行编译命令：

```bash
dotnet build -c Release
```

编译好的插件位于 `bin/Release/net472/HelloBepInEx.dll`。

1. 打开 WorldBox 游戏根目录：`C:\Program Files (x86)\Steam\steamapps\common\worldbox\`。
2. 进入 `BepInEx/plugins/` 目录，新建一个名为 `HelloBepInEx` 的文件夹。
3. 将 `HelloBepInEx.dll` 复制进 `BepInEx/plugins/HelloBepInEx/`。

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            └── HelloBepInEx.dll
```

启动游戏并观察控制台，你将看到 BepInEx 成功加载插件的信息：

```text BepInEx console
[Info   :   BepInEx] Loading [HelloBepInEx 1.0.0]
[Info   :HelloBepInEx] HelloBepInEx loaded successfully!
```

## BepInEx 开发的残酷真相

- **无热重载支持**：每次修改代码都必须完全退出游戏、重新运行 `dotnet build` 编译、然后再重新开游戏。
- **`HideManagerGameObject`**：在 `BepInEx/config/BepInEx.cfg` 中，务必将 `HideManagerGameObject = true` 打开，否则 Unity 的清理机制可能会静默销毁 BepInEx 管理器导致插件停止运作 :PES5_Hmmmm:。
- **与 NML 完美共存**：NML 与 BepInEx 可以在同一游戏目录下和平相处，完全不会相互冲突。
- **访问游戏数据资产**：BepInEx 运行在纯 Unity 层。如果要操作 WorldBox 内部的单位或装备，必须等待游戏的 `AssetManager` 完成初始化，或者直接引用 `NeoModLoader.dll`。
