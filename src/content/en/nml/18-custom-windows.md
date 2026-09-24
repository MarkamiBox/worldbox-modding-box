---
title: Custom windows
group: Game Content
subgroup: God Powers & UI
icon: :wbmonolith:
order: 204
---

# Custom windows :wbmonolith:

At some point a button is not enough and you want a real panel: a list, some numbers, a couple of controls. There are two ways to get one, and picking the wrong one costs you a weekend.

| Route | Use it when |
| --- | --- |
| `ScrollWindow` | You want a window that looks and behaves exactly like a vanilla one, in the vanilla slot |
| Your own `Canvas` | You want a floating, resizable, multiple-at-once panel that vanilla has no equivalent for |

## Talking to the vanilla windows

The game keeps every window in a registry, keyed by id, and you can drive them from anywhere:

```csharp
ScrollWindow.showWindow("worldlaws");        // open one
ScrollWindow.get("worldlaws");               // grab the instance
ScrollWindow.checkWindowExist("worldlaws");  // does it exist at all
ScrollWindow.isWindowActive();               // is *any* window open right now
```

That last one matters more than it looks: if your god power does something on click, you usually want it to do nothing while a window is covering the map. Setting `unselect_when_window = true` on your `GodPower` hands that problem to the game.

## Your own floating window

A window is a `GameObject` parented to the game's UI canvas. This is the whole skeleton:

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

### Breaking down the code

- **`CanvasMain.instance.canvas_ui`**: the canvas the game's own interface lives on. Parent to anything else and your window either hides behind the map or ignores the UI scale.
- **`overrideSorting` + `sortingOrder`**: your window gets its own layer. A big number means "on top of everything", which is what you want for a panel the player opened on purpose.
- **`GraphicRaycaster`**: the component that makes clicks land on your window. Leave it out and every click falls through onto the map, spawning units behind your own panel :pepeclown:.
- **`IDragHandler` on the window**: `OnDrag` updates `rect.anchoredPosition += eventData.delta` so you can click and move the panel anywhere on screen.
- **`HelloWindowResize` on the corner grip**: dragging the bottom-right corner calculates new width and height clamped at `160f`, letting the player resize smoothly.
- **`sizeDelta`**: the size in UI units. Start small. A panel that covers the map is a panel the player closes.

## Making it look like WorldBox

A flat rectangle screams "mod". The game's own window art is nine-sliced, so it stretches without blurring. Put the PNG in your `GameResources/ui/` folder, load it, and slice it:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // pixels per unit
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // left, bottom, right, top border
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

And for text, use the font the game is already using, so your panel matches whatever language is loaded:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Things you will want sooner than you think

- **Dragging**: a small `MonoBehaviour` implementing `IDragHandler` that moves `rect.anchoredPosition` by `eventData.delta`. Twenty lines, and the difference between a panel and a nuisance.
- **One window per subject**: if your panel shows information about *a unit*, build one instance per unit instead of one shared panel that switches. The whole point of watching two things is watching them at the same time.
- **Clean up**: `Object.Destroy(root)` when the window closes for good, and drop your references. Textures you created yourself need `Destroy` too, or you leak them every time the player opens the panel.

## Tooltips

The game's tooltips are assets too, in `AssetManager.tooltips`: an id, and a callback that fills the tooltip each time it opens. Register your own and any UI object can show it, with live numbers in it. Players hover everything, so this is where your mod quietly looks finished.

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

`HelloWindow` puts a `HelloTooltipTarget` on its background, so hovering the panel shows it. `Tooltip.show()` takes the object it belongs to, the tooltip id, and a `TooltipData` your callback receives: vanilla passes the unit, city or trait it is about in there. The `"normal"` tooltip needs no asset of your own at all, it just shows `tip_name` and `tip_description` as text keys.

| `TooltipAsset` field | What it does |
| --- | --- |
| `callback` | Fills the tooltip: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Which tooltip layout to use. The default is `tooltips/tooltip_normal` |
| `callback_text_animated` | Called again every 0.08 seconds while it is open, for text that changes |

## A hotkey for it

A key that opens your panel is a `HotkeyAsset`. It shows up nowhere until it is pressed, and pressing it calls your action.

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

> [!WARNING] Hotkeys are wired at startup
> `HotkeyLibrary.linkAssets()` copies each `default_key_*` into the matching `overridden_key_*`, which is the key the game actually checks, and builds `action_hotkeys`, the only list it polls every frame. Both happen before your mod loads. Skip either and the key does nothing, silently :wbfacepalm:.

The `check_*` flags are the cheap way to stay out of the way: `check_controls_locked` keeps it quiet while the player steers a unit, `check_window_not_active` while a vanilla window is open. Pick a key vanilla leaves alone. F6 is one; other mods may disagree :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Steal from the game first
> Open **UnityExplorer**, find a vanilla window in the hierarchy, and read the components and values off it. Copying a structure that already works beats guessing at anchors for three hours :PES2_GaSmart:.
