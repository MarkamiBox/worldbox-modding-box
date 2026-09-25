---
title: Eigene UI & HUD
group: Spielinhalte
subgroup: Göttliche Kräfte & UI
icon: :computer_emotiguy:
order: 208
---

# Eigene UI & HUD :computer_emotiguy:

In **[Eigene Fenster](#/nml/custom-windows)** haben wir modale Fenster gebaut, die per Knopfdruck aufklappen. Manche Mods brauchen jedoch dauerhafte UI-Elemente: feste Statuszähler, Anzeigen oder Lebensbalken über Einheiten.

Da WorldBox auf Unity basiert, steht dir das gesamte UI-System (`Canvas`, `RectTransform`, `Image` und `Text`) offen. Diese Seite zeigt, wie du Elemente am Bildschirm verankerst oder auf die Spielwelt projizierst.

## Die Unity-UI-Hierarchie

Alle 2D-Oberflächenelemente liegen unter einem Unity-`Canvas`. WorldBox bietet mehrere Wurzel-Canvasse, der wichtigste für Mods ist `CanvasMain`:

| Canvas | Einsatzzweck |
| --- | --- |
| `CanvasMain.instance` | UI im Screen Space (HUD, Werkzeugleisten, Zähler) |
| World Space Canvas | Direkt in der Spielwelt über Kacheln platziert |
| `Camera.main.WorldToScreenPoint` | Screen-Space-Elemente, die bewegten Weltpositionen folgen |

## Der Code

Diese Klasse erstellt ein festes HUD-Banner oben links und aktualisiert es sekündlich mit Weltstatistiken:

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

## Overlays im Weltraum

Soll ein Widget einer Einheit folgen, lasse es auf `CanvasMain` und rechne die 3D-Position der Einheit pro Frame in 2D-Bildschirmkoordinaten um:

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

Das garantiert gestochen scharfe Schriften bei jedem Zoomlevel ohne Kameraschwankungen :PESgn_Noice:.

## Typische Fallstricke

- **Canvas beim Laden nicht bereit**: `CanvasMain.instance` ist während `OnModLoad()` oft `null`. Initialisiere UI erst in `Update()`, wenn `Config.game_loaded` wahr ist.
- **Schriftarten**: Nutze `Resources.GetBuiltinResource<Font>("Arial.ttf")` oder übernimm `LocalizedText.default_font`.
- **Aufräumen bei Reload**: Zerstöre alte GameObjects vor dem Neuerstellen, damit sich Fenster bei Hot-Reloads nicht stapeln :aPES2_Sweat:.
