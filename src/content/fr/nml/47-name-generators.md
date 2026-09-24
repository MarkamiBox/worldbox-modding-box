---
title: Générateurs de noms
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbscroll:
order: 186
---

# Générateurs de noms :wbscroll:

Chaque nom de WorldBox sort d'un générateur : unités, villes, royaumes (kingdom), clans, guerres (war), livres (book). Vos créatures peuvent avoir le leur, pour qu'un village d'esprits de braise soit plein d'Ashra et de Cindox au lieu d'emprunter des noms humains.

## D'où vient un nom

Trois étapes, de la créature jusqu'aux lettres :

| Étape | Asset | Ce qu'il contient |
| --- | --- | --- |
| La créature | `ActorAsset.name_template_sets` | Une liste d'ids d'**ensembles de noms**. Un est choisi par culture |
| L'ensemble | `NameSetAsset` (`name_sets`) | Quel générateur utiliser pour chaque type de chose : `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| Le générateur | `NameGeneratorAsset` (`name_generator`) | Comment le nom est vraiment construit |

Pour renommer toute une espèce, vous faites donc un générateur, un ensemble qui l'utilise, et vous faites pointer la créature vers l'ensemble.

## Trois façons de construire un nom

Un générateur marche dans l'un de trois styles, et le jeu choisit selon les champs que vous avez remplis :

- **Groupes de morceaux.** Une liste de groupes, et un morceau au hasard de chacun est collé au suivant. Le plus simple, et celui de cette page.
- **Dictionnaire.** Des mots entiers pris dans des listes nommées et mis en phrase. C'est comme ça que les guerres et les livres ont des titres comme "Bloody Hatred". Voir **[Types de guerre](#/nml/war-types)** et **[Livres](#/nml/books)**.
- **Onomastique.** Un format de texte compact que la plupart des civilisations vanilla utilisent, et qui laisse aussi les noms évoluer dans une culture. C'est puissant et je ne commencerais pas par là : copiez-en un de `NameGeneratorLibrary` si vous le voulez, et changez les syllabes.

## Le code

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

Ensuite, sur votre créature de **[Acteurs personnalisés](#/nml/custom-actors)** :

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` va **avant** les acteurs dans `OnModLoad`, puisque l'acteur pointe vers l'ensemble.

> [!WARNING] Remplissez chaque case de l'ensemble
> Une culture demande à son ensemble un générateur par type de chose. Une case `city` vide veut dire que le jeu cherche un générateur appelé `""`, reçoit `null`, et que la première ville fondée par vos créatures emporte le jeu avec elle. Mettez le même générateur partout si vous n'avez rien de mieux :PESgn_Stop:.

## Les mots des modèles

Un modèle est une liste de mots séparés par des virgules. Pour les générateurs à groupes de morceaux, voici les utiles :

| Mot | Ce qu'il ajoute |
| --- | --- |
| `part_group` / `Part_group` | Un morceau de chaque groupe `addPartGroup`. Le P majuscule met la première lettre en majuscule |
| `part_group2`, `part_group3` | Pareil pour `addPartGroup2` et `addPartGroup3`, pour un deuxième ou troisième mot |
| `space` | Une espace, donc `Part_group,space,Part_group2` fait un prénom et un nom |
| `vowel` / `consonant` | Une lettre de vos `vowels` / `consonants` |
| `number` | Un chiffre de 0 à 9. Pour les robots, j'imagine |

Appelez `addTemplate` plusieurs fois et le jeu choisit un modèle au hasard pour chaque nom.

## Tester sans attendre les bébés

`NameGenerator.getName` est public, vous pouvez donc écrire dix noms dans le log au chargement :

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

Si la moitié ressemble à un chat qui a marché sur le clavier, vos groupes sont trop longs. Des morceaux courts, plus de groupes. Les noms qui sont sur la liste noire du jeu sont jetés et retirés, donc vous n'en verrez jamais :PES5_Noted:.

Pour des titres en mots entiers (guerres, livres, devises), c'est le style dictionnaire qu'il vous faut, et les deux pages suivantes en construisent un chacune.
