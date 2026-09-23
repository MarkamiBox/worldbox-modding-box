---
title: The world at runtime
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# The world at runtime :wbworld:

Every other page registers things while the game loads. This one is for the other half: grabbing what already exists in a running world and changing it. Destroy a town, hand it to another kingdom, start a war, fill a city with its own people.

All of it runs from a god power's `click_action`, from `Update()`, or from a world behaviour, and **never** from `OnModLoad`, where there is no world yet. See **[Logs & debugging](#/nml/logs-and-debugging)** for the guard.

## Looping over what exists

```csharp
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

`World.world.kingdoms` works the same way, see **[Kingdoms & factions](#/nml/kingdoms)**. `isRekt()` on every item, every time: these lists hold objects that are dying right now.

## Moving a city to another kingdom

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

`pCaptured: true` counts it as conquered for the statistics, `pRebellion: true` as a rebellion. The units follow their city.

## Destroying things

```csharp
city.destroyCity();              // the city is gone, its zones go back to nobody
building.startDestroyBuilding(); // falls into ruins if it has ruin art, then disappears
```

`destroyCity()` is public. `startDestroyBuilding()` is `internal`: it compiles because NML builds your mod against the publicized assembly. To wipe out a kingdom, destroy its cities one by one: loop over a copy of `kingdom.cities`, not the live list, because every `destroyCity()` changes it.

## Starting a war

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

`internal`, same as above. The war types are the static fields on `WarTypeLibrary`: `normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`.

## Filling a city with its own people

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

`spawnNewUnit` from **[Custom actors](#/nml/custom-actors)** picks the subspecies for you. `createNewUnit` lets you choose it, which is the difference between "a human" and "one of *these* humans".

## Parents

```csharp
foreach (Actor parent in actor.getParents())
{
    // only the living ones
}

long first = actor.data.parent_id_1;   // the ids stay after death
```

`getParents()` only returns parents that are still alive: it looks each id up with `World.world.units.get(id)` and skips anything that is missing or dead. The ids stay in the unit's data forever, but the game keeps no record of the people behind them. A family tree that remembers the dead has to write what it needs into each child's own data at birth, see **[Remembering things](#/nml/saving-data)**, because there is no place to keep something for the whole world :PES_ThinkAboutIt:.
