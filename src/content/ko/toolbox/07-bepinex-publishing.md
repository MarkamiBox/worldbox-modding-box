---
title: 디버깅과 배포
group: BepInEx Modding
icon: :wbfireworks:
order: 3
---

# 디버깅과 배포 :wbfireworks:

플러그인이 빌드됩니다. 이제 불러와지고, 작동하고, 다른 사람에게 닿아야 합니다. 이 페이지는 실제로 만나게 될 오류를 만나는 순서대로 정리하고, 그다음 배포 방법을 다룹니다.

## 어디를 볼까

| 파일 | 위치 | 내용 |
| --- | --- | --- |
| 콘솔 창 | 켜 두었다면 게임과 함께 열림 | 모든 것을 실시간으로. **[실시간 콘솔(BepInEx)](#/toolbox/bepinex-console)** 참고 |
| `LogOutput.log` | `worldbox/BepInEx/` | 같은 내용을 저장한 것. 사람들이 달라고 하는 게 이것입니다 |
| `Player.log` | `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox/` | Unity 자체 로그. BepInEx 가 잡지 못한 충돌용 |

먼저 `LogOutput.log` 에서 플러그인 이름을 검색하세요. 그 이름이 나오는 첫 오류가 중요한 오류입니다. **[로그와 디버깅](#/nml/logs-and-debugging)** 과 같은 규칙입니다.

## 빌드가 안 될 때

| 오류 | 의미 | 해결 |
| --- | --- | --- |
| `The reference assemblies for .NETFramework,Version=v4.7.2 were not found` | PC에 .NET Framework 4.7.2 개발자 팩이 없음 | **[프로젝트 준비](#/toolbox/bepinex-modding)** 의 `Microsoft.NETFramework.ReferenceAssemblies` 패키지 |
| `CS0246: The type or namespace name 'Input' could not be found` | Unity 모듈을 참조하지 않음 | `UnityEngine.dll` 만이 아니라 `UnityEngine*.dll` 을 참조 |
| `CS0122: '...' is inaccessible due to its protection level` | 게임의 `internal` 멤버를 사용함 | `Assembly-CSharp` 참조에 `Publicize="true"` |
| `The process cannot access the file ... because it is being used by another process` | 게임이 실행 중이라 `.dll` 을 잡고 있음 | WorldBox 를 닫고 다시 빌드 |
| 복사 단계에서 `Could not find a part of the path` | `.csproj` 의 `GameDir` 이 틀림 | `worldbox.exe` 가 있는 폴더를 가리키게 하세요 |

## 빌드는 되는데 불러와지지 않을 때

게임을 켜고 `Loading [YourPlugin 1.0.0]` 줄을 찾으세요. 그 줄이 없다면 BepInEx 가 플러그인을 발견하지 못한 것입니다:

| 보이는 것 | 이유 |
| --- | --- |
| 줄이 아예 없음 | `.dll` 이 `BepInEx/plugins/` 안에 없거나, BepInEx 자체가 실행되지 않음 (콘솔도 `LogOutput.log` 도 없음) |
| 줄이 없는데 `.dll` 은 제자리에 있음 | 프로젝트가 잘못된 프레임워크를 대상으로 함. `net8.0` 이나 `netstandard2.1` 이 아니라 `net472` 여야 함 |
| 줄은 있는데 이어서 `Could not load file or assembly 'Something'` | 플러그인과 함께 배포하지 않은 라이브러리를 씀. 그 `.dll` 을 플러그인 폴더에 내 `.dll` 옆에 두세요 |
| GUID가 같은 플러그인이 두 개 | BepInEx 는 하나만 불러옵니다. 대개 다른 폴더에 있는 내 플러그인의 옛 사본 |

## 불러와지는데 고장 날 때

| 오류 | 보통 원인 |
| --- | --- |
| `AssetManager...` 에서 `NullReferenceException` | 게임 라이브러리(library)를 너무 일찍 건드림. **[BepInEx로 콘텐츠 추가하기](#/toolbox/bepinex-content)** 의 `AssetManager.init()` Postfix 를 쓰세요 |
| `HarmonyException` / `Ambiguous match found` | 패치가 없는 메서드나 쌍둥이가 있는 메서드를 가리킴. **[Harmony 패치](#/nml/harmony-patches)** 와 같은 해결책 |
| 게임 업데이트 후 `MissingMethodException` / `TypeLoadException` | 게임이 발밑에서 바뀜. **[게임 업데이트 후 모드 업데이트하기](#/nml/game-updates)** 를 따라간 뒤 다시 빌드 |
| 언어를 바꾸면 텍스트가 원시 키로 보임 | `LocalizedTextManager.setLanguage` Postfix 가 빠짐 |
| 아이콘이 안 보임 | 누군가 그 경로를 이미 요청한 뒤에 스프라이트를 등록했거나, 경로가 폴더를 가리킴 |
| 다 잘 되다가 게임 도중 플러그인이 멈춤 | `BepInEx/config/BepInEx.cfg` 에 `HideManagerGameObject = true` |

## 더 빠른 반복

바꿀 때마다 WorldBox 를 닫았다 여는 게 BepInEx 의 가장 괴로운 부분입니다. BepInEx.Debug 모음에 있는 **ScriptEngine** 플러그인이 이걸 덜어 줍니다: `plugins/` 대신 `BepInEx/scripts/` 에 둔 플러그인은 게임이 켜진 채로 키 하나로 다시 불러올 수 있습니다 (현재 키는 readme 를 확인하세요).

도구, 창, 오버레이에는 아주 좋습니다. 콘텐츠에는 덜 도움이 됩니다: 게임은 이미 등록한 특성(trait)을 잊지 않고, 적용한 Harmony 패치는 플러그인이 언로드될 때 직접 떼지 않는 한 계속 남습니다 (`OnDestroy()` 에서 `harmony.UnpatchSelf()`). UI를 만들 때 쓰고, 특성 수치를 조정할 때는 기대하지 마세요 :PES2_Shrug:.

## 배포

### zip에 넣을 것

플러그인을 Release 모드로 빌드한 뒤, 플레이어가 게임 폴더에 바로 풀 수 있게 zip으로 묶으세요:

```text HelloBepInEx.zip
HelloBepInEx.zip
└── BepInEx/
    └── plugins/
        └── HelloBepInEx/
            ├── HelloBepInEx.dll
            └── iconHelloSwift.png
```

넣으면 **안 되는** 것:

- **BepInEx 자체.** 플레이어는 여러분처럼 한 번만 설치합니다. **[콘솔 페이지](#/toolbox/bepinex-console)** 로 안내하고 버전을 적으세요: BepInEx 5, Mono, x64.
- **게임 파일.** `Assembly-CSharp.dll`, Unity 모듈, 특히 빌드가 만든 publicize 된 사본. 이건 게임의 코드이지, 여러분이 나눌 수 있는 게 아닙니다. `.csproj` 의 `Private="false"` 가 이미 빌드 폴더에서 빼 주니, 손으로 넣지만 마세요.
- **`BepInEx.dll` 과 `0Harmony.dll`.** BepInEx 가 이미 가지고 있습니다.

### 버전 번호

두 곳에서 올리고 같게 유지하세요: `[BepInPlugin]` 의 `version` (로그와 다른 플러그인이 보는 것) 과 `.csproj` 의 `<Version>` (`.dll` 파일이 말하는 것). 세 번째 배포인데 로그에 `1.0.0` 이 찍히는 플러그인은 모든 버그 리포트를 어렵게 만듭니다.

### 다른 플러그인에 의존하기

플러그인이 다른 BepInEx 플러그인을 먼저 불러와야 한다면 그렇게 선언하세요. BepInEx 가 불러오는 순서를 정리하고, 그게 없으면 여러분의 플러그인을 불러오지 않습니다:

```csharp
[BepInPlugin("com.example.hellobepinex", "HelloBepInEx", "1.0.0")]
[BepInDependency("com.other.author.library")]
public class HelloPlugin : BaseUnityPlugin
```

다른 플러그인이 선택 사항이고, 있을 때만 그 뒤에 불러오고 싶다면 두 번째 인수로 `BepInDependency.DependencyFlags.SoftDependency` 를 넣으세요.

### 어디에 올릴까

다른 WorldBox 모드와 같은 곳에, 같은 조언으로: **[배포](#/nml/publishing)** 참고. 설명에 딱 한 줄만 더 필요합니다. 맨 위에 "Requires BepInEx 5 (Mono x64)". NML만 설치된 게임에 넣은 사람들의 "안 돼요" 댓글을 줄여 줍니다 :wbsalut:.
