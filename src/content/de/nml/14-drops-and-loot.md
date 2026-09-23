---
title: Tropfen & fallende Objekte
group: Spielinhalte
subgroup: Gegenstände & Ausrüstung
icon: :wbloot:
order: 126
---

# Tropfen & fallende Objekte :wbloot:

Ein **Tropfen** (Drop) ist ein kleines Objekt, das vom Himmel fällt, auf einer Kachel landet und etwas bewirkt: Regen, Blut, Samen, Feuer, Säure, Münzen. Sie sind der billigste Weg im gesamten Spiel, etwas auf der Karte *geschehen* zu lassen, und sie bringen kostenlos ihre eigene Animation und ihren eigenen Sound mit.

## Einen registrieren

Drops leben in `AssetManager.drops`. Hier ist ein Drop, der landet und die Kachel in Brand setzt:

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

            // was passiert in dem Moment, in dem er den Boden berührt
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

Füge dann in `Main.cs` die Zeile hinzu: `HelloDrops.Initialize();`

### Was die Felder bewirken

| Feld | Bedeutung |
| --- | --- |
| `id` | Der Name, den du überall sonst verwendest |
| `path_texture` | Das Sprite, dieselben Pfadregeln wie bei allem anderen |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Bestimmt einen Teil der spielinternen Handhabung |
| `animated` + `animation_speed` | Spielt die Sprite-Liste als Animation ab |
| `default_scale` | Wie groß er ist. `0.1f` ist der übliche Wert für kleine Tropfen |
| `falling_speed` | Wie schnell er herunterfällt |
| `sound_drop` / `sound_launch` | FMOD-Sound-Events |
| `action_landed` | **Das Interessante**: Dein Code wird ausgeführt, wenn er landet |
| `action_launch` | Wird ausgeführt, wenn er geworfen wird |

## Dein eigenes Sprite

`path_texture` wird genau wie angegeben geladen, aus dem Ordner `GameResources/`.

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

Drops werden als **Sprite-Liste** geladen: Das Spiel liest jede PNG *in* diesem Ordner, deshalb funktioniert `animated`. Auch ein stillstehender Drop ist ein Ordner, mit einem Frame darin. Eine lose `drops/hello_ember.png` kommt als leere Liste zurück, und der Drop fällt unsichtbar.

## Tropfen fallen lassen

Zwei Wege, beide über `World.world.drop_manager`:

```csharp
// direkt nach unten auf eine Kachel: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// in einem Bogen geworfen, wie eine Explosion, die Trümmer schleudert
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

`spawn` ist das, was du in 90 % der Fälle willst. Das `15f` ist die Höhe, aus der er fällt: Größer bedeutet, dass er länger braucht, um zu landen.

## Ein echter Anwendungsfall: Lass deine Gotteskraft Funken regnen

Wenn du die Seite **[Gotteskräfte](#/nml/god-powers)** durchgearbeitet hast, ist das hier der Lohn: Eine Kraft, eine ganze Kachel brennt.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // einer in der Mitte, einer auf jeder benachbarten Kachel
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Tropfen sind der faule Spezialeffekt
> Bevor du ein Partikelsystem schreibst, frage dich, ob ein Tropfen mit einem Sprite und einer `action_landed` die Aufgabe erledigt. Meistens tut er das, in zehn Zeilen, inklusive Sound :PESgn_Noice:.
