---
title: Traits de culture
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbtiphat:
order: 106
---

# Traits de culture :wbtiphat:

Une **culture** désigne l'ensemble des habitudes partagées par un groupe de cités. Elle détermine ce qu'elles construisent, ce qu'elles forgent, comment elles héritent, ce qu'elles lisent et ce qu'elles valorisent. Un trait de culture est l'une de ces habitudes.

Parmi les sept systèmes de traits, la culture est celui qui a la portée la plus vaste. Une culture se propage avec les villes, survit à son fondateur et injecte ses statistiques dans absolument chaque unité qui lui est affiliée. Si vous cherchez un mod dont l'effet se diffuse dans le monde entier sur une heure de jeu, c'est cette bibliothèque qu'il vous faut. Grande portée, grande responsabilité :PES5_Menace:.

| | |
| --- | --- |
| Bibliothèque | `AssetManager.culture_traits` |
| Classe | `CultureTrait` |
| Groupes | `AssetManager.culture_trait_groups`, classe `CultureTraitGroupAsset` |
| Propriétaire à l'exécution | `Culture`, dans `World.world.cultures` |
| Préfixe de localisation | `culture_trait_` |
| Dossier d'icônes par défaut | `ui/Icons/culture_traits/` |

## En enregistrer un

```csharp Mods/HelloBox/Code/HelloCulture.cs
namespace HelloBox
{
    public static class HelloCulture
    {
        public const string DUELLISTS = "hello_duellists";

        public static void Initialize()
        {
            if (AssetManager.culture_traits.has(DUELLISTS)) return;

            CultureTrait trait = new CultureTrait
            {
                id = DUELLISTS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "warfare",
                path_icon = "ui/Icons/iconHelloCulture",
                priority = 10,                       // une valeur plus haute place le trait en tête de groupe
                spawn_random_trait_allowed = false,  // jamais attribué par hasard
                can_be_given = true,                 // le joueur peut l'ajouter dans l'éditeur
                can_be_removed = true,
                rarity = Rarity.R2_Epic
            };

            AssetManager.culture_traits.add(trait);

            // Avertissement ci-dessous : cela s'applique aux fermiers comme aux soldats.
            trait.base_stats["critical_chance"] = 0.05f;
        }
    }
}
```

Tout ce qui figure sur **[Traits personnalisés](#/nml/custom-traits)** s'applique ici également : appeler `add()` avant les stats, `path_icon` n'est pas complété à votre place, les identifiants sont préfixés. Voici ce qui rend les traits de culture uniques. Et c'est la partie amusante.

> [!WARNING] `base_stats` sur un trait culturel touche tout le monde
> `Actor.updateStats()` fusionne `culture.base_stats` dans chaque unité affiliée à cette culture. Chaque unité. Une doctrine accordant "+5 dégâts" armera aussi les boulangers.
>
> Si le bonus ne doit s'appliquer qu'à certains membres, ne mettez rien dans `base_stats` et filtrez vous-même dans un Postfix Harmony sur `Actor.updateStats`, voir **[Patchs Harmony](#/nml/harmony-patches)**. S'il doit s'appliquer à la culture en tant que groupe plutôt qu'à ses habitants, utilisez plutôt `base_stats_meta`, voir **[Référence des stats](#/nml/stats)**.

## Orienter ce qu'une culture forge

C'est le champ que possèdent les traits culturels et aucun autre, et c'est la méthode la plus élégante pour donner à une culture une véritable *identité* sans toucher à la moindre arme :

```csharp
trait.value = 10f;                       // poids attribué à la préférence
trait.addWeaponSubtype("sword");         // préférer toute une classe d'armes
trait.addWeaponSpecial("hello_relic");   // ou un identifiant d'objet spécifique
```

Les deux méthodes d'aide activent `is_weapon_trait = true` pour vous. Le code d'artisanat consulte les préférences d'armes de la culture lorsqu'une ville décide quoi fabriquer ; cela remplace ainsi l'arme dans la main du soldat plutôt que de simplement modifier un chiffre. Dans le jeu de base, `bow_lovers` et `spear_lovers` fonctionnent exactement ainsi. Toute une culture de fans de lances, en deux lignes :PESgn_Noice:.

| Champ | Description |
| --- | --- |
| `is_weapon_trait` | Marque le trait comme une préférence d'arme |
| `related_weapon_subtype_ids` | Classes d'armes préférées. `addWeaponSubtype` s'ajoute ici |
| `related_weapons_ids` | Identifiants d'armes spécifiques préférées. `addWeaponSpecial` s'ajoute ici |
| `value` | Poids de la préférence lors de la sélection |

## Orienter la façon dont une culture bâtit

```csharp
trait.setTownLayoutPlan(pZoneCheckerDelegate);
```

Prend un `PassableZoneChecker` et active `town_layout_plan = true`. C'est ainsi que fonctionnent les traits d'aménagement urbain du jeu de base : villes à colonnes, villes riches en routes.

C'est le point d'ancrage le plus profond de cette page et le plus susceptible d'entrer en conflit avec un autre mod, car une culture ne peut suivre qu'un seul plan d'urbanisme à la fois. Inspectez `town_layout_plan` sur les traits déjà possédés par la culture avant de supposer que le vôtre sera le seul actif.

## Les groupes vanilla

`harmony` · `architecture` · `town_plan` · `kingdom` · `buildings` · `succession` · `knowledge` · `warfare` · `weapons` · `craft` · `happiness` · `worldview` · `miscellaneous` · `fate` · `special`

Pour créer votre propre onglet : voir **[Groupes de traits & onglets](#/nml/trait-groups)**, avec `AssetManager.culture_trait_groups` et `CultureTraitGroupAsset`.

## Les textes

```json Mods/HelloBox/Locales/en.json
{
  "culture_trait_hello_duellists": "Duellists",
  "culture_trait_hello_duellists_info": "They settle it one at a time, and they practise."
}
```

## Distribuer le trait

```csharp
// chaque créature de ce type démarre avec
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addCultureTrait(HelloCulture.DUELLISTS);
```

```csharp
// ou au moment de l'exécution, sur les cultures déjà existantes
foreach (Culture culture in World.world.cultures)
{
    if (culture == null || culture.isRekt()) continue;
    if (culture.hasTrait("hello_duellists")) continue;

    culture.addTrait("hello_duellists", pRemoveOpposites: true);
}
```

`hasTrait` et `addTrait` acceptent soit la chaîne d'identifiant, soit l'asset lui-même.

## Vérifier un trait de culture depuis une unité

`Actor` dispose d'un raccourci dédié pour cela, tant cette question revient couramment :

```csharp
if (actor.hasCultureTrait("hello_duellists")) { }
```

> [!TIP] Culture ou sous-espèce ?
> Les deux se transmettent, mais pas de la même façon. Un trait de **culture** se diffuse avec les cités et peut être adopté par quiconque les rejoint. Un trait de **sous-espèce** se transmet par la génétique et ne peut être obtenu autrement. "Les elfes tirent mieux à l'arc car c'est leur éducation" relève de la culture ; "les elfes tirent mieux grâce à leurs yeux" relève de la sous-espèce. Voir **[Traits de sous-espèce](#/nml/subspecies-traits)** :catnoted:.
