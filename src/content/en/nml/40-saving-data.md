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

> [!NOTE] Storing something bigger than five primitives
> NML has its own utility for stuffing an entire object into a unit's data, not just `int`/`long`/`float`/`string`/`bool`. I have never needed more than a counter or a flag, so I cannot walk you through it here. It exists, if a whole struct or list is what you need to remember.

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

For everything that is not tied to one object, a whole-world setting for example, use your mod's settings instead: see **[Mod settings](#/nml/mod-config)** :PES_OkHand:.
