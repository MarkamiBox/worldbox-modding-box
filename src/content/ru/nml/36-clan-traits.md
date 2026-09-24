---
title: Черты кланов
group: Игровой контент
subgroup: Черты и генетика
icon: :wbclanroses:
order: 110
---

# Черты кланов :wbclanroses:

**Клан** (clan) — это родословная: семья, разросшаяся настолько, что стала самостоятельной силой со своим знаменем, собственным цветом и репутацией. Черта (trait) клана — это то, что передается в этой крови.

Черты клана ближе всего в игре к наследственным сверхспособностям, и это единственная система черт со встроенным **разделением характеристик (stats) по полу**.

| | |
| --- | --- |
| Библиотека (library) | `AssetManager.clan_traits` |
| Класс | `ClanTrait` |
| Группы | `AssetManager.clan_trait_groups`, класс `ClanTraitGroupAsset` |
| Владелец в рантайме | `Clan`, в `World.world.clans` |
| Префикс локализации | `clan_trait_` |
| Папка иконок по умолчанию | `ui/Icons/clan_traits/` |

## Регистрация черты

```csharp Mods/HelloBox/Code/HelloClan.cs
namespace HelloBox
{
    public static class HelloClan
    {
        public const string OLD_BLOOD = "hello_old_blood";

        public static void Initialize()
        {
            if (AssetManager.clan_traits.has(OLD_BLOOD)) return;

            ClanTrait trait = new ClanTrait
            {
                id = OLD_BLOOD,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloClan",
                rarity = Rarity.R1_Rare
            };

            AssetManager.clan_traits.add(trait);

            trait.base_stats["multiplier_health"] = 0.15f;
            trait.base_stats["armor"] = 4;
            trait.base_stats.addTag("immunity_cold");
        }
    }
}
```

Характеристики `base_stats` клана внедряются в каждого члена клана, так что, в отличие от религии (religion), это полноценная система характеристик. Порядок объединения описан в **[Справочнике характеристик](#/nml/stats)**.

## Разделение характеристик по полу

Два поля, которых нет ни у одного другого класса черт:

```csharp
trait.base_stats["health"] = 20;           // для всех членов
trait.base_stats_male["damage"] = 6;       // только мужчины
trait.base_stats_female["intelligence"] = 4;   // только женщины
```

`Actor.updateStats()` объединяет `clan.base_stats`, а затем `clan.base_stats_male` **или** `clan.base_stats_female` в зависимости от пола юнита. Оба дополнительных блока существуют с самого начала и не требуют предварительного вызова `add()`, так что писать в них значения можно в любой момент.

## Решения: что клан *делает*

Ванильные черты клана опираются скорее на решения (decision), чем на хуки действий, ведь клан — это социальное образование:

```csharp
trait.addDecision("banish_unruly_clan_members");
trait.addOpposite("hello_new_blood");
```

Решение — это поведенческий выбор ИИ в `AssetManager.decisions_library`. Две ванильные черты клана, `blood_pact` и `deathbound`, представляют собой одну и ту же черту с разными решениями и объявлены взаимоисключающими противоположностями. Этот паттерн определенно стоит перенимать: две черты, одна ось, взаимное исключение.

## Хуки боя и эффектов

```csharp
// при каждом ударе члена клана
trait.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null) return false;
    return true;
};

// по таймеру для каждого члена клана
trait.special_effect_interval = 2f;
trait.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreHealth(1);
    return true;
};
```

Обязательно проверяйте ссылки на null и возвращайте `false`, если действие не выполнялось. Эти хуки вызываются для каждого члена каждого клана с данной чертой.

## Блокировка за достижением

Некоторые ванильные черты клана выступают наградами, а не доступны изначально:

```csharp
trait.setUnlockedWithAchievement("achievementSegregator");
```

Заблокированная черта по-прежнему существует и полноценно работает; просто игрок не может выбрать ее в редакторе до выполнения достижения (achievement). Обратите внимание, что `BaseTraitLibrary` также автоматически присваивает `rarity = R3_Legendary` всему, что заблокировано таким образом, чтобы ваша награда выглядела достойно :gold_star:.

## Ванильные группы

`spirit` · `mind` · `body` · `chaos` · `harmony` · `fate` · `special`

Собственная вкладка: см. **[Группы черт и вкладки](#/nml/trait-groups)**, с `AssetManager.clan_trait_groups` и `ClanTraitGroupAsset`.

## Тексты локализации

```json Mods/HelloBox/Locales/en.json
{
  "clan_trait_hello_old_blood": "Old Blood",
  "clan_trait_hello_old_blood_info": "Their great-grandparents were also difficult to kill."
}
```

## Раздача черты

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addClanTrait(HelloClan.OLD_BLOOD);
```

```csharp
foreach (Clan clan in World.world.clans)
{
    if (clan == null || clan.isRekt()) continue;

    clan.addTrait(HelloClan.OLD_BLOOD, pRemoveOpposites: true);
}
```

Клан юнита хранится в `actor.clan`, а `actor.hasClan()` сообщает, состоит ли он в клане вообще — огромное количество юнитов никогда не вступают ни в один клан.

> [!TIP] Кланы компактны, не бойтесь щедрости
> Культура (culture) охватывает целый континент; клан объединяет лишь семью, а `limit_clan_members` жестко ограничивает его размер. Черта клана может быть значительно мощнее черты культуры при аналогичном влиянии на баланс мира, что делает кланы идеальным местом для ярких и эффектных механик :PES5_Menace:.

## Новые кланы, случайно получающие черту при создании

Помимо ручной выдачи, черта клана может установить флаг `spawn_random_trait_allowed`, чтобы выбираться при создании нового клана — точно так же, как культура выбирает свои начальные черты. Та же ловушка, что и на всех остальных страницах о чертах:

> [!WARNING] `spawn_random_trait_allowed` читается только один раз, при запуске
> Новые кланы выбирают начальные черты из пула, который `BaseTraitLibrary.linkAssets()` формирует во время загрузки игры, до появления вашего мода. Установка флага на вашей черте сама по себе ничего не меняет: черта никогда не попадет в этот пул и не появится случайно у нового клана. Добавьте её сами с весом, используемым в ванильной игре:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.clan_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` объявлен как `protected`, поэтому он компилируется против публицизированной сборки, с которой NML собирает ваш мод. По умолчанию `spawn_random_rate` равен `5`: увеличьте его, чтобы черта выпадала чаще.
