---
title: Casillas y terreno
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbrockies:
order: 170
---

# Casillas y terreno :wbrockies:

El mapa es una cuadrícula de `WorldTile`, y cada casilla lleva **dos** capas apiladas una sobre otra:

| Capa | Campo en la casilla | Biblioteca | Clase | Ejemplos |
| --- | --- | --- | --- | --- |
| Suelo | `main_type` | `AssetManager.tiles` | `TileType` | tierra, arena, rocas, océano profundo, lava |
| Superior | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, muros |

Ambas comparten la misma clase base por debajo (`TileTypeBase`), de modo que todo lo explicado en esta página se aplica a ambas. La única diferencia radica en la capa en la que residen, determinada por `layer_type`.

Si quieres añadir un nuevo tipo de *suelo*, eso es un `TileType`. Si buscas algo que descanse **sobre** el suelo (un camino, un muro, un cultivo, musgo), eso es un `TopTileType`, y suele ser lo que realmente necesitas.

## Clona, no construyas de cero

Un tipo de casilla tiene cerca de cien campos, de los cuales la mayoría solo importan para una casilla vanilla específica. Clona el pariente más cercano:

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] Un tile de bioma necesita su bioma enlazado
> Clonar un tile de hierba copia `is_biome = true` y el `biome_id`, pero el `BiomeAsset` en sí solo se busca en `TopTileLibrary.linkAssets()`, una vez, mientras carga el juego. Sáltate esa línea y todo funciona hasta que aparece un animal en tu tile: su nombre de especie recibe el sufijo del bioma, el bioma es `null`, y el spawn muere con `NullReferenceException` en `Subspecies.generateName()` :wbfacepalm:.
>
> Las imágenes tienen el mismo problema. `TopTileLibrary` convierte los PNG de `tiles/<id>/` en `sprites` al arrancar, así que sin el último bloque el tile se pinta bien y luego el renderizador del mapa lanza en `WorldTilemap.getVariation()` por cada tile suyo en pantalla.


## Los campos que conviene conocer

### Qué clase de elemento es

| Campo | Qué hace |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` o capa superior. Decide a qué biblioteca pertenece |
| `ground`, `liquid`, `ocean`, `lava` | Banderas de categoría general por las que se ramifica todo el juego |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Banderas de familia de terreno |
| `road`, `wall`, `farm_field` | Banderas de estructura. La IA de las ciudades las lee |
| `block`, `block_height` | Si bloquea el paso y la altura con la que se dibuja |
| `is_biome`, `can_be_biome`, `biome_id` | Vincula la casilla a un bioma |
| `biome_tags`, `has_biome_tags` | Qué biomas harán crecer esta casilla |

### Cómo se comporta

| Campo | Qué hace |
| --- | --- |
| `walk_multiplier` | Velocidad al caminar sobre ella. `1.0` es normal, menor es más lento |
| `damage_units`, `damage` | Si pisarla hace daño y en qué cantidad |
| `damaged_when_walked` | La propia casilla se desgasta al ser pisada |
| `step_action`, `step_action_chance` | Tu propio código cada vez que algo la pisa |
| `unit_death_action` | Tu propio código cuando algo muere sobre ella |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Comportamiento frente al fuego |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Comportamiento frente al hielo |
| `remove_on_heat`, `terraform_after_fire` | Qué dejan tras de sí el calor y el fuego |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Detonación |
| `strength` | Cuánto aguante tiene. Es lo que leen los mods de murallas para la durabilidad |
| `cost` | Coste para el pathfinding |

### Qué puede hacer el jugador sobre ella

| Campo | Qué hace |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Qué herramienta la destruye |
| `allowed_to_be_finger_copied` | Si la herramienta de dedo puede copiarla |
| `can_build_on`, `can_be_farm` | Si una ciudad puede edificar o cultivar sobre ella |
| `only_allowed_to_build_with_tag` | Restringe la construcción a una etiqueta concreta |

### Transiciones

| Campo | Qué hace |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | En qué se convierte al crecer o erosionarse |
| `freeze_to_id` | En qué se convierte al congelarse |
| `fill_to_ocean`, `can_be_filled_with_ocean` | En qué se convierte bajo el agua |
| `lava_increase` / `lava_decrease` / `lava_level` | Cadena de progresión propia de la lava |

### Aspecto visual

| Campo | Qué hace |
| --- | --- |
| `color_hex` | Color para el minimapa y tinte |
| `edge_color_hex` | Color del contorno donde se une con otra casilla |
| `render_z`, `draw_layer_name` | Orden de dibujo. `setDrawLayer(...)` es el método auxiliar |
| `force_edge_variation`, `force_edge_variation_frame` | Fija la variante del sprite de borde |

## Ejecutar código cuando algo pisa la casilla

```csharp
moss.step_action_chance = 0.05f;   // 5% de las pisadas
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

Mismas reglas que cualquier otra acción de esta guía: comprueba si es nulo primero, devuelve `false` si no hiciste nada, y recuerda que esto corre para cada unidad caminando sobre cada casilla de este tipo.

## Tus propias texturas

Las casillas son la excepción de la regla: **no existe ningún campo de ruta**. El juego busca una carpeta que lleve exactamente el **id** de la casilla y carga todo su contenido como variaciones.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- el id exacto de la casilla
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

Nada que configurar en código. Nombra la carpeta con el id registrado y la casilla la encontrará sola.

Varios archivos dentro de esa carpeta se convierten en variantes aleatorias, evitando que un terreno parezca un papel tapiz repetitivo. Un solo archivo también funciona. Las casillas de suelo y las superiores se cargan igual.

`color_hex` es independiente y sigue siendo crucial: es lo que dibuja el minimapa y lo que tiñe la casilla cuando el juego lo necesita.

## Cambiar casillas en tiempo de ejecución

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // cambiar la capa superior
tile.setTileType(AssetManager.tiles.get("sand"));                // cambiar el suelo
tile.setTileTypes("sand", null);                                 // suelo, y limpiar la capa superior
```

Los tres métodos son públicos. Cambiar una casilla marca su chunk como sucio y el renderizador la actualiza por su cuenta.

### Leer qué hay en la casilla

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

Tanto `main_type` como `top_type` pueden ser `null`. Compruébalo antes de tocarlos. Este es el motivo de cuelgue más habitual en cualquier mod que recorre el mapa.

## Opciones de terraformación

Un `TerraformOptions` en `AssetManager.terraform` es un paquete bautizado de "limpieza de casilla", utilizado por poderes divinos y proyectiles:

| Campo | Qué hace |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Elimina estructuras |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Elimina restos |
| `destroy_buildings`, `make_ruins` | Qué les ocurre a los edificios |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Elimina estados |
| `add_burned`, `add_heat`, `flash` | Añade estados |

Un `ProjectileAsset` puede referenciar uno en `terraform_option` junto con un `terraform_range`, que es la forma en que una flecha explosiva despeja el suelo sobre el que impacta.

## Biomas

Un `BiomeAsset` en `AssetManager.biome_library` determina qué casillas aparecen en cada zona. Una casilla se une a un bioma mediante `setBiome("biome_forest")` o portando las etiquetas adecuadas en `biome_tags`. Clonar un bioma existente y sustituir sus ids de casilla es mucho más corto que construir uno desde la nada, y la regla de que el clon se registra solo también aplica aquí.

> [!TIP] Las casillas superiores son donde ocurre la magia de los mods
> Casi todo lo que la gente crea de verdad (muros, carreteras, cultivos, corrupción expandiéndose por un continente) es una casilla superior con un `step_action` y un poco de código que decide dónde colocarla. Nuevos tipos de suelo son más raros, más difíciles de hacer lucir naturales y se enredan con el generador de mundos de formas que no habías pedido :PES3_Yikes:.
