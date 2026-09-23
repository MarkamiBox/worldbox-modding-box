---
title: Proyectiles, hechizos y efectos
group: Contenido del juego
subgroup: Actores, edificios e IA
icon: :wblightning:
order: 148
---

# Proyectiles, hechizos y efectos :wblightning:

Tres bibliotecas compactas que aparecen constantemente tan pronto como empiezas a provocar sucesos en el mapa:

| | |
| --- | --- |
| `AssetManager.projectiles` | Algo que vuela de A hacia B: una flecha, una bomba de fuego, una antorcha arrojada |
| `AssetManager.spells` | Algo que una unidad conjura por su cuenta, con coste de maná y probabilidad de IA |
| `AssetManager.effects_library` | Un efecto visual: una explosión, una nube, un destello, una columna de humo |

## Proyectiles

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
            bolt.terraform_option = "demon_fireball";     // impacto sobre el suelo
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

### Los campos

| Campo | Qué hace |
| --- | --- |
| `texture`, `texture_shadow` | Sprite y su sombra correspondiente |
| `animated`, `animation_speed`, `frames` | Si el proyectil se anima durante el vuelo |
| `speed`, `speed_random` | Velocidad de vuelo y variación aleatoria por disparo |
| `look_at_target` | Si el sprite rota para encarar su trayectoria |
| `scale_start`, `scale_target` | Escala en el lanzamiento y al impactar |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | La estela que deja tras de sí |
| `end_effect`, `end_effect_scale` | El efecto generado en el punto de impacto |
| `terraform_option`, `terraform_range` | Alteración del terreno al chocar. Ver **[Casillas y terreno](#/nml/tiles)** |
| `world_actions` | Se ejecuta durante el trayecto de vuelo |
| `impact_actions` | Se ejecuta en el momento del impacto |
| `trigger_on_collision` | Detona al tocar el primer obstáculo en vez del destino |
| `hit_freeze`, `hit_shake`, `shake_*` | Sensación física del impacto |
| `can_be_blocked`, `can_be_left_on_ground` | Si los escudos lo detienen o si queda como botín en el suelo |
| `sound_launch`, `sound_impact` | Eventos de sonido de FMOD |
| `draw_light_area`, `draw_light_size` | Resplandor durante el vuelo |

### Disparar un proyectil

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

Ambas posiciones son de tipo `Vector3`. `posV3` en una casilla es lo más directo; `current_position` en una criatura es un `Vector2`, por lo que requiere conversión previa.

IDs vanilla recomendados para clonar: `arrow` · `snowball` · `firebomb` · `torch`.

### Tu propio sprite

El campo `texture` en un proyectil **no** es una ruta completa. La biblioteca antepone automáticamente `effects/projectiles/`, por lo que solo debes escribir el nombre básico.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // NO "effects/projectiles/hello_bolt"
```

Los proyectiles también se cargan como lista de sprites: una **carpeta** con el nombre de `texture`, un PNG por frame, y varios frames se convierten en la animación de vuelo cuando `animated` está activo. Un `hello_bolt.png` suelto vuelve como lista vacía, y dibujar el proyectil lanza `ArgumentOutOfRangeException`.

`texture_shadow` sí es una ruta completa y no recibe prefijo: vanilla suele apuntarlo al recurso compartido `shadows/projectiles/shadow_ball`, y reusar esa sombra casi siempre es la decisión correcta.

## Hechizos

Un hechizo es una acción que una unidad lanza por iniciativa propia, sin intervención del jugador. La IA evalúa cuándo lanzarlo en función de `chance`, `cost_mana` y `min_distance`.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // predisposición de la IA para elegirlo
    min_distance = 5f,                  // distancia mínima para conjurarlo
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // solo se lanza por debajo de esta vida. 0 = siempre
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` es un `AttackAction`, la misma estructura de delegado que usan los modificadores de armas, de modo que la lógica de un hechizo y la de un encantamiento son intercambiables.

### Otorgar un hechizo a una entidad

Los hechizos se asocian mediante su identificador:

```csharp
trait.addSpell("hello_bolt");        // cualquier rasgo de cualquiera de los 7 sistemas
item.addSpell("hello_bolt");         // un objeto o arma
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

Hechizos vanilla útiles para examinar: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Acciones de combate

Un `CombatActionAsset` es un delegado que se dispara ante un evento de combate, generalmente para activar un hechizo o un efecto:

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

Engánchalo a un evento en tu rasgo:

```csharp
trait.addCombatAction(CombatActionAsset.BEFORE_ATTACK_MELEE, "hello_cast_on_attack");
```

> [!WARNING] Solo los rasgos las distribuyen
> No puedes vincular una acción de combate directamente a un `ActorAsset`. Cada evento de combate recorre los rasgos del actor y consulta sus acciones, así que si quieres una acción en una unidad, colócala en un rasgo y ponle el rasgo a la unidad :PES2_Shrug:.

## Efectos

Un `EffectAsset` es pura presentación visual: un prefab o una animación de sprites reproducida en unas coordenadas. Usarás los efectos existentes con mucha mayor frecuencia que crear uno desde cero.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // ciertos efectos aceptan parámetros
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Campo | Qué hace |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Qué prefab se instancia |
| `sprite_path`, `load_texture`, `time_between_frames` | Animación de sprites alternativa |
| `spawn_action` | Código ejecutado al crearse el efecto (así `fx_cloud` convierte su parámetro en nube) |
| `limit`, `limit_unload` | Límite simultáneo en pantalla |
| `cooldown_interval` | Tiempo mínimo entre apariciones |
| `sound_launch`, `sound_loop_idle` | Eventos de sonido de FMOD |
| `draw_light_area`, `draw_light_size` | Iluminación emitida |
| `show_on_mini_map` | Si se dibuja en el minimapa |

> [!TIP] Revisa antes de diseñar
> Ya existen cientos de efectos `fx_*` en el juego, y `EffectsLibrary` es una clase corta. Ábrela en dnSpy (ver **[Leer el código del juego](#/toolbox/reading-the-game-code)**) y lee los IDs disponibles. La inmensa mayoría de las veces, la explosión que planeabas dibujar ya está hecha :PESgn_CheckPins:.
