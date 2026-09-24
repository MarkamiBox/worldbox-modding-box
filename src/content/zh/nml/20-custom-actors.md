---
title: 自定义生物（Actor）
group: 游戏内容
subgroup: 生物实体、建筑与 AI
icon: :wbhuman:
order: 140
---

# 自定义生物（Actor） :wbhuman:

> [!NOTE] 游戏里称为 Actor，而不是“种族”（Race）
> 游戏将地图上的每一个活物统称为 **Actor**：人类、狼、巨龙、僵尸、螃蟹。它们全都派生自同一个基础类 `ActorAsset`，且全部存放在 `AssetManager.actor_library` 中。“种族”（Race）是早已废弃的历史旧词，唯一残留的地方是一个被标记为 `[Obsolete("use .original_actor_asset instead")]` 的 `race` 属性（stats），它存在的唯一意义是兼容读取史前版本的旧存档。在任何地方都请使用 `actor`。

添加一个全新的生物是每个 mod 开发者都想做、但几乎没人能做完的方向。因为一个 `ActorAsset` 承载着动画、贴图、音效、生物学分类、食性、AI 行为（behaviour）树、基因组、文化（culture）以及各项属性数值。只要漏填或者搞错其中一项，你就会在游戏里得到一个孤零零站在大洋深处的隐形单位 :PES4_Invisible:。

好消息是：游戏本体自己也绝不会从零组装一个生物。原版创建精灵（Elf）的代码，字面上就只有这一句：

```csharp
clone("elf", "$civ_advanced_unit$");
```

因此，我们也如法炮制。

## 模板资源

被 `$` 包裹的 id 是**模板**（Template）：游戏保留的半成品生物，专供其他生物作为克隆源。它们是创造全新生物的最佳起点，因为它们具备完整的内部底层逻辑，又不会硬塞给你人类的贴图外观。

| 模板标识 | 适用场景 |
| --- | --- |
| `$basic_unit$` | 最简陋的基础生命体 |
| `$animal$` | 野生动物 |
| `$mob$` | 敌对怪物 |
| `$civ_unit$` | 基础文明生物 |
| `$civ_advanced_unit$` | 具备城市、王国（kingdom）、文化、宗教（religion）的完整文明种族。人类、精灵、兽人、矮人皆基于此 |

你也可以直接克隆现成的成熟生物——例如 `human`、`wolf`、`zombie`——对于你的第一个生物 mod 来说，这是最轻松的路线，因为原主的外观贴图会一并继承下来，你的生物在游戏里立即可见。

## 单个生物创建

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] 自己加载阴影，否则游戏会为每个角色报错
> `ActorAssetLibrary` 在启动时会遍历它的列表，对每个角色调用 `loadShadow()`，读取 `shadows/<shadow_texture>` 处的精灵图并测量尺寸。这一步发生在你的模组注册任何东西之前，所以你的角色的阴影会一直是 `(0.00, 0.00)`，游戏会为它记录资源错误，而且是三次，成体、蛋和幼体各一次 :wbfacepalm:。
>
> `loadShadow()` 是 `internal` 的，所以和本指南其他地方一样需要一个**公开化**的 `Assembly-CSharp.dll`。如果没有，就改为设置 `asset.shadow = false;`：没有阴影，但也不会报错。

> [!WARNING] `clone()` 已经注册过了
> `AssetManager.<library>.clone(newId, sourceId)` 内部会调用 `add()`。所有资源库都是这样。之后你再自己调用 `add()` 就是重复注册：资源库会移除第一个副本、记录一条错误，然后重新添加。无害，但这是日志里的噪音，会让真正的错误更难找到，也是审查者第一眼就会注意到的地方。
>
> 反过来这也是好消息：**克隆之后 `base_stats` 就已经存在了**，所以 **[自定义特质](#/nml/custom-traits)** 里“先 add 再设属性”的规则已经自动满足。

## 批量定义多个生物

绝大多数生物 mod 都不会只做单一一种生物。三个精灵小仙灵意味着三个独立的资源，而一旦你把上面的代码块复制三遍，就意味着修一个 bug 要改三个地方。

把具体差异提取为表格，把注册代码封装到循环中：

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

现在添加第四个生物只需要在数据表里加一行代码。市面上几乎所有成熟的生物 mod 最终都会采用这种结构，从你写第二个生物起就值得这么做 :PESgn_ThisTBH:。

## 决定生物“本体特质”的关键字段

第一天只有三个字段重要：`civ`、`actor_size` 和 `name_locale`。其余的可以等你的生物能看见、能走路之后再说。

| 字段 | 作用说明 |
| --- | --- |
| `civ` | 文明生物标识：会建立城市、王国、任职与开战。`false` = 动物 |
| `auto_civ` | 游戏是否会自动推动其发展文明 |
| `default_animal` | 在游戏内部判定中将其归类为野生动物 |
| `unit_other` | 既非文明亦非动物：怪物、机械傀儡、特殊实体 |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`。决定渲染大小与战斗判定 |
| `name_locale` | 显示名称的翻译本地化键 |
| `icon` | 在信息列表和生成按钮中显示的图标 |
| `color_hex` | 应用在可变色生物身上的颜色着色值 |
| `can_have_subspecies` | 世代繁衍中是否会变异产生亚种（subspecies） |
| `has_ai_system` | 是否运行通用的 AI 行为逻辑树 |
| `flying` / `hovering` | 是否能够离地浮空及其高度 |
| `force_ocean_creature` / `force_land_creature` | 强制锁定适居地形为海洋或陆地 |
| `can_attack_buildings` | 是否拥有攻击并拆毁建筑（building）的能力 |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | 神力（GodPower）对其生效的白名单权限 |
| `kingdom_id_wild` / `kingdom_id_civilization` | 归属阵营（未驯化的野生群体与定居建国后的文明群体） |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … 贴图所在的图集 |
| `animation_walk` / `animation_idle` / `animation_swim` | 序列帧动画定义，各带独立的 `_speed` 播放速率 |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | FMOD 音效事件路径 |
| `name_taxonomic_*` | 界、门、纲、目、科、属、种，用于生物知识窗口 |
| `collective_term` | 量词群体称谓（如“一**群**狼”） |
| `allowed_status_tiers` | 允许被施加的状态效果（status）阶级 |
| `production` | 其城市能生产制造的物资品类 |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | 死亡或感染后的蜕变目标 |

## 将文明生物接入世界体系

一个拥有 `civ` 属性的生物在填完属性之后绝不算大功告成。以下是原版为所有可游玩文明种族配置的基础属性，漏掉它们就是为什么你的自制种族在游戏里“呆若木鸡、什么都不做”的原因：

```csharp
asset.kingdom_id_wild = "nomads_human";          // 定居前的游牧流民状态
asset.kingdom_id_civilization = "human";         // 其成立的国家类型
asset.banner_id = "human";                       // 国旗图案生成规则
asset.architecture_id = "human";                 // 建筑外观风格
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // 姓名生成规则库
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 基因组：用于繁育和突变的遗传属性分布
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// 各特质系统对应的初始配置特质
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

在你画出专属的美术素材之前，请先复用原版的 `banner_id` 和 `architecture_id`。一个没有建筑美术绑定的生物是什么建筑都造不出来的。

## 生成与召唤

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` 是公有方法，支持传入音效、神迹特效、生成高度、指定亚种以及是否佩戴初始装备等可选参数。

为玩家制作一个神力按钮调用它，你就拥有了一个完整的生物生成器。参见 **[能力标签页与按钮](#/nml/power-buttons)**。

## 亚种（Subspecies）

亚种是某个生物在经过数代繁衍后随环境分化出的变体。它们拥有自己独立的特质（trait）库（与普通生物特质分离）和专属分组：

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// 让你的生物天生自带该亚种特质
asset.addSubspeciesTrait("hello_scales");
```

亚种特质还可以携带**外观素材**：`sprite_path`、`animation_walk`、`skin_citizen_male`、`skin_warrior` 等，这就是为什么亚种可以在无需声明为全新 Actor 的前提下，拥有与母种截然不同的外观。参见 **[亚种特质](#/nml/subspecies-traits)**。

## 自定义图标

在处理复杂的骨骼与逐帧动画之前，先搞定最便宜的部分：在列表和生成按钮中显示的图标。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

而生物本身的**身体躯干**美术则是完全另一码事，这也是本节最后要解决的核心问题。

## 贴图精灵才是真正的硬骨头

上面介绍的所有内容，写成代码不过区区一页。真正折磨人的是画画，大多数生物模组就是在这里悄无声息地夭折的：一个生物需要一整套完整的动画帧、正确的图集、适宜的尺寸以及精确的锚点轴心。摆在面前的只有两条诚实的道路：

1. **直接沿用克隆源的贴图。** 一个复用人类动画骨骼、仅仅改换数值和全身色调的生物，已经是一个非常优秀且*绝对能跑通*的入门 mod。
2. **使用 AssetRipper 提取原版素材**，找到被克隆生物的图集，在动笔画图之前必须像素级精确匹配其排版布局。参见 **[获取游戏美术素材](#/toolbox/getting-the-sprites)**。

> [!WARNING] 在真实世界中测试，不要只在空白地图测试
> 一个无法寻路、无法建房或是一出生就溺死的文明生物，在刚出生的前三十秒看起来都会无比正常。生成二十个个体，让世界全速运转五分钟，然后再去仔细检查日志 :PES_MonkaSweat:。
