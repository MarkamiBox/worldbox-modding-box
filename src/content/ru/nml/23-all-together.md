---
title: Готовый мод
group: Игровой контент
subgroup: Финальные штрихи
icon: :wbpeak:
order: 222
---

# Готовый мод :wbpeak:

Если вы следовали страницам по порядку, то начиная со страницы **[Ваш первый мод](#/nml/your-first-mod)** вы шаг за шагом добавляли по файлу в один и тот же проект. На этой странице происходит финальная сборка: мы посмотрим, как выглядит HelloBox, когда все детали на своих местах, и как эти части вызывают друг друга.

## Что вы собрали

Десятка два файлов, и вот во что они складываются в игре. Каждая строка — одна страница этого гайда  :wbpeak:.

| Что | Где это видно |
| --- | --- |
| Черта (trait) актёра и собственная вкладка под неё | Инспектор юнита, список черт |
| Черты культуры (culture), религии (religion), подвида (subspecies), клана (clan), языка и королевства (kingdom) | Их собственные окна, по одному на систему |
| Оружие, его зачарование (modifier) и категория для обоих | Руки юнита, вкладки снаряжения |
| Эффект статуса (status) | Над головой существа, со своей иконкой |
| Дропы, облако (cloud), которое ими поливает, и снаряд (projectile) | Карта, воздух, разгар драки |
| Тайл | Местность, под всем остальным |
| Рецепт еды | Склады города |
| Закон мира (world law) | Окно законов мира |
| Сила бога, её вкладка и кнопка | Панель сил внизу |
| Окно | Там, где вы решите |
| Здание (building) | Город, как только его кто-нибудь построит |
| Королевство и существо, которое к нему относится | Карта, спавн и драки |
| Катастрофа (disaster) | Меню катастроф |
| Собственная работа (job) для ИИ | Существо, которое идёт куда-то осмысленно |
| Решение (decision), профессия в городе и инструмент в руке | Огоньки с факелами, по одному хранителю на город |
| Боевое действие (behaviour) | Быстрые юниты, бросающие искры перед сближением в бою |
| Ген, личность, тип книги (book), элемент знамени | Геном, правители, библиотеки (library), флаги |
| Мнение, лояльность и событие счастья | Сводка дипломатии и городов |
| Заговор (plot) | Список заговоров, когда лидер планирует фестиваль |
| Эпоха (world age) мира и поведение мира | Колесо эпох и таймер мира |
| Достижение (achievement) | Окно достижений при 10 огоньках |
| Кисть, тултип и горячая клавиша | Ротация кистей, тултип при наведении, F6 |
| Патч Harmony | Нигде, и в этом смысл: он тихо меняет правило |

## Забирайте с собой

<a class="dl" href="hellobox.zip" download>
  <span class="dl-icon">📦</span>
  <span class="dl-text">
    <span class="dl-title">Скачать HelloBox</span>
    <span class="dl-sub">Готовый мод, все файлы с этой страницы. Распакуйте в <code>worldbox\Mods\</code> и запустите игру.</span>
  </span>
</a>

Он собирается из блоков кода этого гайда, то есть это тот же код, который вы копировали, а не отдельная копия, которая со временем разойдётся. Читайте, ломайте, удаляйте те две трети, которые вам не нужны.

Продвинутые страницы также показывают опциональные рецепты: **[ручные патчи](#/nml/harmony-patches)**, **[таймеры и корутины](#/nml/update-loops)**, **[генерация карты](#/nml/map-generation)**, **[настройки игры](#/nml/game-options)** и **[работа с другими модами](#/nml/other-mods)**. Это то, что стоит добавить, когда понадобится. В этой сборке для скачивания они не включены.

> [!WARNING] Это демо, а не продукт
> Публиковать HelloBox как есть — никому не помощь: это двадцать функций, каждая из которых нарочно делает одну мелочь плохо. Поменяйте id, поменяйте имя, оставьте то, что вам действительно было нужно  :wbbru:.

## Структура папок

```text Mods/HelloBox/
HelloBox/
├── mod.json                         the ID card
├── icon.png                         what players see in the mod list
├── default_config.json              the settings window
├── Locales/
│   └── en.json                      every piece of text
├── GameResources/
│   ├── iconHelloCake.png            the food inventory icon
│   ├── actors/species/other/
│   │   ├── hello_wisp/              main/ and child/: walk_0..3, swim_0..3, sprites.json
│   │   └── hello_golem/             the same shape
│   ├── buildings/hello_shrine/      main_0, construction_0, ruin_0, mini_0, sprites.json
│   ├── cultures/
│   │   └── hello_culture_element.png    a culture banner part
│   ├── drops/hello_ember/           hello_ember_0..1, the falling drop
│   ├── effects/
│   │   ├── clouds/hello_cloud.png   the cloud sprite
│   │   ├── fx_hello_status/         fx_hello_status_0..2, the status overhead
│   │   └── projectiles/hello_bolt/  hello_bolt_0..1, the flying ember
│   ├── items/
│   │   ├── resources/hello_cake/    hello_cake_0..1, cake in hand
│   │   ├── tools/tool_hello_torch/  tool_hello_torch_0, the torch in hand
│   │   └── weapons/
│   │       ├── sprites.json         pivot for held weapons
│   │       ├── w_hello_sword.png    weapon sprite
│   │       └── w_hello_sword/       the in-hand sprite list, with its own sprites.json
│   ├── tiles/hello_moss/            moss_1, a tile variation
│   └── ui/Icons/
│       ├── sprites.json             default icon slicing
│       ├── iconHello*.png           traits, powers, tabs, the age, the gene, the grudge...
│       ├── items/icon_hello_sword.png       weapon inventory icon
│       └── worldrules/icon_hello_law.png    world law switch
└── Code/
    ├── Main.cs                      the door NML knocks on
    ├── HelloSettings.cs             what the settings window writes to
    ├── HelloGroups.cs               your own trait tab and item category
    ├── HelloTraits.cs               an actor trait
    ├── HelloMemory.cs               a trait that remembers, in the save file
    ├── HelloCulture.cs              a culture trait
    ├── HelloReligion.cs             a religion trait
    ├── HelloSubspecies.cs           a subspecies trait
    ├── HelloClan.cs                 a clan trait
    ├── HelloLanguage.cs             a language trait
    ├── HelloGenes.cs                a gene
    ├── HelloKingdomTraits.cs        a kingdom trait
    ├── HelloItems.cs                a weapon cities actually forge
    ├── HelloModifiers.cs            an enchantment
    ├── HelloStatus.cs               a status effect
    ├── HelloDrops.cs                falling embers
    ├── HelloClouds.cs               an ember cloud
    ├── HelloTiles.cs                a top tile
    ├── HelloResources.cs            a food recipe
    ├── HelloProjectiles.cs          a flying ember
    ├── HelloLaws.cs                 a world law switch
    ├── HelloBuildings.cs            a building
    ├── HelloKingdoms.cs             their faction
    ├── HelloActors.cs               your creatures
    ├── HelloAI.cs                   its own behaviour
    ├── HelloDecisions.cs            the wisps choosing it on their own
    ├── HelloCityJobs.cs             a job cities hand out
    ├── HelloTools.cs                a torch in hand
    ├── HelloCombat.cs               a combat move
    ├── HelloPolitics.cs             opinion, loyalty, a happiness event
    ├── HelloPlots.cs                a festival leaders can plot
    ├── HelloAges.cs                 a world age and a world behaviour
    ├── HelloAchievements.cs         an achievement
    ├── HelloPersonality.cs          a ruler personality
    ├── HelloBooks.cs                a kind of book
    ├── HelloBanners.cs              a culture banner part
    ├── HelloBrushes.cs              a brush shape
    ├── HelloTooltips.cs             the panel's tooltip
    ├── HelloHotkeys.cs              F6 opens the panel
    ├── HelloDisasters.cs            an ember storm, with its log line
    ├── HelloPowers.cs               a god power + its tab and buttons
    ├── HelloWindow.cs               a panel
    └── HelloPatches.cs              your Harmony patches
```

## Main.cs целиком

```csharp Mods/HelloBox/Code/Main.cs
using System;
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>, IReloadable
    {
        // Development only: turns on NML's reload button. Never ship it on. See Logs & debugging.
        private static bool DevReload = false;

        protected override void OnModLoad()
        {
            if (DevReload) Config.isEditor = true;

            // Order matters: things that are referenced must exist first.
            Stage("groups", HelloGroups.Initialize);        // tabs before the things that sit in them
            Stage("traits", HelloTraits.Initialize);
            Stage("memory", HelloMemory.Initialize);
            Stage("culture", HelloCulture.Initialize);
            Stage("religion", HelloReligion.Initialize);
            Stage("subspecies", HelloSubspecies.Initialize);
            Stage("clan", HelloClan.Initialize);
            Stage("language", HelloLanguage.Initialize);
            Stage("genes", HelloGenes.Initialize);
            Stage("status", HelloStatus.Initialize);
            Stage("drops", HelloDrops.Initialize);          // clouds rain drops, so drops go first
            Stage("clouds", HelloClouds.Initialize);
            Stage("tiles", HelloTiles.Initialize);
            Stage("biomes", HelloBiomes.Initialize);       // after the tiles, before anything spawns in it
            Stage("resources", HelloResources.Initialize);  // items and buildings cost resources
            Stage("projectiles", HelloProjectiles.Initialize);
            Stage("modifiers", HelloModifiers.Initialize);
            Stage("items", HelloItems.Initialize);          // items can roll the modifiers above
            Stage("buildings", HelloBuildings.Initialize);
            Stage("kingdoms", HelloKingdoms.Initialize);    // actors point at kingdoms
            Stage("kingdom_traits", HelloKingdomTraits.Initialize);
            Stage("names", HelloNames.Initialize);         // before the actors, so they can use its name set
            Stage("actors", HelloActors.Initialize);
            Stage("laws", HelloLaws.Initialize);
            Stage("ai", HelloAI.Initialize);
            Stage("decisions", HelloDecisions.Initialize);  // after the actors and the task they use
            Stage("city_jobs", HelloCityJobs.Initialize);
            Stage("tools", HelloTools.Initialize);
            Stage("combat", HelloCombat.Initialize);        // after the trait that carries it
            Stage("politics", HelloPolitics.Initialize);
            Stage("wars", HelloWars.Initialize);
            Stage("plots", HelloPlots.Initialize);
            Stage("ages", HelloAges.Initialize);            // after the cloud, the law and the status it uses
            Stage("achievements", HelloAchievements.Initialize);
            Stage("personality", HelloPersonality.Initialize);
            Stage("books", HelloBooks.Initialize);
            Stage("banners", HelloBanners.Initialize);
            Stage("brushes", HelloBrushes.Initialize);
            Stage("tooltips", HelloTooltips.Initialize);
            Stage("hotkeys", HelloHotkeys.Initialize);
            Stage("disasters", HelloDisasters.Initialize);
            Stage("powers", HelloPowers.Initialize);        // last: the buttons need the powers

            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
            LogInfo("HelloBox ready");
        }

        private static void Stage(string pName, Action pAction)
        {
            try { pAction(); }
            catch (Exception e) { LogError($"stage '{pName}' failed: {e}"); }
        }

        // NML calls this after it recompiled your code, when you press the reload button
        public void Reload()
        {
            LogInfo("HelloBox reloaded");
        }

        public void Update()
        {
            if (!Config.game_loaded) return;
            if (World.world == null || World.world.units == null || MapBox.instance == null) return;

            // the power tab can only be laid out once its own Start() has run
            HelloPowers.LayoutWhenReady();
        }
    }
}
```

### Почему именно такой порядок

Три файла в этой папке никогда не появляются в списке выше, и это абсолютно правильно:

| Файл | Кто его вызывает |
| --- | --- |
| `HelloPatches.cs` | `PatchAll()` находит его автоматически по атрибутам. Патчи никогда не вызываются вручную |
| `HelloSettings.cs` | Загрузчик конфигурации сам пишет в него, когда игрок двигает ползунок |
| `HelloWindow.cs` | Соответствующая кнопка строит окно при первом нажатии |

Текстам тоже не нужна отдельная стадия: NML загружает `Locales/en.json` еще до вызова `OnModLoad`, поэтому все ключи уже на месте. Всё остальное связано строгими цепочками зависимостей:

1. **Группы раньше содержимого**, потому что ассет с несуществующим `group_id` не найдет вкладки, в которой должен отрисоваться.
2. **Капли раньше облаков**, потому что облако указывает имя капли, которую оно проливает.
3. **Ресурсы (resource) раньше предметов (item) и зданий**, потому что и те и другие требуют ресурсов на постройку и крафт.
4. **Модификаторы раньше предметов**, потому что оружие перечисляет доступные для выпадения зачарования.
5. **Королевства раньше актеров**, потому что существо указывает свои дикие и цивилизованные королевства.
6. **Силы раньше кнопок**: `PowerButtonCreator` ищет силу по id, и кнопка, привязанная к пустоте, окажется нерабочей.
7. **Всё, что использует ИИ, раньше самого ИИ**, поскольку задачи (task) ссылаются на черты и статусы по id.
8. **Существа и ИИ перед решениями, профессиями и инструментами**, поскольку они ссылаются на уже существующее существо и задачу.
9. **Эпоха мира после облака, закона и статуса**, используемых ее эффектами. Заговоры, политика и достижения обращаются к данным во время игры, поэтому могут находиться в любом месте после своих зависимостей.

Если что-то не появляется в игре, вопрос "не зарегистрировал ли я это позже того, чему оно требовалось?" - это второй вопрос после "а есть ли ошибка в логе?" :PES2_HmmmmNoted:.

## Чек-лист перед тем, как считать мод готовым

| | |
| --- | --- |
| Лог | Запустите игру, найдите строку `HelloBox`. Там должно быть "ready" и **никаких** `Exception` |
| Тексты | Нигде в интерфейсе не должны торчать сырые ключи вроде `trait_hello_x` |
| Иконки | Никаких невидимых пустот на панели сил |
| Настройки | Удалите `mods_config/<GUID>.config`, перезапустите игру и убедитесь, что дефолты адекватны |
| Чистый мир | Запустите новую карту на максимальной скорости на пять минут, затем снова проверьте лог |
| Другие моды | Включите несколько других модов. Если вы что-то патчите, кто-то другой наверняка патчит это же |

После этого переходите к разделу **[Публикация мода](#/nml/publishing)** и пусть игроки проверят его на прочность :aPES3_VictoryPog:.

## Куда двигаться дальше

- Удалите из HelloBox всё, что вам не нужно. Это была демо-версия, а не настоящий мод.
- Выберите **одно** направление и сделайте его по-настоящему качественным. Мод, идеально делающий одну вещь, в сто раз лучше мода, плохо делающего двенадцать.
- Читайте исходный код игры по выбранной теме (**[Чтение кода игры](#/toolbox/reading-the-game-code)**). Всё, чего вы еще не знаете, уже написано прямо там :PESgn_ReadRules:.
