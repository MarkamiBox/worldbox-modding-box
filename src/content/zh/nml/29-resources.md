---
title: 资源与食物
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbtomato:
order: 182
---

# 资源与食物 :wbtomato:

资源是指城镇所储存、交易、食用或锻造的一切物资：小麦、面包、石头、秘银、骨头、宝石。它们统一存放在 `AssetManager.resources` 中，是整个模拟经济的最底层骨架：农田种植什么、面包师烘焙什么、铁匠锻造需要什么，以及饥饿的居民吃下什么。在这种经济形势下，连面包都是一种数据结构 :PES2_Cash:。

## 从模板克隆

> [!WARNING] 不设 `full_sprite_path`，加载器就会抛异常
> `path_gameplay_sprite` 只是一半。库会在 `post_init()` 里用它拼出 `full_sprite_path`，只拼一次，而且是在游戏自己加载的时候，所以 mod 注册的资源那一项仍然是 `null`。精灵图预加载器接着调用 `getSpriteList(null)`，整个加载就死在 `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:。

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ 和 $TEMPLATE_STRATEGIC_MINERAL$ 是最理想的两个起点。
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // 这一项由库在 post_init() 里推导，而它已经跑完了。自己设。
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // 单位抱在怀中搬运时的精灵图

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## 字段详解

### 基础分类

| 字段 | 作用 |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | 单位是否会将其当成正餐食用 |
| `wood`, `mineral` | 匹配哪种采集工具与对应的采集职业 |
| `path_icon` | 背包和统计列表中的图标 |
| `path_gameplay_sprite` | 单位在地图上搬运该物资时手中捧着的贴图 |

### 进食效果

| 字段 | 作用 |
| --- | --- |
| `restore_nutrition` | 恢复的饱食度数值 |
| `restore_health` | 恢复的生命值比例 |
| `restore_stamina`, `restore_mana`, `restore_happiness` | 体力、法力与快乐度恢复数值 |
| `give_experience` | 进食后获得的经验值 |
| `tastiness`, `favorite_food_chance` | 被单位选为最爱食物的倾向与概率 |
| `diet` | 允许摄入该食物的生物食性 |
| `eat_action` | 当有生物吃下该食物时触发的自定义委托代码 |
| `give_trait_id`, `give_status_id`, `give_chance` | 进食时有概率附带赋予的特质或状态效果 |

### 生产与流转

| 字段 | 作用 |
| --- | --- |
| `ingredients`, `ingredients_amount` | 烹饪或锻造该物品所需的原料配方及数量 |
| `produce_min` | 单次生产工作周期产出的最小数量 |
| `mine_rate` | 采掘或收割的耗时效率 |
| `drop_max`, `drop_per_mass` | 来源被摧毁时掉落该物资的数量 |
| `stack_size`, `storage_max`, `maximum` | 单人搬运上限与城镇仓库储备上限 |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | 军队后勤补给行为 |
| `trade_cost`, `trade_give`, `trade_bound` | 城镇间商业贸易规则 |
| `money_cost`, `loot_value` | 货币标价与战利品价值 |

## 原版已有资源列表

非常值得提前浏览，因为复用现有资源通常远优于凭空新建：

**食物与食材：** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**战略与工业物资：** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## 导入自定义精灵图

一个资源需要两处贴图，但它们的路径解析方式**截然不同**。这也是极容易绊倒模组作者的地方：你也会被它坑一次的。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- 背包图标，直接放在根目录下
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- 单位手持的搬运贴图
```

```csharp
cake.path_icon = "iconHelloCake";        // 按代码所写路径直接加载
cake.path_gameplay_sprite = "hello_cake";   // 引擎会自动拼上 items/resources/hello_cake
```

`path_icon` 是常规完整路径，原版通常直接写文件名，因此文件位于 `GameResources/` 的根目录下。而 `path_gameplay_sprite` 会由引擎在底层自动拼接 `items/resources/` 前缀。如果你自己在代码里写上了子文件夹，引擎就会尝试查找 `items/resources/items/resources/...`，导致找不到任何图片。

## 将资源接入游戏世界

资源在被任何事物产出之前只是死数据。让其生效的三大核心途径：

```csharp
// 1. 生物被宰杀或死亡时掉落。
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. 建筑物被收割时产出。
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. 某个文化在城市工坊中制造。
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

第一次调用时的 `pNewList: true` 意为“开启一份全新的资源掉落列表，而不是直接追加在克隆母体的列表之后”。如果在克隆后遗漏此参数，你的新生物就会同时掉落母体原有的全部物资和你指定的新物资。

## 装备材质不是资源

装备的**材质**（铁、钢、秘银）是材质库里的 `ItemAsset`，而不是 `ResourceAsset`，尽管锻造该材质的武器确实需要消耗对应的矿石资源。这是游戏源码中命名最为混乱的概念之一。参见 **[自定义装备物品](#/nml/custom-items)**。

它们之间的桥梁是材质对象上的 `cost_resources` 字段，该字段注明了制造所需消耗的资源ID及数量。

> [!TIP] 优先添加新菜谱，而不是新食材
> 一种全新的*食材*需要完整的生产链：有东西种植它、有生物群系孕育它、有职业专门收割它。而一道全新的*菜谱*只需要利用现成已有的食材，就能瞬间无缝融入现有的面包房和贸易商路。前者要耗费一周，后者只需一个下午 :PES_ChillPill:。
