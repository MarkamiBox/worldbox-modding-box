---
title: 自定义 AI 与行为树
group: 游戏内容
subgroup: 生物实体、建筑与 AI
icon: :wbgoldenbrain:
order: 144
---

# 自定义 AI 与行为树 :wbgoldenbrain:

这里是整套教程中最深奥的领域。本指南的其他页面都是在向游戏添加*物品与数据*，而本页添加的是**决策机制**：让一个生物完全自主、永久运行地决定下一步该做什么，并与世界上成千上万的其他生灵共同互动。

## 游戏是如何思考的

自上而下分为三个层级：

| 层级 | 概念定义 | 对应的资源库 |
| --- | --- | --- |
| **职业/身份** (`ActorJob`) | 该生物当下所承担的大体职责：“成为市民”、“担任士兵” | `AssetManager.job_actor` |
| **具体任务** (`BehaviourTaskActor`) | 职业内部包含的一个具体目标：“去吃东西”、“建造那个建筑” | `AssetManager.tasks_actor` |
| **动作行为** (`BehaviourActionActor`) | 任务中的单一具体执行步骤，每个 tick 运行，并决定后续流转 | 挂载在特定任务之下 |

一个职业包含若干任务，一个任务包含若干动作行为，动作按顺序逐一执行，直到其中某一个返回中止指令。

## 编写具体动作（Behaviour）

一个动作行为本质上是一个只包含一个核心方法的类。它接收当前生物作为参数，执行一步微小的逻辑，并返回一个 `BehResult` 状态：

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
`PickTile` 才是这整件事的重点：它是游戏唯一没有替你做掉的部分。那个文件里其余的全是接线。

> [!WARNING] `beh_tile_target` 是 internal
> behaviour 写入的那个字段在游戏程序集里标成了 `internal`，所以这段要对着 **publicized** 过的 `Assembly-CSharp.dll` 才编得过（见 **[状态效果](#/nml/status-effects)** 里的说明）。没有的话编译器会拒掉这一行，你得把目标存在自己的字段里 :PES5_Noted:。


| 执行状态码 | 具体含义 |
| --- | --- |
| `BehResult.Continue` | 继续执行该任务中的下一个动作 |
| `BehResult.Stop` | 在当前 tick 终止执行 |
| `BehResult.RepeatStep` | 在下一个 tick 再次执行自身 |
| `BehResult.Skip` | 跳过紧随其后的下一个动作 |
| `BehResult.StepBack` | 倒退回上一个动作 |
| `BehResult.RestartTask` | 从头重新执行该任务 |

## 组装任务（Task）与职业（Job）

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

注意观察第二个动作行为：**直接复用原版节点**。游戏本体已经内置了走向指定地块、添加状态、寻找建筑、攻击目标等成熟动作。自己编写核心决策，同时借用原版的执行节点，这就是把一个月的工作量压缩到一个周末的诀窍。

## 让生物真正执行你的职业逻辑

你完全不需要使用 Harmony 进行任何硬核 Patch。每个生物的 AI 都是通过委托（delegate）来请求下一个职业的，因此我们只需要直接替换该委托：

```csharp
// 接管控制权
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // 强制放弃当前正在做的事，立即重新请求新工作

// 归还控制权
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] 接管状态需要定期重新确认
> 战斗（以及少数其他内置系统）在结束时会清空当前职业，促使生物请求新工作。如果你的委托依然挂载着，它就会重新拿到你的职业。但如果有其他代码重置了委托，接管就会失效。因此请设置周期性检测，切勿盲目假设接管永远有效 :PES5_Noted:。

## 决策：让生物自主选择执行你的任务

直接替换工作委托（Job Delegate）属于强行接管控制权。大部分情况下，我们更希望采用温和的方式：将你的任务作为生物大脑在进食、睡眠和战斗之外权衡考量的另一个可选方案。这便是**决策（Decision）**，也是游戏原生 AI 挑选下一步行动的核心逻辑。

决策负责判定*何时触发*，而此前编写的 AI 任务则负责实现*具体如何执行*。当生物大脑抽中某项决策时，便会自动启动同名（或 `task_id` 指定）的 AI 任务。

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

| 字段 | 作用说明 |
| --- | --- |
| `task_id` | 触发时启动的任务 ID。留空默认启动与决策同名的任务 |
| `priority` | 优先级神经层（`NeuroLayer.Layer_0_Minimal` 至 `Layer_4_Critical`）。通常只有包含可用决策的最高神经层参与竞争 |
| `weight` / `weight_calculate_custom` | 在同一神经层内的相对权重分数，支持固定数值或按生物个体动态计算 |
| `action_check_launch` | 自定义前置条件判定。返回 `false` 则当前判定周期内不可选 |
| `cooldown` | 同一生物再次选择该决策所需的冷却 CD（秒） |
| `only_adult`、`only_safe`、`only_hungry`、`only_sapient`... | 在调用你的委托前先执行的原生快速过滤标志位 |
| `unique` | 防止自动注入所有通用生物列表。模组自制决策务必设为 `true` |

> [!WARNING] 启动期由游戏自动填充的三个关键字段
> `DecisionsLibrary.linkAssets()` 在游戏启动时为所有决策分配序号、将 `priority` 缓存至 `priority_int_cached` 并设置 `has_weight_custom` 标志。若在 `add()` 后漏掉了这三行同步代码，你的决策将与原版第一个决策共享冷却 CD、无论如何配置都会沦为最低优先级层，并彻底忽略自定义权重计算 :wbfacepalm:。

> [!WARNING] 已存在的存档生物仅预留了 1 个空位槽
> 每个生物在生成时都会初始化一个用于记录决策冷却 CD 的数组，大小按 2 的幂向上取整。原版共有 127 个决策，因此初始数组长度为 128：刚好仅剩 **1** 个空余槽位。若在模组加载前就已存在的生物被赋予了 2 个以上的新决策，其在思考时将抛出 `IndexOutOfRangeException`。模组加载后新生成的生物会按新总数正确扩容，因此 HelloBox 选择将决策直接绑定给自制生物，而非赋予原版生物特质。

决策需要通过赋予宿主传递给具体生物。`ActorAsset` 可以直接通过 `addDecision()` 注册。**特质系统则有所不同**：特质在启动期完成 ID 解析，因此在特质上挂载决策需要手动对解析后的数组赋值：

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## 城镇岗位分工

城镇居民的工作岗位由城镇统筹指派，而非由个体大脑自行决定。城镇会实时统计各项事务需求，开放对应的用工配额（建筑工、农夫、矿工等）并向居民分发。**市民岗位（Citizen Job）**就是其中的一个职业槽位，受聘的居民将执行同名的 `ActorJob`。

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

三项针对启动期生命周期缺失的关键补充：

1. **`unit_job_default`** 是受聘居民实际执行的 `ActorJob`。`post_init()` 会自动将同名 ID 同步到该字段。
2. **`list_priority_normal`** 是城镇向普通市民开放的招聘列表（由 `linkAssets()` 构建）。`priority` 大于 0 的岗位会进入 `list_priority_high` 优先招募。
3. **用工配额分发。** `CityBehCheckCitizenTasks.execute()` 内部仅从写死的原版列表中开启用工名额。通过 Harmony 的 Postfix 补丁可在城镇每次清点岗位后为你的自制岗位追加招工配额。

| 字段 | 作用说明 |
| --- | --- |
| `priority` / `priority_no_food` | 大于 0 时优先于常规岗位招募，或仅在城镇缺粮时开放 |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | 允许入职的身份门槛 |
| `should_be_assigned` | 按生物个体判定的专属准入条件 |
| `common_job` | 设为 `false` 可完全将其移出公开招募池（例如突击队员） |
| `path_icon` | 在城镇岗位概览面板中显示的图标路径 |

## 本地化文本

AI 任务的名称会在生物面板的“当前行为”中直观展示，而决策会自动借用其触发的任务名称：

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## 保证游戏不卡死掉帧的性能铁律

世界上可能存在成千上万个生物单位。你的动作代码在每一个 tick 都会在每一个单位身上执行一遍。

- **在自己的时钟节拍里思考，绝不要在 `execute` 里做重型计算。** 在 `Update()` 中通过定时器执行昂贵逻辑，缓存计算结果，而让 `execute` 仅仅读取现成的答案。
- **平摊计算负载。** 如果你要为 40 只生物做决策，分四帧每帧处理 10 只，而不是在同一帧里一口气算完 40 只。
- **尽早返回（Early Return）。** `execute` 的前几行代码必须是轻量廉价的条件判断，一旦不满足立即返回。
- **绝不要在热循环（Hot Path）中分配堆内存。** 在每个 tick、数千只生物身上不断 `new List` 或创建新的 lambda 表达式，你的帧率会被垃圾回收器（GC）瞬间摧毁。

> [!TIP] 先给特质，再绑行为
> 为你接管的生物赋予一个可见的特质（参见 **[自定义特质](#/nml/custom-traits)**），这样玩家能辨认出哪些单位被接管了，而*你自己*也能一眼看出代码是否正确作用在目标单位身上 :pepeOK:。
