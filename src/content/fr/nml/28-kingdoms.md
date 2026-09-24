---
title: Royaumes et factions
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbkingdoms:
order: 178
---

# Royaumes et factions :wbkingdoms:

Dans WorldBox, chaque unité appartient à un royaume. Pas uniquement les civilisations : les loups appartiennent à un royaume de loups, les bandits à une faction de bandits, et un poulet neutre appartient à un royaume neutre. Un `KingdomAsset` est le **type** de faction, et non un royaume spécifique présent sur la carte.

C'est la nuance fondamentale à retenir :

| | |
| --- | --- |
| `KingdomAsset` dans `AssetManager.kingdoms` | Le modèle. "Ce qui définit un royaume orque" |
| `Kingdom` dans `World.world.kingdoms` | Un royaume réel dans le monde en cours, avec un nom, une couleur et des cités |

Vous enregistrez le premier. Le jeu instancie le second.

## Cloner un modèle

Tout comme les acteurs, les royaumes disposent d'identifiants `$TEMPLATE$` prévus à cet effet :

| Modèle | Utilisation |
| --- | --- |
| `$TEMPLATE_CIV$` | Une faction civilisée |
| `$TEMPLATE_CIV_NEW$` | Le style plus récent des civilisations animales |
| `$TEMPLATE_NOMAD$` | La phase nomade avant sédentarisation |
| `$TEMPLATE_MOB$` | Une faction de monstres hostiles |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Hostile à certaines choses, pacifique envers les civilisations |
| `$TEMPLATE_ANIMAL$` | Faune sauvage |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Faune pacifique ne déclenchant aucun combat |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // La faction civilisée sédentaire.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // La phase sauvage, avant de fonder une ville.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

`$TEMPLATE_NOMAD$` a déjà configuré pour vous `nomads = true`, `civ = false` et `mobs = true`. Il est indispensable de le préciser clairement : **`civ`, `nomads`, `mobs` et consorts sont des champs `bool`, pas des tags.** `wild.nomads = true` est un vrai champ. `wild.addTag("nomads")` est un tag qu'absolument aucun système du jeu ne lit, et qui échoue en silence :aPES_Liar:.

Liez ensuite votre acteur à ces factions, ce qui unit concrètement les deux entités :

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Sans cela, votre créature apparaîtra dans le royaume qu'utilisait le modèle d'origine de son clone (généralement humain), ce qui crée vite une belle pagaille :PES5_Hmmmm:.

## Les champs

### Quel genre de faction est-ce

| Champ | Ce qu'il fait |
| --- | --- |
| `civ` | Fonde des villes, mène des guerres, possède un roi |
| `nomads` | Étape errante avant de s'implanter |
| `nature` | Animaux sauvages |
| `mobs` | Monstres hostiles |
| `neutral` | N'attaque personne sans provocation |
| `abandoned`, `concept` | Factions techniques de gestion interne, pas de vrais peuples |
| `brain` | La méta-faction gérée par l'IA |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | Catégorie dans laquelle les listes du jeu la classent |

### Comment elle se comporte

| Champ | Ce qu'il fait |
| --- | --- |
| `always_attack_each_other` | Deux royaumes de ce type sont perpétuellement en guerre |
| `units_always_looking_for_enemies` | Les unités traquent des cibles en permanence |
| `count_as_danger` | Les autres factions la traitent-elles comme une menace. `true` par défaut |
| `friendship_for_everyone` | Pacifique avec absolument tout le monde |
| `force_look_all_chunks` | Les unités scannent la carte entière, pas juste les environs. Coûteux |
| `building_attractor_id` | Type de bâtiment qui les attire |

### Les tags : qui combat qui

C'est la pièce maîtresse, et ce n'est pas une statistique numérique mais trois ensembles de chaînes :

```csharp
kingdom.addTag("civ");             // ce que je suis
kingdom.addFriendlyTag("neutral"); // qui j'apprécie
kingdom.addEnemyTag("orc");        // qui je déteste
```

Deux royaumes comparent leurs tags pour fixer leur position diplomatique par défaut. Une faction sans tags n'aime personne, ne déteste personne et ne fait rien d'intéressant.

### Apparence

| Champ | Ce qu'il fait |
| --- | --- |
| `path_icon`, `show_icon` | Icône de faction. `setIcon(path)` règle les deux |
| `default_kingdom_color`, `default_civ_color_index` | Couleur de départ |
| `color_building` | Teinte appliquée à leurs constructions |

## Le reste de l'écosystème d'une faction

Un asset de royaume isolé n'est qu'une étiquette. Une étiquette très officielle, mais une étiquette. Voici les autres bibliothèques qu'une faction complète mobilise :

| Élément | Bibliothèque | Rôle |
| --- | --- | --- |
| Bannières | `AssetManager.kingdom_banners_library` | Le drapeau généré |
| Couleurs | `AssetManager.kingdom_colors_library` | La palette attribuée aux royaumes |
| Traits de royaume | `AssetManager.kingdoms_traits` | Politiques, principalement fiscales. Voir **[Traits de royaume](#/nml/kingdom-traits)** |
| Métiers de royaume | `AssetManager.job_kingdom` | Ce sur quoi travaille l'IA de la faction |
| Tâches de royaume | `AssetManager.tasks_kingdom` | L'arbre de comportement derrière ces métiers |
| Types de guerre | `AssetManager.war_types_library` | Les motifs de déclaration de guerre |
| Architecture | `AssetManager.architecture_library` | L'apparence de leurs bâtiments |
| Ordres de construction | `AssetManager.city_build_orders` | Ce qu'une nouvelle cité bâtit et dans quel ordre |
| Générateurs de noms | `AssetManager.name_generator`, `AssetManager.name_sets` | Comment sont nommés royaumes, cités et citoyens |

Réutilisez les éléments vanilla jusqu'à avoir une excellente raison de faire autrement. `banner_id = "human"` sur votre acteur vous donne un générateur de drapeaux fonctionnel sans effort.

## Manipuler les royaumes en jeu

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

`isRekt()` est une méthode d'extension signifiant "cet objet a été détruit mais quelque chose détient encore une référence vers lui". Vérifiez-le dans chaque boucle parcourant royaumes, cités, armées ou unités. C'est le garant d'un mod robuste qui ne plante pas au bout d'une heure :aPES2_Sweat:.

## Personnalités

Un roi et un dirigeant de ville reçoivent une **personnalité** : un libellé et quelques statistiques `personality_*` qui déterminent si le royaume joue de manière agressive ou diplomatique. En enregistrer une prend trois lignes. Faire en sorte que quelqu'un la *possède* est le vrai sujet : `Actor.updateStats()` choisit l'une des quatre personnalités vanilla par son nom à chaque actualisation des stats.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Le postfix s'exécute après chaque mise à jour de statistiques pour maintenir l'échange. Il retire les valeurs de la personnalité vanilla avant d'ajouter les vôtres pour que le souverain ne cumule pas les deux. `s_personality` et `mergeStats()` sont `internal` : cela compile avec la bibliothèque **publicized** de NML.

## Opinion, loyauté et bonheur

Trois petites bibliothèques régissent le ressenti politique, et toutes trois consistent en des listes de petites fonctions de calcul. Pas de sentiments, juste des nombres :

| Bibliothèque | Appelée pour | Renvoie |
| --- | --- | --- |
| `AssetManager.opinion_library` | Chaque paire de royaumes | Points d'opinion de l'un envers l'autre |
| `AssetManager.loyalty_library` | Chaque ville | Points de loyauté envers son royaume |
| `AssetManager.happiness_library` | Événements vécus par une unité | Une variation fixe de bonheur |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

L'opinion et la loyauté sont recalculées en sommant toute la liste à chaque fois, `add()` suffit donc, et chacune s'affiche comme une ligne dédiée dans le détail du jeu via `translation_key` (ou `translation_key_negative` si le score est négatif). Les événements de bonheur se déclenchent lorsque votre code appelle `actor.changeHappiness("hello_warm_embers")`, comme le fait le festival dans **[Complots](#/nml/plots)**.

> [!WARNING] Les entrées de bonheur sont indexées au démarrage
> L'historique de bonheur d'une unité stocke le *numéro* de l'entrée, pas son ID, et `HappinessLibrary.post_init()` distribue ces indices une seule fois. La vôtre resterait à 0 et s'afficherait comme la première entrée vanilla. Définissez `index` vous-même.

## Bannières pour les autres systèmes

Les royaumes ne sont pas les seuls à arborer une bannière : les cultures, religions, clans, langues, sous-espèces et familles possèdent chacune leur propre bibliothèque d'éléments (`AssetManager.culture_banners_library`, etc.). Chacune possède un asset `main` contenant des listes de chemins, et une nouvelle culture tire au sort un index.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

Les chemins sont chargés individuellement lors du rendu de la bannière, il n'y a donc rien à rafraîchir. Un index au-delà de la fin de liste retombe sur 0, ce qui permet à une sauvegarde créée avec votre mod de s'ouvrir sans lui. Respectez la taille des pièces vanilla : examinez-en une dans **[UnityExplorer](#/toolbox/unity-explorer)** avant de dessiner la vôtre. Devinez la taille et vous obtenez un drapeau plus grand que la ville qui le hisse :wbfacepalm:.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] Vous n'avez probablement pas besoin d'un nouvel asset de royaume
> Une nouvelle créature en a besoin. Un nouveau *comportement* non : la plupart des mods de factions sont bien plus élégants sous forme de traits de royaume, d'une culture ou d'un patch Harmony sur la diplomatie. Ajoutez un asset de royaume quand votre créature a besoin de sa propre place dans le monde, pas pour modifier le comportement des royaumes existants.
