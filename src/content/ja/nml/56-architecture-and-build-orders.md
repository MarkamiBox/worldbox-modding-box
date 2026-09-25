---
title: 建築様式と建設順序
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbhammer:
order: 181
---

# 建築様式と建設順序 :wbhammer:

都市が建設される際、適当に建物を乱立させるわけではありません。各文明は建築様式と厳密な建設順序に従います：焚き火、テント、木造家屋、見張り塔、風車、そして市庁舎へと発展します。

**[自作の建物](#/nml/custom-buildings)** で追加した建物を、プレイヤーの介入なしに市民たち自身の手で建設させるための設定をここで学びます :PESgn_Noice:。

## 2つのアセットライブラリ

都市の建設プロセスは2つのライブラリによって制御されます：

| ライブラリ | アセット | 役割 |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | 種族ごとの外見的建築スタイル（人間、エルフ、オーク、ドワーフ） |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | 都市が発展に合わせて順次建てるチェックリスト |

建築様式アセットは、一般的な役割（`"house"`、`"hall"`、`"tower"` など）に具体的な建物IDを割り当てます。

建設順序アセットは、人口や領土面積、資材の増加に応じてどの順番で建てるかを決定します。

## 建設順序アセットのパラメータ

`AssetManager.city_build_orders` の各項目は以下を定義します：

- **`building_id`**: 配置する建物ID（または役割名）。
- **`requirements_population`**: 都市に必要な最低人口。
- **`requirements_buildings`**: 事前に建っている必要がある前提建物。
- **`requirements_zones`**: 都市が確保している領土タイル数。
- **`max`**: 1つの都市に建てられる最大数。

## コード

このコードでは `AssetManager.city_build_orders` に接続し、**[自作の建物](#/nml/custom-buildings)** で作った神殿を都市の建設リストに登録します：

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

## 独自の建築様式を定義する

新しい種族を作成する場合、専用の `ArchitectureAsset` を登録します：

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

その後、種族または王国の設定で `architecture = "hello_style"` を指定します。

## よくある落とし穴

- **資源コスト**: 建物に都市が未保有の希少素材（金や鉄など）が必要な場合、建築予定地を確保したまま市民が放置します。**[自作の建物](#/nml/custom-buildings)** でコストを確認してください。
- **優先順位（priority）**: 複数の建設条件が同時に満たされた場合、`priority` の高いものが優先されます。
- **ゾーン面積の不足**: 小さな孤島では `requirements_zones` を満たせず永久に建設されないことがあります :PES2_HmmmmNoted:.
