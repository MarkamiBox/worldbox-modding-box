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

これは、コードで手動配布することなく亜種特性をワールド内に自然発生させる仕組みで、これが楽しいやり方です。ライブラリは2つの抽選枠を管理しており、以下の2つのフィールドがあなたの特性がどの枠に入るかを決定します:

| フィールド | 説明 |
| --- | --- |
| `in_mutation_pot_add` | 変異イベントでこの特性が付与され得るか |
| `in_mutation_pot_remove` | 変異イベントで剥奪され得るか |
| `spawn_random_trait_allowed` | ランダム生成で選ばれ得るか |
| `rarity` | 選出される確率の重み |

ユニットの `mutation` ステータスが、これらの変異が発生する確率を決定します。**[ステータスリファレンス](#/nml/stats)** を参照してください。

> [!WARNING] 抽選枠が構築されるのはゲーム起動時の一度きりです
> `spawn_random_trait_allowed = true` を設定するだけでは不十分です。実際の抽選枠 `_pot_allowed_to_be_given_randomly` は、ゲームロード中に `BaseTraitLibrary.linkAssets()` が構築します。これはあなたのModが存在するより前のタイミングです。後から登録した特性はその枠に一度も入らず、変異で選ばれることはありません。バニラと同じ重み付けで、自分で追加してください：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.subspecies_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` は `protected` なので、NML がModのビルドに使うpublicize済みアセンブリに対してならコンパイルが通ります。`spawn_random_rate` の既定値は `5` です。数値を上げるほど出現頻度が上がります。

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

バニラの外見変異（バーガー、動く岩、触手ホラー、光の球、フラクタル）はすべて `$skin_mutation$` のクローンであり、そのテンプレートをクローンするのが動作するスキンを作る最短ルートです。ええ、バーガーは本物の突然変異です。Maximのなさることは計り知れません :wbpray:。

## 表現型、食性、そして卵

亜種特性が接続する3つの補助サブシステム:

| フィールド | 説明 |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | `AssetManager.phenotype_library` 内の表現型と特性を紐付ける |
| `is_diet_related` | 食性システムの一部としてマーク。`diet_*` ステータスタグと組み合わせる |
| `id_egg`, `phenotype_egg` | 卵生亜種における卵の形状定義 |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | 卵から孵化した際に実行される処理 |

## 遺伝子

冒頭で触れたオスとメスのステータスブロックは、亜種の**ゲノム**から来ています：スロットのある染色体と、各スロットに1つの遺伝子です。遺伝子は `BaseTrait` なので、このサイトの他の特性と同じように登録しますが、追加の作業が2つあります。要するに生物の宿題です。

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public const string EMBER_BLOOD = "hello_ember_blood";

        public static void Initialize()
        {
            if (AssetManager.gene_library.has(EMBER_BLOOD)) return;

            GeneAsset gene = new GeneAsset
            {
                id = EMBER_BLOOD,
                path_icon = "ui/Icons/iconHelloGene",
                needs_to_be_explored = false
            };

            AssetManager.gene_library.add(gene);
            gene.base_stats["damage"] = 2f;

            // Each world rolls every gene's DNA letters from its life seed when it loads.
            // A world may already be open, so roll yours now the same way.
            if (World.world != null && World.world.map_stats != null)
            {
                gene.generateDNA(World.world.map_stats.life_dna + gene.getIndexID());
            }

            // linkAssets() filled the mutation pool at startup. Without this, only the
            // player's gene editor can ever place it.
            AssetManager.gene_library._gene_assets_mutations.Add(gene);
        }
    }
}
```

- **DNAの文字。** どの遺伝子にも短い `ACGT` コードがあり、ワールドの読み込み時に、そのワールドの生命シードから抽選されます。あなたの遺伝子はその抽選に居合わせなかったので、同じ方法で自分の分を抽選します。
- **突然変異のプール。** 突然変異は、起動時に `linkAssets()` が埋めたプライベートなリスト `_gene_assets_mutations` から選ばれます。**publicize済み**のアセンブリならそこに追加でき、NMLはそれを使ってコンパイルします。省くと、遺伝子はプレイヤーが手で入れた場所にしか現れません。

遺伝子のテキストキーは `gene_<id>` です。遺伝子には説明行がありません：`GeneLibrary.add()` がオフにします。

```json Mods/HelloBox/Locales/en.json
{
  "gene_hello_ember_blood": "Ember Blood"
}
```

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

これで、そのクリーチャーの新しい亜種はすべて、この特性を持って始まります。これを省いて `in_mutation_pot_add` に任せると、いつかどこかで勝手に現れます。たいていはそちらの方が面白いです。

> [!TIP] 呪文はここと相性がいい
> バニラの魔法の血統は、呪文を1つ与えるだけの亜種特性です：`trait.addSpell("summon_lightning")` の後、ライブラリが起動時に呪文IDを解決しているので `trait.linkSpells()`。2行で子に受け継がれ、大陸をまたいで嵐を呼ぶ者たちの目に見える血筋が生まれます :PES5_CrazyPog:。
