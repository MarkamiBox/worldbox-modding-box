---
title: Rasgos culturales
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbtiphat:
order: 106
---

# Rasgos culturales :wbtiphat:

Una **cultura** (culture) representa los hábitos y costumbres compartidos por un grupo de ciudades. Decide qué construyen, qué forjan, cómo heredan, qué leen y qué valores aprecian. Un rasgo (trait) cultural es uno de esos hábitos.

De los siete sistemas de rasgos, el cultural es el de mayor alcance. Una cultura se expande con las ciudades, sobrevive a su fundador y fusiona sus estadísticas (stats) en cada unidad que pertenezca a ella. Si buscas un mod cuyo impacto resuene por el mundo a lo largo de una hora de partida, esta es la biblioteca adecuada. Gran alcance, gran responsabilidad :PES5_Menace:.

| | |
| --- | --- |
| Biblioteca | `AssetManager.culture_traits` |
| Clase | `CultureTrait` |
| Grupos | `AssetManager.culture_trait_groups`, clase `CultureTraitGroupAsset` |
| Propietario en ejecución | `Culture`, en `World.world.cultures` |
| Prefijo de traducción | `culture_trait_` |
| Carpeta de iconos por defecto | `ui/Icons/culture_traits/` |

## Registrar uno

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // mayor valor ordena hacia arriba en su grupo
                spawn_random_trait_allowed = false,  // nunca asignado al azar
                can_be_given = true,                 // el jugador puede añadirlo en el editor
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Advertencia abajo: esto alcanza a los granjeros tanto como a los soldados.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```


> [!WARNING] `spawn_random_trait_allowed` se lee una sola vez, al inicio
> Las nuevas culturas eligen sus rasgos iniciales de un grupo que `BaseTraitLibrary.linkAssets()` construye mientras se carga el juego, antes de que tu mod exista. Establecer la bandera en tu rasgo no cambia nada por sí solo: tu rasgo nunca estará en ese grupo y nunca aparecerá por casualidad en un fundador. Agrégalo tú mismo, con el peso que usa el juego vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.culture_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` es `protected`, por lo que compila contra el ensamblado publicitado con el que NML ya compila tu mod. `spawn_random_rate` tiene un valor predeterminado de `5`: auméntalo y el rasgo aparecerá con más frecuencia.

Todo lo explicado en **[Rasgos personalizados](#/nml/custom-traits)** aplica aquí también: `add()` antes de las stats, `path_icon` no se rellena solo, los identificadores llevan prefijo. Lo que sigue es lo que hace únicos a los rasgos culturales. Y es la parte divertida.

> [!WARNING] `base_stats` en un rasgo cultural afecta a todos
> `Actor.updateStats()` fusiona `culture.base_stats` en cada unidad de esa cultura. Cada unidad. Una doctrina de "+5 de daño" también armará a los panaderos.
>
> Si la bonificación solo debe beneficiar a ciertos miembros, no pongas nada en `base_stats` y fíltralo tú mismo en un Postfix de Harmony sobre `Actor.updateStats`, consulta **[Parches de Harmony](#/nml/harmony-patches)**. Si debe aplicarse a la cultura como colectivo y no a sus individuos, usa `base_stats_meta` en su lugar, consulta **[Referencia de estadísticas](#/nml/stats)**.

## Dirigir lo que forja una cultura

Este es el campo que tienen los rasgos culturales y ningún otro, y es la forma más limpia de hacer que una cultura *se sienta* diferente sin tocar un solo arma:

```csharp
trait.value = 10f;                       // qué tanto peso tiene la preferencia
trait.addWeaponSubtype("sword");         // preferir una clase entera de armas
trait.addWeaponSpecial("hello_relic");   // o un id específico de objeto
```

Ambos métodos auxiliares configuran `is_weapon_trait = true` por ti. El código de artesanía consulta las armas predilectas de la cultura cuando una ciudad decide qué fabricar; esto cambia el arma en la mano del soldado en lugar de alterar un mero número. `bow_lovers` y `spear_lovers` en vanilla funcionan exactamente así. Toda una cultura de fans de las lanzas, con dos líneas :PESgn_Noice:.

| Campo | Qué hace |
| --- | --- |
| `is_weapon_trait` | Marca el rasgo como preferencia armamentística |
| `related_weapon_subtype_ids` | Clases de armas preferidas. `addWeaponSubtype` añade aquí |
| `related_weapons_ids` | Identificadores de armas específicas preferidas. `addWeaponSpecial` añade aquí |
| `value` | Cuánto peso tiene la preferencia en la elección |

## Dirigir cómo construye una cultura

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Recibe un `PassableZoneChecker` y establece `town_layout_plan = true`. Así funcionan los rasgos de planificación urbana de vanilla: ciudades con columnas, ciudades repletas de caminos.

Es el hook más profundo de esta página y el más propenso a chocar con otro mod, ya que una cultura solo puede seguir un plan de diseño al mismo tiempo. Comprueba `town_layout_plan` en los rasgos que la cultura ya posea antes de dar por sentado que el tuyo es el único.

## Los grupos de vanilla

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Tu propia pestaña: consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**, con `AssetManager.culture_trait_groups` y `CultureTraitGroupAsset`.

## Los textos

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Asignar el rasgo

```csharp
// toda criatura de esta especie empieza con él
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// o en tiempo de ejecución, sobre culturas que ya existen
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` y `addTrait` reciben indistintamente el id en texto o el asset.

## Comprobar un rasgo cultural desde una unidad

`Actor` ofrece un atajo dedicado precisamente a esto, al ser una consulta tan habitual:

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] ¿Cultura o subespecie (subspecies)?
> Ambas se propagan, pero no por el mismo camino. Un rasgo **cultural** se expande con las ciudades y lo adopta cualquiera que se una a ellas. Un rasgo de **subespecie** se transmite por linaje genético y no puede transferirse de otro modo. "Los elfos disparan mejor porque así los criaron" es cultura; "los elfos disparan mejor por la agudeza de sus ojos" es subespecie. Consulta **[Rasgos de subespecies](#/nml/subspecies-traits)** :catnoted:.
