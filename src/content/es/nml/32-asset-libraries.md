---
title: Bibliotecas de assets
group: Contenido del juego
subgroup: Arquitectura y estadísticas
icon: :wbbrain:
order: 90
---

# Bibliotecas de assets :wbbrain:

Antes de que cualquiera de las páginas siguientes tenga sentido, necesitas esta. Absolutamente todo en WorldBox (un rasgo, un arma, un edificio, una casilla, una nube, un reino) es un **asset** dentro de una **biblioteca**, y cada biblioteca del juego es la misma clase con los mismos cuatro métodos.

Apréndelos una vez aquí y las siguientes treinta páginas se reducirán a: "¿qué biblioteca y qué campos?".

## Qué es una biblioteca

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // todo, en orden
    public Dictionary<string, T> dict;   // todo, indexado por id
}
```

Eso es todo. Una lista y un diccionario, ambos públicos, ambos a tu disposición para leer y modificar. `AssetManager` alberga 129 de ellos. Consulta **[Todas las bibliotecas de assets](#/nml/asset-index)** para ver el catálogo completo.

## Los cuatro métodos

```csharp
AssetManager.traits.has("hello_swift");            // ¿este id ya está ocupado?
AssetManager.traits.get("hello_swift");            // obtenerlo, o null
AssetManager.traits.add(myTrait);                  // registrar un asset nuevo
AssetManager.traits.clone("hello_new", "brave");   // copiar uno existente y registrar la copia
```

### `has(id)`

Devuelve `true` si el id ya está registrado. **La primera línea de cada `Initialize()` que escribas debería ser una de estas**:

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

Sin ella, cualquier recarga de mods registrará todo dos veces.

### `get(id)`

Devuelve el asset vivo en memoria, o `null` si no existe tal id. **No** lanza excepciones, por lo que el fallo por null estalla lejos del error inicial:

```csharp
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // siempre. todas y cada una de las veces.
```

Que `get` devuelva el objeto *vivo* es lo más potente de esta página. Significa que puedes alterar contenido vanilla sin reemplazarlo:

```csharp
// Haz a los dragones vanilla más resistentes sin tocar nada más de ellos.
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

Registra un asset nuevo. Ocurren tres cosas en su interior que debes conocer:

1. **Si el id ya está ocupado, el asset antiguo se elimina y el tuyo lo reemplaza**, dejando esto en el log:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   Así es como un mod rompe silenciosamente a otro. Usa prefijos en tus ids.
2. Se ejecuta `create()` sobre el asset.
3. **La biblioteca asigna la memoria de `base_stats`** (y `base_stats_meta` si corresponde). Por eso la regla universal de esta guía es "estadísticas siempre después de `add()`".

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- asigna el bloque de estadísticas
swift.base_stats["speed"] = 20f;       // <- seguro solo a partir de esta línea
```

Si alteras ese orden, provocarás el crash más común del modding de WorldBox:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

Copia cada campo serializable de `sourceId` en un objeto completamente nuevo, le asigna `newId` **y ejecuta `add()` sobre él**. Devuelve la copia resultante.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // modifica lo que te interese
shrine.base_stats["health"] = 200;         // ya asignado, porque add() ya se ejecutó
```

> [!WARNING] Jamás llames a `add()` después de `clone()`
> Un segundo `add()` elimina la primera copia, imprime `duplicate asset overwriting...` y la vuelve a agregar. Funciona, pero llena el log de ruido innecesario que dificulta detectar errores reales.

Clonar es la opción predeterminada idónea para cualquier cosa con más de diez campos: edificios, criaturas, objetos, casillas. Heredas una configuración funcional probada y solo necesitas comprender los campos que vas a alterar.

## Plantillas

Las bibliotecas mantienen assets a medio configurar cuyo id empieza con `$` o `_`. Están registrados en `dict` pero fuera de `list`, por lo que nunca aparecen en el juego; existen únicamente para ser clonados.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

Una plantilla casi siempre es mejor base de clonación que un asset terminado, porque no heredas la identidad del donante junto con su configuración interna. La excepción es el arte: clonar `human` te otorga sprites humanos, y una criatura visible siempre es mejor que una criatura correcta e invisible :PES4_AlrightThen:.

## Listar lo que existe

La forma más rápida de averiguar qué ids puedes clonar es imprimirlos en consola:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

Dos líneas y no volverás a adivinar un id a ciegas. `list` excluye plantillas; `dict.Keys` las incluye todas.

## Reordenar elementos

`list` es una `List<T>` estándar, y el juego dibuja pestañas y categorías en el orden de la lista. Puedes colocar tu asset exactamente donde quieras:

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Cuándo se ejecuta tu código

El juego construye las 129 bibliotecas al arrancar, luego ejecuta `post_init()` sobre ellas, y **después** NML carga tu mod. Dos consecuencias en las que la gente tropieza constantemente, yo incluido:

- **Todo lo que una biblioteca hace automáticamente en `post_init` ya ha pasado.** Los rasgos de actor, por ejemplo, reciben ahí un `path_icon` por defecto. El tuyo no, porque tu rasgo aún no existía. Ponlo tú.
- **Todos los assets vanilla ya existen cuando se ejecuta tu `OnModLoad`.** Así que `get("human")` funciona, `clone(..., "human")` funciona, y editar contenido vanilla en su sitio funciona. Nunca llegas demasiado pronto.

> [!NOTE] Parchear estos métodos no toca el contenido vanilla
> `has`, `get`, `add`, `clone` y `post_init` se ejecutan sobre las 129 bibliotecas durante el arranque del juego, antes de que NML cargue un solo mod. Un parche de Harmony sobre cualquiera de ellos solo afecta a las llamadas hechas *después* de que cargue tu mod. Nunca toca el registro vanilla que ya ocurrió para entonces. ¿Quieres contenido vanilla distinto? Cámbialo después con `get()`, como hace el resto de esta página.

## El patrón que utilizan todas las páginas siguientes

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. nunca registrar dos veces
            if (AssetManager.<library>.has(ID)) return;

            // 2. clonar si hay algo parecido, construir si no lo hay
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. modificar los campos que te interesen
            asset.some_field = true;

            // 4. estadísticas siempre al final
            asset.base_stats["damage"] = 10;
        }
    }
}
```

Cada página de assets en esta guía tiene esta misma estructura cambiando solo los nombres. Si alguna vez te pierdes, regresa aquí :PESgn_GoOn:.

## Cuatro reglas de oro para colgar frente a tu escritorio

1. **`has()` primero.** Nunca registres el mismo id dos veces.
2. **`clone()` ya llama a `add()`.** Nunca llames a ambos.
3. **`base_stats` solo existe tras `add()`.** Estadísticas siempre al final.
4. **Pon prefijos a tus ids.** `hello_swift`, nunca `swift`. Hay un único espacio de nombres compartido con todos los demás mods.
