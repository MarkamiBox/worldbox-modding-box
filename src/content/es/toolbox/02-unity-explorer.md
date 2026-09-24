---
title: Mirando dentro del juego (UnityExplorer)
group: Resumen
subgroup: Herramientas externas y configuración
icon: :wbeyeball:
order: 6
---

# Mirando dentro del juego :wbeyeball:

**UnityExplorer** es un inspector dentro del juego. Te permite pausar en cualquier pantalla, hacer clic en cualquier ventana, botón o unidad, y leer cada uno de sus valores en tiempo real.

Por qué lo necesitas: en vez de adivinar de qué demonios está hecha una ventana vanilla, la abres y *miras*. Cualquier pregunta del estilo "¿cómo hicieron eso?" pasa a tener respuesta en dos minutos.

## Cómo instalarlo

1. Haz que **BepInEx** funcione primero, consulta **[La consola en vivo](#/toolbox/bepinex-console)**.
2. Descarga [**UnityExplorer para BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases) (bájate el archivo `UnityExplorer.BepInEx5.Mono.zip` desde la página de releases).
3. Extrae el zip en `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/`. ¡Asegúrate de que tanto `UnityExplorer.BIE5.Mono.dll` como su dependencia compañera `UniverseLib.Mono.dll` queden dentro!
4. Inicia el juego y pulsa **F7** (la tecla predeterminada para abrirlo).

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## Los tres paneles que realmente vas a usar

| Panel | Para qué sirve |
| --- | --- |
| **Object Explorer → Scene Explorer** | El árbol en vivo de absolutamente todo lo que hay en pantalla. Tu ventana anda por aquí metida |
| **Inspector** | Haz clic en cualquier objeto del árbol y mira cada componente y cada campo con sus valores actuales |
| **C# Console** | Escribe una línea de C# y ejecútala en el juego en marcha. Sin reiniciar nada |

## Ejemplo 1: averiguar cómo está construida una ventana vanilla

Quieres que tu ventana personalizada tenga el mismo aspecto que las del juego. Así que:

1. Dentro del juego, abre la ventana que te interese (Leyes del mundo (world law), por ejemplo).
2. Pulsa F7, ve a **Object Explorer → Scene Explorer** y despliega `CanvasMain` → `canvas_ui`.
3. Ve haciendo clic en los elementos hijos hasta que el objeto resaltado coincida con la ventana que abriste.
4. En el Inspector, revisa sus componentes: la `Image` con su sprite 9-slice, los tamaños de `RectTransform`, el `ScrollRect`.

Ahora ya sabes las dimensiones, la ruta del sprite y la estructura exacta para copiar en la página de **[Ventanas personalizadas](#/nml/custom-windows)**. Así es como te evitas tres horas de adivinar anclajes a ciegas :PES5_Peek:.

## Ejemplo 2: leer los valores reales de los campos de un asset

Abre la **C# Console** y ejecuta:

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

En la salida de log de UnityExplorer verás al instante:

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

Acabas de leer la ruta del icono y el grupo de un rasgo (trait) vanilla, sacados directamente del juego en marcha. Cópialos en tu propio rasgo y quedará en el mismo sitio de la interfaz, con un icono que existe de verdad.

## Ejemplo 3: probar una idea antes de ponerte a crear un mod

Seguimos en la consola de C#:

```csharp UnityExplorer C# console
// invoca un lobo en la casilla en x=100, y=100
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

Si funciona aquí, funcionará en tu mod. Si revienta con una excepción aquí, te acabas de ahorrar todo un ciclo de compilar y reiniciar el juego :aPES2_ThumbsUp:.

> [!TIP] Úsalo junto con la consola
> UnityExplorer responde a "¿de qué está hecho esto?". La consola de BepInEx responde a "¿se llegó a ejecutar mi código?". Casi cualquier dolor de cabeza al moddear se reduce a una de esas dos preguntas.
