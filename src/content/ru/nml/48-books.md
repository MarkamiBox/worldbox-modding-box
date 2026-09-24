---
title: Книги
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbscroll:
order: 187
---

# Книги :wbscroll:

Юниты пишут книги, города их хранят, а другие юниты их читают и выходят немного другими. Тип книги это новый вид книги в этом цикле: кто её пишет, как она называется, как выглядит обложка и что с вами делает чтение.

Страница **[Черты языка](#/nml/language-traits)** уже делает небольшую, Тлеющий альманах. Эта страница берёт ту же книгу и доводит её до конца: свои названия, настоящая награда и что-то, что происходит при чтении.

## Как рождается книга

Здесь ничего не нужно патчить, достаточно знать цикл:

1. Юнит решает писать. Игра собирает все типы книг, чей `requirement_check` проходит для этого юнита.
2. Каждый кладётся в мешок `writing_rate` раз (или `rate_calc` раз, если вы его задали), **не больше 10**, и один вытягивается.
3. Книге нужно здание со свободным местом для книг в **городе** автора. Нет библиотеки, нет книги.
4. Название берётся из генератора имён в `name_template`, а обложка из папки в `path_icons`.
5. Потом кто-нибудь её читает и получает награды ниже.

Поскольку игра каждый раз заново читает `book_types.list`, типу книги нужен только `add()`. Никаких пулов, никакого post-init. Редкий приятный сюрприз :PESgn_Neat:.

## Код

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

Этот файл **заменяет** `HelloBooks.cs` со страницы черт языка, это тот же класс, только повзрослевший. `HelloBooks.Initialize()` идёт после черты и статуса, которые он использует.

## Что даёт чтение

Числа в `base_stats` это не бафф, который проходит. Каждое чтение раздаёт их один раз:

| Характеристика | Что получает читатель |
| --- | --- |
| `happiness` | Столько счастья, как событие "только что прочитал книгу". Отрицательное тоже работает, для грустных книг |
| `experience` | Столько опыта |
| `mana` | Столько маны |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | Добавляются читателю **навсегда**. При каждом чтении снова |

Последняя строка самая сильная. Книга с `intelligence = 1` делает читающий город умнее с каждым поколением, так что держите значение маленьким. Книга на +10 это путь к королевству гениев к 50-му году :wbgenius:.

Черты языка и культуры могут менять первые две: язык с `beautiful_calligraphy` делает счастье больше, а культура с `reading_lovers` превращает грустные книги в радостные.

## Важные поля

| Поле | Что делает |
| --- | --- |
| `name_template` | Генератор имён для названий. Ванильные: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | Его вес, когда автор выбирает тип. Ваниль использует от 1 до 3 |
| `rate_calc` | Метод, который возвращает вес вместо этого, как ванильное военное руководство с `warfare` автора. Всё равно не больше 10 |
| `requirement_check` | Кто может её написать. `null` = кто угодно |
| `read_action` | Ваш собственный код, один раз за чтение |
| `path_icons` | Папка внутри `books/book_icons/`, читается как список картинок. Для каждой книги выбирается одна |
| `color_text` | Цвет названия в интерфейсе |
| `save_culture` / `save_religion` | Запоминает ли книга культуру и религию автора. Оба включены по умолчанию и важны для книг, которые распространяют веру |

## Генератор названий

Названия используют словарный стиль из **[Генераторы имён](#/nml/name-generators)**. Шаблон это список ключей словаря, и каждый ключ выбирает одно слово из своего списка:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` создаёт ключ с тремя возможными словами.
- `addTemplate("almanac,of,fire")` склеивает по слову из каждого ключа: "Handbook of Ash".
- Слова вроде `$unit$` и `$city$` это заглушки. **Replacer** заполняет их настоящим именем или городом автора. Без подходящего replacer они так и выходят на обложку, буквально `$unit$` :wbfacepalm:.

Клонировать `$base_book_template$` это короткий путь: в нём уже есть маленькие слова (`of`, `and`, `about`, `the`...), все заглушки и собственная обработка названий игры.

## Текст

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

Ключи фиксированные: `book_type_<id>` и `book_type_info_<id>`. Сами названия генерируются, поэтому ключей у них нет.

## Свои обложки

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` это **папка**, с `/` на конце. Хватит одного PNG, он просто должен лежать внутри. Пока тестируете, возьмите ванильную папку, например `fable/`.

Чтобы увидеть всё в деле, создайте мир, дайте городу с вашей чертой вырасти до библиотеки и откройте книги города. Это небыстро, это же книга :PES2_Shrug:.
