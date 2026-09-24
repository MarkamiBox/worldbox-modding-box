---
title: Poderes divinos
group: Contenido del juego
subgroup: Poderes divinos e interfaz
icon: :wbgodfinger:
order: 200
---

# Poderes divinos :wbgodfinger:

Un poder divino es lo que sucede cuando el jugador selecciona tu herramienta y hace clic en el mundo. Generar algo, bendecir algo, hacer explotar algo.

Hay dos cosas independientes involucradas, y confundirlas es el clásico error de principiante:

| | |
| --- | --- |
| El **poder** (`GodPower`) | Los datos: un id, un icono y el código que se ejecuta al hacer clic |
| El **botón** (`PowerButton`) | La casilla en la barra que el jugador realmente puede presionar |

Esta página crea el poder. La página de **[Pestañas y botones de poder](#/nml/power-buttons)** lo pone en la pantalla.

## Crear el poder

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Nunca registres el mismo id dos veces: el juego se queda con el primero.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // sin desbloqueo necesario
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // suelta la herramienta al abrir una ventana
                show_tool_sizes = false,            // sin pinceles de tamaño pequeño/mediano/grande

                // Lo que ocurre cuando el jugador hace clic en una casilla con esta herramienta armada.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = el clic fue consumido
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Añade `HelloPowers.Initialize();` a `Main.cs`.

### Qué hace cada parte

- **`id`**: el nombre al que se refiere todo lo demás. El botón, la traducción, otros mods.
- **`name`**: lo usan las búsquedas de la propia interfaz del juego. Mantenerlo igual que el id te ahorra un dolor de cabeza.
- **`rank = PowerRank.Rank0_free`**: disponible desde el principio, sin desbloquear.
- **`path_icon`**: el icono del cursor/herramienta.
- **`unselect_when_window`**: cuando el jugador abre una ventana, la herramienta se desarma sola, para que no fulmine sin querer el mapa detrás del panel.
- **`click_action`**: tu código. Recibe la **casilla pulsada** y el **id del poder**, y devuelve `true` si hizo algo.

> [!WARNING] La firma del clic es `(WorldTile, string)`
> `click_action` es un `PowerActionWithID`, así que su segundo argumento es el **id del poder como string**, no un `GodPower`. Hay un segundo campo, `click_power_action`, que recibe `(WorldTile, GodPower)`. Usar la forma equivocada te da un error de compilación que parece un sinsentido :PES_DaFuq:.

## Cosas útiles que hacer al hacer clic

```csharp
// la criatura sobre (o junto a) la casilla, si la hay
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// generar una criatura
World.world.units.spawnNewUnit("wolf", pTile);

// un efecto visual en la casilla
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// dejar caer algo del cielo (ver Gotas y cosas que caen)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// mostrar un mensaje al jugador
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Mantener presionado para pintar

Establecer `hold_action = true` y un `click_interval` hace que el poder se repita mientras se mantiene presionado el ratón, igual que las herramientas de pincel vainilla:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // segundos entre repeticiones
```

## Tu propio icono

`path_icon` es el cursor de la herramienta y la cara del botón. Se carga exactamente como está escrito, desde dentro de `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] Un icono ausente es un botón invisible
> Si la ruta es incorrecta, el sprite devuelto es `null`, y un sprite `null` no es un botón con una imagen faltante: es un agujero invisible en la barra que el jugador jamás encontrará. Consulta la función de respaldo en **[Pestañas y botones de poder](#/nml/power-buttons)** :aPES_Hide:.

## El texto

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Pinceles

Un poder pinta usando un **pincel**: la figura de casillas que cubre un solo clic. El juego genera la lista de píxeles y la imagen de previsualización de cada pincel mediante código, por lo que una forma nueva no requiere recursos gráficos.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

Un poder puede forzar el uso de un pincel con `force_brush = "hello_target"`, de la misma forma que los poderes de una casilla del juego original se vinculan a `sqr_0`. Los atajos de pinceles rotan por `_available_brushes`, por lo que el tuyo formará parte de esa rotación. La ventana de pinceles es otro tema: construye sus botones al inicializarse; si tu pincel no aparece allí, `force_brush` y los atajos seguirán accediendo a él sin problema.

> [!WARNING] Los pinceles se miden durante el inicio del juego
> `BrushLibrary.post_init()` ejecuta la `generate_action` de cada pincel y calcula `width`, `height` y `sqr_size`, mientras que `linkAssets()` baraja los píxeles. Un pincel añadido después no recibe nada de esto: define `pos` y los tamaños manualmente como en el ejemplo. La previsualización se dibuja a partir de `pos`, por lo que el pincel no necesita ningún icono.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## Todavía no está en el juego

En efecto: creaste un poder, pero nada lo muestra. Pasa a **[Pestañas y botones de poder](#/nml/power-buttons)**, esa es la otra mitad, y solo son diez líneas :pepeOK:.
