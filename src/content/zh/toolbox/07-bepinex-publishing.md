---
title: 调试与发布
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# 调试与发布 :wbfireworks:

你的插件能编译了。现在它得能加载、能工作、能交到别人手上。本页按出现顺序列出你真正会遇到的错误，然后讲怎么发布。

## 去哪里看

| 文件 | 位置 | 是什么 |
| --- | --- | --- |
| 控制台窗口 | 如果你打开了它，会随游戏一起出现 | 所有内容，实时显示。见 **[实时控制台（BepInEx）](#/toolbox/bepinex-console)** |
| `LogOutput.log` | `worldbox/BepInEx/` | 同样的内容，保存成文件。别人找你要的就是它 |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Unity 自己的日志，记录 BepInEx 没捕获到的崩溃 |

先在 `LogOutput.log` 里搜你的插件名。第一条提到它的错误才是关键，规则和 **[日志与调试](#/nml/logs-and-debugging)** 一样。

## 编译不过时

| 错误 | 含义 | 解决 |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | 你的电脑没有 .NET Framework 4.7.2 开发包 | 使用 **[项目搭建](#/toolbox/bepinex-modding)** 里的 `Microsoft.NETFramework.ReferenceAssemblies` 包 |
| `CS0246: The type or namespace name 'Input' could not be found` | 没有引用某个 Unity 模块 | 引用 `UnityEngine*.dll`，而不只是 `UnityEngine.dll` |
| `CS0122: '...' is inaccessible due to its protection level` | 你用了游戏的 `internal` 成员 | 在 `Assembly-CSharp` 的引用上加 `Publicize="true"` |
| `The process cannot access the file ... because it is being used by another process` | 游戏正在运行，占用着你的 `.dll` | 关掉 WorldBox，再构建 |
| 复制步骤报 `Could not find a part of the path` | `.csproj` 里的 `GameDir` 写错了 | 让它指向包含 `worldbox.exe` 的文件夹 |

## 能编译但没加载时

启动游戏，找一行 `Loading [YourPlugin 1.0.0]`。没有这一行，说明 BepInEx 根本没发现你的插件：

| 你看到 | 原因 |
| --- | --- |
| 完全没有这一行 | `.dll` 不在 `BepInEx/plugins/` 里，或者 BepInEx 本身没在运行（没有控制台，也没有 `LogOutput.log`） |
| 没有这一行，但 `.dll` 位置正确 | 项目的目标框架不对。必须是 `net472`，不是 `net8.0` 或 `netstandard2.1` |
| 有这一行，接着是 `Could not load file or assembly 'Something'` | 你用了一个没有随插件一起发的库。把它的 `.dll` 放到插件文件夹里你的 `.dll` 旁边 |
| 两个插件 GUID 相同 | BepInEx 只会加载一个。通常是你自己插件的旧副本放在了别的文件夹 |

## 能加载但出错时

| 错误 | 通常是 |
| --- | --- |
| `AssetManager...` 处的 `NullReferenceException` | 你太早碰了游戏的库（library）。用 **[用 BepInEx 添加内容](#/toolbox/bepinex-content)** 里 `AssetManager.init()` 上的 Postfix |
| `HarmonyException` / `Ambiguous match found` | 补丁指向了不存在或有重载的方法。解决办法和 **[Harmony 补丁](#/nml/harmony-patches)** 一样 |
| 游戏更新后出现 `MissingMethodException` / `TypeLoadException` | 游戏在你脚下变了。按 **[游戏更新后更新你的 mod](#/nml/game-updates)** 走一遍，再重新构建 |
| 切换语言后文本显示原始键名 | 缺少 `LocalizedTextManager.setLanguage` 上的 Postfix |
| 图标看不见 | 贴图注册时已经有东西请求过它的路径，或者路径指向的是文件夹 |
| 一切正常，然后插件在游戏中途停了 | 在 `BepInEx/config/BepInEx.cfg` 里设置 `HideManagerGameObject = true` |

## 更快的循环

每改一次就关掉再打开 WorldBox，是 BepInEx 最糟的部分。BepInEx.Debug 合集里的 **ScriptEngine** 插件能缓解这一点：放在 `BepInEx/scripts/` 而不是 `plugins/` 的插件，可以在游戏运行时按一个键重新加载（具体按键见它的 readme）。

它非常适合工具、窗口和叠加界面。对内容的帮助就小些：游戏不会忘掉你已经注册的特质（trait），而你应用过的每个 Harmony 补丁都会一直生效，除非你的插件在卸载时移除它（在 `OnDestroy()` 里调用 `harmony.UnpatchSelf()`）。搭界面时用它，调特质数值时别指望它 :PES2_Shrug:。

## 发布

### zip 里放什么

用 Release 模式构建插件，然后打包成玩家能直接解压到游戏文件夹里的 zip：

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

**不要**放进去的东西：

- **BepInEx 本身。** 玩家只需装一次，和你一样。把他们引到 **[控制台页面](#/toolbox/bepinex-console)**，并说明版本：BepInEx 5、Mono、x64。
- **游戏的文件。** `Assembly-CSharp.dll`、Unity 模块，尤其是构建时生成的公开化副本。那是游戏的代码，不是你能分享的。`.csproj` 里的 `Private="false"` 已经让它们不会进入构建文件夹，你只要别手动加进去。
- **`BepInEx.dll` 和 `0Harmony.dll`。** BepInEx 自己已经有了。

### 版本号

两个地方都要改，并保持一致：`[BepInPlugin]` 里的 `version`（日志和其他插件看到的）和 `.csproj` 里的 `<Version>`（`.dll` 文件显示的）。第三次发布时日志里还写着 `1.0.0` 的插件，会让每一份错误报告都更难处理。

### 依赖另一个插件

如果你的插件需要另一个 BepInEx 插件先加载，就声明出来，BepInEx 会排好加载顺序，缺了它就拒绝加载你的插件：

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

如果另一个插件是可选的，你只想在它存在时排在它后面加载，就把 `BepInDependency.DependencyFlags.SoftDependency` 作为第二个参数。

### 发布到哪里

和其他 WorldBox mod 一样的地方，建议也一样：见 **[发布](#/nml/publishing)**。你的描述里唯一需要多写的一行是 "Requires BepInEx 5 (Mono x64)"，放在最上面。它能帮你省掉那些把它装进只有 NML 的游戏里的人发的"用不了"评论 :wbsalut:。
