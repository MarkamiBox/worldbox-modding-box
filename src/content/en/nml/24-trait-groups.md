---
title: Trait groups & tabs
group: Game Content
subgroup: Traits & Genetics
icon: :wbfamilies:
order: 102
---

# Trait groups & tabs :wbfamilies:

Every trait belongs to a **group**, and the group is what draws a tab in the trait book. If you add six traits and dump them all in `miscellaneous`, they vanish into a list nobody scrolls :PES4_Invisible:.

A tab of your own costs four lines.

## What a group is

A group is a `BaseCategoryAsset`, which is the smallest asset in the whole game:

| Field | What it does |
| --- | --- |
| `id` | What a trait's `group_id` points at |
| `name` | The **locale key** for the tab label. Not the label itself |
| `color` | Hex string. Tints the tab and the traits under it |
| `show_counter` | Whether the tab shows "3 / 12". `true` by default |

## Your own tab

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // the locale key, not the text
                color = "#7FE7C4"
            });
        }
    }
}
```

Point your traits at it:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

And name the tab:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Groups before the traits in them
> A trait whose `group_id` points at a group that does not exist yet has nowhere to be drawn. In `OnModLoad`, `HelloGroups.Initialize()` goes above `HelloTraits.Initialize()`.

## The vanilla actor trait groups

Use one of these when you do not want your own tab:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Where your tab appears

Groups are drawn in `list` order, and `add()` puts yours at the end. To slot it next to a related one, move it afterwards:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

`list` is a plain `List<T>` on every library, so this trick works for any of them. See **[Asset libraries](#/nml/asset-libraries)**.

## Renaming or recolouring a vanilla group

You do not have to add a group to change one. `get()` hands you the live object:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // your own locale key
    fun.color = "#FFB35E";
}
```

Editing a vanilla group in place keeps every vanilla trait that points at it working, and keeps old saves loading. Replacing it does neither :PES_NoSign:.

## The other six group libraries

Actor traits are one of seven trait systems, and each has its own group library holding its own group class. The code on this page is identical for all of them, only the two names change. Learn it once, copy it six times:

| Trait system | Group library | Group class | Page |
| --- | --- | --- | --- |
| Actor | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | this page |
| Culture | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Culture traits](#/nml/culture-traits)** |
| Religion | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Religion traits](#/nml/religion-traits)** |
| Subspecies | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Subspecies traits](#/nml/subspecies-traits)** |
| Clan | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Clan traits](#/nml/clan-traits)** |
| Language | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Language traits](#/nml/language-traits)** |
| Kingdom | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Kingdom traits](#/nml/kingdom-traits)** |

Equipment has the same concept under a different name. See **[Item groups & tabs](#/nml/item-groups)**.

> [!TIP] One tab, not six
> The temptation with a big mod is one group per feature. Resist it. The trait book is already crowded: a player will find one tab with your mod's name on it and will not find six tabs named after your internal systems.
