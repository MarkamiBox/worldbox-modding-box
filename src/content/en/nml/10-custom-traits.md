---
title: Custom traits
group: Game Content
subgroup: Traits & Genetics
icon: :wbstrongminded:
order: 100
---

# Custom traits :wbstrongminded:

A trait is a permanent label on a unit: *brave*, *fast*, *immortal*. It shows in the inspector, it can change the unit's stats, it can run code when the unit is born, hit, or dies, and children can inherit it.

It is also the cheapest thing in the game to add, which is why it is everybody's first mod. Mine was not: my first mod was a wrapper around somebody else's mod, which is its own kind of cheating :trollface:.

## Prefix your ids, always

Every asset in WorldBox lives in one flat list keyed by `id`. If you register `fast` and another mod registers `fast`, the second one **overwrites** the first and the log gets one line about it that nobody reads.

So: `hello_swift`, not `swift`. Short mod name, underscore, your name for the thing. Do this for traits, items, buildings, powers, statuses, everything :aPES4_Noted:.

## The trait

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // The id written once. Every other file refers to HelloTraits.SWIFT, so a typo
        // becomes a compile error instead of a trait that silently does nothing.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // Never register the same id twice. The library logs an error and overwrites.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconHelloSwift",   // your own file, see below
                group_id = "physique",              // which tab of the trait book it sits in
                rate_birth = 0,                     // 0 = never appears on its own
                can_be_given = true,                // the player can add it in the editor
                can_be_removed = true,
                can_be_cured = false
            };

            // add() registers the trait AND allocates its stat block. Both, in that order.
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

And one line in `Main.cs`:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### What each part does

- **`AssetManager.traits`**: the library that holds every actor trait in the game, vanilla and modded. `has`, `get`, `add` and `clone` are the four methods you will use on every library on every page after this one.
- **`path_icon`**: the small picture in the inspector. A *path*, not a file. See **[Sprites & resources](#/nml/sprites-and-resources)**. The game only fills this in automatically while its own libraries are building, which happens before any mod loads, so for your trait it is empty unless you set it.
- **`needs_to_be_explored`**: `true` by default, which means the trait stays locked in the knowledge book until the player finds it in a world. `false` makes it available from the first second. HelloBox sets it on everything, so you can see what you built without hunting for it.
- **`group_id`**: which tab of the trait book it appears under. The full list is below.
- **`rate_birth`**: the chance a newborn gets it naturally. `0` means "only if something gives it".
- **`can_be_given` / `can_be_removed`**: whether the player can add or strip it in the trait editor. Both default to `true`; set one to `false` for a trait that is meant to be permanent or granted only by your own code.
- **`base_stats[...]`**: the bonuses. The complete list of stat names is on the **[Stats reference](#/nml/stats)** page.

> [!WARNING] Stats go **after** `add()`, always
> A freshly built `ActorTrait` has no stat block. The library allocates it inside `add()`. Touch `base_stats` before that line and you get the most common crash in WorldBox modding:
> `NullReferenceException: Object reference not set to an instance of an object`
>
> Same rule for statuses, items, buildings and actors. The exception is `clone()`, which calls `add()` for you, so after a clone the stats are already there.

> [!TIP] The same switch exists on most things you make
> `needs_to_be_explored` lives on the base class every unlockable asset shares, so it works on actors, all seven kinds of trait, items, item modifiers and world laws. God powers, statuses, buildings, drops, clouds, tiles and projectiles have no discovery step at all :wbsmirk:.

### The vanilla trait groups

`group_id` must be one that exists, or your trait lands nowhere:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

Want your own tab instead? See **[Trait groups & tabs](#/nml/trait-groups)**.

## The text

Without translations your trait shows in game as the raw key `trait_hello_swift`, which looks exactly as professional as it sounds :pepeclown:. Create `Locales/en.json`:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

The key is **not** the bare id. Every trait kind prefixes it with its own type name:

| Trait kind | Name key | Tooltip key |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

There is a second description line too, `<prefix>_<id>_info_2`, used by traits that need one.

## Your own icon

`path_icon` is a path, and the file goes at that exact path inside your mod's `GameResources/` folder. No extension in the string.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

Trait icons are small, and the game draws them at about 32x32. Put your PNG in a folder of your own if you prefer - `ui/Icons/hellobox/iconSwift` works just as well, it only has to match the string.

The other six trait systems each have their own vanilla folder (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/` and so on). You are not required to use them, but sitting next to the traits you are copying makes your own art easier to find later. Full table on **[Sprites & resources](#/nml/sprites-and-resources)**.

## Making a trait *do* something

Stats are static. A trait can also run your code at four moments:

```csharp
// every few seconds, while the unit is alive
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// when the unit dies
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// when the unit is born
swift.action_birth = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// when the unit takes a hit
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };
```

Two rules for all four: **check for null and check the unit is alive first**, and return `false` when you did nothing. These run on every unit that has the trait, forever.

## Opposites and exclusions

```csharp
swift.addOpposite("slow");                            // the two can never coexist
swift.traits_to_remove_ids = new string[] { "fat" };  // gaining this strips that
```

## Giving the trait out

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` is read once, at startup
> New units roll their starting traits from a pool that `BaseTraitLibrary.linkAssets()` builds while the game loads, before your mod exists. Setting the flag on your trait changes nothing on its own: your trait is never in that pool, and it never turns up by chance on a freshly spawned unit. Put it in yourself, weighted the way vanilla does it:
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` is `protected`, so this compiles against the publicized assembly NML already builds your mod with. `spawn_random_rate` defaults to `5`: raise it and the trait turns up more often.

## Check it worked

Start the game, open a unit, open the trait editor, look in the `physique` tab. Not there? The log knows why, and the answer is nearly always one of three things: `can_be_given` is false, `group_id` does not exist, or `path_icon` points at nothing :wbreally:.

## The other six kinds of trait

Actor traits are one of **seven** trait systems. Each has its own library, its own groups and its own owner, and every one of them follows the exact pattern on this page. Only the class name, the library and the locale prefix change.

| System | Belongs to | Page |
| --- | --- | --- |
| Actor | one creature | this page |
| Culture | a culture, shared by its cities | **[Culture traits](#/nml/culture-traits)** |
| Religion | a religion and its followers | **[Religion traits](#/nml/religion-traits)** |
| Subspecies | a branch of a species | **[Subspecies traits](#/nml/subspecies-traits)** |
| Clan | a bloodline | **[Clan traits](#/nml/clan-traits)** |
| Language | a language and everyone who speaks it | **[Language traits](#/nml/language-traits)** |
| Kingdom | a kingdom's policy | **[Kingdom traits](#/nml/kingdom-traits)** |

Pick the owner before you write the trait. "Elves shoot better" is a culture trait if it should spread with their cities, a subspecies trait if it should spread by breeding, and an actor trait if it belongs to one creature. Getting that wrong is the difference between a mod that ripples through a world over an hour and one that does nothing at all :PES_ThinkAboutIt:.
