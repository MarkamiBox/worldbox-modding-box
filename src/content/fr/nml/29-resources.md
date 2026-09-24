---
title: Ressources et nourriture
group: Contenu du jeu
subgroup: Monde et civilisations
icon: :wbtomato:
order: 182
---

# Ressources et nourriture :wbtomato:

Une ressource désigne tout ce qu'une cité stocke, échange, mange ou forge : blé, pain, pierre, mithril, os, gemmes. Elles résident dans `AssetManager.resources` et constituent le socle de toute l'économie : ce que cultivent les fermes, ce que préparent les boulangers, ce dont ont besoin les forgerons et ce qu'avale un citoyen affamé. Dans cette économie, même le pain est une structure de données :PES2_Cash:.

## Cloner depuis un modèle

> [!WARNING] Mets `full_sprite_path` ou le chargeur plante
> `path_gameplay_sprite` n'est que la moitié. La bibliothèque en construit `full_sprite_path` dans `post_init()`, une seule fois, pendant le chargement du jeu, donc une ressource enregistrée par un mod y garde `null`. Le préchargeur de sprites appelle alors `getSpriteList(null)` et tout le chargement meurt sur `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ et $TEMPLATE_STRATEGIC_MINERAL$ sont les deux excellents points de départ.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // La bibliotheque le deduit dans post_init(), deja passe. Mets-le toi-meme.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // ce que l'unité tient entre ses mains

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## Les champs

### Ce que c'est

| Champ | Ce qu'il fait |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Indique si une unité peut le manger comme repas |
| `wood`, `mineral` | Outils de récolte et métiers associés |
| `path_icon` | Icône dans les inventaires et listes |
| `path_gameplay_sprite` | Le sprite qu'une unité porte entre ses mains en le transportant |

### Consommation et alimentation

| Champ | Ce qu'il fait |
| --- | --- |
| `restore_nutrition` | Faim restaurée |
| `restore_health` | Santé restaurée, en ratio |
| `restore_stamina`, `restore_mana`, `restore_happiness` | Les autres jauges de besoins |
| `give_experience` | Expérience octroyée en le mangeant |
| `tastiness`, `favorite_food_chance` | Probabilité qu'une unité le choisisse comme plat favori |
| `diet` | Régimes biologiques autorisés à le consommer |
| `eat_action` | Votre code exécuté lorsque quelqu'un le mange |
| `give_trait_id`, `give_status_id`, `give_chance` | Traits ou statuts conférés lors de l'ingestion |

### Fabrication et logistique

| Champ | Ce qu'il fait |
| --- | --- |
| `ingredients`, `ingredients_amount` | Ingrédients requis pour le cuisiner ou le forger |
| `produce_min` | Quantité produite lors d'un cycle de travail |
| `mine_rate` | Vitesse d'extraction ou de récolte |
| `drop_max`, `drop_per_mass` | Quantité relâchée à la destruction de la source |
| `stack_size`, `storage_max`, `maximum` | Limites de transport et de stockage |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Gestion du ravitaillement militaire |
| `trade_cost`, `trade_give`, `trade_bound` | Comportement commercial entre cités |
| `money_cost`, `loot_value` | Valeur marchande et valeur de butin |

## Les ressources vanilla

À garder en tête, car réutiliser une ressource existante est presque toujours préférable à en ajouter une nouvelle :

**Nourriture et ingrédients :** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Stratégiques et divers :** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## Vos propres sprites

Une ressource utilise deux visuels, et ils se chargent de manière **totalement différente**. C'est le piège classique : Et il vous piégera une fois aussi.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- l'icône d'inventaire, à la racine
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- ce que l'unité porte en main
```

```csharp
cake.path_icon = "iconHelloCake";        // chargé exactement tel quel
cake.path_gameplay_sprite = "hello_cake";   // chargé sous items/resources/hello_cake
```

`path_icon` est un chemin direct, et le jeu de base indique de simples noms, ce qui place le fichier à la racine de `GameResources/`. Pour `path_gameplay_sprite`, le jeu préfixe automatiquement `items/resources/`. Si vous écrivez vous-même ce sous-dossier, le jeu cherchera `items/resources/items/resources/...` et ne trouvera rien.

## Attacher une ressource au monde

Une ressource reste inactive tant que rien ne la produit. Les trois points de raccordement :

```csharp
// 1. Une créature la donne à sa mort ou au dépeçage.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. Un bâtiment la produit lors de la récolte.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. Une culture la fabrique dans ses cités.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

`pNewList: true` lors du premier appel indique : "commence une nouvelle liste au lieu d'ajouter à celle héritée du donateur". Si vous l'oubliez après un clone, votre créature fournira à la fois les ressources du donateur et les vôtres.

## Les matériaux ne sont pas des ressources

Le **matériau** d'un équipement (fer, acier, mithril) est un `ItemAsset` dans une bibliothèque de matériaux, et non un `ResourceAsset`, même si l'utilisation d'un matériau coûte des ressources. C'est l'un des points où la terminologie du jeu est particulièrement trompeuse. Voir **[Objets personnalisés](#/nml/custom-items)**.

Le pont entre les deux est `cost_resources` sur le matériau, qui énumère les identifiants de ressources et les quantités requises.

> [!TIP] Ajoutez la recette, pas l'ingrédient
> Un nouvel *ingrédient* exige une source : quelque chose pour le faire pousser, un biome pour l'abriter, un métier pour le récolter. Une nouvelle *recette* ne demande que des ingrédients déjà existants et s'intègre immédiatement dans les boulangeries et routes marchandes en place. L'une prend un après-midi, l'autre une semaine :PES_ChillPill:.
