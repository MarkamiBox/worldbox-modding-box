---
title: 왕국 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbcrown:
order: 114
---

# 왕국 특성 :wbcrown:

**왕국 특성**은 국가 정책입니다. 신앙도 아니고 혈통도 아닙니다. 왕권이 결정을 내리고 왕국 전역에 효력을 발휘하는 국가적 지침입니다.

바닐라는 이 시스템을 단 한 가지 목적, 즉 세율 설정에만 활용합니다. 그 덕분에 7가지 특성 시스템 중 가장 규모가 작고 텅 빈 영역이며, 새로운 정책을 도입하기에 가장 흥미진진한 무대이기도 합니다. 누구도 이 공간을 두고 경쟁하지 않습니다 :wbsmirk:.

| | |
| --- | --- |
| 라이브러리 | `AssetManager.kingdoms_traits` |
| 클래스 | `KingdomTrait` |
| 그룹 | `AssetManager.kingdoms_traits_groups`, 클래스 `KingdomTraitGroupAsset` |
| 런타임 소유자 | `Kingdom`, `World.world.kingdoms` 내부 |
| 로컬라이제이션 접두사 | `kingdom_trait_` |
| 기본 아이콘 폴더 | `ui/Icons/kingdom_traits/` |

> [!WARNING] 왕국 스탯은 유닛에게 도달하지 않습니다
> 종교와 마찬가지로 `kingdom.base_stats` 는 `Actor` 에게 결코 병합되지 않습니다. 인게임에서 확인하는 왕국 단위의 수치들은 왕국의 특성 블록이 아니라 **국왕 자신의 능력치**(`king.stats["cities"]` 등)에서 비롯됩니다.
>
> 따라서 왕국 특성은 `base_stats` 가 아니라 자체 필드와 코드를 통해 국가를 변화시켜야 합니다.

## 세금 관련 필드

오직 왕국 특성만이 가지고 있는 3개의 고유 필드이자, 바닐라가 이 시스템으로 수행하는 모든 것입니다:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| 필드 | 역할 |
| --- | --- |
| `is_local_tax_trait` | 왕국의 **지방** 세율을 결정하는 특성임을 명시 |
| `is_tribute_tax_trait` | 왕국의 **조공** 세율을 결정하는 특성임을 명시 |
| `tax_rate` | 세율 수치 자체 (소수점 비율) |

왕국은 특성이 변경될 때마다 두 세율을 처음부터 다시 계산합니다: `SimGlobals` 의 전역 기본값에서 출발하여 소속 특성을 순회하며 일치하는 특성이 값을 **덮어쓰도록** 합니다.

> [!WARNING] 마지막에 순회된 특성이 이깁니다. 상반 설정을 잊지 마세요
> 세율 특성은 누적 합산되지 않습니다. 만약 한 왕국이 두 개의 `is_local_tax_trait` 특성을 지니고 있다면, 순회 과정에서 뒤에 오는 특성이 앞선 특성을 조용히 덮어써 버립니다.
>
> 바닐라의 모든 세율 특성이 서로를 반대 특성으로 선언하고 있는 이유가 바로 여기에 있습니다. 양방향 모두에서 상반 관계를 등록하세요. 그렇지 않으면 설정한 세율이 적용되었다 안 되었다를 반복하게 됩니다 :PES5_HmmmmNo:.

## 올바르게 등록하기

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed`는 게임 시작 시 딱 한 번만 읽힙니다
> 새로 생기는 왕국은 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만드는 풀에서 초기 특성을 뽑습니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 특성에 이 플래그를 켜는 것만으로는 아무것도 바뀌지 않습니다. 여러분의 특성은 그 풀에 절대 들어가지 않으며, 우연히 부여되는 일도 없습니다. 바닐라와 같은 가중치로 직접 넣어주세요:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.

## 실제로 동작하는 정책 만들기

`base_stats` 가 무의미하므로, 왕국 특성은 다음 두 가지 방법 중 하나로 제 몫을 다하게 됩니다. 둘 다 숫자 하나보다 손이 많이 가지만, 둘 다 그럴 가치가 있습니다.

**결정(Decision)**: 가장 깔끔하고 간결한 방식입니다:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**특성을 읽는 Harmony 패치**: 진정한 국가 정책 시스템을 구축하는 표준적인 방법입니다. 왕권의 통치 행동이 실제로 참조하는 메서드에 패치를 걸고, 그 안에서 왕국의 특성을 확인하세요:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

세율 이외의 모든 왕국 정책은 바로 이 패턴을 따릅니다. 특성이 스위치 역할을 하고, 패치가 실제 동작을 수행합니다. **[Harmony 패치](#/nml/harmony-patches)** 를 참고하세요.

## 바닐라 그룹

`tribute` · `local_tax` · `miscellaneous` · `fate`

총 4개 그룹이며 그중 2개는 세율 쌍입니다. 3개 이상의 정책을 기획 중이라면 전용 탭을 만들어 주세요. **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 (`AssetManager.kingdoms_traits_groups` 및 `KingdomTraitGroupAsset`).

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## 특성 부여하기

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

세력의 토대가 된 왕국 에셋은 별개의 객체입니다. **[왕국과 세력](#/nml/kingdoms)** 을 참고하세요.

> [!TIP] 텅 빈 방
> 7대 특성 시스템 중 6개는 바닐라 콘텐츠로 빽빽하게 차 있어 충돌을 피해 가며 작업해야 합니다. 반면 왕국 특성에는 고작 5개의 특성만 존재합니다. 게임에 완벽히 녹아들면서도 다른 어떤 모드와도 부딪히지 않는 모드를 원한다면, 왕국 정책 세트가 가장 손쉬운 지름길입니다 :PES2_Cash:.
