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
MyCoolMod/
├── mod.json          <- 모드의 주민등록증 (필수)
├── icon.png          <- 모드 미리보기 아이콘
├── Code/             <- 작성한 소스 코드가 들어가는 폴더
├── Locales/          <- 텍스트 및 번역 파일 (en.json 등)
└── GameResources/    <- 커스텀 텍스처, 아이콘, 픽셀 아트 및 사운드
```

오직 `mod.json` 만 필수입니다. 다른 폴더들은 실제로 필요할 때 만들면 됩니다. `mod.json` 과 `Code/` 만 있어도 완벽하게 동작하는 진짜 모드입니다. 빈 폴더는 아무도 감탄시키지 못합니다.

#### 각 폴더의 역할

- **`mod.json`**: 모드의 신분증입니다. 이 파일이 없으면 NML은 모드가 존재하는지도 모른 채 지나칩니다.
- **`icon.png`**: 게임 내 모드 목록 메뉴에서 표시될 미리보기 이미지입니다.
- **`Code/`**: 모든 `.cs` 소스 코드 파일(예: `Main.cs`)을 넣는 폴더입니다. 사실 NML은 모드 안에서 찾은 `.cs` 파일이라면 무엇이든 컴파일하지만(`bin/`, `obj/` 등은 제외), `Code/`에 모아 두면 프로젝트가 쓰레기장이 되는 걸 막을 수 있습니다. **NML은 게임이 시작될 때마다 이를 컴파일하므로**, 직접 `.dll`을 빌드할 필요도, Visual Studio도 전혀 필요 없습니다.
- **`Locales/`**: 번역 파일(예: `en.json`)이 위치하는 곳입니다. 이 폴더가 없으면 추가한 아이템과 특성이 게임 내에서 원시 키 문자열 그대로 노출됩니다.
- **`GameResources/`**: 커스텀 텍스처, 픽셀 아트, 특성 (trait) 아이콘, 무기 스프라이트, 효과음이 들어갑니다. NML이 이 이름으로 검색하므로 폴더명을 정확히 일치시켜야 합니다. 자세한 내용은 **[스프라이트 및 리소스](#/nml/sprites-and-resources)** 를 참고하세요.

### 매니페스트 파일

`mod.json` 은 NeoModLoader가 모드를 식별하는 데 반드시 필요한 파일입니다 :pepeOK:. 모드 폴더의 루트에 위치합니다.

```json mod.json
{
  "name": "My-First-Mod",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My mod is the best frfr",
  "iconPath": "icon.png",
  "GUID": "com.yourName.my-first-mod",
  "RepoUrl": "https://github.com/yourName/my-first-mod",
  "Dependencies": [],
  "OptionalDependencies": [],
  "IncompatibleWith": []
}
```

#### 각 필드는 무엇을 의미하나요?

- **`name`**: 게임 내 모드 목록에 표시되는 모드의 이름입니다.
- **`author`**: 작성자의 닉네임입니다. 자신이 만든 결과물에 당당히 이름을 남기세요!
- **`version`**: 모드의 버전 번호입니다 (예: `"0.1.0"`). 업데이트를 출시할 때마다 이 값을 올립니다.
- **`description`**: 모드가 무엇을 하는지 간략히 설명하는 문구입니다. 모드 세부 정보 창에 표시됩니다.
- **`iconPath`**: 미리보기 아이콘의 상대 경로입니다 (보통 모드 루트의 `"icon.png"`).
- **`GUID`**: 모드의 고유 ID로, 관례상 `com.yourname.modname` 형식입니다. NML은 내부적으로 이를 대문자와 밑줄 형식(`COM_YOURNAME_MY_FIRST_MOD`)으로 정리하고, 그것이 실제 식별자가 됩니다. 생략하더라도 NML이 작성자와 이름을 붙여서 만들어 줍니다. **한 번 정하면 절대 바꾸지 마세요**: 플레이어의 설정 파일이 이 이름으로 저장됩니다.
- **`RepoUrl`**: GitHub 저장소, Discord 또는 웹사이트로 가는 선택 링크입니다. NML이 모드 카드에 버튼을 달아 주므로 플레이어가 클릭 한 번으로 이동할 수 있습니다.
- **`Dependencies`**: 모드가 실행되기 위해 반드시 설치되어 있어야 하는 다른 모드의 GUID 목록입니다. 독립 모드라면 `[]` 로 둡니다.
- **`OptionalDependencies`**: 있으면 지원하지만 꼭 필요하지는 않은 모드들입니다. 그중 하나가 활성화되어 있으면 NML은 연동 코드를 감쌀 수 있도록 컴파일러 상수 `#if OTHER_MOD_GUID`까지 제공합니다.
- **`IncompatibleWith`**: 함께 활성화되면 여러분의 모드를 망가뜨리는 모드 GUID 목록입니다. NML이 이를 확인하고 충돌하는 모드가 동시에 로드되지 않도록 막습니다.

코드 없이 텍스처만 교체하는 모드라면 `"ModType": "RESOURCE_PACK"`을, 재미로 private 필드와 씨름하고 싶다면 `"UsePublicizedAssembly": false`를 설정할 수도 있습니다 :PES5_Hmmmm:.


## 약간의 기술적인 세부 사항 :elpepehacker:

모든 모드는 "안녕하세요, 저는 모드입니다"라고 선언하는 C# 파일 하나가 필요합니다. 최소 코드는 이것이 전부입니다:

```csharp Code/Main.cs
using NeoModLoader.api;

namespace MyCoolMod
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
- **`namespace MyCoolMod`**: 코드의 성(Surname)과 같은 역할을 합니다. 다른 모드에도 `Main` 이라는 클래스가 있을 수 있으므로, 네임스페이스를 통해 이름 충돌을 방지합니다.
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
