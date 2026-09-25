---
title: 모드 파일 구조
group: NML 모딩
subgroup: 기본 개발 흐름
icon: :wbsavebuttonbox:
order: 20
---

# 모드 파일 구조 :wbsavebuttonbox:

## 모드가 위치하는 곳

모든 모드는 WorldBox 설치 폴더 내의 `Mods/` 안에 있는 **단 하나의 폴더**로 구성됩니다:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\Mods\
```

만약 `Mods` 폴더가 아직 없다면 직접 만드세요: 우클릭 → 새로 만들기 → 폴더, 이름은 정확히 `Mods` 로 지정합니다. 그 안에 원하는 이름으로 자신만의 모드 폴더를 생성합니다.

## 모드 폴더 내부 구조

```text
HelloBox/
├── mod.json          <- 모드의 주민등록증 (필수)
├── icon.png          <- 모드 미리보기 아이콘
├── Code/             <- 작성한 소스 코드가 들어가는 폴더
├── Locales/          <- 텍스트 및 번역 파일 (en.json 등)
└── GameResources/    <- 커스텀 텍스처, 아이콘, 픽셀 아트 및 사운드
```

모든 모드에 `mod.json`이 필요합니다. HelloBox에도 C# 진입점이 필요합니다. 다른 폴더들은 실제로 필요할 때 만들면 됩니다. `mod.json` 과 `Code/` 만 있어도 완벽하게 동작하는 진짜 모드입니다. 빈 폴더는 아무도 감탄시키지 못합니다.

#### 각 폴더의 역할

- **`mod.json`**: 모드의 신분증입니다. 이 파일이 없으면 NML은 모드가 존재하는지도 모른 채 지나칩니다.
- **`icon.png`**: 게임 내 모드 목록 메뉴에서 표시될 미리보기 이미지입니다.
- **`Code/`**: 모든 `.cs` 소스 코드 파일(예: `Main.cs`)을 넣는 폴더입니다. 사실 NML은 모드 안 어디에 있든, 하위 폴더까지 포함해서 찾은 `.cs` 파일이라면 무엇이든 컴파일합니다 (`bin/`, `obj/`, `Properties/`, `packages/`, 그리고 이름이 점으로 시작하는 폴더는 제외). 그래서 `mod.json` 옆에 그냥 놓인 `.cs` 파일도 동작하며, 실제로 그렇게 하는 모드도 있습니다. 하지만 `Code/`에 모아 두면 프로젝트가 쓰레기장이 되는 걸 막을 수 있습니다. **NML은 필요할 때 소스를 컴파일하고, 컴파일된 캐시를 재사용할 수도 있습니다.** 이 가이드를 따르는 데 별도의 빌드 단계는 필요 없습니다.
- **`Locales/`**: 번역 파일(예: `en.json`)이 위치하는 곳입니다. 이 폴더가 없으면 추가한 아이템과 특성이 게임 내에서 원시 키 문자열 그대로 노출됩니다.
- **`GameResources/`**: 커스텀 텍스처, 픽셀 아트, 특성 (trait) 아이콘, 무기 스프라이트, 효과음이 들어갑니다. NML이 이 이름으로 검색하므로 폴더명을 정확히 일치시켜야 합니다. 자세한 내용은 **[스프라이트 및 리소스](#/nml/sprites-and-resources)** 를 참고하세요.

> [!WARNING] 폴더명은 대소문자를 구분합니다, 내 PC만 아닐 뿐
> Windows는 `Locales`라고 쓰든 `locales`라고 쓰든 신경 쓰지 않습니다. Linux는 신경 씁니다. NML은 정확히 `Locales`와 `GameResources`라는 철자를 찾으므로, 내 PC에서는 잘 되던 모드가 다른 사람에게는 텍스트도 스프라이트도 없는 모드가 될 수 있습니다. 위의 대소문자를 그대로 맞추면 이 문제는 아예 생기지 않습니다.

#### 다른 사람 모드에서 보게 될 폴더들

시작하는 데는 이것들이 전혀 필요 없습니다. 다만 다른 사람의 모드를 열어보면 보게 될 테니, 무엇인지 정리해 둡니다.

| 폴더 | 하는 일 |
| --- | --- |
| `Assemblies/` | 소스 모드용 서드파티 관리 라이브러리. NML은 이 폴더 바로 안에 있는 `.dll` 파일을 컴파일러 참조로 수집하고 로드를 시도합니다. 게임이나 NML의 DLL을 넣는 곳이 아닙니다 |
| `GameResourcesReplace/` | NML은 이걸 `GameResources/`와 똑같이, 그 바로 뒤에 로드합니다. NML은 이 이름을 NCMS 호환용으로 분류해 둡니다. 새 모드라면 그냥 `GameResources/`를 쓰세요 |
| `EmbededResources/` | 네, 철자가 틀렸고, 그래야 맞습니다. 이 안의 파일들은 **NCMS 스타일** 모드의 컴파일된 코드 안에 포함됩니다. 검증한 소스 컴파일러는 이걸 NCMS 호환 분기에서만 읽습니다. HelloBox의 `BasicMod` 코드에 자동으로 포함되는 게 아닙니다. 그 분기가 쓰는 폴더명은 `EmbeddedResources/`가 아닙니다 |

#### 소스 대신 .dll 배포하기

검증한 로더에서는, `mod.json` **바로 옆에** 있는 `.dll`로 끝나는 파일이 있으면 사전 컴파일 경로가 선택됩니다. NML은 소스 컴파일을 건너뛰고 루트의 DLL들을 로드합니다. 컴파일된 HelloBox DLL을 그곳에 두고 배포판에서는 `Code/`를 빼세요. 빌드 및 패키징 점검은 **[모드 배포하기](#/nml/publishing)**를 참고하세요.

> [!WARNING] .dll 하나만 떨어져 있어도 코드가 꺼집니다
> 라이브러리 하나가 `mod.json` 옆에 떨어져 있으면 소스 모드가 "망가지는" 이유도 이겁니다: NML이 그 `.dll`을 보자마자 `Code/`를 건너뛰고, 여러분의 변경은 하나도 로드되지 않습니다. 라이브러리는 항상 `Assemblies/`에 두고, 절대 모드 루트에 두지 마세요.


### 매니페스트 파일

`mod.json` 은 NeoModLoader가 모드를 식별하는 데 반드시 필요한 파일입니다 :pepeOK:. 모드 폴더의 루트에 위치합니다.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.hellobox",
  "RepoUrl": "https://github.com/yourName/hellobox",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### 각 필드는 무엇을 의미하나요?

| 필드 | 의미 |
| --- | --- |
| `name` | 표시 이름, 여기서는 `HelloBox` |
| `author` | 작성자 이름 |
| `version` | 배포 버전. 배포할 때마다 올림 |
| `description` | 짧은 설명 |
| `iconPath` | 모드 폴더 기준 아이콘 경로 |
| `GUID` | 변하지 않는 식별자. NML이 `UID`로 정규화함, 이 예제라면 `COM_YOURNAME_HELLOBOX`. 배포 후에는 바꾸지 말 것 |
| `RepoUrl` | 저장소 또는 지원 URL 메타데이터. 배포 대상 NML 버전에서 어떻게 표시되는지 확인할 것 |
| `Dependencies` | 필수 모드 ID 목록. 문서화된 소스 워크플로우에서는 이들이 정상적으로 컴파일되어야 함 |
| `OptionalDependencies` | 선택 모드 ID 목록. 소스 컴파일 중 NML이 이들의 참조와 컴파일러 심볼을 제공할 수 있음 |
| `IncompatibleWith` | 충돌 선언. 로더 버전마다 동일하게 강제된다고 가정하지 말 것 |
| `UsePublicizedAssembly` | 검증한 로더에서 기본값은 `true`. 소스 컴파일 시 NML의 publicize된 게임 어셈블리 참조를 추가함 |

> [!WARNING] 목록을 채우기 전에 충돌 처리 방식을 확인하세요
> 동봉된 문서는 `IncompatibleWith`를 미완성 기능이라고 설명합니다. 설치된 로더에는 목록에 있는 ID를 조회하기도 전에, 목록이 비어있지 않은 모드를 제거해 버리는 제거 단계가 있습니다. 예제는 비워 두세요. 배포 선언을 쓰기 전에, 충돌하는 모드가 있을 때와 없을 때 모두 여러분이 쓰는 정확한 로더로 테스트하세요.

#### ModType과 targetGameBuild

검증한 enum에는 `NEOMOD`, `COMPILED_NEOMOD`, `BEPINEX`, `RESOURCE_PACK`이 있습니다. 기본값은 `NEOMOD`이며, 루트에서 DLL이 감지되면 `COMPILED_NEOMOD`가 선택됩니다.

enum 이름이 곧 동작하는 레시피는 아닙니다. 검증한 `LoadMod` 메서드는 두 NeoMod 타입만 처리하고 그 경로에서 다른 값들은 거부합니다. HelloBox의 매니페스트에서는 `ModType`을 빼 두세요. `RESOURCE_PACK`만 설정한다고 동작하는 텍스처 팩이 된다고 이 가이드는 주장하지 않습니다.

`targetGameBuild`는 어셈블리 안에 JSON 매핑이 있지만, 검증한 파일 기반 생성자는 이를 실제 선언에 복사하지 않습니다. 호환성 게이트로 쓰지 마세요. 테스트한 게임 빌드와 NML 버전은 릴리즈 노트에 적어두세요.

#### 매니페스트 키는 서로 바꿔 쓸 수 없습니다

검증한 선언은 `GUID`를 런타임 `UID`로 매핑합니다. `id`, `mainClass`, `modLoader`, `gameVersion`, `homepage`에 대한 매핑은 없으며, 파일 기반 생성자는 이 키들을 소비하지 않습니다. 이것들은 위 필드들의 대체재가 아닙니다.

NML은 어셈블리 안에서 알맞은 진입점 타입을 스스로 찾습니다. `mainClass` 문자열이 그걸 선택해주지 않습니다. 다른 로더의 스키마를 가져오는 대신 매니페스트는 작게 유지하세요.

#### 의존성 심볼

여기서 쓰는 **ASCII ID**의 경우, NML은 문자를 대문자로 바꾸고 구두점을 밑줄로 치환합니다: `com.yourname.hellobox-extra`는 `COM_YOURNAME_HELLOBOX_EXTRA`가 됩니다. 이 규칙을 모든 유니코드 문자로 확장하지는 마세요. 검증한 정규화기는 일부 문자를 그대로 보존합니다.

소스 컴파일 중, NML은 해당 ID가 컴파일러 참조 맵에 항목으로 있을 때만 선택 의존성의 심볼을 정의합니다. 설치되어 있다는 사실만으로는 테스트가 되지 않습니다. 컴파일이 실패하면 선택 의존성 없이 재시도할 수도 있습니다.

> [!WARNING] 심볼 철자가 틀리면 코드가 조용히 사라집니다
> 정의되지 않은 `#if` 심볼은 false로 취급됩니다. 의존성 ID, `OptionalDependencies` 목록, 정규화된 심볼을 확인하세요. 컴파일이 성공했다고 해서 연동 코드가 포함됐다는 증명은 되지 않습니다.

완전한 예제와 별도의 런타임 체크는 **[다른 모드들과 함께 작업하기](#/nml/other-mods)**를 참고하세요.

#### 모드 폴더를 망가뜨리는 것들

- **게임이나 로더의 DLL을 함께 배포하기.** `Assembly-CSharp.dll`, 그 publicize된 사본, `NeoModLoader.dll`, Unity DLL, 또는 게임의 `Managed/` 폴더에서 복사한 다른 DLL을 포함하지 마세요. 빌드할 때는 로컬 사본을 참조하고, zip에서는 빼세요. NML의 추가 라이브러리 로더에는 특수 케이스와 중복 제거 로직이 있어서, DLL을 그냥 복사하는 것으로는 로드된 버전을 안정적으로 교체할 수 없습니다.
- **매니페스트가 중첩됨.** NML은 먼저 모드 폴더 자체의 `mod.json`을 확인합니다. 없을 때만 그 아래를 검색합니다. 중첩된 일치 항목이 여러 개면, 검증한 로더는 경고를 남기고 첫 번째 결과를 씁니다. 이 순서에 의존하지 마세요. 매니페스트는 `HelloBox/mod.json` 하나만 배포하세요.
- **모드 안의 소스 백업.** `dist/`, `backup/`, `old/` 폴더는 소스 컴파일에 중복된 C# 클래스를 끼워 넣을 수 있습니다. 릴리즈 준비용 폴더와 백업은 설치된 모드 바깥에 두세요.
- **하드코딩된 경로.** `BasicMod` 클래스 안에서는 패키징된 파일에 `GetDeclaration().FolderPath`와 `Path.Combine`을 쓰세요. 게임의 `StreamingAssets/mods` 디렉토리는 네이티브 로더의 위치이지, HelloBox 폴더가 아닙니다.
- **패키지를 벗어나는 경로.** 아이콘과 리소스 경로는 대소문자를 맞춘 상대 경로를 쓰세요. 절대 경로나 `..` 세그먼트를 배포하지 마세요. `Path.Combine`은 경로를 이어 붙일 뿐, 플레이어가 준 입력이 내 폴더 안에 머무는지는 확인해주지 않습니다.

> [!NOTE] 무엇을 검증했는가
> 여기 적힌 폴더 및 컴파일러 동작은 설치된 NML 어셈블리(파일 버전 `1.2.0.1`, 참고용 커밋 `cd47a1a6c437718d38e8f29240bdb761d543e09a`)와 동봉된 NML 문서를 직접 추적해서 확인한 것입니다. 모든 릴리즈에서 동일하다는 보장은 아닙니다.


## 약간의 기술적인 세부 사항 :elpepehacker:

모든 모드는 "안녕하세요, 저는 모드입니다"라고 선언하는 C# 파일 하나가 필요합니다. 최소 코드는 이것이 전부입니다:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("Mod loaded successfully!");
        }
    }
}
```

이것은 가이드를 위해 축약한 가짜 코드가 아니라, 실제로 배포되는 대부분의 모드가 출발점으로 삼는 기본 골격입니다.

#### 코드 분석

- **`using NeoModLoader.api;`**: 작업 시작 전 공구함을 여는 것과 같습니다. 매번 `NeoModLoader.api.BasicMod` 라고 길게 적는 대신, `using` 을 통해 컴퓨터에게 *"NML 도구를 책상 위에 꺼내둬"* 라고 알립니다.
- **`namespace HelloBox`**: 코드의 성(Surname)과 같은 역할을 합니다. 다른 모드에도 `Main` 이라는 클래스가 있을 수 있으므로, 네임스페이스를 통해 이름 충돌을 방지합니다.
- **`public class Main`**: C#에서 모든 코드는 "클래스" 안에 위치합니다. 클래스는 이름이 붙은 설계도나 레시피라고 생각하면 됩니다.
- **`: BasicMod<Main>`**: 여러분 모드의 공식 배지입니다. NML에게 *"저는 정식 모드입니다"*라고 알리고, 그 대가로 NML은 로깅, 설정, 단계별 로딩, 번역을 무료로 제공합니다. `<Main>` 부분은 여러분의 클래스 이름을 반복할 뿐입니다. 네, 이상해 보이지만, 네, 항상 이렇게 씁니다.
- **`protected override void OnModLoad()`**: 가장 중요한 메서드입니다. WorldBox가 부팅될 때 NML이 이 문을 한 번 두드립니다. 모드가 등록하는 모든 내용(특성, 아이템, 권능 (GodPower))은 이 `{ }` 안에 들어갑니다.
- **`LogInfo(...)`**: 모드 이름이 자동으로 접두사로 붙은 채 로그를 출력합니다. 코드가 정상적으로 실행되었는지 확인하는 가장 확실한 방법입니다. 자세한 내용은 **[로그 및 디버깅](#/nml/logs-and-debugging)** 을 참고하세요.

> [!TIP] 기존의 고전적인 방식
> 이전 세대의 모드에서는 이런 식으로 작성된 것을 볼 수 있습니다. 네, 저는 이게 평범하던 시절을 기억할 만큼 나이를 먹었습니다:
> ```csharp
> public class MyMod : MonoBehaviour, IMod
> {
>     private ModDeclare _declare;
>
>     public void OnLoad(ModDeclare pModDecl, GameObject pGameObject)
>     {
>         _declare = pModDecl;
>     }
>
>     public ModDeclare GetDeclaration() => _declare;
>     public GameObject GetGameObject() => gameObject;
>     public string GetUrl() => _declare.RepoUrl;
> }
> ```
> `IMod` 는 저수준 인터페이스이고, `BasicMod<T>` 는 이를 구현하여 편의 기능을 미리 담아둔 완성형 베이스 클래스입니다. 둘 다 작동하지만, 특별한 이유가 없다면 `BasicMod` 를 사용하는 것이 훨씬 편리합니다 :PES5_Noted:.

## 다음 단계

전체적인 구조를 파악했으니 이제 진짜 모드를 만들어 봅시다: **[첫 번째 모드 만들기](#/nml/your-first-mod)**.
