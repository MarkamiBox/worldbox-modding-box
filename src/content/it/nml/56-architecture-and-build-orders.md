---
title: Architettura e ordini di costruzione
group: Contenuto di gioco
subgroup: Mondo e civiltà
icon: :wbhammer:
order: 181
---

# Architettura e ordini di costruzione :wbhammer:

Quando viene fondata una città, non posiziona edifici a caso sulla mappa. Ogni razza segue uno stile architettonico e un rigoroso ordine di costruzione: prima un falò, poi tende, case di legno, torri di guardia, mulini a vento e municipi.

Se hai aggiunto un edificio in **[Edifici personalizzati](#/nml/custom-buildings)**, capire come le città decidono di costruirlo è il segreto per far sì che la gente lo costruisca in autonomia, senza poteri divini :PESgn_Noice:.

## Le due librerie

L'espansione edilizia delle civiltà è gestita da due librerie collegate:

| Libreria | Asset | Scopo |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Stili grafici degli edifici (umani, elfi, orchi, nani) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | La lista di avanzamento che la città segue |

Un asset di architettura mappa i ruoli generici degli edifici a ID di asset specifici (ad esempio quale ID funge da `"house"`, `"hall"` o `"tower"` per quella razza).

Un asset di ordine di costruzione stabilisce l'ordine con cui tali strutture vengono erette man mano che popolazione, territorio e risorse aumentano.

## Capire gli asset degli ordini di costruzione

Ciascuna voce in `AssetManager.city_build_orders` definisce:

- **`building_id`**: Quale asset posizionare (o ruolo generico).
- **`requirements_population`**: Cittadini minimi richiesti nella città.
- **`requirements_buildings`**: Altri edifici che devono esistere prima (es. municipio prima della caserma).
- **`requirements_zones`**: Numero di caselle di territorio possedute dalla città.
- **`max`**: Numero massimo consentito di quell'edificio in una singola città.

## Il codice

Questo codice si aggancia ad `AssetManager.city_build_orders` per inserire un santuario personalizzato da **[Edifici personalizzati](#/nml/custom-buildings)** nell'elenco di espansione cittadina:

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

## Creare stili di architettura personalizzati

Se stai creando una civiltà o razza personalizzata, registra un nuovo `ArchitectureAsset` e assegnalo alla tua razza:

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

Poi imposta `architecture = "hello_style"` nella definizione della tua razza o regno.

## Errori comuni da evitare

- **Costi delle risorse**: Se il tuo edificio richiede materiali rari non immagazzinati (come oro o ferro), i costruttori prenoteranno il terreno e attenderanno all'infinito. Verifica i costi in **[Edifici personalizzati](#/nml/custom-buildings)**.
- **Priorità degli ordini**: Gli ordini con `priority` più elevata vengono valutati per primi quando più requisiti sono soddisfatti contemporaneamente.
- **Controlla le zone cittadine**: Se `requirements_zones` è superiore alle caselle dell'isola, una città isolata non costruirà mai l'edificio :PES2_HmmmmNoted:.
