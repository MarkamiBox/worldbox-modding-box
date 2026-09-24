---
title: Logs & Debugging
group: NML-Modding
subgroup: Basis-Workflow
icon: :wbdebugburger:
order: 24
---

# Logs & Debugging :wbdebugburger:

Das Log ist das Einzige im gesamten Modding, das dir immer die Wahrheit sagt. Es beantwortet die eine Frage, die du dir tausendmal stellen wirst: **Wurde mein Code überhaupt ausgeführt?**

## Eine Zeile ausgeben

Es gibt zwei Wege, und beide landen in derselben Datei.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML: setzt deinen Mod-Namen automatisch davor
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity: hier musst du das Präfix selbst anfügen
        }
    }
}
```

Du nutzt kein `BasicMod`? `NeoModLoader.services.LogService` bietet dieselben Methoden `LogInfo`, `LogWarning`, `LogError` sowie `LogStackTraceAsError` für den kompletten Stacktrace.

## Wie ein gesundes Log aussieht

Starte das Spiel mit der obigen Mod und suche in `Player.log` nach `HelloBox`. Du solltest etwas wie das hier sehen:

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

Zeile für Zeile: NML hat die Dateien in `Code/` kompiliert, deine Ressourcen (resource) geladen und dann an `OnModLoad` angeklopft, was deine Zeile ausgegeben hat. Die nummerierten Zeilen sind NMLs Zeitmessung für jeden Schritt: Die Zahl nach `=` sind Sekunden, und manche davon erscheinen rot im Log. **Rot bedeutet hier nicht kaputt**, sondern lediglich, dass dieser Schritt der langsamste war :hmm:.

Die Zeile, die wirklich zählt, ist deine eigene. Wenn `[HelloBox]: HelloBox is alive!` fehlt, lies weiter.

## Wenn dein Code nicht kompiliert

Bevor deine Mod überhaupt starten kann, muss NML sie kompilieren. Ein Tippfehler stoppt den Vorgang sofort, und NML sagt dir ganz genau, wo:

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

Lies es von rechts nach links: **`; expected`** ist das Problem, **`(9,42)`** bedeutet Zeile 9, Zeichen 42, und **`Code\Main.cs`** ist die betroffene Datei. Öffne die Datei, gehe zu dieser Zeile und setze das Semikolon.

Die entscheidende Information steht in der **ersten** Zeile. `Failed to compile mod HelloBox` darunter ist nur die Zusammenfassung. Viele lesen nur die Zusammenfassung, geraten in Panik und übersehen die Lösung direkt darüber :PES4_1IQ:.

## Wie ein fehlerhaftes Log aussieht

Sobald der Code kompiliert, wirst du häufig diesem Fehler begegnen :PES2_F::

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

Sieht beängstigend aus, ist aber ein einfacher Satz:

- **`NullReferenceException`**: Du hast auf etwas zugegriffen, das leer (`null`) war. 95 % aller Fehler, die du jemals haben wirst.
- **`at HelloBox.HelloTraits.Initialize ()`**: Die Methode, in der es passiert ist.
- **`in HelloTraits.cs:24`**: **Zeile 24 in deiner eigenen Datei**. Schau dir diese Zeile an. Irgendetwas darauf ist `null`.
- Die Zeilen darunter zeigen den Aufrufstapel (Callstack), die neuesten Aufrufe zuerst. Konzentriere dich auf die Dateinamen deiner eigenen Mod.

Der Klassiker für genau diesen Fehler: Der Zugriff auf `base_stats` eines Assets, bevor es der entsprechenden Bibliothek (library) hinzugefügt wurde. Details dazu auf der Seite **[Eigene Traits](#/nml/custom-traits)**.

## Wo die Logs liegen

| Datei | Pfad | Bedeutung |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Aktuelle Spielsitzung |
| `Player-prev.log` | gleicher Ordner | Die **vorherige** Sitzung - diejenige, die gerade abgestürzt ist :aPES_Flatline: |
| `logs/error_*.log` | gleicher Ordner, unter `logs/` | Eine Datei pro abgefangenem Spielfehler |
| `mods_config/<GUID>.config` | gleicher Ordner | Die gespeicherten Spieleinstellungen für deine Mod |

Füge `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` in die Adressleiste des Windows Explorers ein, um direkt dorthin zu gelangen.

## Eine Live-Konsole statt einer Logdatei

Eine Textdatei nach dem Absturz zu öffnen ist mühsam. Mit **BepInEx** erhältst du ein schwarzes Konsolenfenster, das während des Spielens live mitläuft. So siehst du deine Logzeile in derselben Sekunde, in der du auf einen Button klickst. Die Einrichtung dauert zwei Minuten: **[BepInEx-Konsole](#/toolbox/bepinex-console)**.

Möchtest du die Fenster des Spiels anklicken und ihre Werte live auslesen? Dafür gibt es **[UnityExplorer](#/toolbox/unity-explorer)**.

## Lass einen Fehler nicht die ganze Mod lahmlegen

`OnModLoad` wird von oben nach unten abgearbeitet. Wenn Zeile 3 eine Exception wirft, werden die Zeilen 4 bis 20 niemals ausgeführt - und die Hälfte deiner Mod existiert einfach nicht. Gib jedem Bereich sein eigenes Sicherheitsnetz:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// Führt einen Schritt aus. Wenn er explodiert, wird der Name geloggt und es geht trotzdem weiter.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

Nun kostet dich eine fehlerhafte Eigenschaft (trait) nur genau diese Eigenschaft, nicht die gesamte Mod, und das Log nennt dir den schuldigen Schritt beim Namen:

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## Berühre die Spielwelt nicht vor ihrer Entstehung

`OnModLoad` läuft ab, **bevor** eine Welt existiert. Keine Karte, keine Einheiten, gar nichts. Wenn du hier versuchst, darauf zuzugreifen, stürzt das Spiel noch vor dem Hauptmenü ab :surprised_pikachu:. Alles, was pro Frame ausgeführt wird, braucht eine Absicherung:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // noch im Menü
    if (World.world == null || World.world.units == null) return;  // noch keine Welt da
    if (MapBox.instance == null) return;

    // ab hier ist der Zugriff auf die Welt sicher
}
```

## Code neu laden ohne Neustart

WorldBox jedes Mal neu zu starten, nur um eine geänderte Zeile zu testen, macht den Großteil des Zeitaufwands beim Modding aus. Frag jemanden, der das an einem Abend vierzigmal gemacht hat. NML kann deine Mod während des laufenden Spiels neu kompilieren und die markierten Methoden austauschen.

1. Deine Hauptklasse implementiert `IReloadable`, was eine einzige Methode `Reload()` erfordert. Die von HelloBox tut das in **[Die fertige Mod](#/nml/all-together)**.
2. Im aktiven Mod-Menü von NML erscheint der Reload-Button automatisch für jede Mod, die `IReloadable` implementiert. (Die ältere Mod-Liste brauchte `Config.isEditor = true`, um ihren Button einzublenden, aber im Hauptmenü musst du diesen Umweg nicht mehr gehen.)
3. Markiere die Methoden, die ausgetauscht werden sollen, mit `[Hotfixable]` aus `NeoModLoader.api.attributes`:

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // bearbeite dies bei laufendem Spiel, drücke auf Neu laden und sieh zu, wie die nächste Kreatur es nutzt
}
```

Ändere dann die Methode, speichere und drücke in NMLs Mod-Liste auf den Reload-Button deiner Mod. NML kompiliert neu, patcht die markierten Methoden und ruft `Reload()` auf. Alles, was nicht markiert ist, führt weiterhin den alten Code aus.

> [!NOTE] Falls du jemals `Config.isEditor` umschaltest
> `Config.isEditor` ist der interne Unity-Schalter des Spiels. Schaltest du ihn manuell ein, glaubt WorldBox, es laufe im Unity-Editor, und manche UI wechselt ins Mobil-Layout. Mit `IReloadable` im modernen NML brauchst du ihn nicht, also lass ihn in Ruhe.

Was es nicht kann: `Awake`, `Update` und andere Unity-Callbacks, Konstruktoren und alles, was das Spiel bereits aus deinem alten Code aufgebaut hat. Ein beim Laden registriertes Asset behält die ihm damals übergebenen Delegates – `Reload()` ist der Ort, an dem du diese bei Bedarf manuell neu setzt.

## Die Fehler, die jeder Neuling macht

| Was du siehst | Was es bedeutet |
| --- | --- |
| Mod taucht nicht in der Liste auf | Keine `mod.json` vorhanden oder ungültiges JSON (ein Komma zu viel :pepeclown:) |
| Mod wird gelistet, nichts passiert | `OnModLoad` hat einen Fehler geworfen. Durchsuche das Log nach deinem Präfix und nach `Exception` |
| `Failed to compile mod ...` | Ein Tippfehler im C#-Code. Der eigentliche Fehler steht eine Zeile **darüber** |
| `NullReferenceException` bei neuem Asset | Du hast auf `base_stats` vor dem `add()` zugegriffen - erst die Library initialisiert es |
| Text erscheint als `trait_whatever` | Fehlende Übersetzung, siehe **[Lokalisierung](#/nml/localization)** |
| Dein Button ist ein unsichtbares Loch | Der Sprite-Pfad ist falsch, das Icon ist `null` |
| Funktioniert bei dir, aber sonst bei niemandem | Du hast einen absoluten Pfad mit deinem Windows-Benutzernamen fest einprogrammiert :homerhide: |
