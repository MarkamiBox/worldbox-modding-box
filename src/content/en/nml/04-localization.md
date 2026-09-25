---
title: Localization
group: NML Modding
subgroup: Core Workflow
icon: :wbscroll:
order: 26
---

# Localization :wbscroll:

Every single thing you add to the game (traits, items, powers, tabs, tasks) shows up as a raw key like `trait_hello_swift` until you give it text. It is the most boring chapter in modding, and skipping it is the number one reason a mod looks unfinished. (Coff.. my mods.. Coff Coff  :pensiveanimated: )

## The lazy way: a Locales folder

If your main class inherits from `BasicMod<T>`, create a `Locales/` folder in your mod and drop a JSON file named after the language. NML loads it **before** `OnModLoad`, with zero code from you.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

The filename **is** the language: `en.json`, `cz.json` (Simplified Chinese), `ch.json` (Traditional Chinese), `ja.json` (Japanese), `ru.json`, and so on. These are the ids registered by `GameLanguageLibrary`, not guessed ISO codes. Czech is `cs`, not `cz`. Keep the mod folder named `Locales` with a capital L; the game's own `locales/` resource paths are a separate thing.

If you implement `IMod` by hand instead, add `ILocalizable` and point it at the folder:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## One file for every language: csv

A `.csv` in the same folder covers all languages at once, which is far less annoying to maintain than fifteen JSON files. Here the filename does not matter:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

If your spreadsheet program exports with semicolons or tabs instead of commas, implement `ICsvSepCustomized` on your main class and return `';'` from `GetCsvSeparator()` so NML doesn't turn your translations into soup :PES2_Shrug:.

## Doing it from code

`NeoModLoader.General.LM` is the localization helper. Handy when your text is generated, or when you simply want everything in one `.cs` file instead of a pile of JSON.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

In HelloBox that file looks like this:

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

Add `HelloLocale.Initialize();` to `Main.cs` **first**, before everything else, so nothing ever gets registered while its text is still missing.

Register **everything at once, at load**, and call `ApplyLocale` once at the end. Asking the game for a key it does not have gets you the key back as the text, plus one `missing text` error in the log per key, so a tooltip built out of missing keys is not just ugly, it fills your log with noise :PES_UghPing:.

## The key names you actually need

The game builds these keys itself, so they have to match exactly or nothing shows up. Two of them do **not** follow the "same as the id" rule, and they are the ones people lose an hour to:

| What | Name key | Description key |
| --- | --- | --- |
| Trait | `trait_<id>` | `trait_<id>_info` |
| Item | `translation_key` if you set one, else `item_<equipment_subtype or id>` | `<id>_description` (no `item_` prefix) |
| God power | `<power_id>` | `<power_id>_description` |
| Power tab | the `locale_key` you passed | the description key you passed |
| Actor task | `task_unit_<task_id>` | - |
| Status effect | the `locale_id` **field** you set | the `locale_description` **field** you set |
| World law | `<law_id>_title` (note the suffix) | `<law_id>_description` |

> [!WARNING] Ids are not names
> Your id is `hello_swift` forever, in every language, and it is what the rest of your code (and other people's mods) reference. The **locale text** is the part that changes. Never rename an id just to fix a typo in the display name :PESgn_Stop:.

## The game API without LM

For a value needed only in the currently loaded language:

```csharp
LocalizedTextManager.add("hello_notice", "Hello from HelloBox", pReplace: true);
string notice = LocalizedTextManager.getText("hello_notice");
```

`add(string pKey, string pTranslation, bool pReplace = false, string pFileName = "", bool pCheckForCharacters = true)` writes to the current text dictionary. Existing keys stay unchanged unless `pReplace` is true. It normalises the key through `Underscore()`, so use underscore keys from the start. `getText(string pKey, Text text = null, bool pForceEnglish = false)` reads that dictionary; the supplied source does not use `pForceEnglish` to select English.

> [!NOTE] Current text is not a translation file
> Changing language rebuilds the game's text dictionaries. Use `Locales` or `LM.Add` for translations that must survive a language switch. Direct `add` also does not refresh existing text components for you.

Next: **[Sprites & resources](#/nml/sprites-and-resources)** or put text on screen with **[Messages & world log](#/nml/messages-and-world-log)**.