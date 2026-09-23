---
title: 初めてのMod作成
group: NML Modding
subgroup: 基本ワークフロー
icon: :wbchosen:
order: 22
---

# 初めてのMod作成 :wbchosen:

このガイドのすべての内容は、**1つのMod** を作りながら進める構成になっています。ここで土台を作り、以降のページで1つずつ新しいファイルを追加していきます。

ガイドを終える頃には、HelloBoxには約20個のファイルが含まれ、そのすべてのコードを自分で書いたことになります：専用タブを持つユニット特徴と文化特徴、武器とそのエンチャント、ステータス効果、ドロップ品、雲、タイル、料理レシピ、発射物、世界の法則、専用ボタン付きの神の力、ウィンドウ、設定パネル、建物、派閥、クリーチャー、災害、専用AI、そしてゲームの既定ルールを上書きするHarmonyパッチまで。

これはどんな実際のModよりも盛りだくさんですが、まさにそれが狙いです。自分が本当に作りたい2〜3個の機能だけを残し、残りは自由に削ぎ落とせば良いのです :PES4_DeleteThis:。

制作するModの名前は **HelloBox** です。さっそく形にしてみましょう。

> [!NOTE] これまで一度もプログラミングをしたことがありませんか？
> 心配いりません。各コードブロックの下にある「各行の解説」を読みながら、コードをそのまま正確にコピーしてください。プログラミングの9割は、動いているコードを真似して一度に1箇所ずつ変えていく作業です :PES2_Legit:。

> [!TIP] テンプレートから始めてもいい
> 手でファイルを作りたくないなら、空の雛形を取って手順4に飛んでください。次の3つの手順は読んでおく価値があります。中身が何かを説明しています。
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">空のmodテンプレートをダウンロード</span>
>     <span class="dl-sub"><code>mod.json</code>、<code>Code/Main.cs</code>、そしてNMLが探すフォルダ。それだけです。</span>
>   </span>
> </a>

## 1. フォルダを作成する

WorldBoxフォルダ（`worldbox.exe` がある場所）を開き、`Mods/` の中に `HelloBox` というフォルダを作成します。その中に `Code` というフォルダを1つ作ります。

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- あなたのMod
        ├── mod.json       <- 身分証明書（次のステップ）
        └── Code/          <- ここに .cs ファイルが入ります
```

## 2. 身分証明書：mod.json

`HelloBox/` の直下に `mod.json` というファイルを作成し、以下の内容を貼り付けます。`author` はあなたの名前に変更してください。

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** はゲーム内のMod一覧に表示される名前です。
- **`GUID`** は一意なIDです。`com.yourname.hellobox` を設定し、二度と変更しないでください。

このファイルがないと、NMLはModが存在しないものとして扱います :pepeno:。

> [!WARNING] メモ帳は `mod.json.txt` にしようとします
> 保存ダイアログで、ファイル名を入力する前に **ファイルの種類** を **すべてのファイル (*.*)** に変更してください。保存後エクスプローラーで確認し、`.json` の拡張子が見えない場合は、**表示 → ファイル名拡張子** を有効にしてWindowsが拡張子を隠さないように設定してください。`mod.json.txt` という名前になってしまうとNMLから一切認識されません :PESgn_Oops:。

## 3. コードを書く：Main.cs

`Code/Main.cs` を作成し、以下を貼り付けます：

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### 各行の解説

- **`using NeoModLoader.api;`**: 「このファイルでNMLのツールを使いたい」という宣言です。これがないと、コンピュータは `BasicMod` が何なのか理解できません。
- **`namespace HelloBox`**: あなたのコードの名字のようなもので、他のModの `Main` クラスと名前が衝突するのを防ぎます。
- **`public class Main : BasicMod<Main>`**: あなたのMod本体です。`: BasicMod<Main>` の部分は「私はNMLのModなので、ログや設定、翻訳などの基本機能をください」という意味になります。
- **`protected override void OnModLoad()`**: ゲーム起動時にNMLが一度だけノックする扉です。Modが初期化するすべての処理はこの波括弧 `{ }` の中に書きます。
- **`LogInfo(...)`**: Mod名が付いたログ行を出力します。コードが本当に動いたかどうかを確かめるための手段です。

## 4. ゲームを起動する

WorldBoxを起動し、メインメニューから **Mods** ウィンドウを開きます。リストに **HelloBox** が表示され、すでにオンになっているはずです。自分で `Mods/` に置いたModは、NMLが最初に検出した時点で自動的に有効化されます。

後でModを **オフ** にしたい場合もこのウィンドウで行います。アイコンをクリックすると切り替わりますが、大半のModはゲームの再起動後に反映されます。

> [!TIP] リストに全く表示されませんか？
> NMLがファイルを認識できていません。十中八九、ファイル名が `mod.json` ではなく `mod.json.txt` になっているか、フォルダが `worldbox\Mods/` 以外の場所に置かれています。

## 5. 実行ログを確認する

ログファイルにあなたの出力行が記録されているはずです：

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

このファイルを見つけるには、Windowsエクスプローラーのアドレスバーに以下を貼り付けてEnterを押します：

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

`Player.log` をメモ帳で開き、**Ctrl+F** を押して `HelloBox` を検索してください。

その行が見つかれば、あなたも今日から立派なMod開発者です :PESgn_Congrats:。見つからない場合は、まさにこの状況のために用意された **[ログとデバッグ](#/nml/logs-and-debugging)** のページを確認してください。

## 6. 今後のページとのつながり

これ以降の各ページでは、`Code/` に **1つの新しいファイル** を追加し、`OnModLoad` に **1行の呼び出しコード** を追加していきます。パターンは常に同じです：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // カスタム特徴のページで追加
    HelloItems.Initialize();    // カスタムアイテムのページで追加
    // ...以降も同様に続きます
}
```

新しく作成するファイルは、常に以下のような構造になります：

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // そのページのコードをここに記述します
        }
    }
}
```

> [!TIP] 1つずつ着実に進める
> ファイルを1つ追加したら、ゲームを起動してログを確認し、それから次のステップに進みましょう。5つの機能を一度に追加してゲームがクラッシュした場合、容疑者は5つになります。1つずつ追加していれば、原因は常に明白です :aPES_Detect:。
