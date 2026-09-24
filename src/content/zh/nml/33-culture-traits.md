---
title: 文化特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbtiphat:
order: 106
---

# 文化特质 :wbtiphat:

**文化**（culture）代表了一组城镇共同拥有的习惯与习俗。它决定了居民建造什么、锻造什么、如何继承、阅读什么以及珍视什么。文化特质（trait）就是其中的一项习惯。

在七大特质系统中，文化的影响范围最为广阔。文化随着城镇的扩张而传播，在其开创者消逝后依旧长存，并将其属性（stats）融合到归属于该文化的每一个单一单位中。如果你想制作一个让其效应在历经一小时游戏后慢慢扩散至全世界的 Mod，这个库就是最佳选择。影响越大，责任越大 :PES5_Menace:。

| | |
| --- | --- |
| 库 | `AssetManager.culture_traits` |
| 类 | `CultureTrait` |
| 分组 | `AssetManager.culture_trait_groups`，类 `CultureTraitGroupAsset` |
| 运行时持有者 | `Culture`，位于 `World.world.cultures` |
| 本地化前缀 | `culture_trait_` |
| 默认图标路径 | `ui/Icons/culture_traits/` |

## 注册一个特质

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // 数值越高，在分组中排序越靠前
                spawn_random_trait_allowed = false,  // 绝不通过概率随机赋予
                can_be_given = true,                 // 玩家可以在编辑器中手动添加
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // 下方警告注意：此属性会同时作用于农夫与士兵。
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` 只在启动时读取一次
> 新文化的初始特质是从一个随机池里抽的，这个池子由 `BaseTraitLibrary.linkAssets()` 在游戏加载时、你的模组还不存在时建好。光在你的特质上打开这个开关什么都不会改变：你的特质根本不在那个池子里，也永远不会随机出现。按原版的权重方式自己把它放进去：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.culture_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` 是 `protected` 的，所以它会针对 NML 本来就用来编译你模组的公开化程序集进行编译。`spawn_random_rate` 默认是 `5`：调高它，特质就会更常出现。

**[自定义特质](#/nml/custom-traits)** 中的所有规则在此均适用：在设置属性前调用 `add()`、`path_icon` 不会自动生成、ID 必须带有统一前缀。接下来介绍的是文化特质的独有机制。而且这是最好玩的部分。

> [!WARNING] 文化特质上的 `base_stats` 会作用于所有人
> `Actor.updateStats()` 会把 `culture.base_stats` 合并进该文化的每一个单位。每一个单位。一个 "+5 攻击力" 的文化信条同样会武装面包师。
>
> 如果加成只应该赋予特定成员，请保持 `base_stats` 为空，并在 `Actor.updateStats` 的 Harmony Postfix 中自行过滤判定，参见 **[Harmony 补丁](#/nml/harmony-patches)**。如果加成应该作用于文化群体本身而非个体居民，请改用 `base_stats_meta`，参见 **[属性参考](#/nml/stats)**。

## 引导文化锻造的装备

这是文化特质独有的字段，也是无需修改任何武器就能让某种文化展现出鲜明*特色*的最优雅方式：

```csharp
trait.value = 10f;                       // 偏好的权重高低
trait.addWeaponSubtype("sword");         // 偏好整类武器
trait.addWeaponSpecial("hello_relic");   // 或偏好某个具体的物品 ID
```

这两个辅助方法都会为你自动设置 `is_weapon_trait = true`。当城镇决定打造何种装备时，锻造代码会读取文化的偏好武器；这改变的是士兵手中握着的实际武器，而不仅仅是一项数值加成。原版中的 `bow_lovers` 与 `spear_lovers` 完全就是按照这个模式实现的。两行代码，就有了一整个痴迷长矛的文化 :PESgn_Noice:。

| 字段 | 作用 |
| --- | --- |
| `is_weapon_trait` | 将特质标记为武器偏好 |
| `related_weapon_subtype_ids` | 偏好的武器类别。`addWeaponSubtype` 会追加至此 |
| `related_weapons_ids` | 偏好的具体物品（item） ID。`addWeaponSpecial` 会追加至此 |
| `value` | 偏好在计算中所占的权重 |

## 引导文化的建筑布局

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

接收一个 `PassableZoneChecker` 并设置 `town_layout_plan = true`。原版中的城镇布局特质（柱式城镇、道路密集型城镇）正是通过此机制运行的。

这是本页中最深度的钩子，也是最容易与其他 Mod 发生冲突的地方，因为一种文化在同一时刻只能遵循一套布局规划。在假定你的规划是唯一有效的之前，请先检查该文化已持有的特质中的 `town_layout_plan`。

## 原版分组

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

创建你自己的标签页：参见 **[特质分组与标签页](#/nml/trait-groups)**，使用 `AssetManager.culture_trait_groups` 与 `CultureTraitGroupAsset`。

## 文本本地化

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## 分发特质

```csharp
// 该物种的每个生物生成时均自带该特质
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// 或在运行时赋予已经存在的文化
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` 与 `addTrait` 均支持传入 ID 字符串或 Asset 对象。

## 从单位检查文化特质

由于这是一个极高频的需求，`Actor` 专门为此提供了一个快捷方法：

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] 文化还是亚种（subspecies）？
> 二者都会传播，但途径截然不同。**文化**特质随着城镇传播，任何加入该城镇的人都可以习得。**亚种**特质则通过繁殖基因遗传，无法被外人获得。「精灵箭术更好是因为从小受到的训练」属于文化；「精灵箭术更好是因为眼睛构造所赋予的天赋」属于亚种。参见 **[亚种特质](#/nml/subspecies-traits)** :catnoted:。
