---
title: IA et comportements personnalisés
group: Contenu du jeu
subgroup: Acteurs, bâtiments et IA
icon: :wbgoldenbrain:
order: 144
---

# IA et comportements personnalisés :wbgoldenbrain:

Nous plongeons ici dans le grand bain. Tout le reste dans ce guide ajoute des *éléments et des données* au jeu. Cette section ajoute des **décisions** : ce qu'une créature choisit de faire ensuite, de sa propre initiative, indéfiniment, au sein d'un monde partagé avec des milliers d'autres.

## Comment le jeu réfléchit

Trois strates, du plus général au plus précis :

| Strate | Ce que c'est | Bibliothèque |
| --- | --- | --- |
| **Métier** (`ActorJob`) | L'occupation globale de la créature : "être un citoyen", "être un soldat" | `AssetManager.job_actor` |
| **Tâche** (`BehaviourTaskActor`) | Un objectif concret au sein d'un métier : "aller manger", "construire ceci" | `AssetManager.tasks_actor` |
| **Comportement** (`BehaviourActionActor`) | Une étape élémentaire d'une tâche, exécutée chaque tick, indiquant la suite | greffé sur une tâche |

Un métier regroupe des tâches, une tâche regroupe des comportements, et les comportements s'enchaînent dans l'ordre jusqu'à ce que l'un d'eux demande l'arrêt.

## Écrire un comportement

Un comportement est une classe dotée d'une unique méthode. Elle reçoit l'acteur, effectue une petite action et renvoie un `BehResult` :

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```
`PickTile` est tout l'intérêt de l'exercice : c'est la seule partie que le jeu ne fait pas déjà pour toi. Tout le reste du fichier, c'est de la tuyauterie.

> [!WARNING] `beh_tile_target` est internal
> Le champ dans lequel le behaviour écrit est marqué `internal` dans l'assembly du jeu, donc ceci compile contre une `Assembly-CSharp.dll` **publicized** (voir la note dans **[Effets de statut](#/nml/status-effects)**). Sans elle, le compilateur refuse la ligne et tu dois garder la cible dans ton propre champ :PES5_Noted:.


| Résultat | Signification |
| --- | --- |
| `BehResult.Continue` | Passer au comportement suivant dans cette tâche |
| `BehResult.Stop` | Terminé pour ce tick |
| `BehResult.RepeatStep` | Me réexécuter au prochain tick |
| `BehResult.Skip` | Sauter l'étape suivante |
| `BehResult.StepBack` | Revenir d'un cran en arrière |
| `BehResult.RestartTask` | Recommencer la tâche depuis le début |

## Relier une tâche et un métier

```csharp Mods/HelloBox/Code/HelloAI.cs
using ai.behaviours;   // BehaviourTaskActor, BehaviourActionActor, BehResult, the vanilla behaviours

namespace HelloBox
{
    public class BehHelloDrive : BehaviourActionActor
    {
        public override BehResult execute(Actor pActor)
        {
            if (pActor == null || !pActor.isAlive()) return BehResult.Stop;

            WorldTile target = HelloAI.PickTile(pActor);
            if (target == null) return BehResult.Stop;

            pActor.beh_tile_target = target;
            return BehResult.Continue;
        }
    }

    public static class HelloAI
    {
        public const string JOB = "hellobox_job";
        public const string TASK = "hellobox_drive";

        public static void Initialize()
        {
            BehaviourTaskActor drive = new BehaviourTaskActor
            {
                id = TASK,
                ignore_fight_check = true,        // don't let the combat system hijack the task
                locale_key = "task_unit_" + TASK
            };

            AssetManager.tasks_actor.add(drive);  // add first
            drive.setIcon("ui/Icons/iconHelloDrive");    // then decorate
            drive.addBeh(new BehHelloDrive());    // my decision
            drive.addBeh(new BehGoToTileTarget()); // the game's own pathing does the walking

            ActorJob job = new ActorJob { id = JOB };
            job.addTask(TASK);
            AssetManager.job_actor.add(job);
        }

        /** Where the creature should walk next. One random neighbour it can actually reach. */
        public static WorldTile PickTile(Actor pActor)
        {
            WorldTile from = pActor.current_tile;
            if (from == null) return null;

            // the game's own helper: a random neighbour that is not across water
            return from.getTileAroundThisOnSameIsland(from);
        }
    }
}
```

Remarquez le second comportement : **réutilisez les nœuds de base**. Le jeu possède déjà des comportements pour marcher vers une case, appliquer un statut, trouver un bâtiment ou attaquer une cible. Écrire la décision et emprunter l'exécution fait toute la différence entre un week-end et un mois de travail.

## Faire en sorte qu'une créature utilise votre métier

Aucun patch n'est nécessaire. L'IA de chaque acteur sollicite son prochain métier via un délégué : il vous suffit donc d'échanger ce délégué :

```csharp
// prendre le contrôle
pActor.ai.next_job_delegate = () => HelloAI.JOB;
pActor.ai.setTaskBehFinished();   // abandonner l'action en cours et redemander immédiatement

// rendre le contrôle
pActor.ai.next_job_delegate = pActor.getNextJob;
pActor.ai.setTaskBehFinished();
```

> [!WARNING] La prise de contrôle doit être réaffirmée
> Le combat (ainsi que d'autres systèmes) réinitialise le métier en cours à sa conclusion, incitant la créature à en demander un nouveau. Si votre délégué est toujours en place, elle récupère le vôtre. Mais si un autre code a écrasé le délégué, vous perdez la main : vérifiez-le périodiquement plutôt que de le supposer acquis :PES5_Noted:.

## Décisions : laisser la créature choisir votre tâche

Remplacer le délégué de travail est une prise de contrôle totale. La plupart du temps, vous préférez une approche plus douce : proposer votre tâche comme une option supplémentaire que la créature pèse face à manger, dormir et combattre. C'est le rôle d'une **décision (Decision)**, et c'est ainsi que le jeu lui-même choisit les actions d'une unité.

Une décision indique *quand*. La tâche déjà écrite indique *comment*. Lorsque le cerveau retient une décision, il lance la tâche du même ID ou celle définie dans `task_id`.

```csharp Mods/HelloBox/Code/HelloDecisions.cs
namespace HelloBox
{
    public static class HelloDecisions
    {
        public const string WANDER = "hello_decide_wander";

        public static void Initialize()
        {
            if (AssetManager.decisions_library.has(WANDER)) return;

            DecisionAsset wander = new DecisionAsset
            {
                id = WANDER,
                task_id = HelloAI.TASK,                  // the decision says when, the task says how
                priority = NeuroLayer.Layer_1_Low,
                path_icon = "ui/Icons/iconHelloDrive",
                cooldown = 20,                           // seconds before this unit may pick it again
                weight = 1f,
                unique = true,                           // only the actors you give it to, below
                action_check_launch = (Actor pActor) => pActor != null && pActor.isAlive() && !pActor.isFighting()
            };

            AssetManager.decisions_library.add(wander);

            // linkAssets() fills these three for every decision, at startup, before your mod.
            // decision_index is where each unit keeps this decision's cooldown: left at 0, yours
            // would share it with the first vanilla decision.
            wander.decision_index = AssetManager.decisions_library.list.IndexOf(wander);
            wander.priority_int_cached = (int)wander.priority;
            wander.has_weight_custom = wander.weight_calculate_custom != null;

            // who gets it: every wisp, through its actor asset
            ActorAsset wisp = AssetManager.actor_library.get("hello_wisp");
            if (wisp != null) wisp.addDecision(WANDER);
        }
    }
}
```

| Champ | Ce qu'il fait |
| --- | --- |
| `task_id` | La tâche à démarrer. Laisser vide lance la tâche portant le même ID que la décision |
| `priority` | La couche neuronale, de `NeuroLayer.Layer_0_Minimal` à `Layer_4_Critical`. La plupart du temps, seule la couche la plus haute ayant une décision valide participe |
| `weight` / `weight_calculate_custom` | Attractivité face aux autres décisions de sa couche, fixe ou calculée par unité |
| `action_check_launch` | Votre condition. Renvoyer `false` l'exclut des options pour ce cycle |
| `cooldown` | Secondes d'attente avant que la même unité puisse la rechoisir |
| `only_adult`, `only_safe`, `only_hungry`, `only_sapient`... | Filtres rapides évalués avant votre délégué |
| `unique` | Empêche son ajout automatique aux listes génériques. Toujours `true` pour un mod |

> [!WARNING] Trois champs initialisés au démarrage par le jeu
> `DecisionsLibrary.linkAssets()` numérote chaque décision, copie `priority` dans `priority_int_cached` et renseigne `has_weight_custom` au démarrage avant votre mod. Sans les trois lignes après `add()`, votre décision partage son temps de recharge avec la première décision vanilla, reste au niveau le plus bas et ignore son poids personnalisé :wbfacepalm:.

> [!WARNING] Les unités existantes n'ont qu'un seul emplacement libre
> Chaque unité stocke ses temps de recharge de décisions dans un tableau dimensionné à sa création (arrondi à la puissance de 2 supérieure). Le jeu vanilla compte 127 décisions, le tableau en contient 128 : soit exactement **une** place libre. Une unité préexistante recevant une deuxième décision de mod déclenchera une `IndexOutOfRangeException`. Les nouvelles unités sont dimensionnées à la bonne taille, c'est pourquoi HelloBox attribue sa décision à sa propre créature plutôt qu'à un trait générique.

Une décision s'attache à une créature via le composant qui la porte. Un `ActorAsset` la reçoit avec `addDecision()`. **Les traits fonctionnent différemment** : ils résolvent leurs IDs au démarrage, vous devez donc renseigner le tableau manuellement sur un trait :

```csharp
trait.addDecision("hello_decide_wander");
// BaseTraitLibrary.linkDecisions() did this at startup, for vanilla traits only
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("hello_decide_wander") };
```

## Métiers municipaux

Les citoyens reçoivent leur travail de la ville, pas de leur propre cerveau. La ville évalue les besoins, ouvre des créneaux de travail (bâtisseurs, fermiers, mineurs...) et les distribue. Un **métier de citoyen (Citizen Job)** représente un de ces postes, et l'unité recrutée exécute l'`ActorJob` du même ID.

```csharp Mods/HelloBox/Code/HelloCityJobs.cs
using ai.behaviours;   // CityBehCheckCitizenTasks
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCityJobs
    {
        public const string KEEPER = "hello_ember_keeper";

        public static void Initialize()
        {
            if (AssetManager.citizen_job_library.has(KEEPER)) return;

            // What the citizen does once hired: an actor job with the same id
            ActorJob work = new ActorJob { id = KEEPER };
            work.addTask(HelloAI.TASK);
            work.addTask("end_job");
            AssetManager.job_actor.add(work);

            CitizenJobAsset keeper = new CitizenJobAsset
            {
                id = KEEPER,
                path_icon = "ui/Icons/iconHelloDrive"
            };
            AssetManager.citizen_job_library.add(keeper);

            // post_init() and linkAssets() did these two at startup
            keeper.unit_job_default = KEEPER;
            AssetManager.citizen_job_library.list_priority_normal.Add(keeper);
        }

        // A city hands out job slots in one behaviour, from a fixed list of vanilla jobs.
        // Nothing ever opens a slot for yours unless you add it after that list.
        [HarmonyPatch(typeof(CityBehCheckCitizenTasks), nameof(CityBehCheckCitizenTasks.execute))]
        public static class Patch_CitizenTasks
        {
            public static void Postfix(City pCity)
            {
                if (pCity == null || pCity.status.population_adults < 10) return;

                CitizenJobAsset keeper = AssetManager.citizen_job_library.get(KEEPER);
                if (keeper == null) return;

                // one keeper per city, recomputed every time the city recounts its jobs
                if (pCity.jobs.countCurrentJobs(keeper) == 0) pCity.jobs.addToJob(keeper, 1);
            }
        }
    }
}
```

Trois éléments indispensables pour combler les étapes du démarrage du jeu :

1. **`unit_job_default`** est l'`ActorJob` exécuté par le citoyen recruté. `post_init()` y copie l'ID.
2. **`list_priority_normal`** est la liste proposée aux citoyens (construite par `linkAssets()`). Les métiers avec `priority` > 0 vont dans `list_priority_high` et sont attribués en priorité.
3. **Les créneaux de travail.** `CityBehCheckCitizenTasks.execute()` ouvre les postes depuis une liste fixe vanilla. Le postfix Harmony en ajoute un pour le vôtre.

| Champ | Ce qu'il fait |
| --- | --- |
| `priority` / `priority_no_food` | Supérieur à 0 : proposé avant les métiers normaux, ou seulement en cas de famine |
| `ok_for_king` / `ok_for_leader` / `only_leaders` | Qui peut accepter ce poste |
| `should_be_assigned` | Votre condition d'affectation par unité |
| `common_job` | `false` l'exclut totalement des listes courantes |
| `path_icon` | L'icône dans la vue d'ensemble des métiers de la ville |

## Le texte

Le nom de la tâche correspond à l'action affichée dans la fenêtre de l'unité, et une décision emprunte le nom de la tâche qu'elle déclenche :

```json Mods/HelloBox/Locales/en.json
{
  "task_unit_hellobox_drive": "Wandering with purpose"
}
```

## Les règles pour ne pas anéantir le framerate

Il peut y avoir des milliers d'unités. Votre comportement tourne sur chacune d'elles, à chaque tick.

- **Effectuez vos calculs lourds sur votre propre cadence, pas dans `execute`.** Faites tourner vos logiques coûteuses dans `Update()` sur un timer, stockez le résultat et laissez `execute` simplement lire la valeur.
- **Répartissez la charge.** Si vous calculez pour 40 créatures, traitez-en 10 par passe sur quatre passes, plutôt que les 40 d'un seul bloc.
- **Quittez au plus tôt.** Les premières lignes d'`execute` doivent consister en des vérifications légères permettant un retour immédiat.
- **N'allouez jamais de mémoire dans la boucle critique.** Créer de nouvelles listes et lambdas à chaque tick pour mille unités, c'est offrir directement votre framerate en pâture au ramasse-miettes.

> [!TIP] D'abord le trait, ensuite le comportement
> Donnez aux créatures sous votre contrôle un trait visible (voir **[Traits personnalisés](#/nml/custom-traits)**), afin que le joueur sache quelles unités vous appartiennent et que *vous* puissiez vérifier d'un coup d'œil si votre code s'exécute sur les bonnes cibles :pepeOK:.
