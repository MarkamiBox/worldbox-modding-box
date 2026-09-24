---
title: 타일 및 지형
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbrockies:
order: 170
---

# 타일 및 지형 :wbrockies:

월드맵은 `WorldTile`의 그리드로 이루어져 있으며, 모든 타일은 상하로 포개진 **두 개**의 타입을 가집니다:

| 레이어 | 타일의 필드 | 라이브러리 | 클래스 | 예시 |
| --- | --- | --- | --- | --- |
| 지면 | `main_type` | `AssetManager.tiles` | `TileType` | 흙, 모래, 암석, 깊은 바다, 용암 |
| 상층 | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, 성벽 |

두 타입 모두 내부적으로는 동일한 기본 클래스(`TileTypeBase`)이므로, 이 페이지의 모든 내용은 양쪽 모두에 적용됩니다. 유일한 차이는 어느 층에 놓이는가뿐이며, 이는 `layer_type`에 의해 결정됩니다.

새로운 종류의 *지면*을 추가하고 싶다면 `TileType`입니다. 지면 **위**에 놓이는 무언가(도로, 벽, 농작물, 이끼 등)를 원한다면 `TopTileType`이며, 보통 모더가 실제로 만들고자 하는 것은 후자입니다.

## 새로 만들지 말고 복제하세요

타일 타입에는 약 100여 개의 필드가 존재하며, 그중 대부분은 특정 바닐라 타일 하나만을 위해 존재합니다. 백 개를 다 나열할 생각은 없습니다. 가장 가까운 원본을 클론하세요:

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

> [!WARNING] 바이옴 타일에는 바이옴 연결이 필요하다
> 풀 타일을 복제하면 `is_biome = true` 와 `biome_id` 는 복사되지만, `BiomeAsset` 자체는 로드 중 한 번 `TopTileLibrary.linkAssets()` 에서만 찾아 붙습니다. 이 줄을 빼면 당신의 타일에 동물이 스폰될 때까지는 멀쩡합니다. 그 순간 종 이름에 바이옴 접미사를 붙이려다 바이옴이 `null` 이라 `Subspecies.generateName()` 에서 `NullReferenceException` 으로 죽습니다 :wbfacepalm:.
>
> 그림도 같은 문제를 겪습니다. `TopTileLibrary` 는 시작 때 `tiles/<id>/` 의 PNG 를 `sprites` 로 만듭니다. 마지막 블록이 없으면 타일은 칠해지지만, 이후 맵 렌더러가 화면의 그 타일마다 `WorldTilemap.getVariation()` 에서 예외를 냅니다.


## 알아두어야 할 주요 필드

### 어떤 종류의 타일인가

| 필드 | 역할 |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` 또는 상층 레이어. 어느 라이브러리에 속할지 결정 |
| `ground`, `liquid`, `ocean`, `lava` | 게임 전체가 분기 처리에 사용하는 기본 범주 플래그 |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | 지형 계열 플래그 |
| `road`, `wall`, `farm_field` | 구조물 플래그. 도시 AI가 이를 판별함 |
| `block`, `block_height` | 이동 차단 여부 및 렌더링 높이 |
| `is_biome`, `can_be_biome`, `biome_id` | 타일을 특정 바이옴과 연결 |
| `biome_tags`, `has_biome_tags` | 이 타일을 번식시킬 바이옴 태그 |

### 어떻게 동작하는가

여러분의 타일이 그냥 새 색깔이 아니라 게임플레이 아이디어라면 여기서 시작하세요.

| 필드 | 역할 |
| --- | --- |
| `walk_multiplier` | 이동 속도 배율. `1.0`이 기본이며 낮을수록 느려짐 |
| `damage_units`, `damage` | 밟았을 때 피해를 주는지 여부 및 피해량 |
| `damaged_when_walked` | 밟혔을 때 타일 자체가 닳아서 손상되는지 |
| `step_action`, `step_action_chance` | 무언가가 밟을 때마다 실행되는 커스텀 코드 |
| `unit_death_action` | 타일 위에서 유닛이 사망했을 때 실행되는 코드 |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | 화재 및 연소 반응 |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | 결빙 반응 |
| `remove_on_heat`, `terraform_after_fire` | 열기와 화염이 지나간 후 남는 지형 |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | 폭발 반응 |
| `strength` | 내구도. 성벽 모드 등에서 내구성을 측정할 때 참조 |
| `cost` | 길찾기(Pathfinding) 비용 |

### 플레이어가 할 수 있는 상호작용

| 필드 | 역할 |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | 어떤 도구로 제거할 수 있는지 |
| `allowed_to_be_finger_copied` | 복사 도구로 복사 가능한지 여부 |
| `can_build_on`, `can_be_farm` | 도시가 건축이나 농경지로 활용 가능한지 |
| `only_allowed_to_build_with_tag` | 건축 가능 대상을 특정 태그로 제한 |

### 지형 변환

| 필드 | 역할 |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | 성장하거나 침식될 때 변하는 타일 |
| `freeze_to_id` | 얼어붙었을 때 변하는 타일 |
| `fill_to_ocean`, `can_be_filled_with_ocean` | 물에 잠겼을 때 변하는 타일 |
| `lava_increase` / `lava_decrease` / `lava_level` | 용암 전용 단계별 변환 체인 |

### 외형

| 필드 | 역할 |
| --- | --- |
| `color_hex` | 미니맵 및 틴트 색상 |
| `edge_color_hex` | 다른 타일과 맞닿는 경계선 윤곽 색상 |
| `render_z`, `draw_layer_name` | 렌더링 순서. `setDrawLayer(...)` 메서드 활용 |
| `force_edge_variation`, `force_edge_variation_frame` | 가장자리 스프라이트 변형 고정 |

## 타일을 밟았을 때 코드 실행하기

```csharp
moss.step_action_chance = 0.05f;   // 걸음 수의 5%
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

이 가이드의 다른 모든 액션과 동일한 규칙을 따릅니다. 먼저 null 여부를 확인하고, 아무 일도 하지 않았다면 `false`를 반환하며, 이 코드가 이 타입의 모든 타일을 밟는 모든 유닛에 대해 실행된다는 점을 잊지 마세요.

## 나만의 타일 텍스처

타일은 특별한 예외입니다: **경로를 지정하는 필드가 아예 없습니다**. 게임은 타일의 **id**와 정확히 일치하는 폴더를 찾아서 그 안의 모든 이미지를 변형으로 불러옵니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- 타일의 ID와 완전히 일치해야 함
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

코드에서 설정할 것은 아무것도 없습니다. 등록한 id와 동일하게 폴더 이름을 지으면 타일이 알아서 찾아냅니다.

해당 폴더 안의 여러 파일은 무작위 변형이 되어, 넓은 영역에 타일을 깔았을 때 벽지처럼 단조로워 보이는 현상을 방지합니다. 파일이 하나만 있어도 작동합니다. 지면 타일과 상층 타일 모두 동일한 방식으로 로드됩니다.

`color_hex`는 별개이며 여전히 중요합니다. 미니맵에 그려지는 색상이자 게임이 타일에 색조를 입힐 때 사용하는 기준 색상이기 때문입니다.

## 런타임에 타일 변경하기

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // 상층 레이어 변경
tile.setTileType(AssetManager.tiles.get("sand"));                // 지면 변경
tile.setTileTypes("sand", null);                                 // 지면 변경 및 상층 제거
```

세 메서드 모두 public입니다. 타일을 변경하면 해당 청크가 더티(dirty) 상태로 표시되어 렌더러가 자동으로 갱신합니다.

### 타일 상태 판별하기

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

`main_type`과 `top_type`은 모두 `null`일 수 있습니다. 접근하기 전에 반드시 null 체크를 거치세요. 이는 맵을 탐색하는 모드에서 가장 흔하게 발생하는 크래시 원인입니다 :PES2_F:.

## 테라포밍 옵션

`AssetManager.terraform`의 `TerraformOptions`는 신의 권능이나 투사체에서 사용하는 "이 타일을 정격 정리"하는 사전 정의된 규칙 묶음입니다:

| 필드 | 역할 |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | 구조물 철거 |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | 잔해 제거 |
| `destroy_buildings`, `make_ruins` | 지어진 건축물 처리 |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | 상태 제거 |
| `add_burned`, `add_heat`, `flash` | 상태 부여 |

`ProjectileAsset`은 `terraform_option`에 이름과 `terraform_range`를 지정하여 폭발 화살이 착탄 지점의 지면을 깔끔하게 날려버리도록 만듭니다.

## 바이옴

`AssetManager.biome_library`의 `BiomeAsset`은 어떤 타일이 어디에 배치될지 결정합니다. 타일은 `setBiome("biome_forest")`를 호출하거나 적절한 `biome_tags`를 가짐으로써 바이옴에 참여합니다. 기존 바이옴을 클론하고 타일 ID를 교체하는 것이 맨땅에서 만드는 것보다 훨씬 빠르며, "클론은 자동으로 등록된다"는 규칙 역시 동일하게 적용됩니다.

> [!TIP] 모드의 진정한 무대는 상층 타일
> 모더들이 실제로 만드는 대부분의 것들(벽, 도로, 농작물, 대륙을 집어삼키는 오염 지대)은 `step_action`과 배치 판별 코드를 곁들인 상층 타일입니다. 새로운 지면 타입은 드물고, 자연스럽게 연출하기 까다로우며, 월드 생성기와 의도치 않게 충돌하기 십상입니다 :PES3_Yikes:.
