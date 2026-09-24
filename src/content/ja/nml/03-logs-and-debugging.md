---
title: ログとデバッグ
group: NML Modding
subgroup: 基本ワークフロー
icon: :wbdebugburger:
order: 24
---

# ログとデバッグ :wbdebugburger:

ログはMod開発において常に真実を教えてくれる唯一の味方です。あなたが今後千回以上抱くことになる疑問、「**自分のコードは本当に実行されたのか？**」に答えてくれます。

## ログを1行出力する

出力方法は2通りあり、どちらも最終的には同じログファイルに書き込まれます。

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML方式: 自動でMod名のプレフィックスを付与
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity標準方式: プレフィックスを自分で書く必要あり
        }
    }
}
```

`BasicMod` を継承していない場合でも、`NeoModLoader.services.LogService` に同様の `LogInfo`、`LogWarning`、`LogError`、さらにスタックトレース全体を出力する `LogStackTraceAsError` が用意されています。

## 正常なログの例

上記のコードを入れた状態でゲームを起動し、`Player.log` で `HelloBox` を検索してみてください。以下のような出力があれば成功です：

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

1行ずつの意味：NMLが `Code/` 内のファイルをコンパイルし、リソースを読み込み、`OnModLoad` を呼び出してあなたのログを出力しました。番号付きの行はNMLの各ステップの所要時間計測です（`=` の後の数字は秒数）。一部の行が赤文字で出力されることがありますが、**ここでの赤文字はエラーではなく**、単にそのステップに時間がかかったことを意味しています :hmm:。

最も重要なのはあなた自身のログ行です。`[HelloBox]: HelloBox is alive!` が見当たらない場合は、続きを読んでください。

## コードがコンパイルできない時

Modが実行される前に、NMLはコードをビルドする必要があります。タイポが1つあるだけでビルドは中断され、どこがおかしいかを的確に教えてくれます：

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

右から左へと読みます：**`; expected`** が原因（セミコロン抜け）、**`(9,42)`** が9行目の42文字目、そして **`Code\Main.cs`** が対象ファイルです。そのファイルを開き、該当行にセミコロンを足してください。

役立つ情報は常に**1行目**にあります。下の `Failed to compile mod HelloBox` は単なる結果報告に過ぎません。下の行だけを見て慌て、すぐ上に書いてある正解を見落とす人が後を絶ちません :PES4_1IQ:。

## エラーが発生した時のログ

無事にコンパイルが通った後、最も頻繁に遭遇するのがこちらです :PES2_F:：

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

難解に見えますが、意味は極めてシンプルです：

- **`NullReferenceException`**: 中身が空（`null`）のオブジェクトを使おうとしました。遭遇するエラーの95％はこれです。
- **`at HelloBox.HelloTraits.Initialize ()`**: エラーが起きたメソッド。
- **`in HelloTraits.cs:24`**: **あなた自身のファイルの24行目**です。その行を確認してください。何かが `null` になっています。
- その下の行は呼び出し元の履歴（スタックトレース）で、上が最新です。注目すべきは自分自身のファイル名が書かれた行です。

これの典型的な原因は、アセットをライブラリに追加（`add()`）する前に `base_stats` を触ってしまうことです。詳細は **[カスタム特徴](#/nml/custom-traits)** ページをご覧ください。

## ログファイルの保管場所

| ファイル名 | 格納場所 | 内容 |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | 現在のゲーム実行ログ |
| `Player-prev.log` | 同上フォルダ | **前回** の実行ログ（クラッシュ直前の記録） :aPES_Flatline: |
| `logs/error_*.log` | 同上フォルダ内 `logs/` | ゲームが捕捉した個別エラーログ |
| `mods_config/<GUID>.config` | 同上フォルダ | プレイヤーが保存したあなたのModの設定 |

Windowsエクスプローラーのアドレスバーに `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` を貼り付ければすぐに開けます。

## ログファイルの代わりにライブコンソールを使う

ゲーム終了後にいちいちテキストファイルを開くのは時間がかかります。**BepInEx** を導入すると、プレイ中にログがリアルタイム表示される黒いコンソールウィンドウが開き、ボタンを押した瞬間にログを確認できます。導入は2分で終わります：**[BepInEx コンソール](#/toolbox/bepinex-console)**。

ゲーム内のウィンドウをクリックして内部数値をリアルタイムで調べたいなら、**[UnityExplorer](#/toolbox/unity-explorer)** が最適です。

## 1つのエラーでMod全体を止めない工夫

`OnModLoad` は上から下へ順に実行されます。もし3行目で例外が起きると、4〜20行目は一切実行されず、Modの機能の半分が音もなく消失します。各処理に安全ネットを用意しましょう：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// 処理を1つ実行し、クラッシュした場合はどの段階かを記録して続行する
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

こうしておけば、1つの特徴でミスをしてもその特徴が消えるだけで済み、Mod全体が死ぬことはありません。ログにも原因となったステップが明記されます：

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## ワールドが存在する前に触らない

`OnModLoad` は、ワールドが生成される**前**に実行されます。マップもユニットもまだ何も存在しません。ここでそれらに触ろうとすると、メインメニューにたどり着く前にクラッシュします :surprised_pikachu:。毎フレーム呼ばれる処理には必ずガードを入れましょう：

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // まだメニュー画面
    if (World.world == null || World.world.units == null) return;  // まだワールドがない
    if (MapBox.instance == null) return;

    // ここから下ならワールドに触れても安全
}
```

## 再起動せずにコードをリロードする

1行のコードの変更をテストするために毎回 WorldBox を再起動するのは、Mod 開発で最も時間を浪費する作業です。一晩で40回やったことのある人に聞いてみてください。NML はゲーム実行中に Mod を再コンパイルし、指定したメソッドをホットスワップで差し替えることができます。

1. メインクラスに `IReloadable` を実装します。これは `Reload()` メソッド1つだけです。HelloBox では **[完成した Mod](#/nml/all-together)** で実装しています。
2. リロードボタンは `Config.isEditor` が `true` の場合のみ表示されます。HelloBox ではデフォルトで `false` になっている `DevReload` 設定でこれを切り替えます。
3. 差し替えたいメソッドに `NeoModLoader.api.attributes` の `[Hotfixable]` 属性を付与します：

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // ゲーム実行中にここを編集してリロードを押し、次の生物が実行するのを観察します
}
```

その後メソッドを変更して保存し、NML の Mod リストから Mod のリロードボタンを押します。NML が再コンパイルを行い、対象メソッドにパッチを当てて `Reload()` を呼び出します。属性をつけていない部分は以前のコードを実行し続けます。

> [!WARNING] `Config.isEditor` はゲーム自体の内部スイッチです
> Unity エディタ内で動作していると WorldBox に認識させるため、一部の UI がスマホ向けレイアウトになったり、一部オブジェクトが起動時に破棄されたりします。自身のテスト時のみ有効にし、公開用 Mod では絶対に有効化しないでください。

対応していない処理：`Awake` や `Update` などの Unity コールバック、コンストラクタ、古いコードから既にゲーム内に生成・キャッシュされたオブジェクト。起動時に登録されたアセットは当時のデリゲートを保持し続けるため、`Reload()` 内で手動で再代入する必要があります。

## 誰もが一度は通るエラー一覧

| 画面の現象 | 本当の原因 |
| --- | --- |
| Mod一覧に表示されない | `mod.json` がない、またはJSON構文エラー（末尾の余分なカンマなど :pepeclown:） |
| Modはあるが何も起きない | `OnModLoad` で例外が発生。ログでMod名プレフィックスや `Exception` を検索 |
| `Failed to compile mod ...` | C#のタイポ。本当のエラーメッセージは **1行上** にあります |
| 新規アセットで `NullReferenceException` | `add()` の前に `base_stats` を触った（領域確保はライブラリが行います） |
| テキストが `trait_whatever` と出る | 翻訳の登録漏れ。**[多言語対応](#/nml/localization)** を参照 |
| ボタンが透明な穴になっている | スプライトパスが間違っており、アイコンが `null` になった |
| 自分のPCでだけ動き、他人のPCで動かない | 自分のWindowsユーザー名が入った絶対パスを直書きしている :homerhide: |
