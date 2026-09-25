---
title: 매 프레임마다
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbyawn:
order: 43
---

# 매 프레임마다 :wbyawn:

메인 클래스는 유니티 컴포넌트입니다. `BasicMod<T>`는 `MonoBehaviour`를 상속하므로, 여기에 `Update()` 메서드를 작성하면 유니티가 프레임마다 한 번씩 호출합니다. 실행 직후 첫 1초부터 게임이 꺼질 때까지, 월드가 있든 없든 초당 예순 번씩요.

이곳은 무언가에 대한 반응이 아닌 것들을 위한 자리입니다: 인게임 한 달마다의 체크, Harmony 패치에서 넘어온 큐, 키 입력 같은 것들이죠. 동시에 누군가의 게임을 슬라이드쇼로 만들어버리는 가장 손쉬운 방법이기도 합니다 :wbfacepalm:.

## 가드

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    // game_loaded: past startup. worldLoading: no world half cleared or half built
    if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

    HelloTicker.Tick();
}
```

| 체크 | 무엇을 막아주는가 |
| --- | --- |
| `World.world != null` | 아직 맵 인스턴스 자체가 존재하지 않는 상태 |
| `Config.game_loaded` | 실행 직후, 게임이 첫 월드를 시작하기 전의 순간 |
| `Config.worldLoading` | 로딩 화면. 월드가 정리되거나, 생성되거나, 로드되는 중이라 유닛 목록이 발밑에서 비워지고 다시 채워지는 상태 |

`Config.worldLoading`은 `SmoothLoader.isLoading()`이며, 게임 자체의 `MapBox.Update()`가 시뮬레이션을 돌리기 전에 하는 것과 동일한 체크입니다. **[로그 및 디버깅](#/nml/logs-and-debugging)**의 가드는 시작 시점을 다루고, 로딩 체크를 더하면 그 이후의 모든 월드 로드에서도 안전합니다.

## 매 프레임은 아니어도 됩니다

대부분의 일은 초당 예순 번씩 확인할 필요가 없습니다. 시계를 하나 골라서 거기에 맞춰 돌리세요.

| 시계 | 하는 일 |
| --- | --- |
| `Time.deltaTime` | 마지막 프레임 이후 지난 실제 초. 게임이 일시정지돼도 계속 흐르고, 속도 설정은 무시합니다. 게임은 `Time.timeScale`을 절대 건드리지 않습니다 |
| `World.world.getCurWorldTime()` | 월드 시간(초), `double` 타입. 일시정지 중이거나 창이 열려 있으면 멈추고, 속도가 높을수록 더 빨리 흐릅니다. 5가 한 달, 60이 1년입니다 |

월드 *안에서* 일어나는 일에는 월드 시간을 쓰세요. 여기서는 **[데이터 저장 및 기억하기](#/nml/saving-data)**에서 나온 grudge 특성을 가진 모든 유닛이 매달 한 대씩 맞은 걸 잊어버립니다:

```csharp Mods/HelloBox/Code/HelloTicker.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloTicker
    {
        private const double INTERVAL = 5.0;   // world seconds: one in-game month
        private static double _last;

        [HarmonyPostfix]
        public static void ResetClock(MapBox __instance)
        {
            _last = __instance == null ? 0.0 : __instance.getCurWorldTime();
        }

        public static void Tick()
        {
            if (!Config.game_loaded || Config.worldLoading || World.world == null) return;

            double now = World.world.getCurWorldTime();

            // a backwards clock resets the baseline without firing a tick
            if (now < _last) _last = now;
            if (now - _last < INTERVAL) return;
            _last = now;

            foreach (Actor actor in World.world.units)
            {
                if (actor == null || !actor.isAlive()) continue;
                if (!actor.hasTrait(HelloMemory.GRUDGE)) continue;

                actor.data.change(HelloMemory.HITS, -1, 0, 100000);
            }
        }
    }
}
```

**[Harmony 패치](#/nml/harmony-patches)**에서 나온 `PatchAll` 호출은 그대로 유지하세요: `ResetClock`은 생성되거나 로드된 모든 월드 뒤에 실행되며, 이는 같거나 더 나중 시각을 가진 월드도 마찬가지입니다. 그 월드의 첫 틱은 한 간격을 온전히 기다립니다. 역행 시계 체크 하나만으로는 모든 로드를 감지할 수 없습니다.

일시정지, 속도, 열린 창은 전부 이미 처리됩니다. 월드 시계가 알아서 그것들을 따르기 때문입니다. 월드 안에 있지 않은 것들, 예를 들어 깜빡이는 라벨 같은 데는 실제 시간을 쓰세요:

```csharp
private static float _timer;

_timer += Time.deltaTime;
if (_timer < 2f) return;
_timer = 0f;
```

> [!NOTE] 직접 일시정지 여부를 확인하기
> `Config.paused`는 일시정지 버튼일 뿐, 그 이상도 이하도 아닙니다. 시뮬레이션은 창이 열려 있을 때도 멈추는데, `World.world.isPaused()`가 둘 다 커버해주지만 `internal`이라서 NML이 컴파일 시 사용하는 publicize된 어셈블리가 필요합니다. 월드 시간을 쓰면 이 질문 자체가 필요 없어집니다.

## 코루틴

코루틴은 중간에 대기할 수 있는 메서드입니다. 메인 클래스는 `MonoBehaviour`이므로 코루틴을 시작할 수 있습니다:

```csharp Mods/HelloBox/Code/HelloShakes.cs
using System.Collections;
using UnityEngine;

namespace HelloBox
{
    public static class HelloShakes
    {
        public static void Begin(Actor pActor)
        {
            Main.Instance.StartCoroutine(ShakeThreeTimes(pActor));
        }

        private static IEnumerator ShakeThreeTimes(Actor pActor)
        {
            for (int i = 0; i < 3; i++)
            {
                // checked after every wait: the unit had a whole second to die
                if (World.world == null || Config.worldLoading || pActor == null || !pActor.isAlive()) yield break;

                pActor.startShake();
                yield return new WaitForSeconds(1f);
            }
        }
    }
}
```

`WaitForSeconds`는 실제 초 단위로 대기하며, 게임이 `Time.timeScale`을 절대 바꾸지 않으므로 일시정지에도 멈추지 않고 게임 속도도 신경 쓰지 않습니다. 코루틴은 플레이어가 도중에 다른 월드를 로드해도 계속 실행됩니다. 그래서 첫 `yield` 앞뿐 아니라 매번 `yield` 뒤에도 체크를 넣는 것입니다 :PES2_F:.

## 키

`Update()` 안의 `Input.GetKeyDown(KeyCode.F7)`은 동작합니다. 다만 플레이어가 텍스트 필드에 유닛 이름을 입력하는 중에도 함께 발동되고, 플레이어는 그 키를 바꿀 수도 없습니다. 게임 자체의 단축키는 텍스트 필드가 포커스를 가진 동안 키 입력을 건너뛰는데, `HotkeyAsset`을 쓰면 이걸 공짜로 얻습니다. 등록하는 방법은 **[커스텀 창](#/nml/custom-windows)**을 확인하세요. `GetKeyDown`은 오직 나만 누를 디버그 키 용도로만 남겨두세요.

## 무거운 작업

- **유닛을 순회할 땐 타이머로, 절대 매 프레임마다 하지 마세요.** 유닛 만 명 곱하기 초당 예순 프레임이면 초당 육십만 번의 체크인데, 정작 그 특성을 가진 유닛은 세 마리뿐일 수도 있습니다.
- **저렴한 체크를 먼저 하세요.** Harmony 패치와 같은 규칙입니다: 가장 먼저 나오는 줄이 `return`을 가능하게 해주는 줄이어야 합니다.
- **병렬 코드는 큐에 쌓고, `Update()`가 비웁니다.** `Actor.updateStats`처럼 병렬로 도는 메서드의 Postfix는 유니티나 공유 상태를 건드려선 안 됩니다. **[Harmony 패치](#/nml/harmony-patches)**를 참고하세요. 대신 유닛을 큐에 넣고, 메인 스레드가 여기서 꺼내갑니다:

```csharp
// pending is the ConcurrentQueue your patch fills
while (pending.TryDequeue(out Actor actor))
{
    if (actor == null || !actor.isAlive()) continue;
    // now Unity, Randy and your own lists are safe to touch
}
```

루프 안에 들어간 다음 무엇을 할지는 **[실행 중인 월드 다루기](#/nml/world-at-runtime)**를, 저장하고 불러온 뒤에도 남아있어야 할 것은 **[데이터 저장 및 기억하기](#/nml/saving-data)**를 확인하세요 :PES_OkHand:.
