---
title: Черты религии
group: Игровой контент
subgroup: Черты и генетика
icon: :wbpray:
order: 108
---

# Черты религии :wbpray:

**Религия** принадлежит городам и королевствам, распространяется через обращение в веру, пишет священные книги и может вершить **обряды**: меняющие мир заговоры, которые ее последователи пытаются воплотить самостоятельно. Черта религии — это одно верование.

| | |
| --- | --- |
| Библиотека | `AssetManager.religion_traits` |
| Класс | `ReligionTrait` |
| Группы | `AssetManager.religion_trait_groups`, класс `ReligionTraitGroupAsset` |
| Владелец в рантайме | `Religion`, в `World.world.religions` |
| Префикс локализации | `religion_trait_` |
| Папка иконок по умолчанию | `ui/Icons/religion_traits/` |

> [!WARNING] Характеристики религии не передаются юнитам
> Это единственная система черт, чьи `base_stats` никогда не попадают в `Actor`. `Actor.updateStats()` объединяет подвиды, кланы, языки и культуры. **Религии в этом списке нет.**
>
> Поэтому черта религии преображает мир через то, что она *делает* (обряд, трансформация биома, хук действия), а не через числовые характеристики. Назначить ей `base_stats["damage"] = 10` — это холостой выстрел в пустоту и самый частый способ бессмысленно потратить день :PES4_BigSad:.

## Регистрация черты

```csharp Mods/HelloBox/Code/HelloReligion.cs
namespace HelloBox
{
    public static class HelloReligion
    {
        public const string ASHES = "hello_rite_of_ashes";

        public static void Initialize()
        {
            if (AssetManager.religion_traits.has(ASHES)) return;

            ReligionTrait trait = new ReligionTrait
            {
                id = ASHES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "destruction",
                path_icon = "ui/Icons/iconHelloReligion",
                plot_id = "summon_meteor_rain",      // обряд, который могут исполнить верующие
                priority = -1,
                spawn_random_trait_allowed = false,
                rarity = Rarity.R2_Epic
            };

            AssetManager.religion_traits.add(trait);
        }
    }
}
```

## Обряды: поле `plot_id`

Черта религии с заполненным полем `plot_id` становится **обрядом**. Религия собирает свои обряды в коллекцию `possible_rites`, и правители со жрецами пытаются исполнить их самостоятельно, как только выполнены условия заговора.

```csharp
trait.plot_id = "summon_meteor_rain";
```

Идентификатор ссылается на `AssetManager.plots_library`. Ванильные обряды переиспользуют существующие заговоры — `summon_earthquake`, `summon_meteor_rain`, `summon_thunderstorm`, `summon_stormfront`, `summon_hellstorm`, `clan_ascension` — и вы можете сделать так же либо предварительно зарегистрировать собственный `PlotAsset`.

Сам заговор определяет, кто вправе его начать и насколько он сложен:

| Поле PlotAsset | Назначение |
| --- | --- |
| `can_be_done_by_king`, `can_be_done_by_leader`, `can_be_done_by_clan_member` | Кто может инициировать |
| `min_intelligence`, `min_diplomacy`, `min_warfare`, `min_stewardship` | Требования к характеристикам |
| `min_level`, `min_renown_actor`, `min_renown_kingdom` | Требования к уровню и славе |
| `progress_needed`, `money_cost` | Длительность и денежная стоимость |
| `pot_rate`, `rarity` | Частота выбора со стороны ИИ |
| `check_is_possible`, `check_should_continue` | Ваши собственные условия проверки |

## Трансформации: поле `transformation_biome_id`

Второе поле, уникальное для черт религии. Оно помечает черту как трансформацию и задает биом, который вера постепенно распространяет по окружающим землям:

```csharp
trait.transformation_biome_id = "biome_desert";
```

В ванильной игре это используется для `sands_of_ruin` (пустыня), `shadowroot` (скверна), `echo_of_the_void` (сингулярность), `infernal_rot` (инферно) и `cosmic_radiation` (пустошь). Религия с такой чертой медленно переписывает ландшафт под ногами своих последователей — это самый масштабный визуальный эффект среди всех одиночных черт в игре.

## Заставить черту что-то *делать*

Поскольку характеристики исключены, именно хуки действий являются тем, ради чего создаются черты религии. Они точно такие же, как и у всех остальных черт:

```csharp
// каждые несколько секунд для каждого последователя
trait.special_effect_interval = 5f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreMana(2);
    return true;
};

// когда верующий погибает
trait.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };
```

Черта религии также может наделять заклинанием или поведенческим решением, что зачастую оказывается куда органичнее простого таймера:

```csharp
trait.addSpell("hello_bolt");           // см. Снаряды, заклинания и эффекты
trait.addDecision("burn_tumors");       // решение ИИ, которое могут принять последователи
```

## Ванильные группы

`harmony` · `creation` · `destruction` · `restoration` · `necromancy` · `protection` · `the_void` · `transformation` · `fate` · `special`

Собственная вкладка: см. **[Группы черт и вкладки](#/nml/trait-groups)**, с `AssetManager.religion_trait_groups` и `ReligionTraitGroupAsset`.

## Тексты локализации

```json Mods/HelloBox/Locales/en.json
{
  "religion_trait_hello_rite_of_ashes": "Rite of Ashes",
  "religion_trait_hello_rite_of_ashes_info": "Somebody always volunteers."
}
```

## Раздача черты

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addReligionTrait(HelloReligion.ASHES);
```

```csharp
foreach (Religion religion in World.world.religions)
{
    if (religion == null || religion.isRekt()) continue;

    religion.addTrait(HelloReligion.ASHES, pRemoveOpposites: true);
}
```

Объект `Religion` также открывает доступ к `cities`, `kingdoms`, `books` и `possible_rites` — именно к ним обращается код, когда требуется выяснить текущие замыслы религиозной конфессии.

> [!TIP] Обряды — главная цель
> Религия, меняющая лишь сухие цифры, остается незаметной. Религия, чьи жрецы периодически обрушивают на врагов метеоритный дождь — это то, ради чего игроки делают скриншоты. Направьте все силы в `plot_id` :aPES_Flames:.
