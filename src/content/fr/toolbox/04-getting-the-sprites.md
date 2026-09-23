---
title: Extraire les graphismes du jeu (AssetRipper)
group: Vue d'ensemble
subgroup: Outils externes et configuration
icon: :wbgeneralartist:
order: 8
---

# Extraire les graphismes du jeu :wbgeneralartist:

Le code te dit *quoi* écrire. **AssetRipper** te montre à quoi ressemblent les graphismes et, bien plus important encore, **quel est leur chemin d'accès exact**.

Chaque icône, unité, bâtiment et effet dans WorldBox est chargé via un chemin sous forme de texte, comme `ui/Icons/iconFly`. Si tu te trompes de chemin, ton bouton devient un trou invisible dans l'interface. AssetRipper te permet d'arrêter de deviner au hasard.

> [!TIP] Si vous n'avez besoin que du chemin, vous n'avez besoin de rien de tout cela
> La **[Recherche d'icônes](#/tools/icons)** sur ce site a été construite exactement à partir de cet export : chaque chemin du jeu, consultable facilement. Extrayez le jeu vous-même quand vous voulez *voir* les graphismes, choisir la bonne taille ou assortir la palette. C'est à cela que sert le reste de cette page :PES4_HappyAwesome:.

## Exporter le jeu

1. Télécharge [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases).
2. Indique-lui ton dossier WorldBox (celui qui contient `worldbox_Data`).
3. Exporte le tout dans le dossier de ton choix. Ça prend quelques minutes et quelques gigas :pepehang:.

Tu obtiens un projet Unity. La seule partie qui t'intéresse vraiment est le dossier exporté `Resources`, qui reproduit l'arborescence exacte demandée par le jeu en pleine exécution.

## Transformer un fichier en chemin d'accès

La règle est enfantine : **le chemin d'accès correspond à son emplacement sous `Resources`, sans l'extension de fichier.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

Voici les dossiers dont tu te serviras le plus souvent :

| Dossier | Ce qu'il contient |
| --- | --- |
| `ui/Icons/` | Toutes les petites icônes d'interface : traits, pouvoirs, boutons |
| `ui/Icons/worldrules/` | Les icônes des lois du monde |
| `actors/` | Les unités et leurs différentes étapes d'animation |
| `buildings/` | Les maisons, arbres, minéraux |
| `effects/` | Les explosions, projectiles, sprites d'effets de statut |

## L'utiliser dans ton mod

Repère une icône qui te plaît dans l'export, note son chemin et utilise-la directement, sans avoir à copier le moindre fichier : elle est déjà dans le jeu :

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

Ou définis-la directement sous forme de texte sur un asset :

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## Respecter le style pour tes propres créations

Si tu dessines tes propres sprites, ouvre d'abord un fichier vanilla pour copier trois éléments cruciaux :

- **La taille.** Les icônes de traits et de pouvoirs sont minuscules, en général entre 16 et 32 px. Ouvres-en une et reproduis cette échelle.
- **La palette.** WorldBox utilise une palette restreinte aux teintes douces. Prélève tes couleurs directement sur un sprite officiel et ton icône ne jurera pas avec le reste du jeu :PES3_BobRoss:.
- **Le pivot.** Les unités et bâtiments reposent sur le sol, leur point de pivot est donc en bas au centre. C'est la valeur `PivotY: 0.0` dans ton fichier `sprites.json` (voir **[Sprites et ressources](#/nml/sprites-and-resources)**).

Dépose ensuite ton PNG dans `GameResources/` avec la même arborescence de dossiers, et il sera chargé exactement comme un sprite vanilla :

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
