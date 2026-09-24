---
title: Asset libraries
group: Game Content
subgroup: Architecture & Stats
icon: :wbbrain:
order: 90
---

# Asset libraries :wbbrain:

Before any of the pages after this one make sense, you need this one. Every single thing in WorldBox (a trait, a weapon, a building, a tile, a cloud, a kingdom) is an **asset** sitting in a **library**, and every library in the game is the same class with the same four methods.

Learn them once here and the other thirty pages become "which library, which fields".

## What a library is

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // everything, in order
    public Dictionary<string, T> dict;   // everything, by id
}
```

That is it. A list and a dictionary, both public, both yours to read and change. `AssetManager` holds 129 of them. See **[Every asset library](#/nml/asset-index)** for the full index.

## The four methods

```csharp
AssetManager.traits.has("hello_swift");            // is this id taken?
AssetManager.traits.get("hello_swift");            // fetch it, or null
AssetManager.traits.add(myTrait);                  // register a new asset
AssetManager.traits.clone("hello_new", "brave");   // copy an existing one and register the copy
```

### `has(id)`

Returns `true` if the id is registered. **The first line of every `Initialize()` you write should be one of these**:

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

Without it, a mod reload registers everything twice.

### `get(id)`

Returns the live asset, or `null` if there is no such id. It does **not** throw, so the null lands somewhere further away from the mistake:

```csharp
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // always. every time.
```

`get` returning the *live* object is the most useful thing on this page. It means you can change vanilla content without replacing it:

```csharp
// Make vanilla dragons tougher, without touching anything else about them.
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

Registers a new asset. Three things happen inside it that you need to know about:

1. **If the id is already taken, the old asset is removed and yours replaces it**, with this in the log:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   That is how one mod silently breaks another. Prefix your ids.
2. `create()` runs on the asset.
3. **The library allocates `base_stats`** (and `base_stats_meta`, where the asset has one). This is why the rule everywhere else in this guide is "stats after `add()`".

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- allocates the stat block
swift.base_stats["speed"] = 20f;       // <- safe only after that line
```

Get that order wrong and you get the most common crash in WorldBox modding:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

Copies every serialisable field of `sourceId` into a brand new object, gives it `newId`, **and calls `add()` on it**. It returns the copy.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // change what you care about
shrine.base_stats["health"] = 200;         // already allocated, because add() ran
```

> [!WARNING] Never call `add()` after `clone()`,
> A second `add()` removes the first copy, logs `duplicate asset overwriting...`, and re-adds it. It works, but it is log noise that makes real errors harder to spot.

Cloning is the correct default for anything with more than about ten fields: buildings, actors, items, tiles. You inherit a configuration that is known to work, and you only have to understand the fields you change.

## Templates

Libraries keep half-finished assets whose id starts with `$` or `_`. They are registered in `dict` but kept out of `list`, so they never show up in game, they exist purely to be cloned.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

A template is almost always a better clone source than a finished asset, because you do not inherit the donor's identity along with its wiring. The exception is art: cloning `human` gives you human sprites, and a creature you can actually see beats a correct creature you cannot :PES4_AlrightThen:.

## Listing what exists

The fastest way to answer "what ids can I clone from" is to print them:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

Two lines, and you never have to guess an id again. `list` excludes templates; `dict.Keys` includes them.

## Reordering

`list` is an ordinary `List<T>`, and the game draws groups and categories in list order. So you can put your asset exactly where you want it:

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## When your code runs

The game builds all 129 libraries at startup, then runs `post_init()` on them, **then** NML loads your mod. Two consequences people trip on constantly, me included:

- **Anything a library does automatically in `post_init` has already happened.** Actor traits, for instance, get a default `path_icon` filled in there. Yours does not, because your trait did not exist yet. Set it yourself.
- **Every vanilla asset already exists when your `OnModLoad` runs.** So `get("human")` works, `clone(..., "human")` works, and editing vanilla content in place works. You are never too early.

> [!NOTE] Patching these methods does not touch vanilla content
> `has`, `get`, `add`, `clone` and `post_init` all run on the 129 libraries during game startup, before NML loads a single mod. A Harmony patch on any of them only affects calls made *after* your mod loads. It never touches the vanilla registration that already happened by then. Want different vanilla content? Change it afterward with `get()`, the way the rest of this page does.

## The pattern every page after this one uses

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. never register twice
            if (AssetManager.<library>.has(ID)) return;

            // 2. clone if there is something close, build if there is not
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. change the fields you care about
            asset.some_field = true;

            // 4. stats last
            asset.base_stats["damage"] = 10;
        }
    }
}
```

Every asset page in this guide is that shape with different nouns. If a page ever confuses you, come back here :PESgn_GoOn:.

## Four rules, for the wall above your desk

1. **`has()` first.** Never register the same id twice.
2. **`clone()` already calls `add()`.** Never call both.
3. **`base_stats` exists only after `add()`.** Stats last.
4. **Prefix your ids.** `hello_swift`, never `swift`. One flat namespace, shared with every other mod.
