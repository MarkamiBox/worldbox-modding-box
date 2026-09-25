---
title: Harmony 补丁
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbhammer:
order: 42
---

# Harmony 补丁 :wbhammer:

其他页面介绍的所有内容都是在给 WorldBox **添加**新东西：特质（trait）、武器、建筑（building）。而 Harmony 则是为了实现模组开发的另一半目标：**改变游戏原有的行为**。

你无法直接修改游戏的源码。代码经过了编译，以 `Assembly-CSharp.dll` 的形式分发，而且下一次游戏更新就会彻底抹掉你的修改。Harmony 则是一个能在游戏运行期间，将你自己的代码动态挂载到已有方法上的核心库。

> [!NOTE] 以前从未写过代码？
> 请先阅读“什么是方法”和“便利贴的比喻”，然后先去**游戏内容**页面亲手做点东西再回来。Harmony 并不难，但它是最容易破坏*别人模组*的工具；当你对游戏本身的资源构建方式有了一定概念后，写出的补丁才会更加优雅安全 :PES_Wise:。

## 什么是方法

**方法 (Method)** 是游戏代码内部的一个具名行为。来看几个真实的方法：

| 方法 | 游戏何时调用它 |
| --- | --- |
| `Actor.updateStats()` | 每当需要重新计算单位的属性数值时 |
| `Actor.getHit(...)` | 每当单位受到伤害时 |
| `City.makeWarrior(...)` | 每当城镇将一名平民训练为战士时 |

游戏每秒会调用这些方法数千次。每一个方法都是你可以挂载代码的拦截点。

## 便利贴的比喻

把一个方法想象成游戏烹饪秘籍里的某一页。Harmony 不会重写整页，而是相当于给它贴上了两张便利贴：

```text
┌─────────────────────────────┐
│  你的 PREFIX                │  <- 在游戏原版代码之前运行
├─────────────────────────────┤
│  游戏原版代码               │  <- 保持原样不变
├─────────────────────────────┤
│  你的 POSTFIX               │  <- 在游戏原版代码之后运行
└─────────────────────────────┘
```

- **Prefix（前置补丁）** 能够在游戏原版逻辑运行前看到传入的参数。它可以篡改这些参数，甚至可以直接取消原版方法的执行。
- **Postfix（后置补丁）** 能够在游戏原版逻辑执行完毕后看到执行结果。它可以改动该返回值，或者仅仅作为触发器做出响应。

这就是 Harmony 95% 的核心理念。本页剩下的内容全是具体的实操细节。

## 启用 Harmony

只需在 `OnModLoad` 中写一行代码。它会自动扫描你模组内的所有补丁并逐一应用：

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" 是你的 GUID。Harmony 会用它来标记你的补丁，
            // 这样一旦发生冲突，日志里就能一清二楚地看出是谁的责任。
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` 的意思是“仅限我自己的程序集”。这绝不是可有可无的装饰：如果不传参数，`PatchAll()` 会去扫描调用它的整个上下文程序集，运气不好的时候就会把别人的模组卷进来 :PESgn_Yikes:。

## 你的首个补丁：逐行解析

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

这里发生了六件事：

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**：地址。“名为 `Actor` 的类里，名为 `updateStats` 的方法。”方括号里的这一行是一个*特性（attribute）*：是给电脑读的标签，而不是会运行的代码。
- **`public static class Patch_Actor_UpdateStats`**：一个容器。名字随你起，不影响任何东西，但未来的你会感谢现在的你用了 `Patch_<Class>_<Method>`。
- **`public static void Postfix(...)`**：这个名字**不能**随便起，除非你显式加了标签。若无标签，Harmony 会精确查找名为 `Prefix`、`Postfix` 或 `Finalizer` 的方法。写成 `postfix` 就什么都不会发生，连报错都没有 :PESgn_ButWhy:。解决办法是使用后文“自行命名补丁方法”中的特性标签。
- **`Actor __instance`**：**两个**下划线。这是游戏此刻正在处理的那个具体单位。没有它，你只知道*有*单位的属性被重算了，却不知道*是谁的*。
- **`if (!__instance.hasTrait(...)) return;`**：尽早退出。你的补丁会对世界上每一个单位永远运行下去。让常见情况只需一次判断加一个 `return`。
- **`stats["speed"] += 20f;`**：真正的修改。`updateStats` 一开始会清空并重建属性块，所以在 Postfix 里加的值是落在一张白纸上，而不会每个 tick 越叠越多。

> [!DANGER] `updateStats` 不在主线程上运行
> 游戏把它注册成了一个**并行**任务（`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`，而且 `Config.parallel_jobs_updater` 默认是 `true`），所以你的 Postfix 会在工作线程上、同时对很多单位运行。在里面**只碰这个单位自己的数值**。调用 Unity（`Time.time`、`transform`、`Destroy`、`Resources.Load`）、调用游戏的随机数工具 `Randy`，或者往你自己的共享列表里写东西，都是只会在别人电脑上出现的崩溃。
>
> 如果你需要做这些事，就把单位放进一个队列，然后在你自己的 `Update()` 里处理：
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## 神奇的特殊参数名

Harmony 会**按名称匹配**自动注入参数。下面是常用的特殊参数，注意下划线本身就是名字的一部分：

| 名称 | 你将获得什么 |
| --- | --- |
| `__instance` | 调用该方法的实例对象。`static` 静态方法无此对象，需省略 |
| `__result` | 该方法的返回值。声明为 `ref` 即可修改它。仅在 Postfix 中有效 |
| `___someField` | **三个**下划线：该对象的私有字段，名称必须与游戏源码完全一致 |
| `__state` | 允许你的 Prefix 将临时变量传递给自己对应的 Postfix |
| 任意原版参数名 | 调用方传入的实参，命名必须与游戏源码**一模一样** |

最后一行是大部分人最容易掉坑的地方，而且一掉再掉。如果游戏源码声明的是 `getHit(float pDamage, ...)`，你的参数名就必须叫 `pDamage`。不能叫 `damage`，也不能叫 `pDmg`。你可以只声明你关心的参数并跳过其余参数，但写出来的名字必须完全匹配（WorldBox 里的参数几乎全是以小写 `p` 开头）。

## 修改返回值

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref 代表“允许修改此变量”，写入的新值会直接作为该方法的返回值传递给调用方。
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

按比例微调，不要粗暴赋值。使用 `__result *= 1.5f`，即使其他模组也 patch 了同一个方法，大家也能相安无事。如果直接来一句 `__result = 12f`，就会彻底毁掉别人的补丁成果，并引发评论区的一场口水战。

## 修改游戏硬编码的数值

社区里一半的“有没有人能做个模组……”的需求，其实都只是想改一个数字。没有什么是不可能的，只是还没人做出来而已 :wbbru:。“城市扩张范围太大了”其实就是游戏原版 `City` 类里的这么一个方法：

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

返回常数的方法是整个游戏中最容易打补丁的地方。你不需要修改常数本身，只需在补丁中调整它的返回值：

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // 城市规模减半

        public static void Postfix(ref int __result)
        {
            // 999 是“无限区域范围”调试选项。不要破坏玩家开启的作弊功能
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

把 `SCALE` 连接到 **[模组配置](#/nml/mod-config)** 中的滑块，玩家就能在游戏里自行调节。

找到对应的方法才是真正的核心工作。在 **dnSpy** 中搜索你在游戏里看到的数值（13 个区域、2 把武器、5 年），或者规则的名词（"zone"、"limit"、"max"）。小方法里的常数用 Postfix 即可轻松搞定；藏在长方法中间的常数则需要使用 transpiler，这就超出本页的范畴了 :PES2_Shrug:。

## 拦截并阻止原方法执行

返回 `bool` 类型的 Prefix 补丁能够决定游戏的原版代码是否执行：

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = 完全跳过原版的 getHit 逻辑。单位将彻底免疫此次伤害。
        return false;
    }
}
```

请注意守卫代码的写法：只有目标分支返回 `false`，而**所有其他分支全部返回 `true`**。一旦漏写了那个 `return true`，你就会直接把全世界所有的伤害判定全部永久关掉。

> [!WARNING] `return false` 是核武器级别的手段
> 它跳过的绝不仅仅是*你自己*的逻辑，而是跳过了**所有人**的代码：包括游戏官方原版逻辑，以及其他所有模组在该方法上挂载的 Postfix。其他模组的 Postfix 依然会运行，并对一次根本未发生的调用做出反应。官方原版方法背后往往悄悄附带了五六件你根本没注意到的联动处理，直接将其拦截会无声无息地切断这一切。
>
> 在决定写下 `return false` 之前，请务必先想想 Postfix 是否就能解决问题。“事后把受到的伤害回血补上”，引发的灾难远比“这记伤害在物理法则上从未发生过”要少得多 :PES3_Balance:。

## 指定方法名称的两种写法

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public 公开方法
[HarmonyPatch(typeof(Actor), "updateStats")]             // 其他一切方法
```

使用 `nameof` 明显更好，因为拼写错误会在编译期直接报错，而不是作为一个永远静默失效的补丁埋下隐患。但 `nameof` 只能用于你当前代码能够看见的成员，而 WorldBox 里的大部分成员都是 `internal` 或 `private`。针对它们，普通字符串是唯一的途径，因此请务必通过 **[阅读游戏源码](#/toolbox/reading-the-game-code)** 仔细核对拼写。

## 自行命名补丁方法

`Prefix` 和 `Postfix` 这样的特殊方法名只是一种约定习惯，并非硬性规定。只要为方法打上特性标签，你可以随意给它命名：

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`、`[HarmonyPostfix]` 和 `[HarmonyFinalizer]` 均可使用。有了特性标签后，方法名完全由你自己决定，“拼错 `Postfix` 导致无事发生”的问题便不复存在。它还允许你在同一个类中为不同的目标同时放置 Prefix 和 Postfix，而不会发生命名冲突。目前市面上大约有一半的模组采用这种写法，它们正是那些从不因为一个小写的 `p` 而浪费整个晚上的模组。

## 当两个方法重名时（重载处理）

当存在同名重载方法时，类名加方法名就会产生歧义。Harmony 会直接拒绝猜测，导致你的模组在启动时因抛出 `AmbiguousMatchException` 异常而崩溃。例如 `Actor` 拥有两个 `addTrait` 方法：

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

此时必须完整列出目标方法所接收的**全部**参数类型，包括带有默认值的参数：

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

其他经常容易让人踩坑的真实重载包括：`TileZone.isGoodForNewCity()` 与 `isGoodForNewCity(Actor pActor)`，以及 `SaveManager.loadWorld()` 与 `loadWorld(string pPath, bool pLoadWorkshop = false)`（两者均为 `internal`，因而只能使用字符串指定方法名）。如果不确定，请在编写特性前先在对应类中搜索该方法名称。

## 需要前后配合的补丁（Prefix 与 Postfix 传参）

`__state` 是 Prefix 传递给同一次调用的 Postfix 的中转数据。用它可以记录游戏在执行前该变量的模样：

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* 说明掉血了 */ }
    }
}
```

## 属性与构造函数

并不是所有东西都是普通的独立方法。`Actor.is_moving` 是一个属性：它表面上看起来像一个字段，但每次读取时都会执行其内部的 `get` 代码块。你需要明确告诉 Harmony 你要针对哪一部分打补丁：

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

在此之后它就等同于普通补丁，`ref bool __result` 即为读取方所接收到的返回值。`MethodType.Setter` 则针对另一半。`MethodType.Constructor` 用于为类的构造函数打补丁，此时 `__instance` 就是正在构建的实例对象；如果该类拥有多个构造函数，只需在后面追加 `Type[]` 参数数组，就像处理普通重载一样。

## 私有字段与私有方法

你的补丁只需声明对应的特殊形参，就能直接读取 `__instance` 的私有字段：**三个**下划线，后接与游戏源码中完全一致的字段名。由于游戏原版的大多数私有字段本身就以单个 `_` 开头，因此访问单位的私有字段 `_hover_timer` 需要写成**四个**下划线：

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

如果需要修改其值，声明为 `ref` 即可。虽然读起来有点别扭，但这是完全标准且正确的做法。

在补丁外部，`HarmonyLib` 中的 `AccessTools` 和 `Traverse` 也能实现同样的目标：

```csharp
// 偶尔调用一次：Traverse 写法简短但较慢
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// 每帧高频调用：只构建一次访问器，之后其执行速度几乎与普通字段相同
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // 它是 ref 引用，因此这里会直接写入值

// 调用私有方法：反射需要传入每一个参数，包括默认参数
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

字符串指定的目标无法受到编译器的有效检查。如果游戏更新重命名了 `_hover_timer`，你只能在运行时才能发现。替代方案是使用**公开化（publicized）**的 `Assembly-CSharp.dll`，这样 `internal` 和 `private` 都会对你的代码可见，重命名便会重新变回编译期错误。

## 手动打补丁

`[HarmonyPatch]` 结合 `PatchAll` 是最简单直观的方法。另一种方式是手动查找目标方法并直接调用 `Patch`：

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // 存在两个 addTrait 重载，因此类型数组不可省略
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // 若返回 null 说明游戏更新重命名了它：仅丢失单项功能，而非导致整个 Mod 崩溃
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // 当单位已拥有该特质或互斥特质阻止其获得时，__result 为 false
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

它使用与 `PatchAll` 相同的 Harmony ID，参数命名的规则也完全一致。你所获得的是中间那个 `if` 判断带来的灵活性。在以下情况下尤为推荐：

- **目标可能不存在。** 比如你怀疑下个版本会被移动的方法，或者属于*其他 Mod* 的方法。当目标 Mod 未安装时，`AccessTools.TypeByName("TheirNamespace.TheirClass")` 会返回 `null`，此时直接跳过补丁即可。详见 **[与其他 Mod 协同工作](#/nml/other-mods)**。
- **补丁依赖玩家设置。** 只有当玩家在 **[模组配置](#/nml/mod-config)** 中开启对应功能时才打补丁。
- **你需要确认补丁是否生效。** 当 `PatchAll` 遇到缺失的目标时会抛出异常，导致其后续尚未处理的补丁全部中断。而在这里，缺失一个方法仅仅意味着输出一行日志。

## 多个 Mod 给同一个方法打补丁时

在每种补丁类别内部，Harmony 会按照优先级排序（**最高优先级最先执行**），默认优先级为 `Normal`。显式的 `[HarmonyBefore]` 和 `[HarmonyAfter]` 依赖标签可以调整该执行顺序：

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

常用的优先级常量包括 `First`、`High`、`Normal`、`Low` 和 `Last`。当顺序会改变最终计算结果时，它至关重要：

- 对结果进行**截断限制（clamp）**的 Postfix（如 `Mathf.Min(__result, 20)`）通常希望设置 `Priority.Last`，以便在更高优先级的 Postfix 之后执行限制。但这无法绝对保证在面对另一个 `Last` 补丁或显式排序依赖时一定处于最后。
- 执行某种**检查**并可能 `return false` 的 Prefix 通常希望使用 `Priority.First` 或 `High`，从而尽早做出决策。但请勿将其作为跳过其他 Prefix 的绝对保证：NML 附带的是 HarmonyX，[即使某个 Prefix 返回了 `false`，它也会继续执行所有 Prefix](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes)。

只有在确有必要时才调整优先级。如果每个 Mod 都强行要求 `First`，最终结果将变成没有任何人处于最前 :PES3_Balance:。

## Finalizer：捕获游戏抛出的异常

Finalizer 会在其他所有逻辑执行完毕后运行，**即使目标方法在执行期间抛出了异常**。它会接收到该异常，其返回的值将作为最终抛出的异常：

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // 记录日志后保留并继续抛出该异常
        return __exception;
    }
}
```

这可以在不掩盖问题的前提下记录失败日志。返回 `null` 则会吞掉异常，包括来自其他补丁的报错。只有对于你确实能够安全恢复的特定异常才可以这样做。一个执行到一半抛出异常的方法往往已经完成了部分操作，若强行吞掉异常，整个世界可能会停留在破碎的不完整状态中 :PESgn_Yikes:。

## Mod 最常打补丁的方法

在我所查阅过的各类模组中，以下方法被反复用到。方法签名均直接提取自游戏源码。

| 目标方法 | 开发须知 |
| --- | --- |
| `City.update(float pElapsed)` | 公开方法。每帧针对每个城市执行。请务必优先执行轻量检查 |
| `MapBox.Update()` | **私有方法**，需使用字符串 `"Update"`。每帧执行一次。在打补丁前请先阅读 **[更新循环](#/nml/update-loops)** |
| `Actor.updateStats()` | **内部方法（internal）**。在并行任务中执行，请参阅页面顶部的警告 |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **内部方法（internal）**。针对每个单位的每次受击调用 |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **私有方法**，使用字符串 `"die"` |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | 公开方法 |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | 公开静态方法，返回 `bool`。无 `__instance` 实例参数 |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **内部方法（internal）**，返回 `War` 实例 |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | 公开方法，返回 `War` 实例 |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | 公开方法。在存档读取期间也会执行，请检查 `pFromLoad` 标志 |
| `City.setLeader(Actor pActor, bool pNew)` | 公开方法 |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | 公开静态方法，返回诞生的婴儿单位 |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | 公开方法，返回新建的 `Actor`。所有单位生成都会经过此方法 |

`private` 和 `internal` 目标通过字符串名称均可顺利挂载补丁，你的参数依然按名称进行绑定。在未公开化程序集的情况下，你无法对它们使用 `nameof(...)`，也不能在补丁方法内部直接访问其 `internal` 成员。

> [!NOTE] `World` 是容器，`MapBox` 才是真正的目标
> 尽管 `World` 是静态类，`typeof(World)` 依然是合法的 C# 语法。但它是挂载 `Update` 或 `finishMakingWorld` 的错误目标：这些方法实际属于 `MapBox`（即 `World.world` 返回的类型）。指定错误的目标会在 Harmony 应用补丁时引发崩溃，而不是在 C# 编译 `typeof` 时报错。

## 补丁没有生效时排查

在怪 Harmony 之前，先读日志。问题很少出在 Harmony 身上 :PES5_Noted:。

| 遇到的现象 | 通常的原因 |
| --- | --- |
| 毫无反应，日志也没有任何动静 | 未使用 `[HarmonyPostfix]` 标签且 `Postfix` 单词拼错，或者根本忘了调用 `PatchAll` |
| 启动时弹出 `HarmonyException` / `MissingMethodException` | 该类名或方法名并不存在，去 dnSpy 里核实 |
| `AmbiguousMatchException` / `Ambiguous match found` | 存在多个同名重载方法，补充上面提到的 `Type[]` 参数 |
| 仅在他人电脑上出现的崩溃 | 对 `Actor.updateStats` 的 Postfix 从工作线程直接调用了 Unity、`Randy` 或共享列表 |
| 补丁内部抛出 `NullReferenceException` | `__instance` 或其内部字段为 null。补丁会在正常游戏流程之外的特殊状态下执行：加载中、濒死、对象销毁中 |
| 游戏掉帧到 3 FPS | 你 patch 了一个每秒执行数千次的密集方法，并在里面塞进了繁重的耗时运算 |
| 单独运行正常，搭配其他模组就崩 | 其中一方返回了 `false`，或者双方都直接强行赋值 `__result` 而非平滑微调 |

## 和谐共处的 Mod 开发准则

- **默认用 Postfix。** 只有需要修改参数或阻止方法运行时才用 Prefix。
- **调整，别赋值。** `+=`、`*=`、`Math.Min(...)`。别人也给这里打了补丁。
- **永远判空。** 你的补丁会在世界加载期间、在单位死亡的过程中运行。
- **先做便宜的判断。** 高频补丁的第一行应该是能让你直接 `return` 的判断。`City.update` 和 `MapBox.Update` 是 Mod 最常挂载的两个方法，二者每帧都在执行。在其中进行字典查找没问题，但遍历全地图单位就不行。
- **给能完成任务的最窄方法打补丁。** 为了一个特质的速度去补 `Actor.updateStats` 没问题。为同样的事去补整个世界更新，就是模组被卸载的开始。
- **把补丁放在同一个文件里。** 有人报告冲突时，你想读的是一个文件，而不是十二个。对未来的自己好一点。照我说的做，别学我那些老模组 :trollface:。

> [!NOTE] 给资源库的 `has`、`get`、`add`、`clone` 或 `post_init` 打补丁毫无意义
> 它只影响你的模组加载之后的调用，永远影响不到那之前已经完成的原版注册。见 **[底层资源库（Asset libraries）](#/nml/asset-libraries)**。

## Transpiler：直接修改底层指令

Transpiler 能够改写方法内部编译生成的 IL 中间语言指令。当改动位于方法执行流程中间，且 Prefix 和 Postfix 均无法表达时，就轮到它登场了。它仅在 Harmony 构建替换方法时执行一次，而不是在每个游戏 tick 重复运行；但在其他 Transpiler 注入时可能会重新触发。

这是放在补丁类内部的方法签名。此处特意原样返回所有指令：

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

若要执行实际的指令改写：

1. 在 dnSpy 中仔细检查目标的 IL 指令流。匹配特定的操作码（opcode）序列和具体的字段或方法操作数，而不是匹配“第 42 条指令”或某个数字的所有出现位置。
2. 在开始修改**之前**先收集所有匹配项。显式核对预期的匹配数量。如果你预期只有 1 处匹配，却找到了 0 处或 2 处，请记录不匹配日志并原样返回原始输入。切勿产出改写到一半的残缺代码。
3. 保持分支跳转标签、异常捕获块以及求值栈的类型平衡。在 C# 语法层面上看起来合理的替换，在底层 IL 中仍可能属于非法状态。
4. 务必同时测试匹配和未匹配分支，并针对同一方法上挂载的其他补丁进行联调测试。

[Harmony Transpiler 官方文档](https://harmony.pardeike.net/articles/patching-transpiler.html) 详细介绍了指令 API。游戏更新时，应当将其作为重新核对模式匹配逻辑的契机，而不是简单地把魔法索引偏移量加三 :PES5_BigBrain:。

NML 附带的是 **HarmonyX**（Harmony 的分支版本）。核心补丁 API 完全通用，但在某些行为上可能有所不同（包括 Prefix 的跳过机制）。如果接下来会有多个 Mod 触碰相同的功能，下一步请阅读：**[与其他 Mod 协同工作](#/nml/other-mods)**。
