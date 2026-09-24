---
title: カスタムウィンドウ
group: ゲームコンテンツ
subgroup: 神の力とUI
icon: :wbmonolith:
order: 204
---

# カスタムウィンドウ :wbmonolith:

ボタンを1つ置くだけでは足りず、リストや数値、いくつかの操作スイッチを備えた本格的なパネルが欲しくなる瞬間が必ず訪れます。ウィンドウを実装するには2つのアプローチがあり、選択を誤ると丸々週末を潰すことになります。

| ルート | 使い分けの目安 |
| --- | --- |
| `ScrollWindow` | バニラと全く同じ見た目・挙動のウィンドウを、バニラの枠組み内に収めたい場合 |
| 独自の `Canvas` | バニラにはない、画面上を自由に浮遊しリサイズ可能で複数同時に開けるパネルが欲しい場合 |

## バニラのウィンドウと連携する

ゲームはすべてのウィンドウをIDをキーとするレジストリで管理しており、コード上のどこからでも操作できます:

```csharp
ScrollWindow.showWindow("worldlaws");        // ウィンドウを開く
ScrollWindow.get("worldlaws");               // インスタンスを取得する
ScrollWindow.checkWindowExist("worldlaws");  // そもそも存在するか確認する
ScrollWindow.isWindowActive();               // 現在「何らかの」ウィンドウが開いているか調べる
```

最後のメソッドは見た目以上に重要です。神の力でクリック時に何らかの効果を発動させる場合、ウィンドウがマップを覆っている間は暴発を防ぎたいのが普通です。`GodPower` に `unselect_when_window = true` を指定しておけば、この問題はゲーム側が自動的に処理してくれます。


## ネイティブな ScrollWindow ルート

パネルをWorldBoxが作ったように見せたいなら、私が最初にやったようにゼロからcanvasを組むのはやめましょう :PES2_Shrug:。NeoModLoaderには、スクロールバーやタイトルバー、閉じるボタンをUnityの素のパーツから組み立てずに済むように、`WindowCreator` と `AbstractWindow<T>` が用意されています。

`AbstractWindow<T>` を継承して、配線はNMLに任せましょう：

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

Modの初期化中に一度だけ作成します：

```csharp
HelloNativeWindow.CreateAndInit("hello_native_window");
```

`CreateAndInit()` はゲームの `"windows/empty"` プレハブを複製し、`CanvasMain.instance.transformWindows` の子にし、タイトルキーを `"<windowId> Title"` に設定し、あなたのコンポーネントを付け、ウィンドウを `ScrollWindow._all_windows` と `AssetManager.window_library` の両方に登録します。開くのはバニラのウィンドウと同じ1行です：

```csharp
ScrollWindow.showWindow(HelloNativeWindow.WindowId);
```

巨大な表や複数列の管理画面のためにもっと画面の広さが必要なら、代わりに `AbstractWideWindow<T>` を継承してください。動作は同じですが、初期サイズが `600x280` で、ワイドな枠が自動で適用され、さらに広さが必要なら `SetSize(new Vector2(width, height))` も使えます。

`AbstractWindow<T>` という基底クラス自体を使いたくないなら、`WindowCreator.CreateEmptyWindow(id, titleKey, icon)` を直接呼び、返ってきた `ScrollWindow` を自分で設定してください。自力でやるときに登録手順を忘れると、ESCを押したときにゲームはあなたのウィンドウの存在すら知りません :wbfacepalm:。

## 独自のフローティングウィンドウ

ウィンドウとは、ゲームのUIキャンバスを親とする `GameObject` です。以下がその最小限の骨組みです:

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

### コードの解説

- **`CanvasMain.instance.canvas_ui`**: ゲーム自身のUIが配置されているキャンバスです。これ以外の場所に親を設定すると、ウィンドウがマップの背面に隠れてしまったり、UIスケーリングを無視してしまいます。
- **`overrideSorting` + `sortingOrder`**: ウィンドウに独自の描画レイヤーを持たせます。大きな数値を指定することで「すべての上に最前面表示」され、プレイヤーが意図して開いたパネルに相応しい挙動になります。
- **`GraphicRaycaster`**: ウィンドウがクリックイベントを受け取るための必須コンポーネントです。これを忘れると、ウィンドウ上のクリックがすべて筒抜けになり、パネルの真裏のマップにユニットをスポーンさせてしまいます :pepeclown:。
- **ウィンドウの `IDragHandler`**：`OnDrag` が `rect.anchoredPosition += eventData.delta` を行うので、パネルをクリックして画面のどこへでも動かせます。
- **角のつまみの `HelloWindowResize`**：右下の角をドラッグすると新しい幅と高さを計算し、`160f` を下限にするので、プレイヤーは滑らかにサイズを変えられます。
- **`sizeDelta`**: UI単位でのサイズです。まずは小さめに作りましょう。マップ全体を覆い尽くすようなパネルは、プレイヤーが真っ先に閉じたがるものです。

## WorldBox らしい見た目にする

単色の長方形はいかにも「MOD」という粗野な印象を与えます。ゲーム本来のウィンドウ画像は 9-slice（9スライス）されており、拡大縮小しても枠線がぼやけません。PNG画像を `GameResources/ui/` に配置し、読み込んでスライス設定を施します:

```csharp
Sprite frame = Sprite.Create(
    texture,
    new Rect(0f, 0f, texture.width, texture.height),
    new Vector2(0.5f, 0.5f),
    1f,                          // pixels per unit
    0,
    SpriteMeshType.FullRect,
    new Vector4(12, 12, 12, 12)  // 左、下、右、上のボーダー幅
);

background.sprite = frame;
background.type = Image.Type.Sliced;
background.color = Color.white;
```

またテキストにはゲームが現在使用しているフォントを適用すれば、あらゆる言語環境で自然に馴染みます:

```csharp
Font font = LocalizedTextManager.current_font ?? Resources.GetBuiltinResource<Font>("Arial.ttf");
```

## 思っているよりすぐに欲しくなる機能

- **ドラッグ移動**: `IDragHandler` を実装し、`eventData.delta` に応じて `rect.anchoredPosition` を移動させる小さな `MonoBehaviour` を作ります。わずか20行で、邪魔なパネルが快適なツールに生まれ変わります。
- **対象ごとに1つのウィンドウ**: パネルが*1体のユニット*の情報を表示するものなら、表示を切り替える単一パネルではなくユニットごとに独立したインスタンスを生成しましょう。2つの対象を観察したい理由は、それらを同時に並べて見たいからです。
- **後片付け**: ウィンドウが完全に不要になったら `Object.Destroy(root)` を呼び、参照を破棄してください。スクリプトで動的に生成したテクスチャも同様に `Destroy` しないと、パネルを開くたびにメモリリークを引き起こします。

## ツールチップ

ゲームのツールチップも `AssetManager.tooltips` に登録されているアセットです。ID と、ツールチップが開くたびに中身を埋めるコールバックで構成されます。自作ツールチップを登録すれば、任意の UI オブジェクトでリアルタイムな数値を反映したツールチップを表示できます。プレイヤーは何にでもマウスを乗せるので、あなたのModがさりげなく完成して見えるのはここです。

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

`HelloWindow` では背景に `HelloTooltipTarget` をアタッチしているため、パネルにマウスを乗せるとツールチップが表示されます。`Tooltip.show()` は対象の GameObject、ツールチップ ID、コールバックに渡される `TooltipData` を受け取ります。バニラでは対象のユニット、都市、特性などのデータが渡されます。標準の `"normal"` ツールチップであれば独自アセットの登録すら不要で、`tip_name` と `tip_description` のテキストキーを指定するだけで表示できます。

| `TooltipAsset` のフィールド | 効果 |
| --- | --- |
| `callback` | ツールチップの内容を設定：`name.text`, `setDescription()`, `setBottomDescription()` |
| `prefab_id` | 使用するツールチップのレイアウト。デフォルトは `tooltips/tooltip_normal` |
| `callback_text_animated` | 表示中に0.08秒ごとに再呼び出し。変化するアニメーションテキスト用 |

## ウィンドウを開くショートカットキー

パネルを開くキー入力は `HotkeyAsset` として定義します。押されるまではどこにも表示されず、押された瞬間に登録したアクションが呼び出されます。

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

> [!WARNING] ショートカットキーは起動時に配線されます
> `HotkeyLibrary.linkAssets()` は各 `default_key_*` をゲームが実際に判定する `overridden_key_*` にコピーし、毎フレーム監視対象となる `action_hotkeys` リストを構築します。これらは Mod がロードされる前に完了してしまいます。どちらかの初期化を怠ると、キーを押しても何も起きません :wbfacepalm:。

`check_*` フラグを使うと操作の衝突を簡単に防げます：`check_controls_locked` はプレイヤーが生物を操作している間の入力を無視し、`check_window_not_active` はバニラのウィンドウが開いている間の入力を無効化します。バニラが使用していないキー（F6 など）を選択してください :PES2_Shrug:。

```json Mods/HelloBox/Locales/en.json
{
  "hello_panel_tooltip_title": "HelloBox",
  "hello_panel_tooltip_description": "Creatures alive in this world: $count$"
}
```

> [!TIP] まずはバニラから構造を拝借する
> ゲーム内で **UnityExplorer** を開き、バニラのウィンドウを階層ツリーから探してコンポーネントとプロパティを確認しましょう。すでに動いている構造をコピーする方が、アンカーの位置合わせで3時間悩むよりはるかに確実です :PES2_GaSmart:。
