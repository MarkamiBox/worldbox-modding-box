---
title: 왕국 AI
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbdiplomacyhandshake:
order: 180
---

# 왕국 AI :wbdiplomacyhandshake:

생물 AI는 개별 유닛 단위로 동작합니다: 음식 찾기, 나무로 이동, 적과 전투 등. 반면 왕국 AI는 문명 전체 단위로 동작합니다. 왕국이 언제 전쟁을 선포하고, 국경을 넓히고, 식민지를 세우고, 동맹을 맺고, 군대를 파견할지 결정하는 핵심 시스템입니다.

유닛 AI와 마찬가지로 작업(job)과 태스크(task)로 구성되지만, 매 단계마다 `Actor` 대신 `Kingdom`을 전달받습니다.

## 작업과 태스크의 차이

왕국 로직은 두 개의 에셋 라이브러리로 나뉩니다:

| 개념 | 클래스 | 라이브러리 | 역할 |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | 왕국이 순차적으로 평가하는 태스크 이름 목록 |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | 하나 이상의 행동을 포함하는 구체적 전략 목표 |
| **Kingdom behaviour** | `BehaviourActionKingdom` | 태스크에 추가됨 | 매 틱마다 평가되는 단일 행동 단계 |

바닐라 문명은 `"civ"`라는 왕국 작업을 사용합니다(`AssetManager.job_kingdom.get("civ")`). 왕국이 턴을 갱신할 때 해당 작업 안의 태스크들을 순서대로 평가합니다.

## 왕국 행동 작성하기

왕국 행동은 `BehaviourActionKingdom`을 상속받고 `execute(Kingdom pKingdom)`을 재정의합니다:

```csharp
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloKingdomTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.hasEnemies()) return BehResult.Stop;

            if (pKingdom.data.gold > 500)
            {
                pKingdom.data.gold -= 50;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }
}
```

### 결과 반환 코드

| 결과 | 왕국 AI 동작 |
| --- | --- |
| `BehResult.Continue` | 이 태스크의 다음 행동으로 실행을 넘김 |
| `BehResult.Stop` | 현재 틱에서 이 태스크 실행을 중단함 |
| `BehResult.RepeatStep` | 다음 틱에 이 행동을 다시 평가함 |
| `BehResult.Skip` | 다음 행동을 건너뛰고 계속 진행함 |

## 코드

이 파일은 왕국 태스크를 생성하고 이를 바닐라 `"civ"` 작업에 주입합니다:

```csharp Mods/HelloBox/Code/HelloKingdomAI.cs
using System;
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloCheckTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.capital == null || pKingdom.king == null) return BehResult.Stop;

            // Example directive: if the kingdom has plenty of gold, donate to treasury
            if (pKingdom.data.gold > 300)
            {
                pKingdom.data.gold += 10;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }

    public static class HelloKingdomAI
    {
        public const string TASK_ID = "hello_kingdom_tribute";

        public static void Initialize()
        {
            if (AssetManager.tasks_kingdom.has(TASK_ID)) return;

            // 1. Define the task
            BehaviourTaskKingdom task = new BehaviourTaskKingdom
            {
                id = TASK_ID
            };

            // 2. Add steps
            task.addBeh(new BehHelloCheckTribute());

            AssetManager.tasks_kingdom.add(task);

            // 3. Inject into the civ kingdom job
            KingdomJob civJob = AssetManager.job_kingdom.get("civ");
            if (civJob != null && !civJob.tasks.Contains(TASK_ID))
            {
                civJob.tasks.Add(TASK_ID);
            }
        }
    }
}
```

## 전용 왕국 작업 생성하기

`AssetManager.kingdoms`를 통해 독자적인 세력이나 몬스터 팩션을 만들 경우, `"civ"`를 수정하지 않고 고유한 작업을 부여할 수 있습니다:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

그 후 **[왕국](#/nml/kingdoms)** 의 `KingdomAsset`에서 `job_id = "hello_faction_job"`을 지정합니다 :PESgn_Noice:.

## 주의해야 할 함정

- **항상 `isRekt()`를 확인하세요**: 시뮬레이션 중 왕국은 언제든 멸망하거나 병합될 수 있습니다. `pKingdom != null && !pKingdom.isRekt()` 확인 없이 데이터에 접근하지 마세요.
- **수도와 국왕 존재 여부 확인**: 많은 왕국 연산은 `capital`과 `king`이 유효하다고 가정합니다. 파괴되었을 경우 바로 `NullReferenceException`이 발생합니다.
- **틱 연산을 가볍게 유지하세요**: 개별 유닛은 국소적으로 동작하지만 왕국 로직은 대륙 전체를 다룹니다. 행동 내부에서 세계의 모든 유닛을 순회하는 무거운 중첩 루프는 심각한 프레임 드랍을 일으킵니다 :aPES2_Sweat:.
