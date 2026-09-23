---
title: Локализация
group: NML Моддинг
subgroup: Базовый рабочий процесс
icon: :wbscroll:
order: 26
---

# Локализация :wbscroll:

Каждая вещь, которую вы добавляете в игру (черты, предметы, силы, вкладки, задачи), отображается как сырой ключ вида `trait_hello_swift`, пока вы не зададите для неё текст. Это самая скучная глава в моддинге, и пропуск этого шага - главная причина, почему мод выглядит недоделанным. (Кхм.. мои моды.. Кхм-кхм :pensiveanimated: )

## Самый простой путь: папка Locales

Если ваш главный класс наследуется от `BasicMod<T>`, просто создайте папку `Locales/` в корне мода и положите туда JSON-файл с названием языка. NML загрузит его **до** вызова `OnModLoad`, вообще без единой строчки кода с вашей стороны.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

Имя файла **и есть** язык: `en.json`, `cz.json` (упрощенный китайский), `ru.json` и так далее.

Если же вы реализуете `IMod` вручную, добавьте интерфейс `ILocalizable` и укажите путь к папке:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Один файл для всех языков: CSV

Файл `.csv` в той же папке охватывает все языки сразу, что гораздо проще поддерживать, чем пятнадцать отдельных JSON-файлов. В этом случае имя файла не имеет значения:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Регистрация переводов прямо из кода

`NeoModLoader.General.LM` - вспомогательный класс для локализации. Он незаменим, когда текст генерируется динамически, или когда вам просто удобнее держать всё в одном файле `.cs` вместо кучи JSON-файлов.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // прочитать на текущем языке игры
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // добавить в текущий активный язык
LM.Add("en", "trait_hello_swift", "Swift");          // добавить для конкретного языка
LM.LoadLocale("path/to/Locales/en.json");            // загрузить json вручную
LM.LoadLocales("path/to/Locales/lang.csv");          // загрузить csv вручную
LM.ApplyLocale(false);                               // применить. false = не перерисовывать весь экран сразу
```

В моде HelloBox этот файл выглядит следующим образом:

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

Вызывайте `HelloLocale.Initialize();` в методе `Main.cs` **самым первым**, раньше всего остального, чтобы ассеты не регистрировались тогда, когда их текст еще отсутствует.

Регистрируйте **всё разом при загрузке** и вызывайте `ApplyLocale` один раз в конце. Запрос у игры несуществующего ключа выводит ошибку в лог и создает файл на диске: поэтому подсказки с пропущенными ключами не просто некрасивы, они еще и забивают лог мусором :PES_UghPing:.

## Имена ключей, которые вам действительно понадобятся

Игра генерирует эти ключи по строгим шаблонам, поэтому они обязаны совпадать в точности:

| Что это | Ключ названия | Ключ описания |
| --- | --- | --- |
| Черта | `trait_<id>` | `trait_<id>_info` |
| Предмет | `item_<id>` | `item_<id>_description` |
| Божественная сила | `<power_id>` | `<power_id>_description` |
| Вкладка сил | переданный `locale_key` | переданный ключ описания |
| Задача юнита | `task_unit_<task_id>` | - |
| Эффект состояния | `<status_id>` | `<status_id>_description` |
| Закон мира | `<law_id>_title` (обратите внимание на суффикс) | `<law_id>_description` |

> [!WARNING] Идентификаторы - это не отображаемые имена
> Ваш ID останется `hello_swift` навсегда, на всех языках, и именно на него ссылается остальной код и чужие моды. **Текст локализации** - это единственное, что меняется. Никогда не переименовывайте ID только для того, чтобы исправить опечатку в отображаемом названии :PESgn_Stop:.
