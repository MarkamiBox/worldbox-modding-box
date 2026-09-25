---
title: Сообщения и журнал мира
group: Игровой контент
subgroup: Божественные силы и интерфейс
icon: :wbscroll:
order: 207
---

# Сообщения и журнал мира :wbscroll:

Печатать в консоль через `Main.Log()` отлично, пока вы пишете код. Но когда ваша сила бога роняет метеорит, пробуждается кастомный босс или королевство подписывает договор, игрок не читает ваш отладочный лог.

Ему нужна обратная связь на экране: всплывающие подсказки, пролетающие по экрану, и записи в историческом журнале мира.

## Экранные баннеры через WorldTip

Самый быстрый способ показать игроку слова - `WorldTip.showNow`:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Параметр | Назначение | По умолчанию |
| --- | --- | --- |
| `pText` | Либо сырая строка, либо ключ локализации | Обязателен |
| `pTranslate` | Пропускать ли `pText` через `LocalizedTextManager.getText()` | `true` |
| `pPosition` | Якорь на экране: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Длительность в секундах до исчезновения | `3f` |
| `pColor` | Шестнадцатеричный код цвета текста | `"#F3961F"` (оранжевый) |

> [!WARNING] WorldTip по умолчанию переводит текст
> Поскольку `pTranslate` по умолчанию `true`, запись `WorldTip.showNow("Something happened!")` заставит игру искать ключ локализации с именем `"Something happened!"`. Он не найдётся, в лог попадёт ошибка отсутствующего перевода, а на экране покажется сырой текст-заглушка :PESgn_Oops:.
>
> Если вы передаёте буквальный английский текст, **всегда** ставьте `pTranslate: false`:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> Для локализованного текста передавайте свой ключ перевода и оставляйте `pTranslate: true`:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Текст на нижней панели

Если нужно более тонкое сообщение прямо над панелью сил бога - как текст подсказки при выборе кисти - используйте `showToolbarText`:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

Это рисует небольшую плавающую подсказку прямо над активной панелью сил.

## Запись событий мира в WorldLog

Журнал мира - это постоянная запись, которую игроки открывают в окне истории. Записи переживают сохранение и загрузку и привязаны к хронологии мира.

Игра предоставляет несколько готовых статических помощников на `WorldLog`:

```csharp
// Записать смену императора:
WorldLog.logNewKing(kingdom);

// Записать основание нового государства:
WorldLog.logNewKingdom(kingdom);

// Записать событие катастрофы на конкретном тайле:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Собственные записи истории

Чтобы добавить своё событие истории, соберите `WorldLogMessage` с `WorldLogAsset` из `AssetManager.world_log`:

```csharp Mods/HelloBox/Code/HelloHistory.cs
namespace HelloBox
{
    public static class HelloHistory
    {
        public static void RecordTitanEvent(Kingdom pKingdom)
        {
            if (pKingdom == null || World.world == null) return;

            WorldLogAsset logAsset = AssetManager.world_log.get("king_new");
            if (logAsset == null) return;

            WorldLogMessage entry = new WorldLogMessage(logAsset, pKingdom.name, "Awakened the Titan")
            {
                timestamp = (int)World.world.getCurWorldTime()
            };

            // add() регистрирует запись в HistoryHud и пишет её в базу данных журнала мира:
            entry.add();
        }
    }
}
```

`entry.add()` добавляет запись в исторический HUD текущей игры и сохраняет её в базу SQLite мира через `DBInserter.insertLog`.

## Таблички на карте (nameplates_library)

Когда включены слои карты, над городами, королевствами и религиями появляются баннеры. Ими управляет `AssetManager.nameplates_library` (`NameplateAsset`).

| Поле | Назначение |
| --- | --- |
| `id` | Идентификатор, совпадающий с `MetaType` |
| `path_sprite` | Путь к спрайту рамки баннера |
| `padding_left` / `padding_right` / `padding_top` | Границы отступа текста |
| `map_mode` | Над каким `MetaType` рисуется эта табличка |

> [!WARNING] Не вызывайте add() для ванильных режимов карты
> Библиотека допускает только **одну** табличку на `MetaType`. Если вы вызовете `AssetManager.nameplates_library.add(...)` для `MetaType`, который уже существует (например, королевства или города), это бросит исключение :wbfacepalm:.
>
> Если хотите изменить внешний вид ванильных табличек, найдите существующую через `get()` и отредактируйте её поля:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Далее: **[Настройки игры и шкалы времени](#/nml/game-options)** про настройки игрока или **[Каждый кадр](#/nml/update-loops)** про выполнение логики по часам.
