---
title: Пользовательский интерфейс и HUD
group: Игровой контент
subgroup: Божественные силы и интерфейс
icon: :computer_emotiguy:
order: 208
---

# Пользовательский интерфейс и HUD :computer_emotiguy:

В **[Своих окнах](#/nml/custom-windows)** мы создавали модальные окна по нажатию кнопок. Однако многим модам требуется постоянный интерфейс: счетчики на экране, элементы миникарты или полоски здоровья над головами юнитов.

Поскольку WorldBox создан на Unity, у вас есть полный доступ к UI-компонентам (`Canvas`, `RectTransform`, `Image` и `Text`). Здесь показано, как привязать виджеты к экрану или отображать их поверх игрового мира.

## Иерархия интерфейса в Unity

Все 2D-элементы интерфейса находятся под компонентом `Canvas`. Для модов ключевым холстом является `CanvasMain`:

| Canvas | Назначение |
| --- | --- |
| `CanvasMain.instance` | Интерфейс в пространстве экрана (HUD, панели, счетчики) |
| Canvas World Space | Размещается непосредственно в мире игры |
| `Camera.main.WorldToScreenPoint` | Элементы на экране, следующие за позицией в мире |

## Код

Этот класс создает постоянный HUD в левом верхнем углу и обновляет его каждую секунду:

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

## Наложение в пространстве мира

Чтобы привязать виджет к существу, держите его на `CanvasMain` и проецируйте 3D-координаты на экран каждый кадр:

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

Это обеспечивает четкость шрифтов при любом масштабе зума камеры :PESgn_Noice:.

## Подводные камни

- **Canvas не готов при загрузке**: `CanvasMain.instance` часто равен `null` в `OnModLoad()`. Инициализируйте HUD в `Update()` после `Config.game_loaded`.
- **Шрифты**: Используйте `Resources.GetBuiltinResource<Font>("Arial.ttf")` или берите шрифт игры через `LocalizedText.default_font`.
- **Очистка при перезагрузке**: Удаляйте старые GameObject при горячей перезагрузке во избежание дублирования :aPES2_Sweat:.
