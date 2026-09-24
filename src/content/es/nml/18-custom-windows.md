---
title: Ventanas personalizadas
group: Contenido del juego
subgroup: Poderes divinos e interfaz
icon: :wbmonolith:
order: 204
---

# Ventanas personalizadas :wbmonolith:

En algún momento un botón no es suficiente y quieres un panel real: una lista, algunos números, un par de controles. Hay dos formas de conseguirlo, y elegir la equivocada te costará un fin de semana entero.

| Ruta | Cuándo usarla |
| --- | --- |
| `ScrollWindow` | Quieres una ventana que se vea y se comporte exactamente como una vainilla, en la ranura vainilla |
| Tu propio `Canvas` | Quieres un panel flotante, redimensionable y múltiple para el cual el juego base no tiene equivalente |

## Comunicarse con las ventanas vainilla

El juego guarda cada ventana en un registro indexado por id, y puedes controlarlas desde cualquier parte:

```csharp
ScrollWindow.showWindow("worldlaws");        // abrir una
ScrollWindow.get("worldlaws");               // obtener la instancia
ScrollWindow.checkWindowExist("worldlaws");  // comprobar si existe
ScrollWindow.isWindowActive();               // si hay *alguna* ventana abierta ahora mismo
```

Esta última importa más de lo que parece: si tu poder divino hace algo al hacer clic, normalmente quieres que no haga nada mientras una ventana esté cubriendo el mapa. Poner `unselect_when_window = true` en tu `GodPower` le pasa ese problema al juego.

## Tu propia ventana flotante

Una ventana es un `GameObject` cuyo padre es el canvas de la interfaz del juego. Este es el esqueleto completo:

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

### Desglosando el código

- **`CanvasMain.instance.canvas_ui`**: el canvas en el que vive la propia interfaz del juego. Si lo emparentas con cualquier otra cosa, tu ventana se esconderá tras el mapa o ignorará la escala de la interfaz.
- **`overrideSorting` + `sortingOrder`**: tu ventana obtiene su propia capa. Un número alto significa "por encima de todo", que es lo que quieres para un panel que el jugador abrió a propósito.
- **`GraphicRaycaster`**: el componente que hace que los clics aterricen en tu ventana. Si lo omites, cada clic atravesará el panel y caerá en el mapa, generando unidades detrás de tu propia ventana :pepeclown:.
- **`IDragHandler` en la ventana**: `OnDrag` actualiza `rect.anchoredPosition += eventData.delta`, así puedes pinchar y mover el panel a cualquier parte de la pantalla.
- **`HelloWindowResize` en la esquina**: arrastrar la esquina inferior derecha calcula el nuevo ancho y alto, con un mínimo de `160f`, para que el jugador lo redimensione sin tirones.
- **`sizeDelta`**: el tamaño en unidades de UI. Empieza pequeño. Un panel que tapa todo el mapa es un panel que el jugador cerrará de inmediato.

## Hacer que parezca WorldBox

Un rectángulo plano grita "mod" a leguas. El arte de las ventanas del juego usa 9-slice para estirarse sin desenfocarse. Pon el PNG en tu carpeta `GameResources/ui/`, cárgalo y aplícale las divisiones:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // píxeles por unidad
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // borde izquierdo, inferior, derecho, superior
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

Y para el texto, usa la fuente que el juego ya está usando, para que tu panel encaje con cualquier idioma cargado:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Cosas que vas a necesitar antes de lo que crees

- **Arrastre (Dragging)**: un pequeño `MonoBehaviour` que implemente `IDragHandler` y desplace `rect.anchoredPosition` según `eventData.delta`. Veinte líneas que marcan la diferencia entre un panel cómodo y un estorbo.
- **Una ventana por sujeto**: si tu panel muestra información sobre *una criatura*, crea una instancia por cada una en lugar de un panel único compartido que va cambiando. Toda la gracia de vigilar dos cosas es poder mirarlas al mismo tiempo.
- **Limpieza**: `Object.Destroy(root)` cuando la ventana se cierre para siempre, y limpia tus referencias. Las texturas que hayas creado tú mismo también necesitan `Destroy`, o tendrás fugas de memoria cada vez que el jugador abra el panel.

## Tooltips

Los tooltips del juego también son assets en `AssetManager.tooltips`: un ID y un callback que rellena el tooltip cada vez que se abre. Registra el tuyo y cualquier elemento de la interfaz podrá mostrarlo con números en tiempo real. Los jugadores pasan el ratón por encima de todo, así que aquí es donde tu mod parece terminado sin hacer ruido.

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

`HelloWindow` añade un `HelloTooltipTarget` a su fondo, por lo que pasar el ratón por encima del panel lo muestra. `Tooltip.show()` recibe el GameObject al que pertenece, el ID del tooltip y un objeto `TooltipData` que recibe tu callback: el juego vanilla pasa ahí la unidad, ciudad o rasgo correspondiente. El tooltip `"normal"` no necesita ningún asset propio, solo muestra `tip_name` y `tip_description` como claves de texto.

| Campo de `TooltipAsset` | Qué hace |
| --- | --- |
| `callback` | Rellena el tooltip: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Qué diseño de tooltip usar. El valor por defecto es `tooltips/tooltip_normal` |
| `callback_text_animated` | Se vuelve a llamar cada 0.08 segundos mientras está abierto, para texto dinámico |

## Un atajo de teclado para la ventana

Una tecla que abre tu panel es un `HotkeyAsset`. No aparece en ninguna parte hasta que se pulsa, momento en el que invoca tu acción.

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

> [!WARNING] Los atajos se configuran en el inicio del juego
> `HotkeyLibrary.linkAssets()` copia cada `default_key_*` en el correspondiente `overridden_key_*` (la tecla que el juego comprueba realmente) y construye `action_hotkeys`, la única lista que sondea en cada frame. Ambas cosas ocurren antes de que cargue tu mod. Omitir cualquiera de ellas hace que la tecla no haga nada, en silencio :wbfacepalm:.

Los modificadores `check_*` son la forma sencilla de evitar molestias: `check_controls_locked` evita que se active mientras el jugador pilota una unidad, y `check_window_not_active` mientras una ventana del juego esté abierta. Elige una tecla libre en el juego original. F6 es una opción; otros mods podrían diferir :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Copia del juego primero
> Abre **UnityExplorer**, busca una ventana vanilla en la jerarquía e inspecciona sus componentes y valores. Copiar una estructura que ya funciona ahorra tres horas de adivinar anclajes :PES2_GaSmart:.
