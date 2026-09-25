---
title: Efectos de estado
group: Contenido del juego
subgroup: Actores, edificios e IA
icon: :wbcursed:
order: 146
---

# Efectos de estado :wbcursed:

Un rasgo (trait) define quién **es** una criatura. Un efecto de estado (status) define lo que le está pasando **ahora mismo**: quemándose, congelada, envenenada, bendecida. Expiran por sí solos, colocan su propio sprite sobre la criatura y pueden ejecutar acciones periódicas con un temporizador.

## Registrar uno

Los estados viven en `AssetManager.status`. Mismo patrón que los rasgos: construir el asset, rellenar campos, registrarlo.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] Los frames solo se cargan para los estados vanilla
> `StatusLibrary` rellena `sprite_list` desde `"effects/" + texture` y activa `need_visual_render`, una vez, mientras carga el juego. Un estado añadido después tiene `sprite_list = null`, y en cuanto una criatura lo recibe, `Status.updateAnimationFrame()` lanza `NullReferenceException` en cada frame mientras dure :wbfacepalm:. Las dos últimas líneas de `Initialize` hacen eso por el tuyo.
>
> `texture` nombra una **carpeta**: `GameResources/effects/fx_hello_status/` con un PNG por frame de animación.


### Los campos que conviene conocer

La lista corta. La real es más larga y casi toda aburrida :wbyawn:.

| Campo | Lo que hace |
| --- | --- |
| `duration` | Duración en segundos. El estado se elimina solo al agotarse |
| `allow_timer_reset` | Si reaplicarlo reinicia la duración o no hace nada |
| `tier` | `StatusTier.None`, `Basic` o `Advanced`. El `allowed_status_tiers` del actor decide si lo acepta |
| `can_be_cured` | Si un poder de curación puede retirarlo |
| `removed_on_damage` | Se disipa en el instante en que la criatura recibe daño |
| `cancel_actor_job` | Interrumpe lo que la unidad estuviera haciendo al aplicarse |
| `affects_mind` | Lo cataloga como efecto mental |
| `opposite_status` | Estados que no pueden coexistir con este |
| `remove_status` | Estados que este disipa al aplicarse |
| `base_stats` | Modificadores (modifier) de estadísticas (stats) mientras el estado esté activo |
| `locale_id` / `locale_description` | Claves de nombre y tooltip. **Obligatorias** |
| `path_icon` | Icono en la lista de estados |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | El sprite visual sobre la unidad. `texture` es el nombre simple dentro de `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Posición y renderizado |
| `opposite_traits` | Un `string[]` de ids de **rasgos de criatura**. Una unidad con cualquiera de ellos nunca recibe el estado: `burning` lista `fire_proof`, `poisoned` lista `poison_immune`. Ids simples, comprobados cada vez, así que tus propios rasgos `hello_` funcionan aquí |
| `opposite_tags` | Lo mismo, para tags de estadísticas como `immunity_fire`: una unidad que lleva uno de ellos es inmune |
| `action_on_receive`, `action_get_hit` | Hooks adicionales al recibir y al ser golpeado |
| `sound_idle` | Evento de sonido continuo en bucle FMOD |

## Tu propio sprite personalizado

Esta tiene trampa, y todo el mundo cae en ella una vez :wbbre:. `texture` **no** es una ruta completa: la biblioteca de estados antepone `effects/` antes de cargar, así que escribes solo el nombre.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // NO "effects/fx_hello_status"
```

Si escribes tú la carpeta, el juego busca `effects/effects/fx_hello_status`, no encuentra nada y no dibuja ningún sprite. Los nombres vanilla son como `fx_status_burning_t` y `fx_status_drowning_t`, así que copiar esa forma te ahorra problemas.

`path_icon` en el mismo asset es otra cosa y *sí* es una ruta completa: es el icono pequeño de la lista de estados, no el sprite que se dibuja sobre la unidad.

## Hacer que el efecto *haga* algo

`action` se ejecuta cada `action_interval` segundos mientras el estado está activo. `action_finish` se ejecuta cuando expira, y `action_death` si la unidad muere llevándolo puesto.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // método público y suficiente para daño progresivo
    return true;
};
```

## Aplicarlo a una unidad

El método obvio, `actor.addStatusEffect("hello_cursed")`, está marcado como `internal` en el ensamblado del juego. Compila sin problemas contra una `Assembly-CSharp.dll` **publicizada**, y un mod normal de NML ya tiene una: NML compila tu `Code/*.cs` contra su propia copia publicizada, por eso todos los miembros `internal` de esta guía te compilan. Solo la pierdes cuando compilas tu propia `.dll` en Visual Studio contra el ensamblado original. Para ese caso, toma prestado el propio nodo de comportamiento del juego, cuyo constructor y `execute()` son ambos públicos y que llama a `addStatusEffect` por ti:

```csharp
if (actor == null || !actor.isAlive() || World.world == null || Config.worldLoading) return;
new ai.behaviours.BehActorAddStatus(HelloStatus.CURSED, 20f).execute(actor);   // 20s; pasa 0f para la duración propia del asset
```

> [!WARNING] `World.world.statuses.newStatus()` solo hace la mitad del trabajo
> Es público, y parece el camino de entrada. Solo crea el objeto `Status` e inicia su temporizador: nunca lo pone en la propia lista de estados de la unidad, y se salta todas las comprobaciones, `opposite_traits` incluido. La unidad no sabe que tiene el estado: `hasStatus()` dice que no, y sus `base_stats` nunca se aplican. Ve por `addStatusEffect`, directamente o mediante el nodo de arriba.

Ambos nodos viven en `ai.behaviours`; añade `using ai.behaviours;` para los nombres cortos. Pasa `0f` explícitamente para usar la duración del asset: el nodo de añadir usa `-1f` por defecto, que se reenvía como una anulación, no se trata como la duración por defecto.

Dentro de un árbol de comportamiento (behaviour) los mismos nodos son pasos ya preparados: `new BehActorAddStatus("hello_cursed", 20f)` y `new BehActorRemoveStatus("hello_cursed")`.

## No olvides los textos

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

Las claves son exactamente las que pusiste en `locale_id` y `locale_description`. Seguir el patrón vanilla `status_title_<id>` / `status_description_<id>` mantiene tus archivos limpios y ordenados.

> [!TIP] Los estados son la forma idónea para efectos temporales
> Cualquier cosa que deba disiparse (una mejora de tu poder divino (GodPower), una debilidad de tu arma, una marca de seguimiento) es un estado, no un rasgo. Los rasgos son permanentes y se heredan a los hijos, lo cual casi nunca es lo deseado :PES2_Uhm:.
