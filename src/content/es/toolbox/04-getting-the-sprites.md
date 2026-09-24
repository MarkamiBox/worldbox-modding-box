---
title: Extraer los gráficos del juego (AssetRipper)
group: Resumen
subgroup: Herramientas externas y configuración
icon: :wbgeneralartist:
order: 8
---

# Extraer los gráficos del juego :wbgeneralartist:

El código te dice *qué* escribir. **AssetRipper** te muestra qué aspecto tiene el arte y, lo que es aún más importante, **cuál es su ruta exacta**.

Cada icono, unidad, edificio (building) y efecto en WorldBox se carga mediante una ruta de texto como `ui/Icons/iconFly`. Si te equivocas en esa ruta, tu botón se convierte en un agujero invisible en la interfaz. AssetRipper es como dejas de jugar a adivinar.

> [!TIP] Si solo necesitas la ruta, no necesitas nada de esto
> La **[Búsqueda de iconos](#/tools/icons)** de este sitio se construyó exactamente a partir de esta exportación: cada ruta del juego, accesible y fácil de buscar. Extrae el juego tú mismo cuando quieras *ver* el arte, elegir el tamaño adecuado o combinar la paleta. Para eso está el resto de esta página :PES4_HappyAwesome:.

## Exportar el juego

1. Descarga [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases).
2. Selecciónale tu carpeta de WorldBox (la que contiene `worldbox_Data`).
3. Exporta a la carpeta que prefieras. Tardará un par de minutos y ocupará unos cuantos gigas :pepehang:.

Obtendrás un proyecto de Unity. La parte que de verdad te importa es la carpeta exportada `Resources`, que tiene el mismo árbol que el juego consulta en tiempo de ejecución.

## Convertir un archivo en una ruta

La regla es muy sencilla: **la ruta es la ubicación dentro de `Resources`, sin la extensión del archivo.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

Estas son las carpetas que más vas a utilizar:

| Carpeta | Qué contiene |
| --- | --- |
| `ui/Icons/` | Todos los iconos pequeños de la interfaz: rasgos (trait), poderes, botones |
| `ui/Icons/worldrules/` | Iconos de las leyes del mundo (world law) |
| `actors/` | Unidades y sus fotogramas de animación |
| `buildings/` | Casas, árboles, minerales |
| `effects/` | Explosiones, proyectiles (projectile), sprites de estados |

## Usarlo en tu mod

Encuentra un icono que te guste en la exportación, anota su ruta y úsalo directamente, sin copiar ningún archivo: ya está dentro del juego:

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

O asígnalo como string directamente a un asset:

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## Imitar el estilo de tu propio arte

Si dibujas tus propios sprites, abre primero un archivo vanilla y copia tres cosas esenciales:

- **El tamaño.** Los iconos de rasgos y poderes son diminutos, normalmente de entre 16 y 32 px. Abre uno y ajústate a esa medida.
- **La paleta.** WorldBox tiene una paleta limitada y de tonos suaves. Elige tus colores a partir de un sprite existente y tu icono no desentonará :PES3_BobRoss:.
- **El punto de anclaje (pivot).** Las unidades y edificios se apoyan en el suelo, por lo que su pivot está abajo en el centro. Eso es el `PivotY: 0.0` en tu archivo `sprites.json` (consulta **[Sprites y recursos](#/nml/sprites-and-resources)**).

Luego coloca tu PNG en `GameResources/` respetando la misma estructura de carpetas, y se cargará exactamente igual que uno vanilla:

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
