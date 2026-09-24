---
title: Groupes d'objets & onglets
group: Contenu du jeu
subgroup: Objets et équipement
icon: :wbgold:
order: 124
---

# Groupes d'objets & onglets :wbgold:

Un groupe d'objets est une catégorie de la fenêtre d'équipement : casques, épées, amulettes. Il s'agit du même modeste `BaseCategoryAsset` que celui dessinant les onglets de traits (voir **[Groupes de traits & onglets](#/nml/trait-groups)**), résidant cette fois dans `AssetManager.item_groups`.

La différence tient au fait qu'un groupe d'objets gère un **pool**, et omettre ce pool fera inévitablement planter votre mod :PESgn_Yikes:.

## Les groupes vanilla

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## Votre propre catégorie

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

| Champ | Description |
| --- | --- |
| `id` | Ce que cible le `group_id` d'un objet |
| `name` | Clé de localisation pour le libellé de l'onglet |
| `color` | Chaîne hexadécimale teintant la catégorie |
| `show_counter` | Si l'onglet affiche un décompte. `true` par défaut |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## Les pools

Le jeu entretient une réserve d'équipement par groupe et alimente ces réserves durant le chargement de ses propres bibliothèques, ce qui survient **avant même l'existence de votre mod**. Un groupe tout neuf ne possède aucun réservoir, et le premier composant qui en réclame un lève une erreur :

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Créez-les manuellement, une seule fois par groupe, avant d'y inscrire le moindre objet :

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` recense tous les objets du groupe. `_unlocked` correspond à ce que le générateur peut attribuer à un instant T. Les deux doivent obligatoirement être présents.

## Y ajouter un objet

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // quel emplacement corporel il occupe
relic.equipment_subtype = "hello_relic";       // critère de préférence des cultures
```

Trois concepts distincts qu'il est facile de confondre :

| | |
| --- | --- |
| `group_id` | Sous quel **onglet** l'objet apparaît dans la fenêtre |
| `equipment_type` | Quel **emplacement** il occupe : `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | De quelle **classe d'arme** il relève : `sword`, `axe`, `bow`… ce que ciblent les traits culturels |

Un nouveau groupe ne vous confère **aucun** nouvel emplacement d'équipement. `EquipmentType` est un enum figé dans les binaires du jeu ; vos reliques occuperont donc toujours l'emplacement d'amulette, en disposant simplement de leur propre étagère dans l'interface.

## Où apparaît la catégorie

Les groupes s'affichent dans l'ordre de `list`, et `add()` met le vôtre en dernier. Déplacez-le à côté d'un groupe proche :

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

## Renommer une catégorie vanilla

`get()` renvoie l'objet actif en mémoire, vous permettant de réassigner une catégorie native au lieu d'en ajouter une :

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // votre propre clé de langue
    helmet.color = "#BAD0FF";
}
```

Tous les casques natifs continueront de pointer vers `helmet`, évitant ainsi toute rupture et préservant les anciennes sauvegardes. Remplacer purement et simplement le groupe orphelinerait l'intégralité d'entre eux :aPES2_HmmmmApprove:.

> [!TIP] Réutilisez l'emplacement, renommez l'étagère
> La majorité des mods de « nouveau type d'équipement » consistent en réalité en « un emplacement existant, une étagère distincte et un nouveau nom ». Cette approche prend quatre lignes et ne corrompt aucune sauvegarde. Un emplacement véritablement inédit exigerait de retoucher l'enum `EquipmentType` du jeu, ce qui est impossible.
