---
title: Leyes del mundo
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbworldlaws:
order: 176
---

# Leyes del mundo :wbworldlaws:

Las leyes del mundo son los interruptores de la ventana **Leyes del mundo**: "vejez", "hambre", "monstruos pacíficos". Son lo más amigable para el jugador que puedes añadir, ya que permiten activar y desactivar el comportamiento de tu mod sin tener que tocar ningún archivo de configuración.

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
| `group_id` | La pestaña en la que aterriza: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
| `icon_path` | El icono, mismas reglas de ruta que en todas partes |
| `default_state` | `true` = activo para mundos nuevos, `false` = desactivado |
| `can_turn_off` | Por defecto `true`. Pon `false` para una ley que solo se pueda activar |

## Leer el interruptor en tu código

Esta es la gracia del asunto. En cualquier parte de tu mod:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // el jugador quiere caos, dale caos
}
```

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

## El texto

```json Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] Las leyes del mundo usan _title, no el id a secas
> Casi cualquier otro asset usa su id plano como clave de nombre. Las leyes del mundo piden `<id>_title`. Si te equivocas, el interruptor aparecerá sin etiqueta alguna :PESgn_Really:.

> [!TIP] Una ley supera a un ajuste
> Los ajustes de mod viven en un menú que el jugador abre una vez. Una ley del mundo está ahí mismo en el juego, junto a las vainilla, por mundo, y se puede cambiar a mitad de partida. Si tu mod tiene un comportamiento de encendido/apagado, este es su lugar :wbblessed:.
