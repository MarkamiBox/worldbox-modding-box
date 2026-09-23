---
title: Item-Gruppen & Tabs
group: Spielinhalte
subgroup: Gegenstände & Ausrüstung
icon: :wbgold:
order: 124
---

# Item-Gruppen & Tabs :wbgold:

Eine Item-Gruppe ist eine Kategorie im Ausrüstungsfenster: Helme, Schwerter, Amulette. Es handelt sich um dasselbe winzige `BaseCategoryAsset`, das auch Eigenschafts-Tabs zeichnet (siehe **[Eigenschafts-Gruppen & Tabs](#/nml/trait-groups)**), nur dass es in `AssetManager.item_groups` wohnt.

Der Unterschied ist, dass eine Item-Gruppe einen **Pool** besitzt – und das Vergessen dieses Pools lässt deine Mod abstürzen.

## Die Vanilla-Gruppen

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## Eine eigene Kategorie

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

| Feld | Funktion |
| --- | --- |
| `id` | Worauf die `group_id` eines Items verweist |
| `name` | Der Lokalisierungs-Schlüssel für die Tab-Beschriftung |
| `color` | Hex-Farbcode zur Einfärbung der Kategorie |
| `show_counter` | Ob der Tab einen Zähler anzeigt. Standardmäßig `true` |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## Die Pools

Das Spiel verwaltet einen Ausrüstungs-Behälter pro Gruppe und befüllt diese Behälter, während seine eigenen Bibliotheken laden – also **bevor deine Mod überhaupt existiert**. Eine brandneue Gruppe hat keinen Behälter, und das erste System, das danach fragt, wirft sofort eine Ausnahme:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Erstelle die Pools selbst, einmal pro Gruppe, bevor du irgendein Item darin registrierst:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` umfasst alles in der Gruppe. `_unlocked` ist das, was der Generator aktuell auswürfeln darf. Beide müssen existieren.

## Ein Item hinzufügen

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // Welchen Körperslot es belegt
relic.equipment_subtype = "hello_relic";       // Woran Kulturen ihre Vorlieben festmachen
```

Drei getrennte Konzepte, die man leicht verwechseln kann:

| | |
| --- | --- |
| `group_id` | Unter welchem **Tab** das Item im Fenster erscheint |
| `equipment_type` | Welchen **Slot** es belegt: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | Welche **Waffenklasse** es ist: `sword`, `axe`, `bow`… woran Kultur-Eigenschaften anknüpfen |

Eine neue Gruppe verschafft dir **keinen** neuen Slot. `EquipmentType` ist ein festes Enum im Spielcode; deine Relikte belegen daher weiterhin den Amulett-Slot, erhalten aber ihr eigenes Regal im Ausrüstungsfenster.

## Wo die Kategorie erscheint

Gruppen werden in Reihenfolge der `list` gezeichnet, und `add()` platziert deine ganz ans Ende. Verschiebe sie neben einen Verwandten:

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

## Eine Vanilla-Kategorie umbenennen

`get()` liefert das aktive Objekt zurück, du kannst eine bestehende Vanilla-Kategorie also einfach umwidmen, statt eine neue hinzuzufügen:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // Dein eigener Locale-Key
    helmet.color = "#BAD0FF";
}
```

Jeder Vanilla-Helm verweist weiterhin auf `helmet`, sodass nichts kaputtgeht und bestehende Spielstände geladen werden können. Das Ersetzen der Gruppe würde sie stattdessen alle ins Leere laufen lassen :aPES2_HmmmmApprove:.

> [!TIP] Slot wiederverwenden, Regal umbenennen
> Die allermeisten "Neuer Ausrüstungstyp"-Mods sind in Wirklichkeit "Bestehender Slot, anderes Regal und neuer Name". Diese Variante braucht vier Zeilen und kann keinen Spielstand beschädigen. Ein echter neuer Slot erfordert Änderungen am `EquipmentType`-Enum des Spiels, die nicht möglich sind.
