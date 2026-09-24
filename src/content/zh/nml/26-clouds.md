---
title: 云朵与天气
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbtornado:
order: 172
---

# 云朵与天气 :wbtornado:

云是一种在地图上空漂浮并在其下方倾泻物品的精灵图。雨、酸液、岩浆、雪、火焰：在底层它们全都是同一个资源（resource），仅仅是换了颜色与不同的 `drop_id`。

对模组作者而言，云是整款游戏中性价比最高的底层机制。只需要一个资源，无需绘制任何新图，它就会自行漂移、下落微粒、照亮地面并自动出现在游戏的天灾列表中。

## 注册一朵云

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] 注册晚了的云没有精灵图
> `CloudLibrary` 在游戏加载时一次性地从 `path_sprites` 生成 `cached_sprites`、从 `color_hex` 生成 `color`。那时你的云还不在列表里，所以两者都是空的，第一次出现就会在 `Cloud.prepare()` 里抛 `NullReferenceException` :wbfacepalm:。上面 `Initialize` 最后六行就是替你的云补做这一步。


### 字段详解

克隆一个原版云，然后改掉 `drop_id` 和 `color_hex`。很多云不需要别的。

| 字段 | 作用 |
| --- | --- |
| `color_hex` | 色调。它几乎决定了云朵全部的视觉辨识度 |
| `max_alpha` | 不透明度上限。默认为 `0.8` |
| `drop_id` | 降落的下落物。原版或你自己的 `AssetManager.drops` 中的任意ID |
| `cloud_action_1` / `cloud_action_2` | 两个独立的动作委托，各自运行在专属计时器上 |
| `interval_action_1` / `interval_action_2` | 每次执行相应动作的间隔秒数 |
| `speed_min` / `speed_max` | 漂移速度。每朵云都会在此区间内随机抽取自己的速度 |
| `path_sprites` | 精灵图路径列表。游戏会为每朵云随机选一张 |
| `considered_disaster` | 游戏是否将其视为正规天灾 |
| `normal_cloud` | 将其标记为普通天气事件而非突发灾祸 |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | 地面光晕效果，用于火云或岩浆云 |

## 什么是云朵动作

`CloudAction` 接收正在运行的云实例并且没有返回值：

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` 是原版默认动作：它在云朵精灵图下方挑选一个随机地块（tile），并在该处生成一个 `drop_id`。在 90% 的情况下这是你唯一需要的动作，直接赋给 `cloud_action_1` 即可。又懒又正确，我最爱的组合 :pepeOK:。

如果想添加额外效果，可以编写自定义方法并指定给 `cloud_action_2`：

```csharp
private static void SparkAction(Cloud pCloud)
{
    // 对地图上该类型的每一朵云每隔 interval_action_2 秒运行一次。
    // 保持轻量，并进行概率判断以避免连环爆炸。
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

然后设置 `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`。

## 导入自定义精灵图

`path_sprites` 是一个路径列表，每项都会直接从 `GameResources/` 中按指定路径加载。游戏会为每朵云随机挑一张，这就是原版传入三个变体的原因。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

云的精灵图是一团大而柔和的灰度斑块。`color_hex` 会承担全部染色工作，因此切勿给图片预涂颜色 - 画成纯白或灰度，让着色系统去处理即可 :wbsmirk:。

## 将云朵召唤到天空中

云是通过特效系统生成的，而不是通过某种云管理器：

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

这正是原版所有召唤云朵的上帝能力所做的事情。把它包装进一个上帝能力中，玩家就能拥有一个召唤云的工具：

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

关于按钮配置，请参见 **[上帝能力（God powers）](#/nml/god-powers)** 与 **[能力标签页与按钮](#/nml/power-buttons)**。

## 原版云朵列表

可作为克隆源以及查看已有功能的备忘单：

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// 从一个现成好用的云克隆，仅修改颜色与降落物。
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

记住 `clone()` 会自动为你完成注册：之后切勿调用 `add()`。

## 自制美术图

`path_sprites` 是 `GameResources/` 下的路径列表，与所有其他资源遵循相同的规则。参见 **[精灵图与资源](#/nml/sprites-and-resources)**。云朵本身是一团毛茸茸的云斑；`color_hex` 负责所有的着色工作，因此一个灰度图就完全足够了。

> [!TIP] 编写复杂天灾前先考虑云
> 游戏内部列表中的很多所谓“天灾”，实际上只是一朵带了 `considered_disaster = true` 的云。在编写具有触发条件和持续时间计时器的完整天灾系统之前，先看看让一朵云降下你的物品是否就能满足需求 :PES2_HmmmmThumbsUp:。
