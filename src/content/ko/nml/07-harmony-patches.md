---
title: Harmony 패치
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbhammer:
order: 42
---

# Harmony 패치 :wbhammer:

다른 페이지의 내용들은 모두 월드박스에 무언가를 **추가**하는 작업이었습니다 (특성 (trait), 무기, 건물 (building) 등). Harmony는 모딩의 또 다른 절반인 **게임이 이미 하고 있는 동작을 변경**하기 위한 도구입니다.

게임 코드를 직접 수정할 수는 없습니다. 코드는 컴파일되어 `Assembly-CSharp.dll`로 제공되며, 게임이 업데이트될 때마다 수정 사항이 전부 덮어씌워집니다. Harmony는 게임이 실행 중인 상태에서 기존 메서드에 여러분만의 코드를 덧붙일 수 있게 해주는 라이브러리입니다.

> [!NOTE] 코딩을 한 번도 해본 적이 없나요?
> "메서드란 무엇인가"와 "포스트잇 비유"를 읽은 뒤, **게임 콘텐츠** 페이지로 가서 무언가를 먼저 만들어보고 다시 오세요. Harmony가 아주 어려운 것은 아니지만, *다른 사람의* 모드를 망가뜨릴 수 있는 첫 번째 관문이며, 게임 자체의 데이터 구조를 먼저 경험해 본 뒤에 작성해야 훨씬 안전한 패치를 만들 수 있습니다 :PES_Wise:.

## 메서드란 무엇인가

**메서드**는 게임 코드 안에서 이름이 붙은 하나의 동작입니다. 실제 예시는 다음과 같습니다:

| 메서드 | 게임이 실행하는 시점 |
| --- | --- |
| `Actor.updateStats()` | 유닛의 스탯을 다시 계산해야 할 때마다 |
| `Actor.getHit(...)` | 유닛이 피해를 입을 때마다 |
| `City.makeWarrior(...)` | 도시가 시민을 전사로 임명할 때마다 |

게임은 이러한 메서드들을 초당 수천 번씩 호출합니다. 이 모든 곳이 여러분이 훅을 걸 수 있는 지점입니다.

## 포스트잇 비유

메서드를 게임 레시피 책의 한 페이지라고 상상해 보세요. Harmony는 그 페이지를 다시 쓰지 않습니다. 대신 앞뒤로 두 장의 메모지를 붙입니다:

```text
┌─────────────────────────────┐
│  여러분의 PREFIX            │  <- 게임 원본 코드 "전"에 실행
├─────────────────────────────┤
│  게임 원본 코드             │  <- 손대지 않음
├─────────────────────────────┤
│  여러분의 POSTFIX           │  <- 게임 원본 코드 "후"에 실행
└─────────────────────────────┘
```

- **Prefix**는 게임이 실행되기 전에 전달된 인자들을 확인합니다. 인자를 변경할 수도 있고, 메서드 실행 전체를 취소할 수도 있습니다.
- **Postfix**는 게임이 처리를 끝낸 후의 결과를 확인합니다. 반환값을 변경하거나 그 결과에 맞춰 후속 동작을 취할 수 있습니다.

이것이 Harmony의 95%입니다. 이 페이지의 나머지 내용은 구체적인 실무 디테일입니다.

## Harmony 활성화하기

`OnModLoad`에서 단 한 줄만 호출하면 됩니다. 모드 내의 모든 패치를 검색하여 발견된 모든 패치를 적용합니다:

```csharp Mods/HelloBox/Code/Main.cs
using System.Reflection;
using HarmonyLib;
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");

            // "com.yourname.hellobox"는 여러분의 GUID입니다. Harmony는 이 이름으로 패치에 라벨을 붙이므로,
            // 충돌이 발생했을 때 로그를 보면 누구의 잘못인지 명확하게 드러납니다.
            new Harmony("com.yourname.hellobox").PatchAll(Assembly.GetExecutingAssembly());
        }
    }
}
```

`Assembly.GetExecutingAssembly()`는 "오직 내 모드 파일만"을 의미합니다. 단순한 장식이 아닙니다. 이것이 없으면 `PatchAll()`이 호출된 어셈블리 전체를 스캔하며, 재수 없는 날에는 다른 사람의 모드까지 건드리게 됩니다 :PESgn_Yikes:.

## 첫 번째 패치, 한 줄씩 살펴보기

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;

namespace HelloBox
{
    public static class HelloPatches
    {
        [HarmonyPatch(typeof(Actor), "updateStats")]
        public static class Patch_Actor_UpdateStats
        {
            public static void Postfix(Actor __instance)
            {
                if (!__instance.hasTrait(HelloTraits.SWIFT)) return;

                __instance.stats["speed"] += 20f;
            }
        }
    }
}
```

여기서 여섯 가지 일이 일어납니다:

- **`[HarmonyPatch(typeof(Actor), "updateStats")]`**: 주소입니다. "`Actor`라는 클래스의 `updateStats`라는 메서드." 대괄호 안의 줄은 *특성(attribute)*으로, 실행되는 코드가 아니라 컴퓨터가 읽는 라벨입니다.
- **`public static class Patch_Actor_UpdateStats`**: 담는 그릇입니다. 이름은 자유이고 아무것도 바꾸지 않지만, `Patch_<Class>_<Method>`로 해 두면 미래의 여러분이 고마워할 겁니다.
- **`public static void Postfix(...)`**: 이 이름은 자유가 **아닙니다**. Harmony는 정확히 `Prefix`, `Postfix`, `Finalizer`라는 이름의 메서드를 찾습니다. `postfix`라고 쓰면 아무 일도 일어나지 않고, 오류조차 나지 않습니다 :PESgn_ButWhy:.
- **`Actor __instance`**: 밑줄이 **두 개**입니다. 게임이 지금 처리 중인 바로 그 유닛입니다. 이게 없으면 어떤 유닛의 스탯이 다시 계산되었다는 *사실*은 알아도, *누구의* 것인지는 모릅니다.
- **`if (!__instance.hasTrait(...)) return;`**: 일찍 빠져나가세요. 이 패치는 세계의 모든 유닛에 대해, 영원히 실행됩니다. 흔한 경우는 확인 한 번과 `return`으로 끝내세요.
- **`stats["speed"] += 20f;`**: 실제 변경입니다. `updateStats`는 처음에 스탯 블록을 비우고 다시 만들기 때문에, Postfix에서 더한 값은 매 틱 쌓이는 대신 깨끗한 상태 위에 올라갑니다.

> [!DANGER] `updateStats`는 메인 스레드에서 실행되지 않습니다
> 게임은 이것을 **병렬** 작업으로 등록합니다(`createJob(out c_stats_dirty, updateStats, JobType.Parallel, ...)`, 그리고 `Config.parallel_jobs_updater`의 기본값은 `true`). 그래서 여러분의 Postfix는 워커 스레드에서, 여러 유닛에 대해 동시에 실행됩니다. 그 안에서는 **그 유닛 자신의 숫자만** 건드리세요. Unity(`Time.time`, `transform`, `Destroy`, `Resources.Load`)나 게임의 난수 도우미 `Randy`를 부르거나, 여러분의 공유 목록에 쓰는 것은 다른 사람의 컴퓨터에서만 나타나는 크래시가 됩니다.
>
> 그런 것이 필요하다면 유닛을 큐에 넣고 여러분의 `Update()`에서 처리하세요:
> ```csharp
> public static readonly System.Collections.Concurrent.ConcurrentQueue<Actor> pending = new();
>
> public static void Postfix(Actor __instance)
> {
>     if (!__instance.hasTrait(HelloTraits.GIGACHAD)) return;
>     __instance.stats["speed"] += 20f;   // this unit's own data: fine
>     pending.Enqueue(__instance);        // everything else waits for the main thread
> }
> ```

## 마법 같은 특수 매개변수 이름

Harmony는 매개변수를 **이름 일치** 방식으로 자동 주입합니다. 중요한 매개변수들은 다음과 같으며, 밑줄 개수도 이름의 일부입니다:

| 이름 | 전달받는 내용 |
| --- | --- |
| `__instance` | 메서드가 호출된 대상 객체. `static` 메서드에서는 없으므로 생략 |
| `__result` | 메서드의 반환값. 수정하려면 `ref`로 선언해야 함. Postfix에서만 사용 가능 |
| `___someField` | 밑줄 **세 개**: 해당 객체의 private 필드 (게임 내 변수명과 철자 완벽 일치) |
| `__state` | Prefix에서 같은 호출의 Postfix로 전달할 임시 값 |
| 실제 파라미터 이름 | 호출자가 넘겨준 인자값 (게임 내 매개변수명과 **완벽히 일치**해야 함) |

마지막 행이 가장 많은 사람들이 실수하는 부분입니다. 그것도 몇 번이고요. 게임에서 `getHit(float pDamage, ...)`라고 선언되어 있다면, 여러분의 매개변수 이름도 반드시 `pDamage`여야 합니다. `damage`나 `pDmg`는 작동하지 않습니다. 관심 없는 매개변수는 생략할 수 있지만, 작성한 매개변수는 철자가 정확해야 하며, 월드박스의 매개변수는 거의 모두 `p`로 시작합니다.

## 반환값(결과) 변경하기

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    // ref는 "이 값을 덮어쓸 수 있음"을 의미하며, 여기서 수정한 값이 호출자에게 그대로 반환됩니다.
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;

        __result *= 1.5f;
    }
}
```

덮어쓰지 말고 조정하세요. `__result *= 1.5f`로 작성하면 다른 모드가 같은 메서드를 패치했더라도 조화롭게 작동합니다. `__result = 12f`처럼 고정값을 할당하면 그들의 작업물을 날려버리고 댓글 창에서 싸움이 벌어집니다.

## 게임이 하드코딩한 숫자 바꾸기

"~하는 모드 만들 수 있는 분?"의 절반은 그냥 숫자 하나 이야기입니다. 불가능한 건 없습니다, 아직 아무도 안 만들었을 뿐이죠 :wbbru:. "도시가 너무 커진다"가 바로 이 경우이며, 게임 자체의 `City` 클래스에서 그대로 가져온 것입니다:

```csharp Assembly-CSharp / City
public int getZoneRange(bool pAllowCheat = true)
{
    if (pAllowCheat && DebugConfig.isOn(DebugOption.CityUnlimitedZoneRange))
    {
        return 999;
    }
    return 13;
}
```

상수를 반환하는 메서드는 게임에서 가장 쉽게 패치할 수 있는 대상입니다. 상수 자체를 건드리는 게 아니라 결과값을 조정합니다:

```csharp Mods/HelloBox/Code/HelloPatches.cs
using HarmonyLib;
using UnityEngine;

namespace HelloBox
{
    [HarmonyPatch(typeof(City), nameof(City.getZoneRange))]
    public static class Patch_City_ZoneRange
    {
        private const float SCALE = 0.5f;   // 도시 크기를 절반으로

        public static void Postfix(ref int __result)
        {
            // 999는 디버그용 "무제한 구역 범위" 스위치입니다. 플레이어의 치트는 건드리지 않습니다
            if (__result == 999) return;

            __result = Mathf.Max(1, Mathf.RoundToInt(__result * SCALE));
        }
    }
}
```

`SCALE`을 **[모드 설정](#/nml/mod-config)** 슬라이더에 연결하면 플레이어가 직접 조정할 수 있습니다.

진짜 어려운 부분은 해당 메서드를 찾는 것입니다. 게임에서 본 숫자(구역 13개, 무기 2개, 5년)나 규칙의 명사("zone", "limit", "max")를 **dnSpy**에서 검색하세요. 작은 메서드 안의 상수라면 Postfix로 간단히 해결됩니다. 긴 메서드 중간에 묻힌 상수라면 transpiler가 필요하며, 그건 이 페이지의 범위를 벗어납니다 :PES2_Shrug:.

## 원래 메서드 실행 취소하기

`bool`을 반환하는 Prefix는 게임 원본 코드를 실행할지 여부를 결정합니다:

```csharp
[HarmonyPatch(typeof(Actor), "getHit")]
public static class Patch_Actor_GetHit
{
    public static bool Prefix(Actor __instance, float pDamage)
    {
        if (__instance == null || !__instance.hasTrait(HelloTraits.SWIFT)) return true;

        // false = 게임 원본 getHit을 통째로 건너뜁니다. 유닛이 피해를 받지 않습니다.
        return false;
    }
}
```

가드문의 구조를 주목하세요. 특별한 경우에만 `false`를 반환하고, **그 외의 모든 경우에는 `true`를 반환합니다**. 저 `return true`를 깜빡하면 전 세계의 모든 피해 판정이 비활성화됩니다.

> [!WARNING] `return false`는 핵폭탄입니다
> 여러분의 메서드 버전만 건너뛰는 것이 아닙니다. 게임의 원본 코드와 해당 메서드에 걸린 **모든 모드의 Prefix 및 Postfix**를 통째로 건너뜁니다. 바닐라 메서드는 보통 여러분이 미처 생각지 못한 다섯 가지 작업을 동시에 수행하며, 취소해 버리면 그 다섯 가지도 조용히 꺼져버립니다.
>
> `return false`를 쓰기 전에 Postfix로 해결할 수 없는지 먼저 확인하세요. "입은 피해를 직후에 회복시킨다"가 "애초에 피해가 없었던 것으로 한다"보다 문제를 훨씬 덜 일으킵니다 :PES3_Balance:.

## 메서드 이름을 지정하는 두 가지 방법

```csharp
[HarmonyPatch(typeof(City), nameof(City.makeWarrior))]   // public 메서드
[HarmonyPatch(typeof(Actor), "updateStats")]             // 그 외 모든 메서드
```

`nameof`는 오타가 났을 때 패치가 조용히 씹히는 대신 컴파일 에러를 내주므로 훨씬 안전합니다. 하지만 `nameof`는 내 코드에서 접근 가능한 멤버에만 쓸 수 있고, 월드박스의 대부분은 `internal`이나 `private`입니다. 그러한 메서드들은 순수 문자열로 지정하는 수밖에 없으므로 **[게임 코드 읽기](#/toolbox/reading-the-game-code)**에서 철자를 꼼꼼히 확인하세요.

## 두 메서드의 이름이 같을 때 (오버로드)

두 메서드의 이름이 같다면 클래스 + 이름만으로는 모호하여 Harmony가 추측을 거부합니다. 매개변수 타입을 직접 명시하세요:

```csharp
[HarmonyPatch(typeof(World), "GetTile", new System.Type[] { typeof(int), typeof(int) })]
```

## 전후 처리가 모두 필요한 패치

`__state`는 같은 메서드 호출 내에서 Prefix가 Postfix로 값을 넘겨줄 때 사용합니다. 게임이 값을 변경하기 전의 원래 상태를 기억해두는 데 유용합니다:

```csharp
[HarmonyPatch(typeof(Actor), "updateStats")]
public static class Patch_Actor_StatDelta
{
    public static void Prefix(Actor __instance, out float __state)
    {
        __state = __instance.stats["health"];
    }

    public static void Postfix(Actor __instance, float __state)
    {
        if (__instance.stats["health"] < __state) { /* 누군가 체력을 깎았음 */ }
    }
}
```

## 제대로 작동하지 않을 때

Harmony를 탓하기 전에 로그부터 읽으세요. Harmony 탓인 경우는 드뭅니다 :PES5_Noted:.

| 증상 | 흔한 원인 |
| --- | --- |
| 아무 일도 안 일어나고 로그도 없음 | `Postfix` 철자 오타, 또는 `PatchAll`을 아예 호출하지 않음 |
| 시작 시 `HarmonyException` / `MissingMethodException` | 해당 클래스나 메서드 이름이 존재하지 않음. dnSpy에서 확인 |
| `Ambiguous match found` | 여러 오버로드가 존재함. 위에 나온 `Type[]` 인자 추가 |
| 패치 내부에서 `NullReferenceException` | `__instance`나 내부 필드가 null임. 패치는 로딩 중, 사망 중 등 일반 플레이에서 보지 못하는 상태에서도 실행됨 |
| 게임 프레임이 3 FPS로 떡락함 | 초당 수천 번씩 실행되는 메서드를 패치하고 그 안에서 무거운 연산을 돌림 |
| 단독으로는 작동하는데 다른 모드와 충돌함 | 둘 중 하나가 `false`를 반환하거나, 둘 다 `__result`를 조정하지 않고 통째로 덮어씌움 |

## 호환성을 지키는 모딩 수칙

- **기본은 Postfix.** 인자를 바꾸거나 메서드를 멈춰야 할 때만 Prefix를 쓰세요.
- **대입하지 말고 조정하세요.** `+=`, `*=`, `Math.Min(...)`. 다른 누군가도 여기를 패치했습니다.
- **null 확인은 항상.** 패치는 세계를 불러오는 중에도, 유닛이 죽는 중에도 실행됩니다.
- **값싼 확인을 먼저.** 자주 호출되는 패치의 첫 줄은 `return`할 수 있게 해 주는 검사여야 합니다.
- **일을 해내는 가장 좁은 메서드를 패치하세요.** 특성 하나의 속도 때문에 `Actor.updateStats`를 패치하는 건 괜찮습니다. 같은 일을 위해 세계 업데이트를 패치하는 건 모드가 삭제당하는 지름길입니다.
- **패치는 한 파일에 모으세요.** 누군가 충돌을 보고하면 열두 개가 아니라 파일 하나만 읽고 싶을 겁니다. 미래의 자신에게 친절하세요. 제 옛날 모드들처럼 하지 말고, 제가 말하는 대로 하세요 :trollface:.

> [!NOTE] 라이브러리의 `has`, `get`, `add`, `clone`, `post_init`을 패치하는 건 의미가 없습니다
> 여러분의 모드가 로드된 뒤의 호출에만 영향을 줄 뿐, 그때 이미 끝난 바닐라 등록에는 절대 영향을 주지 않습니다. **[에셋 라이브러리](#/nml/asset-libraries)**를 보세요.

## 여기서 다루지 않는 내용

**Transpiler**는 메서드의 컴파일된 IL 명령어를 한 줄씩 재작성하는 도구입니다. 대단히 강력하며 외부로 노출되지 않은 메서드 깊숙한 곳의 숫자를 고칠 수 있는 유일한 수단이지만, 게임이 업데이트될 때마다 거의 무조건 깨집니다. 여러분이 이것을 필요로 할 정도의 실력자가 된다면, 더 이상 이 페이지는 필요 없을 것입니다 :PES5_BigBrain:.
