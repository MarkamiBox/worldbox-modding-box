---
title: 武器のエンチャント
group: ゲームコンテンツ
subgroup: アイテムと装備
icon: :wbmagehrm:
order: 122
---

# 武器のエンチャント :wbmagehrm:

強力な剣に付いている緑色の小さなテキスト（*「+3 ダメージ」* や *「燃焼」* など）をご存知でしょう。これらは **アイテムモディファイア（エンチャント）** と呼ばれ、一度作っておけばゲームが勝手に武器のドロップ時に抽選付与してくれるため、最も手軽に戦利品をワクワクさせられる要素です。

## 簡単な方法：NML の Creator を使う

モディファイアは `ItemModAsset` で、これは帽子を変えた `ItemAsset` です。`AssetManager.items_modifiers` に入っています：

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```

> [!WARNING] 登録するだけでは足りない
> `add()` はモディファイアをライブラリの `list` に入れますが、生成器が読むのは `list` ではなく `pools` です。そのプールは読み込み中に一度だけ `linkAssets()` で埋められます。`list` にしかないモディファイアは存在し、名前もありますが、何にも付与されることはありません :wbfacepalm:。

```json Mods/HelloBox/Locales/en.json
{
  "mod_hello_sharp": "Sharpened"
}
```

`HelloModifiers.Initialize();` を `Main.cs` に追加すれば、それ以降、ゲームは生成される武器にこれを付けられるようになります。

### 重要な引数

| 引数 | 役割 |
| --- | --- |
| `id` | 一意な識別名 |
| `mod_type` | 所属カテゴリ。同一タイプのモディファイアは同時に付与されず、`mod_rank` が高い方が優先される |
| `mod_rank` | カテゴリ内の等級。武器の総合評価スコアも引き上げる |
| `translation_key` | 画面に表示される緑色のテキストの翻訳キー |
| `rarity` | 出現頻度。大きいほど頻繁に出る |
| `base_stats` | 付与されるステータス補正 |
| `quality` | これが出現可能な最低武器品質 |
| `equipment_value` | AIが認識する追加の評価スコア |

## 実際の追加効果を持たせる

ステータス加算だけでなく、モディファイアからコードを実行することもできます。面白くなるのはここからです。`action_attack_target` は武器が攻撃をヒットさせるたびに発動します：

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

これで「hello_burning」が付与されたすべての武器は、攻撃ヒット時に地面に火を点けるようになります。たった10行で、他Modのものも含めゲーム内の全武器に恩恵が広がります :wbfireskull:。

## ローカライズテキスト

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

`translation_key` はアイテムのツールチップに表示される名前ですので、ステータス数値と並んで1行に収まるよう短めに記述してください。剣に書かれた長文なんて誰も読みません。

> [!TIP] 新武器よりも先にエンチャントを作ろう
> 新しい武器を作るのには手間がかかります（画像、アニメーション、素材設定）。新しいモディファイアなら20行で作れ、世界中で生成される**あらゆる武器**に自動で付与されます。手軽に変化を楽しみたいならここから始めましょう :PES_Stonks:。
