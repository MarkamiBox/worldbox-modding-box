---
title: Proiettili, incantesimi ed effetti
group: Contenuto di gioco
subgroup: Attori, edifici e IA
icon: :wblightning:
order: 148
---

# Proiettili, incantesimi ed effetti :wblightning:

Tre librerie (library) compatte che ritornano continuamente non appena inizi a far accadere cose sulla mappa:

| | |
| --- | --- |
| `AssetManager.projectiles` | Qualcosa che vola da A a B: una freccia, una bomba di fuoco, una torcia lanciata |
| `AssetManager.spells` | Qualcosa che un'unità lancia da sola, con un costo in mana e una probabilità per l'IA |
| `AssetManager.effects_library` | Pura resa visiva: un'esplosione, una nuvola (cloud), un lampo, una coltre di fumo |

## Proiettili

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
            bolt.terraform_option = "demon_fireball";     // cosa fa l'impatto al terreno
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

### I campi

La maggior parte di questi arriva con ciò che hai clonato e non li guardi mai più. `speed` e `texture` sono i due che cambierai davvero.

| Campo | Cosa fa |
| --- | --- |
| `texture`, `texture_shadow` | Sprite e relativa ombra |
| `animated`, `animation_speed`, `frames` | Se il proiettile (projectile) è animato in volo |
| `speed`, `speed_random` | Velocità di volo e deviazione casuale per colpo |
| `look_at_target` | Se lo sprite ruota per puntare verso la traiettoria |
| `scale_start`, `scale_target` | Dimensione al lancio e all'impatto |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | Scia lasciata in volo |
| `end_effect`, `end_effect_scale` | Effetto generato all'atterraggio |
| `terraform_option`, `terraform_range` | Modifica del terreno all'impatto. Vedi **[Caselle e terreno](#/nml/tiles)** |
| `world_actions` | Eseguito durante il volo |
| `impact_actions` | Eseguito all'impatto |
| `trigger_on_collision` | Detona al primo contatto anziché al bersaglio finale |
| `hit_freeze`, `hit_shake`, `shake_*` | Resa fisica dell'impatto |
| `can_be_blocked`, `can_be_left_on_ground` | Fermato dagli scudi o lasciato a terra come oggetto |
| `sound_launch`, `sound_impact` | Eventi sonori FMOD |
| `draw_light_area`, `draw_light_size` | Bagliore durante il volo |

### Sparare un proiettile

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

Entrambe le posizioni sono di tipo `Vector3`. Il campo `posV3` di una casella (tile) è il più comodo; il campo `current_position` di un'unità è un `Vector2`, quindi richiede una conversione.

ID vanilla consigliati per il clone: `arrow` · `snowball` · `firebomb` · `torch`.

### I tuoi sprite personali

Il campo `texture` su un proiettile **non** è un percorso completo. La libreria vi antepone automaticamente `effects/projectiles/`, perciò scrivi soltanto il nome puro.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // NON "effects/projectiles/hello_bolt"
```

Anche i proiettili si caricano come lista di sprite: una **cartella** col nome di `texture`, un PNG per frame, e più frame diventano l'animazione di volo quando `animated` è attivo. Un `hello_bolt.png` sciolto torna come lista vuota, e disegnare il proiettile lancia `ArgumentOutOfRangeException` :PESgn_Oops:.

`texture_shadow` è invece un percorso completo senza prefissi: vanilla punta al condiviso `shadows/projectiles/shadow_ball`, e riutilizzarlo è quasi sempre la scelta ideale.

## Incantesimi

Un incantesimo (spell) è ciò che un'unità lancia per propria iniziativa, senza input del giocatore. L'IA decide quando scagliarlo in base a `chance`, `cost_mana` e `min_distance`.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // propensione dell'IA a sceglierlo
    min_distance = 5f,                  // distanza minima per il lancio
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // lanciato solo sotto questa frazione di salute. 0 = sempre
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` è un `AttackAction`, la stessa firma delegata usata dai modificatori (modifier) delle armi: il corpo di un incantesimo e quello di un incantamento sono quindi del tutto intercambiabili.

### Assegnare un incantesimo a un'entità

Gli incantesimi si attaccano a ciò che li concede, tramite id:

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()` aggiunge solo un id. La libreria trasforma gli id in incantesimi in `linkAssets()`, all'avvio, prima della tua mod: salta `linkSpells()` su un tratto (trait) o un oggetto che hai registrato tu e non concede nulla, in silenzio.

Id di incantesimi vanilla che vale la pena leggere: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Azioni di combattimento

Un incantesimo è qualcosa che un'unità lancia. Un'**azione di combattimento** è qualcosa che *fa* in mezzo alla lotta: uno scatto, una schivata, una torcia lanciata prima di avvicinarsi. Il gioco le estrae in momenti fissi di uno scontro, chiamati pool.

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

| Pool | Quando viene estratto |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | Mentre si avvicina per un colpo corpo a corpo. Usa `action_actor_target_position` |
| `BEFORE_ATTACK_RANGE` | Sta per tirare. Stesso delegate |
| `BEFORE_HIT` | Sta per essere colpita. Usa `action_actor`, come la schivata |
| `BEFORE_HIT_BLOCK` | Sta per essere colpita, para invece. Come la parata |
| `BEFORE_HIT_DEFLECT` | Arriva un proiettile. Come la deviazione |

| Campo | Cosa fa |
| --- | --- |
| `chance` | Tirato quando l'azione è possibile, aumentato dallo `skill_combat` dell'unità |
| `cost_stamina` / `cost_mana` | Pagato all'uso. Se non basta, non è un'opzione |
| `cooldown` | Secondi dello stato `recovery_combat_action` subito dopo, che blocca ogni azione di combattimento |
| `can_do_action` | La tua condizione, dato il bersaglio |

> [!WARNING] Solo i tratti le distribuiscono
> Un'unità raccoglie le azioni di combattimento dai suoi tratti e dalla sua sottospecie (subspecies), clan e religione (religion), mai dall'equipaggiamento. Il tratto conserva gli id, e il gioco ha trasformato gli id in oggetti all'avvio: chiama `linkCombatActions()` dopo `addCombatAction()`, altrimenti il tratto porta una mossa che nessuno fa mai :PES2_Shrug:.

## Effetti

Un `EffectAsset` è pura resa visiva: un prefab o un'animazione di sprite riprodotta a determinate coordinate. Utilizzerai gli effetti preesistenti molto più spesso di quanto ne creerai di nuovi.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // alcuni effetti accettano parametri
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Campo | Cosa fa |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Quale prefab istanziare |
| `sprite_path`, `load_texture`, `time_between_frames` | Animazione di sprite alternativa |
| `spawn_action` | Codice eseguito allo spawn (è così che `fx_cloud` trasforma un parametro in una nuvola) |
| `limit`, `limit_unload` | Quanti possono coesistere a schermo |
| `cooldown_interval` | Intervallo minimo tra generazioni |
| `sound_launch`, `sound_loop_idle` | Eventi audio FMOD |
| `draw_light_area`, `draw_light_size` | Bagliore emesso |
| `show_on_mini_map` | Se compare sulla minimappa |

> [!TIP] Guarda prima di costruire
> Ci sono già centinaia di effetti `fx_*` nel gioco, e `EffectsLibrary` è una classe piuttosto breve. Aprila in dnSpy (vedi **[Leggere il codice di gioco](#/toolbox/reading-the-game-code)**) e scorri gli ID disponibili. Quasi sempre l'esplosione che stavi per disegnare esiste già :PESgn_CheckPins:.
