---
title: Fehlerbehebung
group: Übersicht
icon: :wbfractured:
order: 4
---

# Fehlerbehebung :wbfractured:

Finde dein Symptom in der Tabelle, klicke darauf, lies drei Zeilen. Das ist die ganze Seite :aPES2_ThumbsUp:.

> [!TIP] Das Log beantwortet das meiste schneller als ich
> In neun von zehn Fällen steht die Antwort bereits in `Player.log`. **[Logs & Debugging](#/nml/logs-and-debugging)** zeigt dir, wo es liegt und wie du Abstürze liest.

## Finde dein Symptom

**Mods nutzen (nicht selbst erstellen)**

| Symptom | |
| --- | --- |
| Roter Text überflutet Bildschirm, `Missing className: NeoModLoader (1).WorldBoxMod` | [springen](#roter-text-überflutet-bildschirm-missing-classname) |
| NML lief, Spiel geupdatet, jetzt sind Mods rot oder "failed" | [springen](#mods-sind-rot-oder-failed-nach-einem-spiel-update) |
| Spiel ist auf alter Version und NML lädt nicht | [springen](#das-spiel-ist-auf-einer-alten-version) |
| Spiel wurde langsam oder friert mit Mods ein | [springen](#das-spiel-wurde-langsam-oder-friert-mit-mods-ein) |
| Eine Welt lädt nicht mehr | [springen](#eine-welt-lädt-nicht-mehr) |
| BepInEx-Mod ist installiert, zeigt aber nichts | [springen](#bepinex-mod-ist-installiert-und-zeigt-nichts) |
| Mod gelöscht, aber sie ist immer noch da | [springen](#du-hast-eine-mod-gelöscht-und-sie-ist-immer-noch-da) |
| Das Spiel startet überhaupt nicht | [springen](#das-spiel-startet-überhaupt-nicht) |

**Nichts lädt**

| Symptom | |
| --- | --- |
| Kein Mods-Button im Menü | [springen](#kein-mods-button-im-menü) |
| Mods-Fenster leer, funktionierte vorher | [springen](#mods-fenster-leer-funktionierte-vorher) |
| Mod-Ordner vorhanden, aber Mod fehlt in der Liste | [springen](#mod-ordner-vorhanden-aber-mod-fehlt-in-der-liste) |
| Die Mod ist ausgegraut | [springen](#die-mod-ist-ausgegraut) |
| "Compile failed" und der Fehler ergibt keinen Sinn | [springen](#compile-failed-und-der-fehler-ergibt-keinen-sinn) |
| Fehler in Zeile 1 einer frisch eingefügten Datei | [springen](#fehler-in-zeile-1-einer-frisch-eingefügten-datei) |
| Code bearbeitet, aber im Spiel ändert sich nichts | [springen](#code-bearbeitet-aber-im-spiel-ändert-sich-nichts) |
| Notepad speichert nicht im Spielordner | [springen](#notepad-speichert-nicht-im-spielordner) |
| Deine Änderungen kommen nie an, auch nicht nach einem Neustart | [springen](#deine-änderungen-kommen-nie-an-auch-nicht-nach-einem-neustart) |

**Lädt, aber nichts erscheint**

| Symptom | |
| --- | --- |
| Absturz in der Zeile, in der ein Stat gesetzt wird | [springen](#absturz-in-der-zeile-in-der-ein-stat-gesetzt-wird) |
| Gleicher Absturz, obwohl die Reihenfolge stimmt | [springen](#gleicher-absturz-obwohl-die-reihenfolge-stimmt) |
| Gebäude (building) stirbt sofort oder hat keine Größe | [springen](#gebäude-stirbt-sofort-oder-hat-keine-größe) |
| Registriert, aber in keinem Tab sichtbar | [springen](#registriert-aber-in-keinem-tab-sichtbar) |
| Zeigt `trait_hello_swift` statt eines Namens | [springen](#zeigt-trait-hello-swift-statt-eines-namens) |
| Namen klappen bei Traits, aber nicht bei Items, Status, Kräften | [springen](#namen-klappen-bei-traits-aber-nicht-bei-items-status-kräften) |
| Das Icon ist ein leeres Loch | [springen](#das-icon-ist-ein-leeres-loch) |
| Ein Button nimmt Platz ein, zeichnet aber nichts | [springen](#ein-button-nimmt-platz-ein-zeichnet-aber-nichts) |
| Statuseffekt zeichnet kein Sprite auf der Einheit | [springen](#statuseffekt-zeichnet-kein-sprite-auf-der-einheit) |
| Buttons stapeln sich übereinander | [springen](#buttons-stapeln-sich-übereinander) |
| Button ist da, aber Klick aktiviert nichts | [springen](#button-ist-da-aber-klick-aktiviert-nichts) |
| `addOpposite` / `addDecision` / `addSpell` bewirken nichts | [springen](#addopposite-adddecision-addspell-bewirken-nichts) |

**Registriert, dann kaputt in der Welt**

| Symptom | |
| --- | --- |
| Deine Kreatur wirft einen Schattenfehler | [springen](#deine-kreatur-wirft-einen-schattenfehler) |
| Dein Merkmal (trait), Item oder deine Kreatur bleibt gesperrt | [springen](#dein-merkmal-item-oder-deine-kreatur-bleibt-gesperrt) |
| Das Spiel stürzt beim Laden deiner Waffe oder deines Essens ab | [springen](#das-spiel-stürzt-beim-laden-deiner-waffe-oder-deines-essens-ab) |
| Eine Wolke (cloud) stürzt ab, sobald sie erscheint | [springen](#eine-wolke-stürzt-ab-sobald-sie-erscheint) |
| Dein Gebäude zu platzieren wirft Index was out of range | [springen](#dein-gebäude-zu-platzieren-wirft-index-was-out-of-range) |
| Dein Gebäude wirft in jedem Frame, in dem es zu sehen ist | [springen](#dein-gebäude-wirft-in-jedem-frame-in-dem-es-zu-sehen-ist) |
| Die Minimap wirft, sobald dein Gebäude existiert | [springen](#die-minimap-wirft-sobald-dein-gebäude-existiert) |
| Dein Tile malt, dann wirft der Karten-Renderer | [springen](#dein-tile-malt-dann-wirft-der-karten-renderer) |
| Ein Tier auf deinem Tile spawnen stürzt ab | [springen](#ein-tier-auf-deinem-tile-spawnen-stürzt-ab) |
| Drops fallen unsichtbar, oder ein Projektil (projectile) wirft | [springen](#drops-fallen-unsichtbar-oder-ein-projektil-wirft) |
| Das Log füllt sich mit ArgumentNullException von Projektilen | [springen](#das-log-füllt-sich-mit-argumentnullexception-von-projektilen) |
| Dein Kräfte-Tab erscheint nie | [springen](#dein-kräfte-tab-erscheint-nie) |
| Das Einstellungsfenster zeigt rohe Ids | [springen](#das-einstellungsfenster-zeigt-rohe-ids) |
| Die Welt wirft in jedem Frame Fehler, nachdem du ein Weltverhalten hinzugefügt hast | [Sprung](#die-welt-wirft-in-jedem-frame-fehler-nachdem-du-ein-weltverhalten-hinzugefügt-hast) |
| Eine Katastrophe (disaster) stürzt ab, wenn sie in das Weltprotokoll schreibt | [Sprung](#eine-katastrophe-stürzt-ab-wenn-sie-in-das-weltprotokoll-schreibt) |
| Eine Katastrophe ohne Action stürzt ab, sobald sie ausgewählt wird | [Sprung](#eine-katastrophe-ohne-action-stürzt-ab-sobald-sie-ausgewählt-wird) |
| Der erste Herrscher, der deinen Plan (plot) prüft, stürzt ab | [Sprung](#der-erste-herrscher-der-deinen-plan-prüft-stürzt-ab) |
| Deine Entscheidung (decision), dein Plan, dein Gen oder deine Waffe existiert, wird aber nie genutzt | [Sprung](#deine-entscheidung-dein-plan-dein-gen-oder-deine-waffe-existiert-wird-aber-nie-genutzt) |

**Kompiliert bei dir, aber nicht bei anderen**

| Symptom | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [springen](#cs0122-inaccessible-due-to-its-protection-level) |
| Funktioniert auf deinem PC, macht nichts bei anderen | [springen](#funktioniert-auf-deinem-pc-macht-nichts-bei-anderen) |

**Funktioniert zuerst, bricht später ab**

| Symptom | |
| --- | --- |
| Eine andere Mod überschreibt still deine Inhalte | [springen](#eine-andere-mod-überschreibt-still-deine-inhalte) |
| Absturz bei `World.world` während des Mod-Ladens | [springen](#absturz-bei-world-world-während-des-mod-ladens) |
| Deine Daten steuern plötzlich falsche Kreaturen | [springen](#deine-daten-steuern-plötzlich-falsche-kreaturen) |
| Nach Speichern/Laden ist alles weg | [springen](#nach-speichern-laden-ist-alles-weg) |
| Einheiten frieren gruppenweise ein | [springen](#einheiten-frieren-gruppenweise-ein) |
| Die Hälfte deiner Harmony-Patches wurde nie angewendet | [springen](#die-hälfte-deiner-harmony-patches-wurde-nie-angewendet) |
| Dein `updateStats`-Patch stürzt bei anderen Spielern ab | [springen](#dein-updatestats-patch-stürzt-bei-anderen-spielern-ab) |
| `getHit` gepatcht, aber Gebäude nehmen weiter Schaden | [springen](#gethit-gepatcht-aber-gebäude-nehmen-weiter-schaden) |
| Dein Prefix hat drei andere Mods beschädigt | [springen](#dein-prefix-hat-drei-andere-mods-beschädigt) |
| Einheit steht für immer still oder stürzt jeden Frame ab | [springen](#einheit-steht-für-immer-still-oder-stürzt-jeden-frame-ab) |
| Deine benutzerdefinierte KI wird heimlich zurückgesetzt | [springen](#deine-benutzerdefinierte-ki-wird-heimlich-zurückgesetzt) |
| Das Spiel ruckelt viermal pro Sekunde | [springen](#das-spiel-ruckelt-viermal-pro-sekunde) |
| Klicks landen auf der Karte hinter deinem Fenster | [springen](#klicks-landen-auf-der-karte-hinter-deinem-fenster) |
| Speicherverbrauch steigt bei jedem Öffnen des Panels | [springen](#speicherverbrauch-steigt-bei-jedem-öffnen-des-panels) |
| Neuer Standardwert erreicht bestehende Spieler nicht | [springen](#neuer-standardwert-erreicht-bestehende-spieler-nicht) |
| Einstellungs-Slider bewegt sich, aber Callback läuft nie | [springen](#einstellungs-slider-bewegt-sich-aber-callback-läuft-nie) |

## Mods nutzen

Diese Gruppe ist für Leute, die mit Mods spielen, nicht für Modder. Alles danach setzt voraus, dass du selbst den Code schreibst.

### Roter Text überflutet Bildschirm, missing className

- **Was du siehst**: Roter Text scrollt über das Spiel, `previous errors repeated`, `YOU SHOULD RESTART THE GAME`, und im Log `Missing className: NeoModLoader (1).WorldBoxMod`.
- **Warum**: Die Datei heißt nicht `NeoModLoader.dll`. Ein Browser, der sie ein zweites Mal herunterlädt, hängt ` (1)` an, und NML liest seinen eigenen Dateinamen.
- **Lösung**: Schließe das Spiel, lösche alte Kopien, benenne die Datei exakt in `NeoModLoader.dll` um, starte neu. Vollständige Anleitung unter **[NML installieren](#/install-nml)**.

### Mods sind rot oder failed nach einem Spiel-Update

- **Was du siehst**: Die Mod-Liste zeigt eine Mod in Rot, "failed", `current failed, will load` oder `<Mod> has been disabled due to an error`. Vor dem Update funktionierte sie.
- **Warum**: Mods rufen Spielcode auf. Wenn WorldBox diesen Code ändert, kompiliert eine für die alte Version gebaute Mod nicht mehr. NML ist nicht das Problem, sondern nur der Überbringer der Nachricht.
- **Lösung**: Suche nach einer neueren Version der Mod (auf GameBanana nach **Updated** sortieren). Gibt es keine, warte auf den Autor oder spiele auf der alten Version, siehe **[die FAQ](#/install-nml)**. Behalte nicht zwei Versionen derselben Mod in `Mods` "für alle Fälle": Sie beißen sich.

### Das Spiel ist auf einer alten Version

- **Was du siehst**: NML lädt nie, oder das Log meldet `MissingFieldException: Field not found: bool .Config.gameLoaded`. Die Versionsnummer im Hauptmenü ist älter als die, über die alle sprechen.
- **Warum**: Das Spiel befindet sich auf einem Steam-**Beta-Zweig**, meist vor langer Zeit gewählt, um ein Update früher zu testen, und dein NML ist für die aktuelle Version gemacht.
- **Lösung**: Steam → Rechtsklick auf WorldBox → **Eigenschaften → Betas** → **Keine**. Lass Steam updaten, schalte den experimentellen Modus wieder ein :PES2_Shrug:.

### Das Spiel wurde langsam oder friert mit Mods ein

- **Was du siehst**: Niedrige FPS, Ruckler oder die Welt friert ein, während Buttons noch reagieren. Ohne Mods läuft alles flüssig.
- **Warum**: Fast immer führt eine Mod schwere Berechnungen in jedem Tick durch, meist eine große Content-Mod. Zwei Mods, die dasselbe ändern, können sich auch gegenseitig blockieren.
- **Lösung**: Deaktiviere die Hälfte deiner Mods, starte neu, teste. Immer noch kaputt: Der Übeltäter ist in der aktiven Hälfte. Halbiere weiter, bis nur noch eine übrig ist. Deaktivieren reicht, Löschen ist nicht nötig. Lies die Mod-Beschreibung auf Inkompatibilitäten und nutze nie zwei Versionen einer Mod (eine Voll- und eine "Lite"-Version) gleichzeitig.

### Eine Welt lädt nicht mehr

- **Was du siehst**: Der Spielstand öffnet eine andere Welt, stoppt beim Laden oder wirft `NullReferenceException` beim Speichern oder Laden.
- **Warum**: Die Welt enthält Kreaturen, Gebäude oder Traits einer Mod, die nun deaktiviert, entfernt oder veraltet ist. Das Spiel stößt auf unbekannte IDs.
- **Lösung**: Aktiviere diese Mod wieder (oder wechsle auf die Version zurück, mit der gespeichert wurde), lade die Welt und entferne die gemoddeten Inhalte im Spiel, bevor du die Mod entfernst. Sichere wichtige Welten, bevor du neue Content-Mods ausprobierst :PES_MonkaSweat:.

### BepInEx-Mod ist installiert und zeigt nichts

- **Was du siehst**: Die Mod liegt in `BepInEx/plugins`, im Spiel erscheint nichts und in `BepInEx/config` taucht keine eigene Konfigurationsdatei auf.
- **Warum**: Entweder wurde die Zip-Datei als Zip in `plugins` abgelegt, oder das Manager-Objekt von BepInEx wird vom Spiel zerstört, wofür manche Systeme eine Einstellung brauchen.
- **Lösung**: Lege den **Ordner innerhalb** der Zip in `BepInEx/plugins`, nicht die Zip-Datei selbst. Öffne dann `BepInEx/config/BepInEx.cfg`, suche `HideManagerGameObject = false`, ändere es auf `true`, speichere und starte neu. Einrichtung von BepInEx selbst: **[Die Live-Konsole](#/toolbox/bepinex-console)**.

### Du hast eine Mod gelöscht und sie ist immer noch da

- **Was du siehst**: Der Ordner ist aus `Mods` verschwunden, aber die Mod lädt weiterhin.
- **Warum**: Sie wurde im Steam Workshop abonniert, und Workshop-Mods liegen in Steams eigenem Ordner, nicht in deinem.
- **Lösung**: Deabonniere sie auf ihrer Workshop-Seite. Das Häkchen zu entfernen ist nicht dasselbe.

### Das Spiel startet überhaupt nicht

- **Was du siehst**: WorldBox schließt sich oder hängt vor dem Hauptmenü, selbst nachdem du alle Mods entfernt hast.
- **Warum**: Eine Datei des Spiels selbst wurde beschädigt, oft durch versehentliches Hineinkopieren in den falschen Ordner.
- **Lösung**: Steam → Rechtsklick auf WorldBox → **Eigenschaften → Installierte Dateien → Integrität der Spieldateien überprüfen**. Füge NML und deine Mods danach einzeln nacheinander wieder hinzu.

---

## Nichts lädt

Das Spiel tut so, als gäbe es deine Mod nicht. Nimm es nicht persönlich, meistens ist es ein Schalter oder ein Dateiname.

### Kein Mods-Button im Menü

- **Was du siehst**: Das Spiel startet normal, kein Fehler, kein Mods-Button und nirgends eine `[NML]`-Zeile im Log.
- **Warum**: Zwei Ordner heißen "Mods". Die Loader-DLL gehört in den Datenordner des Spiels; `worldbox\Mods/` ist für *deine* Mods.
- **Lösung**: Leg `NeoModLoader.dll` in `worldbox\worldbox_Data\StreamingAssets\mods/`, starte neu und such im Log nach `[NML]: NeoModLoader Version:`. Jeder Klick, Mac inklusive: **[NML installieren](#/install-nml)**.

### Mods-Fenster leer, funktionierte vorher

- **Was du siehst**: Das Fenster öffnet sich, ist aber leer. Keine Fehler.
- **Warum**: Der **Experimentelle Modus ist aus**, und das Spiel schaltet ihn nach jedem WorldBox-Update automatisch ab.
- **Lösung**: Einstellungen → Experimenteller Modus → an → neu starten. Prüfe das immer zuerst!

### Mod-Ordner vorhanden, aber Mod fehlt in der Liste

- **Was du siehst**: Nichts in der Liste, keine Zeile `Compile Mod <yours>`.
- **Warum**: Nach Häufigkeit: Die Datei heißt in Wahrheit `mod.json.txt`; das JSON ist ungültig (Komma nach dem letzten Eintrag oder typografische `"`-Anführungszeichen aus einer Chat-App); der Ordner liegt nicht in `worldbox\Mods/`.
- **Lösung**: Explorer → **Ansicht → Anzeigen → Dateinamenerweiterungen**, dann den echten Namen prüfen. Öffne `mod.json` in VS Code, das JSON-Fehler für dich unterstreicht.

### Die Mod ist ausgegraut

- **Was du siehst**: In der Liste grau dargestellt, dein Code läuft nicht.
- **Warum**: Sie ist deaktiviert (gespeichert in `StreamingAssets\mods\NML\mod_compile_records.json`).
- **Lösung**: Klicke im Mods-Fenster auf das Mod-Icon und starte das Spiel neu.

### "Compile failed" und der Fehler ergibt keinen Sinn

- **Was du siehst**: `Code\Main.cs(9,42): error CS1002: ; expected`, gefolgt von einer Zusammenfassung.
- **Warum**: Die Zusammenfassung ist nicht der eigentliche Fehler. Die Zeile darüber nennt Datei, Zeile und Spalte.
- **Lösung**: Behebe **nur den ersten** Fehler und starte neu – Folgefehler lösen sich oft von selbst.

| Code | Bedeutung |
| --- | --- |
| `CS1002` | Fehlendes Semikolon `;` |
| `CS0246` | Unbekannter Typname, meist fehlt ein `using` |
| `CS0266` | Kommazahl übergeben, wo Ganzzahl erwartet wird (`0.5f` in ein `int`) |
| `CS0122` | Das Mitglied ist `internal`, siehe [diesen Abschnitt](#cs0122-inaccessible-due-to-its-protection-level) |

### Fehler in Zeile 1 einer frisch eingefügten Datei

- **Was du siehst**: Ein seltsamer Compilerfehler in Zeile 1.
- **Warum**: Codeblöcke im Guide sind mit dem Dateipfad beschriftet. Wer zu weit oben markiert, kopiert die Beschriftung mit.
- **Lösung**: Zeile 1 löschen. Eine `.cs`-Datei beginnt mit `using`, `namespace` oder `class`; `mod.json` beginnt mit `{`.

### Code bearbeitet, aber im Spiel ändert sich nichts

- **Was du siehst**: Altes Verhalten (behaviour), keine Fehler.
- **Warum**: NML kompiliert `Code\*.cs` **einmalig beim Spielstart**. Ein laufendes Spiel liest Dateien nicht neu ein.
- **Lösung**: Speichern, Spiel beenden und neu starten.

### Notepad speichert nicht im Spielordner

- **Was du siehst**: Du startest neu, das Log sagt `Compile Mod`, und das Spiel führt trotzdem deinen alten Code aus. Das Kompilieren dauert einen Bruchteil einer Sekunde.
- **Warum**: Zwei Ordner in `Mods/` haben dieselbe `GUID` in `mod.json`, typischerweise eine ältere Kopie, die der NML-Installer als `COM_YOURNAME_HELLOBOX/` entpackt hat. NML lädt **eine Mod pro GUID** und ignoriert den anderen Ordner stillschweigend, und das kann gut der sein, den du gerade bearbeitest.
- **Lösung**: Durchsuch `Mods/` nach deiner GUID und behalte genau einen Ordner. Wenn die Zahlen nicht aufgehen, ist das das Erste, was du prüfen solltest.

### Deine Änderungen kommen nie an, auch nicht nach einem Neustart

- **Was du siehst**: "Sie haben keine Berechtigung, an diesem Speicherort zu speichern", mit dem Angebot, in Dokumente zu speichern.
- **Warum**: Das Spiel liegt unter `C:\Program Files (x86)/`, und das schützt Windows.
- **Lösung**: Erstelle die Datei zuerst im Explorer (Rechtsklick → Neu → Textdokument, umbenennen) und bearbeite dann diese vorhandene Datei.

---

## Lädt, aber nichts erscheint

NML hat deine Mod gefunden und ausgeführt. Irgendetwas darin hat es nie bis auf den Bildschirm geschafft.

### Absturz in der Zeile, in der ein Stat gesetzt wird

- **Was du siehst**: `NullReferenceException` in deinem `Initialize()`.
- **Warum**: Ein neues Asset hat **keinen Stat-Block**. Die Bibliothek (library) erstellt ihn erst in `add()`.
- **Lösung**: Erst `add()`, dann die Stats setzen. Gilt für Traits, Status, Items, Gebäude und Kreaturen.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // das alloziiert base_stats
swift.base_stats["speed"] = 20f;     // ab hier sicher
```

`clone()` ruft `add()` bereits auf, nach dem Klonen existiert der Block also schon.

### Gleicher Absturz, obwohl die Reihenfolge stimmt

- **Was du siehst**: Dieselbe `NullReferenceException`, in einer Wertezeile, die nach `add()` läuft.
- **Warum**: Du hast einen Wertenamen erfunden. Eine unbekannte Werte-ID ist ein Absturz, keine leere Aktion.
- **Lösung**: Nutz echte IDs: `damage`, `health`, `speed`, `armor`, `attack_speed`, `stamina`, `mana`, `range`, `critical_chance`, `lifespan`, `warfare`. Multiplikatoren sind eigene Werte (stats): `multiplier_damage`, `multiplier_health`, `multiplier_speed`. Die vollständige Liste steht in der **[Werte-Referenz](#/nml/stats)**.

### Gebäude stirbt sofort oder hat keine Größe

- **Was du siehst**: Das Gebäude erscheint und verschwindet dann, oder es lässt sich nicht anvisieren. Kein Fehler.
- **Warum**: Die Standardwerte `health` und `size` eines Gebäudes werden nur in `add()` gesetzt, und nur solange `base_stats` noch null ist. Legst du den Block vorher selbst an, bekommst du `health = 0`.
- **Lösung**: Leg `base_stats` nie vorab an. Erst klonen oder `add()`, dann nur ändern, was abweichen soll.

### Registriert, aber in keinem Tab sichtbar

- **Was du siehst**: Deine Log-Zeile erscheint, keine Exception, und das Ding ist in keiner Kategorie.
- **Warum**: `group_id` zeigt auf eine Gruppe, die es nicht gibt, also gibt es keinen Tab, in dem es gezeichnet werden kann.
- **Lösung**: Nutz eine echte Gruppen-ID. Akteur-Merkmale: `cognitive`, `mind`, `spirit`, `physique`, `health`, `body`, `appearance`, `protection`, `skills`, `merits`, `acquired`, `fun`, `fate`, `miscellaneous`, `special`. Ein eigener Tab: **[Merkmalsgruppen & Tabs](#/nml/trait-groups)**.

### Zeigt `trait_hello_swift` statt eines Namens

- **Was du siehst**: Der rohe Schlüssel auf dem Bildschirm, ein leerer Tooltip, `missing text:` im Log.
- **Warum**: Keine Übersetzung registriert. Das Spiel baut den Schlüssel selbst: `trait_<id>` und `trait_<id>_info`.
- **Lösung**: Füg diese beiden Schlüssel zu `Locales/en.json` hinzu. Achtung vor `en.json.txt`.

### Namen klappen bei Traits, aber nicht bei Items, Status, Kräften

- **Was du siehst**: Du hast das Muster der Merkmale kopiert, und hier steht trotzdem ein roher Schlüssel.
- **Warum**: Vier Assets bauen den Schlüssel **nicht** aus der ID:

| Asset | Namensschlüssel | Beschreibungsschlüssel |
| --- | --- | --- |
| `GodPower` | das **Feld** `name`, in snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`, sonst `item_<subtype or id>` | `<id>_description`, ohne `item_` |
| `StatusAsset` | das **Feld** `locale_id` | das **Feld** `locale_description` |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **Lösung**: Setz bei Mächten (GodPower) `name` = ID, bei Gegenständen (item) `translation_key`, bei Status `locale_id`. Halte Schlüssel klein in snake_case: Sie werden beim Speichern normalisiert, aber **nicht** beim Nachschlagen, also wird `MyKey` als `my_key` gespeichert und nie wieder gefunden :PESgn_SMH:.

### Das Icon ist ein leeres Loch

- **Was du siehst**: Leeres Quadrat anstelle des Icons.
- **Warum**: Automatisches Laden passiert vor Mod-Start. Ein falscher Pfad liefert `null` (wird für die Session gecacht).
- **Lösung**: `path_icon` immer explizit ohne Dateiendung und mit Schrägstrichen (`/`) setzen, dann neu starten.

### Ein Button nimmt Platz ein, zeichnet aber nichts

- **Was du siehst**: Leerraum in deinem Tab.
- **Warum**: Ein `null`-Sprite ist kein Platzhalter, sondern unsichtbar :PES4_Invisible:.
- **Lösung**: Nutze `ui/Icons/iconQuestionMark` als Fallback. Details unter **[Power-Tabs & Buttons](#/nml/power-buttons)**.

### Statuseffekt zeichnet kein Sprite auf der Einheit

- **Was du siehst**: Entweder wird über der Kreatur nichts gezeichnet, oder `NullReferenceException` in `Status.updateAnimationFrame()` in **jedem Frame**, solange der Status hält.
- **Warum**: `StatusLibrary` füllt `sprite_list` aus `"effects/" + texture` und setzt `need_visual_render` in einem Durchgang beim Laden, bevor deine Mod existierte. Und `texture` ist der Name eines **Ordners** mit Frames, nicht einer PNG.
- **Lösung**: Frames in `GameResources/effects/fx_hello_status/`, dann nach `add()`:

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### Buttons stapeln sich übereinander

- **Was du siehst**: Tab wirkt leer oder Buttons liegen alle am selben Punkt.
- **Warum**: `recalc()` berechnet nur die Breite; Anordnen erfordert `tab.sortButtons()`.
- **Lösung**: Nach dem Hinzufügen beides aufrufen: `tab.recalc();` und `tab.sortButtons();`. Nur nicht während `OnModLoad`: dort stürzt `recalc()` ab, siehe **[Dein Kräfte-Tab erscheint nie](#dein-kräfte-tab-erscheint-nie)**.

### Button ist da, aber Klick aktiviert nichts

- **Was du siehst**: Der Cursor ändert sich nicht, ein Klick auf die Karte tut nichts.
- **Warum**: Der Button wird **beim Erstellen, per ID** an die Macht gebunden.
- **Lösung**: Registriere zuerst die Macht, erstelle danach den Button - im selben Helfer, damit die Reihenfolge nicht verrutschen kann. Und `click_action` ist `(WorldTile, string)`; die Form `(WorldTile, GodPower)` gehört zu `click_power_action`.

### `addOpposite` / `addDecision` / `addSpell` bewirken nichts

- **Was du siehst**: Das gegensätzliche Merkmal wird nie entfernt, die Entscheidung feuert nie. Ohne Meldung.
- **Warum**: Diese Aufrufe hängen nur eine **ID** an. IDs werden einmal beim Start in echte Objekte verwandelt, bevor deine Mod lädt.
- **Lösung**: Füll die aufgelösten Felder nach `add()` selbst: `linkCombatActions()`, `linkSpells()`, `decisions_assets` (ein Array, das du aus `AssetManager.decisions_library.get()` baust, es gibt keine Link-Methode) und weise `opposite_traits` direkt zu. Setzt du `opposite_trait_mod` und lässt `opposite_traits` null, stürzt das Spiel später in seinem sozialen Code ab - ein leeres `HashSet` verhindert das.

---

## Registriert, dann kaputt in der Welt

Jeder Eintrag in diesem Abschnitt hat dieselbe Ursache. Das Spiel bereitet einen Teil jedes Assets **einmal beim Laden** vor, und deine Mod registriert ihre Assets danach. Nichts sagt es dir: das Asset existiert, hat einen Namen, und beim ersten echten Gebrauch wirft das Spiel. Die Lösung hat auch immer dieselbe Form: mach diesen einen Schritt selbst, direkt nachdem du das Asset registriert hast :wbfacepalm:. Wort des Tages: Workaround.

### Deine Kreatur wirft einen Schattenfehler

- **Was du siehst**: `ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`, dreimal pro Kreatur, dazu ein Fehler-Popup im Spiel.
- **Warum**: Die Library vermisst beim Start das Schatten-Sprite jedes Actors. Eine später hinzugefügte Kreatur wird nie vermessen.
- **Lösung**: `asset.texture_asset.loadShadow();` nach dem Klonen. Siehe **[Eigene Actors](#/nml/custom-actors)**.

### Dein Merkmal, Item oder deine Kreatur bleibt gesperrt

- **Was du siehst**: Es existiert, aber das Wissensbuch zeigt es grau, und der Spieler kann es erst nutzen, wenn es in einer Welt auftaucht.
- **Warum**: `needs_to_be_explored` ist standardmäßig `true` bei allem, was sich freischalten lässt: Actors, alle sieben Merkmalsarten, Items, Item-Modifier und Weltgesetze (world law).
- **Lösung**: `needs_to_be_explored = false` beim Erstellen. Siehe **[Eigene Merkmale](#/nml/custom-traits)**.

### Das Spiel stürzt beim Laden deiner Waffe oder deines Essens ab

- **Was du siehst**: `ArgumentNullException: Value cannot be null. Parameter name: key` in `ItemLibrary.loadSprites()` oder `ResourceLibrary.loadSprites()`.
- **Warum**: Waffen bekommen `path_gameplay_sprite` und Ressourcen (resource) `full_sprite_path` in `post_init()` beim Laden des Spiels abgeleitet. Deine bleiben `null`.
- **Lösung**: Setz sie selbst. Siehe **[Eigene Items](#/nml/custom-items)** und **[Ressourcen & Nahrung](#/nml/resources)**.

### Eine Wolke stürzt ab, sobald sie erscheint

- **Was du siehst**: `NullReferenceException` in `Cloud.prepare()`, wenn deine Wolke zum ersten Mal auftaucht.
- **Warum**: `CloudLibrary` macht beim Start in einem Durchgang aus `path_sprites` die `cached_sprites` und aus `color_hex` die `color`.
- **Lösung**: Mach beides selbst nach `add()`. Siehe **[Wolken & Wetter](#/nml/clouds)**.

### Dein Gebäude zu platzieren wirft Index was out of range

- **Was du siehst**: `ArgumentOutOfRangeException: Index was out of range` in `Building.setAnimData()`, sobald eins platziert wird.
- **Warum**: Gebäude-Frames werden beim Start für alle Gebäude vorgeladen. Deins hat eine leere Frame-Liste, oder sein Ordner hat kein `main_0.png`.
- **Lösung**: `shrine.loadBuildingSprites();`, sobald `sprite_path` gesetzt ist, und Frames namens `main_0`, `construction_0`, `ruin_0`, `mini_0`. Siehe **[Eigene Gebäude](#/nml/custom-buildings)**.

### Dein Gebäude wirft in jedem Frame, in dem es zu sehen ist

- **Was du siehst**: Hunderte `NullReferenceException` in `DynamicSprites.getRecoloredBuilding()`, eine pro Frame, solange es auf dem Bildschirm ist.
- **Warum**: Der Atlas, der ein Gebäude in der Farbe seines Besitzers färbt, `atlas_asset`, wird beim Start in `checkAtlasLink()` verknüpft. Ein Klon behält ihn nicht.
- **Lösung**: `shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### Die Minimap wirft, sobald dein Gebäude existiert

- **Was du siehst**: `NullReferenceException` in `Building.getColorForMinimap()` bei jedem Neuzeichnen der Minimap.
- **Warum**: Der Minimap-Punkt kommt aus `mini_0.png` im Gebäudeordner, und da ist keiner.
- **Lösung**: Füg `mini_0.png` hinzu, ein Pixel pro Tile, das das Gebäude belegt: 5x4 für alles, was von `temple_human` geklont ist.

### Dein Tile malt, dann wirft der Karten-Renderer

- **Was du siehst**: `NullReferenceException` in `WorldTilemap.getVariation()` für jedes deiner Tiles auf dem Bildschirm.
- **Warum**: `TopTileLibrary` lädt beim Start die PNGs aus `tiles/<id>/` in `sprites`.
- **Lösung**: Lade sie selbst mit `addVariation()`. Siehe **[Tiles & Gelände](#/nml/tiles)**.

### Ein Tier auf deinem Tile spawnen stürzt ab

- **Was du siehst**: `NullReferenceException` in `Subspecies.generateName()`, nur auf deinem Tile und nur bei Tieren.
- **Warum**: Ein Klon eines Gras-Tiles behält `is_biome = true`, aber nicht `biome_asset`, das beim Start in `linkAssets()` verknüpft wird. Tiere hängen das Biom an ihren Artnamen.
- **Lösung**: `moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### Drops fallen unsichtbar, oder ein Projektil wirft

- **Was du siehst**: Deine Drops landen, ohne dass etwas gezeichnet wird, oder `ArgumentOutOfRangeException` in `QuantumSpriteLibrary.drawProjectiles()`.
- **Warum**: Drops, Projektile, Status, Gebäude und Ressourcen in der Hand lesen ihre Grafik mit `getSpriteList()`, das die Frames *in* einem Ordner zurückgibt. Eine einzelne PNG kommt als leere Liste zurück.
- **Lösung**: Ein Ordner pro Animation, auch für einen einzigen Frame: `drops/hello_ember/hello_ember_0.png`. Siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**.

### Das Log füllt sich mit ArgumentNullException von Projektilen

- **Was du siehst**: Tausende `ArgumentNullException: Value cannot be null` in `ProjectileManager.updateProjectiles()`, solange ein Projektil in der Luft ist.
- **Warum**: Ein Projektil ohne Schützen hat kein Königreich (kingdom), und der Manager nutzt das Königreich in jedem Frame als Dictionary-Schlüssel.
- **Lösung**: Gib ihm eins: `pForcedKingdom: World.world.kingdoms_wild.get("nature")`, der neutrale Besitzer des Spiels selbst.

### Dein Kräfte-Tab erscheint nie

- **Was du siehst**: `NullReferenceException` in `PowersTab.setNewWidth()`, der Tab fehlt und deine Kräfte auch.
- **Warum**: `recalc()` wurde während `OnModLoad` aufgerufen. Das eigene `Start()` des Tabs ist noch nicht gelaufen, sein Parent ist noch `null`, und die Exception killt die ganze Stage.
- **Lösung**: Erstell den Tab beim Laden, leg ihn aus `Update()` aus. Siehe **[Kräfte-Tabs & Buttons](#/nml/power-buttons)**.

### Das Einstellungsfenster zeigt rohe Ids

- **Was du siehst**: `LocalizedTextManager: missing text: strike_radius Description` im Log.
- **Warum**: NML fragt jede Einstellungszeile nach zwei Keys: `<id>` für das Label und `<id> Description`, mit Leerzeichen und großem D, für den Tooltip.
- **Lösung**: Füg beide zu `Locales/en.json` hinzu. Siehe **[Mod-Einstellungen](#/nml/mod-config)**.

### Die Welt wirft in jedem Frame Fehler, nachdem du ein Weltverhalten hinzugefügt hast

- **Symptom**: `NullReferenceException` in `MapBox.updateWorldBehaviours()`, in jedem Frame ab dem Laden deiner Mod.
- **Ursache**: Die Welt verwaltet für jedes Verhalten einen Timer, der beim ersten Laden der Karte vor deiner Mod erstellt wurde. Dein Verhalten hat keinen, und die Schleife ruft ihn trotzdem auf.
- **Lösung**: `behaviour.manager = new WorldBehaviour(behaviour);` direkt nach `add()`. Siehe **[Weltzeitalter & Weltverhalten](#/nml/world-ages)**.

### Eine Katastrophe stürzt ab, wenn sie in das Weltprotokoll schreibt

- **Symptom**: `NullReferenceException` im Konstruktor von `WorldLogMessage`, aufgerufen von `WorldLog.logDisaster()`.
- **Ursache**: `world_log` ist die ID eines `WorldLogAsset`, kein Lokalisierungsschlüssel. Eine nicht registrierte ID liefert `null` zurück, und die Nachricht wird um diesen Nullwert aufgebaut.
- **Lösung**: Klone `$basic_disaster$` unter dieser ID und setze dessen `locale_id`. Siehe **[Katastrophen](#/nml/disasters)**.

### Eine Katastrophe ohne Action stürzt ab, sobald sie ausgewählt wird

- **Symptom**: `NullReferenceException` in `WorldBehaviourActions.updateDisasters()`, sobald der Zufallswurf auf deine Katastrophe fällt.
- **Ursache**: Der Würfelwurf ruft `action` ohne Nullprüfung auf. `spawn_asset_unit` allein tut nichts.
- **Lösung**: Setze `action` auf `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands` oder schreibe eine eigene Action.

### Der erste Herrscher, der deinen Plan prüft, stürzt ab

- **Symptom**: `NullReferenceException` in `PlotAsset.checkIsPossible()`.
- **Ursache**: `check_is_possible` wird jedes Mal ohne Nullprüfung aufgerufen, wenn ein Herrscher den Plan in Erwägung zieht.
- **Lösung**: Setze dieses Delegat immer. Gibt es keine Bedingung, gib `true` zurück. Siehe **[Pläne & Intrigen](#/nml/plots)**.

### Deine Entscheidung, dein Plan, dein Gen oder deine Waffe existiert, wird aber nie genutzt

- **Symptom**: Kein Fehler. Das Asset befindet sich in seiner Library, das Spiel wählt es jedoch nie aus.
- **Ursache**: Das Spiel wählt aus Listen aus, die beim Spielstart erstellt wurden: `basic_plots`, die Entscheidungslisten, der Gen-Mutationspool, die Waffenpools, die Slot-Pools der Zeitalter (world age). Deines wurde erst danach hinzugefügt.
- **Lösung**: Füge es der Liste hinzu, aus der das Spiel tatsächlich liest. Jede Seite nennt die passende Liste: **[Eigene KI & Verhalten](#/nml/custom-ai)**, **[Pläne & Intrigen](#/nml/plots)**, **[Unterarten-Merkmale](#/nml/subspecies-traits)**, **[Eigene Gegenstände](#/nml/custom-items)**, **[Weltzeitalter & Weltverhalten](#/nml/world-ages)**.

---
## Kompiliert bei dir, aber nicht bei anderen

Der Klassiker "bei mir läuft's". Der Unterschied liegt meistens an deinem Setup, nicht an deinem Code :PES5_Hmmmm:.

### `CS0122: inaccessible due to its protection level`

- **Was du siehst**: Code, der aus einer funktionierenden Mod kopiert ist, kompiliert nicht: `addStatusEffect`, `getHit`, `_localized_text`, `addBuilding`.
- **Warum**: Die sind `internal`. NML kompiliert deine `Code/*.cs` gegen seine eigene **publizierte** Kopie (`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`), also funktionieren sie in einer normalen Quellcode-Mod einfach. Der Fehler taucht auf, wenn du in Visual Studio deine eigene `.dll` gegen die normale `Assembly-CSharp.dll` baust, die sie versteckt.
- **Lösung**: Referenziere diese publizierte Kopie in deinem Projekt, oder nimm den öffentlichen Weg:

| Statt | Nimm |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)` dann `LM.ApplyLocale(false)` |

### Funktioniert auf deinem PC, macht nichts bei anderen

- **Was du siehst**: Berichte, dass die Mod lädt und keinen Inhalt hat, oder schon in der ersten Zeile wirft.
- **Warum**: Fast immer eines von vier Dingen: ein fest eingetragener Pfad mit deinem Benutzernamen; ein Zip vom *Inhalt* der Mod statt vom *Ordner*; eine `GUID`, die sich zwischen Versionen geändert hat; `Code/` neben einer veralteten `.dll` ausgeliefert.
- **Lösung**: Leite Pfade aus `GetDeclaration().FolderPath` ab. Zip den Ordner. Setz die `GUID` einmal und ändere sie nie. Liefere `Code/` **oder** eine `.dll` aus, nie beides.

---

## Funktioniert zuerst, bricht später ab

Die langsamen. Gestern lief deine Mod noch, und an ihr hat sich nichts geändert :PES2_Shrug:.

### Eine andere Mod überschreibt still deine Inhalte

- **Was du siehst**: Dein Merkmal ist weg, sobald eine bestimmte andere Mod an ist. Eine Zeile im Log, längst weggescrollt: `duplicate asset - overwriting...`
- **Warum**: Ein flacher ID-Namensraum pro Bibliothek, geteilt von Vanilla und jeder Mod. Die letzte Registrierung gewinnt, und die Ladereihenfolge bestimmst nicht du.
- **Lösung**: Versieh jede ID mit einem Präfix: `hello_swift`, niemals `swift`. Sichere ab mit `if (AssetManager.traits.has(SWIFT)) return;`. Um Vanilla-Inhalte zu *ändern*, hol sie mit `get()` und bearbeite sie direkt, statt einen Ersatz hinzuzufügen.

### Absturz bei `World.world` während des Mod-Ladens

- **Was du siehst**: Der Absturz passiert in deiner ersten Zeile, die die Karte anfasst.
- **Warum**: `OnModLoad` läuft, bevor es eine Welt gibt. Die Asset-Bibliotheken sind bereit, die Welt nicht.
- **Lösung**: Registriere in `OnModLoad` und fass die Welt aus `Update()` an, hinter `if (!Config.game_loaded) return;` plus einer Null-Prüfung auf `World.world`, `World.world.units` und `MapBox.instance`.

### Deine Daten steuern plötzlich falsche Kreaturen

- **Was du siehst**: Nach dem Laden eines Spielstands oder dem Erstellen einer neuen Welt verhalten sich fremde Einheiten wie besessen.
- **Warum**: Einheiten-IDs gelten **pro Welt** und werden von vorn neu vergeben. Das `Actor`-Objekt zu behalten ist noch schlimmer: Tote Akteure werden gepoolt und wiederbelebt, also ist deine Referenz nie null - sie ist jetzt jemand anderes.
- **Lösung**: Bemerke den Weltwechsel und wirf alles weg. Rückwärts laufende Weltzeit ist das billigste Signal:

```csharp
double now = World.world.getCurWorldTime();
if (_lastWorldTime >= 0.0 && now < _lastWorldTime - 1.0) MyRegister.Clear();
_lastWorldTime = now;
```

### Nach Speichern/Laden ist alles weg

- **Was du siehst**: Deine Einheiten verhalten sich wieder wie in Vanilla, tragen aber noch dein Merkmal.
- **Warum**: Nur die eigenen Datenklassen des Spiels werden serialisiert; dein statisches Dictionary nicht. Merkmale werden als IDs gespeichert, und eine ID, die **beim Laden nicht in der Bibliothek ist, wird stillschweigend verworfen** - also deaktivieren, laden, wieder aktivieren, und das Merkmal ist von jeder Einheit entfernt.
- **Lösung**: Lass das Merkmal der Schalter sein, der überlebt, und stell daraus alles wieder her: `trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **Oder**: Behalte den Zustand in der Einheit selbst. Ihr eigener Datenspeicher wird mit ihr gespeichert: siehe **[Dinge merken](#/nml/saving-data)**.

### Einheiten frieren gruppenweise ein

- **Was du siehst**: Gruppen von Einheiten bleiben stehen; die Gruppe wechselt jeden Frame. Eine Exception pro Frame, nicht Tausende.
- **Warum**: Die Schleifen pro Einheit haben kein try/catch. Eine Exception bei Einheit *i* überspringt in diesem Frame jede Einheit danach.
- **Lösung**: Pack den Körper jedes Patches und jedes `execute` eines eigenen Verhaltens in try/catch und gib bei einem Fehler `BehResult.Stop` zurück.

### Die Hälfte deiner Harmony-Patches wurde nie angewendet

- **Was du siehst**: Nur 2 von 9 Patches greifen.
- **Warum**: `PatchAll` bricht bei der ersten fehlerhaften Patch-Klasse komplett ab.
- **Lösung**: Patches einzeln Klasse für Klasse anwenden (siehe **[Harmony-Patches](#/nml/harmony-patches)**).

### Dein `updateStats`-Patch stürzt bei anderen Spielern ab

- **Was du siehst**: Threading-Fehler auf Multi-Core-Systemen bei Testern.
- **Warum**: `updateStats` läuft parallel auf mehreren Worker-Threads.
- **Lösung**: Dort nur lokale Werte der Einheit bearbeiten; globale Zugriffe in `Update()` verlagern.

### `getHit` gepatcht, aber Gebäude nehmen weiter Schaden

- **Was du siehst**: Schadenslogik greift bei Einheiten, aber nicht bei Gebäuden.
- **Warum**: `getHit` ist mehrfach als Override vorhanden (`Actor` und `Building`).
- **Lösung**: Jedes konkrete Override gezielt patchen.

### Dein Prefix hat drei andere Mods beschädigt

- **Was du siehst**: "Deine Mod hat Mod X kaputt gemacht." Nichts im Log, und der Autor von X kann es allein nicht nachstellen.
- **Warum**: `false` zurückzugeben überspringt das Original **und jeden Patch anderer Mods nach deinem**. Bei `updateStats` bleiben außerdem für immer veraltete, zwischengespeicherte Flags an der Einheit hängen.
- **Lösung**: Nimm lieber Postfix und passe an (`__result *= 0.5f`), statt Prefix und abbrechen. Wenn du abbrechen musst, brich die engste Methode ab und gib für jeden Fall, der dich nicht interessiert, früh `return true` zurück.

### Einheit steht für immer still oder stürzt jeden Frame ab

- **Was du siehst**: Eine Einheit ist ohne Aufgabennamen eingefroren, oder es gibt jeden Tick einen Stacktrace.
- **Warum**: Eine unbekannte **Aufgaben** (task)-ID ist eine stille, dauerhafte leere Aktion; eine unbekannte **Job**-ID ist ein Absturz in jedem Tick.
- **Lösung**: Prüf deine IDs einmal beim Laden, registriere Aufgaben vor dem Job, der sie auflistet, und gib `next_job_delegate` nie eine ID, die du nicht geprüft hast.

### Deine benutzerdefinierte KI wird heimlich zurückgesetzt

- **Was du siehst**: Nach einer Weile sind manche Einheiten wieder auf Vanilla-KI, obwohl dein Register sie noch führt.
- **Warum**: Akteure werden gepoolt: Eine "neue" Einheit ist ein wiederverwendetes Objekt, dessen Job-Delegate gerade zurückgesetzt wurde. Kampf setzt ihn ebenfalls zurück.
- **Lösung**: Setz ihn nach deinem eigenen Takt immer wieder, statt nur einmal: `if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`

### Das Spiel ruckelt viermal pro Sekunde

- **Was du siehst**: Die durchschnittlichen FPS sehen gut aus, das Spiel ruckelt rhythmisch, keine einzelne heiße Funktion.
- **Warum**: Alles denkt im selben Tick, und Einheiten kommen erst weiter, wenn ihre aktuelle Aktion endet, also werden sie gemeinsam fertig.
- **Lösung**: Denk nach deinem eigenen Timer, nicht in `execute`. Teil die Bevölkerung in Scheiben und bearbeite pro Durchgang eine Scheibe. Reservier Listen im Voraus; halte LINQ, Lambdas und `Debug.Log` aus diesem Pfad heraus.

### Klicks landen auf der Karte hinter deinem Fenster

- **Was du siehst**: Der Spieler klickt auf ein Steuerelement deines Panels, und darunter spawnt eine Einheit.
- **Warum**: Ein Canvas ohne `GraphicRaycaster` wird gezeichnet, aber nicht auf Treffer geprüft. Und `unselect_when_window` kennt nur die eigenen Fenster des Spiels, also legt ein selbst gebautes Panel die aktive Macht nie ab.
- **Lösung**: `Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` + ein Hintergrund-`Image`, zusammen. `raycastTarget = false` auf Beschriftungen. Leg die Macht selbst ab, wenn das Fenster aufgeht.

### Speicherverbrauch steigt bei jedem Öffnen des Panels

- **Was du siehst**: Der Speicher wächst in Stufen, passend zum Öffnen des Panels; lange Sitzungen werden schlechter.
- **Warum**: `Destroy(root)` gibt den GameObject-Baum frei, aber eine `Texture2D` oder ein `Sprite`, die **du** erstellt hast, ist ein eigenes Objekt, das niemand einsammelt.
- **Lösung**: Zerstör, was du erstellt hast, und setz die Referenzen auf null. Zerstör **keine** Sprites, die von `SpriteTextureLoader` kommen - die werden geteilt.

### Neuer Standardwert erreicht bestehende Spieler nicht

- **Was du siehst**: Du änderst einen Standardwert in `default_config.json`, und wiederkehrende Spieler behalten den alten Wert. Neuinstallationen sind in Ordnung.
- **Warum**: Diese Datei ist nur eine Vorlage. Die echten Werte liegen in `mods_config\<UID>.config`, und das speichert das **ganze Element** - also werden auch geänderte Grenzen und umbenannte Callbacks überdeckt.
- **Lösung**: Teste mit gelöschter Datei. Wenn sich Grenzen oder ein Callback für bestehende Nutzer ändern müssen, füg eine neue `Id` hinzu, statt die alte zu bearbeiten.

### Einstellungs-Slider bewegt sich, aber Callback läuft nie

- **Was du siehst**: Die Zeile funktioniert, der Wert wird gespeichert, deine Methode wird nie aufgerufen.
- **Warum**: Der Callback ist `Namespace.Type:MethodName`, die Methode muss **static** sein, und ihr Parameter muss zum Typ passen (`INT_SLIDER` → `int`, `SLIDER` → `float`, `SWITCH` → `bool`, `TEXT` → `string`).
- **Lösung**: Gib den Namespace an, mach sie static, pass den Typ an. Änderungen greifen, wenn das Fenster **geschlossen** wird, nicht beim Ziehen.

---

## Immer noch nicht gelöst?

Melde dein Problem unter **[Feedback & Anfragen](#/feedback)** mit 3 kurzen Zeilen (Was getan, was erwartet, was passiert ist) und der Logzeile :aPES4_Noted:.
