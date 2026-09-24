---
title: Item groups & tabs
group: Game Content
subgroup: Items & Equipment
icon: :wbgold:
order: 124
---

# Item groups & tabs :wbgold:

An item group is a category in the equipment window: helmets, swords, amulets. It is the same tiny `BaseCategoryAsset` that draws trait tabs (see **[Trait groups & tabs](#/nml/trait-groups)**), living in `AssetManager.item_groups` instead.

The difference is that an item group carries a **pool**, and forgetting the pool is what crashes your mod :PESgn_Yikes:.

## The vanilla groups

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## Your own category

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

Both helpers are explained on their own below. They live in this file because the two methods that need them do.


| Field | What it does |
| --- | --- |
| `id` | What an item's `group_id` points at |
| `name` | The locale key for the tab label |
| `color` | Hex string. Tints the category |
| `show_counter` | Whether the tab shows a count. `true` by default |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## The pools

The game keeps one bucket of equipment per group, and it fills those buckets while its own libraries load, which is **before your mod exists**. A brand new group has no bucket, and the first thing that asks for one throws:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Create them yourself, once per group, before registering any item into it:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` is everything in the group. `_unlocked` is what the generator may currently roll. Both need to exist.

## Putting an item in it

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // which body slot it fills
relic.equipment_subtype = "hello_relic";       // what cultures prefer by
```

Three separate things, and they are easy to confuse:

| | |
| --- | --- |
| `group_id` | Which **tab** it appears under |
| `equipment_type` | Which **slot** it goes in: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | Which **weapon class** it is: `sword`, `axe`, `bow`… what culture traits prefer |

A new group does **not** give you a new slot. `EquipmentType` is a fixed enum in the game assembly, so your relics still occupy the amulet slot, they just get their own shelf in the window.

## Where the category appears

Groups draw in `list` order, and `add()` puts yours last. Move it next to a relative:

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Renaming a vanilla category

`get()` returns the live object, so you can repurpose a vanilla category instead of adding one:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // your own locale key
    helmet.color = "#BAD0FF";
}
```

Every vanilla helmet keeps pointing at `helmet`, so nothing breaks and old saves still load. Replacing the group instead would orphan all of them :aPES2_HmmmmApprove:.

> [!TIP] Reuse the slot, rename the shelf
> Most "new equipment type" mods are really "existing slot, different shelf and different name". That version is four lines and cannot break a save. A genuinely new slot needs the game's `EquipmentType` enum to change, which it will not.
