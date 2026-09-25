---
title: IA de royaume
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbdiplomacyhandshake:
order: 180
---

# IA de royaume :wbdiplomacyhandshake:

L'IA des créatures s'exécute sur chaque unité : chercher de la nourriture, marcher vers un arbre ou combattre un ennemi. L'IA de royaume opère sur la civilisation entière. C'est elle qui décide quand déclarer une guerre, étendre les frontières, fonder des colonies, nouer des alliances ou lancer des campagnes militaires.

Comme pour les unités, elle repose sur des métiers (jobs) et des tâches (tasks). Mais au lieu d'un `Actor`, chaque étape reçoit un `Kingdom`.

## Métiers contre tâches

La logique de royaume est répartie entre deux bibliothèques d'assets :

| Concept | Classe | Bibliothèque | Rôle |
| --- | --- | --- | --- |
| **Kingdom job** | `KingdomJob` | `AssetManager.job_kingdom` | Un ensemble de tâches ordonnées qu'un royaume évalue |
| **Kingdom task** | `BehaviourTaskKingdom` | `AssetManager.tasks_kingdom` | Un objectif stratégique contenant des comportements |
| **Kingdom behaviour** | `BehaviourActionKingdom` | rattaché à la tâche | Une étape élémentaire exécutée à chaque tick |

Les civilisations du jeu de base utilisent le métier de royaume `"civ"` (`AssetManager.job_kingdom.get("civ")`). À chaque tour, le royaume parcourt ses tâches séquentiellement.

## Écrire un comportement de royaume

Un comportement de royaume hérite de `BehaviourActionKingdom` et redéfinit `execute(Kingdom pKingdom)` :

```csharp
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloKingdomTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.hasEnemies()) return BehResult.Stop;

            if (pKingdom.data.gold > 500)
            {
                pKingdom.data.gold -= 50;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }
}
```

### Les codes de retour

| Résultat | Action de l'IA du royaume |
| --- | --- |
| `BehResult.Continue` | Passe au comportement suivant de la tâche |
| `BehResult.Stop` | Interrompt la tâche pour le tick en cours |
| `BehResult.RepeatStep` | Rejoue ce comportement au tick suivant |
| `BehResult.Skip` | Saute le comportement suivant et poursuit |

## Le code

Ce fichier crée une tâche de royaume et l'injecte dans le métier `"civ"` du jeu :

```csharp Mods/HelloBox/Code/HelloKingdomAI.cs
using System;
using ai.behaviours;

namespace HelloBox
{
    public class BehHelloCheckTribute : BehaviourActionKingdom
    {
        public override BehResult execute(Kingdom pKingdom)
        {
            if (pKingdom == null || pKingdom.isRekt() || !pKingdom.isCiv()) return BehResult.Stop;
            if (pKingdom.capital == null || pKingdom.king == null) return BehResult.Stop;

            // Example directive: if the kingdom has plenty of gold, donate to treasury
            if (pKingdom.data.gold > 300)
            {
                pKingdom.data.gold += 10;
                return BehResult.Continue;
            }

            return BehResult.Stop;
        }
    }

    public static class HelloKingdomAI
    {
        public const string TASK_ID = "hello_kingdom_tribute";

        public static void Initialize()
        {
            if (AssetManager.tasks_kingdom.has(TASK_ID)) return;

            // 1. Define the task
            BehaviourTaskKingdom task = new BehaviourTaskKingdom
            {
                id = TASK_ID
            };

            // 2. Add steps
            task.addBeh(new BehHelloCheckTribute());

            AssetManager.tasks_kingdom.add(task);

            // 3. Inject into the civ kingdom job
            KingdomJob civJob = AssetManager.job_kingdom.get("civ");
            if (civJob != null && !civJob.tasks.Contains(TASK_ID))
            {
                civJob.tasks.Add(TASK_ID);
            }
        }
    }
}
```

## Créer un métier de royaume dédié

Si vous créez une faction ou une espèce personnalisée avec `AssetManager.kingdoms`, donnez-lui son propre métier :

```csharp
KingdomJob job = new KingdomJob { id = "hello_faction_job" };
job.addTask("hello_kingdom_tribute");
job.addTask("check_war");
AssetManager.job_kingdom.add(job);
```

Affectez ensuite `job_id = "hello_faction_job"` sur votre `KingdomAsset` dans **[Royaumes](#/nml/kingdoms)** :PESgn_Noice:.

## Pièges à éviter

- **Vérifiez toujours `isRekt()`** : Les royaumes peuvent s'effondrer à tout instant. Ne manipulez jamais un royaume sans tester `pKingdom != null && !pKingdom.isRekt()`.
- **Vérifiez la capitale et le roi** : De nombreuses fonctions supposent que `capital` et `king` existent. S'ils sont détruits, une `NullReferenceException` surviendra.
- **Gardez des ticks légers** : Alors qu'une unité s'exécute localement, le royaume englobe des empires entiers. Des boucles lourdes sur toutes les unités dans un comportement feront chuter le framerate :aPES2_Sweat:.
