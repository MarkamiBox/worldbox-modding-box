---
title: デバッグと公開
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# デバッグと公開 :wbfireworks:

プラグインはビルドできました。次は読み込まれて、動いて、他の人に届く必要があります。このページには実際に出会うエラーを出会う順に並べ、そのあとで公開の仕方を説明します。

## どこを見るか

| ファイル | 場所 | 中身 |
| --- | --- | --- |
| コンソールウィンドウ | 有効にしていればゲームと一緒に開く | すべてをリアルタイムで。**[ライブコンソール（BepInEx）](#/toolbox/bepinex-console)** を参照 |
| `LogOutput.log` | `worldbox/BepInEx/` | 同じ内容を保存したもの。人から求められるのはこれです |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Unity 自身のログ。BepInEx が捕まえられなかったクラッシュ用 |

まず `LogOutput.log` でプラグイン名を検索してください。それが出てくる最初のエラーが肝心です。**[ログとデバッグ](#/nml/logs-and-debugging)** と同じルールです。

## ビルドできないとき

| エラー | 意味 | 対処 |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | PCに .NET Framework 4.7.2 の開発者パックがない | **[プロジェクトの準備](#/toolbox/bepinex-modding)** の `Microsoft.NETFramework.ReferenceAssemblies` パッケージ |
| `CS0246: The type or namespace name 'Input' could not be found` | Unity のモジュールを参照していない | `UnityEngine.dll` だけでなく `UnityEngine*.dll` を参照する |
| `CS0122: '...' is inaccessible due to its protection level` | ゲームの `internal` メンバーを使った | `Assembly-CSharp` の参照に `Publicize="true"` |
| `The process cannot access the file ... because it is being used by another process` | ゲームが起動していて `.dll` を使用中 | WorldBox を閉じて、ビルドし直す |
| コピーの段階で `Could not find a part of the path` | `.csproj` の `GameDir` が間違っている | `worldbox.exe` があるフォルダを指すようにする |

## ビルドはできるが読み込まれないとき

ゲームを起動して `Loading [YourPlugin 1.0.0]` という行を探してください。この行がなければ、BepInEx はプラグインを見つけていません：

| 見えるもの | 理由 |
| --- | --- |
| 行がまったくない | `.dll` が `BepInEx/plugins/` の中にない。または BepInEx 自体が動いていない（コンソールも `LogOutput.log` もない） |
| 行がなく、`.dll` は正しい場所にある | プロジェクトの対象フレームワークが違う。`net8.0` や `netstandard2.1` ではなく `net472` にする |
| 行はあるが、その後に `Could not load file or assembly 'Something'` | プラグインと一緒に配っていないライブラリを使っている。そのライブラリの `.dll` をプラグインのフォルダに自分の `.dll` と並べて置く |
| 同じGUIDのプラグインが2つ | BepInEx は1つしか読み込みません。たいていは別フォルダにある自分のプラグインの古いコピー |

## 読み込まれるが壊れるとき

| エラー | たいていの原因 |
| --- | --- |
| `AssetManager...` での `NullReferenceException` | ゲームのライブラリ（library）に触るのが早すぎた。**[BepInEx でコンテンツを追加する](#/toolbox/bepinex-content)** の `AssetManager.init()` への Postfix を使う |
| `HarmonyException` / `Ambiguous match found` | パッチが存在しないメソッドや、同名のメソッドがあるメソッドを指している。対処は **[Harmony パッチ](#/nml/harmony-patches)** と同じ |
| ゲームのアップデート後の `MissingMethodException` / `TypeLoadException` | ゲームの中身が変わった。**[ゲームのアップデート後にmodを更新する](#/nml/game-updates)** の手順をたどって、ビルドし直す |
| 言語を切り替えるとテキストが生のキーになる | `LocalizedTextManager.setLanguage` への Postfix がない |
| アイコンが見えない | 何かがそのパスをすでに要求した後にスプライトを登録した。またはパスがフォルダを指している |
| 最初は動くのに、プレイ中にプラグインが止まる | `BepInEx/config/BepInEx.cfg` で `HideManagerGameObject = true` |

## もっと速いサイクル

変更のたびに WorldBox を閉じて開き直すのが、BepInEx で一番つらいところです。BepInEx.Debug というまとめに入っている **ScriptEngine** プラグインがそれを和らげます：`plugins/` ではなく `BepInEx/scripts/` に置いたプラグインは、ゲーム起動中にキー1つで再読み込みできます（今のキーは readme を見てください）。

ツール、ウィンドウ、オーバーレイにはとても便利です。コンテンツにはあまり役立ちません：ゲームは一度登録した特性（trait）を忘れませんし、適用した Harmony パッチは、プラグインがアンロード時に外さない限り残り続けます（`OnDestroy()` で `harmony.UnpatchSelf()`）。UIを作っているときに使い、特性の数値を調整しているときには期待しないでください :PES2_Shrug:。

## 公開

### zipに入れるもの

プラグインを Release モードでビルドし、プレイヤーがゲームフォルダにそのまま展開できるようにzipにします：

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

入れては**いけない**もの：

- **BepInEx そのもの。** プレイヤーはあなたと同じように一度だけインストールします。**[コンソールのページ](#/toolbox/bepinex-console)** を案内し、バージョンを書いてください：BepInEx 5、Mono、x64。
- **ゲームのファイル。** `Assembly-CSharp.dll`、Unity のモジュール、そして特にビルドが作った publicize 済みのコピー。これはゲームのコードで、あなたが配っていいものではありません。`.csproj` の `Private="false"` がすでにビルドフォルダから外しているので、手で追加しなければ大丈夫です。
- **`BepInEx.dll` と `0Harmony.dll`。** BepInEx がすでに持っています。

### バージョン番号

2か所で上げて、同じ値にそろえてください：`[BepInPlugin]` の `version`（ログや他のプラグインが見るもの）と、`.csproj` の `<Version>`（`.dll` ファイルが示すもの）。3回目のリリースなのにログに `1.0.0` と出るプラグインは、あらゆるバグ報告を難しくします。

### 他のプラグインに依存する

別の BepInEx プラグインを先に読み込む必要があるなら、それを宣言しましょう。BepInEx が読み込み順を整え、それがなければあなたのプラグインを読み込みません：

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

相手のプラグインが任意で、あるときだけその後に読み込まれたいなら、2つ目の引数に `BepInDependency.DependencyFlags.SoftDependency` を付けます。

### どこに公開するか

他の WorldBox のmodと同じ場所で、同じ注意点です：**[Modの公開](#/nml/publishing)** を参照。説明文に追加で必要なのは、一番上の "Requires BepInEx 5 (Mono x64)" の1行だけです。NMLしか入れていないゲームにインストールした人からの「動かない」コメントを減らせます :wbsalut:。
