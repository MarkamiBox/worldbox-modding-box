---
title: Phénotypes et génétique
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbgoldenbrain:
order: 115
---

# Phénotypes et génétique :wbgoldenbrain:

Dans le système de sous-espèces de WorldBox, l'apparence d'une créature n'est plus figée dans un sprite unique. Les unités expriment des **phénotypes** : teintes de peau, couleurs de cheveux, cornes et accessoires hérités des parents et sujets aux mutations.

Cette page montre comment fonctionne `AssetManager.phenotype_library` pour créer vos propres variantes visuelles.

## Fonctionnement des phénotypes

Chaque sous-espèce dispose d'un panel de phénotypes :

| Propriété | Rôle |
| --- | --- |
| **`id`** | Identifiant unique de l'asset |
| **`skin_colors`** | Teintes de peau autorisées |
| **`hair_colors`** | Couleurs de cheveux possibles |
| **`head_pieces`** | Cornes, oreilles ou ornements de tête |
| **`chance`** | Poids lors de la génération |

Lors de la reproduction, les descendants combinent le patrimoine des parents avec un risque de mutation :PES5_BigBrain:.

## Le code

Ce code enregistre un phénotype de braise aux nuances écarlates et pourvu de cornes :

```csharp Mods/HelloBox/Code/HelloPhenotypes.cs
using System;
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloPhenotypes
    {
        public const string PHENOTYPE_ID = "phenotype_hello_ember";

        public static void Initialize()
        {
            if (AssetManager.phenotype_library.has(PHENOTYPE_ID)) return;

            // 1. Create the phenotype asset
            PhenotypeAsset ember = new PhenotypeAsset
            {
                id = PHENOTYPE_ID,
                localized_key = "phenotype_name_hello_ember",
                chance = 10
            };

            // 2. Set allowed skin tone and hair color ranges
            ember.colors_skin = new List<string> { "#FF4500", "#FF8C00", "#FFA500" };
            ember.colors_hair = new List<string> { "#8B0000", "#B22222", "#FF0000" };

            AssetManager.phenotype_library.add(ember);
        }

        /** Attach this phenotype to a subspecies */
        public static void ApplyToSubspecies(Subspecies pSubspecies)
        {
            if (pSubspecies == null) return;

            if (pSubspecies.data != null && pSubspecies.data.phenotypes != null)
            {
                if (!pSubspecies.data.phenotypes.Contains(PHENOTYPE_ID))
                {
                    pSubspecies.data.phenotypes.Add(PHENOTYPE_ID);
                }
            }
        }
    }
}
```

## Ajouter des cornes et accessoires

Les cornes et accessoires s'appuient sur des planches de sprites dans `GameResources/actors/species/` :

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

Déposez vos planches dans `GameResources/` en respectant la nomenclature (voir **[Sprites et ressources](#/nml/sprites-and-resources)**).

## Pièges à éviter

- **Listes de couleurs vides** : Des listes `colors_skin` ou `colors_hair` vides rendent les unités magenta ou noires.
- **Dérive génétique** : Les phénotypes très rares peuvent disparaître naturellement avec le temps. Équilibrez `chance` :PES2_HmmmmNoted:.
- **Lier aux traits de sous-espèce** : Pour donner un sens au gameplay, couplez votre phénotype à un trait de **[Traits de sous-espèce](#/nml/subspecies-traits)**.
