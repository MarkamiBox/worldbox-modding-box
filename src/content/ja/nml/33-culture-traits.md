---
title: 文化特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbtiphat:
order: 106
---

# 文化特性 :wbtiphat:

**文化**とは、都市群によって共有される習慣や慣習の集合体です。何を建築し、何を鍛造し、どのように継承し、何を読み、何を重んじるかを決定します。文化特性とは、そうした習慣の一つです。

7つある特性システムの中で、文化は最も影響範囲が広いものです。文化は都市の拡大とともに広がり、その創始者亡き後も存続し、その文化に属するあらゆる単一ユニットに能力値を合成します。1時間のゲームプレイを通じて世界全体に波及していくようなMODを作りたいなら、このライブラリが最適です。

| | |
| --- | --- |
| ライブラリ | `AssetManager.culture_traits` |
| クラス | `CultureTrait` |
| グループ | `AssetManager.culture_trait_groups`, クラス `CultureTraitGroupAsset` |
| 実行時の所持者 | `Culture`, `World.world.cultures` 内 |
| ローカライズ接頭辞 | `culture_trait_` |
| デフォルトのアイコンフォルダ | `ui/Icons/culture_traits/` |

## 登録する

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // 高い値ほどグループの上位に並ぶ
                spawn_random_trait_allowed = false,  // 確率で勝手に付与されない
                can_be_given = true,                 // プレイヤーがエディタで付与可能
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // 下記の警告を参照: これは兵士だけでなく農民にも波及します。
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

**[カスタム特性](#/nml/custom-traits)** の原則はここでもすべて共通です。ステータス設定の前に `add()` を呼ぶこと、`path_icon` は自動設定されないこと、IDには接頭辞をつけること。ここから先は、文化特性ならではの固有要素です。

> [!WARNING] 文化特性の `base_stats` は全員に波及する
> `Actor.updateStats()` はその文化の全ユニットに対して `culture.base_stats` を合成します。すべてのユニットです。「攻撃力 +5」の教義はパン職人まで武装させます。
>
> 特定の構成員にのみボーナスを適用したい場合は、`base_stats` を空のままにして `Actor.updateStats` の Harmony Postfix 内で自ら条件判定を行ってください。**[Harmonyパッチ](#/nml/harmony-patches)** を参照してください。個々の人物ではなく文化という集団そのものに適用したい場合は、代わりに `base_stats_meta` を使用してください。**[ステータスリファレンス](#/nml/stats)** を参照してください。

## 文化が鍛造するものを制御する

これは文化特性だけが持っている専用フィールドであり、武器アセットそのものに一切手を加えずに文化の「個性」を際立たせる最も洗練された手法です:

```csharp
trait.value = 10f;                       // 好みの重み付け
trait.addWeaponSubtype("sword");         // 武器カテゴリ全体を優先
trait.addWeaponSpecial("hello_relic");   // または特定のアイテムIDを優先
```

どちらのヘルパーも自動的に `is_weapon_trait = true` を設定します。都市が何を製造するか決定する際、クラフト処理が文化の推奨武器を読み取ります。数値を変えるのではなく、兵士の手にする武器そのものが変わるわけです。バニラの `bow_lovers` や `spear_lovers` もまったく同じ仕組みです。

| フィールド | 説明 |
| --- | --- |
| `is_weapon_trait` | 特性を武器の嗜好設定としてマーク |
| `related_weapon_subtype_ids` | 推奨される武器カテゴリ。`addWeaponSubtype` がここに追加 |
| `related_weapons_ids` | 推奨される特定アイテムID。`addWeaponSpecial` がここに追加 |
| `value` | 好みの選択重み |

## 文化の建築様式を制御する

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

`PassableZoneChecker` を受け取り、`town_layout_plan = true` を設定します。バニラの都市構造特性（柱状の町、道路の多い町）はこれによって動作しています。

これは本ページで最も深層に位置するフックであり、文化は一度に1つのレイアウト計画しか追従できないため、他のMODと最も競合しやすい箇所です。自作の特性が唯一のものだと決めつける前に、その文化が既に持っている特性の `town_layout_plan` を確認してください。

## バニラのグループ

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

独自のタブを作成する場合: **[特性グループとタブ](#/nml/trait-groups)** を参照してください（`AssetManager.culture_trait_groups` と `CultureTraitGroupAsset`）。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## 特性を付与する

```csharp
// この種族の全生物が最初から所持
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// または実行時、既に存在する文化に付与
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` と `addTrait` はID文字列またはアセットを引数にとります。

## ユニットから文化特性を確認する

非常によくある処理のため、`Actor` には専用のショートカットが用意されています:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] 文化か、亜種か？
> どちらも広がりますが、広がり方が異なります。**文化**特性は都市とともに広がり、その都市に加わった者なら誰でも習得できます。**亜種**特性は血統によって広がり、外部の者が後天的に得ることはできません。「エルフの弓の腕が良いのはそう育てられたからだ」は文化であり、「エルフの弓の腕が良いのはその目の構造によるものだ」は亜種です。**[亜種特性](#/nml/subspecies-traits)** を参照してください :catnoted:。
