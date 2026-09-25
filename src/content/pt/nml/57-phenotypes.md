---
title: Fenótipos e genética
group: Conteúdo do jogo
subgroup: Traços e genética
icon: :wbgoldenbrain:
order: 115
---

# Fenótipos e genética :wbgoldenbrain:

No sistema de subespécies do WorldBox, o visual de uma criatura não é estático. As criaturas exibem **fenótipos**: tons de pele, cores de cabelo, chifres e adornos que são herdados dos progenitores e sofrem mutações.

Esta página aborda o `AssetManager.phenotype_library` e a criação de fenótipos próprios.

## Como funcionam os fenótipos

Toda subespécie recebe uma seleção de fenótipos:

| Propriedade | Função |
| --- | --- |
| **`id`** | Identificador exclusivo do asset |
| **`skin_colors`** | Paleta de cores de pele |
| **`hair_colors`** | Paleta de cores de cabelo |
| **`head_pieces`** | Chifres, orelhas e adornos |
| **`chance`** | Probabilidade na criação da subespécie |

Na reprodução, os filhotes combinam a genética dos pais, com chances de mutações inéditas :PES5_BigBrain:.

## O código

Este código registra um fenótipo ardente com chifres e peles em tons de brasa:

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

## Adicionando chifres e acessórios

Acessórios de cabeça dependem de folhas de sprites em `GameResources/actors/species/`:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

Adicione as artes na pasta `GameResources/` do seu mod (consulte **[Sprites e recursos](#/nml/sprites-and-resources)**).

## Armadilhas a evitar

- **Listas vazias**: Deixar cores vazias fará os bonecos renderizarem na cor magenta ou preta.
- **Deriva genética**: Fenótipos escassos tendem a ser eliminados ao longo de séculos de simulação. Ajuste `chance` :PES2_HmmmmNoted:.
- **Integração com traços**: Una fenótipos visuais a mecânicas reais usando **[Traços de subespécie](#/nml/subspecies-traits)**.
