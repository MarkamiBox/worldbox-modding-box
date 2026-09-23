---
title: ライブコンソール (BepInEx)
group: 概要
subgroup: 外部ツールとセットアップ
icon: :wbvideo:
order: 5
---

# ライブコンソール :wbvideo:

テストするたびにメモ帳で `Player.log` を開き直すのは苦行以外の何物でもありません。（白状すると、私もいまだにやっちゃうんですけどね :23062-durrr:）。**BepInEx** を導入すれば、ゲームの実行中にリアルタイムでログを流し込んでくれる黒いコンソール画面が手に入り、コードが実行された瞬間にログ行が目の前に飛び込んできます。

設定にかかる時間はたったの10分。一度導入してしまえば、今後のMod制作ライフのすべてで役に立ち続けます。

## BepInEx とは何か

Unityゲームが起動する直前に割り込んで動作するModローダーです。WorldBox のMod制作者がこれを使う目的は主に2つあります。リアルタイムコンソールの表示と、**UnityExplorer** の起動です（これについては専用の解説ページがあります）。Modが必要とした際にNMLが自動で導入してくれることもありますが、自分で導入しておけば設定を完全に掌握できます。

## インストール手順

1. [BepInEx 公式リリースページ](https://github.com/BepInEx/BepInEx/releases) にアクセスし、**Assets** の項目までスクロールして `BepInEx_win_x64_5.4.x.x.zip` という名前のファイルを取得します。この組み合わせを厳守してください：**win**、**x64**、**5**。`x86`、`unix`、`macos` や `BepInEx 6 / IL2CPP` などのビルドは魅力的に見えますが、ここ WorldBox ではどれも一切動きません :PES5_Dumb:。
2. zipファイルを右クリック → **プロパティ** → **許可する** のチェックボックスがあればチェックを入れ、`worldbox.exe` が置かれている **WorldBox の本体フォルダ** にそのまま解凍します（デフォルトの Steam パス：`C:\Program Files (x86)\Steam\steamapps\common\worldbox`、または Steam で WorldBox を右クリック → **管理** → **ローカルファイルを閲覧**）。配置後は次のようになります：

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **ゲームを一度起動して、そのまま終了します。** この初回起動によって初期設定ファイルが自動生成されます。画面上には何も起きませんが、それが正常です :hmm:。

## コンソールを有効化する

任意のテキストエディタで `BepInEx/config/BepInEx.cfg` を開き、`[Logging.Console]` の項目を探して次のように書き換えます：

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

もう一度ゲームを起動します。ゲーム画面の隣に黒いサブウィンドウが立ち上がり、すでに猛烈な勢いでログを吐き出しているはずです。

## ログの見方

この段階では自作Modをまだ1つも作っていなくても、ゲームを起動するだけで BepInEx と NeoModLoader の起動ログが流れてきます：

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

この文字列が表示されていれば、準備完了です。ライブコンソールが無事に息を吹き返しました！

後ほど **[はじめてのMod作成](#/nml/your-first-mod)** のガイドに沿ってModを書くと、激流のように流れるログの真ん中で、自作Modがコンパイルされて挨拶してくれる様子を確認できます：

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

コンソールを本当に役立つ相棒にするための3つの習慣：

- **すべてのログの先頭にMod名のプレフィックスを付ける**。`[MyMod]` のように書いておけば、怒涛のログの中から自分の出力だけを瞬時に見つけ出せます。
- **処理の開始時と終了時の両方でログを出す**。「特性を登録中...」と出ているのに「特性の登録完了」が永遠に出なければ、どの処理で息絶えたのかが一目瞭然です。
- **コンソール画面をサブモニター（または画面の半分）に常駐させておく**。ボタンをクリックした瞬間にログが流れる様子を眺めるのは、この世で最も手軽で高速なデバッグ手法です :memes:。

## 実際の使い方（簡単なプレビュー）

**[はじめてのMod作成](#/nml/your-first-mod)** でModのファイル構成を整えたら、次のようにリアルタイムログを仕込んでゲーム内の挙動をテストできます：

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // マウス左クリック、1クリックごとに1回実行
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

クリックするたびに、その瞬間にコンソールへ文字が出力されます。この一切のタイムラグがないフィードバックこそが、BepInEx が手放せなくなる最大の理由です！
