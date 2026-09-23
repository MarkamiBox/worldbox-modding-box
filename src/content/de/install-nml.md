---
title: NML installieren
group: NML-Modding
icon: :wbhammer:
order: 1
---

# NML installieren :wbhammer:

**NML** (NeoModLoader) ist das Programm, das WorldBox-Mods zum Laufen bringt. Du installierst NML einmal, und danach heißt eine Mod installieren nur noch: einen Ordner kopieren.

Diese Seite geht davon aus, dass du so etwas noch nie gemacht hast. Wenn du weißt, was eine `.dll` ist, spring zur **[Kurzfassung](#die-kurzfassung)** :PES_OkHand:.

> [!NOTE] Windows, Mac und Linux (Steam Deck)
> Mods funktionieren auf der **Steam-Version für Windows, Mac und Linux** (einschließlich Steam Deck / SteamOS). Nicht auf Handys, Tablets oder Konsolen.

## Die Kurzfassung

1. Im Spiel: **Einstellungen → Experimental Mode → an**.
2. Lade `NeoModLoader.dll` von der [offiziellen Release-Seite](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) herunter.
3. Leg sie in `worldbox_Data/StreamingAssets/Mods/` in deinem WorldBox-Ordner.
4. Lösch aus genau diesem Ordner alles, was `NCMS` im Namen hat.
5. Starte das Spiel. Mods kommen ab jetzt in den Ordner `Mods` neben `worldbox.exe`.

Das ist alles. Der Rest der Seite sind dieselben fünf Schritte, mit jedem Klick aufgeschrieben.

---

## Windows

### Schritt 1. Experimental Mode einschalten

1. Starte WorldBox ganz normal über Steam.
2. Öffne das Fenster **Einstellungen** im Spiel.
3. Such in der Liste **Experimental Mode** (im deutschen Spiel: **Experimenteller Modus**) und schalte ihn ein.
4. Schließ das Spiel.

Ohne diesen Schalter sucht das Spiel nicht einmal nach Mods. Kein Fehler, keine Meldung, einfach nichts :PES5_Hmmmm:.

> [!WARNING] Es gibt zwei Ordner namens Mods
> Dieser hier, unter `worldbox_Data\StreamingAssets\Mods/`, ist nur für **NML selbst** (speziell `NeoModLoader.dll`) und sonst nichts. Der Ordner für deine **Mods** ist ein separater Ordner direkt im Hauptverzeichnis neben der `worldbox.exe` (`worldbox\Mods/`). Er existiert jetzt noch nicht; NML erstellt ihn automatisch beim ersten Spielstart. Eine Mod in `StreamingAssets\Mods/` oder NML in `worldbox\Mods/` abzulegen, ist der häufigste Fehler auf dieser Seite.

### Schritt 2. NML herunterladen

1. Öffne diesen Link: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. Er zeigt immer auf das neueste NML, du kannst ihn als Lesezeichen speichern.
2. Scroll runter zum Abschnitt **Assets**. Ist er zugeklappt, klick drauf.
3. Klick auf **NeoModLoader.dll**. Sie wird wie jede andere Datei heruntergeladen, meist in deinen Ordner **Downloads**.

Du brauchst nur diese eine Datei. Die Seite listet auch Dateien mit `.pdb`, `.xml` und "Source code": ignorier sie.

> [!WARNING] Nur von diesem Link
> Eine `.dll` ist ein Programm. Lade NML **nur** von der GitHub-Seite oben, nie von irgendeiner Website oder als Datei, die dir jemand im Chat geschickt hat. Fragt dein Browser "Datei behalten?", dann fragt er, weil es eine `.dll` ist, und von dieser Seite lautet die Antwort: behalten.

### Schritt 3. Den WorldBox-Ordner öffnen

Das ist der Ordner, in den Steam das Spiel installiert hat. Du musst ihn nie suchen:

1. Öffne **Steam** und geh in deine **Bibliothek**.
2. **Rechtsklick** auf WorldBox in der Liste links.
3. Klick auf **Verwalten**, dann auf **Lokale Dateien durchsuchen**.

Ein Fenster mit den Dateien des Spiels geht auf. Du bist richtig, wenn du eine Datei `worldbox` (oder `worldbox.exe`) und einen Ordner `worldbox_Data` siehst. Auf den meisten PCs ist das:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

Lass dieses Fenster offen. Ab jetzt meint "der WorldBox-Ordner" genau diesen.

> [!TIP] Lass Windows die Dateiendungen zeigen
> Standardmäßig versteckt Windows das Ende der Dateinamen, also erscheint `NeoModLoader.dll` nur als `NeoModLoader`. Das macht jede Anleitung schwerer. Klick im Ordnerfenster oben auf **Ansicht** und setz den Haken bei **Dateinamenerweiterungen** (unter Windows 11: **Anzeigen → Einblenden → Dateinamenerweiterungen**). Nichts geht kaputt, du siehst nur die vollen Namen.

### Schritt 4. NML an die richtige Stelle legen

1. Doppelklick im WorldBox-Ordner auf **worldbox_Data**.
2. Doppelklick auf **StreamingAssets**.
3. Doppelklick auf **Mods**.
4. Öffne jetzt deinen Ordner **Downloads** in einem zweiten Fenster und zieh **NeoModLoader.dll** in dieses `Mods`-Fenster.

Landen soll sie hier:

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     gehört dem Spiel, nicht anfassen
            └── NeoModLoader.dll     <- die, die du gerade reingelegt hast
```

Siehst du dort kein `test_asset_load`, bist du im falschen Ordner. Geh zurück zum WorldBox-Ordner und versuch es nochmal.

**Wo du schon mal hier bist:** Wenn etwas mit **NCMS** im Namen da ist (zum Beispiel `NCMS_memload.dll` oder ein Ordner `NCMS`), lösch es. NCMS ist der alte Mod-Loader, er ist tot, und NML kann die alten NCMS-Mods sowieso ausführen :PES2_Shrug:.

> [!WARNING] `NeoModLoader (1).dll` ist nicht `NeoModLoader.dll`
> Hast du NML zweimal heruntergeladen oder lag bereits eine alte Kopie im Ordner? Windows benennt die neue Datei in `NeoModLoader (1).dll` um, anstatt sie zu überschreiben, und NML startet nicht: Roter Text überflutet den Bildschirm und fordert dich zum Neustart auf, während das Log `Missing className: NeoModLoader (1).WorldBoxMod` meldet. Schließe das Spiel, lösche die alte Datei, benenne die neue exakt in `NeoModLoader.dll` um (ohne Leerzeichen oder Nummern) und starte neu. Dieses eine Zeichen ist der häufigste Grund, warum NML "nicht funktioniert" :PESgn_SMH:.
>
> Wenn Windows das Löschen der alten Datei verweigert, weil sie "geöffnet ist", läuft das Spiel noch. Schließe es zuerst.

> [!WARNING] Es gibt zwei Ordner namens Mods
> Dieser hier, unter `worldbox_Data\StreamingAssets\Mods/`, ist nur für **NML selbst** (speziell `NeoModLoader.dll`) und sonst nichts. Der Ordner für deine **Mods** ist ein separater Ordner direkt im Hauptverzeichnis neben der `worldbox.exe` (`worldbox\Mods/`). Er existiert jetzt noch nicht; NML erstellt ihn automatisch beim ersten Spielstart. Eine Mod in `StreamingAssets\Mods/` oder NML in `worldbox\Mods/` abzulegen, ist der häufigste Fehler auf dieser Seite.

### Schritt 5. Spiel starten und prüfen

Starte WorldBox über Steam und gib ihm beim ersten Mal etwas mehr Zeit als sonst.

Du hast alles richtig gemacht, wenn:

- Während die Welt lädt, das Spiel die Meldung **Experimental mode is enabled** zeigt.
- Es unten auf dem Bildschirm bei den Tab-Buttons einen neuen Button mit dem **NML-Logo** gibt. Klick drauf: Da wohnt deine Mod-Liste.
- Im WorldBox-Ordner jetzt ein neuer, leerer Ordner **Mods** direkt neben `worldbox.exe` liegt.
- NML in `worldbox_Data\StreamingAssets\Mods/` einen Ordner **NML** für seine eigenen Sachen angelegt hat. Nicht anfassen.

Ist nichts davon passiert, spring zu **[Es hat nicht geklappt](#es-hat-nicht-geklappt)**.

---

## Mac

Dieselben fünf Schritte. Nur der Ordner ist woanders versteckt, weil auf dem Mac das ganze Spiel in einem einzigen App-Symbol steckt.

1. **Experimental Mode**: genau wie unter Windows, **[Schritt 1](#schritt-1-experimental-mode-einschalten)**. Die Warnung zu Updates gilt auch für dich.
2. **Lade** `NeoModLoader.dll` von [derselben Release-Seite](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) herunter. Es ist dieselbe Datei für Windows und Mac.
3. **Öffne den WorldBox-Ordner**: Steam → Bibliothek → Rechtsklick auf WorldBox → **Verwalten → Lokale Dateien durchsuchen**. Ein Finder-Fenster geht auf.
4. **Geh in die App hinein**: Rechtsklick auf das App-Symbol **worldbox** und **Paketinhalt zeigen** wählen. Dann **Contents → Resources → Data → StreamingAssets → Mods** öffnen und `NeoModLoader.dll` hineinziehen. Lösch dabei alles mit `NCMS` im Namen.
5. **Starte das Spiel** und prüf dieselben Dinge wie in **[Schritt 5](#schritt-5-spiel-starten-und-prüfen)**. Der neue Ordner `Mods` für deine Mods erscheint im WorldBox-Ordner, neben der App, nicht darin.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML kommt hierhin
└── Mods/                        <- deine Mods kommen hierhin
```

---

## Linux & Steam Deck

Die Logik ist exakt dieselbe. Steam unter Linux installiert das Spiel im Benutzerverzeichnis, und auf dem Steam Deck wechselst du einfach zuerst in den Desktop-Modus.

1. **Experimenteller Modus**: genau wie unter Windows, **[Schritt 1](#schritt-1-experimental-mode-einschalten)**.
2. **Lade** `NeoModLoader.dll` von der [offiziellen Release-Seite](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) herunter. Es ist dieselbe Datei für alle Plattformen.
3. **Öffne den WorldBox-Ordner**:
   - **Desktop-Linux**: Steam → Bibliothek → Rechtsklick auf WorldBox → **Verwalten → Lokale Dateien durchsuchen**.
   - **Steam Deck**: Drücke die **STEAM-Taste → Ein/Aus → Zum Desktop wechseln**. Öffne Steam im Desktop-Modus → Bibliothek → Rechtsklick auf WorldBox → **Verwalten → Lokale Dateien durchsuchen**.
   Der Pfad ist üblicherweise:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **Platziere NML**: Öffne `worldbox_Data → StreamingAssets → Mods` und ziehe `NeoModLoader.dll` hinein. Lösche alles, was `NCMS` im Namen trägt.
5. **Starte das Spiel** (auf dem Steam Deck kannst du in den Gaming-Modus zurückkehren) und überprüfe die Punkte aus **[Schritt 5](#schritt-5-spiel-starten-und-prüfen)**. Der neue `Mods`-Ordner erscheint direkt im Hauptverzeichnis.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## Eine Mod installieren

Jetzt der leichte Teil, den du immer wieder machen wirst.

1. Lade die Mod herunter. Lies vorher die Beschreibung: Manche Mods brauchen noch etwas, und der Autor sagt es meistens.
2. Kam sie als **.zip**-Datei, entpacke sie. Unter Windows: Rechtsklick → **Alle extrahieren**. Auf dem Mac: Doppelklick.
3. Zieh den Ordner, den du bekommst, in **`worldbox\Mods/`**, den neben `worldbox.exe`.
4. Starte das Spiel.

Ein Mod-Ordner hat immer irgendwo eine Datei namens `mod.json`. Daran erkennt NML ihn. Hat dir die Zip einen Ordner in einem Ordner gegeben, ist das in Ordnung, NML schaut hinein.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] Probier es mit HelloBox
> Nicht sicher, ob es klappt? Die Mod, die dieser Guide baut, ist ein fertiger Test. Lade sie von **[Die fertige Mod](#/nml/all-together)**, entpack sie in `Mods`, starte das Spiel. Taucht ein neuer Kräfte-Tab voller alberner Buttons auf, ist alles richtig installiert :wbpeak:.

**Eine Mod entfernen**: Spiel schließen und ihren Ordner aus `Mods` löschen. **Eine ausschalten, ohne sie zu löschen**: Nimm die NML-Mod-Liste im Spiel.

**Workshop-Mods** gehen auch: Abonnier sie im Steam Workshop, NML findet sie selbst, kein Kopieren nötig.

---

## Es hat nicht geklappt

Geh sie der Reihe nach durch. Die erste hilft den meisten.

| Was du siehst | Was du tust |
| --- | --- |
| Kein NML-Button, kein `Mods`-Ordner neben `worldbox.exe` | Experimental Mode ist aus. Einschalten, neu starten. Auch nach jedem Spiel-Update |
| Immer noch nichts, Experimental Mode ist an | `NeoModLoader.dll` liegt im falschen Ordner. Sie muss in `worldbox_Data\StreamingAssets\Mods/` liegen, neben `test_asset_load` |
| Die Datei heißt `NeoModLoader.dll.dll` oder `NeoModLoader (1).dll` | Benenn sie genau in `NeoModLoader.dll` um |
| NML ist da, aber eine Mod taucht nicht auf | Die Mod liegt im falschen `Mods`. Sie gehört in den neben `worldbox.exe`, als Ordner mit `mod.json` darin, nicht als `.zip` |
| NML sagt, eine Mod "has been disabled due to an error" | Die Mod ist kaputt oder zu alt für deine Spielversion. Such ein Update dieser Mod oder frag ihren Autor |
| Alles ist direkt nach einem WorldBox-Update kaputt | Experimental Mode wieder einschalten. Dann warten, bis deine Mods aktualisiert sind: Ein Spiel-Update macht alte Mods oft für ein paar Tage kaputt |

Immer noch fest? **[Fehlerbehebung](#/troubleshooting)** hat die lange Liste, und **[Logs & Debugging](#/nml/logs-and-debugging)** zeigt, wo das Spiel aufschreibt, was schiefging. Wenn du um Hilfe bittest, sag, welche Mods du nutzt, was du direkt davor gemacht hast, und häng den Fehlertext an. "Geht nicht" kann niemand reparieren, ich auch nicht :PESgn_ReadRules:.

---

## Fragen, die immer kommen

**Kann ich NML und BepInEx zusammen benutzen?**
Ja. Sie kommen sich nicht in die Quere. Zwei einzelne *Mods* können sich trotzdem beißen, aber das liegt an den Mods, nicht an den Loadern.

**Die Mod sagt, sie braucht BepInEx, nicht NML.**
Dann kommt sie nicht in `Mods`. Installier BepInEx wie in **[Die Live-Konsole (BepInEx)](#/toolbox/bepinex-console)** gezeigt (Windows), starte das Spiel einmal und leg die Mod in `BepInEx\plugins/`. Die Beschreibung der Mod sagt, welchen Loader sie will.

**NML oder NCMS?**
NML. NCMS wird nicht mehr aktualisiert und läuft auf aktuellen Spielversionen nicht. NML führt die alten NCMS-Mods sowieso aus, du verlierst also nichts.

**Ist NML ein Virus?**
Nein. Browser warnen davor, weil eine `.dll`-Datei ein ausführbares Programm ist und nicht viele Leute diese Datei herunterladen. Lade sie ausschließlich über den obigen GitHub-Link herunter: Mods auf GameBanana werden von Moderatoren geprüft, während eine Datei aus einem Chat von niemandem geprüft wird :PESgn_ReadRules:.

**Muss ich NML für jede Mod neu installieren?**
Nein. Einmal reicht. Danach ist jede Mod nur ein Ordner in `Mods`.

**Muss ich NML aktualisieren?**
Normalerweise nicht. NML sucht bei jedem Spielstart nach einer neuen Version und ersetzt sich selbst (dafür ist die `NeoModLoader.AutoUpdate_memload.dll`, die daneben auftaucht). Klappt das mal nicht, lad die neue `NeoModLoader.dll` vom selben Link und ersetz die alte von Hand.

**Machen Mods meine Spielstände kaputt?**
Können sie. Ein Spielstand mit einer Mod lädt vielleicht nicht mehr richtig, wenn du die Mod entfernst. Mach eine Kopie der Welten, die dir wichtig sind, bevor du etwas Neues ausprobierst :PES_MonkaSweat:.

Du willst Mods bauen statt nur benutzen? Das fängt bei **[Erste Schritte](#/getting-started)** an.
