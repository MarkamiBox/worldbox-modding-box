---
title: Remembering things
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbfloppysavewink:
order: 44
---

# Remembering things :wbfloppysavewink:

Sooner or later your mod needs to remember something about one particular unit: how many times it was struck, whether it already got its reward, which shrine it prays at. A static dictionary keyed by the unit forgets everything the moment the player saves and reloads :wbfacepalm:.

The game already has a place for it. Every unit, city, kingdom, building, item and book keeps its state in a data object, and every one of those has a small **custom data** store that goes into the save file with it.

## The store

| Call | What it does |
| --- | --- |
| `data.set(key, value)` | Store an `int`, `long`, `float`, `string` or `bool` under a key |
| `data.get(key, out value, default)` | Read it back. A missing key gives you the default |
| `data.change(key, amount, min, max)` | Add to an `int` and clamp it, in one call |
| `data.addFlag(key)` | Set a flag. Returns `false` if it was already set |
| `data.hasFlag(key)` / `data.removeFlag(key)` | Check or clear it |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | Delete a value |

Each type has its own table, so an `int` and a `string` under the same key do not collide. They still should not share a key, for your own sake. Future you will not remember which one was which.

## Storing complex objects with NML

If five primitives feel like 1995 and you actually need to save an entire class or list onto an actor, NML provides `DataExtension` in `NeoModLoader.General.Game.extensions`: two extension methods, `Set` and `TryGet`, on any of the data objects below.

Wrap your data class in `BasicCustomData<T>`:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

Inside a method with an `Actor actor`, create the value before saving it:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Saving it to the actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Reading it back:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

Under the hood, `Set` turns your object into JSON and stores it with the plain `data.set(key, string)` from the table above. So it is one string per key per unit, and the "keep it small" rule below applies double. Your class needs a parameterless constructor, and its public fields and properties are what gets saved.

If you expect your data format to change across mod updates, implement `ICustomData` on your class instead. It is two methods: `Serialize()` returns a `SerializedCustomData(modId, dataVersion, jObject)`, and `Deserialize(SerializedCustomData)` gets it back. Checking `ModId` and `DataVersion` in there is your job, nobody does it for you. `BasicCustomData<T>` writes placeholder values into both and throws when it reads anything else, so do not mix the two on one key :PES5_Hmmmm:.

> [!NOTE] Checked against NML 1.2.0
> These names and signatures come from the NML assembly itself, not from its docs, which do not mention them. If a newer NML renames something, the compiler will tell you before your players do.

## In HelloBox

A trait that counts every hit its bearer lands, and hands out a reward once, at fifty:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

Save the world, load it again: the count is still there, because it is part of the unit's own save data. The flag is what makes the reward happen once instead of on every hit after the fiftieth. Generous, but still a bug.

Its text, like any trait's:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` is `internal`
> A unit's data field is marked `internal` in the game assembly. NML compiles your mod against a **publicized** copy, so it just works in a normal source mod. It only breaks when you build your own `.dll` against the stock assembly: see **[Troubleshooting](#/troubleshooting)**. A city's and a kingdom's `data` are public anyway.

## Where it lives

| Object | Its data |
| --- | --- |
| A unit | `actor.data` |
| A city | `city.data` |
| A kingdom | `kingdom.data` |
| A building | `building.data` |
| Cultures, religions, clans, languages, families, armies, plots | their `data`, all the same store |

## Things to know

- **Prefix your keys.** Every mod writes into the same store. `hello_hits` will not collide with anybody; `hits` will, eventually.
- **Removing the mod is safe.** The keys stay in the save, nobody reads them, nothing breaks. That is the whole advantage over patching the game's own save format.
- **Empty stores cost nothing.** The game drops empty tables before it writes the save, so a key you removed is really gone.
- **Keep it small.** It is saved with every unit. A counter or a flag per unit is free; a long string per unit on a world of ten thousand creatures is a bigger save for everybody.

## The whole world

Some state belongs to no unit at all: how many meteors your power has dropped on this world, whether the one-time blessing already happened. The world has the same store, in its map stats:

```csharp
// map_stats is internal: fine in an NML source mod, same deal as actor.data above
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() clamps to 1000 unless you say otherwise
if (world.addFlag("hello_blessed")) { /* first time on this world only */ }
```

`SaveCustomData` is the same `BaseSystemData` store, so every call in the table at the top works, and so do NML's `Set` / `TryGet`. It is saved with the rest of the map stats, so each save slot has its own. A freshly generated world starts empty. The game creates the store whenever it builds or loads the map stats, so the null check should never fire; it costs nothing, keep it.

> [!TIP] Settings or world data?
> Ask whether the player would expect the value to change when they load a different save. "How strong is the meteor power" does not: that is **[Mod settings](#/nml/mod-config)**, shared by every world. "Has this world been blessed" does: that is `custom_data`.

## Time that survives a save

`Time.time` is seconds since the game was launched. Store it in a unit's data, save, restart, load, and every timestamp you wrote is from a previous life :wbfacepalm:.

The world keeps its own clock, and it is saved with the map:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in world seconds: 5 is a month, 60 is a year
double now = World.world.getCurWorldTime();

// the store has no double, a float is plenty for a timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

It also stops when the game is paused and runs faster at higher speeds, which is nearly always what you meant. `Date.getYearsSince(at)` and `Date.getMonthsSince(at)` do the division for you.

## Running code after a world loads

Everything above is read on demand, so usually you do not need to know when a world loaded. When you do, say to rebuild a cache of your own, these are the methods mods hook with **[Harmony](#/nml/harmony-patches)**:

| Method | When it runs |
| --- | --- |
| `MapBox.clearWorld` (public) | Before any world is generated or loaded. Drop your static caches here |
| `SaveManager.loadActors` (private) | While loading a save, right after the units are rebuilt |
| `MapBox.finishMakingWorld` (public) | Near the end of both generating and loading a world |
| `SaveManager.saveWorldToDirectory` (public, static) | On a save, manual or auto. A Prefix is your last chance to write into the store |
| `MapBox.addLastStep` (private) | Once, when the game starts. Not per world |
| `MapBox.OnApplicationQuit` (private) | The game is closing |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // a cached copy for code that reads it every frame; the save keeps the real one
        public static int MeteorsThisWorld;

        // runs for a brand new world and for a loaded save alike
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

Private methods take the name as a string, `[HarmonyPatch(typeof(SaveManager), "loadActors")]`, as the Harmony page explains. The loading screen is still up when `finishMakingWorld` runs; a couple of steps follow it.

## Your own files

Plenty of mods skip all of this and write a JSON file with `File.WriteAllText`, usually under `Application.persistentDataPath`, which is the `LocalLow\mkarpenko\WorldBox` folder next to `Player.log`. That is fine for things that belong to the **player**: a list of favourite units they exported, stats across every game they ever played.

It is wrong for things that belong to a **world**. The file does not know which save slot is loaded. The player blesses a kingdom in slot 1, loads slot 2, and slot 2 is blessed too. Then they delete slot 1 and your file keeps its state forever :PES2_F:. If it should change when the save changes, it goes in the save, in one of the stores above.

## Where next

For values the player picks once and every world shares, see **[Mod settings](#/nml/mod-config)**. For code that checks something every frame, or every in-game month, see **[Every frame](#/nml/update-loops)** :PES_OkHand:.
