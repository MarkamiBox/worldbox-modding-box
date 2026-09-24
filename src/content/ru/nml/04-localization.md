---
title: Локализация
group: NML Моддинг
subgroup: Базовый рабочий процесс
icon: :wbscroll:
order: 26
---

# Локализация :wbscroll:

Каждая вещь, которую вы добавляете в игру (черты (trait), предметы (item), силы, вкладки, задачи (task)), отображается как сырой ключ вида `trait_hello_swift`, пока вы не зададите для неё текст. Это самая скучная глава в моддинге, и пропуск этого шага - главная причина, почему мод выглядит недоделанным. (Кхм.. мои моды.. Кхм-кхм :pensiveanimated: )

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


Если ваша табличная программа экспортирует данные с точкой с запятой или табуляцией вместо запятых, реализуйте `ICsvSepCustomized` в главном классе и верните `';'` из `GetCsvSeparator()`, чтобы NML не превратил тексты в кашу :PES2_Shrug:.
Файл `.csv` в той же папке охватывает все языки сразу, что гораздо проще поддерживать, чем пятнадцать отдельных JSON-файлов. В этом случае имя файла не имеет значения:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Регистрация переводов прямо из кода

`NeoModLoader.General.LM` - это помощник по локализации. Удобен, когда текст генерируется, или когда вы просто хотите держать всё в одном файле `.cs`, а не в куче JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

В HelloBox этот файл выглядит так:

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

Добавьте `HelloLocale.Initialize();` в `Main.cs` **первым**, раньше всего остального, чтобы ничего не регистрировалось, пока для него нет текста.

Регистрируйте **всё сразу, при загрузке**, и вызовите `ApplyLocale` один раз в конце. Если спросить у игры ключ, которого у неё нет, вы получите в качестве текста сам ключ плюс одну ошибку `missing text` в логе на каждый ключ, так что подсказка из отсутствующих ключей не просто уродлива, она ещё и засоряет лог :PES_UghPing:.

## Имена ключей, которые вам действительно понадобятся

Игра сама собирает эти ключи, поэтому они должны совпадать в точности, иначе ничего не появится. Два из них **не** следуют правилу «как id», и именно на них люди теряют по часу:

| Что | Ключ имени | Ключ описания |
| --- | --- | --- |
| Черта | `trait_<id>` | `trait_<id>_info` |
| Предмет | `translation_key`, если вы его задали, иначе `item_<equipment_subtype or id>` | `<id>_description` (без префикса `item_`) |
| Божественная сила (GodPower) | `<power_id>` | `<power_id>_description` |
| Вкладка сил | `locale_key`, который вы передали | ключ описания, который вы передали |
| Задача актора | `task_unit_<task_id>` | - |
| Эффект состояния | **поле** `locale_id`, которое вы задаёте | **поле** `locale_description`, которое вы задаёте |
| Закон мира (world law) | `<law_id>_title` (обратите внимание на суффикс) | `<law_id>_description` |

> [!WARNING] Id - это не имена
> Ваш id навсегда остаётся `hello_swift`, на любом языке, и именно на него ссылается остальной код (и чужие моды). Меняется только **текст локализации**. Никогда не переименовывайте id только ради исправления опечатки в отображаемом имени :PESgn_Stop:.
