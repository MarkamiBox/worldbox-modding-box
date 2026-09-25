---
title: World laws
group: Game Content
subgroup: World & Civilizations
icon: :wbworldlaws:
order: 176
---

# World laws :wbworldlaws:

World laws are the switches in the **World Laws** window: "old age", "hunger", "peaceful monsters". They are the most player-friendly thing you can add, because they let people turn your mod's behaviour on and off without touching any settings file.

They are also one of the easiest assets in the whole game. Four fields.

## Add a switch

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            if (AssetManager.world_laws_library.has(CHAOS)) return;

            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // which tab it appears in
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // starts off
            });
        }
    }
}
```

Add `HelloLaws.Initialize();` to `Main.cs` and the switch is in the game. That is genuinely all of it :poggers:.

| Field | Meaning |
| --- | --- |
| `id` | Your law's name. Also the translation key |
| `group_id` | The tab it lands in. The full list is under **The tabs** below, or make your own |
| `icon_path` | The icon, same path rules as everywhere |
| `default_state` | `true` = on for new worlds, `false` = off |
| `can_turn_off` | Defaults to `true`. Set `false` for a law that can only be turned on |

## Reading the switch in your code

This is the point of it. A switch nobody reads is a decoration. Anywhere in your mod:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // the player wants chaos, give them chaos
}
```

Or the short way, straight from the world, without fetching the asset:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` returns `false` for an id it does not know instead of throwing, so a typo reads as "off" rather than as a crash. Kind, and also terrible, because nothing tells you :PES5_Hmmmm:. `World.world.world_laws` is `internal`, so this compiles against the publicized assembly NML builds your mod with (see the note in **[Status effects](#/nml/status-effects)**). The asset route above works everywhere.

A practical example, only spawning your embers while the law is on:

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## Reacting the moment it is flipped

If turning the law on should *do* something right away, rather than just being read later:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* runs when the player switches it on */ }
};
```

## The tabs

The window is split into tabs, and `group_id` picks one. These are every vanilla group, in the order the window draws them:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### A tab of your own

Replace the first example's `Initialize()` with the version below, and add `GROUP` beside `CHAOS`.

A group is a `WorldLawGroupAsset` in `AssetManager.world_law_groups`. It is the same tiny `BaseCategoryAsset` the trait tabs use, see **[Trait groups & tabs](#/nml/trait-groups)**:

| Field | What it does |
| --- | --- |
| `id` | What a law's `group_id` points at |
| `name` | The **locale key** for the tab title. Not the title itself |
| `color` | Hex string. Tints the tab title |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // the group first: the laws below point at it
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // the locale key, not the text
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

No UI work: the World Laws window builds one tab per entry in `world_law_groups.list`, then drops every law into the tab its `group_id` names. It does that once, when the window is first created, and your mod has loaded long before the player gets there. Your tab goes at the end, after `other`.

> [!WARNING] A `group_id` that does not exist breaks the whole window
> The window looks the tab up with a plain dictionary index. A law pointing at a group nobody registered throws `KeyNotFoundException` while the window is being built, and every law registered after it, yours and other mods', never makes it into the window. Register the group before the laws, and spell it the same way twice :PESgn_ToughLuck:.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] World laws use `_title`, not the bare id
> Almost every other asset uses its plain id as the name key. World laws ask for `<id>_title`. Get it wrong and the switch shows up with no label at all :PESgn_Really:.

> [!TIP] A law beats a setting
> Mod settings live in a menu the player opens once. A world law is right there in the game, next to the vanilla ones, per world, and it can be flipped mid-game. If your mod has an on/off behaviour, this is where it belongs :wbblessed:.
