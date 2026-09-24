---
title: ステータス効果
group: ゲームコンテンツ
subgroup: アクター・建物・AI
icon: :wbcursed:
order: 146
---

# ステータス効果 :wbcursed:

特性がその生物が誰で「あるか」を定義するのに対し、ステータス効果はその生物に「今まさに」何が起きているかを定義します（燃焼、氷結、中毒、祝福など）。時間経過で自動消滅し、ユニットの上に専用のスプライトを重ねて描画し、タイマー周期でコードを実行できます。

## ステータス効果の登録

ステータス効果は `AssetManager.status` に登録します。特性と同じ流れです：アセットを生成し、フィールドを設定し、追加します。

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] フレームがロードされるのはバニラのステータスだけ
> `StatusLibrary` はロード中に一度だけ、`"effects/" + texture` から `sprite_list` を埋め、`need_visual_render` を立てます。後から足したステータスは `sprite_list = null` のままで、生物がそれを受けた瞬間から、続く間ずっと `Status.updateAnimationFrame()` が毎フレーム `NullReferenceException` を出します :wbfacepalm:。`Initialize` の最後の2行がその処理を代わりにやります。
>
> `texture` は **フォルダ** を指します：`GameResources/effects/fx_hello_status/`、アニメのフレームごとにPNG1枚。


### 知っておくべきフィールド

短いリストです。本物はもっと長くて、ほとんど退屈です :wbyawn:。

| フィールド | 役割 |
| --- | --- |
| `duration` | 持続時間（秒）。0になると自動的に消滅 |
| `allow_timer_reset` | 重ね掛けされた際にタイマーを満了まで戻すかどうか |
| `tier` | `StatusTier.None`, `Basic`, `Advanced`。対象ユニットの `allowed_status_tiers` が付与可否を判定 |
| `can_be_cured` | 治癒能力や回復効果で解除できるかどうか |
| `removed_on_damage` | ダメージを受けた瞬間に解除されるかどうか |
| `cancel_actor_job` | 付与された瞬間にユニットが実行中の行動を中断させるかどうか |
| `affects_mind` | 精神系効果としてフラグ付けするか |
| `opposite_status` | 同時に共存できない相反ステータス |
| `remove_status` | これが付与された際に強制剥奪するステータス |
| `base_stats` | 効果持続中に付与されるステータス補正 |
| `locale_id` / `locale_description` | 名前と説明の翻訳キー。**必須** |
| `path_icon` | ステータス一覧に並ぶ小さなアイコン |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | ユニットに重なるスプライト。`texture` は `effects/` から読み込まれる単純名 |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | 描画位置と拡大率 |
| `opposite_traits`, `opposite_tags` | 付与を無効化する特性やタグ |
| `action_on_receive`, `action_get_hit` | 付与時および被弾時の追加コールバック |
| `sound_idle` | 効果持続中にループ再生されるFMODサウンドイベント |

## カスタムスプライトの追加

これには罠があり、誰もが一度はハマります :wbbre:。`texture` はフルパスでは**ありません**：ステータスライブラリは読み込み前に `effects/` を前に付けるので、名前だけを書きます。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // "effects/fx_hello_status" ではない
```

自分でフォルダーを書き足すと、ゲームは `effects/effects/fx_hello_status` を探し、何も見つけられず、スプライトを一切描きません。バニラの名前は `fx_status_burning_t` や `fx_status_drowning_t` のような形なので、それを真似しておけば問題は起きません。

同じアセットの `path_icon` は別物で、こちらはフルパス*です*。ユニットに描かれるスプライトではなく、ステータス一覧の小さなアイコンです。

## 効果に*アクション*を持たせる

`action` は持続中、`action_interval` 秒ごとに定期実行されます。`action_finish` は効果終了時、`action_death` は付与されたまま死亡した際に発動します。

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // パブリックメソッドであり、継続ダメージ処理に最適
    return true;
};
```

## ユニットに効果を付与する

一番直感的に思える `actor.addStatusEffect("hello_cursed")` は、ゲーム本体のアセンブリで `internal` に設定されています。公開化 (publicized) 済みの `Assembly-CSharp.dll` に対してなら問題なくコンパイルでき、普通のNML modはすでにそれを使っています。NMLはあなたの `Code/*.cs` を自前の公開化コピーに対してコンパイルするので、このガイドの `internal` メンバーはすべてそのまま通ります。使えなくなるのは、Visual Studioで元のアセンブリに対して自分の `.dll` をビルドするときだけです。その場合は、常に使えるパブリックな方法を使います：

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20秒（0を指定するとアセット自身の規定時間）
```

AI行動ツリー内部であれば、標準で用意されている `new BehActorAddStatus("hello_cursed", 20f)` や `new BehActorRemoveStatus("hello_cursed")` を使えます。

## テキストの追加を忘れずに

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

キーは `locale_id` と `locale_description` に指定した文字列と完全に一致させてください。バニラの命名規則 `status_title_<id>` / `status_description_<id>` に倣うと管理しやすくなります。

> [!TIP] 一時的な効果には特性ではなくステータスを使う
> 一定時間で消えるべきもの（神の能力のバフ、武器のデバフ、標的マーカーなど）は、特性ではなくステータス効果にすべきです。特性は永続し子どもにも遺伝してしまうため、意図した挙動にならないケースがほとんどです :PES2_Uhm:.
