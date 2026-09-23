---
title: 世界の時代とワールド挙動
group: ゲームコンテンツ
subgroup: 世界と文明
icon: :wbsunblessed:
order: 174
---

# 世界の時代とワールド挙動 :wbsunblessed:

世界の構成要素の中には、個々の生物ではなくワールドそのものに属するものが2つ存在します。**世界の時代（World Age）**は時代ホイール上に配置される時代（希望の時代、灰の時代など）であり、天候、光彩、世界法則を司ります。**ワールド挙動（World Behaviour）**はワールドがタイマー駆動で常時実行し続けるコードであり、災害のスケジューリング、移民の発生、道路の劣化などはすべてこの仕組みで動作しています。

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## 世界の時代（World Ages）

「燃え殻の時代（Age of Embers）」は8秒ごとに燃え殻を降らせ、灰のエフェクトで画面を薄暗くし、火の延焼速度を2倍にし、都市の忠誠度をわずかに底上げします。新規ワールド生成時にホイールのスロット4へ配置可能で、ランダムシャッフルによって任意のスロットに出現させることもできます。

> [!WARNING] ライブラリが起動時に行う3つの事前処理
> `post_init()` は ID に基づいて各時代の背景画像パスを設定し、`linkAssets()` は `list_only_normal`（ランダム時代プール）と `pool_by_slots`（新規ワールドがホイールを埋めるスロット別プール）を構築します。新しく追加した時代はどちらにも含まれていません。背景を設定し忘れるとホイールが空白になり、プールに追加し忘れると時代アセットが存在してもワールドに一切出現しなくなります。

> [!NOTE] 選択可能な時代一覧ウィンドウについて
> 時代選択ウィンドウは初期化時に時代ごとのボタンを生成し、ゲームはこのウィンドウをプリロードします。Mod ロードの前と後のどちらで初期化されるかは環境依存のため、ボタンが表示されるかはゲーム内で直接確認してください。なお、時代ホイール、ランダムプール、特殊効果のアクション自体はウィンドウのボタン有無に関わらず正常に機能します。

| フィールド | 役割 |
| --- | --- |
| `rate` | ランダム抽選時の出現ウェイト |
| `default_slots` | 新規ワールド生成時に配置を許可するホイールスロット番号（1〜8） |
| `clouds` + `cloud_interval` | 発生する雲の種類とスポーン間隔 |
| `special_effect_action` + `special_effect_interval` | 時代継続中にタイマー駆動で実行する独自アクション |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | 視覚表現（暗闇、雨、雪、灰、陽光など） |
| `title_color`, `light_color` | 時代名の表示色および環境光の色 |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | 政治や植物の成長速度に対する補正値 |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | ゲームルールへの補正乗数 |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | 他システムが参照するフラグ群（作物は `flag_crops_grow` が true の時のみ成長） |

ローカライズキーは `<id>_title` と `<id>_description` です。

## ワールド挙動（World Behaviours）

ワールド挙動は2つの数値と1つのデリゲートで定義されます：`interval` 秒ごとに `action` を実行し、メトロノームのような不自然さを防ぐために最大 `interval_random` 秒のランダムな揺らぎを加えます。`stop_when_world_on_pause = false` を指定しない限りゲームの一時停止に合わせて停止し、新規マップ読み込み時には `action_world_clear` が実行されます。

> [!WARNING] マネージャーは起動時に初期化されます
> ワールドはアセットごとに1つの `WorldBehaviour` タイマーを保持しますが、これはマップ初期化時の `createManagers()` で生成されます（Mod が読み込まれる前です）。Mod で後から追加したアセットは `manager == null` の状態となっており、ワールドの更新ループがそのまま呼び出して毎フレーム `NullReferenceException` が発生します :wbfacepalm:。`add()` の直後にマネージャーを手動生成する1行を追加することで解決します。

HelloBox のワールド挙動は対応する世界法則がオフの間は何もしません。判定処理の負荷は極めて軽いため、タイマー自体は回し続け、action 内で実行可否を判定するのがおすすめの設計パターンです。

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

ワールドに属さない独自のスケジュール処理（UI の定期更新など）を行いたい場合は、Mod メインクラスの NML `Update()` を使う方が遥かに簡潔です（**[完成したMod](#/nml/all-together)** を参照 :PES_OkHand:）。
