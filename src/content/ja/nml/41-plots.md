---
title: 陰謀・計画
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbrebellion:
order: 180
---

# 陰謀・計画 :wbrebellion:

**陰謀（Plot）**とは、統治者が計画を立て、資金を投じ、時間をかけて推し進める策謀のことです（反乱、新たな戦争、同盟など）。進行度ゲージが満タンになると、Modder の記述したコードが実行されます。「誰かが計画を企て、実行に移す」までの一連のプロセスはすべてゲーム本体のシステムが自動で処理してくれます。プレイヤーの画面には発起人や進捗状況、専用バナー付きで陰謀一覧に表示されます。

## 陰謀を追加する

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

10コインと都市を持ち、特にやることがない指導者は「燃え殻の祝祭（Ember Festival）」を企画できるようになります。計画が完遂すると、**[王国と派閥](#/nml/kingdoms)** で作成した幸福度イベントによって都市全体の幸福度が上昇し、主催者の頭上には燃え殻が降り注ぎます（HelloBox らしさの演出です）。

> [!WARNING] `check_is_possible` の設定は必須です
> `PlotAsset.checkIsPossible()` は指導者が陰謀を検討するたびに null チェックなしで呼び出されます。設定を省略すると、指導者がこの陰謀を評価した瞬間に `NullReferenceException` でクラッシュします。特別な発生条件がない場合は単に `true` を返してください。ええ、その場合でもです。

> [!WARNING] 基本リストは起動時に構築されます
> 指導者は `plots_library.basic_plots`（および自身の宗教の儀式）の中からのみ陰謀を選択します。`linkAssets()` は起動時に `is_basic_plot` が true の陰謀をこのリストに一度だけ追加しますが、これは Mod が読み込まれる前に行われます。フラグを立てるだけでは不十分なため、リストへの追加処理を Mod 側で明示的に実行してください。

## 各フィールド解説

### 開始条件と実行資格

| フィールド | 役割 |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | 実行可能な役職。未設定の場合、誰も開始できません |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | 発起人に求められる最低レベルや名声値 |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | 必要とされる能力値の閾値（デフォルトは 2） |
| `money_cost` | 開始時に消費するゴールド（プレイヤーによる強制実行時は無料） |
| `requires_diplomacy` / `requires_rebellion` | 対応する世界の法則が有効な場合のみ実行可能 |
| `check_is_possible` | 実行可能か判定する独自デリゲート（必須） |

### 進行と実行処理

| フィールド | 役割 |
| --- | --- |
| `progress_needed` | 発動までに必要な進行度 |
| `check_should_continue` | 進行中に毎フレーム確認される継続判定。`false` で中止 |
| `action` | ゲージ満タン時に実行される処理。成功時は `true` を返す |
| `post_action` | `action` 成功後に続けて実行される後処理 |
| `try_to_start_advanced` | 対象を指定する陰謀向けの特殊開始処理（反乱で `target_kingdom` を設定するなど） |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | 陰謀の標的が生存しているか確認する判定 |

### 表示設定

| フィールド | 役割 |
| --- | --- |
| `path_icon` | 陰謀一覧および専用バナーに表示されるアイコン |
| `group_id` | カテゴリ：`diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | 他の陰謀候補と比較した際の抽選ウェイト |
| `is_basic_plot` | すべての指導者が実行可能。false の場合は宗教の儀式としてのみ発生（**[宗教特性](#/nml/religion-traits)** を参照） |

## テキスト設定

プロットには3つのキーがあります：名前、進行中のプロットを説明する行、そして全体の説明です。2つ目では `$initiator_actor$`、`$initiator_city$`、`$initiator_kingdom$`、`$target_kingdom$` が自動で埋められます。

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] 強制実行でテストする
> リーダーが自分からあなたのプロットを選ぶのを待つと時間がかかります。ユニットを選び、そのウィンドウのプロット一覧から自分でプロットを開始しましょう：ユニットには許可された役割のどれかが必要で、ボタンが光るかどうかは `check_can_be_forced`（任意）で決まりますが、強制したプロットは無料です。あなたの `action` が動くのを見る一番速い方法です :PES2_EvilPlan:。
