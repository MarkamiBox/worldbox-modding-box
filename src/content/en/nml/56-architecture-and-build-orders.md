---
title: Architecture & build orders
group: Game Content
subgroup: World & Civilizations
icon: :wbhammer:
order: 181
---

# Architecture & build orders :wbhammer:

When a city is founded, it does not throw buildings randomly on the map. Every race follows an architectural style and a strict build order: first a bonfire, then tents, then wooden houses, followed by watch towers, windmills, and town halls.

If you added a building in **[Custom buildings](#/nml/custom-buildings)**, learning how cities decide to construct it is how you get people to build it automatically without god powers :PESgn_Noice:.

## The two libraries

Civilization construction is managed by two cooperating libraries:

| Library | Asset | Purpose |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Visual building styles (human, elf, orc, dwarf) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | The progression checklist a city follows |

An architecture asset maps generic building roles to specific building asset IDs (e.g. which building ID serves as `"house"`, `"hall"`, or `"tower"` for this race).

A build order asset determines the order in which those buildings are placed as population, zones, and resources increase.

## Understanding build order assets

Each entry in `AssetManager.city_build_orders` defines:

- **`building_id`**: Which building asset to place (or generic role).
- **`requirements_population`**: Minimum citizens required in the city.
- **`requirements_buildings`**: Other buildings that must exist first (e.g. a town hall before barracks).
- **`requirements_zones`**: How many claimed territory tiles the city needs.
- **`max`**: Maximum number of this building allowed in a single city.

## The code

This code hooks into `AssetManager.city_build_orders` to add a custom shrine from **[Custom buildings](#/nml/custom-buildings)** into the city expansion checklist:

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

## Creating custom architecture styles

If you are creating a custom civilization or race, register a new `ArchitectureAsset` and assign it to your race:

```csharp
ArchitectureAsset arch = new ArchitectureAsset
{
    id = "hello_style"
};

// Map building roles to specific IDs
arch.buildings["bonfire"] = "bonfire_human";
arch.buildings["tent"] = "tent_human";
arch.buildings["hall_0"] = "hall_human_0";
arch.buildings["hall_1"] = "hall_human_1";
arch.buildings["shrine"] = "hello_shrine";

AssetManager.architecture_library.add(arch);
```

Then assign `architecture = "hello_style"` in your race or kingdom definition.

## Pitfalls to avoid

- **Resource costs**: If your building requires rare materials that the city does not have stored (like gold or iron), builders will reserve the plot and wait indefinitely. Check your resource costs in **[Custom buildings](#/nml/custom-buildings)**.
- **Order priorities**: Buildings with higher `priority` are considered first when multiple build orders meet their population and zone thresholds.
- **Check city zones**: If `requirements_zones` is higher than the island size, a city trapped on a small island will never construct the building :PES2_HmmmmNoted:.
