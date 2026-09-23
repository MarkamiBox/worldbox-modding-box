---
title: 実績（Achievements）
group: ゲームコンテンツ
subgroup: 仕上げと実績
icon: :gold_star:
order: 220
---

# 実績（Achievements） :gold_star:

はい、Mod から独自の実績を追加することができます。ゲーム本体の実績ウィンドウに表示され、公式実績と同じようにポップアップし、プレイヤーの進行状況セーブデータに永続保存されます。配布する前に、ページ下部の警告事項を必ず読んでおいてください。

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

同時に10体のウィスプが生存すると、実績がアンロックされます。

## ゲームが自動でやってくれないこと

- **テキストキーの設定。** `post_init()` は起動時に公式実績の ID から `locale_key` を自動設定しますが、自作実績は `null` のままとなりウィンドウに文字が表示されません。必ず手動で設定してください。
- **ウィンドウへの登録。** 実績ウィンドウは各グループの `achievements_list` を走査します（起動時に `linkAssets()` が構築）。グループのリストに明示的に追加しないと、アンロックされてもウィンドウ上で確認できなくなります。
- **判定タイミングの制御。** ゲーム本体は自作実績を*いつ*確認すべきかを知りません。公式実績は状態が変化するコード箇所でピンポイントに `check()` を呼んでいます。HelloBox では「10体生存」を監視するために30秒ごとに確認する **[ワールド挙動](#/nml/world-ages)** を利用しています。イベント駆動の実績なら、そのイベント発生箇所で直接 `check()` を呼んでください。

| フィールド | 役割 |
| --- | --- |
| `group` | 実績ウィンドウのカテゴリ：`creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | アイコン画像（完全なスプライトパス） |
| `action` | 達成判定デリゲート。これが `true` を返すと `check()` 時にアンロック。`action` を持たない実績で `check()` を呼ぶと即座にアンロック |
| `hidden` | 解除されるまで説明文の代わりに「隠し実績」表記にする |
| `locale_key` | テキストキー。説明文は `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] プレイヤーの実際の実績データに書き込まれます
> 実績のアンロックはゲーム本体のコードを実行します：プレイヤーの進行状況ファイルに ID を書き込み、Steam に対してその ID の実績解除をリクエストします。Steam 上には Mod の実績は存在しないため Steam 側で何か起こることはありませんが、API 呼び出し自体は行われログに `Unlocking in Steam: <id>` と出力されます。また、ゲームのアナリティクス送信時にも ID が含まれます。なお、「呪われた世界」の法則が有効な間は Mod 実績を含め一切のアンロックが無効化されます。

これによってゲームが破損することはありませんが、プレイヤーの実際のアカウント進捗ファイルに書き込まれるため、実績数は節度を守り、プレイヤーが実際に達成していないものを勝手に解除しないようにしてください :PESgn_ReadRules:.
