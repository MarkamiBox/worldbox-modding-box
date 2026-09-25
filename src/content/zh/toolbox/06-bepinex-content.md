---
title: 用 BepInEx 添加内容
group: BepInEx Modding
icon: :wbhammer:
order: 2
---

# 用 BepInEx 添加内容 :wbhammer:

BepInEx 插件也能像任何 NML mod 一样添加特质（trait）、物品（item）和神力（GodPower）。只不过 NML 默默替你做的三件事，它得自己动手：等游戏准备好、加载文本、加载美术资源。本页用 **[自定义特质](#/nml/custom-traits)** 页面里同一个 **Swift** 特质把三件事都做一遍，方便你逐行对比。

如果你还没有项目，请从 **[BepInEx 模组开发](#/toolbox/bepinex-modding)** 开始。

## 正确的时机

插件的 `Awake()` 运行得非常早，那时 WorldBox 连一个资产库（library）都还没建。`AssetManager.traits` 还是 null，碰它就是 `NullReferenceException`，连主菜单都还没出现。

你要的时机是 `AssetManager.init()` 结束的那一刻。这一个公开方法会建好所有库，然后对每个库运行 `post_init()` 和 `linkAssets()`。在它上面加一个 Harmony Postfix，就会紧接着运行，这也正是 NML mod 的 `OnModLoad` 所在的位置。NML 页面里所有"游戏在启动时做了这件事，那时你的 mod 还不存在，所以你得自己做"的说法，在这里一字不差地适用。

## 代码

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

构建、启动游戏、打开一个单位，Swift 就会出现在 `physique` 标签页里，带着名字、描述和图标。

> [!NOTE] `LocalizedTextManager.instance.language` 是 internal
> 能编译是因为 **[BepInEx 模组开发](#/toolbox/bepinex-modding)** 里的项目把游戏公开化（publicize）了。没有 publicizer 的话，你得自己记住当前语言。

## 三件事，逐个来

### 等游戏准备好

| NML | BepInEx |
| --- | --- |
| 库准备好时 `OnModLoad()` 会运行 | 在 `AssetManager.init()` 上加 Postfix |
| NML 保证它只运行一次 | 你自己负责：如果 `Awake()` 已经调用过，`done` 标记会阻止第二次运行 |

如果你在错误的时机注册东西，日志会告诉你：指向 `AssetManager.<某某>` 的 `NullReferenceException` 就是太早了。

### 文本

NML 会读取你的 `Locales/` 文件夹，并在每次切换语言时重新应用。在 BepInEx 里这两件事都得你自己做，而 `setLanguage` 上的补丁是大家都会忘的部分：英文下一切正常，玩家切到意大利语，你的特质突然就叫 `trait_hello_swift` 了 :wbfacepalm:。

键名和指南其他地方完全一样，所以 **[本地化](#/nml/localization)** 页面里的表格照样适用。`LocalizedTextManager.add` 会像游戏自己的文件那样，把键转成 snake_case。

### 你自己的美术资源

BepInEx 里没有 `GameResources/` 文件夹。有的是 `SpriteTextureLoader.addSprite(path, bytes)`：它从任意位置读取一张 PNG，用你想要的任何路径注册，轴心居中，按像素画方式过滤。之后 `path_icon = "ui/Icons/iconHelloSwift"` 就能像找原版贴图一样找到它。

两条规则：

- **在任何东西请求这个路径之前注册。** 游戏会记住它查找过的每个路径，连失败的也记，而 `addSprite` 会拒绝一个已经记住的路径。放在 `Register()` 的最开头是安全的。
- **它是一张图，不是一个帧文件夹。** 图标、物品图标和神力按钮都是单张图片，所以没问题。指南里标注为**文件夹**的东西（掉落物动画、状态效果、投射物、地块、建筑贴图）都是用 `getSpriteList()` 加载的，而 `addSprite` 不会填充它。这些就借用原版路径，或者把那部分做成 NML mod。

把 PNG 放在你的 `.dll` 旁边：

```text
worldbox/
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

想让构建时也复制它，在 `.csproj` 的 `CopyToGame` 目标里加一行：

```xml HelloBepInEx.csproj
<Copy SourceFiles="iconHelloSwift.png" DestinationFolder="$(GameDir)\BepInEx\plugins\$(AssemblyName)\" />
```

## 从 NML 搬不过来的东西

有些页面依赖 BepInEx 里不存在的 NML 工具。替代做法如下：

| NML 页面用到 | 在 BepInEx 里 |
| --- | --- |
| `Locales/` 文件夹 | 上面的 `AddText()` 写法 |
| `GameResources/` | 单张图片用 `SpriteTextureLoader.addSprite`，文件夹用原版路径 |
| `TabManager`、`PowerButtonCreator`（神力按钮） | 没有对应物。自己用 Unity 搭界面，或者把按钮放进一个 NML mod |
| `ModConfig` 设置窗口 | BepInEx 的 `Config.Bind()`，在 `.cfg` 文件里编辑 |
| 自定义存档数据 | 游戏自己单位上的 `data.set` / `data.get` 用法一样，见 **[保存数据](#/nml/saving-data)** |
| 重载按钮 | 没有。关闭、构建、启动 |

凡是普通的游戏代码，也就是每一页的大部分内容，都能原样使用：资产、属性、状态、Harmony 补丁、AI、世界法则。

出问题时，**[调试与发布](#/toolbox/bepinex-publishing)** 收集了你最可能遇到的错误。
