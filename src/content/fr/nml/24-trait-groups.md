---
title: Groupes de traits et onglets
group: Contenu du jeu
subgroup: Traits et génétique
icon: :wbfamilies:
order: 102
---

# Groupes de traits et onglets :wbfamilies:

Chaque trait appartient à un **groupe**, et ce groupe détermine quel onglet s'affiche dans le livre des traits. Si vous ajoutez six traits et les jetez tous dans `miscellaneous`, ils disparaissent dans une liste que personne ne fait défiler :PES4_Invisible:.

Créer votre propre onglet coûte quatre lignes.

## Ce qu'est un groupe

Un groupe est un `BaseCategoryAsset`, soit le plus petit asset du jeu entier :

| Champ | Ce qu'il fait |
| --- | --- |
| `id` | Ce vers quoi pointe le `group_id` d'un trait |
| `name` | La **clé de traduction** pour le libellé de l'onglet. Pas le libellé lui-même |
| `color` | Chaîne hexadécimale. Teinte l'onglet et les traits qui s'y trouvent |
| `show_counter` | Indique si l'onglet affiche "3 / 12". `true` par défaut |

## Votre propre onglet

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // la clé de locale, pas le texte direct
                color = "#7FE7C4"
            });
        }
    }
}
```

Faites pointer vos traits dessus :

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

Et nommez l'onglet :

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Les groupes avant les traits qu'ils contiennent
> Un trait dont le `group_id` pointe vers un groupe inexistant n'a aucun endroit où s'afficher. Dans `OnModLoad`, `HelloGroups.Initialize()` doit impérativement précéder `HelloTraits.Initialize()`.

## Les groupes de traits d'acteurs vanilla

Utilisez l'un d'entre eux si vous ne souhaitez pas votre propre onglet :

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Où apparaît votre onglet

Les groupes sont affichés dans l'ordre de `list`, et `add()` place le vôtre à la toute fin. Pour l'insérer à côté d'un groupe connexe, déplacez-le juste après :

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

`list` est une simple `List<T>` sur chaque bibliothèque, cette astuce fonctionne donc pour chacune d'elles. Voir **[Bibliothèques d'assets](#/nml/asset-libraries)**.

## Renommer ou recolorer un groupe vanilla

Vous n'avez pas besoin d'ajouter un groupe pour en modifier un. `get()` vous tend l'objet actif en mémoire :

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // votre propre clé de locale
    fun.color = "#FFB35E";
}
```

Modifier un groupe vanilla sur place préserve le fonctionnement de chaque trait vanilla qui pointe dessus et garantit le chargement de vieilles sauvegardes. Le remplacer ne fait ni l'un ni l'autre :PES_NoSign:.

## Les six autres bibliothèques de groupes

Les traits d'acteurs ne sont que l'un des sept systèmes de traits du jeu, et chacun possède sa propre bibliothèque de groupes contenant sa propre classe de groupe. Le code de cette page est identique pour tous, seuls deux noms changent. Apprenez-le une fois, copiez-le six fois :

| Système de traits | Bibliothèque de groupes | Classe de groupe | Page |
| --- | --- | --- | --- |
| Acteur | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | cette page |
| Culture | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Traits culturels](#/nml/culture-traits)** |
| Religion | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Traits religieux](#/nml/religion-traits)** |
| Sous-espèce | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Traits de sous-espèces](#/nml/subspecies-traits)** |
| Clan | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Traits de clan](#/nml/clan-traits)** |
| Langue | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Traits de langue](#/nml/language-traits)** |
| Royaume | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Traits de royaume](#/nml/kingdom-traits)** |

L'équipement applique le même principe sous un nom différent. Voir **[Groupes d'objets et onglets](#/nml/item-groups)**.

> [!TIP] Un seul onglet, pas six
> La tentation avec un gros mod est de créer un groupe par fonctionnalité. Résistez-y. Le livre des traits déborde déjà : un joueur repérera sans problème un onglet portant le nom de votre mod, mais zappera six onglets nommés d'après vos abstractions techniques internes.
