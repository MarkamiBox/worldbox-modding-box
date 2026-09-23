---
title: Resources & food
group: Game Content
subgroup: World & Civilizations
icon: :wbtomato:
order: 182
---

# Resources & food :wbtomato:

A resource is anything a city stores, trades, eats or forges with: wheat, bread, stone, mythril, bones, gems. They live in `AssetManager.resources`, and they are the layer underneath the whole economy: what farms produce, what bakers cook, what smiths need, what a hungry unit eats.

## Clone from a template

> [!WARNING] Set `full_sprite_path` or the loader throws
> `path_gameplay_sprite` is only half of it. The library builds `full_sprite_path` from it in `post_init()`, once, during the game's own load, so a resource registered by a mod keeps a `null` there. The sprite preloader then calls `getSpriteList(null)` and the whole load dies with `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ and $TEMPLATE_STRATEGIC_MINERAL$ are the two starting points.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // The library derives this one in post_init(), which already ran. Set it yourself.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;

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

## The fields

### What it is

| Field | What it does |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Whether a unit will eat it |
| `wood`, `mineral` | Which harvesting tools and jobs apply |
| `path_icon` | The icon in inventories and lists |
| `path_gameplay_sprite` | The sprite a unit holds while carrying it |

### Eating it

| Field | What it does |
| --- | --- |
| `restore_nutrition` | Hunger restored |
| `restore_health` | Health restored, as a ratio |
| `restore_stamina`, `restore_mana`, `restore_happiness` | The rest of the bars |
| `give_experience` | Experience for eating it |
| `tastiness`, `favorite_food_chance` | How likely a unit is to prefer it |
| `diet` | Which diets can eat it |
| `eat_action` | Your own code, when something eats it |
| `give_trait_id`, `give_status_id`, `give_chance` | Traits and statuses eating it can apply |

### Making and moving it

| Field | What it does |
| --- | --- |
| `ingredients`, `ingredients_amount` | What it is cooked or crafted from |
| `produce_min` | How much one production job makes |
| `mine_rate` | How fast it is harvested |
| `drop_max`, `drop_per_mass` | How much drops when the source is destroyed |
| `stack_size`, `storage_max`, `maximum` | Carrying and storage limits |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Army supply behaviour |
| `trade_cost`, `trade_give`, `trade_bound` | Trade behaviour |
| `money_cost`, `loot_value` | What it is worth |

## The vanilla resources

Worth knowing, because using an existing one is almost always better than adding a new one:

**Food and ingredients:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Strategic and other:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## Your own sprites

A resource has two pieces of art, and they resolve **differently**. This is the one that catches people.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- the inventory icon, at the root
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- what a unit carries
```

```csharp
cake.path_icon = "iconHelloCake";        // loaded exactly as written
cake.path_gameplay_sprite = "hello_cake";   // loaded as items/resources/hello_cake
```

`path_icon` is a plain path, and vanilla writes a bare name, so the file ends up at the root of `GameResources/`. `path_gameplay_sprite` has `items/resources/` prepended for you, so writing the folder yourself gives you `items/resources/items/resources/...` and no sprite.

## Attaching a resource to something

A resource is inert until something produces it. The three places that matter:

```csharp
// 1. A creature yields it when butchered or when it dies.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. A building yields it when harvested.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. A culture produces it in its cities.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

`pNewList: true` on the first call means "start a fresh list instead of appending to the donor's". Forget it after a clone and your creature yields the donor's resources as well as yours.

## Materials are not resources

An item's **material** (iron, steel, mythril) is an `ItemAsset` in a material library, not a `ResourceAsset`, even though a material costs resources to use. That is one of the places the game's naming is genuinely confusing. See **[Custom items](#/nml/custom-items)**.

The link between them is `cost_resources` on the material, which names resource ids and amounts.

> [!TIP] Add the recipe, not the ingredient
> A new *ingredient* needs a source: something growing it, a biome producing it, a job harvesting it. A new *recipe* only needs ingredients that already exist, and it slots straight into the existing baker and the existing trade routes. One is an afternoon, the other is a week :PES_ChillPill:.
