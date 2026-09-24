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

- **左侧列**: 数据类型（`int`、`float`、`string`）。
- **`= 默认值`**: 游戏内置默认值。如果默认值就合适，就别去设置它。代码越少，笔误越少。
- **"inherited from"**: 继承自父类。

> [!WARNING] 字段并不代表全部逻辑
> 更多逻辑细节请参阅 **[阅读游戏源代码](#/toolbox/reading-the-game-code)**。
