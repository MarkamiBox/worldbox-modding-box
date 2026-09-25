---
title: 세계 법칙
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbworldlaws:
order: 176
---

# 세계 법칙 :wbworldlaws:

세계 법칙은 **세계 법칙** (world law) 창에 있는 스위치들입니다: "노화", "굶주림", "평화로운 괴물" 등이 있죠. 설정 파일을 직접 수정할 필요 없이 모드의 특정 동작을 플레이어가 게임 내에서 켜고 끌 수 있게 해주므로 가장 친화적인 기능입니다.

또한 게임 전체에서 제작하기 가장 쉬운 에셋 중 하나입니다. 필드가 딱 네 개뿐이거든요.

## 스위치 추가하기

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            if (AssetManager.world_laws_library.has(CHAOS)) return;

            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // 어떤 탭에 표시될지
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // 기본값은 꺼짐 상태
            });
        }
    }
}
```

`Main.cs` 에 `HelloLaws.Initialize();` 를 추가하면 스위치가 게임에 적용됩니다. 정말 이게 전부입니다 :poggers:.

| 필드 | 의미 |
| --- | --- |
| `id` | 법칙의 고유 이름. 번역 키로도 사용됨 |
| `group_id` | 배치될 탭. 전체 목록은 아래 **탭들**을 참고하거나, 직접 만드세요 |
| `icon_path` | 아이콘 경로, 다른 모든 리소스와 동일 |
| `default_state` | `true` = 새 월드 생성 시 켜짐, `false` = 꺼짐 |
| `can_turn_off` | 기본값 `true`. 켤 수만 있고 끌 수는 없는 법칙인 경우 `false` 로 지정 |

## 코드에서 스위치 상태 확인하기

이것이 스위치를 만든 본래 목적입니다. 아무도 읽지 않는 스위치는 장식일 뿐입니다. 모드의 어느 곳에서든 다음과 같이 확인합니다:

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // 플레이어가 혼돈을 원하니 혼돈을 선사하자
}
```

또는 에셋을 따로 가져오지 않고 월드에서 바로 확인하는 더 짧은 방법:

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)`은 모르는 id에 대해서는 예외를 던지는 대신 `false`를 반환하므로, 오타는 크래시가 아니라 "꺼짐"으로 읽힙니다. 친절하지만 동시에 끔찍한데, 아무것도 알려주지 않기 때문입니다 :PES5_Hmmmm:. `World.world.world_laws`는 `internal`이므로, NML이 여러분의 모드를 빌드할 때 쓰는 publicize된 어셈블리에서만 컴파일됩니다 (**[상태 효과](#/nml/status-effects)**의 노트 참고). 위의 에셋 경로는 어디서나 동작합니다.

실전 예제: 법칙이 켜져 있을 때만 주변으로 불씨를 퍼뜨리기:

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## 스위치가 켜지는 순간 반응하기

나중에 값을 확인하는 것이 아니라 스위치를 켜는 즉시 무언가를 *실행* 해야 하는 경우:

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* 플레이어가 스위치를 켤 때 실행됨 */ }
};
```

## 탭들

창은 여러 탭으로 나뉘어 있고, `group_id`가 그중 하나를 고릅니다. 다음은 창이 그리는 순서대로 나열한 모든 바닐라 그룹입니다:

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### 나만의 탭 만들기

첫 예제의 `Initialize()`를 아래 버전으로 바꾸고, `CHAOS` 옆에 `GROUP`을 추가하세요.

그룹은 `AssetManager.world_law_groups` 안의 `WorldLawGroupAsset`입니다. 특성 탭이 쓰는 것과 똑같은 작은 `BaseCategoryAsset`입니다. **[특성 그룹 및 탭](#/nml/trait-groups)** 참고:

| 필드 | 의미 |
| --- | --- |
| `id` | 법칙의 `group_id`가 가리키는 값 |
| `name` | 탭 제목의 **로케일 키**입니다. 제목 자체가 아닙니다 |
| `color` | 헥스 문자열. 탭 제목에 색을 입힘 |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // the group first: the laws below point at it
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // the locale key, not the text
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

UI 작업은 필요 없습니다: 세계 법칙 창은 `world_law_groups.list`의 항목마다 탭을 하나씩 만든 뒤, 각 법칙을 `group_id`가 가리키는 탭에 집어넣습니다. 이는 창이 처음 만들어질 때 딱 한 번 일어나며, 그 시점에는 여러분의 모드가 이미 오래전에 로드되어 있습니다. 여러분의 탭은 맨 끝, `other` 다음에 붙습니다.

> [!WARNING] 존재하지 않는 `group_id`는 창 전체를 망가뜨립니다
> 창은 평범한 딕셔너리 인덱스로 탭을 찾습니다. 아무도 등록하지 않은 그룹을 가리키는 법칙이 하나라도 있으면 창이 만들어지는 도중에 `KeyNotFoundException`이 발생하고, 그 이후에 등록된 모든 법칙은 (여러분의 것이든 다른 모드의 것이든) 창에 나타나지 못합니다. 법칙보다 그룹을 먼저 등록하고, 철자를 두 번 다 똑같이 맞추세요 :PESgn_ToughLuck:.

## 텍스트 로컬라이제이션

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] 세계 법칙은 ID 그대로가 아니라 `_title`을 씁니다
> 거의 모든 다른 에셋은 ID 그대로를 이름 키로 씁니다. 세계 법칙은 `<id>_title`을 요구합니다. 틀리면 스위치가 라벨 없이 나타납니다 :PESgn_Really:.

> [!TIP] 설정보다 법칙
> 모드 설정은 플레이어가 한 번 여는 메뉴에 있습니다. 세계 법칙은 게임 안, 바닐라 법칙 바로 옆에 세계별로 있고, 게임 도중에도 바꿀 수 있습니다. 여러분의 모드에 켜고 끄는 동작이 있다면, 여기가 제자리입니다 :wbblessed:.
