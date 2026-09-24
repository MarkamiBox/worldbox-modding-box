---
title: 음모
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbrebellion:
order: 180
---

# 음모 :wbrebellion:

**음모(Plot)**는 통치자가 계획을 세우고, 비용을 지불하며, 일정 기간 동안 추진하는 책략입니다(반란, 새로운 전쟁, 동맹 등). 진행도 게이지가 가득 차면 작성한 코드가 실행됩니다. "누군가 계획을 품고 실행에 옮기기까지"의 모든 과정은 게임의 자체 시스템이 처리해 줍니다. 플레이어는 음모 목록에서 주동자, 진행도, 전용 깃발과 함께 음모를 확인할 수 있습니다.

## 음모 추가하기

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

10골드와 도시를 보유하고 여유가 있는 지도자는 이제 불씨 축제를 기획할 수 있습니다. 축제가 끝나면 **[왕국 및 세력](#/nml/kingdoms)** 페이지의 행복도 이벤트를 통해 도시 내 모든 유닛의 행복도가 상승하고, 주동자의 머리 위로 불씨가 떨어집니다(HelloBox다운 연출입니다).

> [!WARNING] `check_is_possible`은 필수입니다
> `PlotAsset.checkIsPossible()`은 지도자가 음모를 고려할 때마다 null 확인 없이 이를 호출합니다. 이 설정을 생략하면 지도자가 음모를 검토하는 순간 `NullReferenceException`이 발생합니다. 특별한 조건이 없다면 단순히 `true`를 반환하세요. 네, 그럴 때도요.

> [!WARNING] 기본 목록은 게임 시작 시 구성됩니다
> 지도자들은 오직 `plots_library.basic_plots`(및 소속 종교의 의식) 목록에서만 음모를 선택합니다. `linkAssets()`는 모드가 로드되기 전 게임 시작 시점에 `is_basic_plot`이 true인 음모들을 이 목록에 채워 넣습니다. 플래그를 설정하는 것만으로는 부족하므로 모드 코드에서 목록에 직접 추가해 주어야 합니다.

## 필드 상세

### 시작 자격 조건

| 필드 | 기능 |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | 실행 가능한 직책. 아무것도 설정되지 않으면 아무도 시작할 수 없음 |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | 주동자에게 요구되는 최소 레벨 및 명성치 |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | 요구 능력치 기준값 (기본값: 2) |
| `money_cost` | 시작 시 소비되는 골드 비용 (플레이어 강제 실행 시 무료) |
| `requires_diplomacy` / `requires_rebellion` | 해당 세계 법칙이 켜져 있을 때만 실행 가능 |
| `check_is_possible` | 시작 가능 여부 판정 델리게이트 (필수) |

### 진행 및 실행 방식

| 필드 | 기능 |
| --- | --- |
| `progress_needed` | 완료까지 필요한 총 작업량 |
| `check_should_continue` | 진행 중 지속적으로 확인하는 판정. `false` 반환 시 취소됨 |
| `action` | 게이지가 가득 찼을 때 실행되는 코드. 성공 시 `true` 반환 |
| `post_action` | `action` 성공 후 실행되는 후속 처리 |
| `try_to_start_advanced` | 대상이 필요한 음모의 특수 시작 처리 (반란에서 `target_kingdom`을 설정하는 등) |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | 음모의 대상이 여전히 생존해 있는지 확인 |

### 외형 및 분류

| 필드 | 기능 |
| --- | --- |
| `path_icon` | 음모 목록 및 깃발에 표시될 아이콘 |
| `group_id` | 카테고리: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | 다른 음모 후보들과 비교한 선택 가중치 |
| `is_basic_plot` | 모든 지도자가 시도 가능. false인 경우 종교 의식으로만 발생 (**[종교 특성](#/nml/religion-traits)** 참조) |

## 텍스트 설정

플롯에는 세 개의 키가 있습니다: 이름, 진행 중인 플롯을 설명하는 줄, 그리고 전체 설명입니다. 두 번째 줄에서는 `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$`, `$target_kingdom$`이 자동으로 채워집니다.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] 강제로 시작해서 테스트하세요
> 지도자가 스스로 여러분의 플롯을 고르기를 기다리면 시간이 걸립니다. 유닛을 선택하고 그 창의 플롯 목록에서 직접 플롯을 시작하세요: 유닛에게는 여전히 허용된 역할 중 하나가 필요하고, 버튼이 켜질지는 `check_can_be_forced`(선택 사항)가 정하지만, 강제로 시작한 플롯은 비용이 들지 않습니다. 여러분의 `action`이 실행되는 걸 보는 가장 빠른 방법입니다 :PES2_EvilPlan:.
