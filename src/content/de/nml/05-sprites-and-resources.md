---
title: Sprites & Ressourcen
group: NML-Modding
subgroup: Basis-Workflow
icon: :wbfanartist:
order: 28
---

# Sprites & Ressourcen :wbfanartist:

Deine Eigenschaft hat einen Namen, Werte und eine fantastische Beschreibung. Sie hat allerdings auch ein großes, hässliches Fragezeichen als Icon. Zeit, das in Ordnung zu bringen.

## Ein bereits im Spiel vorhandenes Icon nutzen

Die unkomplizierteste Methode, und diejenige, die du am häufigsten verwenden wirst: Verweise einfach auf den Pfad eines Vanilla-Sprites.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` ist `Resources.Load` mit integriertem Cache, `getSpriteList` ist `Resources.LoadAll` mit Cache. Pfadangaben haben keine Dateiendung: Es heißt immer `ui/Icons/iconFly`, niemals `ui/Icons/iconFly.png`.

Die meisten Asset-Felder erwarten den **Pfad als reinen Text (string)** statt eines bereits geladenen Sprite-Objekts:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] Woher weiß ich, welche Pfade existieren?
> Nutze die **[Icon-Suche](#/tools/icons)** auf dieser Website. Sie enthält jeden Sprite-Pfad im gesamten Spiel und versteht einfaches Englisch: "death king" oder "lightning bolt" liefert dir direkt den passenden Pfad zum Kopieren. Alternativ öffnest du **[UnityExplorer](#/toolbox/unity-explorer)** im Spiel und liest `path_icon` von dem Vanilla-Asset ab, das deiner Vorstellung am nächsten kommt :aPES_Magnifying:.

## Eigene Grafiken hinzufügen

Erstelle einen Ordner namens **`GameResources/`** in deiner Mod. NML behandelt ihn exakt wie Unitys internen `Resources`-Ordner. Eine Datei unter:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

wird folglich als `ui/Icons/iconHelloSwift` geladen und funktioniert überall dort, wo auch ein Vanilla-Pfad funktioniert. `.png`, `.jpg` und `.jpeg` werden automatisch erkannt.

### sprites.json

Neben deinen Bilddateien teilt eine `sprites.json` dem NML-Loader mit, wie die Bilder aufgeteilt werden sollen. Ohne diese Datei greifen Unitys Standardeinstellungen, die bei Pixel-Art meistens unpassend sind. (Wird nicht immer zwingend benötigt :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| Feld | Bedeutung |
| --- | --- |
| `PixelsPerUnit` | Belasse diesen Wert auf `1`, außer du hast einen ganz bestimmten Grund dafür |
| `PivotX` / `PivotY` | Der Ankerpunkt. `0.5 / 0.0` bedeutet unten zentriert, was Einheiten und Gebäude normalerweise verlangen |
| `BorderL/R/T/B` | 9-Slice-Ränder für dehnbare Fensterrahmen und Schaltflächen |
| `Path` | Auf welche konkrete Datei sich dieser spezifische Eintrag bezieht |

`Default` gilt für jede Datei im selben Ordner, die keinen eigenen `Specific`-Eintrag besitzt.

## Wo welche Grafikart hingehört

Das ist die Tabelle, zu der man immer wieder zurückkommt. Jedes Asset verweist mit einem anderen Feld auf seine Grafik, und ein paar davon hängen vor dem Laden stillschweigend einen Ordner davor. Der Wert, den du schreibst, ist also **nicht** immer der Pfad, an dem die Datei liegt.

| Asset | Feld | Die Datei gehört nach |
| --- | --- | --- |
| Merkmal, göttliche Macht, Königreich, Gruppe | `path_icon` | `GameResources/` + genau das, was du geschrieben hast |
| Gegenstand in der Hand einer Einheit | `path_gameplay_sprite` | `GameResources/` + genau das, was du geschrieben hast |
| Gebäude | `sprite_path` | Ein **Ordner**: `GameResources/` + `sprite_path` + `/` mit `main_0.png`, `construction_0.png`, `ruin_0.png`. Ist `sprite_path` leer, gilt `main_path` + ID, und `main_path` ist standardmäßig `buildings/` |
| Drop | `path_texture` | Ein **Ordner**: `GameResources/` + genau das, was du geschrieben hast, ein PNG pro Frame |
| Wolke | `path_sprites` | `GameResources/` + jeder Pfad in der Liste |
| Statuseffekt | `texture` | Ein **Ordner**: `GameResources/effects/` + was du geschrieben hast, ein PNG pro Frame |
| Projektil | `texture` | Ein **Ordner**: `GameResources/effects/projectiles/` + was du geschrieben hast, ein PNG pro Frame |
| Ressource, in der Hand getragen | `path_gameplay_sprite` | Ein **Ordner**: `GameResources/items/resources/` + was du geschrieben hast, ein PNG pro Frame |
| Ressource, Inventar-Icon | `path_icon` | `GameResources/` + was du geschrieben hast. Vanilla nutzt einen bloßen Namen wie `iconResBread`, die Datei liegt also im Wurzelverzeichnis |
| Kachel und Top-Kachel | *(kein Feld)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] "Ein Ordner" ist keine Stilfrage
> Jedes oben als **Ordner** markierte Asset wird mit `getSpriteList()` gelesen, das die Frames *in* einem Ordner zurückgibt. Zeigst du auf ein einzelnes PNG, kommt es leer zurück: Ein Drop fällt unsichtbar, ein Projektil wirft `ArgumentOutOfRangeException` in `QuantumSpriteLibrary.drawProjectiles()`, ein Status wirft in jedem Frame. Ein einziger Frame ist in Ordnung, er muss nur in einem eigenen Ordner liegen: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

Drei davon beißen:

- **Status und Projektil hängen einen Ordner davor.** Schreibst du bei einem Status `texture = "effects/status/myThing"`, sucht das Spiel nach `effects/effects/status/myThing`, und das gibt es nicht. Vanilla-Status nutzen einen bloßen Namen: `fx_status_burning_t`.
- **Kacheln ignorieren die Felder komplett.** Die Grafik einer Kachel wird über ihre **ID** gefunden, in einem eigenen Ordner, weil eine Kachel mehrere Varianten hat. `hello_moss` bedeutet `GameResources/tiles/hello_moss/` mit deinen PNGs darin.
- **Gebäude kleben nichts zusammen, haben aber einen Fallback.** `sprite_path` wird genau so verwendet, wie es geschrieben ist: `"buildings/hello_shrine"` bedeutet `GameResources/buildings/hello_shrine/`. Lässt du es leer, nimmt das Spiel stattdessen `main_path` + ID, und ein Ordner in `main_path` wird zu `buildings/hello_shrine/hello_shrine` :PESgn_Bruh:.

> [!TIP] Kopier den Pfad von einem Vanilla-Asset
> Nimm das ähnlichste Vanilla-Ding, lies sein Feld in **[UnityExplorer](#/toolbox/unity-explorer)** oder mit dem **[Sprite-Pfad-Finder](#/tools/icons)** aus und bilde die Form exakt nach. Das geht schneller als darüber nachzudenken, und es stimmt beim ersten Mal :PESgn_Noice:.

## Eine Datei direkt von der Festplatte einlesen

Manchmal benötigst du die rohe Texturdatei: für einen Fensterrahmen, den du manuell slicen willst, eine Datendatei oder Ähnliches. `ModDeclare` weiß immer, wo deine Mod auf der Festplatte liegt - kodiere daher niemals feste Pfade fest ein.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // Pixel-Art, keine Weichzeichnung
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

`NeoModLoader.utils.SpriteLoadUtils` bietet dir mit `LoadSingleSprite(path)` und `LoadSprites(path)` außerdem bequeme Hilfsfunktionen, falls du es nicht von Hand machen willst.

## Soundeffekte

Jeder Sound in WorldBox ist ein FMOD-Event, das über einen Pfad abgespielt wird. Du kannst jedes davon frei verwenden:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

Der erste Befehl spielt den Sound an den angegebenen Weltkoordinaten ab. HelloBox spielt den Feuerball-Sound ab, wenn seine Kampfaktion einen Funken wirft, siehe **[Projektile, Zauber & Effekte](#/nml/projectiles-spells)**. Um Soundpfade zu finden, durchsuche den Spielcode nach `event:/SFX/`: Es gibt Hunderte, geordnet nach Geräuschkategorien. Dreh die Lautstärke runter, bevor du sie ausprobierst.

### Eigene Sounds hinzufügen

NML patcht FMOD tatsächlich unter der Haube, also funktionieren eigene `.wav`-Dateien, ohne dass du in einer Garage eine zweite Sound-Engine bauen musst :PESgn_Noice:.

Leg deine `.wav`-Datei einfach in `GameResources/`, zum Beispiel:

```text
GameResources/sounds/hello_boom.wav
```

NML hängt sich in `MusicBox.playSound` und `playDrawingSound`, also spielst du sie mit genau derselben Methode wie einen Vanilla-Sound ab (ohne Dateiendung):

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

Neben deiner Datei kannst du mit einer optionalen `hello_boom.json` einstellen, wie sie sich verhält:

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| Feld | Werte |
| --- | --- |
| `Mode` | `Basic` (flaches 2D, Lautstärke bleibt gleich), `Stereo3D` (Vanilla-Abnahme mit der Entfernung), `Mono3D` (gerichtet) |
| `Type` | `Sound` (SFX-Regler), `Music` (Musik-Regler), `UI` (UI-Regler) |
| `Volume` | Standardlautstärke von 0 bis 100 |
| `LoopCount` | Anzahl der Wiederholungen (0 = einmal) |

Das Beste daran: Weil NML sie in die Kanalgruppen des Spiels einhängt, halten sich deine Sounds wirklich an die Lautstärke-Einstellungen des Spielers, statt ihn um Mitternacht taub zu machen.

## Übergib dem Spiel niemals ein Null-Sprite

Ein Button mit fehlendem Sprite ist kein Button mit einem Fragezeichen - es ist ein **unsichtbares Loch** in der Benutzeroberfläche, das der Spieler niemals finden wird. Baue immer einen Fallback ein:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

Ein Warnsymbol sagt dir sofort: "Der Pfad ist falsch". Ein komplett unsichtbarer Button sorgt dagegen dafür, dass du zwei Stunden lang verzweifelt suchst, wo dein Button hin ist :PES4_Invisible:.
