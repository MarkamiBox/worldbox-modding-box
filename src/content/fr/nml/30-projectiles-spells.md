---
title: Projectiles, sorts et effets
group: Contenu du jeu
subgroup: Acteurs, bâtiments et IA
icon: :wblightning:
order: 148
---

# Projectiles, sorts et effets :wblightning:

Trois bibliothèques (library) compactes qui interviennent constamment dès que vous commencez à déclencher des événements sur la carte :

| | |
| --- | --- |
| `AssetManager.projectiles` | Tout ce qui vole d'un point A à un point B : flèche, bombe incendiaire, torche lancée |
| `AssetManager.spells` | Ce qu'une unité peut lancer d'elle-même, avec un coût en mana et une probabilité IA |
| `AssetManager.effects_library` | Du pur visuel : explosion, nuage (cloud), flash lumineux, panache de fumée |

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

La plupart viennent avec ce que vous avez cloné et vous ne les regardez plus jamais. `speed` et `texture` sont les deux que vous changerez vraiment.

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

Les deux positions attendent un `Vector3`. Le `posV3` d'une tuile (tile) est le plus pratique ; le `current_position` d'une créature est un `Vector2` et doit d'abord être converti.

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

Les projectiles se chargent aussi comme une liste de sprites : un **dossier** nommé comme `texture`, un PNG par frame, et plusieurs frames deviennent l'animation de vol quand `animated` est activé. Un `hello_bolt.png` isolé revient comme une liste vide, et dessiner le projectile lance `ArgumentOutOfRangeException` :PESgn_Oops:.

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

`action` est un délégué `AttackAction`, la même signature que les modificateurs (modifier) d'armes : le corps d'un sort et celui d'un enchantement sont donc parfaitement interchangeables.

### Donner un sort à une entité

Les sorts s'attachent à ce qui les accorde, par id :

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()` ajoute seulement un id. La bibliothèque transforme les ids en sorts dans `linkAssets()`, au démarrage, avant votre mod : oubliez `linkSpells()` sur un trait ou un objet que vous avez enregistré vous-même et il n'accorde rien, sans rien dire.

Des ids de sorts vanilla qui valent la lecture : `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Actions de combat

Un sort, c'est quelque chose qu'une unité lance. Une **action de combat**, c'est quelque chose qu'elle *fait* en plein combat : une ruée, une esquive, une torche lancée avant d'approcher. Le jeu les tire à des moments fixes d'un combat, appelés pools.

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

| Pool | Quand il est tiré |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | En approchant pour un coup au corps à corps. Utilise `action_actor_target_position` |
| `BEFORE_ATTACK_RANGE` | Sur le point de tirer. Même délégué |
| `BEFORE_HIT` | Sur le point d'être touchée. Utilise `action_actor`, comme l'esquive |
| `BEFORE_HIT_BLOCK` | Sur le point d'être touchée, bloquer à la place. Comme le blocage |
| `BEFORE_HIT_DEFLECT` | Un projectile arrive. Comme la déviation |

| Champ | Ce qu'il fait |
| --- | --- |
| `chance` | Tiré quand l'action est possible, augmenté par le `skill_combat` de l'unité |
| `cost_stamina` / `cost_mana` | Payé à l'utilisation. Pas assez, pas d'option |
| `cooldown` | Secondes du statut (status) `recovery_combat_action` ensuite, qui bloque toute action de combat |
| `can_do_action` | Votre condition, à partir de la cible |

> [!WARNING] Seuls les traits les distribuent
> Une unité récupère ses actions de combat depuis ses traits et depuis sa sous-espèce (subspecies), son clan et sa religion, jamais depuis son équipement. Le trait garde des ids, et le jeu a transformé les ids en objets au démarrage : appelez `linkCombatActions()` après `addCombatAction()`, sinon le trait porte un mouvement que personne ne fait jamais :PES2_Shrug:.

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
