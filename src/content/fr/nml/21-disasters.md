---
title: Catastrophes
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbmeteorite:
order: 184
---

# Catastrophes :wbmeteorite:

Une catastrophe est un événement que le monde s'inflige à lui-même : une tornade, une vague de chaleur, une météorite. Le jeu tire au sort leur apparition au fil du temps, donc contrairement à un pouvoir divin, **personne n'a besoin de cliquer sur quoi que ce soit**. Vous fixez les conditions, le monde fait le reste.

## En ajouter une

```csharp Mods/HelloBox/Code/HelloDisasters.cs
namespace HelloBox
{
    public static class HelloDisasters
    {
        public const string EMBER_STORM = "hello_ember_storm";
        public const string EMBER_STORM_LOG = "disaster_hello_ember_storm";

        public static void Initialize()
        {
            if (AssetManager.disasters.has(EMBER_STORM)) return;

            // The line in the world log. world_log below is the id of this asset, not a text key.
            if (!AssetManager.world_log_library.has(EMBER_STORM_LOG))
            {
                WorldLogAsset log = AssetManager.world_log_library.clone(EMBER_STORM_LOG, "$basic_disaster$");
                log.locale_id = "worldlog_disaster_hello_ember_storm";
                log.path_icon = "ui/Icons/iconHelloDisaster";
            }

            DisasterAsset emberStorm = new DisasterAsset
            {
                id = EMBER_STORM,
                rate = 4,                      // weight: how often it is picked vs other disasters
                chance = 0.5f,                 // and then a coin flip on top
                min_world_population = 100,    // don't ruin an empty world
                min_world_cities = 1,
                world_log = EMBER_STORM_LOG,
                type = DisasterType.Nature
            };

            emberStorm.action = (DisasterAsset pAsset) =>
            {
                WorldTile first = null;

                // 40 embers on random tiles. tiles_list is every tile in the world.
                for (int i = 0; i < 40; i++)
                {
                    WorldTile tile = World.world.tiles_list[Randy.randomInt(0, World.world.tiles_list.Length)];
                    if (tile == null) continue;
                    if (first == null) first = tile;
                    World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
                }

                // one line in the log, pointing at where it started
                if (first != null) WorldLog.logDisaster(pAsset, first);
            };

            AssetManager.disasters.add(emberStorm);
        }
    }
}
```

Enregistrez-le dans `Main.cs` (voir **[Le mod complet](#/nml/all-together)**), chargez un monde avec au moins une ville et cent unités, et patientez. Au bout d'un moment, le ciel se mettra à faire pleuvoir des braises de lui-même :wbfireskull:.

### Les champs

`rate` et `chance` sont les deux que vous ajusterez le plus. L'avertissement en bas de page explique pourquoi.

| Champ | Ce qu'il fait |
| --- | --- |
| `rate` | Poids dans le tirage. Plus il est haut, plus il sort souvent par rapport aux autres |
| `chance` | Un second jet une fois qu'il a été choisi |
| `min_world_population` / `min_world_cities` | Conditions avant qu'il puisse même se produire |
| `type` | `DisasterType.Nature`, `Other`, … |
| `world_log` | L'id d'un `WorldLogAsset` : la ligne dans le journal du monde. **Pas** une clé de traduction, voir plus bas |
| `action` | Votre code. C'est ça, la catastrophe |
| `spawn_asset_unit` + `units_min`/`units_max` | Raccourci pour "fais apparaître N de cette créature" |
| `max_existing_units` | Ne plus en faire apparaître si autant existent déjà |
| `ages_allow` / `ages_forbid` | La limite à certains âges du monde, par exemple seulement pendant l'Âge des Cendres |

La limitation à un âge se fait après la construction de l'asset :

```csharp
emberStorm.ages_allow.Add("age_ash");
emberStorm.ages_allow.Add("age_chaos");
```

## Faire apparaître des créatures sans code

```csharp
DisasterAsset wolves = new DisasterAsset
{
    id = "hello_wolf_year",
    rate = 2,
    chance = 0.3f,
    min_world_cities = 2,
    world_log = "disaster_hello_wolf_year",
    type = DisasterType.Other,

    // spawn 4 to 8 wolves, but only if the world has fewer than 40
    spawn_asset_unit = "wolf",
    units_min = 4,
    units_max = 8,
    max_existing_units = 40
};

// the game calls action without checking it: point it at the vanilla spawner
wolves.action = AssetManager.disasters.simpleUnitAssetSpawnUsingIslands;

AssetManager.disasters.add(wolves);
```

"Sans code" est presque vrai. Une catastrophe a **toujours** besoin d'une `action`, car le tirage du jeu l'appelle sans vérification de nullité : laissez-la vide et dès que la catastrophe est sélectionnée, vous aurez une `NullReferenceException`. Les catastrophes de créatures du jeu de base pointent vers `simpleUnitAssetSpawnUsingIslands`, qui lit `spawn_asset_unit`, `units_min`, `units_max` et `max_existing_units`, et écrit la ligne de journal pour vous. Le vôtre peut faire de même.

## La ligne dans le journal du monde

`world_log` n'est pas directement le texte. C'est l'**identifiant d'un `WorldLogAsset`** dans `AssetManager.world_log_library`, et cet asset pointe vers la clé de texte. Si vous renseignez un ID inexistant, au moment d'enregistrer l'événement, `WorldLog.logDisaster()` construit un message autour de `null` et lève une `NullReferenceException` :wbfacepalm:.

Les catastrophes vanilla clonent un modèle unique, `$basic_disaster$`, qui possède déjà la couleur d'avertissement et le groupe "disasters". C'est ce que fait `HelloDisasters` plus haut :

```csharp
WorldLogAsset log = AssetManager.world_log_library.clone("disaster_hello_ember_storm", "$basic_disaster$");
log.locale_id = "worldlog_disaster_hello_ember_storm";   // the text key
log.path_icon = "ui/Icons/iconHelloDisaster";            // the icon next to the line
```

Ensuite, il faut écrire la ligne. Les générateurs vanilla appellent `WorldLog.logDisaster(pAsset, tile)` automatiquement. Une `action` personnalisée ne le fait pas seule, donc la vôtre l'appelle explicitement avec la case de départ de la tempête : c'est l'endroit vers lequel le bouton "aller sur place" du journal sautera.

| Champ de `WorldLogAsset` | Ce qu'il fait |
| --- | --- |
| `locale_id` | La clé de texte. Utilise l'ID si laissé vide |
| `path_icon` | L'icône en début de ligne |
| `color` | La couleur de la ligne. Le modèle utilise la couleur d'alerte |
| `group` | L'onglet de filtre du journal du monde auquel elle est rattachée |
| `random_ids` | Pioche au hasard parmi plusieurs variantes : `<locale_id>_1`, `_2`... |

L'exemple des loups nécessite les deux mêmes éléments : son propre asset de log cloné sous `disaster_hello_wolf_year` et le texte `worldlog_disaster_hello_wolf_year`. Le générateur vanilla écrira la ligne automatiquement.

```json Mods/HelloBox/Locales/en.json
{
  "worldlog_disaster_hello_ember_storm": "Embers are falling from the sky!"
}
```

Rédigez-le comme un titre de journal, pas comme une description descriptive. "Des braises tombent du ciel" vaut mieux que "un événement lié aux braises a commencé". C'est la phrase que le joueur lira dans le journal du monde.

> [!WARNING] Testez avec des probabilités boostées
> `rate = 4, chance = 0.5f` signifie que vous pourriez attendre vingt minutes avant de voir votre catastrophe se déclencher. Pendant le développement, augmentez fortement le `rate` et passez les minimums à zéro, puis remettez les vraies valeurs avant de publier :PES2_EvilPlan:.
