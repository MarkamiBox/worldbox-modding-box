---
title: 세계 시대 및 월드 행동
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbsunblessed:
order: 174
---

# 세계 시대 및 월드 행동 :wbsunblessed:

게임 요소 중에는 특정 생물이 아닌 월드 자체에 귀속되는 두 가지 시스템이 있습니다. **세계 시대(World Age)**는 시대 바퀴에 표시되는 시대(희망의 시대, 재의 시대 등)로 날씨, 조명, 세계 법칙을 관장합니다. **월드 행동(World Behaviour)**은 월드가 타이머에 따라 지속적으로 실행하는 코드로 재앙, 이민자 유입, 도로 노후화 등을 스케줄링하는 핵심 엔진입니다.

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## 세계 시대 (World Ages)

불씨의 시대(Age of Embers)는 8초마다 불씨를 내리고, 재 파티클로 화면을 어둡게 만들며, 불의 확산 속도를 2배로 높이고 도시의 충성도를 소폭 상승시킵니다. 새로 생성된 월드는 시대 바퀴 4번 슬롯에 이를 배치할 수 있으며, 셔플 버튼으로 임의의 슬롯에 지정할 수도 있습니다. 절제는 한 번도 HelloBox의 목표였던 적이 없습니다 :wbfireskull:.

> [!WARNING] 라이브러리가 시작 시 완료하는 3가지 작업
> `post_init()`은 ID를 기반으로 각 시대의 배경 이미지 경로를 설정하고, `linkAssets()`는 `list_only_normal`(랜덤 시대 풀)과 `pool_by_slots`(새 월드가 바퀴를 채우는 슬롯별 풀)을 구성합니다. 새로 추가된 시대는 여기에 포함되어 있지 않습니다. 배경 설정을 생략하면 바퀴 조각이 비어 보이고, 풀 추가를 생략하면 시대가 등록되어도 어떤 월드에서도 선택되지 않습니다.

> [!NOTE] 선택 가능한 시대 목록 창
> 시대 선택 창은 초기화될 때 각 시대별 버튼을 생성하며 게임은 이 창을 미리 로드합니다. 모드 로드 이전과 이후 중 언제 초기화되는지는 환경에 따라 다를 수 있으므로 버튼 생성 여부는 인게임에서 직접 확인하세요. 시대 바퀴, 랜덤 풀, 특수 효과 액션 자체는 버튼 유무와 무관하게 정상 작동합니다.

| 필드 | 기능 |
| --- | --- |
| `rate` | 랜덤 선택 시의 추첨 가중치 |
| `default_slots` | 새 월드 생성 시 배치가 허용되는 바퀴 슬롯 번호 (1~8) |
| `clouds` + `cloud_interval` | 생성되는 구름 (cloud) 종류 및 생성 주기 |
| `special_effect_action` + `special_effect_interval` | 시대 지속 중 주기적으로 실행할 커스텀 코드 |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | 시각 효과: 어둠, 비, 눈, 재, 햇빛 등 |
| `title_color`, `light_color` | 시대 이름 색상 및 환경광 색상 |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | 정치 및 식물 성장에 추가되는 보너스 수치 |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | 변형되는 게임 규칙 수치 |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | 타 시스템이 참조하는 스위치 (작물은 `flag_crops_grow`가 true일 때만 성장) |

텍스트 키는 `<id>_title` 및 `<id>_description`입니다.

## 월드 행동 (World Behaviours)

월드 행동은 두 개의 숫자와 하나의 델리게이트로 구성됩니다: `interval`초마다 `action`을 실행하며, 최대 `interval_random`초의 무작위 간격을 더해 기계적인 반복 느낌을 없앱니다. `stop_when_world_on_pause = false`로 설정하지 않는 한 월드 일시정지와 함께 멈추며, 새 월드가 로드될 때 `action_world_clear`가 실행됩니다.

> [!WARNING] 매니저는 게임 시작 시 생성됩니다
> 월드는 각 에셋마다 하나의 `WorldBehaviour` 타이머를 유지하며, 이는 모드가 로드되기 전 맵이 처음 켜질 때 `createManagers()`에 의해 생성됩니다. 모드로 추가된 에셋은 `manager == null` 상태이므로 월드 업데이트 루프에서 매 프레임 `NullReferenceException`이 발생합니다 :wbfacepalm:. `add()` 직후 매니저를 생성하는 한 줄로 해결할 수 있습니다.

HelloBox의 월드 행동은 관련 세계 법칙이 꺼져 있는 동안 아무것도 하지 않습니다. 조건 확인 비용이 매우 저렴하므로 타이머는 계속 돌려두고 action 내부에서 분기하는 이 패턴을 추천합니다.

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

월드와 무관하게 자체 주기로 실행되어야 하는 코드(UI 등)의 경우, 메인 클래스의 NML `Update()`를 사용하는 편이 훨씬 간결합니다: **[완성된 모드](#/nml/all-together)** 참조 :PES_OkHand:.
