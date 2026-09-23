---
title: 宗教特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbpray:
order: 108
---

# 宗教特质 :wbpray:

**宗教**属于城镇与王国，通过传教皈依传播，撰写圣典，并且能够举行**仪式（Rite）**：信徒们会自发尝试发动足以改变世界的阴谋企图。宗教特质就是其中的一项信仰。

| | |
| --- | --- |
| 库 | `AssetManager.religion_traits` |
| 类 | `ReligionTrait` |
| 分组 | `AssetManager.religion_trait_groups`，类 `ReligionTraitGroupAsset` |
| 运行时持有者 | `Religion`，位于 `World.world.religions` |
| 本地化前缀 | `religion_trait_` |
| 默认图标路径 | `ui/Icons/religion_traits/` |

> [!WARNING] 宗教属性不会传递给单位
> 这是唯一一个其 `base_stats` 绝不会合并到 `Actor` 身上的特质系统。`Actor.updateStats()` 合并的范畴只有亚种、家族、语言和文化。**宗教根本不在该清单中。**
>
> 因此，宗教特质是通过其*实际行为*（仪式、地形转化、动作钩子）来改变世界的，而非通过数值加成。给它写上 `base_stats["damage"] = 10` 完全没有任何效果，而且这是本页面读者最常白白浪费一个下午的踩坑点 :PES4_BigSad:。

## 注册一个特质

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // 信徒可以尝试举行的仪式
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

## 仪式：`plot_id` 字段

带有 `plot_id` 的宗教特质会成为一项**仪式**。宗教将其仪式收集到 `possible_rites` 中，当阴谋的触发条件达成时，领袖与祭司们便会自发尝试举行该仪式。

```csharp
trait.plot_id = "summon_meteor_rain";
```

该 ID 指向 `AssetManager.plots_library`。原版仪式直接复用了现有的阴谋 —— `summon_earthquake`、`summon_meteor_rain`、`summon_thunderstorm`、`summon_stormfront`、`summon_hellstorm`、`clan_ascension` —— 你可以同样直接复用它们，也可以先注册属于你自己的 `PlotAsset`。

由阴谋来决定何人可以尝试发动以及其难度门槛：

| PlotAsset 字段 | 作用 |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | 谁可以发起该阴谋 |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | 属性门槛要求 |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | 等级与声望门槛要求 |
| `progress_needed`, `money_cost` | 所需进度时长与金钱成本 |
| `pot_rate`, `rarity` | AI 选择该阴谋的概率频率 |
| `check_is_possible`, `check_should_continue` | 自定义的判定与延续条件 |

## 地形转化：`transformation_biome_id` 字段

这是宗教特质独有的另一个特殊字段。它将该特质标记为转化特质，并指定该信仰会向周围地形扩散的生物群落 ID：

```csharp
trait.transformation_biome_id = "biome_desert";
```

原版将此机制应用于 `sands_of_ruin`（沙漠）、`shadowroot`（腐化）、`echo_of_the_void`（奇点）、`infernal_rot`（地狱）以及 `cosmic_radiation`（废土）。拥有此类特质的宗教会缓慢地改写信徒所居住的土地，这是游戏中单一特质所能带来的最具震撼力的视觉改变。

## 让特质真正*行动*起来

既然属性加成无效，动作钩子就是宗教特质展现价值的核心舞台。它们与其他特质所具备的钩子完全相同：

```csharp
// 每隔几秒，对每位信徒触发一次
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// 当信徒死亡时
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

宗教特质还可以赋予法术或 AI 决策，这通常比机械的定时器更加自然妥帖：

```csharp
trait.addSpell("hello_bolt");           // 参见 弹射物、法术与特效
trait.addDecision("burn_tumors");       // 信徒可做出的 AI 决策
```

## 原版分组

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

创建你自己的标签页：参见 **[特质分组与标签页](#/nml/trait-groups)**，使用 `AssetManager.religion_trait_groups` 与 `ReligionTraitGroupAsset`。

## 文本本地化

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## 分发特质

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

`Religion` 还公开了 `cities`、`kingdoms`、`books` 与 `possible_rites`，这通常是你的代码需要探查某个宗教动向时所需读取的内容。

> [!TIP] 仪式才是精髓所在
> 一个只调整数字的宗教是毫无存在感的。而一个祭司时不时召唤流星雨摧毁敌人的宗教，才是玩家会截图并发帖分享的亮点。把你的精力投入到 `plot_id` 中去吧 :aPES_Flames:。
