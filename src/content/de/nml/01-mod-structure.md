---
title: Mod-Struktur
group: NML-Modding
subgroup: Basis-Workflow
icon: :wbsavebuttonbox:
order: 20
---

# Mod-Struktur :wbsavebuttonbox:

## Wo Mods leben

Jede Mod ist **ein eigener Ordner** innerhalb von `Mods/` in deinem WorldBox-Verzeichnis:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

Falls dieser `Mods`-Ordner noch nicht existiert, erstelle ihn einfach selbst: Rechtsklick → Neu → Ordner, und nenne ihn exakt `Mods`. Darin erstellst du deinen eigenen Mod-Ordner, dessen Namen du dir frei ausdenkst.

## Wie eine Mod aufgebaut ist

```text
HelloBox/
├── mod.json          <- Der Ausweis deiner Mod (Pflicht)
├── icon.png          <- Das Vorschaubild der Mod
├── Code/             <- Der Ordner für deinen grandiosen Code
├── Locales/          <- Text- und Übersetzungsdateien (en.json usw.)
└── GameResources/    <- Eigene Texturen, Icons, Pixel-Art und Sounds
```

Jede Mod braucht `mod.json`. HelloBox braucht außerdem ihren C#-Einstiegspunkt. Die anderen Ordner erstellst du erst, wenn du sie wirklich brauchst. Eine Mod, die nur aus `mod.json` und `Code/` besteht, ist bereits eine voll funktionsfähige Mod. Leere Ordner beeindrucken niemanden.

#### Was die einzelnen Ordner machen

- **`mod.json`**: Der Personalausweis. Ohne diese Datei tut NML so, als würde deine Mod gar nicht existieren.
- **`icon.png`**: Das Vorschaubild, das im spielinternen Mod-Menü angezeigt wird.
- **`Code/`**: Der Ordner, in den alle deine `.cs`-Quelldateien kommen (wie `Main.cs`). NML kompiliert tatsächlich jede `.cs`-Datei, die es überall in deiner Mod findet, auch in Unterordnern (außer in `bin/`, `obj/`, `Properties/`, `packages/` und jedem Ordner, dessen Name mit einem Punkt beginnt). `.cs`-Dateien, die lose neben `mod.json` liegen, funktionieren also ebenfalls, und manche Mods machen das so, aber sie in `Code/` zu legen verhindert, dass dein Projekt zur Müllhalde wird. **NML kompiliert Quellcode bei Bedarf und kann seinen kompilierten Cache wiederverwenden.** Für diesen Guide brauchst du keinen separaten Build-Schritt.
- **`Locales/`**: Hier liegen deine Übersetzungsdateien (wie `en.json`). Ohne diesen Ordner erscheinen deine Gegenstände (item) und Eigenschaften (trait) im Spiel als rohe Platzhalter-Keys.
- **`GameResources/`**: Alle deine Texturen, Pixel-Art, Eigenschafts-Icons, Waffensprites und Soundeffekte. Der Ordner muss exakt so heißen, denn genau danach sucht NML. Siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**.

> [!WARNING] Ordnernamen unterscheiden Groß-/Kleinschreibung, nur eben nicht auf deinem PC
> Windows ist es egal, ob du `Locales` oder `locales` geschrieben hast. Linux ist das nicht egal. NML sucht nach `Locales` und `GameResources` exakt so geschrieben, eine Mod, die bei dir funktioniert, kann bei jemand anderem also ganz ohne Text und ohne Sprites dastehen. Halte dich an die Groß-/Kleinschreibung oben, und das Problem existiert nie.

#### Ordner, die dir in fremden Mods begegnen

Keinen davon brauchst du zum Start. Du wirst sie sehen, wenn du die Mod von jemand anderem öffnest, hier also, was sie sind.

| Ordner | Bedeutung |
| --- | --- |
| `Assemblies/` | Verwaltete Drittanbieter-Bibliotheken für Quellcode-Mods. NML sammelt `.dll`-Dateien direkt in diesem Ordner als Compiler-Referenzen und versucht, sie zu laden. Kein Ort für Spiel- oder NML-DLLs |
| `GameResourcesReplace/` | NML lädt ihn exakt wie `GameResources/`, direkt danach. NML führt den Namen unter NCMS-Kompatibilität. In einer neuen Mod nutze einfach `GameResources/` |
| `EmbededResources/` | Ja, falsch geschrieben, und das muss so sein. Dateien darin werden in den kompilierten Code einer Mod **im NCMS-Stil** gepackt. Der geprüfte Quellcode-Compiler liest ihn nur auf seinem NCMS-Kompatibilitätszweig. Es ist kein automatisches Einbetten für den `BasicMod`-Code von HelloBox. `EmbeddedResources/` ist nicht der Ordnername, den dieser Zweig nutzt |

#### Eine `.dll` statt Quellcode ausliefern

Im geprüften Loader wählt eine Datei, die auf `.dll` endet und **direkt neben `mod.json`** liegt, den vorkompilierten Weg. NML überspringt die Quellcode-Kompilierung und lädt die DLLs im Wurzelverzeichnis. Leg deine kompilierte HelloBox-DLL dort ab und lass `Code/` aus der Veröffentlichung weg. Siehe **[Mod veröffentlichen](#/nml/publishing)** für Build- und Verpackungsprüfungen.

> [!WARNING] Eine verirrte .dll schaltet deinen Code ab
> Das ist auch, warum eine neben `mod.json` abgelegte Bibliothek eine Quellcode-Mod "kaputt macht": NML sieht die `.dll`, überspringt `Code/`, und keine deiner Änderungen lädt jemals. Bibliotheken gehören nach `Assemblies/`, niemals ins Mod-Wurzelverzeichnis.


### Das Manifest

Die Datei `mod.json` wird von NeoModLoader benötigt, um deine Mod zu identifizieren :pepeOK:. Sie liegt direkt im Hauptverzeichnis deines Mod-Ordners.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### Was bedeuten diese Felder?

| Feld | Bedeutung |
| --- | --- |
| `name` | Anzeigename, hier `HelloBox` |
| `author` | Dein Name |
| `version` | Release-Version. Erhöhe sie, wenn du veröffentlichst |
| `description` | Kurzbeschreibung |
| `iconPath` | Icon-Pfad relativ zum Mod-Ordner |
| `GUID` | Stabile Identität. NML normalisiert sie zu `UID`; für dieses Beispiel `COM_YOURNAME_HELLOBOX`. Nach der Veröffentlichung unverändert lassen |
| `RepoUrl` | Metadaten-URL zu Repository oder Support. Prüfe ihre Anzeige in der NML-Version, gegen die du ausliefertst |
| `Dependencies` | Erforderliche Mod-IDs. Der dokumentierte Quellcode-Workflow verlangt, dass sie erfolgreich kompilieren |
| `OptionalDependencies` | Optionale Mod-IDs. NML kann während der Quellcode-Kompilierung ihre Referenzen und Compiler-Symbole bereitstellen |
| `IncompatibleWith` | Konfliktdeklarationen. Geh nicht von identischer Durchsetzung über Loader-Versionen hinweg aus |
| `UsePublicizedAssembly` | Standardmäßig `true` im geprüften Loader. Fügt während der Quellcode-Kompilierung NMLs publizierte Spiel-Assembly-Referenz hinzu |

> [!WARNING] Prüfe die Konfliktbehandlung, bevor du die Liste füllst
> Die mitgelieferte Dokumentation beschreibt `IncompatibleWith` als unfertig. Der installierte Loader hat einen Entfernungsdurchgang, der eine Mod mit nicht-leerer Liste entfernt, bevor er die gelisteten IDs nachschlägt. Lass das Beispiel leer. Teste deinen genauen Loader mit der widersprüchlichen Mod, einmal anwesend und einmal abwesend, bevor du eine Deklaration ausliefertst.

#### ModType und targetGameBuild

Das geprüfte Enum enthält `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX` und `RESOURCE_PACK`. Der Standard ist `NEOMOD`; die Erkennung einer DLL im Wurzelverzeichnis wählt `COMPILED_NEOMOD`.

Ein Enum-Name ist kein funktionierendes Rezept. Die geprüfte `LoadMod`-Methode behandelt die beiden NeoMod-Typen und weist die anderen Werte auf diesem Weg zurück. Lass `ModType` aus dem Manifest von HelloBox weg. Dieser Guide behauptet nicht, dass allein `RESOURCE_PACK` zu setzen einen funktionierenden Texturpack erzeugt.

`targetGameBuild` hat eine JSON-Zuordnung in der Assembly, aber der geprüfte dateibasierte Konstruktor übernimmt es nicht in die aktive Deklaration. Nutze es nicht als Kompatibilitätsschranke. Nenne die Spiel-Build und NML-Version, die du getestet hast, in deinen Release-Notizen.

#### Manifest-Schlüssel sind nicht austauschbar

Die geprüfte Deklaration bildet `GUID` auf ihre Laufzeit-`UID` ab. Sie hat keine Zuordnungen für `id`, `mainClass`, `modLoader`, `gameVersion` oder `homepage`, und ihr dateibasierter Konstruktor liest diese Schlüssel nicht ein. Sie sind kein Ersatz für die obigen Felder.

NML findet einen passenden Einstiegspunkt-Typ in der Assembly. Ein `mainClass`-String wählt ihn nicht aus. Halte das Manifest klein, statt das Schema eines anderen Loaders zu importieren.

#### Abhängigkeits-Symbole

Für die **hier verwendeten ASCII-IDs** wandelt NML Buchstaben in Großbuchstaben um und ersetzt Satzzeichen durch Unterstriche: `com.yourname.hellobox-extra` wird zu `COM_YOURNAME_HELLOBOX_EXTRA`. Erweitere diese Regel nicht auf jedes Unicode-Zeichen; der geprüfte Normalisierer erhält manche davon.

Während der Quellcode-Kompilierung definiert NML das Symbol einer optionalen Abhängigkeit, wenn diese ID einen Eintrag in seiner Compiler-Referenz-Zuordnung hat. Installation allein ist nicht der Test. NML kann eine fehlgeschlagene Kompilierung auch ohne optionale Abhängigkeiten erneut versuchen.

> [!WARNING] Ein falsch geschriebenes Symbol entfernt Code lautlos
> Ein unbekanntes `#if`-Symbol ist `false`. Prüfe die Abhängigkeits-ID, die `OptionalDependencies`-Liste und das normalisierte Symbol. Eine erfolgreiche Kompilierung beweist nicht, dass deine Integration enthalten war.

Siehe **[Mit anderen Mods zusammenarbeiten](#/nml/other-mods)** für ein vollständiges Beispiel und die separate Laufzeitprüfung.

#### Was einen Mod-Ordner kaputt macht

- **Spiel- oder Loader-DLLs ausliefern.** Füge `Assembly-CSharp.dll`, ihre publizierte Kopie, `NeoModLoader.dll`, Unity-DLLs oder andere aus dem `Managed/`-Ordner des Spiels kopierte DLLs nicht bei. Referenziere lokale Kopien beim Bauen; halte sie aus dem Zip heraus. NMLs Lader für zusätzliche Bibliotheken hat Sonderfälle und Deduplizierung, eine DLL zu kopieren ist also kein verlässlicher Weg, die geladene Version zu ersetzen.
- **Verschachtelte Manifeste.** NML prüft zuerst die eigene `mod.json` des Mod-Ordners. Nur wenn sie fehlt, sucht es unterhalb dieses Ordners. Bei mehreren verschachtelten Treffern warnt der geprüfte Loader und nutzt das erste Ergebnis. Verlass dich nicht auf diese Reihenfolge. Liefere ein Manifest unter `HelloBox/mod.json` aus.
- **Quellcode-Sicherungen innerhalb der Mod.** Ein `dist/`-, `backup/`- oder `old/`-Ordner kann der Quellcode-Kompilierung doppelte C#-Klassen beisteuern. Halte Release-Staging und Sicherungen außerhalb der installierten Mod.
- **Fest codierte Pfade.** Nutze innerhalb deiner `BasicMod`-Klasse `GetDeclaration().FolderPath` und `Path.Combine` für verpackte Dateien. Das `StreamingAssets/mods`-Verzeichnis des Spiels ist der native Loader-Ort, nicht der Ordner von HelloBox.
- **Pfade, die aus dem Paket ausbrechen.** Nutze relative Icon- und Ressourcenpfade mit passender Groß-/Kleinschreibung. Liefere keine absoluten Pfade oder `..`-Segmente aus. `Path.Combine` fügt Pfade zusammen; es prüft nicht, ob spielergelieferte Eingaben innerhalb deines Ordners bleiben.

> [!NOTE] Was geprüft wurde
> Ordner- und Compiler-Verhalten wurde hier durch die installierte NML-Assembly nachvollzogen, Dateiversion `1.2.0.1`, informativer Commit `cd47a1a6c437718d38e8f29240bdb761d543e09a`, zusammen mit der mitgelieferten NML-Dokumentation. Das ist kein Versprechen für jedes zukünftige Release.


## Ein bisschen Nerd-Kram :elpepehacker:

Jede Mod braucht eine C#-Datei, die sagt: "Hallo, ich bin eine Mod". Das hier ist schon der gesamte Code:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

Das ist keine vereinfachte Version für den Guide. Das ist der reale Startpunkt für die meisten veröffentlichten Mods.

#### Den Code aufgeschlüsselt

- **`using NeoModLoader.api;`**: Wie das Öffnen deines Werkzeugkastens vor der Arbeit. Statt jedes Mal `NeoModLoader.api.BasicMod` zu tippen, sagt `using` dem Compiler: *"Halte die NML-Werkzeuge griffbereit auf der Werkbank."*
- **`namespace HelloBox`**: Ein Nachname für deinen Code. Jemand anderes kann ebenfalls eine Klasse namens `Main` haben - der Namespace verhindert, dass beide kollidieren.
- **`public class Main`**: In C# lebt aller Code in "Klassen". Eine Klasse ist einfach ein Bauplan mit einem Namen.
- **`: BasicMod<Main>`**: das offizielle Abzeichen deiner Mod. Es sagt NML *"Ich bin eine echte Mod"*, und im Gegenzug gibt dir NML Logging, Einstellungen, gestuftes Laden und Übersetzungen gratis. Der `<Main>`-Teil wiederholt einfach deinen eigenen Klassennamen. Ja, das sieht seltsam aus, und ja, man schreibt es immer so.
- **`protected override void OnModLoad()`**: Der große Moment. Wenn WorldBox startet, klopft NML einmal an diese Tür. Alles, was deine Mod registriert (Traits, Items, Mächte (GodPower)), kommt in diese `{ }`.
- **`LogInfo(...)`**: Schreibt eine Zeile ins Log, an der bereits automatisch dein Mod-Name angehängt ist. So erfährst du, ob dein Code überhaupt ausgeführt wurde. Siehe **[Logs & Debugging](#/nml/logs-and-debugging)**.

> [!TIP] Der umständliche Weg
> In älteren Mods wirst du oft diesen Aufbau sehen. Ja, ich bin alt genug, um mich zu erinnern, als das normal war:
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` ist das rohe Interface, während `BasicMod<T>` eine vorgefertigte Basisklasse ist, die es implementiert und alle praktischen Hilfsmittel mitbringt. Beides funktioniert. Nutze `BasicMod`, außer du hast einen triftigen Grund dagegen :PES5_Noted:.

## Nächster Schritt

Du hast den Aufbau gesehen. Jetzt bauen wir eine echte Mod: **[Deine erste Mod](#/nml/your-first-mod)**.
