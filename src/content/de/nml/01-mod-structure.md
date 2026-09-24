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
MyCoolMod/
├── mod.json          <- Der Ausweis deiner Mod (Pflicht)
├── icon.png          <- Das Vorschaubild der Mod
├── Code/             <- Der Ordner für deinen grandiosen Code
├── Locales/          <- Text- und Übersetzungsdateien (en.json usw.)
└── GameResources/    <- Eigene Texturen, Icons, Pixel-Art und Sounds
```

Nur die `mod.json` ist zwingend erforderlich. Die anderen Ordner erstellst du erst, wenn du sie wirklich brauchst. Eine Mod, die nur aus `mod.json` und `Code/` besteht, ist bereits eine voll funktionsfähige Mod. Leere Ordner beeindrucken niemanden.

#### Was die einzelnen Ordner machen

- **`mod.json`**: Der Personalausweis. Ohne diese Datei tut NML so, als würde deine Mod gar nicht existieren.
- **`icon.png`**: Das Vorschaubild, das im spielinternen Mod-Menü angezeigt wird.
- **`Code/`**: Der Ordner, in den alle deine `.cs`-Quelldateien kommen (wie `Main.cs`). NML kompiliert eigentlich jede `.cs`-Datei, die es in deiner Mod findet (außer in `bin/`, `obj/` und Co.), aber sie in `Code/` zu legen verhindert, dass dein Projekt zur Müllhalde wird. **NML kompiliert sie bei jedem Spielstart**, du baust also nie selbst eine `.dll` und brauchst nie Visual Studio.
- **`Locales/`**: Hier liegen deine Übersetzungsdateien (wie `en.json`). Ohne diesen Ordner erscheinen deine Gegenstände (item) und Eigenschaften (trait) im Spiel als rohe Platzhalter-Keys.
- **`GameResources/`**: Alle deine Texturen, Pixel-Art, Eigenschafts-Icons, Waffensprites und Soundeffekte. Der Ordner muss exakt so heißen, denn genau danach sucht NML. Siehe **[Sprites & Ressourcen](#/nml/sprites-and-resources)**.

### Das Manifest

Die Datei `mod.json` wird von NeoModLoader benötigt, um deine Mod zu identifizieren :pepeOK:. Sie liegt direkt im Hauptverzeichnis deines Mod-Ordners.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### Was bedeuten diese Felder?

- **`name`**: Der Anzeigename deiner Mod in der Mod-Liste im Spiel.
- **`author`**: Dein Benutzername oder Nickname. Lass dir die Lorbeeren für deine Arbeit nicht nehmen!
- **`version`**: Die Versionsnummer deiner Mod (z. B. `"0.1.0"`). Erhöhe sie jedes Mal, wenn du ein Update veröffentlichst.
- **`description`**: Eine kurze Zusammenfassung, was deine Mod tut. Wird im Detailfenster der Mod angezeigt.
- **`iconPath`**: Der relative Pfad zu deinem Vorschausymbol (üblicherweise `"icon.png"` direkt im Mod-Stammverzeichnis).
- **`GUID`**: Eine eindeutige ID für deine Mod, nach Konvention `com.deinname.modname`. NML wandelt sie intern in Großbuchstaben mit Unterstrichen um (`COM_YOURNAME_MY_FIRST_MOD`), und das ist ihre echte Identität. Lässt du sie weg, klebt NML trotzdem deinen Autor und den Namen zusammen. **Leg sie einmal fest und ändere sie nie**: Die Einstellungsdatei des Spielers ist nach ihr benannt.
- **`RepoUrl`**: Optionaler Link zu deinem GitHub-Repo, Discord oder deiner Website. NML setzt einen Button direkt auf deine Mod-Karte, damit Spieler direkt dorthin klicken können.
- **`Dependencies`**: Andere Mod-GUIDs, die zwingend installiert sein MÜSSEN, damit deine Mod läuft. Wenn deine Mod eigenständig ist, lasse es bei `[]`.
- **`OptionalDependencies`**: Mods, die du unterstützt, wenn sie vorhanden sind, die du aber nicht zwingend brauchst. Ist eine davon aktiv, gibt NML deinem Code sogar eine Compiler-Konstante `#if OTHER_MOD_GUID`, in die du den Integrationscode packen kannst.
- **`IncompatibleWith`**: Eine Liste von Mod-GUIDs, die deine Mod kaputt machen, wenn sie zusammen aktiv sind. NML prüft das und verhindert, dass sich widersprechende Mods gleichzeitig geladen werden.

Du kannst auch `"ModType": "RESOURCE_PACK"` setzen, wenn deine Mod keinen Code hat und nur Texturen ersetzen will, oder `"UsePublicizedAssembly": false`, wenn du zum Spaß gegen private Felder leiden willst :PES5_Hmmmm:.


## Ein bisschen Nerd-Kram :elpepehacker:

Jede Mod braucht eine C#-Datei, die sagt: "Hallo, ich bin eine Mod". Das hier ist schon der gesamte Code:

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
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
- **`namespace MyCoolMod`**: Ein Nachname für deinen Code. Jemand anderes kann ebenfalls eine Klasse namens `Main` haben - der Namespace verhindert, dass beide kollidieren.
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
