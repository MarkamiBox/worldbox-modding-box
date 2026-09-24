---
title: 구름 및 날씨
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbtornado:
order: 172
---

# 구름 및 날씨 :wbtornado:

구름은 맵 위를 떠다니며 바로 아래에 있는 모든 대상에게 무언가를 떨어뜨리는 스프라이트입니다. 비, 산성액, 용암, 눈, 화염: 이들은 모두 색상과 `drop_id`만 다른 동일한 에셋입니다.

구름은 모더에게 있어 게임 전체에서 가장 가성비가 뛰어난 요소입니다. 단 하나의 에셋으로, 새로운 그림도 필요 없이 알아서 움직이고, 액체를 떨어뜨리고, 지면을 비추며 재앙 목록에도 스스로 등록됩니다.

## 구름 등록하기

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] 늦게 등록한 구름에는 스프라이트가 없다
> `CloudLibrary` 는 게임 로드 중 한 번에 `path_sprites` 로 `cached_sprites` 를, `color_hex` 로 `color` 를 만듭니다. 당신의 구름은 그때 목록에 없었으니 둘 다 비어 있고, 처음 나타나는 순간 `Cloud.prepare()` 에서 `NullReferenceException` 이 납니다 :wbfacepalm:. 위 `Initialize` 의 마지막 여섯 줄이 그 작업을 대신 합니다.


### 주요 필드

바닐라 구름을 클론하고 `drop_id`와 `color_hex`만 바꾸세요. 그 이상 필요 없는 구름도 많습니다.

| 필드 | 역할 |
| --- | --- |
| `color_hex` | 색조. 구름의 시각적 개성의 대부분을 결정합니다 |
| `max_alpha` | 불투명도. 기본값 `0.8` |
| `drop_id` | 떨어뜨릴 드롭. 바닐라 또는 직접 만든 `AssetManager.drops` 내 임의의 ID |
| `cloud_action_1` / `cloud_action_2` | 독립적으로 실행되는 두 개의 액션, 각각 개별 타이머 보유 |
| `interval_action_1` / `interval_action_2` | 각 액션이 실행되는 주기(초) |
| `speed_min` / `speed_max` | 이동 속도. 구름마다 이 범위 내에서 무작위로 결정됨 |
| `path_sprites` | 스프라이트 목록. 게임이 구름마다 하나씩 선택함 |
| `considered_disaster` | 게임이 이를 공식 재앙으로 취급할지 여부 |
| `normal_cloud` | 특수 이벤트가 아닌 일반적인 날씨로 표시 |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | 화염 및 용암 구름을 위한 지면 발광 효과 |

## 구름 액션이란 무엇인가

`CloudAction`은 활성화된 구름 (cloud) 인스턴스를 받아 아무것도 반환하지 않는 델리게이트입니다:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction`은 바닐라 기본 액션입니다. 구름 스프라이트 아래의 무작위 타일을 골라 그곳에 `drop_id` 하나를 스폰합니다. 90%의 상황에서는 이것만으로 충분하며, `cloud_action_1`에 지정하고 끝내면 됩니다. 게으르면서 올바른 것, 제가 제일 좋아하는 조합입니다 :pepeOK:.

특별한 효과를 더하고 싶다면 직접 메서드를 작성하여 `cloud_action_2`에 지정하세요:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // 맵에 존재하는 이 타입의 모든 구름에 대해 interval_action_2 초마다 실행됩니다.
    // 연산 비용을 최소화하고, 연속해서 발동하지 않도록 확률 체크를 두세요.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

그다음 `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`를 설정합니다.

## 나만의 스프라이트 사용하기

`path_sprites`는 경로 목록이며, 각 항목은 `GameResources/` 내부에서 지정된 경로 그대로 로드됩니다. 게임은 구름마다 하나의 텍스처를 선택하기 때문에 바닐라에서도 3개의 변형을 전달합니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

구름 스프라이트는 크고 부드러운 그레이스케일 덩어리입니다. `color_hex`가 모든 색상을 입혀주므로 최종 색상으로 칠하지 마세요. 흰색으로 그리고 색조 처리는 게임에 맡기면 됩니다 :wbsmirk:.

## 하늘에 구름 소환하기

구름은 구름 관리자가 아니라 이펙트 시스템을 통해 스폰됩니다:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

이것이 바닐라의 모든 구름 파워가 내부에서 실행하는 코드와 정확히 같습니다. 이를 신의 권능으로 감싸면 플레이어가 사용할 수 있는 구름 소환 도구가 완성됩니다:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

버튼 구성에 대해서는 **[신의 권능](#/nml/god-powers)** 및 **[파워 탭 및 버튼](#/nml/power-buttons)** 을 확인하세요.

## 바닐라 구름 목록

클론 대상이나 이미 게임에 존재하는 기능을 확인하기 위한 참고 목록입니다:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// 이미 작동하는 구름을 바탕으로 색상과 드롭만 변경합니다.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

`clone()`은 내부에서 자동으로 등록하므로 뒤이어 `add()`를 호출하지 마세요.

## 직접 스프라이트 만들기

`path_sprites`는 `GameResources/` 내의 경로 목록이며 다른 모든 리소스와 동일한 규칙을 따릅니다. **[스프라이트 및 리소스](#/nml/sprites-and-resources)** 를 참고하세요. 구름 스프라이트는 부드러운 덩어리 형태이며 색상은 `color_hex`가 처리하므로 그레이스케일 모양 하나면 충분합니다.

> [!TIP] 재앙을 만들기 전에 구름부터 확인
> 게임 내 재앙 목록에 등록된 것들의 상당수는 단지 `considered_disaster = true`가 붙은 구름에 불과합니다. 스폰 조건과 지속 타이머를 가진 복잡한 재앙 코드를 작성하기 전에, 내가 만든 드롭을 뿌리는 구름만으로 충분하지 않은지 먼저 살펴보세요 :PES2_HmmmmThumbsUp:.
