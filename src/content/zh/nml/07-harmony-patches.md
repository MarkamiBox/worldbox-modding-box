---
title: Harmony 补丁
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbhammer:
order: 42
---

# Harmony 补丁 :wbhammer:

其他页面介绍的所有内容都是在给 WorldBox **添加**新东西：特质、武器、建筑。而 Harmony 则是为了实现模组开发的另一半目标：**改变游戏原有的行为**。

你无法直接修改游戏的源码。代码经过了编译，以 `Assembly-CSharp.dll` 的形式分发，而且下一次游戏更新就会彻底抹掉你的修改。Harmony 则是一个能在游戏运行期间，将你自己的代码动态挂载到已有方法上的核心库。

> [!NOTE] 以前从未写过代码？
> 请先阅读“什么是方法”和“便利贴原理”，然后先去**游戏内容**页面亲手做点东西再回来。Harmony 并不难，但它是最容易破坏*别人模组*的工具；当你对游戏本身的资源构建方式有了一定概念后，写出的补丁才会更加优雅安全 :PES_Wise:。

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
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

这里一共发生了六件事：

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**：目标地址。“位于 `Actor` 类中名为 `updateStats` 的方法”。方括号里的这行是*特性 (Attribute)*：给计算机阅读的元数据标签，而不是立即执行的代码。
- **`public static class Patch_Actor_UpdateStats`**：包装容器。类名完全由你决定，不影响任何功能，但未来的你一定会感谢现在采用 `Patch_<类名>_<方法名>` 规范的自己。
- **`public static void Postfix(...)`**：这个方法名可**不能**乱起。Harmony 专门寻找完全拼作 `Prefix`、`Postfix` 或 `Finalizer` 的方法。如果你写成了小写的 `postfix`，它将完全不生效，且不会产生任何报错提示 :PESgn_ButWhy:。
- **`Actor __instance`**：**两个**下划线。代表游戏此刻正在操作的那个具体的生物对象。没有它，你只知道*某个*生物被更新了属性，却不知道是*哪一个*。
- **`if (!__instance.hasTrait(...)) return;`**：提前退出。你的补丁会针对全世界每一个生物永远运行下去。务必确保最普通的情况只要经过一次判断就立即 `return`。
- **`stats["speed"] += 20f;`**：真正的修改操作。`updateStats` 一上来就会清空并重新构建属性字典，因此在 Postfix 中进行累加是在一张白纸上进行，不会在每一帧无限叠加。

## 神奇的特殊参数名

Harmony 会**按名称匹配**自动注入参数。下面是常用的特殊参数，注意下划线本身就是名字的一部分：

| 名称 | 你将获得什么 |
| --- | --- |
| `__instance` | 调用该方法的实例对象。`static` 静态方法无此对象，需省略 |
| `__result` | 该方法的返回值。声明为 `ref` 即可修改它。仅在 Postfix 中有效 |
| `___someField` | **三个**下划线：该对象的私有字段，名称必须与游戏源码完全一致 |
| `__state` | 允许你的 Prefix 将临时变量传递给自己对应的 Postfix |
| 任意原版参数名 | 调用方传入的实参，命名必须与游戏源码**一模一样** |

最后一行是大部分人最容易掉坑的地方。如果游戏源码声明的是 `getHit(float pDamage, ...)`，你的参数名就必须叫 `pDamage`。不能叫 `damage`，也不能叫 `pDmg`。你可以只声明你关心的参数并跳过其余参数，但写出来的名字必须完全匹配（WorldBox 里的参数几乎全是以小写 `p` 开头）。

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

社区里一半的“有没有人能做个模组……”的需求，其实都只是想改一个数字。“城市扩张范围太大了”其实就是游戏原版 `City` 类里的这么一个方法：

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
> 它跳过的绝不仅仅是*你自己*的逻辑，而是跳过了**所有人**的代码：包括游戏官方原版逻辑，以及其他所有模组在该方法上挂载的 Prefix 和 Postfix。官方原版方法背后往往悄悄附带了五六件你根本没注意到的联动处理，直接将其拦截会无声无息地切断这一切。
>
> 在决定写下 `return false` 之前，请务必先想想 Postfix 是否就能解决问题。“事后把受到的伤害回血补上”，引发的灾难远比“这记伤害在物理法则上从未发生过”要少得多 :PES3_Balance:。

## 指定方法名称的两种写法

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public 公开方法
[HarmonyPatch(typeof(Actor), "updateStats")]             // 其他一切方法
```

使用 `nameof` 明显更好，因为拼写错误会在编译期直接报错，而不是作为一个永远静默失效的补丁埋下隐患。但 `nameof` 只能用于你当前代码能够看见的成员，而 WorldBox 里的大部分成员都是 `internal` 或 `private`。针对它们，普通字符串是唯一的途径，因此请务必通过 **[阅读游戏源码](#/toolbox/reading-the-game-code)** 仔细核对拼写。

## 当两个方法重名时（重载处理）

当两个方法重名（发生重载）时，类名加方法名就会产生歧义，Harmony 会直接报错并拒绝猜测。此时必须显式指定参数类型：

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

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

## 补丁没有生效时排查

| 遇到的现象 | 通常的原因 |
| --- | --- |
| 毫无反应，日志也没有任何动静 | `Postfix` 单词拼错，或者根本忘了调用 `PatchAll` |
| 启动时弹出 `HarmonyException` / `MissingMethodException` | 该类名或方法名并不存在，去 dnSpy 里核实 |
| 报错 `Ambiguous match found` | 存在多个同名重载方法，补充上面提到的 `Type[]` 参数 |
| 补丁内部抛出 `NullReferenceException` | `__instance` 或其内部字段为 null。补丁会在正常游戏流程之外的特殊状态下执行：加载中、濒死、对象销毁中 |
| 游戏掉帧到 3 FPS | 你 patch 了一个每秒执行数千次的密集方法，并在里面塞进了繁重的耗时运算 |
| 单独运行正常，搭配其他模组就崩 | 其中一方返回了 `false`，或者双方都直接强行赋值 `__result` 而非平滑微调 |

## 和谐共处的 Mod 开发准则

- **默认优先使用 Postfix。** 只有在需要修改输入参数或完全阻断原版逻辑时，才考虑使用 Prefix。
- **平滑微调，绝不强行覆盖。** 多用 `+=`、`*=`、`Math.Min(...)`。很可能有其他模组也在 patch 这个地方。
- **随时进行判空防御。** 你的补丁在世界加载期间以及生物濒死结算时同样会执行。
- **轻量检查放在最前。** 高频热点补丁的第一行代码，必须是能让你立刻 `return` 的快速过滤条件。
- **尽可能选择影响面最狭窄的方法来 patch。** 为了特质加移速而 patch `Actor.updateStats` 非常合适；但为了同样的目的去 patch 整个世界的全局主循环，玩家就会立刻把你的模组扔进回收站。
- **把所有补丁收拢在一个文件里。** 当有人反馈兼容冲突时，你只想查阅一个文件，而不是十二个文件。

## 本文暂不涵盖的内容

**IL 转译器 (Transpilers)** 会逐条重写方法编译后的底层 IL 汇编指令。它们威力无穷，是修改深埋在封闭方法核心内部的某个魔法数字的唯一途径，但游戏几乎每一次版本更新都会导致它们损坏。如果你有一天真到了必须依赖它的水平，那你也早已不需要本指南了 :PES5_BigBrain:。
