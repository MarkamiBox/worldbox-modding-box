---
title: ゲームの内部を覗き見る (UnityExplorer)
group: 概要
subgroup: 外部ツールとセットアップ
icon: :wbeyeball:
order: 6
---

# ゲームの内部を覗き見る :wbeyeball:

**UnityExplorer** はゲーム内インスペクターです。任意の画面でゲームを一時停止し、任意のウィンドウ、ボタン、ユニットをクリックして、リアルタイムに保持している全プロパティの数値を読み取ることができます。

なぜこれが必要なのか：バニラのウィンドウが一体どう組み立てられているのかを勘で当てる代わりに、直接開いて*中身を見ればいい*からです。「これどうやって実装してるんだ？」という疑問が、2分で解決するようになります。

## インストール手順

1. まず **BepInEx** を正常に動く状態にします。詳しくは **[ライブコンソール](#/toolbox/bepinex-console)** を参照してください。
2. [**UnityExplorer for BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) をダウンロードします（リリースページから `UnityExplorer.BepInEx5.Mono.zip` を取得）。
3. zipファイルを `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/` に解凍します。`UnityExplorer.BIE5.Mono.dll` と、依存関係である `UniverseLib.Mono.dll` の両方が配置されていることを必ず確認してください！
4. ゲームを起動して **F7** キー（デフォルトの表示切替キー）を押します。

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## 実際に使うことになる3つのパネル

| パネル | 主な用途 |
| --- | --- |
| **Object Explorer → Scene Explorer** | 画面上にある全オブジェクトのリアルタイム階層ツリー。目的のウィンドウもこの中のどこかにあります |
| **Inspector** | ツリー内の任意のオブジェクトをクリックして、全コンポーネントと全フィールドの現在の値を確認 |
| **C# Console** | C#コードを1行書いて実行中のゲーム上で即座に実行。再起動は不要 |

## 例1：バニラのウィンドウがどう作られているかを調べる

自作のウィンドウをゲーム公式のUIとそっくりに仕上げたいとします。手順はこうです：

1. ゲーム内で、参考にしたいウィンドウ（例えば「世界の法則（world law）」など）を開きます。
2. F7キーを押し、**Object Explorer → Scene Explorer** を開いて、`CanvasMain` → `canvas_ui` を展開します。
3. ハイライトされるオブジェクトが開いたウィンドウと一致するまで、子要素を順にクリックしていきます。
4. Inspector でコンポーネントを確認します：ナインスライスされたスプライトを持つ `Image`、`RectTransform` の各サイズ、`ScrollRect` など。

これでサイズ、スプライトのパス、そして構造が判明したので、**[カスタムウィンドウ](#/nml/custom-windows)** のページにそのままコピーして使えます。これでアンカーの配置調整に3時間溶かす悲劇を防げます :PES5_Peek:。

## 例2：アセットの実際のフィールド値を読み取る

**C# Console** を開いて次のコードを実行します：

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

UnityExplorer のログ出力に、すぐ次の内容が表示されます：

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

実行中のゲームから直接、バニラ特性（trait）のアイコンパスとグループIDを読み取れました。これを自作の特性にコピーすれば、UIの正しい位置に収まり、しかも実在するアイコンがちゃんと表示されます。

## 例3：Modを作る前にアイデアをその場で試す

引き続き C# コンソールで試してみます：

```csharp UnityExplorer C# console
// 座標 x=100, y=100 のタイル上にオオカミをスポーンさせる
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

ここで動けば、あなたのMod内でも確実に動きます。ここで例外を吐いて落ちたなら、わざわざビルドしてゲームを再起動する無駄な時間を丸ごと節約できたということです :aPES2_ThumbsUp:。

> [!TIP] コンソールと組み合わせて使う
> UnityExplorer は「これは何でできているのか？」に答えてくれます。BepInExコンソールは「自分のコードはちゃんと動いたのか？」に答えてくれます。Mod制作の悩みのほとんどは、この2つのどちらかに行き着きます。
