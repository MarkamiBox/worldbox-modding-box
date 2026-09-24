---
title: 投射物、呪文、エフェクト
group: ゲームコンテンツ
subgroup: アクター・建物・AI
icon: :wblightning:
order: 148
---

# 投射物、呪文、エフェクト :wblightning:

マップ上で何かを起こそうとするとき、常に登場する3つの小さなライブラリがあります：

| | |
| --- | --- |
| `AssetManager.projectiles` | AからBへ飛ぶもの：矢、火炎瓶、投げられた松明 |
| `AssetManager.spells` | ユニットが自発的に詠唱するもの（マナ消費、AI発動確率） |
| `AssetManager.effects_library` | 視覚効果：爆発、雲、閃光、煙 |

## 投射物

```csharp Mods/HelloBox/Code/HelloProjectiles.cs
namespace HelloBox
{
    public static class HelloProjectiles
    {
        public const string EMBER_BOLT = "hello_ember_bolt";

        public static void Initialize()
        {
            if (AssetManager.projectiles.has(EMBER_BOLT)) return;

            AssetManager.projectiles.clone(EMBER_BOLT, "firebomb");

            ProjectileAsset bolt = AssetManager.projectiles.get(EMBER_BOLT);
            bolt.texture = "hello_bolt";                    // sprite in GameResources/effects/projectiles/
            bolt.speed = 16f;
            bolt.speed_random = 2f;
            bolt.look_at_target = true;
            bolt.trail_effect_enabled = true;
            bolt.trail_effect_id = "fx_fire_smoke";
            bolt.end_effect = "fx_firebomb_explosion";
            bolt.terraform_option = "demon_fireball";     // 着弾時に地面へ与える影響
            bolt.terraform_range = 2;

            bolt.impact_actions = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
                return true;
            };
        }
    }
}
```

### 各フィールドの解説

ほとんどはクローン元から引き継がれ、二度と見ることはありません。実際に変えるのは `speed` と `texture` の2つです。

| フィールド | 役割 |
| --- | --- |
| `texture`, `texture_shadow` | スプライト本体とその影 |
| `animated`, `animation_speed`, `frames` | 飛翔中にアニメーションするかどうか |
| `speed`, `speed_random` | 飛翔速度および発射ごとのブレ |
| `look_at_target` | 進行方向を向くように回転するか |
| `scale_start`, `scale_target` | 発射時と着弾時のサイズ |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | 飛翔時の軌跡エフェクト |
| `end_effect`, `end_effect_scale` | 着弾地点に発生するエフェクト |
| `terraform_option`, `terraform_range` | 着弾時の地形変化。**[タイルと地形](#/nml/tiles)** を参照 |
| `world_actions` | 飛翔中に実行されるアクション |
| `impact_actions` | 着弾時に実行されるアクション |
| `trigger_on_collision` | 目標地点ではなく最初に接触した対象で起爆するか |
| `hit_freeze`, `hit_shake`, `shake_*` | ヒット時の手応え演出 |
| `can_be_blocked`, `can_be_left_on_ground` | 盾で防御可能か、地面に落ちて拾えるか |
| `sound_launch`, `sound_impact` | FMODサウンドイベント |
| `draw_light_area`, `draw_light_size` | 飛翔中の発光演出 |

### 投射物を発射する

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

どちらの座標も `Vector3` です。タイルの `posV3` はそのまま渡せますが、ユニットの `current_position` は `Vector2` なので変換が必要です。

クローン元におすすめのバニラ投射物ID：`arrow` · `snowball` · `firebomb` · `torch`。

### 自作スプライトを使用する

投射物の `texture` は完全なパスでは**ありません**。ライブラリが自動的に `effects/projectiles/` を付与するため、ファイル名のみを記述します。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // "effects/projectiles/hello_bolt" は不可
```

飛び道具もスプライトの一覧として読み込まれます。`texture` の名前の **フォルダ** に1フレーム1枚のPNGを入れ、`animated` が有効なら複数フレームが飛行アニメーションになります。フォルダなしの `hello_bolt.png` は空の一覧になり、飛び道具を描くときに `ArgumentOutOfRangeException` が出ます :PESgn_Oops:。

`texture_shadow` はプレフィックスがつかない完全なパスです。バニラは共有の `shadows/projectiles/shadow_ball` を指定しており、それをそのまま再利用するのが賢明です。

## 呪文

呪文とは、プレイヤーの指示なしにユニットが自力で詠唱する能力です。AIが `chance`, `cost_mana`, `min_distance` に基づいて使用タイミングを判定します。

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // AIがこれを選択する確率
    min_distance = 5f,                  // この距離より近いと詠唱しない
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // この体力割合以下でのみ発動（0は常に発動）
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` は武器のモディファイアと同じ `AttackAction` デリゲートであるため、呪文の処理とエンチャントの処理は互換性があります。

### エンティティに呪文を付与する

呪文は、それを与えるものにIDで付けます：

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()` はIDを追加するだけです。ライブラリはあなたのModより前、起動時に `linkAssets()` でIDを呪文に変換します。自分で登録した特性やアイテムで `linkSpells()` を省くと、何も与えられず、しかも何も言われません。

読む価値のあるバニラの呪文ID：`teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`。

## 戦闘アクション

呪文はユニットが唱えるものです。**戦闘アクション**は、戦いの最中にユニットが*する*ことです：突進、回避、接近する前に投げる松明。ゲームはそれらを、プールと呼ばれる戦闘中の決まったタイミングで抽選します。

```csharp Mods/HelloBox/Code/HelloCombat.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloCombat
    {
        public const string TOSS = "hello_ember_toss";

        public static void Initialize()
        {
            if (AssetManager.combat_action_library.has(TOSS)) return;

            CombatActionAsset toss = new CombatActionAsset
            {
                id = TOSS,
                cost_stamina = 10,
                chance = 0.3f,        // rolled each time the unit could use it, plus its combat skill
                cooldown = 4f,
                pools = new CombatActionPool[] { CombatActionPool.BEFORE_ATTACK_MELEE },

                // same range as the vanilla torch throw: not point blank, not across the map
                can_do_action = (Actor pSelf, BaseSimObject pTarget) =>
                {
                    float dist = Toolbox.SquaredDistVec2Float(pSelf.current_position, pTarget.current_position);
                    return dist > 36f && dist < 2500f;
                },

                action_actor_target_position = (Actor pSelf, Vector2 pTarget, WorldTile pTile) =>
                {
                    if (pSelf == null || !pSelf.isAlive() || pTile == null) return false;

                    Vector3 launch = pSelf.current_position;
                    launch.y += 0.5f;
                    // a shooter means a kingdom, so no pForcedKingdom here
                    World.world.projectiles.spawn(pSelf, null, HelloProjectiles.EMBER_BOLT, launch, pTile.posV3);
                    MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);
                    return true;
                }
            };

            AssetManager.combat_action_library.add(toss);

            // Combat actions come from traits. The trait only stores ids, and the game turned
            // ids into objects at startup: link it yourself or the trait never uses it.
            ActorTrait swift = AssetManager.traits.get(HelloTraits.SWIFT);
            if (swift == null) return;
            swift.addCombatAction(TOSS);
            swift.linkCombatActions();
        }
    }
}
```

| プール | 抽選されるタイミング |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | 近接攻撃のために接近するとき。`action_actor_target_position` を使います |
| `BEFORE_ATTACK_RANGE` | 射撃する直前。同じデリゲート |
| `BEFORE_HIT` | 攻撃を受ける直前。回避と同じく `action_actor` を使います |
| `BEFORE_HIT_BLOCK` | 攻撃を受ける直前に、代わりにブロックする。ブロックと同様 |
| `BEFORE_HIT_DEFLECT` | 発射物が飛んできたとき。弾き返しと同様 |

| フィールド | 役割 |
| --- | --- |
| `chance` | アクションが可能なときに抽選され、ユニットの `skill_combat` で上がります |
| `cost_stamina` / `cost_mana` | 使用時に支払います。足りなければ選択肢になりません |
| `cooldown` | 使用後の `recovery_combat_action` ステータスの秒数で、その間すべての戦闘アクションがブロックされます |
| `can_do_action` | ターゲットを受け取る、あなたの条件 |

> [!WARNING] 与えられるのは特性からだけ
> ユニットは戦闘アクションを、特性と、亜種・氏族・宗教から集め、装備からは決して集めません。特性はIDを保持し、ゲームは起動時にIDをオブジェクトに変換しています：`addCombatAction()` の後で `linkCombatActions()` を呼ばないと、その特性は誰も使わない技を抱えたままになります :PES2_Shrug:。

## エフェクト

`EffectAsset` は純粋な演出です。特定座標で再生されるプレハブまたはスプライトアニメーションです。自前で新規追加するよりも、既存のものを呼び出す機会の方が圧倒的に多いでしょう。

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // 引数を取るエフェクトもある
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| フィールド | 役割 |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | 生成するプレハブ |
| `sprite_path`, `load_texture`, `time_between_frames` | スプライトアニメーションを指定する場合 |
| `spawn_action` | エフェクト発生時に走るコード（`fx_cloud` が引数から雲を生成する仕組み） |
| `limit`, `limit_unload` | 同時に存在できる最大数 |
| `cooldown_interval` | 連続生成の最小間隔 |
| `sound_launch`, `sound_loop_idle` | FMODサウンドイベント |
| `draw_light_area`, `draw_light_size` | 発光演出 |
| `show_on_mini_map` | ミニマップに表示するかどうか |

> [!TIP] 作る前に既存のものを探す
> ゲーム内にはすでに何百もの `fx_*` エフェクトが存在し、`EffectsLibrary` は短いクラスです。dnSpy（**[ゲームコードを読む](#/toolbox/reading-the-game-code)** 参照）で一度ID一覧を確認してみてください。あなたが描こうとしていた爆発は、大抵すでに存在しています :PESgn_CheckPins:。
