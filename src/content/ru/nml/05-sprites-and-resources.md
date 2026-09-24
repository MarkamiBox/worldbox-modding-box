---
title: Спрайты и ресурсы
group: NML Моддинг
subgroup: Базовый рабочий процесс
icon: :wbfanartist:
order: 28
---

# Спрайты и ресурсы :wbfanartist:

У вашей черты есть название, характеристики и прекрасное описание. Но вместо иконки красуется огромный уродливый знак вопроса. Пора это исправить.

## Использование уже имеющихся в игре иконок

Самый простой вариант, который вы будете использовать чаще всего: указать путь к стандартному спрайту игры.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` - это аналог `Resources.Load` с кэшированием, а `getSpriteList` - `Resources.LoadAll` с кэшированием. В путях не указывается расширение файла: всегда пишется `ui/Icons/iconFly`, и никогда `ui/Icons/iconFly.png`.

Большинство полей в ассетах принимают **путь в виде строки (string)**, а не готовый загруженный объект Sprite:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] Как узнать, какие пути вообще существуют?
> Используйте инструмент **[Поиск иконок](#/tools/icons)** на этом сайте. Там собраны все пути к спрайтам игры и работает поиск по обычным словам: запрос вроде "death king" или "lightning bolt" сразу выдаст нужный путь. Также можно открыть **[UnityExplorer](#/toolbox/unity-explorer)** прямо в игре и посмотреть `path_icon` у похожего ассета :aPES_Magnifying:.

## Добавление собственных текстур

Создайте папку **`GameResources/`** в корне вашего мода. NML работает с ней точно так же, как Unity с внутренней папкой `Resources`. Поэтому файл, расположенный по адресу:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

будет загружен по пути `ui/Icons/iconHelloSwift` и сработает везде, где принимается стандартный путь. Форматы `.png`, `.jpg` и `.jpeg` подхватываются автоматически.

### sprites.json

Рядом с картинками файл `sprites.json` сообщает NML правила нарезки спрайтов. Без него применятся настройки Unity по умолчанию, которые для пиксель-арта почти всегда не подходят. (Требуется не всегда :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Поле | Назначение |
| --- | --- |
| `PixelsPerUnit` | Оставляйте значение `1`, если точно не знаете, зачем вам другое |
| `PivotX` / `PivotY` | Точка привязки (Pivot). `0.5 / 0.0` - это центр снизу, что обычно и требуется юнитам и зданиям |
| `BorderL/R/T/B` | Границы 9-slice для растягивающихся рамок окон и кнопок |
| `Path` | Конкретный файл, к которому применяется это правило |

Секция `Default` применяется ко всем файлам в этой папке, не упомянутым в `Specific`.

## Куда складывать каждый тип графики

Эта сводная таблица - то, за чем разработчики возвращаются снова и снова. Каждый ассет ссылается на текстуры через свое поле, а некоторые типы неявно добавляют подпапку перед загрузкой, поэтому указанное вами значение **не всегда** равно пути к файлу на диске.

| Ассет | Поле | Куда класть файл |
| --- | --- | --- |
| Черта, божественная сила, королевство, группа | `path_icon` | `GameResources/` + в точности то, что вы написали |
| Предмет, в руке юнита | `path_gameplay_sprite` | `GameResources/` + в точности то, что вы написали |
| Здание | `sprite_path` | **Папка**: `GameResources/` + `sprite_path` + `/`, внутри `main_0.png`, `construction_0.png`, `ruin_0.png`. Если `sprite_path` пуст, это `main_path` + id, а `main_path` по умолчанию `buildings/` |
| Дроп (добыча) | `path_texture` | **Папка**: `GameResources/` + в точности то, что вы написали |
| Облако | `path_sprites` | `GameResources/` + каждый путь из списка |
| Эффект состояния | `texture` | **Папка**: `GameResources/effects/` + то, что вы написали |
| Снаряд | `texture` | **Папка**: `GameResources/effects/projectiles/` + то, что вы написали |
| Ресурс, переносимый в руках | `path_gameplay_sprite` | **Папка**: `GameResources/items/resources/` + то, что вы написали |
| Ресурс, иконка в инвентаре | `path_icon` | `GameResources/` + то, что написали (игра использует имена вроде `iconResBread`) |
| Плитка (Tile) и Top Tile | *(нет поля)* | `GameResources/tiles/<id_плитки>/` |

> [!WARNING] «Папка» — это не про стиль
> Всё, что выше помечено как **папка**, читается через `getSpriteList()`, который возвращает кадры *внутри* папки. Укажите на отдельный PNG — и получите пустой список: дроп падает невидимым, снаряд кидает `ArgumentOutOfRangeException` в `QuantumSpriteLibrary.drawProjectiles()`, статус кидает исключение каждый кадр. Одного кадра хватит, просто он должен лежать в своей папке: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Три главных подводных камня:

- **Статусы и снаряды сами подставляют папку.** Если написать `texture = "effects/status/myThing"`, игра будет искать файл в `effects/effects/status/myThing`, которого нет. Стандартные статусы используют короткие имена: `fx_status_burning_t`.
- **Плитки карты полностью игнорируют эти поля.** Графика тайла находится строго по его **ID** в отдельной подпапке, так как у тайла всегда несколько вариаций. `hello_moss` означает папку `GameResources/tiles/hello_moss/` с вашими файлами PNG внутри.
- **Здания не склеивают поля, но у них есть запасной путь.** `sprite_path` используется ровно как написано: `"buildings/hello_shrine"` значит `GameResources/buildings/hello_shrine/`. Оставите пустым - игра возьмет `main_path` + id, и папка, записанная в `main_path`, превратится в `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Копируйте пути у стандартных ассетов
> Найдите похожий стандартный объект в игре, посмотрите значение его поля через **[UnityExplorer](#/toolbox/unity-explorer)** или в **[Поиске иконок](#/tools/icons)** и в точности скопируйте его формат. Это быстрее и гарантирует правильный результат с первого раза :PESgn_Noice:.

## Чтение файла напрямую с диска

Иногда требуется прочитать исходный файл текстуры: рамку окна для ручной нарезки 9-slice, файл данных и т.п. `ModDeclare` знает точный путь к папке вашего мода; никогда не прописывайте абсолютные пути вручную.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // пиксель-арт без размытия
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

Класс `NeoModLoader.utils.SpriteLoadUtils` также предоставляет методы `LoadSingleSprite(path)` и `LoadSprites(path)`, если вам не хочется писать эту процедуру вручную.

## Звуки

Каждый звук в WorldBox — это FMOD-событие, воспроизводимое по пути. Вы можете свободно использовать любое из них:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

Первая строчка проигрывает звук в позиции конкретного тайла мира. HelloBox воспроизводит звук огненного шара при броске искры боевым действием, см. **[Снаряды, заклинания и эффекты](#/nml/projectiles-spells)**. Чтобы найти пути к звукам, поищите `event:/SFX/` в коде игры: там сотни записей, рассортированных по папкам. Убавьте громкость, прежде чем начнёте их проверять.

### Добавление собственных звуков

NML на самом деле патчит FMOD изнутри, так что свои файлы `.wav` работают без того, чтобы собирать в гараже второй звуковой движок :PESgn_Noice:.

Просто положите свой файл `.wav` в `GameResources/`, например:

```text
GameResources/sounds/hello_boom.wav
```

NML перехватывает `MusicBox.playSound` и `playDrawingSound`, так что вы проигрываете его тем же самым методом, что и ванильный звук (без расширения файла):

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

Рядом с файлом необязательный `hello_boom.json` позволяет настроить его поведение:

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| Поле | Значения |
| --- | --- |
| `Mode` | `Basic` (плоский 2D, громкость не меняется), `Stereo3D` (ванильное затухание с расстоянием), `Mono3D` (направленный) |
| `Type` | `Sound` (ползунок эффектов), `Music` (ползунок музыки), `UI` (ползунок интерфейса) |
| `Volume` | Громкость по умолчанию от 0 до 100 |
| `LoopCount` | Сколько раз повторить (0 = один раз) |

И самое приятное: так как NML подключает их к группам каналов игры, ваши звуки действительно слушаются настроек громкости игрока, а не оглушают его посреди ночи.

## Никогда не передавайте игре пустой спрайт (null)

Кнопка без спрайта - это не кнопка со знаком вопроса, а **невидимая дыра** в интерфейсе, на которую игрок никогда не сможет нажать. Всегда предусматривайте запасной вариант:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Значок предупреждения сразу сообщит вам: "путь неверен". А абсолютная пустота заставит вас два часа гадать, куда делась кнопка :PES4_Invisible:.
