---
title: Livres
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbscroll:
order: 187
---

# Livres :wbscroll:

Les unités écrivent des livres, les villes les gardent, et d'autres unités les lisent et en ressortent un peu changées. Un type de livre, c'est une nouvelle sorte de livre dans ce cycle : qui l'écrit, comment il s'appelle, à quoi ressemble la couverture, et ce que sa lecture vous fait.

La page **[Traits de langue](#/nml/language-traits)** en crée déjà un petit, l'Almanach de Braise. Cette page reprend le même livre et le termine : ses propres titres, une vraie récompense, et quelque chose qui se passe à la lecture.

## Comment naît un livre

Rien ici n'a besoin d'un patch, il faut juste connaître le cycle :

1. Une unité décide d'écrire. Le jeu rassemble tous les types de livre dont le `requirement_check` passe pour cette unité.
2. Chacun entre dans un sac `writing_rate` fois (ou `rate_calc` fois, si vous le définissez), **10 au maximum**, et un est tiré.
3. Le livre a besoin d'un bâtiment avec une place libre pour les livres dans la **ville** de l'auteur. Pas de bibliothèque, pas de livre.
4. Le titre vient du générateur de noms de `name_template`, et la couverture du dossier de `path_icons`.
5. Plus tard, quelqu'un le lit et reçoit les récompenses ci-dessous.

Comme le jeu relit `book_types.list` à chaque fois, un type de livre n'a besoin que de `add()`. Pas de pools, pas de post-init. Une rare bonne surprise :PESgn_Neat:.

## Le code

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

Ce fichier **remplace** le `HelloBooks.cs` de la page des traits de langue, c'est la même classe en plus grand. `HelloBooks.Initialize()` passe après le trait et le statut qu'elle utilise.

## Ce que rapporte la lecture

Les nombres de `base_stats` ne sont pas un bonus qui s'estompe. Chaque lecture les distribue une fois :

| Statistique | Ce que reçoit le lecteur |
| --- | --- |
| `happiness` | Autant de bonheur, sous forme d'événement "vient de lire un livre". Le négatif marche aussi, pour les livres déprimants |
| `experience` | Autant d'expérience |
| `mana` | Autant de mana |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Ajoutés au lecteur **pour toujours**. À chaque lecture, encore |

La dernière ligne est la plus puissante. Un livre qui donne `intelligence = 1` rend une ville lectrice plus intelligente à chaque génération, alors gardez ça petit. Un livre à +10, c'est un royaume de génies avant l'an 50 :wbgenius:.

Les traits de langue et de culture peuvent changer les deux premières : une langue avec `beautiful_calligraphy` rend le bonheur plus grand, et une culture avec `reading_lovers` rend les livres tristes joyeux.

## Les champs qui comptent

| Champ | Ce qu'il fait |
| --- | --- |
| `name_template` | Le générateur de noms pour les titres. Vanilla : `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | Son poids quand un auteur choisit un type. Vanilla utilise 1 à 3 |
| `rate_calc` | Une méthode qui renvoie le poids à la place, comme le manuel de guerre vanilla avec le `warfare` de l'auteur. Toujours 10 au maximum |
| `requirement_check` | Qui a le droit de l'écrire. `null` = tout le monde |
| `read_action` | Votre propre code, une fois par lecture |
| `path_icons` | Un dossier sous `books/book_icons/`, lu comme une liste d'images. Une est choisie par livre |
| `color_text` | La couleur du titre dans l'interface |
| `save_culture` / `save_religion` | Si le livre retient la culture et la religion de l'auteur. Les deux actifs par défaut, et ils comptent pour les livres qui répandent une foi |

## Le générateur de titres

Les titres utilisent le style dictionnaire de **[Générateurs de noms](#/nml/name-generators)**. Un modèle est une liste de clés du dictionnaire, et chaque clé choisit un mot dans sa liste :

- `addDictPart("almanac", "Almanac,Handbook,Notes")` crée une clé avec trois mots possibles.
- `addTemplate("almanac,of,fire")` colle un mot de chaque clé : "Handbook of Ash".
- Les mots comme `$unit$` et `$city$` sont des emplacements. Un **replacer** les remplit avec le vrai nom ou la vraie ville de l'auteur. Sans le replacer qui va avec, ils sortent tels quels, `$unit$`, sur la couverture :wbfacepalm:.

Cloner `$base_book_template$` est le raccourci : il a déjà les petits mots (`of`, `and`, `about`, `the`...), tous les emplacements, et le nettoyage de titres du jeu.

## Le texte

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

Les clés sont fixes : `book_type_<id>` et `book_type_info_<id>`. Les titres eux-mêmes sont générés, donc ils n'ont pas de clés.

## Vos propres couvertures

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` est un **dossier**, avec le `/` à la fin. Un seul PNG suffit, il doit juste être dedans. Pendant les tests, empruntez un dossier vanilla comme `fable/`.

Pour le voir marcher, créez un monde, laissez une ville avec votre trait grandir jusqu'à construire une bibliothèque, et ouvrez les livres de la ville. Ça prend du temps, c'est un livre :PES2_Shrug:.
