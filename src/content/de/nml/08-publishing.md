---
title: Mod veröffentlichen
group: NML-Modding
subgroup: Erweitert & Veröffentlichung
icon: :wbfireworks:
order: 46
---

# Mod veröffentlichen :wbfireworks:

Deine Mod funktioniert. Jetzt lass andere Leute sie kaputtmachen.

Es gibt zwei Orte, an denen eine WorldBox-Mod existieren kann, und sie werden nicht gleichermaßen genutzt:

| | |
| --- | --- |
| **[GameBanana](https://gamebanana.com/games/11196)** | Wo die WorldBox-Modding-Szene wirklich stattfindet. Jeder kann von dort herunterladen, auch Spieler, die das Spiel abseits von Steam gekauft haben |
| **Steam Workshop** | In NML integriert, aber mit deutlich weniger Mods |

Veröffentliche auf GameBanana. Spiegel es danach auf den Workshop, wenn dir danach ist.

## Den Mod packen

Ein GameBanana-Upload ist ein **Zip deines Mod-Ordners**, mehr nicht. Der Ordner innerhalb der Zip-Datei muss derjenige sein, der die `mod.json` enthält:

```text HelloBox.zip
HelloBox/
├── mod.json
├── icon.png
├── default_config.json
├── Locales/
├── GameResources/
└── Code/
```

Kein Zip des *Inhalts*. Ein Zip des *Ordners*. Jemand, der das Archiv in sein `Mods/`-Verzeichnis entpackt, sollte bei `Mods/HelloBox/mod.json` landen. Wenn er stattdessen `Mods/mod.json` erhält, wird er posten, dass deine Mod nicht lädt :PES_Facepalm:.

**Lass alles weg**, was zum Ausführen nicht gebraucht wird: `.git/`, `bin/`, `obj/`, `.vs/`, deine `.sln`, deine Notizen. Wenn du eine vorkompilierte `.dll` mitlieferst, liefere sie *anstelle von* `Code/` aus, nicht neben einer veralteten Kopie des Quellcodes.

## Auf GameBanana hochladen

1. Erstelle ein Konto und gehe zur **[WorldBox-Spieleseite](https://gamebanana.com/games/11196)**.
2. **Add → Mod**.
3. Fülle Name, Beschreibung und Kategorie aus. Die Kategorie ist wichtiger als du denkst: Über sie finden dich die Leute überhaupt.
4. Lade die Zip-Datei hoch und lade mindestens einen Screenshot hoch, **auf dem die Mod im Spiel etwas tut**. Nicht dein Icon, nicht die Modliste.
5. Beschreibe klar: was die Mod hinzufügt, dass sie **NeoModLoader** benötigt und mit welchen Mods sie in Konflikt steht.

Spätere Updates machst du auf derselben Seite mit **Edit → Files**. Füge die neue Zip hinzu, schreibe eine Changelog-Zeile und erhöhe die `version` in der `mod.json` entsprechend. Die GameBanana-Version und die Version in der `mod.json` synchron zu halten kostet nichts und erspart jede "Welche Version habe ich"-Frage.

> [!TIP] Ein Screenshot bewirkt mehr als ein Absatz
> Die Leute entscheiden nach dem Vorschaubild. Ein einziges klares In-Game-Bild von dem, was deine Mod hinzufügt, bringt dir mehr als die am besten geschriebene Beschreibung der Seite :PES_Camera:.

## Der Weg über den Steam Workshop

Das Hochladen in den Workshop geschieht **im Spiel**, und die Art und Weise, wie du das Upload-Fenster öffnest, ist das verfluchteste Stück Benutzeroberfläche in diesem Hobby :kekw:.

1. Öffne das **Mods**-Fenster im Spiel.
2. Klicke genau **achtmal** auf das **Icon** deiner Mod, mit weniger als einer Sekunde Abstand zwischen den Klicks.
3. Warte etwa drei Sekunden.
4. Das Upload-Fenster erscheint.

Wenn nichts passiert, hast du zu langsam geklickt oder die Zeile statt des Icons getroffen.

| Feld | Was hineingehört |
| --- | --- |
| Oberes Feld (`fileID`) | **Beim ersten Mal leer lassen**. Bei Updates fügst du die ID aus deiner Workshop-URL ein |
| Unteres Feld | Das Changelog. Kann leer sein, später auf der Workshop-Seite editierbar |

Das ist der ganze Unterschied zwischen Veröffentlichen und Aktualisieren: Eine leere `fileID` erstellt einen neuen Eintrag, eine ausgefüllte ersetzt einen bestehenden.

### Authentifizierung beim ersten Mal

Beim Hochladen einer neuen Mod in den Workshop wirst du nach einer Authentifizierung gefragt. Es gibt drei Wege:

- **Discord**: Hole dir die `Modder`-Rolle auf dem offiziellen WorldBox-Discord, indem du einen Admin fragst.
- **GitHub**: Tritt der `WorldBoxOpenMods`-Organisation bei. Schreibe ihnen eine E-Mail mit dem Betreff "WorldBoxOpenMods", deinem GitHub-Benutzernamen und deiner Mod und warte bis zu einer Woche.
- **Überspringen**: Deine Mod wird mit dem Tag `Unverified Mods` hochgeladen. Sie funktioniert, ist aber weniger sichtbar.

## Bevor du hochlädst, auf beiden Plattformen

- **`mod.json` ist dein Schaufenster.** `name`, `author`, `version`, `description` sind das, was die Leute lesen. Erhöhe `version` bei jedem Release und **ändere niemals deine `GUID`** nach dem ersten Upload: Sie ist die Identität deiner Mod, die Einstellungsdatei des Spielers ist nach ihr benannt und andere Mods hängen vielleicht davon ab.
- **`icon.png` existiert und sieht nach etwas aus.** Auf dem Workshop ist es außerdem das Ding, auf das man achtmal klicken muss, mach es also wenigstens ansehnlich.
- **Deine Mod muss in jedem Ordner funktionieren.** Schreibe niemals feste Pfade wie `C:\Users\DeinName\...`. Verwende `GetDeclaration().FolderPath`. Das ist der häufigste Grund, warum eine Mod beim Autor funktioniert und bei niemand anderem :PES2_Bruh:.
- **Lies dein eigenes Log einmal sauber durch.** Starte das Spiel, lade eine Welt, spiele zwei Minuten, durchsuche `Player.log` nach deinem Präfix und nach `Exception`. Liefere null davon aus.
- **Teste mit gelöschter Konfigurationsdatei.** Lösche `mods_config/<GUID>.config`, damit du die Standardeinstellungen testest, die ein neuer Spieler tatsächlich erhält.
- **Teste mit anderen aktiven Mods.** Wenn du etwas patchst, patcht jemand anderes das wahrscheinlich auch.
- **Teste mit einem frischen Spielstand.** Assets, die du registrierst, müssen existieren, bevor ein Spielstand geladen wird, der darauf verweist.

## Dependencies

Wenn deine Mod eine andere benötigt, deklariere sie, anstatt bei einem fehlenden Typ abzustürzen:

```json mod.json
{
  "Dependencies": ["com.otherperson.coolmod"],
  "OptionalDependencies": ["com.someone.niceextra"],
  "IncompatibleWith": ["com.someone.rivalmod"]
}
```

NML kümmert sich um die Ladereihenfolge und warnt den Spieler, was viel angenehmer ist als eine NullReferenceException in Zeile eins.

## Nach der Veröffentlichung

Die Kommentare werden exakt drei Arten von Nachrichten enthalten: "funktioniert nicht" ohne angehängtes Log, eine wirklich großartige Idee, an die du nicht gedacht hast, und jemand, der nach Multiplayer fragt :PESgn_DidIAsk:.

Antworte auf die zweite. Für die erste pinne einen Hinweis an, der den Leuten erklärt, wo `Player.log` liegt (siehe **[Logs & Debugging](#/nml/logs-and-debugging)**), denn ein Fehlerbericht ohne Log ist ein Fehlerbericht, auf den du nicht reagieren kannst.

Und willkommen. Jede neue Mod macht diese kleine Community ein bisschen weniger zum Friedhof, und fünf in einer Woche sind das goldene Zeitalter des Moddings :PES5_CrazyPog:.
