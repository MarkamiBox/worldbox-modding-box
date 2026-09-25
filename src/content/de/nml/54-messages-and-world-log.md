---
title: Nachrichten & Weltprotokoll
group: Spielinhalte
subgroup: Göttliche Kräfte & UI
icon: :wbscroll:
order: 207
---

# Nachrichten & Weltprotokoll :wbscroll:

Mit `Main.Log()` in die Konsole zu schreiben ist toll, während du Code schreibst. Aber wenn deine Gotteskraft einen Meteor fallen lässt, eine eigene Boss-Einheit erwacht oder ein Königreich einen Vertrag unterschreibt, liest der Spieler nicht dein Debug-Log.

Er braucht Rückmeldung auf dem Bildschirm: Popup-Hinweise, die über den Schirm schweben, und Einträge im Verlaufsprotokoll der Welt.

## Banner auf dem Bildschirm mit WorldTip

Der schnellste Weg, dem Spieler Worte vor die Augen zu setzen, ist `WorldTip.showNow`:

```csharp
WorldTip.showNow(string pText, bool pTranslate = true, string pPosition = "center", float pTime = 3f, string pColor = "#F3961F");
```

| Parameter | Bedeutung | Standard |
| --- | --- | --- |
| `pText` | Entweder ein roher String oder ein Lokalisierungsschlüssel | Erforderlich |
| `pTranslate` | Ob `pText` durch `LocalizedTextManager.getText()` gejagt wird | `true` |
| `pPosition` | Bildschirmanker: `"center"`, `"top"`, `"bottom"` | `"center"` |
| `pTime` | Dauer in Sekunden, bevor es ausblendet | `3f` |
| `pColor` | Hex-Farbcode für den Text | `"#F3961F"` (orange) |

> [!WARNING] WorldTip übersetzt standardmäßig
> Weil `pTranslate` standardmäßig `true` ist, lässt `WorldTip.showNow("Something happened!")` das Spiel nach einem Lokalisierungsschlüssel namens `"Something happened!"` suchen. Es findet keinen, loggt einen Fehler über fehlende Übersetzung und zeigt rohen Platzhaltertext :PESgn_Oops:.
>
> Übergibst du wörtlichen englischen Text, setze **immer** `pTranslate: false`:
> ```csharp
> WorldTip.showNow("The Ancient Titan has awakened!", pTranslate: false, pColor: "#FF5555");
> ```
> Für lokalisierten Text übergib deinen Übersetzungsschlüssel und lass `pTranslate: true`:
> ```csharp
> WorldTip.showNow("hello_titan_awakened", pTranslate: true);
> ```

### Text in der unteren Symbolleiste

Willst du eine dezentere Nachricht direkt über der Gotteskräfte-Leiste - wie der Tooltip-Text beim Auswählen eines Pinsels - nutze `showToolbarText`:

```csharp
if (WorldTip.instance != null)
{
    WorldTip.instance.showToolbarText("Right-click to cancel");
}
```

Das zeichnet einen kleinen schwebenden Hinweis direkt über der aktiven Kraftleiste.

## Weltereignisse im WorldLog aufzeichnen

Das Weltprotokoll ist die dauerhafte Aufzeichnung, die Spieler im Verlaufsfenster öffnen. Einträge überleben Speichern und Laden und sind an die Chronologie der Welt gebunden.

Das Spiel stellt mehrere gebrauchsfertige statische Helfer auf `WorldLog` bereit:

```csharp
// Record an imperial succession:
WorldLog.logNewKing(kingdom);

// Record the founding of a new realm:
WorldLog.logNewKingdom(kingdom);

// Record a disaster event at a specific tile:
DisasterAsset earthquake = AssetManager.disasters.get("earthquake");
WorldTile centerTile = World.world.GetTile(100, 100);
WorldLog.logDisaster(earthquake, centerTile);
```

### Eigene Verlaufseinträge

Um ein eigenes Verlaufsereignis hinzuzufügen, baue eine `WorldLogMessage` mit einem `WorldLogAsset` aus `AssetManager.world_log`:

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

            // add() registers the entry with HistoryHud and writes it to the world log database:
            entry.add();
        }
    }
}
```

`entry.add()` fügt den Eintrag dem Verlaufs-HUD des laufenden Spiels hinzu und schreibt ihn über `DBInserter.insertLog` dauerhaft in die SQLite-Datenbank der Welt.

## Kartenbeschriftungen (nameplates_library)

Wenn Kartenebenen eingeschaltet sind, erscheinen Banner über Städten, Königreichen und Religionen. Diese werden von `AssetManager.nameplates_library` (`NameplateAsset`) verwaltet.

| Feld | Bedeutung |
| --- | --- |
| `id` | Bezeichner, passend zu einem `MetaType` |
| `path_sprite` | Sprite-Pfad für den Banner-Rahmen |
| `padding_left` / `padding_right` / `padding_top` | Textabstand-Grenzen |
| `map_mode` | Über welchem `MetaType` diese Beschriftung gezeichnet wird |

> [!WARNING] Ruf add() nicht für Vanilla-Kartenmodi auf
> Die Bibliothek erlaubt nur **eine** Beschriftung pro `MetaType`. Rufst du `AssetManager.nameplates_library.add(...)` für einen `MetaType` auf, der bereits existiert (wie Königreiche oder Städte), wirft das eine Exception :wbfacepalm:.
>
> Willst du Vanilla-Beschriftungen umskinnen oder umgestalten, schlag die bestehende mit `get()` nach und bearbeite ihre Felder:
> ```csharp
> NameplateAsset kingdomPlate = AssetManager.nameplates_library.get("kingdom");
> if (kingdomPlate != null)
> {
>     kingdomPlate.padding_left = 16;
> }
> ```

Weiter geht's mit **[Spieloptionen & Zeitskalen](#/nml/game-options)** für Spieleroptionen, oder **[Jeder Frame](#/nml/update-loops)**, um Logik auf einer Uhr laufen zu lassen.
