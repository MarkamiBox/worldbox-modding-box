---
title: Recordar cosas
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbfloppysavewink:
order: 44
---

# Recordar cosas :wbfloppysavewink:

Tarde o temprano tu mod necesitará recordar algo sobre una unidad específica: cuántas veces fue golpeada, si ya recibió su recompensa o en qué santuario reza. Un diccionario estático indexado por unidad olvidará todo en el instante en que el jugador guarde y vuelva a cargar la partida :wbfacepalm:.

El juego ya cuenta con un lugar pensado para esto. Cada unidad, ciudad, reino, edificio, objeto y libro mantiene su estado en un objeto de datos, y cada uno de ellos dispone de un pequeño almacén de **datos personalizados** (custom data) que se guarda junto con él en el archivo de guardado.

## El almacén

| Llamada | Qué hace |
| --- | --- |
| `data.set(key, value)` | Guarda un `int`, `long`, `float`, `string` o `bool` bajo una clave |
| `data.get(key, out value, default)` | Lo recupera. Si la clave no existe, devuelve el valor por defecto |
| `data.change(key, amount, min, max)` | Suma a un `int` y lo limita (clamp) en una sola llamada |
| `data.addFlag(key)` | Establece un indicador (flag). Devuelve `false` si ya estaba activo |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Comprueba o elimina el flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Elimina un valor almacenado |

Cada tipo de dato cuenta con su propia tabla interna, de modo que un `int` y un `string` bajo la misma clave no colisionan. Aun así, por tu propia salud mental, no reutilices claves para tipos distintos.




## Guardar objetos complejos con NML

Si cinco tipos primitivos se te quedan cortos y necesitas guardar una clase entera, NML proporciona `DataExtension` en `NeoModLoader.General.Game.extensions`:

```csharp
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

// Guardar en el actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Leer de nuevo:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress quest = saved.Data;
}
```

Por debajo, NML serializa tu objeto a JSON en la tabla `custom_data_string`. Si tu estructura va a cambiar, implementa `ICustomData` directamente para tener control de versiones :PES5_Hmmmm:.

## En HelloBox

Un rasgo que cuenta cada golpe que asesta su portador y le otorga una recompensa única al llegar a cincuenta:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Guarda la partida y cárgala de nuevo: el contador sigue intacto, porque forma parte de los datos de guardado propios de la unidad. El flag es lo que garantiza que la recompensa se conceda una sola vez y no en cada golpe posterior al quincuagésimo.

Sus textos, como los de cualquier rasgo:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` es `internal`
> El campo de datos de una unidad está marcado como `internal` en el ensamblado del juego. NML compila tu mod contra una copia **publicitada**, por lo que en un mod de código fuente normal funciona directamente. Solo fallará si compilas tu propia `.dll` contra el ensamblado original sin modificar: consulta **[Solución de problemas](#/troubleshooting)**. El campo `data` de ciudades y reinos es público de por sí.

## Dónde reside

| Objeto | Sus datos |
| --- | --- |
| Una unidad | `actor.data` |
| Una ciudad | `city.data` |
| Un reino | `kingdom.data` |
| Un edificio | `building.data` |
| Culturas, religiones, clanes, idiomas, familias, ejércitos, complots | su `data`, todos comparten la misma estructura |

## Cosas que debes saber

- **Pon prefijo a tus claves.** Todos los mods escriben en el mismo almacén. `hello_hits` nunca colisionará con nadie; `hits`, tarde o temprano, sí.
- **Desactivar o borrar el mod es seguro.** Las claves permanecen en el archivo guardado, nadie las lee y nada se rompe. Esa es la enorme ventaja frente a parchear el formato de guardado del juego.
- **Los almacenes vacíos no ocupan nada.** El juego descarta las tablas vacías antes de guardar en disco, de modo que una clave eliminada desaparece por completo.
- **Mantén los datos compactos.** Se guardan con cada unidad. Un contador o un flag por criatura es prácticamente gratis; una cadena de texto larga por unidad en un mundo de diez mil criaturas engordará el guardado para todos.

Para todo aquello que no pertenezca a un objeto individual (como una configuración global para todo el mapa), usa la configuración de tu mod: consulta **[Configuración del mod](#/nml/mod-config)** :PES_OkHand:.
