---
title: 王国特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbcrown:
order: 114
---

# 王国特质 :wbcrown:

**王国（kingdom）特质（trait）**是国家政策。它不是信仰，也不是血脉：它是王权做出的一项施行于整个王国的统治决策（decision）。

原版仅将该系统用于单一用途：税率设定。这使它成为七大特质系统中最袖珍也最空旷的领域 —— 因而也成为开辟全新玩法的绝佳场所。没有任何其他内容在此处争抢空间 :wbsmirk:。

| | |
| --- | --- |
| 库 | `AssetManager.kingdoms_traits` |
| 类 | `KingdomTrait` |
| 分组 | `AssetManager.kingdoms_traits_groups`，类 `KingdomTraitGroupAsset` |
| 运行时持有者 | `Kingdom`，位于 `World.world.kingdoms` |
| 本地化前缀 | `kingdom_trait_` |
| 默认图标路径 | `ui/Icons/kingdom_traits/` |

> [!WARNING] 王国属性（stats）不会传递给单位
> 与宗教（religion）相同，`kingdom.base_stats` 绝不会合并到 `Actor` 身上。你在游戏中见到的王国层面的宏观数值来自**国王自身的属性**（`king.stats["cities"]` 等），而非王国的特质数据块。
>
> 因此，王国特质是通过其专属字段与逻辑代码来改变王国的，而非通过 `base_stats`。

## 税率相关字段

仅王国特质才拥有的三个专属字段，也是原版利用该系统实现的全部功能：

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| 字段 | 作用 |
| --- | --- |
| `is_local_tax_trait` | 该特质决定王国的**地方**税率 |
| `is_tribute_tax_trait` | 该特质决定王国的**朝贡**税率 |
| `tax_rate` | 税率数值本身（以小数比例表示） |

每当王国特质发生变动时，王国都会从头重新计算这两项税率：先读取 `SimGlobals` 中的全局默认值，然后遍历其特质，由匹配的特质直接**覆盖**既有数值。

> [!WARNING] 后者优先覆盖：务必声明互斥特质
> 税率特质不会叠加。如果一个王国持有两条 `is_local_tax_trait` 特质，在特质集合中靠后遍历到的那一条会无声无息地胜出，具体取决于迭代顺序。
>
> 原版所有的税率特质都将彼此声明为对立特质正是出于此原因。请在双方均声明互斥，否则你的税率设置有时生效有时失效 :PES5_HmmmmNo:。

## 正确注册一个特质

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` 只在启动时读取一次
> 新王国的初始特质是从一个随机池里抽的，这个池子由 `BaseTraitLibrary.linkAssets()` 在游戏加载时、你的模组还不存在时建好。光在你的特质上打开这个开关什么都不会改变：你的特质根本不在那个池子里，也永远不会随机出现。按原版的权重方式自己把它放进去：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` 是 `protected` 的，所以它会针对 NML 本来就用来编译你模组的公开化程序集进行编译。`spawn_random_rate` 默认是 `5`：调高它，特质就会更常出现。

## 编写一条真正生效的国家政策

由于 `base_stats` 无法生效，王国特质通常依靠以下两种方式发挥作用。两种都比一个数字费事，但两种都值得。

**AI 决策（Decision）**：最为轻巧规范的选择：

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**读取特质的 Harmony 补丁**：这是构建真正国家政策体系的核心手段。拦截王权决策所调用的底层方法，并在其中检查王国持有的特质：

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

这是非税率类王国政策的标准通用模式：特质充当状态开关，而补丁负责实际逻辑。参见 **[Harmony 补丁](#/nml/harmony-patches)**。

## 原版分组

`tribute` · `local_tax` · `miscellaneous` · `fate`

共四个分组，其中两组为税率专用。如果你打算制作两个以上的政策，建议为它们开设独立标签页，参见 **[特质分组与标签页](#/nml/trait-groups)**，使用 `AssetManager.kingdoms_traits_groups` 与 `KingdomTraitGroupAsset`。

## 文本本地化

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## 分发特质

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

构建阵营所依据的王国 Asset 是独立的实体，参见 **[王国与阵营](#/nml/kingdoms)**。

> [!TIP] 虚席以待的空旷殿堂
> 七大特质系统中有六个塞满了原版预设，制作 Mod 时不得不小心规避。而这套系统里总共只有区区五个特质。如果你想做出一套毫无违和感且绝不与任何既有内容冲突的 Mod，一套王国政策体系是性价比最高的首选 :PES2_Cash:。
