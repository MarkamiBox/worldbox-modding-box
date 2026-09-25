---
title: Modのファイル構成
group: NML Modding
subgroup: 基本ワークフロー
icon: :wbsavebuttonbox:
order: 20
---

# Modのファイル構成 :wbsavebuttonbox:

## Modが配置される場所

すべてのModは、WorldBoxフォルダ内の `Mods/` に置かれた**1つのフォルダ**として存在します：

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

もし `Mods` フォルダがまだ存在しない場合は、右クリック → 新規作成 → フォルダ で `Mods` という名前で作成してください。その中に自分で考えた名前のMod用フォルダを作ります。

## Mod内部の構造

```text
HelloBox/
├── mod.json          <- Modの身分証明書（必須）
├── icon.png          <- Modのプレビューアイコン
├── Code/             <- ソースコードを入れるフォルダ
├── Locales/          <- テキストと翻訳ファイル（en.json など）
└── GameResources/    <- カスタムテクスチャ、アイコン、ドット絵、効果音
```

すべてのModに `mod.json` が必要です。HelloBoxにはC#のエントリーポイントも必要になります。他のフォルダは必要になった時に作れば問題ありません。`mod.json` と `Code/` だけの構成でも、立派な動作するModです。空のフォルダーは誰も感心させません。

#### 各フォルダの役割

- **`mod.json`**: 身分証明書です。これがないと、NMLはModが存在しないものとして扱います。
- **`icon.png`**: ゲーム内のModメニューで表示されるプレビュー画像です。
- **`Code/`**: すべての `.cs` ソースファイル（`Main.cs` など）を置くフォルダーです。実はNMLはMod内のどこにあっても、サブフォルダの中も含めて見つけた `.cs` ファイルをコンパイルします（`bin/`、`obj/`、`Properties/`、`packages/`、およびドットで始まる名前のフォルダは除外）。つまり `mod.json` の隣に直接置かれた `.cs` ファイルでも動作しますし、実際そうしているModもありますが、`Code/` にまとめておけばプロジェクトがゴミ捨て場になるのを防げます。**NMLは必要なタイミングでソースをコンパイルし、コンパイル済みのキャッシュを再利用できます。** 本ガイドのために別途ビルド手順を用意する必要はありません。
- **`Locales/`**: 翻訳ファイル（`en.json` など）を配置します。これがないと、追加したアイテムや特徴がゲーム内でプレースホルダーキーのまま生表示されてしまいます。
- **`GameResources/`**: カスタムテクスチャ、ドット絵、特徴アイコン、武器スプライト、効果音などを入れます。NMLがこの名前で探すため、フォルダ名は正確に指定してください。詳しくは **[スプライト＆リソース](#/nml/sprites-and-resources)** を参照してください。

> [!WARNING] フォルダ名の大文字小文字は区別されます（PC上では気づきません）
> Windowsでは `Locales` と書こうが `locales` と書こうが気にしません。Linuxは気にします。NMLは `Locales` と `GameResources` という綴りを正確に探すため、あなたの環境では動くModが、他の人の環境ではテキストもスプライトも一切表示されない、ということが起こり得ます。上記の大文字表記に合わせておけば、この問題自体が発生しません。

#### 他人のModで見かけるフォルダ

始めるにあたって以下のフォルダは一切不要です。ただし他人のModを開いたときに目にすることになるので、それぞれの役割を説明します。

| フォルダ | 役割 |
| --- | --- |
| `Assemblies/` | ソースModのためのサードパーティ製マネージドライブラリです。NMLはこのフォルダ直下にある `.dll` ファイルをコンパイラの参照として集め、読み込みを試みます。ゲームやNMLのDLLを置く場所ではありません |
| `GameResourcesReplace/` | NMLは `GameResources/` の直後に、まったく同じ方法でこれを読み込みます。NMLはこの名前をNCMS互換の扱いとして分類しています。新しいModでは単に `GameResources/` を使ってください |
| `EmbededResources/` | はい、スペルミスに見えますが、これが正しい綴りです。ここに入れたファイルは、**NCMS形式**のModのコンパイル済みコードに埋め込まれます。確認したソースコンパイラは、NCMS互換用の分岐でのみこれを読み込みます。HelloBoxの `BasicMod` コードに対する自動埋め込み機能ではありません。その分岐で使われるフォルダ名は `EmbeddedResources/` ではありません |

#### ソースの代わりに `.dll` を配布する

確認した範囲のローダーでは、`mod.json` の**直下**にある `.dll` で終わるファイルがプリコンパイル方式を選択させます。NMLはソースのコンパイルをスキップし、ルート直下のDLLを読み込みます。コンパイル済みのHelloBoxのDLLをそこに置き、リリースからは `Code/` を除外してください。ビルドとパッケージングの確認事項については **[Modの公開](#/nml/publishing)** を参照してください。

> [!WARNING] .dllが1つ迷い込むだけでコードが無効になる
> `mod.json` の隣に置かれたライブラリがソースModを「壊す」理由もこれです。NMLはその `.dll` を見つけると `Code/` をスキップしてしまい、あなたの変更は一切読み込まれません。ライブラリは必ず `Assemblies/` に置き、Modのルートには置かないでください。


### マニフェストファイル

`mod.json` はNeoModLoaderがあなたのModを認識するために必須のファイルです :pepeOK:。Modフォルダの直下に配置します。

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### 各フィールドの意味

| フィールド | 役割 |
| --- | --- |
| `name` | 表示名。ここでは `HelloBox` |
| `author` | あなたの名前 |
| `version` | リリースバージョン。公開のたびに上げます |
| `description` | 簡単な説明 |
| `iconPath` | Modフォルダからの相対アイコンパス |
| `GUID` | 変わらない識別子です。NMLはこれを `UID` に正規化します。この例では `COM_YOURNAME_HELLOBOX` になります。リリース後は変更しないでください |
| `RepoUrl` | リポジトリやサポートURLのメタデータです。実際に配布するNMLのバージョンでどう表示されるか確認してください |
| `Dependencies` | 必須Mod IDです。文書化されているソースのワークフローでは、コンパイルを成功させるためにこれらが必要になります |
| `OptionalDependencies` | 任意Mod IDです。NMLはソースコンパイル時にこれらの参照とコンパイラシンボルを提供できます |
| `IncompatibleWith` | 競合の宣言です。ローダーのバージョンをまたいで同じように強制されるとは限りません |
| `UsePublicizedAssembly` | 確認した範囲のローダーでは既定で `true` です。ソースコンパイル時にNMLの公開化済みゲームアセンブリ参照を追加します |

> [!WARNING] 一覧を埋める前に競合の扱いを確認する
> 同梱のドキュメントでは `IncompatibleWith` は未完成の機能と説明されています。インストール済みのローダーには、リストに挙げたIDを調べる前に、空でないリストを持つModを削除してしまう除去処理があります。この例のリストは空のままにしてください。宣言を配布する前に、競合するModがある場合とない場合の両方で、手元のローダーのバージョンで実際に検証してください。

#### ModTypeとtargetGameBuild

確認した範囲のenumには `NEOMOD`、`COMPILED_NEOMOD`、`BEPINEX`、`RESOURCE_PACK` が含まれます。既定値は `NEOMOD` で、ルート直下のDLLが検出されると `COMPILED_NEOMOD` が選ばれます。

enumの名前があるからといって、それがそのまま使えるレシピとは限りません。確認した `LoadMod` メソッドは2種類のNeoMod形式だけを処理し、そのルート上ではそれ以外の値を拒否します。HelloBoxのマニフェストでは `ModType` を省略してください。`RESOURCE_PACK` を設定するだけで動作するテクスチャパックが作れる、と本ガイドは主張していません。

`targetGameBuild` に対応するJSONマッピングはアセンブリ内に存在しますが、確認したファイルベースのコンストラクタはそれを実際の宣言にコピーしません。互換性のゲートとしては使わないでください。テスト済みのゲームビルドとNMLのバージョンは、リリースノートに書いておきましょう。

#### マニフェストのキーは互換ではない

確認した宣言は `GUID` を実行時の `UID` にマッピングします。`id`、`mainClass`、`modLoader`、`gameVersion`、`homepage` へのマッピングは存在せず、確認したファイルベースのコンストラクタもこれらのキーを読み取りません。上記のフィールドの代わりにはなりません。

NMLはアセンブリの中から適切なエントリーポイントの型を自動で見つけます。`mainClass` という文字列を指定してもそれを選ぶことはできません。他のローダーのスキーマを持ち込むより、マニフェストは小さく保ちましょう。

#### 依存関係のシンボル

**ここで使われているASCIIのID**については、NMLはアルファベットを大文字化し、記号をアンダースコアに置き換えます。例えば `com.yourname.hellobox-extra` は `COM_YOURNAME_HELLOBOX_EXTRA` になります。このルールをすべてのUnicode文字に当てはめないでください。確認した正規化処理は一部の文字をそのまま保持します。

ソースコンパイル時、NMLは任意依存のIDがコンパイラ参照マップにエントリを持つ場合に、そのシンボルを定義します。インストールされているだけでは判定になりません。また、任意依存なしでコンパイルを再試行することもあります。

> [!WARNING] シンボルの綴りミスはコードを静かに消し去る
> 未知の `#if` シンボルは偽と評価されます。依存ID、`OptionalDependencies` の一覧、正規化後のシンボルを確認してください。コンパイルが成功したからといって、連携コードが含まれていた証明にはなりません。

完全な例と別途行うランタイムチェックについては **[他のModとの連携](#/nml/other-mods)** を参照してください。

#### Modフォルダを壊すもの

- **ゲームやローダーのDLLを同梱すること。** `Assembly-CSharp.dll`、その公開化済みコピー、`NeoModLoader.dll`、Unity製DLL、ゲームの `Managed/` フォルダからコピーしたその他のDLLは含めないでください。ビルド時にはローカルのコピーを参照し、配布用のzipには入れないでください。NMLの追加ライブラリ読み込み処理には特殊なケースと重複排除があるため、DLLをコピーすることは読み込まれるバージョンを置き換える確実な方法ではありません。
- **入れ子になったマニフェスト。** NMLはまずMod自身のフォルダにある `mod.json` を確認します。それが存在しない場合にのみ、そのフォルダの下を検索します。入れ子になった候補が複数ある場合、確認したローダーは警告を出し最初の結果を使います。この順序に依存しないでください。マニフェストは `HelloBox/mod.json` に1つだけ配置しましょう。
- **Mod内にソースのバックアップを入れること。** `dist/`、`backup/`、`old/` といったフォルダは、ソースコンパイル時に重複したC#クラスを持ち込む原因になります。リリース用のステージングやバックアップは、インストールするMod本体の外に置いてください。
- **パスをハードコードすること。** `BasicMod` クラスの中では、パッケージ化されたファイルに対して `GetDeclaration().FolderPath` と `Path.Combine` を使ってください。ゲームの `StreamingAssets/mods` ディレクトリはネイティブローダーの場所であり、HelloBoxのフォルダではありません。
- **パッケージの外へ出てしまうパス。** アイコンやリソースのパスは、大文字小文字を一致させた相対パスを使ってください。絶対パスや `..` を含むセグメントは配布しないでください。`Path.Combine` はパスを結合するだけで、プレイヤーから渡された入力があなたのフォルダの外に出ないことまではチェックしません。

> [!NOTE] 確認した内容について
> ここに書いたフォルダとコンパイラの挙動は、インストール済みのNMLアセンブリ（ファイルバージョン `1.2.0.1`、informational commit `cd47a1a6c437718d38e8f29240bdb761d543e09a`）と、同梱のNMLドキュメントをもとに実際に追跡したものです。すべてのリリースについて保証するものではありません。


## 少し専門的なコードの話 :elpepehacker:

すべてのModには、「こんにちは、私はModです」と宣言するC#ファイルが1つ必要です。最小構成の全体像がこちらです：

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

これは解説用の簡略版ではなく、実際に公開されている多くのModがまさにここから開発をスタートしています。

#### コードの解説

- **`using NeoModLoader.api;`**: 作業前にツールボックスを開くようなものです。毎回 `NeoModLoader.api.BasicMod` とフルネームで書く代わりに、`using` で「NMLのツールを手元に用意しておく」とコンピュータに伝えます。
- **`namespace HelloBox`**: コードの名字のようなものです。他の誰かのModにも `Main` クラスが存在する可能性があり、名前空間によって衝突を防ぎます。
- **`public class Main`**: C#においてすべてのコードは「クラス」の中に記述されます。クラスとは名前の付いた設計図やレシピのことです。
- **`: BasicMod<Main>`**: あなたのModの公式バッジです。NMLに *「私は正規のModです」* と伝え、その見返りにNMLはログ、設定、段階的な読み込み、翻訳を無料で提供してくれます。`<Main>` の部分は自分のクラス名を繰り返しているだけです。ええ、変な見た目ですが、いつもこう書きます。
- **`protected override void OnModLoad()`**: 最も重要なメソッドです。WorldBoxの起動時、NMLはこの扉を一度だけ叩きます。Modが登録するすべての要素（特徴、アイテム、神の力）はこの `{ }` の中に記述します。
- **`LogInfo(...)`**: Mod名があらかじめ付加されたログ行を出力します。コードが正常に動いているかを確認する基本的な手段です。詳しくは **[ログとデバッグ](#/nml/logs-and-debugging)** を参照してください。

> [!TIP] 従来の書き方
> 古いModでは以下のような書き方を見かけることがあります。ええ、これが普通だった頃を覚えているくらいには私も年寄りです：
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` は生インターフェースであり、`BasicMod<T>` はそれを実装して便利な機能を追加した既製クラスです。どちらも動作しますが、特別な理由がない限り `BasicMod` を使用することをおすすめします :PES5_Noted:。

## 次のステップ

基本構成を把握できたところで、実際に動くModを作ってみましょう：**[初めてのMod作成](#/nml/your-first-mod)**。
