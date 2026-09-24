---
title: Сохранение данных
group: NML Моддинг
subgroup: Продвинутые техники и публикация
icon: :wbfloppysavewink:
order: 44
---

# Сохранение данных :wbfloppysavewink:

Рано или поздно вашему моду потребуется запомнить информацию о конкретном существе: сколько раз оно нанесло удар, получило ли уже награду или у какого святилища молится. Обычный статический словарь, индексированный по существу, забудет всё в тот самый момент, когда игрок сохранит и перезагрузит мир :wbfacepalm:.

В игре уже есть готовый механизм для этого. Каждое существо, город, королевство, здание, предмет и книга хранят свое состояние в объекте данных, и у каждого из них есть небольшое хранилище **пользовательских данных** (custom data), которое автоматически попадает в файл сохранения.

## Хранилище данных

| Вызов | Что делает |
| --- | --- |
| `data.set(key, value)` | Сохраняет `int`, `long`, `float`, `string` или `bool` по ключу |
| `data.get(key, out value, default)` | Считывает значение. Если ключ отсутствует, возвращает значение по умолчанию |
| `data.change(key, amount, min, max)` | Прибавляет к `int` и ограничивает диапазон (clamp) за один вызов |
| `data.addFlag(key)` | Устанавливает флаг. Возвращает `false`, если он уже был установлен |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Проверяет или сбрасывает флаг |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Удаляет значение |

Для каждого типа данных выделена отдельная внутренняя таблица, поэтому `int` и `string` под одним и тем же ключом не конфликтуют. Тем не менее, ради собственного спокойствия лучше использовать уникальные имена ключей. Вы из будущего не вспомните, какой был какой.




## Сохранение сложных объектов в NML

Если пять примитивных типов кажутся вам 1995 годом и вам действительно нужно сохранить на акторе целый класс или список, NML предлагает `DataExtension` в `NeoModLoader.General.Game.extensions`.

Оберните свой класс данных в `BasicCustomData<T>`:

```csharp
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

// Сохранение:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Чтение:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress quest = saved.Data;
}
```

Под капотом NML сериализует ваш объект в JSON и кладёт его в ванильную таблицу `custom_data_string` под вашим ключом. Если вы ожидаете, что формат данных будет меняться между обновлениями мода, реализуйте `ICustomData` прямо в своём классе вместо `BasicCustomData<T>` - это даёт явные проверки `ModId` и `DataVersion`, чтобы устаревшее сохранение молча не отравило ваше новое состояние :PES5_Hmmmm:.

## В HelloBox

Черта, которая подсчитывает каждый нанесенный удар и единожды выдает награду по достижении пятидесяти:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Сохраните мир и загрузите его снова: счетчик останется на месте, поскольку он записан прямо в данных сохранения существа. Флаг гарантирует, что награда выдается ровно один раз, а не при каждом последующем ударе. Щедро, но всё равно баг.

Тексты локализации, как и для любой другой черты:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` имеет модификатор `internal`
> Поле данных существа в сборке игры помечено как `internal`. NML компилирует ваш мод с использованием **публицизированной (publicized)** сборки, поэтому в обычных модах с исходным кодом всё работает само собой. Проблемы возникнут только при сборке собственной `.dll` против оригинальной сборки: см. **[Устранение неполадок](#/troubleshooting)**. Поля `data` у городов и королевств изначально являются публичными.

## Где хранятся данные

| Объект | Его данные |
| --- | --- |
| Существо | `actor.data` |
| Город | `city.data` |
| Королевство | `kingdom.data` |
| Здание | `building.data` |
| Культуры, религии, кланы, языки, семьи, армии, заговоры | их `data`, у всех одинаковое хранилище |

## Что нужно знать

- **Всегда добавляйте префикс к ключам.** Все моды пишут в одно общее хранилище. `hello_hits` никогда ни с кем не пересечется, а вот обычный `hits` рано или поздно вызовет конфликт.
- **Удаление мода абсолютно безопасно.** Ключи останутся в файле сохранения, их просто никто не будет считывать, и ничего не сломается. В этом огромное преимущество перед патчингом игрового формата сохранений.
- **Пустые хранилища не занимают места.** Игра отбрасывает пустые таблицы перед записью файла, поэтому удаленный ключ действительно исчезает.
- **Храните минимум необходимого.** Данные сохраняются для каждого существа. Число или флаг на существо совершенно незаметны; а вот длинная строка на каждую особь в мире из десяти тысяч существ существенно раздует файл сохранения.

Для всего, что не привязано к конкретному объекту (например, глобальные настройки мода на весь мир), используйте окно настроек мода: см. **[Настройки мода](#/nml/mod-config)** :PES_OkHand:.
