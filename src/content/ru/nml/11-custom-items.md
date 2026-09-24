---
title: Пользовательские предметы
group: Игровой контент
subgroup: Предметы и снаряжение
icon: :wbcrystalsword:
order: 120
---

# Пользовательские предметы :wbcrystalsword:

Оружие, броня, кольца и амулеты хранятся в `AssetManager.items` в виде объектов класса `EquipmentAsset`.

Первое, что нужно усвоить: **в игре не существует абстрактного предмета «меч» с полем материала, выбираемым на лету**. В игре существуют `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`. Девять совершенно отдельных ассетов, каждый со своей стоимостью, характеристиками и строкой `material`. То же самое касается каждого доспеха, каждого лука, каждого амулета.

Именно поэтому клонирование здесь — не просто удобный способ, а единственный благоразумный.

## Базовые шаблоны

Идентификаторы, начинающиеся со знака `$`, являются шаблонами и содержат базовые настройки для целого класса оружия:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

Шаблон `$sword` уже задаёт `equipment_subtype`, `is_pool_weapon`, `pool_rate`, анимацию взмаха, шаблоны генерации имён и `group_id`. Всё это вам обязательно понадобится.

## Создание оружия

> [!WARNING] Оружие без пути к спрайту убивает загрузчик
> Для каждого оружия из пула игра ставит `path_gameplay_sprite` в `items/weapons/w_<id>`, а `path_icon` в `ui/Icons/items/icon_<id>`. Делает она это в `post_init()`, во время собственной загрузки, так что вашего оружия в списке ещё нет и оба поля остаются `null`. Дальше прелоадер вызывает `getSpriteList(null)`, и загрузка падает с `ArgumentNullException: Value cannot be null. Parameter name: key` :wbfacepalm:.
>
> Задайте оба сами. Укажите на свои файлы в `GameResources/` или возьмите ванильную пару, пока тестируете остальное.

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] Зарегистрировано — не значит сковано
> Город выбирает, какое оружие ковать, из списка `equipment_by_subtypes` (по одному списку на подтип оружия), а новые случайные предметы генерируются из `pot_weapon_assets_all` и `pot_weapon_assets_unlocked`. Метод `ItemLibrary.linkAssets()` заполняет эти списки при запуске игры до загрузки мода. Без последних четырех строк ваше оружие будет существовать и выдаваться кодом, но ни один кузнец в мире никогда его не скует :PES5_Hmmmm:. Броня и аксессуары используют списки `pot_equipment_by_groups_all` и `pot_equipment_by_groups_unlocked` (по `group_id`) вместо списков оружия.


## Поля ассета

### Identity

| Поле | Что делает |
| --- | --- |
| `material` | Название материала. Входит в имя предмета и сравнивается ИИ при замене экипировки |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. Слот экипировки |
| `equipment_subtype` | `sword`, `axe`, `bow`, … Подтип оружия. У культур есть любимые подтипы |
| `group_id` | Вкладка категории снаряжения. См. **[Группы черт и вкладки](#/nml/trait-groups)** |
| `attack_type` | Ближний или дальний тип поведения |
| `quality` | Минимальное качество предмета при выпадении |
| `rarity`, `pool_rate` | Вероятность выбора предмета генератором |
| `is_pool_weapon` | Попадает ли оружие в общий пул случайного оружия |

### Стоимость и ценность

Держите цены в рамках разумного. Железный меч за 43 миллиона монет - это не баланс, это развод :trollface:.

| Поле | Что делает |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | Удобный метод для одновременной установки всех цен. Используйте вместо раздельных полей |
| `minimum_city_storage_resource_1` | Город не начнёт ковать предмет, если запас ресурсов на складе ниже этого порога |
| `equipment_value` | Насколько предмет хорош по мнению ИИ. Влияет на решение «пора ли этому воину сменить меч» |
| `durability`, `rigidity_rating` | Прочность и сопротивляемость поломке |

### Внешний вид и анимация

| Поле | Что делает |
| --- | --- |
| `path_gameplay_sprite` | Спрайт предмета в руках существа |
| `colored`, `animated` | Подвержен ли предмет перекраске, анимирован ли |
| `path_slash_animation` | Эффект взмаха оружия |
| `projectile` | Для оружия дальнего боя: какой снаряд летит. См. **[Снаряды, заклинания и эффекты](#/nml/projectiles-spells)** |
| `name_class`, `name_templates` | Как именуются легендарные версии предмета |

### Behaviour

Здесь предмет перестаёт быть просто набором чисел.

| Поле | Что делает |
| --- | --- |
| `action_attack_target` | Вызывается при каждом успешном ударе |
| `action_special_effect` + `special_effect_interval` | Срабатывает по таймеру, пока предмет надет |
| `item_modifier_ids` | Модификаторы (зачарования), доступные предмету. См. **[Зачарования оружия](#/nml/item-modifiers)** |
| `addSpell(id)` | Заклинание, которое предмет даёт своему владельцу |
| `addCombatAction(id)` | Боевой приём, открываемый предметом |


## Эффект при удерживании в руках

«Тот, кто держит Тлеющий клинок, становится Быстрым» звучит как черта на предмете. Предметы не несут в себе черт, но они выполняют код по таймеру, пока экипированы (`action_special_effect` из таблицы выше), а **статус** истекает сам по себе. Таким образом, предмет постоянно повторно накладывает короткий статус, и когда предмет исчезает, статус просто прекращается:

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3 секунды, обновляется каждую секунду, пока удерживается. Бросьте клинок — и он исчезнет
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

Статусу требуется `allow_timer_reset = true` (по умолчанию для нового `StatusAsset`, но не для всех ванильных статусов, от которых вы могли бы клонировать), иначе повторное наложение до истечения срока ничего не сделает, и он спадет прямо во время боя. В HelloBox клинок проклинает своего владельца — ровно то, что сделал бы тлеющий клинок :wbfacepalm:.

Почему не черта: черта остаётся до тех пор, пока что-то её не удалит, поэтому вам понадобился бы второй таймер, чтобы отслеживать пропажу клинка. Статус очищается сам.

## Собственный спрайт

У предмета есть два графических элемента, задаваемых отдельными полями:

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] Оружию нужна отдельная папка для LoadAll
> Встроенный загрузчик оружия вызывает `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, выполняющий `Resources.LoadAll<Sprite>`. В NeoModLoader метод `LoadAll` ищет совпадение по имени директории. Если `path_gameplay_sprite` равен `"items/weapons/w_hello_sword"`, NML ищет папку `GameResources/items/weapons/w_hello_sword/`. Если положить одиночный файл `w_hello_sword.png` без папки, `LoadAll` вернет 0 спрайтов и запишет в лог `Weapon Texture is Missing`. Размещение файла внутри одноименной папки решает проблему.

> [!NOTE] Оружию нужна отдельная папка для LoadAll
> Встроенный загрузчик оружия вызывает `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, выполняющий `Resources.LoadAll<Sprite>`. В NeoModLoader метод `LoadAll` ищет совпадение по имени директории. Если `path_gameplay_sprite` равен `"items/weapons/w_hello_sword"`, NML ищет папку `GameResources/items/weapons/w_hello_sword/`. Если положить одиночный файл `w_hello_sword.png` без папки, `LoadAll` вернет 0 спрайтов и запишет в лог `Weapon Texture is Missing`. Размещение файла внутри одноименной папки решает проблему.

> [!NOTE] Оружию требуется папка для LoadAll
> Предзагрузчик оружия вызывает `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`, который выполняет `Resources.LoadAll<Sprite>`. В NeoModLoader метод `LoadAll` ищет по имени папки. Если `path_gameplay_sprite` равен `"items/weapons/w_hello_sword"`, NML ищет каталог `GameResources/items/weapons/w_hello_sword/`. Если положить только отдельный файл `w_hello_sword.png` без папки, `LoadAll` ничего не найдёт, вернёт 0 спрайтов, и игра выдаст ошибку `Weapon Texture is Missing`. Поместив спрайт в подпапку с таким именем, вы обеспечите корректную загрузку.

Спрайт оружия отрисовывается в масштабе существа и требует точки привязки в центре снизу (`PivotX: 0.5, PivotY: 0.0` в `sprites.json`), иначе оружие повиснет в воздухе рядом с ладонью (см. **[Спрайты и ресурсы](#/nml/sprites-and-resources)**).

Если оставить любое из полей со стандартным ванильным значением (например, `"items/weapons/w_sword_iron"`), игра будет использовать оригинальную графику — отличный способ выпустить первое оружие :PESgn_Neat:.

## Полная линейка материалов

Та же ситуация, что и с существами: редко когда требуется ровно один предмет. Девять материалов означают девять ассетов, а девять скопированных блоков кода — девять мест для потенциальных багов.

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## Тексты и локализация

Имена предметов формируются не так, как у остальных сущностей в этой игре, что часто сбивает с толку, меня в том числе :PESgn_Oops:. Отображаемое имя предмета определяется выражением:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

Поэтому наш клинок выше, склонированный из `$sword`, наследует `equipment_subtype = "sword"` и будет называться просто **Меч** (по ванильному ключу), а вовсе не вашим ID. Есть два выхода:

```csharp
blade.translation_key = "hello_sword_ember";   // собственное уникальное имя при сохранении подтипа меча
```

Либо оставить имя подтипа в покое и дать **материалу** определить название, как это устроено в ванилле: каждый меч называется «Меч», а `sword_iron` читается как «Железный меч» благодаря ключу материала.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| Ключ | Откуда берётся |
| --- | --- |
| `item_<subtype>` или ваш `translation_key` | Название предмета |
| `<id>_description` | Описание во всплывающей подсказке |
| `item_mat_<material>` | Слово материала в названии |

Новому материалу **всегда** требуется свой ключ `item_mat_`, иначе в начале названия оружия будет красоваться сырой технический ключ.

## Выдача предмета в руки юнита

**Ассет** — это рецепт. **Предмет** — это реальный игровой экземпляр в инвентаре конкретного существа, со своим качеством, модификаторами и именем. Выдача состоит из двух шагов:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. собираем реальный предмет по рецепту ассета
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. отдаём существу — setItem сам подберёт нужный слот согласно equipment_type
actor.equipment.setItem(item, actor);
```

`generateItem` рассчитывает качество и зачарования по тем же формулам, что и игровой лут, поэтому полученный предмет никогда не будет абсолютно идентичен зарегистрированному шаблону.

## Инструменты в руках

Молот, которым размахивает строитель, и корзина в руках собирателя — это не предметы экипировки. Это **ручные инструменты (hand tools)**: чисто визуальные спрайты, отображаемые, пока юнит занят определенной задачей, и исчезающие по ее завершении.

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

Задача выводит инструмент через поле `force_hand_tool`, поэтому факел будет появляться в руках существа каждый раз при выполнении задачи блуждания из **[Пользовательский ИИ](#/nml/custom-ai)**.

> [!WARNING] Загружайте кадры вручную
> `UnitHandToolLibrary.loadSprites()` заполняет массив `gameplay_sprites` для каждого инструмента на старте игры. У инструмента, добавленного модом позже, этот массив пуст, и юнит будет держать пустоту. Путь читается через `getSpriteList()`, поэтому он обязан указывать на **папку** с кадрами (`items/tools/tool_hello_torch/`), даже если кадр всего один. Без точки привязки в `sprites.json` инструмент привяжется к центру спрайта.

| Поле | Что делает |
| --- | --- |
| `path_gameplay_sprite` | Папка со спрайтами. Игра формирует путь по шаблону `items/tools/tool_<id>` |
| `animated` | Зацикленная покадровая анимация, как у чашки кофе |
| `colored` | Окрашивание в цвет королевства, как у флага |

> [!TIP] Сначала чары, потом оружие
> Новое оружие требует спрайтов, цепочки материалов, балансировки стоимости и урона. Новый **модификатор (чары)** занимает двадцать строк кода и сразу же работает со всем оружием в игре, включая оружие из других модов. Если хотите быстрых результатов уже сегодня, загляните в **[Модификаторы предметов](#/nml/item-modifiers)** :PESgn_DoIt:.
