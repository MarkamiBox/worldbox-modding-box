---
title: Die Live-Konsole (BepInEx)
group: Übersicht
subgroup: Externe Tools & Setup
icon: :wbvideo:
order: 5
---

# Die Live-Konsole :wbvideo:

Nach jedem einzelnen Test die `Player.log` mühsam im Editor zu öffnen, ist pure Qual. (Ich mach das ungelogen trotzdem manchmal :23062-durrr:). **BepInEx** spendiert dir ein schwarzes Konsolenfenster, das direkt während des Spielens mitloggt, sodass deine Logzeile genau in der Millisekunde auftaucht, in der dein Code sie ausführt.

Das ist eine Zehn-Minuten-Einrichtung, die du genau einmal machst und für den Rest deines Modder-Lebens behältst.

## Was BepInEx eigentlich ist

Ein Modloader, der sich vor dem Spielstart in Unity-Spiele einklinkt. WorldBox-Modder nutzen ihn im Grunde für zwei Dinge: die Live-Konsole und **UnityExplorer** (dazu gibt es eine eigene Seite). Wir sind hier zivilisierte NML-Leute, aber diese Konsole ist zu gut, um sie auszulassen :trollface:. NML kann ihn zwar automatisch nachinstallieren, wenn eine Mod danach verlangt, aber wenn du es selbst machst, behältst du die volle Kontrolle über die Einstellungen.

## So installierst du es

1. Scrolle auf der [offiziellen BepInEx-Releases-Seite](https://github.com/BepInEx/BepInEx/releases) zu **Assets** und schnapp dir die Datei namens `BepInEx_win_x64_5.4.x.x.zip`. Ganz genau dieses Format: **win**, **x64**, **5**. Die Varianten für `x86`, `unix`, `macos` sowie `BepInEx 6 / IL2CPP` sehen alle verlockend aus, funktionieren hier aber alle nicht :PES5_Dumb:.
2. Mache einen Rechtsklick auf die Zip-Datei → **Eigenschaften** → setze ein Häkchen bei **Zulassen**, falls vorhanden, und entpacke sie dann **direkt in deinen WorldBox-Ordner**, wo auch die `worldbox.exe` liegt (Standardpfad bei Steam: `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, oder Rechtsklick auf WorldBox in Steam → **Verwalten** → **Lokale Dateien durchsuchen**). Das Ergebnis sollte so aussehen:

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **Starte das Spiel einmal und schließe es wieder.** Dieser erste Start generiert die nötigen Konfigurationsdateien. Dass scheinbar nichts passiert, ist völlig normal :hmm:.

## Die Konsole aktivieren

Öffne `BepInEx/config/BepInEx.cfg` in einem beliebigen Texteditor, suche den Abschnitt `[Logging.Console]` und stelle Folgendes ein:

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

Starte das Spiel erneut. Neben dem Spielfenster öffnet sich ein zweites Fenster, das sofort munter drauflos loggt.

## Die Ausgabe lesen

Schon jetzt, noch ganz ohne eigene Mods, siehst du beim Starten von WorldBox, wie BepInEx und NeoModLoader hochfahren:

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

Wenn du diese Zeilen siehst, Glückwunsch: deine Live-Konsole läuft einwandfrei!

Später, wenn du deine erste Mod im Guide **[Deine erste Mod](#/nml/your-first-mod)** schreibst, siehst du dort direkt, wie deine Mod kompiliert wird und dich im Log begrüßt:

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

Drei Gewohnheiten, die die Konsole erst so richtig nützlich machen:

- **Gib jedem Log ein Präfix** mit deinem Mod-Namen, wie `[MeineMod]`, damit du deine eigenen Zeilen im Getümmel sofort wiederfindest.
- **Logge am Anfang und am Ende** jedes Setup-Schritts. Wenn du "registriere Traits..." siehst, aber niemals "Traits registriert", weißt du auf den Punkt genau, wo der Code abgeraucht ist.
- **Leg dir die Konsole auf einen zweiten Monitor** (oder die halbe Bildschirmseite). Zuzusehen, wie eine Zeile in derselben Sekunde aufploppt, in der du auf einen Button klickst, ist das schnellste Debugging überhaupt :memes:.

## Wie du sie nutzen wirst (Kurze Vorschau)

Sobald du deine Mod-Dateien in **[Deine erste Mod](#/nml/your-first-mod)** eingerichtet hast, kannst du Live-Logs einbauen, um Spielereignisse zu testen:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // Linke Maustaste, einmal pro Klick
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

Jeder Klick spuckt sofort eine Zeile in der Konsole aus. Genau diese unmittelbare Rückmeldung macht BepInEx so unentbehrlich!
