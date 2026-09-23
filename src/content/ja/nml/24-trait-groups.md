---
title: 特性グループとタブ
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbfamilies:
order: 102
---

# 特性グループとタブ :wbfamilies:

すべての特性はいずれかの**グループ**に属しており、そのグループが特性図鑑にタブを描画します。6つの特性を追加してすべて `miscellaneous` に放り込むと、誰もスクロールしない一覧の奥底へと消え去ってしまいます。

自分専用のタブを作るのに必要なのは、たったの4行です。

## グループとは何か

グループは `BaseCategoryAsset` であり、ゲーム全体で最も小さなアセットです：

| フィールド | 役割 |
| --- | --- |
| `id` | 特性の `group_id` が指し示す先 |
| `name` | タブラベルの**ローカライズキー**。ラベルのテキストそのものではない |
| `color` | 16進数カラー文字列。タブとその配下の特性に色を付ける |
| `show_counter` | タブに "3 / 12" のような数値を表示するかどうか。デフォルトは `true` |

## 独自のタブを作成する

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // テキストではなくローカライズキー
                color = "#7FE7C4"
            });
        }
    }
}
```

作成した特性をそこへ向けます：

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

そしてタブ名を定義します：

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] 特性よりも前にグループを登録すること
> まだ存在しないグループを `group_id` に指定した特性は、描画される場所がありません。`OnModLoad` において、`HelloGroups.Initialize()` は必ず `HelloTraits.Initialize()` より前に呼び出してください。

## バニラのアクター特性グループ

自分独自のタブが不要な場合は、以下のいずれかを使用してください：

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## タブの表示順序

グループは `list` の順番どおりに描画され、`add()` は末尾に追加します。関連するタブの隣に並べたい場合は、登録後に位置を移動します：

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

どのライブラリでも `list` はプレーンな `List<T>` であるため、この手法はすべてのアセットライブラリで使えます。**[アセットライブラリ](#/nml/asset-libraries)** を参照してください。

## バニラグループの名前や色を変更する

グループを変更するために新規追加する必要はありません。`get()` でライブオブジェクトを直接取得できます：

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // 独自のローカライズキー
    fun.color = "#FFB35E";
}
```

バニラのグループを直接編集すれば、そのグループを参照しているバニラ特性が壊れず、過去のセーブデータも問題なく読み込めます。置き換えてしまうと両方とも壊れます :PES_NoSign:。

## 他の6つのグループライブラリ

アクターの特性は7つある特性システムのうちの1つに過ぎず、それぞれが独自のグループクラスを保持する専用のグループライブラリを持っています。本ページのコードはそれらすべてで同一であり、変わるのは2つの名称だけです：

| 特性システム | グループライブラリ | グループクラス | ページ |
| --- | --- | --- | --- |
| アクター | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | 本ページ |
| 文化 | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[文化特性](#/nml/culture-traits)** |
| 宗教 | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[宗教特性](#/nml/religion-traits)** |
| 亜種 | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[亜種特性](#/nml/subspecies-traits)** |
| 一族 | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[一族特性](#/nml/clan-traits)** |
| 言語 | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[言語特性](#/nml/language-traits)** |
| 王国 | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[王国特性](#/nml/kingdom-traits)** |

装備品も名前こそ違えど同じ概念を持ちます。**[アイテムグループとタブ](#/nml/item-groups)** を参照してください。

> [!TIP] 6つではなく1つのタブにまとめる
> 大規模なModを作っていると機能ごとにグループを作りたくなりますが、我慢してください。特性図鑑はすでに混雑しています。プレイヤーはModの名前がついた1つのタブなら探せますが、内部システム名がついた6つのタブは探してくれません。
