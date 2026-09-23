---
title: 致谢与名单
group: 概览
subgroup: 社区与反馈
icon: :wblove:
order: 10
---

# 致谢与名单 :wblove:

没有这个不断做出厉害东西的社区，WorldBox 的 mod 制作根本不会存在。我想对每一个让这一切成真的人表示最深的感谢：


## modder 社区

这才是真正重要的部分。这一页上的每个工具都有人在维护，这份指南里的每个诀窍都是别人先摸索出来，然后直接「送出来」的 :trollface:

- **每一个做 mod 的人。** 我关于这个游戏所知道的九成，都是凌晨两点打开别人的 `Code/` 文件夹，然后想「哦，原来*是这样*写的」学来的。谢谢  :emoji_5:。

- **每一个回答问题的人。** 有人问自己的特质为什么看不见，你就把答案从头打一遍。新 modder 能坚持到变强，靠的就是这个  :catgoodjob: 。

- **认真报 bug 的人。** 带日志。带复现步骤。带上同时开着的其他 mod 列表。你们很少见，也很受喜爱  :gold_star: 。

---

## 游戏与开发者

- **Maxim Karpenko 与 WorldBox 开发团队**
  - 感谢他们做出这个游戏，也感谢更新拖得够久，让我们能继续做新的 mod  :76060-pepesadlaugh:
  - [WorldBox Official Website](https://www.superworldbox.com/)
  - [WorldBox Discord](https://discord.gg/worldbox)

---

## Worldbox 社区画师

- **WorldBox 官方 Discord 的画师们**
  - 感谢在官方 WorldBox Discord 服务器里创作的无数自定义表情。没有他们，这篇教程看起来真的会非常糟糕 :wblove:.

---

## mod 平台与核心框架

- **[NeoModLoader (NML)](https://github.com/WorldBoxOpenMods/ModLoader)**
  - 特别感谢维护 mod loader 的 NML maintainer 和核心贡献者。
- **[BepInEx](https://github.com/BepInEx/BepInEx)**
  - Unity/XNA 的 mod 框架和插件架构，虽然我用得不多。
- **[Harmony](https://github.com/pardeike/Harmony)**
  - 由 **Andreas Pardeike** 制作。强大的库，能在运行时给 .NET 方法打补丁、挂钩子、做替换，而不用改动硬盘上的游戏文件。

---

## 调查与分析工具

- **[UnityExplorer](https://github.com/sinai-dev/UnityExplorer)**
  - 由 **sinai-dev** 制作。游戏内的实时检查器。
- **[dnSpy](https://github.com/dnSpy/dnSpy) 和 [ILSpy](https://github.com/icsharpcode/ILSpy)**
  - 反编译器和调试器，让我们能读游戏编译好的 `Assembly-CSharp.dll`，搞懂机制、找到内部方法。
- **[AssetRipper](https://github.com/AssetRipper/AssetRipper)**
  - 一个开源工具，用来查看并提取 Unity asset bundle 和序列化文件里的精灵图、贴图、字体和音效。

---

## 指南灵感来源与社区作者

特别鸣谢在 GameBanana 上发布 WorldBox 模组与环境配置原始教程的作者们，他们清晰易懂的流程是我们编写“安装 NML”章节的重要灵感来源：

- **[Keymasterer ._.](https://gamebanana.com/members/2594582)**：原始教程的创作者与作者，为本站 NML 安装步骤提供了直接启发。
- **[ToonLunk](https://gamebanana.com/members/2712995)**：原始教程的校对者（Proofreader）与贡献者。

---

## 机器人们

- **[Claude](https://claude.ai)** 和 **[Gemini](https://gemini.google.com)**
  - 真正把这份指南写出来的体力活。折腾了五年，我知道游戏是怎么运作的；但把这些变成别人读得懂的页面是另一门手艺，这活儿大部分是它们俩干的  :computer_emotiguy: 。
  - 它们还替我读了反编译的游戏代码，省得我为了一个字段名第四百次翻 `Assembly-CSharp.dll`  :PES2_LookNewspaper: 。
  - 这里的所有内容在上线前都在真实游戏里核对过。要是某个机器人信心十足地编出一个并不存在的方法，那是我没抓出来，怪我  :PES2_Lies: 。
