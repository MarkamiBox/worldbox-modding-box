---
title: La consola en vivo (BepInEx)
group: Resumen
subgroup: Herramientas externas y configuración
icon: :wbvideo:
order: 5
---

# La consola en vivo :wbvideo:

Abrir `Player.log` en el Bloc de notas tras cada prueba es un suplicio. (Y lo sigo haciendo a veces, para qué mentir :23062-durrr:). **BepInEx** te regala una ventana de consola negra que muestra los logs en marcha mientras juegas, para que tu línea de texto aparezca en el mismo milisegundo en que tu código la ejecuta.

Es una configuración de diez minutos que haces una única vez y te sirve para el resto de tu vida como modder.

## Qué es BepInEx

Un modloader que se engancha a los juegos de Unity antes de que arranquen. Los modders de WorldBox lo usamos principalmente para dos cosas: la consola en vivo y **UnityExplorer** (que tiene su propia página). NML puede instalártelo solo si un mod lo pide, pero instalarlo tú mismo te da el control total de su configuración.

## Cómo instalarlo

1. En la [página oficial de releases de BepInEx](https://github.com/BepInEx/BepInEx/releases), baja hasta **Assets** y descarga el archivo llamado `BepInEx_win_x64_5.4.x.x.zip`. Justo con esa combinación: **win**, **x64**, **5**. Las versiones para `x86`, `unix`, `macos` y `BepInEx 6 / IL2CPP` parecen tentadoras, pero ninguna de ellas funciona aquí :PES5_Dumb:.
2. Clic derecho en el zip → **Propiedades** → marca la casilla **Desbloquear** si aparece, y descomprímelo **dentro de la carpeta de WorldBox**, donde está `worldbox.exe` (ruta de Steam habitual: `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, o clic derecho en WorldBox en Steam → **Administrar** → **Ver archivos locales**). Te debería quedar así:

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **Inicia el juego una vez y ciérralo.** Esta primera ejecución sirve para generar los archivos de configuración. No pasará nada visible en pantalla, lo cual es completamente normal :hmm:.

## Activar la consola

Abre `BepInEx/config/BepInEx.cfg` en cualquier editor de texto, busca la sección `[Logging.Console]` y pon:

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

Inicia el juego de nuevo. Se abrirá una segunda ventana junto a él, mostrando mensajes desde el primer segundo.

## Cómo leer los mensajes

Ahora mismo, incluso sin haber creado todavía ningún mod, al arrancar el juego verás cómo BepInEx y NeoModLoader inician:

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

Si ves esas líneas, ¡enhorabuena, tu consola en vivo está funcionando a la perfección!

Más adelante, cuando crees tu primer mod en la guía **[Tu primer mod](#/nml/your-first-mod)**, verás cómo se compila y te saluda directamente en mitad de la riada de texto:

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

Tres costumbres que hacen que la consola sea realmente útil:

- **Ponle un prefijo a cada log** con el nombre de tu mod, como `[MiMod]`, para distinguir tus líneas al vuelo.
- **Añade logs al inicio y al final** de cada paso de configuración. Si ves "registrando rasgos..." pero nunca "rasgos registrados", sabes con precisión quirúrgica dónde explotó el código.
- **Deja la consola en un segundo monitor** (o en media pantalla). Ver aparecer una línea en el instante exacto en que haces clic en un botón es el método de depuración más rápido del mundo :memes:.

## Cómo la usarás (Vista previa rápida)

Una vez que tengas organizados los archivos de tu mod en **[Tu primer mod](#/nml/your-first-mod)**, podrás meter logs en vivo para comprobar eventos del juego:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // Botón izquierdo del ratón, una vez por clic
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

Cada clic imprimirá una línea en la consola de inmediato. ¡Tener esa respuesta instantánea es precisamente la razón por la que BepInEx es tan imprescindible!
