---
title: Den Spielcode lesen (dnSpy)
group: Übersicht
subgroup: Externe Tools & Setup
icon: :wbnerd:
order: 7
---

# Den Spielcode lesen :wbnerd:

Jede einzelne Antwort zum Modden von WorldBox steht bereits geschrieben: Sie steckt direkt im Spiel selbst :wbbru:. **dnSpy** (oder **ILSpy**) wandelt die kompilierte Spieledatei wieder in lesbares C# um. So kannst du exakt nachschlagen, wie eine Methode heißt, welche Parameter sie erwartet und was sie eigentlich anstellt.

Das ist der mit Abstand größte Meilenstein vom "Code-Schnipsel blind kopieren" zum "echten Modden" :3074-woah:.

## Das Spiel öffnen

1. Lade dir [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases) herunter (oder [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases), gleiches Prinzip, andere Knöpfe).
2. Öffne folgende Datei:

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

Diese eine Datei ist der komplette Code des Spiels. Auf der linken Seite bekommst du einen Baum aller Klassen angezeigt: `Actor`, `AssetManager`, `GodPower`, `ScrollWindow`, ausnahmslos alle.

## Die vier Dinge, die du ständig tun wirst

### 1. Eine Klasse nachschlagen

`Ctrl+Shift+K` durchsucht Typen. Tipp `ActorTrait` ein, öffne es, und du siehst jedes Feld, das du setzen kannst, mit seinem Typ und seinem Standardwert:

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

Diese Liste *ist* die Dokumentation für die Seite **[Eigene Merkmale](#/nml/custom-traits)**. Lies auch die **Typen**: `rate_birth` ist ein `int`, also kompiliert `rate_birth = 0.5f` nicht. Derselbe Trick für `ItemAsset`, `BuildingAsset`, `StatusAsset`, alles.

### 2. Die echte Methodensignatur prüfen

Methodennamen zu erraten ist der beste Weg, eine Stunde lang an einem Compiler-Fehler zu verzweifeln. Schlag sie lieber nach. Die Suche nach `addTrait` in `Actor` liefert:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

Jetzt weißt du sicher: Die Methode erwartet einen String, gibt ein Bool zurück und hat ein zweites, optionales Argument.

### 3. Schauen, wie das Spiel es selbst macht

Das ist der beste Trick überhaupt. Du willst ein funktionierendes Weltgesetz? Such nach `WorldLawLibrary`, öffne `init()` und lies, was die Entwickler selbst geschrieben haben:

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

Kopiere diese Struktur, passe die ID und das Icon an, und dein Gesetz funktioniert. Jedes einzelne `*Library.init()` im Spiel ist ein kostenloses Tutorial für den jeweiligen Asset-Typ.

### 4. Alle IDs finden

IDs sind Strings, und bei einem falschen String scheitert das Spiel lautlos. In den `init()`-Methoden sind sie alle versammelt: `TileLibrary.init()` enthält jede Terrain-ID, `ItemLibrary.init()` jede Waffe, `ActorAssetLibrary.init()` jede Kreatur.

## public, internal und du

Beim Lesen werden dir drei Schlüsselwörter vor Methoden auffallen:

| Wort | Was es für dich bedeutet |
| --- | --- |
| `public` | Du kannst es aufrufen. Immer. |
| `internal` | Nur aufrufbar, wenn du gegen eine **publicized** Kopie von `Assembly-CSharp.dll` kompilierst |
| `private` | Du kannst es nicht direkt aufrufen. Finde die öffentliche Methode, die es nutzt, oder patche es (siehe **[Harmony-Patches](#/nml/harmony-patches)**) |

Eine "publicized" DLL ist eine Kopie, in der jedes Mitglied öffentlich gemacht wurde. Die meisten WorldBox-Modder nutzen so eine, und genau deshalb kompiliert Code wie `actor.getHit(...)` bei ihnen problemlos und bei dir nicht. Wenn sich etwas weigert zu kompilieren und dnSpy `internal` anzeigt, hast du des Rätsels Lösung.

> [!TIP] Lass es beim Coden immer geöffnet
> Nicht etwa um "das ganze Spiel durchzulesen", das macht kein vernünftiger Mensch. Öffne es neben deinem Editor und schlage jeden Namen nach, sobald du ihn brauchst. Zwei Sekunden Nachschauen schlagen zwanzig Minuten Fluchen über kryptische Compiler-Fehler :PES_ThumbsUp:.

Wenn du nur den Namen einer Methode und ihre Signatur brauchst, geht die **[Methodensuche](#/tools/methods)** hier auf der Seite schneller: Jede Methode im Spiel, durchsuchbar und mit direkt markiertem `internal`. Komm zu dnSpy zurück, wenn du wissen willst, was die Methode eigentlich *macht*: das kann dir nämlich kein Index der Welt verraten.
