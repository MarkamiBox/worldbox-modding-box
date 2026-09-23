---
title: 自定义物品装备
group: 游戏内容
subgroup: 物品与装备
icon: :wbcrystalsword:
order: 120
---

# 自定义物品装备 :wbcrystalsword:

武器、防具盔甲、戒指与护身符在 `AssetManager.items` 中均以 `EquipmentAsset` 的形式存在。

首先必须明确的一点是：**原版游戏中压根不存在一个可以在运行时随意指定材料材质的通用“剑”物品**。代码里实实在在地存在着 `sword_wood`、`sword_stone`、`sword_copper`、`sword_bronze`、`sword_silver`、`sword_iron`、`sword_steel`、`sword_mythril` 和 `sword_adamantine`。这是九个截然独立的资源，各自拥有专属的制造成本、属性数值以及 `material` 材质标识。每一件盔甲护具、每一把弓箭、每一个护身符无不如此。

正因如此，克隆 (clone) 在这里绝不仅仅是偷懒的捷径，而是唯一的理智做法。

## 物品模板系统

以 `$` 开头的 ID 均为系统内置模板，它们预先封装好了一整套武器大类的底层逻辑：

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` 已经帮你配置好了 `equipment_subtype`、`is_pool_weapon`、`pool_rate`、挥砍命中动画、传奇命名模板以及 `group_id`。这些都是你开发新武器所必备的基础。

## 创建一件武器

> [!WARNING] 没有精灵图路径的武器会直接搞死加载器
> 对每一把池子里的武器，游戏都会把 `path_gameplay_sprite` 设成 `items/weapons/w_<id>`，把 `path_icon` 设成 `ui/Icons/items/icon_<id>`。这是在它自己加载时的 `post_init()` 里做的，那时你的武器还不在列表里，于是两个字段都是 `null`。预加载器接着调用 `getSpriteList(null)`，整个加载就死在 `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:。
>
> 两个都自己设。指向你放在 `GameResources/` 里的文件，或者在你还在测别的东西时先借用原版的一对。

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] 注册成功不等于允许被锻造
> 城镇在锻造武器时是从 `equipment_by_subtypes`（按武器子类型划分的字典列表）中挑选图纸的，而战利品生成池则从 `pot_weapon_assets_all` 和 `pot_weapon_assets_unlocked` 中抽取。`ItemLibrary.linkAssets()` 在游戏启动时就完成了这三个列表的填充（早于模组载入）。若缺少代码末尾的那四行字典追加逻辑，你的武器虽然存在且能通过指令生成，但全世界的铁匠铺都不会主动去打造它 :PES5_Hmmmm:。防具与饰品则使用按 `group_id` 分组的 `pot_equipment_by_groups_all` 和 `pot_equipment_by_groups_unlocked`，而非上述武器池。


## 核心字段解析

### Identity

| 字段 | 作用 |
| --- | --- |
| `material` | 材质名称。作为显示名称的一部分，且在单位升级装备时作为对照依据 |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`。占据哪个装备槽位 |
| `equipment_subtype` | `sword`, `axe`, `bow`, … 武器细分子类。不同种族文化各有偏好的武器细分类型 |
| `group_id` | 装备分类图鉴标签页。详见 **[特质分组与标签页](#/nml/trait-groups)** |
| `attack_type` | 近战或远程攻击行为模式 |
| `quality` | 生成掉落时的最低保底品质等级 |
| `rarity`, `pool_rate` | 随机生成时被系统选中的概率权重 |
| `is_pool_weapon` | 是否进入通用的世界随机武器掉落池 |

### 锻造成本与价值

| 字段 | 作用 |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | 一站式设置所有造价消耗的推荐方法。优先使用此方法，不要手动拆开逐个赋值 |
| `minimum_city_storage_resource_1` | 城市库存低于该阈值时，铁匠铺绝不会开工锻造 |
| `equipment_value` | AI 心目中此装备的强力评分。驱动“士兵是否应当拾取替换新装备”的核心依据 |
| `durability`, `rigidity_rating` | 耐久度与坚固程度评级 |

### 外观表现与手持渲染

| 字段 | 作用 |
| --- | --- |
| `path_gameplay_sprite` | 生物拿在手上的实机渲染精灵图 |
| `colored`, `animated` | 是否接受动态染色、是否具有帧动画 |
| `path_slash_animation` | 挥砍攻击划过的刀光特效图 |
| `projectile` | 远程武器射击发射的弹药 ID。详见 **[弹药、法术与特效](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | 进阶为传奇装备时的神兵专属命名模板 |

### Behaviour

| 字段 | 作用 |
| --- | --- |
| `action_attack_target` | 每次攻击命中目标时触发 |
| `action_special_effect` + `special_effect_interval` | 穿戴在身上时按计时器周期触发 |
| `item_modifier_ids` | 可随机刷出的附魔词条池。详见 **[武器附魔词条](#/nml/item-modifiers)** |
| `addSpell(id)` | 赋予持有者的主动施法技能 |
| `addCombatAction(id)` | 赋予持有者的专属战斗特技 |


## 手持时触发的被动效果

“手持余烬之刃时获得迅捷”听起来像是写在物品上的特质。但物品本身并不支持特质，不过它们可以在装备期间按计时器触发执行代码（即上表中的 `action_special_effect`），而**状态效果**自身是带有持续时间的。因此，物品只需不断刷新一个短暂的状态效果，一旦物品被卸下或丢弃，状态自然就会结束：

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 持续 3 秒，只要装备着每 1 秒刷新一次。丢掉武器后状态自然消失
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

状态需要设置 `allow_timer_reset = true`（新创建的 `StatusAsset` 默认为 true，但从原版克隆的某些状态可能不是），否则在到期前重复施加不会重置计时器，导致状态在战斗中中途断掉。在 HelloBox 中，余烬之刃会诅咒其持有者——正如一把烈焰燃烧的凶刃该做的那样 :wbfacepalm:。

为什么不用特质：特质一旦加上就会永久存在，除非有专门的代码将其移除，这样你就不得不另外写一个定时器来检测武器是否离手。而状态效果会自动到期清理。

## 导入自定义贴图

一件装备具有两套独立的视觉素材，并由两个不同的字段分别控制：

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] 武器贴图需要放在独立文件夹内供 LoadAll 读取
> 游戏的武器预加载器会调用 `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`，其底层执行的是 `Resources.LoadAll<Sprite>`。在 NeoModLoader 中，`LoadAll` 是按文件夹目录名称进行检索的。如果 `path_gameplay_sprite` 填写为 `"items/weapons/w_hello_sword"`，NML 会在 `GameResources/items/weapons/w_hello_sword/` 目录下查找资源。如果只放置了一个裸文件 `w_hello_sword.png` 而没有创建同名目录，`LoadAll` 将找不到任何目录并返回 0 个贴图，游戏日志会抛出 `Weapon Texture is Missing` 警告。将贴图放入同名文件夹内即可完美解决。

> [!NOTE] 武器贴图需要放在独立文件夹内供 LoadAll 读取
> 游戏的武器预加载器会调用 `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`，其底层执行的是 `Resources.LoadAll<Sprite>`。在 NeoModLoader 中，`LoadAll` 是按文件夹目录名称进行检索的。如果 `path_gameplay_sprite` 填写为 `"items/weapons/w_hello_sword"`，NML 会在 `GameResources/items/weapons/w_hello_sword/` 目录下查找资源。如果只放置了一个裸文件 `w_hello_sword.png` 而没有创建同名目录，`LoadAll` 将找不到任何目录并返回 0 个贴图，游戏日志会抛出 `Weapon Texture is Missing` 警告。将贴图放入同名文件夹内即可完美解决。

> [!NOTE] 武器材质需要独立的文件夹供 LoadAll 查找
> 游戏预加载武器时会调用 `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`，其底层会执行 `Resources.LoadAll<Sprite>`。在 NeoModLoader 中，`LoadAll` 按照文件夹名查找资源。如果 `path_gameplay_sprite` 为 `"items/weapons/w_hello_sword"`，NML 会寻找 `GameResources/items/weapons/w_hello_sword/` 目录。如果只放置单独的文件 `w_hello_sword.png` 而没有该文件夹，`LoadAll` 找不到目录并返回 0 个精灵图，导致游戏抛出 `Weapon Texture is Missing` 错误。将精灵放入该同名文件夹即可完美加载。

武器精灵图会根据生物自身的体型缩放渲染，且必须将图像中心底部（`sprites.json` 中设为 `PivotX: 0.5, PivotY: 0.0`）设为中心锚点，否则武器就会浮空错位在手掌之外（具体参考 **[精灵与资源](#/nml/sprites-and-resources)**）。

若保留指向原版资源的默认路径（例如 `"items/weapons/w_sword_iron"`），游戏就会直接使用原版武器贴图，这是快速制作第一把武器的稳妥做法 :PESgn_Neat:。

## 制作一套完整的材质装备系

与生物物种面临的问题如出一辙：在实际模组中，你几乎不可能只做单单一柄孤零零的武器。九种不同材料意味着需要九个独立资源，如果全靠无脑复制粘贴九次代码，一旦有微小改动就得在九个地方同时排查 Bug。

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## 本地化文本

装备的命名逻辑与本指南中出现的其他所有资源完全不同，这常常把新手搞得一头雾水。一件装备在游戏里最终渲染出的显示名称，解析逻辑如下：

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

因此上文中从 `$sword` 克隆出来的余烬之刃，由于继承了 `equipment_subtype = "sword"`，游戏里会自动显示为原版的“**剑**”，而不是你的武器 ID。你有两种破局解法：

```csharp
blade.translation_key = "hello_sword_ember";   // 显式指定专属名称，同时不破坏其长剑细分子类
```

或者保持细分子类名称不动，完全交由**材质前缀**来拼接——这正是原版官方的处理逻辑：每一把剑都叫“剑”，而 `sword_iron` 凭借其材料键名最终在前端合成为“铁剑”。

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| 本地化键 | 键名来源与作用 |
| --- | --- |
| `item_<subtype>` 或专属 `translation_key` | 武器基础显示名称 |
| `<id>_description` | 悬浮提示框中的详细描述 |
| `item_mat_<material>` | 拼在武器名称前面的材料前缀词 |

引入新材质时**务必**为其定义 `item_mat_` 本地化键，否则你的武器名字前就会直接被贴上一截丑陋的原生英文标识。

## 将装备放进单位手中

**资源 (Asset)** 是蓝图配方。**物品 (Item)** 才是具体某只生物拿在手里的实物对象，携带随机生成的品质、附魔词条和名称。将其发放到单位手中分两步：

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. 根据蓝图配方实例化一件真正的实装物品
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. 将其递交给单位 - setItem 会根据该物品的 equipment_type 自动精准放到对应槽位
actor.equipment.setItem(item, actor);
```

`generateItem` 在生成物品时会像日常战利品掉落一样随机洗炼品质与词缀，因此生物拿到手里的最终产物与你在代码里注册的原始模板永远不会完全相同。

## 手持工具

建筑工挥舞的铁锤和采集者手提的竹篮并不是常规装备物品。它们属于**手持工具（Hand Tool）**：纯粹的美术贴图层，由特定 AI 任务强制调用显示，任务结束即行隐藏。

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

AI 任务通过 `force_hand_tool` 属性绑定并强制显示手持工具，因此每当生物执行来自 **[自定义 AI 与决策行为](#/nml/custom-ai)** 的漫游任务时，手中便会自动握持火把。

> [!WARNING] 必须手动加载序列帧贴图
> `UnitHandToolLibrary.loadSprites()` 在游戏启动时为所有预设工具填充了 `gameplay_sprites` 列表。模组后续追加的工具没有自动加载该列表，导致生物手中空无一物。由于贴图路径是通过 `getSpriteList()` 读取的，因此即使只有单张图片，也必须放置在独立的**文件夹**中（例如 `items/tools/tool_hello_torch/`）。若未在 `sprites.json` 中配置对齐锚点（Pivot），工具会默认以贴图中心对齐：对于火把尚可接受，但对于长柄工具位置就会出现严重偏离。

| 字段 | 作用说明 |
| --- | --- |
| `path_gameplay_sprite` | 序列帧所在文件夹路径。原版默认由 ID 推导：`items/tools/tool_<id>` |
| `animated` | 是否像咖啡杯那样循环播放序列帧动画 |
| `colored` | 是否像王国旗帜那样根据所属王国的颜色进行染色叠加 |

> [!TIP] 优先制作装备词条，其次再考虑新武器
> 制作一把全新的武器需要绘制序列帧、配置材质品阶、计算锻造消耗与数值平衡。而制作一个全新的**装备词条（Modifier）**只需区区二十行代码，且能立即应用到游戏里的所有武器上（包括其他模组添加的武器）。若想今晚就体验到立竿见影的模组改动，建议先阅读 **[武器附魔词条](#/nml/item-modifiers)** :PESgn_DoIt:.
