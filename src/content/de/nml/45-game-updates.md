---
title: Nach einem Spiel-Update aktualisieren
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbsettingsgear:
order: 47
---

# Nach einem Spiel-Update aktualisieren :wbsettingsgear:

WorldBox hat ein Update bekommen, und deine Mod steht rot in der Liste. Willkommen beim Modding, das passiert jedem und es wird wieder passieren :PES2_Shrug:.

Deine Mod ruft den eigenen Code des Spiels auf. Wenn die Entwickler eine Methode umbenennen, ein Feld verschieben oder ändern, was eine Methode annimmt, zeigt dein Code auf etwas, das es nicht mehr gibt. Das ist nicht unrettbar kaputt, nur veraltet. Diese Seite ist die Reihenfolge, in der ich das jedes Mal durchgehe.

## 1. Zuerst NML aktualisieren

Bevor du deinen eigenen Code anfasst, hol dir die neueste **`NeoModLoader.dll`** von der Seite **[NML installieren](#/install-nml)**. Ein großes Spiel-Update bringt meistens auch ein neues NML, und ein alter Loader auf einem neuen Spiel scheitert auf eine Art, die genau nach deinem Fehler aussieht.

Wenn NML selbst nicht lädt, bist du noch gar nicht bei deiner Mod. Schau dir **[das Spiel ist auf einer alten Version](#/troubleshooting)** in der Fehlerbehebung an und komm dann zurück.

## 2. Den ersten Fehler lesen

Starte das Spiel und öffne `Player.log` (wo es liegt: **[Logs & Debugging](#/nml/logs-and-debugging)**). Such den ersten Fehler deiner Mod und ignoriere vorerst alles darunter. Fehler ziehen weitere nach sich, und den ersten zu beheben lässt oft fünf andere verschwinden.

Nach einem Update siehst du meistens diese:

| Fehler | Was sich im Spiel geändert hat |
| --- | --- |
| `CS0117: 'X' does not contain a definition for 'Y'` | Ein Feld oder eine statische Methode wurde umbenannt oder entfernt |
| `CS1061: 'X' does not contain a definition for 'Y'` | Dasselbe, aber an einem Objekt: `actor.someMethod()` gibt es nicht mehr |
| `CS0246: The type or namespace name 'X' could not be found` | Eine ganze Klasse wurde umbenannt oder verschoben |
| `CS7036` / `CS1501` | Die Methode gibt es noch, aber sie nimmt jetzt andere Argumente |
| `CS0122: 'X' is inaccessible due to its protection level` | Etwas, das du benutzt, ist jetzt `internal`, siehe **[diesen Eintrag](#/troubleshooting)** |
| `CS0029` / `CS0266` | Ein Feld hat den Typ gewechselt, etwa von `int` zu `float` oder von einem String zu einem Asset |
| `HarmonyException` / `MissingMethodException` beim Start | Eine Methode, die du **patchst**, wurde umbenannt. Dein Code kompiliert, der Patch hat nichts, woran er hängen kann |

Die letzte ist die gemeine. Ein Patch, der seine Methode als einfachen String nennt, wie `"updateStats"`, wird erst beim Spielstart geprüft. Eine Umbenennung verhindert also nicht, dass deine Mod kompiliert, sie verhindert, dass sie funktioniert. Patches mit `nameof` bekommen stattdessen einen normalen Kompilierfehler, noch ein Grund, es zu benutzen, wo es geht (**[zwei Arten, den Methodennamen zu schreiben](#/nml/harmony-patches)**).

## 3. Den neuen Namen finden

Der alte Name ist weg, also such seinen Ersatz:

- **[Methodensuche](#/tools/methods)** auf dieser Seite. Tipp ein, was die Methode *gemacht* hat, nicht wie sie hieß: "add trait to unit" findet sie, auch wenn sich der Name geändert hat.
- **[Asset-Felder](#/tools/fields)** für Felder von Assets. Such nach dem Teil des Namens, an den du dich erinnerst.
- **dnSpy**, das immer recht hat, weil es das Spiel liest, das du wirklich hast. Die Suchwerkzeuge hier werden nach Updates neu gebaut, können einem frischen Update aber ein paar Tage hinterherhinken. Wie es geht: **[Den Code des Spiels lesen](#/toolbox/reading-the-game-code)**.

Der Trick, den ich am meisten benutze: Öffne das Vanilla-Asset oder die Methode, die denselben Job wie deine macht, und schau, wie **das Spiel selbst** es jetzt schreibt. Wenn das Spiel geändert hat, wie Merkmale (trait) gebaut werden, benutzen seine eigenen Merkmale schon den neuen Weg :PESgn_Noice:.

## 4. Deine Harmony-Patches von Hand prüfen

Ein Patch kann auch ganz ohne Fehler schiefgehen. Geh jeden einzeln durch und prüf die Methode in dnSpy:

- **Parameternamen.** Harmony füllt Parameter **nach Namen**. Wenn das Spiel `pDamage` in `pAmount` umbenannt hat, bekommt dein `float pDamage` stillschweigend nichts. Siehe **[die magischen Parameternamen](#/nml/harmony-patches)**.
- **Überladungen.** Eine Methode, die früher einzigartig war, hat jetzt vielleicht einen Zwilling, und dein Patch scheitert mit `Ambiguous match found`.
- **Was die Methode tut.** Manchmal bleibt der Name, aber die Logik wandert woandershin. Dein Patch läuft und nichts ändert sich. Setz eine `LogInfo`-Zeile in den Patch: Wenn sie nie erscheint, ruft das Spiel diese Methode nicht mehr auf.

## 5. Nach Dingen suchen, die nichts mehr tun

Wieder zu kompilieren ist nicht die Ziellinie. Lade eine Welt und prüf, dass jedes Teil noch funktioniert: Das Merkmal zeigt sein Icon, der Gegenstand (item) droppt, die Macht (GodPower) spawnt, was sie soll.

Ein neues Update kann ein Feld hinzufügen, das Vanilla-Assets jetzt ausfüllen und deine nicht. Das Asset lädt, kein Fehler, und es tut einfach nichts. Vergleich dein Asset Feld für Feld mit dem ähnlichsten Vanilla-Asset im `init()` seiner Bibliothek (library). Was das Spiel jetzt setzt und du nicht, ist dein Verdächtiger.

## 6. Auch einen alten Spielstand testen

Lade eine Welt, die **vor** dem Update gespeichert wurde, mit deiner Mod an. Eigene Daten an Einheiten (**[Dinge speichern](#/nml/saving-data)**) sollten so zurückkommen, wie sie waren. Wenn du beim Reparieren eine ID umbenannt hast, benutzen alte Spielstände noch die alte, also benenn nur um, wenn es wirklich sein muss.

## 7. Veröffentlichen

- Erhöhe `version` in `mod.json`.
- Schreib in Beschreibung und Changelog, mit welcher Spielversion es funktioniert, damit Spieler wissen, welche sie nehmen sollen.
- Lade die neue Zip genauso hoch wie vorher: **[Veröffentlichen](#/nml/publishing)**.

Dann beantworte die "ist das aktualisiert??"-Kommentare, das hast du dir verdient :wbsalut:.

## Damit das nächste Update weniger wehtut

- **Weniger patchen.** Jeder Harmony-Patch ist eine Stelle, die brechen kann. Wenn ein Asset-Feld oder eine NML-Funktion den Job erledigen kann, nimm das stattdessen.
- **Pack deinen Code in try/catch.** Eine kaputte Funktion schreibt einen Fehler ins Log, der Rest deiner Mod läuft weiter. Siehe **[Logs & Debugging](#/nml/logs-and-debugging)**.
- **Eine Patch-Klasse pro Aufgabe.** Wenn ein Patch bricht, fällt nur diese eine Funktion aus, nicht alle.
- **Halt deine IDs an einem Ort.** Konstanten wie `HelloTraits.SWIFT` bedeuten, dass eine Umbenennung eine Änderung ist, nicht zwanzig.
