---
title: Кастомные окна
group: Игровой контент
subgroup: Божественные силы и интерфейс
icon: :wbmonolith:
order: 204
---

# Кастомные окна :wbmonolith:

Рано или поздно одной кнопки становится мало, и вам требуется полноценная панель: список, несколько чисел, пара элементов управления. Есть два способа ее сделать, и неправильный выбор будет стоить вам целых выходных.

| Путь | Когда использовать |
| --- | --- |
| `ScrollWindow` | Вы хотите окно, которое выглядит и ведет себя в точности как ванильное, в привычном слоте |
| Свой собственный `Canvas` | Вам нужна плавающая, масштабируемая панель с поддержкой нескольких окон одновременно, для которой в игре нет аналогов |

## Взаимодействие с ванильными окнами

Игра хранит каждое окно в реестре по его id, и вы можете управлять ими из любой точки своего кода:

```csharp
ScrollWindow.showWindow("worldlaws");        // открыть окно
ScrollWindow.get("worldlaws");               // получить экземпляр
ScrollWindow.checkWindowExist("worldlaws");  // проверить, существует ли оно
ScrollWindow.isWindowActive();               // открыто ли *хоть какое-то* окно прямо сейчас
```

Последний метод важнее, чем кажется: если ваша божественная сила (GodPower) срабатывает по клику, обычно вы хотите, чтобы она ничего не делала, пока окно закрывает карту. Установка `unselect_when_window = true` на вашей `GodPower` перекладывает эту задачу на плечи самой игры.


## Нативный путь через ScrollWindow

Если вы хотите, чтобы ваша панель выглядела так, будто её сделала сама WorldBox, не собирайте canvas с нуля, как я в первый раз :PES2_Shrug:. В NeoModLoader есть `WindowCreator` и `AbstractWindow<T>` именно для того, чтобы вам не пришлось собирать полосы прокрутки, заголовки и кнопки закрытия из голых примитивов Unity.

Унаследуйтесь от `AbstractWindow<T>`, и пусть NML возьмёт на себя всю обвязку:

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

Создайте его один раз при инициализации мода:

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
```

`CreateAndInit()` клонирует префаб игры `"windows/empty"`, делает его дочерним к `CanvasMain.instance.transformWindows`, ставит ключ заголовка `"<windowId> Title"`, добавляет ваш компонент и регистрирует окно и в `ScrollWindow._all_windows`, и в `AssetManager.window_library`. Открывается оно той же одной строкой, что и ванильные окна:

```csharp
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

Если нужно больше места под огромную таблицу или многоколоночный менеджер, унаследуйтесь от `AbstractWideWindow<T>`. Оно ведёт себя так же, но по умолчанию имеет размер `600x280`, автоматически применяет широкую рамку и предоставляет `SetSize(new Vector2(width, height))`, если вашей раскладке нужно ещё больше места.

Если базовый класс `AbstractWindow<T>` вам вообще не нужен, вызовите `WindowCreator.CreateEmptyWindow(id, titleKey, icon)` напрямую и настройте возвращённый `ScrollWindow` сами. Забудете шаг регистрации при ручной сборке, и игра даже не узнает о существовании вашего окна при нажатии ESC :wbfacepalm:.

## Ваше собственное плавающее окно

Окно представляет собой `GameObject`, дочерний по отношению к UI-холсту игры. Вот его полный базовый скелет:

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

### Разбор кода

- **`CanvasMain.instance.canvas_ui`**: холст, на котором живет весь стандартный интерфейс игры. Сделайте родителем что-то другое, и ваше окно либо скроется под картой, либо проигнорирует масштаб интерфейса.
- **`overrideSorting` + `sortingOrder`**: окно получает собственный слой отрисовки. Большое число означает "поверх всего", что идеально подходит для панели, открытой игроком намеренно.
- **`GraphicRaycaster`**: компонент, благодаря которому клики мыши задерживаются вашим окном. Забудьте его - и каждый клик пролетит сквозь панель на карту, спавня существ прямо под вашим окном :pepeclown:.
- **`IDragHandler` на окне**: `OnDrag` делает `rect.anchoredPosition += eventData.delta`, так что панель можно схватить и перетащить куда угодно.
- **`HelloWindowResize` на угловой ручке**: перетаскивание правого нижнего угла пересчитывает ширину и высоту с минимумом `160f`, и игрок плавно меняет размер.
- **`sizeDelta`**: размер в единицах интерфейса. Начните с небольших значений. Панель, закрывающую половину экрана, игрок закроет первой.

## Стилизация под WorldBox

Плоский цветной прямоугольник сразу выдает наколеночный мод. Ванильные окна используют 9-slice спрайты, поэтому они растягиваются без размытия краев. Поместите PNG в папку `GameResources/ui/`, загрузите и нарежьте его:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // пикселей на единицу
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // рамка: слева, снизу, справа, сверху
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

А для текста используйте тот шрифт, который игра использует в текущий момент, чтобы панель органично смотрелась на любом языке:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## Вещи, которые понадобятся раньше, чем кажется

- **Перетаскивание (Dragging)**: небольшой `MonoBehaviour`, реализующий `IDragHandler` и сдвигающий `rect.anchoredPosition` на `eventData.delta`. Двадцать строк кода, превращающие раздражающую плашку в удобное окно.
- **Одно окно на объект**: если ваша панель показывает информацию об *одном существе*, создавайте отдельный экземпляр под каждое существо вместо одного общего переключаемого окна. Весь смысл наблюдения за двумя объектами в том, чтобы видеть их одновременно.
- **Очистка памяти**: вызывайте `Object.Destroy(root)`, когда окно закрывается навсегда, и сбрасывайте ссылки. Текстуры, созданные программно, тоже требуют `Destroy`, иначе память будет утекать при каждом открытии панели.

## Всплывающие подсказки (тултипы)

Тултипы в игре — это тоже ассеты в `AssetManager.tooltips`: ID и колбэк, заполняющий тултип данными при каждом открытии. Зарегистрируйте свой, и любой элемент интерфейса сможет показывать его с живыми числами. Игроки наводят курсор на всё подряд, так что именно здесь ваш мод тихо начинает выглядеть законченным.

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

`HelloWindow` вешает компонент `HelloTooltipTarget` на свой фон, поэтому при наведении курсора на панель всплывает подсказка. Метод `Tooltip.show()` принимает UI-объект, ID подсказки и экземпляр `TooltipData`, который передается в ваш колбэк: ванильная игра передает туда конкретного юнита, город или черту (trait). Стандартный тултип `"normal"` вообще не требует создания отдельного ассета — он просто выводит ключи `tip_name` и `tip_description`.

| Поле `TooltipAsset` | Что делает |
| --- | --- |
| `callback` | Наполняет тултип: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | Какой префаб тултипа использовать. По умолчанию `tooltips/tooltip_normal` |
| `callback_text_animated` | Вызывается повторно каждые 0.08 секунды, пока тултип открыт, для динамического текста |

## Горячая клавиша для окна

Клавиша для открытия вашей панели — это `HotkeyAsset`. Она нигде не отображается визуально, а при нажатии вызывает ваше действие.

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

> [!WARNING] Горячие клавиши связываются при запуске игры
> `HotkeyLibrary.linkAssets()` копирует каждое поле `default_key_*` в соответствующее `overridden_key_*` (клавишу, которую игра проверяет на самом деле) и формирует массив `action_hotkeys`, опрашиваемый каждый кадр. Оба действия происходят до загрузки модов. Пропустите эти шаги — и клавиша будет молча игнорироваться :wbfacepalm:.

Флаги `check_*` — удобный способ избежать конфликтов: `check_controls_locked` блокирует открытие окна во время прямого управления юнитом, а `check_window_not_active` — когда открыто стандартное игровое окно. Выбирайте свободные клавиши (например, F6) :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] Сначала подсмотрите в игре
> Откройте **UnityExplorer**, найдите стандартное окно в иерархии и посмотрите его компоненты и параметры. Скопировать готовую рабочую структуру в разы быстрее, чем три часа гадать с анкорами :PES2_GaSmart:.
