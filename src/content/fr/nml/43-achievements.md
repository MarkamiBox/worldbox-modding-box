---
title: Succès
group: Contenu du jeu
subgroup: Finitions et accomplissement
icon: :gold_star:
order: 220
---

# Succès :gold_star:

Oui, un mod peut ajouter des succès (achievements). Ils s'affichent dans la fenêtre des succès du jeu, apparaissent avec la même notification que les vrais et sont enregistrés dans la progression du joueur. Lisez l'avertissement en bas de page avant d'en publier un.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

Dix feux follets vivants en même temps, et le succès se débloque.

## Ce que le jeu ne fait pas automatiquement

- **La clé de texte.** `post_init()` génère `locale_key` à partir de l'ID pour chaque succès vanilla. Le vôtre reste à `null` et la fenêtre n'affiche rien : définissez-le vous-même.
- **La fenêtre.** La fenêtre des succès énumère le `achievements_list` de chaque groupe, rempli par `linkAssets()` au démarrage. Ajoutez le vôtre au groupe, sinon il se débloquera sans que personne ne puisse le voir.
- **La vérification.** Rien dans le jeu ne sait *quand* vérifier votre succès : le jeu vanilla appelle `check()` aux endroits précis où ses conditions changent. HelloBox utilise un **[comportement du monde](#/nml/world-ages)** qui vérifie toutes les trente secondes, ce qui est amplement suffisant pour "dix créatures existent en même temps". Pour un événement unique, appelez `check()` directement là où il se produit.

| Champ | Ce qu'il fait |
| --- | --- |
| `group` | La section de la fenêtre : `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | Son image, sous forme de chemin de sprite complet |
| `action` | Votre condition. `check()` le débloque quand ceci renvoie `true`, et `check()` sans `action` le débloque instantanément |
| `hidden` | Affiche une ligne "masqué" à la place de la description jusqu'à son déblocage |
| `locale_key` | La clé de texte. La description utilise `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] Ils s'enregistrent dans la vraie progression du joueur
> Le déblocage exécute le code natif du jeu : il écrit l'ID dans le fichier de progression du joueur et demande à Steam de débloquer un succès avec cet ID. Steam ne possède aucun succès sous votre ID, donc rien ne se passe côté Steam, mais l'appel est effectué et le journal indique `Unlocking in Steam: <id>`. Le jeu envoie également l'ID dans ses événements analytiques. Et tant que la loi du "monde maudit" est active, rien ne se débloque, vos succès compris.

Rien de tout cela ne casse quoi que ce soit. Mais cela reste le vrai fichier de progression du joueur : limitez-vous à une poignée de succès pertinents et ne débloquez jamais rien que le joueur n'a pas accompli :PESgn_ReadRules:.
