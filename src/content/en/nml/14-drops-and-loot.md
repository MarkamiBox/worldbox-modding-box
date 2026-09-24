---
title: Drops & falling things
group: Game Content
subgroup: Items & Equipment
icon: :wbloot:
order: 126
---

# Drops & falling things :wbloot:

A **drop** is a small object that falls from the sky, lands on a tile and does something: rain, blood, seeds, fire, acid, coins. They are the cheapest way in the whole game to make something *happen* on the map, and they come with their own animation and sound for free.

## Register one

Drops live in `AssetManager.drops`. Here is a drop that lands and sets the tile on fire:

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

            // what happens the moment it touches the ground
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

Then in `Main.cs`, add the line: `HelloDrops.Initialize();`

### What the fields do

| Field | Meaning |
| --- | --- |
| `id` | The name you use everywhere else |
| `path_texture` | The sprite, same path rules as everything else |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Decides some of the game's own handling |
| `animated` + `animation_speed` | Play the sprite list as an animation |
| `default_scale` | How big it is. `0.1f` is the usual for small drops |
| `falling_speed` | How fast it comes down |
| `sound_drop` / `sound_launch` | FMOD sound events |
| `action_landed` | **The interesting one**: your code runs when it lands |
| `action_launch` | Runs when it is thrown |

## Your own sprite

`path_texture` is loaded exactly as written, from inside `GameResources/`.

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

Drops are loaded as a **sprite list**: the game reads every PNG *inside* that folder, which is what lets `animated` work. A still drop is still a folder, with one frame in it. A loose `drops/hello_ember.png` comes back as an empty list, and the drop falls invisible :PES4_Invisible:.

## Making drops fall

Two ways, both on `World.world.drop_manager`:

```csharp
// straight down onto a tile: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// thrown in an arc, like an explosion throwing debris
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

`spawn` is what you want 90% of the time. The `15f` is the height it falls from: bigger means it takes longer to land, and looks more dramatic on the way down.

## A real use: make your god power rain embers

If you did the **[God powers](#/nml/god-powers)** page, this is the payoff: one power, a whole tile on fire.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // one in the middle, one on each neighbouring tile
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Drops are the lazy special effect
> Before writing a particle system, ask whether a drop with a sprite and an `action_landed` does the job. It usually does, in ten lines, with sound included :PESgn_Noice:.
