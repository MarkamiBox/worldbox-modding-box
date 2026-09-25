---
title: Архитектура и порядок строительства
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbhammer:
order: 181
---

# Архитектура и порядок строительства :wbhammer:

Основанный город не разбрасывает здания по карте случайно. Каждая раса придерживается архитектурного стиля и строгого порядка застройки: сначала костёр, затем палатки, деревянные дома, сторожевые башни, мельницы и ратуши.

Если вы создали здание в **[Своих зданиях](#/nml/custom-buildings)**, настройка порядка застройки позволит жителям строить его самостоятельно без божественных сил :PESgn_Noice:.

## Две библиотеки

Городское строительство регулируется двумя взаимодействующими библиотеками:

| Библиотека | Ассет | Назначение |
| --- | --- | --- |
| `AssetManager.architecture_library` | `ArchitectureAsset` | Визуальные стили построек (люди, эльфы, орки, гномы) |
| `AssetManager.city_build_orders` | `CityBuildOrderAsset` | План поэтапной застройки города |

Архитектурный ассет сопоставляет общие роли конкретным ID зданий (какое здание служит `"house"`, `"hall"` или `"tower"` для расы).

Ассет порядка строительства определяет очередность возведения по мере роста населения, зон влияния и ресурсов.

## Структура ассетов порядка застройки

Каждая запись в `AssetManager.city_build_orders` задает:

- **`building_id`**: Какое здание размещать (или его роль).
- **`requirements_population`**: Минимальное население города.
- **`requirements_buildings`**: Необходимые предшествующие постройки.
- **`requirements_zones`**: Требуемое количество подконтрольных клеток территории.
- **`max`**: Максимальное число таких зданий в одном городе.

## Код

Этот код внедряет святилище из **[Своих зданий](#/nml/custom-buildings)** в список строительства городов:

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

## Создание собственного архитектурного стиля

Для новой расы или цивилизации зарегистрируйте собственный `ArchitectureAsset`:

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

Затем укажите `architecture = "hello_style"` в настройках расы или королевства.

## Подводные камни

- **Стоимость ресурсов**: Если зданию требуются редкие ресурсы, которых нет на складе, строители разметят участок и будут ждать бесконечно. Проверьте затраты в **[Своих зданиях](#/nml/custom-buildings)**.
- **Приоритет заказов**: Заказы с более высоким значением `priority` выполняются первыми при выполнении условий.
- **Размер острова**: Если `requirements_zones` превышает площадь острова, изолированный город никогда не построит здание :PES2_HmmmmNoted:.
