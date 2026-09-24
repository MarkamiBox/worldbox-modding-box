---
title: Gruppi di oggetti e schede
group: Contenuto di gioco
subgroup: Oggetti ed equipaggiamento
icon: :wbgold:
order: 124
---

# Gruppi di oggetti e schede :wbgold:

Un gruppo di oggetti è una categoria nella finestra dell'equipaggiamento: elmi, spade, amuleti. È lo stesso identico `BaseCategoryAsset` che disegna le schede dei tratti (vedi **[Gruppi di tratti e schede](#/nml/trait-groups)**), situato questa volta in `AssetManager.item_groups`.

La differenza cruciale è che un gruppo di oggetti richiede un **pool**, e dimenticarsi di questo pool è la causa principale di crash del tuo mod :PESgn_Yikes:.

## I gruppi vanilla

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## La tua categoria personalizzata

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

| Campo | Cosa fa |
| --- | --- |
| `id` | Ciò a cui punta il `group_id` di un oggetto |
| `name` | La chiave di localizzazione per l'etichetta della scheda |
| `color` | Stringa esadecimale che tinge la categoria |
| `show_counter` | Se la scheda mostra un contatore. `true` per impostazione predefinita |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## I pool

Il gioco conserva un contenitore di equipaggiamento per gruppo e riempie tali contenitori mentre le sue librerie caricano, ovvero **prima ancora che il tuo mod esista**. Un gruppo nuovo di zecca non ha alcun contenitore associato, e la prima chiamata che ne richiede uno lancia un errore:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Creali autonomamente, una volta per gruppo, prima di registrarvi qualsiasi oggetto:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` contiene ogni oggetto del gruppo. `_unlocked` indica cosa il generatore può estrarre al momento. Entrambi devono esistere.

## Inserire un oggetto nel gruppo

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // quale slot del corpo occupa
relic.equipment_subtype = "hello_relic";       // cosa preferiscono le culture
```

Tre concetti distinti che è facile confondere:

| | |
| --- | --- |
| `group_id` | Sotto quale **scheda** compare nella finestra |
| `equipment_type` | Quale **slot** occupa: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | Quale **classe di armi** rappresenta: `sword`, `axe`, `bow`… cosa preferiscono i tratti culturali |

Un nuovo gruppo **non** ti dà un nuovo slot di equipaggiamento. `EquipmentType` è un enum fisso nel gioco, perciò le tue reliquie occuperanno comunque lo slot dell'amuleto, avendo semplicemente un proprio ripiano separato nella finestra.

## Dove appare la categoria

I gruppi vengono disegnati nell'ordine di `list`, e `add()` mette il tuo per ultimo. Spostalo accanto a un parente:

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

## Rinominare una categoria vanilla

`get()` restituisce l'oggetto vivo, permettendoti di riadattare una categoria vanilla invece di aggiungerne una:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // la tua chiave di localizzazione
    helmet.color = "#BAD0FF";
}
```

Ogni elmo vanilla continuerà a puntare a `helmet`, perciò nulla si romperà e i vecchi salvataggi si caricheranno senza problemi. Sostituire il gruppo renderebbe orfani tutti gli oggetti esistenti :aPES2_HmmmmApprove:.

> [!TIP] Riusa lo slot, rinomina il ripiano
> La maggior parte dei mod per un "nuovo tipo di equipaggiamento" sono in realtà "slot esistente, ripiano diverso e nome diverso". Questa soluzione richiede quattro righe e non rischia di corrompere un salvataggio. Uno slot genuinamente nuovo richiederebbe modifiche all'enum `EquipmentType`, cosa che non avverrà.
