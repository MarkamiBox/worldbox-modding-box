---
title: Projectiles, sorts et effets
group: Contenu du jeu
subgroup: Acteurs, bâtiments et IA
icon: :wblightning:
order: 148
---

# Projectiles, sorts et effets :wblightning:

Trois bibliothèques compactes qui interviennent constamment dès que vous commencez à déclencher des événements sur la carte :

| | |
| --- | --- |
| `AssetManager.projectiles` | Tout ce qui vole d'un point A à un point B : flèche, bombe incendiaire, torche lancée |
| `AssetManager.spells` | Ce qu'une unité peut lancer d'elle-même, avec un coût en mana et une probabilité IA |
| `AssetManager.effects_library` | Du pur visuel : explosion, nuage, flash lumineux, panache de fumée |

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
            bolt.terraform_option = "demon_fireball";     // impact laissé sur le sol
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

### Les champs

| Champ | Ce qu'il fait |
| --- | --- |
| `texture`, `texture_shadow` | Sprite et son ombre |
| `animated`, `animation_speed`, `frames` | Animation en vol |
| `speed`, `speed_random` | Vitesse de vol et variation aléatoire par tir |
| `look_at_target` | Oriente le sprite vers sa trajectoire |
| `scale_start`, `scale_target` | Échelle au départ et à l'impact |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | Traînée visuelle |
| `end_effect`, `end_effect_scale` | Effet déclenché au point d'impact |
| `terraform_option`, `terraform_range` | Altération du sol à l'impact. Voir **[Tuiles et terrain](#/nml/tiles)** |
| `world_actions` | S'exécute pendant le vol |
| `impact_actions` | S'exécute à l'impact |
| `trigger_on_collision` | Détonne sur le premier obstacle touché plutôt qu'à destination |
| `hit_freeze`, `hit_shake`, `shake_*` | Ressenti physique de l'impact |
| `can_be_blocked`, `can_be_left_on_ground` | Bloqué par les boucliers, récupérable au sol |
| `sound_launch`, `sound_impact` | Événements audio FMOD |
| `draw_light_area`, `draw_light_size` | Lueur en vol |

### Tirer un projectile

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

Les deux positions attendent un `Vector3`. Le `posV3` d'une tuile est le plus pratique ; le `current_position` d'une créature est un `Vector2` et doit d'abord être converti.

Identifiants vanilla à cloner : `arrow` · `snowball` · `firebomb` · `torch`.

### Votre propre sprite

Le champ `texture` d'un projectile n'est **pas** un chemin complet. La bibliothèque préfixe automatiquement `effects/projectiles/`, il suffit donc d'indiquer le nom simple.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // PAS "effects/projectiles/hello_bolt"
```

Les projectiles se chargent aussi comme une liste de sprites : un **dossier** nommé comme `texture`, un PNG par frame, et plusieurs frames deviennent l'animation de vol quand `animated` est activé. Un `hello_bolt.png` isolé revient comme une liste vide, et dessiner le projectile lance `ArgumentOutOfRangeException`.

`texture_shadow` est un chemin complet sans préfixe automatique - le jeu vanilla pointe vers le fichier partagé `shadows/projectiles/shadow_ball`, et le réutiliser est presque toujours le meilleur choix.

## Sorts

Un sort est une action qu'une unité lance d'elle-même, sans ordre du joueur. L'IA décide du moment en fonction de `chance`, `cost_mana` et `min_distance`.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // envie de l'IA de le choisir
    min_distance = 5f,                  // distance minimale de lancement
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // seuil de points de vie maximum. 0 = toujours
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` est un délégué `AttackAction`, la même signature que les modificateurs d'armes : le corps d'un sort et celui d'un enchantement sont donc parfaitement interchangeables.

### Donner un sort à une entité

Les sorts sont attachés par leur identifiant à ce qui les octroie :

```csharp
trait.addSpell("hello_bolt");        // tout trait parmi les 7 systèmes
item.addSpell("hello_bolt");         // un objet d'équipement
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

Sorts vanilla instructifs à examiner : `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Actions de combat

Un `CombatActionAsset` est un délégué qui se déclenche lors d'un événement de combat, généralement pour déclencher un sort ou un effet :

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

Accrochez-le à un événement sur votre trait :

```csharp
trait.addCombatAction(CombatActionAsset.BEFORE_ATTACK_MELEE, "hello_cast_on_attack");
```

> [!WARNING] Seuls les traits les distribuent
> Vous ne pouvez pas attacher une action de combat directement à un `ActorAsset`. Chaque événement de combat parcourt les traits de l'acteur et interroge leurs actions. Si vous voulez une action sur une unité, mettez-la sur un trait et appliquez le trait à l'unité :PES2_Shrug:.

## Effets

Un `EffectAsset` est purement visuel : un préfabriqué ou une animation de sprites jouée à des coordonnées précises. Vous réutiliserez les effets existants bien plus souvent que vous n'en créerez de nouveaux.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // certains effets acceptent un paramètre
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Champ | Ce qu'il fait |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Quel préfab instancier |
| `sprite_path`, `load_texture`, `time_between_frames` | Ou animation de sprites à la place |
| `spawn_action` | Code exécuté à l'apparition (c'est ainsi que `fx_cloud` transforme son paramètre en nuage) |
| `limit`, `limit_unload` | Nombre maximal simultané à l'écran |
| `cooldown_interval` | Intervalle minimal entre apparitions |
| `sound_launch`, `sound_loop_idle` | Événements sonores FMOD |
| `draw_light_area`, `draw_light_size` | Halo lumineux |
| `show_on_mini_map` | Affiché ou non sur la mini-carte |

> [!TIP] Vérifiez avant de dessiner
> Le jeu contient déjà des centaines d'effets `fx_*`, et `EffectsLibrary` est une classe très courte. Ouvrez-la dans dnSpy (voir **[Lire le code du jeu](#/toolbox/reading-the-game-code)**) et survolez les identifiants. Dans la plupart des cas, l'explosion que vous vous apprêtiez à dessiner existe déjà :PESgn_CheckPins:.
