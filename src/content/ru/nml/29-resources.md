---
title: Ресурсы и еда
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbtomato:
order: 182
---

# Ресурсы и еда :wbtomato:

Ресурс — это всё, что город хранит на складах, продает, ест или пускает в кузнечное дело: пшеница, хлеб, камень, мифрил, кости, самоцветы. Они живут в `AssetManager.resources` и образуют фундамент всей экономики: то, что выращивают фермы, что выпекают пекари, что требуется кузнецам и что съедает голодный горожанин. При такой экономике даже хлеб - это структура данных :PES2_Cash:.

## Клонирование из шаблона

> [!WARNING] Задайте `full_sprite_path`, иначе загрузчик падает
> `path_gameplay_sprite` — только половина дела. Библиотека собирает из него `full_sprite_path` в `post_init()`, один раз, во время загрузки игры, так что у ресурса от мода там остаётся `null`. Прелоадер спрайтов вызывает `getSpriteList(null)`, и вся загрузка падает с `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$ и $TEMPLATE_STRATEGIC_MINERAL$ — две идеальные отправные точки.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // Библиотека вычисляет это в post_init(), который уже прошёл. Задайте сами.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // то, что юнит держит в руках

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

## Поля

### Что это такое

| Поле | Что делает |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | Едят ли его существа в качестве пищи |
| `wood`, `mineral` | Какие инструменты сбора и профессии к нему применяются |
| `path_icon` | Иконка в инвентарях и списках |
| `path_gameplay_sprite` | Спрайт, который существо держит в руках при переноске |

### Употребление в пищу

| Поле | Что делает |
| --- | --- |
| `restore_nutrition` | Восстанавливаемая сытость |
| `restore_health` | Восстанавливаемое здоровье, в долях |
| `restore_stamina`, `restore_mana`, `restore_happiness` | Остальные полоски потребностей |
| `give_experience` | Опыт, получаемый при съедании |
| `tastiness`, `favorite_food_chance` | Вероятность стать любимой едой существа |
| `diet` | Биологические диеты, способные это переварить |
| `eat_action` | Ваш код при съедании ресурса |
| `give_trait_id`, `give_status_id`, `give_chance` | Черты и статусы, накладываемые при еде |

### Производство и логистика

| Поле | Что делает |
| --- | --- |
| `ingredients`, `ingredients_amount` | Из чего ресурс готовится или куется |
| `produce_min` | Сколько единиц дает один производственный цикл |
| `mine_rate` | Скорость добычи или сбора |
| `drop_max`, `drop_per_mass` | Сколько выпадает при разрушении источника |
| `stack_size`, `storage_max`, `maximum` | Лимиты переноски и складирования |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | Поведение при снабжении армий |
| `trade_cost`, `trade_give`, `trade_bound` | Торговое поведение между городами |
| `money_cost`, `loot_value` | Денежная стоимость и ценность в качестве добычи |

## Ванильные ресурсы

Их полезно знать, поскольку использовать готовый ресурс почти всегда выгоднее, чем городить новый:

**Еда и ингредиенты:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**Стратегические и прочие:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## Собственные спрайты

У ресурса два графических элемента, и они подгружаются **совершенно по-разному**. На этом попадаются почти все: И вас она тоже однажды подловит.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- иконка инвентаря, в корне папки
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- то, что существо несет в руках
```

```csharp
cake.path_icon = "iconHelloCake";        // загружается ровно так, как написано
cake.path_gameplay_sprite = "hello_cake";   // загружается автоматически как items/resources/hello_cake
```

`path_icon` — это прямой путь, и ваниль пишет короткое имя, поэтому файл должен лежать в корне `GameResources/`. Для поля `path_gameplay_sprite` игра сама подставляет `items/resources/`. Если вы напишете путь к папке вручную, игра попытается найти `items/resources/items/resources/...` и останется без спрайта.

## Подключение ресурса к миру

Ресурс остается мертвым грузом, пока хоть что-то в игре его не производит. Три главных способа:

```csharp
// 1. Существо дает ресурс при разделке или смерти.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. Здание производит ресурс при сборе урожая.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. Культура производит его в своих городах.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

Параметр `pNewList: true` при первом вызове означает: "начни новый список, а не дописывай в хвост списку донора". Забудьте его после клонирования — и ваше существо будет сбрасывать и ресурсы донора, и ваши собственные.

## Материалы — это не ресурсы

**Материал** предмета (железо, сталь, мифрил) — это `ItemAsset` в библиотеке материалов, а не `ResourceAsset`, даже если использование материала стоит реальных ресурсов. Это одна из тех областей, где внутренняя терминология игры максимально запутывает. См. **[Кастомные предметы](#/nml/custom-items)**.

Связкой между ними выступает поле `cost_resources` на материале, где перечисляются id ресурсов и их количество.

> [!TIP] Добавляйте рецепт, а не ингредиент
> Новой *культуре или ингредиенту* нужен целый производственный цикл: растение, биом для произрастания, профессия для сбора. Новой *выпечке или блюду* нужны только уже существующие ингредиенты, и рецепт мгновенно встраивается в работающие пекарни и торговые пути. Первое займет неделю, второе — один вечер :PES_ChillPill:.
