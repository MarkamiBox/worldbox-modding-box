---
title: UI y HUD personalizados
group: Contenido del juego
subgroup: Poderes divinos e interfaz
icon: :computer_emotiguy:
order: 208
---

# UI y HUD personalizados :computer_emotiguy:

En **[Ventanas personalizadas](#/nml/custom-windows)** construimos ventanas modales que se abren desde la barra de poderes. Sin embargo, algunos mods necesitan interfaz permanente: contadores en pantalla, indicadores de minimapa o barras de vida flotantes sobre las criaturas.

Dado que WorldBox está hecho en Unity, tienes acceso completo al sistema de UI (`Canvas`, `RectTransform`, `Image` y `Text`). Esta página explica cómo anclar elementos a la pantalla o proyectarlos sobre el mundo.

## La jerarquía de interfaz en Unity

Todos los elementos visuales 2D existen bajo un `Canvas` de Unity. WorldBox ofrece varios lienzos principales, pero el más útil para mods es `CanvasMain`:

| Canvas | Cuándo usarlo |
| --- | --- |
| `CanvasMain.instance` | Interfaz en espacio de pantalla (HUD, barras, contadores) |
| Canvas World Space | Colocado directamente en el mundo sobre casillas o unidades |
| `Camera.main.WorldToScreenPoint` | Elementos en pantalla que siguen posiciones móviles del mundo |

## El código

Esta clase crea un banner HUD permanente en la esquina superior izquierda y lo actualiza cada segundo:

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

## Superposiciones en el espacio del mundo

Si quieres que un widget siga a una unidad (como un marcador o barra de vida), no uses un Canvas en el mundo. Mantenlo en `CanvasMain` y proyecta las coordenadas 3D de la criatura a 2D en cada frame:

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

Así garantizas una interfaz nítida en cualquier nivel de zoom sin distorsiones de cámara :PESgn_Noice:.

## Errores comunes que debes evitar

- **El canvas no está listo al inicio**: `CanvasMain.instance` suele ser `null` durante `OnModLoad()`. Inicializa el HUD en `Update()` tras confirmarse `Config.game_loaded`.
- **Fuentes tipográficas**: Usa `Resources.GetBuiltinResource<Font>("Arial.ttf")` o toma prestada la fuente oficial mediante `LocalizedText.default_font`.
- **Limpieza en recargas**: Si usas recarga en vivo, destruye los GameObject antiguos antes de instanciar nuevos para evitar duplicados superpuestos :aPES2_Sweat:.
