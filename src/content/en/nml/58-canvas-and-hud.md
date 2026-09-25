---
title: Custom UI & HUD
group: Game Content
subgroup: God Powers & UI
icon: :computer_emotiguy:
order: 208
---

# Custom UI & HUD :computer_emotiguy:

In **[Custom windows](#/nml/custom-windows)**, we built modal windows that open when the player clicks a button on the power bar. But some mods need permanent UI: an on-screen counter, a persistent status display, a minimap indicator, or a floating health bar above a creature's head.

Because WorldBox is built in Unity, modders have full access to Unity's UI system (`Canvas`, `RectTransform`, `Image`, and `Text`). This page shows how to anchor custom widgets to the screen or project them onto the living world.

## The Unity UI hierarchy

All in-game 2D interface elements exist under a Unity `Canvas`. WorldBox provides several root canvases, but the most useful for mods is `CanvasMain`:

| Canvas | When to use it |
| --- | --- |
| `CanvasMain.instance` | Top-level screen-space UI (HUD, toolbars, counters) |
| World Space Canvas | Positioned directly in the game world over tiles or units |
| `Camera.main.WorldToScreenPoint` | Screen-space overlays that track moving world positions |

## The code

This class creates a persistent HUD banner at the top-left of the screen and updates it every second with live world statistics:

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

## World-space overlays

If you want a widget to follow a unit on screen (like a custom marker or health bar), do not make the Canvas world-space. Instead, keep the widget on `CanvasMain` and convert the unit's 3D position into 2D screen coordinates every frame:

```csharp
public static void TrackUnit(RectTransform pWidget, Actor pUnit)
{
    if (pWidget == null || pUnit == null || !pUnit.isAlive()) return;

    Vector3 screenPos = Camera.main.WorldToScreenPoint(pUnit.currentPosition);

    // Hide if behind the camera
    if (screenPos.z < 0)
    {
        pWidget.gameObject.SetActive(false);
        return;
    }

    pWidget.gameObject.SetActive(true);
    pWidget.position = screenPos + new Vector3(0, 30f, 0); // slightly above head
}
```

This ensures sharp UI rendering regardless of zoom level, without pixel distortion from camera scaling :PESgn_Noice:.

## Pitfalls to avoid

- **Canvas not ready on mod load**: `CanvasMain.instance` is often `null` during `OnModLoad()`. Always initialize HUD elements in your first `Update()` tick after `Config.game_loaded` is `true`.
- **Fonts in Unity**: Use `Resources.GetBuiltinResource<Font>("Arial.ttf")` or borrow the game's font from an existing text component (`LocalizedText.default_font`).
- **Clean up on reload**: If you use hot reload, destroy old GameObjects before creating new ones, or you will end up with duplicate HUDs stacked on top of each other :aPES2_Sweat:.
