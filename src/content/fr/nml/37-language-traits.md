---
title: Traits de langue
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbconfused:
order: 112
---

# Traits de langue :wbconfused:

Une **langue** appartient à des cités et des royaumes, évolue au fil de sa diffusion et sert de support à la rédaction des **livres**. Un trait de langue caractérise la parole et l'écrit en eux-mêmes.

C'est le plus compact des sept systèmes de traits et celui qui dispose du point d'ancrage le plus singulier : du code déclenché dès lors que quelqu'un **lit un livre** rédigé dans cette langue. Oui, vraiment :wbscroll:.

| | |
| --- | --- |
| Bibliothèque | `AssetManager.language_traits` |
| Classe | `LanguageTrait` |
| Groupes | `AssetManager.language_trait_groups`, classe `LanguageTraitGroupAsset` |
| Propriétaire à l'exécution | `Language`, dans `World.world.languages` |
| Préfixe de localisation | `language_trait_` |
| Dossier d'icônes par défaut | `ui/Icons/language_traits/` |

## En enregistrer un

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // ce que vaut ce trait. Voir ci-dessous
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Les `base_stats` de langue parviennent **effectivement** aux unités : `Actor.updateStats()` fusionne `language.base_stats` dans chaque locuteur. Consultez l'ordre de fusion dans la **[Référence des stats](#/nml/stats)**.

## Le crochet de lecture de livre

`read_book_trait_action` est le champ propre aux seuls traits de langue. Il s'exécute dès qu'une unité termine la lecture d'un livre rédigé dans cette langue :

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // le jeu de base réutilise `value` comme probabilité pour ce hook

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

C'est exactement ainsi que fonctionnent les écrits maudits et bénis du jeu de base : `words_of_madness` tire contre `value` et confère le trait `madness`, `cursed_font` applique un statut, `font_of_gods` en octroie un meilleur.

Deux habitudes à calquer sur le jeu de base :

- **Lisez la probabilité sur `pTrait.value`, jamais depuis une constante brute.** Le trait vous est passé expressément pour que le même délégué puisse servir plusieurs traits d'intensités variées.
- **Interrompez immédiatement pour les unités censées être immunisées.** Toutes les implémentations vanilla contrôlent d'abord `evil` ou `blessed`.

## Votre propre type de livre

Le jeu définit les formats de livres dans `AssetManager.book_types` :

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset book = new BookTypeAsset
            {
                id = ALMANAC,
                name = "book_type_" + ALMANAC,
                description = "book_type_info_" + ALMANAC,
                rarity = 5
            };
            AssetManager.book_types.add(book);
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## Le champ `value`

`value` figure sur toutes les classes de traits, mais c'est pour les langues qu'il s'avère le plus exploité. Le jeu de base lui attribue deux usages distincts :

| Rôle | Exemple |
| --- | --- |
| Qualité de la langue | `melodic` et `stylish_writing` utilisent `value = 3f` |
| Probabilité du hook de lecture | `words_of_madness` utilise `value = 0.1f` |

Rien ne vous contraint à choisir l'un plutôt que l'autre ; fixez une logique par trait et tenez-vous-y.

## Opposés

Les traits de langue s'organisent en paires opposées plus que tout autre système, car une langue dispose d'une grammaire rigoureuse ou n'en a pas :

```csharp
trait.addOpposite("scribble");
```

Déclarez-le des deux côtés, à la manière dont vanilla déclare `scribble` et `nicely_structured_grammar` opposés l'un à l'autre.

## Les groupes vanilla

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Pour créer votre propre onglet : voir **[Groupes de traits & onglets](#/nml/trait-groups)**, avec `AssetManager.language_trait_groups` et `LanguageTraitGroupAsset`.

## Les textes

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Distribuer le trait

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

L'objet `Language` propose également `cities`, `kingdoms` et `books`, indispensables lorsque votre code doit surveiller l'expansion géographique d'une langue.

> [!TIP] Les livres sont un vecteur sous-exploité
> Un livre rédigé dans votre langue constitue un moyen lent et organique de diffuser un trait ou un statut. Il transite par les bibliothèques, s'étend sur des générations et le joueur le voit opérer. Presque personne ne crée de mod sur cet aspect, ce qui en fait un sujet de prédilection :PES4_Classy:.

## Nouvelles langues obtenant un trait d'elles-mêmes

En plus de l'attribuer vous-même, un trait de langue peut définir `spawn_random_trait_allowed` pour être tiré au sort lors de la formation d'une nouvelle langue, de la même manière qu'une culture tire ses traits de départ. Le même piège que sur toutes les autres pages de traits :

> [!WARNING] `spawn_random_trait_allowed` n'est lu qu'une seule fois, au démarrage
> Les nouvelles langues tirent leurs traits de départ d'un pool que `BaseTraitLibrary.linkAssets()` construit pendant le chargement du jeu, avant que votre mod n'existe. Définir le drapeau sur votre trait ne change rien en soi : votre trait n'est jamais dans ce pool et n'apparaît jamais par hasard sur une nouvelle langue. Ajoutez-le vous-même, pondéré comme le fait le jeu vanilla :
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.language_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` est `protected`, donc cela compile contre l'assembly rendue publique avec laquelle NML compile déjà votre mod. `spawn_random_rate` vaut `5` par défaut : augmentez-le et le trait apparaîtra plus souvent.
