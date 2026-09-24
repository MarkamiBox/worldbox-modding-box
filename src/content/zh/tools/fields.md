---
title: Asset 字段浏览器
group: Mod 开发工具
icon: :wbwise:
order: 430
---

# Asset 字段浏览器 :wbwise:

每个 Asset 都拥有固定的一组字段。这是直接从反编译源码中提取的真实字段清单。

选择资源类型，过滤并点击复制字段名。

::tool:fields::

## 如何阅读

- **左列**是类型。`int` 表示整数，所以 `rate_birth = 0.5f` 编译不过。`float` 接受小数，并且需要 `f` 后缀，比如 `0.5f`。`string` 接受引号里的文本。
- **`= value`** 是游戏已经给这个字段的默认值。如果默认值就是你想要的，就别设置它。代码越少，笔误越少。
- **"inherited from"** 表示这个字段来自父类。它的作用完全一样，只是在更上层声明的。`id`、`base_stats` 和 `path_icon` 通常是继承来的。
- **表格上方的继承链**（例如 `ActorTrait -> BaseTrait -> BaseAugmentationAsset -> Asset`）说明字段从哪里来，最具体的在前。

> [!WARNING] 字段并不是全部
> 这个工具告诉你某个字段**存在**以及它的类型。它不会告诉你在你的情况下游戏是否真的会读取它：有些字段只对文明单位有效，或者只在另一个开关打开时才有效。拿不准的时候，找一个做到你想要效果的原版资源，照抄它的值，见 **[阅读游戏代码](#/toolbox/reading-the-game-code)**。
