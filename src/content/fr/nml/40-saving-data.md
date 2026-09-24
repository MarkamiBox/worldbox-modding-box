---
title: Mémoriser des données
group: Modding NML
subgroup: Avancé et publication
icon: :wbfloppysavewink:
order: 44
---

# Mémoriser des données :wbfloppysavewink:

Tôt ou tard, votre mod devra se souvenir d'une information propre à une unité précise : combien de fois elle a frappé, si elle a déjà reçu sa récompense ou à quel sanctuaire elle prie. Un dictionnaire statique indexé par l'unité oubliera tout dès l'instant où le joueur sauvegarde et recharge la partie :wbfacepalm:.

Le jeu propose déjà un emplacement dédié. Chaque créature, ville, royaume, bâtiment, objet et livre conserve son état dans un objet de données, et chacun d'eux dispose d'un petit espace de **données personnalisées** (custom data) qui est sauvegardé avec lui.

## Le stockage

| Appel | Ce qu'il fait |
| --- | --- |
| `data.set(key, value)` | Enregistre un `int`, `long`, `float`, `string` ou `bool` sous une clé |
| `data.get(key, out value, default)` | Lit la valeur. Si la clé est absente, renvoie la valeur par défaut |
| `data.change(key, amount, min, max)` | Ajoute à un `int` et le borne (clamp) en un seul appel |
| `data.addFlag(key)` | Active un drapeau (flag). Renvoie `false` s'il était déjà défini |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Vérifie ou retire le flag |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Supprime une valeur |

Chaque type possède sa propre table interne, donc un `int` et une `string` sous la même clé n'entrent pas en collision. Ne partagez toutefois pas les mêmes clés, pour votre propre confort. Votre futur vous ne se souviendra plus de qui était qui.




## Sauvegarder des objets complexes avec NML

Si cinq types primitifs vous semblent dater de 1995 et que vous devez vraiment sauvegarder une classe ou une liste entière sur un acteur, NML fournit `DataExtension` dans `NeoModLoader.General.Game.extensions`.

Enveloppez votre classe de données dans `BasicCustomData<T>` :

```csharp
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

// Sauvegarde sur l'actor :
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Lecture :
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress quest = saved.Data;
}
```

En coulisses, NML sérialise votre objet en JSON et le range dans la table vanilla `custom_data_string` sous votre clé. Si vous prévoyez que votre format de données change entre les mises à jour du mod, implémentez `ICustomData` directement sur votre classe au lieu d'utiliser `BasicCustomData<T>` : cela vous donne des vérifications explicites de `ModId` et `DataVersion`, pour qu'une vieille sauvegarde n'empoisonne pas en silence votre nouvel état :PES5_Hmmmm:.

## Dans HelloBox

Un trait qui compte chaque coup porté par son porteur et lui octroie une récompense unique au cinquantième coup :

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Sauvegardez le monde et rechargez-le : le compteur est toujours là, car il fait partie intégrante des données de sauvegarde de l'unité. Le drapeau garantit que la récompense ne se déclenche qu'une seule fois et non à chaque coup suivant. Généreux, mais toujours un bug.

Ses textes de localisation, comme pour n'importe quel trait :

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` est `internal`
> Le champ de données d'une unité est marqué `internal` dans l'assembly du jeu. NML compile votre mod contre une copie **publicisée**, donc cela fonctionne directement dans un mod source classique. Cela ne posera problème que si vous compilez votre propre `.dll` contre l'assembly d'origine non modifié : voir **[Dépannage](#/troubleshooting)**. Le champ `data` des villes et royaumes est public dans tous les cas.

## Où résident les données

| Objet | Ses données |
| --- | --- |
| Une unité | `actor.data` |
| Une ville | `city.data` |
| Un royaume | `kingdom.data` |
| Un bâtiment | `building.data` |
| Cultures, religions, clans, langues, familles, armées, complots | leur `data`, tous partagent le même stockage |

## Ce qu'il faut savoir

- **Préfixez toujours vos clés.** Tous les mods écrivent dans le même stockage. `hello_hits` n'entrera en conflit avec personne ; `hits` finira par poser problème.
- **Retirer le mod est sans danger.** Les clés restent dans la sauvegarde, personne ne les lit et rien ne plante. C'est l'immense avantage par rapport à un patch du format de sauvegarde natif du jeu.
- **Les stockages vides ne coûtent rien.** Le jeu supprime les tables vides avant d'écrire la sauvegarde, donc une clé supprimée disparaît réellement.
- **Restez concis.** Ces données sont enregistrées avec chaque unité. Un compteur ou un drapeau par créature est quasi invisible ; une longue chaîne de texte par unité sur un monde de dix mille créatures alourdira inutilement la sauvegarde de tout le monde.

Pour tout ce qui n'est pas rattaché à un objet individuel (comme un paramètre global pour le monde entier), utilisez plutôt la configuration de votre mod : voir **[Configuration du mod](#/nml/mod-config)** :PES_OkHand:.
