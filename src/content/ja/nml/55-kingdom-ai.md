---
title: 王国のAI
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbdiplomacyhandshake:
order: 180
---

# 王国のAI :wbdiplomacyhandshake:

クリーチャーのAIは個々のユニット上で実行されます：食料を探す、木へ歩く、敵と戦うなど。これに対し王国のAIは文明全体を司ります。王国がいつ宣戦布告するか、国境を広げるか、植民都市を作るか、同盟を結ぶか、遠征軍を派遣するかを判断する仕組みです。

ユニットのAIと同じくジョブ（job）とタスク（task）で構成されますが、各ステップで渡される引数は `Actor` ではなく `Kingdom` です。

## ジョブとタスクの違い

王国のロジックは2つのアセットライブラリに分かれています：

| 概念 | クラス | ライブラリ | 役割 |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | 王国が順番に評価する一連のタスク名リスト |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | 複数のビヘイビアを持つ具体的な戦略目標 |
| **Kingdom behaviour** | `BehaviourActionKingdom` | タスクに追加 | ティックごとに評価される1つの処理ステップ |

バニラの文明は `"civ"` という王国ジョブを使用します（`AssetManager.job_kingdom.get("civ")`）。王国がターンを更新する際、ジョブ内のタスクを順に評価していきます。

## 王国ビヘイビアの記述

王国ビヘイビアは `BehaviourActionKingdom` を継承し、`execute(Kingdom pKingdom)` をオーバーライドします：

```csharp
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloKingdomTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.hasEnemies()) return BehResult.Stop;

            if (pKingdom.data.gold > 500)
            {
                pKingdom.data.gold -= 50;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }
}
```

### 戻り値コード

| 結果 | 王国AIの動作 |
| --- | --- |
| `BehResult.Continue` | タスク内の次のビヘイビアへ進む |
| `BehResult.Stop` | 現在のティックでのタスク評価を停止する |
| `BehResult.RepeatStep` | 次のティックでこのビヘイビアを再評価する |
| `BehResult.Skip` | 次のビヘイビアをスキップして進む |

## コード

このファイルでは王国タスクを作成し、バニラの `"civ"` ジョブに注入します：

```csharp Mods/HelloBox/Code/HelloKingdomAI.cs
using System;
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloCheckTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.capital == null || pKingdom.king == null) return BehResult.Stop;

            // Example directive: if the kingdom has plenty of gold, donate to treasury
            if (pKingdom.data.gold > 300)
            {
                pKingdom.data.gold += 10;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }

    public static class HelloKingdomAI
    {
        public const string TASK_ID = "hello_kingdom_tribute";

        public static void Initialize()
        {
            if (AssetManager.tasks_kingdom.has(TASK_ID)) return;

            // 1. Define the task
            BehaviourTaskKingdom task = new BehaviourTaskKingdom
            {
                id = TASK_ID
            };

            // 2. Add steps
            task.addBeh(new BehHelloCheckTribute());

            AssetManager.tasks_kingdom.add(task);

            // 3. Inject into the civ kingdom job
            KingdomJob civJob = AssetManager.job_kingdom.get("civ");
            if (civJob != null && !civJob.tasks.Contains(TASK_ID))
            {
                civJob.tasks.Add(TASK_ID);
            }
        }
    }
}
```

## 専用の王国ジョブを作成する

`AssetManager.kingdoms` で全く新しい魔物勢力や特殊文明を作る場合、`"civ"` を変更せずに専用のジョブを持たせることができます：

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

その後、**[王国](#/nml/kingdoms)** の `KingdomAsset` で `job_id = "hello_faction_job"` を指定します :PESgn_Noice:。

## よくある落とし穴

- **必ず `isRekt()` を確認する**: 王国はシミュレーション中いつでも滅亡や併合が起こり得ます。`pKingdom != null && !pKingdom.isRekt()` のチェックなしにデータへ触れてはいけません。
- **首都と国王の存在を確認する**: 多くの処理は `capital` や `king` が存在することを前提としています。死滅していると `NullReferenceException` が発生します。
- **ティックの負荷を軽く保つ**: 個別のユニットと異なり、王国AIは国家全体を相手にします。ビヘイビア内で全ユニットを走査する多重ループを行うと致命的なフレームレート低下を招きます :aPES2_Sweat:.
