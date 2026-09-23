---
title: Custom AI & behaviours
group: Game Content
subgroup: Actors, Buildings & AI
icon: :wbgoldenbrain:
order: 144
---

# Custom AI & behaviours :wbgoldenbrain:

This is the deep end. Everything else in this guide adds *things* to the game. This adds **decisions**: what a creature does next, on its own, forever, in a world it shares with thousands of others.

## How the game thinks

Three layers, from big to small:

| Layer | What it is | Library |
| --- | --- | --- |
| **Job** (`ActorJob`) | What this creature is up to in general: "be a citizen", "be a soldier" | `AssetManager.job_actor` |
| **Task** (`BehaviourTaskActor`) | One concrete goal inside a job: "go eat", "build that" | `AssetManager.tasks_actor` |
| **Behaviour** (`BehaviourActionActor`) | One step of a task, run every tick, returning what to do next | added onto a task |
| **Decision** (`DecisionAsset`) | When to start a task: the options a creature weighs each time it is free | `AssetManager.decisions_library` |

A job holds tasks, a task holds behaviours, and the behaviours run in order until one of them says stop. Decisions sit beside the jobs: they are how a free creature picks its next task on its own, see **[Decisions](#decisions-let-the-creature-choose-your-task)** below.

## Writing a behaviour

A behaviour is a class with one method. It gets the actor, does one small thing, and returns a `BehResult`:

```csharp
namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            // decide something, write it onto the actor
            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;   // let the next behaviour in the task run
        }
    }
}
```

| Result | Meaning |
| --- | --- |
| `BehResult.Continue` | Move on to the next behaviour in this task |
| `BehResult.Stop` | Done for this tick |
| `BehResult.RepeatStep` | Run me again next tick |
| `BehResult.Skip` | Skip the next one |
| `BehResult.StepBack` | Go back one |
| `BehResult.RestartTask` | Start the task over |

## Wiring a task and a job

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

`PickTile` is the whole point of the exercise: it is the only part the game does not already do for you. Everything else in that file is plumbing.

> [!WARNING] `beh_tile_target` is internal
> The field the behaviour writes into is marked `internal` in the game assembly, so this compiles against a **publicized** `Assembly-CSharp.dll` (see the note in **[Status effects](#/nml/status-effects)**). Without one, the compiler refuses the line and you have to keep the target in your own field instead :PES5_Noted:.

Note the second behaviour: **reuse the vanilla nodes**. The game has behaviours for walking to a tile, adding a status, finding a building, attacking a target. Writing the decision and borrowing the execution is the difference between a weekend and a month.

## Making a creature actually use your job

You do not have to patch anything. Every actor's AI asks for its next job through a delegate, so you swap the delegate:

```csharp
// take over
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // drop whatever it was doing, ask again now

// give it back
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] The takeover has to be re-asserted
> Combat (and a few other systems) clear the current job when they end, and the creature asks for a new one. If your delegate is still installed, it gets yours back and the takeover sticks. If some other code replaced the delegate, it does not, so check it periodically rather than assuming it held :PES5_Noted:.

## Decisions: let the creature choose your task

Swapping the job delegate is a takeover. Most of the time you want something softer: your task as one more option the creature weighs against eating, sleeping and fighting. That is a **decision**, and it is how the game itself picks what a unit does next.

A decision says *when*. The task you already wrote says *how*. When the brain picks a decision, it starts the task with the same id, or the one in `task_id`.

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

| Field | What it does |
| --- | --- |
| `task_id` | The task to start. Empty means a task with the decision's own id |
| `priority` | The layer, `NeuroLayer.Layer_0_Minimal` to `Layer_4_Critical`. Most of the time only the highest layer that has a possible decision gets to compete |
| `weight` / `weight_calculate_custom` | How attractive it is against the others on its layer, fixed or computed per unit |
| `action_check_launch` | Your condition. `false` and it is not an option this time |
| `cooldown` | Seconds before the same unit may pick it again |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Cheap filters the game checks before your delegate |
| `unique` | Keeps it out of the lists every unit of a kind gets. For a mod decision, always |

> [!WARNING] Three fields the game fills at startup
> `DecisionsLibrary.linkAssets()` numbers every decision, copies `priority` into `priority_int_cached` and sets `has_weight_custom`, once, before your mod loads. Skip the three lines after `add()` and yours shares its cooldown with the first vanilla decision, sits on the lowest layer whatever `priority` says, and ignores its custom weight :wbfacepalm:.

> [!WARNING] Units that already exist have one spare slot
> Every unit keeps its decision cooldowns in an array sized when the unit is created, rounded up to a power of two. Vanilla has 127 decisions, so the array holds 128: room for exactly **one** more. A unit that existed before your mod loaded, and gets handed a second new decision (yours and another mod's), throws `IndexOutOfRangeException` when it thinks about it. New units are sized for the new count, which is why HelloBox gives its decision to its own creature, not to a trait vanilla units can carry.

A decision reaches a creature through whatever carries it. An actor asset takes it with `addDecision()`, as above, and the list is read the first time the creature thinks, so that one line is enough. **Traits are different**: they turn their ids into objects at startup, so on a trait you set the resolved array yourself:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## City jobs

Citizens get their work from the city, not from their own brain. The city counts what needs doing, opens job slots (builders, farmers, miners...), and hands them out. A **citizen job** is one of those slots, and the unit that takes it runs the actor job with the same id.

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

Three things, and each fixes something the game only did at startup, or only for its own jobs:

1. **`unit_job_default`** is the actor job a hired citizen runs. `post_init()` copies the id into it for every common job.
2. **`list_priority_normal`** is the list citizens are offered, built by `linkAssets()`. Jobs with a `priority` above 0 go in `list_priority_high` instead, and get handed out first.
3. **The slots.** `CityBehCheckCitizenTasks.execute()` opens them from a fixed list of vanilla jobs, so nothing ever opens one for yours. The Harmony postfix adds one after it. It runs every time the city recounts, right after the counts were cleared, so "if there are none, add one" means one keeper per city.

| Field | What it does |
| --- | --- |
| `priority` / `priority_no_food` | Above 0: offered before the normal jobs, or only while the city has no food |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Who may take it |
| `should_be_assigned` | Your condition, per unit |
| `common_job` | `false` keeps it out of the lists entirely, like the attacker job |
| `path_icon` | The icon in the city's job overview |

## The text

The task's name is what the unit window shows as "doing right now", and a decision borrows the name of the task it starts:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## The rules of not tanking the framerate

There can be thousands of units. Your behaviour runs on every one of them, every tick.

- **Do the thinking on your own clock, not in `execute`.** Run your expensive logic in `Update()` on a timer, store the answer, and let `execute` just read it.
- **Spread the load.** If you think for 40 creatures, think for 10 of them per pass over four passes, rather than all 40 at once.
- **Bail out early.** The first lines of `execute` should be the cheap checks that let you return.
- **Never allocate in the hot path.** New lists and new lambdas every tick, times a thousand units, is how you hand the garbage collector your framerate.

> [!TIP] Trait first, behaviour second
> Give the creatures you take over a visible trait (see **[Custom traits](#/nml/custom-traits)**), so the player can tell which units are yours, and so *you* can tell at a glance whether your own code is running on the right ones :pepeOK:.
