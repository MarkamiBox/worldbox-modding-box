---
title: Deine erste Mod
group: NML-Modding
subgroup: Basis-Workflow
icon: :wbchosen:
order: 22
---

# Deine erste Mod :wbchosen:

Alles in diesem Guide baut auf **einer einzigen Mod** auf. Wir starten sie hier, und jede spätere Seite fügt ihr genau eine Datei hinzu.

Am Ende besteht HelloBox aus rund vierzig Dateien, und du wirst jede einzelne Zeile selbst geschrieben haben: eine Akteurseigenschaft und eine Kultureigenschaft mit einem eigenen Reiter, eine Waffe samt Verzauberung, ein Statuseffekt, Beute-Drops, eine Wolke, ein Bodenfeld, ein Kochrezept, ein Projektil, ein Weltgesetz, eine göttliche Macht mit eigenem Button, ein Fenster, ein Einstellungsmenü, ein Gebäude, eine Fraktion, eine Kreatur, eine Katastrophe, eine eigene KI und ein Harmony-Patch, um eine Spielregel zu beugen, die das Spiel für unumstößlich hielt.

Das ist weit mehr, als irgendeine echte Mod jemals braucht - und genau das ist der Punkt. Du nimmst dir die zwei oder drei Teile heraus, die du wirklich haben willst, und löschst den Rest einfach :PES4_DeleteThis:.

Die Mod heißt **HelloBox**. Hauchen wir ihr Leben ein.

> [!NOTE] Noch nie zuvor Code geschrieben?
> Das macht überhaupt nichts. Lies dir die "Was diese Zeile tut"-Punkte unter jedem Block durch und kopiere den Code exakt. Programmieren besteht zu 90 % daraus, funktionierenden Code zu kopieren und immer nur eine Sache auf einmal zu ändern :PES2_Legit:.

> [!TIP] Oder nimm die Vorlage
> Wenn du die Dateien lieber nicht von Hand anlegst, nimm das leere Gerüst und spring zu Schritt 4. Die nächsten drei Schritte lohnen sich trotzdem: sie erklären, was drinsteckt.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">Leere Mod-Vorlage herunterladen</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code> und die Ordner, die NML sucht. Sonst nichts.</span>
>   </span>
> </a>

## 1. Erstelle den Ordner

Gehe in deinen WorldBox-Ordner (den mit der `worldbox.exe`), öffne `Mods/` und erstelle einen Ordner namens `HelloBox`. Darin erstellst du einen Unterordner namens `Code`.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- deine Mod
        ├── mod.json       <- der Ausweis (nächster Schritt)
        └── Code/          <- hier wohnen deine .cs-Dateien
```

## 2. Der Ausweis: mod.json

Erstelle eine Datei namens `mod.json` im Ordner `HelloBox/` und füge Folgendes ein. Ändere `author` zu deinem Namen:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** ist der Name, den Spieler in der Mod-Liste sehen.
- **`GUID`** ist eine eindeutige ID. Verwende `com.deinname.hellobox` und ändere sie nie wieder.

Ohne diese Datei tut NML so, als würde deine Mod gar nicht existieren :pepeno:.

> [!WARNING] Notepad wird versuchen, sie `mod.json.txt` zu nennen
> Stelle im Speichern-Dialog den **Dateityp** auf **Alle Dateien (*.*)** um, bevor du den Namen eingibst. Prüfe es danach im Explorer: Wenn du die Endung `.json` nicht sehen kannst, aktiviere **Ansicht → Dateinamenerweiterungen**, damit Windows aufhört, sie zu verstecken. Eine Datei namens `mod.json.txt` ist für NML unsichtbar - und dieser Fehler erwischt fast jeden mindestens einmal :PESgn_Oops:.

## 3. Der Code: Main.cs

Erstelle die Datei `Code/Main.cs` und füge diesen Code ein:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### Was jede Zeile tut

- **`using NeoModLoader.api;`**: "Ich möchte NMLs Werkzeuge in dieser Datei verwenden". Ohne diese Zeile weiß der Computer nicht, was `BasicMod` bedeutet.
- **`namespace HelloBox`**: Ein Nachname für deinen Code, damit deine `Main`-Klasse niemals mit der `Main` von jemand anderem kollidiert.
- **`public class Main : BasicMod<Main>`**: Deine Mod. Der Teil `: BasicMod<Main>` bedeutet: "Ich bin eine NML-Mod, gib mir all die praktischen Grundfunktionen" (Logging, Einstellungen, Übersetzungen).
- **`protected override void OnModLoad()`**: Die Tür, an die NML klopft, sobald das Spiel startet. Alles, was deine Mod initialisiert, gehört in diese geschweiften Klammern `{ }`.
- **`LogInfo(...)`**: Schreibt eine Zeile mit dem Namen deiner Mod ins Log. So findest du heraus, ob dein Code überhaupt ausgeführt wurde.

## 4. Starte das Spiel

Starte WorldBox und öffne das **Mods**-Fenster im Hauptmenü. **HelloBox** sollte in der Liste stehen und bereits eingeschaltet sein. Eine Mod, die du selbst in `Mods/` legst, wird aktiviert, sobald NML sie zum ersten Mal findet.

In diesem Fenster schaltest du eine Mod später auch wieder **aus**. Ein Klick auf das Icon schaltet sie um, und die meisten Mods merken das erst nach einem Neustart :PES4_AlrightThen:.

> [!WARNING] Gar kein Mods-Fenster? Der Experimentalmodus ist aus
> NML lädt Mods nur, wenn **Einstellungen -> Experimental Mode** an ist, und das Spiel **schaltet ihn nach jedem WorldBox-Update von selbst aus**: Es vergleicht die gespeicherte `last_used_version` mit der gerade gestarteten Version und setzt den Schalter bei einem Unterschied zurück auf `false`. "Meine Mod lief gestern noch und ich habe nichts geändert" ist also fast immer das. Schalte ihn wieder ein und starte neu.

> [!TIP] Gar nicht in der Liste?
> Dann hat NML sie nie gesehen. Neun von zehn Mal ist das `mod.json.txt` statt `mod.json`, oder der Ordner liegt woanders als in `worldbox\Mods/`. Die vollständige Liste steht unter **[Fehlerbehebung](#/troubleshooting)**.

## 5. Prüfe das Log

Deine Zeile sollte jetzt in der Logdatei stehen:

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

Um diese Datei zu finden, füge Folgendes in die Adressleiste des Windows Explorers ein:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

Öffne `Player.log` im Editor und drücke **Strg+F**, um nach `HelloBox` zu suchen.

Wenn du diese Zeile siehst: Glückwunsch, du bist jetzt offiziell ein Modder :PESgn_Congrats:. Wenn nicht, schau auf der Seite **[Logs & Debugging](#/nml/logs-and-debugging)** vorbei - genau für diesen Moment existiert sie.

## 6. Wie jede spätere Seite hier hineinpasst

Von hier an liefert dir jede Seite **eine neue Datei** in `Code/` und **eine neue Zeile** in `OnModLoad`. Das Muster bleibt immer exakt gleich:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // hinzugefügt durch die Seite "Eigene Traits"
    HelloItems.Initialize();    // hinzugefügt durch die Seite "Eigene Items"
    // ...und so weiter
}
```

Jede neue Datei sieht vom Aufbau her immer so aus:

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // der Code von der jeweiligen Seite kommt hierhin
        }
    }
}
```

> [!TIP] Immer eine Sache nach der anderen
> Füge eine Datei hinzu, starte das Spiel, prüfe das Log und gehe erst dann weiter. Wenn du fünf Dinge auf einmal einbaust und das Spiel abstürzt, hast du fünf Verdächtige. Wenn du nur eine Sache hinzufügst, hast du genau einen :aPES_Detect:.
