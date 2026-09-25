---
title: 데이터 저장 및 기억하기
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbfloppysavewink:
order: 44
---

# 데이터 저장 및 기억하기 :wbfloppysavewink:

모드를 개발하다 보면 특정 유닛에 관한 정보를 영구적으로 기억해야 할 때가 있습니다: 몇 번 피격되었는지, 이미 보상을 받았는지, 어느 신전에서 기도하는지 등입니다. 유닛을 키로 사용하는 static Dictionary는 플레이어가 게임을 저장하고 다시 불러오는 순간 모든 것을 잊어버립니다 :wbfacepalm:.

게임에는 이미 이를 위한 완벽한 공간이 마련되어 있습니다. 모든 유닛, 도시, 왕국 (kingdom), 건물 (building), 아이템, 책은 데이터 객체에 상태를 보관하며, 각 객체에는 세이브 파일과 함께 저장되는 작은 **커스텀 데이터**(Custom Data) 저장소가 내장되어 있습니다.

## 제공되는 5가지 타입

| 메서드 호출 | 기능 |
| --- | --- |
| `data.set(key, value)` | 특정 키에 `int`, `long`, `float`, `string`, `bool` 값을 저장 |
| `data.get(key, out value, default)` | 값을 읽어옴. 키가 없으면 기본값을 반환 |
| `data.change(key, amount, min, max)` | `int` 값을 더하고 범위를 제한(clamp)하는 작업을 한 번에 처리 |
| `data.addFlag(key)` | 플래그를 설정. 이미 설정되어 있었다면 `false` 반환 |
| `data.hasFlag(key)` / `data.removeFlag(key)` | 플래그 확인 및 제거 |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | 특정 값을 삭제 |

각 타입마다 별도의 내부 테이블을 사용하므로 동일한 키에 `int`와 `string`을 저장해도 충돌하지 않습니다. 다만 유지보수를 위해 키를 공유하지 않는 것이 좋습니다. 미래의 여러분은 어느 게 어느 건지 기억하지 못할 겁니다.

## 객체 전체를 통째로 저장하기

기본형 다섯 개가 1995년처럼 느껴지고, 정말로 클래스나 목록 전체를 액터에 저장해야 한다면, NML은 `NeoModLoader.General.Game.extensions`에 `DataExtension`을 제공합니다: 아래의 데이터 객체에 대해 `Set`과 `TryGet`이라는 두 가지 확장 메서드를 사용할 수 있습니다.

데이터 클래스를 `BasicCustomData<T>`로 감싸세요:

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}
```

`Actor actor`를 가진 메서드 내부에서 저장하기 전에 값을 생성합니다:

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// 액터에 저장:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// 다시 읽어오기:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

내부적으로 `Set`은 객체를 JSON으로 변환하고 위의 표에 있는 일반 `data.set(key, string)`을 사용해 저장합니다. 즉 유닛당 키 하나마다 문자열 하나가 들어가므로, 아래의 "데이터 크기 가볍게 유지하기" 규칙이 두 배로 적용됩니다. 클래스에는 매개변수가 없는 생성자가 필요하며, public 필드와 프로퍼티가 저장 대상이 됩니다.

모드 업데이트마다 데이터 형식이 바뀔 것으로 예상된다면, 클래스에 직접 `ICustomData`를 구현하세요. 두 가지 메서드로 구성됩니다: `Serialize()`는 `SerializedCustomData(modId, dataVersion, jObject)`를 반환하고, `Deserialize(SerializedCustomData)`는 이를 다시 받아옵니다. 내부에서 `ModId`와 `DataVersion`을 확인하는 것은 여러분의 몫이며, 아무도 대신해 주지 않습니다. `BasicCustomData<T>`는 둘 다에 플레이스홀더 값을 기록하고 다른 값이 들어오면 예외를 던지므로, 하나의 키에 두 방식을 섞어 쓰지 마세요 :PES5_Hmmmm:.

> [!NOTE] NML 1.2.0 기준 확인됨
> 이러한 이름과 시그니처는 NML 문서(언급되지 않음)가 아니라 NML 어셈블리 자체에서 직접 확인한 것입니다. 더 최신 NML에서 무언가가 변경된다면, 플레이어가 문제를 겪기 전에 컴파일러가 먼저 알려줄 것입니다.

## HelloBox 예제

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

월드를 저장하고 다시 불러와 보세요: 유닛 자체의 세이브 데이터에 포함되어 있으므로 카운트가 그대로 유지됩니다. 플래그 덕분에 50회 이후의 매 공격마다 보상이 중복 지급되지 않습니다. 후하긴 하지만, 그래도 버그입니다.

일반 특성과 동일한 로컬라이제이션 텍스트:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data`는 `internal`입니다
> 유닛의 data 필드는 게임 어셈블리 내에서 `internal`로 지정되어 있습니다. NML은 **공개화(publicized)**된 어셈블리를 기반으로 모드를 컴파일하므로 일반적인 소스 모드에서는 바로 작동합니다. 순정 어셈블리를 대상으로 자체 `.dll`을 직접 빌드할 때만 문제가 발생합니다: **[문제 해결](#/troubleshooting)**을 참조하세요. 도시와 왕국의 `data`는 원래부터 public입니다.

## 이 저장소를 지원하는 다른 객체들

| 대상 객체 | 데이터 필드 |
| --- | --- |
| 유닛 | `actor.data` |
| 도시 | `city.data` |
| 왕국 | `kingdom.data` |
| 건물 | `building.data` |
| 문화 (culture), 종교 (religion), 가문, 언어, 가족, 군대, 음모 (plot) | 각각의 `data` (모두 동일한 저장소 구조) |

## 명심해야 할 규칙

- **키에 항상 고유 접두사를 붙이세요.** 모든 모드가 동일한 저장소 공간을 공유합니다. `hello_hits`는 다른 모드와 절대 충돌하지 않지만, 단순한 `hits`는 언젠가 문제를 일으킵니다.
- **모드를 제거해도 세이브가 안전합니다.** 키가 세이브 파일에 남아 있어도 아무도 읽지 않으므로 오류가 발생하지 않습니다. 게임 자체의 저장 구조를 패치하는 것보다 훨씬 안전합니다.
- **빈 저장소는 용량을 차지하지 않습니다.** 게임은 저장 시 빈 테이블을 자동으로 제거하므로, 삭제된 키는 완전히 사라집니다.
- **데이터 크기를 가볍게 유지하세요.** 모든 유닛마다 저장됩니다. 유닛당 숫자나 플래그 하나는 무시할 수 있을 정도로 가볍지만, 수만 마리의 생물이 있는 맵에서 긴 문자열을 저장하면 세이브 파일 용량이 급증합니다.

## 월드 전체의 데이터

어떤 유닛에도 속하지 않는 상태도 있습니다: 여러분의 권능이 이 월드에 떨군 운석의 개수나, 일회성 축복이 이미 일어났는지 여부 등이 그렇습니다. 월드 또한 맵 통계(map stats) 내에 동일한 저장소를 가지고 있습니다:

```csharp
// map_stats is internal: fine in an NML source mod, same deal as actor.data above
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() clamps to 1000 unless you say otherwise
if (world.addFlag("hello_blessed")) { /* first time on this world only */ }
```

`SaveCustomData`는 동일한 `BaseSystemData` 저장소이므로, 상단 표의 모든 호출이 작동하며 NML의 `Set` / `TryGet`도 지원됩니다. 나머지 맵 통계와 함께 저장되므로 세이브 슬롯마다 독립적입니다. 새로 생성된 월드는 빈 상태로 시작합니다. 게임은 맵 통계를 구성하거나 로드할 때마다 저장소를 생성하므로 null 확인이 실패할 일은 거의 없습니다. 비용이 전혀 들지 않으니 유지하세요.

> [!TIP] 설정인가, 월드 데이터인가?
> 플레이어가 다른 세이브를 불러왔을 때 그 값이 바뀌기를 기대하는지 자문해 보세요. "운석 권능의 위력"은 바뀌지 않아야 합니다: 이는 모든 월드가 공유하는 **[모드 설정](#/nml/mod-config)**에 속합니다. "이 월드가 축복을 받았는가"는 바뀌어야 합니다: 이는 `custom_data`에 속합니다.

## 세이브를 거쳐도 살아남는 시간

`Time.time`은 게임이 실행된 이후 경과한 초 단위 시간입니다. 이를 유닛의 데이터에 저장하고, 게임을 저장한 뒤 재시작하여 다시 불러오면, 기록했던 모든 타임스탬프는 모두 전생의 기억이 되어버립니다 :wbfacepalm:.

월드는 자체적인 시계를 유지하며, 이는 맵과 함께 저장됩니다:

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in world seconds: 5 is a month, 60 is a year
double now = World.world.getCurWorldTime();

// the store has no double, a float is plenty for a timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

또한 게임이 일시정지되면 멈추고 속도를 올리면 더 빠르게 흐르는데, 이는 거의 항상 여러분이 의도한 동작일 것입니다. `Date.getYearsSince(at)`와 `Date.getMonthsSince(at)`가 나눗셈 계산을 대신해 줍니다.

## 월드가 로드된 후 코드 실행하기

위의 모든 내용은 필요할 때 읽어오는 방식이므로, 일반적으로 월드가 언제 로드되었는지 알 필요가 없습니다. 하지만 자체 캐시를 재구축하는 등의 이유로 알아야 할 때, 모드가 **[Harmony](#/nml/harmony-patches)**로 후킹하는 주요 메서드는 다음과 같습니다:

| 메서드 | 실행 시점 |
| --- | --- |
| `MapBox.clearWorld` (public) | 월드가 생성되거나 로드되기 직전. 여기서 static 캐시를 정리하세요 |
| `SaveManager.loadActors` (private) | 세이브 로드 중, 유닛들이 다시 구성된 직후 |
| `MapBox.finishMakingWorld` (public) | 월드 생성 및 로드가 완료되어 가는 시점 |
| `SaveManager.saveWorldToDirectory` (public, static) | 수동 또는 자동 저장 시. Prefix는 저장소에 기록할 마지막 기회입니다 |
| `MapBox.addLastStep` (private) | 게임 시작 시 단 한 번. 월드마다 호출되지 않음 |
| `MapBox.OnApplicationQuit` (private) | 게임 종료 시 |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // a cached copy for code that reads it every frame; the save keeps the real one
        public static int MeteorsThisWorld;

        // runs for a brand new world and for a loaded save alike
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

private 메서드는 Harmony 페이지에서 설명한 대로 `[HarmonyPatch(typeof(SaveManager), "loadActors")]`와 같이 문자열로 이름을 전달합니다. `finishMakingWorld`가 실행될 때도 로딩 화면은 여전히 떠 있으며, 뒤이어 몇 가지 단계가 더 수행됩니다.

## 나만의 파일로 저장하기

많은 모드가 이러한 시스템을 건너뛰고 `File.WriteAllText`를 사용해 JSON 파일을 직접 작성합니다. 주로 `Player.log` 옆의 `LocalLow\mkarpenko\WorldBox` 폴더인 `Application.persistentDataPath` 아래에 저장합니다. 이는 내보낸 즐겨찾기 유닛 목록이나 플레이어가 진행한 모든 게임 전반의 통계처럼 **플레이어**에게 속한 데이터라면 괜찮습니다.

하지만 **월드**에 속한 데이터라면 잘못된 방식입니다. 파일은 어떤 세이브 슬롯이 로드되었는지 알지 못합니다. 플레이어가 슬롯 1의 왕국을 축복하고 슬롯 2를 불러오면, 슬롯 2도 축복을 받게 됩니다. 그런 다음 슬롯 1을 삭제해도 여러분의 파일은 그 상태를 영원히 유지하게 됩니다 :PES2_F:. 세이브가 바뀔 때 함께 바뀌어야 하는 데이터라면, 위의 저장소 중 하나를 사용하여 세이브 파일 내에 보관하세요.

## 다음 단계

플레이어가 한 번 선택하고 모든 월드가 공유하는 값은 **[모드 설정](#/nml/mod-config)**을 참조하세요. 매 프레임 또는 게임 내 매월 무언가를 확인하는 코드는 **[매 프레임](#/nml/update-loops)**을 참조하세요 :PES_OkHand:.
