---
title: 王国と勢力
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbkingdoms:
order: 178
---

# 王国と勢力 :wbkingdoms:

WorldBoxのすべてのユニットはいずれかの王国に所属しています。文明種族だけではありません。オオカミはオオカミの王国に、盗賊は盗賊の勢力に、中立のニワトリは中立の王国に属しています。`KingdomAsset` は勢力の**種類**を定義するものであり、マップ上の個別の王国ではありません。

この違いをしっかり押さえておきましょう：

| | |
| --- | --- |
| `AssetManager.kingdoms` 内の `KingdomAsset` | テンプレート。「オークの王国とはどういうものか」 |
| `World.world.kingdoms` 内の `Kingdom` | 稼働中のワールドに実在する名前、色、都市を持つ王国 |

あなたが登録するのは前者であり、ゲームが生成するのが後者です。

## テンプレートをクローンする

アクターと同様に、王国にもこの目的のために `$TEMPLATE$` IDが用意されています：

| テンプレート | 用途 |
| --- | --- |
| `$TEMPLATE_CIV$` | 文明勢力 |
| `$TEMPLATE_CIV_NEW$` | 新しい動物文明スタイル |
| `$TEMPLATE_NOMAD$` | 定住前の放浪段階 |
| `$TEMPLATE_MOB$` | 敵対的モンスター勢力 |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | 一部に敵対するが文明には友好的 |
| `$TEMPLATE_ANIMAL$` | 野生動物 |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | 自発的に攻撃しないおとなしい動物 |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // 定住した文明勢力
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // 都市を築く前の野生・放浪段階
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` はすでに `nomads = true`, `civ = false`, `mobs = true` を設定済みです。ここで注意すべき重要な点があります：**`civ`, `nomads`, `mobs` などは `bool` フィールドであり、タグではありません。** `wild.nomads = true` は有効なフィールド代入ですが、`wild.addTag("nomads")` はゲーム内のどのコードも参照しない無意味なタグとなり、何のエラーも吐かずに無視されます :aPES_Liar:。

次に、アクター側からこれらを指定して両者を結びつけます：

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

これを忘れると、クローン元の生物が所属していた王国（大抵は人間）にスポーンしてしまい、奇妙な光景を生み出すことになります。

## 各フィールドの解説

### どういった勢力か

| フィールド | 役割 |
| --- | --- |
| `civ` | 都市を築き、戦争を行い、指導者を持つ |
| `nomads` | 定住前の放浪段階 |
| `nature` | 野生動物 |
| `mobs` | 敵対的モンスター |
| `neutral` | 挑発されない限り誰も攻撃しない |
| `abandoned`, `concept` | ゲーム内部の管理用勢力であり、実際の民ではない |
| `brain` | AI制御のメタ勢力 |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | ゲーム内のリストでどの枠に分類されるか |

### どのように振る舞うか

| フィールド | 役割 |
| --- | --- |
| `always_attack_each_other` | このタイプの王国同士は常に敵対関係になる |
| `units_always_looking_for_enemies` | 所属ユニットが常に敵を探し回る |
| `count_as_danger` | 他勢力から危険と見なされるか。デフォルトは `true` |
| `friendship_for_everyone` | あらゆる存在に対して友好的 |
| `force_look_all_chunks` | 周辺だけでなくマップ全域を索敵する（高負荷） |
| `building_attractor_id` | 引き寄せられる特定の建築物タイプ |

### タグ：誰が誰と戦うか

これが最も重要な仕組みであり、数値ステータスではなく3種類の文字列セットによって定義されます：

```csharp
kingdom.addTag("civ");             // 自分が何者か
kingdom.addFriendlyTag("neutral"); // 誰を味方とみなすか
kingdom.addEnemyTag("orc");        // 誰を敵とみなすか
```

2つの王国はタグを比較し合って初期の外交関係を決定します。タグを持たない勢力は誰も好まず、誰も嫌わず、何も面白い行動を起こしません。

### 外観

| フィールド | 役割 |
| --- | --- |
| `path_icon`, `show_icon` | 勢力アイコン。`setIcon(path)` で両方同時に設定可能 |
| `default_kingdom_color`, `default_civ_color_index` | 初期の王国カラー |
| `color_building` | 建築物に適用されるカラーティント |

## 勢力に関連するその他のシステム

王国アセット単体は単なるラベルに過ぎません。完全な勢力を成立させるために連携するライブラリは以下の通りです：

| 要素 | ライブラリ | 用途 |
| --- | --- | --- |
| 旗・紋章 | `AssetManager.kingdom_banners_library` | 自動生成される国旗 |
| 色 | `AssetManager.kingdom_colors_library` | 王国に割り当てられるカラーパレット |
| 王国特性 | `AssetManager.kingdoms_traits` | 国家方針（主に税率など）。**[王国特性](#/nml/kingdom-traits)** を参照 |
| 王国の職務 | `AssetManager.job_kingdom` | 勢力AIが取り組む課題 |
| 王国のタスク | `AssetManager.tasks_kingdom` | それらの職務を支えるビヘイビアツリー |
| 戦争の種類 | `AssetManager.war_types_library` | 宣戦布告可能な戦争のカテゴリ |
| 建築様式 | `AssetManager.architecture_library` | 建物のグラフィック |
| 建築順序 | `AssetManager.city_build_orders` | 新しい都市が建てる施設とその優先順位 |
| 名前ジェネレーター | `AssetManager.name_generator`, `AssetManager.name_sets` | 王国、都市、人名の命名ルール |

特別な理由がない限りバニラのものを再利用しましょう。アクターに `banner_id = "human"` を設定するだけで、完成された国旗ジェネレーターがそのまま手に入ります。

## 実行時に王国を操作する

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` は「このオブジェクトは破棄されたが、まだどこかから参照が残っている」ことを判定する拡張メソッドです。王国、都市、軍隊、ユニットをループ処理する際は必ずこれをチェックしてください。1時間ごとにModがクラッシュするか安定して動くかの分かれ目です :aPES2_Sweat:。

## 性格（パーソナリティ）

王や都市の指導者には **性格（Personality）** が付与されます。これは称号といくつかの `personality_*` ステータスで構成され、王国が好戦的になるか外交的になるかを左右します。登録自体は3行で済みますが、誰かにそれを *持たせる* のが難点です：`Actor.updateStats()` はステータスが更新されるたびに、バニラの4種類の ID から名前で直接1つを選択してしまいます。

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Postfix パッチはステータス更新のたびに実行されるため、性格の差し替えが維持されます。バニラの性格の数値を差し引いてから自作の数値を加算するため、ステータスが二重に付与されるのを防ぎます。`s_personality` と `mergeStats()` は `internal` メンバーです。NML が使用する **publicized** アセンブリに対してコンパイルされます。

## 友好度・忠誠度・幸福度

3つの小さなライブラリが政治の力学を制御しており、いずれも計算デリゲートのリストとして構成されています：

| ライブラリ | 呼び出し対象 | 戻り値 |
| --- | --- | --- |
| `AssetManager.opinion_library` | 王国のペアごと | 相手に対する友好度ポイント |
| `AssetManager.loyalty_library` | 都市ごと | 所属王国に対する忠誠度ポイント |
| `AssetManager.happiness_library` | ユニットに発生したイベント | 固定の幸福度増減値 |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

友好度と忠誠度は毎回リスト全体から合算されるため `add()` するだけで十分であり、`translation_key`（数値がマイナスの場合は `translation_key_negative`）によって内訳画面に独自の1行として表示されます。幸福度イベントはコード内で `actor.changeHappiness("hello_warm_embers")` を呼び出すことで発生します（**[陰謀・計画](#/nml/plots)** の祭典などで使用されます）。

> [!WARNING] 幸福度項目には起動時に番号が振られます
> ユニットの幸福度履歴には ID ではなく項目の *インデックス番号* が保存され、`HappinessLibrary.post_init()` が一度だけ番号を割り振ります。自作の項目は 0 のままになり、バニラの最初の項目として表示されてしまうため、`index` を手動で設定してください。

## 他のシステムの旗・紋章

旗を持つのは王国だけではありません。文化、宗教、氏族、言語、亜種、家族のそれぞれに専用の旗パーツライブラリ（`AssetManager.culture_banners_library` など）が存在します。それぞれパスのリストを持つ `main` アセットを1つ持ち、新規文化はそこからインデックスを抽選します。

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

パスは旗が描画される際に個別に読み込まれるため、キャッシュ更新などの処理は不要です。リストの末尾を超えるインデックスは自動的に 0 にフォールバックするため、Mod 導入下で作成されたセーブデータも Mod なしで問題なく開くことができます。バニラのパーツサイズに合わせるため、描画前に **[UnityExplorer](#/toolbox/unity-explorer)** で確認しておきましょう。

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] 新しい王国アセットは通常不要です
> 新しい生物種には必要ですが、新しい *行動パターン* には不要です。大半の「派閥」系 Mod は、王国の特性、文化、または外交判定への Harmony パッチとして実装する方がはるかに適切です。既存の王国に行動を変えさせたいだけなら、王国アセットを新規追加する必要はありません。
