---
title: Phänotypen & Genetik
group: Spielinhalte
subgroup: Eigenschaften & Genetik
icon: :wbgoldenbrain:
order: 115
---

# Phänotypen & Genetik :wbgoldenbrain:

Im Unterarten-System von WorldBox ist das Aussehen einer Kreatur nicht an einen starren Sprite gebunden. Einheiten prägen **Phänotypen** aus: körperliche Merkmale wie Hauttöne, Haarfarben, Hörner und Kopfschmuck, die vererbt werden und mutieren können.

Diese Seite erklärt `AssetManager.phenotype_library` und die Registrierung eigener Phänotypen.

## Wie Phänotypen funktionieren

Jede Unterart besitzt einen Pool verfügbarer Phänotypen:

| Eigenschaft | Funktion |
| --- | --- |
| **`id`** | Eindeutige Kennung des Phänotyp-Assets |
| **`skin_colors`** | Palettenfarben für die Haut |
| **`hair_colors`** | Palettenfarben für das Haar |
| **`head_pieces`** | Kopfbedeckungen, Hörner, Ohren oder Verzierungen |
| **`chance`** | Wahrscheinlichkeitsgewichtung beim Generieren |

Bei der Fortpflanzung erben Nachkommen Gene beider Eltern, wobei Mutationen neue Phänotypen einbringen können :PES5_BigBrain:.

## Der Code

Dieser Code registriert einen Glut-Phänotyp mit feurigen Hauttönen und Hörnern:

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

## Eigene Hörner und Kopfbedeckungen hinzufügen

Kopfbedeckungen und Hörner nutzen Sprite-Sheets in `GameResources/actors/species/`:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

Speichere die Texturen im `GameResources/`-Ordner deiner Mod (siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**).

## Typische Fallstricke

- **Leere Farblisten**: Ist `colors_skin` oder `colors_hair` leer, rendert Unity Einheiten oft als grelles Magenta oder Schwarz.
- **Gendrift**: Seltene Phänotypen können über Generationen hinweg aussterben, wenn die Anfangspopulation zu klein ist. Balanciere `chance` bedacht :PES2_HmmmmNoted:.
- **Mit Unterart-Merkmalen kombinieren**: Ergänze optische Varianten mit Mechaniken aus **[Unterart-Merkmale](#/nml/subspecies-traits)**.
