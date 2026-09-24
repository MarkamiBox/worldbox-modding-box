---
title: アイテムグループとタブ
group: ゲームコンテンツ
subgroup: アイテムと装備
icon: :wbgold:
order: 124
---

# アイテムグループとタブ :wbgold:

アイテムグループとは、装備ウィンドウ内の分類カテゴリです（兜、剣、アミュレットなど）。これは特性（trait）タブを描画するのと同一の小さな `BaseCategoryAsset` であり（**[特性グループとタブ](#/nml/trait-groups)** を参照）、`AssetManager.item_groups` に格納されています。

大きな違いは、アイテムグループが内部に**プール（抽選枠）**を保持している点であり、このプールを作り忘れるとMODがクラッシュします :PESgn_Yikes:。

## バニラのグループ

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## 独自のカテゴリを作成する

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

| フィールド | 説明 |
| --- | --- |
| `id` | アイテムの `group_id` が指し示す先 |
| `name` | タブラベル用のローカライズキー |
| `color` | カテゴリを彩る16進数カラーコード |
| `show_counter` | タブにアイテム数を表示するか。デフォルトは `true` |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## プール（抽選枠）

ゲームはグループごとに装備のバケツ（リスト）を管理しており、ゲーム自体のライブラリ初期化時にそれらのバケツを満たします。これは**MODが起動する前**のタイミングです。新設されたばかりのグループにはバケツが存在しないため、最初にそれを要求した処理が例外を投げます:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

アイテムを登録する前に、グループごとに1回、手動でプールを初期化してください:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` はグループ内の全アイテムです。`_unlocked` は生成器が現在ランダム生成できるアイテム一覧です。両方が存在している必要があります。

## アイテムをグループに登録する

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // どの装備スロットに装着されるか
relic.equipment_subtype = "hello_relic";       // 文化特性が参照する武器種別
```

混同しやすい3つの独立した設定:

| | |
| --- | --- |
| `group_id` | ウィンドウのどの**タブ**の下に表示されるか |
| `equipment_type` | 身体のどの**スロット**に装着されるか: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | どの**武器クラス**に属するか: `sword`, `axe`, `bow`… 文化（culture）特性の好みの対象 |

新しいグループを作っても、新しい装備スロットが手に入るわけでは**ありません**。`EquipmentType` はゲームアセンブリ内で固定された列挙型であるため、自作の遺物（Relics）はアミュレットのスロットを占有しつつ、ウィンドウ内では独立した専用の棚を得ることになります。

## カテゴリが表示される位置

グループは `list` の順序通りに描画され、`add()` は末尾に挿入します。近しいカテゴリの隣へ並び替えるには:

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## バニラのカテゴリ名を変更する

`get()` は稼働中のインスタンスを返すため、新設する代わりに既存のバニラカテゴリの用途を変更することもできます:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // 独自のローカライズキー
    helmet.color = "#BAD0FF";
}
```

バニラの全兜は引き続き `helmet` を参照し続けるため、何も破損せず古いセーブデータも正常にロードできます。グループごと置き換えてしまうと既存の全兜が孤立してしまいます :aPES2_HmmmmApprove:。

> [!TIP] スロットを再利用し、棚の名前を変える
> 「新しい装備タイプを追加する」MODの大半は、実質的に「既存スロットのまま、棚と名前だけを変える」手法をとっています。この方法ならわずか4行で済み、セーブデータを壊す心配もありません。本質的に新しいスロットを追加するにはゲームの `EquipmentType` 列挙型を変更する必要がありますが、それは不可能です。
