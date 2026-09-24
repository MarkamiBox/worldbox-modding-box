---
title: Группы черт и вкладки
group: Игровой контент
subgroup: Черты и генетика
icon: :wbfamilies:
order: 102
---

# Группы черт и вкладки :wbfamilies:

Каждая черта (trait) принадлежит к определенной **группе**, и именно группа рисует вкладку в книге (book) черт. Если вы добавите шесть черт и свалите их в `miscellaneous`, они растворятся в списке, который никто никогда не листает :PES4_Invisible:.

Собственная вкладка стоит ровно четыре строки кода.

## Что представляет собой группа

Группа — это `BaseCategoryAsset`, самый компактный ассет во всей игре:

| Поле | Что делает |
| --- | --- |
| `id` | То, на что указывает `group_id` черты |
| `name` | **Ключ локализации** для заголовка вкладки. Не сам текст |
| `color` | Hex-строка цвета. Окрашивает вкладку и черты под ней |
| `show_counter` | Отображает ли вкладка счётчик "3 / 12". По умолчанию `true` |

## Ваша собственная вкладка

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // ключ локализации, а не текст
                color = "#7FE7C4"
            });
        }
    }
}
```

Укажите на неё в ваших чертах:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

И задайте имя для вкладки:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] Группы перед содержащимися в них чертами
> Черте, чей `group_id` ссылается на ещё не существующую группу, попросту негде отрисоваться. В методе `OnModLoad` вызов `HelloGroups.Initialize()` обязательно должен стоять перед `HelloTraits.Initialize()`.

## Ванильные группы черт существ

Используйте одну из них, если вам не нужна отдельная вкладка:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## Где появится ваша вкладка

Группы отрисовываются в порядке коллекции `list`, а метод `add()` помещает вашу в самый конец. Чтобы разместить её рядом с подходящей группой, просто переместите её:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

В любой библиотеке (library) `list` является обычным `List<T>`, поэтому этот трюк работает абсолютно везде. См. **[Библиотеки ассетов](#/nml/asset-libraries)**.

## Переименование или перекрашивание ванильной группы

Вам не нужно создавать группу заново, чтобы изменить существующую. Метод `get()` возвращает вам живой объект:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // ваш ключ локализации
    fun.color = "#FFB35E";
}
```

Прямое редактирование ванильной группы сохраняет работоспособность каждой ванильной черты, привязанной к ней, и обеспечивает совместимость со старыми сохранениями. Полная замена сломает и то, и другое :PES_NoSign:.

## Остальные шесть библиотек групп

Черты существ — лишь одна из семи систем черт, и у каждой есть собственная библиотека групп со своим классом. Код на этой странице идентичен для всех систем, меняются только два имени. Выучите один раз, скопируйте шесть раз:

| Система черт | Библиотека групп | Класс группы | Страница |
| --- | --- | --- | --- |
| Существо | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | эта страница |
| Культура | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[Черты культуры](#/nml/culture-traits)** |
| Религия | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[Черты религии](#/nml/religion-traits)** |
| Подвид (subspecies) | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[Черты подвида](#/nml/subspecies-traits)** |
| Клан | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[Черты клана](#/nml/clan-traits)** |
| Язык | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[Черты языка](#/nml/language-traits)** |
| Королевство | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[Черты королевства](#/nml/kingdom-traits)** |

Экипировка построена на той же концепции под другим именем. См. **[Группы предметов и вкладки](#/nml/item-groups)**.

> [!TIP] Одна вкладка, а не шесть
> При создании крупного мода возникает соблазн плодить группы на каждую механику. Сдержитесь. Книга черт и так перегружена: игрок с радостью найдет одну вкладку с названием вашего мода, но проигнорирует шесть вкладок, названных в честь ваших внутренних классов.
