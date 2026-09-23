---
title: 스탯 레퍼런스
group: 게임 콘텐츠
subgroup: 구조 및 스탯
icon: :wbstonks:
order: 92
---

# 스탯 레퍼런스 :wbstonks:

여러분이 등록할 거의 모든 에셋은 `base_stats` 블록을 가지고 있으며, 이 페이지 이후의 거의 모든 가이드에서 그곳에 무언가를 설정합니다. 이 목록은 그곳에 넣을 수 있는 모든 스탯의 명세서입니다.

## base_stats 작동 방식

`base_stats`는 `string`에서 `float`로 매핑되는 딕셔너리입니다. 키는 반드시 아래에 나열된 스탯 ID 중 하나여야 합니다. 알 수 없는 키를 적는 것은 **절대로 무해하지 않습니다**. 세터는 `base_stats_library`에서 해당 ID를 조회했다가 `null`을 반환받고, 여러분의 `Initialize()` 한가운데서 즉시 `NullReferenceException`을 터뜨려버립니다.

따라서 스탯 이름의 오타는 조용히 무시되는 것이 아니라 모드 등록 단계 전체를 다운시키며, 그 줄 이후의 코드는 영원히 실행되지 않습니다. 두 군데 이상에서 사용하는 스탯 이름은 `const string` 상수로 관리하세요.

```csharp
trait.base_stats["damage"] = 15;
trait.base_stats["multiplier_health"] = 0.25f;   // +25%, x0.25가 아님
```

## 유닛 능력치가 계산되는 과정

`Actor.updateStats()`는 유닛의 스탯 블록을 깨끗이 비우고 정확히 다음 순서대로 바닥부터 다시 조립합니다:

| # | 출처 | 비고 |
| --- | --- | --- |
| 1 | **아종 (Subspecies)** 및 해당 성별 블록 | 유닛이 아종을 가지고 있을 때 |
| 1b | **Actor 에셋** | 아종이 **없을** 때만 적용. 아종은 에셋 스탯을 *대체*하며, 중첩되지 않음 |
| 2 | **클랜 (Clan)** 및 해당 성별 블록 | |
| 3 | **언어 (Language)** | |
| 4 | **문화 (Culture)** | |
| 5 | 유닛 고유 데이터의 지도자 능력치 | `diplomacy`, `stewardship`, `intelligence`, `warfare` |
| 6 | 유닛에 걸린 모든 **상태 이상** | |
| 7 | **기본 공격** 아이템 | 비무장 맨손일 때만 |
| 8 | 유닛이 가진 모든 **액터 특성** | 시대 한정 특성은 해당 시대가 아닐 때 스킵됨 |
| 9 | 유닛의 **성격** | |
| 10 | 유닛이 **착용한 모든 장비** 및 모디파이어 | |

여기서 많은 사람들이 흔히 저지르는 실수 두 가지:

- **아종은 액터 에셋의 스탯을 완전히 대체합니다.** `human`에 스탯을 아무리 얹어봐야 아종을 가진 인간 유닛은 그 숫자를 영원히 구경조차 못 합니다.
- **종교는 이 목록에 없습니다.** 종교 특성의 `base_stats`는 유닛에게 결코 도달하지 않습니다. **[종교 특성](#/nml/religion-traits)**을 확인하세요.

추가적인 두 가지 계산 규칙:

- `damage` 같은 고정 수치는 최종값이 아니라 **보너스 가산치**입니다. 특성의 `damage = 15`는 "다른 모든 계산 위에 +15 추가"를 의미합니다.
- `multiplier_*` 스탯은 **1.0에 더해지는 소수 비율**입니다. `multiplier_health = 0.5`는 +50%이며, `multiplier_health = -0.5`는 체력이 절반이 됩니다.

> [!WARNING] `base_stats`는 에셋이 등록되기 전까지 존재하지 않습니다
> 직접 생성한 에셋의 스탯 블록은 `add()` 내부에서 비로소 할당됩니다. 그 줄 이전에 `base_stats`를 건드리면 `NullReferenceException`이 발생합니다. `clone()`은 내부에서 `add()`를 대신 호출해주므로 복제 직후에는 안전합니다. 이는 월드박스 모딩에서 가장 흔하게 일어나는 튕김 현상입니다.

## Combat

| 스탯 | 설명 |
| --- | --- |
| `damage` | 타격당 고정 피해량 |
| `damage_range` | `damage` 위에 더해지는 무작위 편차 |
| `attack_speed` | 공격 발동 속도 |
| `accuracy` | 타격 적중률 |
| `critical_chance` | 치명타 확률 |
| `critical_damage_multiplier` | 치명타 피해 배율 |
| `armor` | 고정 피해 감소량 |
| `range` | 공격 사거리 |
| `throwing_range` | 투척 무기 사거리 |
| `targets` | 한 번의 공격으로 타격 가능한 최대 대상 수 |
| `projectiles` | 한 번에 발사되는 투사체 개수 |
| `knockback` | 피격 대상을 밀쳐내는 거리 |
| `recoil` | 타격 시 *공격자 본인*이 밀려나는 반동 |
| `skill_combat` | 근접 전투 숙련도 |
| `skill_spell` | 주문 시전 숙련도 |
| `status_chance` | 부가된 상태 이상이 적용될 확률 |
| `area_of_effect` | 광역 피해 폭발 반경 |

## Body

| 스탯 | 설명 |
| --- | --- |
| `health` | 최대 체력 |
| `stamina` | 최대 스태미나 |
| `mana` | 최대 마나 |
| `speed` | 이동 속도 |
| `mass`, `mass_2` | 넉백 및 물리 연산에 쓰이는 물리적 질량 |
| `size` | 피격 판정(히트박스) 크기 |
| `scale` | 화면에 그려지는 렌더링 크기 |
| `max_nutrition` | 유닛이 보유할 수 있는 최대 영양치 |
| `metabolic_rate` | 음식 소비 대사율 |
| `construction_speed` | 건축 속도 |
| `experience` | 경험치 획득량 |

## 생애 주기

| 스탯 | 설명 |
| --- | --- |
| `lifespan` | 기본 수명 |
| `maturation` | 성장 속도 |
| `age_adult` | 성인으로 판정되는 나이 |
| `age_breeding` | 번식이 가능해지는 나이 |
| `birth_rate` | 번식 빈도 |
| `offspring` | 한 번 출산 시 태어나는 자식 수 |
| `multiplier_offspring` | 해당 자식 수에 대한 백분율 보정 |
| `mutation` | 아종 돌연변이 발생 확률 |
| `happiness` | 기본 행복도 |

## 문명 전용 능력치

이 스탯들은 동물에게는 아무런 효과가 없습니다. 게임 내에서 `used_only_for_civs`로 분류됩니다.

| 스탯 | 설명 |
| --- | --- |
| `diplomacy` | 지도자 능력치: 외교 |
| `warfare` | 지도자 능력치: 군사 |
| `stewardship` | 지도자 능력치: 통치 |
| `intelligence` | 지도자 능력치: 지식 |
| `army` | 군대 규모 기여도 |
| `cities` | 왕국이 목표로 삼는 도시 수 |
| `bonus_towers` | 도시가 추가로 건설할 수 있는 감시탑 수 |
| `limit_population` | 인구 상한치 |
| `limit_clan_members` | 클랜 구성원 상한치 |
| `loyalty_traits` | 특성으로 인한 충성도 |
| `loyalty_mood` | 기분으로 인한 충성도 |
| `opinion` | 타국에 대한 기본 우호도 |
| `multiplier_diplomacy` | 외교력에 대한 백분율 보정 |
| `multiplier_supply_timer` | 군대 보급품 지속 시간 |
| `personality_aggression` | 숨겨진 AI 성향 가중치: 호전성 |
| `personality_administration` | 숨겨진 AI 성향 가중치: 행정 |
| `personality_diplomatic` | 숨겨진 AI 성향 가중치: 외교 |
| `personality_rationality` | 숨겨진 AI 성향 가중치: 합리성 |

## Multipliers

이 배율들은 모두 1.0에 더해지는 소수 비율이므로, `0.25`는 +25%를 의미합니다.

`multiplier_health` · `multiplier_lifespan` · `multiplier_stamina` · `multiplier_mana` · `multiplier_damage` · `multiplier_crit` · `multiplier_speed` · `multiplier_attack_speed` · `multiplier_mass` · `multiplier_offspring` · `multiplier_diplomacy` · `multiplier_supply_timer`

## base_stats vs base_stats_meta 비교

모든 특성은 **두 개**의 스탯 블록을 들고 있으며, 둘 중 엉뚱한 곳에 넣는 것은 메타 특성 모드에서 가장 흔하게 터지는 밸런스 버그입니다:

| 블록 | 최종 도달 위치 |
| --- | --- |
| `base_stats` | 소유자에게 병합된 후, 소유자에 속한 **모든 개별 유닛**에게 배분됨 |
| `base_stats_meta` | 소유자 자체에 머뭄. 문화, 클랜, 아종 집단 자체가 읽으며, 유닛에게는 전달되지 않음 |

```csharp
trait.base_stats["damage"] = 5;             // 이 문화에 속한 모든 구성원의 공격력이 증가함 (농부 포함)
trait.base_stats_meta["construction_speed"] = 10;   // 집단 전체의 건축이 빨라짐. 개별 구성원의 공격력은 변하지 않음
```

특정 부류(전사만, 성인만)에게만 보너스를 적용해야 한다면 두 블록 모두 그것을 처리할 수 없습니다. `Actor.updateStats`에 Harmony Postfix를 걸어 직접 필터링하세요. **[Harmony 패치](#/nml/harmony-patches)**를 참고하세요.

## 태그: 숫자가 아닌 특수 스탯

`base_stats` 블록은 수치가 아닌 불리언 플래그 모음인 **태그 (Tags)**도 함께 보관합니다. 스탯과 동일한 방식으로 병합되므로, 피해량을 부여하듯 유닛에게 화염 면역을 손쉽게 쥐여줄 수 있습니다:

```csharp
trait.base_stats.addTag("immunity_fire");
trait.base_stats.addTag("fast_swimming");

if (actor.stats.hasTag("immunity_fire")) { }
```

게임 시스템이 직접 판별하는 주요 태그 목록:

| 그룹 | 태그 |
| --- | --- |
| 면역 | `immunity_fire` · `immunity_cold` · `building_immunity_fire` · `damaged_by_water` |
| 이동 | `fast_swimming` · `water_creature` · `immovable` · `walk_adaptation_sand` · `walk_adaptation_snow` · `walk_adaptation_swamp` |
| 정신 | `strong_mind` · `has_sapience` · `has_emotions` · `has_advanced_memory` · `has_advanced_communication` · `can_read_any_book` · `mad` · `moody` · `unconscious` · `frozen_ai` |
| 행동 | `ignore_fights` · `love_peace` · `steal_items` · `needs_food` · `needs_mate` · `always_idle_animation` · `stop_idle_animation` · `generate_light` |
| 식성 | `diet_meat` · `diet_meat_insect` · `diet_fish` · `diet_blood` · `diet_grass` · `diet_crops` · `diet_fruits` · `diet_flowers` · `diet_nectar` · `diet_algae` · `diet_vegetation` · `diet_wood` · `diet_minerals` · `diet_tiles` · `diet_same_species` |
| 번식 | `reproduction_sexual` · `reproduction_asexual` · `oviparity` · `viviparity` |
| 생태 속성 | `civ` · `human` · `elf` · `orc` · `dwarf` · `demon` · `undead` · `magic` · `good` · `evil` · `neutral` · `nature_creature` · `neutral_animals` · `everyone` · `small` · `sliceable` |
| 건축 지형 | `can_build_in_biome_corruption` · `can_build_in_biome_desert` · `can_build_in_biome_infernal` · `can_build_in_biome_permafrost` · `can_build_in_biome_swamp` · `can_build_in_biome_wasteland` |

스탯 이름과 달리 알 수 없는 태그는 에러 없이 무해하지만, 그 어떤 시스템과도 매칭되지 않습니다. 즉 오타가 나도 조용히 묻히므로 정확하게 복사해 붙여넣으세요.

## 유닛의 현재 실시간 수치 읽기

`base_stats`는 *레시피*입니다. 살아있는 `Actor`의 `stats`는 모든 요소가 총합된 *최종 결과물*입니다:

```csharp
float finalDamage = actor.stats["damage"];
```

이것이 바로 `Actor.updateStats`에 건 Harmony Postfix에서 여러분이 미세 조정하게 되는 대상이기도 합니다 (**[Harmony 패치](#/nml/harmony-patches)** 참조).

## 나만의 커스텀 스탯 추가하기

`AssetManager.base_stats_library`에 새로운 `BaseStatAsset`을 등록할 수 있으며, 인스펙터에 표시되고 다른 스탯처럼 자동 합산됩니다. 하지만 **자체적인 효과는 아무것도 없습니다**. 게임 시스템은 자기가 모르는 스탯을 절대 읽지 않기 때문입니다. 커스텀 스탯은 오직 여러분의 자체 Harmony 패치나 AI 행동 로직에서 읽어 쓰기 위한 변수로만 유용합니다.

대부분의 경우 정답은 "기존 스탯을 활용하는 것"이며, 차선책은 "자신만의 딕셔너리를 관리하는 것"입니다.
