---
title: 재앙
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbmeteorite:
order: 184
---

# 재앙 :wbmeteorite:

재앙은 세계가 스스로 일으키는 사건입니다: 토네이도, 폭염, 운석 낙하 등이 있습니다. 시간이 흐름에 따라 게임이 자동으로 발생 여부를 추첨하므로, 신의 권능과 달리 **아무도 버튼을 클릭할 필요가 없습니다**. 조건만 설정해 두면 나머지는 월드가 알아서 처리합니다.

## 재앙 추가하기

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

`Main.cs`에 등록하고(**[완성된 모드](#/nml/all-together)** 참조), 최소 하나의 도시와 100명 이상의 유닛이 있는 월드를 로드한 뒤 기다려 보세요. 잠시 후 하늘에서 저절로 불씨가 쏟아져 내립니다 :wbfireskull:.

### 필드 목록

`rate`와 `chance`가 가장 많이 만지게 될 두 가지입니다. 이유는 페이지 맨 아래 경고에서 설명합니다.

| 필드 | 역할 |
| --- | --- |
| `rate` | 가중치: 다른 재앙에 비해 얼마나 자주 선택되는지 |
| `chance` | 선택된 후 진행되는 2차 확률 판정 |
| `min_world_population` / `min_world_cities` | 발생하기 위한 최소 조건 |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | `WorldLogAsset`의 ID: 월드 로그에 표시되는 한 줄입니다. 텍스트 키가 **아닙니다** (아래 참조) |
| `action` | 실행할 코드. 재앙 자체의 동작 |
| `spawn_asset_unit` + `units_min`/`units_max` | "이 생명체 N마리 소환" 편의 기능 |
| `max_existing_units` | 이미 이만큼 존재한다면 더 이상 소환하지 않음 |

## 코드 없이 생명체 소환하기

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"코드 없음"은 거의 사실입니다. 하지만 재앙에는 **항상** `action`이 필요합니다. 추첨 시스템이 null 체크 없이 이를 호출하므로, 비워두면 내 재앙이 당첨되는 순간 `NullReferenceException`이 발생합니다. 바니라의 생물 소환 재앙들은 모두 라이브러리 자체 메서드인 `simpleUnitAssetSpawnUsingIslands`를 가리키고 있으며, 이 메서드가 `spawn_asset_unit`, `units_min`, `units_max`, `max_existing_units`를 읽어 유닛을 소환하고 월드 로그까지 대신 작성해 줍니다.

## 월드 로그에 기록되는 한 줄

`world_log`는 텍스트가 아닙니다. `AssetManager.world_log_library`에 있는 **`WorldLogAsset`의 ID**이며, 해당 에셋이 텍스트 키를 가리킵니다. 존재하지 않는 ID를 지정하면 재앙이 로그를 기록하려는 순간 `WorldLog.logDisaster()`가 `null` 객체를 기반으로 메시지를 생성하다가 `NullReferenceException` 크래시를 냅니다 :wbfacepalm:.

바니라 재앙들은 모두 `$basic_disaster$` 템플릿을 복제하여 사용합니다. 이 템플릿에는 이미 경고 색상과 "disasters" 그룹이 지정되어 있습니다. 위의 `HelloDisasters`도 동일하게 복제합니다:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

그 후 로그를 직접 작성해 주어야 합니다. 바니라 소환 함수는 내부에서 `WorldLog.logDisaster(pAsset, tile)`를 직접 호출하지만, 커스텀 `action`은 그렇지 않으므로 폭풍이 시작된 타일을 넘겨 명시적으로 호출합니다. 이 위치가 바로 로그의 "바로가기" 버튼이 이동하는 좌표가 됩니다.

| `WorldLogAsset` 필드 | 역할 |
| --- | --- |
| `locale_id` | 텍스트 키입니다. 비워두면 자신의 ID로 대체됩니다 |
| `path_icon` | 로그 행 시작 부분에 표시될 아이콘 |
| `color` | 텍스트 색상입니다. 템플릿 기본값은 경고 색상입니다 |
| `group` | 월드 로그의 어떤 필터 탭에 속할지 지정합니다 |
| `random_ids` | 여러 텍스트 중 무작위 선택: `<locale_id>_1`, `_2`... |

늑대 예제도 동일한 두 가지가 필요합니다: `disaster_hello_wolf_year`로 복제된 로그 에셋과 `worldlog_disaster_hello_wolf_year` 텍스트입니다. 바니라 소환 함수가 로그 작성을 대신 처리합니다.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

단순한 설명이 아니라 뉴스 속보 헤드라인처럼 작성하세요. "하늘에서 불씨가 떨어진다"가 "불씨 관련 이벤트가 시작되었습니다"보다 낫습니다. 플레이어가 월드 로그에서 읽게 되는 문장입니다.

> [!WARNING] 개발 중에는 수치를 대폭 올려서 테스트하세요
> `rate = 4, chance = 0.5f`로 두면 내 재앙을 확인하기 위해 20분을 기다려야 할 수도 있습니다. 개발 중에는 `rate`를 크게 높이고 최소 인구 조건을 0으로 낮춰서 테스트한 뒤 배포 전에 원래대로 되돌리세요 :PES2_EvilPlan:.
