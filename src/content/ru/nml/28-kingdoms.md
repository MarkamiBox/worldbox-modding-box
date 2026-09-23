---
title: Королевства и фракции
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbkingdoms:
order: 178
---

# Королевства и фракции :wbkingdoms:

Каждое существо в WorldBox принадлежит к определенному королевству. Не только цивилизованные народы: волки принадлежат к волчьему королевству, бандиты — к фракции бандитов, а нейтральная курица — к нейтральному королевству. Класс `KingdomAsset` — это **тип** фракции, а не конкретное государство на карте.

Вот ключевое различие:

| | |
| --- | --- |
| `KingdomAsset` в `AssetManager.kingdoms` | Шаблон. "Что представляет собой орочье королевство" |
| `Kingdom` в `World.world.kingdoms` | Реальное королевство в мире с именем, цветом и городами |

Вы регистрируете первое. Игра создает второе.

## Клонирование шаблона

Как и у существ, у королевств есть идентификаторы вида `$TEMPLATE$` именно для этой задачи:

| Шаблон | Назначение |
| --- | --- |
| `$TEMPLATE_CIV$` | Цивилизованная фракция |
| `$TEMPLATE_CIV_NEW$` | Более новый стиль звероцивилизаций |
| `$TEMPLATE_NOMAD$` | Кочевой этап до основания поселений |
| `$TEMPLATE_MOB$` | Враждебная фракция монстров |
| `$TEMPLATE_MOB_GOOD$` / `$TEMPLATE_MOB_VERY_GOOD$` | Враждебна к одним, мирна к цивилизациям |
| `$TEMPLATE_ANIMAL$` | Дикая природа |
| `$TEMPLATE_ANIMAL_NEUTRAL$` / `$TEMPLATE_ANIMAL_PEACEFUL$` | Мирные животные, не начинающие драк |

```csharp Mods/HelloBox/Code/HelloKingdoms.cs
namespace HelloBox
{
    public static class HelloKingdoms
    {
        public const string CIV = "hello_sprites";
        public const string WILD = "hello_nomads_sprites";

        public static void Initialize()
        {
            if (AssetManager.kingdoms.has(CIV)) return;

            // Оседлая цивилизованная фракция.
            KingdomAsset civ = AssetManager.kingdoms.clone(CIV, "$TEMPLATE_CIV$");
            civ.addTag("civ");
            civ.addFriendlyTag("civ");
            civ.addEnemyTag("orc");
            civ.setIcon("ui/Icons/iconHelloCiv");

            // Дикий этап перед основанием первого города.
            KingdomAsset wild = AssetManager.kingdoms.clone(WILD, "$TEMPLATE_NOMAD$");
            wild.addTag("hello_sprite");
            wild.addFriendlyTag("hello_sprite");
            wild.setIcon("ui/Icons/iconHelloWild");
        }
    }
}
```

Шаблон `$TEMPLATE_NOMAD$` уже выставил `nomads = true`, `civ = false` и `mobs = true` за вас. На этом стоит акцентировать внимание: **`civ`, `nomads`, `mobs` и прочие — это поля типа `bool`, а не теги.** Вызов `wild.nomads = true` — это настоящее поле. А `wild.addTag("nomads")` — это тег, который ни один компонент игры не читает, и он молча не производит никакого эффекта :aPES_Liar:.

Затем укажите эти фракции в вашем существе, связав оба механизма:

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.kingdom_id_wild = HelloKingdoms.WILD;
asset.kingdom_id_civilization = HelloKingdoms.CIV;
```

Без этого шага ваше существо появится в том королевстве, которое использовал донор клона (обычно в человеческом), породив немало путаницы.

## Поля

### К какому типу относится фракция

| Поле | Что делает |
| --- | --- |
| `civ` | Строит города, ведет войны, имеет правителя |
| `nomads` | Кочевая фаза до основания поселений |
| `nature` | Дикие животные |
| `mobs` | Враждебные монстры |
| `neutral` | Ни на кого не нападает без провокации |
| `abandoned`, `concept` | Служебные фракции для внутренних нужд движка |
| `brain` | Мета-фракция под управлением общего ИИ |
| `group_main`, `group_miniciv`, `group_minicivs_cool`, `group_creeps` | В какую категорию игровые списки определяют её |

### Как она себя ведет

| Поле | Что делает |
| --- | --- |
| `always_attack_each_other` | Два королевства этого типа перманентно воюют между собой |
| `units_always_looking_for_enemies` | Юниты непрерывно патрулируют карту в поисках врагов |
| `count_as_danger` | Считают ли другие фракции её угрозой. По умолчанию `true` |
| `friendship_for_everyone` | Дружелюбна ко всем подряд |
| `force_look_all_chunks` | Юниты сканируют всю карту, а не только окрестности. Дорого |
| `building_attractor_id` | Тип построек, притягивающий существ |

### Теги: кто с кем воюет

Это фундаментальная механика: она выражается не числом, а тремя строковыми наборами:

```csharp
kingdom.addTag("civ");             // кем я являюсь
kingdom.addFriendlyTag("neutral"); // кого я люблю
kingdom.addEnemyTag("orc");        // кого я ненавижу
```

Два королевства сопоставляют свои теги для определения базового дипломатического статуса. Фракция без тегов никого не любит, никого не ненавидит и не делает ничего интересного.

### Внешний вид

| Поле | Что делает |
| --- | --- |
| `path_icon`, `show_icon` | Иконка фракции. `setIcon(path)` настраивает оба поля |
| `default_kingdom_color`, `default_civ_color_index` | Базовый цвет |
| `color_building` | Цветовой оттенок построек |

## Остальные элементы инфраструктуры фракции

Ассет королевства сам по себе — лишь ярлык. Вот остальные библиотеки, с которыми взаимодействует полноценная фракция:

| Элемент | Библиотека | Назначение |
| --- | --- | --- |
| Знамена | `AssetManager.kingdom_banners_library` | Генерируемый флаг |
| Цвета | `AssetManager.kingdom_colors_library` | Палитра, выдаваемая королевствам |
| Черты королевства | `AssetManager.kingdoms_traits` | Политика, преимущественно налоги. См. **[Черты королевства](#/nml/kingdom-traits)** |
| Профессии королевства | `AssetManager.job_kingdom` | Над чем работает ИИ фракции |
| Задачи королевства | `AssetManager.tasks_kingdom` | Дерево поведения за этими работами |
| Типы войн | `AssetManager.war_types_library` | Разновидности объявляемых войн |
| Архитектура | `AssetManager.architecture_library` | Внешний вид построек |
| Очередь строительства | `AssetManager.city_build_orders` | Что и в каком порядке возводит новый город |
| Генераторы имен | `AssetManager.name_generator`, `AssetManager.name_sets` | Правила именования стран, городов и граждан |

Используйте ванильные решения, пока у вас нет веской причины создавать свои. Указание `banner_id = "human"` на вашем существе дает готовый рабочий генератор флагов совершенно бесплатно.

## Работа с королевствами во время игры

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    // kingdom.name, kingdom.cities, kingdom.king, kingdom.getPopulationTotal()
}
```

Метод расширения `isRekt()` означает: "объект уже уничтожен, но в коде всё еще болтается ссылка на него". Всегда проверяйте его во всех циклах по королевствам, городам, армиям или юнитам. Это главное отличие стабильного мода от того, который падает раз в час :aPES2_Sweat:.

## Личности

Король и лидер города получают **личность**: имя и набор характеристик `personality_*`, определяющих агрессивность или дипломатичность поведения королевства. Регистрация занимает три строчки. Сложнее заставить кого-то ее *получить*: `Actor.updateStats()` при каждом пересчете статов жестко выбирает один из четырех ванильных ID по имени.

```csharp Mods/HelloBox/Code/HelloPersonality.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPersonality
    {
        public const string RESTLESS = "hello_restless";

        public static void Initialize()
        {
            if (AssetManager.personalities.has(RESTLESS)) return;

            PersonalityAsset restless = new PersonalityAsset { id = RESTLESS, icon = "iconHelloSwift" };
            AssetManager.personalities.add(restless);
            restless.base_stats["personality_aggression"] = 0.4f;
            restless.base_stats["personality_diplomatic"] = 0.05f;
            restless.base_stats["personality_administration"] = 0.05f;
        }

        // updateStats() picks a ruler's personality by name, out of four, every time stats change.
        // A new one is never picked unless you swap it in afterwards.
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Personality
        {
            public static void Postfix(Actor __instance)
            {
                PersonalityAsset current = __instance.s_personality;
                if (current == null) return;                               // not a ruler
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                PersonalityAsset mine = AssetManager.personalities.get(RESTLESS);
                if (mine == null || current == mine) return;

                // take the vanilla one's numbers back out, put yours in
                __instance.stats.mergeStats(current.base_stats, -1f);
                __instance.stats.mergeStats(mine.base_stats);
                __instance.s_personality = mine;
            }
        }
    }
}
```

Постфикс выполняется после каждого обновления характеристик, сохраняя подмену. Он вычитает показатели ванильной личности перед добавлением ваших, чтобы правитель не получил двойные бонусы. `s_personality` и `mergeStats()` объявлены как `internal`: код компилируется благодаря **publicized** сборке NML.

## Мнение, лояльность и счастье

Три небольшие библиотеки формируют политический климат мира, и все три представляют собой списки расчетных функций:

| Библиотека | Вызывается для | Возвращает |
| --- | --- | --- |
| `AssetManager.opinion_library` | Каждой пары королевств | Очки мнения одного о другом |
| `AssetManager.loyalty_library` | Каждого города | Очки лояльности к своему королевству |
| `AssetManager.happiness_library` | Событий с юнитом | Фиксированное изменение счастья |

```csharp Mods/HelloBox/Code/HelloPolitics.cs
namespace HelloBox
{
    public static class HelloPolitics
    {
        public const string WARM = "hello_warm_embers";            // happiness event
        public const string DISTRUST = "hello_opinion_swift_king";  // kingdom to kingdom
        public const string EMBER_AGE = "hello_loyalty_ember_age";  // city to kingdom

        public static void Initialize()
        {
            if (!AssetManager.happiness_library.has(WARM))
            {
                HappinessAsset warm = new HappinessAsset
                {
                    id = WARM,
                    value = 10,
                    path_icon = "ui/Icons/iconHelloDrop",
                    dialogs_amount = 2     // happiness_dialog_hello_warm_embers_0 and _1
                };
                AssetManager.happiness_library.add(warm);

                // post_init() numbers every entry at startup, and the unit's happiness
                // history stores that number, not the id. Yours would show up as entry 0.
                warm.index = AssetManager.happiness_library.list.IndexOf(warm);
            }

            // Opinion and loyalty are summed from the whole list every time: add() is enough.
            if (!AssetManager.opinion_library.has(DISTRUST))
            {
                AssetManager.opinion_library.add(new OpinionAsset
                {
                    id = DISTRUST,
                    translation_key = DISTRUST,
                    calc = (Kingdom pMain, Kingdom pTarget) =>
                    {
                        if (pTarget == null || !pTarget.hasKing()) return 0;
                        return pTarget.king.hasTrait(HelloTraits.SWIFT) ? -10 : 0;
                    }
                });
            }

            if (!AssetManager.loyalty_library.has(EMBER_AGE))
            {
                AssetManager.loyalty_library.add(new LoyaltyAsset
                {
                    id = EMBER_AGE,
                    translation_key = EMBER_AGE,
                    calc = (City pCity) =>
                    {
                        WorldAgeAsset age = AssetManager.era_library.get(HelloAges.EMBERS);
                        if (age == null) return 0;
                        return World.world.era_manager.isCurrentAge(age) ? 5 : 0;
                    }
                });
            }
        }
    }
}
```

Мнение и лояльность суммируются по всему списку при каждом пересчете, поэтому метода `add()` достаточно, и каждая запись появляется отдельной строкой в интерфейсе через `translation_key` (или `translation_key_negative`, если число отрицательное). События счастья вызываются кодом `actor.changeHappiness("hello_warm_embers")`, как на фестивале в **[Заговоры и планы](#/nml/plots)**.

> [!WARNING] События счастья нумеруются при запуске
> История счастья юнита хранит *порядковый номер* записи, а не ее ID, и `HappinessLibrary.post_init()` распределяет эти номера один раз на старте. Ваш ассет останется с индексом 0 и отобразится как первое ванильное событие. Задайте `index` вручную.

## Знамена для других систем

Королевства — не единственные сущности со знаменами: культуры, религии, кланы, языки, подвиды и семьи имеют собственные библиотеки элементов (`AssetManager.culture_banners_library` и др.). У каждой есть один `main` ассет со списками путей к спрайтам, из которых новая культура случайно выбирает индекс.

```csharp Mods/HelloBox/Code/HelloBanners.cs
namespace HelloBox
{
    public static class HelloBanners
    {
        public const string CULTURE_ICON = "cultures/hello_culture_element";

        public static void Initialize()
        {
            BannerAsset culture = AssetManager.culture_banners_library.main;
            if (culture == null || culture.icons.Contains(CULTURE_ICON)) return;

            // A culture stores the index it rolled, not the path. Append, never insert,
            // or every existing culture's banner shifts by one.
            culture.icons.Add(CULTURE_ICON);
        }
    }
}
```

Текстуры подгружаются по одной при отрисовке знамени, поэтому сбрасывать кэш не нужно. Индекс за пределами списка откатывается к 0, благодаря чему сохранения с вашим модом открываются и без него. Сверяйте размеры спрайтов в **[UnityExplorer](#/toolbox/unity-explorer)** перед рисованием.

```json Mods/HelloBox/Locales/en.json
{
  "personality_hello_restless": "Restless",
  "happiness_hello_warm_embers": "Warmed by embers",
  "happiness_dialog_hello_warm_embers_0": "The embers are nice this time of year.",
  "happiness_dialog_hello_warm_embers_1": "Nothing like a little fire from the sky.",
  "hello_opinion_swift_king": "Their king is too fast to trust",
  "hello_loyalty_ember_age": "Loves the Age of Embers"
}
```

> [!TIP] Скорее всего, новый ассет королевства вам не нужен
> Новому виду существ он нужен. Новому *поведению* — нет: большинство модов на фракции лучше делать чертами королевств, культурой или Harmony-патчем дипломатии. Создавайте ассет королевства, только если существу нужно свое место в мире.
