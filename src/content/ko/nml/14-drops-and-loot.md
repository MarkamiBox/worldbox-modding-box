---
title: 드롭 & 낙하물
group: 게임 콘텐츠
subgroup: 아이템 및 장비
icon: :wbloot:
order: 126
---

# 드롭 & 낙하물 :wbloot:

**드롭**(drop)은 하늘에서 떨어져 타일에 착지할 때 무언가를 일으키는 작은 오브젝트입니다. 비, 피, 씨앗, 불, 산성 물질, 동전 등이 있죠. 맵에서 무언가를 *일으키는* 가장 값싼 방법이며, 애니메이션과 사운드가 기본으로 제공됩니다.

## 드롭 등록하기

드롭은 `AssetManager.drops` 에 존재합니다. 다음은 타일에 착지하여 불을 지르는 드롭의 예시입니다:

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // 땅에 닿는 순간 실행되는 동작
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

그런 다음 `Main.cs` 에 다음 줄을 추가합니다: `HelloDrops.Initialize();`

### 필드 설명

| 필드 | 의미 |
| --- | --- |
| `id` | 다른 모든 곳에서 사용할 고유 이름 |
| `path_texture` | 스프라이트, 다른 모든 리소스와 동일한 경로 규칙 |
| `type` | `DropType.DropMagic`, `DropGeneric`, … 게임 내부 처리 방식을 결정 |
| `animated` + `animation_speed` | 스프라이트 목록을 애니메이션으로 재생 |
| `default_scale` | 크기. 작은 드롭의 경우 보통 `0.1f` |
| `falling_speed` | 떨어지는 속도 |
| `sound_drop` / `sound_launch` | FMOD 사운드 이벤트 |
| `action_landed` | **핵심 필드**: 착지하는 순간 여러분의 코드가 실행됨 |
| `action_launch` | 투척될 때 실행됨 |

## 커스텀 스프라이트

`path_texture` 는 `GameResources/` 내부에서 작성한 경로 그대로 로드됩니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

드롭은 **스프라이트 목록** 으로 불러옵니다. 게임은 그 폴더 *안의* PNG 를 모두 읽고, 그래서 `animated` 가 동작합니다. 움직이지 않는 드롭도 프레임 하나가 든 폴더입니다. 폴더 없는 `drops/hello_ember.png` 는 빈 목록이 되고, 드롭은 안 보이게 떨어집니다 :wbwiltedrose:.

## 드롭 떨어뜨리기

두 가지 방법이 있으며, 둘 다 `World.world.drop_manager` 에 있습니다:

```csharp
// 타일 위로 수직 낙하: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// 폭발로 잔해가 튀는 것처럼 포물선으로 투척
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

90%의 상황에서는 `spawn` 이 정답입니다. `15f` 는 떨어지는 높이로, 숫자가 클수록 착지하는 데 더 오래 걸립니다. 떨어지는 동안 더 극적으로 보이기도 합니다.

## 실전 예제: 신의 권능으로 불씨 비 내리기

**[신의 권능](#/nml/god-powers)** 페이지를 완료하셨다면 이것이 그 결실입니다. 권능 (GodPower) 하나로 타일 전체를 불태워보죠.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // 중앙에 하나, 주변 인접 타일마다 하나씩
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] 드롭은 게으른 모더를 위한 특수 효과
> 파티클 시스템을 직접 만들기 전에, 스프라이트와 `action_landed` 를 가진 드롭으로 해결할 수 없는지 먼저 자문해보세요. 보통 사운드까지 포함해 단 열 줄로 해결됩니다 :PESgn_Noice:.
