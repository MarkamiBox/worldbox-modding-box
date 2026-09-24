---
title: Edificios personalizados
group: Contenido del juego
subgroup: Actores, edificios e IA
icon: :wbcities:
order: 142
---

# Edificios personalizados :wbcities:

Los edificios (building) son el punto donde moddear WorldBox deja de ser "cambiar un número" y pasa a ser "este asset tiene ciento cuarenta campos y la mayoría no hacen nada en mi caso" :PES2_Weary:.

Así que no creamos uno desde cero. Clonamos uno que ya funcione.

## Clonar primero, ajustar después

`clone(newId, sourceId)` copia todos los campos del original, le cambia el nombre **y lo registra**. Esa última parte importa:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

Todo lo que no toques se queda exactamente como estaba en `temple_human`, que es un edificio de ciudad que funciona. Ese es todo el truco.

> [!WARNING] No llames a `add()` después de `clone()`
> `clone()` ya registró la copia. Llamar a `AssetManager.buildings.add(shrine)` después la registra por segunda vez, lo que hace que la biblioteca descarte la primera copia y escriba `duplicate asset - overwriting...` en el log. Sigue funcionando, pero es ruido en tu log y lo primero que señalará cualquiera que revise tu código.

## De qué clonar

La librería cuenta tanto con plantillas `$…$` como con edificios terminados:

| Origen | Para |
| --- | --- |
| `$building$` | La base más básica |
| `$city_building$` | Cualquier cosa que construya una ciudad. `well` y `mine` lo usan |
| `$city_colored_building$` | Lo mismo, pero tintado por el color del reino (kingdom) |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Edificios civiles por cultura (culture) |
| `$building_creep$` | Estructuras de biomas (biome) invasores (creep) |
| `$mineral$` | Rocas y minerales explotables |
| `$resource$`, `$flora_small$` | Naturaleza recolectable |
| `tree_green_1` | Todos los árboles vainilla se clonan a partir de este |

Edificios terminados que vale la pena clonar: `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Clonar el pariente más cercano son diez minutos de lectura que te ahorran una noche entera lidiando con campos que no hacen nada.

## Los campos, según lo que busques

### Qué tipo de edificio es

| Campo | Qué hace |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | Pertenece a una ciudad, por lo que recibe colores de reino, zonas y trabajos (job) |
| `type` | Una etiqueta de texto libre por la que se agrupan las listas del juego |
| `kingdom`, `civ_kingdom` | Restringirlo a una facción específica |
| `ignored_by_cities` | Las ciudades nunca lo construyen ni lo contabilizan |

### Vivienda y uso

| Campo | Qué hace |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Si pueden vivir ciudadanos en él y cuántos |
| `housing_happiness` | Bonificación de felicidad por residir allí |
| `storage`, `storage_only_food`, `is_stockpile` | Si almacena recursos (resource) |
| `book_slots` | Capacidad de libros en bibliotecas |
| `docks`, `boat_types`, `boat_type_fishing`, `boat_type_trading`, `boat_type_transport` | Producción de barcos |
| `spawn_units`, `spawn_units_asset` | Genera criaturas |
| `tower`, `tower_projectile`, `tower_projectile_reload`, `tower_projectile_amount`, `tower_attack_buildings` | Capacidad de disparo y ataque |

### Construcción y colocación

| Campo | Qué hace |
| --- | --- |
| `cost`, `construction_progress_needed` | Coste que paga la ciudad y tiempo de construcción |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from`, `upgrade_level` | Cadenas de mejora, como `house_human_0` a `_5` |
| `build_place_borders`, `build_place_center`, `build_place_single`, `build_place_batch` | Dónde se ubica en el pueblo |
| `build_prefer_replace_house`, `check_for_close_building`, `ignore_same_building_id` | Reglas de emplazamiento |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Cuántos pueden existir |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks`, `needs_farms_ground`, `only_build_tiles` | Reglas de terreno |
| `build_road_to` | La ciudad traza un camino hacia él |

### Naturaleza y crecimiento

| Campo | Qué hace |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | Aparece por sí solo con el tiempo |
| `growth_time`, `has_resources_grown_to_collect` | Ciclos de frutos y cultivos |
| `biome_tags_growth`, `has_biome_tags` | Qué biomas permiten su crecimiento |
| `resources_given`, `addResource(id, amount, pNewList)` | Qué otorga al cosecharlo |
| `can_be_chopped_down`, `gatherable` | Si las unidades pueden talarlo o cosecharlo |
| `grow_creep` y sus variantes `grow_creep_*` | Comportamiento (behaviour) de propagación invasora |

### Daño y destrucción

| Campo | Qué hace |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid`, `damaged_by_rain`, `can_be_damaged_by_tornado` | Qué cosas lo dañan |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin`, `remove_ruins` | Qué deja tras su destrucción |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | Cómo desaparece |
| `loot_generation` | Qué botín suelta al ser destruido |

### Aspecto visual

| Campo | Qué hace |
| --- | --- |
| `sprite_path` + `main_path` | Dónde reside el sprite |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Qué atlas de sprites se utiliza |
| `scale_base`, `bonus_z`, `random_flip` | Tamaño, orden de dibujado y volteo |
| `shadow`, `shadow_bound`, `shadow_distortion` | La sombra |
| `has_kingdom_color` | Tintado con el color del reino poseedor |
| `draw_light_area`, `draw_light_size` | Resplandor de luz |
| `has_special_animation_state`, `animation_speed`, `sparkle_effect` | Animaciones |

### Comportamiento

| Campo | Qué hace |
| --- | --- |
| `step_action`, `has_step_action` | Código personalizado ejecutado en cada tick del edificio |
| `base_stats` | Estadísticas (stats) que aporta el edificio |
| `priority` | Prioridad en la cola de construcción urbana |

## Sprites

Los edificios cargan su arte desde `sprite_path`, usado **tal cual está escrito**. Solo si dejas `sprite_path` vacío el juego recurre a `main_path + id`. Pon tu arte en `GameResources/buildings/hello_shrine/` y dale un pivote centrado abajo en tu `sprites.json`, o tu santuario flotará sobre el suelo como un fantasma :aPES_GhostDance:. Mira **[Sprites y recursos](#/nml/sprites-and-resources)**.

## Tu propio sprite

Elige una de las dos formas de abajo y no las mezcles. El cargador hace literalmente esto: usa `sprite_path` si tiene algo, si no usa `main_path + id`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

Los **nombres de archivo son el formato**. El cargador parte cada nombre por el `_`: lo de antes es el tipo (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`, y `mini` para el minimapa), el número de después es el fotograma de la animación. `mini_0` tiene que tener exactamente tantos píxeles como casillas (tile) ocupa el edificio, 5x4 para cualquier cosa clonada de `temple_human`; si lo omites, el minimapa lanza `NullReferenceException` en `Building.getColorForMinimap()` cada vez que se redibuja. `main_0`, `main_1`, `main_2` es una animación de tres fotogramas. Un archivo con cualquier otro nombre no es un fotograma, y una carpeta sin `main_0` no le da al edificio nada que dibujar.

```csharp
// A: full path in sprite_path. main_path is then ignored.
shrine.sprite_path = "buildings/hello_shrine";

// B: leave sprite_path empty and let main_path + id decide.
shrine.sprite_path = string.Empty;
shrine.main_path = "buildings/";       // -> buildings/hello_shrine
```

Si las mezclas, carpeta en `main_path` y `sprite_path` vacío, el juego busca `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Carga los fotogramas tú mismo, después de poner la ruta
> El juego rellena `building_sprites` para cada edificio en su propia precarga, que se ejecuta antes que tu mod. Un edificio que registras después tiene la lista de fotogramas vacía, y la primera vez que se coloca uno el juego muere en `Building.setAnimData()` con `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Llama a `shrine.loadBuildingSprites();` en cuanto `sprite_path` esté puesto.
>
> Su hermano es `atlas_asset`, el atlas de sprites que pinta el edificio del color de su dueño. La biblioteca lo enlaza en `checkAtlasLink()`, también al arrancar. Sáltatelo y el edificio se coloca sin problema, pero luego lanza `NullReferenceException` en `DynamicSprites.getRecoloredBuilding()` en **cada fotograma en que está en pantalla**.

Dale un **pivote centrado abajo** en tu `sprites.json`, o tu santuario flotará sobre el suelo como un fantasma (mira **[Sprites y recursos](#/nml/sprites-and-resources)**).

## Poner uno en el mapa

`World.world.buildings.addBuilding(...)` está marcado como `internal`, por lo que compila al hacer referencia a un `Assembly-CSharp.dll` **publicitado**; consulta la nota en **[Efectos de estado](#/nml/status-effects)**:

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Pregunta siempre a `canBuildFrom` primero. Colocar un edificio sobre agua, sobre otro edificio o en una casilla reclamada por una ciudad para otro propósito produce un mundo que se ve bien al principio y revienta tres minutos después :PES_OhShit:.


## Hacer que las ciudades lo construyan

Un poder divino (GodPower) que coloca tu santuario es divertido para una tarde. Un santuario que las ciudades construyen por sí solas, cuando son lo suficientemente grandes, es un mod. Las ciudades eligen qué construir a partir de dos cosas, y tu edificio aún no está en ninguna de ellas:

| | Qué contiene |
| --- | --- |
| Una **orden de construcción** (`AssetManager.city_build_orders`) | Una lista de claves de orden como `order_temple`, con la población y el conteo de edificios que requiere cada una |
| Una **arquitectura** (`AssetManager.architecture_library`) | Qué edificio significa una clave de orden para este tipo de criatura: `order_temple` es `temple_human` para humanos, otra cosa para orcos |

Así que inventas una clave de orden, le enseñas a cada arquitectura lo que significa y la agregas a las órdenes de construcción:

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // Un tipo propio, para que la ciudad cuente santuarios contra su límite, no templos
    shrine.type = "type_hello_shrine";

    // La búsqueda de arquitectura es un diccionario simple: una clave desconocida lanza un error para cada ciudad
    // de esa criatura. Enséñasela a todas, incluso a las que nunca la alcanzarán.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // el mismo límite que usa el templo: 1, 50 habitantes, 15 edificios en la ciudad
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

Llama a `AddToCities()` al final de `Initialize()`, después del clon.

A diferencia de la mayor parte de esta guía, aquí no hay trampa de inicio: `CityBehBuild.calcPossibleBuildings()` lee la lista de órdenes de construcción de cada ciudad cada vez que evalúa construir, por lo que una orden agregada al cargar es vista por la primera ciudad que verifique. La ciudad aún debe poder pagar el `cost` del edificio y cumplir con cada número de la orden; cuando no puede, omite tu santuario sin decir nada :PES5_Hmmmm:.

| Argumento de `addBuilding(...)` | Qué hace |
| --- | --- |
| `pID` | La clave de orden, no el id del edificio |
| `pLimitType` | Cuántos puede tener la ciudad. El templo usa `1` |
| `pPop` | Población mínima |
| `pBuildings` | Número mínimo de edificios ya presentes en la ciudad |
| `pCheckFullVillage` | Solo cuando todas las casas estén llenas |
| `pCheckHouseLimit` | Para casas: omitir mientras la vivienda no escasee, detenerse en el límite de casas de la ciudad |
| `pMinZones` | Tamaño mínimo de la ciudad, en zonas |

## El texto

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Examina el original antes de clonarlo
> Abre `BuildingLibrary` en **dnSpy** y observa en qué se diferencian `house_human_0`, `tree_green_1` y `mineral_stone`. Cada edificio vainilla se construye allí en C# puro, lo que constituye la mejor documentación campo por campo que existe :PES_Smart:.
