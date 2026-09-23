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

Eine `.csv`-Datei im selben Ordner deckt alle Sprachen gleichzeitig ab, was bei der Pflege wesentlich angenehmer ist als fünfzehn einzelne JSON-Dateien. Hier spielt der Dateiname keine Rolle:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## Übersetzungen direkt im Code registrieren

`NeoModLoader.General.LM` ist der Lokalisierungshelfer. Äußerst praktisch, wenn dein Text dynamisch generiert wird oder wenn du einfach alles in einer einzigen `.cs`-Datei statt in einem Haufen JSON-Dateien bündeln möchtest.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // in der aktuellen Spielsprache auslesen
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // zur aktuell geladenen Sprache hinzufügen
LM.Add("en", "trait_hello_swift", "Swift");          // zu einer bestimmten Sprache hinzufügen
LM.LoadLocale("path/to/Locales/en.json");            // eine JSON-Datei manuell laden
LM.LoadLocales("path/to/Locales/lang.csv");          // eine CSV-Datei manuell laden
LM.ApplyLocale(false);                               // anwenden. false = Bildschirmnachrichten nicht alle neu zeichnen
```

In HelloBox sieht diese Datei wie folgt aus:

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

Füge `HelloLocale.Initialize();` in `Main.cs` **zuerst** ein, noch vor allen anderen Initialisierungen, damit niemals ein Asset registriert wird, dessen Text noch fehlt.

Registriere **alles auf einmal beim Start** und rufe `ApplyLocale` am Ende einmalig auf. Das Spiel nach einem Schlüssel zu fragen, den es nicht kennt, loggt einen Fehler und schreibt eine Datei auf die Festplatte - ein Tooltip voller fehlender Schlüssel sieht also nicht nur hässlich aus, sondern müllt auch das Log zu :PES_UghPing:.

## Die Schlüsselnamen, die du wirklich brauchst

Das Spiel konstruiert diese Schlüssel selbst nach festen Regeln. Sie müssen exakt übereinstimmen, sonst wird nichts angezeigt:

| Element | Namens-Schlüssel | Beschreibungs-Schlüssel |
| --- | --- | --- |
| Trait | `trait_<id>` | `trait_<id>_info` |
| Item | `item_<id>` | `item_<id>_description` |
| God Power | `<power_id>` | `<power_id>_description` |
| Power Tab | der übergebene `locale_key` | der übergebene Beschreibungsschlüssel |
| Actor Task | `task_unit_<task_id>` | - |
| Status Effect | `<status_id>` | `<status_id>_description` |
| World Law | `<law_id>_title` (beachte das Suffix) | `<law_id>_description` |

> [!WARNING] IDs sind keine Anzeigenamen
> Deine ID lautet für immer `hello_swift`, in jeder Sprache, und genau darauf verweisen dein restlicher Code und die Mods anderer Entwickler. Der **Lokalisierungstext** ist der Teil, der sich ändert. Benenne niemals eine ID um, nur um einen Tippfehler im Anzeigenamen zu korrigieren :PESgn_Stop:.
