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
| `Type` | `SWITCH` (An/Aus), `SLIDER` (Float), `INT_SLIDER` (Int), `TEXT` (Textfeld) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | Der Standardwert, passend zum Typ |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | Schieberegler-Grenzen |
| `IconPath` | Optionales Icon für die Zeile |
| `Callback` | Optionales `Namespace.Type:MethodName`, aufgerufen bei Wertänderung |

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

Ja, das `try/catch` um jede Zeile sieht paranoid aus. Ist es nicht: Wenn ein Spieler von einer älteren Version deiner Mod aktualisiert, hat seine gespeicherte Konfiguration den neuen Schlüssel schlicht nicht, und ein einziger fehlender Schlüssel würde sonst deinen ganzen Ladevorgang lahmlegen.

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
> Nicht während des Ziehens. Wenn dein Callback etwas Rechenintensives tut, ist das eine gute Nachricht. Wenn du eine Live-Vorschau erwartet hast, ist das der Grund, warum es "nicht funktioniert" :huh:.

## Wo es gespeichert wird

Deine `default_config.json` ist nur die **Vorlage**. Die tatsächlichen Einstellungen des Spielers landen hier:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

Das ist auch die erste Datei, die du löschen solltest, wenn du an Standardwerten herumprobierst und dich wunderst, warum dein neuer Wert nie auftaucht :PESgn_OOF:.

## Don't forget the text (again)

Gruppen-IDs und Einstellungs-IDs sind Lokalisierungsschlüssel. Trage sie in `Locales/de.json` ein, sonst erscheinen die Rohbezeichner:

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

Diese einzige Methode sorgt dafür, dass der Einstellungs-Button neben deiner Mod im Mod-Menü erscheint.
