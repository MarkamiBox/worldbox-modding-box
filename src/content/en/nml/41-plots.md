---
title: Plots
group: Game Content
subgroup: World & Civilizations
icon: :wbrebellion:
order: 180
---

# Plots :wbrebellion:

A **plot** is a scheme a ruler starts, pays for, and works on for a while: a rebellion, a new war, an alliance. When the progress bar is full, your code runs. Everything between "somebody could" and "somebody did" is the game's own machinery, which is the reason to use it: the player sees your scheme in the plot list, with its author, its progress and its banner, for free.

## Add one

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

A leader with ten coins, a city and nothing better to do may now throw an ember festival. When it finishes, everybody in the city cheers up with the happiness event from **[Kingdoms & factions](#/nml/kingdoms)**, and embers fall on the organiser, because this is still HelloBox.

> [!WARNING] `check_is_possible` is not optional
> `PlotAsset.checkIsPossible()` calls it without a null check, every time a leader considers your plot. Leave it out and the first leader to look at it throws `NullReferenceException`. If you have no condition, return `true`. Yes, even then.

> [!WARNING] The basic list is built at startup
> Leaders only ever pick from `plots_library.basic_plots` (plus their religion's rites). `linkAssets()` fills it with every plot marked `is_basic_plot`, once, before your mod loads. Setting the flag is not enough: add it to the list yourself.

## The fields

### Who may start it

| Field | What it does |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | The roles allowed. None set, nobody can |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Thresholds on the author |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Stat thresholds. They default to 2 |
| `money_cost` | Paid on start, unless the plot was forced by the player |
| `requires_diplomacy` / `requires_rebellion` | Only while that world law is on |
| `check_is_possible` | Your condition. Required |

### How it runs

| Field | What it does |
| --- | --- |
| `progress_needed` | How much work until it fires |
| `check_should_continue` | Checked while it runs. `false` cancels it |
| `action` | Runs when progress is full. Return `true` if it happened |
| `post_action` | Runs after a successful `action` |
| `try_to_start_advanced` | Replaces the default start, for plots that need a target: vanilla's rebellion sets `target_kingdom` here |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Checks that the target the plot was started against is still alive |

### How it looks

| Field | What it does |
| --- | --- |
| `path_icon` | Its icon in the plot list and on its banner |
| `group_id` | The category: `diplomacy`, `culture`, `rites_wrathful`, `rites_summoning`, `rites_merciful` |
| `pot_rate` | Weight against the other possible plots |
| `is_basic_plot` | Any leader may try it. Otherwise it only happens as a religion's rite, see **[Religion traits](#/nml/religion-traits)** |

## The text

A plot has three keys: its name, the line that describes the one in progress, and the general description. `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` and `$target_kingdom$` are filled in for you in the second one.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Test by forcing it
> Waiting for a leader to pick your plot on their own takes a while. Select a unit and start the plot yourself from the plots in its window: the unit still needs one of the allowed roles, and `check_can_be_forced` (optional) decides whether the button lights up, but a forced plot costs nothing. It is the fastest way to see your `action` run :PES2_EvilPlan:.
