---
title: Lire le code du jeu (dnSpy)
group: Vue d'ensemble
subgroup: Outils externes et configuration
icon: :wbnerd:
order: 7
---

# Lire le code du jeu :wbnerd:

Toutes les réponses sur le modding de WorldBox sont déjà écrites : elles sont directement dans le jeu :wbbru:. **dnSpy** (ou **ILSpy**) retransforme le fichier compilé du jeu en C# parfaitement lisible, ce qui te permet de vérifier avec exactitude comment s'appelle une méthode, ce qu'elle prend en paramètre et ce qu'elle fait vraiment.

C'est le plus grand saut possible entre "copier des bouts de code au pif" et "modder pour de vrai" :3074-woah:.

## Ouvrir le jeu

1. Télécharge [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases) (ou [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases), même idée, juste des boutons différents).
2. Ouvre ce fichier :

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

Ce fichier unique contient tout le code du jeu. Sur la gauche, tu as l'arborescence de chaque classe : `Actor`, `AssetManager`, `GodPower`, `ScrollWindow`, absolument toutes.

## Les quatre choses que tu vas faire en boucle

### 1. Chercher une classe

`Ctrl+Shift+K` cherche les types. Tapez `ActorTrait`, ouvrez-le, et vous voyez chaque champ que vous pouvez définir, avec son type et sa valeur par défaut :

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

Cette liste *est* la documentation de la page **[Traits personnalisés](#/nml/custom-traits)**. Lisez aussi les **types** : `rate_birth` est un `int`, donc `rate_birth = 0.5f` ne compile pas. Même astuce pour `ItemAsset`, `BuildingAsset`, `StatusAsset`, n'importe quoi.

### 2. Vérifier la vraie signature d'une méthode

Deviner les noms de méthodes au hasard, c'est le meilleur moyen de perdre une heure sur une bête erreur de compilation. Cherche plutôt directement. Taper `addTrait` dans `Actor` donne :

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

Tu sais maintenant qu'elle prend une chaîne, renvoie un booléen et possède un second argument optionnel.

### 3. Voir comment le jeu s'y prend

C'est la meilleure astuce. Tu veux créer une loi du monde qui fonctionne ? Trouve `WorldLawLibrary`, ouvre `init()`, et lis ce que les développeurs ont eux-mêmes écrit :

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

Copie cette forme, change l'id et l'icône, et ta loi marchera. Chaque `*Library.init()` du jeu est un tutoriel gratuit pour ce type d'asset précis.

### 4. Trouver tous les IDs

Les IDs sont des chaînes de caractères, et une chaîne erronée échoue en silence sans prévenir. C'est dans les méthodes `init()` qu'ils sont tous rangés : `TileLibrary.init()` contient tous les IDs de terrain, `ItemLibrary.init()` toutes les armes, `ActorAssetLibrary.init()` chaque créature.

## public, internal et toi

Pendant ta lecture, tu verras trois mots placés devant les méthodes :

| Mot | Ce que ça implique pour toi |
| --- | --- |
| `public` | Tu peux l'appeler. Toujours. |
| `internal` | Uniquement appelable si tu compiles avec une version **publicized** de `Assembly-CSharp.dll` |
| `private` | Impossible à appeler directement. Trouve la méthode publique qui l'utilise, ou patche-la (voir **[Patchs Harmony](#/nml/harmony-patches)**) |

Une DLL "publicized" est une copie dans laquelle chaque membre a été rendu public. La plupart des moddeurs WorldBox en utilisent une, et c'est pour ça qu'un code comme `actor.getHit(...)` compile chez eux mais pas chez toi. Si un truc refuse de compiler et que dnSpy indique `internal`, l'explication est toute trouvée.

> [!TIP] Garde-le ouvert pendant que tu écris
> Pas question de "lire tout le jeu d'une traite", personne ne fait ça. Ouvre-le à côté de ton éditeur et cherche chaque nom au fur et à mesure. Deux secondes là-dedans valent mieux que vingt minutes de galère sur une erreur de compilation incompréhensible :PES_ThumbsUp:.

Quand tu as juste besoin du nom d'une méthode et de sa signature, la **[Recherche de méthodes](#/tools/methods)** sur ce site est plus rapide : chaque méthode du jeu y est répertoriée, avec la mention `internal` déjà indiquée. Reviens sur dnSpy quand tu as besoin de lire ce que la méthode fait *vraiment* - c'est la partie qu'aucun index ne pourra jamais t'offrir.
