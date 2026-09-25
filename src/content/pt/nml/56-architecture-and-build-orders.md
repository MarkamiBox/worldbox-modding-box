---
title: Arquitetura e ordens de construção
group: Conteúdo do jogo
subgroup: Mundo e civilizações
icon: :wbhammer:
order: 181
---

# Arquitetura e ordens de construção :wbhammer:

Quando uma cidade é fundada, ela não ergue construções aleatoriamente. Cada raça segue um padrão arquitetônico e uma ordem rígida de expansão: fogueira, tendas, casas de madeira, torres de vigia, moinhos e prefeituras.

Se você adicionou uma estrutura em **[Construções personalizadas](#/nml/custom-buildings)**, entender essa lógica fará com que os cidadãos a construam espontaneamente sem poderes divinos :PESgn_Noice:.

## As duas bibliotecas

O desenvolvimento urbano é controlado por duas bibliotecas integradas:

| Biblioteca | Asset | Finalidade |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Estilos visuais de construção (humanos, elfos, orcs, anões) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | A lista de avanço que a cidade executa |

O asset de arquitetura vincula papéis gerais a IDs específicos (qual construção atua como `"house"`, `"hall"` ou `"tower"`).

O asset de ordem de construção programa a ordem em que as obras ocorrem conforme a população, as zonas territoriais e os recursos se acumulam.

## Entendendo as ordens de construção

Cada item em `AssetManager.city_build_orders` especifica:

- **`building_id`**: Qual ID ou papel genérico construir.
- **`requirements_population`**: População mínima necessária na cidade.
- **`requirements_buildings`**: Estruturas pré-requisito (ex. prefeitura antes do quartel).
- **`requirements_zones`**: Quantidade de blocos territoriais sob controle da cidade.
- **`max`**: Limite máximo dessa estrutura em uma mesma cidade.

## O código

Este código registra um santuário de **[Construções personalizadas](#/nml/custom-buildings)** dentro da lista de obras civis da cidade:

```csharp Mods/HelloBox/Code/HelloBuildOrders.cs
using System;
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBuildOrders
    {
        public const string ORDER_ID = "order_hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.city_build_orders.has(ORDER_ID)) return;

            // 1. Create a build order rule for the shrine
            CityBuildOrderAsset shrineOrder = new CityBuildOrderAsset
            {
                id = ORDER_ID,
                building_id = "hello_shrine",
                requirements_population = 15,
                requirements_zones = 10,
                max = 1,
                priority = 5
            };

            AssetManager.city_build_orders.add(shrineOrder);

            // 2. Insert into the human build order list
            CityBuildOrderAsset humanOrder = AssetManager.city_build_orders.get("human");
            if (humanOrder != null && humanOrder.list != null)
            {
                if (!humanOrder.list.Contains(ORDER_ID))
                {
                    humanOrder.list.Add(ORDER_ID);
                }
            }
        }
    }
}
```

## Criando estilos arquitetônicos personalizados

Ao criar uma civilização inédita, registre um novo `ArchitectureAsset`:

```csharp
ArchitectureAsset arch = new ArchitectureAsset
{
    id = "hello_style"
};

arch.buildings["bonfire"] = "bonfire_human";
arch.buildings["tent"] = "tent_human";
arch.buildings["hall_0"] = "hall_human_0";
arch.buildings["hall_1"] = "hall_human_1";
arch.buildings["shrine"] = "hello_shrine";

AssetManager.architecture_library.add(arch);
```

Em seguida, atribua `architecture = "hello_style"` na definição de raça ou reino.

## Armadilhas a evitar

- **Custos de recursos**: Se sua estrutura exige minérios raros não estocados, os operários demarcarão o canteiro e aguardarão eternamente. Confira os custos em **[Construções personalizadas](#/nml/custom-buildings)**.
- **Prioridade de ordens**: Ordens com `priority` maior têm preferência quando vários limites são atingidos simultaneamente.
- **Zonas insulares**: Se `requirements_zones` for maior do que o tamanho da ilha, a cidade jamais conseguirá construí-la :PES2_HmmmmNoted:.
