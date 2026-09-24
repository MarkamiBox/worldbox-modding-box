---
title: ドロップ & 落下物
group: ゲームコンテンツ
subgroup: アイテムと装備
icon: :wbloot:
order: 126
---

# ドロップ & 落下物 :wbloot:

**ドロップ**（drop）とは、空から落ちてきてタイルに着地したときに何かを引き起こす小さなオブジェクトです。雨、血、種、炎、酸、コインなどがあります。マップ上で何かを「発生」させる最も手軽な方法であり、独自のアニメーションとサウンドが最初から無料で付いてきます。

## ドロップを登録する

ドロップは `AssetManager.drops` に格納されます。以下は、着地してタイルに火をつけるドロップの例です:

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // 地面に触れた瞬間に実行される処理
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

その後、`Main.cs` に次の行を追加します: `HelloDrops.Initialize();`

### 各フィールドの意味

| フィールド | 説明 |
| --- | --- |
| `id` | 他のすべての場所で使用する名前 |
| `path_texture` | スプライト。他のすべてと同じパスルール |
| `type` | `DropType.DropMagic`, `DropGeneric` … ゲーム側の内部処理の一部を決定 |
| `animated` + `animation_speed` | スプライトリストをアニメーションとして再生 |
| `default_scale` | サイズの大きさ。小さなドロップなら通常は `0.1f` |
| `falling_speed` | 落下速度 |
| `sound_drop` / `sound_launch` | FMOD サウンドイベント |
| `action_landed` | **ここが本命**: 着地したときにあなたのコードが実行される |
| `action_launch` | 投擲されたときに実行される |

## 独自のスプライト

`path_texture` は `GameResources/` 内から記述どおりに読み込まれます。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

ドロップは **スプライトの一覧** として読み込まれます。ゲームはそのフォルダの *中の* PNG をすべて読み、これで `animated` が動きます。動かないドロップでもフォルダで、中にフレームが1枚あるだけです。フォルダなしの `drops/hello_ember.png` は空の一覧になり、ドロップは見えないまま落ちます :wbwiltedrose:。

## ドロップを落とす

`World.world.drop_manager` に2つの方法が用意されています:

```csharp
// タイルにまっすぐ落とす: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// 破片を吹き飛ばす爆発のように放物線を描いて投げる
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

90%の場合は `spawn` で十分です。`15f` は落下する高さであり、数値が大きいほど着地までに時間がかかります。落ちてくる間の見た目も、よりドラマチックになります。

## 実践例: 神の力で燃える火の粉を降らせる

**[神の力](#/nml/god-powers)** のページを読んだ方なら、これがその応用です。1つの力でタイル全体を火の海にします。

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // 中央に1つ、周囲の隣接タイルすべてに各1つ
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] ドロップは怠け者のための特殊効果
> パーティクルシステムを組む前に、スプライトと `action_landed` を設定したドロップで代用できないか考えてみてください。たいていの場合、サウンド付きでわずか10行で解決します :PESgn_Noice:.
