---
title: Mensajes y registro del mundo
group: Contenido del juego
subgroup: Poderes divinos e interfaz
icon: :wbscroll:
order: 207
---

# Mensajes y registro del mundo :wbscroll:

Imprimir en la consola con `Main.Log()` está genial mientras escribes código. Pero cuando tu poder divino deja caer un meteorito, una unidad jefe personalizada despierta, o un reino firma un tratado, el jugador no está leyendo tu log de depuración.

Necesitan retroalimentación en pantalla: avisos emergentes flotando por la pantalla y entradas en el registro histórico del mundo.

## Banners en pantalla con WorldTip

La forma más rápida de poner palabras delante del jugador es `WorldTip.showNow`:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Parámetro | Qué hace | Por defecto |
| --- | --- | --- |
| `pText` | Una cadena literal o una clave de localización | Obligatorio |
| `pTranslate` | Si se pasa `pText` por `LocalizedTextManager.getText()` | `true` |
| `pPosition` | Anclaje en pantalla: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Duración en segundos antes de desvanecerse | `3f` |
| `pColor` | Código de color hexadecimal para el texto | `"#F3961F"` (naranja) |

> [!WARNING] WorldTip traduce por defecto
> Como `pTranslate` vale `true` por defecto, escribir `WorldTip.showNow("Something happened!")` hace que el juego busque una clave de localización llamada `"Something happened!"`. No encuentra ninguna, registra un error de traducción faltante y muestra texto de relleno crudo :PESgn_Oops:.
>
> Si estás pasando texto literal en inglés, **fija siempre** `pTranslate: false`:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> Para texto localizado, pasa tu clave de traducción y deja `pTranslate: true`:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Texto de la barra inferior

Si quieres un mensaje más sutil justo encima de la barra de poderes divinos, como el texto de tooltip que se muestra al seleccionar un pincel, usa `showToolbarText`:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

Esto dibuja una pequeña pista flotante justo encima de la barra de poder activa.

## Registrar eventos del mundo en WorldLog

El registro del mundo es el archivo persistente que los jugadores abren en la ventana de Historia. Las entradas sobreviven a guardar y cargar, y están ligadas a la cronología del mundo.

El juego ofrece varios ayudantes estáticos listos para usar en `WorldLog`:

```csharp
// Registrar una sucesión imperial:
WorldLog.logNewKing(kingdom);

// Registrar la fundación de un nuevo reino:
WorldLog.logNewKingdom(kingdom);

// Registrar un evento de desastre en un tile concreto:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Entradas de historia personalizadas

Para añadir tu propio evento histórico personalizado, construye un `WorldLogMessage` con un `WorldLogAsset` de `AssetManager.world_log`:

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() registra la entrada en HistoryHud y la escribe en la base de datos del registro del mundo:
            entry.add();
        }
    }
}
```

`entry.add()` añade la entrada al HUD de historia de la partida actual y la persiste en la base de datos SQLite del mundo mediante `DBInserter.insertLog`.

## Rótulos del mapa (nameplates_library)

Cuando las capas del mapa están activadas, aparecen banners sobre ciudades, reinos y religiones. Estos se gestionan con `AssetManager.nameplates_library` (`NameplateAsset`).

| Campo | Qué hace |
| --- | --- |
| `id` | Identificador que coincide con un `MetaType` |
| `path_sprite` | Ruta del sprite para el marco del banner |
| `padding_left` / `padding_right` / `padding_top` | Márgenes de desplazamiento del texto |
| `map_mode` | Sobre qué `MetaType` dibuja este rótulo |

> [!WARNING] No llames a add() para modos de mapa vanilla
> La biblioteca solo permite **un** rótulo por `MetaType`. Si llamas a `AssetManager.nameplates_library.add(...)` para un `MetaType` que ya existe (como reinos o ciudades), lanza una excepción :wbfacepalm:.
>
> Si quieres retocar el aspecto de los rótulos vanilla, búscalos con `get()` y edita sus campos:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Siguiente: **[Opciones del juego y escalas de tiempo](#/nml/game-options)** para las opciones del jugador, o **[Cada frame](#/nml/update-loops)** para ejecutar lógica en un reloj.
