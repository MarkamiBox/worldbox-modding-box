---
title: 도전 과제
group: 게임 콘텐츠
subgroup: 마무리 및 업적
icon: :gold_star:
order: 220
---

# 도전 과제 :gold_star:

네, 모드로 커스텀 도전 과제(업적 (achievement))를 추가할 수 있습니다. 게임 내 도전 과제 창에 정상적으로 표시되고, 실제 업적처럼 팝업 알림이 뜨며, 플레이어의 진행 상황 세이브 파일에 저장됩니다. 모드를 배포하기 전에 페이지 하단의 경고를 꼭 읽어보세요.

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

동시에 10마리의 위스프가 생존하면 도전 과제가 달성됩니다. 역대 업적 톱 10입니다 :trollface:.

## 게임이 자동으로 해주지 않는 작업들

- **텍스트 키 설정.** `post_init()`은 시작 시 바닐라 업적들의 ID로부터 `locale_key`를 자동 생성하지만, 모드 업적은 `null`로 남아 창에 아무것도 출력되지 않습니다. 직접 설정하세요.
- **창 등록.** 도전 과제 창은 시작 시 `linkAssets()`가 채운 각 그룹의 `achievements_list`를 읽어옵니다. 그룹 리스트에 직접 추가하지 않으면 달성되어도 아무도 볼 수 없습니다.
- **조건 확인 시점.** 게임은 자작 업적을 *언제* 검사해야 하는지 알지 못합니다. 바닐라 업적은 조건이 변경되는 정확한 코드 위치에서 `check()`를 호출합니다. HelloBox는 30초마다 검사하는 **[월드 행동](#/nml/world-ages)**을 사용하며, "특정 생물 10마리 존재"와 같은 조건에 완벽합니다. 이벤트성 업적의 경우 해당 이벤트가 일어나는 위치에서 직접 `check()`를 호출하세요.

| 필드 | 기능 |
| --- | --- |
| `group` | 창 카테고리: `creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | 아이콘 이미지 (전체 스프라이트 경로) |
| `action` | 달성 조건 델리게이트. `true`를 반환하면 `check()` 호출 시 해금되며, `action`이 없는 상태에서 `check()`를 호출하면 즉시 해금 |
| `hidden` | 해금 전까지 설명문 대신 "숨겨진 업적" 문구를 표시 |
| `locale_key` | 텍스트 키. 설명문은 `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] 플레이어의 실제 진행 파일에 기록됩니다
> 업적 해금은 게임 자체의 코드를 실행합니다: 플레이어의 진행 데이터 파일에 ID를 기록하고, Steam에 해당 ID의 업적 해금을 요청합니다. Steam에는 모드 업적이 등록되어 있지 않으므로 Steam 측에서는 아무 일도 일어나지 않지만, 호출 자체는 이루어지며 로그에 `Unlocking in Steam: <id>`가 출력됩니다. 게임 분석 이벤트에도 ID가 포함됩니다. 또한 "저주받은 세계" 법칙이 켜져 있는 동안에는 모드 업적을 포함한 모든 업적 해금이 비활성화됩니다.

이로 인해 게임이 고장 나지는 않습니다. 하지만 플레이어의 실제 영구 진행 파일에 기록되는 만큼, 업적 개수를 절제하고 플레이어가 실제로 달성하지 않은 업적을 임의로 해금하지 마세요 :PESgn_ReadRules:.
