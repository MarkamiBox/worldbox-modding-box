---
title: Desastres
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbmeteorite:
order: 184
---

# Desastres :wbmeteorite:

Un desastre (disaster) es algo que el mundo se hace a sí mismo: un tornado, una ola de calor, un meteorito. El juego evalúa su aparición periódicamente a medida que pasa el tiempo, por lo que a diferencia de un poder divino (GodPower), **nadie tiene que hacer clic en nada**. Tú defines las condiciones y el mundo hace el resto.

## Añadir un desastre

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

Regístralo en `Main.cs` (consulta **[El mod completo](#/nml/all-together)**), carga un mundo con al menos una ciudad y cien unidades, y espera. Con el tiempo, el cielo empezará a llover ascuas por sí solo :wbfireskull:.

### Los campos

`rate` y `chance` son los dos que más vas a retocar. El aviso al final de la página explica por qué.

| Campo | Qué hace |
| --- | --- |
| `rate` | Peso en el sorteo. Más alto significa que sale más a menudo frente a los demás |
| `chance` | Una segunda tirada una vez elegido |
| `min_world_population` / `min_world_cities` | Condiciones antes de que pueda ocurrir siquiera |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | El id de un `WorldLogAsset`: la línea del registro del mundo. **No** es una clave de traducción, mira abajo |
| `action` | Tu código. Esto es el desastre |
| `spawn_asset_unit` + `units_min`/`units_max` | Atajo para "genera N de esta criatura" |
| `max_existing_units` | No generar más si ya existen tantas |
| `ages_allow` / `ages_forbid` | Lo limita a ciertas eras del mundo, por ejemplo solo en la Era de la Ceniza |

Limitarlo a una era se hace después de construir el asset:

```csharp
emberStorm.ages_allow.Add("age_ash");
emberStorm.ages_allow.Add("age_chaos");
```

## Generar criaturas sin código personalizado

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"Sin código" es casi exacto. Un desastre **siempre** necesita una `action`, porque la tirada del juego la invoca sin comprobación de nulos: déjala vacía y la primera vez que el azar lo elija, obtendrás una `NullReferenceException`. Los desastres de criaturas del juego original apuntan a `simpleUnitAssetSpawnUsingIslands`, que lee `spawn_asset_unit`, `units_min`, `units_max` y `max_existing_units`, y escribe la línea del registro por ti. El tuyo puede hacer exactamente lo mismo.

## La entrada en el registro del mundo

`world_log` no es el texto directo. Es el **ID de un `WorldLogAsset`** en `AssetManager.world_log_library`, y dicho asset apunta a la clave de texto. Si usas un ID que no existe, en cuanto el desastre intente registrarse, `WorldLog.logDisaster()` intentará construir el mensaje sobre `null` y lanzará una `NullReferenceException` :wbfacepalm:.

Los desastres vanilla clonan una plantilla base, `$basic_disaster$`, que ya tiene el color de advertencia y el grupo "disasters". `HelloDisasters` hace lo mismo:

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Luego algo tiene que escribir la línea en el log. Los generadores vanilla llaman a `WorldLog.logDisaster(pAsset, tile)` automáticamente. Una `action` personalizada no lo hace sola, por lo que la tuya lo invoca pasándole la casilla (tile) donde comenzó la tormenta: esa es la posición a la que salta el botón del registro.

| Campo de `WorldLogAsset` | Qué hace |
| --- | --- |
| `locale_id` | La clave de texto. Si está vacía, usa el propio ID |
| `path_icon` | El icono al inicio de la línea |
| `color` | El color del texto. La plantilla usa el tono de alerta |
| `group` | A qué filtro del registro del mundo pertenece |
| `random_ids` | Elige entre varios textos al azar: `<locale_id>_1`, `_2`... |

El ejemplo de los lobos necesita las mismas dos cosas: su propio asset de log clonado bajo `disaster_hello_wolf_year` y el texto `worldlog_disaster_hello_wolf_year`. El generador vanilla se encargará de escribir la línea.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Redáctalo como un titular de noticias, no como una descripción técnica. "Caen brasas del cielo" le gana a "ha comenzado un evento relacionado con brasas". Es la frase que el jugador leerá en el registro del mundo.

> [!WARNING] Prueba con los números aumentados
> `rate = 4, chance = 0.5f` significa que podrías esperar veinte minutos hasta ver tu propio desastre. Durante el desarrollo, aumenta el `rate` y reduce los mínimos a cero; luego restablécelos antes de publicar :PES2_EvilPlan:.
