---
title: 每一帧
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbyawn:
order: 43
---

# 每一帧 :wbyawn:

你的主类是一个 Unity 组件。`BasicMod<T>` 继承自 `MonoBehaviour`，所以只要你在上面写一个 `Update()` 方法，Unity 就会每帧调用它一次。从启动后的第一秒开始直到游戏关闭，每秒六十次，不管当前有没有世界。

这里是放那些不是对某个事件做出反应的逻辑的地方：每个游戏内月份的检查、来自 Harmony 补丁的队列、按键检测。这也是模组开发里最容易把别人的游戏变成幻灯片的地方 :wbfacepalm:。

## 守卫

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: past startup. worldLoading: no world half cleared or half built
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| 检查 | 它把你挡在了什么之外 |
| --- | --- |
| `World.world != null` | 还不存在任何地图实例 |
| `Config.game_loaded` | 启动后的最初时刻，游戏还没开始其第一个世界 |
| `Config.worldLoading` | 加载画面。一个世界正在被清空、生成或加载，单位列表正在你脚下被清空和重新填充 |

`Config.worldLoading` 就是 `SmoothLoader.isLoading()`，和游戏自己的 `MapBox.Update()` 在模拟任何东西之前所做的检查完全一样。**[日志与调试](#/nml/logs-and-debugging)** 中的守卫覆盖了启动阶段；再加上这个加载检查，之后每一次世界加载你也都能躲开。

## 不必每一帧都跑

大多数事情不需要每秒检查六十次。挑一个时钟，跟着它跑。

| 时钟 | 它的作用 |
| --- | --- |
| `Time.deltaTime` | 自上一帧起经过的真实秒数。游戏暂停时依旧在走，不理会速度设置。游戏本身从不改动 `Time.timeScale` |
| `World.world.getCurWorldTime()` | 世界秒数，类型是 `double`。游戏暂停或打开某个窗口时会停下，速度越快走得越快。5 是一个月，60 是一年 |

对于任何发生在世界*内部*的事情，用世界时间。这里，每个带有 **[记住事情](#/nml/saving-data)** 中所述记仇特质的单位，每月都会忘记一次命中：

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // world seconds: one in-game month
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // a backwards clock resets the baseline without firing a tick
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

保留 **[Harmony 补丁](#/nml/harmony-patches)** 中的那次 `PatchAll` 调用：`ResetClock` 会在每一次生成或加载世界之后运行，即便新世界的时间戳相等或更晚也不例外。在那个世界里，第一次 tick 会等满一整个周期。仅凭一个“时钟倒退”检查无法侦测到每一次加载。

暂停、速度和打开的窗口都已经被处理好了，因为世界时钟本身就遵守它们。对于不在世界内部的东西，比如一个会闪烁的文字标签，用真实时间：

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] 自己检查暂停状态
> `Config.paused` 只代表暂停按钮，别无其他。打开某个窗口时模拟同样会停止；`World.world.isPaused()` 两者都覆盖，但它是 `internal` 的，需要 NML 用来编译你模组的公开化程序集。用世界时间可以让你不必纠结这个问题。

## 协程

协程是一种可以中途等待的方法。你的主类是一个 `MonoBehaviour`，因此可以启动一个：

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // checked after every wait: the unit had a whole second to die
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` 等待的是真实秒数，而由于游戏从不改动 `Time.timeScale`，它不会因暂停而停下，也不理会游戏速度。如果玩家在协程运行到一半时加载了另一个世界，协程依旧会继续跑。所以检查要放在*每一次* `yield` 之后，而不只是第一次之前 :PES2_F:。

## 按键

在 `Update()` 里用 `Input.GetKeyDown(KeyCode.F7)` 是可行的。但它在玩家于文本框中输入单位名字时也会触发，而且玩家无法更改这个按键。游戏自己的快捷键在文本框获得焦点时会跳过按键检测，所以 `HotkeyAsset` 天生就有这个能力。注册方法参见 **[自定义窗口](#/nml/custom-windows)**。`GetKeyDown` 只留给只有你自己会按的调试按键。

## 高负载工作

- **在计时器上遍历单位，绝不要每一帧都遍历。** 一万个单位乘以每秒六十帧，就是每秒六十万次检查，为的却是一个可能只有三个单位拥有的特质。
- **先做最便宜的检查。** 和 Harmony 补丁一样的规则：第一行就该是能让你 `return` 的那一行。
- **并行代码入队，`Update()` 出队消费。** 像 `Actor.updateStats` 这样并行方法上的 Postfix，绝不能触碰 Unity 或共享状态，参见 **[Harmony 补丁](#/nml/harmony-patches)**。它把单位放进队列，主线程再在这里取出：

```csharp
// pending is the ConcurrentQueue your patch fills
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // now Unity, Randy and your own lists are safe to touch
}
```

进入循环之后你能做什么，见 **[运行时的世界](#/nml/world-at-runtime)**。存档并重新加载之后还想让什么留下来，见 **[记住事情](#/nml/saving-data)** :PES_OkHand:。
