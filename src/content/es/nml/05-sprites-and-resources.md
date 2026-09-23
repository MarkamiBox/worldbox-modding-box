---
title: Sprites y recursos
group: NML Modding
subgroup: Flujo de trabajo básico
icon: :wbfanartist:
order: 28
---

# Sprites y recursos :wbfanartist:

Tu rasgo ya tiene nombre, estadísticas y una descripción maravillosa. Pero también tiene un signo de interrogación enorme y horrible como icono. Es hora de arreglarlo.

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
| `PivotX` / `PivotY` | El punto de anclaje. `0.5 / 0.0` es abajo al centro, que es lo habitual para unidades y edificios |
| `BorderL/R/T/B` | Bordes de 9-slice para marcos de ventana y botones reescalables |
| `Path` | Archivo específico al que se aplica esta regla |

`Default` se aplica a cualquier archivo de esa carpeta que no tenga una regla en `Specific`.

## Dónde va cada tipo de arte

Esta es la tabla de referencia que todo el mundo vuelve a consultar. Cada asset apunta a su arte mediante un campo distinto, y algunos añaden carpetas de forma silenciosa antes de cargar, por lo que el valor que escribes **no** siempre coincide con la ruta en el disco.

| Asset | Campo | Dónde colocar el archivo |
| --- | --- | --- |
| Rasgo, poder divino, reino, grupo | `path_icon` | `GameResources/` + exactamente lo que hayas escrito |
| Objeto, en la mano de la unidad | `path_gameplay_sprite` | `GameResources/` + exactamente lo que hayas escrito |
| Edificio | `sprite_path` | Una **carpeta**: `GameResources/` + `sprite_path` + `/`, con `main_0.png`, `construction_0.png`, `ruin_0.png`. Con `sprite_path` vacío es `main_path` + id, y `main_path` vale `buildings/` por defecto |
| Drop (botín) | `path_texture` | Una **carpeta**: `GameResources/` + exactamente lo que hayas escrito |
| Nube | `path_sprites` | `GameResources/` + cada ruta listada |
| Efecto de estado | `texture` | Una **carpeta**: `GameResources/effects/` + lo que hayas escrito |
| Proyectil | `texture` | Una **carpeta**: `GameResources/effects/projectiles/` + lo que hayas escrito |
| Recurso, llevado en la mano | `path_gameplay_sprite` | Una **carpeta**: `GameResources/items/resources/` + lo que hayas escrito |
| Recurso, icono de inventario | `path_icon` | `GameResources/` + lo que escribas (el juego usa nombres simples como `iconResBread`) |
| Casilla (Tile) y Top Tile | *(sin campo)* | `GameResources/tiles/<el_id_de_la_casilla>/` |

> [!WARNING] "Una carpeta" no es cuestión de estilo
> Cada asset marcado como **carpeta** arriba se lee con `getSpriteList()`, que devuelve los frames *dentro* de una carpeta. Apúntalo a un PNG suelto y vuelve vacío: un drop cae invisible, un proyectil lanza `ArgumentOutOfRangeException` en `QuantumSpriteLibrary.drawProjectiles()`, un estado lanza en cada frame. Un solo frame vale, solo tiene que estar en su propia carpeta: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Hay tres trampas habituales:

- **Los estados y proyectiles anteponen una subcarpeta.** Escribir `texture = "effects/status/myThing"` hará que el juego busque en `effects/effects/status/myThing`, que no existe. Los estados vanilla usan nombres simples: `fx_status_burning_t`.
- **Las casillas ignoran estos campos por completo.** El arte de un tile se busca por su **ID** en una carpeta dedicada, ya que un tile tiene muchas variantes. `hello_moss` significa `GameResources/tiles/hello_moss/` con tus PNGs dentro.
- **Los edificios no pegan campos, pero tienen un plan B.** `sprite_path` se usa tal cual: `"buildings/hello_shrine"` significa `GameResources/buildings/hello_shrine/`. Si lo dejas vacío, el juego usa `main_path` + id, así que una carpeta escrita en `main_path` acaba en `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Copia la ruta de un asset oficial
> Elige el objeto vanilla más parecido, revisa su campo en **[UnityExplorer](#/toolbox/unity-explorer)** o con la **[Búsqueda de iconos](#/tools/icons)** e imita su estructura. Es más rápido y acertarás a la primera :PESgn_Noice:.

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

El primero se reproduce desde esa casilla del mundo. HelloBox reproduce el sonido de bola de fuego cuando su acción de combate lanza un ascua; consulta **[Proyectiles, hechizos y efectos](#/nml/projectiles-spells)**. Para encontrar rutas, busca `event:/SFX/` en el código del juego: hay cientos organizados por carpetas según su origen.

> [!NOTE] Añadir nuevos sonidos es un proyecto aparte
> Los eventos de FMOD residen en los bancos de sonido del juego y un mod no puede añadir contenido directamente a ellos. Reproducir tus propios archivos `.wav` requiere cargarlos en un `AudioSource` de Unity por tu cuenta, fuera de los controles de volumen del juego. Esta guía no lo cubre.

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
