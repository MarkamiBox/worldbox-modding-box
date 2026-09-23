---
title: 문화 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbtiphat:
order: 106
---

# 문화 특성 :wbtiphat:

**문화**는 여러 도시가 공유하는 습관과 관습의 총체입니다. 무엇을 짓고, 무엇을 제련하며, 어떻게 상속하고, 무엇을 읽으며 무엇을 가치 있게 여길지를 결정합니다. 문화 특성은 바로 그러한 관습 중 하나입니다.

7가지 특성 시스템 중 문화는 가장 넓은 파급력을 지닙니다. 문화는 도시를 따라 전파되고, 창시자보다 오래 존속하며, 소속된 모든 단일 유닛에게 능력치를 결합합니다. 1시간의 플레이 동안 세계 전역으로 잔잔하게 번져 나가는 모드를 원한다면 이 라이브러리가 정답입니다.

| | |
| --- | --- |
| 라이브러리 | `AssetManager.culture_traits` |
| 클래스 | `CultureTrait` |
| 그룹 | `AssetManager.culture_trait_groups`, 클래스 `CultureTraitGroupAsset` |
| 런타임 소유자 | `Culture`, `World.world.cultures` 내부 |
| 로컬라이제이션 접두사 | `culture_trait_` |
| 기본 아이콘 폴더 | `ui/Icons/culture_traits/` |

## 등록하기

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // 높을수록 그룹 상단에 정렬
                spawn_random_trait_allowed = false,  // 무작위로 지급되지 않음
                can_be_given = true,                 // 플레이어가 에디터에서 부여 가능
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // 아래 경고 참조: 농부와 군인 모두에게 적용됩니다.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed`는 게임 시작 시 딱 한 번만 읽힙니다
> 새로 생기는 문화는 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만드는 풀에서 초기 특성을 뽑습니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 특성에 이 플래그를 켜는 것만으로는 아무것도 바뀌지 않습니다. 여러분의 특성은 그 풀에 절대 들어가지 않으며, 새로운 창시자에게 우연히 부여되는 일도 없습니다. 바닐라와 같은 가중치로 직접 넣어주세요:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.culture_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.

**[커스텀 특성](#/nml/custom-traits)** 의 원칙은 여기에서도 동일합니다. 스탯 설정 전에 `add()` 를 호출하고, `path_icon` 은 자동 입력되지 않으며, ID에는 접두사를 붙여야 합니다. 이제부터 설명할 내용은 문화 특성만의 고유한 차별점입니다.

> [!WARNING] 문화 특성의 `base_stats` 는 모든 구성원에게 적용됩니다
> `Actor.updateStats()` 는 해당 문화의 모든 유닛에게 `culture.base_stats` 를 병합합니다. 단 한 명의 예외도 없이요. "+5 공격력" 교리는 빵집 주인까지 무장시킵니다.
>
> 보너스를 특정 구성원에게만 적용하고 싶다면 `base_stats` 를 비워두고 `Actor.updateStats` 의 Harmony Postfix에서 직접 필터링하세요. **[Harmony 패치](#/nml/harmony-patches)** 를 참고하세요. 개인이 아닌 문화라는 집단 자체에 적용하려면 대신 `base_stats_meta` 를 사용하세요. **[스탯 레퍼런스](#/nml/stats)** 를 참고하세요.

## 문화가 제작하는 장비 유도하기

이것은 문화 특성만이 가지고 있는 고유 필드로, 단 하나의 무기 코드를 건드리지 않고도 문화에 독특한 *개성*을 부여하는 가장 깔끔한 방법입니다:

```csharp
trait.value = 10f;                       // 선호도의 가중치
trait.addWeaponSubtype("sword");         // 무기 분류 전체를 선호
trait.addWeaponSpecial("hello_relic");   // 또는 특정 아이템 ID 하나를 선호
```

두 헬퍼 메서드 모두 자동으로 `is_weapon_trait = true` 를 설정합니다. 도시가 제작할 장비를 결정할 때 제작 코드가 문화의 선호 무기를 읽어들입니다. 단순한 수치가 아니라 군인의 손에 들린 무기 자체가 바뀌게 됩니다. 바닐라의 `bow_lovers` 와 `spear_lovers` 가 바로 이렇게 동작합니다.

| 필드 | 역할 |
| --- | --- |
| `is_weapon_trait` | 특성을 무기 선호도로 지정 |
| `related_weapon_subtype_ids` | 선호 무기 분류. `addWeaponSubtype` 이 여기에 추가 |
| `related_weapons_ids` | 선호하는 특정 아이템 ID. `addWeaponSpecial` 이 여기에 추가 |
| `value` | 선호도가 반영되는 가중치 |

## 문화의 건축 방식 유도하기

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

`PassableZoneChecker` 를 인자로 받아 `town_layout_plan = true` 를 설정합니다. 바닐라의 도시 계획 특성(기둥형 도시, 도로 중심 도시)이 바로 이렇게 구현되어 있습니다.

이 페이지에서 가장 심층적인 훅이며, 문화는 한 번에 하나의 배치 계획만 따를 수 있으므로 다른 모드와 충돌할 가능성이 가장 높은 지점입니다. 내 특성이 유일할 것이라 단정하기 전에 문화가 이미 보유한 특성의 `town_layout_plan` 을 먼저 확인하세요.

## 바닐라 그룹

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

나만의 탭 만들기: **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 (`AssetManager.culture_trait_groups` 및 `CultureTraitGroupAsset`).

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## 특성 부여하기

```csharp
// 해당 종족의 모든 생명체가 이 특성을 가지고 시작함
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// 또는 런타임에 이미 존재하는 문화에 추가
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` 과 `addTrait` 은 ID 문자열 또는 에셋 객체를 모두 지원합니다.

## 유닛에서 문화 특성 확인하기

매우 흔하게 쓰이는 질문이므로, `Actor` 에는 이를 위한 전용 단축 메서드가 준비되어 있습니다:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] 문화인가, 아종인가?
> 둘 다 전파되지만 방식이 다릅니다. **문화** 특성은 도시를 통해 퍼지며 합류하는 사람이라면 누구나 받아들일 수 있습니다. **아종** 특성은 혈통 번식을 통해서만 전파되며 외부인이 얻을 수 없습니다. "엘프가 활을 잘 쏘는 이유는 그렇게 자랐기 때문이다"는 문화이고, "엘프가 활을 잘 쏘는 이유는 시력 구조 때문이다"는 아종입니다. **[아종 특성](#/nml/subspecies-traits)** 을 확인하세요 :catnoted:.
