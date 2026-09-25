---
title: Complots
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbrebellion:
order: 180
---

# Complots :wbrebellion:

Un **complot** (plot) est un projet qu'un dirigeant initie, finance et développe pendant un certain temps : une rébellion, une nouvelle guerre (war), une alliance. Lorsque la barre de progression est pleine, votre code s'exécute. Tout ce qui sépare "quelqu'un pourrait" de "quelqu'un l'a fait" est géré par le moteur du jeu, et c'est tout l'intérêt de l'utiliser : le joueur voit votre complot dans la liste, avec son auteur, sa progression et sa bannière, sans surcoût.

## En ajouter un

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
                check_is_possible = (Actor pActor) => pActor != null && pActor.isAlive() && pActor.hasCity() && !pActor.city.isInDanger(),
                check_should_continue = (Actor pActor) => pActor != null && pActor.isAlive() && pActor.hasCity(),

                // runs once, when the progress bar is full
                action = (Actor pActor) =>
                {
                    if (pActor == null || !pActor.isAlive()) return false;
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

Un dirigeant avec dix pièces, une ville et du temps libre peut désormais organiser un festival de braises. Lorsqu'il se termine, tous les habitants de la ville voient leur moral remonter grâce à l'événement de bonheur de **[Royaumes et factions](#/nml/kingdoms)**, et des braises pleuvent sur l'organisateur, car nous sommes toujours dans HelloBox.

> [!WARNING] `check_is_possible` n'est pas optionnel
> `PlotAsset.checkIsPossible()` l'appelle sans vérifier la présence de valeurs nulles, chaque fois qu'un dirigeant examine votre complot. Si vous l'omettez, le premier souverain qui l'évalue provoquera une `NullReferenceException`. Si vous n'avez pas de condition particulière, renvoyez simplement `true`. Oui, même dans ce cas.

> [!WARNING] La liste de base est construite au démarrage
> Les dirigeants ne choisissent que parmi `plots_library.basic_plots` (en plus des rites de leur religion). `linkAssets()` remplit cette liste avec tous les complots marqués `is_basic_plot` une seule fois, avant le chargement de votre mod. Définir le drapeau ne suffit pas : ajoutez-le vous-même à la liste.

## Les champs

### Qui peut le déclencher

| Champ | Ce qu'il fait |
| --- | --- |
| `can_be_done_by_king` / `can_be_done_by_leader` / `can_be_done_by_clan_member` | Les rôles autorisés. Si aucun n'est défini, personne ne peut le lancer |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Seuils requis sur l'auteur |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Seuils de statistiques (stats). Valeur par défaut : 2 |
| `money_cost` | Coût au démarrage, sauf si le complot est forcé par le joueur |
| `requires_diplomacy` / `requires_rebellion` | Disponible uniquement tant que cette loi mondiale est active |
| `check_is_possible` | Votre condition de lancement. Obligatoire |

### Déroulement du complot

| Champ | Ce qu'il fait |
| --- | --- |
| `progress_needed` | Quantité de travail nécessaire pour qu'il aboutisse |
| `check_should_continue` | Vérifié pendant son exécution. `false` l'annule |
| `action` | S'exécute lorsque la jauge est pleine. Renvoyez `true` s'il a réussi |
| `post_action` | S'exécute après une `action` réussie |
| `try_to_start_advanced` | Remplace le démarrage par défaut pour les complots avec cible : la rébellion vanilla y assigne `target_kingdom` |
| `check_target_actor`, `check_target_city`, `check_target_kingdom`... | Vérifie que la cible du complot est toujours en vie |

### Aspect visuel

| Champ | Ce qu'il fait |
| --- | --- |
| `path_icon` | Son icône dans la liste des complots et sur sa bannière |
| `group_id` | La catégorie, depuis `plot_category_library` : `diplomacy`, `rites_wrathful`, `rites_summoning`, `rites_merciful`, `culture`, `language`, `religion`, `rites_various`, `plots_others` |
| `pot_rate` | Poids par rapport aux autres complots possibles |
| `is_basic_plot` | Tout dirigeant peut le tenter. Sinon, il n'apparaît qu'en tant que rite religieux, voir **[Traits de religion](#/nml/religion-traits)** |

### Une catégorie à vous

Les catégories sont des `PlotCategoryAsset` dans `AssetManager.plot_category_library`, et ce sont elles qui divisent la fenêtre des complots en sections. Le même petit `BaseCategoryAsset` qu'un onglet de trait (`id`, `name`, `color`, `show_counter`, voir **[Groupes de traits et onglets](#/nml/trait-groups)**), plus un champ qui lui est propre :

| Champ | Ce qu'il fait |
| --- | --- |
| `plot_retry_action` | Demandé pendant qu'une unité travaille sur un complot de cette catégorie. `true` signifie "pas maintenant, réessaie plus tard". Le vanilla l'utilise pour attendre que les listes du royaume, de la ville ou de la religion soient disponibles |

```csharp Mods/HelloBox/Code/HelloPlots.cs
public const string CATEGORY = "hello_plots";

// before the plots that point at it
if (!AssetManager.plot_category_library.has(CATEGORY))
{
    AssetManager.plot_category_library.add(new PlotCategoryAsset
    {
        id = CATEGORY,
        name = "plot_group_" + CATEGORY,   // the locale key, not the text
        color = "#FF9A3C",
        show_counter = false,
        // borrow vanilla's: it already knows which lists to wait for
        plot_retry_action = PlotCategoryLibrary.culturePlotsRetryAction
    });
}
```

Ensuite `group_id = HelloPlots.CATEGORY` sur le festival, et `"plot_group_hello_plots": "HelloBox"` dans le fichier de locale. La fenêtre des complots construit ses sections à partir de la liste de la bibliothèque, donc la nouvelle apparaît sans aucun travail d'UI.

> [!WARNING] La catégorie doit exister
> Le jeu récupère la catégorie d'un complot avec `get()` et lit `plot_retry_action` dessus sans vérification de nullité, chaque fois qu'une unité portant le complot revérifie sa tâche. Un `group_id` que personne n'a enregistré, c'est une `NullReferenceException` en plein milieu de l'IA, et elle revient sans cesse :PESgn_ToughLuck:.

## Les textes

Un complot utilise trois clés de texte : son nom, la ligne décrivant le complot en cours et la description générale. `$initiator_actor$`, `$initiator_city$`, `$initiator_kingdom$` et `$target_kingdom$` sont automatiquement remplacés dans la deuxième.

```json Mods/HelloBox/Locales/en.json
{
  "plot_hello_ember_festival": "Ember Festival",
  "plot_hello_ember_festival_info": "$initiator_actor$ is organising an ember festival in $initiator_city$.",
  "plot_hello_ember_festival_info_base": "A city celebrates, and something falls from the sky."
}
```

> [!TIP] Tester en forçant le complot
> Attendre qu'un dirigeant choisisse spontanément votre complot peut prendre du temps. Sélectionnez une unité et lancez le complot vous-même depuis l'onglet complots de sa fenêtre : l'unité doit toujours posséder l'un des rôles autorisés et `check_can_be_forced` (optionnel) décide si le bouton s'allume, mais forcer un complot ne coûte rien. C'est le moyen le plus rapide de voir votre `action` s'exécuter :PES2_EvilPlan:.
