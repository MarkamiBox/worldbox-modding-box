---
title: 종교 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbpray:
order: 108
---

# 종교 특성 :wbpray:

**종교**는 도시와 왕국에 속하며 개종을 통해 확산되고, 경전을 집필하며, **의식(Rite)**을 거행할 수 있습니다. 의식이란 신도들이 독자적으로 시도하는 세상을 뒤흔드는 음모입니다. 종교 특성은 바로 그러한 믿음 중 하나입니다.

| | |
| --- | --- |
| 라이브러리 | `AssetManager.religion_traits` |
| 클래스 | `ReligionTrait` |
| 그룹 | `AssetManager.religion_trait_groups`, 클래스 `ReligionTraitGroupAsset` |
| 런타임 소유자 | `Religion`, `World.world.religions` 내부 |
| 로컬라이제이션 접두사 | `religion_trait_` |
| 기본 아이콘 폴더 | `ui/Icons/religion_traits/` |

> [!WARNING] 종교 스탯은 유닛에게 도달하지 않습니다
> 종교는 `base_stats` 가 `Actor` 에게 결코 전달되지 않는 유일한 특성 시스템입니다. `Actor.updateStats()` 가 합성하는 대상은 아종, 가문, 언어, 문화뿐입니다. **종교는 이 목록에 없습니다.**
>
> 따라서 종교 특성은 수치가 아니라 그것이 *수행하는 행위*(의식, 지형 변환, 액션 훅)를 통해 세상에 변화를 줍니다. 여기에 `base_stats["damage"] = 10` 을 작성하는 것은 아무런 효과가 없는 무의미한 짓이며, 이 페이지에서 가장 흔히 낭비되는 오후 시간입니다 :PES4_BigSad:.

## 등록하기

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // 신도들이 시도할 수 있는 의식
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed`는 게임 시작 시 딱 한 번만 읽힙니다
> 새로 생기는 종교는 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만드는 풀에서 초기 특성을 뽑습니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 특성에 이 플래그를 켜는 것만으로는 아무것도 바뀌지 않습니다. 여러분의 특성은 그 풀에 절대 들어가지 않으며, 새로운 창시자에게 우연히 부여되는 일도 없습니다. 바닐라와 같은 가중치로 직접 넣어주세요:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.religion_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.

## 의식: `plot_id` 필드

`plot_id` 가 설정된 종교 특성은 **의식(Rite)**이 됩니다. 종교는 의식들을 `possible_rites` 에 수집하며, 음모 조건이 충족되면 지도자와 사제들이 자발적으로 실행을 시도합니다.

```csharp
trait.plot_id = "summon_meteor_rain";
```

이 ID는 `AssetManager.plots_library` 를 가리킵니다. 바닐라 의식은 기존 음모를 재사용하며(`summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension`), 여러분도 이를 재사용하거나 미리 자신만의 `PlotAsset` 을 등록할 수 있습니다.

음모 쪽에서 누가 이를 시도할 수 있고 얼마나 까다로운지를 결정합니다:

| PlotAsset 필드 | 역할 |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | 누가 음모를 시작할 수 있는지 |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | 능력치 조건 |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | 레벨 및 명성 조건 |
| `progress_needed`, `money_cost` | 소요 기간 및 금전 비용 |
| `pot_rate`, `rarity` | AI가 이를 선택하는 빈도 |
| `check_is_possible`, `check_should_continue` | 커스텀 가능 여부 및 지속 조건 |

## 지형 변환: `transformation_biome_id` 필드

종교 특성만의 또 다른 고유 필드입니다. 해당 특성을 변환 특성으로 지정하고 신앙이 주변으로 퍼뜨릴 바이옴을 지정합니다:

```csharp
trait.transformation_biome_id = "biome_desert";
```

바닐라에서는 `sands_of_ruin` (사막), `shadowroot` (오염), `echo_of_the_void` (특이점), `infernal_rot` (지옥), `cosmic_radiation` (황무지)에 이를 활용합니다. 이 특성을 가진 종교는 신도들이 거주하는 지형을 서서히 재작성해 나가며, 이는 게임 내 단일 특성이 만들어낼 수 있는 가장 거대한 시각적 변화입니다.

## 실제로 무언가를 *수행*하게 만들기

스탯이 적용되지 않으므로, 액션 훅이야말로 종교 특성이 존재 이유를 증명하는 핵심 수단입니다. 일반적인 모든 특성이 가진 것과 동일한 훅을 지원합니다:

```csharp
// 몇 초마다 각 신도에게 실행
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// 신도가 사망했을 때
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

종교 특성은 주문이나 결정을 부여할 수도 있으며, 단순한 주기적 타이머보다 훨씬 자연스럽게 어우러지는 경우가 많습니다:

```csharp
trait.addSpell("hello_bolt");           // 발사체, 주문 및 효과 참고
trait.addDecision("burn_tumors");       // 신도들이 내릴 수 있는 AI 결정
```

## 바닐라 그룹

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

나만의 탭 만들기: **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 (`AssetManager.religion_trait_groups` 및 `ReligionTraitGroupAsset`).

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## 특성 부여하기

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

`Religion` 객체는 `cities`, `kingdoms`, `books`, `possible_rites` 도 노출하므로, 내 코드가 특정 종교의 행보를 파악해야 할 때 주로 이들을 읽게 됩니다.

> [!TIP] 의식이 진정한 핵심입니다
> 숫자만 바꾸는 종교는 눈에 띄지 않습니다. 사제들이 이따금 운석 폭풍을 소환하는 종교야말로 플레이어들이 스크린샷을 찍어 공유하는 법입니다. 모든 에너지를 `plot_id` 에 쏟으세요 :aPES_Flames:.
