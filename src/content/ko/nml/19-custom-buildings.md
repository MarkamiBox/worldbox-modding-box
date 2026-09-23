---
title: 커스텀 건물
group: 게임 콘텐츠
subgroup: 액터, 건물 및 AI
icon: :wbcities:
order: 142
---

# 커스텀 건물 :wbcities:

건물은 WorldBox 모딩이 "숫자 몇 개 바꾸기"에서 벗어나 "이 에셋에는 140개의 필드가 있는데 내 경우엔 대부분 아무런 쓸모가 없다"는 사실을 깨닫게 되는 분기점입니다 :PES2_Weary:.

따라서 건물을 맨땅에서 처음부터 조립하지 않습니다. 이미 정상 작동하는 건물을 복제하여 만듭니다.

## 먼저 복제하고, 나중에 수정하기

`clone(newId, sourceId)` 는 원본의 모든 필드를 복사하고, 새 id를 부여하며, **동시에 등록(register)까지 완료**합니다. 이 마지막 동작이 결정적으로 중요합니다:

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

직접 값을 바꾸지 않은 모든 속성은 정상 작동하는 도시 건물인 `temple_human` 의 설정 그대로 유지됩니다. 이것이 건물을 만드는 가장 영리한 비결입니다.

> [!WARNING] clone() 이후에 add() 를 호출하지 마세요
> `clone()` 은 이미 내부에서 등록을 마쳤습니다. 그 뒤에 `AssetManager.buildings.add(shrine)` 을 호출하면 중복 등록이 발생하여 라이브러리가 첫 번째 사본을 버리고 `duplicate asset - overwriting...` 로그를 남깁니다. 모드가 돌아가기는 하지만 로그가 지저분해지고 코드 리뷰에서 가장 먼저 지적받게 됩니다.

## 무엇을 복제할 것인가

라이브러리에는 `$…$` 로 표시된 템플릿과 완성된 일반 건물 에셋이 둘 다 들어있습니다:

| 복제 원본 | 용도 |
| --- | --- |
| `$building$` | 가장 순수한 최소 기본형 |
| `$city_building$` | 도시가 건설하는 일반 시설. `well` 과 `mine` 이 사용 |
| `$city_colored_building$` | 위와 동일하나 왕국 색상이 덧입혀짐 |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | 문화별 문명 건물 |
| `$building_creep$` | 크립(Creep) 오염체 구조물 |
| `$mineral$` | 채굴 가능한 광물 및 암석 |
| `$resource$`, `$flora_small$` | 채집 가능한 자연물 |
| `tree_green_1` | 바닐라의 모든 나무는 이 에셋에서 복제됨 |

복제하기 좋은 완성형 건물들: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

가장 유사한 건물을 찾는 데 10분을 투자하면 작동하지도 않는 수십 개의 필드와 씨름하느라 밤을 지새우는 참사를 막을 수 있습니다.

## 목적별 필드 정리

### 건물의 종류

| 필드 | 설명 |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | 도시에 귀속되어 왕국 색상, 구역, 일자리 시스템의 적용을 받음 |
| `type` | 게임 내부 목록에서 그룹화할 때 쓰는 자유 텍스트 태그 |
| `kingdom`, `civ_kingdom` | 특정 진영으로 제한 |
| `ignored_by_cities` | 도시가 절대 건설하지 않고 통계에서도 제외 |

### 주거 및 활용

| 필드 | 설명 |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | 시민이 거주할 수 있는지 및 최대 인원수 |
| `housing_happiness` | 해당 건물 거주 시 얻는 행복도 보너스 |
| `storage`, `storage_only_food`, `is_stockpile` | 자원 저장고 기능 여부 |
| `book_slots` | 도서관의 책 수용량 |
| `docks`, `boat_types`, `boat_type_fishing` … | 선박 건조 능력 |
| `spawn_units`, `spawn_units_asset` | 생명체를 지속적으로 소환 |
| `tower`, `tower_projectile`, `tower_projectile_reload` … | 방어 타워 사격 기능 |

### 건설 및 배치 규칙

| 필드 | 설명 |
| --- | --- |
| `cost`, `construction_progress_needed` | 도시가 지불하는 비용 및 건설에 걸리는 시간 |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from` … | `house_human_0` 부터 `_5` 까지와 같은 업그레이드 체인 |
| `build_place_borders`, `build_place_center` … | 마을 내부의 건설 위치 규칙 |
| `build_prefer_replace_house`, `check_for_close_building` … | 건물 간격 및 대체 배치 규칙 |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | 건설 가능한 최대 개수 |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks` … | 지형 제약 조건 |
| `build_road_to` | 도시가 해당 건물로 이어지는 도로를 개설함 |

### 자연 및 성장

| 필드 | 설명 |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | 시간 경과에 따라 자연 생성되는지 여부 |
| `growth_time`, `has_resources_grown_to_collect` | 작물 및 과일의 성장 주기 |
| `biome_tags_growth`, `has_biome_tags` | 자라날 수 있는 바이옴 태그 |
| `resources_given`, `addResource(id, amount, pNewList)` | 채취 시 획득하는 자원 |
| `can_be_chopped_down`, `gatherable` | 유닛이 벌목하거나 수확할 수 있는지 |
| `grow_creep` 및 `grow_creep_*` 계열 | 크립 바이옴 번식 행동 |

### 피해 및 파괴

| 필드 | 설명 |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid` … | 건물에 피해를 주는 요소들 |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin` … | 파괴 시 남는 폐허 설정 |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | 건물이 철거되거나 소멸하는 방식 |
| `loot_generation` | 파괴 시 떨어지는 전리품 |

### 외형 및 렌더링

| 필드 | 설명 |
| --- | --- |
| `sprite_path` + `main_path` | 스프라이트 리소스 경로 |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | 사용할 스프라이트 아틀라스 |
| `scale_base`, `bonus_z`, `random_flip` | 크기 배율, Z축 정렬, 좌우 반전 |
| `shadow`, `shadow_bound`, `shadow_distortion` | 그림자 렌더링 |
| `has_kingdom_color` | 소유 왕국의 색상으로 틴트 적용 |
| `draw_light_area`, `draw_light_size` | 자체 발광 효과 |
| `has_special_animation_state`, `animation_speed` … | 애니메이션 설정 |

### 동작 및 스탯

| 필드 | 설명 |
| --- | --- |
| `step_action`, `has_step_action` | 건물의 매 틱마다 실행될 커스텀 로직 |
| `base_stats` | 건물이 제공하는 스탯 보너스 |
| `priority` | 도시 건설 대기열에서의 우선순위 |

## 스프라이트

건물은 `main_path + sprite_path` 경로를 합쳐 이미지를 찾으므로, 위 예제는 `buildings/hello_shrine` 이 됩니다. `GameResources/buildings/hello_shrine.png` 에 PNG 파일을 넣으면 바닐라 건물처럼 자동으로 로드됩니다. `sprites.json` 에서 피벗을 반드시 하단 중앙(bottom-centre)으로 설정하세요. 그렇지 않으면 사당이 유령처럼 땅 위에 둥둥 떠다니게 됩니다 :aPES_GhostDance:. 자세한 내용은 **[스프라이트 & 리소스](#/nml/sprites-and-resources)** 를 참고하세요.

## 커스텀 스프라이트

건물은 **두 개의** 필드를 하나로 이어 붙이는 유일한 에셋입니다: `main_path + sprite_path`. `main_path` 는 기본값이 이미 `buildings/` 로 설정되어 있으므로, `sprite_path` 에는 순수 파일 이름만 넣어야 합니다.

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

**파일 이름이 곧 형식**입니다. 로더는 이름을 `_` 로 나눕니다. 앞은 종류 (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`), 뒤는 애니메이션 프레임 번호입니다. `main_0`, `main_1`, `main_2` 면 3프레임 애니메이션입니다. 다른 이름의 파일은 프레임이 아니고, `main_0` 이 없는 폴더면 건물은 그릴 게 없습니다. `mini` 는 미니맵 점입니다. `mini_0` 은 건물이 차지하는 타일 수와 정확히 같은 픽셀이어야 하고, `temple_human` 에서 복제한 건 5x4 입니다. 없으면 미니맵이 다시 그릴 때마다 `Building.getColorForMinimap()` 에서 `NullReferenceException` 을 냅니다.

```csharp
shrine.main_path = "buildings/";       // 기본값이며 바꿀 일이 거의 없음
shrine.sprite_path = "hello_shrine";   // "buildings/hello_shrine" 이 아님에 주의
```

둘을 섞으면, 즉 `main_path` 에 폴더를 적고 `sprite_path` 를 비우면 게임은 `buildings/hello_shrine/hello_shrine` 을 찾습니다 :aPES_BrainScratch:.

> [!WARNING] 경로를 넣은 뒤 프레임은 직접 로드하세요
> 게임은 자기 프리로드에서 모든 건물의 `building_sprites` 를 채우는데, 그건 모드보다 먼저입니다. 나중에 등록한 건물은 프레임 목록이 비어 있고, 처음 배치하는 순간 `Building.setAnimData()` 에서 `ArgumentOutOfRangeException: Index was out of range` 로 죽습니다 :wbfacepalm:. `sprite_path` 를 정했으면 `shrine.loadBuildingSprites();` 를 부르세요.
>
> 형제뻘인 게 `atlas_asset` 인데, 건물을 주인 색으로 칠하는 아틀라스입니다. 라이브러리가 이것도 시작 때 `checkAtlasLink()` 에서 연결합니다. 없으면 건물은 잘 놓이지만, 그 뒤 **화면에 보이는 매 프레임** `DynamicSprites.getRecoloredBuilding()` 에서 `NullReferenceException` 을 냅니다.


`sprites.json` 에서 반드시 **하단 중앙 피벗**을 지정하세요. 안 그러면 사당이 공중에 뜨게 됩니다. **[스프라이트 & 리소스](#/nml/sprites-and-resources)** 를 참고하세요.

## 맵에 직접 배치하기

`World.world.buildings.addBuilding(...)` 메서드는 `internal` 로 선언되어 있으므로, **공개화(publicized)** 된 `Assembly-CSharp.dll` 을 참조해야 컴파일됩니다. **[상태 효과](#/nml/status-effects)** 의 안내를 확인하세요:

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

항상 사전에 `canBuildFrom` 을 호출해 확인하세요. 물 위나 다른 건물 위, 혹은 도시가 다른 용도로 예약해 둔 타일에 건물을 강제로 떨구면 처음 30초는 멀쩡해 보이다가 3분 뒤에 월드가 폭파됩니다 :PES_OhShit:.

## 도시가 스스로 짓게 만들기

신의 권능으로 신전을 하나 떨어뜨리는 건 한나절 재미일 뿐입니다. 도시가 충분히 커졌을 때 스스로 짓는 신전이야말로 모드입니다. 도시는 두 가지에서 무엇을 지을지 고르는데, 여러분의 건물은 아직 둘 중 어디에도 없습니다:

| | 담고 있는 내용 |
| --- | --- |
| **빌드 오더** (`AssetManager.city_build_orders`) | `order_temple` 같은 주문 키 목록이며, 각 키마다 필요한 인구와 건물 수가 있습니다 |
| **아키텍처** (`AssetManager.architecture_library`) | 특정 종족에게 주문 키가 어떤 건물을 뜻하는지. `order_temple`은 인간에게는 `temple_human`, 다른 종족에게는 다른 건물입니다 |

그래서 여러분만의 주문 키를 하나 만들고, 모든 아키텍처에 그 의미를 알려준 뒤, 빌드 오더에 추가합니다:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // 전용 type을 부여해, 도시가 신전이 아니라 별도 한도로 셈
    shrine.type = "type_hello_shrine";

    // 아키텍처 조회는 그냥 Dictionary라서, 모르는 키는 해당 종족의 모든 도시에서 예외를 던집니다.
    // 절대 도달하지 않을 종족에게도 미리 알려주세요.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // 신전과 같은 한도: 1개까지, 인구 50, 마을 건물 15채
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

`AddToCities()`는 `Initialize()`의 끝, 복제 이후에 호출하세요.

이 가이드의 다른 대부분과 달리 여기에는 시작 시점 함정이 없습니다. `CityBehBuild.calcPossibleBuildings()`는 도시가 건축을 고려할 때마다 빌드 오더 목록을 매번 다시 읽으므로, 로드 시 추가한 주문은 그것을 처음 보는 도시부터 바로 인식됩니다. 다만 도시는 여전히 건물의 `cost`를 감당할 수 있어야 하고 주문의 모든 조건을 충족해야 하며, 그렇지 못하면 아무 말 없이 여러분의 신전을 건너뜁니다 :PES5_Hmmmm:.

| `addBuilding(...)` 인자 | 역할 |
| --- | --- |
| `pID` | 건물 id가 아니라 주문 키 |
| `pLimitType` | 도시가 가질 수 있는 최대 개수. 신전은 `1` |
| `pPop` | 최소 필요 인구 |
| `pBuildings` | 마을에 이미 있어야 하는 최소 건물 수 |
| `pCheckFullVillage` | 모든 집이 꽉 찼을 때만 |
| `pCheckHouseLimit` | 주택용: 주거 여유가 있으면 건너뛰고, 도시의 주택 한도에서 멈춤 |
| `pMinZones` | 최소 도시 크기 (구역 수) |

## 텍스트 로컬라이제이션

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] 복제하기 전에 원본 코드를 먼저 읽어보세요
> **dnSpy** 로 `BuildingLibrary` 를 열어 `house_human_0`, `tree_green_1`, `mineral_stone` 이 어떻게 선언되어 있는지 살펴보세요. 바닐라의 모든 건물은 그 안에서 순수 C# 코드로 생성되어 있으므로 현존하는 가장 훌륭한 필드별 설명서나 다름없습니다 :PES_Smart:.
