---
title: Custom actors
group: Game Content
subgroup: Actors, Buildings & AI
icon: :wbhuman:
order: 140
---

# Custom actors :wbhuman:

> [!NOTE] They are called actors, not races
> The game calls every living thing an **actor**: a human, a wolf, a dragon, a zombie, a crab. They all come from the same class, `ActorAsset`, and they all live in `AssetManager.actor_library`. "Race" is the old word. The one place it survives is a `race` property marked `[Obsolete("use .original_actor_asset instead")]`, which exists only to load ancient saves. Write `actor` everywhere.

A new creature is the mod everybody wants to make and almost nobody finishes, because an `ActorAsset` carries animations, textures, sounds, taxonomy, diet, AI flags, genome, culture and stats. Getting one of them wrong gives you an invisible unit standing in the ocean.

Good news: the game does not build creatures from scratch either. This is literally how vanilla makes an elf:

```csharp
clone("elf", "$civ_advanced_unit$");
```

So we do the same.

## The templates

Ids wrapped in `$` are **templates**: half-finished actors the game keeps only so other actors can be cloned from them. They are the correct starting point for a brand new creature, because they carry the wiring without carrying a human's sprites.

| Template | Clone it for |
| --- | --- |
| `$basic_unit$` | The bare minimum living thing |
| `$animal$` | A wild animal |
| `$mob$` | A hostile monster |
| `$civ_unit$` | A civilisation creature |
| `$civ_advanced_unit$` | A full civ creature: cities, kingdoms, culture, religion. What human, elf, orc and dwarf use |

You can also clone a finished actor - `human`, `wolf`, `zombie` - and that is the easier path for your first one, because the donor's sprites come with it and your creature is visible immediately.

## One actor

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] Load the shadow yourself, or the game complains about every actor
> `ActorAssetLibrary` walks its list on startup and calls `loadShadow()` on each actor, which reads the sprite at `shadows/<shadow_texture>` and measures it. That happened before your mod registered anything, so your actor's shadow stays `(0.00, 0.00)` and the game logs an asset error for it, three times, once for the adult, the egg and the baby :wbfacepalm:.
>
> `loadShadow()` is `internal`, so this needs a **publicized** `Assembly-CSharp.dll` like the rest of the guide. If you do not have one, set `asset.shadow = false;` instead: no shadow, but no error either.


> [!WARNING] `clone()` already registers
> `AssetManager.<library>.clone(newId, sourceId)` calls `add()` internally. Every library works this way. Calling `add()` yourself afterwards is a duplicate registration: the library removes the first copy, logs an error, and re-adds it. Harmless, but it is noise in your log that makes real errors harder to find, and it is the first thing a reviewer will spot.
>
> The corollary is the good news: **after a clone, `base_stats` already exists**, so the "stats after add" rule from **[Custom traits](#/nml/custom-traits)** is already satisfied.

## Several actors at once

Most creature mods are not one creature. Three sprites means three assets, and the moment you copy-paste the block above three times you have three places to fix every bug.

Put the differences in a table and the code in a loop:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

Adding a fourth creature is now one line in the table. This is the shape almost every shipped creature mod ends up in, and it is worth writing it this way from the second creature onward :PESgn_ThisTBH:.

## The fields that decide what your creature *is*

| Field | What it does |
| --- | --- |
| `civ` | Civilisation creature: cities, kingdoms, jobs, war. `false` = animal |
| `auto_civ` | Whether the game starts civilising them on its own |
| `default_animal` | Marks it as wildlife for the game's own checks |
| `unit_other` | Neither civ nor animal: a mob, a construct, a special |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. Drives rendering and some combat maths |
| `name_locale` | The display name key |
| `icon` | The icon used in lists and spawn buttons |
| `color_hex` | The tint applied to a colorable unit |
| `can_have_subspecies` | Whether they mutate into subspecies over generations |
| `has_ai_system` | Whether they run the behaviour system at all |
| `flying` / `hovering` | Whether they leave the ground, and how high |
| `force_ocean_creature` / `force_land_creature` | Hard-locks which terrain they live on |
| `can_attack_buildings` | Whether they will break things |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | What the god powers are allowed to do to them |
| `kingdom_id_wild` / `kingdom_id_civilization` | Which kingdom they spawn into, untamed and settled |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … which sheet the sprites come from |
| `animation_walk` / `animation_idle` / `animation_swim` | Frame sequences, each with its own `_speed` field |
| `sound_idle`, `sound_spawn`, `sound_death`, `sound_attack`, `sound_hit` | FMOD event paths |
| `name_taxonomic_*` | Kingdom, phylum, class, order, family, genus, species for the knowledge window |
| `collective_term` | "a **pack** of wolves" |
| `allowed_status_tiers` | Which status effects can land on them |
| `production` | What their cities make |
| `zombie_id_internal`, `skeleton_id`, `mush_id`, `tumor_id` | What they turn into |

## Wiring a civ creature into the world

A `civ` actor is not finished when its stats are set. These are the parts vanilla fills in for every playable creature, and skipping them is why a custom civ "does nothing":

```csharp
asset.kingdom_id_wild = "nomads_human";          // before they settle
asset.kingdom_id_civilization = "human";         // their kingdom type
asset.banner_id = "human";                       // flag generator
asset.architecture_id = "human";                 // what their buildings look like
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // how names are generated
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// Genome: the inherited stat spread, what breeding and mutation work on.
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// Starting traits, by trait system.
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

Reuse a vanilla `banner_id` and `architecture_id` until you have art of your own. A creature with no architecture builds nothing.

## Spawning one

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` is public and takes optional arguments for the spawn sound, miracle spawn, spawn height, a specific subspecies, and whether the unit gets starting items.

Give the player a god power button for it and you have a spawner. See **[Power tabs & buttons](#/nml/power-buttons)**.

## Subspecies

Subspecies are the variants an actor drifts into over generations. They have their own trait library, separate from actor traits, and their own group list:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// make your actor start with it
asset.addSubspeciesTrait("hello_scales");
```

Subspecies traits can also carry **art**: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` and friends, which is how a subspecies looks different from its parent species without being a separate actor. See **[Subspecies traits](#/nml/subspecies-traits)**.

## Your own icon

Before the animation work below, the cheap part: the icon in lists and spawn buttons.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

The creature's **body** art is a different problem entirely, and it is the rest of this section.

## Sprites are the hard part

Everything above is a page of code. The work is the art: a creature needs a full animation set, in the right atlas, at the right size, with the right pivots. Two honest options:

1. **Keep the donor's sprites.** A creature that reuses human animations with different stats and a different tint is a perfectly good first mod, and it *works*.
2. **Export with AssetRipper**, find the atlas of the creature you cloned, and match its layout exactly before you draw anything. See **[Getting the game's art](#/toolbox/getting-the-sprites)**.

> [!WARNING] Test in a real world, not on a blank map
> A civ creature that cannot path, cannot build, or drowns on spawn looks completely fine for the first thirty seconds. Spawn twenty, let a world run at full speed for five minutes, then read the log :PES_MonkaSweat:.
