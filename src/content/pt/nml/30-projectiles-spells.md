---
title: Projéteis, feitiços e efeitos
group: Conteúdo do jogo
subgroup: Atores, construções e IA
icon: :wblightning:
order: 148
---

# Projéteis, feitiços e efeitos :wblightning:

Três bibliotecas compactas que surgem o tempo todo assim que você começa a fazer coisas acontecerem no mapa:

| | |
| --- | --- |
| `AssetManager.projectiles` | Algo voando de A para B: uma flecha, uma bomba incendiária, uma tocha arremessada |
| `AssetManager.spells` | Algo que uma unidade conjura por conta própria, com custo de mana e chance de IA |
| `AssetManager.effects_library` | Pura apresentação visual: uma explosão, uma nuvem, um clarão, uma fumaça |

## Projéteis

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
            bolt.terraform_option = "demon_fireball";     // impacto causado no chão
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

### Os campos

A maioria vem com o que você clonou e você nunca mais olha para eles. `speed` e `texture` são os dois que você vai mudar de verdade.

| Campo | O que faz |
| --- | --- |
| `texture`, `texture_shadow` | Sprite e sua sombra |
| `animated`, `animation_speed`, `frames` | Se o projétil se anima durante o voo |
| `speed`, `speed_random` | Velocidade de voo e variação aleatória por disparo |
| `look_at_target` | Se o sprite gira para encarar a trajetória |
| `scale_start`, `scale_target` | Tamanho no lançamento e no impacto |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | O rastro que deixa para trás |
| `end_effect`, `end_effect_scale` | O efeito gerado no ponto de impacto |
| `terraform_option`, `terraform_range` | Alteração de terreno ao acertar. Veja **[Ladrilhos e terreno](#/nml/tiles)** |
| `world_actions` | Roda durante o trajeto de voo |
| `impact_actions` | Roda no momento do impacto |
| `trigger_on_collision` | Detona no primeiro obstáculo que tocar em vez do alvo |
| `hit_freeze`, `hit_shake`, `shake_*` | Sensação física de impacto |
| `can_be_blocked`, `can_be_left_on_ground` | Se escudos o bloqueiam, se vira item coletável no chão |
| `sound_launch`, `sound_impact` | Eventos de áudio FMOD |
| `draw_light_area`, `draw_light_size` | Brilho durante o voo |

### Disparando um projétil

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

Ambas as posições são do tipo `Vector3`. O `posV3` de um ladrilho é o mais direto de usar; o `current_position` de uma criatura é um `Vector2`, exigindo conversão prévia.

IDs vanilla úteis para clonar: `arrow` · `snowball` · `firebomb` · `torch`.

### Seu próprio sprite

O campo `texture` num projétil **não** é um caminho completo. A biblioteca adiciona `effects/projectiles/` automaticamente, então você só escreve o nome básico.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // NÃO "effects/projectiles/hello_bolt"
```

Projéteis também carregam como lista de sprites: uma **pasta** com o nome de `texture`, um PNG por frame, e vários frames viram a animação de voo quando `animated` está ligado. Um `hello_bolt.png` solto volta como lista vazia, e desenhar o projétil lança `ArgumentOutOfRangeException` :PESgn_Oops:.

`texture_shadow` é um caminho completo sem prefixo: o vanilla aponta para o recurso compartilhado `shadows/projectiles/shadow_ball`, e reutilizá-lo é quase sempre a melhor saída.

## Feitiços

Um feitiço é o que uma unidade conjura por conta própria, sem a intervenção do jogador. A IA decide quando disparar com base em `chance`, `cost_mana` e `min_distance`.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // predisposição da IA para escolhê-lo
    min_distance = 5f,                  // não conjura mais perto que isso
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // só conjura abaixo desta fração de vida. 0 = sempre
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` é um `AttackAction`, a mesma assinatura de delegate usada pelos modificadores de armas: o código de um feitiço e o de um encantamento são, portanto, intercambiáveis.

### Concedendo um feitiço a uma entidade

Feitiços ficam presos ao que os concede, por id:

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()` só adiciona um id. A biblioteca transforma ids em feitiços em `linkAssets()`, na inicialização, antes do seu mod: pule `linkSpells()` num traço ou item que você mesmo registrou e ele não concede nada, em silêncio.

Ids de feitiços vanilla que valem a leitura: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Ações de combate

Um feitiço é algo que uma unidade lança. Uma **ação de combate** é algo que ela *faz* no meio da luta: uma investida, uma esquiva, uma tocha jogada antes de se aproximar. O jogo sorteia essas ações em momentos fixos de um combate, chamados pools.

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

| Pool | Quando é sorteado |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | Ao se aproximar para um golpe corpo a corpo. Usa `action_actor_target_position` |
| `BEFORE_ATTACK_RANGE` | Prestes a atirar. Mesmo delegate |
| `BEFORE_HIT` | Prestes a ser atingida. Usa `action_actor`, como a esquiva |
| `BEFORE_HIT_BLOCK` | Prestes a ser atingida, bloquear em vez disso. Como o bloqueio |
| `BEFORE_HIT_DEFLECT` | Um projétil chegando. Como o desvio |

| Campo | O que faz |
| --- | --- |
| `chance` | Rolado quando a ação é possível, aumentado pelo `skill_combat` da unidade |
| `cost_stamina` / `cost_mana` | Pago ao usar. Se não houver o suficiente, não é opção |
| `cooldown` | Segundos do status `recovery_combat_action` depois, que bloqueia toda ação de combate |
| `can_do_action` | Sua condição, dado o alvo |

> [!WARNING] Só traços distribuem essas ações
> Uma unidade reúne ações de combate dos seus traços e da sua subespécie, clã e religião, nunca do equipamento. O traço guarda ids, e o jogo transformou ids em objetos na inicialização: chame `linkCombatActions()` depois de `addCombatAction()`, senão o traço carrega um golpe que ninguém nunca faz :PES2_Shrug:.

## Efeitos

Um `EffectAsset` é pura apresentação: um prefab ou uma animação de sprites reproduzida em coordenadas específicas. Você usará os efeitos existentes com muito mais frequência do que criará novos.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // alguns efeitos recebem parâmetros
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Campo | O que faz |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Qual prefab instanciar |
| `sprite_path`, `load_texture`, `time_between_frames` | Ou animação de sprites alternativa |
| `spawn_action` | Código executado ao surgir (é assim que `fx_cloud` transforma um parâmetro numa nuvem) |
| `limit`, `limit_unload` | Limite simultâneo em tela |
| `cooldown_interval` | Intervalo mínimo entre spawns |
| `sound_launch`, `sound_loop_idle` | Eventos de som FMOD |
| `draw_light_area`, `draw_light_size` | Brilho emitido |
| `show_on_mini_map` | Se aparece no minimapa |

> [!TIP] Olhe antes de desenhar
> Já existem centenas de efeitos `fx_*` no jogo, e `EffectsLibrary` é uma classe curta. Abra-a no dnSpy (veja **[Lendo o código do jogo](#/toolbox/reading-the-game-code)**) e dê uma olhada nos IDs. Na maioria das vezes, a explosão que você estava prestes a desenhar já existe pronta :PESgn_CheckPins:.
