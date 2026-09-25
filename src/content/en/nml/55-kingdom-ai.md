---
title: Kingdom AI
group: Game Content
subgroup: World & Civilizations
icon: :wbdiplomacyhandshake:
order: 180
---

# Kingdom AI :wbdiplomacyhandshake:

Creature AI runs on individual actors: finding food, wandering to a tree, or fighting an enemy. Kingdom AI runs on the civilization itself. It is how kingdoms decide when to declare war, expand borders, build colonies, form alliances, or send armies on campaigns.

Like actor AI, kingdom AI is built on jobs and tasks. But instead of an `Actor`, every step receives a `Kingdom`.

## Jobs vs tasks

Kingdom logic is split across two asset libraries:

| Concept | Class | Library | Role |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | A named set of tasks a kingdom cycles through |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | A concrete strategic goal containing one or more behaviours |
| **Kingdom behaviour** | `BehaviourActionKingdom` | added to task | A single step evaluated each tick |

Vanilla civilizations use the `"civ"` kingdom job (`AssetManager.job_kingdom.get("civ")`). When a kingdom updates its turn, it evaluates the tasks in its job sequentially.

## Writing a kingdom behaviour

A kingdom behaviour inherits from `BehaviourActionKingdom` and overrides `execute(Kingdom pKingdom)`. It does its work and returns a `BehResult`:

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

            // custom strategic check: if prosperous, send gold or trigger diplomacy
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

### The result codes

| Result | What the kingdom AI does |
| --- | --- |
| `BehResult.Continue` | Passes execution to the next behaviour in this task |
| `BehResult.Stop` | Stops this task for the current tick |
| `BehResult.RepeatStep` | Re-evaluates this behaviour again on the next tick |
| `BehResult.Skip` | Skips the next behaviour and moves forward |

## The code

This file creates a kingdom task, adds a custom behaviour, and injects the task into the vanilla `"civ"` kingdom job so every civilization runs it:

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

## Creating a dedicated kingdom job

If you are creating an entirely new civilization type or monster faction via `AssetManager.kingdoms`, you can assign it its own custom job instead of modifying `"civ"`:

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Then assign `job_id = "hello_faction_job"` on your `KingdomAsset` in **[Kingdoms](#/nml/kingdoms)** :PESgn_Noice:.

## Pitfalls to avoid

- **Always verify `isRekt()`**: Kingdoms can fall or be annexed at any moment during world simulation. Never touch a kingdom's data without checking `pKingdom != null && !pKingdom.isRekt()`.
- **Check for a capital and king**: Many kingdom operations assume `pKingdom.capital != null` and `pKingdom.king != null`. If either is dead or destroyed, accessing them directly causes `NullReferenceException`.
- **Keep kingdom ticks lightweight**: While individual units tick frequently, kingdom evaluations run across whole empires. Heavy nested loops over all world units inside a kingdom behaviour will cause visible frame drops :aPES2_Sweat:.
