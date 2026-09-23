---
title: Getting the game's art (AssetRipper)
group: Overview
subgroup: External Tools & Setup
icon: :wbgeneralartist:
order: 8
---

# Getting the game's art :wbgeneralartist:

Code tells you *what* to write. **AssetRipper** tells you what the art looks like and, more importantly, **what its path is**.

Every icon, unit, building and effect in WorldBox is loaded by a string path like `ui/Icons/iconFly`. Get the path wrong and your button is an invisible hole. AssetRipper is how you stop guessing.

> [!TIP] If you only need the path, you do not need any of this
> The **[Icon search](#/tools/icons)** on this site was built from exactly this export: every path in the game, searchable in plain English. Rip the game yourself when you want to *see* the art, pick the right size, or match the palette. That is what the rest of this page is for :PES4_HappyAwesome:.

## Export the game

1. Download [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases).
2. Point it at your WorldBox folder (the one with `worldbox_Data`).
3. Export to a folder of your choice. It takes a few minutes and a couple of GB :pepehang:.

You get a Unity project. The part you care about is the exported `Resources` folder, the same tree the game asks for at runtime.

## Turning a file into a path

The rule is simple: **the path is the location under `Resources`, without the file extension.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

So the folders you will use most:

| Folder | What is in it |
| --- | --- |
| `ui/Icons/` | Every small interface icon: traits, powers, buttons |
| `ui/Icons/worldrules/` | World law icons |
| `actors/` | Units and their animation frames |
| `buildings/` | Houses, trees, minerals |
| `effects/` | Explosions, projectiles, status sprites |

## Using it in your mod

Find an icon you like in the export, note the path, and use it directly, no copying of files needed, it is already in the game:

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

Or set it on an asset as a string:

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## Matching the style for your own art

If you draw your own, open a vanilla file first and copy three things:

- **The size.** Trait and power icons are small, usually in the 16 to 32 px range. Open one and match it.
- **The palette.** WorldBox has a limited, soft palette. Pick your colours from an existing sprite and your icon will not look out of place :PES3_BobRoss:.
- **The pivot.** Units and buildings stand on the ground, so their pivot is bottom-centre. That is the `PivotY: 0.0` in your `sprites.json` (see **[Sprites & resources](#/nml/sprites-and-resources)**).

Then drop your PNG in `GameResources/` with the same folder shape, and it loads exactly like a vanilla one:

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
