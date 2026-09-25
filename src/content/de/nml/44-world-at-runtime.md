---
title: Die Welt zur Laufzeit
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# Die Welt zur Laufzeit :wbworld:

Alle anderen Seiten registrieren Dinge während des Spielstarts. Diese Seite widmet sich der anderen Hälfte: Bestehendes in einer laufenden Welt zu manipulieren. Eine Stadt zerstören, sie einem anderen Königreich (kingdom) übergeben, einen Krieg (war) entfachen, eine Stadt mit ihren eigenen Bewohnern bevölkern.

All das wird aus der `click_action` einer Gotteskraft, aus `Update()` oder aus einem World Behaviour ausgeführt – und **niemals** aus `OnModLoad`, wo noch gar keine Welt existiert. Siehe **[Logs & Debugging](#/nml/logs-and-debugging)** für die Sicherheitsabfrage und **[Jeder Frame](#/nml/update-loops)**, um es aus `Update()` auszuführen, ohne die Framerate des Spielers zu belasten.

## Durch Bestehendes iterieren

```csharp
if (World.world == null || Config.worldLoading) return;

foreach (City city in World.world.cities)
{
    if (city == null || city.isRekt()) continue;
    // city.kingdom, city.units, city.buildings, city.zones
}

foreach (Building building in World.world.buildings)
{
    if (building == null || building.isRekt()) continue;
}
```

`World.world.kingdoms` funktioniert genauso, siehe **[Königreiche & Fraktionen](#/nml/kingdoms)**. Führe `isRekt()` auf jedem Element aus, ausnahmslos: Diese Listen enthalten Objekte, die genau in diesem Moment sterben :PES2_F:.

Eine Schleife wie diese ist einmalig bei einem Klick völlig in Ordnung. In jedem Frame über jedes Gebäude ist sie das nicht: Führe sie über einen Timer aus, siehe **[Jeder Frame](#/nml/update-loops)**.

## Eine Stadt an ein anderes Königreich übergeben

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` zählt sie in den Statistiken als erobert, `pRebellion: true` als Rebellion. Die Einheiten folgen ihrer Stadt.

## Dinge zerstören

```csharp
city.destroyCity();              // die Stadt verschwindet, ihre Zonen werden wieder frei
building.startDestroyBuilding(); // zerfällt zu Ruinen, falls Ruinengrafik existiert, verschwindet dann
```

`destroyCity()` ist öffentlich. `startDestroyBuilding()` ist `internal`: Es kompiliert, weil NML deine Mod gegen das publicized Assembly baut. Um ein Königreich zu vernichten, zerstöre seine Städte nacheinander: Iteriere über eine Kopie von `kingdom.cities`, nicht über die aktive Liste, da jedes `destroyCity()` diese verändert.

## Einen Krieg entfachen

```csharp
if (World.world == null || Config.worldLoading || pAttacker == null || pDefender == null) return;
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, wie oben. Die Kriegstypen sind die statischen Felder in `WarTypeLibrary`: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Eine Stadt mit ihren eigenen Bewohnern füllen

```csharp
if (World.world == null || Config.worldLoading || city == null || city.isRekt()) return;

Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` aus **[Eigene Kreaturen](#/nml/custom-actors)** wählt die Unterart (subspecies) für dich aus. `createNewUnit` lässt dich selbst wählen – der Unterschied zwischen "einem Menschen" und "einem von *diesen* Menschen".

## Eltern

```csharp
foreach (Actor parent in actor.getParents())
{
    // nur diejenigen, die noch leben
}

long first = actor.data.parent_id_1;   // IDs bleiben nach dem Tod erhalten
```

`getParents()` gibt nur noch lebende Eltern zurück: Es schlägt jede ID über `World.world.units.get(id)` nach und überspringt fehlende oder tote. Die IDs verbleiben für immer in den Einheitsdaten, aber das Spiel führt keine Historie über die Personen dahinter. Ein Stammbaum, der sich an Tote erinnern soll, muss die nötigen Informationen bei der Geburt in die Daten jedes Kindes schreiben, siehe **[Daten speichern](#/nml/saving-data)**. Die Welt verfügt zwar auch über einen eigenen Speicher, aber das ist eine einfache flache Liste von Schlüsseln und kein Ort, um zehntausend Stammbäume zu verwalten :PES_ThinkAboutIt:.
