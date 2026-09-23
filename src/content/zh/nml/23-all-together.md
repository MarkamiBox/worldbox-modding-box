---
title: 完整的 Mod 整合
group: 游戏内容
subgroup: 最终完善与成就
icon: :wbpeak:
order: 222
---

# 完整的 Mod 整合 :wbpeak:

如果你一直按顺序阅读这套指南，那么从 **[你的第一个 Mod](#/nml/your-first-mod)** 开始，你就是在逐个文件地向同一个模组添砖加瓦。本页是最终的总装配：带你纵览 HelloBox 在所有部件齐全时的全貌，以及各个模块之间是如何互相调用的。

## 你做出了什么

二十来个文件，在游戏里加起来就是这些。每一行都是这份指南的一页  :wbpeak:。

| 是什么 | 在哪能看到 |
| --- | --- |
| 一个角色特质，以及一个装它的自定义标签页 | 单位检视面板，特质列表 |
| 文化、宗教、亚种、氏族、语言、王国特质 | 各自的窗口，一个系统一个 |
| 一把武器、它的附魔，以及装它们的分类 | 单位的手里，装备标签页 |
| 一个状态效果 | 生物头顶，带自己的图标 |
| 掉落物、把它们下成雨的云，还有弹射物 | 地图上、半空中、混战当中 |
| 一种地块 | 地形，压在所有东西下面 |
| 一份食物配方 | 城市的仓库 |
| 一条世界法则 | 世界法则窗口 |
| 一个神力、它的标签页和按钮 | 底部的神力栏 |
| 一个窗口 | 你决定放哪就在哪 |
| 一座建筑 | 有人盖起来之后的城市 |
| 一个王国，以及属于它的生物 | 地图上，生成和打架的时候 |
| 一场灾难 | 灾难菜单 |
| 一份自己的 AI 工作 | 那只生物，带着目的往某处走 |
| 自主决策、城镇岗位及手持工具 | 手持火把四处漫游的小精灵，每座城镇 1 名守护者 |
| 战斗动作 | 带有迅捷特质的生物在贴身近战前投掷余烬 |
| 基因、统治者性格、书籍类型、文化旗帜部件 | 基因组、领袖、图书馆、王国旗帜 |
| 外交倾向、忠诚度与幸福感事件 | 外交好感度明细与城镇忠诚度面板 |
| 阴谋策划分录 | 领袖密谋发起余烬狂欢节时的阴谋列表 |
| 世界时代与世界行为 | 时代轮盘与世界行为计时器 |
| 游戏成就 | 繁衍达到 10 只小精灵时的成就解锁窗口 |
| 画笔、悬停提示框与快捷键 | 画笔轮换、悬停动态数据显示、F6 一键呼出 |
| 一个 Harmony 补丁 | 哪儿都看不到，这正是重点：它悄悄改掉一条规则 |

## 把它带走

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">下载 HelloBox</span>
    <span class="dl-sub">做完的 mod，这一页的每个文件。解压到 <code>worldbox\Mods\</code> 然后启动游戏。</span>
  </span>
</a>

它是从这份指南的代码块生成的，所以就是你一路复制的那份代码，不是另外一份迟早会对不上的副本。读它、拆它，把你不要的那三分之二删掉。

> [!WARNING] 这是演示，不是成品
> 把 HelloBox 原样发出去帮不了任何人：那是二十个功能，每个都故意把一件小事做得马马虎虎。改掉 id，改掉名字，留下你真正想要的部分  :wbbru:。

## 项目目录结构

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs 完整全貌

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### 为什么必须遵循这个加载顺序

该文件夹中有三个文件从未出现在上述初始化列表中，而这完全符合设计：

| 文件 | 谁在调用它 |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` 会通过特性注解自动扫描并应用，你绝不需要手动调用它 |
| `HelloSettings.cs` | 当玩家在界面上拖动滑块时，配置加载器会直接向其中写入数据 |
| `HelloWindow.cs` | 当玩家第一次点击对应按钮时，由按钮事件自行构建窗口 |

你的语言文件同样不需要单独注册：NML 在叩响 `OnModLoad` 之前就已经把 `Locales/en.json` 加载完毕了，所有文本键皆已就绪。除此之外的一切都具有硬性依赖关系：

1. **先建组，后填物**：如果一个资源的 `group_id` 指向空无一物，它就没有容纳它的标签页来显示。
2. **先有水滴，后有云朵**：因为云朵在定义时必须写明它下落的坠落物名称。
3. **先有资源，后有装备与建筑**：因为后两者都需要消耗基础资源作为成本。
4. **先有附魔，后有装备**：因为武器在定义时需要列出它可能随机 roll 出来的词条池。
5. **先有王国，后有生物**：因为生物需要明确声明其野生流民状态与定居建国后的王国类型。
6. **先有神力，后有按钮**：`PowerButtonCreator` 是根据 id 查找神力的，绑定到不存在神力的按钮就是死按钮。
7. **AI 所需的一切先于 AI 注册**：因为行为任务是根据 id 去引用特质与状态的。
8. **生物资产与 AI 必须先于决策、城镇岗位及手持工具注册**，因为后者需要显式绑定已存在的生物实例与 AI 任务。
9. **世界时代必须在其效果所依赖的云朵、世界法则与状态效果之后注册**。阴谋、政治倾向与成就仅在游戏运行期进行动态检索，因此只要排在各自依赖项之后即可。

如果某样东西在游戏里神秘失踪，“我把它注册在需要它的那个东西之后了吗？”是仅次于“控制台报错了吗？”的最关键追问 :PES2_HmmmmNoted:。

## 宣告大功告成前的最终检查清单

| 检查维度 | 具体确认事项 |
| --- | --- |
| 日志 | 启动游戏搜索 `HelloBox`。必须看到 "ready"，且**绝无**任何 `Exception` 报错 |
| 文本 | 游戏内绝不能有任何地方露出形如 `trait_hello_x` 的未翻译原生键名 |
| 图标 | 底部能力栏中绝不能出现由于贴图缺失而导致的透明隐形空洞 |
| 配置 | 删除 `mods_config/<GUID>.config` 重启游戏，确认默认参数能够正确生成生效 |
| 纯净测试 | 载入全新地图，全速运行五分钟，再次仔细查阅日志输出 |
| 兼容性 | 开启几个其他热门 mod。如果你 hook 了某些方法，别人多半也 hook 了 |

全部确认无误后，请前往 **[发布你的 Mod](#/nml/publishing)**，让全世界的玩家来尽情检验你的作品 :aPES3_VictoryPog:。

## 下一步的修行方向

- 删掉 HelloBox 中你不需要的多余模块。它只是个演示，并不是一个真正的 Mod。
- 挑选出你最感兴趣的**一个**细分领域，把它做到极致。把一件事做到惊艳的 mod，远胜过把十二件事做得粗制滥造的杂乱大包。
- 深入阅读你所选领域对应的原版反编译代码（**[阅读游戏本体代码](#/toolbox/reading-the-game-code)**）。所有你尚未参透的秘密，全部白纸黑字地写在里面 :PESgn_ReadRules:。
