---
title: Complots
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbrebellion:
order: 180
---

# Complots :wbrebellion:

Un **complot** (plot) es un plan que un gobernante inicia, financia y desarrolla durante un tiempo: una rebelión, una nueva guerra, una alianza. Cuando la barra de progreso se llena, tu código se ejecuta. Todo lo que ocurre entre "alguien podría" y "alguien lo hizo" corre a cargo de la propia maquinaria del juego, y esa es la gran ventaja de usarlo: el jugador ve tu complot en la lista de intrigas, con su autor, su progreso y su estandarte, de forma totalmente nativa.

## Añadir uno

```csharp Mods/HelloBox/Code/HelloPlots.cs
namespace HelloBox
{
    public static class HelloPlots
    {
        public const string FESTIVAL = "hello_ember_festival";

        public static void Initialize()
        {
            if (AssetManager.plots_library.has(FESTIVAL)) return;

            PlotAsset festival = new PlotAsset
            {
                id = FESTIVAL,
                path_icon = "ui/Icons/iconHelloDrop",
                group_id = "culture",
                is_basic_plot = true,            // any leader may try it, no religion needed
                pot_rate = 2,                    // weight against the other plots
                min_level = 1,
                money_cost = 10,
                progress_needed = 40f,
                can_be_done_by_king = true,
                can_be_done_by_leader = true,
                needs_to_be_explored = false,

                // called with no null check: a plot without it crashes the first time anyone looks at it
                check_is_possible = (Actor pActor) => pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    City city = pActor.city;
                    if (city == null) return false;

                    foreach (Actor unit in city.units)
                    {
                        if (unit != null && unit.isAlive()) unit.changeHappiness(HelloPolitics.WARM);
                    }

                    WorldTile tile = pActor.current_tile;
                    if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                    return true;
                }
            };

            AssetManager.plots_library.add(festival);

            // linkAssets() sorted the basic plots into their own list at startup,
            // and that list is the only one leaders pick from
            AssetManager.plots_library.basic_plots.Add(festival);
        }
    }
}
```

Un líder con diez monedas, una ciudad y tiempo libre puede ahora organizar un festival de ascuas. Al terminar, todos los habitantes de la ciudad se alegran con el evento de felicidad de **[Reinos y facciones](#/nml/kingdoms)**, y caen ascuas sobre el organizador, porque esto sigue siendo HelloBox.

> [!WARNING] `check_is_possible` no es opcional
> `PlotAsset.checkIsPossible()` lo invoca sin comprobación de nulos cada vez que un líder evalúa tu complot. Si lo omites, el primer gobernante que lo mire lanzará una `NullReferenceException`. Si no tienes condiciones, devuelve simplemente `true`.

> [!WARNING] La lista básica se genera al iniciar el juego
> Los líderes solo eligen complots de `plots_library.basic_plots` (más los ritos de su religión). `linkAssets()` llena esa lista con todos los complots marcados con `is_basic_plot` una sola vez, antes de que tu mod cargue. Marcar el flag no basta: añade el complot tú mismo a la lista.

## Los campos

### Quién puede iniciarlo

| Campo | Qué hace |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | Roles permitidos. Si ninguno está activo, nadie podrá iniciarlo |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Requisitos mínimos del autor |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Umbrales de atributos. Su valor por defecto es 2 |
| `money_cost` | Coste al iniciar, salvo que el jugador fuerce el complot |
| `requires_diplomacy` / `requires_rebellion` | Solo disponible mientras esa ley mundial esté activa |
| `check_is_possible` | Tu condición de inicio. Obligatoria |

### Cómo se ejecuta

| Campo | Qué hace |
| --- | --- |
| `progress_needed` | Cuánto trabajo requiere hasta completarse |
| `check_should_continue` | Se comprueba periódicamente. Si devuelve `false`, se cancela |
| `action` | Se ejecuta cuando el progreso se llena. Devuelve `true` si tuvo éxito |
| `post_action` | Se ejecuta tras una `action` exitosa |
| `try_to_start_advanced` | Reemplaza el inicio estándar para complots con objetivo: la rebelión original fija `target_kingdom` aquí |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Comprueba que el objetivo del complot siga con vida |

### Aspecto visual

| Campo | Qué hace |
| --- | --- |
| `path_icon` | Su icono en la lista de complots y en su estandarte |
| `group_id` | La categoría: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | Peso frente a otros posibles complots |
| `is_basic_plot` | Cualquier líder puede intentarlo. De lo contrario, solo surge como rito religioso, ver **[Rasgos de religión](#/nml/religion-traits)** |

## El texto

Un complot tiene tres claves de texto: su nombre, la línea que describe el complot en curso y la descripción general. `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` y `$target_kingdom$` se rellenan automáticamente en la segunda.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Probar forzando el complot
> Esperar a que un líder elija tu complot por su cuenta puede llevar tiempo. Selecciona una unidad e inicia el complot manualmente desde la pestaña de complots de su ventana: la unidad aún necesita uno de los roles permitidos y `check_can_be_forced` (opcional) determina si el botón se ilumina, pero forzar un complot no cuesta dinero. Es la forma más rápida de ver tu `action` en funcionamiento :PES2_EvilPlan:.
