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
| `group_id` | 배치될 탭: `units`, `civilizations`, `spawn`, `diplomacy`, `nature`, … |
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

## 텍스트 로컬라이제이션

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one."
}
```

> [!WARNING] 세계 법칙은 ID 그대로가 아니라 `_title`을 씁니다
> 거의 모든 다른 에셋은 ID 그대로를 이름 키로 씁니다. 세계 법칙은 `<id>_title`을 요구합니다. 틀리면 스위치가 라벨 없이 나타납니다 :PESgn_Really:.

> [!TIP] 설정보다 법칙
> 모드 설정은 플레이어가 한 번 여는 메뉴에 있습니다. 세계 법칙은 게임 안, 바닐라 법칙 바로 옆에 세계별로 있고, 게임 도중에도 바꿀 수 있습니다. 여러분의 모드에 켜고 끄는 동작이 있다면, 여기가 제자리입니다 :wbblessed:.
