---
title: Mémoriser des données
group: Modding NML
subgroup: Avancé et publication
icon: :wbfloppysavewink:
order: 44
---

# Mémoriser des données :wbfloppysavewink:

Tôt ou tard, votre mod devra se souvenir d'une information propre à une unité précise : combien de fois elle a frappé, si elle a déjà reçu sa récompense ou à quel sanctuaire elle prie. Un dictionnaire statique indexé par l'unité oubliera tout dès l'instant où le joueur sauvegarde et recharge la partie :wbfacepalm:.

Le jeu propose déjà un emplacement dédié. Chaque créature, ville, royaume (kingdom), bâtiment (building), objet et livre (book) conserve son état dans un objet de données, et chacun d'eux dispose d'un petit espace de **données personnalisées** (custom data) qui est sauvegardé avec lui.

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

Si cinq types primitifs vous semblent dater de 1995 et que vous devez vraiment sauvegarder une classe ou une liste entière sur un acteur, NML fournit `DataExtension` dans `NeoModLoader.General.Game.extensions` : deux méthodes d'extension, `Set` et `TryGet`, sur n'importe lequel des objets de données ci-dessous.

Enveloppez votre classe de données dans `BasicCustomData<T>` :

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

À l'intérieur d'une méthode avec un `Actor actor`, créez la valeur avant de la sauvegarder :

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Sauvegarde sur l'actor :
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Lecture :
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

En coulisses, `Set` transforme votre objet en JSON et le stocke avec le simple `data.set(key, string)` du tableau ci-dessus. Donc c'est une chaîne par clé par unité, et la règle "restez concis" plus bas s'applique doublement. Votre classe a besoin d'un constructeur sans paramètre, et ce sont ses champs et propriétés publics qui sont sauvegardés.

Si vous prévoyez que votre format de données change entre les mises à jour du mod, implémentez plutôt `ICustomData` sur votre classe. Ce sont deux méthodes : `Serialize()` renvoie un `SerializedCustomData(modId, dataVersion, jObject)`, et `Deserialize(SerializedCustomData)` le récupère. Vérifier `ModId` et `DataVersion` là-dedans, c'est votre travail, personne ne le fait pour vous. `BasicCustomData<T>` écrit des valeurs de substitution dans les deux et lève une exception si elle lit autre chose, donc ne mélangez pas les deux sur une même clé :PES5_Hmmmm:.

> [!NOTE] Vérifié avec NML 1.2.0
> Ces noms et signatures viennent de l'assembly NML elle-même, pas de sa documentation, qui ne les mentionne pas. Si une version plus récente de NML renomme quelque chose, le compilateur vous le dira avant vos joueurs.

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
| Cultures, religions, clans, langues, familles, armées, complots (plot) | leur `data`, tous partagent le même stockage |

## Ce qu'il faut savoir

- **Préfixez toujours vos clés.** Tous les mods écrivent dans le même stockage. `hello_hits` n'entrera en conflit avec personne ; `hits` finira par poser problème.
- **Retirer le mod est sans danger.** Les clés restent dans la sauvegarde, personne ne les lit et rien ne plante. C'est l'immense avantage par rapport à un patch du format de sauvegarde natif du jeu.
- **Les stockages vides ne coûtent rien.** Le jeu supprime les tables vides avant d'écrire la sauvegarde, donc une clé supprimée disparaît réellement.
- **Restez concis.** Ces données sont enregistrées avec chaque unité. Un compteur ou un drapeau par créature est quasi invisible ; une longue chaîne de texte par unité sur un monde de dix mille créatures alourdira inutilement la sauvegarde de tout le monde.

## Le monde entier

Certains états n'appartiennent à aucune unité : combien de météorites votre pouvoir a fait tomber sur ce monde, si la bénédiction unique a déjà eu lieu. Le monde possède le même stockage, dans ses statistiques de carte :

```csharp
// map_stats is internal: fine in an NML source mod, same deal as actor.data above
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() clamps to 1000 unless you say otherwise
if (world.addFlag("hello_blessed")) { /* first time on this world only */ }
```

`SaveCustomData` est le même stockage `BaseSystemData`, donc chaque appel du tableau du début fonctionne, tout comme le `Set` / `TryGet` de NML. Il est sauvegardé avec le reste des statistiques de carte, donc chaque emplacement de sauvegarde a le sien. Un monde fraîchement généré démarre vide. Le jeu crée le stockage à chaque fois qu'il construit ou charge les statistiques de carte, donc la vérification de nullité ne devrait jamais se déclencher ; elle ne coûte rien, gardez-la.

> [!TIP] Réglages ou données du monde ?
> Demandez-vous si le joueur s'attendrait à ce que la valeur change en chargeant une autre sauvegarde. "À quel point le pouvoir météorite est puissant" ne devrait pas changer : c'est **[Réglages du mod](#/nml/mod-config)**, partagé par tous les mondes. "Ce monde a-t-il été béni" devrait changer : c'est `custom_data`.

## Le temps qui survit à une sauvegarde

`Time.time` correspond aux secondes écoulées depuis le lancement du jeu. Stockez-le dans les données d'une unité, sauvegardez, redémarrez, chargez, et chaque horodatage que vous avez écrit vient d'une vie précédente :wbfacepalm:.

Le monde garde sa propre horloge, et elle est sauvegardée avec la carte :

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in world seconds: 5 is a month, 60 is a year
double now = World.world.getCurWorldTime();

// the store has no double, a float is plenty for a timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

Elle s'arrête aussi quand le jeu est en pause et tourne plus vite aux vitesses élevées, ce qui est presque toujours ce que vous vouliez. `Date.getYearsSince(at)` et `Date.getMonthsSince(at)` font la division pour vous.

## Exécuter du code après le chargement d'un monde

Tout ce qui précède se lit à la demande, donc en général vous n'avez pas besoin de savoir quand un monde a été chargé. Quand c'est le cas, disons pour reconstruire un cache à vous, voici les méthodes que les mods accrochent avec **[Harmony](#/nml/harmony-patches)** :

| Méthode | Quand elle s'exécute |
| --- | --- |
| `MapBox.clearWorld` (publique) | Avant qu'un monde ne soit généré ou chargé. Videz vos caches statiques ici |
| `SaveManager.loadActors` (privée) | Pendant le chargement d'une sauvegarde, juste après la reconstruction des unités |
| `MapBox.finishMakingWorld` (publique) | Vers la fin de la génération et du chargement d'un monde |
| `SaveManager.saveWorldToDirectory` (publique, statique) | À la sauvegarde, manuelle ou automatique. Un Prefix est votre dernière chance d'écrire dans le stockage |
| `MapBox.addLastStep` (privée) | Une fois, au démarrage du jeu. Pas par monde |
| `MapBox.OnApplicationQuit` (privée) | Le jeu se ferme |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // a cached copy for code that reads it every frame; the save keeps the real one
        public static int MeteorsThisWorld;

        // runs for a brand new world and for a loaded save alike
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

Les méthodes privées prennent le nom sous forme de chaîne, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, comme l'explique la page sur Harmony. L'écran de chargement est encore affiché quand `finishMakingWorld` s'exécute ; quelques étapes le suivent.

## Vos propres fichiers

Beaucoup de mods sautent tout ça et écrivent un fichier JSON avec `File.WriteAllText`, généralement sous `Application.persistentDataPath`, qui correspond au dossier `LocalLow\mkarpenko\WorldBox` juste à côté de `Player.log`. C'est très bien pour ce qui appartient au **joueur** : une liste d'unités favorites qu'il a exportée, des statistiques cumulées sur toutes ses parties.

C'est une erreur pour ce qui appartient à un **monde**. Le fichier ne sait pas quel emplacement de sauvegarde est chargé. Le joueur bénit un royaume dans l'emplacement 1, charge l'emplacement 2, et l'emplacement 2 est béni aussi. Puis il supprime l'emplacement 1 et votre fichier garde cet état pour toujours :PES2_F:. Si ça doit changer quand la sauvegarde change, ça va dans la sauvegarde, dans l'un des stockages ci-dessus.

## Et ensuite

Pour des valeurs que le joueur choisit une fois et que tous les mondes partagent, voir **[Réglages du mod](#/nml/mod-config)**. Pour du code qui vérifie quelque chose à chaque frame, ou chaque mois en jeu, voir **[Chaque frame](#/nml/update-loops)** :PES_OkHand:.
