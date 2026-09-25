---
title: 건축 양식 및 건설 순서
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbhammer:
order: 181
---

# 건축 양식 및 건설 순서 :wbhammer:

도시가 세워질 때 아무렇게나 건물을 짓지 않습니다. 종족마다 고유한 건축 스타일과 엄격한 건설 순서를 따릅니다: 모닥불에서 시작하여 텐트, 목조 주택, 감시탑, 풍차, 마을 회관 순으로 확장됩니다.

**[커스텀 건물](#/nml/custom-buildings)** 에서 추가한 건물을 시민들이 신의 권능 없이도 자동으로 건설하게 만드는 방법을 배웁니다 :PESgn_Noice:.

## 두 개의 핵심 라이브러리

도시 건설 메커니즘은 협력하는 두 라이브러리로 제어됩니다:

| 라이브러리 | 에셋 | 역할 |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | 종족별 시각적 건물 스타일 (인간, 엘프, 오크, 드워프) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | 도시가 단계별로 실행하는 건설 계획표 |

건축 양식 에셋은 범용 역할(`"house"`, `"hall"`, `"tower"` 등)을 구체적인 건물 에셋 ID에 연결합니다.

건설 순서 에셋은 인구, 영토, 자원이 증가함에 따라 어떤 순서로 건물이 배치될지 결정합니다.

## 건설 순서 에셋 이해하기

`AssetManager.city_build_orders` 의 각 항목은 다음을 정의합니다:

- **`building_id`**: 배치할 건물 ID 또는 역할.
- **`requirements_population`**: 도시에 필요한 최소 인구수.
- **`requirements_buildings`**: 먼저 지어져 있어야 하는 선행 건물.
- **`requirements_zones`**: 도시가 확보해야 하는 최소 영토 타일 수.
- **`max`**: 단일 도시에 허용되는 해당 건물의 최대 개수.

## 코드

이 코드는 `AssetManager.city_build_orders` 에 접근하여 **[커스텀 건물](#/nml/custom-buildings)** 의 신전을 도시 건설 목록에 추가합니다:

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

## 커스텀 건축 양식 만들기

새로운 종족이나 문명을 만들 경우 고유한 `ArchitectureAsset` 을 등록합니다:

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

이후 종족이나 왕국 정의에서 `architecture = "hello_style"` 을 지정합니다.

## 주의해야 할 함정

- **자원 비용**: 건물에 도시에 없는 희귀 광물(금, 철)이 필요하면 인부들이 구역만 잡고 영구히 대기합니다. **[커스텀 건물](#/nml/custom-buildings)** 의 비용을 확인하세요.
- **우선순위(priority)**: 여러 건물의 요구 조건이 동시에 충족되면 `priority` 가 높은 항목을 먼저 짓습니다.
- **영토 면적 한계**: 작은 섬에 고립된 도시는 `requirements_zones` 가 섬 전체보다 클 경우 절대 짓지 못합니다 :PES2_HmmmmNoted:.
