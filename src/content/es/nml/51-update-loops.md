---
title: Cada frame
group: NML Modding
subgroup: Avanzado y publicación
icon: :wbyawn:
order: 43
---

# Cada frame :wbyawn:

Tu clase principal es un componente de Unity. `BasicMod<T>` deriva de `MonoBehaviour`, así que si escribes un método `Update()` en ella, Unity lo llama una vez por frame. Desde el primer segundo tras el lanzamiento hasta que el juego se cierra, sesenta veces por segundo, haya o no un mundo cargado.

Ese es el sitio para cualquier cosa que no sea una reacción a algo: una comprobación cada mes de juego, una cola que viene de un parche de Harmony, una pulsación de tecla. También es la forma más fácil, en el modding, de convertir la partida de alguien en una presentación de diapositivas :wbfacepalm:.

## La guardia

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: ya pasó el arranque. worldLoading: ningún mundo a medio limpiar o a medio construir
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| Comprobación | De qué te libra |
| --- | --- |
| `World.world != null` | Todavía no existe ninguna instancia de mapa |
| `Config.game_loaded` | Los primeros instantes tras el lanzamiento, antes de que el juego haya empezado su primer mundo |
| `Config.worldLoading` | La pantalla de carga. Un mundo se está limpiando, generando o cargando, y las listas de unidades se están vaciando y rellenando bajo tus pies |

`Config.worldLoading` es `SmoothLoader.isLoading()`, la misma comprobación que hace el propio `MapBox.Update()` del juego antes de simular nada. La guardia de **[Logs y depuración](#/nml/logs-and-debugging)** cubre el arranque; añade la comprobación de carga y también te mantienes fuera de cada carga de mundo posterior.

## No cada frame

La mayoría de las cosas no necesitan sesenta comprobaciones por segundo. Elige un reloj y trabaja sobre él.

| Reloj | Qué hace |
| --- | --- |
| `Time.deltaTime` | Segundos reales desde el último frame. Sigue corriendo con el juego en pausa, ignora el ajuste de velocidad. El juego nunca toca `Time.timeScale` |
| `World.world.getCurWorldTime()` | Segundos del mundo, como `double`. Se detiene mientras el juego está en pausa o hay una ventana abierta, corre más rápido a mayor velocidad. 5 es un mes, 60 es un año |

Tiempo del mundo para cualquier cosa que ocurra *dentro* del mundo. Aquí, cada unidad con el rasgo de rencor de **[Recordar cosas](#/nml/saving-data)** olvida un golpe cada mes:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // segundos de mundo: un mes de juego
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // un reloj que retrocede reinicia la base sin disparar un tick
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

Conserva la llamada a `PatchAll` de **[Parches de Harmony](#/nml/harmony-patches)**: `ResetClock` se ejecuta después de cada mundo generado o cargado, incluso uno con una marca de tiempo igual o posterior. El primer tick espera un intervalo completo en ese mundo. Una sola comprobación de reloj hacia atrás no puede detectar todas las cargas.

La pausa, la velocidad y las ventanas abiertas ya están todas cubiertas, porque el reloj del mundo ya las obedece. Tiempo real para cosas que no están en el mundo, como una etiqueta que parpadea:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] Comprobar la pausa por tu cuenta
> `Config.paused` es solo el botón de pausa y nada más. La simulación también se detiene mientras hay una ventana abierta; `World.world.isPaused()` cubre ambos casos, pero es `internal`, así que necesita el ensamblado publicitado contra el que NML ya compila tu mod. Usar el tiempo del mundo te ahorra la pregunta.

## Corrutinas

Una corrutina es un método que puede esperar a mitad de camino. Tu clase principal es un `MonoBehaviour`, así que puede iniciar una:

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // se comprueba después de cada espera: la unidad tuvo un segundo entero para morir
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds` espera en segundos reales, y como el juego nunca cambia `Time.timeScale`, no se detiene con la pausa y no le importa la velocidad del juego. La corrutina también sigue corriendo si el jugador carga otro mundo a mitad de camino. De ahí la comprobación después de cada `yield`, no solo antes del primero :PES2_F:.

## Teclas

`Input.GetKeyDown(KeyCode.F7)` en `Update()` funciona. También se dispara mientras el jugador está escribiendo el nombre de una unidad en un campo de texto, y el jugador no puede cambiar la tecla. Las propias teclas rápidas del juego se saltan las pulsaciones mientras un campo de texto tiene el foco, así que un `HotkeyAsset` obtiene eso gratis. Consulta **[Ventanas personalizadas](#/nml/custom-windows)** para registrar una. Reserva `GetKeyDown` para una tecla de depuración que solo tú vayas a pulsar.

## Trabajo pesado

- **Recorre las unidades con un temporizador, nunca en cada frame.** Diez mil unidades por sesenta frames son seiscientas mil comprobaciones por segundo, para un rasgo que quizá tengan tres unidades.
- **La comprobación barata primero.** La misma regla que un parche de Harmony: la primera línea es la que te deja hacer `return`.
- **Colas en paralelo, `Update()` las vacía.** Un Postfix en un método paralelo como `Actor.updateStats` no debe tocar Unity ni el estado compartido, consulta **[Parches de Harmony](#/nml/harmony-patches)**. Pone la unidad en cola, y el hilo principal la recoge aquí:

```csharp
// pending es la ConcurrentQueue que llena tu parche
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // ahora es seguro tocar Unity, Randy y tus propias listas
}
```

Lo que haces una vez dentro del bucle es **[El mundo en tiempo de ejecución](#/nml/world-at-runtime)**. Lo que quieres que siga ahí tras guardar y cargar es **[Recordar cosas](#/nml/saving-data)** :PES_OkHand:.
