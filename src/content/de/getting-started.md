---
title: Erste Schritte
group: Übersicht
icon: :wbsalut:
order: 3
---

# Erste Schritte :wbsalut:

Alles, was du brauchst, bevor du deine erste Zeile Code schreibst. Arbeite die Schritte der Reihe nach ab – es dauert etwa fünfzehn Minuten.

> [!NOTE] Du musst noch nicht programmieren können
> Und du brauchst **weder** Visual Studio noch einen Compiler oder ähnliches. NML liest die `.cs`-Dateien in deinem Mod-Ordner und kompiliert sie bei Bedarf automatisch für dich. **Der normale Windows-Editor (Notepad) reicht für deine erste Mod völlig aus** :PES_OkHand:. Bessere Werkzeuge kannst du dir später holen, sobald du etwas vermisst.

## 1. Finde deinen WorldBox-Ordner

In diesem Guide wirst du etwa vierzig Mal aufgefordert, Dateien "in den WorldBox-Ordner" zu legen. Finde ihn also am besten gleich jetzt:

**Steam → Rechtsklick auf WorldBox → Verwalten → Lokale Dateien durchsuchen.**

Ein Explorer-Fenster öffnet sich in dem Ordner, der `worldbox.exe` enthält. Auf den meisten PCs ist das:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Lass dieses Fenster geöffnet oder hefte es irgendwo an. Wann immer dieser Guide vom *WorldBox-Ordner* spricht, ist genau dieser gemeint :gatoxd:.

## 2. Aktiviere den Experimentellen Modus

Ohne ihn laden Mods überhaupt nicht. Nicht etwa "schlecht", sondern gar nicht: keine Fehlermeldung, nichts.

Im Spiel: Öffne die **Einstellungen**, suche den **Experimentellen Modus** und schalte ihn ein. Prüfe dies nach jedem Spiel-Update erneut: Das Spiel schaltet ihn bei Versionswechseln gerne eigenmächtig wieder aus.

## 3. Installiere NeoModLoader

**NML** ist das Programm, das deine Mod findet, kompiliert und ausführt. Ohne NML gibt es kein Modding. Noch nie gemacht? In **[NML installieren](#/install-nml)** ist jeder einzelne Klick beschrieben, Mac inklusive.

1. Lade die neueste `NeoModLoader.dll` von der [NML-Release-Seite](https://github.com/WorldBoxOpenMods/ModLoader/releases) herunter. Eine einzige Datei, mehr brauchst du nicht.
2. Gehe in deinem WorldBox-Ordner in das Verzeichnis `worldbox_Data\StreamingAssets\Mods/`.
3. Lege `NeoModLoader.dll` dort ab.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- hier
```

Starte das Spiel. Wenn es geklappt hat, siehst du unten in den Leisten einen neuen Button mit dem NML-Logo und einen leeren `Mods`-Ordner neben der `worldbox.exe`. Falls nicht, prüfe Schritt 2 erneut :PES5_Hmmmm:.

> [!TIP] Lass Steam für Updates sorgen
> Es gibt auch ein [NML-Objekt im Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469). Das Abonnieren installiert NML zwar nicht von allein, hält deine Kopie aber nach der obigen manuellen Installation automatisch aktuell.

## 4. Ein Texteditor

Alles, was reinen Text speichert, funktioniert. Grob sortiert nach "nice to have":

| | |
| --- | --- |
| **Notepad** | Bereits auf deinem PC vorinstalliert. Für deine erste Mod völlig ausreichend |
| **[VS Code](https://code.visualstudio.com/)** | Kostenlos, schlank, hebt Code farblich hervor und weist auf Tippfehler hin. Für die meisten die optimale Wahl |
| **Visual Studio** | Das Schwergewicht. Vervollständigt Spielmethoden automatisch, wenn du es mit der `.dll` des Spiels verknüpfst. Vorerst überdimensioniert, bis du sehr viel schreibst |

Egal, was du wählst: Wenn du eine `.cs`-Datei speicherst, achte darauf, dass sie wirklich als `.cs` und **nicht** als `.cs.txt` gespeichert wird. Notepad spielt Leuten gerne diesen Streich :PESgn_SMH:.

## 5. Das war's – fang an zu bauen!

Gehe zu **[Mod-Struktur](#/nml/mod-structure)** im Bereich NML-Modding, und danach zu **[Deine erste Mod](#/nml/your-first-mod)** :gatoxd: !

---

## Dinge, die du später installierst, nicht jetzt

Du brauchst diese Tools **nicht**, um eine Mod zu schreiben. Komm erst hierher zurück, wenn eine Seite es dir empfiehlt.

- **[Die Live-Konsole (BepInEx)](#/toolbox/bepinex-console)**: Ein schwarzes Konsolenfenster, das deine Log-Zeilen live beim Spielen ausgibt, anstatt dass du nachträglich ein Logfile öffnen musst. Hole dir dieses Tool recht früh, es spart echte Zeit.
- **[UnityExplorer](#/toolbox/unity-explorer)**: Klicke beliebige Objekte im Spiel an und sieh dir an, woraus sie bestehen.
- **[dnSpy oder ILSpy](#/toolbox/reading-the-game-code)**: Öffnet den Originalcode des Spiels, damit du nachlesen kannst, wie die Entwickler bestimmte Dinge gelöst haben.
- **[AssetRipper](#/toolbox/getting-the-sprites)**: Extrahiert Sprites und Sounds aus dem Spiel, damit du dich an den originalen Stil anpassen kannst.
- **[Modding mit BepInEx](#/toolbox/bepinex-modding)**: vorkompilierte `.dll`-Plugins bauen, wenn du Low-Level-Hooks in die Unity-Engine willst statt NML-Inhalten.

> [!NOTE] Ältere NCMS-Mods lesen
> NML enthält eine NCMS-Kompatibilitätsschicht, inklusive Unterstützung für den alten `[ModEntry]`-Einstiegspunkt. Das repariert aber keine Aufrufe von Spiel-APIs, die sich geändert haben. Teste eine ältere Mod gegen deine Spiel- und NML-Version, bevor du dich darauf verlässt. Starte HelloBox mit `BasicMod<Main>`, wie es dieser Guide tut.

Weiter geht's mit **[Mod-Struktur](#/nml/mod-structure)**.
