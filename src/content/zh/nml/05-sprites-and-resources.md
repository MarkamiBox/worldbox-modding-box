---
title: 贴图与素材资源
group: NML 模组开发
subgroup: 核心开发流程
icon: :wbfanartist:
order: 28
---

# 贴图与素材资源 :wbfanartist:

你的特质（trait）已经有了名称、属性（stats）数值和优美的描述。但同时，它在游戏里还顶着一个巨大且难看的大问号作为图标。是时候把它解决掉了。

## 使用游戏本体已有的图标

这是最省事、也是你平时最常用的途径：直接引用游戏原版的精灵贴图路径。

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` 相当于带缓存机制的 `Resources.Load`，而 `getSpriteList` 则是带缓存的 `Resources.LoadAll`。素材路径不带文件扩展名：永远写成 `ui/Icons/iconFly`，绝不能写成 `ui/Icons/iconFly.png`。

绝大多数资源（resource）配置字段要求填入**文本路径字符串 (string)**，而不是已经加载好的 Sprite 实例对象：

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
| `PivotX` / `PivotY` | 锚点（中心点）位置。`0.5 / 0.0` 表示底部中心，通常是角色单位与建筑（building）所需的定位点 |
| `BorderL/R/T/B` | 九宫格拉伸边框（9-Slice），用于可拉伸缩放的窗口边框或按钮 |
| `Path` | 指定该规则具体应用于哪个图片文件 |
| `RectX` / `RectY` | 精灵图矩形的偏移量。两者默认都是 `0`；NML 文档建议保持为 `0` |

`Default` 规则会自动应用于同目录下所有未在 `Specific` 列表中单独声明的文件。

> [!NOTE] 偏移量不是图集切割配方
> 目前有文档记录的 `sprites.json` 设置里，并没有矩形宽度或高度这类字段。不要为了切割一整张图集而臆造出这些字段。图集与精灵表相关的内容，NML 记录的是 Unity 自己的 `.meta` 文件。

## 各种游戏素材的具体存放路径规范

这是大家会反复回来查的那张表。每种资源用不同的字段指向自己的美术资源，其中有几种还会在加载前悄悄在前面加一个文件夹，所以你写的值**不一定**就是文件所在的路径。

| 资源 | 字段 | 文件放在 |
| --- | --- | --- |
| 特质、神力（GodPower）、王国（kingdom）、分组 | `path_icon` | `GameResources/` + 你写的原样路径 |
| 物品（item）（单位手里拿着的） | `path_gameplay_sprite` | `GameResources/` + 你写的原样路径 |
| 建筑 | `sprite_path` | 一个**文件夹**：`GameResources/` + `sprite_path` + `/`，里面放 `main_0.png`、`construction_0.png`、`ruin_0.png`。如果 `sprite_path` 为空，就用 `main_path` + id，而 `main_path` 默认是 `buildings/` |
| 掉落物 | `path_texture` | 一个**文件夹**：`GameResources/` + 你写的原样路径，每帧一张 PNG |
| 云 | `path_sprites` | `GameResources/` + 列表里的每个路径 |
| 状态效果（status） | `texture` | 一个**文件夹**：`GameResources/effects/` + 你写的值，每帧一张 PNG |
| 投射物（projectile） | `texture` | 一个**文件夹**：`GameResources/effects/projectiles/` + 你写的值，每帧一张 PNG |
| 资源（拿在手里的） | `path_gameplay_sprite` | 一个**文件夹**：`GameResources/items/resources/` + 你写的值，每帧一张 PNG |
| 资源（背包图标） | `path_icon` | `GameResources/` + 你写的值。原版只用 `iconResBread` 这样的纯名字，所以文件放在根目录 |
| 地块（tile）和顶层地块 | *（没有字段）* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] “文件夹”不是风格问题
> 上面所有标成**文件夹**的资源都是用 `getSpriteList()` 读取的，它返回的是文件夹*里面*的帧。指向单个 PNG 就会得到空结果：掉落物隐形落下，投射物在 `QuantumSpriteLibrary.drawProjectiles()` 里抛出 `ArgumentOutOfRangeException`，状态效果每一帧都报错。只有一帧也没问题，只要它放在自己的文件夹里：`drops/hello_ember/hello_ember_0.png` :wbfacepalm:。

其中有三个最容易踩坑：

- **状态效果和投射物会在前面加一个文件夹。** 给状态效果写 `texture = "effects/status/myThing"`，游戏会去找 `effects/effects/status/myThing`，那里什么都没有。原版状态效果只用纯名字：`fx_status_burning_t`。
- **地块完全无视这些字段。** 地块的美术资源是按它的 **id** 在专属文件夹里找的，因为一个地块有好几种变体。`hello_moss` 就意味着 `GameResources/tiles/hello_moss/`，把你的 PNG 放进去。
- **建筑不拼接路径，但有后备方案。** `sprite_path` 会原样使用：`"buildings/hello_shrine"` 就是 `GameResources/buildings/hello_shrine/`。如果留空，游戏会改用 `main_path` + id，所以写进 `main_path` 的文件夹会变成 `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:。

> [!TIP] 照抄原版资源的路径
> 找一个最接近的原版东西，在 **[UnityExplorer](#/toolbox/unity-explorer)** 里或用 **[精灵路径查找](#/tools/icons)** 工具读出它的字段，然后原样照着写。这比自己推理快，而且一次就对 :PESgn_Noice:。

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

第一个调用会在世界对应的地块位置播放音效。HelloBox 在战斗动作中投掷余烬时会播放火球音效，参见 **[投射物、法术与特效](#/nml/projectiles-spells)**。要查找音效路径，可以在游戏反编译代码中搜索 `event:/SFX/`：有数百个按发声类别分类好的音效路径可供使用。开始测试之前，先把音量调低。

### 添加自定义音效

NML 其实在底层给 FMOD 打了补丁，所以自定义的 `.wav` 文件可以直接使用，不用你在车库里再造一个音频引擎 :PESgn_Noice:。

把你的 `.wav` 文件直接放进 `GameResources/`，比如：

```text
GameResources/sounds/hello_boom.wav
```

NML 挂钩了 `MusicBox.playSound` 和 `playDrawingSound`，所以你用和原版音效完全相同的方法来播放它（去掉文件扩展名）：

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

在文件旁边放一个可选的 `hello_boom.json`，就能配置它的行为：

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| 字段 | 取值 |
| --- | --- |
| `Mode` | `Basic`（平面 2D，音量不变）、`Stereo3D`（原版的距离衰减）、`Mono3D`（有方向性） |
| `Type` | `Sound`（音效滑块）、`Music`（音乐滑块）、`UI`（界面滑块） |
| `Volume` | 默认音量，0 到 100 |
| `LoopCount` | 重复次数（0 = 播放一次） |

最棒的是：因为 NML 把它们接入了游戏的声道组，你的音效会真正遵守玩家的音量设置，而不是在半夜把人震聋。

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

接下来：**[模组设置](#/nml/mod-config)** 或 **[自定义窗口](#/nml/custom-windows)**。
