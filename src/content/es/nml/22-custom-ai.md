---
title: IA y comportamientos personalizados
group: Contenido del juego
subgroup: Actores, edificios e IA
icon: :wbgoldenbrain:
order: 144
---

# IA y comportamientos personalizados :wbgoldenbrain:

Aquí entramos en aguas profundas. Todo lo demás en esta guía añade *cosas* al juego. Esto añade **decisiones** (decision): lo que hace una criatura a continuación, por su cuenta, para siempre, en un mundo que comparte con miles de otras entidades. Sin presión :PES_MonkaSweat:.

## Cómo piensa el juego

Tres capas, de grande a pequeña, más la que va al lado. Entender esto me costó más de lo que me gusta admitir:

| Capa | Qué es | Biblioteca |
| --- | --- | --- |
| **Trabajo** (`ActorJob`) | A qué se dedica esta criatura en general: "ser ciudadano", "ser soldado" | `AssetManager.job_actor` |
| **Tarea** (`BehaviourTaskActor`) | Un objetivo concreto dentro de un trabajo: "ir a comer", "construir eso" | `AssetManager.tasks_actor` |
| **Comportamiento** (`BehaviourActionActor`) | Un paso de una tarea, se ejecuta cada tick y devuelve qué hacer a continuación | se añade a una tarea |
| **Decisión** (`DecisionAsset`) | Cuándo empezar una tarea: las opciones que una criatura sopesa cada vez que está libre | `AssetManager.decisions_library` |

Un trabajo contiene tareas, una tarea contiene comportamientos, y los comportamientos se ejecutan en orden hasta que uno dice basta. Las decisiones van al lado de los trabajos: son la forma en que una criatura libre elige su siguiente tarea por su cuenta, mira **[Decisiones](#decisiones-deja-que-la-criatura-elija-tu-tarea)** más abajo.

## Escribir un comportamiento

Un comportamiento es una clase con un único método. Recibe el actor, realiza una pequeña acción y devuelve un `BehResult`:

```csharp
namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            // decide something, write it onto the actor
            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;   // let the next behaviour in the task run
        }
    }
}
```

| Resultado | Significado |
| --- | --- |
| `BehResult.Continue` | Pasar al siguiente comportamiento de esta tarea |
| `BehResult.Stop` | Terminado por este tick |
| `BehResult.RepeatStep` | Ejecutarme de nuevo en el siguiente tick |
| `BehResult.Skip` | Saltar el siguiente |
| `BehResult.StepBack` | Retroceder un paso |
| `BehResult.RestartTask` | Reiniciar la tarea desde el principio |

## Conectar una tarea y un trabajo

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```

`PickTile` es todo el sentido del ejercicio: es la única parte que el juego no hace ya por ti. Todo lo demás en ese archivo es fontanería.

> [!WARNING] `beh_tile_target` es internal
> El campo en el que escribe el comportamiento está marcado como `internal` en el ensamblado del juego, así que esto compila contra un `Assembly-CSharp.dll` **publicitado** (mira la nota en **[Efectos de estado](#/nml/status-effects)**). Sin uno, el compilador rechaza la línea y tienes que guardar el objetivo en un campo tuyo :PES5_Noted:.

Fíjate en el segundo comportamiento: **reutiliza los nodos vanilla**. El juego tiene comportamientos para caminar a una casilla (tile), añadir un estado, encontrar un edificio (building), atacar un objetivo. Escribir la decisión y tomar prestada la ejecución es la diferencia entre un fin de semana y un mes.

## Hacer que una criatura use realmente tu trabajo

No tienes que parchear nada con Harmony. La IA de cada criatura pide su siguiente trabajo a través de un delegado, así que simplemente intercambias el delegado:

```csharp
// tomar el control
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // descarta lo que estuviera haciendo y pide trabajo ahora mismo

// devolver el control
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] La toma de control debe reafirmarse periódicamente
> El combate (y otros sistemas) limpian el trabajo actual cuando terminan, y la criatura solicita uno nuevo. Si tu delegado sigue instalado, recupera el tuyo y el control persiste. Si otro código reemplazó el delegado, lo perderás, así que compruébalo periódicamente en lugar de asumir que se mantiene :PES5_Noted:.

## Decisiones: deja que la criatura elija tu tarea

Sustituir el delegado de trabajo es una toma de control total. La mayoría de las veces prefieres algo más sutil: tu tarea como una opción más que la criatura sopesa frente a comer, dormir o pelear. Eso es una **decisión (Decision)**, y así es como el propio juego decide qué hace una unidad.

Una decisión dice *cuándo*. La tarea que ya escribiste dice *cómo*. Cuando el cerebro elige una decisión, inicia la tarea con el mismo ID o la indicada en `task_id`.

```csharp Mods/HelloBox/Code/HelloDecisions.cs
namespace HelloBox
{
    public static class HelloDecisions
    {
        public const string WANDER = "hello_decide_wander";

        public static void Initialize()
        {
            if (AssetManager.decisions_library.has(WANDER)) return;

            DecisionAsset wander = new DecisionAsset
            {
                id = WANDER,
                task_id = HelloAI.TASK,                  // the decision says when, the task says how
                priority = NeuroLayer.Layer_1_Low,
                path_icon = "ui/Icons/iconHelloDrive",
                cooldown = 20,                           // seconds before this unit may pick it again
                weight = 1f,
                unique = true,                           // only the actors you give it to, below
                action_check_launch = (Actor pActor) => pActor != null && pActor.isAlive() && !pActor.isFighting()
            };

            AssetManager.decisions_library.add(wander);

            // linkAssets() fills these three for every decision, at startup, before your mod.
            // decision_index is where each unit keeps this decision's cooldown: left at 0, yours
            // would share it with the first vanilla decision.
            wander.decision_index = AssetManager.decisions_library.list.IndexOf(wander);
            wander.priority_int_cached = (int)wander.priority;
            wander.has_weight_custom = wander.weight_calculate_custom != null;

            // who gets it: every wisp, through its actor asset
            ActorAsset wisp = AssetManager.actor_library.get("hello_wisp");
            if (wisp != null) wisp.addDecision(WANDER);
        }
    }
}
```

| Campo | Qué hace |
| --- | --- |
| `task_id` | La tarea a iniciar. Vacío usa una tarea con el ID de la decisión |
| `priority` | La capa, de `NeuroLayer.Layer_0_Minimal` a `Layer_4_Critical`. Casi siempre solo compite la capa más alta con opciones posibles |
| `weight` / `weight_calculate_custom` | Atractivo frente a otras en su capa, fijo o calculado por unidad |
| `action_check_launch` | Tu condición. Si devuelve `false`, no se considera esta vez |
| `cooldown` | Segundos antes de que la misma unidad pueda volver a elegirla |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Filtros rápidos que el juego comprueba antes de tu delegado |
| `unique` | La mantiene fuera de las listas estándar. Para decisiones de mods, siempre `true` |

> [!WARNING] Tres campos que el juego rellena al inicio
> `DecisionsLibrary.linkAssets()` numera las decisiones, copia `priority` en `priority_int_cached` y define `has_weight_custom` al iniciar el juego antes de tu mod. Si omites las tres líneas tras `add()`, tu decisión compartirá enfriamiento con la primera decisión vanilla, quedará en la capa más baja e ignorará su peso personalizado :wbfacepalm:.

> [!WARNING] Las unidades ya existentes tienen un solo espacio libre
> Cada unidad guarda sus enfriamientos de decisiones en un array dimensionado al crearse la unidad, redondeado a potencia de dos. El juego vanilla tiene 127 decisiones, por lo que el array tiene 128: espacio para exactamente **una** más. Una unidad previa que reciba una segunda decisión de mod lanzará `IndexOutOfRangeException`. Las nuevas unidades se dimensionan correctamente, por lo que HelloBox asigna su decisión a su propia criatura y no a un rasgo (trait) general.

Una decisión llega a una criatura mediante lo que la otorga. Un `ActorAsset` la recibe con `addDecision()`. **Los rasgos son diferentes**: resuelven sus IDs al inicio, por lo que en un rasgo asignas el array manualmente:

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## Empleos urbanos

Los ciudadanos reciben su trabajo de la ciudad, no de su propio cerebro. La ciudad calcula qué hace falta, abre puestos de trabajo (constructores, granjeros, mineros...) y los asigna. Un **empleo ciudadano (Citizen Job)** es uno de esos puestos, y la unidad contratada ejecuta el `ActorJob` con el mismo ID. El mismo id en ambos lados: ese es todo el truco.

```csharp Mods/HelloBox/Code/HelloCityJobs.cs
using ai.behaviours;   // CityBehCheckCitizenTasks
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCityJobs
    {
        public const string KEEPER = "hello_ember_keeper";

        public static void Initialize()
        {
            if (AssetManager.citizen_job_library.has(KEEPER)) return;

            // What the citizen does once hired: an actor job with the same id
            ActorJob work = new ActorJob { id = KEEPER };
            work.addTask(HelloAI.TASK);
            work.addTask("end_job");
            AssetManager.job_actor.add(work);

            CitizenJobAsset keeper = new CitizenJobAsset
            {
                id = KEEPER,
                path_icon = "ui/Icons/iconHelloDrive"
            };
            AssetManager.citizen_job_library.add(keeper);

            // post_init() and linkAssets() did these two at startup
            keeper.unit_job_default = KEEPER;
            AssetManager.citizen_job_library.list_priority_normal.Add(keeper);
        }

        // A city hands out job slots in one behaviour, from a fixed list of vanilla jobs.
        // Nothing ever opens a slot for yours unless you add it after that list.
        [HarmonyPatch(typeof(CityBehCheckCitizenTasks), nameof(CityBehCheckCitizenTasks.execute))]
        public static class Patch_CitizenTasks
        {
            public static void Postfix(City pCity)
            {
                if (pCity == null || pCity.status.population_adults < 10) return;

                CitizenJobAsset keeper = AssetManager.citizen_job_library.get(KEEPER);
                if (keeper == null) return;

                // one keeper per city, recomputed every time the city recounts its jobs
                if (pCity.jobs.countCurrentJobs(keeper) == 0) pCity.jobs.addToJob(keeper, 1);
            }
        }
    }
}
```

Tres elementos clave que solucionan omisiones del inicio del juego:

1. **`unit_job_default`** es el `ActorJob` que ejecuta el ciudadano contratado. `post_init()` copia el ID en él.
2. **`list_priority_normal`** es la lista que se ofrece a los ciudadanos (generada por `linkAssets()`). Los empleos con `priority` > 0 van a `list_priority_high` y se asignan primero.
3. **Los puestos.** `CityBehCheckCitizenTasks.execute()` abre puestos desde una lista fija vanilla. El postfix de Harmony añade un puesto para el tuyo.

| Campo | Qué hace |
| --- | --- |
| `priority` / `priority_no_food` | Superior a 0: ofrecido antes que los normales, o solo cuando falta comida |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Quién puede ocuparlo |
| `should_be_assigned` | Tu condición de asignación por unidad |
| `common_job` | `false` lo excluye por completo de las listas generales |
| `path_icon` | El icono en la vista de empleos de la ciudad |

## El texto

El nombre de la tarea es lo que la ventana de la unidad muestra como actividad actual, así que el jugador la leerá más que cualquier otra línea que escribas. Una decisión toma el nombre de la tarea que inicia:

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## Reglas para no hundir los fotogramas por segundo

Puede haber miles de unidades en el mapa. Tu comportamiento se ejecuta en cada una de ellas, en cada tick. "¿Rendimiento? Nunca lo había oído, ¿se come?" es un buen chiste hasta que tu mod es el que se lo come. La mayoría de los mods, los míos incluidos, ejecutan bucles enormes en cada tick y se salen con la suya en un PC decente. Un comportamiento no se sale con la suya.

- **Haz los cálculos pesados en tu propio reloj, no en `execute`.** Ejecuta tu lógica costosa en `Update()` con un temporizador, guarda el resultado y haz que `execute` solo lo lea.
- **Distribuye la carga.** Si calculas para 40 criaturas, calcula para 10 de ellas por tanda en cuatro tandas, en lugar de para las 40 al mismo tiempo.
- **Salida temprana.** Las primeras líneas de `execute` deben ser comprobaciones rápidas que te permitan retornar de inmediato.
- **Nunca instancies memoria en el hot path.** Crear nuevas listas y lambdas en cada tick multiplicado por miles de unidades es la receta perfecta para regalarle tus FPS al recolector de basura.

> [!TIP] Rasgo primero, comportamiento después
> Asigna a las criaturas que controlas un rasgo visible (ver **[Rasgos personalizados](#/nml/custom-traits)**), para que el jugador sepa qué unidades son tuyas y para que *tú* puedas verificar de un vistazo si tu código se está ejecutando sobre las correctas :pepeOK:.
