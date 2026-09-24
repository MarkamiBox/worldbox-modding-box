---
title: Recursos y comida
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbtomato:
order: 182
---

# Recursos y comida :wbtomato:

Un recurso es todo aquello que una ciudad almacena, comercia, come o forja: trigo, pan, piedra, mitril, huesos, gemas. Viven en `AssetManager.resources` y representan la base de toda la economía: lo que cultivan las granjas, lo que hornean los panaderos, lo que necesitan los herreros y lo que come un ciudadano hambriento. Con esta economía, hasta el pan es una estructura de datos :PES2_Cash:.

## Clonar desde una plantilla

> [!WARNING] Pon `full_sprite_path` o el cargador revienta
> `path_gameplay_sprite` es solo la mitad. La librería construye `full_sprite_path` a partir de él en `post_init()`, una vez, durante la carga del juego, así que un recurso registrado por un mod se queda con `null` ahí. El precargador de sprites llama entonces a `getSpriteList(null)` y toda la carga muere con `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ y $TEMPLATE_STRATEGIC_MINERAL$ son los dos puntos de partida ideales.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // La libreria lo deriva en post_init(), que ya corrio. Ponlo tu mismo.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // lo que la unidad sostiene en sus manos

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## Los campos

### Qué es

| Campo | Qué hace |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Si una unidad lo consumirá como alimento |
| `wood`, `mineral` | Qué herramientas de recolección y empleos aplican |
| `path_icon` | El icono visible en inventarios y listas |
| `path_gameplay_sprite` | El sprite que la criatura sostiene en sus manos al transportarlo |

### Alimentación

| Campo | Qué hace |
| --- | --- |
| `restore_nutrition` | Nutrición recuperada |
| `restore_health` | Salud restaurada, como proporción |
| `restore_stamina`, `restore_mana`, `restore_happiness` | El resto de barras de necesidades |
| `give_experience` | Experiencia otorgada al comerlo |
| `tastiness`, `favorite_food_chance` | Probabilidad de que una unidad lo adopte como comida favorita |
| `diet` | Qué dietas biológicas pueden consumirlo |
| `eat_action` | Tu propio código ejecutado cuando alguien lo come |
| `give_trait_id`, `give_status_id`, `give_chance` | Rasgos o estados aplicados al consumirlo |

### Fabricación y transporte

| Campo | Qué hace |
| --- | --- |
| `ingredients`, `ingredients_amount` | Ingredientes necesarios para cocinarlo o forjarlo |
| `produce_min` | Cuánto rinde una única orden de producción |
| `mine_rate` | Velocidad a la que se extrae o cosecha |
| `drop_max`, `drop_per_mass` | Cuánto suelta cuando su fuente es destruida |
| `stack_size`, `storage_max`, `maximum` | Límites de transporte y almacenamiento |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Comportamiento en suministros militares |
| `trade_cost`, `trade_give`, `trade_bound` | Comportamiento en rutas comerciales |
| `money_cost`, `loot_value` | Valor monetario y valor como botín |

## Los recursos vanilla

Conviene conocerlos, ya que utilizar uno existente suele ser infinitamente más práctico que añadir uno nuevo:

**Comida e ingredientes:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Estratégicos y varios:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## Tus propios sprites

Un recurso tiene dos ilustraciones distintas y se resuelven de forma **completamente diferente**. Aquí tropiezan muchísimos creadores: Y a ti también te va a pillar una vez.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- el icono de inventario, en la raíz
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- lo que la unidad lleva en la mano
```

```csharp
cake.path_icon = "iconHelloCake";        // se carga tal cual se escribe
cake.path_gameplay_sprite = "hello_cake";   // se carga automáticamente como items/resources/hello_cake
```

`path_icon` es una ruta directa y vanilla suele escribir nombres simples, por lo que el archivo reside en la raíz de `GameResources/`. Para `path_gameplay_sprite`, el juego añade el prefijo `items/resources/` por ti. Si escribes la carpeta tú mismo, el juego buscará en `items/resources/items/resources/...` y no encontrará nada.

## Conectar un recurso al mundo

Un recurso permanece inerte hasta que algo lo produce. Los tres lugares clave son:

```csharp
// 1. Una criatura lo entrega al ser descuartizada o morir.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. Un edificio lo entrega al ser cosechado.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. Una cultura lo produce en sus ciudades.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

`pNewList: true` en la primera llamada indica: "inicia una lista limpia en vez de añadir elementos a la lista heredada del donante". Si lo olvidas tras un clon, tu criatura soltará tanto los recursos del donante como los tuyos.

## Los materiales no son recursos

El **material** de un objeto (hierro, acero, mitril) es un `ItemAsset` en una biblioteca de materiales, no un `ResourceAsset`, aunque fabricar con dicho material cueste recursos. Esta es una de las áreas donde la nomenclatura del juego se presta a confusión. Consulta **[Objetos personalizados](#/nml/custom-items)**.

El enlace entre ambos es el campo `cost_resources` en el material, que especifica los identificadores de recursos y cantidades requeridas.

> [!TIP] Añade la receta, no el ingrediente
> Un nuevo *ingrediente* necesita una fuente: algo que lo cultive, un bioma que lo genere, un empleo que lo coseche. Una nueva *receta* solo necesita ingredientes ya existentes y se acopla de inmediato a las panaderías y rutas de comercio en funcionamiento. Lo primero toma una semana; lo segundo, una tarde :PES_ChillPill:.
