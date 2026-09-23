---
title: Черты языка
group: Игровой контент
subgroup: Черты и генетика
icon: :wbconfused:
order: 112
---

# Черты языка :wbconfused:

**Язык** принадлежит городам и королевствам, претерпевает изменения по мере распространения и выступает носителем, на котором пишутся **книги**. Черта языка — это свойство самого устного и письменного слова.

Это самая компактная из всех семи систем черт, обладающая самым узкоспециализированным хуком: кодом, срабатывающим в момент, когда кто-то **читает книгу** на данном языке.

| | |
| --- | --- |
| Библиотека | `AssetManager.language_traits` |
| Класс | `LanguageTrait` |
| Группы | `AssetManager.language_trait_groups`, класс `LanguageTraitGroupAsset` |
| Владелец в рантайме | `Language`, в `World.world.languages` |
| Префикс локализации | `language_trait_` |
| Папка иконок по умолчанию | `ui/Icons/language_traits/` |

## Регистрация черты

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // "ценность" черты. См. ниже
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

Характеристики `base_stats` языка **действительно** передаются юнитам: `Actor.updateStats()` внедряет `language.base_stats` в каждого жителя, говорящего на этом языке. Порядок объединения описан в **[Справочнике характеристик](#/nml/stats)**.

## Хук чтения книг

`read_book_trait_action` — это поле, присущее исключительно чертам языка. Оно срабатывает, когда юнит заканчивает чтение книги, написанной на этом языке:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // ванильная игра использует `value` как вероятность для этого хука

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

Именно так устроены проклятые и благословенные тексты в ванильной игре: `words_of_madness` проверяет вероятность по `value` и накладывает черту `madness`, `cursed_font` вешает статус-эффект, `font_of_gods` дает более мощное благословение.

Два приема, которые стоит перенять из ванильного кода:

- **Считывайте шанс из `pTrait.value`, а не из жестко зашитой константы.** Черта передается в делегат именно для того, чтобы один и тот же метод обслуживал разные черты с разной силой воздействия.
- **Сразу выходите для юнитов с иммунитетом.** Все ванильные реализации в первую очередь проверяют наличие черт `evil` или `blessed`.

## Собственный тип книги

Игра определяет форматы книг в `AssetManager.book_types`:

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset book = new BookTypeAsset
            {
                id = ALMANAC,
                name = "book_type_" + ALMANAC,
                description = "book_type_info_" + ALMANAC,
                rarity = 5
            };
            AssetManager.book_types.add(book);
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## Поле `value`

Поле `value` есть у всех классов черт, но именно в языке оно задействовано активнее всего. В ванильной игре оно применяется в двух смыслах:

| Применение | Пример |
| --- | --- |
| Качество и красота языка | `melodic` и `stylish_writing` используют `value = 3f` |
| Шанс срабатывания хука чтения книг | `words_of_madness` использует `value = 0.1f` |

Движок не навязывает конкретный смысл; выберите назначение для каждой черты и придерживайтесь единообразия.

## Противоположности

Черты языка объединяются во взаимоисключающие пары чаще любых других, ведь у языка либо есть строгая грамматика, либо ее нет:

```csharp
trait.addOpposite("scribble");
```

Объявляйте противоположность с обеих сторон, как ванильная игра делает для `scribble` и `nicely_structured_grammar`.

## Ванильные группы

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

Собственная вкладка: см. **[Группы черт и вкладки](#/nml/trait-groups)**, с `AssetManager.language_trait_groups` и `LanguageTraitGroupAsset`.

## Тексты локализации

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## Раздача черты

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

Объект `Language` также открывает доступ к `cities`, `kingdoms` и `books`, что полезно, когда ваш код хочет оценить границы распространения языка.

> [!TIP] Книги — недооцененный способ распространения
> Книга на вашем языке — это неторопливый, гармонично вписанный в мир способ наделить жителя чертой или статусом. Она путешествует по библиотекам, охватывает поколения, и игрок наблюдает за этим процессом. Практически никто не делает моды на эту механику, поэтому заняться ей вдвойне интересно :PES4_Classy:.
