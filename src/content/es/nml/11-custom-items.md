---
title: Objetos personalizados
group: Contenido del juego
subgroup: Objetos y equipamiento
icon: :wbcrystalsword:
order: 120
---

# Objetos personalizados :wbcrystalsword:

Armas, armaduras, anillos y amuletos viven todos en `AssetManager.items` como `EquipmentAsset`.

Lo primero que hay que entender es que **no existe un objeto "espada" con un campo de material que elijas en tiempo de ejecución**. Existen `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Nueve assets individuales, cada uno con su propio coste, estadísticas y cadena de `material`. Lo mismo ocurre con cada pieza de armadura, arco y amuleto.

Por eso clonar no es solo el camino fácil aquí: es el único camino razonable.

## Las plantillas base

Los identificadores que comienzan con `$` son plantillas que contienen la configuración base para toda una clase de armas:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword` ya define `equipment_subtype`, `is_pool_weapon`, `pool_rate`, la animación de corte, las plantillas de nombre y `group_id`. Quieres todo eso.

## Crear un arma

> [!WARNING] Un arma sin ruta de sprite mata al cargador
> Para cada arma de pool el juego pone `path_gameplay_sprite` en `items/weapons/w_<id>` y `path_icon` en `ui/Icons/items/icon_<id>`. Lo hace en `post_init()`, durante su propia carga, así que tu arma todavía no está en la lista y los dos campos se quedan en `null`. El precargador llama entonces a `getSpriteList(null)` y la carga revienta con `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Ponlos tú. Apunta a tus propios archivos en `GameResources/`, o reutiliza un par de vanilla mientras pruebas el resto.

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] Registrado no es lo mismo que forjado
> Una ciudad elige qué forjar de `equipment_by_subtypes` (una lista por subtipo de arma), y las nuevas armas de botín se eligen de `pot_weapon_assets_all` y `pot_weapon_assets_unlocked`. `ItemLibrary.linkAssets()` llena estas listas al inicio del juego, antes de tu mod. Sin las cuatro líneas del final, tu arma existe y puede otorgarse por código, pero ningún herrero en el mundo la fabricará jamás :PES5_Hmmmm:. Las armaduras y accesorios usan `pot_equipment_by_groups_all` y `pot_equipment_by_groups_unlocked` (organizadas por `group_id`) en lugar de las dos reservas de armas.


## Los campos del asset

### Identity

| Campo | Lo que hace |
| --- | --- |
| `material` | Nombre del material. Parte del nombre visible y lo que el juego compara al mejorar equipo |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. Qué ranura ocupa |
| `equipment_subtype` | `sword`, `axe`, `bow`, … La clase de arma. Las culturas tienen preferencias de subtipo |
| `group_id` | Pestaña de categoría de equipo. Ver **[Grupos de rasgos y pestañas](#/nml/trait-groups)** |
| `attack_type` | Comportamiento cuerpo a cuerpo o a distancia |
| `quality` | La calidad mínima con la que puede aparecer |
| `rarity`, `pool_rate` | Con qué frecuencia la elige el generador |
| `is_pool_weapon` | Si entra en el repertorio general de armas |

### Coste y valor

| Campo | Lo que hace |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | La llamada que establece todos los costes juntos. Úsala en lugar de asignarlos por separado |
| `minimum_city_storage_resource_1` | La ciudad no la forjará por debajo de estas reservas |
| `equipment_value` | Cómo de buena cree la IA que es. Impulsa la decisión de "debería este soldado mejorar arma" |
| `durability`, `rigidity_rating` | Cuánto dura |

### Aspecto visual y estética

| Campo | Lo que hace |
| --- | --- |
| `path_gameplay_sprite` | El sprite en la mano de la criatura |
| `colored`, `animated` | Si se colorea, si está animado |
| `path_slash_animation` | El efecto de corte |
| `projectile` | Para armas a distancia, qué proyectil dispara. Ver **[Proyectiles, hechizos y efectos](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | Cómo se nombran sus versiones legendarias |

### Behaviour

| Campo | Lo que hace |
| --- | --- |
| `action_attack_target` | Se ejecuta en cada impacto acertado |
| `action_special_effect` + `special_effect_interval` | Se ejecuta periódicamente mientras está equipado |
| `item_modifier_ids` | Encantamientos que puede recibir. Ver **[Encantamientos de armas](#/nml/item-modifiers)** |
| `addSpell(id)` | Un hechizo que el portador puede lanzar |
| `addCombatAction(id)` | Un movimiento de combate que otorga |


## Un efecto mientras se sostiene

"Quien empuñe la Hoja de Ascuas se vuelve Rápido" suena como un rasgo en un objeto. Los objetos no llevan rasgos, pero sí ejecutan código con un temporizador mientras están equipados (`action_special_effect` de la tabla anterior), y un **estado** expira por sí solo. Por lo tanto, el objeto continúa reaplicando un estado corto, y cuando el objeto desaparece, el estado simplemente se agota:

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3 segundos, renovado cada segundo mientras se sostiene. Al soltar la hoja, desaparece
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

El estado necesita `allow_timer_reset = true` (el valor predeterminado para un nuevo `StatusAsset`, pero no para todos los vanilla desde los que podrías clonar), o reaplicarlo antes de tiempo no hace nada y expirará en medio del combate. En HelloBox, la hoja maldice a su propio portador, que es exactamente lo que haría una hoja de ascuas :wbfacepalm:.

Por qué no un rasgo: un rasgo permanece hasta que algo lo elimine, por lo que necesitarías un segundo temporizador para notar que la hoja ya no está y removerlo. Un estado se limpia solo.

## Tu propio sprite personalizado

Un objeto tiene dos piezas de arte, y son campos independientes:

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] Las armas necesitan una carpeta para LoadAll
> El precargador de armas del juego llama a `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, que ejecuta `Resources.LoadAll<Sprite>`. En NeoModLoader, `LoadAll` busca por nombre de carpeta. Si `path_gameplay_sprite` es `"items/weapons/w_hello_sword"`, NML busca un directorio en `GameResources/items/weapons/w_hello_sword/`. Si solo colocas un archivo suelto `w_hello_sword.png` sin la carpeta, `LoadAll` no encuentra ningún directorio, devuelve 0 sprites y el juego registra `Weapon Texture is Missing`. Colocar el sprite dentro de una carpeta con ese nombre resuelve el problema.

> [!NOTE] Las armas necesitan una carpeta para LoadAll
> El precargador de armas del juego llama a `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, que ejecuta `Resources.LoadAll<Sprite>`. En NeoModLoader, `LoadAll` busca por nombre de carpeta. Si `path_gameplay_sprite` es `"items/weapons/w_hello_sword"`, NML busca un directorio en `GameResources/items/weapons/w_hello_sword/`. Si solo colocas un archivo suelto `w_hello_sword.png` sin la carpeta, `LoadAll` no encuentra ningún directorio, devuelve 0 sprites y el juego registra `Weapon Texture is Missing`. Colocar el sprite dentro de una carpeta con ese nombre resuelve el problema.

> [!NOTE] Las armas necesitan una carpeta para LoadAll
> El precargador de armas del juego invoca `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, lo que ejecuta `Resources.LoadAll<Sprite>`. En NeoModLoader, `LoadAll` busca por nombre de carpeta. Si `path_gameplay_sprite` es `"items/weapons/w_hello_sword"`, NML busca un directorio en `GameResources/items/weapons/w_hello_sword/`. Si solo colocas un archivo suelto `w_hello_sword.png` sin la carpeta, `LoadAll` no encuentra nada, devuelve 0 sprites y el juego registra `Weapon Texture is Missing`. Colocar el sprite dentro de una carpeta con ese nombre soluciona el problema.

El sprite de un arma se dibuja a escala de la unidad y requiere un punto de pivote en el centro inferior (`PivotX: 0.5, PivotY: 0.0` en `sprites.json`) o flotará fuera de la mano (consulta **[Sprites y recursos](#/nml/sprites-and-resources)**).

Dejar cualquiera de los campos apuntando al valor vanilla (como `"items/weapons/w_sword_iron"`) cargará el arte original del juego, una forma fantástica de publicar tu primera arma :PESgn_Neat:.

## Una línea completa de materiales

El mismo dilema que con las criaturas: rara vez quieres un único objeto. Nueve materiales implican nueve assets, y nueve bloques duplicados implican nueve lugares donde corregir un error.

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## Los textos de localización

Los objetos se nombran de forma diferente a todo lo demás en esta guía, lo que confunde a todo el mundo. El nombre visible de un objeto se resuelve así:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

Así que la espada anterior, clonada de `$sword`, hereda `equipment_subtype = "sword"` y se muestra como **Espada** (la clave vanilla), no como tu id. Hay dos soluciones:

```csharp
blade.translation_key = "hello_sword_ember";   // tu propio nombre, conservando el subtipo espada
```

O dejar el nombre del subtipo intacto y dejar que el **material** hable, como hace el juego: cada espada se llama "Espada", y `sword_iron` se muestra como "Espada de hierro" gracias a su clave de material.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Clave | De dónde viene |
| --- | --- |
| `item_<subtype>` o tu `translation_key` | El nombre |
| `<id>_description` | La descripción emergente |
| `item_mat_<material>` | La palabra del material en el nombre |

Un material nuevo **siempre** necesita su clave `item_mat_`, o tu arma aparecerá con una clave sin traducir pegada delante de su nombre.

## Poner el arma en manos de una unidad

Un **asset** es la receta. Un **objeto** es la instancia física real que empuña una criatura concreta, con su rareza, modificadores y nombre. Dos pasos:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. construir un objeto real a partir de la receta
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. entregárselo - setItem elige la ranura adecuada según el equipment_type
actor.equipment.setItem(item, actor);
```

`generateItem` genera calidad y modificadores aleatorios exactamente como el botín del juego, por lo que el objeto que recibe la unidad nunca es idéntico al asset que registraste.

## Herramientas en mano

El martillo que blande un constructor y la cesta que lleva un recolector no son objetos de inventario. Son **herramientas de mano**: elementos puramente visuales, mostrados mientras una tarea lo indique y ocultados al finalizar.

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

Una tarea muestra su herramienta mediante `force_hand_tool`, por lo que la antorcha aparecerá siempre que una criatura ejecute la tarea de deambular de **[IA y comportamientos personalizados](#/nml/custom-ai)**.

> [!WARNING] Carga los fotogramas manualmente
> `UnitHandToolLibrary.loadSprites()` llena `gameplay_sprites` para cada herramienta al iniciar el juego. Una herramienta añadida después no tiene ninguno y la unidad sostendrá una mano vacía. La ruta se lee con `getSpriteList()`, por lo que debe ser una **carpeta** de fotogramas (`items/tools/tool_hello_torch/`), incluso para un único fotograma. Sin un pivote en `sprites.json`, la herramienta se posicionará en el centro de la imagen: adecuado para una antorcha, pero incorrecto para un mango largo.

| Campo | Qué hace |
| --- | --- |
| `path_gameplay_sprite` | La carpeta. El juego la autocompleta desde el ID: `items/tools/tool_<id>` |
| `animated` | Reproduce los fotogramas en bucle, como la taza de café |
| `colored` | La tiñe con el color del reino, como la bandera |

> [!TIP] Primero encantamientos, luego armas
> Un arma nueva requiere sprites, una línea de materiales, costes y balance. Un nuevo **modificador** son veinte líneas y se aplica a todas las armas del juego, incluidas las de otros mods. Si quieres que el juego se sienta diferente hoy mismo, lee **[Encantamientos de armas](#/nml/item-modifiers)** primero :PESgn_DoIt:.
