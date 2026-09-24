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
| `group_id` | The tab it lands in: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
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

## The text

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] World laws use `_title`, not the bare id
> Almost every other asset uses its plain id as the name key. World laws ask for `<id>_title`. Get it wrong and the switch shows up with no label at all :PESgn_Really:.

> [!TIP] A law beats a setting
> Mod settings live in a menu the player opens once. A world law is right there in the game, next to the vanilla ones, per world, and it can be flipped mid-game. If your mod has an on/off behaviour, this is where it belongs :wbblessed:.
