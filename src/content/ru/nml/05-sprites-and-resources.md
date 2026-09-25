---
title: Спрайты и ресурсы
group: NML Моддинг
subgroup: Базовый рабочий процесс
icon: :wbfanartist:
order: 28
---

# Спрайты и ресурсы :wbfanartist:

У вашей черты (trait) есть название, характеристики (stats) и прекрасное описание. Но вместо иконки красуется огромный уродливый знак вопроса. Пора это исправить.

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
| `PivotX` / `PivotY` | Точка привязки (Pivot). `0.5 / 0.0` - это центр снизу, что обычно и требуется юнитам и зданиям (building) |
| `BorderL/R/T/B` | Границы 9-slice для растягивающихся рамок окон и кнопок |
| `Path` | Конкретный файл, к которому применяется это правило |
| `RectX` / `RectY` | Смещения прямоугольника спрайта. Оба по умолчанию `0`; документация NML советует оставлять их равными `0` |

Секция `Default` применяется ко всем файлам в этой папке, не упомянутым в `Specific`.

> [!NOTE] Смещения - это не рецепт атласа
> У задокументированных настроек `sprites.json` нет полей ширины или высоты прямоугольника. Не изобретайте их, чтобы нарезать спрайт-лист. NML документирует файлы `.meta` Unity для атласов и спрайт-листов.

## Куда складывать каждый тип графики

Это таблица, к которой все возвращаются. Каждый ассет указывает на свою графику через своё поле, а некоторые перед загрузкой молча добавляют папку спереди, так что значение, которое вы пишете, **не** всегда совпадает с путём к файлу.

| Ассет | Поле | Файл лежит в |
| --- | --- | --- |
| Черта, божественная сила (GodPower), королевство (kingdom), группа | `path_icon` | `GameResources/` + ровно то, что вы написали |
| Предмет (item) в руке юнита | `path_gameplay_sprite` | `GameResources/` + ровно то, что вы написали |
| Здание | `sprite_path` | **Папка**: `GameResources/` + `sprite_path` + `/`, в которой лежат `main_0.png`, `construction_0.png`, `ruin_0.png`. Если `sprite_path` пуст, берётся `main_path` + id, а `main_path` по умолчанию равен `buildings/` |
| Дроп | `path_texture` | **Папка**: `GameResources/` + ровно то, что вы написали, по PNG на кадр |
| Облако (cloud) | `path_sprites` | `GameResources/` + каждый путь из списка |
| Эффект статуса (status) | `texture` | **Папка**: `GameResources/effects/` + то, что вы написали, по PNG на кадр |
| Снаряд (projectile) | `texture` | **Папка**: `GameResources/effects/projectiles/` + то, что вы написали, по PNG на кадр |
| Ресурс (resource) в руках | `path_gameplay_sprite` | **Папка**: `GameResources/items/resources/` + то, что вы написали, по PNG на кадр |
| Ресурс, иконка в инвентаре | `path_icon` | `GameResources/` + то, что вы написали. Ваниль использует голое имя вроде `iconResBread`, так что файл лежит в корне |
| Плитка и верхняя плитка | *(поля нет)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] «Папка» - это не вопрос стиля
> Каждый ассет, помеченный выше как **папка**, читается через `getSpriteList()`, который возвращает кадры *внутри* папки. Укажите на один PNG, и вернётся пустота: дроп падает невидимым, снаряд бросает `ArgumentOutOfRangeException` в `QuantumSpriteLibrary.drawProjectiles()`, статус падает на каждом кадре. Один кадр - это нормально, он просто должен лежать в своей папке: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Три из них кусаются:

- **Статус и снаряд добавляют папку спереди.** Если написать `texture = "effects/status/myThing"` у статуса, игра будет искать `effects/effects/status/myThing`, а там ничего нет. Ванильные статусы используют голое имя: `fx_status_burning_t`.
- **Плитки вообще игнорируют поля.** Графика плитки ищется по её **id**, в отдельной папке, потому что у плитки несколько вариантов. `hello_moss` означает `GameResources/tiles/hello_moss/` с вашими PNG внутри.
- **Здания ничего не склеивают, но у них есть запасной вариант.** `sprite_path` используется ровно как написано: `"buildings/hello_shrine"` означает `GameResources/buildings/hello_shrine/`. Оставьте его пустым, и игра возьмёт `main_path` + id, так что папка, записанная в `main_path`, превратится в `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Скопируйте путь у ванильного ассета
> Возьмите самый похожий ванильный объект, прочитайте его поле в **[UnityExplorer](#/toolbox/unity-explorer)** или через **[Поиск путей спрайтов](#/tools/icons)** и повторите форму в точности. Это быстрее, чем рассуждать, и получается правильно с первого раза :PESgn_Noice:.

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


Далее: **[Настройки мода](#/nml/mod-config)** или **[Пользовательские окна](#/nml/custom-windows)**.
