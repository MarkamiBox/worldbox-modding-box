---
title: 다른 모드들
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbmodders:
order: 45
---

# 다른 모드들 :wbmodders:

여러분의 모드는 텅 빈 세상에 혼자 사는 게 아닙니다. 플레이어는 HelloBox 옆에 다른 모드 스무 개를 함께 설치할 수 있고, 그 절반은 전투를 바꾸거나, 세계 법칙을 조정하거나, 새 특성을 추가하려 드는 중일 수도 있습니다.

때로는 그들과 협력하고 싶을 때가 있습니다: 파트너 모드가 설치돼 있으면 추가 기능을 켜거나, 없어도 죽지 않게 안전하게 그들의 메서드를 패치하거나, 내 에셋이 올바른 순서로 등록되게 만드는 것 등이죠.

다른 모드와 대화하는 방법은 두 가지입니다: 컴파일 시점에는 `mod.json`을 통해, 런타임에는 코드를 통해서요.

## mod.json에서 의존성 선언하기

가장 깔끔한 통합 방법은 `mod.json`에서 관계를 선언하는 것입니다:

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "Markami",
  "version": "1.0.0",
  "description": "My first mod",
  "iconPath": "icon.png",
  "GUID": "com.markami.hellobox",
  "Dependencies": [],
  "OptionalDependencies": [
    "com.friend.coolmod"
  ],
  "IncompatibleWith": []
}
```

| 키 | 의미 |
| --- | --- |
| `Dependencies` | 필수 의존성. NML은 이 모드들이 내 모드보다 **먼저** 로드되도록 보장합니다. 하나라도 없거나 컴파일에 실패하면 NML은 내 모드 자체를 로드하지 않습니다 |
| `OptionalDependencies` | 선택 의존성. 다른 모드가 설치돼 있으면 NML은 그 모드를 내 모드보다 먼저 로드하고, 그 모드용 컴파일러 심볼도 정의해 줍니다. 없어도 내 모드는 정상적으로 로드됩니다 |
| `IncompatibleWith` | 차단 목록. 이 목록에 있는 모드가 존재하면 NML은 충돌로 표시하고 둘 다 함께 실행되지 못하게 막습니다 |

### 컴파일 시점의 #if 심볼

`OptionalDependencies`에 나열된 모드가 설치되어 함께 컴파일되면, NML이 여러분을 위해 전처리기 상수를 정의해 줍니다.

심볼은 그 모드의 GUID를 대문자로 바꾸고, 영숫자가 아닌 모든 문자를 밑줄로 치환한 것입니다:

| `mod.json`의 GUID | 정의되는 컴파일러 심볼 |
| --- | --- |
| `com.friend.coolmod` | `COM_FRIEND_COOLMOD` |
| `com.author.magic-items` | `COM_AUTHOR_MAGIC_ITEMS` |

통합 코드는 `#if`로 감쌉니다:

```csharp Mods/HelloBox/Code/HelloIntegration.cs
namespace HelloBox
{
    public static class HelloIntegration
    {
        public static void Initialize()
        {
#if COM_FRIEND_COOLMOD
            // Compiled only when that mod is present and active
            ApplyCoolModSynergy();
#endif
        }

#if COM_FRIEND_COOLMOD
        private static void ApplyCoolModSynergy()
        {
            // Safe to reference their types directly here
            Main.Log("CoolMod found! Enabling partner synergies.");
        }
#endif
    }
}
```

> [!WARNING] 심볼 철자가 틀리면 조용히 실패합니다
> `#if COM_FRIEND_COOLMOD` 대신 `#if COM_FRIEND_COOL_MOD`라고 쓰면, 컴파일러는 정의되지 않은 심볼로 인식하고 그 코드 블록을 조용히 걷어냅니다. 로그에 에러도 경고도 전혀 없이 영원히 실행되지 않습니다 :PES4_1IQ:. GUID 변환 결과는 항상 꼼꼼히 다시 확인하세요.

## 런타임에 확인하기

`#if` 트릭은 NML이 여러분의 모드를 소스에서 컴파일할 때만, 그리고 다른 모드가 `OptionalDependencies`에 선언돼 있을 때만 동작합니다.

미리 컴파일된 `.dll`을 배포하거나, 재컴파일 없이 동적으로 다른 모드를 확인하고 싶다면 런타임에 확인하세요.

### 로드된 어셈블리 확인하기

다른 모드의 어셈블리가 현재 AppDomain에 로드돼 있는지 확인할 수 있습니다:

```csharp
using System;
using System.Linq;

public static bool IsModLoaded(string pAssemblyName)
{
    return AppDomain.CurrentDomain.GetAssemblies()
        .Any(a => string.Equals(a.GetName().Name, pAssemblyName, StringComparison.OrdinalIgnoreCase));
}
```

또는 Harmony의 `AccessTools`에게 그 모드의 클래스가 존재하는지 물어봐도 됩니다:

```csharp
using HarmonyLib;

bool hasPartner = AccessTools.TypeByName("PartnerNamespace.PartnerMain") != null;
```

`AccessTools.TypeByName`이 null이 아닌 `Type`을 반환하면, 그들의 코드가 로드되어 사용 가능한 상태입니다.

## 다른 모드를 Harmony로 패치하기

바닐라 메서드를 패치하는 건 간단합니다. 다른 모드 안에 있는 메서드를 패치하는 것은 커다란 함정이 하나 있습니다 :wbfacepalm:.

다른 모드의 타입을 참조하는 평범한 패치 클래스를 작성하면:

```csharp
// NEVER do this for an optional mod!
[HarmonyPatch(typeof(PartnerMod.SomeClass), "SomeMethod")]
public static class BadCrossModPatch
{
    public static void Postfix() { }
}
```

Mono 런타임은 여러분의 패치 클래스를 로드하는 즉시 `PartnerMod.SomeClass`를 해석(resolve)하려 시도합니다. 플레이어가 그 모드를 설치하지 않았다면, `Initialize()`가 끝나기도 전에 `TypeLoadException`이나 `FileNotFoundException`으로 내 모드 전체가 죽어 버립니다!

대신 `AccessTools`로 **수동으로** 패치하세요:

```csharp Mods/HelloBox/Code/HelloCrossPatch.cs
using System;
using System.Reflection;
using HarmonyLib;

namespace HelloBox
{
    public static class HelloCrossPatch
    {
        public static void ApplyIfPresent(Harmony pPatchEngine)
        {
            Type targetType = AccessTools.TypeByName("PartnerMod.SomeClass");
            if (targetType == null)
            {
                // The other mod is not installed. Skip peacefully.
                return;
            }

            MethodInfo targetMethod = AccessTools.Method(targetType, "SomeMethod");
            if (targetMethod == null)
            {
                Main.LogWarning("PartnerMod found, but SomeMethod was not found. Outdated version?");
                return;
            }

            MethodInfo postfix = typeof(HelloCrossPatch).GetMethod(nameof(Postfix), BindingFlags.Static | BindingFlags.NonPublic);
            pPatchEngine.Patch(targetMethod, postfix: new HarmonyMethod(postfix));
            Main.Log("Successfully hooked PartnerMod.SomeMethod!");
        }

        private static void Postfix()
        {
            // Runs after their method, only if their mod is installed
        }
    }
}
```

수동 패치는 타입 참조를 문자열 상태로 유지하므로, 런타임이 없는 어셈블리를 로드하려 시도하는 일이 없습니다.

## 로드 순서 함정

다른 모드의 콘텐츠를 clone 하거나 참조할 때는 타이밍이 전부입니다.

```csharp
// If their mod hasn't run Initialize() yet, this throws NullReferenceException!
AssetManager.traits.clone("hello_super_trait", "partner_custom_trait");
```

NML은 의존성 순서대로 모드를 로드합니다. 다른 모드를 `Dependencies`나 `OptionalDependencies`에 넣으면, NML은 그 모드의 `Initialize()`가 내 모드보다 **먼저** 실행되도록 보장합니다.

만약 의존성으로 선언하지 *않았다면*, 모드 간 로드 순서는 정해져 있지 않습니다. 항상:
1. 다른 모드를 `OptionalDependencies`에 선언하세요.
2. 그들의 에셋을 clone 하거나 읽기 전에 `AssetManager.traits.has(...)`로 방어하세요.

## 충돌 없이 데이터 공유하기

월드박스는 액터(`actor.data`)와 월드(`World.world.map_stats.custom_data`)에 커스텀 데이터를 저장할 수 있는 유연한 딕셔너리를 제공합니다.

이 딕셔너리들은 모든 모드가 공유합니다. 다음처럼 작성하면:

```csharp
// Bad: someone else might use "level" too
actor.data.set("level", 5);
```

다른 모드가 완전히 다른 가정 하에 같은 프레임에서 `"level"`에 값을 쓸 수도 있습니다.

커스텀 데이터 키에는 항상 모드 접두사로 네임스페이스를 지정하세요:

```csharp
actor.data.set("hello_level", 5);
int myLevel = actor.data.get("hello_level", 0);
```

다음: **[모드 배포하기](#/nml/publishing)**, 또는 **[게임 옵션 및 시간 배율](#/nml/game-options)**에서 시뮬레이션 속도와 옵션을 다뤄보세요.
