---
title: Lokalisierung
group: NML-Modding
subgroup: Basis-Workflow
icon: :wbscroll:
order: 26
---

# Lokalisierung :wbscroll:

Jedes einzelne Element, das du dem Spiel hinzufügst (Traits, Items, Powers, Tabs, Tasks), erscheint als roher Platzhalter-Schlüssel wie `trait_hello_swift`, bis du ihm einen Text gibst. Es ist das langweiligste Kapitel im Modding, und es zu überspringen ist der Hauptgrund dafür, dass eine Mod unfertig wirkt. (Hust.. meine Mods.. Hust Hust :pensiveanimated: )

## Der bequeme Weg: ein Locales-Ordner

Wenn deine Hauptklasse von `BasicMod<T>` erbt, erstelle einfach einen Ordner namens `Locales/` in deiner Mod und lege dort eine JSON-Datei ab, die nach dem Sprachcode benannt ist. NML lädt sie **vor** `OnModLoad`, ganz ohne eine einzige Zeile Code von dir.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

Der Dateiname **ist** die Sprache: `en.json`, `cz.json` (Vereinfachtes Chinesisch), `ru.json`, `de.json` und so weiter.

Wenn du `IMod` stattdessen von Hand implementierst, füge `ILocalizable` hinzu und verweise auf den Ordner:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## Eine Datei für alle Sprachen: CSV


Wenn dein Tabellenprogramm Semikolons oder Tabs statt Kommas exportiert, implementiere `ICsvSepCustomized` in deiner Hauptklasse und gib `';'` aus `GetCsvSeparator()` zurück, damit NML deine Texte nicht in Brei verwandelt :PES2_Shrug:.
Eine `.csv`-Datei im selben Ordner deckt alle Sprachen gleichzeitig ab, was bei der Pflege wesentlich angenehmer ist als fünfzehn einzelne JSON-Dateien. Hier spielt der Dateiname keine Rolle:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Übersetzungen direkt im Code registrieren

`NeoModLoader.General.LM` ist der Lokalisierungshelfer. Praktisch, wenn dein Text generiert wird oder du einfach alles in einer `.cs`-Datei statt in einem Haufen JSON haben willst.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

In HelloBox sieht die Datei so aus:

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

Füge `HelloLocale.Initialize();` in `Main.cs` **als Erstes** hinzu, vor allem anderen, damit nie etwas registriert wird, solange sein Text noch fehlt.

Registriere **alles auf einmal, beim Laden**, und ruf `ApplyLocale` einmal am Ende auf. Fragst du das Spiel nach einem Schlüssel, den es nicht hat, bekommst du den Schlüssel selbst als Text zurück, plus einen `missing text`-Fehler pro Schlüssel im Log. Ein Tooltip aus fehlenden Schlüsseln ist also nicht nur hässlich, er müllt auch dein Log zu :PES_UghPing:.

## Die Schlüsselnamen, die du wirklich brauchst

Das Spiel baut diese Schlüssel selbst, also müssen sie exakt passen, sonst erscheint nichts. Zwei davon folgen **nicht** der Regel "wie die ID", und genau an denen verlieren Leute eine Stunde:

| Was | Namensschlüssel | Beschreibungsschlüssel |
| --- | --- | --- |
| Merkmal | `trait_<id>` | `trait_<id>_info` |
| Gegenstand (item) | `translation_key`, falls gesetzt, sonst `item_<equipment_subtype or id>` | `<id>_description` (ohne `item_`-Präfix) |
| Göttliche Macht (GodPower) | `<power_id>` | `<power_id>_description` |
| Macht-Tab | der `locale_key`, den du übergeben hast | der Beschreibungsschlüssel, den du übergeben hast |
| Akteur-Aufgabe | `task_unit_<task_id>` | - |
| Statuseffekt | das **Feld** `locale_id`, das du setzt | das **Feld** `locale_description`, das du setzt |
| Weltgesetz (world law) | `<law_id>_title` (achte auf das Suffix) | `<law_id>_description` |

> [!WARNING] IDs sind keine Namen
> Deine ID ist für immer `hello_swift`, in jeder Sprache, und auf sie verweist der Rest deines Codes (und die Mods anderer Leute). Der **Lokalisierungstext** ist der Teil, der sich ändert. Benenne nie eine ID um, nur um einen Tippfehler im Anzeigenamen zu korrigieren :PESgn_Stop:.
