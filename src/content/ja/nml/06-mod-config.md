---
title: Mod設定
group: NML Modding
subgroup: 高度な機能と公開
icon: :wbsettingsgear:
order: 40
---

# Mod設定 :wbsettingsgear:

遅かれ早かれ、誰かがあなたのModは強すぎる、遅すぎる、あるいはうるさすぎると文句を言ってくるでしょう。Discordでレスバトルをする代わりに :PESgn_WhySoToxic:、設定画面を用意して自分で調整してもらいましょう。

NMLがウィンドウ全体を描画してくれます。あなたが書くのはJSONファイル1つだけです。

## default_config.json

Modのルート（`mod.json`の隣）に `default_config.json` を配置します：

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` は**グループID**です。設定の1つのタブになります。その中の各要素がウィンドウ内の1行に対応します。

| キー | 意味 |
| --- | --- |
| `Id` | グループ内で一意。コードで値を読み取る識別子 |
| `Type` | `SWITCH`（オン/オフ）、`SLIDER`（浮動小数点）、`INT_SLIDER`（整数）、`TEXT`（テキスト入力） |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | 型に応じたデフォルト値 |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | スライダーの最小値・最大値 |
| `IconPath` | 行に表示する任意のアイコン |
| `Callback` | 値が変更されたときに呼ばれる任意の `Namespace.Type:MethodName` |

## 値の読み取り

`BasicMod<T>` を使用している場合、`GetConfig()` が自動で利用可能となり、グループ名とIDでインデックスアクセスできます：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

はい、各項目を `try/catch` で囲むのは過剰防衛に見えるかもしれません。しかし違います。プレイヤーが古いバージョンからアップデートした場合、保存された設定ファイルには今追加したキーが存在せず、キー欠落が1つあるだけでロード処理全体がクラッシュしてしまいます。

## Callbacks

`Callback` は `Namespace.Type:MethodName` の形式で指定し、メソッドは新しい値を受け取ります：

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // プレイヤーがスライダーを動かしたときにNMLから呼び出される
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] 変更はウィンドウが閉じたときに適用されます
> スライダーをドラッグしている最中ではありません。コールバックで重い処理を行うなら好都合です。もしリアルタイムプレビューを期待していたなら、それが「動かない」原因です :huh:。

## 保存先

`default_config.json` は単なる**テンプレート**です。プレイヤーが実際に変更した設定値は以下に保存されます：

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

デフォルト値のテスト中に「なぜ新しい設定値が反映されないんだ」と頭を抱えたときに真っ先に削除すべきファイルでもあります :PESgn_OOF:。

## Don't forget the text (again)

グループIDや設定項目IDもローカライズキーです。`Locales/` に追加しておかないと生のIDが表示されてしまいます：

グループidとitem idもロケールキーです。`Locales/en.json` に入れないと生のまま出ます。各行にはツールチップ用の2つ目のキー **`"<id> Description"`**（スペースと大文字のD）も必要です。

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] 忘れたものはログが教えてくれる
> ラベルが無いと `LocalizedTextManager: missing text: strike_radius Description` と出ます。設定ウィンドウを一度開いてから `missing text:` を検索すれば、追加すべきキーの正確な一覧が手に入ります :wbsmirk:。


## BasicMod なしの場合

メインクラスが `IMod` を直接実装している場合は、同じクラスで `IConfigurable` を実装してインスタンスを返してください：

```csharp
public ModConfig GetConfig()
{
    return _config;   // 自身で作成またはロードしたもの
}
```

このメソッド1つで、Mod一覧画面のModの横に設定ボタンが現れるようになります。
