---
title: メッセージとワールドログ
group: ゲームコンテンツ
subgroup: 神の力とUI
icon: :wbscroll:
order: 207
---

# メッセージとワールドログ :wbscroll:

`Main.Log()` でコンソールに出力するのは、コードを書いている間は便利です。しかし、あなたの神の力が隕石を落としたり、カスタムのボスユニットが目覚めたり、王国が条約を結んだりするとき、プレイヤーはあなたのデバッグログを読んでいません。

必要なのは画面上のフィードバックです。画面を横切るポップアップのヒントと、ワールドの歴史ログへの記録です。

## WorldTipによる画面上のバナー

プレイヤーに何か伝える一番手早い方法は `WorldTip.showNow` です。

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| パラメータ | 説明 | 既定値 |
| --- | --- | --- |
| `pText` | 生の文字列、またはローカライズキー | 必須 |
| `pTranslate` | `pText` を `LocalizedTextManager.getText()` に通すかどうか | `true` |
| `pPosition` | 画面上の位置: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | フェードアウトするまでの秒数 | `3f` |
| `pColor` | テキストのカラーコード | `"#F3961F"`（オレンジ） |

> [!WARNING] WorldTipは既定で翻訳を試みる
> `pTranslate` の既定値は `true` なので、`WorldTip.showNow("Something happened!")` と書くと、ゲームは `"Something happened!"` という名前のロケールキーを探しにいきます。見つからず、翻訳が欠けているというエラーがログに出て、代わりに生のプレースホルダーテキストが表示されます :PESgn_Oops:。
>
> 英語のリテラル文字列を渡す場合は、**必ず** `pTranslate: false` にしてください。
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> ローカライズ済みのテキストを渡す場合は、翻訳キーを渡して `pTranslate: true` のままにします。
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### 下部ツールバーのテキスト

神の力バーのすぐ上に、もっと控えめなメッセージを出したい場合、例えばブラシを選んだときに表示されるツールチップのようなものには、`showToolbarText` を使います。

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

これは、現在使用中のパワーバーのすぐ上に、小さく浮かぶヒントを描画します。

## WorldLogでワールドのイベントを記録する

ワールドログは、プレイヤーが歴史ウィンドウで開く永続的な記録です。エントリーはセーブとロードを跨いで生き残り、ワールドの年表に紐付いています。

ゲームは、`WorldLog` にすぐ使える静的ヘルパーをいくつか用意しています。

```csharp
// 王位継承を記録する:
WorldLog.logNewKing(kingdom);

// 新しい国の建国を記録する:
WorldLog.logNewKingdom(kingdom);

// 特定のタイルで起きた災害イベントを記録する:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### カスタムの歴史エントリー

独自の歴史イベントを追加するには、`AssetManager.world_log` から取得した `WorldLogAsset` を使って `WorldLogMessage` を作成します。

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() はエントリーを HistoryHud に登録し、ワールドログのデータベースに書き込む:
            entry.add();
        }
    }
}
```

`entry.add()` は、そのエントリーを現在のゲームの歴史HUDに追加し、`DBInserter.insertLog` を通じてワールドのSQLiteデータベースに永続化します。

## マップの表札（nameplates_library）

マップレイヤーがオンになると、都市、王国、宗教の上にバナーが表示されます。これらは `AssetManager.nameplates_library`（`NameplateAsset`）が担当しています。

| フィールド | 説明 |
| --- | --- |
| `id` | `MetaType` に対応する識別子 |
| `path_sprite` | バナーの枠のスプライトパス |
| `padding_left` / `padding_right` / `padding_top` | テキストのオフセット境界 |
| `map_mode` | この表札がどの `MetaType` の上に描画されるか |

> [!WARNING] バニラのマップモードに対して add() を呼ばないこと
> このライブラリは1つの `MetaType` につき表札を**1つ**しか許可しません。すでに存在する `MetaType`（王国や都市など）に対して `AssetManager.nameplates_library.add(...)` を呼ぶと、例外が発生します :wbfacepalm:。
>
> バニラの表札の見た目やスタイルを変えたいだけなら、`get()` で既存のものを取得してフィールドを編集してください。
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

次は: プレイヤーオプションについては **[ゲームオプションと時間スケール](#/nml/game-options)**、時計に合わせてロジックを走らせる方法については **[毎フレーム](#/nml/update-loops)** へ。
