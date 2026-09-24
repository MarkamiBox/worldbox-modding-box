---
title: 첫 번째 모드 만들기
group: NML 모딩
subgroup: 기본 개발 흐름
icon: :wbchosen:
order: 22
---

# 첫 번째 모드 만들기 :wbchosen:

이 가이드의 모든 내용은 **단 하나의 모드** 를 발전시켜 나가는 방식으로 진행됩니다. 여기서 기초를 다지고, 이후의 모든 페이지에서 파일 하나씩을 차례로 추가해 나갑니다.

가이드를 다 마칠 때쯤이면 HelloBox에는 약 40여 개의 파일이 포함되며, 여러분은 그 모든 코드를 직접 작성하게 됩니다: 전용 탭이 있는 유닛 특성과 문화 (culture) 특성 (trait), 무기와 전용 인챈트, 상태 효과 (status), 전리품 드롭, 구름 (cloud), 타일, 요리 레시피, 투사체 (projectile), 세계 법률, 전용 버튼이 달린 신의 권능 (GodPower), 창, 설정 패널, 건물 (building), 세력, 생명체, 재앙, 커스텀 AI, 그리고 게임의 고정 규칙을 비트는 Harmony 패치까지.

이는 실제 모드에서 필요로 하는 것보다 훨씬 방대한 양이지만, 그것이 바로 목적입니다. 자신이 실제로 원하는 2~3가지 요소만 골라내고 나머지는 지우면 되니까요 :PES4_DeleteThis:.

우리가 만들 모드의 이름은 **HelloBox** 입니다. 이제 직접 만들어 봅시다.

> [!NOTE] 코딩을 한 번도 해본 적이 없나요?
> 전혀 문제없습니다. 각 코드 블록 아래에 있는 "각 줄이 하는 일" 설명을 읽고 코드를 그대로 복사해 붙여넣으세요. 프로그래밍의 90%는 이미 작동하는 코드를 복사한 뒤 한 번에 하나씩 수정해 나가는 과정입니다 :PES2_Legit:.

> [!TIP] 아니면 템플릿에서 시작하세요
> 파일을 손으로 만들기 싫다면 빈 뼈대를 받아서 4단계로 건너뛰세요. 다음 세 단계는 그래도 읽어 둘 만합니다. 그 안에 뭐가 들었는지 설명합니다.
>
> <a class="dl" href="hellobox-template.zip" download>
>   <span class="dl-icon">📄</span>
>   <span class="dl-text">
>     <span class="dl-title">빈 모드 템플릿 내려받기</span>
>     <span class="dl-sub"><code>mod.json</code>, <code>Code/Main.cs</code>, 그리고 NML이 찾는 폴더들. 그게 전부입니다.</span>
>   </span>
> </a>

## 1. 폴더 생성하기

WorldBox 설치 폴더(`worldbox.exe` 가 있는 곳)로 이동하여 `Mods/` 안에 `HelloBox` 라는 폴더를 만듭니다. 그 안에 `Code` 라는 이름의 폴더를 하나 만듭니다.

```text Where it goes
worldbox/
└── Mods/
    └── HelloBox/          <- 여러분의 모드
        ├── mod.json       <- 신분증 파일 (다음 단계)
        └── Code/          <- .cs 소스 파일들이 들어갈 곳
```

## 2. 모드 신분증: mod.json

`HelloBox/` 폴더 안에 `mod.json` 파일을 만들고 다음 내용을 붙여넣습니다. `author` 는 본인의 닉네임으로 변경하세요.

```json Mods/HelloBox/mod.json
{
  "name": "HelloBox",
  "author": "yourName",
  "version": "0.1.0",
  "description": "My first WorldBox mod, built while following the guide.",
  "GUID": "com.yourName.hellobox"
}
```

- **`name`** 은 게임 내 모드 목록에 표시될 이름입니다.
- **`GUID`** 는 고유 식별자입니다. `com.yourname.hellobox` 형태로 짓고 다시는 변경하지 마세요.

이 파일이 없으면 NML은 모드가 없는 것처럼 취급합니다 :pepeno:.

> [!WARNING] 메모장은 `mod.json.txt` 로 저장하려 할 것입니다
> 다른 이름으로 저장 대화상자에서 이름을 입력하기 전에 **파일 형식** 을 **모든 파일 (*.*)** 로 변경하세요. 저장 후 탐색기에서 확인했을 때 `.json` 확장자가 보이지 않는다면, **보기 → 파일 확장명** 을 켜서 Windows가 확장자를 숨기지 못하게 하세요. `mod.json.txt` 로 저장되면 NML이 전혀 인식하지 못하며, 이는 초보 모더들이 가장 흔히 겪는 실수입니다 :PESgn_Oops:.

## 3. 코드 작성: Main.cs

`Code/Main.cs` 파일을 만들고 다음 코드를 붙여넣습니다:

```csharp Mods/HelloBox/Code/Main.cs
using NeoModLoader.api;

namespace HelloBox
{
    public class Main : BasicMod<Main>
    {
        protected override void OnModLoad()
        {
            LogInfo("HelloBox is alive!");
        }
    }
}
```

### 각 코드 줄이 하는 일

- **`using NeoModLoader.api;`**: "이 파일에서 NML의 도구들을 사용하겠다"는 의미입니다. 이 줄이 없으면 컴퓨터는 `BasicMod` 가 무엇인지 알지 못합니다.
- **`namespace HelloBox`**: 여러분의 코드에 붙이는 성씨와 같아서, 다른 모드의 `Main` 클래스와 이름이 충돌하지 않도록 지켜줍니다.
- **`public class Main : BasicMod<Main>`**: 여러분의 모드 본체입니다. `: BasicMod<Main>` 부분은 "나는 NML 모드이니 유용한 기본 기능(로그, 설정창, 다국어 지원)을 제공해 달라"는 뜻입니다.
- **`protected override void OnModLoad()`**: 게임이 시작될 때 NML이 한 번 두드리는 문입니다. 모드가 등록하는 모든 초기화 코드는 이 중괄호 `{ }` 안에 들어갑니다.
- **`LogInfo(...)`**: 모드 이름 접두사를 붙여 로그를 출력합니다. 코드가 정상적으로 실행되었는지 확인하는 가장 확실한 방법입니다.

## 4. 게임 실행하기

WorldBox를 실행하고 메인 메뉴에서 **Mods** 창을 여세요. **HelloBox**가 목록에 있고 이미 켜져 있을 겁니다. 직접 `Mods/`에 넣은 모드는 NML이 처음 발견하는 순간 활성화됩니다.

나중에 모드를 **끄는** 곳도 이 창입니다. 아이콘을 클릭하면 토글되고, 대부분의 모드는 재시작한 뒤에야 알아챕니다 :PES4_AlrightThen:.

> [!WARNING] Mods 창이 아예 없나요? 실험 모드가 꺼져 있습니다
> NML은 **설정 -> Experimental Mode**가 켜져 있을 때만 모드를 불러오는데, 게임은 **WorldBox가 업데이트될 때마다 이걸 알아서 끕니다**: 저장된 `last_used_version`을 방금 실행한 버전과 비교해서 다르면 값을 다시 `false`로 돌립니다. 그래서 "어제는 됐는데 아무것도 안 바꿨어요"는 거의 항상 이겁니다. 다시 켜고 재시작하세요.

> [!TIP] 목록에 아예 없나요?
> 그렇다면 NML이 한 번도 보지 못한 겁니다. 열에 아홉은 `mod.json` 대신 `mod.json.txt`이거나, 폴더가 `worldbox\Mods/`가 아닌 다른 곳에 있는 경우입니다. 전체 목록은 **[문제 해결](#/troubleshooting)**에 있습니다.

## 5. 정상 실행 여부 확인하기

로그 파일에 여러분이 작성한 로그 줄이 찍혀 있어야 합니다:

```text Player.log
[NML]: [HelloBox]: HelloBox is alive!
```

해당 파일을 찾으려면 Windows 파일 탐색기 주소 표시줄에 다음 경로를 붙여넣으세요:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox
```

`Player.log` 파일을 메모장으로 열고 **Ctrl+F** 를 눌러 `HelloBox` 를 검색합니다.

해당 줄이 보인다면 이제 여러분도 어엿한 모더입니다 :PESgn_Congrats:. 보이지 않는다면 바로 이 순간을 위해 준비된 **[로그 및 디버깅](#/nml/logs-and-debugging)** 페이지를 참고하세요.

## 6. 이후의 페이지들과 연결되는 방식

이제부터 각 페이지는 `Code/` 에 **새로운 파일 하나** 를 추가하고, `OnModLoad` 에 **새로운 코드 한 줄** 을 추가하는 방식으로 진행됩니다. 패턴은 항상 동일합니다:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");

    HelloTraits.Initialize();   // 커스텀 특성 페이지에서 추가
    HelloItems.Initialize();    // 커스텀 아이템 페이지에서 추가
    // ...앞으로도 계속 이어집니다
}
```

새로 추가되는 파일들은 항상 다음과 같은 기본 형태를 갖춥니다:

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public static void Initialize()
        {
            // 각 페이지의 코드가 이곳에 들어갑니다
        }
    }
}
```

> [!TIP] 한 번에 하나씩 차근차근
> 파일 하나를 추가하고 게임을 켜서 로그를 확인한 뒤 다음 단계로 넘어가세요. 한꺼번에 5가지를 추가했다가 게임이 튕기면 용의자가 5명이 되지만, 하나씩 추가하면 범인은 언제나 한 명뿐입니다 :aPES_Detect:.
