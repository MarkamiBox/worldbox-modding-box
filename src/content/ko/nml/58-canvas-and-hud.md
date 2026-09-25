---
title: 사용자 정의 UI 및 HUD
group: 게임 콘텐츠
subgroup: 신의 힘 및 UI
icon: :computer_emotiguy:
order: 208
---

# 사용자 정의 UI 및 HUD :computer_emotiguy:

**[커스텀 창](#/nml/custom-windows)** 에서는 파워 버튼을 눌러 여는 모달 창을 제작했습니다. 하지만 화면 구석의 상시 통계판이나 유닛 머리 위에 뜨는 체력 바처럼 상시 유지되는 UI가 필요한 모드도 많습니다.

WorldBox는 Unity 기반이므로 Unity UI 시스템(`Canvas`, `RectTransform`, `Image`, `Text`)을 자유롭게 활용할 수 있습니다. 위젯을 화면에 고정하거나 게임 세계 위에 투영하는 기법을 알아봅니다.

## Unity UI 계층 구조

모든 2D 인터페이스는 Unity `Canvas` 아래에 배치됩니다. 모드 제작 시 가장 핵심이 되는 캔버스는 `CanvasMain` 입니다:

| 캔버스 | 사용 시점 |
| --- | --- |
| `CanvasMain.instance` | 화면 공간 상시 UI (HUD, 툴바, 수치 표시판) |
| World Space Canvas | 게임 월드의 타일이나 특정 위치에 배치되는 캔버스 |
| `Camera.main.WorldToScreenPoint` | 움직이는 월드 내 대상을 추적하는 화면 오버레이 |

## 코드

이 클래스는 화면 좌측 상단에 상시 HUD를 띄우고 1초마다 세계 유닛 통계를 갱신합니다:

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

## 월드 공간 오버레이 추적

위젯이 유닛 머리 위를 따라다니게 하려면 위젯은 `CanvasMain` 에 두고, 매 프레임 유닛의 3D 좌표를 2D 화면 좌표로 변환하세요:

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

이 방식은 카메라 줌 수준과 상관없이 UI 폰트가 뭉개지지 않고 선명하게 유지됩니다 :PESgn_Noice:.

## 주의해야 할 함정

- **로드 시점 캔버스 미준비**: `OnModLoad()` 시점에는 `CanvasMain.instance` 가 `null` 인 경우가 많습니다. 반드시 `Config.game_loaded` 가 확인된 후 첫 `Update()` 에서 초기화하세요.
- **폰트 참조**: `Resources.GetBuiltinResource<Font>("Arial.ttf")` 를 사용하거나 게임의 `LocalizedText.default_font` 를 빌려옵니다.
- **핫 리로드 시 정리**: 실시간 리로드를 쓸 때는 이전 GameObject를 먼저 파괴(Destroy)하지 않으면 동일한 HUD가 화면에 겹쳐서 복제됩니다 :aPES2_Sweat:.
