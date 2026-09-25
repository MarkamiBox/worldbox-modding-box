---
title: Architecture et ordres de construction
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbhammer:
order: 181
---

# Architecture et ordres de construction :wbhammer:

Quand une ville est fondée, elle ne place pas ses bâtiments au hasard. Chaque race suit un style architectural et un ordre de construction précis : d'abord le feu de camp, puis les tentes, les maisons en bois, les tours de garde, les moulins et les hôtels de ville.

Si vous avez conçu un bâtiment dans **[Bâtiments personnalisés](#/nml/custom-buildings)**, comprendre cette logique permet aux citoyens de l'ériger d'eux-mêmes sans pouvoirs divins :PESgn_Noice:.

## Les deux bibliothèques

L'urbanisme des civilisations s'appuie sur deux bibliothèques complémentaires :

| Bibliothèque | Asset | Rôle |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Styles graphiques des bâtiments (humains, elfes, orcs, nains) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | La liste de progression suivie par la cité |

Une architecture associe des rôles génériques à des identifiants d'assets concrets (quel bâtiment sert de `"house"`, `"hall"` ou `"tower"`).

Un ordre de construction régit la séquence de placement à mesure que la population, le territoire et les stocks grandissent.

## Comprendre les ordres de construction

Chaque entrée dans `AssetManager.city_build_orders` définit :

- **`building_id`** : Quel bâtiment poser (ou rôle générique).
- **`requirements_population`** : Nombre minimal d'habitants requis.
- **`requirements_buildings`** : Prérequis de structures (ex. mairie avant caserne).
- **`requirements_zones`** : Nombre de parcelles de territoire nécessaires.
- **`max`** : Quantité maximale autorisée dans une seule ville.

## Le code

Ce code s'intègre à `AssetManager.city_build_orders` pour insérer un sanctuaire issu de **[Bâtiments personnalisés](#/nml/custom-buildings)** dans les plans d'expansion :

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

## Créer un style architectural personnalisé

Pour une nouvelle civilisation, enregistrez un `ArchitectureAsset` inédit :

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

Définissez ensuite `architecture = "hello_style"` dans votre race ou royaume.

## Pièges à éviter

- **Coûts en ressources** : Si votre bâtiment requiert des matériaux rares non disponibles, les bâtisseurs réserveront l'emplacement et attendront sans fin. Vérifiez vos coûts dans **[Bâtiments personnalisés](#/nml/custom-buildings)**.
- **Priorité des ordres** : Les ordres ayant une `priority` plus haute sont traités en premier quand plusieurs seuils sont franchis.
- **Attention aux zones** : Si `requirements_zones` dépasse la surface d'une île, une ville isolée ne pourra jamais le bâtir :PES2_HmmmmNoted:.
