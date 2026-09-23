---
title: Rasgos del reino
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbcrown:
order: 114
---

# Rasgos del reino :wbcrown:

Un **rasgo del reino** es una política de estado. No es una creencia ni un linaje: es una directriz promulgada por la corona que rige sobre todo el reino.

Vanilla solo recurre a este sistema para una sola cosa: los tipos impositivos. Por ello es el más pequeño y desierto de los siete sistemas de rasgos, y en consecuencia, el rincón más propicio para idear contenido nuevo. No hay competencia por este espacio.

| | |
| --- | --- |
| Biblioteca | `AssetManager.kingdoms_traits` |
| Clase | `KingdomTrait` |
| Grupos | `AssetManager.kingdoms_traits_groups`, clase `KingdomTraitGroupAsset` |
| Propietario en ejecución | `Kingdom`, en `World.world.kingdoms` |
| Prefijo de traducción | `kingdom_trait_` |
| Carpeta de iconos por defecto | `ui/Icons/kingdom_traits/` |

> [!WARNING] Las estadísticas del reino no llegan a las unidades
> Al igual que con la religión, `kingdom.base_stats` nunca se fusiona en un `Actor`. Los números a nivel de reino visibles en partida provienen de las **estadísticas personales del monarca** (`king.stats["cities"]` y análogas), no del bloque de rasgos del reino.
>
> De este modo, un rasgo del reino moldea la nación mediante sus campos propios y a través de código, no vía `base_stats`.

## Los campos de impuestos

Los tres campos exclusivos de los rasgos del reino, y todo lo que vanilla hace con este sistema:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Campo | Qué hace |
| --- | --- |
| `is_local_tax_trait` | Este rasgo define el tipo impositivo **local** del reino |
| `is_tribute_tax_trait` | Este rasgo define el tipo de **tributo** del reino |
| `tax_rate` | La tasa en sí, expresada como fracción |

El reino recalcula ambas tasas desde cero cada vez que sus rasgos varían: parte del valor por defecto en `SimGlobals`, recorre sus rasgos y permite que cada rasgo coincidente **sobrescriba** la cifra.

> [!WARNING] El último gana, declara siempre tus opuestos
> Los rasgos fiscales no se acumulan. Si un reino acumula dos rasgos `is_local_tax_trait`, el que aparezca más tarde en su colección se impondrá silenciosamente, dependiendo del orden de iteración.
>
> Cada rasgo fiscal de vanilla declara al otro como opuesto mutuo por esta misma causa. Haz lo propio en ambos sentidos, o tu tasa impositiva surtirá efecto solo de forma intermitente :PES5_HmmmmNo:.

## Registrar uno adecuadamente

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```


> [!WARNING] `spawn_random_trait_allowed` se lee una sola vez, al inicio
> Los nuevos reinos eligen sus rasgos iniciales de un grupo que `BaseTraitLibrary.linkAssets()` construye mientras se carga el juego, antes de que tu mod exista. Establecer la bandera en tu rasgo no cambia nada por sí solo: tu rasgo nunca estará en ese grupo y nunca aparecerá por casualidad. Agrégalo tú mismo, con el peso que usa el juego vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` es `protected`, por lo que compila contra el ensamblado publicitado con el que NML ya compila tu mod. `spawn_random_rate` tiene un valor predeterminado de `5`: auméntalo y el rasgo aparecerá con más frecuencia.

## Crear una política que realmente haga algo

Dado que `base_stats` queda descartado, un rasgo del reino justifica su presencia de dos formas:

**Una decisión**, la opción más ordenada:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**Un parche de Harmony que lea el rasgo**, que es el camino para erigir un auténtico sistema de decretos reales. Parchea el método de consulta del comportamiento monárquico y comprueba allí los rasgos del reino:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

Este es el patrón estándar para toda política de reino que no sea un tipo impositivo: el rasgo actúa como interruptor y tu parche implementa la conducta. Consulta **[Parches de Harmony](#/nml/harmony-patches)**.

## Los grupos de vanilla

`tribute` · `local_tax` · `miscellaneous` · `fate`

Cuatro grupos, dos de los cuales componen el dúo impositivo. Si planeas más de una o dos políticas, créales su propia pestaña; consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**, con `AssetManager.kingdoms_traits_groups` y `KingdomTraitGroupAsset`.

## Los textos

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Asignar el rasgo

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

El asset de reino a partir del cual se constituyó una facción es un elemento independiente, consulta **[Reinos y facciones](#/nml/kingdoms)**.

> [!TIP] La habitación vacía
> Seis de los siete sistemas de rasgos rebosan de contenido vanilla que debes sortear. Este solo contiene cinco rasgos. Si buscas un mod que parezca nativo del juego y no colisione con nada, diseñar decretos reales es el camino más directo :PES2_Cash:.
