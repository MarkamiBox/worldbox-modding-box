---
title: Grupos de objetos y pestañas
group: Contenido del juego
subgroup: Objetos y equipamiento
icon: :wbgold:
order: 124
---

# Grupos de objetos y pestañas :wbgold:

Un grupo de objetos es una categoría en la ventana de equipamiento: cascos, espadas, amuletos. Es exactamente el mismo pequeño `BaseCategoryAsset` que dibuja las pestañas de rasgos (trait) (consulta **[Grupos de rasgos y pestañas](#/nml/trait-groups)**), residiendo en este caso en `AssetManager.item_groups`.

La diferencia fundamental es que un grupo de objetos gestiona un **pool**, y olvidarse de inicializar dicho pool provocará el bloqueo de tu mod :PESgn_Yikes:.

## Los grupos de vanilla

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## Tu propia categoría

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

| Campo | Qué hace |
| --- | --- |
| `id` | Hacia dónde apunta el `group_id` de un objeto |
| `name` | Clave de traducción para la etiqueta de la pestaña |
| `color` | Cadena hexadecimal que colorea la categoría |
| `show_counter` | Si la pestaña muestra un contador. `true` por defecto |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## Los pools

El juego mantiene un contenedor de equipamiento por cada grupo y los llena durante la carga inicial de sus propias bibliotecas, lo cual ocurre **antes de que tu mod siquiera exista**. Un grupo recién creado carece de contenedor, y la primera rutina que solicite uno lanzará una excepción:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Créalos manualmente, una vez por grupo, antes de registrar cualquier objeto en él:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` contiene todo lo existente en el grupo. `_unlocked` es lo que el generador puede sortear en el momento. Ambos deben existir obligatoriamente.

## Añadir un objeto al grupo

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // qué casilla corporal ocupa
relic.equipment_subtype = "hello_relic";       // criterio de preferencia de las culturas
```

Tres conceptos independientes que resultan muy fáciles de confundir:

| | |
| --- | --- |
| `group_id` | Bajo qué **pestaña** aparece en la ventana |
| `equipment_type` | Qué **ranura** ocupa: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | Qué **clase de arma** es: `sword`, `axe`, `bow`… lo que prefieren los rasgos de cultura (culture) |

Crear un nuevo grupo **no** te otorga una nueva ranura de equipo. `EquipmentType` es un enumerado inmutable del ensamblado del juego, de modo que tus reliquias siguen ocupando la casilla de amuleto, solo que disfrutan de su propio estante en la interfaz.

## Dónde aparece la categoría

Los grupos se dibujan en el orden de `list`, y `add()` pone el tuyo al final. Muévelo junto a uno relacionado:

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Renombrar una categoría de vanilla

`get()` devuelve la instancia viva en memoria, por lo que puedes reutilizar una categoría existente en lugar de crear una nueva:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // tu propia clave de idioma
    helmet.color = "#BAD0FF";
}
```

Todos los cascos de vanilla seguirán apuntando a `helmet`, por lo que nada se rompe y las partidas guardadas antiguas cargan sin contratiempos. Reemplazar el grupo dejaría a todos ellos huérfanos :aPES2_HmmmmApprove:.

> [!TIP] Reutiliza la ranura, renombra el estante
> La inmensa mayoría de los mods de "nuevo tipo de equipamiento" son en realidad "ranura existente, estante distinto y nombre nuevo". Esa vía requiere cuatro líneas y es incapaz de corromper un guardado. Una ranura genuinamente nueva requeriría alterar el enum `EquipmentType` del juego, algo inviable.
