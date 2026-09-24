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
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

Pasan seis cosas:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: la dirección. "El método llamado `updateStats`, en la clase llamada `Actor`." Una línea entre corchetes es un *atributo*: una etiqueta que lee el ordenador, no código que se ejecuta.
- **`public static class Patch_Actor_UpdateStats`**: un contenedor. El nombre es tuyo y no cambia nada, pero tu yo del futuro te agradecerá `Patch_<Class>_<Method>`.
- **`public static void Postfix(...)`**: este nombre **no** es tuyo. Harmony busca un método llamado exactamente `Prefix`, `Postfix` o `Finalizer`. Escribe `postfix` y no pasa nada, sin ningún error :PESgn_ButWhy:.
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
> No se salta solo *tu* versión del método. Se salta la de **todos**: el código del juego y el Prefix y Postfix de cualquier otro mod en ese método. Un método vanilla suele hacer cinco cosas que no leíste, y cancelarlo silenciará las cinco.
>
> Antes de escribir `return false`, revisa si un Postfix bastaría. "Curar el daño después" rompe muchísimo menos que "el daño nunca existió" :PES3_Balance:.

## Dos formas de escribir el nombre del método

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // método público
[HarmonyPatch(typeof(Actor), "updateStats")]             // cualquier otro caso
```

`nameof` es preferible porque un error tipográfico se convierte en un error de compilación en lugar de un parche que silenciosamente nunca se aplica. Pero `nameof` solo funciona en miembros visibles para tu código, y gran parte de WorldBox es `internal` o `private`. Para esos la cadena de texto es la única opción, así que verifica el nombre en el código real con **[Leyendo el código del juego](#/toolbox/reading-the-game-code)**.

## Cuando dos métodos comparten el mismo nombre

Cuando dos métodos comparten nombre, clase + nombre resulta ambiguo y Harmony no intentará adivinar. Especifica los tipos de parámetros:

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

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

## Cuando no funciona

Antes de culpar a Harmony, lee el log. Casi nunca es Harmony :PES5_Noted:.

| Lo que ves | Lo que suele ser |
| --- | --- |
| No pasa nada, nada en el log | `Postfix` mal escrito, o nunca llamaste a `PatchAll` |
| `HarmonyException` / `MissingMethodException` al iniciar | Esa clase o método no existe. Revísalo en dnSpy |
| `Ambiguous match found` | Varias sobrecargas. Agrega el argumento `Type[]` mostrado arriba |
| `NullReferenceException` dentro de tu parche | `__instance` o uno de sus campos es null. Los parches corren en estados invisibles en juego normal: durante la carga, al morir, en objetos destruidos |
| El juego corre a 3 FPS | Parcheaste algo que se ejecuta miles de veces por segundo y pusiste cálculos pesados dentro |
| Funciona solo, falla con otro mod | Uno devuelve `false`, o ambos asignan `__result` directamente en vez de ajustarlo |

## Reglas para no romper el juego ajeno

- **Postfix por defecto.** Recurre a un Prefix solo cuando necesites cambiar un argumento o detener el método.
- **Ajusta, nunca asignes.** `+=`, `*=`, `Math.Min(...)`. Alguien más también parcheó esto.
- **Comprueba null, siempre.** Tu parche se ejecutará durante la carga del mundo y durante la muerte de una unidad.
- **La comprobación barata primero.** La primera línea de un parche caliente debe ser la prueba que te deja hacer `return`.
- **Parchea el método más estrecho que haga el trabajo.** Parchear `Actor.updateStats` para la velocidad de un rasgo está bien. Parchear la actualización del mundo para lo mismo es como un mod acaba desinstalado.
- **Mantén tus parches en un solo archivo.** Cuando alguien reporte un conflicto, querrás leer un archivo, no doce. Sé amable con tu yo del futuro. Haz lo que digo, no lo que hacen mis viejos mods :trollface:.

> [!NOTE] Parchear `has`, `get`, `add`, `clone` o `post_init` de una biblioteca no sirve de nada
> Solo afecta a las llamadas hechas después de que se cargue tu mod, nunca al registro vanilla que ya ocurrió para entonces. Mira **[Bibliotecas de assets](#/nml/asset-libraries)**.

## Lo que no cubriremos aquí

Los **Transpilers** reescriben las instrucciones IL compiladas de un método una por una. Son realmente potentes y la única forma de modificar un número enterrado en mitad de un método cerrado, pero se rompen con casi cualquier actualización del juego. Si algún día llegas al nivel de necesitar uno, no vas a necesitar esta página :PES5_BigBrain:.
