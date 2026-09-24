---
title: Status effects
group: Game Content
subgroup: Actors, Buildings & AI
icon: :wbcursed:
order: 146
---

# Status effects :wbcursed:

A trait is who a creature **is**. A status effect is what is happening to it **right now**: burning, frozen, poisoned, blessed. They expire on their own, they stack their own sprite on top of the unit, and they can run an action on a timer.

## Registering one

Statuses live in `AssetManager.status`. Same pattern as traits: build the asset, fill it in, add it.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] The frames are loaded for vanilla statuses only
> `StatusLibrary` fills `sprite_list` from `"effects/" + texture` and sets `need_visual_render`, once, while the game loads. A status you add afterwards has `sprite_list = null`, and the moment a creature gets it, `Status.updateAnimationFrame()` throws `NullReferenceException` on every frame, for as long as the status lasts :wbfacepalm:. The last two lines of `Initialize` do that setup for yours.
>
> `texture` names a **folder**: `GameResources/effects/fx_hello_status/` with one PNG per animation frame in it.


### The fields worth knowing

The short list. The real one is longer and mostly boring :wbyawn:.

| Field | What it does |
| --- | --- |
| `duration` | Lifetime in seconds. The status removes itself when it runs out |
| `allow_timer_reset` | Whether applying it again refreshes the timer instead of doing nothing |
| `tier` | `StatusTier.None`, `Basic` or `Advanced`. An actor's `allowed_status_tiers` decides which of these can land on it |
| `can_be_cured` | Whether a cure power or a healing effect can strip it |
| `removed_on_damage` | Falls off the moment the unit gets hit |
| `cancel_actor_job` | Interrupts whatever the unit was doing when it lands |
| `affects_mind` | Marks it as a mental effect (used by the game's own checks) |
| `opposite_status` | Statuses that cannot coexist with this one |
| `remove_status` | Statuses this one strips when applied |
| `base_stats` | Stat modifiers, applied while the status is on |
| `locale_id` / `locale_description` | The name and tooltip keys. **Required**: statuses do not derive them from the id |
| `path_icon` | The icon in the status list |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | The sprite drawn on the unit. `texture` is a bare name, loaded from `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Where and how it draws |
| `opposite_traits`, `opposite_tags` | Traits and tags that block it |
| `action_on_receive`, `action_get_hit` | Extra hooks, on apply and on being hit |
| `sound_idle` | A looping FMOD event while it is on |

## Your own sprite

This one has a trap in it, and yes, I walked into it [MARKAMI: confirm]. `texture` is **not** a full path: the status library prepends `effects/` before loading, so you write the bare name.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // NOT "effects/fx_hello_status"
```

Write the folder in yourself and the game looks for `effects/effects/fx_hello_status`, finds nothing, and draws no sprite at all. Vanilla names look like `fx_status_burning_t` and `fx_status_drowning_t`, so copying that shape keeps you out of trouble.

`path_icon` on the same asset is a separate thing and *is* a full path - it is the small icon in the status list, not the sprite drawn on the unit.

## Making it *do* something

`action` runs every `action_interval` seconds while the status is on. `action_finish` runs when it expires, `action_death` if the unit dies wearing it.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // public, and enough for a damage-over-time effect
    return true;
};
```

## Applying it to a unit

This is the part that trips people up. The obvious method, `actor.addStatusEffect("hello_cursed")`, is marked `internal` in the game assembly. It compiles fine against a **publicized** `Assembly-CSharp.dll`, and a normal NML mod already has one: NML compiles your `Code/*.cs` against its own publicized copy, which is why every `internal` member in this guide compiles for you. You only lose it when you build a `.dll` of your own in Visual Studio against the stock assembly. For that case, the public route always works:

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20s, or 0 for the asset's own duration
```

Inside a behaviour tree you have ready-made nodes instead: `new BehActorAddStatus("hello_cursed", 20f)` and `new BehActorRemoveStatus("hello_cursed")`.

## Don't forget the text

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

The keys are whatever you put in `locale_id` and `locale_description`, so they can be anything, but matching the vanilla `status_title_<id>` / `status_description_<id>` shape keeps your locale file readable.

> [!TIP] Statuses are the cheap way to do temporary effects
> Anything that should wear off (a buff from your god power, a debuff from your weapon, a "this unit is mine" marker) is a status, not a trait. Traits are permanent and get inherited by children, which is almost never what you wanted :PES2_Uhm:.
