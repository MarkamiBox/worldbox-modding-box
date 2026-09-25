---
title: 커스텀 창
group: 게임 콘텐츠
subgroup: 신의 힘 및 UI
icon: :wbmonolith:
order: 204
---

# 커스텀 창 :wbmonolith:

버튼 하나로는 부족해 목록이나 수치, 컨트롤 스위치가 달린 제대로 된 패널이 필요한 순간이 찾아옵니다. 창을 구현하는 데는 두 가지 방법이 있으며, 잘못 선택하면 주말 전체를 날리게 됩니다.

| 방식 | 추천 상황 |
| --- | --- |
| `ScrollWindow` | 바닐라 전용 창 슬롯에서 바닐라와 완전히 똑같이 생기고 동작하는 창을 원할 때 |
| 커스텀 `Canvas` | 바닐라에 없는, 자유롭게 떠다니고 크기 조절이 가능하며 여러 개를 동시에 띄울 수 있는 패널을 원할 때 |

## 바닐라 창과 상호작용하기

게임은 모든 창을 고유 id를 키로 하는 레지스트리에 보관하므로, 코드 어디서든 손쉽게 조작할 수 있습니다:

```csharp
ScrollWindow.showWindow("worldlaws");        // 창 열기
ScrollWindow.get("worldlaws");               // 창 인스턴스 가져오기
ScrollWindow.checkWindowExist("worldlaws");  // 해당 창이 존재하는지 확인
ScrollWindow.isWindowActive();               // 현재 열려 있는 창이 *하나라도* 있는지 확인
```

마지막 메서드는 겉보기보다 훨씬 중요합니다. 여러분의 신의 권능이 클릭 시 무언가를 발동한다면, 창이 맵을 가리고 있는 동안에는 아무 일도 일어나지 않아야 안전합니다. `GodPower` 에 `unselect_when_window = true` 를 설정해 두면 게임 엔진이 알아서 처리해 줍니다.


## 네이티브 ScrollWindow 방식

패널이 WorldBox가 직접 만든 것처럼 보이길 원한다면, 제가 첫 시도에서 그랬던 것처럼 canvas를 처음부터 만들지 마세요 :PES2_Shrug:. NeoModLoader에는 스크롤바, 제목 표시줄, 닫기 버튼을 Unity 기본 요소로 조립할 필요가 없도록 `WindowCreator`와 `AbstractWindow<T>`가 들어 있습니다.

`AbstractWindow<T>`를 상속하고 배관 작업은 NML에 맡기세요:

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

모드 초기화 중에 한 번만 생성하세요:

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
```

`CreateAndInit()`은 게임의 `"windows/empty"` 프리팹을 복제해 `CanvasMain.instance.transformWindows`의 자식으로 붙이고, 제목 키를 `"<windowId> Title"`로 설정하고, 여러분의 컴포넌트를 붙인 뒤, 창을 `ScrollWindow._all_windows`와 `AssetManager.window_library` 양쪽에 등록합니다. 여는 것은 바닐라 창과 똑같은 한 줄입니다:

```csharp
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

거대한 표나 여러 열짜리 관리 화면 때문에 화면 공간이 더 필요하다면, 대신 `AbstractWideWindow<T>`를 상속하세요. 동작은 같지만 기본 크기가 `600x280`이고, 넓은 테두리가 자동으로 적용되며, 레이아웃에 공간이 더 필요하면 `SetSize(new Vector2(width, height))`도 쓸 수 있습니다.

`AbstractWindow<T>` 기본 클래스를 아예 원하지 않는다면, `WindowCreator.CreateEmptyWindow(id, titleKey, icon)`을 직접 호출하고 반환된 `ScrollWindow`를 직접 설정하세요. 직접 할 때 등록 단계를 잊으면, ESC를 눌렀을 때 게임은 여러분의 창이 존재하는지조차 모릅니다 :wbfacepalm:.

## 나만의 플로팅 창 만들기

창은 게임 UI 캔버스를 부모로 두는 `GameObject` 입니다. 다음이 가장 기초적인 전체 골격입니다:

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

### 코드 뜯어보기

- **`CanvasMain.instance.canvas_ui`**: 게임 자체 인터페이스가 위치하는 캔버스입니다. 다른 곳에 부모를 연결하면 창이 맵 뒤로 숨어버리거나 UI 스케일링 설정이 무시됩니다.
- **`overrideSorting` + `sortingOrder`**: 창에 독립적인 렌더링 계층을 부여합니다. 높은 숫자는 "모든 것의 맨 위"를 의미하며, 플레이어가 직접 열어본 패널에 꼭 필요한 설정입니다.
- **`GraphicRaycaster`**: 클릭 이벤트가 창에 걸리도록 만드는 핵심 컴포넌트입니다. 빼먹으면 패널을 누를 때마다 클릭이 그대로 맵으로 뚫고 들어가 패널 뒤에 유닛을 소환하게 됩니다 :pepeclown:.
- **창의 `IDragHandler`**: `OnDrag` 가 `rect.anchoredPosition += eventData.delta` 를 하므로, 패널을 클릭해서 화면 어디로든 옮길 수 있습니다.
- **모서리 손잡이의 `HelloWindowResize`**: 오른쪽 아래 모서리를 끌면 새 너비와 높이를 `160f` 하한으로 계산해서, 플레이어가 부드럽게 크기를 바꿉니다.
- **`sizeDelta`**: UI 단위 크기입니다. 일단 작게 시작하세요. 맵 전체를 덮어버리는 창은 플레이어가 가장 먼저 닫아버리는 창입니다.

## WorldBox 스타일로 만들기

단색의 밋밋한 직사각형은 "모드 티"를 풀풀 풍깁니다. 게임 바닐라 창 리소스는 9-슬라이스(9-slice) 처리되어 있어 크기를 늘려도 모서리가 뭉개지지 않습니다. PNG 이미지를 `GameResources/ui/` 폴더에 넣고 로드한 뒤 슬라이스 여백을 지정하세요:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // pixels per unit
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // 좌, 하, 우, 상 여백
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

텍스트에는 게임이 이미 사용 중인 폰트를 가져다 쓰면 현재 언어 설정과 완벽히 어우러집니다:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## 생각보다 금방 필요해질 기능들

- **드래그 이동**: `IDragHandler` 를 구현하여 `eventData.delta` 만큼 `rect.anchoredPosition` 을 이동시키는 작은 `MonoBehaviour` 를 추가하세요. 스무 줄이면 답답한 고정 패널이 쾌적한 창으로 변합니다.
- **대상마다 독립된 창**: *특정 유닛*의 정보를 보여주는 창이라면 하나로 돌려쓰지 말고 유닛마다 개별 인스턴스를 띄우세요. 두 대상을 관찰하려는 이유는 동시에 비교해 보고 싶기 때문입니다.
- **메모리 정리**: 창을 완전히 닫을 때는 `Object.Destroy(root)` 를 호출하고 참조를 해제하세요. 코드로 직접 생성한 텍스처 역시 `Destroy` 해주지 않으면 창을 열 때마다 메모리가 줄줄 새어나갑니다.

## 툴팁

게임의 툴팁 역시 `AssetManager.tooltips`에 속한 에셋입니다: ID와 툴팁이 열릴 때마다 내용을 채우는 콜백으로 이루어져 있습니다. 직접 등록하면 어떤 UI 객체든 실시간 숫자가 반영되는 툴팁을 띄울 수 있습니다. 플레이어는 모든 것에 마우스를 올려 보니, 여러분의 모드가 조용히 완성도 있어 보이는 곳이 바로 여기입니다.

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

`HelloWindow`는 배경에 `HelloTooltipTarget`을 붙여 패널에 마우스를 올렸을 때 툴팁이 뜨도록 만듭니다. `Tooltip.show()`는 대상 GameObject, 툴팁 ID, 그리고 콜백에 전달될 `TooltipData`를 인자로 받습니다. 바니라는 여기에 관련 유닛, 도시, 특성 (trait) 등의 객체를 넘깁니다. 기본 `"normal"` 툴팁의 경우 별도 에셋 등록 없이 `tip_name`과 `tip_description` 텍스트 키만으로도 바로 사용할 수 있습니다.

| `TooltipAsset` 필드 | 역할 |
| --- | --- |
| `callback` | 툴팁 내용 구성: `name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | 사용할 툴팁 레이아웃 프리팹. 기본값은 `tooltips/tooltip_normal` |
| `sound` / `color` | public 문자열 필드지만, 제공된 툴팁 표시 구현체는 이 값들을 소비하지 않음 |
| `callback_text_animated` | 툴팁이 열려 있는 동안 0.08초마다 반복 호출되어 동적인 텍스트 갱신에 사용 |

> [!NOTE] 필드가 아니라 그걸 실제로 쓰는 쪽을 확인하세요
> `TooltipAsset.sound`나 `color`가 소리나 색을 자동으로 처리해 줄 거라 기대하지 마세요. 제목에 색을 입히려면 public 메서드인 `pTooltip.setTitle("HelloBox", "", "#43FF43")`로 명시적으로 지정하세요. `setDescription`과 `setBottomDescription`은 확인한 게임 소스에서 internal이므로, 위 예제에는 publicize된 `Assembly-CSharp.dll`이 필요합니다.

## 창을 여는 단축키

패널을 여는 단축키는 `HotkeyAsset`입니다. 키를 누르기 전까지는 어디에도 나타나지 않으며, 눌렀을 때 지정된 액션을 실행합니다.

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

> [!WARNING] 단축키는 시작 시점에 연결됩니다
> `HotkeyLibrary.linkAssets()`는 각 `default_key_*`를 게임이 실제로 검사하는 `overridden_key_*`로 복사하고, 매 프레임 폴링하는 유일한 목록인 `action_hotkeys`를 빌드합니다. 둘 다 모드 로드 전에 완료되므로, 직접 연결해 주지 않으면 키를 눌러도 아무런 반응이 없습니다 :wbfacepalm:.

`check_*` 플래그는 조작 충돌을 손쉽게 방지해 줍니다: `check_controls_locked`는 유닛 직접 조종 중일 때 입력을 무시하고, `check_window_not_active`는 바니라 창이 열려 있을 때 비활성화합니다. 바니라에서 사용하지 않는 키(F6 등)를 선택하세요 :PES2_Shrug:.

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] 게임 원본에서 먼저 복사해 오세요
> **UnityExplorer**를 열고 계층 구조에서 바니라 창을 찾아 컴포넌트와 속성값을 확인하세요. 이미 잘 작동하는 구조를 그대로 따오는 것이 앵커 좌표를 맞추느라 3시간 동안 헤매는 것보다 훨씬 낫습니다 :PES2_GaSmart:.


다음: 팁과 지도 명패를 위한 **[메시지 및 세계 기록](#/nml/messages-and-world-log)**, 또는 네이티브 옵션 상태를 위한 **[게임 옵션](#/nml/game-options)**.
