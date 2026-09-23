---
title: Clouds & weather
group: Game Content
subgroup: World & Civilizations
icon: :wbtornado:
order: 172
---

# Clouds & weather :wbtornado:

A cloud is a sprite that drifts across the map dropping things on whatever is underneath. Rain, acid, lava, snow, fire: they are all the same asset with a different colour and a different `drop_id`.

Clouds are the single best value in the game for a modder. One asset, no art needed, and it moves, drops, lights the ground and shows up in the disasters list on its own.

## Register one

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] A cloud registered late has no sprites
> `CloudLibrary` builds `cached_sprites` from `path_sprites`, and `color` from `color_hex`, in one pass while the game loads. Your cloud was not in the list yet, so both stay empty, and the first time it spawns the game throws `NullReferenceException` in `Cloud.prepare()` :wbfacepalm:. The last six lines of `Initialize` above do that pass for yours.


### The fields

| Field | What it does |
| --- | --- |
| `color_hex` | The tint. This is most of what makes a cloud feel different |
| `max_alpha` | How solid it draws. `0.8` by default |
| `drop_id` | The drop it rains. Any id in `AssetManager.drops`, vanilla or yours |
| `cloud_action_1` / `cloud_action_2` | Two independent actions, each on its own timer |
| `interval_action_1` / `interval_action_2` | Seconds between runs of each action |
| `speed_min` / `speed_max` | Drift speed. Each cloud rolls its own inside this range |
| `path_sprites` | The sprite list. The game picks one per cloud |
| `considered_disaster` | Whether the game treats it as a disaster |
| `normal_cloud` | Marks it as ordinary weather rather than an event |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | The glow underneath, for fire and lava clouds |

## What a cloud action is

A `CloudAction` takes the live cloud and returns nothing:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` is the vanilla one: it picks a random tile under the cloud's sprite and spawns one `drop_id` there. Ninety percent of the time that is the only action you want, and you set it on `cloud_action_1` and stop.

For something extra, write your own and put it on `cloud_action_2`:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // Runs every interval_action_2 seconds, for every cloud of this type on the map.
    // Keep it cheap, and roll a chance so it does not fire constantly.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Then `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## Your own sprites

`path_sprites` is a list, and every entry is loaded exactly as written from inside `GameResources/`. The game picks one per cloud, which is why vanilla passes three.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

A cloud sprite is a big soft greyscale blob. `color_hex` does all the work, so do not paint it the colour you want: paint it white and let the tint handle it :wbsmirk:.

## Putting one in the sky

Clouds are spawned through the effects system, not through a cloud manager:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

That is exactly what every vanilla cloud power does. Wrap it in a god power and the player has a cloud tool:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

See **[God powers](#/nml/god-powers)** and **[Power tabs & buttons](#/nml/power-buttons)** for the button.

## The vanilla clouds

Useful as clone sources and as a reminder of what already exists:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Start from one that already works and change the colour and the drop.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Remember `clone()` registers for you: do not call `add()` afterwards.

## Sprites of your own

`path_sprites` is a list of paths under your `GameResources/`, same rules as everything else. See **[Sprites & resources](#/nml/sprites-and-resources)**. A cloud sprite is a big soft blob; the `color_hex` does the work, so a greyscale shape is usually all you need.

> [!TIP] Clouds before disasters
> A "disaster" in the game's own list is often just a cloud with `considered_disaster = true`. Before you write a real disaster with a spawn condition and a duration, check whether a cloud raining your drop already does the thing you wanted :PES2_HmmmmThumbsUp:.
