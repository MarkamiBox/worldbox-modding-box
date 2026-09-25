---
title: Interface e HUD personalizados
group: Conteúdo do jogo
subgroup: Poderes divinos e interface
icon: :computer_emotiguy:
order: 208
---

# Interface e HUD personalizados :computer_emotiguy:

Em **[Janelas personalizadas](#/nml/custom-windows)**, criamos painéis modais acionados por botões. No entanto, certos mods requerem elementos permanentes: contadores em tela, widgets de status ou barras de vida flutuantes sobre criaturas.

Como o WorldBox roda sobre a Unity, temos controle total sobre o sistema de interface (`Canvas`, `RectTransform`, `Image` e `Text`). Esta página ensina a fixar elementos na tela ou projetá-los sobre o cenário.

## A hierarquia de UI na Unity

Toda a interface 2D reside sob um `Canvas` da Unity. Para mods, o ponto de entrada ideal é o `CanvasMain`:

| Canvas | Quando utilizar |
| --- | --- |
| `CanvasMain.instance` | UI no espaço de tela (HUD, barras, contadores) |
| Canvas World Space | Posicionado diretamente no mundo tridimensional |
| `Camera.main.WorldToScreenPoint` | Elementos de tela que acompanham alvos móveis |

## O código

Esta classe cria um painel HUD no canto superior esquerdo e o atualiza a cada segundo:

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

## Sobreposições no espaço do mundo

Para rastrear uma unidade, mantenha o widget no `CanvasMain` e projete as coordenadas 3D para a tela a cada frame:

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

Isso mantém o texto nítido em qualquer nível de zoom sem distorções de escala :PESgn_Noice:.

## Armadilhas a evitar

- **Canvas ausente no início**: `CanvasMain.instance` costuma ser `null` durante `OnModLoad()`. Inicie elementos no método `Update()` após `Config.game_loaded`.
- **Fontes na Unity**: Recorra a `Resources.GetBuiltinResource<Font>("Arial.ttf")` ou aproveite `LocalizedText.default_font`.
- **Descarte em recargas**: Destrua GameObjects legados antes de recriá-los para evitar sobreposições :aPES2_Sweat:.
