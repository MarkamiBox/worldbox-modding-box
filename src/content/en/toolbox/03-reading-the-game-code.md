---
title: Reading the game's code (dnSpy)
group: Overview
subgroup: External Tools & Setup
icon: :wbnerd:
order: 7
---

# Reading the game's code :wbnerd:

Every answer about WorldBox modding is already written down: it is inside the game itself  :wbbru: . **dnSpy** (or **ILSpy**) turns the game's compiled file back into readable C#, so you can look up exactly what a method is called, what it takes, and what it does.

This is the single biggest jump from "copying snippets" to "actually modding"  :3074-woah: .

## Open the game

1. Download [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases) (or [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases), same idea, different buttons).
2. Open this file:

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

That one file is the entire game's code. On the left you get a tree of every class: `Actor`, `AssetManager`, `GodPower`, `ScrollWindow`, all of them.

## The four things you will do constantly

### 1. Look up a class

`Ctrl+Shift+K` searches types. Type `ActorTrait`, open it, and you see every field you can set, with its type and its default value:

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

That list *is* the documentation for the **[Custom traits](#/nml/custom-traits)** page. Read the **types** too: `rate_birth` is an `int`, so `rate_birth = 0.5f` does not compile. Same trick for `ItemAsset`, `BuildingAsset`, `StatusAsset`, anything.

### 2. Check a method's real signature

Guessing method names is how you spend an hour on a compile error. Look it up instead. Searching `addTrait` in `Actor` gives:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

Now you know it takes a string, returns a bool, and there is a second optional argument.

### 3. See how the game does it

This is the good one. Want a working world law? Find `WorldLawLibrary`, open `init()`, and read what the game itself writes:

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

Copy that shape, change the id and the icon, and your law works. Every `*Library.init()` in the game is a free tutorial for that asset type.

### 4. Find all the ids

Ids are strings, and a wrong string fails silently. `init()` methods are where they all are: `TileLibrary.init()` has every terrain id, `ItemLibrary.init()` every weapon, `ActorAssetLibrary.init()` every creature.

## public, internal and you

While reading you will see three words in front of methods:

| Word | What it means for you |
| --- | --- |
| `public` | You can call it. Always. |
| `internal` | Only callable if you build against a **publicized** copy of `Assembly-CSharp.dll` |
| `private` | You cannot call it. Find the public method that calls it, or patch it (see **[Harmony patches](#/nml/harmony-patches)**) |

A "publicized" DLL is a copy where every member is public. Most WorldBox modders use one, and it is why code like `actor.getHit(...)` compiles for them and not for you. If something refuses to compile and dnSpy says `internal`, that is the whole explanation.

> [!TIP] Keep it open while you write
> Not "read the whole game", nobody does that. Open it next to your editor and look up each name as you use it. Two seconds there beats twenty minutes of a compile error you do not understand :PES_ThumbsUp:.

When you only need a method name and its signature, the **[Method search](#/tools/methods)** on this site is quicker: every method in the game, searchable in plain English, with `internal` already flagged. Come back to dnSpy when you need to read what the method actually *does*: that is the part no index can give you.
