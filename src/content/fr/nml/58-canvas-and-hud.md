---
title: Interface et HUD personnalisés
group: Contenu du jeu
subgroup: Pouvoirs divins et interface
icon: :computer_emotiguy:
order: 208
---

# Interface et HUD personnalisés :computer_emotiguy:

Dans **[Fenêtres personnalisées](#/nml/custom-windows)**, nous avons créé des fenêtres modales. Cependant, certains mods exigent une interface permanente : compteurs à l'écran, jauges de vie au-dessus des unités ou indicateurs fixes.

Comme WorldBox repose sur Unity, vous disposez d'un accès complet à son système d'interface (`Canvas`, `RectTransform`, `Image` et `Text`). Cette page explique comment ancrer ces éléments à l'écran ou les projeter dans le monde.

## La hiérarchie d'interface Unity

Tout élément d'interface 2D vit sous un `Canvas` Unity. Le canvas principal exploité par les mods est `CanvasMain` :

| Canvas | Usage |
| --- | --- |
| `CanvasMain.instance` | Interface ancrée à l'écran (HUD, jauges, compteurs) |
| Canvas World Space | Placé directement dans l'univers de jeu |
| `Camera.main.WorldToScreenPoint` | Éléments d'écran poursuivant une cible en mouvement |

## Le code

Cette classe crée une bannière d'interface en haut à gauche et la rafraîchit chaque seconde avec les données du monde :

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

## Superpositions spatiales

Pour qu'un widget suive une créature, conservez-le sur `CanvasMain` et convertissez sa position 3D en coordonnées 2D à chaque image :

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

Cela garantit un affichage parfait à tous les niveaux de zoom sans distorsion :PESgn_Noice:.

## Pièges à éviter

- **Canvas indisponible au démarrage** : `CanvasMain.instance` est souvent `null` lors de `OnModLoad()`. Initialisez l'interface dans `Update()` après le chargement du jeu.
- **Polices d'écriture** : Utilisez `Resources.GetBuiltinResource<Font>("Arial.ttf")` ou récupérez `LocalizedText.default_font`.
- **Nettoyage au rechargement** : Lors d'un hot-reload, détruisez les anciens GameObjects pour éviter les duplications :aPES2_Sweat:.
