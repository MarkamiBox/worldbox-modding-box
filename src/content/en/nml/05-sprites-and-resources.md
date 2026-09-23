---
title: Sprites & resources
group: NML Modding
subgroup: Core Workflow
icon: :wbfanartist:
order: 28
---

# Sprites & resources :wbfanartist:

Your trait has a name, stats and a beautiful description. It also has a big ugly question mark for an icon. Time to fix that.

## Using an icon the game already has

Cheapest option, and the one you will use the most: point at a vanilla sprite path.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` is `Resources.Load` with a cache, `getSpriteList` is `Resources.LoadAll` with a cache. Paths carry no file extension, so it is `ui/Icons/iconFly`, never `ui/Icons/iconFly.png`.

Most asset fields want the **path as a string** rather than a loaded sprite:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] How do I know which paths exist?
> Use the **[Icon search](#/tools/icons)** on this site. It holds every sprite path in the game and takes plain English, so "death king" or "lightning bolt" gets you the path to paste. Failing that, open **[UnityExplorer](#/toolbox/unity-explorer)** in game and read `path_icon` off the vanilla asset that already looks like the thing you want :aPES_Magnifying:.

## Adding your own art

Make a folder called **`GameResources/`** in your mod. NML treats it exactly like Unity's `Resources` folder, so a file at:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

is loaded as `ui/Icons/iconHelloSwift` and works everywhere a vanilla path works. `.png`, `.jpg` and `.jpeg` are picked up automatically.

### sprites.json

Next to your images, a `sprites.json` tells NML how to slice them. Without it you get Unity's defaults, which for pixel art are usually wrong. (Not always needed  :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Field | What it does |
| --- | --- |
| `PixelsPerUnit` | Keep it at `1` unless you know exactly why you want otherwise |
| `PivotX` / `PivotY` | The anchor point. `0.5 / 0.0` is bottom centre, which is what units and buildings usually want |
| `BorderL/R/T/B` | Nine-slice borders, for stretchable window frames and buttons |
| `Path` | Which file this specific entry applies to |

`Default` applies to every file that does not have a `Specific` entry.

## Where each kind of art goes

This is the table people come back for. Every asset points at its art with a different field, and a few of them quietly prepend a folder before loading, so the value you write is **not** always the path the file sits at.

| Asset | Field | The file goes at |
| --- | --- | --- |
| Trait, god power, kingdom, group | `path_icon` | `GameResources/` + exactly what you wrote |
| Item, in a unit's hand | `path_gameplay_sprite` | `GameResources/` + exactly what you wrote |
| Building | `sprite_path` | A **folder**: `GameResources/` + `sprite_path` + `/`, holding `main_0.png`, `construction_0.png`, `ruin_0.png`. With `sprite_path` empty it is `main_path` + id, and `main_path` defaults to `buildings/` |
| Drop | `path_texture` | A **folder**: `GameResources/` + exactly what you wrote, one PNG per frame |
| Cloud | `path_sprites` | `GameResources/` + each path in the list |
| Status effect | `texture` | A **folder**: `GameResources/effects/` + what you wrote, one PNG per frame |
| Projectile | `texture` | A **folder**: `GameResources/effects/projectiles/` + what you wrote, one PNG per frame |
| Resource, carried in hand | `path_gameplay_sprite` | A **folder**: `GameResources/items/resources/` + what you wrote, one PNG per frame |
| Resource, inventory icon | `path_icon` | `GameResources/` + what you wrote. Vanilla uses a bare name like `iconResBread`, so the file sits at the root |
| Tile and top tile | *(no field)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] "A folder" is not a style choice
> Every asset marked **folder** above is read with `getSpriteList()`, which returns the frames *inside* a folder. Point it at a single PNG and it comes back empty: a drop falls invisibly, a projectile throws `ArgumentOutOfRangeException` in `QuantumSpriteLibrary.drawProjectiles()`, a status throws on every frame. One frame is fine, it just has to sit in its own folder: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Three of those bite:

- **Status and projectile prepend a folder.** Writing `texture = "effects/status/myThing"` on a status makes the game look for `effects/effects/status/myThing`, which is nothing. Vanilla statuses use a bare name: `fx_status_burning_t`.
- **Tiles ignore the fields entirely.** A tile's art is found by its **id**, in a folder of its own, because a tile has several variations. `hello_moss` means `GameResources/tiles/hello_moss/` with your PNGs inside.
- **Buildings do not glue, but they fall back.** `sprite_path` is used exactly as written: `"buildings/hello_shrine"` means `GameResources/buildings/hello_shrine/`. Leave it empty and the game uses `main_path` + id instead, so a folder written into `main_path` turns into `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copy the path off a vanilla asset
> Pick the closest vanilla thing, read its field in **[UnityExplorer](#/toolbox/unity-explorer)** or with the **[Icon search](#/tools/icons)** tool, and mirror the shape exactly. That is faster than reasoning about it, and it is right the first time :PESgn_Noice:.

## Reading a file straight off the disk

Sometimes you want the raw file: a window frame you nine-slice yourself, a data file, whatever. `ModDeclare` knows where your mod lives, so never hardcode a path.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // pixel art, no blurring
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

`NeoModLoader.utils.SpriteLoadUtils` also gives you `LoadSingleSprite(path)` and `LoadSprites(path)` if you would rather not do it by hand.

## Sounds

Every sound in WorldBox is an FMOD event, played by path, and any of them is yours to play:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

The first one plays from that tile of the world. HelloBox plays the fireball sound when its combat action throws an ember, see **[Projectiles, spells & effects](#/nml/projectiles-spells)**. To find paths, search the game's code for `event:/SFX/`: there are hundreds, sorted into folders by what makes the noise.

> [!NOTE] New sounds are a different project
> FMOD events live in the game's sound banks, and a mod cannot add to them. Playing your own `.wav` means loading it into a Unity `AudioSource` yourself, outside the game's volume settings. This guide does not cover it, because I have never modded it and I am not going to pretend I have.

## Never hand the game a null sprite

A button with a missing sprite is not a button with a missing icon, it is an **invisible hole** in the UI that the player will never find. Always fall back:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

A question mark tells you "the path is wrong". Nothing at all tells you "spend two hours wondering where your button went" :PES4_Invisible:.
