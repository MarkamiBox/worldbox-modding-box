---
title: 属性数值速查
group: 游戏内容
subgroup: 底层架构与属性
icon: :wbstonks:
order: 92
---

# 属性数值速查 :wbstonks:

你注册的绝大多数资源都拥有一个 `base_stats` 字典块，而且本页之后的几乎每一页都会往里面塞东西。本页面列出了所有你被允许填入的有效属性（stats）键名。 除此以外的任何属性都极易引发游戏崩溃 :PES5_Hmmmm:。

## base_stats 的工作原理

`base_stats` 是一个从 `string` 到 `float` 的字典。键名必须是下方列出的属性 ID 之一。随意填入未知的键名**绝不是**无害的：属性的 setter 会去 `base_stats_library` 中查找该 ID，若未查到便返回 `null`，随后当场在你的 `Initialize()` 里抛出 `NullReferenceException`。

因此，属性拼写错误绝不会静默失效，而是会直接击垮你的整个模组注册流程，导致这行代码之后的一切全部无法运行。如果某个属性名在多个地方使用，请务必将其保存在 `const string` 常量字段中。

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%，而不是乘 0.25
```

## 单位各项数值的计算来源

`Actor.updateStats()` 会清空单位的属性字典块，并严格按照以下先后顺序从头重新累加重构：

| # | 来源 | 备注 |
| --- | --- | --- |
| 1 | **亚种 (Subspecies)**，及其专属的雄性或雌性属性块 | 若单位拥有亚种 |
| 1b | **Actor 基础生物资源** | 仅在**没有**亚种时生效。亚种会*完全取代*它，而非在其之上叠加 |
| 2 | **家族 (Clan)**，及其专属的雄性或雌性属性块 | |
| 3 | **语言 (Language)** | |
| 4 | **文化 (Culture)** | |
| 5 | 单位自身基础数据中的统治者属性 | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | 单位身上挂载的每一个**状态效果**（status） | |
| 7 | **默认普通攻击** 物品（item） | 仅在空手无武器时生效 |
| 8 | 单位拥有的每一个**生物特质（trait）** | 时代（world age）专属特质在非对应时代下会被跳过 |
| 9 | 单位的**性格** | |
| 10 | 单位**穿戴的每一件装备**及其附魔（modifier）词条 | |

这里最容易被人搞混的两点：

- **亚种会直接顶替 Actor 基础生物资源的属性。** 如果你在 `human` 资源上加了属性，具有亚种的人类单位根本享受不到。
- **宗教（religion）不在这个列表里。** 宗教特质的 `base_stats` 永远不会下发到生物单位身上。详见 **[宗教特质](#/nml/religion-traits)**。

另外两个至关重要的计算规则：

- 像 `damage` 这样的固定数值属于**加成 (Bonus)**，而非最终绝对值。特质上的 `damage = 15` 代表“在其他所有计算结果之上额外 +15”。
- 所有 `multiplier_*` 乘数属性都是**在 1.0 的基础上累加的小数**。`multiplier_health = 0.5` 代表 +50% 生命；`multiplier_health = -0.5` 则代表生命值减半。

> [!WARNING] 在资源正式注册前，`base_stats` 根本不存在
> 对于通过 `new` 手动实例化的资源，属性字典块是在 `add()` 内部才完成初始化的。如果在那行之前读写 `base_stats`，就会触发 WorldBox 模组开发中最臭名昭著的崩溃：`NullReferenceException`。不过 `clone()` 会自动在内部替你调用 `add()`，因此克隆出来的对象可以直接安全赋值。

## Combat

哪怕给狼加上外交属性，它也绝不会坐下来谈判 :PES2_Shrug:。


| 属性 | 作用 |
| --- | --- |
| `damage` | 单次命中造成的固定伤害 |
| `damage_range` | 额外加在 `damage` 之上的随机浮动伤害范围 |
| `attack_speed` | 攻击出手速率 |
| `accuracy` | 命中率 |
| `critical_chance` | 暴击率 |
| `critical_damage_multiplier` | 暴击伤害倍数 |
| `armor` | 固定伤害减免护甲 |
| `range` | 攻击射程 |
| `throwing_range` | 投掷类武器的射程 |
| `targets` | 单次攻击可命中的最大目标数 |
| `projectiles` | 一次射击发射的弹丸数量 |
| `knockback` | 击退目标的距离 |
| `recoil` | 攻击时*自身*受到的后坐力反冲距离 |
| `skill_combat` | 近战格斗技能等级 |
| `skill_spell` | 法术施法技能等级 |
| `status_chance` | 触发武器附带状态效果的概率 |
| `area_of_effect` | 范围爆炸伤害半径 |

## Body

| 属性 | 作用 |
| --- | --- |
| `health` | 最大生命值 |
| `stamina` | 最大体力值 |
| `mana` | 最大法力值 |
| `speed` | 移动速度 |
| `mass`, `mass_2` | 物理质量，用于击退计算和物理交互 |
| `size` | 受击判定框 (Hitbox) 大小 |
| `scale` | 实机渲染缩放大小 |
| `max_nutrition` | 单位能够储存的饱食度上限 |
| `metabolic_rate` | 饱食度的新陈代谢消耗速度 |
| `construction_speed` | 建造工程速度 |
| `experience` | 经验获取倍率 |

## 生命与寿命属性

| 属性 | 作用 |
| --- | --- |
| `lifespan` | 预期寿命 |
| `maturation` | 生长成熟速度 |
| `age_adult` | 判定为成年的年龄 |
| `age_breeding` | 具备生育能力的年龄 |
| `birth_rate` | 繁殖繁衍频率 |
| `offspring` | 单次繁衍产仔数量 |
| `multiplier_offspring` | 该产仔数量的百分比修正乘数 |
| `mutation` | 发生亚种突变的几率 |
| `happiness` | 基础心情幸福度 |

## 仅限文明居民属性

以下属性对普通动物完全无效。游戏内部将其打上了 `used_only_for_civs` 标签。

| 属性 | 作用 |
| --- | --- |
| `diplomacy` | 领袖属性：外交能力 |
| `warfare` | 领袖属性：军事战争（war） |
| `stewardship` | 领袖属性：内政管理 |
| `intelligence` | 领袖属性：智力学识 |
| `army` | 对王国（kingdom）军队规模上限的贡献值 |
| `cities` | 该王国预期扩张拥有的城市数量 |
| `bonus_towers` | 城市被允许额外多造的防御瞭望塔数量 |
| `limit_population` | 人口数量上限 |
| `limit_clan_members` | 家族成员数量上限 |
| `loyalty_traits` | 来自特质的忠诚度加成 |
| `loyalty_mood` | 来自心情的忠诚度加成 |
| `opinion` | 对其他势力的基准好感度 |
| `multiplier_diplomacy` | 外交能力的百分比乘数 |
| `multiplier_supply_timer` | 远征军队补给续航持续时间 |
| `personality_aggression` | 隐藏 AI 性格权重：好战侵略 |
| `personality_administration` | 隐藏 AI 性格权重：内政治理 |
| `personality_diplomatic` | 隐藏 AI 性格权重：注重外交 |
| `personality_rationality` | 隐藏 AI 性格权重：理性务实 |

## Multipliers

所有的乘数属性都是在 1.0 的基础上累加的小数，因此 `0.25` 就代表 +25%。

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats 与 base_stats_meta 的区别

每一个特质都包含**两组**属性字典块，搞混这两者是元特质 (meta-trait) 模组中最常出现的数值崩坏 Bug：

| 属性块 | 最终生效的目标 |
| --- | --- |
| `base_stats` | 汇聚到宿主身上，并由此平摊覆盖给属于该宿主的**每一个具体的生物个体** |
| `base_stats_meta` | 保留在宏观宿主本体上。供文化、家族或亚种本身读取，绝不会直接加到具体的生物个体身上 |

```csharp
trait.base_stats["damage"] = 5;             // 该文化的每一个成员攻击力都变高，连农民也算
trait.base_stats_meta["construction_speed"] = 10;   // 整个文化群体的建造速度加快，但没有任何人的单体攻击力会改变
```

如果你希望某种加成只对群体中的特定个体生效（比如仅限战士、仅限成年人），这两个属性块都无法直接实现。此时请在 `Actor.updateStats` 上挂载一个 Harmony Postfix 后置补丁自行添加守卫过滤。详见 **[Harmony 补丁](#/nml/harmony-patches)**。
## 标签：非数值型的特殊属性

`base_stats` 字典块同时还挂载了一组**标签 (Tags)**，它们是布尔标记而非数字。它们的继承合并逻辑与数值完全一致，因此特质给生物赋予火焰免疫的方式和赋予额外伤害的方式毫无二致：

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

原版游戏自身会去检测判断的核心标签：

| 分组 | 标签列表 |
| --- | --- |
| 免疫耐性 | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| 移动机能 | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| 心智智能 | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| 生态行为（behaviour） | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| 饮食食性 | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| 生殖繁衍 | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| 物种分类 | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| 建筑（building）环境 | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

与属性名不同的是，传入一个未知的标签名是无害的：它只是永远不会匹配上任何系统逻辑。但这同样意味着拼写错误会悄无声息地失效，因此请务必原样准确复制。 像拼错成 `imunity_fire` 这样的标签能在你的模组里静悄悄躺上好几个月而无人察觉 :PESgn_SMH:。

## 实时读取单位的运行时属性

`base_stats` 是配方*原料*。而活体 `Actor` 身上的 `stats` 则是所有加成计算归总后的*最终出炉成品*：

```csharp
float finalDamage = actor.stats["damage"];
```

这同时也是你在 `Actor.updateStats` 的 Harmony Postfix 补丁中可以进行平滑微调的对象——详见 **[Harmony 补丁](#/nml/harmony-patches)**。

## 添加你自己的自定义属性

你可以在 `AssetManager.base_stats_library` 中注册全新的 `BaseStatAsset`，它会出现在检查器面板里并像其他属性一样被累加求和。但它**绝不会产生任何预设效果**：原版游戏绝不可能去读取一个它压根不知道的陌生属性。自定义属性唯一的用途，就是作为一个记账数值，供你自己在专属的 Harmony 补丁或 AI 行为树节点中读取处理。

大多数情况下，最优雅的答案是“直接复用已有属性”；其次的选择则是“维护你自己专属的代码字典”。
