---
title: God powers
group: Game Content
subgroup: God Powers & UI
icon: :wbgodfinger:
order: 200
---

# God powers :wbgodfinger:

A god power is what happens when the player picks your tool and clicks the world. Spawn something, bless something, blow something up.

Two separate things are involved, and mixing them up is the classic beginner mistake:

| | |
| --- | --- |
| The **power** (`GodPower`) | The data: an id, an icon, and the code that runs on click |
| The **button** (`PowerButton`) | The thing in the bar that the player can actually press |

This page makes the power. The **[Power tabs & buttons](#/nml/power-buttons)** page puts it on screen.

## Make the power

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Never register the same id twice: the game keeps the first one.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // no unlock needed
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // drop the tool when a window opens
                show_tool_sizes = false,            // no small/medium/large brush sizes

                // What happens when the player clicks a tile with this tool armed.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = the click was used
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Add `HelloPowers.Initialize();` to `Main.cs`.

### What each part does

- **`id`**: the name everything else refers to. The button, the translation, other mods.
- **`name`**: used by the game's own UI lookups. Keeping it the same as the id saves you a headache.
- **`rank = PowerRank.Rank0_free`**: available from the start, no unlocking.
- **`path_icon`**: the cursor/tool icon.
- **`unselect_when_window`**: when the player opens a window, the tool disarms itself, so they do not accidentally smite the map behind the panel.
- **`click_action`**: your code. It receives the **tile that was clicked** and the **power id**, and returns `true` if it did something.

> [!WARNING] The click signature is `(WorldTile, string)`
> `click_action` is a `PowerActionWithID`, so its second argument is the power **id as a string**, not a `GodPower`. There is a second field, `click_power_action`, which takes `(WorldTile, GodPower)`. Using the wrong shape gives you a compile error that reads like nonsense :PES_DaFuq:.

## Useful things to do on click

```csharp
// the unit standing on (or next to) the tile, if any
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// spawn a creature
World.world.units.spawnNewUnit("wolf", pTile);

// a visual effect at the tile
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// drop something from the sky (see Drops & falling things)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// tell the player something
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Hold to paint

Setting `hold_action = true` and a `click_interval` makes the power repeat while the mouse is held, like the vanilla brush tools:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // seconds between repeats
```

## Your own icon

`path_icon` is the tool cursor and the button face. Loaded exactly as written, from inside `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] A missing icon is an invisible button
> If the path is wrong the sprite comes back `null`, and a `null` sprite is not a button with a missing picture: it is a hole in the power bar that the player will never find. See the fallback helper on **[Power tabs & buttons](#/nml/power-buttons)** :aPES_Hide:.

## The text

```json Mods/HelloBox/Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Brushes

A power paints with a **brush**: the shape of tiles one click covers. The game builds each brush's pixel list and its preview picture from code, so a new shape needs no art at all.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

A power can lock itself to a brush with `force_brush = "hello_target"`, the way vanilla's single-tile powers lock to `sqr_0`. The brush hotkeys cycle through `_available_brushes`, so yours is in that rotation. The brush window is another matter: it builds its buttons when it wakes up, and I have not checked whether that happens before or after mods load. If yours is missing there, `force_brush` and the hotkeys still reach it.

> [!WARNING] Brushes are measured at startup
> `BrushLibrary.post_init()` runs every brush's `generate_action` and computes `width`, `height` and `sqr_size`, and `linkAssets()` shuffles the pixels. A brush you add later gets none of it: set `pos` and the sizes yourself, as above. The preview picture is drawn from `pos`, so a brush needs no icon from you.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## It still is not in the game

Right: you made a power, but nothing shows it. Go to **[Power tabs & buttons](#/nml/power-buttons)**, that is the other half, and it is ten lines :pepeOK:.
