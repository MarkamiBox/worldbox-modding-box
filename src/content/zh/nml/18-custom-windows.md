---
title: 自定义窗口
group: 游戏内容
subgroup: 神力与用户界面
icon: :wbmonolith:
order: 204
---

# 自定义窗口 :wbmonolith:

有时仅仅一个按钮已经无法满足需求，你需要一个真正的面板：一个列表、一些数据、外加几个控制开关。制作窗口有两条途径，选错的那一条会浪费你整个周末。

| 路线 | 适用场景 |
| --- | --- |
| `ScrollWindow` | 你需要一个外观和交互完全契合原版、并位于原版固定弹窗槽位里的窗口 |
| 自定义 `Canvas` | 你需要一个可自由浮动、可缩放、支持多开且原版没有对应物的高级面板 |

## 与原版窗口进行交互

游戏将所有窗口保存在一个以 id 为键的注册表中，你可以在代码中的任何地方驱动它们：

```csharp
ScrollWindow.showWindow("worldlaws");        // 打开指定窗口
ScrollWindow.get("worldlaws");               // 获取该窗口实例
ScrollWindow.checkWindowExist("worldlaws");  // 检查该窗口是否存在
ScrollWindow.isWindowActive();               // 当前是否“有任何”窗口处于打开状态
```

最后这个方法远比表面看起来重要：如果你的神力在点击时会触发动作，你通常希望当窗口遮挡住地图时什么都不要发生。在 `GodPower` 上设置 `unselect_when_window = true` 即可把这个问题完全交给游戏处理。

## 原生 ScrollWindow 方案

如果你想让面板看起来像是 WorldBox 自己做的，就别像我第一次那样从零搭一个 canvas :PES2_Shrug:。NeoModLoader 自带 `WindowCreator` 和 `AbstractWindow<T>`，就是为了让你不必用 Unity 的原始组件去拼滚动条、标题栏和关闭按钮。

继承 `AbstractWindow<T>`，把底层的活交给 NML：

```csharp Mods/HelloBox/Code/HelloNativeWindow.cs
using NeoModLoader.api;
using UnityEngine;
using UnityEngine.UI;

namespace HelloBox
{
    public class HelloNativeWindow : AbstractWindow<HelloNativeWindow>
    {
        protected override void Init()
        {
            // ContentTransform is already pointing to Background/Scroll View/Viewport/Content.
            // Put your buttons, text, and rows here:
            GameObject labelObj = new GameObject("Text", typeof(Text));
            labelObj.transform.SetParent(ContentTransform, false);

            Text label = labelObj.GetComponent<Text>();
            label.font = LocalizedTextManager.current_font;
            label.fontSize = 12;
            label.text = "Hello from a native window!";
        }

        public override void OnFirstEnable()
        {
            // Runs once, the very first time the player opens the window
        }

        public override void OnNormalEnable()
        {
            // Runs every time the window opens - refresh dynamic stats here
        }

        public override void OnNormalDisable()
        {
            // Runs every time the window closes
        }
    }
}
```

在模组初始化时创建一次：

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
```

`CreateAndInit()` 会克隆游戏的 `"windows/empty"` 预制体，把它挂到 `CanvasMain.instance.transformWindows` 下，把标题键设为 `"<windowId> Title"`，挂上你的组件，并把窗口同时注册到 `ScrollWindow._all_windows` 和 `AssetManager.window_library`。打开它只需要和原版窗口一样的一行代码：

```csharp
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

如果你需要更大的屏幕空间来放一张巨大的表格或多列管理器，就改为继承 `AbstractWideWindow<T>`。它的行为完全一样，但默认尺寸是 `600x280`，会自动套用宽版边框，并提供 `SetSize(new Vector2(width, height))`，方便你的布局要更多空间时使用。

如果你根本不想用 `AbstractWindow<T>` 这个基类，就直接调用 `WindowCreator.CreateEmptyWindow(id, titleKey, icon)`，然后自己配置返回的 `ScrollWindow`。自己动手时如果忘了注册这一步，按下 ESC 时游戏甚至不知道你的窗口存在 :wbfacepalm:。

## 自定义悬浮窗口

窗口本质上是一个挂载在游戏 UI 画布上的 `GameObject`。以下是完整的骨架代码：

```csharp Mods/HelloBox/Code/HelloWindow.cs
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

namespace HelloBox
{
    public class HelloWindow : MonoBehaviour, IDragHandler
    {
        private static HelloWindow instance;
        private RectTransform rect;

        public static void Toggle()
        {
            if (instance == null) Build();
            else instance.gameObject.SetActive(!instance.gameObject.activeSelf);
        }

        private static void Build()
        {
            Transform parent = CanvasMain.instance.canvas_ui.transform;

            GameObject root = new GameObject("HelloBox_Window");
            root.transform.SetParent(parent, false);

            Canvas layer = root.AddComponent<Canvas>();
            layer.overrideSorting = true;
            layer.sortingOrder = 30240;
            root.AddComponent<GraphicRaycaster>();   // clicks land on the window, not the map

            instance = root.AddComponent<HelloWindow>();
            instance.rect = root.GetComponent<RectTransform>();
            instance.rect.anchorMin = new Vector2(0f, 1f);
            instance.rect.anchorMax = new Vector2(0f, 1f);
            instance.rect.pivot = new Vector2(0f, 1f);
            instance.rect.anchoredPosition = new Vector2(100f, -80f);
            instance.rect.sizeDelta = new Vector2(240f, 300f);

            Image background = root.AddComponent<Image>();
            background.color = new Color(0.16f, 0.18f, 0.15f, 0.98f);

            // Resize grip at the bottom-right corner
            GameObject handle = new GameObject("ResizeHandle");
            handle.transform.SetParent(root.transform, false);

            RectTransform handleRect = handle.AddComponent<RectTransform>();
            handleRect.anchorMin = new Vector2(1f, 0f);
            handleRect.anchorMax = new Vector2(1f, 0f);
            handleRect.pivot = new Vector2(1f, 0f);
            handleRect.anchoredPosition = Vector2.zero;
            handleRect.sizeDelta = new Vector2(20f, 20f);

            Image handleImg = handle.AddComponent<Image>();
            handleImg.color = new Color(0.5f, 0.5f, 0.5f, 0.6f);

            handle.AddComponent<HelloWindowResize>().target = instance.rect;

            // hover the panel for live numbers: see Tooltips below
            root.AddComponent<HelloTooltipTarget>();
        }

        // Drag anywhere on the window background to move it around
        public void OnDrag(PointerEventData eventData)
        {
            if (rect != null)
            {
                rect.anchoredPosition += eventData.delta;
            }
        }
    }

    public class HelloWindowResize : MonoBehaviour, IDragHandler
    {
        public RectTransform target;

        // Drag the bottom-right corner to resize the window
        public void OnDrag(PointerEventData eventData)
        {
            if (target != null)
            {
                float newWidth = Mathf.Max(160f, target.sizeDelta.x + eventData.delta.x);
                float newHeight = Mathf.Max(160f, target.sizeDelta.y - eventData.delta.y);
                target.sizeDelta = new Vector2(newWidth, newHeight);
            }
        }
    }
}
```

### 代码拆解详解

- **`CanvasMain.instance.canvas_ui`**：游戏自身界面所在的画布。如果挂载到其他地方，你的窗口要么被遮挡在地图底层，要么完全无法响应 UI 缩放。
- **`overrideSorting` + `sortingOrder`**：让窗口拥有独立的排序层级。设置一个大数值意味着“显示在最顶层”，这正是玩家主动打开的面板所需要的。
- **`GraphicRaycaster`**：让点击事件能够命中窗口的组件。漏掉它会导致每一次点击都穿透面板打在地图上，在你自己的面板背后狂刷生物 :pepeclown:。
- **窗口上的 `IDragHandler`**：`OnDrag` 执行 `rect.anchoredPosition += eventData.delta`，所以你可以点住面板，把它拖到屏幕任何位置。
- **角落把手上的 `HelloWindowResize`**：拖动右下角会重新计算宽高，下限 `160f`，玩家可以平滑地调整大小。
- **`sizeDelta`**：UI 坐标系下的大小。初始尺寸建议做小一点，遮天蔽日的面板只会让玩家想立刻关掉。

## 让它看起来有 WorldBox 的原版质感

纯色平铺的长方形一眼看去就很“低劣”。游戏自带的窗口素材采用九宫格切片（9-slice），缩放时边框不会模糊。将 PNG 放入 `GameResources/ui/` 文件夹，加载并为其设置边框切片：

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // 每单位像素数
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // 左、下、右、上边框宽度
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

文字排版则直接使用游戏当前加载的字体，以便无缝契合各种语言环境：

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## 你很快就会需要的高频功能

- **拖拽移动**：实现一个包含 `IDragHandler` 的简单 `MonoBehaviour`，根据 `eventData.delta` 更新 `rect.anchoredPosition`。只需二十行代码，就能化枯燥死板为灵动自如。
- **按观察对象独立开窗**：如果你的面板展示的是*某个具体生物*的信息，为每个生物生成独立的实例，而不是共用一个切来切去的单例面板。观察两个目标的意义在于同时对比。
- **内存回收**：窗口彻底关闭时调用 `Object.Destroy(root)` 并清空引用。代码动态创建的贴图也需要 `Destroy`，否则每次打开面板都会导致显存泄漏。

## 悬停提示框（Tooltips）

游戏的悬停提示框同样作为资产统一由 `AssetManager.tooltips` 管理：包含资产 ID 以及每次提示框唤起时执行的数据填充回调。注册自定义提示框后，界面上的任何 UI 对象均可在鼠标悬停时展示带有动态实时数据的说明框。玩家会把鼠标悬停在所有东西上，所以你的模组正是在这里悄悄显得完成度很高。

```csharp Mods/HelloBox/Code/HelloTooltips.cs
using UnityEngine;
using UnityEngine.EventSystems;

namespace HelloBox
{
    public static class HelloTooltips
    {
        public const string PANEL = "hello_panel";

        public static void Initialize()
        {
            if (AssetManager.tooltips.has(PANEL)) return;

            // callback runs every time the tooltip opens, so it can show live numbers
            AssetManager.tooltips.add(new TooltipAsset
            {
                id = PANEL,
                callback = (Tooltip pTooltip, string pType, TooltipData pData) =>
                {
                    pTooltip.name.text = LocalizedTextManager.getText("hello_panel_tooltip_title");
                    pTooltip.setDescription(LocalizedTextManager.getText("hello_panel_tooltip_description")
                        .Replace("$count$", World.world.units.getSimpleList().Count.ToString()));
                }
            });
        }
    }

    /** Put it on any UI object that should show the tooltip on hover. */
    public class HelloTooltipTarget : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
    {
        public void OnPointerEnter(PointerEventData pEventData)
        {
            Tooltip.show(gameObject, HelloTooltips.PANEL, new TooltipData());
        }

        public void OnPointerExit(PointerEventData pEventData)
        {
            Tooltip.hideTooltip();
        }
    }
}
```

`HelloWindow` 在自身背景上挂载了 `HelloTooltipTarget` 组件，因此鼠标悬停在窗口上时就会展示该提示框。`Tooltip.show()` 接收所属的 UI GameObject、提示框 ID 以及传递给回调函数的 `TooltipData` 数据包：原版逻辑通常将关联的生物、城镇或特质实例打包传入。对于常规说明，原版默认的 `"normal"` 提示框甚至无需注册专属资产，只需直接配置 `tip_name` 与 `tip_description` 本地化文本键即可。

| `TooltipAsset` 字段 | 作用说明 |
| --- | --- |
| `callback` | 组装填充提示框内容：`name.text`、`setDescription()`、`setBottomDescription()` |
| `prefab_id` | 指定所使用的提示框 UI 预制件。默认为 `tooltips/tooltip_normal` |
| `callback_text_animated` | 在提示框显示期间每 0.08 秒循环回调一次，用于刷新动态跳动的文本内容 |

## 绑定快捷键打开窗口

用于一键呼出自定义面板的按键映射属于 `HotkeyAsset`。它不会在 UI 栏显式占用位置，按下对应按键时会直接触发指定的回调动作。

```csharp Mods/HelloBox/Code/HelloHotkeys.cs
using System;
using UnityEngine;

namespace HelloBox
{
    public static class HelloHotkeys
    {
        public const string TOGGLE = "hello_toggle_window";

        public static void Initialize()
        {
            HotkeyLibrary library = AssetManager.hotkey_library;
            if (library.has(TOGGLE)) return;

            HotkeyAsset toggle = new HotkeyAsset
            {
                id = TOGGLE,
                default_key_1 = KeyCode.F6,          // no vanilla hotkey uses it
                check_controls_locked = true,        // not while the player steers a unit
                just_pressed_action = (HotkeyAsset pAsset) => HelloWindow.Toggle()
            };
            library.add(toggle);

            // linkAssets() copied every default key into the live one and listed the
            // hotkeys that have an action. Both at startup: without them the key is dead.
            toggle.overridden_key_1 = toggle.default_key_1;

            HotkeyAsset[] withActions = library.action_hotkeys;
            Array.Resize(ref withActions, withActions.Length + 1);
            withActions[withActions.Length - 1] = toggle;
            library.action_hotkeys = withActions;
        }
    }
}
```

> [!WARNING] 快捷键映射在游戏启动阶段完成静态注册
> `HotkeyLibrary.linkAssets()` 会将所有 `default_key_*` 映射复制到游戏运行时实际检测的 `overridden_key_*` 字段中，并构建出每帧轮询的 `action_hotkeys` 数组。这两步均发生在模组载入之前。若漏掉了注册后的映射同步，按键将完全无法触发任何响应 :wbfacepalm:。

`check_*` 检测标志是防止按键冲突的省心手段：`check_controls_locked` 会在玩家直接操控生物时忽略按键，`check_window_not_active` 则会在原版窗口处于激活状态时阻止呼出。请挑选原版未占用的按键，例如 F6（其他模组可能也会使用） :PES2_Shrug:。

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] 优先参考原版窗口实现
> 在游戏中使用 **UnityExplorer** 在 UI 树中选中一个原版窗口，直接查看其挂载的组件和坐标数值。直接参考一套已经被验证可行的 UI 结构，远比自己花三个小时盲猜 RectTransform 的锚点参数靠谱得多 :PES2_GaSmart:.
