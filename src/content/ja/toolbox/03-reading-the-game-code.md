---
title: ゲームのコードを読む (dnSpy)
group: 概要
subgroup: 外部ツールとセットアップ
icon: :wbnerd:
order: 7
---

# ゲームのコードを読む :wbnerd:

WorldBox の Mod 制作に関する答えは、すべて最初から書かれています。そう、ゲーム自身の中にすべて眠っているのです :wbbru:。**dnSpy**（または **ILSpy**）を使えば、コンパイル済みのゲームファイルを人間が読める C# コードへと逆コンパイルして復元できます。メソッドの正確な名前、引数、そして実際の処理内容をその場で確認できます。

これこそが、「ネットのコード断片をコピペする段階」から「本格的な Mod 制作」へとステップアップする最大の近道です :3074-woah:。

## ゲームのファイルを開く

1. [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases)（または [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases) - 仕組みは同じでUIボタンが異なるだけです）をダウンロードします。
2. 次のファイルを開きます：

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

この単一のファイルの中に、ゲーム全体の全コードが収まっています。左側のツリーには `Actor`、`AssetManager`、`GodPower`、`ScrollWindow` など、すべてのクラスが並びます。

## 日常的に行う4つの必須操作

### 1. クラスを調べる

`Ctrl+Shift+K` で型を検索します。`ActorTrait` と入力して開くと、設定できるすべてのフィールドが、その型とデフォルト値付きで表示されます：

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

そのリストこそが **[カスタム特性](#/nml/custom-traits)** ページのドキュメントです。**型**も読んでください：`rate_birth` は `int` なので、`rate_birth = 0.5f` はコンパイルできません。`ItemAsset`、`BuildingAsset`、`StatusAsset`、何でも同じ方法が使えます。

### 2. メソッドの正確なシグネチャを確認する

メソッド名を勘で当てようとすると、コンパイルエラーで1時間を無駄に溶かす羽目になります。調べるのが一番です。`Actor` の中で `addTrait` を検索するとこう出てきます：

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

これで、文字列を引数に取り、bool を返し、省略可能な第2引数があることが一目瞭然です。

### 3. ゲーム本体がどう書いているかを見る

これが最も強力な活用法です。正常に動く「世界の法則」を作りたいとします。`WorldLawLibrary` を見つけて `init()` を開き、開発元自身が何を書いているか読み取ってみましょう：

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

この構造を真似て、id とアイコンを書き換えるだけで、独自の法則が動くようになります。ゲーム内のあらゆる `*Library.init()` は、そのアセットタイプの極上の無料チュートリアルです。

### 4. すべての ID を一覧で見つける

ID はただの文字列なので、スペルミスがあってもゲームは何も言わずに静かに無視して失敗します。各種 `init()` メソッドこそがその宝庫です：`TileLibrary.init()` には全地形ID、`ItemLibrary.init()` には全武器ID、`ActorAssetLibrary.init()` には全生物IDが網羅されています。

## public、internal、そしてあなた

コードを読んでいると、メソッドの前に3つの単語が付いているのに気づくはずです：

| 単語 | Mod制作者にとっての意味 |
| --- | --- |
| `public` | いつでも自由に呼び出せます。 |
| `internal` | **publicized**（公開化）された `Assembly-CSharp.dll` を参照してビルドする場合にのみ呼び出し可能 |
| `private` | 直接呼び出すことはできません。それを呼び出している public メソッドを探すか、パッチを当ててください（**[Harmony パッチ](#/nml/harmony-patches)** を参照） |

"publicized" な DLL とは、すべてのメンバを強制的に public に書き換えた改造コピーのことです。WorldBox の Mod 制作者の多くがこれを使っており、`actor.getHit(...)` のようなコードが彼らの環境ではビルド通り、あなたの環境では通らない理由もここにあります。何かがビルドできず、dnSpy で `internal` と書かれていたら、原因はまさにこれです。

> [!TIP] コードを書くときは常に開きっぱなしにしておく
> 「ゲームのコードを最初から全部読め」という話ではありません。そんな無茶をする人はいません。エディタの隣に開いておき、使う名前が出てくるたびにサッと確認するだけで十分です。ここで2秒調べるだけで、原因不明のコンパイルエラーに20分頭を抱える悲劇を防げます :PES_ThumbsUp:。

メソッドの名前やシグネチャだけを確認したいときは、このサイトの **[メソッド検索](#/tools/methods)** を使う方が手っ取り早いです。ゲーム内の全メソッドを網羅しており、`internal` もあらかじめ明記されています。そのメソッドが実際に*何をしているのか*の中身を読みたいときに、改めて dnSpy に戻ってきましょう。それだけはどんな索引ツールでも代わりがききません。
