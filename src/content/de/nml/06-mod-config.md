---
title: Mod-Einstellungen
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbsettingsgear:
order: 40
---

# Mod-Einstellungen :wbsettingsgear:

Früher oder später wird dir jemand sagen, dass deine Mod zu stark, zu langsam oder zu laut ist. Anstatt auf Discord zu streiten :PESgn_WhySoToxic:, gib ihnen ein Einstellungsfenster und lass sie es selbst anpassen.

NML zeichnet das gesamte Fenster für dich. Du schreibst genau eine JSON-Datei.

## default_config.json

Lege eine `default_config.json` im Hauptverzeichnis deiner Mod ab, direkt neben der `mod.json`:

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

`"hellobox"` ist die **Gruppen-ID**: ein Reiter voller Einstellungen. Jeder Eintrag darin ist eine Zeile im Fenster.

| Schlüssel | Bedeutung |
| --- | --- |
| `Id` | Eindeutig innerhalb der Gruppe. So liest du den Wert im Code aus |
| `Type` | `SWITCH` (An/Aus), `SLIDER` (Float), `INT_SLIDER` (Int), `TEXT` (Textfeld), `SELECT` (Optionsraster) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | Der Standardwert, passend zum Typ |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Schieberegler-Grenzen. Bei `SELECT` ist `MaxIntVal` die Anzahl der Optionen und `IntVal` der gewählte Index |
| `IconPath` | Optionales Icon für die Zeile |
| `Callback` | Optionales `Namespace.Type:MethodName`, aufgerufen bei Wertänderung |

Bei `SELECT` legt NML für jede Option einen Button an. Die Beschriftungen kommen direkt aus deiner Lokalisierung als `<id>_0`, `<id>_1` und so weiter.

## Die Werte auslesen

Mit `BasicMod<T>` erhältst du `GetConfig()` umsonst, indexiert nach Gruppe und dann nach ID:

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

NML ruft beim Start `persistent_config.MergeWith(default_config)` auf. Wenn du also einen neuen Schlüssel in `default_config.json` hinzufügst, übernimmt NML ihn automatisch mit seinem Standardwert in die gespeicherte Konfiguration des Spielers. Das `try/catch` ist trotzdem gute Hygiene, falls jemand seine `.config` im Texteditor geöffnet und das JSON kaputt gemacht hat, aber bei normalen Updates hält NML dir den Rücken frei.

## Callbacks

Ein `Callback` hat das Format `Namespace.Type:MethodName`, und die Methode empfängt den neuen Wert:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // von NML aufgerufen, wenn der Spieler den Schieberegler bewegt
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] Änderungen greifen erst beim Schließen des Fensters
> Nicht während des Ziehens. Wenn dein Callback etwas Rechenintensives tut, ist das eine gute Nachricht. Wenn du eine Live-Vorschau erwartet hast, ist das der Grund, warum es "nicht funktioniert" :huh:. `BasicMod` löst außerdem jeden Callback beim Start einmal aus, damit dein Code übernimmt, was der Spieler gespeichert hat.

## Wo es gespeichert wird

Deine `default_config.json` ist nur die **Vorlage**. Die tatsächlichen Einstellungen des Spielers landen hier:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

Das ist auch die erste Datei, die du löschen solltest, wenn du an Standardwerten herumprobierst und dich wunderst, warum dein neuer Wert nie auftaucht :PESgn_OOF:.

## Don't forget the text (again)

Gruppen-Ids und Item-Ids sind auch Locale-Keys, also pack sie in `Locales/en.json`, sonst stehen sie roh da. Jede Zeile will außerdem einen zweiten Key, **`"<id> Description"`**, mit Leerzeichen und großem D, für den Tooltip:

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

> [!TIP] Das Log sagt dir, welche du vergessen hast
> Ein fehlendes Label schreibt `LocalizedTextManager: missing text: strike_radius Description`. Such nach `missing text:`, nachdem du das Einstellungsfenster einmal geöffnet hast, und du hast die genaue Liste der Keys :wbsmirk:.


## Ohne BasicMod

Wenn deine Hauptklasse direkt `IMod` implementiert, implementiere `IConfigurable` auf derselben Klasse und gib die Instanz selbst zurück:

```csharp
public ModConfig GetConfig()
{
    return _config;   // von dir erstellt oder geladen
}
```

Diese einzige Methode sorgt dafür, dass der Einstellungs-Button neben deiner Mod im Mod-Menü erscheint. Eine Methode, und niemand streitet sich mehr auf Discord mit dir. In der Theorie.
