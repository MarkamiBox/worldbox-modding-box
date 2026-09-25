---
title: カスタムUIとHUD
group: ゲームコンテンツ
subgroup: 神の力とUI
icon: :computer_emotiguy:
order: 208
---

# カスタムUIとHUD :computer_emotiguy:

**[自作ウィンドウ](#/nml/custom-windows)** ではパワーバーのボタンから開くモーダルウィンドウを扱いました。しかしMODによっては、画面隅の常駐カウンターや頭上に浮かぶHPバーといった常時表示のUIが必要です。

WorldBoxはUnity製であるため、UnityのUIシステム（`Canvas`、`RectTransform`、`Image`、`Text`）をフル活用できます。画面への固定配置やワールド空間への投影方法をここで学びます。

## Unity UIの階層構造

すべての2DインターフェースはUnityの `Canvas` の配下に配置されます。MOD開発で最も役立つのは `CanvasMain` です：

| キャンバス | 用途 |
| --- | --- |
| `CanvasMain.instance` | スクリーンスペースUI（常駐HUD、ツールバー、集計表示） |
| ワールドスペースCanvas | ゲーム世界内の特定地点に直接配置されるキャンバス |
| `Camera.main.WorldToScreenPoint` | 移動する生物の位置を画面上に追従させるオーバーレイ |

## コード

このクラスは画面左上に常駐HUDバナーを生成し、毎秒世界の統計情報を更新します：

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

## ワールド空間オーバーレイの追従

UIパーツを特定の生き物に追従させたい場合、ウィジェットは `CanvasMain` に置いたまま、毎フレーム生き物の3D座標を2Dスクリーン座標へ変換します：

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

これにより、カメラのズーム倍率にかかわらず文字や画像がぼやけず鮮明に描画されます :PESgn_Noice:。

## よくある落とし穴

- **起動時のキャンバス未初期化**: `OnModLoad()` 実行中、`CanvasMain.instance` は `null` であることがほとんどです。`Config.game_loaded` が有効になった後の `Update()` 内で初期化してください。
- **フォントの指定**: `Resources.GetBuiltinResource<Font>("Arial.ttf")` を利用するか、ゲーム標準の `LocalizedText.default_font` を参照します。
- **リロード時の破棄処理**: ホットリロードを行う際、古いGameObjectを破棄してから再生成しないと同一HUDが二重三重に重なってしまいます :aPES2_Sweat:.
