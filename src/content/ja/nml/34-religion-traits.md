---
title: 宗教特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbpray:
order: 108
---

# 宗教特性 :wbpray:

**宗教**は都市や王国に属し、布教によって広がり、書物を執筆し、**儀式**を執り行います。儀式とは信者たちが自発的に試みる、世界を変貌させる企てです。宗教特性とは、そうした信仰箇条の一つです。

| | |
| --- | --- |
| ライブラリ | `AssetManager.religion_traits` |
| クラス | `ReligionTrait` |
| グループ | `AssetManager.religion_trait_groups`, クラス `ReligionTraitGroupAsset` |
| 実行時の所持者 | `Religion`, `World.world.religions` 内 |
| ローカライズ接頭辞 | `religion_trait_` |
| デフォルトのアイコンフォルダ | `ui/Icons/religion_traits/` |

> [!WARNING] 宗教のステータスはユニットに届かない
> これは `base_stats` が `Actor` に一切反映されない唯一の特性システムです。`Actor.updateStats()` が合成するのは亜種・氏族・言語・文化のみであり、**宗教はそのリストに含まれていません。**
>
> したがって宗教特性は、数値ではなくその*振る舞い*（儀式、環境変容、アクションフック）を通じて世界を変えることになります。宗教特性に `base_stats["damage"] = 10` と書くのは何の効果もない空振りであり、本ページで最もありがちな時間の無駄遣いです :PES4_BigSad:。

## 登録する

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // 信者が実行を試みる儀式
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` はゲーム起動時に一度だけ読み込まれます
> 新しい宗教は、ゲームロード中に `BaseTraitLibrary.linkAssets()` が構築するプールから初期特性を抽選します。これはあなたのModが存在するより前のタイミングです。特性にこのフラグを立てるだけでは何も変わりません。あなたの特性はそのプールに一度も入らず、新しい創始者に偶然付与されることもありません。バニラと同じ重み付けで、自分でプールに追加してください：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.religion_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` は `protected` なので、NML がModのビルドに使うpublicize済みアセンブリに対してならコンパイルが通ります。`spawn_random_rate` の既定値は `5` です。数値を上げるほど出現頻度が上がります。

## 儀式: `plot_id` フィールド

`plot_id` を持つ宗教特性は**儀式**になります。宗教はその儀式を `possible_rites` に蓄積し、陰謀の実行条件が揃うと指導者や司祭が自律的にそれを試みます。あなたは信仰を書き、残りは司祭がやってくれます :wbpray:。

```csharp
trait.plot_id = "summon_meteor_rain";
```

IDは `AssetManager.plots_library` を指します。バニラの儀式は既存の陰謀を再利用しています（`summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension`）。あなたも同様に再利用することも、事前に独自の `PlotAsset` を登録して指定することも可能です。

陰謀側で誰がそれを試行できるか、どの程度困難かが定義されます:

| PlotAsset フィールド | 説明 |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | 誰が実行を開始できるか |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | 必要な能力値条件 |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | 必要なレベルと名声 |
| `progress_needed`, `money_cost` | 所要時間と金銭コスト |
| `pot_rate`, `rarity` | AIがこれを選ぶ頻度 |
| `check_is_possible`, `check_should_continue` | 独自の実行・継続条件 |

## 地形変容: `transformation_biome_id` フィールド

宗教特性固有のもう一つのフィールドです。この特性を変容特性としてマークし、信仰が周囲に広めるバイオームを指定します:

```csharp
trait.transformation_biome_id = "biome_desert";
```

バニラではこれを `sands_of_ruin`（砂漠）、`shadowroot`（汚染）、`echo_of_the_void`（特異点）、`infernal_rot`（焦熱）、`cosmic_radiation`（荒野）で使用しています。これを持つ宗教は信者が住む地形を徐々に塗り替えていき、ゲーム中の単一特性として最大の視覚的変化をもたらします。

## 実際に何らかの処理を*実行*させる

ステータスによる強化が効かない以上、アクションフックこそが宗教特性の本領発揮の場です。利用できるフックは他の全特性と同じです:

```csharp
// 数秒ごとに信者各員に対して実行
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// 信者が死亡したとき
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

また、宗教特性は呪文や決断を付与することもでき、定期タイマーよりもこちらの方が自然な仕上がりになることが多いです:

```csharp
trait.addSpell("hello_bolt");           // 発射体・呪文・エフェクトを参照
trait.addDecision("burn_tumors");       // 信者が選択可能なAI決断
```

## バニラのグループ

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

独自のタブを作成する場合: **[特性グループとタブ](#/nml/trait-groups)** を参照してください（`AssetManager.religion_trait_groups` と `ReligionTraitGroupAsset`）。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## 特性を付与する

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

`Religion` は `cities`, `kingdoms`, `books`, `possible_rites` も公開しており、自作コードでその信仰が何を企んでいるかを調べる際は通常これらを参照します。

> [!TIP] 儀式こそが本質
> 数値を変えるだけの宗教は目に見えません。司祭がときおりメテオストームを呼び寄せる宗教こそ、プレイヤーがスクリーンショットを撮って共有する存在です。`plot_id` に情熱を注ぎましょう :aPES_Flames:。
