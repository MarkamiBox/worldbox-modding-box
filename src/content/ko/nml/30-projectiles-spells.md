---
title: 투사체, 주문 및 이펙트
group: 게임 콘텐츠
subgroup: 액터, 건물 및 AI
icon: :wblightning:
order: 148
---

# 투사체, 주문 및 이펙트 :wblightning:

맵에서 무언가 역동적인 사건을 일으키고자 할 때 끊임없이 마주치게 되는 세 가지 소형 라이브러리가 있습니다:

| | |
| --- | --- |
| `AssetManager.projectiles` | A에서 B로 날아가는 것: 화살, 화염병, 던져진 횃불 |
| `AssetManager.spells` | 마나를 소모하고 AI 확률에 따라 유닛이 스스로 시전하는 것 |
| `AssetManager.effects_library` | 시각 연출: 폭발, 구름, 섬광, 연기 피어오름 |

## 투사체

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
            bolt.terraform_option = "demon_fireball";     // 착탄 시 지형에 미치는 효과
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

### 주요 필드

대부분은 클론한 대상에서 그대로 따라오고, 다시는 들여다볼 일이 없습니다. 실제로 바꾸게 될 건 `speed`와 `texture` 두 개입니다.

| 필드 | 역할 |
| --- | --- |
| `texture`, `texture_shadow` | 스프라이트 및 그림자 |
| `animated`, `animation_speed`, `frames` | 비행 중 애니메이션 적용 여부 |
| `speed`, `speed_random` | 비행 속도 및 탄환별 무작위 오차 |
| `look_at_target` | 스프라이트가 진행 방향을 바라보도록 회전할지 여부 |
| `scale_start`, `scale_target` | 발사 시점과 착탄 시점의 크기 |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | 비행 궤적 뒤에 남는 트레일 이펙트 |
| `end_effect`, `end_effect_scale` | 착탄 지점에 발생하는 이펙트 |
| `terraform_option`, `terraform_range` | 착탄 시 지형 변경 규칙. **[타일 및 지형](#/nml/tiles)** 참고 |
| `world_actions` | 비행 도중 주기적으로 실행되는 액션 |
| `impact_actions` | 착탄 시점에 실행되는 액션 |
| `trigger_on_collision` | 목표 지점 대신 경로상 처음 닿은 대상에서 폭발할지 여부 |
| `hit_freeze`, `hit_shake`, `shake_*` | 타격감 연출 |
| `can_be_blocked`, `can_be_left_on_ground` | 방패로 막을 수 있는지, 지면에 아이템으로 남는지 |
| `sound_launch`, `sound_impact` | FMOD 사운드 이벤트 |
| `draw_light_area`, `draw_light_size` | 비행 중 발광 효과 |

### 투사체 발사하기

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

두 위치 좌표는 모두 `Vector3`입니다. 타일의 `posV3`를 가져오는 것이 가장 간단하며, 유닛의 `current_position`은 `Vector2`이므로 사전 변환이 필요합니다.

클론하기 좋은 바닐라 투사체 ID: `arrow` · `snowball` · `firebomb` · `torch`.

### 나만의 스프라이트 등록

투사체의 `texture`는 전체 경로가 **아닙니다**. 라이브러리에서 자동으로 `effects/projectiles/`를 접두사로 붙이므로 파일 이름만 적어야 합니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // "effects/projectiles/hello_bolt" 로 적지 말 것
```

투사체도 스프라이트 목록으로 불러옵니다. `texture` 이름의 **폴더** 에 프레임마다 PNG 하나를 넣고, `animated` 가 켜져 있으면 여러 프레임이 비행 애니메이션이 됩니다. 폴더 없는 `hello_bolt.png` 는 빈 목록이 되고, 투사체를 그릴 때 `ArgumentOutOfRangeException` 이 납니다 :PESgn_Oops:.

`texture_shadow`는 자동 접두사가 없는 전체 경로입니다. 바닐라는 공용 `shadows/projectiles/shadow_ball`을 참조하므로 이를 그대로 재사용하는 것이 가장 좋습니다.

## 주문

주문은 플레이어의 개입 없이 유닛이 스스로 시전하는 마법입니다. AI는 `chance`, `cost_mana`, `min_distance`에 기반하여 시전 시점을 결정합니다.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // AI가 이 주문을 선택할 선호도
    min_distance = 5f,                  // 이 거리보다 가까우면 시전하지 않음
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // 이 체력 비율 이하일 때만 시전. 0 = 상시 시전
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action`은 무기 모디파이어에서 사용하는 것과 동일한 `AttackAction` 델리게이트이므로, 주문의 실행 코드와 무기 인챈트 코드는 상호 호환됩니다.

### 엔티티에 주문 부여하기

주문은 그것을 주는 대상에 ID로 붙입니다:

```csharp
trait.addSpell("hello_bolt");        // any trait, of any of the seven systems
trait.linkSpells();                  // the ids became objects at startup: do it for yours
item.addSpell("hello_bolt");         // an item
item.linkSpells();
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

`addSpell()`은 ID를 추가할 뿐입니다. 라이브러리는 여러분의 모드보다 먼저, 시작할 때 `linkAssets()`에서 ID를 주문으로 바꿉니다. 직접 등록한 특성이나 아이템에서 `linkSpells()`를 빼먹으면 아무것도 주지 않고, 조용히 넘어갑니다.

읽어 볼 만한 바닐라 주문 ID: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## 전투 액션

주문은 유닛이 시전하는 것입니다. **전투 행동**은 싸우는 도중에 유닛이 *하는* 것입니다: 돌진, 회피, 달려들기 전에 던지는 횃불. 게임은 풀이라고 부르는 전투 중 정해진 순간에 이것들을 추첨합니다.

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

| 풀 | 추첨되는 때 |
| --- | --- |
| `BEFORE_ATTACK_MELEE` | 근접 공격을 위해 다가갈 때. `action_actor_target_position` 사용 |
| `BEFORE_ATTACK_RANGE` | 막 쏘려고 할 때. 같은 델리게이트 |
| `BEFORE_HIT` | 막 맞으려고 할 때. 회피처럼 `action_actor` 사용 |
| `BEFORE_HIT_BLOCK` | 막 맞으려고 할 때, 대신 막기. 막기와 같음 |
| `BEFORE_HIT_DEFLECT` | 투사체가 날아올 때. 튕겨 내기와 같음 |

| 필드 | 하는 일 |
| --- | --- |
| `chance` | 행동이 가능할 때 굴리며, 유닛의 `skill_combat`으로 올라갑니다 |
| `cost_stamina` / `cost_mana` | 사용할 때 지불합니다. 부족하면 선택지가 되지 않습니다 |
| `cooldown` | 사용 후 `recovery_combat_action` 상태의 초 단위 시간으로, 그동안 모든 전투 행동이 막힙니다 |
| `can_do_action` | 목표를 받아 판단하는 여러분의 조건 |

> [!WARNING] 특성만이 이것을 나눠 줍니다
> 유닛은 전투 행동을 특성과, 아종·씨족·종교에서 모으며, 장비에서는 절대 모으지 않습니다. 특성은 ID를 보관하고, 게임은 시작할 때 ID를 객체로 바꿨습니다: `addCombatAction()` 다음에 `linkCombatActions()`를 호출하세요. 그러지 않으면 그 특성은 아무도 쓰지 않는 기술을 들고 다니게 됩니다 :PES2_Shrug:.

## 이펙트

`EffectAsset`은 순수한 시각 효과입니다. 특정 위치에서 재생되는 프리팹 또는 스프라이트 애니메이션입니다. 직접 새로 만들기보다는 기존 이펙트를 호출하는 경우가 훨씬 많습니다.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // 일부 이펙트는 매개변수를 받음
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| 필드 | 역할 |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | 인스턴스화할 프리팹 |
| `sprite_path`, `load_texture`, `time_between_frames` | 스프라이트 애니메이션 사용 시 설정 |
| `spawn_action` | 이펙트 스폰 시 실행될 코드 (`fx_cloud`가 매개변수를 구름으로 변환하는 방식) |
| `limit`, `limit_unload` | 화면에 동시 존재 가능한 최대 수량 |
| `cooldown_interval` | 스폰 간 최소 쿨다운 시간 |
| `sound_launch`, `sound_loop_idle` | FMOD 사운드 이벤트 |
| `draw_light_area`, `draw_light_size` | 발광 효과 |
| `show_on_mini_map` | 미니맵에 표시할지 여부 |

> [!TIP] 만들기 전에 먼저 확인하세요
> 게임에는 이미 수백 개의 `fx_*` 이펙트가 존재하며, `EffectsLibrary`는 매우 짧은 클래스입니다. dnSpy로 열어(**[게임 코드 읽기](#/toolbox/reading-the-game-code)** 참고) id 목록을 한 번 훑어보세요. 당신이 그리려던 폭발 효과는 이미 게임 안에 마련되어 있을 확률이 높습니다 :PESgn_CheckPins:.
