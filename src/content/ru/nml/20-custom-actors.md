---
title: Кастомные актеры
group: Игровой контент
subgroup: Актеры, здания и ИИ
icon: :wbhuman:
order: 140
---

# Кастомные актеры :wbhuman:

> [!NOTE] Они называются актерами, а не расами
> Игра называет каждое живое существо **актером** (actor): человека, волка, дракона, зомби, краба. Все они происходят от одного базового класса `ActorAsset` и хранятся в `AssetManager.actor_library`. "Раса" - устаревшее слово. Единственное место, где оно еще теплится, - это свойство `race` с пометкой `[Obsolete("use .original_actor_asset instead")]`, существующее исключительно для загрузки древних сохранений. Всегда и везде пишите `actor`.

Новое существо - это тот самый мод, который хотят создать абсолютно все, но почти никто не доводит до конца. Дело в том, что `ActorAsset` несет в себе анимации, текстуры, звуки, таксономию, диету, флаги ИИ, геном, культуру (culture) и параметры. Ошибетесь хотя бы в одном из них - и получите невидимое существо, бездвижно стоящее посреди океана :PES4_Invisible:.

Хорошая новость: сама игра тоже не собирает существ с нуля. Вот буквально то, как ванильный код создает эльфа:

```csharp
clone("elf", "$civ_advanced_unit$");
```

Мы поступим в точности так же.

## Шаблоны

Идентификаторы, обрамленные в `$`, - это **шаблоны** (templates): полуготовые актеры, хранящиеся в игре лишь для того, чтобы от них клонировали других. Это идеальная отправная точка для совершенно нового существа, поскольку они содержат всю внутреннюю логику без навязывания спрайтов человека.

| Шаблон | Для чего клонировать |
| --- | --- |
| `$basic_unit$` | Абсолютный минимум живого существа |
| `$animal$` | Дикое животное |
| `$mob$` | Враждебный монстр |
| `$civ_unit$` | Базовое разумное существо |
| `$civ_advanced_unit$` | Полноценная цивилизация: города, государства, культура, религия (religion). То, на чем построены люди, эльфы, орки и гномы |

Вы также можете клонировать уже готового актера - `human`, `wolf`, `zombie` - и для первого мода это самый простой путь, так как спрайты существа-донора перейдут по наследству, и ваша единица сразу станет видимой на карте.

## Один актер

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] Загрузите тень сами, иначе игра будет жаловаться на каждого актора
> `ActorAssetLibrary` при запуске проходит по своему списку и вызывает `loadShadow()` у каждого актора, который читает спрайт по пути `shadows/<shadow_texture>` и измеряет его. Это произошло до того, как ваш мод что-либо зарегистрировал, поэтому тень вашего актора остаётся `(0.00, 0.00)`, а игра пишет об этом ошибку ассета, трижды, по разу для взрослого, яйца и детёныша :wbfacepalm:.
>
> `loadShadow()` помечен как `internal`, так что для этого нужна **публицированная** `Assembly-CSharp.dll`, как и в остальном руководстве. Если её нет, поставьте вместо этого `asset.shadow = false;`: без тени, но и без ошибки.

> [!WARNING] `clone()` уже регистрирует
> `AssetManager.<library>.clone(newId, sourceId)` внутри вызывает `add()`. Так работает каждая библиотека (library). Вызвать потом `add()` самому - это двойная регистрация: библиотека удаляет первую копию, пишет ошибку и добавляет её заново. Безвредно, но это шум в логе, из-за которого настоящие ошибки труднее найти, и первое, что заметит проверяющий.
>
> Обратная сторона - хорошая новость: **после клонирования `base_stats` уже существует**, так что правило «характеристики (stats) после add» из **[Своих черт](#/nml/custom-traits)** уже выполнено.

## Несколько актеров сразу

Редко кто ограничивается добавлением одного существа. Три разновидности духов означают три ассета, и если скопировать приведенный выше код трижды, вам придется исправлять возможные баги в трех разных местах.

Вынесите различия в массив структур, а регистрацию - в цикл:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

Добавление четвертого существа теперь занимает ровно одну строчку в массиве. Именно к такой архитектуре приходят авторы почти всех крупных модов на существ, и имеет смысл писать так уже со второго актера :PESgn_ThisTBH:.

## Поля, определяющие, чем *является* ваше существо

В первый день важны только три: `civ`, `actor_size` и `name_locale`. Остальное подождёт, пока ваше существо не станет видимым и не начнёт ходить.

| Поле | Что делает |
| --- | --- |
| `civ` | Существо цивилизации: города, королевства (kingdom), профессии, войны (war). `false` = дикое животное |
| `auto_civ` | Начнет ли игра цивилизовывать их самостоятельно |
| `default_animal` | Помечает существо как фауну для внутренних проверок |
| `unit_other` | Не цивилизация и не животное: монстр, голем, особое существо |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Влияет на отрисовку и боевые расчеты |
| `name_locale` | Ключ отображаемого названия |
| `icon` | Иконка в списках и кнопках спавна |
| `color_hex` | Оттенок, накладываемый на окрашиваемые сущности |
| `can_have_subspecies` | Мутируют ли они в подвиды (subspecies) через несколько поколений |
| `has_ai_system` | Запускает ли существо базовую систему поведения (behaviour) |
| `flying` / `hovering` | Отрываются ли они от земли и на какую высоту |
| `force_ocean_creature` / `force_land_creature` | Жестко привязывает существо к воде или суше |
| `can_attack_buildings` | Способны ли атаковать и ломать здания (building) |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | Что божественные силы (GodPower) могут с ними делать |
| `kingdom_id_wild` / `kingdom_id_civilization` | В какое королевство они попадают (дикое или оседлое) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … атлас со спрайтами |
| `animation_walk` / `animation_idle` / `animation_swim` | Наборы кадров со своими полями `_speed` |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | Пути к звуковым событиям FMOD |
| `name_taxonomic_*` | Царство, тип, класс, отряд, семейство, род и вид для энциклопедии |
| `collective_term` | Название стаи ("**стая** волков") |
| `allowed_status_tiers` | Допустимые уровни накладываемых эффектов состояния |
| `production` | Что производят их города |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | В кого превращается при заражении или смерти |

## Интеграция цивилизованного существа в мир

Разумный `civ`-актер не готов, если у него заполнены только статы. Вот параметры, которые игра задает для каждого играбельного вида; если их пропустить, ваша раса будет просто "стоять и ничего не делать":

```csharp
asset.kingdom_id_wild = "nomads_human";          // до того, как они осядут
asset.kingdom_id_civilization = "human";         // тип королевства
asset.banner_id = "human";                       // генератор знамен
asset.architecture_id = "human";                 // стиль их построек
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // правила генерации имен
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Геном: распределение наследуемых характеристик для размножения и мутаций.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Стартовые черты по каждой категории.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Пока у вас нет собственных моделей, используйте ванильные `banner_id` и `architecture_id`. Раса без указанной архитектуры не сможет построить ровным счетом ничего.

## Спавн существа

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

Метод `spawnNewUnit` публичен и принимает опциональные аргументы: звук спавна, спецэффект чуда, высоту появления, конкретный подвид и выдачу стартовых предметов (item).

Привяжите к нему кнопку божественной силы - и получите готовый спавнер. См. **[Вкладки сил и кнопки](#/nml/power-buttons)**.

## Подвиды

Подвиды (Subspecies) - это вариации, в которые вид эволюционирует и мутирует со сменой поколений. У них своя собственная библиотека черт (trait), отделенная от черт существ, и свой список групп:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// выдаем актеру эту черту со старта
asset.addSubspeciesTrait("hello_scales");
```

Черты подвидов могут также нести **визуальные ресурсы**: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` и другие. Это позволяет подвиду выглядеть иначе, чем предки, не требуя создания отдельного полноценного актера. См. **[Черты подвидов](#/nml/subspecies-traits)**.

## Своя собственная иконка

Прежде чем браться за сложные анимации, сделайте самое простое: иконку для списков и кнопок спавна.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

А вот графика **тела** существа - это задача совершенно другого масштаба, и о ней пойдет речь далее.

## Спрайты - самая сложная часть

Всё, что описано выше, - это просто страничка кода. Настоящий колоссальный труд - это визуальная часть, и именно здесь большинство модов на существ тихо умирает: существу требуется полный комплект анимаций в правильном атласе, нужного размера и с точнейшими точками привязки (pivot). Есть два честных пути:

1. **Оставить спрайты донора.** Существо, использующее человеческие анимации с другими статами и другим оттенком цвета, - это идеальный первый мод, и он *гарантированно работает*.
2. **Экспортировать графику через AssetRipper**, найти атлас клонированного существа и до пикселя повторить его разметку, прежде чем вообще браться за кисть. См. **[Получение игровых спрайтов](#/toolbox/getting-the-sprites)**.

> [!WARNING] Тестируйте в реальном мире, а не на пустой карте
> Разумное существо, которое не умеет прокладывать пути, не умеет строить или тонет сразу после спавна, выглядит идеально первые тридцать секунд. Заспавньте двадцать штук, запустите мир на максимальной скорости на пять минут, а затем откройте лог :PES_MonkaSweat:.
