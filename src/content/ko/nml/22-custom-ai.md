---
title: 커스텀 AI & 행동 트리
group: 게임 콘텐츠
subgroup: 액터, 건물 및 AI
icon: :wbgoldenbrain:
order: 144
---

# 커스텀 AI & 행동 트리 :wbgoldenbrain:

이제 가장 깊은 심연으로 들어섭니다. 이 가이드의 다른 모든 페이지는 게임에 *데이터와 사물*을 추가했습니다. 하지만 이 페이지는 **의사결정**을 추가합니다: 수천 마리의 다른 생명체와 부대끼는 월드 속에서, 생명체가 스스로 판단하고 영원히 수행할 행동을 결정하는 것이죠.

## 게임의 인공지능 동작 원리

큰 단위에서 작은 단위로 이어지는 3단계 계층 구조입니다:

| 계층 | 개념 | 보관 라이브러리 |
| --- | --- | --- |
| **잡** (`ActorJob`) | 이 생명체가 수행할 전반적인 직업/역할: "시민으로 살아가기", "군인으로 복무하기" | `AssetManager.job_actor` |
| **태스크** (`BehaviourTaskActor`) | 직업 내부의 구체적인 목표: "밥 먹으러 가기", "건물 짓기" | `AssetManager.tasks_actor` |
| **행동** (`BehaviourActionActor`) | 매 틱마다 실행되어 다음 할 일을 반환하는 태스크의 세부 단계 | 태스크에 순차적으로 추가됨 |

잡은 태스크들을 담고, 태스크는 행동(Behaviour)들을 담으며, 행동들은 누군가 멈추라고 할 때까지 순서대로 실행됩니다.

## 행동(Behaviour) 작성하기

행동은 메서드가 딱 하나뿐인 클래스입니다. 액터를 전달받아 작은 작업을 하나 수행한 뒤 `BehResult` 를 반환합니다:

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```
`PickTile` 이 이 연습의 전부입니다. 게임이 대신 해주지 않는 유일한 부분이고, 그 파일의 나머지는 전부 배선입니다.

> [!WARNING] `beh_tile_target` 은 internal
> behaviour가 쓰는 그 필드는 게임 어셈블리에서 `internal` 로 표시돼 있어서, 이건 **publicized** 된 `Assembly-CSharp.dll` 을 참조해야 컴파일됩니다 (**[상태 효과](#/nml/status-effects)** 의 메모 참고). 없으면 컴파일러가 이 줄을 거부하니, 대상은 자기 필드에 들고 있어야 합니다 :PES5_Noted:.


| 결과값 | 의미 |
| --- | --- |
| `BehResult.Continue` | 이 태스크의 다음 행동으로 진행 |
| `BehResult.Stop` | 이번 틱의 실행을 종료 |
| `BehResult.RepeatStep` | 다음 틱에 나를 한 번 더 실행 |
| `BehResult.Skip` | 다음 단계를 건너뜀 |
| `BehResult.StepBack` | 한 단계 뒤로 되돌아감 |
| `BehResult.RestartTask` | 태스크를 맨 처음부터 다시 시작 |

## 태스크(Task)와 잡(Job) 연결하기

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```

두 번째 행동을 눈여겨보세요: **바닐라 노드를 재사용하세요**. 타일로 걸어가기, 상태 부여하기, 건물 찾기, 대상 공격하기 등 게임에는 이미 수많은 행동 노드가 완성되어 있습니다. 판단만 직접 작성하고 힘든 실행 과정은 기존 코드를 빌려 쓰는 것이 한 달 걸릴 작업을 주말 이틀로 단축하는 비결입니다.

## 생명체가 실제로 내 잡을 실행하게 만들기

하모니 패치를 할 필요조차 없습니다. 모든 액터의 AI는 델리게이트를 통해 다음 잡을 요청하므로, 그 델리게이트만 살짝 바꿔치기하면 됩니다:

```csharp
// 제어권 가로채기
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // 지금 하던 일을 버리고 즉시 새 잡을 요청하도록 강제

// 제어권 돌려주기
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] 제어권이 유지되고 있는지 주기적으로 확인해야 합니다
> 전투(및 몇몇 특수 시스템)가 끝나면 현재 잡이 초기화되면서 새 작업을 요청합니다. 여러분의 델리게이트가 여전히 걸려있다면 다시 여러분의 잡이 실행되지만, 다른 모드나 코드가 델리게이트를 덮어썼다면 통제권을 잃게 됩니다. 무조건 유지된다고 가정하지 말고 주기적으로 확인하세요 :PES5_Noted:.

## 결정: 생명체가 스스로 태스크를 선택하게 만들기

작업 델리게이트를 교체하는 것은 강제적인 통제 방식입니다. 대부분의 경우 보다 자연스러운 방식을 원할 것입니다: 식사, 수면, 전투와 나란히 생명체가 스스로 비교하고 고민할 수 있는 선택지로 내 태스크를 제공하는 것입니다. 이것이 바로 **결정(Decision)**이며, 게임 스스로가 유닛의 행동을 결정하는 기본 원리입니다.

결정은 *언제*를 정하고, 이미 작성한 태스크는 *어떻게*를 정합니다. 두뇌가 결정을 내리면 동일한 ID(또는 `task_id`에 지정된 ID)의 태스크를 실행합니다.

```csharp Mods/HelloBox/Code/HelloDecisions.cs
namespace HelloBox
{
    public static class HelloDecisions
    {
        public const string WANDER = "hello_decide_wander";

        public static void Initialize()
        {
            if (AssetManager.decisions_library.has(WANDER)) return;

            DecisionAsset wander = new DecisionAsset
            {
                id = WANDER,
                task_id = HelloAI.TASK,                  // the decision says when, the task says how
                priority = NeuroLayer.Layer_1_Low,
                path_icon = "ui/Icons/iconHelloDrive",
                cooldown = 20,                           // seconds before this unit may pick it again
                weight = 1f,
                unique = true,                           // only the actors you give it to, below
                action_check_launch = (Actor pActor) => pActor != null && pActor.isAlive() && !pActor.isFighting()
            };

            AssetManager.decisions_library.add(wander);

            // linkAssets() fills these three for every decision, at startup, before your mod.
            // decision_index is where each unit keeps this decision's cooldown: left at 0, yours
            // would share it with the first vanilla decision.
            wander.decision_index = AssetManager.decisions_library.list.IndexOf(wander);
            wander.priority_int_cached = (int)wander.priority;
            wander.has_weight_custom = wander.weight_calculate_custom != null;

            // who gets it: every wisp, through its actor asset
            ActorAsset wisp = AssetManager.actor_library.get("hello_wisp");
            if (wisp != null) wisp.addDecision(WANDER);
        }
    }
}
```

| 필드 | 역할 |
| --- | --- |
| `task_id` | 시작할 태스크입니다. 비워두면 결정과 동일한 ID의 태스크를 실행합니다 |
| `priority` | 레이어 계층(`NeuroLayer.Layer_0_Minimal` ~ `Layer_4_Critical`). 실행 가능한 결정이 있는 최상위 레이어만 추첨에 참여합니다 |
| `weight` / `weight_calculate_custom` | 동일 레이어 내에서의 상대적 매력도(고정값 또는 유닛별 동적 계산) |
| `action_check_launch` | 실행 가능 조건 판정. `false`이면 이번 주기에는 선택 후보에서 제외됩니다 |
| `cooldown` | 동일 유닛이 다시 선택할 수 있을 때까지의 재사용 대기시간(초) |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | 델리게이트 실행 전에 체크하는 가벼운 필터 조건들 |
| `unique` | 기본 공용 목록에 자동으로 들어가지 않도록 방지. 모드 결정은 항상 `true` |

> [!WARNING] 게임이 시작 시 채워넣는 3가지 필드
> `DecisionsLibrary.linkAssets()`는 시작 시 모든 결정에 번호를 매기고 `priority`를 `priority_int_cached`에 복사하며 `has_weight_custom`을 설정합니다. `add()` 후의 세 줄을 생략하면 내 결정은 바니라의 첫 번째 결정과 쿨다운을 공유하고 최하위 레이어에 머물며 커스텀 가중치 계산이 무시됩니다 :wbfacepalm:.

> [!WARNING] 기존에 생성되어 있던 유닛은 남은 슬롯이 1개뿐입니다
> 각 유닛은 생성될 때 2의 거듭제곱으로 올림된 크기의 배열로 결정 쿨다운을 관리합니다. 바니라는 127개의 결정을 가지고 있어 배열 크기가 128이므로 남은 자리는 정확히 **1개**입니다. 모드 로드 전에 존재하던 유닛에게 두 개 이상의 모드 결정이 주어지면 `IndexOutOfRangeException`이 발생합니다. 새로 생성되는 유닛은 확장된 크기로 생성되므로, HelloBox는 바니라 특성이 아닌 자체 크리처에게 결정을 부여합니다.

결정은 그것을 부여하는 주체를 통해 유닛에게 전달됩니다. `ActorAsset`은 `addDecision()`으로 부여합니다. **특성(Trait)은 다릅니다**: 특성은 시작 시 ID를 객체로 변환하므로 수동으로 배열을 할당해 주어야 합니다:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## 도시 직업

시민은 자신의 두뇌가 아니라 도시로부터 일자리를 배정받습니다. 도시는 필요한 일감을 계산하고 직업 슬롯(건축가, 농부, 광부 등)을 열어 시민을 고용합니다. **시민 직업(Citizen Job)**은 이러한 슬롯 중 하나이며, 고용된 유닛은 동일한 ID의 `ActorJob`을 실행합니다.

```csharp Mods/HelloBox/Code/HelloCityJobs.cs
using ai.behaviours;   // CityBehCheckCitizenTasks
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCityJobs
    {
        public const string KEEPER = "hello_ember_keeper";

        public static void Initialize()
        {
            if (AssetManager.citizen_job_library.has(KEEPER)) return;

            // What the citizen does once hired: an actor job with the same id
            ActorJob work = new ActorJob { id = KEEPER };
            work.addTask(HelloAI.TASK);
            work.addTask("end_job");
            AssetManager.job_actor.add(work);

            CitizenJobAsset keeper = new CitizenJobAsset
            {
                id = KEEPER,
                path_icon = "ui/Icons/iconHelloDrive"
            };
            AssetManager.citizen_job_library.add(keeper);

            // post_init() and linkAssets() did these two at startup
            keeper.unit_job_default = KEEPER;
            AssetManager.citizen_job_library.list_priority_normal.Add(keeper);
        }

        // A city hands out job slots in one behaviour, from a fixed list of vanilla jobs.
        // Nothing ever opens a slot for yours unless you add it after that list.
        [HarmonyPatch(typeof(CityBehCheckCitizenTasks), nameof(CityBehCheckCitizenTasks.execute))]
        public static class Patch_CitizenTasks
        {
            public static void Postfix(City pCity)
            {
                if (pCity == null || pCity.status.population_adults < 10) return;

                CitizenJobAsset keeper = AssetManager.citizen_job_library.get(KEEPER);
                if (keeper == null) return;

                // one keeper per city, recomputed every time the city recounts its jobs
                if (pCity.jobs.countCurrentJobs(keeper) == 0) pCity.jobs.addToJob(keeper, 1);
            }
        }
    }
}
```

게임 시작 시점에만 처리되는 항목들을 보완하는 3가지 핵심:

1. **`unit_job_default`**는 고용된 시민이 실행할 `ActorJob`입니다. `post_init()`이 ID를 복사합니다.
2. **`list_priority_normal`**은 시민들에게 제공되는 직업 목록입니다(`linkAssets()`가 구성). `priority` > 0인 직업은 `list_priority_high`에 들어가 우선 배정됩니다.
3. **일자리 슬롯 생성.** `CityBehCheckCitizenTasks.execute()`는 고정된 바니라 목록에서 슬롯을 엽니다. Harmony Postfix 패치로 내 직업의 슬롯을 추가로 개설합니다.

| 필드 | 역할 |
| --- | --- |
| `priority` / `priority_no_food` | 0 초과: 일반 직업보다 우선 배정되거나 식량 부족 시에만 개설 |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | 직업을 가질 수 있는 신분 조건 |
| `should_be_assigned` | 유닛별 배정 적합성 조건식 |
| `common_job` | `false`이면 일반 공용 목록에서 완전히 제외 |
| `path_icon` | 도시 직업 현황 창에 표시될 아이콘 |

## 텍스트

태스크 이름은 유닛 정보 창에 "현재 하고 있는 일"로 표시되며, 결정은 자신이 시작하는 태스크의 이름을 그대로 차용합니다:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## 프레임레이트를 지키기 위한 최적화 철칙

월드에는 수천 마리의 유닛이 살 수 있습니다. 여러분의 행동 코드는 매 틱마다 그 수천 마리 위에서 실행됩니다.

- **무거운 연산은 `execute` 안이 아니라 타이머에서 처리하세요.** 비싼 로직은 `Update()` 에서 타이머를 두고 간헐적으로 돌려 결과를 캐싱해 두고, `execute` 에서는 그 캐시를 읽기만 해야 합니다.
- **부하를 분산시키세요.** 40마리를 제어한다면 한 프레임에 40마리를 다 돌리지 말고 4프레임에 걸쳐 10마리씩 나누어 연산하세요.
- **빠른 탈출(Early Return)을 습관화하세요.** `execute` 의 맨 첫 줄들은 즉시 리턴할 수 있는 가벼운 널 체크와 조건 검사여야 합니다.
- **핫 패스(Hot Path)에서 절대 힙 메모리 할당(new)을 하지 마세요.** 매 틱마다 수천 마리 유닛에서 새 리스트나 람다를 생성하면 가비지 컬렉터가 폭발하며 프레임이 바닥으로 곤두박질칩니다.

> [!TIP] 트레잇을 먼저 부여하고 행동을 붙이세요
> 제어권을 가져온 생명체에게 눈에 띄는 트레잇(참고: **[커스텀 트레잇](#/nml/custom-traits)**)을 부여해 두면 플레이어도 내 유닛임을 알 수 있고, *여러분 자신*도 코드가 엉뚱한 녀석에게 돌고 있지 않은지 한눈에 파악할 수 있습니다 :pepeOK:.
