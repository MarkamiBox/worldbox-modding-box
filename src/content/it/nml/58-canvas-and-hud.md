---
title: UI e HUD personalizzati
group: Contenuto di gioco
subgroup: Poteri divini e UI
icon: :computer_emotiguy:
order: 208
---

# UI e HUD personalizzati :computer_emotiguy:

In **[Finestre personalizzate](#/nml/custom-windows)** abbiamo creato finestre modali che si aprono quando il giocatore clicca un pulsante sulla barra dei poteri. Ma alcune mod necessitano di un'interfaccia persistente a schermo: un contatore fisso, un indicatore su minimappa o una barra della salute fluttuante sopra la testa di una creatura.

Dato che WorldBox è sviluppato in Unity, i modder hanno pieno accesso al sistema di interfaccia grafica (`Canvas`, `RectTransform`, `Image` e `Text`). Questa pagina illustra come ancorare widget allo schermo o proiettarli nel mondo di gioco.

## La gerarchia della UI in Unity

Tutti gli elementi dell'interfaccia 2D risiedono sotto un `Canvas` di Unity. WorldBox mette a disposizione diversi canvas principali, ma il più idoneo per le mod è `CanvasMain`:

| Canvas | Quando utilizzarlo |
| --- | --- |
| `CanvasMain.instance` | UI ancorata allo spazio schermo (HUD, barre degli strumenti, contatori) |
| Canvas World Space | Posizionato direttamente nello spazio di gioco sopra caselle o unità |
| `Camera.main.WorldToScreenPoint` | Elementi a schermo che inseguono le posizioni mobili nel mondo |

## Il codice

Questa classe crea un riquadro HUD in alto a sinistra dello schermo e lo aggiorna ogni secondo con statistiche del mondo:

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

## Overlay nello spazio di gioco

Se vuoi che un indicatore segua un'unità a schermo (come un cursore o una barra della salute), non usare un canvas in coordinate del mondo. Mantieni invece il widget su `CanvasMain` e converti la posizione 3D dell'unità in coordinate 2D a ogni frame:

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

In questo modo la grafica rimane nitida a qualunque livello di zoom, senza distorsioni da ridimensionamento della telecamera :PESgn_Noice:.

## Errori comuni da evitare

- **Canvas non inizializzato al caricamento**: `CanvasMain.instance` è spesso `null` durante `OnModLoad()`. Inizializza gli elementi HUD al primo tick di `Update()` dopo che `Config.game_loaded` è `true`.
- **Font in Unity**: Usa `Resources.GetBuiltinResource<Font>("Arial.ttf")` oppure ricava il font da un componente di testo del gioco (`LocalizedText.default_font`).
- **Pulizia al ricaricamento**: Se usi l'hot-reload, distruggi i vecchi GameObject prima di ricrearli per evitare che si sovrappongano :aPES2_Sweat:.
