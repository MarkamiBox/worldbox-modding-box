---
title: Генераторы имён
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbscroll:
order: 186
---

# Генераторы имён :wbscroll:

Каждое имя в WorldBox выходит из генератора: юниты, города, королевства, кланы, войны, книги. У ваших существ может быть свой, чтобы деревня тлеющих духов была полна Ашр и Синдоксов, а не заимствовала человеческие имена.

## Откуда берётся имя

Три шага, от существа до букв:

| Шаг | Ассет | Что в нём |
| --- | --- | --- |
| Существо | `ActorAsset.name_template_sets` | Список id **наборов имён**. Для каждой культуры выбирается один |
| Набор | `NameSetAsset` (`name_sets`) | Какой генератор использовать для каждого вида вещей: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| Генератор | `NameGeneratorAsset` (`name_generator`) | Как на самом деле строится имя |

Так что, чтобы переименовать целый вид, вы делаете генератор, набор, который его использует, и указываете существу этот набор.

## Три способа построить имя

Генератор работает в одном из трёх стилей, и игра выбирает по тому, какие поля вы заполнили:

- **Группы частей.** Список групп, из каждой берётся случайный кусок, и всё склеивается. Самый простой, и именно он на этой странице.
- **Словарь.** Целые слова из именованных списков, собранные во фразу. Так войны и книги получают названия вроде "Bloody Hatred". См. **[Типы войн](#/nml/war-types)** и **[Книги](#/nml/books)**.
- **Ономастика.** Компактный текстовый формат, который используют почти все ванильные цивилизации, и который ещё позволяет именам меняться со временем внутри культуры. Мощно, но я бы с этого не начинал: скопируйте готовый из `NameGeneratorLibrary`, если нужно, и поменяйте слоги.

## Код

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

Затем у вашего существа со страницы **[Свои существа](#/nml/custom-actors)**:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` идёт в `OnModLoad` **до** существ, потому что существо ссылается на набор.

> [!WARNING] Заполните все слоты набора
> Культура просит у своего набора генератор для каждого вида вещей. Пустой слот `city` значит, что игра ищет генератор с именем `""`, получает `null`, и первый город, который основали ваши существа, роняет всю игру. Если нет ничего лучше, используйте один генератор везде :PESgn_Stop:.

## Слова шаблонов

Шаблон это список слов через запятую. Для генераторов с группами частей полезны такие:

| Слово | Что добавляет |
| --- | --- |
| `part_group` / `Part_group` | По куску из каждой группы `addPartGroup`. Большая P делает первую букву заглавной |
| `part_group2`, `part_group3` | То же для `addPartGroup2` и `addPartGroup3`, для второго или третьего слова |
| `space` | Пробел, так что `Part_group,space,Part_group2` даёт имя и фамилию |
| `vowel` / `consonant` | Одну букву из ваших `vowels` / `consonants` |
| `number` | Цифру от 0 до 9. Для роботов, наверное |

Вызовите `addTemplate` несколько раз, и игра будет выбирать случайный шаблон для каждого имени.

## Проверка без ожидания младенцев

`NameGenerator.getName` публичный, так что можно вывести десять имён в лог при загрузке:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

Если половина выглядит так, будто по клавиатуре прошёлся кот, ваши группы слишком длинные. Короткие куски, больше групп. Имена из чёрного списка игры выбрасываются и генерируются заново, так что вы их никогда не увидите :PES5_Noted:.

Для названий из целых слов (войны, книги, девизы) нужен словарный стиль, и на следующих двух страницах мы строим по одному такому.
