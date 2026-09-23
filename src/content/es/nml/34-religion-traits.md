---
title: Rasgos religiosos
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbpray:
order: 108
---

# Rasgos religiosos :wbpray:

Una **religión** pertenece a ciudades y reinos, se expande mediante la conversión, escribe libros y puede oficiar **ritos**: complots que alteran el mundo y que sus creyentes intentan consumar por iniciativa propia. Un rasgo religioso es una creencia individual.

| | |
| --- | --- |
| Biblioteca | `AssetManager.religion_traits` |
| Clase | `ReligionTrait` |
| Grupos | `AssetManager.religion_trait_groups`, clase `ReligionTraitGroupAsset` |
| Propietario en ejecución | `Religion`, en `World.world.religions` |
| Prefijo de traducción | `religion_trait_` |
| Carpeta de iconos por defecto | `ui/Icons/religion_traits/` |

> [!WARNING] Las estadísticas de religión no llegan a las unidades
> Este es el único sistema de rasgos cuyo `base_stats` nunca aterriza en un `Actor`. `Actor.updateStats()` fusiona subespecies, clanes, idiomas y culturas. **La religión no está en esa lista.**
>
> Por tanto, un rasgo religioso altera el mundo mediante lo que *hace* (un rito, una transformación, un hook de acción), no a través de números. Escribir `base_stats["damage"] = 10` en uno es una operación inerte, y representa la tarde perdida más habitual en esta página :PES4_BigSad:.

## Registrar uno

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // el rito que los fieles pueden intentar
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```


> [!WARNING] `spawn_random_trait_allowed` se lee una sola vez, al inicio
> Las nuevas religiones eligen sus rasgos iniciales de un grupo que `BaseTraitLibrary.linkAssets()` construye mientras se carga el juego, antes de que tu mod exista. Establecer la bandera en tu rasgo no cambia nada por sí solo: tu rasgo nunca estará en ese grupo y nunca aparecerá por casualidad en un fundador. Agrégalo tú mismo, con el peso que usa el juego vanilla:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.religion_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` es `protected`, por lo que compila contra el ensamblado publicitado con el que NML ya compila tu mod. `spawn_random_rate` tiene un valor predeterminado de `5`: auméntalo y el rasgo aparecerá con más frecuencia.

## Ritos: el campo `plot_id`

Un rasgo religioso con un `plot_id` se convierte en un **rito**. La religión almacena sus ritos en `possible_rites`, y los líderes y sacerdotes intentan llevarlos a cabo cuando se satisfacen las condiciones del complot.

```csharp
trait.plot_id = "summon_meteor_rain";
```

El identificador apunta a `AssetManager.plots_library`. Los ritos de vanilla reutilizan complots existentes - `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` - y puedes hacer lo mismo, o registrar tu propio `PlotAsset` previamente.

El complot determina quién puede iniciarlo y cuán arduo resulta:

| Campo de PlotAsset | Qué hace |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Quién puede iniciarlo |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Requisitos de atributos |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Requisitos de nivel y renombre |
| `progress_needed`, `money_cost` | Duración y coste monetario |
| `pot_rate`, `rarity` | Con qué frecuencia lo elige la IA |
| `check_is_possible`, `check_should_continue` | Tus condiciones personalizadas |

## Transformaciones: el campo `transformation_biome_id`

El otro campo exclusivo de los rasgos de religión. Marca el rasgo como una transformación e indica el bioma que la fe propaga por el entorno:

```csharp
trait.transformation_biome_id = "biome_desert";
```

Vanilla lo utiliza para `sands_of_ruin` (desierto), `shadowroot` (corrupción), `echo_of_the_void` (singularidad), `infernal_rot` (infernal) y `cosmic_radiation` (páramo). Una religión con uno de estos rasgos reescribe paulatinamente el terreno donde moran sus creyentes, lo cual supone el mayor impacto visual que un solo rasgo puede provocar en el juego.

## Hacer que *haga* algo

Puesto que las estadísticas no surten efecto, los hooks de acción son la vía para que un rasgo religioso justifique su existencia. Son los mismos que comparte cualquier rasgo:

```csharp
// cada pocos segundos, sobre cada fiel
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// cuando un fiel muere
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

Un rasgo religioso también puede otorgar un hechizo o una decisión, lo cual suele encajar mucho mejor que un temporizador:

```csharp
trait.addSpell("hello_bolt");           // consulta Proyectiles, hechizos y efectos
trait.addDecision("burn_tumors");       // una decisión de IA que los fieles pueden tomar
```

## Los grupos de vanilla

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Tu propia pestaña: consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**, con `AssetManager.religion_trait_groups` y `ReligionTraitGroupAsset`.

## Los textos

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Asignar el rasgo

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

Una `Religion` también expone `cities`, `kingdoms`, `books` y `possible_rites`, que suele ser exactamente lo que querrás consultar cuando tu código necesite saber en qué anda metida una fe.

> [!TIP] Los ritos son la clave
> Una religión que solo modifica números es invisible. Una religión cuyos sacerdotes invocan periódicamente una lluvia de meteoritos es lo que los jugadores capturan en vídeo y comparten. Invierte tu tiempo en `plot_id` :aPES_Flames:.
