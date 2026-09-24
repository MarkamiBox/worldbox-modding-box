---
title: 坠落物与水滴
group: 游戏内容
subgroup: 物品与装备
icon: :wbloot:
order: 126
---

# 坠落物与水滴 :wbloot:

**坠落物**（drop）是从天而降、落到地块（tile）上并触发某些效果的小物体：雨、血、种子、火焰、酸液、金币等。它们是整款游戏中让地图上*发生*某些事情最轻量廉价的方式，而且自带动画与音效，全都是现成的。

## 注册一个坠落物

坠落物保存在 `AssetManager.drops` 中。以下是一个落地后点燃地块的坠落物示例：

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // 接触地面瞬间发生的事情
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

然后在 `Main.cs` 中添加该行：`HelloDrops.Initialize();`

### 字段含义

| 字段 | 含义 |
| --- | --- |
| `id` | 在其他所有地方使用的名称 |
| `path_texture` | 贴图精灵，路径规则与其他资源完全一致 |
| `type` | `DropType.DropMagic`, `DropGeneric`, … 决定游戏本身的部分处理逻辑 |
| `animated` + `animation_speed` | 将贴图列表按动画播放 |
| `default_scale` | 大小尺寸。小水滴通常为 `0.1f` |
| `falling_speed` | 下落速度 |
| `sound_drop` / `sound_launch` | FMOD 音效事件 |
| `action_landed` | **核心所在**：落地时运行的代码 |
| `action_launch` | 被投掷发射时运行 |

## 自定义贴图

`path_texture` 会完全按照所写的路径，从 `GameResources/` 内部加载。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

掉落物按 **精灵列表** 加载：游戏会读取该文件夹 *里面* 的每个 PNG，`animated` 就是靠这个工作的。静止的掉落物也是一个文件夹，里面只有一帧。单独的 `drops/hello_ember.png` 会返回空列表，掉落物就会隐形落下 :wbwiltedrose:。

## 让坠落物下落

有两种方式，都在 `World.world.drop_manager` 上：

```csharp
// 垂直下落到地块上：(tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// 呈抛物线弧度抛出，就像爆炸飞溅的碎片一样
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

90% 的情况下你需要的都是 `spawn`。`15f` 是它下落的高度：数值越大，落地所需的时间就越长。而且下落的过程也更有戏剧感。

## 实战运用：让神力降下余烬雨

如果你阅读了 **[神力](#/nml/god-powers)** 页面，这就是学以致用：一个能力，点燃一整片地块。

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // 中间一个，每个相邻地块各一个
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] 坠落物是偷懒专属特效
> 在编写复杂的粒子系统之前，不妨先想想带贴图和 `action_landed` 的坠落物能不能搞定。通常只要十行代码，而且连音效都顺带解决了 :PESgn_Noice:。
