---
title: 상태 이상
group: 게임 콘텐츠
subgroup: 액터, 건물 및 AI
icon: :wbcursed:
order: 146
---

# 상태 이상 :wbcursed:

특성이 유닛이 누구인지를 나타내는 본질이라면, 상태 이상은 **지금 당장** 유닛에게 무슨 일이 일어나고 있는지를 나타냅니다 (불타는 중, 얼어붙음, 중독, 축복 등). 시간이 지나면 저절로 풀리고, 유닛 위에 자체 그래픽을 덧씌우며, 주기적인 타이머 액션을 실행할 수 있습니다.

## 상태 효과 등록하기

상태 이상은 `AssetManager.status` 라이브러리에 등록합니다. 특성과 동일한 패턴입니다: 에셋을 인스턴스화하고, 설정값을 채우고, 추가합니다.

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

> [!WARNING] 프레임은 바닐라 상태에만 로드됩니다
> `StatusLibrary` 는 로드 중 한 번 `"effects/" + texture` 로 `sprite_list` 를 채우고 `need_visual_render` 를 켭니다. 나중에 넣은 상태는 `sprite_list = null` 이고, 생물이 그걸 받는 순간부터 지속되는 동안 `Status.updateAnimationFrame()` 이 매 프레임 `NullReferenceException` 을 냅니다 :wbfacepalm:. `Initialize` 의 마지막 두 줄이 그걸 대신 해 줍니다.
>
> `texture` 는 **폴더** 를 가리킵니다: `GameResources/effects/fx_hello_status/`, 애니메이션 프레임마다 PNG 하나.


### 알아두어야 할 핵심 필드

짧은 목록입니다. 진짜 목록은 더 길고 대부분 지루합니다 :wbyawn:.

| 필드 | 설명 |
| --- | --- |
| `duration` | 지속 시간(초). 시간이 다 되면 스스로 제거됨 |
| `allow_timer_reset` | 이미 걸려있는 상태에서 다시 맞았을 때 시간을 초기화할지 여부 |
| `tier` | `StatusTier.None`, `Basic`, `Advanced`. 유닛의 `allowed_status_tiers`가 적용 여부를 판단 |
| `can_be_cured` | 치유 능력이나 성수로 정화할 수 있는지 여부 |
| `removed_on_damage` | 타격을 입는 순간 즉시 해제되는지 여부 |
| `cancel_actor_job` | 적용되는 순간 유닛이 하던 행동을 취소시킬지 여부 |
| `affects_mind` | 정신 계열 상태 이상으로 분류할지 여부 |
| `opposite_status` | 동시에 걸려있을 수 없는 상극 상태 이상 목록 |
| `remove_status` | 적용 시 강제로 해제시킬 상태 이상 목록 |
| `base_stats` | 지속되는 동안 적용될 스탯 보너스/페널티 |
| `locale_id` / `locale_description` | 이름 및 설명 툴팁 키. **필수 지정** |
| `path_icon` | 상태 이상 목록에 뜰 작은 아이콘 경로 |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | 유닛 위에 표시될 스프라이트. `texture`는 `effects/` 내부의 파일 이름만 적음 |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | 위치 오프셋 및 렌더링 스케일 |
| `opposite_traits`, `opposite_tags` | 이 상태 이상을 차단하는 특성이나 태그 |
| `action_on_receive`, `action_get_hit` | 부여 시 및 피격 시 실행될 훅 |
| `sound_idle` | 적용되어 있는 동안 무한 반복 재생될 FMOD 사운드 이벤트 |

## 나만의 스프라이트 적용하기

여기에는 함정이 있고, 누구나 한 번은 빠집니다 :wbbre:. `texture`는 전체 경로가 **아닙니다**: 상태 효과 (status) 라이브러리가 불러오기 전에 앞에 `effects/`를 붙이므로, 이름만 적으면 됩니다.

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
cursed.texture = "fx_hello_status";   // "effects/fx_hello_status"가 아님!
```

폴더를 직접 적어 넣으면 게임은 `effects/effects/fx_hello_status`를 찾고, 아무것도 못 찾고, 스프라이트를 전혀 그리지 않습니다. 바닐라 이름은 `fx_status_burning_t`, `fx_status_drowning_t` 같은 형태이므로, 그 형태를 따라 하면 문제를 피할 수 있습니다.

같은 에셋의 `path_icon`은 다른 것이고, 이쪽은 전체 경로*가 맞습니다*. 유닛 위에 그려지는 스프라이트가 아니라 상태 목록의 작은 아이콘입니다.

## 상태 효과가 실제로 무언가를 *수행*하게 만들기

`action`은 상태가 지속되는 동안 `action_interval` 초마다 실행됩니다. `action_finish`는 만료 시 실행되며, `action_death`는 상태가 걸린 채 사망했을 때 실행됩니다.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // public 메서드이며 도트 딜 처리에 안성맞춤
    return true;
};
```

## 유닛에게 상태 효과 부여하기

가장 직관적인 `actor.addStatusEffect("hello_cursed")`는 게임 어셈블리에서 `internal`로 잠겨 있습니다. 공개화(publicized)된 `Assembly-CSharp.dll`에 대고는 문제없이 컴파일되고, 보통 NML 모드는 이미 그걸 씁니다. NML은 당신의 `Code/*.cs`를 자체 공개화 사본에 대고 컴파일하므로, 이 가이드의 모든 `internal` 멤버가 그대로 컴파일됩니다. Visual Studio에서 원본 어셈블리에 대고 자기 `.dll`을 빌드할 때만 이게 안 됩니다. 그 경우에는 항상 되는 public 방법을 쓰세요:

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20초 (0을 주면 에셋 기본 지속시간)
```

AI 행동 (behaviour) 트리 내부에서는 사전 제작된 노드를 사용할 수 있습니다: `new BehActorAddStatus("hello_cursed", 20f)` 및 `new BehActorRemoveStatus("hello_cursed")`.

## 텍스트 등록을 잊지 마세요

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

키는 `locale_id`와 `locale_description`에 입력한 문자열과 동일해야 합니다. 바닐라의 `status_title_<id>` / `status_description_<id>` 규칙을 따르면 관리가 편해집니다.

> [!TIP] 일시적인 효과는 특성이 아니라 상태 이상을 쓰세요
> 시간이 지나면 사라져야 하는 모든 것(신의 능력 버프, 무기 디버프, 임시 표식)은 특성이 아니라 상태 이상입니다. 특성은 영구적이고 자식에게 유전되어 버리므로 여러분이 원한 결과가 아닐 확률이 높습니다 :PES2_Uhm:.
