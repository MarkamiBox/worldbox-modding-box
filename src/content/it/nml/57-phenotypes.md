---
title: Fenotipi e genetica
group: Contenuto di gioco
subgroup: Tratti e genetica
icon: :wbgoldenbrain:
order: 115
---

# Fenotipi e genetica :wbgoldenbrain:

Nel sistema delle sottospecie di WorldBox, l'aspetto di una creatura non è vincolato a un singolo sprite immutabile. Le unità esprimono **fenotipi**: caratteristiche fisiche come sfumature della pelle, colore dei capelli, corna, accessori per la testa e lineamenti del viso che vengono ereditati dai genitori e mutano nel corso delle generazioni.

Questa pagina spiega come funziona `AssetManager.phenotype_library` e come registrare fenotipi e varianti genetiche personalizzate.

## Come funzionano i fenotipi

Ogni sottospecie possiede un pool assegnato di fenotipi:

| Proprietà | Cosa controlla |
| --- | --- |
| **`id`** | Identificatore univoco dell'asset del fenotipo |
| **`skin_colors`** | Indici della tavolozza disponibili per le tonalità della pelle |
| **`hair_colors`** | Indici della tavolozza disponibili per i colori dei capelli |
| **`head_pieces`** | Accessori, corna, orecchie o elementi del volto |
| **`chance`** | Peso di probabilità nella generazione di una sottospecie |

Quando le unità si riproducono, la prole combina i codici genetici dei genitori, con una probabilità di mutazione che introduce nuovi fenotipi nel patrimonio genetico :PES5_BigBrain:.

## Il codice

Questo codice registra un fenotipo di brace ardente con tonalità fiammeggianti e corna personalizzate:

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

## Aggiungere accessori e corna personalizzate

Gli accessori per la testa e le corna fanno affidamento sugli sprite sheet in `GameResources/actors/species/`:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

I relativi sprite sheet vanno inseriti nella cartella `GameResources/` della tua mod seguendo la convenzione di denominazione del gioco (vedi **[Sprite e risorse](#/nml/sprites-and-resources)**).

## Errori comuni da evitare

- **Liste di colori vuote**: Lasciare `colors_skin` o `colors_hair` vuoti su un fenotipo che prevede colori può far renderizzare le unità completamente nere o magenta.
- **Deriva genetica**: Nel corso di molte generazioni, i fenotipi rari possono estinguersi spontaneamente se la loro diffusione iniziale è troppo bassa. Mantieni bilanciato `chance` :PES2_HmmmmNoted:.
- **Abbina i tratti di sottospecie**: Per far corrispondere a un fenotipo visivo anche differenze di gioco funzionali, abbinalo a un tratto da **[Tratti di sottospecie](#/nml/subspecies-traits)**!
