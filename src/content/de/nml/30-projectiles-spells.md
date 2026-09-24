---
title: Projektile, Zauber & Effekte
group: Spielinhalte
subgroup: Akteure, Gebäude & KI
icon: :wblightning:
order: 148
---

# Projektile, Zauber & Effekte :wblightning:

Drei kleine Bibliotheken (library), die ständig auftauchen, sobald du Dinge auf der Karte geschehen lassen willst:

| | |
| --- | --- |
| `AssetManager.projectiles` | Etwas, das von A nach B fliegt: ein Pfeil, eine Feuerbombe, eine geworfene Fackel |
| `AssetManager.spells` | Etwas, das Einheiten selbstständig wirken können, mit Manakosten und KI-Chance |
| `AssetManager.effects_library` | Reine Optik: eine Explosion, eine Wolke (cloud), ein Blitz, eine Rauchwolke |

## Projektile

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
            bolt.terraform_option = "demon_fireball";     // Bodeneffekt beim Einschlag
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

### Die Felder

Die meisten davon kommen mit dem, was du geklont hast, und du schaust sie nie wieder an. `speed` und `texture` sind die beiden, die du wirklich änderst.

| Feld | Was es tut |
| --- | --- |
| `texture`, `texture_shadow` | Sprite und dessen Schatten |
| `animated`, `animation_speed`, `frames` | Ob das Projektil (projectile) im Flug animiert ist |
| `speed`, `speed_random` | Fluggeschwindigkeit plus Streuung pro Schuss |
| `look_at_target` | Ob sich das Sprite in Flugrichtung dreht |
| `scale_start`, `scale_target` | Größe beim Start und beim Einschlag |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | Der Schweif hinter dem Geschoss |
| `end_effect`, `end_effect_scale` | Der Effekt am Einschlagsort |
| `terraform_option`, `terraform_range` | Terrainänderung bei Treffern. Siehe **[Kacheln & Terrain](#/nml/tiles)** |
| `world_actions` | Läuft während des Flugs |
| `impact_actions` | Läuft beim Einschlag |
| `trigger_on_collision` | Zündet am ersten berührten Objekt statt am Zielort |
| `hit_freeze`, `hit_shake`, `shake_*` | Treffer-Feedback |
| `can_be_blocked`, `can_be_left_on_ground` | Ob Schilde es stoppen, ob es als Beute liegen bleibt |
| `sound_launch`, `sound_impact` | FMOD-Soundereignisse |
| `draw_light_area`, `draw_light_size` | Leuchten im Flug |

### Ein Projektil abfeuern

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

Beide Positionen sind `Vector3`. `posV3` einer Kachel (tile) ist am einfachsten zu greifen; `current_position` einer Einheit ist ein `Vector2` und muss vorher konvertiert werden.

Vanilla-IDs zum Klonen: `arrow` · `snowball` · `firebomb` · `torch`.

### Eigene Texturen

`texture` bei Projektilen ist **kein** vollständiger Pfad. Die Bibliothek stellt automatisch `effects/projectiles/` voran, du schreibst also nur den bloßen Namen.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // NICHT "effects/projectiles/hello_bolt"
```

Projektile werden ebenfalls als Sprite-Liste geladen: ein **Ordner** mit dem Namen von `texture`, eine PNG pro Frame, und mehrere Frames werden zur Fluganimation, wenn `animated` an ist. Eine lose `hello_bolt.png` kommt als leere Liste zurück, und das Zeichnen des Projektils wirft `ArgumentOutOfRangeException` :PESgn_Oops:.

`texture_shadow` ist ein voller Pfad ohne Präfix: Vanilla verweist auf das gemeinsame `shadows/projectiles/shadow_ball`, was fast immer die beste Wahl ist.

## Zauber

Ein Zauber (spell) ist etwas, das eine Einheit eigenständig ohne den Spieler wirkt. Die KI entscheidet anhand von `chance`, `cost_mana` und `min_distance`, wann er eingesetzt wird.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // wie gern die KI ihn wählt
    min_distance = 5f,                  // wirkt nicht näher als diese Distanz
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // nur unter dieser Lebensquote. 0 = immer
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` ist eine `AttackAction`, dieselbe Delegaten-Signatur wie bei Waffen-Modifikatoren, sodass ein Zaubereffekt und eine Verzauberung (modifier) austauschbar sind.

### Einer Entität einen Zauber verleihen

Zauber hängen an dem, was sie gewährt, per ID:

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()` hängt nur eine ID an. Die Bibliothek verwandelt IDs in `linkAssets()` in Zauber, beim Start, vor deiner Mod: Lässt du `linkSpells()` bei einem Merkmal (trait) oder Gegenstand (item) weg, den du selbst registriert hast, gewährt er nichts, und zwar stillschweigend.

Vanilla-Zauber-IDs, die sich zu lesen lohnen: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Kampfaktionen

Ein Zauber ist etwas, das eine Einheit wirkt. Eine **Kampfaktion** ist etwas, das sie mitten im Kampf *tut*: ein Sprint, ein Ausweichen, eine Fackel, geworfen, bevor sie heranrückt. Das Spiel würfelt sie zu festen Zeitpunkten eines Kampfes aus, den sogenannten Pools.

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

| Pool | Wann gewürfelt wird |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | Beim Heranrücken für einen Nahkampftreffer. Nutzt `action_actor_target_position` |
| `BEFORE_ATTACK_RANGE` | Kurz vor dem Schuss. Derselbe Delegate |
| `BEFORE_HIT` | Kurz bevor sie getroffen wird. Nutzt `action_actor`, wie das Ausweichen |
| `BEFORE_HIT_BLOCK` | Kurz bevor sie getroffen wird, stattdessen blocken. Wie der Block |
| `BEFORE_HIT_DEFLECT` | Ein Projektil kommt. Wie das Abwehren |

| Feld | Was es tut |
| --- | --- |
| `chance` | Wird gewürfelt, wenn die Aktion möglich ist, erhöht durch `skill_combat` der Einheit |
| `cost_stamina` / `cost_mana` | Wird beim Einsatz bezahlt. Nicht genug, keine Option |
| `cooldown` | Sekunden des Status `recovery_combat_action` danach, der jede Kampfaktion blockiert |
| `can_do_action` | Deine Bedingung, mit dem Ziel als Eingabe |

> [!WARNING] Nur Merkmale verteilen sie
> Eine Einheit sammelt Kampfaktionen aus ihren Merkmalen und aus ihrer Unterart (subspecies), ihrem Clan und ihrer Religion, nie aus ihrer Ausrüstung. Das Merkmal speichert IDs, und das Spiel hat IDs beim Start in Objekte verwandelt: Ruf `linkCombatActions()` nach `addCombatAction()` auf, sonst trägt das Merkmal einen Move, den nie jemand macht :PES2_Shrug:.

## Effekte

Ein `EffectAsset` ist reine Präsentation: ein Prefab oder eine Sprite-Animation an einer Position. Du wirst bestehende Effekte viel öfter nutzen als neue zu bauen.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // manche Effekte nehmen Parameter
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Feld | Was es tut |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Welches Prefab instanziiert wird |
| `sprite_path`, `load_texture`, `time_between_frames` | Alternativ eine Sprite-Animation |
| `spawn_action` | Code beim Spawnen des Effekts (so macht `fx_cloud` aus dem Parameter eine Wolke) |
| `limit`, `limit_unload` | Wie viele gleichzeitig existieren dürfen |
| `cooldown_interval` | Minimaler Abstand zwischen Spawns |
| `sound_launch`, `sound_loop_idle` | FMOD-Soundereignisse |
| `draw_light_area`, `draw_light_size` | Lichtschein |
| `show_on_mini_map` | Ob es auf der Minimap sichtbar ist |

> [!TIP] Vor dem Neubau nachsehen
> Es gibt bereits Hunderte von `fx_*`-Effekten im Spiel, und `EffectsLibrary` ist eine überschaubare Klasse. Öffne sie in dnSpy (siehe **[Den Spielcode lesen](#/toolbox/reading-the-game-code)**) und überfliege die IDs. Fast immer existiert die Explosion, die du gerade zeichnen wolltest, schon längst :PESgn_CheckPins:.
