---
title: 王国与阵营
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbkingdoms:
order: 178
---

# 王国与阵营 :wbkingdoms:

在 WorldBox 中，地图上的每一个单位都隶属于某个王国。绝不仅仅是文明种族：狼属于狼群王国，强盗属于强盗阵营，就连一只完全中立的野鸡也属于一个中立王国。`KingdomAsset` 是阵营的**底层类型**，而非地图上生成的某一个具体王国。

请务必分清这两者的界限：

| | |
| --- | --- |
| `AssetManager.kingdoms` 中的 `KingdomAsset` | 模板。“兽人王国具有什么通性” |
| `World.world.kingdoms` 中的 `Kingdom` | 运行中世界里拥有名称、旗帜颜色和城市的实体王国 |

你在代码中注册前者，游戏负责在世界中实例化后者。

## 克隆模板

与生物角色类似，王国也拥有一组专门为此设计的 `$TEMPLATE$` ID：

| 模板 | 适用场景 |
| --- | --- |
| `$TEMPLATE_CIV$` | 正规文明阵营 |
| `$TEMPLATE_CIV_NEW$` | 较新的动物文明风格 |
| `$TEMPLATE_NOMAD$` | 定居建城前的流浪/游牧阶段 |
| `$TEMPLATE_MOB$` | 敌对怪物阵营 |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | 对部分生物敌对，但对文明种族友好 |
| `$TEMPLATE_ANIMAL$` | 野生动物 |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | 从不主动发起攻击的温和动物 |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // 定居后的文明阵营。
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // 建城前的野外/流浪阶段。
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` 已经在内部为你设置好了 `nomads = true`、`civ = false` 以及 `mobs = true`。这里必须重点强调，因为很多人在此踩坑：**`civ`、`nomads`、`mobs` 等等是 `bool` 类型的属性字段，而不是标签（tag）。** `wild.nomads = true` 是真正的字段设置；而 `wild.addTag("nomads")` 只是一个游戏代码压根不读取的废标签，它不会报错，只会静默失效 :aPES_Liar:。

然后让你的角色资源指向它们，这也是将生物与王国绑定在一起的关键步骤：

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

若漏掉这一步，你的生物就会直接刷入其克隆母体原本所属的王国（通常是人类），引发诸多怪异现象。

## 字段详解

### 阵营基本分类

| 字段 | 作用 |
| --- | --- |
| `civ` | 建立城市、发动战争、拥有国王领袖 |
| `nomads` | 建城定居前的游荡阶段 |
| `nature` | 野生生物 |
| `mobs` | 敌对怪物 |
| `neutral` | 未被激怒前绝不主动攻击 |
| `abandoned`, `concept` | 引擎内部占位与结算阵营，并非实际种族 |
| `brain` | 由AI统一接管的元阵营（meta faction） |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | 游戏内部列表将其归入的分类组 |

### 行为表现

| 字段 | 作用 |
| --- | --- |
| `always_attack_each_other` | 该类型的任意两个王国永远处于互相敌对状态 |
| `units_always_looking_for_enemies` | 单位永不停歇地在全图巡视搜寻敌对目标 |
| `count_as_danger` | 其他阵营是否将其视为危险威胁。默认为 `true` |
| `friendship_for_everyone` | 对地图上所有的阵营均保持和平友好 |
| `force_look_all_chunks` | 单位搜索全图区块而非仅近邻区块。运算开销极大 |
| `building_attractor_id` | 能吸引该阵营单位前往的建筑类型 |

### 标签（Tag）：决定敌友关系

这是阵营交互的核心机制。它不是数值属性，而是三组字符串集合：

```csharp
kingdom.addTag("civ");             // 我的身份标识
kingdom.addFriendlyTag("neutral"); // 我视为友方的标签
kingdom.addEnemyTag("orc");        // 我视为仇敌的标签
```

两个王国通过对撞彼此的标签集合来判定默认的外交态度。一个没有任何标签的阵营谁也不亲、谁也不恨，在游戏里不会产生任何有意思的行为。

### 外观

| 字段 | 作用 |
| --- | --- |
| `path_icon`, `show_icon` | 阵营图标。`setIcon(path)` 会同时配置这两者 |
| `default_kingdom_color`, `default_civ_color_index` | 初始旗帜与疆域颜色 |
| `color_building` | 施加在其建筑物上的色调 |

## 阵营的其他关联子系统

单一的王国资源本质上只是一个标签。一个功能完整的文明阵营还会触碰以下各个资源库：

| 子系统 | 对应资源库 | 作用 |
| --- | --- | --- |
| 旗帜纹章 | `AssetManager.kingdom_banners_library` | 程序化生成的王国旗帜 |
| 配色 | `AssetManager.kingdom_colors_library` | 王国分配领土颜色所用的调色板 |
| 王国特质 | `AssetManager.kingdoms_traits` | 国策（主要是税率）。参见 **[王国特质](#/nml/kingdom-traits)** |
| 王国职位 | `AssetManager.job_kingdom` | 阵营宏观AI正在推进的战略任务 |
| 王国任务 | `AssetManager.tasks_kingdom` | 支撑这些职位的底层行为树 |
| 战争类型 | `AssetManager.war_types_library` | 可以对外宣战的战争借口与规则 |
| 建筑风格 | `AssetManager.architecture_library` | 房屋和城墙的贴图外观 |
| 建造序列 | `AssetManager.city_build_orders` | 新建立的城市先造什么、后造什么 |
| 命名生成器 | `AssetManager.name_generator`, `AssetManager.name_sets` | 王国、城市与市民名字的命名词库 |

在有明确需求之前，尽量复用原版资源。在你的角色资源上指定 `banner_id = "human"` 就能免费获得一套完整的旗帜生成逻辑。

## 运行时动态操作王国

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` 是一个扩展方法，含义是“此对象已在游戏中被消灭/摧毁，但某些地方仍残留着对它的引用”。在遍历王国、城市、军队或单位的每个循环中都务必做此检查。这是让模组稳定运行还是每小时报崩一次的分水岭 :aPES2_Sweat:。

## 统治者性格

国王和城镇领袖均拥有**性格（Personality）**：包含一个性格标识以及若干 `personality_*` 属性，直接决定该王国在世界舞台上是倾向于侵略扩张还是和平外交。注册新性格只需三行代码。难点在于如何让领袖*实际拥有*它：每次生物属性更新时，`Actor.updateStats()` 都会按硬编码的名称直接在 4 种原版性格中进行挑选。

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Postfix 补丁会在生物每次刷新属性后执行，从而确保性格替换持续生效。补丁会在追加自定义属性之前将原版性格的加成扣除，避免统治者叠加双重属性。`s_personality` 与 `mergeStats()` 属于 `internal` 成员，由 NML 编译环境自带的 **publicized** 引用程序集提供支持。

## 外交倾向、忠诚度与幸福感事件

三个轻量级函数库决定了游戏世界的政治与社会氛围，它们本质上均是由各类计算委托构成的集合：

| 所属函数库 | 触发调用场景 | 返回值类型 |
| --- | --- | --- |
| `AssetManager.opinion_library` | 每对王国之间 | 两国之间的外交态度好感度点数 |
| `AssetManager.loyalty_library` | 每座城镇与宗主国 | 城镇对所属王国的忠诚度点数 |
| `AssetManager.happiness_library` | 生物经历具体事件时 | 固定的单次幸福感变动点数 |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

外交倾向与忠诚度在每次结算时均会遍历全库进行累加求和，因此直接调用 `add()` 即可生效；游戏在外交明细面板中会通过 `translation_key`（数值为负时读取 `translation_key_negative`）自动展示为独立的加减分项。幸福感事件则在你的代码显式调用 `actor.changeHappiness("hello_warm_embers")` 时触发，正如 **[阴谋与策划分录](#/nml/plots)** 中领袖举办余烬狂欢节所做的那样。

> [!WARNING] 幸福感事件在启动期完成静态编号
> 生物的幸福感历史记录中存储的是事件的*数字序号*而非字符串 ID，且 `HappinessLibrary.post_init()` 仅在启动期分发该序号。模组后续注册的事件序号默认为 0，会导致在面板历史中被错误展示为原版的第一个事件。请务必如上文手动对 `index` 赋值。

## 其他系统的纹章旗帜

王国并不是唯一拥有旗帜的组织：文化、宗教、氏族、语言、亚种与家族均拥有各自的纹章部件库（`AssetManager.culture_banners_library` 等）。每个库均包含一个统一的 `main` 资产用于存储图案路径列表，新生成的文化会从中随机抽取对应图案的索引编号。

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

图案贴图在绘制旗帜时实时按需加载，因此无需执行任何缓存刷新。超出列表长度的索引会自动回退为 0，因此包含模组旗帜的存档在卸载模组后依然可以正常读取。在绘制自定义部件前，建议先在 **[UnityExplorer](#/toolbox/unity-explorer)** 中核对其尺寸规格。

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] 通常情况下你并不需要注册新的王国资产
> 全新的生物种族确实需要王国资产。但全新的*行为模式*则不必：绝大多数所谓的“阵营模组”通过王国特质、文化系统或对外交判定打 Harmony 补丁来实现往往更加优雅。仅在你的自制生物确实需要在世界格局中拥有自立阵营时再添加王国资产。
