---
title: 데이터 저장 및 기억하기
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbfloppysavewink:
order: 44
---

# 데이터 저장 및 기억하기 :wbfloppysavewink:

모드를 개발하다 보면 특정 유닛에 관한 정보를 영구적으로 기억해야 할 때가 있습니다: 몇 번 피격되었는지, 이미 보상을 받았는지, 어느 신전에서 기도하는지 등입니다. 유닛을 키로 사용하는 static Dictionary는 플레이어가 게임을 저장하고 다시 불러오는 순간 모든 것을 잊어버립니다 :wbfacepalm:.

게임에는 이미 이를 위한 완벽한 공간이 마련되어 있습니다. 모든 유닛, 도시, 왕국, 건물, 아이템, 책은 데이터 객체에 상태를 보관하며, 각 객체에는 세이브 파일과 함께 저장되는 작은 **커스텀 데이터**(Custom Data) 저장소가 내장되어 있습니다.

## 저장소

| 메서드 호출 | 기능 |
| --- | --- |
| `data.set(key, value)` | 특정 키에 `int`, `long`, `float`, `string`, `bool` 값을 저장 |
| `data.get(key, out value, default)` | 값을 읽어옴. 키가 없으면 기본값을 반환 |
| `data.change(key, amount, min, max)` | `int` 값을 더하고 범위를 제한(clamp)하는 작업을 한 번에 처리 |
| `data.addFlag(key)` | 플래그를 설정. 이미 설정되어 있었다면 `false` 반환 |
| `data.hasFlag(key)` / `data.removeFlag(key)` | 플래그 확인 및 제거 |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | 특정 값을 삭제 |

각 타입마다 별도의 내부 테이블을 사용하므로 동일한 키에 `int`와 `string`을 저장해도 충돌하지 않습니다. 다만 유지보수를 위해 키를 공유하지 않는 것이 좋습니다.

> [!NOTE] 다섯 가지 기본 타입보다 더 큰 데이터 저장
> NML에는 `int`/`long`/`float`/`string`/`bool`뿐만 아니라 객체 전체를 유닛 데이터에 담을 수 있는 자체 유틸리티가 있습니다. 저는 카운터나 플래그 이상을 필요로 해본 적이 없어서 여기서 직접 설명해드릴 수는 없지만, 구조체나 리스트 전체를 기억해야 할 때를 위해 존재합니다.

## HelloBox 구현

공격을 성공시킬 때마다 타격 횟수를 누적하고, 50회에 도달했을 때 단 한 번 보상 특성을 지급하는 예제입니다:

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

월드를 저장하고 다시 불러와 보세요: 유닛 자체의 세이브 데이터에 포함되어 있으므로 카운트가 그대로 유지됩니다. 플래그 덕분에 50회 이후의 매 공격마다 보상이 중복 지급되지 않습니다.

일반 특성과 동일한 로컬라이제이션 텍스트:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data`는 `internal`입니다
> 유닛의 data 필드는 게임 어셈블리 내에서 `internal`로 지정되어 있습니다. NML은 **공개화(publicized)**된 어셈블리를 기반으로 모드를 컴파일하므로 일반적인 소스 모드에서는 바로 작동합니다. 순정 어셈블리를 대상으로 자체 `.dll`을 직접 빌드할 때만 문제가 발생합니다: **[문제 해결](#/troubleshooting)**을 참조하세요. 도시와 왕국의 `data`는 원래부터 public입니다.

## 데이터가 저장되는 위치

| 대상 객체 | 데이터 필드 |
| --- | --- |
| 유닛 | `actor.data` |
| 도시 | `city.data` |
| 왕국 | `kingdom.data` |
| 건물 | `building.data` |
| 문화, 종교, 가문, 언어, 가족, 군대, 음모 | 각각의 `data` (모두 동일한 저장소 구조) |

## 알아두어야 할 점

- **키에 항상 고유 접두사를 붙이세요.** 모든 모드가 동일한 저장소 공간을 공유합니다. `hello_hits`는 다른 모드와 절대 충돌하지 않지만, 단순한 `hits`는 언젠가 문제를 일으킵니다.
- **모드를 제거해도 세이브가 안전합니다.** 키가 세이브 파일에 남아 있어도 아무도 읽지 않으므로 오류가 발생하지 않습니다. 게임 자체의 저장 구조를 패치하는 것보다 훨씬 안전합니다.
- **빈 저장소는 용량을 차지하지 않습니다.** 게임은 저장 시 빈 테이블을 자동으로 제거하므로, 삭제된 키는 완전히 사라집니다.
- **데이터 크기를 가볍게 유지하세요.** 모든 유닛마다 저장됩니다. 유닛당 숫자나 플래그 하나는 무시할 수 있을 정도로 가볍지만, 수만 마리의 생물이 있는 맵에서 긴 문자열을 저장하면 세이브 파일 용량이 급증합니다.

특정 객체에 종속되지 않는 전역 설정(월드 전체 설정 등)은 모드 설정을 활용하세요: **[모드 설정](#/nml/mod-config)** 참조 :PES_OkHand:.
