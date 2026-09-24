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
MyCoolMod/
├── mod.json          <- Modの身分証明書（必須）
├── icon.png          <- Modのプレビューアイコン
├── Code/             <- ソースコードを入れるフォルダ
├── Locales/          <- テキストと翻訳ファイル（en.json など）
└── GameResources/    <- カスタムテクスチャ、アイコン、ドット絵、効果音
```

必須なのは `mod.json` のみです。他のフォルダは必要になった時に作れば問題ありません。`mod.json` と `Code/` だけの構成でも、立派な動作するModです。空のフォルダーは誰も感心させません。

#### 各フォルダの役割

- **`mod.json`**: 身分証明書です。これがないと、NMLはModが存在しないものとして扱います。
- **`icon.png`**: ゲーム内のModメニューで表示されるプレビュー画像です。
- **`Code/`**: すべての `.cs` ソースコード（`Main.cs` など）を格納する場所です。**ゲーム起動時にNMLが自動でコンパイルしてくれる**ため、自分で `.dll` をビルドしたりVisual Studioを用意したりする必要はありません。
- **`Locales/`**: 翻訳ファイル（`en.json` など）を配置します。これがないと、追加したアイテムや特徴がゲーム内でプレースホルダーキーのまま生表示されてしまいます。
- **`GameResources/`**: カスタムテクスチャ、ドット絵、特徴アイコン、武器スプライト、効果音などを入れます。NMLがこの名前で探すため、フォルダ名は正確に指定してください。詳しくは **[スプライト＆リソース](#/nml/sprites-and-resources)** を参照してください。

### マニフェストファイル

`mod.json` はNeoModLoaderがあなたのModを認識するために必須のファイルです :pepeOK:。Modフォルダの直下に配置します。

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### 各フィールドの意味

- **`name`**: ゲーム内のMod一覧に表示される親しみやすいMod名。
- **`author`**: あなたのユーザー名やニックネーム。自分の成果をアピールしましょう！
- **`version`**: Modのバージョン番号（例：`"0.1.0"`）。アップデートを公開するたびに増やします。
- **`description`**: Modの概要説明。詳細画面に表示されます。
- **`iconPath`**: プレビューアイコンへの相対パス（通常はMod直下の `"icon.png"`）。
- **`GUID`**: Modの一意な識別子。慣例として `com.yourname.modname` のようにすべて小文字で記述します。Modの社会保障番号のようなもので、他人のModとの衝突を防ぎます。**一度決めたら絶対に変更しないでください**：プレイヤーの設定ファイル名にこのGUIDが使われるためです。
- **`Dependencies`**: あなたのModを動かすために必須となる他のModのGUID。単体で動く場合は `[]` のままで構いません。
- **`OptionalDependencies`**: 存在すれば連携するが、必須ではない任意のMod。
- **`IncompatibleWith`**: 同時に有効化するとクラッシュや不具合の原因となるModのGUID一覧。両方が有効な場合、NMLがプレイヤーに警告を発します。

`"ModType": "RESOURCE_PACK"` や `"UsePublicizedAssembly": false` も設定可能です :PES5_Hmmmm:。


## 少し専門的なコードの話 :elpepehacker:

すべてのModには、「こんにちは、私はModです」と宣言するC#ファイルが1つ必要です。最小構成の全体像がこちらです：

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
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
- **`namespace MyCoolMod`**: コードの名字のようなものです。他の誰かのModにも `Main` クラスが存在する可能性があり、名前空間によって衝突を防ぎます。
- **`public class Main`**: C#においてすべてのコードは「クラス」の中に記述されます。クラスとは名前の付いた設計図やレシピのことです。
- **`: BasicMod<Main>`**: あなたのModの公式バッジです。NMLに「私は正規のModです」と伝え、その見返りとしてNMLからログ出力、設定管理、多言語対応の仕組みが無償で提供されます。`<Main>` 部分は自身のクラス名を繰り返しているだけです。少し奇妙に見えますが、常にこのように書きます。
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
> }
> ```
> `IMod` は生インターフェースであり、`BasicMod<T>` はそれを実装して便利な機能を追加した既製クラスです。どちらも動作しますが、特別な理由がない限り `BasicMod` を使用することをおすすめします :PES5_Noted:。

## 次のステップ

基本構成を把握できたところで、実際に動くModを作ってみましょう：**[初めてのMod作成](#/nml/your-first-mod)**。
