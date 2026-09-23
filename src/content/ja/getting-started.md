---
title: 開発を始める前に
group: 概要
icon: :wbsalut:
order: 3
---

# 開発を始める前に :wbsalut:

最初の1行を書く前に準備しておくべきことの一覧です。順番に進めていけば約15分で完了します。

> [!NOTE] プログラミングの知識はまだ不要です
> Visual Studio や専門のコンパイラを用意する必要は**一切ありません**。NML が Mod フォルダ内の `.cs` テキストファイルを読み取り、ゲーム起動時に自動でコンパイルしてくれます。**最初の Mod を書くなら Windows 標準の「メモ帳」で十分です** :PES_OkHand:。不便を感じてからより良いツールに乗り換えれば問題ありません。

## 1. WorldBox のインストールフォルダを開く

このガイドでは「WorldBox フォルダにファイルを配置してください」と何度も指示されることになります。今のうちに場所を確認しておきましょう：

**Steam → WorldBox を右クリック → 管理 → ローカルファイルを閲覧**

`worldbox.exe` が置かれているフォルダがエクスプローラーで開きます。大半の PC では以下のパスです：

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

このウィンドウは開いたままにしておくか、ピン留めしておきましょう。このガイドで *WorldBox フォルダ* と呼ぶ場合、常にこのフォルダを指します :gatoxd:。

## 2. 実験モードを有効化する

実験モードが有効になっていないと Mod は一切読み込まれません。「動作が不安定になる」のではなく、エラーメッセージすら出ずに完全に無視されます。

ゲーム内：**設定** を開き、**実験モード（Experimental Mode）** を見つけてオンにします。ゲームがアップデートされるたびに設定が自動でオフに戻るため、更新後は必ず確認してください。

## 3. NeoModLoader をインストールする

**NML** は自作 Mod を検出し、コンパイルして実行してくれる Mod ローダーです。NML なしに WorldBox の Modding は成立しません。導入が初めての方は **[NMLのインストール](#/install-nml)** で Mac を含む全手順を画像付きで解説しています。

1. [NML の Releases ページ](https://github.com/WorldBoxOpenMods/ModLoader/releases) から最新の `NeoModLoader.dll` をダウンロードします。必要なのはこの1ファイルのみです。
2. WorldBox フォルダ内の `worldbox_Data\StreamingAssets\Mods/` を開きます。
3. そこに `NeoModLoader.dll` を配置します。

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- ここに配置
```

ゲームを起動します。成功していれば、画面下のタブ一覧に NML ロゴのボタンが追加され、`worldbox.exe` と同じ階層に空の `Mods` フォルダが自動生成されます。表示されない場合はステップ2を再確認してください :PES5_Hmmmm:.

> [!TIP] Steam Workshop による自動更新
> [Steam ワークショップの NML ページ](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469) も公開されています。サブスクライブするだけでは初回インストールは完了しませんが、上記の手動導入後に購読しておくと常に最新版へ自動更新してくれます。

## 4. テキストエディタの準備

| | |
| --- | --- |
| **メモ帳** | PC に最初から入っています。最初の Mod を作るならこれで十分です |
| **[VS Code](https://code.visualstudio.com/)** | 無料・軽量で、構文ハイライトや入力ミス検出に対応。大半の Modder にとってベストな選択肢 |
| **Visual Studio** | 大規模開発向け。ゲームの `.dll` を参照させることでメソッドの自動補完が効きます。コード量が増えるまではオーバースペックです |

どのエディタを使う場合でも、`.cs` ファイルを保存する際はファイル名が `.cs.txt` になっていないか必ず確認してください。メモ帳は油断すると勝手に `.txt` を付与してきます :PESgn_SMH:.

## 5. 準備完了！Mod を作ってみよう

NML Modding セクションの **[Modの基本構造](#/nml/mod-structure)** へ進み、続けて **[はじめてのMod制作](#/nml/your-first-mod)** を開きましょう :gatoxd: !

---

## 後から導入すればよいツール群（今すぐには不要）

Mod を書くだけなら以下のツールは**不要**です。ガイド内の各ページで指示された段階で導入してください。

- **[リアルタイムコンソール (BepInEx)](#/toolbox/bepinex-console)**: ログファイルを毎回開かなくても、ゲーム画面と並行して黒いコンソールにログをリアルタイム出力してくれます。開発効率が劇的に向上するため早めの導入がおすすめです。
- **[UnityExplorer](#/toolbox/unity-explorer)**: ゲーム内のあらゆるオブジェクトをクリックして内部構造をインスペクトできます。
- **[dnSpy または ILSpy](#/toolbox/reading-the-game-code)**: ゲーム本体の逆コンパイルコードを開き、開発陣がどのように実装しているかを閲覧できます。
- **[AssetRipper](#/toolbox/getting-the-sprites)**: ゲーム本体のスプライトや効果音を抽出し、公式のドット絵スタイルに合わせることができます。

> [!WARNING] NCMS は非推奨（サポート終了）です :sadcat:
> NCMS はすでに更新が停止しています。本ガイドの全コードは NML 向けに書かれています。技術的に NCMS 向け Mod を作ることは可能ですが、現在では誰も使っていません :PES2_Shrug:.
