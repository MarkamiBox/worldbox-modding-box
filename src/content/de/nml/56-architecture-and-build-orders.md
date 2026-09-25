---
title: Architektur & Bauaufträge
group: Spielinhalte
subgroup: Welt & Zivilisationen
icon: :wbhammer:
order: 181
---

# Architektur & Bauaufträge :wbhammer:

Wird eine Stadt gegründet, platziert sie Gebäude nicht willkürlich auf der Karte. Jedes Volk folgt einem Baustil und einer festen Baureihenfolge: zuerst das Lagerfeuer, dann Zelte, Holzhäuser, Wachtürme, Windmühlen und Rathäuser.

Wenn du ein Gebäude in **[Eigene Gebäude](#/nml/custom-buildings)** erstellt hast, erfährst du hier, wie Städte es selbstständig ohne Gottesmächte errichten :PESgn_Noice:.

## Die zwei Bibliotheken

Das Bauwesen der Völker wird über zwei Bibliotheken geregelt:

| Bibliothek | Asset | Zweck |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Optische Baustile (Menschen, Elfen, Orks, Zwerge) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | Die Bau-Checkliste, nach der Städte expandieren |

Ein Architektur-Asset ordnet generische Gebäuderollen konkreten Asset-IDs zu (welche ID z. B. als `"house"`, `"hall"` oder `"tower"` dient).

Ein Bauauftrags-Asset bestimmt, wann und in welcher Reihenfolge gebaut wird, wenn Bewohner, Zonen und Ressourcen anwachsen.

## Aufbau von Bauauftrags-Assets

Jeder Eintrag in `AssetManager.city_build_orders` definiert:

- **`building_id`**: Welches Gebäude platziert werden soll.
- **`requirements_population`**: Mindestanzahl an Bürgern in der Stadt.
- **`requirements_buildings`**: Vorausgesetzte Gebäude (z. B. Rathaus vor Kaserne).
- **`requirements_zones`**: Anzahl beanspruchter Zonenfelder der Stadt.
- **`max`**: Maximale Anzahl dieses Gebäudes pro Stadt.

## Der Code

Dieser Code klinkt sich in `AssetManager.city_build_orders` ein, um einen eigenen Schrein aus **[Eigene Gebäude](#/nml/custom-buildings)** in die Bauaufträge aufzunehmen:

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

## Eigene Architekturstile erstellen

Wenn du ein neues Volk oder eine Zivilisation baust, registriere ein neues `ArchitectureAsset`:

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

Setze danach `architecture = "hello_style"` in deiner Spezies- oder Königreichsdefinition.

## Typische Fallstricke

- **Ressourcenkosten**: Verlangt dein Gebäude seltene Materialien (wie Gold oder Eisen), blockieren Bauarbeiter den Bauplatz endlos, bis Rohstoffe eintreffen. Prüfe die Kosten in **[Eigene Gebäude](#/nml/custom-buildings)**.
- **Prioritäten**: Bei mehreren erfüllten Bedingungen baut die Stadt Gebäude mit höherer `priority` zuerst.
- **Zonenanforderungen**: Liegt `requirements_zones` über der Inselfläche, wird die Stadt das Gebäude nie errichten :PES2_HmmmmNoted:.
