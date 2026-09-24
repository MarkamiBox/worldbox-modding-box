---
title: Типы войн
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbmartialwarfare:
order: 179
---

# Типы войн :wbmartialwarfare:

У каждой войны (war) в игре есть тип: обычное завоевание, война из злобы против всех, восстание. Тип решает, как война получает имя, какую иконку показывает, вступают ли союзники и несколько правил о том, как она может закончиться. В ванили их всего пять, так что новый сразу бросается в глаза.

На этой странице мы делаем **Тлеющую вражду**: войну, которая втягивает союзников обеих сторон, получает названия вроде "Cinder Feud of Karvia" и может закончиться мирным заговором (plot), как обычная война.

## Код

```csharp Mods/HelloBox/Code/HelloWars.cs
namespace HelloBox
{
    public static class HelloWars
    {
        public const string FEUD = "hello_ember_feud";
        public const string NAMES = "hello_war_feud";

        public static void Initialize()
        {
            Names();

            if (AssetManager.war_types_library.has(FEUD)) return;

            AssetManager.war_types_library.add(new WarTypeAsset
            {
                id = FEUD,
                name_template = NAMES,                      // the generator for war names, below
                localized_type = "war_type_hello_ember_feud",
                localized_war_name = "war_name_hello_ember_feud",
                path_icon = "wars/war_hello_ember_feud",    // GameResources/wars/war_hello_ember_feud.png
                kingdom_for_name_attacker = true,           // $kingdom$ in the name = the attacker
                alliance_join = true,                       // both sides' allies join
                can_end_with_plot = true                    // a king can plot to end it
            });
        }

        /** War names in the dictionary style: whole words picked from lists. */
        private static void Names()
        {
            if (AssetManager.name_generator.has(NAMES)) return;

            NameGeneratorAsset names = new NameGeneratorAsset
            {
                id = NAMES,
                use_dictionary = true,
                replacer_kingdom = NameGeneratorReplacers.replaceKingdom   // fills $kingdom$
            };
            names.addDictPart("kingdom_name", "$kingdom$");
            names.addDictPart(" ", " ");
            names.addDictPart("of", "of");
            names.addDictPart("ember", "Ember,Cinder,Ash,Smoke,Soot");
            names.addDictPart("feud", "Feud,Quarrel,Grudge,Blaze");
            names.addTemplate("ember, ,feud");
            names.addTemplate("ember, ,feud, ,of, ,kingdom_name");

            AssetManager.name_generator.add(names);
        }

        /** Start one. The game's own wars go through this same method. */
        public static War Start(Kingdom pAttacker, Kingdom pDefender)
        {
            WarTypeAsset feud = AssetManager.war_types_library.get(FEUD);
            if (feud == null || pAttacker == null || pDefender == null) return null;

            // internal: compiles inside NML. It checks there is no war between them already,
            // logs it in the world history, and pulls in the allies when alliance_join is on.
            return World.world.diplomacy.startWar(pAttacker, pDefender, feud);
        }
    }
}
```

`HelloWars.Initialize()` идёт в `OnModLoad`. Но сама по себе ваша война не начнётся: ванильные войны идут из кода дипломатии игры, а он знает только свои пять типов. Вызывайте `HelloWars.Start` там, где это уместно: из **[божественной силы](#/nml/god-powers)**, **[заговора](#/nml/plots)**, который может попробовать король, или **[решения](#/nml/custom-ai)**.

## Поля

| Поле | Что делает |
| --- | --- |
| `name_template` | Генератор имён для названия этой войны. Ванильные: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | Ключ текста, который интерфейс показывает как тип войны, в подсказке и окне войны |
| `localized_type` | Второй ключ текста, который игра хранит для типа. Я не нашёл, где он показывается, так что заполняйте оба |
| `path_icon` | Иконка войны, загружается ровно так, как написано |
| `kingdom_for_name_attacker` | Чьё имя подставляется в `$kingdom$`: нападающего (`true`) или защищающегося (`false`) |
| `alliance_join` | Союзы обеих сторон вступают в войну, когда она начинается |
| `total_war` | Нападающий воюет со **всеми** королевствами (kingdom), как в войнах из злобы. Начинайте без защищающегося |
| `rebellion` | Отмечает её как восстание, что меняет, кто к кому может присоединиться |
| `can_end_with_plot` | Король может закончить её мирным заговором, когда она достаточно старая |
| `forced_war` | Его читает только одна вспомогательная функция, которую сейчас никто не вызывает. Оставьте выключенным |

> [!WARNING] У тотальных войн нет защищающегося
> При `total_war` защищающийся равен `null`, так что шаблон имени с `$kingdom$` и `kingdom_for_name_attacker = false` просит имя никого. Называйте тотальные войны по нападающему :PES2_Shrug:.

## Текст

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

Сами названия ("Cinder Grudge of Karvia") генерируются, поэтому ключей у них нет. Слова берутся из словаря в `Names()`. Чтобы их перевести, понадобился бы генератор на каждый язык, и ни одна ванильная война так не делает.

## Своя иконка

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

Пока тестируете, возьмите ванильную: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion` или `wars/war_whisper`.

> [!NOTE] Сохранения помнят тип по id
> Война хранит id своего типа в сохранении. Загрузите такой мир без вашего мода, и война попросит тип, которого больше нет, ничего не получит, и я бы не ставил на то, что это хорошо кончится. Игрок, удаливший мод посреди войны, это риск, который вы полностью не исправите, но строчка об этом в описании мода не помешает.
