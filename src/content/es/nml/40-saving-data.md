---
title: Recordar cosas
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbfloppysavewink:
order: 44
---

# Recordar cosas :wbfloppysavewink:

Tarde o temprano tu mod necesitará recordar algo sobre una unidad específica: cuántas veces fue golpeada, si ya recibió su recompensa o en qué santuario reza. Un diccionario estático indexado por unidad olvidará todo en el instante en que el jugador guarde y vuelva a cargar la partida :wbfacepalm:.

El juego ya cuenta con un lugar pensado para esto. Cada unidad, ciudad, reino (kingdom), edificio (building), objeto y libro (book) mantiene su estado en un objeto de datos, y cada uno de ellos dispone de un pequeño almacén de **datos personalizados** (custom data) que se guarda junto con él en el archivo de guardado.

## El almacén

| Llamada | Qué hace |
| --- | --- |
| `data.set(key, value)` | Guarda un `int`, `long`, `float`, `string` o `bool` bajo una clave |
| `data.get(key, out value, default)` | Lo recupera. Si la clave no existe, devuelve el valor por defecto |
| `data.change(key, amount, min, max)` | Suma a un `int` y lo limita (clamp) en una sola llamada |
| `data.addFlag(key)` | Establece un indicador (flag). Devuelve `false` si ya estaba activo |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Comprueba o elimina el flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Elimina un valor almacenado |

Cada tipo de dato cuenta con su propia tabla interna, de modo que un `int` y un `string` bajo la misma clave no colisionan. Aun así, por tu propia salud mental, no reutilices claves para tipos distintos. Tu yo del futuro no recordará cuál era cuál.




## Guardar objetos complejos con NML

Si cinco tipos primitivos te parecen de 1995 y de verdad necesitas guardar una clase o una lista entera en un actor, NML ofrece `DataExtension` en `NeoModLoader.General.Game.extensions`: dos métodos de extensión, `Set` y `TryGet`, sobre cualquiera de los objetos de datos de abajo.

Envuelve tu clase de datos en `BasicCustomData<T>`:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

Dentro de un método con un `Actor actor`, crea el valor antes de guardarlo:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Guardar en el actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Leer de nuevo:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

Por dentro, `Set` convierte tu objeto en JSON y lo guarda con el simple `data.set(key, string)` de la tabla de arriba. Así que es una sola cadena de texto por clave por unidad, y la regla de "mantenlo compacto" de más abajo aplica el doble. Tu clase necesita un constructor sin parámetros, y sus campos y propiedades públicos son lo que se guarda.

Si esperas que tu formato de datos cambie entre actualizaciones del mod, implementa `ICustomData` en tu clase en su lugar. Son dos métodos: `Serialize()` devuelve un `SerializedCustomData(modId, dataVersion, jObject)`, y `Deserialize(SerializedCustomData)` lo recupera. Comprobar `ModId` y `DataVersion` ahí dentro es tarea tuya, nadie lo hace por ti. `BasicCustomData<T>` escribe valores de relleno en ambos y lanza una excepción si lee cualquier otra cosa, así que no mezcles los dos en una misma clave :PES5_Hmmmm:.

> [!NOTE] Verificado contra NML 1.2.0
> Estos nombres y firmas vienen del propio ensamblado de NML, no de su documentación, que no los menciona. Si una versión más nueva de NML renombra algo, el compilador te avisará antes que tus jugadores.

## En HelloBox

Un rasgo (trait) que cuenta cada golpe que asesta su portador y le otorga una recompensa única al llegar a cincuenta:

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

Guarda la partida y cárgala de nuevo: el contador sigue intacto, porque forma parte de los datos de guardado propios de la unidad. El flag es lo que garantiza que la recompensa se conceda una sola vez y no en cada golpe posterior al quincuagésimo. Generoso, pero sigue siendo un bug.

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
| Culturas (culture), religiones (religion), clanes, idiomas, familias, ejércitos, complots (plot) | su `data`, todos comparten la misma estructura |

## Cosas que debes saber

- **Pon prefijo a tus claves.** Todos los mods escriben en el mismo almacén. `hello_hits` nunca colisionará con nadie; `hits`, tarde o temprano, sí.
- **Desactivar o borrar el mod es seguro.** Las claves permanecen en el archivo guardado, nadie las lee y nada se rompe. Esa es la enorme ventaja frente a parchear el formato de guardado del juego.
- **Los almacenes vacíos no ocupan nada.** El juego descarta las tablas vacías antes de guardar en disco, de modo que una clave eliminada desaparece por completo.
- **Mantén los datos compactos.** Se guardan con cada unidad. Un contador o un flag por criatura es prácticamente gratis; una cadena de texto larga por unidad en un mundo de diez mil criaturas engordará el guardado para todos.

## El mundo entero

Parte del estado no pertenece a ninguna unidad: cuántos meteoritos ha dejado caer tu poder en este mundo, si la bendición única ya ocurrió. El mundo tiene el mismo almacén, en sus estadísticas de mapa:

```csharp
// map_stats es internal: funciona en un mod de código fuente de NML, igual que actor.data arriba
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() limita a 1000 a menos que digas lo contrario
if (world.addFlag("hello_blessed")) { /* solo la primera vez en este mundo */ }
```

`SaveCustomData` es el mismo almacén `BaseSystemData`, así que cada llamada de la tabla de arriba funciona, y también los `Set` / `TryGet` de NML. Se guarda junto con el resto de las estadísticas de mapa, así que cada partida guardada tiene la suya. Un mundo recién generado empieza vacío. El juego crea el almacén siempre que construye o carga las estadísticas de mapa, así que la comprobación de null no debería dispararse nunca; no cuesta nada, mantenla.

> [!TIP] ¿Ajustes o datos del mundo?
> Pregúntate si el jugador esperaría que el valor cambiara al cargar otra partida distinta. "Cuán fuerte es el poder del meteorito" no: eso son **[Ajustes del mod](#/nml/mod-config)**, compartidos por todos los mundos. "¿Este mundo ha sido bendecido?" sí: eso es `custom_data`.

## Tiempo que sobrevive a un guardado

`Time.time` son segundos desde que se lanzó el juego. Guárdalo en los datos de una unidad, guarda la partida, reinicia, carga, y cada marca de tiempo que escribiste es de una vida anterior :wbfacepalm:.

El mundo mantiene su propio reloj, y se guarda con el mapa:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, en segundos de mundo: 5 es un mes, 60 es un año
double now = World.world.getCurWorldTime();

// el almacén no tiene double, un float es de sobra para una marca de tiempo
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

También se detiene cuando el juego está en pausa y corre más rápido a mayor velocidad, que es casi siempre lo que querías. `Date.getYearsSince(at)` y `Date.getMonthsSince(at)` hacen la división por ti.

## Ejecutar código después de que carga un mundo

Todo lo anterior se lee bajo demanda, así que normalmente no necesitas saber cuándo cargó un mundo. Cuando sí lo necesitas, por ejemplo para reconstruir una caché propia, estos son los métodos que los mods enganchan con **[Harmony](#/nml/harmony-patches)**:

| Método | Cuándo se ejecuta |
| --- | --- |
| `MapBox.clearWorld` (público) | Antes de generar o cargar cualquier mundo. Vacía aquí tus cachés estáticas |
| `SaveManager.loadActors` (privado) | Durante la carga de una partida, justo después de reconstruir las unidades |
| `MapBox.finishMakingWorld` (público) | Cerca del final tanto de generar como de cargar un mundo |
| `SaveManager.saveWorldToDirectory` (público, static) | Al guardar, manual o automáticamente. Un Prefix es tu última oportunidad de escribir en el almacén |
| `MapBox.addLastStep` (privado) | Una sola vez, cuando arranca el juego. No por mundo |
| `MapBox.OnApplicationQuit` (privado) | El juego se está cerrando |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // una copia en caché para el código que la lee cada frame; el guardado conserva la real
        public static int MeteorsThisWorld;

        // se ejecuta igual para un mundo nuevo que para una partida cargada
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

Los métodos privados llevan el nombre como cadena de texto, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, como explica la página de Harmony. La pantalla de carga sigue activa cuando se ejecuta `finishMakingWorld`; le siguen un par de pasos más.

## Tus propios archivos

Muchos mods se saltan todo esto y escriben un archivo JSON con `File.WriteAllText`, normalmente bajo `Application.persistentDataPath`, que es la carpeta `LocalLow\mkarpenko\WorldBox` junto a `Player.log`. Eso está bien para cosas que pertenecen al **jugador**: una lista de unidades favoritas que exportó, estadísticas de todas las partidas que ha jugado.

Está mal para cosas que pertenecen a un **mundo**. El archivo no sabe qué ranura de guardado está cargada. El jugador bendice un reino en la ranura 1, carga la ranura 2, y la ranura 2 también queda bendecida. Luego borra la ranura 1 y tu archivo conserva ese estado para siempre :PES2_F:. Si debería cambiar cuando cambia la partida, va en el guardado, en uno de los almacenes de arriba.

## Hacia dónde seguir

Para valores que el jugador elige una vez y que comparten todos los mundos, consulta **[Ajustes del mod](#/nml/mod-config)**. Para código que comprueba algo cada frame, o cada mes de juego, consulta **[Cada frame](#/nml/update-loops)** :PES_OkHand:.
