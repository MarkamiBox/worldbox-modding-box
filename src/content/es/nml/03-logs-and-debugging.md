---
title: Logs y depuración
group: NML Modding
subgroup: Flujo de trabajo básico
icon: :wbdebugburger:
order: 24
---

# Logs y depuración :wbdebugburger:

El log es lo único en el mundo del modding que siempre te dice la verdad. Responde a la pregunta que te harás mil veces: **¿mi código realmente se ejecutó?**

## Imprimir una línea

Hay dos formas, y ambas terminan en el mismo archivo.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML: antepone el nombre de tu mod automáticamente
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity: debes añadir tú mismo el prefijo
        }
    }
}
```

¿No usas `BasicMod`? `NeoModLoader.services.LogService` incluye los mismos métodos `LogInfo`, `LogWarning`, `LogError`, además de `LogStackTraceAsError` para la traza completa.

## Qué aspecto tiene un log sano

Arranca el juego con el mod anterior y busca `HelloBox` en `Player.log`. Deberías ver algo como esto:

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

Línea por línea: NML compiló los archivos en `Code/`, cargó tus recursos (resource) y llamó a `OnModLoad`, que imprimió tu mensaje. Las líneas numeradas indican el tiempo de NML para cada fase: el número tras el `=` son segundos, y algunos salen en rojo en el log. **El rojo aquí no indica error**, solo significa que ese paso fue el más lento :hmm:.

La línea que importa es la tuya. Si `[HelloBox]: HelloBox is alive!` no aparece, sigue leyendo.

## Cuando tu código no compila

Antes de que tu mod pueda si quiera ejecutarse, NML tiene que compilarlo. Una errata lo detiene en seco y te indica exactamente dónde ocurrió:

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

Léelo de derecha a izquierda: **`; expected`** es el problema, **`(9,42)`** indica línea 9, carácter 42, y **`Code\Main.cs`** es el archivo. Abre ese archivo, ve a esa línea y pon el punto y coma.

La línea útil es la **primera**. `Failed to compile mod HelloBox` debajo es solo el resumen. La gente lee esa última, entra en pánico y pasa por alto la respuesta que estaba justo arriba :PES4_1IQ:.

## Qué aspecto tiene un log roto

Una vez compila, este es el otro error con el que te toparás frecuentemente :PES2_F::

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

Parece aterrador, pero en realidad es una frase clara:

- **`NullReferenceException`**: intentaste usar algo que estaba vacío (`null`). Es el 95% de los errores que verás en tu vida.
- **`at HelloBox.HelloTraits.Initialize ()`**: el método exacto en el que ocurrió.
- **`in HelloTraits.cs:24`**: **línea 24 de tu propio archivo**. Lee esa línea: algo en ella vale `null`.
- Las líneas inferiores indican la cadena de llamadas, de más reciente a más antigua. Los nombres de tus propios archivos son los únicos que importan revisar.

La causa clásica de este fallo: tocar `base_stats` en un asset antes de añadirlo a su librería. Detalles en la página **[Rasgos personalizados](#/nml/custom-traits)**.

## Dónde viven los logs

| Archivo | Dónde | Qué es |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | La partida actual |
| `Player-prev.log` | misma carpeta | La partida **anterior**, la que acaba de cerrarse con error :aPES_Flatline: |
| `logs/error_*.log` | misma carpeta, dentro de `logs/` | Un archivo por cada error capturado por el juego |
| `mods_config/<GUID>.config` | misma carpeta | Los ajustes guardados del usuario para tu mod |

Pega `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` en la barra de direcciones del Explorador de Windows para llegar al instante.

## Una consola en vivo en vez de un archivo

Leer un archivo después de que el juego falle es lento. Con **BepInEx** consigues una ventana negra de consola que imprime registros mientras juegas, viendo aparecer tu mensaje en el mismo milisegundo en que pulsas un botón. Se configura en dos minutos: **[Consola BepInEx](#/toolbox/bepinex-console)**.

¿Quieres hacer clic en las ventanas del juego e inspeccionar sus valores en vivo? Para eso está **[UnityExplorer](#/toolbox/unity-explorer)**.

## No permitas que un fallo rompa todo el mod

`OnModLoad` se ejecuta de arriba a abajo. Si la línea 3 lanza una excepción, las líneas 4 a 20 nunca se ejecutan y la mitad de tu mod deja de existir en silencio. Dale a cada parte su propia red de seguridad:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// Ejecuta una fase y, si explota, anota cuál fue y continúa con la siguiente.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

Ahora un rasgo (trait) roto solo te costará ese rasgo, no todo el mod, y el registro señalará exactamente el paso culpable:

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## No toques el mundo antes de que exista

`OnModLoad` se ejecuta **antes** de que haya un mundo cargado. No hay mapa, ni unidades, ni nada. Tócalos ahí y el juego se colgará antes del menú principal :surprised_pikachu:. Todo lo que corra en cada frame necesita una comprobación de seguridad:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // todavía en el menú
    if (World.world == null || World.world.units == null) return;  // aún no hay mundo
    if (MapBox.instance == null) return;

    // a partir de aquí es seguro interactuar con el mundo
}
```

## Recargar código sin reiniciar

Reiniciar WorldBox para probar una sola línea modificada es el mayor coste de tiempo al crear mods. Pregúntale a cualquiera que lo haya hecho cuarenta veces en una tarde. NML puede recompilar tu mod mientras el juego se ejecuta y sustituir los métodos que hayas marcado.

1. Tu clase principal implementa `IReloadable`, que consiste en un único método: `Reload()`. La de HelloBox lo hace en **[El mod completo](#/nml/all-together)**.
2. En el menú de mods activo de NML, el botón de recarga aparece automáticamente para cualquier mod que implemente `IReloadable`. (La antigua lista de mods pedía `Config.isEditor = true` para mostrar su botón, pero el menú principal no te obliga a pasar por ese aro.)
3. Marca los métodos que quieras sustituir con `[Hotfixable]`, de `NeoModLoader.api.attributes`:

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // edita esto con el juego abierto, pulsa recargar y observa a la siguiente criatura usarlo
}
```

Luego modifica el método, guarda y pulsa el botón de recarga de tu mod en la lista de mods de NML. NML recompila, parchea los métodos marcados y llama a `Reload()`. Todo lo que no esté marcado seguirá ejecutando el código anterior.

> [!NOTE] Si alguna vez activas `Config.isEditor`
> `Config.isEditor` es el interruptor interno de Unity del juego. Si lo activas a mano, WorldBox cree que está dentro del editor de Unity y parte de la interfaz pasa a su diseño móvil. Con `IReloadable` en el NML moderno no lo necesitas, así que déjalo en paz.

Lo que no puede hacer: callbacks de Unity como `Awake` y `Update`, constructores y cualquier cosa que el juego ya haya instanciado con el código anterior. Un asset registrado al inicio conserva los delegates asignados entonces, por lo que `Reload()` es el lugar donde reasignarlos tú mismo.

## Los errores que comete todo el mundo

| Lo que ves | Lo que significa |
| --- | --- |
| El mod no aparece en la lista | Falta `mod.json`, o contiene JSON inválido (una coma de más :pepeclown:) |
| El mod aparece, pero no hace nada | `OnModLoad` falló. Busca en el log tu prefijo y la palabra `Exception` |
| `Failed to compile mod ...` | Una errata en tu C#. El error auténtico está en la línea **superior** |
| `NullReferenceException` en un nuevo asset | Tocaste `base_stats` antes de `add()`: la librería es quien lo crea |
| El texto sale como `trait_whatever` | Falta la traducción, consulta **[Localización](#/nml/localization)** |
| Tu botón es un hueco invisible | La ruta del sprite está mal y el icono devolvió `null` |
| Funciona en tu PC pero en el de nadie más | Dejaste una ruta absoluta fija con tu nombre de usuario de Windows :homerhide: |
