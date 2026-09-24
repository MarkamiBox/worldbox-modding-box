---
title: 阅读游戏源码 (dnSpy)
group: 概览
subgroup: 外部工具与环境配置
icon: :wbnerd:
order: 7
---

# 阅读游戏源码 :wbnerd:

关于 WorldBox Mod 开发的所有答案其实早就写好了：它们全都在游戏自身的源码里 :wbbru:。**dnSpy**（或 **ILSpy**）能把游戏编译好的二进制文件逆向还原成清晰可读的 C# 代码，让你能够准确查明某个方法到底叫什么名字、接收什么参数，以及内部究竟执行了什么逻辑。

这是从“到处盲目抄代码片段”跨越到“真正自己写 Mod”最关键的一步 :3074-woah:。

## 打开游戏文件

1. 下载 [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases)（或者 [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases)，原理完全一样，界面按钮略有不同）。
2. 在工具中打开下面这个文件：

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

这个单独的文件就包含了整个游戏的全部代码。在左侧你会看到所有类的层级树：`Actor`、`AssetManager`、`GodPower`、`ScrollWindow` 等等，无一遗漏。

## 你日常最常用的四件事

### 1. 查阅类定义

`Ctrl+Shift+K` 用来搜索类型。输入 `ActorTrait` 并打开，你就能看到所有可以设置的字段，连同它们的类型和默认值：

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

这份列表*就是* **[自定义特质](#/nml/custom-traits)** 页面的文档。也要看**类型**：`rate_birth` 是 `int`，所以 `rate_birth = 0.5f` 编译不过。同样的办法也适用于 `ItemAsset`、`BuildingAsset`、`StatusAsset`，任何东西都行。

### 2. 确认方法的真实签名

靠玄学去猜方法名字，是你白白耗费一个小时解决编译报错的罪魁祸首。不如直接查源码。在 `Actor` 类中搜索 `addTrait` 会得到：

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

现在你清清楚楚地知道它接收一个字符串，返回一个布尔值，而且还有一个可选的第二参数。

### 3. 看看游戏原版是怎么写的

这是最实用的大招。想添加一个能正常生效的世界法则？找到 `WorldLawLibrary`，打开 `init()` 方法，直接阅读游戏官方的代码：

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

照搬这个格式，修改其中的 id 和图标路径，你的新法则就能直接起作用。游戏里的每一个 `*Library.init()` 都是对应资产类型的绝佳免费教程。

### 4. 查找所有现成的 ID

ID 全都是字符串，一旦拼错一个字符，游戏只会静默失败而没有任何明显报错。在各类 `init()` 方法里你可以找到所有的有效 ID：`TileLibrary.init()` 包含了所有地块地形 ID，`ItemLibrary.init()` 包含了所有武器 ID，`ActorAssetLibrary.init()` 包含了所有生物单位 ID。

## public、internal 与你

在浏览代码时，你会注意到方法名前面有三个常见的访问修饰符：

| 修饰符 | 对你意味着什么 |
| --- | --- |
| `public` | 你可以随时随地直接调用。 |
| `internal` | 只有在使用 **publicized**（公开化处理）过的 `Assembly-CSharp.dll` 进行编译时才能调用 |
| `private` | 你无法直接调用。可以寻找调用了它的 public 方法，或者通过打补丁来处理（参见 **[Harmony 补丁](#/nml/harmony-patches)**） |

所谓“公开化（publicized）”的 DLL，是指将内部所有成员都强制修改为 public 的副本。大多数成熟的 WorldBox Mod 开发者都在使用它，这也是为什么类似 `actor.getHit(...)` 的代码在他们工程里能顺利编译，而在你那里却疯狂报错的原因。如果某段代码死活无法编译，而 dnSpy 里显示它是 `internal`，这就是全部的原因所在。

> [!TIP] 写代码时把它常驻后台
> 绝不是让你去“把整个游戏源码从头读到尾”，正常人不会那么干。把它开在代码编辑器旁边，用到哪个方法或字段就顺手查一下。花两秒钟查阅源码，远比对着让人摸不着头脑的编译报错死磕二十分钟舒服得多 :PES_ThumbsUp:。

当你只需要查一个方法的名字和它的签名时，本站提供的 **[方法检索工具](#/tools/methods)** 会更快：收录了游戏里的每一个方法，支持快捷搜索，而且早就把 `internal` 标注得清清楚楚。而当你需要深入了解这个方法内部到底*做了什么*时，再回过头来用 dnSpy - 毕竟这是任何索引工具都无法替代的。
