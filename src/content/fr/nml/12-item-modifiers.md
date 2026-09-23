---
title: Enchantements d'armes
group: Contenu du jeu
subgroup: Objets et équipement
icon: :wbmagehrm:
order: 122
---

# Enchantements d'armes :wbmagehrm:

Vous connaissez ces petites lignes vertes sur une bonne épée : *"+3 dégâts"*, *"brûlant"*. Ce sont des **modificateurs d'objet**, et ils constituent la façon la plus rapide de rendre le butin palpitant, car le jeu les applique automatiquement aux armes créées.

## La méthode simple : le créateur de NML

Un `ItemAsset` dans le jeu de base est une classe unique qui remplit sept fonctions différentes, et ses champs ont des significations changeantes selon le cas. NML regroupe les fonctionnalités clés dans `ItemAssetCreator`, et pour les modificateurs, il gère directement l'enregistrement pour vous :

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```
> [!WARNING] L'enregistrer ne suffit pas
> `add()` met ton modificateur dans la `list` de la bibliothèque, et le générateur ne lit pas `list`, il lit `pools`. Ces pools sont remplis dans `linkAssets()`, une seule fois, au chargement. Un modificateur qui n'est que dans `list` existe, a un nom, et ne sera jamais tiré sur quoi que ce soit :wbfacepalm:.



Ajoutez `HelloModifiers.Initialize();` dans votre `Main.cs`, et le jeu pourra désormais attribuer "hello_sharp" aux armes qu'il génère.

### Les arguments qui comptent

| Argument | Ce qu'il fait |
| --- | --- |
| `id` | Nom unique |
| `mod_type` | La famille. Deux modificateurs du même type n'apparaissent jamais ensemble : le `mod_rank` le plus fort gagne |
| `mod_rank` | Niveau au sein de la famille. Augmente aussi la valeur globale de l'arme |
| `translation_key` | Clé de traduction pour la ligne verte affichée |
| `rarity` | Probabilité de tirage. Plus la valeur est haute, plus le bonus est fréquent |
| `base_stats` | Le bonus de statistiques |
| `quality` | Qualité minimale requise sur l'arme |
| `equipment_value` | Bonus d'évaluation pour le choix de l'IA |

## Lui faire faire quelque chose pour de vrai

Les statistiques sont utiles, mais un modificateur peut aussi exécuter du code. `action_attack_target` s'exécute à chaque fois que l'arme touche une cible :

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

Désormais, toute arme tirant au sort "hello_burning" enflammera le sol lorsqu'elle frappe. Dix lignes, et cela fonctionne sur toutes les armes du jeu, y compris celles des autres mods :wbfireskull:.

## Les textes et la localisation

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

La `translation_key` correspond au texte affiché dans l'infobulle de l'arme : restez concis, elle s'affiche sur une seule ligne à côté des statistiques.

> [!TIP] Modificateurs avant les armes
> Créer une arme complète représente un travail considérable (sprites, animations, matériaux). Un nouveau modificateur tient en vingt lignes et bénéficie à **toutes** les armes que le jeu génère. Si vous voulez des nouveautés immédiates, commencez par ici :PES_Stonks:.
