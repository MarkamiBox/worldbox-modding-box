---
title: Phenotypes & genetics
group: Game Content
subgroup: Traits & Genetics
icon: :wbgoldenbrain:
order: 115
---

# Phenotypes & genetics :wbgoldenbrain:

In WorldBox's subspecies system, a creature's appearance is not hardcoded to a single sprite. Units express **phenotypes**: physical traits like skin tones, hair colors, head accessories, horns, and facial features that are inherited from parents and mutate across generations.

This page explains how `AssetManager.phenotype_library` works and how to register your own custom phenotypes and genetic variants.

## How phenotypes work

Every creature subspecies has an assigned pool of phenotypes:

| Property | What it controls |
| --- | --- |
| **`id`** | Unique identifier for the phenotype asset |
| **`skin_colors`** | Available palette indices for skin shades |
| **`hair_colors`** | Available palette indices for hair colors |
| **`head_pieces`** | Accessories, horns, ears, or facial features |
| **`chance`** | Probability weight when rolling a new subspecies |

When units breed, offspring combine the genetic codes of their parents, with a small chance for mutations to introduce new phenotypes into the gene pool :PES5_BigBrain:.

## The code

This code registers a glowing ember phenotype with fiery skin tones and custom head horns:

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

## Adding custom head pieces and accessories

Head accessories and horns rely on sprite sheet textures in `GameResources/actors/species/`:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

Matching sprite sheets go in your mod's `GameResources/` folder following the game's naming format (see **[Sprites & resources](#/nml/sprites-and-resources)**).

## Pitfalls to avoid

- **Empty color lists**: Leaving `colors_skin` or `colors_hair` empty on a phenotype that expects color selection can cause units to render as magenta or pitch black.
- **Genetic drift**: Over many generations in a simulation, rarer phenotypes can naturally die out if their initial distribution is too small. Keep `chance` balanced :PES2_HmmmmNoted:.
- **Pair with subspecies traits**: To make a visual phenotype match functional gameplay differences, pair it with a trait from **[Subspecies traits](#/nml/subspecies-traits)**!
