---
title: Fenotipos y genética
group: Contenido del juego
subgroup: Rasgos y genética
icon: :wbgoldenbrain:
order: 115
---

# Fenotipos y genética :wbgoldenbrain:

En el sistema de subespecies de WorldBox, la apariencia de una criatura no se limita a un único sprite fijo. Las unidades manifiestan **fenotipos**: rasgos físicos como tonos de piel, colores de pelo, accesorios cefálicos, cuernos y facciones faciales que se heredan de los progenitores y mutan a lo largo de las generaciones.

Esta página detalla el funcionamiento de `AssetManager.phenotype_library` y cómo registrar variantes genéticas y fenotipos propios.

## Cómo funcionan los fenotipos

Cada subespecie cuenta con un repertorio asignado de fenotipos:

| Propiedad | Qué controla |
| --- | --- |
| **`id`** | Identificador único del asset de fenotipo |
| **`skin_colors`** | Índices de paleta disponibles para tonos de piel |
| **`hair_colors`** | Índices de paleta disponibles para tonos de cabello |
| **`head_pieces`** | Accesorios, cuernos, orejas o detalles faciales |
| **`chance`** | Probabilidad estadística al generar una subespecie |

Al reproducirse, la descendencia combina los genomas paternos con un margen de mutación que incorpora nuevos fenotipos al acervo genético :PES5_BigBrain:.

## El código

Este código registra un fenotipo ígneo con tonos de piel ardientes y cuernos personalizados:

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

## Añadir accesorios y cornamentas personalizadas

Los accesorios y cuernos se basan en hojas de sprites (sprite sheets) ubicadas en `GameResources/actors/species/`:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

Dichas hojas de sprites deben ubicarse en la carpeta `GameResources/` de tu mod siguiendo el formato estándar (consulta **[Sprites y recursos](#/nml/sprites-and-resources)**).

## Errores comunes que debes evitar

- **Listas de colores vacías**: Dejar `colors_skin` o `colors_hair` vacíos en un fenotipo con selector de color provocará que las unidades se rendericen en magenta o negro opaco.
- **Deriva genética**: Tras muchas generaciones, los fenotipos raros pueden extinguirse si su población inicial es reducida. Mantén equilibrado el valor de `chance` :PES2_HmmmmNoted:.
- **Asocia rasgos de subespecie**: Para que una variación visual se traduzca en mecánicas jugables, vincúlala con rasgos de **[Rasgos de subespecie](#/nml/subspecies-traits)**.
