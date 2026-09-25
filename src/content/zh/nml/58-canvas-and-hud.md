---
title: 自定义 UI 与 HUD
group: 游戏内容
subgroup: 神力与用户界面
icon: :computer_emotiguy:
order: 208
---

# 自定义 UI 与 HUD :computer_emotiguy:

在 **[自定义窗口](#/nml/custom-windows)** 中，我们构建了点击神力栏按钮弹出的模态窗口。但许多模组需要常驻界面：例如屏幕角落的数据面板、小地图指示标或生物头顶盘旋的生命值条。

得益于 WorldBox 基于 Unity 引擎构建，模组作者可以完整调用 Unity UI 系统（`Canvas`、`RectTransform`、`Image` 与 `Text`）。本页将介绍如何将组件固定在屏幕上或将其投影到游戏世界中。

## Unity UI 层级架构

游戏内所有的 2D 界面元素均挂载于 Unity `Canvas`（画布）之下。对模组最有价值的主画布是 `CanvasMain`：

| 画布 | 使用场景 |
| --- | --- |
| `CanvasMain.instance` | 屏幕空间 UI（常驻 HUD、工具栏、数据指示器） |
| World Space Canvas | 放置于三维世界空间并跟随地块移动的画布 |
| `Camera.main.WorldToScreenPoint` | 在屏幕空间平滑跟随移动单位的覆盖层组件 |

## 代码实现

该类在屏幕左上方创建了一个常驻的 HUD 状态栏，并以每秒一次的频率刷新世界数据：

```csharp Mods/HelloBox/Code/HelloHUD.cs
using System;
using UnityEngine;
using UnityEngine.UI;

namespace HelloBox
{
    public class HelloHUD : MonoBehaviour
    {
        private static GameObject HudObject;
        private static Text Label;
        private static float NextUpdate;

        public static void Initialize()
        {
            if (HudObject != null) return;
            if (CanvasMain.instance == null) return;

            // 1. Create a root GameObject under CanvasMain
            HudObject = new GameObject("HelloBox_HUD");
            HudObject.transform.SetParent(CanvasMain.instance.transform, false);

            RectTransform rect = HudObject.AddComponent<RectTransform>();
            rect.anchorMin = new Vector2(0f, 1f); // top-left
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(20f, -60f);
            rect.sizeDelta = new Vector2(200f, 40f);

            // 2. Add background panel
            Image bg = HudObject.AddComponent<Image>();
            bg.color = new Color(0.1f, 0.12f, 0.16f, 0.85f);

            // 3. Add text label
            GameObject textObj = new GameObject("Label");
            textObj.transform.SetParent(HudObject.transform, false);

            RectTransform textRect = textObj.AddComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.sizeDelta = Vector2.zero;

            Label = textObj.AddComponent<Text>();
            Label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            Label.fontSize = 14;
            Label.alignment = TextAnchor.MiddleCenter;
            Label.color = Color.white;
            Label.text = "HelloBox: Loading...";

            HudObject.AddComponent<HelloHUD>();
        }

        private void Update()
        {
            if (Time.time < NextUpdate) return;
            NextUpdate = Time.time + 1.0f;

            if (World.world == null || Label == null) return;

            int units = World.world.units != null ? World.world.units.Count : 0;
            Label.text = $"Alive units: {units}";
        }

        public static void Destroy()
        {
            if (HudObject != null)
            {
                Destroy(HudObject);
                HudObject = null;
            }
        }
    }
}
```

## 世界空间覆盖层跟随

如果你需要让 UI 标记跟随单位移动，建议将组件保持在 `CanvasMain` 上，并在每帧中将生物的三维坐标投射为二维屏幕坐标：

```csharp
public static void TrackUnit(RectTransform pWidget, Actor pUnit)
{
    if (pWidget == null || pUnit == null || !pUnit.isAlive()) return;

    Vector3 screenPos = Camera.main.WorldToScreenPoint(pUnit.currentPosition);

    if (screenPos.z < 0)
    {
        pWidget.gameObject.SetActive(false);
        return;
    }

    pWidget.gameObject.SetActive(true);
    pWidget.position = screenPos + new Vector3(0, 30f, 0);
}
```

这种做法避免了相机缩放时界面字体模糊或拉伸失真的问题 :PESgn_Noice:。

## 需要规避的隐患

- **加载时画布尚未就绪**：在 `OnModLoad()` 阶段 `CanvasMain.instance` 往往为 `null`。请在 `Config.game_loaded` 为真后的 `Update()` 循环中进行初次初始化。
- **字体获取**：推荐通过 `Resources.GetBuiltinResource<Font>("Arial.ttf")` 获取内置字体，或复用原版 `LocalizedText.default_font`。
- **热重载清理**：使用热重载时，务必在创建新对象前销毁旧的游戏物体，否则会导致多个 HUD 堆叠重影 :aPES2_Sweat:。
