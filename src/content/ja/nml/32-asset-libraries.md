---
title: アセットライブラリ
group: ゲームコンテンツ
subgroup: 設計とステータス
icon: :wbbrain:
order: 90
---

# アセットライブラリ :wbbrain:

この後に続くすべてのページを理解するためには、まずこのページを押さえておく必要があります。WorldBoxに存在するありとあらゆる要素（特性、武器、建築物、タイル、雲、王国）は、**ライブラリ**の中に格納された**アセット**であり、ゲーム内のすべてのライブラリは同じ4つのメソッドを持つ同一のクラスです。

ここでその仕組みを一度学んでしまえば、残りの30ページはすべて「どのライブラリの、どのフィールドか」という話に集約されます。

## ライブラリとは何か

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // 登録順の全アセット
    public Dictionary<string, T> dict;   // ID引きの全アセット
}
```

構造はこれだけです。公開されたリストとディクショナリであり、どちらもModから自由に読み取りや変更が可能です。`AssetManager` にはこれが129個存在します。完全な一覧は **[すべてのアセットライブラリ](#/nml/asset-index)** を参照してください。

## 4つの基本メソッド

```csharp
AssetManager.traits.has("hello_swift");            // このIDは既に使われているか？
AssetManager.traits.get("hello_swift");            // 取得（なければnull）
AssetManager.traits.add(myTrait);                  // 新規アセットを登録
AssetManager.traits.clone("hello_new", "brave");   // 既存を複製して登録まで行う
```

### `has(id)`

IDが既に登録されている場合に `true` を返します。**あなたが書くすべての `Initialize()` の1行目は、必ずこのチェックで始まるべきです**：

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

これがないと、Modのリロード時にすべてが二重登録されてしまいます。

### `get(id)`

メモリ上の生のアセットオブジェクトを返します（存在しない場合は `null`）。例外を投げるわけでは**ない**ため、nullチェックを怠ると問題の発生場所から遠く離れた場所でクラッシュします：

```csharp
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // 常に。例外なく毎回。
```

`get` が*生きている実体*を返すという仕様は、このページで最も有用な知識です。バニラのコンテンツを丸ごと置き換えることなく、一部だけを直接変更できることを意味します：

```csharp
// バニラのドラゴンの他の要素には一切手を触れず、耐久力だけを強化する
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

新しいアセットを登録します。内部で起きる3つの重要な処理を理解しておく必要があります：

1. **IDが既に使われていた場合、古いアセットが削除されてあなたのものが上書き登録されます**。その際、ログに以下が出力されます：
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   これが、あるModが別のModを気づかないうちに破壊してしまう原因です。IDには必ず固有のプレフィックスを付けましょう。
2. アセットの `create()` メソッドが実行されます。
3. **ライブラリが `base_stats`（および保持している場合は `base_stats_meta`）のメモリを割り当てます**。このガイドの至る所で「ステータス設定は必ず `add()` の後」と口を酸っぱくして書かれているのはこれが理由です。

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- ここでステータスブロックが生成される
swift.base_stats["speed"] = 20f;       // <- この行の後でのみ安全にアクセス可能
```

この順序を間違えると、WorldBoxのMod制作で最も頻出するクラッシュが発生します：

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

`sourceId` のすべてのシリアライズ可能フィールドを新しいオブジェクトへディープコピーし、`newId` を与え、**その上で内部的に `add()` を呼び出します**。戻り値として複製されたインスタンスを返します。

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // 変更したい部分だけ上書きする
shrine.base_stats["health"] = 200;         // add()が既に実行された後なので安全
```

> [!WARNING] `clone()` の直後に `add()` を絶対に呼ばないこと
> 二重に `add()` を呼ぶと最初の複製が削除され、`duplicate asset overwriting...` がログに出力された上で再追加されます。動くことは動きますが、ログを汚して本当のエラーを見落とす原因になります。

10個以上のフィールドを持つもの（建物、アクター、アイテム、タイルなど）を作る際、クローンは最も確実なデフォルトの手法です。既に動作が保証されている設定をそのまま継承できるため、変更したいフィールドだけを理解すれば済みます。

## テンプレートアセット

ライブラリ内には、IDが `$` や `_` で始まる半完成状態のアセットが保持されています。これらは `dict` には登録されていますが `list` からは除外されているため、ゲーム内には直接現れず、純粋にクローン元として機能します。

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

完成品のアセットをクローンするよりも、テンプレートをベースにする方がほぼ常に安全です。ドナー固有の細かな設定まで引き継がずに済むためです。唯一の例外はイラスト素材です。`human` をクローンすれば人間のスプライトが手に入ります。目に見えるクリーチャーは、正しく設定されているが見えないクリーチャーに勝るからです :PES4_AlrightThen:。

## 既存のアセットを一覧表示する

クローン元としてどのようなIDが存在するかを知る最も早い方法は、一覧をコンソールに出力することです：

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

たった2行で、IDを当て推量する必要がなくなります。なお、`list` にはテンプレートが含まれませんが、`dict.Keys` にはテンプレートも含まれます。

## 表示順序の変更

`list` は通常の `List<T>` であり、ゲームはリスト内の順序どおりにグループやタブを描画します。したがって、自分のアセットを意図した位置へ差し込むことができます：

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## コードが実行されるタイミング

ゲームは起動時に129個のライブラリをすべて作り、次にそれらで `post_init()` を実行し、**その後で** NMLがあなたのModを読み込みます。私も含め、みんなが何度もつまずく結果が2つあります：

- **ライブラリが `post_init` で自動的に行うことは、すでに済んでいます。** 例えばアクターの特性は、そこでデフォルトの `path_icon` を設定されます。あなたの特性は設定されません。その時点ではまだ存在しなかったからです。自分で設定してください。
- **`OnModLoad` が実行される時点で、すべてのバニラアセットはすでに存在します。** なので `get("human")` も `clone(..., "human")` も動き、バニラの内容をその場で編集することもできます。早すぎるということはありません。

> [!NOTE] これらのメソッドにパッチを当ててもバニラの内容には触れない
> `has`、`get`、`add`、`clone`、`post_init` は、NMLがModを1つも読み込む前、ゲームの起動中に129個のライブラリ上で実行されます。どれかにHarmonyパッチを当てても、影響するのはあなたのModが読み込まれた*後*の呼び出しだけです。その時点で済んでいるバニラの登録には決して触れません。バニラの内容を変えたいなら？このページの他の部分と同じように、後から `get()` で変更してください。

## 今後のすべてのページで使用される基本パターン

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. 二重登録の防止
            if (AssetManager.<library>.has(ID)) return;

            // 2. 近いものがあればクローン、なければ新規作成
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. 必要なフィールドを書き換える
            asset.some_field = true;

            // 4. ステータス設定は必ず最後
            asset.base_stats["damage"] = 10;
        }
    }
}
```

このガイドのすべてのアセット解説ページは、名詞が違うだけでこの同一の骨組みに従っています。迷ったらここに戻ってきてください :PESgn_GoOn:。

## 机の前に貼っておくべき4つの鉄則

1. **まず `has()`。** 同じIDを二重登録しないこと。
2. **`clone()` は内部で `add()` を呼ぶ。** クローン後に `add()` を重ねて呼ばないこと。
3. **`base_stats` は `add()` の後にしか存在しない。** ステータス代入は一番最後。
4. **IDには必ずプレフィックスを付ける。** `swift` ではなく `hello_swift`。全Mod共通のフラットな1つの名前空間です。
