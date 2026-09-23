---
title: Projectiles, spells & effects
group: Game Content
subgroup: Actors, Buildings & AI
icon: :wblightning:
order: 148
---

# Projectiles, spells & effects :wblightning:

Three small libraries that show up constantly once you start making things happen on the map:

| | |
| --- | --- |
| `AssetManager.projectiles` | Something flying from A to B: an arrow, a firebomb, a thrown torch |
| `AssetManager.spells` | Something a unit can cast on its own, with a mana cost and an AI chance |
| `AssetManager.effects_library` | A visual: an explosion, a cloud, a flash, a puff of smoke |

## Projectiles

```csharp Mods/HelloBox/Code/HelloProjectiles.cs
namespace HelloBox
{
    public static class HelloProjectiles
    {
        public const string EMBER_BOLT = "hello_ember_bolt";

        public static void Initialize()
        {
            if (AssetManager.projectiles.has(EMBER_BOLT)) return;

            AssetManager.projectiles.clone(EMBER_BOLT, "firebomb");

            ProjectileAsset bolt = AssetManager.projectiles.get(EMBER_BOLT);
            bolt.texture = "hello_bolt";                    // sprite in GameResources/effects/projectiles/
            bolt.speed = 16f;
            bolt.speed_random = 2f;
            bolt.look_at_target = true;
            bolt.trail_effect_enabled = true;
            bolt.trail_effect_id = "fx_fire_smoke";
            bolt.end_effect = "fx_firebomb_explosion";
            bolt.terraform_option = "demon_fireball";     // what the impact does to the ground
            bolt.terraform_range = 2;

            bolt.impact_actions = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
                return true;
            };
        }
    }
}
```

### The fields

| Field | What it does |
| --- | --- |
| `texture`, `texture_shadow` | Sprite and its shadow |
| `animated`, `animation_speed`, `frames` | If the projectile animates in flight |
| `speed`, `speed_random` | Flight speed, plus a per-shot wobble |
| `look_at_target` | Whether the sprite rotates to face where it is going |
| `scale_start`, `scale_target` | Size at launch and at impact |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | The trail behind it |
| `end_effect`, `end_effect_scale` | The effect spawned where it lands |
| `terraform_option`, `terraform_range` | Terrain change on impact. See **[Tiles & terrain](#/nml/tiles)** |
| `world_actions` | Runs while flying |
| `impact_actions` | Runs on impact |
| `trigger_on_collision` | Detonates on the first thing it touches instead of at the target |
| `hit_freeze`, `hit_shake`, `shake_*` | Impact feel |
| `can_be_blocked`, `can_be_left_on_ground` | Whether shields stop it, whether it becomes a pickup |
| `sound_launch`, `sound_impact` | FMOD events |
| `draw_light_area`, `draw_light_size` | Glow in flight |

### Firing one

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

The two positions are `Vector3`. A tile's `posV3` is the easy one to reach for; `current_position` on a unit is a `Vector2`, so it needs converting first.

Vanilla projectile ids to clone from: `arrow` · `snowball` · `firebomb` · `torch`.

### Your own sprite

`texture` on a projectile is **not** a full path. The library prepends `effects/projectiles/`, so you write the bare name.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // NOT "effects/projectiles/hello_bolt"
```

Projectiles load as a sprite list too: a **folder** named after `texture`, one PNG per frame, and several frames become the flight animation when `animated` is on. A loose `hello_bolt.png` comes back as an empty list, and drawing the projectile throws `ArgumentOutOfRangeException`.

`texture_shadow` is a full path and does not get the prefix: vanilla points it at the shared `shadows/projectiles/shadow_ball`, and reusing that is almost always the right call.

## Spells

A spell is what a unit casts on its own, without the player. The AI decides when, based on `chance`, `cost_mana` and `min_distance`.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // how eager the AI is to pick it
    min_distance = 5f,                  // will not cast closer than this
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // only cast below this health fraction. 0 = always
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` is an `AttackAction`, the same delegate shape used by weapon modifiers, so a spell body and an enchantment body are interchangeable.

### Giving a spell to something

Spells are attached to whatever grants them, by id:

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()` only appends an id. The library turns ids into spells in `linkAssets()`, at startup, before your mod: skip `linkSpells()` on a trait or item you registered yourself and it grants nothing, silently.

Vanilla spell ids worth reading: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Combat actions

A spell is something a unit casts. A **combat action** is something it *does* mid-fight: a dash, a dodge, a torch thrown before closing in. The game rolls for them at fixed moments of a fight, called pools.

```csharp Mods/HelloBox/Code/HelloCombat.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloCombat
    {
        public const string TOSS = "hello_ember_toss";

        public static void Initialize()
        {
            if (AssetManager.combat_action_library.has(TOSS)) return;

            CombatActionAsset toss = new CombatActionAsset
            {
                id = TOSS,
                cost_stamina = 10,
                chance = 0.3f,        // rolled each time the unit could use it, plus its combat skill
                cooldown = 4f,
                pools = new CombatActionPool[] { CombatActionPool.BEFORE_ATTACK_MELEE },

                // same range as the vanilla torch throw: not point blank, not across the map
                can_do_action = (Actor pSelf, BaseSimObject pTarget) =>
                {
                    float dist = Toolbox.SquaredDistVec2Float(pSelf.current_position, pTarget.current_position);
                    return dist > 36f && dist < 2500f;
                },

                action_actor_target_position = (Actor pSelf, Vector2 pTarget, WorldTile pTile) =>
                {
                    if (pSelf == null || !pSelf.isAlive() || pTile == null) return false;

                    Vector3 launch = pSelf.current_position;
                    launch.y += 0.5f;
                    // a shooter means a kingdom, so no pForcedKingdom here
                    World.world.projectiles.spawn(pSelf, null, HelloProjectiles.EMBER_BOLT, launch, pTile.posV3);
                    MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);
                    return true;
                }
            };

            AssetManager.combat_action_library.add(toss);

            // Combat actions come from traits. The trait only stores ids, and the game turned
            // ids into objects at startup: link it yourself or the trait never uses it.
            ActorTrait swift = AssetManager.traits.get(HelloTraits.SWIFT);
            if (swift == null) return;
            swift.addCombatAction(TOSS);
            swift.linkCombatActions();
        }
    }
}
```

| Pool | When it is rolled |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | Closing in for a melee hit. Uses `action_actor_target_position` |
| `BEFORE_ATTACK_RANGE` | About to shoot. Same delegate |
| `BEFORE_HIT` | About to be hit. Uses `action_actor`, like the dodge |
| `BEFORE_HIT_BLOCK` | About to be hit, block instead. Like the block |
| `BEFORE_HIT_DEFLECT` | A projectile incoming. Like the deflect |

| Field | What it does |
| --- | --- |
| `chance` | Rolled when the action is possible, raised by the unit's `skill_combat` |
| `cost_stamina` / `cost_mana` | Paid on use. Not enough, not an option |
| `cooldown` | Seconds of the `recovery_combat_action` status afterwards, which blocks every combat action |
| `can_do_action` | Your condition, given the target |

> [!WARNING] Only traits hand them out
> A unit collects combat actions from its traits and from its subspecies, clan and religion, never from its equipment. The trait keeps ids, and the game turned ids into objects at startup: call `linkCombatActions()` after `addCombatAction()`, or the trait carries a move nobody ever makes :PES2_Shrug:.

## Effects

An `EffectAsset` is pure presentation: a prefab or a sprite animation played at a position. You will use existing ones far more often than you will add one.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // some effects take a parameter
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Field | What it does |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Which prefab to instantiate |
| `sprite_path`, `load_texture`, `time_between_frames` | Or, a sprite animation instead |
| `spawn_action` | Code that runs when the effect is spawned. This is how `fx_cloud` turns a parameter into a cloud |
| `limit`, `limit_unload` | How many can exist at once |
| `cooldown_interval` | Minimum gap between spawns |
| `sound_launch`, `sound_loop_idle` | FMOD events |
| `draw_light_area`, `draw_light_size` | Glow |
| `show_on_mini_map` | Whether it appears on the minimap |

> [!TIP] Look before you build
> There are hundreds of `fx_*` effects already in the game, and `EffectsLibrary` is a short class. Open it in dnSpy (see **[Reading the game's code](#/toolbox/reading-the-game-code)**) and read the ids once. Most of the time the explosion you were about to draw already exists :PESgn_CheckPins:.
