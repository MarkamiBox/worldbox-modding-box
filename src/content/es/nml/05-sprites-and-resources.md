---
title: Sprites y recursos
group: NML Modding
subgroup: Flujo de trabajo básico
icon: :wbfanartist:
order: 28
---

# Sprites y recursos :wbfanartist:

Tu rasgo (trait) ya tiene nombre, estadísticas (stats) y una descripción maravillosa. Pero también tiene un signo de interrogación enorme y horrible como icono. Es hora de arreglarlo.

## Usar un icono que el juego ya tiene

Es la opción más rápida y la que más usarás: apuntar directamente a la ruta de un sprite vanilla.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` equivale a `Resources.Load` con caché interna, y `getSpriteList` equivale a `Resources.LoadAll` con caché. Las rutas no llevan extensión de archivo: es `ui/Icons/iconFly`, nunca `ui/Icons/iconFly.png`.

La mayoría de campos en los assets esperan la **ruta en formato de texto (string)** en lugar del objeto Sprite ya cargado:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] ¿Cómo sé qué rutas existen?
> Utiliza la herramienta de **[Búsqueda de iconos](#/tools/icons)** en este sitio. Contiene todas las rutas de sprites del juego y entiende descripciones normales: buscar "death king" o "lightning bolt" te dará la ruta lista para copiar y pegar. Si no, abre **[UnityExplorer](#/toolbox/unity-explorer)** en el juego y lee el `path_icon` del asset oficial que más se parezca a lo que buscas :aPES_Magnifying:.

## Añadir tu propio arte

Crea una carpeta llamada **`GameResources/`** dentro de tu mod. NML la trata exactamente igual que la carpeta `Resources` interna de Unity, por lo que un archivo ubicado en:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

se cargará como `ui/Icons/iconHelloSwift` y funcionará en cualquier lugar donde sirva una ruta oficial. Las extensiones `.png`, `.jpg` y `.jpeg` se reconocen automáticamente.

### sprites.json

Junto a tus imágenes, un archivo `sprites.json` le explica a NML cómo recortarlas. Sin él, se aplican los valores por defecto de Unity, que para pixel art casi siempre son erróneos. (No siempre es obligatorio :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Campo | Qué hace |
| --- | --- |
| `PixelsPerUnit` | Mantenlo en `1` a menos que tengas un motivo muy específico para cambiarlo |
| `PivotX` / `PivotY` | El punto de anclaje. `0.5 / 0.0` es abajo al centro, que es lo habitual para unidades y edificios (building) |
| `BorderL/R/T/B` | Bordes de 9-slice para marcos de ventana y botones reescalables |
| `Path` | Archivo específico al que se aplica esta regla |
| `RectX` / `RectY` | Desplazamientos del rectángulo del sprite. Ambos valen `0` por defecto; la documentación de NML dice que se dejen en `0` |

`Default` se aplica a cualquier archivo de esa carpeta que no tenga una regla en `Specific`.

> [!NOTE] Los desplazamientos no son una receta de atlas
> Los ajustes documentados de `sprites.json` no tienen campos de ancho o alto de rectángulo. No los inventes para trocear una hoja de sprites. NML documenta los archivos `.meta` de Unity para atlas y hojas de sprites.

## Dónde va cada tipo de arte

Esta es la tabla a la que la gente siempre vuelve. Cada asset apunta a su arte con un campo distinto, y algunos anteponen en silencio una carpeta antes de cargar, así que el valor que escribes **no** siempre es la ruta donde está el archivo.

| Asset | Campo | El archivo va en |
| --- | --- | --- |
| Rasgo, poder divino (GodPower), reino (kingdom), grupo | `path_icon` | `GameResources/` + exactamente lo que escribiste |
| Objeto, en la mano de una unidad | `path_gameplay_sprite` | `GameResources/` + exactamente lo que escribiste |
| Edificio | `sprite_path` | Una **carpeta**: `GameResources/` + `sprite_path` + `/`, con `main_0.png`, `construction_0.png`, `ruin_0.png`. Con `sprite_path` vacío es `main_path` + id, y `main_path` por defecto es `buildings/` |
| Drop | `path_texture` | Una **carpeta**: `GameResources/` + exactamente lo que escribiste, un PNG por fotograma |
| Nube (cloud) | `path_sprites` | `GameResources/` + cada ruta de la lista |
| Efecto de estado (status) | `texture` | Una **carpeta**: `GameResources/effects/` + lo que escribiste, un PNG por fotograma |
| Proyectil | `texture` | Una **carpeta**: `GameResources/effects/projectiles/` + lo que escribiste, un PNG por fotograma |
| Recurso (resource), llevado en la mano | `path_gameplay_sprite` | Una **carpeta**: `GameResources/items/resources/` + lo que escribiste, un PNG por fotograma |
| Recurso, icono del inventario | `path_icon` | `GameResources/` + lo que escribiste. Vanilla usa un nombre simple como `iconResBread`, así que el archivo va en la raíz |
| Casilla (tile) y casilla superior | *(sin campo)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] "Una carpeta" no es una cuestión de estilo
> Todos los assets marcados como **carpeta** arriba se leen con `getSpriteList()`, que devuelve los fotogramas *dentro* de una carpeta. Apúntalo a un solo PNG y vuelve vacío: un drop cae invisible, un proyectil lanza `ArgumentOutOfRangeException` en `QuantumSpriteLibrary.drawProjectiles()`, un estado lanza un error en cada fotograma. Un solo fotograma está bien, solo tiene que estar en su propia carpeta: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Tres de ellos muerden:

- **Estado y proyectil anteponen una carpeta.** Escribir `texture = "effects/status/myThing"` en un estado hace que el juego busque `effects/effects/status/myThing`, que no existe. Los estados vanilla usan un nombre simple: `fx_status_burning_t`.
- **Las casillas ignoran los campos por completo.** El arte de una casilla se encuentra por su **id**, en una carpeta propia, porque una casilla tiene varias variantes. `hello_moss` significa `GameResources/tiles/hello_moss/` con tus PNG dentro.
- **Los edificios no pegan nada, pero tienen un plan B.** `sprite_path` se usa tal cual: `"buildings/hello_shrine"` significa `GameResources/buildings/hello_shrine/`. Déjalo vacío y el juego usa `main_path` + id, así que una carpeta escrita en `main_path` se convierte en `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copia la ruta de un asset vanilla
> Elige lo vanilla más parecido, lee su campo en **[UnityExplorer](#/toolbox/unity-explorer)** o con el **[Buscador de rutas de sprites](#/tools/icons)**, y copia la forma exacta. Es más rápido que razonarlo, y sale bien a la primera :PESgn_Noice:.

## Leer un archivo directamente desde el disco

A veces querrás cargar la imagen pura: un marco de ventana para 9-slice manual, un archivo de datos, etc. `ModDeclare` sabe en qué carpeta reside tu mod; nunca pongas rutas fijas absolutas en el código.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // pixel art, sin desenfoque bilineal
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

`NeoModLoader.utils.SpriteLoadUtils` también proporciona utilidades como `LoadSingleSprite(path)` y `LoadSprites(path)` si prefieres ahorrarte el código manual.

## Sonidos

Cada sonido en WorldBox es un evento de FMOD, reproducido mediante una ruta. Puedes usar cualquiera de ellos libremente:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

El primero se reproduce desde esa casilla del mundo. HelloBox reproduce el sonido de bola de fuego cuando su acción de combate lanza un ascua; consulta **[Proyectiles, hechizos y efectos](#/nml/projectiles-spells)**. Para encontrar rutas, busca `event:/SFX/` en el código del juego: hay cientos organizados por carpetas según su origen. Baja el volumen antes de empezar a probarlos.

### Añadir tus propios sonidos

NML en realidad parchea FMOD por dentro, así que los archivos `.wav` propios funcionan sin que tengas que montar un segundo motor de sonido en un garaje :PESgn_Noice:.

Suelta tu archivo `.wav` directamente en `GameResources/`, por ejemplo:

```text
GameResources/sounds/hello_boom.wav
```

NML engancha `MusicBox.playSound` y `playDrawingSound`, así que lo reproduces con exactamente el mismo método que un sonido vanilla (sin la extensión del archivo):

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

Junto a tu archivo, un `hello_boom.json` opcional te permite configurar cómo se comporta:

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| Campo | Valores |
| --- | --- |
| `Mode` | `Basic` (2D plano, el volumen no cambia), `Stereo3D` (atenuación vanilla con la distancia), `Mono3D` (direccional) |
| `Type` | `Sound` (control de efectos), `Music` (control de música), `UI` (control de interfaz) |
| `Volume` | Volumen por defecto de 0 a 100 |
| `LoopCount` | Veces que se repite (0 = una vez) |

Lo mejor de todo: como NML los conecta a los grupos de canales del juego, tus sonidos respetan de verdad la configuración de volumen del jugador en vez de dejarlo sordo a medianoche.

## Nunca le entregues al juego un sprite nulo

Un botón sin sprite no se convierte en un botón con icono faltante: se transforma en un **agujero invisible** en la interfaz que el jugador jamás podrá encontrar. Ten siempre un icono de respaldo:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Un icono de aviso te alerta de que "la ruta está mal". La nada absoluta te condena a pasar dos horas preguntándote a dónde fue a parar tu botón :PES4_Invisible:.


Siguiente: **[Ajustes del mod](#/nml/mod-config)** o **[Ventanas personalizadas](#/nml/custom-windows)**.
