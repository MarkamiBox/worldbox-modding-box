---
title: Nubes y clima
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbtornado:
order: 172
---

# Nubes y clima :wbtornado:

Una nube (cloud) es un sprite que se desplaza por el mapa dejando caer cosas sobre lo que esté debajo. Lluvia, ácido, lava, nieve, fuego: todos son el mismo asset con un color distinto y un `drop_id` diferente.

Las nubes ofrecen la mejor relación calidad-esfuerzo de todo el juego para un modder. Un solo asset, sin necesidad de dibujar nada, y se mueve, deja caer gotas, ilumina el suelo y aparece sola en la lista de desastres (disaster).

## Registrar una

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] Una nube registrada tarde no tiene sprites
> `CloudLibrary` construye `cached_sprites` a partir de `path_sprites` y `color` a partir de `color_hex` en una sola pasada mientras carga el juego. Tu nube aún no estaba en la lista, así que los dos quedan vacíos, y la primera vez que aparece el juego lanza `NullReferenceException` en `Cloud.prepare()` :wbfacepalm:. Las últimas seis líneas de `Initialize` hacen esa pasada para la tuya.


### Los campos

Clona una nube vanilla y cambia `drop_id` y `color_hex`. A muchas nubes no les hace falta nada más.

| Campo | Qué hace |
| --- | --- |
| `color_hex` | El tinte. Esto define casi toda la personalidad de la nube |
| `max_alpha` | Cuán sólida se dibuja. `0.8` por defecto |
| `drop_id` | La gota que llueve. Cualquier id en `AssetManager.drops`, vanilla o tuyo |
| `cloud_action_1` / `cloud_action_2` | Dos acciones independientes, cada una con su propio temporizador |
| `interval_action_1` / `interval_action_2` | Segundos entre cada ejecución de la acción correspondiente |
| `speed_min` / `speed_max` | Velocidad de deriva. Cada nube elige un valor dentro de este rango |
| `path_sprites` | Lista de sprites. El juego escoge uno al azar por cada nube |
| `considered_disaster` | Si el juego la considera un desastre oficial |
| `normal_cloud` | La cataloga como clima ordinario en lugar de evento |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | El resplandor en el suelo, para nubes de fuego o lava |

## Qué es una acción de nube

Una `CloudAction` recibe la nube viva y no devuelve nada:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` es la acción estándar de vanilla: elige una casilla (tile) aleatoria bajo el sprite de la nube y genera un `drop_id` en ella. El 90% de las veces es la única acción que necesitas: la asignas a `cloud_action_1` y listo. Vago y correcto, mi combinación favorita :pepeOK:.

Para añadir algo especial, escribe tu propio método y asígnalo a `cloud_action_2`:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // Se ejecuta cada interval_action_2 segundos por cada nube de este tipo en el mapa.
    // Mantenlo liviano y tira una probabilidad para que no se dispare sin parar.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Luego configuras `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## Tus propios sprites

`path_sprites` es una lista, y cada entrada se carga exactamente como está escrita desde `GameResources/`. El juego escoge una textura por nube, razón por la cual vanilla proporciona tres variantes.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

El sprite de una nube es una mancha suave y grande en escala de grises. `color_hex` hace todo el trabajo, así que no la pintes del color final: déjala blanca y permite que el tinte se encargue :wbsmirk:.

## Poner una en el cielo

Las nubes se generan mediante el sistema de efectos, no a través de un gestor de nubes:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

Eso es exactamente lo que hace cada poder de nube vanilla. Envuélvelo en un poder divino (GodPower) y el jugador dispondrá de una herramienta para invocarla:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

Consulta **[Poderes divinos](#/nml/god-powers)** y **[Pestañas y botones de poderes](#/nml/power-buttons)** para la interfaz.

## Las nubes vanilla

Útiles como base para clonar y como recordatorio de lo que ya ofrece el juego:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Empieza desde una que ya funcione y modifica el color y la gota que arroja.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Recuerda que `clone()` registra el asset por ti: no llames a `add()` después.

## Sprites de cosecha propia

`path_sprites` es una lista de rutas bajo tu carpeta `GameResources/`, siguiendo las mismas reglas que el resto del mod. Consulta **[Sprites y recursos](#/nml/sprites-and-resources)**. El sprite de una nube es una masa difusa; `color_hex` se encarga del color, así que una silueta en blanco y negro suele ser más que suficiente.

> [!TIP] Nubes antes que desastres complejos
> Un "desastre" en las listas internas del juego suele ser simplemente una nube con `considered_disaster = true`. Antes de escribir un desastre completo con condiciones de aparición y temporizadores, comprueba si una nube que llueva tu gota ya consigue lo que buscabas :PES2_HmmmmThumbsUp:.
