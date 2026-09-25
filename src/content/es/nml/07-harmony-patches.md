---
title: Parches de Harmony
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbhammer:
order: 42
---

# Parches de Harmony :wbhammer:

Todo lo visto en las otras páginas **agrega** cosas a WorldBox: un rasgo (trait), un arma, un edificio (building). Harmony se encarga de la otra mitad del modding: **cambiar lo que el juego ya hace**.

No puedes editar el código del juego directamente. Está compilado, se distribuye como `Assembly-CSharp.dll` y cualquier actualización sobreescribiría tus cambios. Harmony es la biblioteca que te permite enganchar tu propio código a un método existente mientras el juego se está ejecutando.

> [!NOTE] ¿Nunca has escrito código antes?
> Lee "Qué es un método" y "La nota adhesiva", luego ve a crear algo de las páginas de **Contenido del juego** y vuelve después. Harmony no es difícil, pero es lo primero con lo que puedes romper los mods de *otras personas*, y escribirás mejores parches una vez que hayas visto cómo están construidos los propios assets del juego :PES_Wise:.

## Qué es un método

Un **método** es una acción con nombre dentro del código del juego. Algunos ejemplos reales:

| Método | Cuándo lo ejecuta el juego |
| --- | --- |
| `Actor.updateStats()` | Cada vez que es necesario recalcular las estadísticas (stats) de una unidad |
| `Actor.getHit(...)` | Cada vez que una unidad recibe daño |
| `City.makeWarrior(...)` | Cada vez que una ciudad convierte a un ciudadano en soldado |

El juego llama a miles de estos métodos por segundo. Cada uno de ellos es un lugar donde puedes engancharte.

## El post-it

Imagina un método como una página en el recetario del juego. Harmony no reescribe la página; le pega dos notas adhesivas:

```text
┌─────────────────────────────┐
│  TU PREFIX                  │  <- se ejecuta ANTES del código del juego
├─────────────────────────────┤
│  código original del juego  │  <- intacto
├─────────────────────────────┤
│  TU POSTFIX                 │  <- se ejecuta DESPUÉS del código del juego
└─────────────────────────────┘
```

- Un **Prefix** ve los parámetros de entrada antes que el juego. Puede modificarlos y puede cancelar la llamada completa.
- Un **Postfix** ve el resultado después de que el juego termina. Puede alterar ese resultado o simplemente reaccionar a él.

Eso es el 95 % de Harmony. El resto de esta página son detalles prácticos.

## Activar Harmony

Una sola línea, una sola vez en `OnModLoad`. Escanea tu propio mod en busca de parches y aplica todos los que encuentre:

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox" es tu GUID. Harmony etiqueta tus parches con él,
            // así cuando haya un conflicto el log dirá claramente de quién es la culpa.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()` significa "solo mis propios archivos". No es decorativo: sin él, `PatchAll()` escanea el ensamblado que lo llamó, y en un mal día ese ensamblado será el mod de otra persona :PESgn_Yikes:.

## Tu primer parche, línea por línea

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Pasan seis cosas:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: la dirección. "El método llamado `updateStats`, en la clase llamada `Actor`." Una línea entre corchetes es un *atributo*: una etiqueta que lee el ordenador, no código que se ejecuta.
- **`public static class Patch_Actor_UpdateStats`**: un contenedor. El nombre es tuyo y no cambia nada, pero tu yo del futuro te agradecerá `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: este nombre **no** es tuyo, a menos que lo etiquetes. Sin una etiqueta, Harmony busca un método llamado exactamente `Prefix`, `Postfix` o `Finalizer`. Escribe `postfix` y no pasa nada, sin ningún error :PESgn_ButWhy:. La solución es la etiqueta, en "Nombrar los métodos de parche tú mismo" más abajo.
- **`Actor __instance`**: **dos** guiones bajos. Es la unidad concreta con la que el juego está trabajando ahora mismo. Sin esto sabes *que* se recalcularon las estadísticas de una unidad, pero no *de cuál*.
- **`if (!__instance.hasTrait(...)) return;`**: sal pronto. Tu parche se ejecuta para cada unidad del mundo, para siempre. Haz que el caso común sea una comprobación y un `return`.
- **`stats["speed"] += 20f;`**: el cambio real. `updateStats` vacía y reconstruye el bloque de estadísticas al principio, así que sumar en un Postfix cae sobre una hoja limpia en vez de acumularse cada tick.

> [!DANGER] `updateStats` no se ejecuta en el hilo principal
> El juego lo registra como un trabajo **paralelo** (`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, y `Config.parallel_jobs_updater` es `true` por defecto), así que tu Postfix se ejecuta en un hilo de trabajo, sobre muchas unidades a la vez. Dentro, toca **solo los números de esa unidad**. Llamar a Unity (`Time.time`, `transform`, `Destroy`, `Resources.Load`), al ayudante aleatorio del juego `Randy`, o escribir en una lista compartida tuya es un crash que solo aparece en el ordenador de otra persona.
>
> Si necesitas algo de eso, pon la unidad en una cola y haz el trabajo en tu propio `Update()`:
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## Los nombres mágicos de parámetros

Harmony enlaza tus parámetros **por nombre**. Estos son los que importan, y los guiones bajos son parte del identificador:

| Nombre | Lo que obtienes |
| --- | --- |
| `__instance` | El objeto sobre el que se llamó el método. Omítelo para métodos `static` |
| `__result` | El valor de retorno del método. Decláralo como `ref` para cambiarlo. Solo en Postfix |
| `___someField` | **Tres** guiones bajos: un campo privado del objeto, escrito exactamente igual que en el juego |
| `__state` | Un valor que tu Prefix pasa a tu propio Postfix |
| cualquier parámetro real | El argumento que pasó el llamador, escrito **exactamente** igual que en el juego |

Esa última fila es donde casi todos tropiezan, una y otra vez. Si el juego declara `getHit(float pDamage, ...)`, tu parámetro debe llamarse `pDamage`. Ni `damage` ni `pDmg`. Puedes omitir los parámetros que no te interesen, pero los que declares deben coincidir, y en este juego casi todos empiezan por `p`.

## Modificar un resultado

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref significa "puedes escribir en esto", y lo que escribas es lo que recibirá quien llamó al método.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

Ajusta, no asignes a ciegas. `__result *= 1.5f` funciona bien si otro mod parcheó el mismo método. `__result = 12f` destruye su trabajo y abre un debate hostil en tu sección de comentarios.


## Modificar un número hardcodeado en el juego

La mitad de las peticiones tipo "¿alguien puede hacer un mod que...?" son solo un número. Nada es imposible, simplemente nadie lo ha hecho todavía :wbbru:. "Las ciudades crecen demasiado" es esto, sacado directamente de la clase `City` del juego:

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

Un método que devuelve una constante es lo más fácil de modificar en el juego. No tocas la constante, ajustas lo que devuelve:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // ciudades a mitad de tamaño

        public static void Postfix(ref int __result)
        {
            // 999 es la opción de depuración "unlimited zone range". No toques el truco del jugador
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

Coloca `SCALE` detrás de un control deslizante de **[Configuración del mod](#/nml/mod-config)** y los jugadores lo ajustarán ellos mismos.

Encontrar el método es el verdadero trabajo. Busca en **dnSpy** el número que ves en el juego (13 zonas, 2 armas, 5 años) o el sustantivo de la regla ("zone", "limit", "max"). Una constante dentro de un método pequeño es un Postfix. Una constante oculta en medio de uno largo requiere un transpiler, ed ahí es donde se detiene esta página :PES2_Shrug:.

## Cancelar el método original

Un Prefix que devuelve `bool` decide si el código original del juego se ejecuta o no:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = saltarse el getHit original por completo. La unidad no recibe daño.
        return false;
    }
}
```

Observa la estructura: el caso particular devuelve `false`, y **cualquier otro caso devuelve `true`**. Si olvidas ese `return true`, habrás desactivado el daño en todo el mundo.

> [!WARNING] `return false` es la opción nuclear
> No se salta solo *tu* versión del método. Se salta el código del juego **para todos**. El Postfix de cualquier otro mod en ese método sigue ejecutándose, reaccionando a una llamada que nunca ocurrió. Un método vanilla suele hacer cinco cosas que no leíste, y cancelarlo silenciará las cinco.
>
> Antes de escribir `return false`, revisa si un Postfix bastaría. "Curar el daño después" rompe muchísimo menos que "el daño nunca existió" :PES3_Balance:.

## Dos formas de escribir el nombre del método

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // método público
[HarmonyPatch(typeof(Actor), "updateStats")]             // cualquier otro caso
```

`nameof` es preferible porque un error tipográfico se convierte en un error de compilación en lugar de un parche que silenciosamente nunca se aplica. Pero `nameof` solo funciona en miembros visibles para tu código, y gran parte de WorldBox es `internal` o `private`. Para esos la cadena de texto es la única opción, así que verifica el nombre en el código real con **[Leyendo el código del juego](#/toolbox/reading-the-game-code)**.

## Nombrar los métodos de parche tú mismo

Los nombres mágicos `Prefix` y `Postfix` son una convención, no un requisito. Pon una etiqueta en el método y llámalo como quieras:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_UpdateStats
{
    [HarmonyPostfix]
    public static void AddSwiftSpeed(Actor __instance)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return;
        __instance.stats["speed"] += 20f;
    }
}
```

`[HarmonyPrefix]`, `[HarmonyPostfix]` y `[HarmonyFinalizer]` existen los tres. Con la etiqueta, el nombre del método es solo para ti, y el problema de "`Postfix` mal escrito, no pasa nada" desaparece. También te permite mantener un Prefix y un Postfix para objetivos distintos en una misma clase sin que los nombres choquen. Cerca de la mitad de los mods que hay ahí fuera lo hacen así, y son la mitad que nunca pierde una tarde por una `p` en minúscula.

## Cuando dos métodos comparten el mismo nombre

Entonces clase + nombre resulta ambiguo. Harmony no intentará adivinar y tu mod muere al arrancar con una `AmbiguousMatchException`. `Actor` tiene dos métodos `addTrait`:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool addTrait(ActorTrait pTrait, bool pRemoveOpposites = false)
```

Especifica los tipos de parámetros del que quieres decir, **todos**, incluidos los que tienen un valor por defecto:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.addTrait), new System.Type[] { typeof(string), typeof(bool) })]
```

Otras sobrecargas reales que sorprenden a la gente: `TileZone.isGoodForNewCity()` e `isGoodForNewCity(Actor pActor)`, y `SaveManager.loadWorld()` y `loadWorld(string pPath, bool pLoadWorkshop = false)` (ambas `internal`, así que solo con nombres en texto). En caso de duda, busca el nombre del método en la clase antes de escribir el atributo.

## Parches que necesitan un antes y un después

`__state` es un valor que tu Prefix entrega a tu Postfix para esa misma llamada. Úsalo para recordar cómo era un valor antes de que el juego lo modificara:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* algo redujo la vida */ }
    }
}
```

## Propiedades y constructores

No todo es un método normal. `Actor.is_moving` es una propiedad: parece un campo, pero un bloque `get` se ejecuta cada vez que alguien lo lee. Dile a Harmony cuál de las dos mitades quieres:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.is_moving), MethodType.Getter)]
```

Después de eso es un parche normal, y `ref bool __result` es lo que recibe quien lee la propiedad. `MethodType.Setter` es la otra mitad. `MethodType.Constructor` parchea el constructor de una clase, donde `__instance` es el objeto que se está construyendo; si la clase tiene varios constructores, añade el `Type[]` después, igual que con una sobrecarga.

## Campos y métodos privados

Tu parche puede ver un campo privado de `__instance` pidiéndolo como parámetro: **tres** guiones bajos, luego el nombre del campo escrito exactamente como lo escribe el juego. El juego empieza la mayoría de sus campos privados con su propio `_`, así que el `_hover_timer` privado de la unidad se convierte en **cuatro**:

```csharp
public static void Postfix(Actor __instance, ref float ____hover_timer)
```

`ref` si quieres escribir en él. Es incómodo de leer y perfectamente correcto.

Fuera de un parche, `AccessTools` y `Traverse` (ambos en `HarmonyLib`) llegan a lo mismo:

```csharp
// de vez en cuando: Traverse es corto y lento
float timer = Traverse.Create(pActor).Field("_hover_timer").GetValue<float>();

// cada frame: construye el accesor una vez, y luego es casi tan rápido como un campo normal
static readonly AccessTools.FieldRef<Actor, float> hover_timer = AccessTools.FieldRefAccess<Actor, float>("_hover_timer");
hover_timer(pActor) = 0f;   // es un ref, así que esto escribe

// un método privado: la reflexión pide todos los argumentos, valores por defecto incluidos
AccessTools.Method(typeof(Actor), "die").Invoke(pActor, new object[] { false, AttackType.Other, true, true });
```

Una cadena de texto nombra algo que el compilador no puede comprobar. Si una actualización renombra `_hover_timer`, te enteras en tiempo de ejecución. La alternativa es un `Assembly-CSharp.dll` **publicitado**, donde `internal` y `private` se vuelven visibles y un renombrado vuelve a ser un error de compilación.

## Parchear a mano

`[HarmonyPatch]` más `PatchAll` es el camino fácil. El otro camino es encontrar el método tú mismo y llamar a `Patch`:

```csharp Mods/HelloBox/Code/HelloManualPatches.cs
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloManualPatches
    {
        private static readonly Harmony harmony = new Harmony("com.yourname.hellobox");

        public static void Initialize()
        {
            // existen dos sobrecargas de addTrait, así que los tipos no son opcionales
            MethodInfo original = AccessTools.Method(typeof(Actor), nameof(Actor.addTrait), new[] { typeof(string), typeof(bool) });

            // null significa que una actualización lo renombró: pierdes una función, no todo el mod
            if (original == null)
            {
                Main.LogWarning("Actor.addTrait(string, bool) not found, skipping that patch");
                return;
            }

            harmony.Patch(original, postfix: new HarmonyMethod(typeof(HelloManualPatches), nameof(AddTraitPostfix)));
        }

        public static void AddTraitPostfix(Actor __instance, string pTraitID, bool __result)
        {
            // __result es false cuando la unidad ya lo tenía o un opuesto lo bloqueó
            if (!__result || pTraitID != HelloTraits.SWIFT) return;

            Main.LogInfo("Another unit got swift");
        }
    }
}
```

Mismo id de Harmony que tu `PatchAll`, mismas reglas para los nombres de parámetros. Lo que ganas es el `if` en medio. Recurre a esto cuando:

- **El objetivo podría no existir.** Un método que sospechas que la próxima actualización moverá, o uno que vive en *otro mod*. `AccessTools.TypeByName("TheirNamespace.TheirClass")` devuelve `null` cuando ese mod no está instalado, y simplemente te saltas el parche. Consulta **[Otros mods](#/nml/other-mods)**.
- **El parche depende de un ajuste.** Solo parchea si el jugador activó la función en **[Ajustes del mod](#/nml/mod-config)**.
- **Quieres saber si funcionó.** Un objetivo de `PatchAll` que falta lanza una excepción, y los parches a los que aún no había llegado nunca se aplican. Aquí, un método que falta es una línea de log.

## Cuando varios mods parchean el mismo método

Dentro de cada tipo de parche, Harmony ordena los parches por prioridad, **la más alta primero**, con `Normal` como valor por defecto. Las dependencias explícitas `[HarmonyBefore]` y `[HarmonyAfter]` pueden cambiar ese orden:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
public static class Patch_City_ZoneRange
{
    [HarmonyPostfix]
    [HarmonyPriority(Priority.Last)]
    public static void HalveZones(ref int __result) { /* ... */ }
}
```

Las prioridades habituales son `First`, `High`, `Normal`, `Low`, `Last`. Importa cuando el orden cambia el resultado:

- Un Postfix que **limita** un resultado (`Mathf.Min(__result, 20)`) quiere `Priority.Last`, para normalmente limitarlo después de los Postfix de mayor prioridad. No puede garantizar ser el último frente a otro parche `Last` o dependencias explícitas de orden.
- Un Prefix que **comprueba** algo y puede devolver `false` quiere `Priority.First` o `High`, para decidir pronto. No lo uses como garantía de que otros Prefix se saltarán: NML distribuye HarmonyX, que [ejecuta todos los Prefix](https://github.com/BepInEx/HarmonyX/wiki/Prefix-changes) incluso cuando uno devuelve `false`.

Fíjala solo cuando tengas un motivo. Si todos los mods piden `First`, vuelves a estar donde nadie es el primero :PES3_Balance:.

## Finalizers: capturar lo que el juego lanza

Un Finalizer se ejecuta después de todo lo demás, **incluso si el método lanzó una excepción**. Recibe la excepción, y lo que devuelva es lo que se lanza:

```csharp
[HarmonyPatch(typeof(Actor), nameof(Actor.setAttackTarget))]
public static class Patch_Actor_SetAttackTarget_Log
{
    public static System.Exception Finalizer(System.Exception __exception)
    {
        if (__exception != null) Main.LogError("setAttackTarget threw: " + __exception);

        // conserva el fallo después de registrarlo
        return __exception;
    }
}
```

Esto registra el fallo sin ocultarlo. Devolver `null` suprimiría la excepción, incluidos los fallos de otros parches. Haz eso solo para un fallo concreto del que realmente puedas recuperarte. Un método que falló a mitad de camino ya ha hecho la mitad de su trabajo, y tragarse la excepción deja al mundo en ese estado :PESgn_Yikes:.

## Los métodos que más parchean los mods

Repasando los mods que he visto, estos aparecen una y otra vez. Las firmas vienen directamente del código del juego.

| Objetivo | Qué hay que saber |
| --- | --- |
| `City.update(float pElapsed)` | Público. Se ejecuta cada frame para cada ciudad. Comprobación barata primero |
| `MapBox.Update()` | **Privado**, así que `"Update"` como cadena de texto. Se ejecuta cada frame, una vez. Consulta **[Cada frame](#/nml/update-loops)** antes de parchearlo |
| `Actor.updateStats()` | **Internal**. Se ejecuta en un trabajo paralelo, ver el aviso de arriba |
| `Actor.getHit(float pDamage, bool pFlash, AttackType pAttackType, BaseSimObject pAttacker = null, ...)` | **Internal**. Cada golpe en cada unidad |
| `Actor.die(bool pDestroy = false, AttackType pType = AttackType.Other, bool pCountDeath = true, bool pLogFavorite = true)` | **Privado**, `"die"` como cadena de texto |
| `Actor.setAttackTarget(BaseSimObject pAttackTarget)` | Público |
| `ItemCrafting.tryToCraftRandomWeapon(Actor pActor, City pCity)` | Público static, devuelve `bool`. Sin `__instance` |
| `DiplomacyManager.startWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pAsset, bool pLog = true)` | **Internal**, devuelve el `War` |
| `WarManager.newWar(Kingdom pAttacker, Kingdom pDefender, WarTypeAsset pType)` | Público, devuelve el `War` |
| `Kingdom.setKing(Actor pActor, bool pFromLoad = false)` | Público. También se ejecuta mientras se carga una partida, comprueba `pFromLoad` |
| `City.setLeader(Actor pActor, bool pNew)` | Público |
| `BabyMaker.makeBaby(Actor pParent1, Actor pParent2, ...)` | Público static, devuelve el bebé |
| `ActorManager.createNewUnit(string pStatsID, WorldTile pTile, ...)` | Público, devuelve el nuevo `Actor`. Cada aparición pasa por aquí |

Los objetivos `private` e `internal` se parchean bien con un nombre en texto, y tus parámetros siguen enlazando por nombre. Lo que no puedes hacer sin un ensamblado publicitado es escribir `nameof(...)` para ellos, o tocar sus miembros `internal` dentro del cuerpo de tu parche.

> [!NOTE] `World` es el contenedor, `MapBox` es el objetivo
> `typeof(World)` es C# válido, aunque `World` sea estático. Es el objetivo de Harmony equivocado para `Update` o `finishMakingWorld`: esos métodos pertenecen a `MapBox`, el tipo que devuelve `World.world`. Un objetivo equivocado falla cuando Harmony aplica el parche, no cuando C# compila `typeof`.

## Cuando no funciona

Antes de culpar a Harmony, lee el log. Casi nunca es Harmony :PES5_Noted:.

| Lo que ves | Lo que suele ser |
| --- | --- |
| No pasa nada, nada en el log | `Postfix` mal escrito sin etiqueta `[HarmonyPostfix]`, o nunca llamaste a `PatchAll` |
| `HarmonyException` / `MissingMethodException` al iniciar | Esa clase o método no existe. Revísalo en dnSpy |
| `AmbiguousMatchException` / `Ambiguous match found` | Varias sobrecargas. Agrega el argumento `Type[]` mostrado arriba |
| Crash que solo pasa en el ordenador de otras personas | Un Postfix en `Actor.updateStats` tocando Unity, `Randy` o una lista compartida desde un hilo de trabajo |
| `NullReferenceException` dentro de tu parche | `__instance` o uno de sus campos es null. Los parches corren en estados invisibles en juego normal: durante la carga, al morir, en objetos destruidos |
| El juego corre a 3 FPS | Parcheaste algo que se ejecuta miles de veces por segundo y pusiste cálculos pesados dentro |
| Funciona solo, falla con otro mod | Uno devuelve `false`, o ambos asignan `__result` directamente en vez de ajustarlo |

## Reglas para no romper el juego ajeno

- **Postfix por defecto.** Recurre a un Prefix solo cuando necesites cambiar un argumento o detener el método.
- **Ajusta, nunca asignes.** `+=`, `*=`, `Math.Min(...)`. Alguien más también parcheó esto.
- **Comprueba null, siempre.** Tu parche se ejecutará durante la carga del mundo y durante la muerte de una unidad.
- **La comprobación barata primero.** La primera línea de un parche caliente debe ser la prueba que te deja hacer `return`. `City.update` y `MapBox.Update` son los dos métodos que más parchean los mods, y ambos se ejecutan cada frame. Una búsqueda en un diccionario ahí está bien. Un bucle sobre cada unidad no.
- **Parchea el método más estrecho que haga el trabajo.** Parchear `Actor.updateStats` para la velocidad de un rasgo está bien. Parchear la actualización del mundo para lo mismo es como un mod acaba desinstalado.
- **Mantén tus parches en un solo archivo.** Cuando alguien reporte un conflicto, querrás leer un archivo, no doce. Sé amable con tu yo del futuro. Haz lo que digo, no lo que hacen mis viejos mods :trollface:.

> [!NOTE] Parchear `has`, `get`, `add`, `clone` o `post_init` de una biblioteca no sirve de nada
> Solo afecta a las llamadas hechas después de que se cargue tu mod, nunca al registro vanilla que ya ocurrió para entonces. Mira **[Bibliotecas de assets](#/nml/asset-libraries)**.

## Transpilers: cambiar las instrucciones

Un transpiler reescribe el IL, las instrucciones compiladas dentro de un método. Úsalo cuando el cambio pertenece a la mitad y ni un Prefix ni un Postfix pueden expresarlo. Se ejecuta cuando Harmony construye el método de reemplazo, no en cada tick del juego, y puede volver a ejecutarse cuando se añade otro transpiler.

Esta es la firma, dentro de tu clase de parche. Deliberadamente deja pasar todo:

```csharp
public static System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> Transpiler(
    System.Collections.Generic.IEnumerable<HarmonyLib.CodeInstruction> instructions)
{
    return instructions;
}
```

Para una reescritura real:

1. Inspecciona el IL del objetivo en dnSpy. Haz coincidir una secuencia de opcodes y el campo o método concreto del operando, no "la instrucción 42" ni cada aparición de un número.
2. Recolecta las coincidencias **antes** de editar. Comprueba explícitamente el número esperado. Si esperas una y encuentras cero o dos, registra la discrepancia y devuelve la entrada sin tocar. Nunca emitas media reescritura.
3. Conserva las etiquetas de salto, los bloques de excepción y los tipos y el equilibrio de la pila de evaluación. Un reemplazo que se ve bien en C# puede seguir siendo IL inválido.
4. Prueba tanto el camino de coincidencia como el de no coincidencia, y luego prueba con otros parches en el mismo método.

La [documentación de transpilers de Harmony](https://harmony.pardeike.net/articles/patching-transpiler.html) cubre la API de instrucciones. Una actualización del juego es motivo para revisar el patrón de nuevo, no para mover el índice mágico tres posiciones :PES5_BigBrain:.

NML distribuye **HarmonyX**, un fork de Harmony. La API de parches principal es la misma, pero el comportamiento puede diferir, incluido el salto de Prefix. Próxima parada, si más de un mod va a tocar lo mismo: **[Otros mods](#/nml/other-mods)**.
