---
title: 왕국 및 세력
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbkingdoms:
order: 178
---

# 왕국 및 세력 :wbkingdoms:

WorldBox의 모든 유닛은 왕국에 속합니다. 문명 종족뿐만이 아닙니다. 늑대는 늑대 왕국에, 도적은 도적 세력에, 중립적인 닭은 중립 왕국에 속합니다. `KingdomAsset`은 세력의 **유형**을 정의하는 것이지, 맵 위에 존재하는 개별 왕국이 아닙니다.

이 핵심적인 차이를 명확히 구분해야 합니다:

| | |
| --- | --- |
| `AssetManager.kingdoms`의 `KingdomAsset` | 템플릿. "오크 왕국이란 무엇인가" |
| `World.world.kingdoms`의 `Kingdom` | 실행 중인 월드에 존재하는 이름, 색상, 도시를 가진 실제 왕국 |

당신은 전자를 등록하고, 게임이 후자를 생성합니다.

## 템플릿 복제하기

액터와 마찬가지로 왕국에도 정확히 이 목적을 위한 `$TEMPLATE$` id가 존재합니다:

| 템플릿 | 용도 |
| --- | --- |
| `$TEMPLATE_CIV$` | 문명 세력 |
| `$TEMPLATE_CIV_NEW$` | 새로운 동물 문명 스타일 |
| `$TEMPLATE_NOMAD$` | 정착하기 전의 야생 방랑 단계 |
| `$TEMPLATE_MOB$` | 적대적인 몬스터 세력 |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | 일부에 적대적이지만 문명에는 우호적 |
| `$TEMPLATE_ANIMAL$` | 야생 동물 |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | 먼저 싸움을 걸지 않는 평화로운 야생동물 |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // 정착한 문명 세력.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // 도시를 세우기 전의 야생/방랑 단계.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$`는 이미 `nomads = true`, `civ = false`, `mobs = true`를 자동으로 설정해 두었습니다. 많은 사람들이 실수하는 부분이므로 확실히 짚고 넘어갑니다: **`civ`, `nomads`, `mobs` 등은 `bool` 필드이지 태그가 아닙니다.** `wild.nomads = true`는 유효한 필드입니다. `wild.addTag("nomads")`는 게임 내 어떤 코드도 읽지 않는 무의미한 태그이며, 아무 경고 없이 조용히 실패합니다 :aPES_Liar:.

그다음 액터 에셋에서 이들을 가리키도록 지정하여 두 시스템을 연결합니다:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

이 설정이 없으면 당신의 크리처는 클론 원본이 사용하던 왕국(대체로 인간)에 스폰되어 기괴한 상황을 연출하게 됩니다.

## 주요 필드

### 어떤 종류의 세력인가

| 필드 | 역할 |
| --- | --- |
| `civ` | 도시를 세우고 전쟁을 치르며 지도자를 가짐 |
| `nomads` | 정착 전의 방랑 단계 |
| `nature` | 야생 동물 |
| `mobs` | 적대적 몬스터 |
| `neutral` | 도발당하지 않는 한 선제공격하지 않음 |
| `abandoned`, `concept` | 내부 연산용 특수 세력, 실제 주민이 아님 |
| `brain` | AI가 통제하는 메타 세력 |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | 게임 내 목록 분류 기준 |

### 어떻게 행동하는가

| 필드 | 역할 |
| --- | --- |
| `always_attack_each_other` | 이 유형의 두 왕국은 영구적으로 상호 적대 관계 유지 |
| `units_always_looking_for_enemies` | 소속 유닛이 멈추지 않고 끊임없이 적을 색출함 |
| `count_as_danger` | 타 세력이 이를 위협으로 인식할지 여부. 기본값 `true` |
| `friendship_for_everyone` | 세상의 모든 존재에게 우호적 |
| `force_look_all_chunks` | 주변뿐 아니라 맵 전체 청크를 탐색함(연산 비용 큼) |
| `building_attractor_id` | 이들을 끌어들이는 특정 건물 유형 |

### 태그: 누가 누구와 싸우는가

이것이 핵심 시스템이며, 단순한 수치가 아닌 세 개의 문자열 집합으로 구성됩니다:

```csharp
kingdom.addTag("civ");             // 나의 정체성
kingdom.addFriendlyTag("neutral"); // 내가 좋아하는 대상
kingdom.addEnemyTag("orc");        // 내가 증오하는 대상
```

두 왕국은 태그를 대조하여 기본 외교 관계를 결정합니다. 태그가 없는 세력은 아무도 좋아하지 않고, 아무도 미워하지 않으며, 아무런 흥미로운 행동도 하지 않습니다.

### 외형

| 필드 | 역할 |
| --- | --- |
| `path_icon`, `show_icon` | 세력 아이콘. `setIcon(path)`로 둘 다 한 번에 설정 |
| `default_kingdom_color`, `default_civ_color_index` | 시작 색상 |
| `color_building` | 건물에 적용되는 색조 |

## 세력을 완성하는 나머지 시스템들

왕국 에셋 하나만으로는 단순한 이름표에 불과합니다. 온전한 세력을 이루기 위해 맞물려 돌아가는 라이브러리들은 다음과 같습니다:

| 요소 | 라이브러리 | 용도 |
| --- | --- | --- |
| 깃발 | `AssetManager.kingdom_banners_library` | 절차적으로 생성되는 국기 |
| 색상 | `AssetManager.kingdom_colors_library` | 왕국에 부여되는 색상 팔레트 |
| 왕국 특성 | `AssetManager.kingdoms_traits` | 국가 정책(주로 세금). **[왕국 특성](#/nml/kingdom-traits)** 참고 |
| 왕국 직무 | `AssetManager.job_kingdom` | 세력 AI가 추진하는 거시적 작업 |
| 왕국 태스크 | `AssetManager.tasks_kingdom` | 해당 직무를 수행하는 비헤이비어 트리 |
| 전쟁 유형 | `AssetManager.war_types_library` | 선포할 수 있는 전쟁의 종류 |
| 건축 양식 | `AssetManager.architecture_library` | 건물들의 그래픽 외형 |
| 건축 순서 | `AssetManager.city_build_orders` | 새 도시가 무엇을 어떤 순서로 짓는지 |
| 이름 생성기 | `AssetManager.name_generator`, `AssetManager.name_sets` | 왕국, 도시, 시민 이름 명명 규칙 |

특별한 이유가 없다면 바닐라 자원을 재사용하세요. 액터에 `banner_id = "human"`을 지정하기만 해도 완벽히 작동하는 깃발 생성기를 공짜로 얻을 수 있습니다.

## 런타임에 왕국 다루기

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()`는 "이 객체는 파괴되었으나 어딘가에 여전히 참조가 남아있다"는 의미를 나타내는 확장 메서드입니다. 왕국, 도시, 군대, 유닛을 순회하는 모든 반복문에서 반드시 이를 체크하세요. 1시간마다 크래시가 터지는 모드와 안정적으로 돌아가는 모드를 가르는 차이점입니다 :aPES2_Sweat:.

## 성격(Personality)

국왕과 도시 지도자는 **성격**을 부여받습니다: 라벨과 몇 가지 `personality_*` 스탯으로 구성되며 왕국이 얼마나 공격적이거나 외교적으로 행동할지를 좌우합니다. 등록은 세 줄이면 끝나지만 누군가에게 그것을 *부여*하는 것이 문제입니다: `Actor.updateStats()`는 스탯이 변경될 때마다 4개의 바니라 ID 중 하나를 이름으로 직접 선택합니다.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Postfix 패치는 매 스탯 갱신 후 실행되므로 성격 교체가 유지됩니다. 통치자가 두 성격의 스탯을 모두 갖지 않도록 바니라 성격의 수치를 먼저 뺀 다음 내 성격의 수치를 더합니다. `s_personality`와 `mergeStats()`는 `internal` 멤버이므로 NML의 **publicized** 어셈블리를 기반으로 컴파일됩니다.

## 우호도, 충성도, 행복도

정치적 상호작용을 제어하는 세 가지 소형 라이브러리가 있으며, 모두 계산 함수들의 목록으로 이루어져 있습니다:

| 라이브러리 | 호출 대상 | 반환값 |
| --- | --- | --- |
| `AssetManager.opinion_library` | 모든 왕국 쌍마다 | 상대 왕국에 대한 우호도 점수 |
| `AssetManager.loyalty_library` | 모든 도시마다 | 소속 왕국에 대한 충성도 점수 |
| `AssetManager.happiness_library` | 유닛에게 발생한 이벤트 | 고정된 행복도 변화량 |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

우호도와 충성도는 매번 전체 목록을 순회하며 합산되므로 `add()`만으로 충분하며, `translation_key`(음수일 경우 `translation_key_negative`)를 통해 게임 내 세부 항목에 한 줄로 표시됩니다. 행복도 이벤트는 코드에서 `actor.changeHappiness("hello_warm_embers")`를 호출할 때 발생합니다(**[음모](#/nml/plots)**의 축제 등에서 활용).

> [!WARNING] 행복도 항목은 시작 시 번호가 매겨집니다
> 유닛의 행복도 기록에는 ID가 아니라 항목의 *인덱스 번호*가 저장되며, `HappinessLibrary.post_init()`이 번호를 한 번만 부여합니다. 내 항목은 0으로 남아 바니라의 첫 번째 항목으로 표시되므로, `index`를 직접 설정해 주어야 합니다.

## 다른 시스템의 깃발 파츠

왕국만 깃발을 가지는 것이 아닙니다: 문화, 종교, 가문, 언어, 아종, 가족도 각자의 파츠 라이브러리(`AssetManager.culture_banners_library` 등)를 가지고 있습니다. 각 라이브러리는 경로 목록을 담은 `main` 에셋을 하나씩 가지며 새 문화는 그중 하나의 인덱스를 추첨합니다.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

경로는 깃발이 그려질 때마다 개별 로드되므로 새로고침할 필요가 없습니다. 목록 길이를 초과하는 인덱스는 0으로 안전하게 대체되므로 모드로 생성된 세이브 파일도 모드 없이 정상적으로 열립니다. 바니라 파츠 크기에 맞추기 위해 **[UnityExplorer](#/toolbox/unity-explorer)**에서 확인해 보세요.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] 새로운 왕국 에셋은 대개 필요하지 않습니다
> 새로운 생명체 종족에는 필요하지만 새로운 *행동 양식*에는 필요하지 않습니다. 대부분의 "진영" 모드는 왕국 특성, 문화, 또는 외교 판정 Harmony 패치로 구현하는 것이 훨씬 깔끔합니다. 기존 왕국들의 행동을 바꾸고 싶을 때는 왕국 에셋을 추가하지 마세요.
