---
title: カスタムAI & 行動ツリー
group: ゲームコンテンツ
subgroup: アクター・建物・AI
icon: :wbgoldenbrain:
order: 144
---

# カスタムAI & 行動ツリー :wbgoldenbrain:

いよいよ深淵へ足を踏み入れます。これまでのガイドではゲームに「物やデータ」を追加してきました。ここでは **「意思決定」** を追加します。何千もの生命体がひしめくワールドの中で、クリーチャーが自律的に、永遠に、次に何を行うかを定義します。プレッシャーはかけません :PES_MonkaSweat:。

## ゲームの思考構造

大きいものから小さいものへ3つの層と、その横に並ぶもう1つ。理解するのに、認めたくないほど時間がかかりました：

| 層 | 何か | ライブラリ |
| --- | --- | --- |
| **ジョブ** (`ActorJob`) | その生物が大まかに何をしているか：「市民でいる」「兵士でいる」 | `AssetManager.job_actor` |
| **タスク** (`BehaviourTaskActor`) | ジョブの中の具体的な目標1つ：「食べに行く」「あれを建てる」 | `AssetManager.tasks_actor` |
| **ビヘイビア** (`BehaviourActionActor`) | タスクの1ステップ。毎ティック実行され、次に何をするかを返します | タスクに追加する |
| **意思決定** (`DecisionAsset`) | いつタスクを始めるか：生物が手が空くたびに天秤にかける選択肢 | `AssetManager.decisions_library` |

ジョブはタスクを持ち、タスクはビヘイビアを持ち、ビヘイビアはどれかが止めると言うまで順番に実行されます。意思決定はジョブの横に並ぶもので、手の空いた生物が自分で次のタスクを選ぶ仕組みです。下の **[意思決定](#意思決定-生物自身に自作タスクを選ばせる)** を参照してください。

## 行動（Behaviour）を記述する

行動とは、メソッドを1つだけ持つクラスです。アクターを受け取り、小さな処理を1つ実行して、結果として `BehResult` を返します:

```csharp
namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            // decide something, write it onto the actor
            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;   // let the next behaviour in the task run
        }
    }
}
```

| 結果コード | 動作の意味 |
| --- | --- |
| `BehResult.Continue` | このタスク内の次の行動を実行する |
| `BehResult.Stop` | このティックの処理を終了する |
| `BehResult.RepeatStep` | 次のティックで自分をもう一度実行する |
| `BehResult.Skip` | 次の行動を1つスキップする |
| `BehResult.StepBack` | 1つ前の行動へ戻る |
| `BehResult.RestartTask` | タスクを最初からやり直す |

## タスクとジョブを組み立てる

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```

`PickTile` こそがこの練習の要点です。ゲームがまだやってくれない唯一の部分がこれで、ファイルの残りはすべて配線です。

> [!WARNING] `beh_tile_target` は internal
> ビヘイビアが書き込むフィールドはゲームのアセンブリで `internal` になっているため、これは **publicize済み** の `Assembly-CSharp.dll` に対してコンパイルされます（**[ステータス効果](#/nml/status-effects)** の注記を参照）。それがないとコンパイラーがその行を拒否するので、ターゲットは自分のフィールドに持っておく必要があります :PES5_Noted:。

2番目のビヘイビアに注目してください：**バニラのノードを再利用しましょう**。ゲームには、タイルまで歩く、ステータスを付ける、建物を探す、ターゲットを攻撃する、といったビヘイビアがあります。判断は自分で書き、実行は借りる。それが週末で終わるか1か月かかるかの差です。

## クリーチャーに実際にジョブを実行させる

Harmony でゲームコードを書き換える必要はありません。すべてのアクターのAIはデリゲートを通じて次のジョブを問い合わせているため、そのデリゲートを差し替えるだけで乗っ取りが完了します:

```csharp
// ジョブを乗っ取る
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // 現在の動作を破棄し、今すぐ次のジョブを要求させる

// 制御を元に戻す
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] 乗っ取り状態は定期的に再確認する必要がある
> 戦闘（および一部のシステム）が終了すると現在のジョブがクリアされ、クリーチャーは新しいジョブを再要求します。デリゲートが維持されていれば自作ジョブが再び選ばれますが、他のコードによってデリゲートが上書きされた場合は通常動作に戻ってしまいます。乗っ取りが維持されていると盲信するのではなく、定期的にチェックしてください :PES5_Noted:。

## 意思決定：生物自身に自作タスクを選ばせる

ジョブのデリゲート差し替えは強制的な乗っ取りです。多くの場合、もっと自然なアプローチが望まれます：食事や睡眠、戦闘と並ぶ選択肢の1つとして、生物自身に自作タスクを天秤にかけさせる方法です。これが **意思決定（Decision）** であり、ゲーム本来の行動選択システムです。

意思決定は「いつ行うか」を定義し、先ほど作成したタスクは「どのように行うか」を定義します。頭脳が意思決定を選択すると、同じ ID（または `task_id` で指定された ID）のタスクを開始します。

```csharp Mods/HelloBox/Code/HelloDecisions.cs
namespace HelloBox
{
    public static class HelloDecisions
    {
        public const string WANDER = "hello_decide_wander";

        public static void Initialize()
        {
            if (AssetManager.decisions_library.has(WANDER)) return;

            DecisionAsset wander = new DecisionAsset
            {
                id = WANDER,
                task_id = HelloAI.TASK,                  // the decision says when, the task says how
                priority = NeuroLayer.Layer_1_Low,
                path_icon = "ui/Icons/iconHelloDrive",
                cooldown = 20,                           // seconds before this unit may pick it again
                weight = 1f,
                unique = true,                           // only the actors you give it to, below
                action_check_launch = (Actor pActor) => pActor != null && pActor.isAlive() && !pActor.isFighting()
            };

            AssetManager.decisions_library.add(wander);

            // linkAssets() fills these three for every decision, at startup, before your mod.
            // decision_index is where each unit keeps this decision's cooldown: left at 0, yours
            // would share it with the first vanilla decision.
            wander.decision_index = AssetManager.decisions_library.list.IndexOf(wander);
            wander.priority_int_cached = (int)wander.priority;
            wander.has_weight_custom = wander.weight_calculate_custom != null;

            // who gets it: every wisp, through its actor asset
            ActorAsset wisp = AssetManager.actor_library.get("hello_wisp");
            if (wisp != null) wisp.addDecision(WANDER);
        }
    }
}
```

| フィールド | 効果 |
| --- | --- |
| `task_id` | 開始するタスク。空の場合は意思決定と同じ ID のタスク |
| `priority` | レイヤー階層（`NeuroLayer.Layer_0_Minimal` 〜 `Layer_4_Critical`）。通常、実行可能な決定が存在する最上位レイヤーのみが抽選対象になります |
| `weight` / `weight_calculate_custom` | 同じレイヤー内での選択確率（固定値またはユニットごとの計算式） |
| `action_check_launch` | 実行可能条件判定。`false` を返すと今回は候補から除外されます |
| `cooldown` | 同じユニットが再選択可能になるまでのクールダウン秒数 |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | デリゲート呼び出し前に判定される軽量フィルタ群 |
| `unique` | 汎用リストへの自動追加を防止。Mod の決定では常に `true` |

> [!WARNING] 起動時にゲームが自動設定する3つのフィールド
> `DecisionsLibrary.linkAssets()` は起動時に全決定にインデックス番号を振り、`priority` を `priority_int_cached` にコピーし、`has_weight_custom` を設定します。`add()` 後の3行を省略すると、あなたの決定はバニラの先頭決定とクールダウンを共有してしまい、`priority` に関わらず最下層レイヤー扱いとなり、カスタム重み計算も無視されます :wbfacepalm:。

> [!WARNING] 既存のユニットには空きスロットが1つしかありません
> 各ユニットは生成時に2の累乗に切り上げられたサイズの配列で決定のクールダウンを管理します。バニラの決定数は127個なので配列サイズは128となり、空きスロットはちょうど **1つ** しかありません。Mod ロード前に存在していたユニットに2つ以上の Mod 決定が付与されると `IndexOutOfRangeException` でクラッシュします。新規ユニットは拡張後のサイズで生成されるため、HelloBox ではバニラユニットの特性ではなく自作生物に決定を付与しています。

意思決定はそれを所持する対象を通じて生物に伝達されます。`ActorAsset` には `addDecision()` で追加します。**特性（Trait）の場合は挙動が異なります**：起動時に ID をオブジェクトへ解決するため、特性側では解決済み配列を手動で代入する必要があります：

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## 都市の職業

市民は自身の頭脳ではなく都市から仕事を与えられます。都市は必要な作業量を計算し、職業スロット（建築工、農民、鉱夫など）を開設して市民を割り当てます。**市民の職業（Citizen Job）** はこのスロットの1つであり、雇用されたユニットは同じ ID の `ActorJob` を実行します。両側で同じID。これが仕掛けのすべてです。

```csharp Mods/HelloBox/Code/HelloCityJobs.cs
using ai.behaviours;   // CityBehCheckCitizenTasks
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCityJobs
    {
        public const string KEEPER = "hello_ember_keeper";

        public static void Initialize()
        {
            if (AssetManager.citizen_job_library.has(KEEPER)) return;

            // What the citizen does once hired: an actor job with the same id
            ActorJob work = new ActorJob { id = KEEPER };
            work.addTask(HelloAI.TASK);
            work.addTask("end_job");
            AssetManager.job_actor.add(work);

            CitizenJobAsset keeper = new CitizenJobAsset
            {
                id = KEEPER,
                path_icon = "ui/Icons/iconHelloDrive"
            };
            AssetManager.citizen_job_library.add(keeper);

            // post_init() and linkAssets() did these two at startup
            keeper.unit_job_default = KEEPER;
            AssetManager.citizen_job_library.list_priority_normal.Add(keeper);
        }

        // A city hands out job slots in one behaviour, from a fixed list of vanilla jobs.
        // Nothing ever opens a slot for yours unless you add it after that list.
        [HarmonyPatch(typeof(CityBehCheckCitizenTasks), nameof(CityBehCheckCitizenTasks.execute))]
        public static class Patch_CitizenTasks
        {
            public static void Postfix(City pCity)
            {
                if (pCity == null || pCity.status.population_adults < 10) return;

                CitizenJobAsset keeper = AssetManager.citizen_job_library.get(KEEPER);
                if (keeper == null) return;

                // one keeper per city, recomputed every time the city recounts its jobs
                if (pCity.jobs.countCurrentJobs(keeper) == 0) pCity.jobs.addToJob(keeper, 1);
            }
        }
    }
}
```

起動時処理を補完する3つのポイント：

1. **`unit_job_default`** は雇用された市民が実行する `ActorJob` です。`post_init()` が各職業に ID をコピーします。
2. **`list_priority_normal`** は市民に提示される職業リストです（`linkAssets()` が構築）。`priority` > 0 の職業は `list_priority_high` に入り、優先的に割り当てられます。
3. **スロットの開設。** `CityBehCheckCitizenTasks.execute()` はバニラの固定リストからスロットを開きます。Harmony の Postfix パッチで自作職業のスロットを追加します。

| フィールド | 効果 |
| --- | --- |
| `priority` / `priority_no_food` | 0超：通常職業より優先、または食糧不足時のみ開設 |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | 就任可能な役職条件 |
| `should_be_assigned` | ユニットごとの割り当て条件判定 |
| `common_job` | `false` で一般公募リストから完全に除外（兵士など） |
| `path_icon` | 都市の職業一覧ウィンドウでのアイコン |

## テキスト設定

タスク名はユニット詳細ウィンドウの「現在の行動」として表示されるので、プレイヤーはあなたが書くどの行よりもこれを読むことになります。そして意思決定は開始するタスクの名前を借用します：

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## フレームレートを崩壊させないための鉄則

ワールドには数千体ものユニットが存在します。あなたの書いた行動は、その全ユニット上で毎ティック実行される可能性があります。「パフォーマンス？聞いたことないな、食べられるの？」は、あなたのModがそれを食い尽くす側になるまでは良いジョークです。私のものも含め、ほとんどのModは毎ティック巨大なループを回し、それなりのPCならそれで済んでしまいます。ビヘイビアではそうはいきません。

- **重い思考処理は `execute` 内ではなく自前のタイマーで行う。** コストの高いロジックは `Update()` 内のタイマーで定期的に動かして結果をキャッシュしておき、`execute` ではその答えを読み取るだけにします。
- **負荷を分散させる。** 40体のクリーチャーを制御する場合、一度に全40体を計算するのではなく、4回に分けて毎フレーム10体ずつ処理します。
- **早期リターンを徹底する。** `execute` の冒頭では、即座に関数を抜けられる軽量なガード節を最優先で記述してください。
- **ホットパスで絶対にメモリ確保（new）を行わない。** 毎ティック数千体のユニットでリストやラムダ式をインスタンス化すると、ガベージコレクションが頻発してフレームレートが即死します。

> [!TIP] 特性を先に付与し、行動を後に組み込む
> 乗っ取り対象のクリーチャーには目に見えるカスタム特性を付与しておきましょう（**[カスタム特性](#/nml/custom-traits)** を参照）。プレイヤーがどのユニットか判別できるだけでなく、*あなた自身* が意図したユニットでコードが動いているか一目で確認できるようになります :pepeOK:。
