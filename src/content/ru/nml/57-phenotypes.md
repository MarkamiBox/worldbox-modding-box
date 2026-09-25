---
title: Фенотипы и генетика
group: Игровой контент
subgroup: Черты и генетика
icon: :wbgoldenbrain:
order: 115
---

# Фенотипы и генетика :wbgoldenbrain:

В системе подвидов WorldBox внешний вид существ больше не привязан к единичному спрайту. Юниты выражают **фенотипы**: оттенки кожи, цвет волос, рога и украшения, которые наследуются от родителей и мутируют.

На этой странице показано, как использовать `AssetManager.phenotype_library` для регистрации собственных вариаций.

## Как устроены фенотипы

Каждый подвид обладает пулом доступных фенотипов:

| Свойство | Назначение |
| --- | --- |
| **`id`** | Уникальный ID ассета |
| **`skin_colors`** | Цвета палитры для кожи |
| **`hair_colors`** | Цвета палитры для волос |
| **`head_pieces`** | Рога, уши или головные украшения |
| **`chance`** | Вес вероятности при генерации |

При размножении потомство наследует генетику родителей с шансом на спонтанные мутации :PES5_BigBrain:.

## Код

Этот код регистрирует огненный фенотип с горящими оттенками кожи и рогами:

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

## Добавление рогов и украшений

Головные уборы и рога используют текстурные атласы в `GameResources/actors/species/`:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

Файлы текстур размещаются в папке `GameResources/` вашего мода (см. **[Спрайты и ресурсы](#/nml/sprites-and-resources)**).

## Подводные камни

- **Пустые списки цветов**: Пустые поля `colors_skin` окрасят существ в черный или пурпурный цвет.
- **Генетический дрейф**: Редкие фенотипы могут полностью исчезнуть спустя века симуляции. Сбалансируйте `chance` :PES2_HmmmmNoted:.
- **Связка с чертами**: Дополняйте визуальные отличия геймплейными свойствами из **[Черты подвидов](#/nml/subspecies-traits)**.
