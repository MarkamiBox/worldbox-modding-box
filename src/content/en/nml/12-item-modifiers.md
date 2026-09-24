---
title: Weapon enchantments
group: Game Content
subgroup: Items & Equipment
icon: :wbmagehrm:
order: 122
---

# Weapon enchantments :wbmagehrm:

You know the little green lines on a good sword: *"+3 damage"*, *"burning"*. Those are **item modifiers**, and they are the fastest way to make loot exciting, because the game rolls them onto weapons for you once they exist.

## Registering one

A modifier is an `ItemModAsset`, which is an `ItemAsset` wearing a different hat, and it lives in `AssetManager.items_modifiers`:

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

> [!WARNING] Registering is not enough
> `add()` puts your modifier in the library's `list`, and the generator does not read `list`, it reads `pools`. Those pools are filled in `linkAssets()`, once, during load. A modifier that is only in `list` exists, has a name, and will never be rolled onto anything :wbfacepalm:.

```json Mods/HelloBox/Locales/en.json
{
  "mod_hello_sharp": "Sharpened"
}
```


Add `HelloModifiers.Initialize();` to `Main.cs`, and from then on the game can roll it onto generated weapons.

### The fields that matter

| Field | What it does |
| --- | --- |
| `id` | Unique name |
| `mod_type` | The family. Two modifiers of the same type never appear together: the higher `mod_rank` wins |
| `mod_rank` | Level inside the family. Also adds value to the weapon |
| `translation_key` | The locale key for the green line the player reads |
| `rarity` | How often it is rolled. Bigger is more common |
| `base_stats` | The stat bonus |
| `quality` | Minimum weapon quality this can appear on |
| `equipment_value` | Extra "how good is this item" score |

## Making it actually do something

Stats are fine, but a modifier can also run code, and that is where it gets fun. `action_attack_target` fires every time the weapon lands a hit:

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

Now any weapon that rolls "hello_burning" sets the ground on fire when it hits. Ten lines, and it works on every weapon in the game, including other mods' :wbfireskull:.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

The `translation_key` is what shows up in the item tooltip, so keep it short, it sits on one line next to the stats. Nobody reads a paragraph on a sword.

> [!TIP] Modifiers before weapons
> A new weapon is a lot of work (sprite, animations, materials). A new modifier is twenty lines and applies to **every** weapon the world generates. If you want the game to feel different fast, start here :PES_Stonks:. 
