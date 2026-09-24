---
title: 家族特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbclanroses:
order: 110
---

# 家族特质 :wbclanroses:

**家族（Clan）**即是血统：一个繁衍得足够庞大以至于成为独立实体的家族，拥有属于自己的旗帜、专属颜色以及宗族声望。家族特质就是该血脉中所承载的特有潜能。

家族特质是游戏中最接近世袭超能力的机制，并且是唯一内置支持**雄性 / 雌性属性分流**的特质系统。

| | |
| --- | --- |
| 库 | `AssetManager.clan_traits` |
| 类 | `ClanTrait` |
| 分组 | `AssetManager.clan_trait_groups`，类 `ClanTraitGroupAsset` |
| 运行时持有者 | `Clan`，位于 `World.world.clans` |
| 本地化前缀 | `clan_trait_` |
| 默认图标路径 | `ui/Icons/clan_traits/` |

## 注册一个特质

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

家族的 `base_stats` 会合并进家族的每一名成员体内，因此与宗教不同，这是一个真正的属性加成系统。合并顺序请参见 **[属性参考](#/nml/stats)**。

## 雄性 / 雌性属性分流

其他特质类所不具备的两个专属字段：

```csharp
trait.base_stats["health"] = 20;           // 全体成员通用
trait.base_stats_male["damage"] = 6;       // 仅雄性生效
trait.base_stats_female["intelligence"] = 4;   // 仅雌性生效
```

`Actor.updateStats()` 先合并 `clan.base_stats`，随后依据单位的性别合并 `clan.base_stats_male` **或** `clan.base_stats_female`。这两个额外属性块在对象创建之初即已存在，并非在 `add()` 中延迟分配，因此你可以随时对其赋值写入。

## 决策：家族所*采取的行动*

原版家族特质更倚重决策（Decisions）而非直接的动作钩子，因为家族本质上是一种社会学组织：

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

决策是 `AssetManager.decisions_library` 中的 AI 行为选项。原版中的两个家族特质 `blood_pact` 与 `deathbound` 实质上是附带不同决策的同一特质，并且被声明为互斥对立。这种架构非常值得借鉴：两个特质、同一逻辑轴心、相互排斥。

## 战斗与特效钩子

```csharp
// 家族成员每次击中目标时触发
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// 定时器触发，作用于每一名家族成员
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

务必做好 null 检查，并在未执行任何实质操作时返回 `false`。这些钩子会针对拥有该特质的每个家族的每名成员高频运行。

## 需通过成就解锁

若干原版家族特质是作为成就奖励而非默认开放的：

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

被锁定的特质依然客观存在且机制完全生效；玩家只是在达成对应成就前无法在编辑器中主动选择它。注意 `BaseTraitLibrary` 还会自动为以此方式锁定的特质赋予 `rarity = R3_Legendary`，让你的奖励看起来名副其实 :gold_star:。

## 原版分组

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

创建你自己的标签页：参见 **[特质分组与标签页](#/nml/trait-groups)**，使用 `AssetManager.clan_trait_groups` 与 `ClanTraitGroupAsset`。

## 文本本地化

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## 分发特质

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

单位所属的家族存放在 `actor.clan` 中，通过 `actor.hasClan()` 可以得知其是否属于某个家族；实际上有大量单位终生未加入任何家族。

> [!TIP] 家族规模有限，尽可放手施为
> 一种文化能覆盖整片大陆；而一个家族仅局限于一家一姓，且 `limit_clan_members` 限制了其人数上限。在对世界整体平衡造成相同扰动的前提下，家族特质可以设计得比文化特质强悍得多。这使得家族成为安放各类震撼机制与超强特性的绝佳归宿 :PES5_Menace:。

## 允许新创建的家族随机获得该特质

除了通过代码手动授予外，家族特质还可以设置 `spawn_random_trait_allowed` 标志，以便在创建新家族时被自动随机抽取——这与文化的特质抽取机制完全一致。和其他所有特质页面一样的坑：

> [!WARNING] `spawn_random_trait_allowed` 仅在启动时读取一次
> 新创立的家族是从一个候选池中随机抽取初始特质的，而该池是在游戏启动阶段由 `BaseTraitLibrary.linkAssets()` 构建完成的——彼时你的模组尚未加载。仅仅在特质上设置此布尔标志没有任何效果：它永远不会进入该池，新建家族也永远不会随机获得它。你必须手动将其以原版权重添加到池中：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` 字段为 `protected`，但在 NML 提供的 publicized 程序集下能够正常编译。默认的 `spawn_random_rate` 为 `5`：调大该数值可提高其随机抽取权重。
