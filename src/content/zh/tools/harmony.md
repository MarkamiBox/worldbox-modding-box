---
title: Harmony 补丁生成器
group: Modding Tools
icon: :wbstrongright:
order: 420
---

# Harmony 补丁生成器 :wbstrongright:

选一个真实的游戏方法，就能拿到带有正确类名、方法名和参数名的补丁骨架，从此不会再因为 `__instance` 的一个笔误浪费一整晚。

> [!NOTE] 给资源库的 `has`、`get`、`add`、`clone` 或 `post_init` 打补丁毫无意义
> 它只影响你的模组加载之后的调用，永远影响不到那之前已经完成的原版注册。见 **[底层资源库（Asset libraries）](#/nml/asset-libraries)**。

::tool:harmony::
