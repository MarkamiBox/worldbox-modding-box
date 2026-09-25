---
title: Сохранение данных
group: NML Моддинг
subgroup: Продвинутые техники и публикация
icon: :wbfloppysavewink:
order: 44
---

# Сохранение данных :wbfloppysavewink:

Рано или поздно вашему моду потребуется запомнить информацию о конкретном существе: сколько раз оно нанесло удар, получило ли уже награду или у какого святилища молится. Обычный статический словарь, индексированный по существу, забудет всё в тот самый момент, когда игрок сохранит и перезагрузит мир :wbfacepalm:.

В игре уже есть готовый механизм для этого. Каждое существо, город, королевство (kingdom), здание (building), предмет (item) и книга (book) хранят свое состояние в объекте данных, и у каждого из них есть небольшое хранилище **пользовательских данных** (custom data), которое автоматически попадает в файл сохранения.

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

Если пять примитивных типов кажутся вам 1995 годом и вам действительно нужно сохранить на акторе целый класс или список, NML предлагает `DataExtension` в `NeoModLoader.General.Game.extensions`: два метода-расширения, `Set` и `TryGet`, на любом из объектов данных ниже.

Оберните свой класс данных в `BasicCustomData<T>`:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

Внутри метода с `Actor actor` создайте значение перед его сохранением:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Сохранение на существе:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Чтение обратно:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

Под капотом `Set` превращает ваш объект в JSON и сохраняет его через обычный `data.set(key, string)` из таблицы выше. То есть это одна строка на ключ на юнита, и правило "храните минимум" ниже действует вдвойне. Вашему классу нужен конструктор без параметров, а сохраняются его публичные поля и свойства.

Если вы ожидаете, что формат данных будет меняться между обновлениями мода, реализуйте `ICustomData` прямо в своём классе. Это два метода: `Serialize()` возвращает `SerializedCustomData(modId, dataVersion, jObject)`, а `Deserialize(SerializedCustomData)` читает его обратно. Проверка `ModId` и `DataVersion` внутри - ваша забота, за вас это никто не сделает. `BasicCustomData<T>` пишет в оба поля значения-заглушки и бросает исключение, если прочитает что-то другое, так что не смешивайте эти два подхода на одном ключе :PES5_Hmmmm:.

> [!NOTE] Проверено на NML 1.2.0
> Эти имена и сигнатуры взяты из самой сборки NML, а не из её документации, где они не упоминаются. Если новая версия NML что-то переименует, компилятор скажет вам об этом раньше, чем игроки.

## В HelloBox

Черта (trait), которая подсчитывает каждый нанесенный удар и единожды выдает награду по достижении пятидесяти:

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
| Культуры (culture), религии (religion), кланы (clan), языки, семьи, армии, заговоры (plot) | их `data`, у всех одинаковое хранилище |

## Что нужно знать

- **Всегда добавляйте префикс к ключам.** Все моды пишут в одно общее хранилище. `hello_hits` никогда ни с кем не пересечется, а вот обычный `hits` рано или поздно вызовет конфликт.
- **Удаление мода абсолютно безопасно.** Ключи останутся в файле сохранения, их просто никто не будет считывать, и ничего не сломается. В этом огромное преимущество перед патчингом игрового формата сохранений.
- **Пустые хранилища не занимают места.** Игра отбрасывает пустые таблицы перед записью файла, поэтому удаленный ключ действительно исчезает.
- **Храните минимум необходимого.** Данные сохраняются для каждого существа. Число или флаг на существо совершенно незаметны; а вот длинная строка на каждую особь в мире из десяти тысяч существ существенно раздует файл сохранения.

## Весь мир

Часть состояния не принадлежит ни одному существу: сколько метеоритов уже уронила ваша сила на этот мир, случилось ли уже разовое благословение. У мира есть такое же хранилище, в его статистике карты:

```csharp
// map_stats - internal: нормально в исходном моде NML, та же история, что и с actor.data выше
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() ограничивает 1000, если не указать иное
if (world.addFlag("hello_blessed")) { /* только первый раз в этом мире */ }
```

`SaveCustomData` - то же самое хранилище `BaseSystemData`, так что каждый вызов из таблицы в начале страницы работает, как и `Set` / `TryGet` от NML. Оно сохраняется вместе с остальной статистикой карты, так что у каждого слота сохранения своё. Свежесгенерированный мир начинается пустым. Игра создаёт хранилище всякий раз, когда строит или загружает статистику карты, так что проверка на null срабатывать не должна; она ничего не стоит, оставьте её.

> [!TIP] Настройки или данные мира?
> Спросите себя, ожидает ли игрок, что значение изменится при загрузке другого сохранения. "Насколько сильна сила метеорита" - нет: это **[Настройки мода](#/nml/mod-config)**, общие для каждого мира. "Благословлён ли этот мир" - да: это `custom_data`.

## Время, переживающее сохранение

`Time.time` - это секунды с момента запуска игры. Сохраните его в данных юнита, сохранитесь, перезапустите игру, загрузитесь - и каждая записанная вами метка времени окажется из прошлой жизни :wbfacepalm:.

У мира есть собственные часы, и они сохраняются вместе с картой:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, в секундах мира: 5 - это месяц, 60 - год
double now = World.world.getCurWorldTime();

// у хранилища нет double, float вполне достаточно для метки времени
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

Они также останавливаются на паузе и идут быстрее на высоких скоростях, что почти всегда и есть то, что вам нужно. `Date.getYearsSince(at)` и `Date.getMonthsSince(at)` сами сделают деление за вас.

## Выполнение кода после загрузки мира

Всё, что описано выше, читается по требованию, так что обычно вам не нужно знать момент загрузки мира. Когда всё же нужно, скажем, чтобы перестроить собственный кэш, вот методы, к которым моды подключаются через **[Harmony](#/nml/harmony-patches)**:

| Метод | Когда выполняется |
| --- | --- |
| `MapBox.clearWorld` (публичный) | Перед генерацией или загрузкой любого мира. Здесь сбрасывайте свои статические кэши |
| `SaveManager.loadActors` (приватный) | Во время загрузки сохранения, сразу после восстановления юнитов |
| `MapBox.finishMakingWorld` (публичный) | Ближе к концу и генерации, и загрузки мира |
| `SaveManager.saveWorldToDirectory` (публичный, статический) | При сохранении, ручном или автоматическом. Prefix - ваш последний шанс что-то дописать в хранилище |
| `MapBox.addLastStep` (приватный) | Один раз, при старте игры. Не для каждого мира |
| `MapBox.OnApplicationQuit` (приватный) | Игра закрывается |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // закэшированная копия для кода, читающего её каждый кадр; настоящую хранит сохранение
        public static int MeteorsThisWorld;

        // выполняется одинаково и для нового мира, и для загруженного сохранения
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

Приватные методы указываются строкой, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, как объясняет страница про Harmony. Экран загрузки всё ещё виден, когда выполняется `finishMakingWorld`; за ним следует ещё пара шагов.

## Собственные файлы

Многие моды пропускают всё это и пишут JSON-файл через `File.WriteAllText`, обычно в `Application.persistentDataPath`, а это папка `LocalLow\mkarpenko\WorldBox` рядом с `Player.log`. Это нормально для того, что принадлежит **игроку**: список избранных юнитов, которые он экспортировал, статистика по всем сыгранным им партиям.

Это неверно для того, что принадлежит **миру**. Файл не знает, какой слот сохранения загружен. Игрок благословляет королевство в слоте 1, загружает слот 2 - и слот 2 тоже благословлён. Потом он удаляет слот 1, а ваш файл хранит это состояние навсегда :PES2_F:. Если значение должно меняться вместе с сохранением, ему место в сохранении, в одном из хранилищ выше.

## Куда дальше

Для значений, которые игрок выбирает один раз и которые общие для всех миров, см. **[Настройки мода](#/nml/mod-config)**. Для кода, который что-то проверяет каждый кадр или каждый игровой месяц, см. **[Каждый кадр](#/nml/update-loops)** :PES_OkHand:.
