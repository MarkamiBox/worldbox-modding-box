---
title: 武器附魔词条
group: 游戏内容
subgroup: 物品与装备
icon: :wbmagehrm:
order: 122
---

# 武器附魔词条 :wbmagehrm:

你一定见过高品质神兵上附带的那几行绿色词条：*“+3 攻击力”*、*“燃烧”*。这些就是**物品词条修饰符 (Item Modifiers)**。它们是让战利品掉落瞬间变得充满惊喜的最快途径，因为一旦注册成功，游戏在生成随机武器时就会自动替你把它们洗炼上去。

## 便捷之道：使用 NML 的 Creator 辅助类

词条是一个 `ItemModAsset`，也就是换了顶帽子的 `ItemAsset`，它存放在 `AssetManager.items_modifiers` 里：

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

> [!WARNING] 光注册还不够
> `add()` 会把你的词条放进资源库的 `list`，但生成器读的不是 `list`，而是 `pools`。这些池子在加载时由 `linkAssets()` 填充，只填一次。只存在于 `list` 里的词条确实存在、也有名字，但永远不会被随机到任何东西上 :wbfacepalm:。

```json Mods/HelloBox/Locales/en.json
{
  "mod_hello_sharp": "Sharpened"
}
```

把 `HelloModifiers.Initialize();` 加进 `Main.cs`，从此游戏就可以把它随机到生成的武器上。

### 关键参数解析

| 参数 | 作用 |
| --- | --- |
| `id` | 词条的唯一标识名 |
| `mod_type` | 词条家族分类。相同分类下的两个词条绝不会同时并存：`mod_rank` 较高者胜出 |
| `mod_rank` | 在同族分类内部的等级。同时会提升整件武器的评分价值 |
| `translation_key` | 玩家在装备面板上所看到的绿色词条文字的本地化键名 |
| `rarity` | 随机刷出的概率权重。数字越大越常见 |
| `base_stats` | 该词条提供的属性数值增益 |
| `quality` | 该词条允许附着出现的最低保底装备品质 |
| `equipment_value` | 额外增加的 AI 装备评价值 |

## 让词条真正触发战斗特效

单纯堆数值虽然实用，但词条同样支持执行真正的 C# 委托逻辑，好玩的地方就从这里开始。`action_attack_target` 会在武器每一次成功命中目标时触发：

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

现在，任何随机刷出“hello_burning”词条的武器，在击中目标时都会点燃脚下的地块。短短十行代码，便能瞬间赋能给全图生成的每一把武器，甚至包括其他模组新增的装备 :wbfireskull:。

## 本地化文本

```json Locales/en.json
{
  "mod_hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

`translation_key` 就是显示在物品浮动提示框上的文本，尽量保持简短，因为它需要和数值挤在同一行展示。没人会读剑上的一整段话。

> [!TIP] 优先制作附魔词条，其次才是全新武器
> 一柄新武器需要繁重的素材与数值链条（贴图、动画、各级材质）。而一个新的附魔词条仅需区区二十行代码，就能瞬间无缝赋能给全世界生成的**每一把**武器。如果你想快速收获立竿见影的快乐，请从这里起步 :PES_Stonks:.
