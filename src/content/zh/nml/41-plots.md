---
title: 阴谋与策划分录
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbrebellion:
order: 180
---

# 阴谋与策划分录 :wbrebellion:

**阴谋 (Plot)** 是统治者发起、出资并耗时推演的长期密谋：发起叛乱、发动新战争、缔结同盟。当阴谋进度条填满时，你编写的代码便会触发执行。从“某人起意”到“某事成真”的所有中间调度完全由游戏原生系统托管——这也正是使用该系统的核心价值：玩家可以在阴谋面板中清晰看到你的阴谋，带有发起者、进度条和独立旗帜，全套 UI 均开箱即用。

## 注册一个阴谋

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

现在，只要一位城市领袖拥有 10 枚金币、管理着一座城市且没有更紧急的事务，就可能会筹备一场余烬节。当筹备进度完成时，全城所有居民都会通过 **[王国与派系](#/nml/kingdoms)** 中介绍的情绪事件提升幸福度，天空中还会向组织者降下一场余烬之雨（这就是 HelloBox 的特色风格）。

> [!WARNING] `check_is_possible` 是必填项
> 每当领袖评估是否要开展你的阴谋时，`PlotAsset.checkIsPossible()` 都会在没有 null 检查的情况下直接调用该委托。若未设置该字段，第一个尝试扫描该阴谋的领袖就会直接触发 `NullReferenceException` 崩溃。若无特殊前置条件，请务必直接返回 `true`。

> [!WARNING] 基础阴谋池在启动时已构建完成
> 领袖只会从 `plots_library.basic_plots`（以及其所在宗教的仪式池）中挑选阴谋。`linkAssets()` 在游戏启动、你的模组载入之前，就已经把标记了 `is_basic_plot` 的阴谋收集进了该列表。因此仅设置布尔标志是不够的：你必须在代码里手动将其加入该列表。

## 字段全解析

### 发起资格与门槛

| 字段 | 功能作用 |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | 允许发起该阴谋的身份角色。若均未启用则无人能发起 |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | 发起者需达到的最低等级与声望门槛 |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | 属性门槛。默认值均为 2 |
| `money_cost` | 启动资金消耗（玩家手动强制发起时免费） |
| `requires_diplomacy` / `requires_rebellion` | 仅在对应的世界法则开启时才允许触发 |
| `check_is_possible` | 启动前置判定委托（必填） |

### 推演与执行流程

| 字段 | 功能作用 |
| --- | --- |
| `progress_needed` | 阴谋推进至触发所需的总工作量 |
| `check_should_continue` | 推进过程中持续检查。返回 `false` 会立即中止阴谋 |
| `action` | 进度条填满时触发的代码。执行成功请返回 `true` |
| `post_action` | 在 `action` 成功执行后紧接着触发的后置处理 |
| `try_to_start_advanced` | 针对带目标的复杂阴谋覆盖默认启动逻辑（原版叛乱在此设置 `target_kingdom`） |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | 检查阴谋的目标实体是否依然存活 |

### 视觉呈现与分类

| 字段 | 功能作用 |
| --- | --- |
| `path_icon` | 阴谋在列表与旗帜上显示的图标路径 |
| `group_id` | 所属类别：`diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | 在同类候选阴谋池中的抽取权重 |
| `is_basic_plot` | 是否允许任何普通领袖发起。若为 false 则仅能作为宗教仪式出现（参见 **[宗教特质](#/nml/religion-traits)**） |

## 本地化文本

一个阴谋需要配置三个本地化词条：名称、进行时描述文本和通用基础描述。第二条文本中会自动注入 `$initiator_actor$`、`$initiator_city$`、`$initiator_kingdom$` 和 `$target_kingdom$` 等占位变量。

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] 通过强制发起快速测试
> 等待领袖自然触发阴谋往往需要漫长的等待。你可以直接选中一个单位，在面板的阴谋标签页中手动强制发起：该单位仍需满足允许的身份之一，`check_can_be_forced`（可选）决定按钮是否点亮，但强制发起的阴谋无需支付金币。这是验证你的 `action` 代码最迅速的途径 :PES2_EvilPlan:。
