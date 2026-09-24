---
title: Finestre personalizzate
group: Contenuto di gioco
subgroup: Poteri divini e UI
icon: :wbmonolith:
order: 204
---

# Finestre personalizzate :wbmonolith:

A un certo punto un pulsante non basta più e desideri un vero pannello: un elenco, qualche numero, un paio di comandi. Ci sono due strade per ottenerne uno, e scegliere quella sbagliata ti costerà un fine settimana.

| Percorso | Quando usarlo |
| --- | --- |
| `ScrollWindow` | Vuoi una finestra identica a quelle vanilla per aspetto e comportamento, nel consueto slot |
| Il tuo `Canvas` | Vuoi un pannello fluttuante, ridimensionabile e multiplo per cui il gioco base non offre equivalenti |

## Interagire con le finestre vanilla

Il gioco conserva ogni finestra in un registro indicizzato per id, e puoi pilotarle da qualsiasi punto del codice:

```csharp
ScrollWindow.showWindow("worldlaws");        // aprirne una
ScrollWindow.get("worldlaws");               // ottenere l'istanza
ScrollWindow.checkWindowExist("worldlaws");  // verificare se esiste
ScrollWindow.isWindowActive();               // verificare se c'è *una* finestra qualsiasi aperta
```

Quest'ultimo controllo è più importante di quanto sembri: se il tuo potere divino compie un'azione al clic, di solito preferisci che non faccia nulla mentre una finestra sta coprendo la mappa. Impostare `unselect_when_window = true` nel tuo `GodPower` affida questo problema direttamente al gioco.

## La via nativa con ScrollWindow

Se vuoi che la tua finestra sembri fatta direttamente da WorldBox, non creare un Canvas da zero :PES2_Shrug:. NeoModLoader include `WindowCreator` e `AbstractWindow<T>`.

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
            GameObject labelObj = new GameObject("Text", typeof(Text));
            labelObj.transform.SetParent(ContentTransform, false);

            Text label = labelObj.GetComponent<Text>();
            label.font = LocalizedTextManager.current_font;
            label.fontSize = 12;
            label.text = "Hello from a native window!";
        }

        public override void OnFirstEnable() {}
        public override void OnNormalEnable() {}
        public override void OnNormalDisable() {}
    }
}
```

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

Per i layout ampi estendi `AbstractWideWindow<T>`, oppure chiama `WindowCreator.CreateEmptyWindow(id, titleKey, icon)`. Dimentica la registrazione e il gioco non saprà che esiste :wbfacepalm:.

## La tua finestra mobile personale

Una finestra è un `GameObject` associato come figlio al canvas dell'interfaccia di gioco. Questo è lo scheletro essenziale:

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

### Analisi del codice

- **`CanvasMain.instance.canvas_ui`**: il canvas in cui risiede l'interfaccia del gioco. Imposta come genitore qualsiasi altra cosa e la tua finestra finirà nascosta dietro la mappa o ignorerà la scala dell'UI.
- **`overrideSorting` + `sortingOrder`**: la finestra ottiene un proprio livello di rendering. Un numero elevato significa "in primo piano su tutto", che è esattamente ciò che vuoi per un pannello aperto deliberatamente dal giocatore.
- **`GraphicRaycaster`**: il componente che permette ai clic di atterrare sulla finestra. Tralascialo e ogni clic trapasserà il pannello atterrando sulla mappa, generando unità dietro la tua finestra :pepeclown:.
- **`IDragHandler` sulla finestra**: `OnDrag` aggiorna `rect.anchoredPosition += eventData.delta`, permettendo di cliccare e trascinare il pannello liberamente sullo schermo.
- **`HelloWindowResize` sulla maniglia d'angolo**: trascinando l'angolo in basso a destra, ricalcola larghezza e altezza con limite minimo a `160f`, consentendo un ridimensionamento fluido.
- **`sizeDelta`**: la dimensione in unità UI. Inizia con valori contenuti. Un pannello che copre l'intera mappa è un pannello che il giocatore chiuderà all'istante.

## Farlo sembrare in perfetto stile WorldBox

Un rettangolo a tinta unita tradisce subito la mod amatoriale. La grafica delle finestre originali impiega il 9-slice per allungarsi senza sgranare. Metti il PNG nella tua cartella `GameResources/ui/`, caricalo e definisci i bordi:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // pixel per unità
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // bordo sinistro, inferiore, destro, superiore
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

E per il testo, usa il font attualmente in uso nel gioco, così che il pannello si adatti armoniosamente a qualsiasi lingua attiva:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Cose di cui avrai bisogno prima di quanto pensi

- **Trascinamento (Dragging)**: un piccolo `MonoBehaviour` che implementa `IDragHandler` e sposta `rect.anchoredPosition` in base a `eventData.delta`. Venti righe che fanno la differenza tra un pannello gradevole e un autentico fastidio.
- **Una finestra per soggetto**: se il pannello mostra dettagli su *un'unità*, crea un'istanza per ciascuna unità invece di un unico pannello condiviso che si aggiorna. Il vantaggio di monitorare due elementi è poterli osservare contemporaneamente.
- **Pulizia**: chiama `Object.Destroy(root)` quando la finestra viene chiusa definitivamente e annulla i riferimenti. Anche le texture create a runtime richiedono `Destroy`, altrimenti causerai perdite di memoria a ogni apertura.

## Tooltip

Anche i tooltip del gioco sono asset in `AssetManager.tooltips`: un ID e una callback che compila il tooltip ogni volta che viene aperto. Registrane uno personalizzato e qualsiasi elemento UI potrà visualizzarlo con numeri in tempo reale. I giocatori passano il mouse su tutto, quindi è qui che la tua mod sembra finita senza fare rumore.

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

`HelloWindow` applica un `HelloTooltipTarget` al suo sfondo, quindi passando il mouse sul pannello viene mostrato il tooltip. `Tooltip.show()` accetta il GameObject di appartenenza, l'ID del tooltip e un oggetto `TooltipData` che la tua callback riceve: il gioco vanilla vi inserisce l'unità, la città o il tratto a cui si riferisce. Il tooltip `"normal"` non richiede alcun asset personalizzato, mostra direttamente `tip_name` e `tip_description` come chiavi di testo.

| Campo di `TooltipAsset` | Cosa fa |
| --- | --- |
| `callback` | Compila il tooltip: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Quale layout di tooltip utilizzare. Il default è `tooltips/tooltip_normal` |
| `callback_text_animated` | Chiamato nuovamente ogni 0.08 secondi mentre è aperto, per testi dinamici |

## Una scorciatoia da tastiera

Un tasto che apre il tuo pannello è un `HotkeyAsset`. Non compare da nessuna parte finché non viene premuto, momento in cui richiama la tua action.

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

> [!WARNING] Le scorciatoie sono collegate all'avvio del gioco
> `HotkeyLibrary.linkAssets()` copia ogni `default_key_*` nel corrispondente `overridden_key_*` (il tasto che il gioco controlla effettivamente) e crea `action_hotkeys`, l'unico elenco esaminato a ogni frame. Entrambi i passaggi avvengono prima del caricamento del tuo mod. Saltare uno dei due rende il tasto inattivo, senza alcun errore :wbfacepalm:.

I flag `check_*` sono il modo più rapido per evitare interferenze: `check_controls_locked` impedisce l'attivazione mentre il giocatore manovra un'unità, `check_window_not_active` mentre una finestra vanilla è aperta. Scegli un tasto non utilizzato dal gioco base. F6 è uno di questi; altri mod potrebbero utilizzarlo :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Copia prima dal gioco
> Apri **UnityExplorer**, individua una finestra vanilla nella gerarchia e leggi i componenti e i valori. Copiare una struttura già funzionante è infinitamente meglio che tirare a indovinare con gli ancoraggi per tre ore :PES2_GaSmart:.
