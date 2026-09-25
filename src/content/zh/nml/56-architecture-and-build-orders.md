---
title: 建筑风格与建造顺序
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbhammer:
order: 181
---

# 建筑风格与建造顺序 :wbhammer:

当一座城市建立时，它绝非在地图上随意搭建房屋。每个种族都遵循特定的建筑风格与严密的建造顺序：首先是营火，接着是帐篷、木屋、警戒哨塔、风车和市政厅。

如果你在 **[自定义建筑](#/nml/custom-buildings)** 中创建了新建筑，掌握这套逻辑就能让居民在不借助神力的情况下自动建造它 :PESgn_Noice:。

## 两大核心资源库

文明的城镇营建由两个密切协作的资源库负责：

| 资源库 | 资源类型 | 核心作用 |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | 建筑的视觉风格分配（人类、精灵、兽人、矮人） |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | 城镇逐步扩建时遵循的施工清单 |

建筑风格资源将通用的建筑职能映射到具体的建筑资源 ID（例如该种族使用哪个 ID 作为 `"house"`、`"hall"` 或 `"tower"`）。

建造顺序资源则规定了随着人口、领土和资源的增长，这些建筑以何种先后顺序被逐一放置。

## 解析建造顺序资源

`AssetManager.city_build_orders` 中的每一项包含：

- **`building_id`**：放置哪个建筑资源（或通用职能）。
- **`requirements_population`**：城市所需的最低人口门槛。
- **`requirements_buildings`**：必须先行存在的前置建筑（例如市政厅之于兵营）。
- **`requirements_zones`**：城市必须占领的领土地块数量。
- **`max`**：单座城市允许建造该建筑的最大数量上限。

## 代码实现

该代码接入 `AssetManager.city_build_orders`，将来自 **[自定义建筑](#/nml/custom-buildings)** 的神殿加入城市建设清单中：

```csharp Mods/HelloBox/Code/HelloBuildOrders.cs
using System;
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBuildOrders
    {
        public const string ORDER_ID = "order_hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.city_build_orders.has(ORDER_ID)) return;

            // 1. Create a build order rule for the shrine
            CityBuildOrderAsset shrineOrder = new CityBuildOrderAsset
            {
                id = ORDER_ID,
                building_id = "hello_shrine",
                requirements_population = 15,
                requirements_zones = 10,
                max = 1,
                priority = 5
            };

            AssetManager.city_build_orders.add(shrineOrder);

            // 2. Insert into the human build order list
            CityBuildOrderAsset humanOrder = AssetManager.city_build_orders.get("human");
            if (humanOrder != null && humanOrder.list != null)
            {
                if (!humanOrder.list.Contains(ORDER_ID))
                {
                    humanOrder.list.Add(ORDER_ID);
                }
            }
        }
    }
}
```

## 创建自定义建筑风格

如果你正在创造全新种族或独立文明，可以注册新的 `ArchitectureAsset`：

```csharp
ArchitectureAsset arch = new ArchitectureAsset
{
    id = "hello_style"
};

arch.buildings["bonfire"] = "bonfire_human";
arch.buildings["tent"] = "tent_human";
arch.buildings["hall_0"] = "hall_human_0";
arch.buildings["hall_1"] = "hall_human_1";
arch.buildings["shrine"] = "hello_shrine";

AssetManager.architecture_library.add(arch);
```

然后在你的种族或王国定义中设置 `architecture = "hello_style"` 即可。

## 需要规避的隐患

- **资源消耗**：如果建筑需要城市未储备的稀有材料（如黄金或铁矿），工人们会长期圈占地块原地等待。请在 **[自定义建筑](#/nml/custom-buildings)** 中核对成本。
- **建造优先级**：当多个建造项目同时满足人口与地块条件时，`priority` 权重更高的建筑会被优先开工。
- **领地地块限制**：若 `requirements_zones` 超过了岛屿总面积，受困于微型岛屿的城市将永远无法建造该建筑 :PES2_HmmmmNoted:。
