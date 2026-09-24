---
title: 氏族特性
group: ゲームコンテンツ
subgroup: 特性と遺伝
icon: :wbclanroses:
order: 110
---

# 氏族特性 :wbclanroses:

**氏族（Clan）**とは血統です。独自の紋章、色、名声を獲得するほどに拡大した一族を指します。氏族特性（trait）とは、その血統が宿す力そのものです。

氏族特性はゲーム内で遺伝的超能力に最も近い存在であり、最初から**オス・メスのステータス分離**を備えている唯一の特性システムです。

| | |
| --- | --- |
| ライブラリ | `AssetManager.clan_traits` |
| クラス | `ClanTrait` |
| グループ | `AssetManager.clan_trait_groups`, クラス `ClanTraitGroupAsset` |
| 実行時の所持者 | `Clan`, `World.world.clans` 内 |
| ローカライズ接頭辞 | `clan_trait_` |
| デフォルトのアイコンフォルダ | `ui/Icons/clan_traits/` |

## 登録する

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

氏族の `base_stats` は氏族の全構成員に合成されるため、宗教（religion）とは異なり実質的なステータスシステムとして機能します。合成順序は **[ステータスリファレンス](#/nml/stats)** を参照してください。

## オス・メスのステータス分離

他の特性クラスには存在しない2つの専用フィールド:

```csharp
trait.base_stats["health"] = 20;           // 全構成員共通
trait.base_stats_male["damage"] = 6;       // オスのみ
trait.base_stats_female["intelligence"] = 4;   // メスのみ
```

`Actor.updateStats()` はまず `clan.base_stats` を合成し、次にユニットの性別に応じて `clan.base_stats_male` **または** `clan.base_stats_female` を合成します。どちらの追加ブロックも最初からインスタンス化されており、`add()` で後から割り当てられるわけではないため、いつでも値を書き込むことができます。

## 決断: 氏族が*行う*行動

バニラの氏族特性はアクションよりも決断（Decisions）を重視します。氏族とは社会的な集団だからです:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

決断とは `AssetManager.decisions_library` に定義されるAIの行動選択肢です。バニラの氏族特性である `blood_pact` と `deathbound` は、異なる決断を持つ同一特性であり、互いに相反する特性として宣言されています。1つの軸に対して排他的な2つの特性を定義するこのパターンは、真似する価値があります。

## 戦闘と効果のフック

```csharp
// 氏族メンバーの攻撃が命中するたび
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// タイマー駆動、氏族メンバー各員に対して実行
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

nullチェックを徹底し、何もしなかった場合は `false` を返してください。これらはその特性を持つすべての氏族のすべての構成員に対して実行されます。

## 実績によるロック

バニラの氏族特性のいくつかは、デフォルトで開放されておらず実績（achievement）報酬となっています:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

ロックされた特性も存在し、正常に機能します。単に実績を解除するまでプレイヤーがエディタ上で手動選択できないだけです。なお、この方法でロックされた特性には `BaseTraitLibrary` によって自動的に `rarity = R3_Legendary` が設定されます。ご褒美らしい見た目になります :gold_star:。

## バニラのグループ

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

独自のタブを作成する場合: **[特性グループとタブ](#/nml/trait-groups)** を参照してください（`AssetManager.clan_trait_groups` と `ClanTraitGroupAsset`）。

## テキスト

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## 特性を付与する

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

ユニットの氏族は `actor.clan` に格納されており、`actor.hasClan()` で所属しているかどうかを確認できます。実際には多くのユニットが生涯どの氏族にも属しません。

> [!TIP] 氏族は小規模。だからこそ大胆になれる
> 文化（culture）は大陸全土を覆いますが、氏族は一つの家族に留まり、`limit_clan_members` によって規模の上限が抑えられます。文化特性と同じ世界バランスの枠内であれば、氏族特性ははるかに強力な効果を持たせることができます。劇的な能力を実装するには氏族こそが最高の舞台です :PES5_Menace:。

## 新しい氏族が自然に特性を引き当てる

自分で付与する以外にも、氏族特性は `spawn_random_trait_allowed` を設定することで、文化が初期特性を抽選するのと同じように、新しい氏族が結成される際に抽選対象にできます。他の特性ページと同じ落とし穴です：

> [!WARNING] `spawn_random_trait_allowed` はゲーム起動時に一度だけ読み込まれます
> 新しい氏族は、ゲームロード中に `BaseTraitLibrary.linkAssets()` が構築するプールから初期特性を抽選します。これはあなたのModが存在するより前のタイミングです。特性にこのフラグを立てるだけでは何も変わりません。あなたの特性はそのプールに一度も入らず、新しい氏族に偶然付与されることもありません。バニラと同じ重み付けで、自分でプールに追加してください：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` は `protected` なので、NML がModのビルドに使うpublicize済みアセンブリに対してならコンパイルが通ります。`spawn_random_rate` の既定値は `5` です。数値を上げるほど出現頻度が上がります。
