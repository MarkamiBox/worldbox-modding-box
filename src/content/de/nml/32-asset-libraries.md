---
title: Asset-Bibliotheken
group: Spielinhalte
subgroup: Architektur & Statistiken
icon: :wbbrain:
order: 90
---

# Asset-Bibliotheken :wbbrain:

Bevor irgendeine der folgenden Seiten Sinn ergibt, brauchst du diese hier. Jedes einzelne Element in WorldBox (eine Eigenschaft (trait), eine Waffe, ein Gebäude (building), eine Kachel (tile), eine Wolke (cloud), ein Königreich (kingdom)) ist ein **Asset**, das in einer **Bibliothek** (library) liegt. Und jede Bibliothek im Spiel ist dieselbe Klasse mit denselben vier Methoden.

Lerne sie hier einmal, und die anderen dreißig Seiten reduzieren sich auf: "Welche Bibliothek, welche Felder".

## Was eine Bibliothek ist

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // alles, der Reihe nach
    public Dictionary<string, T> dict;   // alles, nach ID
}
```

Das ist schon alles. Eine Liste und ein Dictionary - beide öffentlich, beide für deine Mod les- und veränderbar. `AssetManager` verwaltet 129 davon. Siehe **[Alle Asset-Bibliotheken](#/nml/asset-index)** für das vollständige Verzeichnis.

## Die vier Methoden

```csharp
AssetManager.traits.has("hello_swift");            // ist diese ID vergeben?
AssetManager.traits.get("hello_swift");            // abrufen oder null
AssetManager.traits.add(myTrait);                  // ein neues Asset registrieren
AssetManager.traits.clone("hello_new", "brave");   // ein bestehendes kopieren und die Kopie registrieren
```

### `has(id)`

Gibt `true` zurück, wenn die ID bereits registriert ist. **Die erste Zeile jedes `Initialize()`, das du schreibst, sollte so aussehen**:

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

Ohne diese Zeile registriert ein Neuladen der Mod alles doppelt.

### `get(id)`

Gibt das aktive Live-Asset zurück oder `null`, falls keine solche ID existiert. Es wirft **keine** Exception, sodass der Null-Fehler erst irgendwo weit entfernt vom eigentlichen Versehen knallt:

```csharp
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // immer. ausnahmslos jedes Mal.
```

Dass `get` das *echte, aktive* Objekt zurückgibt, ist das Nützlichste auf dieser ganzen Seite. Es bedeutet, dass du Vanilla-Inhalte anpassen kannst, ohne sie ersetzen zu müssen:

```csharp
// Mache Vanilla-Drachen zäher, ohne irgendetwas anderes an ihnen zu verändern.
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

Registriert ein neues Asset. Dabei passieren intern drei Dinge, die du unbedingt wissen musst:

1. **Ist die ID bereits vergeben, wird das alte Asset entfernt und deines ersetzt es**, begleitet von diesem Log-Eintrag:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   So bricht eine Mod heimlich die andere. Setze Präfixe vor deine IDs.
2. `create()` wird auf dem Asset aufgerufen.
3. **Die Bibliothek initialisiert `base_stats`** (sowie `base_stats_meta`, sofern das Asset eines besitzt). Deshalb lautet die goldene Regel überall in diesem Leitfaden: "Werte (stats) erst nach `add()`".

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- allokiert den Werteblock
swift.base_stats["speed"] = 20f;       // <- erst ab hier sicher!
```

Verdrehst du diese Reihenfolge, erntest du den häufigsten Absturz im gesamten WorldBox-Modding:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

Kopiert jedes serialisierbare Feld von `sourceId` in ein brandneues Objekt, weist ihm `newId` zu **und ruft automatisch `add()` dafür auf**. Es gibt die Kopie zurück.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // passe nur an, was dich interessiert
shrine.base_stats["health"] = 200;         // bereits allokiert, da add() lief
```

> [!WARNING] Niemals `add()` nach `clone()` aufrufen
> Ein zweites `add()` entfernt die erste Kopie, loggt `duplicate asset overwriting...` und fügt sie erneut hinzu. Das funktioniert zwar technisch, erzeugt aber unnötigen Müll im Log, der echte Fehler verschleiert.

Klonen ist der beste Standard für alles mit mehr als zehn Feldern: Gebäude, Akteure, Gegenstände (item), Kacheln. Du erbst eine funktionierende Konfiguration und musst nur die Felder verstehen, die du gezielt verändern willst.

## Vorlagen

Bibliotheken enthalten halbfertige Assets, deren ID mit `$` oder `_` beginnt. Sie sind in `dict` registriert, werden aber bewusst aus `list` herausgehalten. Sie tauchen nie im Spiel auf - sie existieren einzig und allein, um geklont zu werden.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

Eine Vorlage ist fast immer eine bessere Klonbasis als ein fertiges Asset, weil du nicht die Identität des Spenders mit seiner Verdrahtung erbst. Die Ausnahme ist Art: Durch das Klonen von `human` erhältst du menschliche Sprites - und eine Kreatur, die man tatsächlich sehen kann, schlägt eine unsichtbare korrekte Kreatur jedes Mal :PES4_AlrightThen:.

## Vorhandene Assets auflisten

Der schnellste Weg herauszufinden, welche IDs du klonen kannst, ist, sie einfach auszugeben:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

Zwei Zeilen, und du musst nie wieder eine ID erraten. `list` schließt Vorlagen aus; `dict.Keys` enthält sie alle.

## Reihenfolge anpassen

`list` ist ein gewöhnliches `List<T>`, und das Spiel zeichnet Gruppen und Kategorien exakt in Listenreihenfolge. Du kannst dein Asset also punktgenau platzieren:

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## Wann dein Code ausgeführt wird

Das Spiel baut beim Start alle 129 Bibliotheken, führt dann `post_init()` auf ihnen aus, **dann** lädt NML deine Mod. Zwei Folgen, über die Leute ständig stolpern, ich eingeschlossen:

- **Alles, was eine Bibliothek automatisch in `post_init` erledigt, ist schon passiert.** Akteur-Merkmale zum Beispiel bekommen dort einen Standard-`path_icon`. Deins nicht, weil dein Merkmal da noch nicht existierte. Setz ihn selbst.
- **Jedes Vanilla-Asset existiert schon, wenn dein `OnModLoad` läuft.** Also funktioniert `get("human")`, `clone(..., "human")` funktioniert, und Vanilla-Inhalte direkt zu bearbeiten funktioniert. Du bist nie zu früh.

> [!NOTE] Diese Methoden zu patchen berührt keine Vanilla-Inhalte
> `has`, `get`, `add`, `clone` und `post_init` laufen alle beim Spielstart auf den 129 Bibliotheken, bevor NML auch nur eine Mod lädt. Ein Harmony-Patch auf eine davon betrifft nur Aufrufe *nach* dem Laden deiner Mod. Er berührt nie die Vanilla-Registrierung, die bis dahin schon passiert ist. Willst du andere Vanilla-Inhalte? Ändere sie danach mit `get()`, so wie der Rest dieser Seite es macht.

## Das Standardmuster aller folgenden Seiten

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. niemals doppelt registrieren
            if (AssetManager.<library>.has(ID)) return;

            // 2. klonen wenn etwas Ähnliches existiert, neu bauen wenn nicht
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. gewünschte Felder anpassen
            asset.some_field = true;

            // 4. Statistiken und Werte immer zuletzt
            asset.base_stats["damage"] = 10;
        }
    }
}
```

Jede Asset-Seite in diesem Leitfaden hat genau diese Form mit anderen Substantiven. Wenn dich eine Seite verwirrt, komm hierher zurück :PESgn_GoOn:.

## Vier goldene Regeln für die Wand über deinem Schreibtisch

1. **`has()` zuerst.** Registriere niemals dieselbe ID zweimal.
2. **`clone()` ruft bereits `add()` auf.** Rufe niemals beides auf.
3. **`base_stats` existiert erst nach `add()`.** Werte immer zuletzt.
4. **Präfixe für deine IDs.** `hello_swift`, niemals `swift`. Es gibt nur einen einzigen globalen Namensraum, den du mit allen anderen Mods teilst.
