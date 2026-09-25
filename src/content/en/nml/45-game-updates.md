---
title: Updating after a game update
group: NML Modding
subgroup: Advanced & Publishing
icon: :wbsettingsgear:
order: 47
---

# Updating after a game update :wbsettingsgear:

WorldBox updated, and your mod is red in the list. Welcome to modding, this happens to everybody and it will happen again :PES2_Shrug:.

Your mod calls the game's own code. When the developers rename a method, move a field or change what a method takes, your code is pointing at something that is no longer there. It is not broken beyond repair, it is just out of date. This page is the order I go through it in, every time.

## 1. Update NML first

Before touching your own code, grab the newest **`NeoModLoader.dll`** from the **[Install NML](#/install-nml)** page. A big game update usually gets a new NML too, and an old loader on a new game fails in ways that look exactly like your fault.

If NML itself does not load, you are not at your mod yet. Check **[the game is on an old version](#/troubleshooting)** in troubleshooting, then come back.

## 2. Read the first error

Start the game, then open `Player.log` (where it lives: **[Logs & debugging](#/nml/logs-and-debugging)**). Find your mod's first error and ignore everything below it for now. Errors cascade, and fixing the first one often makes five others disappear.

After an update you will mostly see these:

| Error | What changed in the game |
| --- | --- |
| `CS0117: 'X' does not contain a definition for 'Y'` | A field or static method was renamed or removed |
| `CS1061: 'X' does not contain a definition for 'Y'` | Same, but on an object: `actor.someMethod()` is gone |
| `CS0246: The type or namespace name 'X' could not be found` | A whole class was renamed or moved |
| `CS7036` / `CS1501` | The method still exists, but takes different arguments now |
| `CS0122: 'X' is inaccessible due to its protection level` | Something you used became `internal`, see **[that entry](#/troubleshooting)** |
| `CS0029` / `CS0266` | A field changed type, say from `int` to `float` or from a string to an asset |
| `HarmonyException` / `MissingMethodException` at startup | A method you **patch** was renamed. Your code compiles, the patch has nothing to attach to |

The last one is the sneaky one. A patch that names its method as a plain string, like `"updateStats"`, is only checked when the game starts. So a rename does not stop your mod compiling, it stops it working. Patches written with `nameof` get a normal compile error instead, which is one more reason to use it where you can (**[two ways to write the method name](#/nml/harmony-patches)**).

## 3. Find the new name

The old name is gone, so look for its replacement:

- **[Method search](#/tools/methods)** on this site. Type what the method *did*, not what it was called: "add trait to unit" finds it even if the name changed.
- **[Asset fields](#/tools/fields)** for asset fields. Search the part of the name you remember.
- **dnSpy**, which is always right, because it reads the game you actually have. The search tools here are rebuilt after updates, but they can lag behind a fresh one for a few days. How to use it: **[Reading the game's code](#/toolbox/reading-the-game-code)**.

The trick I use most: open the vanilla asset or method that does the same job as yours and see how **the game itself** writes it now. If the game changed how traits are built, its own traits already use the new way :PESgn_Noice:.

### Names that no longer exist

Old mods, old tutorials and old forum posts are full of these. None of them is in the current game, so each one is a compile error, or, for the template ids, a `clone()` that throws `KeyNotFoundException` at startup:

| Old name | What to use now |
| --- | --- |
| `AssetManager.unitStats` | `AssetManager.actor_library`. Creatures are `ActorAsset`s, see **[Custom actors](#/nml/custom-actors)** |
| `AssetManager.raceLibrary` | No direct replacement. What a race used to hold now lives on the `ActorAsset` itself |
| `AssetManager.nameGenerator` | `AssetManager.name_generator`, see **[Name generators](#/nml/name-generators)** |
| `AssetManager.items_material_weapon`, `items_material_accessory` | No replacement library. Each material is its own item in `AssetManager.items` (`sword_iron`, `sword_steel`), see **[Custom items](#/nml/custom-items)** |
| `"!building"` (building template) | `"$building$"` in `AssetManager.buildings` |
| `"_spawn_building"` (drop template) | `"$spawn_building$"` in `AssetManager.drops` |
| `"_dropBuilding"` (god power template) | `"$template_drop_building$"` in `AssetManager.powers` |

The pattern in the last three is the one to remember: templates are now wrapped in `$`. If an old `clone()` uses an id starting with `_` or `!`, look in the same library's `init()` for the `$...$` version.

## 4. Check your Harmony patches by hand

A patch can also go wrong without any error at all. Go through each one and check the method in dnSpy:

- **Parameter names.** Harmony fills parameters **by name**. If the game renamed `pDamage` to `pAmount`, your `float pDamage` no longer binds and Harmony fails while applying the patch. See **[the magic parameter names](#/nml/harmony-patches)**.
- **Overloads.** A method that used to be unique may now have a twin, and your patch fails with `Ambiguous match found`.
- **What the method does.** Sometimes the name stays but the logic moves somewhere else. Your patch runs and nothing changes. Put a `LogInfo` line in the patch: if it never prints, the game stopped calling that method.

## 5. Look for things that stopped doing anything

Compiling again is not the finish line. Load a world and check that every piece still works: the trait shows its icon, the item drops, the power spawns what it should.

A new update can add a field that vanilla assets now fill in and yours do not. The asset loads, no error, and it just does nothing. Compare your asset field by field with the closest vanilla one in its library's `init()`. Whatever the game now sets and you do not is your suspect.

## 6. Test an old save too

Load a world saved **before** the update, with your mod on. Custom data stored on units (**[Saving data](#/nml/saving-data)**) should come back as it was. If you renamed an id while fixing things, old saves still use the old id, so rename only if you really have to.

## 7. Release it

- Bump `version` in `mod.json`.
- Say which game version it works with in your description and changelog, so players know which one to grab.
- Upload the new zip the same way as before: **[Publishing](#/nml/publishing)**.

Then answer the "is this updated??" comments, you earned it :wbsalut:.

## Making the next update hurt less

- **Patch less.** Every Harmony patch is a spot that can break. If an asset field or an NML feature can do the job, use that instead.
- **Wrap your code in try/catch.** One broken feature logs an error, the rest of your mod keeps working. See **[Logs & debugging](#/nml/logs-and-debugging)**.
- **One patch class per job.** It makes failures easier to isolate. It does not isolate `PatchAll` failures: a missing target can stop the scan before later patches are applied. Use guarded manual patching for optional targets.
- **Keep your ids in one place.** Constants like `HelloTraits.SWIFT` mean a rename is one edit, not twenty.
