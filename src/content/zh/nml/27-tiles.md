---
title: 地块与地形
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbrockies:
order: 170
---

# 地块与地形 :wbrockies:

整个游戏地图是由 `WorldTile` 组成的网格，每个地块格子在垂直方向上都叠加着**两层**类型：

| 层级 | 地块上的字段 | 对应资源库 | 类型 | 示例 |
| --- | --- | --- | --- | --- |
| 地面（Ground） | `main_type` | `AssetManager.tiles` | `TileType` | 土壤、沙子、岩石、深海、岩浆 |
| 顶层（Top） | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`、`grass_high`、`road`、`field`、`frozen_low`、城墙 |

二者在底层都继承自同一个基类（`TileTypeBase`），因此本页面上的所有技巧对它们完全通用。唯一的差异在于它们所处的图层，这由 `layer_type` 决定。

如果你想添加一种全新的*底土地面*，那是 `TileType`。如果你想添加覆盖在地面**之上**的东西（道路、城墙、农田作物、苔藓），那就是 `TopTileType`，而这往往才是你真正想要实现的东西。

## 克隆，切勿从零搭建

一个地块类型包含大约上百个字段，其中大部分仅仅服务于某一种特定的原版地块。我可不打算把一百个全列出来。找到关系最近的原版地块进行克隆即可：

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // color and has_biome_tags are [NonSerialized], so clone() skips them, and linkAssets()
            // worked them out at startup. Without this the minimap draws your tile see-through.
            moss.color = Toolbox.makeColor(moss.color_hex);
            moss.has_biome_tags = moss.biome_tags != null && moss.biome_tags.Count > 0;

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] 生物群系地块需要链接到它的群系
> 克隆草地块会复制 `is_biome = true` 和 `biome_id`，但 `BiomeAsset` 本身只会在游戏加载时于 `TopTileLibrary.linkAssets()` 里查一次。漏掉这一行，一切都正常，直到有动物生成在你的地块上：物种名要加群系后缀，群系却是 `null`，生成直接死在 `Subspecies.generateName()` 的 `NullReferenceException` 上 :wbfacepalm:。
>
> 图片也有同样的问题。`TopTileLibrary` 在启动时把 `tiles/<id>/` 里的 PNG 变成 `sprites`，所以少了最后那一段，地块能画上去，接着地图渲染器会为屏幕上它的每个地块在 `WorldTilemap.getVariation()` 里抛异常。


## 核心字段详解

### 基础属性分类

| 字段 | 作用 |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` 或顶层。决定其归属于哪个资源库 |
| `ground`, `liquid`, `ocean`, `lava` | 游戏全局用于分支判断的大类标识 |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | 地形家族分类标识 |
| `road`, `wall`, `farm_field` | 结构物标识。城镇AI会读取这些字段 |
| `block`, `block_height` | 是否阻挡通行以及视觉绘制高度 |
| `is_biome`, `can_be_biome`, `biome_id` | 将地块绑定到特定生物群系 |
| `biome_tags`, `has_biome_tags` | 哪些群系会自然蔓延生长出该地块 |

### 行为表现

如果你的地块是一个玩法创意，而不只是换个颜色，就从这里开始。

| 字段 | 作用 |
| --- | --- |
| `walk_multiplier` | 在其上的行走速度。`1.0` 为正常，数值越小越慢 |
| `damage_units`, `damage` | 站在其上是否会受到伤害以及伤害数值 |
| `damaged_when_walked` | 被单位踩踏时地块自身是否会磨损消耗 |
| `step_action`, `step_action_chance` | 每次有生物踩在其上时运行的自定义代码 |
| `unit_death_action` | 当有生物死在其上时执行的代码 |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | 燃烧与引火特性 |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | 冰冻特性 |
| `remove_on_heat`, `terraform_after_fire` | 受热和燃烧后留下的地表痕迹 |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | 爆炸特性 |
| `strength` | 抗击打强度。城墙类模组常读取此数值作为耐久度 |
| `cost` | 寻路（Pathfinding）代价 |

### 玩家交互

| 字段 | 作用 |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | 哪种上帝工具可以清理它 |
| `allowed_to_be_finger_copied` | 是否允许被“手指”复制工具抓取 |
| `can_build_on`, `can_be_farm` | 城镇是否可以在其上建造建筑或开垦农田 |
| `only_allowed_to_build_with_tag` | 仅允许带特定标签的建筑在此建造 |

### 状态演变与过渡

| 字段 | 作用 |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | 自然生长或被侵蚀时转变成的地块 |
| `freeze_to_id` | 冻结时转变成的地块 |
| `fill_to_ocean`, `can_be_filled_with_ocean` | 沉入水中时转变成的地块 |
| `lava_increase` / `lava_decrease` / `lava_level` | 岩浆专属的进阶阶段变化链 |

### 视觉外观

| 字段 | 作用 |
| --- | --- |
| `color_hex` | 小地图显示颜色以及着色基色 |
| `edge_color_hex` | 与其他地块交界时的外边框颜色 |
| `render_z`, `draw_layer_name` | 渲染层级。`setDrawLayer(...)` 为辅助方法 |
| `force_edge_variation`, `force_edge_variation_frame` | 强制锁定边界精灵图变体 |

## 当生物踩踏地块时运行代码

```csharp
moss.step_action_chance = 0.05f;   // 5% 的踩踏概率
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

与本指南中的其他所有动作完全遵循相同的原则：务必先做空值防护，没有执行操作时返回 `false`，并时刻牢记只要有单位在这种地块上走动，这段逻辑就会高频执行。

## 导入自定义贴图

地块是一个极为独特的特例：**它完全没有任何配置路径的字段**。游戏会自动搜索与地块 **id** 完全同名的文件夹，并将其中的所有图片作为随机变体加载进来。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- 必须与地块的 id 完全一致
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

代码里什么也不用写。只要文件夹名与注册的 id 一致，地块就会自己找过来。

该文件夹下的多个文件会变成随机变体，从而避免整片土地铺开时像单调的壁纸一样呆板。只放一张图片也能正常工作。地面与顶层地块都采用这种加载方式。

`color_hex` 是独立的且依然极其重要：小地图靠它绘制，当游戏需要调整地块明暗色调时也是基于它运算的。

## 运行时动态修改地块

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // 修改顶层地块
tile.setTileType(AssetManager.tiles.get("sand"));                // 修改底土地面
tile.setTileTypes("sand", null);                                 // 修改地面并清空顶层
```

这三个方法全都是公开的（public）。修改地块会自动将所在区块（chunk）标记为脏数据，渲染系统会自动刷新它。

### 检查地块现有状态

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

`main_type` 和 `top_type` 都有可能是 `null`。在读取任何属性前务必判空。这是所有遍历地图网格的模组中最常见的崩溃源头 :PES2_F:。

## 地形改造配置（TerraformOptions）

`AssetManager.terraform` 中的 `TerraformOptions` 是一组命名的“地块整备与清理规则”，供上帝能力和投射物调用：

| 字段 | 作用 |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | 清除结构与道路边界 |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | 清理残骸残留物 |
| `destroy_buildings`, `make_ruins` | 对地块上建筑物的处理方式 |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | 移除各种环境状态 |
| `add_burned`, `add_heat`, `flash` | 施加各种环境状态 |

`ProjectileAsset` 可以在 `terraform_option` 中指名引用它并搭配 `terraform_range`，爆炸箭着弹时将落点地面清理成平地正是这样实现的。

## 生物群系

`AssetManager.biome_library` 中的 `BiomeAsset` 决定了哪些地块在什么地方生成。地块通过 `setBiome("biome_forest")` 或拥有匹配的 `biome_tags` 加入某个生物群系。克隆现有的群系并替换其地块ID，比从零构建要轻松得多，且“克隆自带注册”的规律在此同样适用。

> [!TIP] 顶层地块才是模组的主战场
> 人们实际制作的大部分内容（城墙、道路、庄稼农田、在整块大陆上蔓延的腐化地带），全都是顶层地块配合 `step_action` 以及少许放置逻辑来实现的。全新的地面类型比较罕见，很难与其他地表自然融合，而且经常会以你意想不到的方式干扰世界生成器 :PES3_Yikes:。
