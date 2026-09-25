---
title: Leyes del mundo
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbworldlaws:
order: 176
---

# Leyes del mundo :wbworldlaws:

Las leyes del mundo (world law) son los interruptores de la ventana **Leyes del mundo**: "vejez", "hambre", "monstruos pacíficos". Son lo más amigable para el jugador que puedes añadir, ya que permiten activar y desactivar el comportamiento (behaviour) de tu mod sin tener que tocar ningún archivo de configuración.

Además, son uno de los assets más fáciles de todo el juego. Cuatro campos.

## Añadir un interruptor

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
                group_id = "units",                                  // en qué pestaña aparece
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // empieza desactivado
            });
        }
    }
}
```

Añade `HelloLaws.Initialize();` a `Main.cs` y el interruptor estará en el juego. Eso es sinceramente todo :poggers:.

| Campo | Significado |
| --- | --- |
| `id` | El nombre de tu ley. También la clave de traducción |
| `group_id` | La pestaña en la que aterriza. La lista completa está bajo **Las pestañas** más abajo, o crea la tuya propia |
| `icon_path` | El icono, mismas reglas de ruta que en todas partes |
| `default_state` | `true` = activo para mundos nuevos, `false` = desactivado |
| `can_turn_off` | Por defecto `true`. Pon `false` para una ley que solo se pueda activar |

## Leer el interruptor en tu código

Esta es la gracia del asunto. Un interruptor que nadie lee es decoración. En cualquier parte de tu mod:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // el jugador quiere caos, dale caos
}
```

O el camino corto, directamente desde el mundo, sin buscar el asset:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` devuelve `false` para un id que no conoce en lugar de lanzar una excepción, así que una errata se lee como "apagado" en vez de como un crash. Amable, y también terrible, porque nada te avisa :PES5_Hmmmm:. `World.world.world_laws` es `internal`, así que esto compila contra el ensamblado publicitado con el que NML construye tu mod (mira la nota en **[Efectos de estado](#/nml/status-effects)**). La vía del asset de arriba funciona en todas partes.

Un ejemplo práctico: generar tus brasas solo cuando la ley esté activa:

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

## Reaccionar en el momento en que se activa

Si activar la ley debería *hacer* algo de inmediato, en lugar de simplemente consultarse después:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* se ejecuta cuando el jugador la activa */ }
};
```

## Las pestañas

La ventana está dividida en pestañas, y `group_id` elige una. Estos son todos los grupos vanilla, en el orden en que la ventana los dibuja:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### Una pestaña propia

Sustituye el `Initialize()` del primer ejemplo por la versión de abajo, y añade `GROUP` junto a `CHAOS`.

Un grupo es un `WorldLawGroupAsset` en `AssetManager.world_law_groups`. Es el mismo `BaseCategoryAsset` diminuto que usan las pestañas de rasgos, mira **[Grupos de rasgos y pestañas](#/nml/trait-groups)**:

| Campo | Qué hace |
| --- | --- |
| `id` | A qué apunta el `group_id` de una ley |
| `name` | La **clave de localización** del título de la pestaña. No el título en sí |
| `color` | Cadena hexadecimal. Tiñe el título de la pestaña |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // primero el grupo: las leyes de abajo apuntan a él
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // la clave de localización, no el texto
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

Sin trabajo de UI: la ventana de Leyes del Mundo construye una pestaña por cada entrada en `world_law_groups.list`, y luego coloca cada ley en la pestaña que su `group_id` nombra. Lo hace una sola vez, cuando la ventana se crea por primera vez, y tu mod ya lleva tiempo cargado cuando el jugador llega ahí. Tu pestaña va al final, después de `other`.

> [!WARNING] Un `group_id` que no existe rompe toda la ventana
> La ventana busca la pestaña con un simple índice de diccionario. Una ley que apunta a un grupo que nadie registró lanza `KeyNotFoundException` mientras se construye la ventana, y todas las leyes registradas después de ella, las tuyas y las de otros mods, nunca llegan a la ventana. Registra el grupo antes que las leyes, y escríbelo igual las dos veces :PESgn_ToughLuck:.

## El texto

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] Las leyes del mundo usan `_title`, no el id a secas
> Casi todos los demás assets usan su id a secas como clave del nombre. Las leyes del mundo piden `<id>_title`. Si te equivocas, el interruptor aparece sin ninguna etiqueta :PESgn_Really:.

> [!TIP] Una ley gana a un ajuste
> Los ajustes del mod viven en un menú que el jugador abre una vez. Una ley del mundo está ahí mismo en el juego, junto a las vanilla, por mundo, y se puede cambiar a mitad de partida. Si tu mod tiene un comportamiento de encendido/apagado, este es su sitio :wbblessed:.
