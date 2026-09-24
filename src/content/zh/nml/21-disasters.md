---
title: 灾难
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbmeteorite:
order: 184
---

# 灾难 :wbmeteorite:

自然灾害是游戏世界自发产生的突发事件：龙卷风、热浪、陨石坠落等。游戏会随着时间推移自动掷骰抽取灾害，因此与神圣力量不同，**玩家无需手动点击任何按钮**。你只需配置好触发条件，世界本身会搞定剩下的一切。

## 添加自然灾害

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

在 `Main.cs` 中注册它（参见 **[完整模组范例](#/nml/all-together)**），载入一个至少拥有 1 座城市和 100 个生物的世界并耐心等待。用不了多久，天空就会开始自发向下倾泻余烬 :wbfireskull:。

### 字段说明

`rate` 和 `chance` 是你最常调整的两个。页面底部的警告解释了原因。

| 字段 | 说明 |
| --- | --- |
| `rate` | 权重：与其他灾害相比被抽中的相对概率 |
| `chance` | 被初选后进行的二次触发概率判定 |
| `min_world_population` / `min_world_cities` | 发生所需满足的最小世界人口/城市数门槛 |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | `WorldLogAsset` 的 ID：世界日志中的事件分录。**不是**直接填本地化文本键，详见下文 |
| `action` | 自定义执行代码。灾害的具体逻辑 |
| `spawn_asset_unit` + `units_min`/`units_max` | 快捷配置：“生成 N 个该生物” |
| `max_existing_units` | 若世界上已有该数量的生物则不再生成 |

## 无需编写逻辑生成生物

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

“无需编写代码”几乎是事实。但自然灾害**必须**指定 `action`，因为灾害触发系统在没有判空的情况下直接调用该委托：若留空，第一次抽中你的灾害时就会触发 `NullReferenceException`。原版所有的生物型灾害均直接指向库内置的生成器 `simpleUnitAssetSpawnUsingIslands`，该方法会读取 `spawn_asset_unit`、`units_min`、`units_max` 以及 `max_existing_units`，并自动替你写好世界日志分录。你的自定义灾害也可以直接复用它。

## 世界日志分录

`world_log` 填写的不是直接的显示文本，而是 `AssetManager.world_log_library` 中的 **`WorldLogAsset` 资产 ID**，该资产才会指向具体的本地化文本键。如果填写了一个未注册的 ID，在灾害触发并记录日志时，`WorldLog.logDisaster()` 会基于 `null` 构建消息，从而抛出 `NullReferenceException` :wbfacepalm:。

原版灾害统一克隆自 `$basic_disaster$` 模板，该模板自带警告橙黄色调和 "disasters" 日志分组。上文的 `HelloDisasters` 也采取了相同的克隆方式：

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

随后需要有代码将该行消息写入日志。原版生成器内部会自动调用 `WorldLog.logDisaster(pAsset, tile)`。自定义的 `action` 则不会自动记录，因此我们需要手动调用一次，并将风暴起始的地块传入：点击日志中的“定位”按钮时就会跳转到该地块。

| `WorldLogAsset` 字段 | 作用说明 |
| --- | --- |
| `locale_id` | 本地化文本键。留空时默认回退为自身 ID |
| `path_icon` | 显示在日志行首的图标路径 |
| `color` | 日志行的文本颜色。模板默认使用醒目的警示色 |
| `group` | 归属于世界日志的哪个筛选分类页签 |
| `random_ids` | 随机从多个文本中抽取其一：`<locale_id>_1`、`_2`... |

群狼之年的示例同样需要这两项配置：克隆一个 ID 为 `disaster_hello_wolf_year` 的日志资产，并在语言包中添加 `worldlog_disaster_hello_wolf_year` 文本。原版生成器会自动为你记录该条日志。

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

请像撰写新闻头条那样简明扼要地编写文本，而不是写成解释性描述。“余烬从天而降”胜过“一个与余烬相关的事件已开始”。这是玩家在世界日志中直观读取的句子。

> [!WARNING] 调试时请调高触发参数
> `rate = 4, chance = 0.5f` 意味着你可能需要干等二十分钟才能目睹一次灾害触发。在开发阶段，建议将 `rate` 调得极高并将所有前置门槛设为 0，发布前再调回正常数值 :PES2_EvilPlan:。
