---
title: 贴图与素材资源
group: NML 模组开发
subgroup: 核心开发流程
icon: :wbfanartist:
order: 28
---

# 贴图与素材资源 :wbfanartist:

你的特质已经有了名称、属性数值和优美的描述。但同时，它在游戏里还顶着一个巨大且难看的大问号作为图标。是时候把它解决掉了。

## 使用游戏本体已有的图标

这是最省事、也是你平时最常用的途径：直接引用游戏原版的精灵贴图路径。

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` 相当于带缓存机制的 `Resources.Load`，而 `getSpriteList` 则是带缓存的 `Resources.LoadAll`。素材路径不带文件扩展名：永远写成 `ui/Icons/iconFly`，绝不能写成 `ui/Icons/iconFly.png`。

绝大多数资源配置字段要求填入**文本路径字符串 (string)**，而不是已经加载好的 Sprite 实例对象：

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] 我怎么知道游戏里有哪些可用路径？
> 请使用本站的 **[图标搜索](#/tools/icons)** 工具。该工具收录了游戏内所有贴图精灵的路径，并且支持常用英文搜索（例如输入 "death king" 或 "lightning bolt" 即可复制路径）。或者在游戏内打开 **[UnityExplorer](#/toolbox/unity-explorer)**，直接查看与你目标相似的官方原版资源的 `path_icon` 属性 :aPES_Magnifying:。

## 添加你自己的自定义美术素材

在你的 Mod 根目录下创建一个名为 **`GameResources/`** 的文件夹。NML 会将其完全视为 Unity 原生的 `Resources` 文件夹来处理。因此，存放在以下路径的文件：

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

会被直接加载为 `ui/Icons/iconHelloSwift`，并且可以在任何接受官方路径的地方直接生效。`.png`、`.jpg` 和 `.jpeg` 格式会被自动识别。

### sprites.json

在图片文件同级目录下放置一个 `sprites.json`，可以告知 NML 如何对这些贴图进行切片与定位。若不提供该文件，将应用 Unity 的默认切片参数，而这对于像素艺术来说往往是错误的。（并非所有情况都必须配置 :PESgn_Maybe: ）

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| 字段 | 作用说明 |
| --- | --- |
| `PixelsPerUnit` | 除非你明确知道为什么要改，否则保持为 `1` 即可 |
| `PivotX` / `PivotY` | 锚点（中心点）位置。`0.5 / 0.0` 表示底部中心，通常是角色单位与建筑所需的定位点 |
| `BorderL/R/T/B` | 九宫格拉伸边框（9-Slice），用于可拉伸缩放的窗口边框或按钮 |
| `Path` | 指定该规则具体应用于哪个图片文件 |

`Default` 规则会自动应用于同目录下所有未在 `Specific` 列表中单独声明的文件。

## 各种游戏素材的具体存放路径规范

这是所有 Mod 开发者频繁回头查阅的核心对照表。每种游戏资源都是通过不同的字段来引用贴图的，而且其中某些资源在加载时会悄悄自动拼上一层子目录，因此你所填写的数值**并不总是**该文件在磁盘上的直观相对路径。

| 资源类型 | 配置字段 | 磁盘文件存放位置 |
| --- | --- | --- |
| 特质、神圣能力、王国、特质分组 | `path_icon` | `GameResources/` + 填写的完整相对路径 |
| 物品（单位手持渲染图） | `path_gameplay_sprite` | `GameResources/` + 填写的完整相对路径 |
| 建筑 | `sprite_path` | **文件夹**： `GameResources/` + `sprite_path` + `/`, 内含 `main_0.png`, `construction_0.png`, `ruin_0.png`. `sprite_path` 为空时用 `main_path` + id，`main_path` 默认是 `buildings/` |
| 掉落物 | `path_texture` | **文件夹**： `GameResources/` + 填写的完整相对路径 |
| 云朵 | `path_sprites` | `GameResources/` + 列表中声明的每个路径 |
| 状态效果 | `texture` | **文件夹**： `GameResources/effects/` + 你填写的相对路径 |
| 投掷物 | `texture` | **文件夹**： `GameResources/effects/projectiles/` + 你填写的相对路径 |
| 资源物品（手持搬运外观） | `path_gameplay_sprite` | **文件夹**： `GameResources/items/resources/` + 你填写的相对路径 |
| 资源物品（背包清单图标） | `path_icon` | `GameResources/` + 填写的内容（官方通常直接填写如 `iconResBread`，位于根目录） |
| 地块与地表覆盖层 | *(无字段)* | `GameResources/tiles/<地块ID>/` |

> [!WARNING] "文件夹"不是风格问题
> 上面标成 **文件夹** 的资源都用 `getSpriteList()` 读取，它返回的是文件夹 *里面* 的帧。指向单个 PNG 会得到空列表：掉落物隐形地落下，弹射物在 `QuantumSpriteLibrary.drawProjectiles()` 里抛 `ArgumentOutOfRangeException`，状态每帧都抛异常。一帧就够，只要放在它自己的文件夹里：`drops/hello_ember/hello_ember_0.png` :wbfacepalm:。

这里有三个最容易踩坑的暗坑：

- **状态效果与投掷物会自动前缀一层文件夹。** 如果给状态效果写上 `texture = "effects/status/myThing"`，游戏底层会去寻找 `effects/effects/status/myThing`，导致资源丢失。原版状态使用的是纯文件名：`fx_status_burning_t`。
- **地块素材完全无视这些字段。** 地块的外观是根据其**全局 ID** 在专属文件夹内检索的，因为单个地块具有多种随机纹理变体。`hello_moss` 意味着你必须把 PNG 素材存入 `GameResources/tiles/hello_moss/` 目录下。
- **建筑不会拼接字段，但有退路。** `sprite_path` 会原样使用：`"buildings/hello_shrine"` 就是 `GameResources/buildings/hello_shrine/`。留空时游戏改用 `main_path` + id，所以把文件夹写进 `main_path` 会变成 `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:。

> [!TIP] 直接抄原版资源的写法
> 在游戏里找到功能最接近的原版对象，用 **[UnityExplorer](#/toolbox/unity-explorer)** 或本站的 **[图标搜索](#/tools/icons)** 查看其对应的字段取值格式并照猫画虎。这比自己凭空推导更快捷且保证万无一失 :PESgn_Noice:。

## 从磁盘直接读取图片数据

有时候你可能会需要原始的纹理文件：例如需要自己手动执行九宫格切片的窗口皮肤或自定义数据。`ModDeclare` 始终知晓你 Mod 所在的文件路径，千万不要把固定死路径写进代码。

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // 保持像素画锐利，不使用双线性模糊
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

如果不愿手动写这套底层代码，`NeoModLoader.utils.SpriteLoadUtils` 中也封装了 `LoadSingleSprite(path)` 与 `LoadSprites(path)` 等开箱即用的方法。

## 音效

WorldBox 中的每一个声音都是一个 FMOD 音频事件，通过路径进行调用播放。你可以随意调用游戏里的任意音效：

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

第一个调用会在世界对应的地块位置播放音效。HelloBox 在战斗动作中投掷余烬时会播放火球音效，参见 **[投射物、法术与特效](#/nml/projectiles-spells)**。要查找音效路径，可以在游戏反编译代码中搜索 `event:/SFX/`：有数百个按发声类别分类好的音效路径可供使用。

> [!NOTE] 导入全新自定义音效属于另一套工程
> 原版 FMOD 事件内嵌在游戏的音效库（Sound Bank）中，常规模组无法直接向其追加事件。若要播放自己的 `.wav` 资源，需要绕开游戏内置的音量控制系统，自行使用 Unity 的 `AudioSource` 进行加载播放。本指南不做深入展开。

## 绝不要向游戏传递 null 的空精灵

一个缺少贴图的按钮并不会变成带有问号的按钮：它会沦为界面上一个**完全隐形且不可见的黑洞**，玩家根本无法发现并点击它。永远做好后备回退保护：

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

一个显眼的警告图标能即刻提醒你“路径写错了”。而彻底消失的空白隐形洞只会让你抓狂两个小时，怀疑自己的按钮到底加载到了哪片虚空之中 :PES4_Invisible:。
