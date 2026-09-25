---
title: Arquitectura y órdenes de construcción
group: Contenido del juego
subgroup: Mundo y civilizaciones
icon: :wbhammer:
order: 181
---

# Arquitectura y órdenes de construcción :wbhammer:

Cuando se funda una ciudad, no coloca edificios al azar por el mapa. Cada raza sigue un estilo arquitectónico y un estricto orden de construcción: primero una hoguera, luego tiendas, casas de madera, torres de vigilancia, molinos y ayuntamientos.

Si creaste una estructura en **[Edificios personalizados](#/nml/custom-buildings)**, aprender cómo las ciudades eligen construirla te permitirá ver cómo la gente la levanta de forma autónoma sin necesidad de poderes divinos :PESgn_Noice:.

## Las dos bibliotecas

La construcción urbana está regulada por dos bibliotecas que colaboran estrechamente:

| Biblioteca | Asset | Propósito |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Estilos visuales de edificios (humanos, elfos, orcos, enanos) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | La lista de progresión constructiva que sigue la ciudad |

Un asset de arquitectura asocia roles genéricos a IDs de edificios concretos (por ejemplo, qué ID actúa como `"house"`, `"hall"` o `"tower"` para una raza).

Un asset de orden de construcción determina la secuencia en la que se colocan esas estructuras según crecen la población, el territorio y los recursos.

## Estructura de los órdenes de construcción

Cada entrada en `AssetManager.city_build_orders` define:

- **`building_id`**: Qué edificio colocar (o rol genérico).
- **`requirements_population`**: Población mínima requerida en la ciudad.
- **`requirements_buildings`**: Edificios previos obligatorios (ej. ayuntamiento antes del cuartel).
- **`requirements_zones`**: Cantidad de casillas de territorio reclamado necesarias.
- **`max`**: Cantidad máxima permitida de este edificio en una misma ciudad.

## El código

Este código se conecta a `AssetManager.city_build_orders` para añadir un santuario propio de **[Edificios personalizados](#/nml/custom-buildings)** a la lista de expansión urbana:

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

## Crear estilos de arquitectura personalizados

Si estás creando una raza o civilización inédita, registra un nuevo `ArchitectureAsset` y asígnalo:

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

Luego asigna `architecture = "hello_style"` en la definición de tu raza o reino.

## Errores comunes que debes evitar

- **Costes de recursos**: Si tu edificio exige materiales raros que la ciudad no posee (como oro o hierro), los constructores reservarán el terreno y esperarán eternamente. Revisa los costes en **[Edificios personalizados](#/nml/custom-buildings)**.
- **Prioridad de órdenes**: Las órdenes con mayor `priority` se evalúan primero cuando varios umbrales coinciden.
- **Comprueba las zonas urbanas**: Si `requirements_zones` supera el tamaño de una isla, una ciudad atrapada jamás levantará la estructura :PES2_HmmmmNoted:.
