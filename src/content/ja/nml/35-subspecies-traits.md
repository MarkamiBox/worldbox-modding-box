---
title: 亜種特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbelf:
order: 104
---

# 亜種特性 :wbelf:

**亜種**とは、独自の進化を遂げた種族の分派です（長命化、鱗の発生、卵生、発光など）。教育ではなく**生殖**によって広がり、独自の専用スプライトを保持できる唯一の特性システムです。そのため、亜種は独立したアクターを用意することなく、元の親種族とは全く異なる外見を獲得することができます。

| | |
| --- | --- |
| ライブラリ | `AssetManager.subspecies_traits` |
| クラス | `SubspeciesTrait` |
| グループ | `AssetManager.subspecies_trait_groups`, クラス `SubspeciesTraitGroupAsset` |
| 実行時の所持者 | `Subspecies`, `World.world.subspecies` 内 |
| ローカライズ接頭辞 | `subspecies_trait_` |
| デフォルトのアイコンフォルダ | `ui/Icons/subspecies_traits/` |

> [!WARNING] 亜種はアクターアセットのステータスを**置き換える**
> `Actor.updateStats()` において、亜種を持つユニットは `subspecies.base_stats` を合成し、`asset.base_stats` を完全に**スキップ**します。加算されるのではなく、どちらか一方のみが採用されます。
>
> したがって、`human` アセットに付与した数値は、亜種を持つ人間には一切届きません。ある程度時間が経過したワールドでは、大半の人間が亜種に属することになります :PES4_IDunnoMan:。

亜種はさらにオス用とメス用の別個のステータスブロックを適用しますが、それらは特性から来るものでは**ありません**。`AssetManager.gene_library` にあるゲノムから供給されます。亜種特性の `base_stats` は全員共通です。特性を通じて性別ごとの差異を作りたい場合は、氏族特性を使用してください。**[氏族特性](#/nml/clan-traits)** を参照してください。

## 登録する

```csharp Mods/HelloBox/Code/HelloSubspecies.cs
namespace HelloBox
{
    public static class HelloSubspecies
    {
        public const string SCALES = "hello_scales";

        public static void Initialize()
        {
            if (AssetManager.subspecies_traits.has(SCALES)) return;

            SubspeciesTrait trait = new SubspeciesTrait
            {
                id = SCALES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloSubspecies",
                in_mutation_pot_add = true,       // 変異によって付与される可能性がある
                in_mutation_pot_remove = false,   // 変異によって失われることはない
                spawn_random_trait_allowed = true,
                rarity = Rarity.R1_Rare
            };

            AssetManager.subspecies_traits.add(trait);

            trait.base_stats["armor"] = 5;
            trait.base_stats.addTag("immunity_fire");
        }
    }
}
```

## 変異

これは、コードで手動配布することなく亜種特性をワールド内に自然発生させる仕組みです。ライブラリは2つの抽選枠を管理しており、以下の2つのフィールドがあなたの特性がどの枠に入るかを決定します:

| フィールド | 説明 |
| --- | --- |
| `in_mutation_pot_add` | 変異イベントでこの特性が付与され得るか |
| `in_mutation_pot_remove` | 変異イベントで剥奪され得るか |
| `spawn_random_trait_allowed` | ランダム生成で選ばれ得るか |
| `rarity` | 選出される確率の重み |

ユニットの `mutation` ステータスが、これらの変異が発生する確率を決定します。**[ステータスリファレンス](#/nml/stats)** を参照してください。

## スプライト画像: 他のどの特性システムにもない要素

```csharp
trait.is_mutation_skin = true;
trait.sprite_path = "actors/species/mutations/hello_scales";
trait.animation_walk = ActorAnimationSequences.walk_0_3;
trait.animation_idle = ActorAnimationSequences.walk_0_3;
trait.animation_swim = ActorAnimationSequences.swim_0_3;
trait.skin_citizen_male = new List<string> { "male_1" };
trait.skin_citizen_female = new List<string> { "female_1" };
trait.skin_warrior = new List<string> { "warrior_1" };
trait.render_heads_for_children = true;

// ライブラリは内部ヘルパーでこれらを構築します。
// MODでは手動で同様にインスタンス化します:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| フィールド | 説明 |
| --- | --- |
| `is_mutation_skin` | 通常の特性ではなく外見スキンの差し替えであることを示す |
| `sprite_path` | テクスチャが格納されているフォルダ。末尾の `/` が必須です |
| `texture_asset` | 構築されたテクスチャアセット。上記のように手動で設定します |
| `skin_citizen_male` / `_female` / `skin_warrior` | 役割ごとのスキンバリアント。ユニットごとにランダム抽選 |
| `animation_walk` / `animation_idle` / `animation_swim` | 親種族のアニメーションを上書き |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | 成長段階ごとの影テクスチャ |
| `render_heads_for_children` | 子供に独立した頭部を描画するかどうか |
| `prevent_unconscious_rotation` | 気絶時に回転せず直立を保つ（球体やスライム等） |
| `remove_for_zombies` | ゾンビ化した際にこのスキンを解除するか |
| `priority` | ユニットが2つのスキンを持った場合の優先度 |

バニラの外見変異（バーガー、動く岩、触手ホラー、光の球、フラクタル）はすべて `$skin_mutation$` のクローンであり、そのテンプレートをクローンするのが動作するスキンを作る最短ルートです。

## 表現型、食性、そして卵

亜種特性が接続する3つの補助サブシステム:

| フィールド | 説明 |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | `AssetManager.phenotype_library` 内の表現型と特性を紐付ける |
| `is_diet_related` | 食性システムの一部としてマーク。`diet_*` ステータスタグと組み合わせる |
| `id_egg`, `phenotype_egg` | 卵生亜種における卵の形状定義 |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | 卵から孵化した際に実行される処理 |

## 遺伝子

遺伝子（Gene）は、ある亜種特性が別の特性へと変異するための仕組みです。ゲームは繁殖時に `AssetManager.genes` を巡回して何を受け継ぐかを決定します:

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public static void Initialize()
        {
            GeneAsset gene = new GeneAsset
            {
                id = "hello_swift_gene",
                id_trait = HelloSubspecies.SWIFT,
                rate = 0.05f
            };
            AssetManager.genes.add(gene);
            AssetManager.genes._gene_assets_mutations.Add(gene);
        }
    }
}
```

2つのフィールド:

- `gene.id_trait`: 登録した亜種特性にリンクします。
- `gene.rate`: 変異確率（0.0 〜 1.0）。

`_gene_assets_mutations.Add(gene)` の呼び出しを忘れると、遺伝子は登録されても変異抽選プールに一切追加されません。

## メタタグ

バニラの亜種特性のいくつかはタグしか持っていません。ゲームがそのタグに基づいて処理を分岐させているからです:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // 亜種がそのバイオームに入植可能
trait.base_stats.addTag("walk_adaptation_snow");                 // 構成ユニットが雪上を軽快に歩行
```

`base_stats_meta` は亜種自身に残ります。`base_stats` はユニットたちに届きます。タグ一覧は **[ステータスリファレンス](#/nml/stats)** を確認してください。

## バニラのグループ

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

独自のタブを作成する場合: **[特性グループとタブ](#/nml/trait-groups)** を参照してください（`AssetManager.subspecies_trait_groups` と `SubspeciesTraitGroupAsset`）。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## 特性を付与する

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

これにより、その生物から派生するすべての新亜種が最初からこの特性を帯びます。これを記述せず `in_mutation_pot_add` に任せれば、世界のどこかでいずれ自発的に発生するようになります。通常はその方が面白い展開を生み出します。

> [!TIP] 呪文との相性が抜群
> バニラの魔法血統は、呪文を1つ付与するだけの亜種特性です（`trait.addSpell("summon_lightning")`）。たった1行のコードが子孫へと受け継がれ、大陸全土に広がる雷呼びの一族が誕生します :PES5_CrazyPog:。
