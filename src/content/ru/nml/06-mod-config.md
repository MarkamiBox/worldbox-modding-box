---
title: Настройки мода
group: NML Моддинг
subgroup: Продвинутые техники и публикация
icon: :wbsettingsgear:
order: 40
---

# Настройки мода :wbsettingsgear:

Рано или поздно кто-то обязательно заявит, что ваш мод слишком несбалансирован, тормозит или раздражает звуками. Вместо того чтобы спорить в Discord :PESgn_WhySoToxic:, дайте игрокам окно настроек и пусть подкручивают параметры сами.

NML отрисует всё окно за вас. Вам нужно написать всего один JSON-файл.

## default_config.json

Положите файл `default_config.json` в корень вашего мода, рядом с `mod.json`:

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"` — это **идентификатор группы**: вкладка с настройками. Каждый объект внутри неё становится отдельной строкой в окне.

| Ключ | Значение |
| --- | --- |
| `Id` | Уникальный внутри группы. По нему значение считывается в коде |
| `Type` | `SWITCH` (вкл/выкл), `SLIDER` (дробное), `INT_SLIDER` (целое), `TEXT` (текстовое поле) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | Значение по умолчанию, соответствующее типу |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Границы ползунка |
| `IconPath` | Необязательная иконка для строки |
| `Callback` | Необязательный `Namespace.Type:MethodName`, вызываемый при смене значения |

## Чтение значений

При наследовании от `BasicMod<T>` метод `GetConfig()` доступен из коробки с индексацией по группе, а затем по ID:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

Да, блоки `try/catch` вокруг каждой строчки кажутся паранойей. Но это не так: если игрок обновился со старой версии мода, в его сохранённом конфиге нового ключа просто нет, и один отсутствующий ключ уронит всю загрузку мода.

## Callbacks

`Callback` задаётся как `Namespace.Type:MethodName`, и метод принимает новое значение:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // вызывается NML, когда игрок перемещает ползунок
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] Изменения вступают в силу при закрытии окна
> Не во время перетаскивания ползунка. Если ваш колбэк делает что-то ресурсоёмкое — это отличная новость. Если вы ждали живого предпросмотра, вот почему оно «не работает» :huh:.

## Где сохраняются настройки

Файл `default_config.json` — это лишь **шаблон**. Реальные настройки игрока записываются в:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

И это первое, что стоит удалить, когда вы тестируете значения по умолчанию и недоумеваете, почему новые параметры упорно не появляются :PESgn_OOF:.

## Don't forget the text (again)

Идентификаторы групп и элементов также являются ключами локализации. Добавьте их в `Locales/`, иначе в интерфейсе отобразятся технические ID:

Id группы и id пунктов — тоже ключи локали, так что положите их в `Locales/en.json`, иначе они покажутся как есть. Каждой строке нужен ещё и второй ключ, **`"<id> Description"`**, с пробелом и заглавной D, для подсказки:

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] Лог сам скажет, какие вы забыли
> Отсутствующая подпись печатает `LocalizedTextManager: missing text: strike_radius Description`. Откройте окно настроек один раз, поищите `missing text:` — и у вас точный список ключей :wbsmirk:.


## Без BasicMod

Если ваш главный класс реализует `IMod` напрямую, реализуйте `IConfigurable` в этом же классе и верните экземпляр самостоятельно:

```csharp
public ModConfig GetConfig()
{
    return _config;   // создаётся или загружается вами
}
```

Именно этот единственный метод заставляет появиться кнопку настроек рядом с вашим модом в списке модов.
