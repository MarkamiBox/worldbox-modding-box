---
title: Божественные силы
group: Игровой контент
subgroup: Божественные силы и интерфейс
icon: :wbgodfinger:
order: 200
---

# Божественные силы :wbgodfinger:

Божественная сила - это то, что происходит, когда игрок выбирает ваш инструмент и кликает по миру. Заспавнить что-то, благословить, взорвать.

Здесь задействованы две отдельные вещи, и путать их - классическая ошибка новичков:

| | |
| --- | --- |
| **Сила** (`GodPower`) | Данные: id, иконка и код, который выполняется при клике |
| **Кнопка** (`PowerButton`) | Элемент на панели, на который игрок физически нажимает |

На этой странице мы создаем саму силу. Страница **[Вкладки сил и кнопки](#/nml/power-buttons)** выводит ее на экран.

## Создание силы

```csharp Mods/HelloBox/Code/HelloPowers.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloPowers
    {
        public const string STRIKE = "hello_strike";

        public static void Initialize()
        {
            // Никогда не регистрируйте один и тот же id дважды: игра сохранит только первый.
            if (AssetManager.powers.get(STRIKE) != null) return;

            GodPower strike = new GodPower
            {
                id = STRIKE,
                name = STRIKE,
                rank = PowerRank.Rank0_free,        // разблокировка не требуется
                path_icon = "ui/Icons/iconFire",
                unselect_when_window = true,        // сбросить выбор инструмента при открытии окна
                show_tool_sizes = false,            // без выбора размера кисти (мал/сред/бол)

                // Что происходит, когда игрок кликает по тайлу этим выбранным инструментом.
                click_action = (WorldTile pTile, string pPowerID) =>
                {
                    if (pTile == null) return false;

                    EffectsLibrary.spawnExplosionWave(pTile.posV3, 3f, 0.5f);
                    Earthquake.startQuake(pTile);
                    return true;   // true = клик был обработан
                }
            };

            AssetManager.powers.add(strike);
        }
    }
}
```

Добавьте `HelloPowers.Initialize();` в `Main.cs`.

### Что делает каждая часть

- **`id`**: имя, на которое ссылается всё остальное. Кнопка, перевод, другие моды.
- **`name`**: используется поиском в собственном интерфейсе игры. Если сделать его таким же, как id, избавитесь от головной боли.
- **`rank = PowerRank.Rank0_free`**: доступно с самого начала, ничего открывать не нужно.
- **`path_icon`**: иконка курсора/инструмента.
- **`unselect_when_window`**: когда игрок открывает окно, инструмент сам снимается, чтобы он случайно не поразил карту за панелью.
- **`click_action`**: ваш код. Он получает **клетку, по которой кликнули**, и **id силы** и возвращает `true`, если что-то сделал.

> [!WARNING] Сигнатура клика - `(WorldTile, string)`
> `click_action` - это `PowerActionWithID`, поэтому второй аргумент - это **id силы в виде строки**, а не `GodPower`. Есть второе поле, `click_power_action`, которое принимает `(WorldTile, GodPower)`. Неправильная форма даст вам ошибку компиляции, которая читается как бессмыслица :PES_DaFuq:.

## Полезные действия при клике

```csharp
// существо, стоящее на тайле (или рядом), если есть
Actor actor = null;
foreach (Actor found in Finder.getUnitsFromChunk(pTile, 1, 2.5f))
{
    if (found != null && found.isAlive()) { actor = found; break; }
}

// заспавнить существо
World.world.units.spawnNewUnit("wolf", pTile);

// визуальный эффект на тайле
EffectsLibrary.spawnAt("fx_lightning_small", pTile.posV3, 0.25f);

// уронить что-то с неба (см. Капли и падающие объекты)
World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

// показать сообщение игроку
WorldTip.showNow("The gods are displeased.", false, "top", 3f);
```

## Зажатие для рисования

Установка `hold_action = true` и значения `click_interval` заставляет силу срабатывать непрерывно, пока зажата кнопка мыши, прямо как у ванильных кистей:

```csharp
strike.hold_action = true;
strike.click_interval = 0.15f;   // интервал в секундах между срабатываниями
```

## Своя собственная иконка

`path_icon` служит одновременно курсором инструмента и картинкой на кнопке. Загружается в точности по указанному пути из `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloStrike.png
```

```csharp
strike.path_icon = "ui/Icons/iconHelloStrike";
```

> [!WARNING] Отсутствующая иконка превращается в невидимую кнопку
> Если путь указан неверно, спрайт вернется равным `null`. А `null`-спрайт - это не кнопка с отсутствующей картинкой, это просто прозрачная дыра в панели сил, которую игрок никогда в жизни не найдет. См. вспомогательный метод на странице **[Вкладки сил и кнопки](#/nml/power-buttons)** :aPES_Hide:.

## Тексты

```json Locales/en.json
{
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess. Mostly a mess."
}
```

## Кисти

Сила бога воздействует на карту через **кисть** — форму области тайлов, которую охватывает один клик. Игра генерирует массив пикселей и картинку предпросмотра для каждой кисти процедурно через код, поэтому новая форма не требует спрайтов.

```csharp Mods/HelloBox/Code/HelloBrushes.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloBrushes
    {
        public const string TARGET = "hello_target";

        public static void Initialize()
        {
            if (AssetManager.brush_library.has(TARGET)) return;

            BrushData target = new BrushData
            {
                id = TARGET,
                size = 6,
                group = BrushGroup.Special,
                show_in_brush_window = true,
                localized_key = "brush_hello_target",
                continuous = true,
                fast_spawn = true
            };

            // post_init() runs generate_action and measures every brush, at startup.
            // Do both yourself: a centre dot and a ring around it.
            List<BrushPixelData> pixels = new List<BrushPixelData>();
            for (int x = -6; x <= 6; x++)
            {
                for (int y = -6; y <= 6; y++)
                {
                    int dist = x * x + y * y;
                    if (dist == 0 || (dist >= 16 && dist <= 36)) pixels.Add(new BrushPixelData(x, y, dist));
                }
            }
            target.pos = pixels.ToArray();
            target.width = 13;
            target.height = 13;
            target.sqr_size = target.width * target.height;

            AssetManager.brush_library.add(target);

            // linkAssets() shuffled every brush, and post_init() listed the ones the
            // brush hotkeys cycle through. Both at startup.
            BrushLibrary.shuffleBrush(target);
            BrushLibrary._available_brushes.Add(TARGET);
        }
    }
}
```

Силу можно жестко привязать к конкретной кисти с помощью `force_brush = "hello_target"` точно так же, как ванильные одиночные силы привязаны к `sqr_0`. Горячие клавиши переключения кистей циклически перебирают список `_available_brushes`, поэтому ваша кисть попадет в ротацию. Окно выбора кистей инициализирует кнопки при первом открытии: даже если кисти там нет, `force_brush` и хоткеи будут исправно ее активировать.

> [!WARNING] Размеры кистей рассчитываются при запуске
> `BrushLibrary.post_init()` вызывает `generate_action` для каждой кисти и вычисляет `width`, `height` и `sqr_size`, а `linkAssets()` перемешивает пиксели. Кисть, добавленная модом позже, пропускает этот шаг: задайте массив `pos` и размеры вручную, как показано выше. Картинка предпросмотра рисуется по точкам из `pos`, поэтому отдельная иконка кисти не требуется.

```json Mods/HelloBox/Locales/en.json
{
  "brush_hello_target": "Target"
}
```

## Сила всё ещё не отображается в игре

Совершенно верно: вы создали силу, но её пока некому показать. Переходите к странице **[Вкладки сил и кнопки](#/nml/power-buttons)** - это вторая половина дела, и она займет ровно десять строк :pepeOK:.
