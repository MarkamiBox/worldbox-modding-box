---
title: Generación de mapas
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbworld:
order: 169
---

# Generación de mapas :wbworld:

La ventana de mundo nuevo lee tres bibliotecas. `map_sizes` es el selector de tamaño, `map_gen_templates` es la fila de tarjetas de forma (`continent`, `islands`, `donut`...), y `map_gen_settings` son los deslizadores e interruptores que obtienes tras elegir una tarjeta. Las tres son bibliotecas de assets normales. Solo una de ellas es plug and play, y te voy a decir qué partes necesitan trabajo de UI antes de que lo descubras por las malas.

## Un mapa más grande

Un tamaño es un `MapSizeAsset`, y son cuatro campos:

| Campo | Qué hace |
| --- | --- |
| `id` | También la clave de traducción, con un prefijo: `map_size_<id>` |
| `size` | El lado del mapa en bloques de 64 tiles. `iceberg` es `9`, así que 576 x 576 |
| `path_icon` | El icono junto al nombre del tamaño, relativo a `ui/Icons/` |
| `show_warning` | Cambia el saludo de la ventana por el aviso de "este mapa es grande" |

Los vanilla: `tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9.

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values es un objeto plano, así que el clon comparte el de donut. dale el suyo propio antes de tocarlo
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copia desde una tabla de respaldo rellenada al arrancar, y tu id no está en ella
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles de lado
                path_icon = "iconIceberg",   // ui/Icons/ se añade automáticamente
                show_warning = true
            });

            // el selector de tamaño lee un array construido en linkAssets(), que se ejecutó antes que tu mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] Sin `linkAssets()` el tamaño es inalcanzable
> Las flechas de la ventana no recorren la biblioteca. Recorren un `string[]` plano que `MapSizeLibrary.linkAssets()` construye una vez al arrancar, antes de que NML te cargue. Tu tamaño queda registrado, y las flechas pasan de largo para siempre. Llamar a `linkAssets()` de nuevo solo reconstruye ese array, así que es seguro.

Las flechas van en el orden de `list`, así que un tamaño añadido al final aterriza después de `iceberg`, que es donde pertenece un mapa más grande. Uno más pequeño necesita `list.Remove` y `list.Insert(0, ...)` antes de la llamada a `linkAssets()`.

Lo que puedo decirte sobre los límites, a partir del código:

- **La subida al Workshop lo rechaza.** La subida comprueba el tamaño contra `Config.maxMapSize`, que es `iceberg`, y rechaza cualquier cosa más grande con "Not a valid world size!".
- **Sin tu mod, la lista de guardados muestra números crudos.** El navegador de guardados busca el tamaño por su número y recurre a "ancho x alto" cuando nada coincide. Si ese guardado carga limpiamente sin tu mod, no lo he probado.
- **No he probado hasta dónde llega.** `10` son un 23% más de tiles que `iceberg`, y cada paso posterior cuesta más. En algún punto ahí arriba hay un número que a los ordenadores de tus jugadores no les va a gustar :PES5_Hmmmm:.

## Una nueva forma de mundo

Una plantilla es un `MapGenTemplate`. La receta real vive en su `values`, el resto decide cómo se presenta:

| Campo | Qué hace |
| --- | --- |
| `values` | Un `MapGenValues`: los indicadores y números que lee el generador. Ver abajo |
| `path_icon` | La imagen de vista previa, ruta completa: `ui/new_world_templates_icons/template_donut` |
| `force_height_to` | Fija cada tile a esta altura tras el primer paso de ruido, antes de que el resto le dé forma. `0` lo omite |
| `freeze_mountains` | Congela las cimas de las montañas una vez terminado el terreno |
| `perlin_replace` | Intercambios de tile según altura, como "por encima de 170, `soil_high` se convierte en `soil_low`" |
| `special_anthill`, `special_checkerboard`, `special_cubicles` | Activa uno de los tres generadores fijados en el código |
| `allow_edit_*` | Qué filas de ajustes ve el jugador para esta plantilla. Ver la siguiente sección |
| `show_reset_button` | Si la ventana tiene un botón de "restablecer" |

Los ids vanilla, todos ellos fuentes válidas para `clone()`: `continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`.

Y los campos de `MapGenValues` que vale la pena conocer:

| Campo | Qué hace |
| --- | --- |
| `main_perlin_noise_stage`, `perlin_noise_stage_2`, `perlin_noise_stage_3` | Los tres pasos de ruido que crean el terreno |
| `perlin_scale_stage_1` / `_2` / `_3` | Cuánto zoom tiene cada paso. `5` por defecto |
| `gradient_round_edges` / `square_edges` | Difumina la altura hacia el borde del mapa, en círculo o en cuadrado |
| `add_center_gradient_land`, `add_center_lake`, `center_gradient_mountains` | Empuja tierra, un lago o montañas hacia el centro |
| `ring_effect` | Un paso de ruido extra en forma de anillo |
| `add_mountain_edges` / `remove_mountains` | Un borde de montañas alrededor del mapa / aplana las montañas a suelo normal |
| `low_ground` / `high_ground` | Baja o sube el suelo después de los pasos de ruido |
| `random_shapes_amount` | Cuántas manchas aleatorias se estampan encima |
| `random_biomes`, `add_vegetation`, `add_resources` | Los tres últimos están en `true` por defecto |

`AddRing()` de arriba clona una plantilla vanilla y le da su propia receta. Mantén los tres métodos en la misma clase `HelloMapGen`.

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] Oculta el botón de restablecer en tus propias plantillas
> "Restablecer" llama a `resetTemplateValues()`, que lee los valores por defecto de la plantilla desde un diccionario rellenado una sola vez al arrancar con los ids vanilla. El tuyo no está en él, así que el botón lanza `KeyNotFoundException`. `show_reset_button = false` y el problema no existe.

> [!WARNING] Una plantilla clonada comparte su `values`
> `clone()` copia las listas en listas nuevas, pero `values` es una clase plana, así que se copia por referencia (consulta **[Bibliotecas de assets](#/nml/asset-libraries)**). Edita `ring.values.ring_effect` sin la línea `new MapGenValues` y cada donut vanilla cambia con él. Las entradas dentro de `perlin_replace` se comparten de la misma manera: construye unas nuevas en lugar de editarlas.

### La trampa: no hay tarjeta

El selector de plantillas es un prefab. Tiene un botón por cada plantilla vanilla, y cada botón encuentra su plantilla por el nombre de su propio GameObject. Una plantilla nueva no obtiene botón, y nada en la biblioteca cambia eso.

Lo que sí funciona es hacer tú mismo el trabajo del botón: fija la plantilla, luego abre la segunda ventana, exactamente como hace una tarjeta vanilla.

Llama a `HelloMapGen.OpenRing()` desde tu botón.

Cuélgalo de un botón sencillo, consulta **[Pestañas y botones de poder](#/nml/power-buttons)**, y el jugador obtiene tu vista previa, tus filas de ajustes, las flechas de tamaño y el botón de generar, como cualquier plantilla vanilla. Meter una tarjeta real en el selector implica clonar uno de sus botones y renombrar el clon antes de que se ejecute su `Awake()`, porque es entonces cuando lee su nombre. Eso es cirugía de UI que no he verificado, así que no está en esta página.

> [!NOTE] Editar una plantilla vanilla en su lugar
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` funciona, y no necesita ningún botón. Solo ten en cuenta que "restablecer" restaura la copia de arranque, tomada antes de que tu mod cargara. Un clic y tu cambio desaparece hasta el siguiente reinicio.

## Las filas bajo una plantilla

Cada deslizador e interruptor en la segunda ventana es un `MapGenSettingsAsset`:

| Campo | Qué hace |
| --- | --- |
| `is_switch` | Encendido/apagado en vez de un número |
| `min_value` / `max_value` | El rango, para un número |
| `allowed_check` | Dado la plantilla actual, si esta fila se muestra |
| `action_get` / `action_set` | Lee y escribe el valor, normalmente en el `values` de la plantilla actual |
| `increase` / `decrease` / `action_switch` | Qué hacen las flechas y el interruptor |

Las filas vanilla: `gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`.

La parte que un mod realmente usa: el `allowed_check` de cada fila vanilla lee uno de los indicadores `allow_edit_*` de tu plantilla. Así que no añades filas, eliges cuáles de estas recibe el jugador:

```csharp
// en AddRing(), después del clon: oculta todo, luego devuelve las filas que tienen sentido para un anillo
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

Detalle curioso: los tres deslizadores de perlin comprueban `allow_edit_perlin_scale_stage_1`. Los indicadores `_2` y `_3` existen y nada los lee :PES2_Shrug:.

Un `MapGenSettingsAsset` nuevo por sí solo no muestra nada. Las filas están integradas en el prefab de la ventana y encuentran su asset por el nombre del GameObject, el mismo truco que las tarjetas de plantilla. Una fila propia implica clonar una existente dentro de la ventana, y lo que registres debe tener `allowed_check` definido, porque la ventana lo llama en cada fila sin comprobar null.

> [!TIP] Empieza por la forma, no por los ajustes
> Nueve de cada diez veces, lo que quieres es una plantilla con un `values` distinto y un botón que la abra. Eso no necesita ninguna edición de prefab. Vuelve a comprobar los campos tras cada actualización del juego. Una vez que el terreno se ve bien, **[Biomas](#/nml/biomes)** decide qué crece en él :PES2_Wise:.
