---
title: Gotas y cosas que caen
group: Contenido del juego
subgroup: Objetos y equipamiento
icon: :wbloot:
order: 126
---

# Gotas y cosas que caen :wbloot:

Una **gota** (drop) es un objeto pequeño que cae del cielo, aterriza en una casilla y hace algo: lluvia, sangre, semillas, fuego, ácido, monedas. Son la forma más barata de todo el juego para hacer que algo *ocurra* en el mapa, y vienen con su propia animación y sonido gratis.

## Registrar una

Las gotas viven en `AssetManager.drops`. Aquí tienes una gota que aterriza y prende fuego a la casilla:

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

            // qué sucede en el momento en que toca el suelo
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

Luego, en `Main.cs`, añade la línea: `HelloDrops.Initialize();`

### Qué hacen los campos

| Campo | Significado |
| --- | --- |
| `id` | El nombre que usas en todos los demás sitios |
| `path_texture` | El sprite, mismas reglas de ruta que todo lo demás |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Decide parte del comportamiento interno del juego |
| `animated` + `animation_speed` | Reproduce la lista de sprites como una animación |
| `default_scale` | Qué tan grande es. `0.1f` es lo habitual para gotas pequeñas |
| `falling_speed` | A qué velocidad cae |
| `sound_drop` / `sound_launch` | Eventos de sonido de FMOD |
| `action_landed` | **El interesante**: tu código se ejecuta cuando aterriza |
| `action_launch` | Se ejecuta cuando es lanzada |

## Tu propio sprite

`path_texture` se carga exactamente como está escrito, desde dentro de `GameResources/`.

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

Los drops se cargan como **lista de sprites**: el juego lee cada PNG *dentro* de esa carpeta, y por eso funciona `animated`. Un drop quieto sigue siendo una carpeta, con un frame dentro. Un `drops/hello_ember.png` suelto vuelve como lista vacía, y el drop cae invisible :wbwiltedrose:.

## Hacer caer gotas

Dos formas, ambas en `World.world.drop_manager`:

```csharp
// en línea recta hacia una casilla: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// lanzada en arco, como una explosión lanzando escombros
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

`spawn` es lo que buscas el 90 % de las veces. El `15f` es la altura desde la que cae: mayor número significa que tarda más en aterrizar. Y queda más dramático mientras cae.

## Un uso real: haz que tu poder divino llueva brasas

Si hiciste la página de **[Poderes divinos](#/nml/god-powers)**, esta es la recompensa: un poder, una casilla entera ardiendo.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // uno en el centro, uno en cada casilla vecina
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Las gotas son el efecto especial de los perezosos
> Antes de escribir un sistema de partículas, pregúntate si una gota con un sprite y un `action_landed` hace el trabajo. Normalmente lo hace, en diez líneas y con sonido incluido :PESgn_Noice:.
