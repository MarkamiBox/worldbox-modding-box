---
title: Bâtiments personnalisés
group: Contenu du jeu
subgroup: Acteurs, bâtiments et IA
icon: :wbcities:
order: 142
---

# Bâtiments personnalisés :wbcities:

Les bâtiments sont le moment où le modding de WorldBox cesse d'être un simple "changement de chiffre" pour devenir "cet asset possède cent quarante champs et la plupart ne servent à rien dans mon cas" :PES2_Weary:.

Nous ne construisons donc pas un bâtiment de zéro. Nous clonons un bâtiment qui fonctionne déjà.

## Cloner d'abord, ajuster ensuite

`clone(newId, sourceId)` copie chaque champ de l'original, le renomme **et l'enregistre**. Cette dernière étape est capitale :

```csharp Mods/HelloBox/Code/HelloBuildings.cs
namespace HelloBox
{
    public static class HelloBuildings
    {
        public const string SHRINE = "hello_shrine";

        public static void Initialize()
        {
            if (AssetManager.buildings.has(SHRINE)) return;

            BuildingAsset shrine = AssetManager.buildings.clone(SHRINE, "temple_human");

            shrine.sprite_path = "buildings/hello_shrine";   // a folder, used exactly as written

            // The game preloads every building's frames during its own startup, before your
            // mod existed. Load this one now, or placing it throws "Index was out of range".
            shrine.loadBuildingSprites();

            // Same story for the atlas that recolours it in the owner's colour: the library
            // links it in checkAtlasLink() at startup. Without it every frame throws.
            shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);
            shrine.building_type = BuildingType.Building_Civ;
            shrine.city_building = true;
            shrine.has_kingdom_color = true;
            shrine.max_houses = 0;                     // not housing, nobody lives here
            shrine.housing_slots = 0;
            shrine.draw_light_area = true;
            shrine.draw_light_size = 0.6f;
        }
    }
}
```

Tout ce que vous ne modifiez pas reste scrupuleusement identique à `temple_human`, qui est un bâtiment de ville parfaitement opérationnel. C'est là toute l'astuce.

> [!WARNING] N'appelez pas add() après clone()
> `clone()` a déjà enregistré la copie. Appeler `AssetManager.buildings.add(shrine)` juste après l'enregistre une deuxième fois, ce qui pousse la bibliothèque à rejeter la première copie et à consigner `duplicate asset - overwriting...`. Cela fonctionne quand même, mais cela pollue vos logs et sera la première chose qu'un relecteur de code vous reprochera.

## Que cloner

La bibliothèque propose aussi bien des modèles `$…$` que des bâtiments achevés :

| Source | Pour |
| --- | --- |
| `$building$` | La base dépouillée |
| `$city_building$` | Tout ce qu'une ville construit. Utilisé par `well` et `mine` |
| `$city_colored_building$` | Identique, mais teinté aux couleurs du royaume |
| `$building_civ_human$` / `_elf$` / `_orc$` / `_dwarf$` | Bâtiments civils par culture |
| `$building_creep$` | Structures invasives (creep) |
| `$mineral$` | Roches et minerais exploitables |
| `$resource$`, `$flora_small$` | Nature récoltable |
| `tree_green_1` | Tous les arbres de base sont clonés à partir de celui-ci |

Bâtiments finis qui valent la peine d'être clonés : `house_human_0` … `house_human_5`, `barracks_human`, `temple_human`, `library_human`, `market_human`, `docks_human`, `well`, `mine`, `mineral_stone`, `mineral_gold`.

Cloner le parent le plus proche ne prend que dix minutes de lecture et vous épargne une soirée d'essais vains sur des champs inutiles.

## Les champs selon vos besoins

### De quel type de bâtiment il s'agit

| Champ | Ce qu'il fait |
| --- | --- |
| `building_type` | `Building_Civ`, `Building_Nature`, `Building_Tree`, `Building_Mineral`, `Building_Mob`, `Building_Creep`, `Building_Plant`, `Building_Fruits`, `Building_Hives`, `Building_Wheat` |
| `city_building` | Appartient à une ville, reçoit donc couleurs de royaume, zones et emplois |
| `type` | Une étiquette textuelle libre utilisée pour les regroupements du jeu |
| `kingdom`, `civ_kingdom` | Restreindre le bâtiment à une faction précise |
| `ignored_by_cities` | Les villes ne le construisent ni ne le décomptent jamais |

### Logement et utilisation

| Champ | Ce qu'il fait |
| --- | --- |
| `max_houses`, `housing_slots`, `can_units_live_here` | Si des citoyens y logent et combien |
| `housing_happiness` | Bonus de bonheur apporté aux résidents |
| `storage`, `storage_only_food`, `is_stockpile` | S'il stocke des ressources |
| `book_slots` | Capacité d'accueil de livres dans les bibliothèques |
| `docks`, `boat_types`, `boat_type_fishing` … | Production de bateaux |
| `spawn_units`, `spawn_units_asset` | Fait apparaître des créatures |
| `tower`, `tower_projectile`, `tower_projectile_reload` … | Capacités défensives et tirs |

### Construction et placement

| Champ | Ce qu'il fait |
| --- | --- |
| `cost`, `construction_progress_needed` | Ce que la ville paie et le temps requis |
| `can_be_upgraded`, `upgrade_to`, `upgraded_from` … | Arborescences d'amélioration, comme `house_human_0` à `_5` |
| `build_place_borders`, `build_place_center` … | Son emplacement dans la ville |
| `build_prefer_replace_house`, `check_for_close_building` … | Règles de disposition |
| `limit_per_zone`, `limit_in_radius`, `limit_global` | Nombre maximal autorisé |
| `can_be_placed_on_liquid`, `can_be_placed_on_blocks` … | Règles de terrain |
| `build_road_to` | La ville trace une route jusqu'à lui |

### Nature et croissance

| Champ | Ce qu'il fait |
| --- | --- |
| `can_be_grown`, `vegetation_random_chance`, `is_vegetation` | Pousse spontanément au fil du temps |
| `growth_time`, `has_resources_grown_to_collect` | Cycles de récolte et de fructification |
| `biome_tags_growth`, `has_biome_tags` | Biomes propices à sa croissance |
| `resources_given`, `addResource(id, amount, pNewList)` | Ressources données lors de la récolte |
| `can_be_chopped_down`, `gatherable` | Si les unités peuvent l'abattre ou le cueillir |
| `grow_creep` et ses acolytes `grow_creep_*` | Propagation des biomes agressifs |

### Dégâts et destruction

| Champ | Ce qu'il fait |
| --- | --- |
| `burnable`, `affected_by_lava`, `affected_by_acid` … | Ce qui l'endommage |
| `has_ruins_graphics`, `has_ruin_state`, `auto_remove_ruin` … | Ce qu'il laisse derrière lui une fois détruit |
| `can_be_demolished`, `can_be_abandoned`, `destroy_on_liquid` | Comment il disparaît |
| `loot_generation` | Ce qu'il relâche lors de son effondrement |

### Apparence

| Champ | Ce qu'il fait |
| --- | --- |
| `sprite_path` + `main_path` | Emplacement du sprite |
| `atlas_id`, `atlas_id_fallback_when_not_wobbly` | Atlas de sprites utilisé |
| `scale_base`, `bonus_z`, `random_flip` | Échelle, ordre d'affichage, retournement |
| `shadow`, `shadow_bound`, `shadow_distortion` | Gestion de l'ombre |
| `has_kingdom_color` | Teinté aux couleurs du royaume souverain |
| `draw_light_area`, `draw_light_size` | Halo lumineux |
| `has_special_animation_state`, `animation_speed` … | Animations |

### Comportement

| Champ | Ce qu'il fait |
| --- | --- |
| `step_action`, `has_step_action` | Votre propre code exécuté à chaque tick du bâtiment |
| `base_stats` | Statistiques octroyées par le bâtiment |
| `priority` | Priorité dans la file de construction urbaine |

## Sprites

Les bâtiments cherchent leurs graphismes à l'adresse `main_path + sprite_path`, soit `buildings/hello_shrine`. Placez votre PNG sous `GameResources/buildings/hello_shrine.png` et il sera résolu comme n'importe quel bâtiment vanilla. Donnez-lui un pivot en bas au centre (bottom-centre) dans votre fichier `sprites.json`, sans quoi votre sanctuaire flottera au-dessus du sol comme un fantôme :aPES_GhostDance:. Voir **[Sprites et ressources](#/nml/sprites-and-resources)**.

## Votre propre sprite

Les bâtiments sont l'unique asset qui concatène **deux** champs : `main_path + sprite_path`. `main_path` valant déjà `buildings/` par défaut, `sprite_path` ne doit contenir que le nom du fichier.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── buildings/
        └── hello_shrine/
            ├── main_0.png           the building itself
            ├── construction_0.png   while a city is still building it
            ├── ruin_0.png           what is left after it is destroyed
            ├── mini_0.png           the minimap dot, one pixel per tile it covers
            └── sprites.json         bottom-centre pivot
```

Les **noms de fichiers sont le format**. Le chargeur coupe chaque nom sur `_` : avant, c'est le type (`main`, `construction`, `ruin`, `disabled`, `spawn`, `special`), après, le numéro du frame d'animation. `main_0`, `main_1`, `main_2` fait une animation de trois frames. Un fichier nommé autrement n'est pas un frame, et un dossier sans `main_0` ne laisse rien à dessiner au bâtiment. `mini` est l'icône de la minicarte : `mini_0` doit avoir autant de pixels que le bâtiment couvre de tiles, 5x4 pour tout ce qui est cloné de `temple_human`. Sans lui, la minicarte lance `NullReferenceException` dans `Building.getColorForMinimap()` à chaque redessin.

```csharp
shrine.main_path = "buildings/";       // la valeur par défaut, qu'on modifie rarement
shrine.sprite_path = "hello_shrine";   // PAS "buildings/hello_shrine"
```

Si vous mélangez les deux, dossier dans `main_path` et `sprite_path` vide, le jeu cherchera `buildings/hello_shrine/hello_shrine` :aPES_BrainScratch:.

> [!WARNING] Charge les frames toi-même, après avoir mis le chemin
> Le jeu remplit `building_sprites` pour chaque bâtiment dans son propre préchargement, qui tourne avant ton mod. Un bâtiment enregistré après a une liste de frames vide, et la première fois qu'on le pose le jeu meurt dans `Building.setAnimData()` avec `ArgumentOutOfRangeException: Index was out of range` :wbfacepalm:. Appelle `shrine.loadBuildingSprites();` dès que `sprite_path` est défini.
>
> Son petit frère est `atlas_asset`, l'atlas qui peint le bâtiment aux couleurs de son propriétaire. La bibliothèque le relie dans `checkAtlasLink()`, lui aussi au démarrage. Sans lui le bâtiment se pose bien, puis lance `NullReferenceException` dans `DynamicSprites.getRecoloredBuilding()` **à chaque frame où il est à l'écran**.


Attribuez-lui un **pivot en bas au centre** dans votre `sprites.json`, sinon votre sanctuaire lévitera au-dessus du sol; voir **[Sprites et ressources](#/nml/sprites-and-resources)**.

## En placer un sur la carte

`World.world.buildings.addBuilding(...)` est estampillé `internal`, ce code ne compile donc qu'en référençant un `Assembly-CSharp.dll` **publicisé**; reportez-vous à la note dans **[Effets de statut](#/nml/status-effects)** :

```csharp
BuildingAsset asset = AssetManager.buildings.get(HelloBuildings.SHRINE);
if (asset == null || tile == null) return;

if (World.world.buildings.canBuildFrom(tile, asset, null, BuildPlacingType.New))
{
    World.world.buildings.addBuilding(asset, tile);
}
```

Appelez toujours `canBuildFrom` en premier lieu. Déposer un bâtiment sur l'eau, par-dessus un autre bâtiment ou sur une case réservée par une ville génère un monde d'apparence normale qui plantera trois minutes plus tard :PES_OhShit:.


## Faire construire le bâtiment par les villes

Un pouvoir divin qui fait apparaître votre sanctuaire est amusant pendant une heure. Un sanctuaire que les villes construisent d'elles-mêmes, lorsqu'elles sont assez grandes, c'est un mod. Les villes choisissent quoi construire à partir de deux éléments, et votre bâtiment ne figure encore dans aucun d'eux :

| | Ce qu'il contient |
| --- | --- |
| Un **ordre de construction** (`AssetManager.city_build_orders`) | Une liste de clés d'ordre comme `order_temple`, avec la population et le nombre de bâtiments requis pour chacune |
| Une **architecture** (`AssetManager.architecture_library`) | Quel bâtiment désigne une clé d'ordre pour ce type de créature : `order_temple` correspond à `temple_human` pour les humains, à autre chose pour les orcs |

Vous inventez donc une clé d'ordre, indiquez à chaque architecture ce qu'elle signifie, et l'ajoutez aux ordres de construction :

```csharp Mods/HelloBox/Code/HelloBuildings.cs
public const string ORDER = "order_hello_shrine";

private static void AddToCities()
{
    BuildingAsset shrine = AssetManager.buildings.get(SHRINE);
    if (shrine == null) return;

    // Un type propre, pour que la ville compte les sanctuaires par rapport à leur limite, pas celle des temples
    shrine.type = "type_hello_shrine";

    // La recherche d'architecture est un simple dictionnaire : une clé inconnue déclenche une exception pour chaque ville
    // de cette créature. Enseignez-la à toutes, même à celles qui ne l'atteindront jamais.
    foreach (ArchitectureAsset architecture in AssetManager.architecture_library.list)
    {
        architecture.addBuildingOrderKey(ORDER, SHRINE);
    }

    foreach (CityBuildOrderAsset orders in AssetManager.city_build_orders.list)
    {
        if (orders.list.Exists(pOrder => pOrder.id == ORDER)) continue;

        // même limite que celle utilisée par le temple : 1, 50 habitants, 15 bâtiments en ville
        orders.addBuilding(ORDER, 1, 50, 15);
    }
}
```

Appelez `AddToCities()` à la fin de `Initialize()`, après le clone.

Contrairement à la majeure partie de ce guide, il n'y a pas de piège au démarrage ici : `CityBehBuild.calcPossibleBuildings()` lit la liste des ordres de construction de chaque ville chaque fois qu'elle envisage de construire, de sorte qu'un ordre ajouté au chargement est immédiatement visible par la première ville qui vérifie. La ville doit toujours pouvoir payer le `cost` du bâtiment et satisfaire chaque condition chiffrée de l'ordre ; lorsqu'elle ne le peut pas, elle ignore simplement votre sanctuaire sans bruit :PES5_Hmmmm:.

| Argument de `addBuilding(...)` | Ce qu'il fait |
| --- | --- |
| `pID` | La clé d'ordre, pas l'identifiant du bâtiment |
| `pLimitType` | Combien la ville peut en posséder. Le temple utilise `1` |
| `pPop` | Population minimale |
| `pBuildings` | Nombre minimal de bâtiments déjà construits en ville |
| `pCheckFullVillage` | Uniquement lorsque chaque maison est occupée |
| `pCheckHouseLimit` | Pour les maisons : ignorer tant que le logement n'est pas saturé, s'arrêter à la limite de maisons de la ville |
| `pMinZones` | Taille minimale de la ville, en zones |

## Le texte

```json Mods/HelloBox/Locales/en.json
{
  "hello_shrine": "Shrine",
  "hello_shrine_description": "Nobody remembers who built it. Everybody agrees it should not be touched."
}
```

> [!TIP] Lisez l'original avant de le cloner
> Ouvrez `BuildingLibrary` dans **dnSpy** et observez les différences entre `house_human_0`, `tree_green_1` et `mineral_stone`. Chaque bâtiment vanilla y est assemblé en C# direct, ce qui en fait la documentation champ par champ la plus précise qui soit :PES_Smart:.
