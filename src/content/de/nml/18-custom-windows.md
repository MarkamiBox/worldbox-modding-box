---
title: Eigene Fenster
group: Spielinhalte
subgroup: Göttliche Kräfte & UI
icon: :wbmonolith:
order: 204
---

# Eigene Fenster :wbmonolith:

Irgendwann reicht ein Button nicht mehr aus und du willst ein echtes Panel: eine Liste, ein paar Zahlen, ein paar Steuerelemente. Es gibt zwei Wege, um eines zu bekommen, und den falschen zu wählen, kostet dich ein ganzes Wochenende.

| Weg | Verwende ihn, wenn |
| --- | --- |
| `ScrollWindow` | Du ein Fenster willst, das genau wie ein Vanilla-Fenster aussieht und sich verhält, im Vanilla-Slot |
| Dein eigenes `Canvas` | Du ein schwebendes, skalierbares Mehrfachfenster willst, für das Vanilla kein Äquivalent hat |

## Mit Vanilla-Fenstern interagieren

Das Spiel führt jedes Fenster in einer Registry, verschlüsselt über eine ID, und du kannst sie von überall aus ansteuern:

```csharp
ScrollWindow.showWindow("worldlaws");        // eines öffnen
ScrollWindow.get("worldlaws");               // Instanz abrufen
ScrollWindow.checkWindowExist("worldlaws");  // prüfen, ob es überhaupt existiert
ScrollWindow.isWindowActive();               // prüfen, ob *irgendein* Fenster gerade offen ist
```

Der letzte Punkt ist wichtiger, als es scheint: Wenn deine Gotteskraft beim Klick etwas tut, willst du meistens, dass sie nichts tut, solange ein Fenster die Karte verdeckt. Das Setzen von `unselect_when_window = true` an deiner `GodPower` überträgt dieses Problem direkt an das Spiel.


## Der native ScrollWindow-Weg

Wenn dein Panel aussehen soll, als hätte WorldBox es gebaut, bau kein Canvas von Grund auf, wie ich es beim ersten Versuch gemacht habe :PES2_Shrug:. NeoModLoader bringt `WindowCreator` und `AbstractWindow<T>` genau dafür mit, damit du Scrollleisten, Titelleisten und Schließen-Buttons nicht aus rohen Unity-Bausteinen zusammensetzen musst.

Leite von `AbstractWindow<T>` ab und lass NML die Verkabelung übernehmen:

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

Erstelle es einmal während der Initialisierung der Mod:

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
```

`CreateAndInit()` klont das `"windows/empty"`-Prefab des Spiels, hängt es an `CanvasMain.instance.transformWindows`, setzt den Titelschlüssel auf `"<windowId> Title"`, fügt deine Komponente hinzu und registriert das Fenster sowohl in `ScrollWindow._all_windows` als auch in `AssetManager.window_library`. Öffnen ist dieselbe einzelne Zeile wie bei Vanilla-Fenstern:

```csharp
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

Wenn du mehr Platz für eine riesige Tabelle oder einen mehrspaltigen Manager brauchst, leite stattdessen von `AbstractWideWindow<T>` ab. Es verhält sich genauso, startet aber mit `600x280`, nutzt automatisch den breiten Rahmen und bietet `SetSize(new Vector2(width, height))`, falls dein Layout noch mehr Platz braucht.

Wenn du die Basisklasse `AbstractWindow<T>` gar nicht willst, ruf `WindowCreator.CreateEmptyWindow(id, titleKey, icon)` direkt auf und konfiguriere das zurückgegebene `ScrollWindow` selbst. Vergiss bei der Handarbeit den Registrierungsschritt, und das Spiel weiß nicht einmal, dass dein Fenster existiert, wenn ESC gedrückt wird :wbfacepalm:.

## Dein eigenes schwebendes Fenster

Ein Fenster ist ein `GameObject`, dessen übergeordnetes Element (Parent) der UI-Canvas des Spiels ist. Hier ist das komplette Gerüst:

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

### Den Code aufschlüsseln

- **`CanvasMain.instance.canvas_ui`**: Der Canvas, auf dem die spielinterne Benutzeroberfläche lebt. Wenn du es an etwas anderes anhängst, versteckt sich dein Fenster entweder hinter der Karte oder ignoriert die UI-Skalierung.
- **`overrideSorting` + `sortingOrder`**: Dein Fenster bekommt seine eigene Ebene. Eine hohe Zahl bedeutet "über allem anderen", was genau das ist, was du für ein vom Spieler bewusst geöffnetes Panel willst.
- **`GraphicRaycaster`**: Die Komponente, die dafür sorgt, dass Klicks auf deinem Fenster landen. Lässt du sie weg, fällt jeder Klick auf die Karte durch und spawnt Einheiten hinter deinem eigenen Panel :pepeclown:.
- **`IDragHandler` am Fenster**: `OnDrag` setzt `rect.anchoredPosition += eventData.delta`, also kannst du das Panel anklicken und überall auf dem Bildschirm hinschieben.
- **`HelloWindowResize` am Eck-Griff**: Ziehen an der unteren rechten Ecke berechnet neue Breite und Höhe, begrenzt auf `160f`, damit der Spieler es sauber vergrößern kann.
- **`sizeDelta`**: Die Größe in UI-Einheiten. Fang klein an. Ein Panel, das die Karte komplett verdeckt, schließt der Spieler sofort.

## Lass es wie WorldBox aussehen

Ein flaches Rechteck schreit regelrecht nach "Mod". Die Grafiken der Vanilla-Fenster nutzen 9-Slice, damit sie sich ohne Unschärfe dehnen lassen. Lege das PNG in deinen Ordner `GameResources/ui/`, lade es und schneide es zurecht:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // Pixel pro Einheit
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // linker, unterer, rechter, oberer Rand
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

Und für Text verwendest du am besten die Schriftart, die das Spiel ohnehin nutzt, damit dein Panel zu jeder geladenen Sprache passt:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Dinge, die du früher brauchen wirst, als du denkst

- **Ziehen (Dragging)**: Ein kleines `MonoBehaviour`, das `IDragHandler` implementiert und `rect.anchoredPosition` um `eventData.delta` verschiebt. Zwanzig Zeilen, die den Unterschied zwischen einem nützlichen Panel und einer Nervensäge ausmachen.
- **Ein Fenster pro Subjekt**: Wenn dein Panel Informationen über *eine Einheit* anzeigt, baue eine Instanz pro Einheit anstelle eines einzigen geteilten Panels, das umschaltet. Der ganze Sinn, zwei Dinge zu beobachten, besteht darin, sie gleichzeitig zu beobachten.
- **Aufräumen**: `Object.Destroy(root)`, wenn das Fenster endgültig geschlossen wird, und löse deine Referenzen auf. Texturen, die du selbst erstellt hast, brauchen ebenfalls ein `Destroy`, sonst erzeugst du jedes Mal ein Speicherleck, wenn der Spieler das Panel öffnet.

## Tooltips

Die Tooltips des Spiels sind ebenfalls Assets in `AssetManager.tooltips`: eine ID und ein Callback, der den Tooltip bei jedem Öffnen mit Daten befüllt. Registriere deinen eigenen und jedes beliebige UI-Element kann ihn mit dynamischen Echtzeit-Zahlen anzeigen. Spieler fahren mit der Maus über alles, also sieht deine Mod genau hier leise fertig aus.

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

`HelloWindow` fügt seiner Hintergrundebene eine `HelloTooltipTarget`-Komponente hinzu, sodass er beim Überfahren mit der Maus sichtbar wird. `Tooltip.show()` erwartet das zugehörige GameObject, die Tooltip-ID und ein `TooltipData`-Objekt, das dein Callback empfängt. Das Hauptspiel übergibt darin beispielsweise die betreffende Einheit, Stadt oder das Merkmal. Der Standard-Tooltip `"normal"` benötigt kein eigenes Asset, sondern liest direkt `tip_name` und `tip_description` aus den Textschlüsseln aus.

| Feld in `TooltipAsset` | Was es bewirkt |
| --- | --- |
| `callback` | Befüllt den Tooltip: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Welches Tooltip-Layout verwendet wird. Standard ist `tooltips/tooltip_normal` |
| `callback_text_animated` | Wird während der Anzeige alle 0,08 Sekunden erneut aufgerufen, für animierte Texte |

## Ein Hotkey dafür

Eine Taste zum Öffnen deines Fensters ist ein `HotkeyAsset`. Sie erscheint nirgends im Interface, bis sie gedrückt wird, woraufhin deine Action aufgerufen wird.

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

> [!WARNING] Hotkeys werden beim Spielstart verdrahtet
> `HotkeyLibrary.linkAssets()` kopiert jedes `default_key_*` in das entsprechende `overridden_key_*` (die Taste, die das Spiel tatsächlich prüft) und erstellt `action_hotkeys`, die einzige Liste, die in jedem Frame abgefragt wird. Beides passiert vor dem Laden deiner Mod. Wenn du eines davon auslässt, bleibt die Taste stumm und wirkungslos :wbfacepalm:.

Die `check_*`-Flags sind der einfachste Weg, Konflikte zu vermeiden: `check_controls_locked` verhindert das Auslösen, während der Spieler eine Einheit steuert, `check_window_not_active`, während ein vanilla Spielfenster geöffnet ist. Wähle eine Taste, die das Hauptspiel nicht nutzt – F6 ist eine solche; andere Mods könnten das anders handhaben :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Kopiere zuerst aus dem Spiel
> Öffne **UnityExplorer**, suche ein vanilla Fenster in der Hierarchie und lies die Komponenten und Werte direkt ab. Eine funktionierende Struktur zu kopieren ist unendlich besser, als drei Stunden lang Ankerpunkte zu erraten :PES2_GaSmart:.
