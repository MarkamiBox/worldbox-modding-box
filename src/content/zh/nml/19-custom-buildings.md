---
title: 自定义建筑
group: 游戏内容
subgroup: 生物实体、建筑与 AI
icon: :wbcities:
order: 142
---

# 自定义建筑 :wbcities:

在建筑（Building）这一步，WorldBox 的 mod 开发不再是“改改数字”那么轻松，而是变成了“这个资源（resource）有一百四十多个字段，而对于我的需求来说大部分毫无用处” :PES2_Weary:。

所以我们绝不会从零开始手写建筑。我们要克隆一个已经稳定运行的成品。

## 先克隆，后微调

`clone(newId, sourceId)` 会复制原资源的所有字段、给它改名，**并且注册它**。最后这一点很重要：

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

你没设置的所有东西都会和 `temple_human` 上的一模一样，而那是一座能正常运作的城市建筑。整个诀窍就是这样。

> [!WARNING] 不要在 `clone()` 之后调用 `add()`
> `clone()` 已经注册过这个副本了。之后再调用 `AssetManager.buildings.add(shrine)` 会注册第二次，导致资源库丢掉第一个副本，并在日志里记下 `duplicate asset - overwriting...`。它照样能用，但这是日志里的噪音，也是任何审查你代码的人第一个会指出来的地方。

## 应该从哪里克隆

建筑库中不仅包含现成建筑，还包含以 `$…$` 命名的预设模板：

| 克隆源 | 适用对象 |
| --- | --- |
| `$building$` | 最纯粹的建筑裸基类 |
| `$city_building$` | 城市建造的任何常规建筑，如 `well`（水井）和 `mine`（矿井） |
| `$city_colored_building$` | 同上，但附带王国（kingdom）代表色染色支持 |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | 各文明种族的专用建筑 |
| `$building_creep$` | 蔓延感染物（creep）结构 |
| `$mineral$` | 可开采的矿石与岩石 |
| `$resource$`, `$flora_small$` | 可采集的自然植物 |
| `tree_green_1` | 原版所有的树木皆由此克隆而来 |

非常值得作为克隆源的现成建筑：`house_human_0` … `house_human_5`、`barracks_human`、`temple_human`、`library_human`、`market_human`、`docks_human`、`well`、`mine`、`mineral_stone`、`mineral_gold`。

花十分钟挑选一个最接近的模板进行克隆，能替你省去一整晚在各种毫无反应的字段中痛苦摸索的时间。

## 按需求分类的字段一览

### 建筑种类与归属

| 字段 | 作用说明 |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | 归属城市，享有王国配色、区域地块（tile）与岗位分配 |
| `type` | 游戏内部列表用以分类分组的自由文本标签 |
| `kingdom`, `civ_kingdom` | 限制建造该建筑的具体阵营 |
| `ignored_by_cities` | 城市绝不会建造它，也不会将其计入建筑统计 |

### 住宅与功能用途

| 字段 | 作用说明 |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | 是否允许市民入住及最大容纳人数 |
| `housing_happiness` | 居住在该建筑中获得的幸福感加成 |
| `storage`, `storage_only_food`, `is_stockpile` | 是否充当资源仓库及其类型 |
| `book_slots` | 图書館的书籍藏量容量 |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | 船坞与船只生产能力 |
| `spawn_units`, `spawn_units_asset` | 持续生成指定生物单位 |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | 箭塔攻击与远程投掷射击 |

### 建造与放置规则

| 字段 | 作用说明 |
| --- | --- |
| `cost`, `construction_progress_needed` | 城市建造所需支付的资源成本与建造耗时 |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | 升级链条，例如人类房屋 `house_human_0` 至 `_5` |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | 建筑在城镇内的放置倾向（中心或边缘） |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | 建筑间距检查与置换规则 |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | 建筑数量上限控制 |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | 地形与水域放置规则 |
| `build_road_to` | 城市是否会自动铺设通往该建筑的道路 |

### 自然生长与植被

| 字段 | 作用说明 |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | 随着世界运转是否会自行随机滋生 |
| `growth_time`, `has_resources_grown_to_collect` | 瓜果与作物的成熟采集周期 |
| `biome_tags_growth`, `has_biome_tags` | 适宜生长的群系（biome）标签 |
| `resources_given`, `addResource(id, amount, pNewList)` | 被采集或砍伐时提供的资源种类与数量 |
| `can_be_chopped_down`, `gatherable` | 单位是否能够砍伐或采集它 |
| `grow_creep` 及其系列 `grow_creep_*` 字段 | 蔓延类生物质的扩散行为（behaviour） |

### 伤害与损毁

| 字段 | 作用说明 |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | 能够对建筑造成伤害的自然危害 |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | 被摧毁后残留的废墟表现 |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | 建筑被拆除或遭水淹没时的销毁规则 |
| `loot_generation` | 倒塌时掉落的战利品 |

### 外观表现

| 字段 | 作用说明 |
| --- | --- |
| `sprite_path` + `main_path` | 贴图精灵的具体路径 |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | 所绑定的精灵图集 |
| `scale_base`, `bonus_z`, `random_flip` | 缩放基数、图层深度优先级、随机左右翻转 |
| `shadow`, `shadow_bound`, `shadow_distortion` | 建筑阴影参数 |
| `has_kingdom_color` | 是否应用所属王国的颜色染色 |
| `draw_light_area`, `draw_light_size` | 夜间光源发光范围 |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | 动画播放状态（status）与帧率 |

### 运作行为

| 字段 | 作用说明 |
| --- | --- |
| `step_action`, `has_step_action` | 建筑自身 tick 更新时执行的自定义委托代码 |
| `base_stats` | 建筑为城市或环境提供的数值加成 |
| `priority` | 在城市建造队列中的优先级权重 |

## 贴图精灵

建筑从 `sprite_path` 加载美术资源，并且**完全按你写的**使用。只有当你把 `sprite_path` 留空时，游戏才会退回到 `main_path + id`。把你的美术资源放在 `GameResources/buildings/hello_shrine/` 下，并在 `sprites.json` 里给它设一个底部居中的锚点，否则你的神龛会像幽灵一样飘在地面上方 :aPES_GhostDance:。见 **[贴图与素材资源](#/nml/sprites-and-resources)**。

## 自定义贴图

从下面两种形式里选一种，不要混用。加载器的逻辑就是字面意思：`sprite_path` 里有东西就用它，否则用 `main_path + id`。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

**文件名就是格式**。加载器会在 `_` 处拆开每个文件名：前面是种类（`main`、`construction`、`ruin`、`disabled`、`spawn`、`special`，以及用于小地图的 `mini`），后面的数字是动画帧。`mini_0` 的像素数必须和建筑占用的地块数完全一致，从 `temple_human` 克隆来的都是 5x4；漏掉它的话，小地图每次重绘都会在 `Building.getColorForMinimap()` 里抛出 `NullReferenceException`。`main_0`、`main_1`、`main_2` 是一个三帧动画。其他名字的文件不算帧，没有 `main_0` 的文件夹则让建筑无图可画。

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

如果混用，也就是把文件夹写进 `main_path` 又让 `sprite_path` 为空，游戏就会去找 `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:。

> [!WARNING] 设好路径之后，自己加载帧
> 游戏会在它自己的预加载阶段为每个建筑填充 `building_sprites`，而这个阶段在你的模组之前运行。你之后注册的建筑帧列表是空的，第一次放置时游戏就会在 `Building.setAnimData()` 里因 `ArgumentOutOfRangeException: Index was out of range` 崩溃 :wbfacepalm:。设好 `sprite_path` 后就调用 `shrine.loadBuildingSprites();`。
>
> 它的兄弟是 `atlas_asset`，也就是把建筑染成主人颜色的精灵图集。资源库同样在启动时通过 `checkAtlasLink()` 链接它。跳过它的话，建筑能正常放置，但之后**只要它在屏幕上，每一帧**都会在 `DynamicSprites.getRecoloredBuilding()` 里抛出 `NullReferenceException`。

在你的 `sprites.json` 里给它设一个**底部居中的锚点**，否则你的神龛会像幽灵一样飘在地面上方（见 **[贴图与素材资源](#/nml/sprites-and-resources)**）。

## 在地图上放置建筑

`World.world.buildings.addBuilding(...)` 被标记为 `internal`，因此该方法只有在引用了 **公开化（publicized）** 的 `Assembly-CSharp.dll` 时才能编译——参见 **[状态效果](#/nml/status-effects)** 中的注意事项：

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

永远先调用 `canBuildFrom` 进行可行性检查。强行把建筑扔在水面上、已有建筑物上方或者已被城市划作他用的地块上，会导致当前世界看似完好无损，却在三分钟后彻底崩溃 :PES_OhShit:。


## 让城市自主建造该建筑

用神力（GodPower）手动放置神龛玩一晚上确实很有趣。但让城市在规模壮大后自己规划并建造神龛，才是真正的模组体验。城市在决定建造什么时依赖于两套系统，而你的新建筑目前在两边都还不存在：

| | 包含的内容 |
| --- | --- |
| **城市建造规划** (`AssetManager.city_build_orders`) | 一组建造指令 Key（例如 `order_temple`），以及每条指令对应的人口和建筑数量门槛 |
| **种族建筑风格** (`AssetManager.architecture_library`) | 某个指令 Key 在特定种族下对应哪个具体建筑：人类的 `order_temple` 对应 `temple_human`，兽人则对应兽人神庙 |

因此，你需要定义一个订单 Key，教会每种种族建筑风格它所指代的目标建筑，并将其注册到建造规划列表中：

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // 自定义建筑类型，防止城市把神龛当作普通神庙统计
    shrine.type = "type_hello_shrine";

    // 建筑风格查找本质是一个简单的字典：未知的 Key 会导致该种族的每个城市在建造时报错。
    // 因此必须将其添加到所有建筑风格中，即使某些种族永远不会建造它。
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // 参考神庙的标准限制：上限 1 座，需要 50 人口，城市已有 15 座建筑
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

在 `Initialize()` 的末尾、克隆建筑之后调用 `AddToCities()` 即可。

与本指南中其他很多内容不同，这里没有任何隐藏的生命周期陷阱：`CityBehBuild.calcPossibleBuildings()` 每次评估建造机会时都会重新读取每个城市的建造规划列表，因此在模组加载时添加的订单会立刻对第一个进行建造判定的城市生效。城市仍然需要能够支付建筑的建造消耗 (`cost`) 并满足所有建造条件；如果无法满足，它会静默跳过神龛 :PES5_Hmmmm:。

| `addBuilding(...)` 参数 | 作用说明 |
| --- | --- |
| `pID` | 建造订单 Key，而不是建筑本身的 ID |
| `pLimitType` | 该城市最多允许建造几座此类建筑。神庙使用 `1` |
| `pPop` | 所需的最低城市人口门槛 |
| `pBuildings` | 城市中已存在的最低建筑总数门槛 |
| `pCheckFullVillage` | 仅当所有现有民居住满时才允许建造 |
| `pCheckHouseLimit` | 用于民居：在住房充足时跳过，达到房屋上限时停止 |
| `pMinZones` | 城市所需占领的最低领地地块数量 |

## 文本与本地化

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] 克隆之前先读原版代码
> 在 **dnSpy** 中打开 `BuildingLibrary`，仔细看看 `house_human_0`、`tree_green_1` 和 `mineral_stone` 之间的差异。原版的每一个建筑都是在那里用纯粹的 C# 组装出来的，这绝对是你能找到的最佳字段对照宝典 :PES_Smart:。
