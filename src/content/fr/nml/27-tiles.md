---
title: Tuiles et terrain
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbrockies:
order: 170
---

# Tuiles et terrain :wbrockies:

La carte est une grille de `WorldTile`, et chaque tuile superpose **deux** types l'un sur l'autre :

| Couche | Champ sur la tuile | Bibliothèque | Classe | Exemples |
| --- | --- | --- | --- | --- |
| Sol | `main_type` | `AssetManager.tiles` | `TileType` | terre, sable, roches, océan profond, lave |
| Surface | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, murs |

Les deux partagent la même classe de base sous le capot (`TileTypeBase`), de sorte que tout ce qui figure sur cette page s'applique à l'un comme à l'autre. La seule différence réside dans la couche où ils résident, ce qui est déterminé par `layer_type`.

Si vous souhaitez ajouter un nouveau type de *sol*, il s'agit d'un `TileType`. Si vous voulez quelque chose qui repose **sur** le sol (une route, un mur, une culture, de la mousse), c'est un `TopTileType`, et c'est généralement ce dont vous avez réellement besoin.

## Cloner au lieu de tout reconstruire

Un type de tuile possède près d'une centaine de champs, dont la majorité ne concerne qu'une seule tuile vanilla spécifique. Je ne vais pas lister les cent. Clonez la tuile la plus proche :

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] Un tile de biome a besoin de son biome relié
> Cloner un tile d'herbe copie `is_biome = true` et le `biome_id`, mais le `BiomeAsset` lui-même n'est cherché que dans `TopTileLibrary.linkAssets()`, une fois, au chargement. Oublie cette ligne et tout marche jusqu'à ce qu'un animal apparaisse sur ton tile : son nom d'espèce prend le suffixe du biome, le biome est `null`, et l'apparition meurt sur `NullReferenceException` dans `Subspecies.generateName()` :wbfacepalm:.
>
> Les images ont le même problème. `TopTileLibrary` transforme les PNG de `tiles/<id>/` en `sprites` au démarrage, donc sans le dernier bloc le tile se peint bien, puis le rendu de la carte lance dans `WorldTilemap.getVariation()` pour chaque tile visible.


## Les champs à connaître

### Quel genre d'élément est-ce

| Champ | Ce qu'il fait |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` ou couche supérieure. Détermine la bibliothèque d'appartenance |
| `ground`, `liquid`, `ocean`, `lava` | Indicateurs généraux de catégorie sur lesquels tout le jeu bifurque |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Drapeaux de famille de terrain |
| `road`, `wall`, `farm_field` | Drapeaux de structure. L'IA des villes s'appuie dessus |
| `block`, `block_height` | Bloque ou non le passage, et hauteur visuelle |
| `is_biome`, `can_be_biome`, `biome_id` | Associe la tuile à un biome |
| `biome_tags`, `has_biome_tags` | Quels biomes feront proliférer cette tuile |

### Comment elle se comporte

Commencez ici si votre tuile est une idée de gameplay et pas seulement une nouvelle couleur.

| Champ | Ce qu'il fait |
| --- | --- |
| `walk_multiplier` | Vitesse de marche. `1.0` est la norme, plus bas ralentit |
| `damage_units`, `damage` | Marcher dessus blesse-t-il, et de combien |
| `damaged_when_walked` | La tuile s'abîme elle-même quand on marche dessus |
| `step_action`, `step_action_chance` | Votre code exécuté chaque fois qu'une entité marche dessus |
| `unit_death_action` | Votre code quand une créature meurt dessus |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Comportement face au feu |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Comportement face au gel |
| `remove_on_heat`, `terraform_after_fire` | Ce que laissent la chaleur et les flammes |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Détonation |
| `strength` | Résistance générale. Utilisé par les mods de murs pour la solidité |
| `cost` | Coût de déplacement pour le pathfinding |

### Ce que le joueur peut faire avec

| Champ | Ce qu'il fait |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Quel outil la détruit |
| `allowed_to_be_finger_copied` | Peut-elle être dupliquée avec l'outil doigt |
| `can_build_on`, `can_be_farm` | Une ville a-t-elle le droit de bâtir ou cultiver dessus |
| `only_allowed_to_build_with_tag` | Restreint la construction à un tag précis |

### Transitions

| Champ | Ce qu'il fait |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | Ce qu'elle devient en grandissant ou en s'érodant |
| `freeze_to_id` | Ce qu'elle devient une fois gelée |
| `fill_to_ocean`, `can_be_filled_with_ocean` | Ce qu'elle devient immergée dans l'eau |
| `lava_increase` / `lava_decrease` / `lava_level` | Chaîne de progression propre à la lave |

### Apparence

| Champ | Ce qu'il fait |
| --- | --- |
| `color_hex` | Couleur pour la mini-carte et la teinte |
| `edge_color_hex` | Couleur de contour là où elle touche un autre type |
| `render_z`, `draw_layer_name` | Ordre d'affichage. `setDrawLayer(...)` est la méthode d'aide |
| `force_edge_variation`, `force_edge_variation_frame` | Verrouille une variante de sprite de bordure |

## Exécuter du code quand quelque chose marche dessus

```csharp
moss.step_action_chance = 0.05f;   // 5 % des pas
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

Mêmes règles que pour toute action dans ce guide : vérifiez toujours le null d'abord, renvoyez `false` si vous n'avez rien fait, et souvenez-vous que ce code s'exécute pour chaque créature marchant sur chaque tuile de ce type.

## Vos propres graphismes

Les tuiles sont l'exception à la règle : il n'y a **strictement aucun champ de chemin**. Le jeu cherche un dossier portant exactement l'**id** de la tuile, et charge tout ce qui s'y trouve comme variantes graphiques.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- l'id exact de la tuile
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

Rien à renseigner dans le code. Donnez au dossier le nom de l'id enregistré et la tuile le trouvera automatiquement.

Plusieurs fichiers dans ce dossier deviennent des variantes aléatoires, ce qui évite qu'un champ de votre tuile ne ressemble à du papier peint répété. Un seul fichier fonctionne également. Les tuiles de sol et de surface se chargent de la même manière.

`color_hex` reste indépendant et crucial : c'est lui qui s'affiche sur la mini-carte et qui teinte la tuile lorsque le jeu l'exige.

## Modifier les tuiles en cours de jeu

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // changer la couche de surface
tile.setTileType(AssetManager.tiles.get("sand"));                // changer le sol
tile.setTileTypes("sand", null);                                 // sol, et nettoyer la surface
```

Ces trois méthodes sont publiques. Modifier une tuile marque son tronçon comme modifié et le moteur de rendu se charge du reste.

### Lire ce qui s'y trouve

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

`main_type` et `top_type` peuvent tous deux être `null`. Vérifiez-les avant de les manipuler. C'est le plantage numéro un de tous les mods qui parcourent la carte :PES2_F:.

## Options de terraformation

Un `TerraformOptions` dans `AssetManager.terraform` est un ensemble prédéfini de règles de nettoyage de tuile, utilisé par les pouvoirs divins et les projectiles :

| Champ | Ce qu'il fait |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Supprime les structures |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Nettoie les débris |
| `destroy_buildings`, `make_ruins` | Ce qui arrive aux bâtiments construits |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Nettoie les états |
| `add_burned`, `add_heat`, `flash` | Ajoute des états |

Un `ProjectileAsset` en référence un dans `terraform_option` avec un `terraform_range`, ce qui permet à une flèche explosive de nettoyer le sol à son point d'impact.

## Biomes

Un `BiomeAsset` dans `AssetManager.biome_library` décide quelles tuiles apparaissent et où. Une tuile intègre un biome via `setBiome("biome_forest")` ou en portant les bons `biome_tags`. Cloner un biome existant et remplacer ses identifiants de tuiles est bien plus rapide que d'en concevoir un de toutes pièces, et la règle "le clonage s'enregistre tout seul" reste de mise.

> [!TIP] Les tuiles de surface concentrent l'essentiel des mods
> Presque tout ce que les moddeurs créent en pratique (murs, routes, cultures, corruption rampant sur tout un continent) est une tuile de surface avec une `step_action` et un peu de logique de placement. Les nouveaux types de sol sont plus rares, plus difficiles à intégrer harmonieusement et interagissent avec le générateur de monde de manières imprévues :PES3_Yikes:.
