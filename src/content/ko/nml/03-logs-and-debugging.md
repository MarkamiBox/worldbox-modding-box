---
title: 로그 및 디버깅
group: NML 모딩
subgroup: 기본 개발 흐름
icon: :wbdebugburger:
order: 24
---

# 로그 및 디버깅 :wbdebugburger:

로그는 모딩 세계에서 언제나 진실만을 말해주는 유일한 도구입니다. 여러분이 앞으로 수천 번 던지게 될 질문, 즉 "**내 코드가 실제로 실행되기는 한 건가?**"에 확실하게 대답해 줍니다.

## 로그 한 줄 출력하기

두 가지 방법이 있으며, 둘 다 결국 동일한 로그 파일에 기록됩니다.

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");      // NML: 모드 이름을 자동으로 앞에 붙여줍니다
            LogWarning("something smells");
            LogError("something exploded");

            Debug.Log("[HelloBox] plain Unity");  // Unity: 접두사를 직접 작성해야 합니다
        }
    }
}
```

`BasicMod` 를 상속받지 않았나요? `NeoModLoader.services.LogService` 에도 동일한 `LogInfo`, `LogWarning`, `LogError` 및 전체 스택 트레이스를 기록하는 `LogStackTraceAsError` 가 갖춰져 있습니다.

## 정상적인 로그의 모습

위 코드를 넣은 모드로 게임을 시작하고 `Player.log` 에서 `HelloBox` 를 검색해 보세요. 다음과 같은 내용을 볼 수 있어야 합니다:

```text Player.log
005: Compile Mod HelloBox                = 2,2480
006: Load Resources From Mod HelloBox    = 0,0012
[NML]: [HelloBox]: OnLoad
[NML]: [HelloBox]: HelloBox is alive!
[NML]: [HelloBox]: Loaded
008: Init Mod HelloBox                   = 0,0014
```

한 줄씩 살펴보면: NML이 `Code/` 의 파일들을 컴파일하고, 리소스를 불러온 뒤, `OnModLoad` 문을 두드렸고, 그 안에서 여러분의 로그가 출력되었습니다. 숫자가 적힌 줄은 NML의 단계별 소요 시간 측정치입니다 (`=` 뒤의 숫자는 초 단위). 로그에서 일부 줄이 빨간색으로 출력될 수 있는데, **여기서 빨간색은 오류가 아니라** 해당 단계가 가장 오래 걸렸음을 의미할 뿐입니다 :hmm:.

진짜 중요한 줄은 여러분이 직접 출력한 줄입니다. 만약 `[HelloBox]: HelloBox is alive!` 가 보이지 않는다면 계속 읽어보세요.

## 코드가 컴파일되지 않을 때

모드가 실행되기 전에 NML은 먼저 코드를 빌드해야 합니다. 사소한 오타 하나만 있어도 즉시 빌드가 중단되며, 정확한 위치를 짚어줍니다:

```text Player.log
[NML]: Code\Main.cs(9,42): error CS1002: ; expected
[NML]: Failed to compile mod HelloBox
```

오른쪽에서 왼쪽으로 읽으세요: **`; expected`** 가 문제(세미콜론 누락), **`(9,42)`** 는 9번째 줄의 42번째 문자, **`Code\Main.cs`** 가 해당 파일입니다. 그 파일을 열고 9번째 줄로 가서 세미콜론을 찍으세요.

유용한 단서는 **첫 번째 줄**에 있습니다. 아래의 `Failed to compile mod HelloBox` 는 단순한 결과 요약일 뿐입니다. 많은 사람들이 아래 줄만 보고 당황하여 바로 위에 적힌 명확한 정답을 놓치곤 합니다 :PES4_1IQ:.

## 오류가 발생한 로그의 형태

컴파일에 성공하고 나면 가장 흔하게 마주치게 될 오류입니다 :PES2_F::

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
NullReferenceException: Object reference not set to an instance of an object
  at HelloBox.HelloTraits.Initialize () [0x00021] in HelloTraits.cs:24
  at HelloBox.Main.OnModLoad () [0x0000c] in Main.cs:12
```

무서워 보이지만 사실 간단한 문장입니다:

- **`NullReferenceException`**: 비어 있는(`null`) 대상을 참조했습니다. 여러분이 겪게 될 에러의 95%는 이것입니다.
- **`at HelloBox.HelloTraits.Initialize ()`**: 에러가 발생한 메서드.
- **`in HelloTraits.cs:24`**: **여러분 파일의 24번째 줄**입니다. 그 줄을 확인하세요. 그 줄의 무언가가 `null` 입니다.
- 아래 줄들은 호출 경로(스택 트레이스)로, 위쪽이 가장 최신 호출입니다. 자신이 작성한 파일명을 중점적으로 확인하세요.

이 오류가 발생하는 대표적인 원인: 애셋을 라이브러리에 등록(`add()`)하기 전에 `base_stats` 에 접근하는 경우입니다. 자세한 내용은 **[커스텀 특성](#/nml/custom-traits)** 페이지를 참고하세요.

## 로그 파일이 저장되는 위치

| 파일명 | 위치 | 역할 |
| --- | --- | --- |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | 현재 실행 세션 |
| `Player-prev.log` | 동일 폴더 | **이전** 실행 세션 (방금 크래시가 난 실행 기록) :aPES_Flatline: |
| `logs/error_*.log` | 동일 폴더 내 `logs/` | 게임이 포착한 개별 에러 기록 |
| `mods_config/<GUID>.config` | 동일 폴더 | 사용자가 저장한 모드의 환경설정 |

Windows 탐색기 주소창에 `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` 를 붙여넣으면 즉시 이동할 수 있습니다.

## 로그 파일 대신 실시간 콘솔 사용하기

게임이 끝난 뒤 텍스트 파일을 여는 것은 번거롭습니다. **BepInEx** 를 사용하면 게임 실행 중에 검은색 콘솔 창이 함께 떠서 버튼을 누르는 순간 실시간으로 로그가 출력됩니다. 설정하는 데 2분이면 충분합니다: **[BepInEx 콘솔](#/toolbox/bepinex-console)**.

게임 내 창을 클릭하고 내부 속성값을 실시간으로 확인하고 싶다면 **[UnityExplorer](#/toolbox/unity-explorer)** 를 활용하세요.

## 오류 하나 때문에 모드 전체가 죽지 않게 만들기

`OnModLoad` 는 위에서 아래로 순차 실행됩니다. 3번째 줄에서 예외가 발생하면 4~20번째 줄은 아예 실행조차 되지 않아 모드의 절반이 조용히 증발합니다. 각 파트마다 안전망을 만들어 두세요:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    Stage("traits", HelloTraits.Initialize);
    Stage("items", HelloItems.Initialize);
    Stage("powers", HelloPowers.Initialize);
    LogInfo("HelloBox ready");
}

// 각 단계를 실행하고, 에러가 나면 해당 단계명을 기록한 뒤 다음으로 넘어갑니다.
private static void Stage(string pName, System.Action pAction)
{
    try { pAction(); }
    catch (System.Exception e) { LogError($"stage '{pName}' failed: {e}"); }
}
```

이제 특성 (trait) 하나가 고장 나더라도 해당 특성만 비활성화될 뿐 모드 전체가 꺼지지 않으며, 로그에도 문제가 된 단계가 정확히 찍힙니다:

```text Player.log
[NML]: [HelloBox]: stage 'items' failed: NullReferenceException ...
[NML]: [HelloBox]: HelloBox ready
```

## 월드가 존재하기 전에 접근하지 마세요

`OnModLoad` 는 월드가 생성되기 **전**에 실행됩니다. 맵도 유닛도 아무것도 없습니다. 이때 월드 데이터에 접근하면 메인 메뉴가 뜨기도 전에 튕깁니다 :surprised_pikachu:. 매 프레임마다 돌아가는 코드에는 반드시 가드 조건을 두어야 합니다:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;                        // 아직 메뉴 화면임
    if (World.world == null || World.world.units == null) return;  // 아직 월드가 없음
    if (MapBox.instance == null) return;

    // 여기서부터는 월드에 안전하게 접근 가능
}
```

## 재시작 없이 코드 리로드하기

코드 한 줄 바꾼 것을 테스트하기 위해 매번 WorldBox를 재시작하는 것은 모딩 시간의 대부분을 낭비하게 만듭니다. 하룻밤에 마흔 번 해 본 사람에게 물어보세요. NML은 게임이 실행 중인 동안 모드를 다시 컴파일하고 지정된 메서드를 교체(핫픽스)할 수 있습니다.

1. 메인 클래스에 `IReloadable` 인터페이스를 구현합니다. 이는 `Reload()` 메서드 하나뿐입니다. HelloBox의 구현은 **[완성된 모드](#/nml/all-together)**에서 확인할 수 있습니다.
2. NML의 활성 모드 메뉴에서는 `IReloadable`을 구현한 모든 모드에 리로드 버튼이 자동으로 나타납니다. (예전 모드 목록은 버튼을 보이게 하려면 `Config.isEditor = true`가 필요했지만, 메인 메뉴에서는 그런 번거로움이 없습니다.)
3. 교체하려는 메서드에 `NeoModLoader.api.attributes`의 `[Hotfixable]` 특성을 붙입니다:

```csharp
using NeoModLoader.api.attributes;

[Hotfixable]
public static WorldTile PickTile(Actor pActor)
{
    // 게임 실행 중에 이 부분을 수정하고 리로드를 누른 뒤 다음 생명체가 실행하는지 확인하세요
}
```

그 후 메서드를 수정한 뒤 저장하고 NML 모드 목록에서 모드의 리로드 버튼을 누릅니다. NML이 다시 컴파일하고 대상 메서드를 패치한 뒤 `Reload()`를 호출합니다. 특성이 없는 메서드는 기존 코드를 계속 실행합니다.

> [!NOTE] 혹시 `Config.isEditor`를 켜게 된다면
> `Config.isEditor`는 게임 내부의 Unity 스위치입니다. 직접 켜면 WorldBox는 자신이 Unity 에디터 안에서 실행 중이라고 믿고, 일부 UI가 모바일 레이아웃으로 바뀝니다. 최신 NML에서 `IReloadable`을 쓴다면 필요 없으니 건드리지 마세요.

지원되지 않는 항목: `Awake`, `Update` 등의 Unity 콜백, 생성자, 그리고 이전 코드로부터 게임이 이미 빌드해 둔 객체들입니다. 로드 시 등록된 에셋은 당시 지정된 델리게이트를 유지하므로, `Reload()` 내에서 직접 다시 연결해 주어야 합니다.

## 누구나 한 번쯤 겪는 흔한 에러들

| 증상 | 실제 원인 |
| --- | --- |
| 모드 목록에 나타나지 않음 | `mod.json` 이 없거나 잘못된 JSON 문법 (끝에 불필요한 쉼표 등 :pepeclown:) |
| 목록에는 있지만 아무 반응 없음 | `OnModLoad` 에서 에러 발생. 로그에서 모드 이름이나 `Exception` 검색 |
| `Failed to compile mod ...` | C# 코드의 오타. 진짜 오류 내용은 **바로 윗줄**에 있습니다 |
| 새 애셋에서 `NullReferenceException` | `add()` 전에 `base_stats` 를 건드렸음 (메모리 할당은 라이브러리가 담당) |
| 텍스트가 `trait_whatever` 로 노출됨 | 번역 등록 누락. **[다국어 지원](#/nml/localization)** 참고 |
| 버튼이 투명한 구멍처럼 보임 | 스프라이트 경로가 틀려 아이콘 로드 결과가 `null` 이 됨 |
| 내 컴퓨터에서는 되는데 남의 컴퓨터에선 안 됨 | 본인의 Windows 사용자명이 들어간 절대 경로를 하드코딩했음 :homerhide: |
