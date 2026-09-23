---
title: 提取游戏原版美术资源 (AssetRipper)
group: 概览
subgroup: 外部工具与环境配置
icon: :wbgeneralartist:
order: 8
---

# 提取游戏原版美术资源 :wbgeneralartist:

代码告诉你*该怎么写*。而 **AssetRipper** 则能让你看清美术素材长什么样，更重要的是，**它在游戏里的真实路径到底是什么**。

WorldBox 中的每一个图标、生物单位、建筑和粒子特效，都是通过类似 `ui/Icons/iconFly` 这样的字符串路径进行加载的。一旦路径写错一个字母，你的按钮就会变成界面上的一个隐形黑洞。AssetRipper 能让你彻底告别盲猜。

> [!TIP] 如果你只需要路径，完全不需要做这些
> 本站的 **[图标搜索](#/tools/icons)** 就是基于这次导出的资源构建的：游戏中所有的资源路径都可以轻松搜索。只有当你想要亲眼*查看*美术素材、选取合适尺寸或匹配调色盘时，才需要自己提取游戏资源。本页接下来的内容正是为此准备的 :PES4_HappyAwesome:.

## 导出游戏资源

1. 下载 [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases)。
2. 将它指向你的 WorldBox 安装目录（包含 `worldbox_Data` 的那个文件夹）。
3. 导出到你自选的任意文件夹。整个过程需要耗费几分钟时间以及几 GB 硬盘空间 :pepehang:。

导出完成后你会得到一个 Unity 工程目录。你唯一需要关心的部分是导出的 `Resources` 文件夹，这正是游戏在运行时查找素材的完整资源树。

## 将文件转换为路径

规则非常简单：**路径就是文件在 `Resources` 下的相对位置，去掉文件后缀名即可。**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

以下是你最常翻找的几个目录：

| 文件夹 | 里面存放的内容 |
| --- | --- |
| `ui/Icons/` | 界面所有小型图标：特质、上帝力量、功能按钮 |
| `ui/Icons/worldrules/` | 世界法则图标 |
| `actors/` | 生物单位及其各帧动作动画 |
| `buildings/` | 房屋建筑、树木植被、矿石资源 |
| `effects/` | 爆炸特效、投射物、状态效果贴图 |

## 在你的 Mod 中直接调用

在导出的工程里看中了一个喜欢的图标？记下它的路径直接拿来用即可，完全不需要把贴图文件复制出来，因为游戏本体里早就内置了它：

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

或者在定义资产时直接把它赋值给字符串字段：

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## 让自制贴图完美贴合游戏风格

如果你打算自己动手画贴图，请先打开一个原版素材文件，对照着抄好三件事：

- **尺寸大小。** 特质和能力图标非常小巧，通常只有 16–32 像素左右。打开一个官方图标并保持相同的分辨率。
- **调色板风格。** WorldBox 采用的是一套非常克制且温和的色盘。直接用吸管工具从现有精灵图里取色，这样画出来的图标在游戏里才不会显得突兀出戏 :PES3_BobRoss:。
- **中心轴心点（Pivot）。** 游戏中的生物和建筑物都是脚踏实地站立在地面上的，因此它们的定位轴心点默认在底部正中。这也就是 `sprites.json` 里的 `PivotY: 0.0`（参见 **[精灵图与静态资源](#/nml/sprites-and-resources)**）。

绘制完成后，把你的 PNG 贴图放进 Mod 的 `GameResources/` 目录下，并保持一致的子文件夹层级，游戏就会像加载原版素材一样丝滑地载入它：

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
