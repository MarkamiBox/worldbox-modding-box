---
title: 王国 AI
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbdiplomacyhandshake:
order: 180
---

# 王国 AI :wbdiplomacyhandshake:

生物 AI 运行在单个单位身上：寻找食物、走向树木或与敌人战斗。而王国 AI 则运行在文明本身之上。王国正是通过它来决定何时宣战、扩张边境、建立殖民地、结成联盟或派遣军队出征。

和单位 AI 一样，王国 AI 由职务（job）和任务（task）构成。但每个步骤接收的参数不再是 `Actor`，而是 `Kingdom`。

## 职务与任务的区分

王国逻辑分布在两个资源库中：

| 概念 | 类名 | 资源库 | 职责 |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | 王国循环评估的一组任务名称集合 |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | 包含一个或多个行为的具体战略目标 |
| **Kingdom behaviour** | `BehaviourActionKingdom` | 添加到任务中 | 每个时钟周期（tick）评估的单步行为 |

原版文明使用名为 `"civ"` 的王国职务（`AssetManager.job_kingdom.get("civ")`）。当王国轮到行动回合时，它会依次评估其职务列表中的任务。

## 编写王国行为

王国行为继承自 `BehaviourActionKingdom` 并重写 `execute(Kingdom pKingdom)`：

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

### 行为返回值

| 返回值 | 王国 AI 的执行逻辑 |
| --- | --- |
| `BehResult.Continue` | 继续执行本任务中的下一个行为 |
| `BehResult.Stop` | 在当前时钟周期停止本任务 |
| `BehResult.RepeatStep` | 在下一个时钟周期再次评估该行为 |
| `BehResult.Skip` | 跳过下一个行为并继续前进 |

## 代码实现

该文件定义了一个王国任务并将其注入到原版 `"civ"` 王国职务中：

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

## 创建专属的王国职务

如果你通过 `AssetManager.kingdoms` 创建了全新的怪物阵营或独立文明，可以为其分配专属职务，无需修改 `"civ"`：

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

然后在 **[王国](#/nml/kingdoms)** 中为你的 `KingdomAsset` 设置 `job_id = "hello_faction_job"` 即可 :PESgn_Noice:。

## 需要规避的隐患

- **务必校验 `isRekt()`**：王国可能随时被灭国或吞并。在访问任何数据前，务必检查 `pKingdom != null && !pKingdom.isRekt()`。
- **校验首都和国王**：许多王国操作默认 `capital` 和 `king` 存在。一旦它们死亡或被毁，直接调用会触发 `NullReferenceException`。
- **保持时钟周期轻量**：单个生物的计算是局部的，但王国逻辑覆盖整个版图。在王国行为中对全世界所有单位进行繁重嵌套循环会导致严重的掉帧 :aPES2_Sweat:。
