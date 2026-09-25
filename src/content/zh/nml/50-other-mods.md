---
title: 其他模组
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbmodders:
order: 45
---

# 其他模组 :wbmodders:

你的模组并不是活在一个空荡荡的世界里。玩家可能会把 HelloBox 和另外二十个模组一起装上，其中一半也在尝试改动战斗系统、调整世界法则，或添加新特质。

有时候你需要和它们打交道：如果检测到某个搭档模组已安装就启用额外功能，在对方缺失时安全地打补丁而不至于崩溃，或者确保你的资源按正确顺序注册。

与其他模组沟通有两种方式：编译期通过 `mod.json`，或运行期通过代码。

## 在 mod.json 中声明依赖

最干净的整合方式是在 `mod.json` 中声明关系：

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| 字段 | 含义 |
| --- | --- |
| `Dependencies` | 硬性依赖。NML 保证这些模组会在你的模组**之前**加载。只要其中任何一个缺失或编译失败，NML 就会直接拒绝加载你的模组 |
| `OptionalDependencies` | 软性依赖。如果对方模组已安装，NML 会先加载它，**并且**为你定义一个编译符号。如果缺失，你的模组依旧正常加载 |
| `IncompatibleWith` | 黑名单。只要列表中的任意模组存在，NML 就会标记冲突，阻止两者一起运行 |

### 编译期的 #if 符号

当 `OptionalDependencies` 中列出的模组已安装并参与编译时，NML 会为你定义一个预处理器常量。

这个符号就是对方模组的 GUID 转成大写，并把所有非字母数字字符替换为下划线：

| `mod.json` 中的 GUID | 对应定义的编译符号 |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

把整合代码包在 `#if` 里：

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compiled only when that mod is present and active
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Safe to reference their types directly here
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] 拼错符号会悄无声息地失败
> 如果你写成 `#if COM_FRIEND_COOL_MOD` 而不是 `#if COM_FRIEND_COOLMOD`，编译器会把它当成一个未定义符号，悄悄把你这段代码整块剔除。它永远不会运行，日志里也不会有任何错误或警告 :PES4_1IQ:。务必仔细核对 GUID 的转换结果。

## 在运行期检查

`#if` 这一招只在 NML 从源码编译你的模组、并且对方模组已在 `OptionalDependencies` 中声明时才有效。

如果你发布的是预编译好的 `.dll`，或者想在不重新编译的情况下动态检测其他模组，就得在运行期检查。

### 检查已加载的程序集

你可以检查对方模组的程序集是否已加载进当前 AppDomain：

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

或者问 Harmony 的 `AccessTools`，看看对方的某个类是否存在：

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

如果 `AccessTools.TypeByName` 返回一个非空的 `Type`，说明对方的代码已经加载就绪。

## 给另一个模组打 Harmony 补丁

给原版方法打补丁很直接。给另一个模组里的方法打补丁则有一个巨大的陷阱 :wbfacepalm:。

如果你像下面这样写一个直接引用对方类型的普通补丁类：

```csharp
// NEVER do this for an optional mod!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Mono 运行时会在你的补丁类一加载时就尝试解析 `PartnerMod.SomeClass`。如果玩家没装那个模组，你的整个模组会在 `Initialize()` 还没跑完之前，就因为 `TypeLoadException` 或 `FileNotFoundException` 直接崩溃！

正确做法是用 `AccessTools` **手动**打补丁：

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // The other mod is not installed. Skip peacefully.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Runs after their method, only if their mod is installed
        }
    }
}
```

手动打补丁让类型引用停留在字符串层面，这样运行时就永远不会试图加载一个缺失的程序集。

## 加载顺序的陷阱

当你克隆或引用另一个模组的内容时，时机就是一切。

```csharp
// If their mod hasn't run Initialize() yet, this throws NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML 按依赖顺序加载模组。如果你把对方模组写进了 `Dependencies` 或 `OptionalDependencies`，NML 就会保证对方的 `Initialize()` 在你的**之前**运行。

如果你*没有*把它们声明为依赖，模组之间的加载顺序就是不确定的。请始终：
1. 把对方模组声明在 `OptionalDependencies` 中。
2. 在克隆或读取对方资源之前，用 `AssetManager.traits.has(...)` 做好判空守卫。

## 无冲突地共享数据

WorldBox 提供了灵活的字典，让你在生物身上（`actor.data`）和世界上（`World.world.map_stats.custom_data`）存放自定义数据。

每个模组共享的都是同一份字典。如果你这样写：

```csharp
// Bad: someone else might use "level" too
actor.data.set("level", 5);
```

另一个模组完全可能在同一帧往 `"level"` 里写入完全不同含义的数据。

请始终给自定义数据键加上你的模组前缀作为命名空间：

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

接下来：**[发布你的模组](#/nml/publishing)**，或是去 **[游戏选项与时间倍速](#/nml/game-options)** 管理模拟速度与选项。
