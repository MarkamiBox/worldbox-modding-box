---
title: Projektile, Zauber & Effekte
group: Spielinhalte
subgroup: Akteure, Gebäude & KI
icon: :wblightning:
order: 148
---

# Projektile, Zauber & Effekte :wblightning:

Drei kleine Bibliotheken, die ständig auftauchen, sobald du Dinge auf der Karte geschehen lassen willst:

| | |
| --- | --- |
| `AssetManager.projectiles` | Etwas, das von A nach B fliegt: ein Pfeil, eine Feuerbombe, eine geworfene Fackel |
| `AssetManager.spells` | Etwas, das Einheiten selbstständig wirken können, mit Manakosten und KI-Chance |
| `AssetManager.effects_library` | Reine Optik: eine Explosion, eine Wolke, ein Blitz, eine Rauchwolke |

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
| `animated`, `animation_speed`, `frames` | Ob das Projektil im Flug animiert ist |
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

Beide Positionen sind `Vector3`. `posV3` einer Kachel ist am einfachsten zu greifen; `current_position` einer Einheit ist ein `Vector2` und muss vorher konvertiert werden.

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

Ein Zauber ist etwas, das eine Einheit eigenständig ohne den Spieler wirkt. Die KI entscheidet anhand von `chance`, `cost_mana` und `min_distance`, wann er eingesetzt wird.

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

`action` ist eine `AttackAction`, dieselbe Delegaten-Signatur wie bei Waffen-Modifikatoren, sodass ein Zaubereffekt und eine Verzauberung austauschbar sind.

### Einer Entität einen Zauber verleihen

Zauber werden dem Verleiher per ID zugewiesen:

```csharp
trait.addSpell("hello_bolt");        // jede Eigenschaft aller 7 Systeme
item.addSpell("hello_bolt");         // ein Gegenstand
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

Interessante Vanilla-Zauber: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Kampfaktionen

Ein `CombatActionAsset` ist ein Delegat, der bei einem Kampfereignis ausgelöst wird, üblicherweise um einen Zauber oder einen Effekt zu triggern:

```csharp Mods/HelloBox/Code/HelloSpells.cs
CombatActionAsset action = new CombatActionAsset
{
    id = "hello_cast_on_attack",
    action = (pSelf, pTarget, pWorldTile) =>
    {
        if (pSelf == null || !pSelf.isAlive()) return false;

        // do the cast
        return true;
    }
};
AssetManager.combat_actions.add(action);
```

Hänge ihn in ein Ereignis deiner Eigenschaft ein:

```csharp
trait.addCombatAction(CombatActionAsset.BEFORE_ATTACK_MELEE, "hello_cast_on_attack");
```

> [!WARNING] Nur Eigenschaften vergeben sie
> Du kannst eine Kampfaktion nicht direkt an ein `ActorAsset` anhängen. Jedes Kampfereignis durchläuft die Eigenschaften der Kreatur und fragt deren Aktionen ab. Wenn du also eine Aktion auf einer Einheit haben möchtest, packe sie auf eine Eigenschaft und gib die Eigenschaft der Einheit :PES2_Shrug:.

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
