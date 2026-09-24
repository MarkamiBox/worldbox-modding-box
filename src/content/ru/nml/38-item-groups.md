---
title: Группы предметов и вкладки
group: Игровой контент
subgroup: Предметы и снаряжение
icon: :wbgold:
order: 124
---

# Группы предметов и вкладки :wbgold:

Группа предметов — это категория в окне снаряжения: шлемы, мечи, амулеты. Это точно такой же компактный `BaseCategoryAsset`, который отрисовывает вкладки черт (см. **[Группы черт и вкладки](#/nml/trait-groups)**), только расположенный в `AssetManager.item_groups`.

Ключевое отличие состоит в том, что группа предметов содержит **пул**, и забыть про инициализацию этого пула — верный способ вызвать вылет мода :PESgn_Yikes:.

## Ванильные группы

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## Создание собственной категории

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

| Поле | Назначение |
| --- | --- |
| `id` | То, на что указывает `group_id` предмета |
| `name` | Ключ локализации для заголовка вкладки |
| `color` | Hex-строка цвета категории |
| `show_counter` | Отображать ли счетчик предметов на вкладке. По умолчанию `true` |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## Пулы предметов

Игра хранит отдельную корзину предметов для каждой группы и наполняет эти корзины во время инициализации собственных библиотек — то есть **еще до того, как ваш мод начнет выполняться**. У свежесозданной группы корзины попросту нет, и первый же вызов, запрашивающий ее, приведет к ошибке:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

Создайте их вручную один раз для группы перед регистрацией в ней любых предметов:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` — это вообще все предметы группы. `_unlocked` — то, что генератор вправе выдавать в текущий момент. Существовать должны оба списка.

## Добавление предмета в группу

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // какой слот тела занимает
relic.equipment_subtype = "hello_relic";       // предпочтения культур
```

Три независимых параметра, которые очень легко перепутать:

| | |
| --- | --- |
| `group_id` | Под какой **вкладкой** отображается в окне |
| `equipment_type` | Какой **слот** занимает: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | К какому **классу оружия** относится: `sword`, `axe`, `bow`… то, что выбирают культуры |

Новая группа **не** дает вам новый слот экипировки. `EquipmentType` — это неизменяемый enum в коде игры, поэтому ваши реликвии по-прежнему занимают слот амулета, просто получая отдельную полочку в окне.

## Порядок отображения категории

Группы отрисовываются в порядке списка, и метод `add()` ставит вашу категорию в самый конец. Переместите ее рядом с родственной:

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Переименование ванильной категории

Метод `get()` возвращает рабочий экземпляр объекта, что позволяет адаптировать существующую ванильную категорию вместо создания новой:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // ваш ключ локализации
    helmet.color = "#BAD0FF";
}
```

Все ванильные шлемы продолжат указывать на `helmet`, ничего не сломается и старые сохранения спокойно загрузятся. Полная замена группы оставила бы их все без привязки :aPES2_HmmmmApprove:.

> [!TIP] Используйте существующий слот, переименуйте полку
> Подавляющее большинство модов на «новые типы экипировки» — это на самом деле «существующий слот, отдельная полка и новое название». Такая реализация занимает четыре строчки и гарантированно не ломает сохранения. Для принципиально нового слота потребовалось бы менять enum `EquipmentType` игры, что невозможно.
