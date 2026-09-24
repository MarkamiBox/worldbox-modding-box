---
title: NML 설치 가이드
group: NML 모딩
icon: :wbhammer:
order: 1
---

# NML 설치 :wbhammer:

**NML**(NeoModLoader)은 WorldBox 모드를 돌아가게 해 주는 프로그램입니다. NML은 한 번만 설치하면 되고, 그 뒤로 모드 설치는 폴더 하나 복사하는 게 전부입니다.

이 페이지는 이런 걸 한 번도 해 본 적 없는 분을 기준으로 씁니다. `.dll` 이 뭔지 안다면 **[짧은 버전](#짧은-버전)** 으로 넘어가세요 :PES_OkHand:.

> [!NOTE] Windows, Mac 및 Linux (Steam Deck)
> 모드는 **Windows, Mac 및 Linux(Steam Deck / SteamOS 포함)용 Steam 버전**에서 지원됩니다. 모바일, 태블릿, 콘솔에서는 동작하지 않습니다.

## 짧은 버전

1. 게임 안에서: **설정 → Experimental Mode → 켜기**.
2. [공식 릴리스 페이지](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) 에서 `NeoModLoader.dll` 을 받습니다.
3. WorldBox 폴더 안의 `worldbox_Data/StreamingAssets/Mods/` 에 넣습니다.
4. 같은 폴더에서 이름에 `NCMS` 가 들어간 것을 모두 지웁니다.
5. 게임을 켭니다. 이제 모드는 `worldbox.exe` 옆의 `Mods` 폴더에 넣습니다.

이게 전부입니다. 아래는 같은 다섯 단계를 클릭 하나하나까지 적은 것입니다.

---

## Windows

### 1단계. Experimental Mode 켜기

1. 평소처럼 Steam에서 WorldBox를 켭니다.
2. 게임의 **설정** 창을 엽니다.
3. 목록에서 **Experimental Mode**(한국어 게임에서는 **실험용 기능**)를 찾아 켭니다.
4. 게임을 끕니다.

이 스위치가 없으면 게임은 모드를 찾지도 않습니다. 에러도, 메시지도 없이 그냥 아무 일도 안 일어납니다 :PES5_Hmmmm:.

> [!WARNING] Mods라는 이름의 폴더가 두 개 있습니다
> 여기 `worldbox_Data\StreamingAssets\Mods/` 는 **NML 로더 자체(`NeoModLoader.dll`) 전용**입니다. 제작한 **모드**를 넣는 곳은 게임 루트의 `worldbox.exe` 바로 옆에 위치하는 별도의 폴더(`worldbox\Mods/`)입니다. 아직 없지만, 게임을 처음 실행하면 NML이 자동으로 생성합니다. 모드를 `StreamingAssets\Mods/` 에 넣거나 NML을 `worldbox\Mods/` 에 넣는 것이 가장 흔한 실수입니다.

### 2단계. NML 받기

1. 이 링크를 엽니다: **[github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)**. 항상 최신 NML을 가리키니 즐겨찾기해 둬도 됩니다.
2. **Assets** 항목까지 내려갑니다. 접혀 있으면 눌러서 펼칩니다.
3. **NeoModLoader.dll** 을 누릅니다. 다른 파일처럼 받아지고, 보통 **다운로드** 폴더에 저장됩니다.

필요한 건 이 파일 하나뿐입니다. `nml-setup-win.exe`, `.pdb`, `.xml`, "Source code" 파일도 보이지만 전부 무시하세요. 그건 NML 개발자용이지, 여러분을 위한 게 아닙니다.

> [!WARNING] 이 링크에서만
> `.dll` 은 프로그램입니다. NML은 위의 GitHub 페이지 **에서만** 받으세요. CurseForge나 다른 사이트, 누가 채팅으로 보낸 파일은 절대 쓰지 마세요. 다른 곳의 오래된 사본은 게임을 처음 켤 때 스스로 삭제되면서 `NML` 폴더와 `NeoModLoader.AutoUpdate_memload.dll` 만 남깁니다. 그런 일이 생기면 여기로 돌아와 진짜 파일을 다시 받으세요. GameBanana의 "1-click install" 버튼도 NML을 설치해 주지 않습니다. `.dll` 은 직접 받으세요.
>
> 브라우저가 "이 파일을 유지할까요?"라고 묻거나, Chrome이 **확인되지 않음** 이라고 표시한다면, `.dll` 이 프로그램이고 받는 사람이 적어서 그렇습니다. 위 GitHub 페이지에서 받았다면 답은 유지입니다(Chrome에서는: 다운로드 목록을 열고 **유지** 선택).

### 3단계. WorldBox 폴더 열기

Steam이 게임을 설치한 폴더입니다. 직접 찾을 필요는 없습니다:

1. **Steam** 을 열고 **라이브러리** 로 갑니다.
2. 왼쪽 목록의 WorldBox를 **마우스 오른쪽 버튼으로 클릭** 합니다.
3. **관리** 를 누르고, 이어서 **로컬 파일 보기** 를 누릅니다.

게임 파일이 든 창이 열립니다. `worldbox`(또는 `worldbox.exe`) 파일과 `worldbox_Data` 폴더가 보이면 제대로 온 겁니다. 대부분의 PC에서는:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

이 창은 열어 두세요. 이제부터 "WorldBox 폴더"라고 하면 여기입니다. 생각보다 훨씬 자주 이 폴더로 돌아오게 될 겁니다.

> [!TIP] Windows가 확장자를 보여 주게 하기
> Windows는 기본적으로 파일 이름의 끝부분을 숨겨서, `NeoModLoader.dll` 이 그냥 `NeoModLoader` 로 보입니다. 그러면 어떤 안내서든 따라가기 어려워집니다. 폴더 창 위쪽의 **보기** 를 누르고 **파일 확장명** 에 체크하세요(Windows 11: **보기 → 표시 → 파일 확장명**). 망가지는 건 없고, 이름이 전부 보이게 될 뿐입니다.

### 4단계. NML을 제자리에 넣기

1. WorldBox 폴더에서 **worldbox_Data** 를 더블클릭합니다.
2. **StreamingAssets** 를 더블클릭합니다.
3. **Mods** 를 더블클릭합니다.
4. 이제 두 번째 창으로 **다운로드** 폴더를 열고, **NeoModLoader.dll** 을 이 `Mods` 창으로 끌어다 놓습니다.

이렇게 되어야 합니다:

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            ├── test_asset_load/     게임 것, 건드리지 않기
            └── NeoModLoader.dll     <- 방금 넣은 것
```

거기에 `test_asset_load` 가 안 보이면 폴더를 잘못 찾아온 겁니다. WorldBox 폴더로 돌아가서 다시 해 보세요.

**여기 온 김에:** 이름에 **NCMS** 가 들어간 것(예: `NCMS_memload.dll` 이나 `NCMS` 폴더)이 있으면 지우세요. NCMS는 옛날 모드 로더이고 이미 죽었습니다. 옛 NCMS 모드는 NML이 그대로 돌릴 수 있습니다 :PES2_Shrug:.

> [!WARNING] `NeoModLoader (1).dll`은 `NeoModLoader.dll`이 아닙니다
> NML을 두 번 받았거나 오래된 사본이 이미 그 폴더에 있었다면, Windows는 새 파일을 `NeoModLoader (1).dll`이라는 이름으로 저장합니다. 그러면 NML은 시작을 거부하고, 화면이 빨간 글씨로 뒤덮이며 "게임을 재시작하라"는 메시지가 뜨고, 로그에는 `Missing className: NeoModLoader (1).WorldBoxMod`가 남습니다. 게임을 닫고, 오래된 파일을 지우고, 새 파일 이름을 정확히 `NeoModLoader.dll`(공백도 숫자도 없이)로 바꾼 뒤 다시 시작하세요. 이것이 "NML이 작동하지 않는" 가장 흔한 원인입니다 :PESgn_SMH:.
>
> Windows가 "사용 중"이라며 오래된 파일을 지우지 못한다면 게임이 아직 실행 중이라는 뜻입니다. 먼저 게임을 닫으세요.

> [!WARNING] Mods라는 폴더가 두 개 있다
> 여기, `worldbox_Data\StreamingAssets/` 안에 있는 것은 **NML 자체만을 위한** 폴더입니다. **모드** 를 넣는 곳은 다른 폴더로, `worldbox.exe` 옆에 있습니다. 아직 없고, 다음 단계에서 NML이 만듭니다. 모드를 여기에, 혹은 NML을 저기에 넣는 게 이 페이지에서 가장 흔한 실수입니다.

### 5단계. 게임을 켜고 확인하기

Steam에서 WorldBox를 켜고, 처음에는 평소보다 조금 더 기다려 주세요.

제대로 됐다면:

- 월드를 불러오는 동안 게임이 **Experimental mode is enabled** 메시지를 보여 줍니다.
- 화면 아래 탭 버튼들 사이에 **NML 로고** 가 달린 새 버튼이 생깁니다. 누르면 모드 목록이 나옵니다.
- WorldBox 폴더로 돌아가면 `worldbox.exe` 바로 옆에 **Mods** 라는 빈 폴더가 새로 생겼습니다.
- `worldbox_Data\StreamingAssets\Mods/` 안에 NML이 자기 파일용 **NML** 폴더를 만들었습니다. 건드리지 마세요.

아무것도 안 일어났다면 **[안 됐어요](#안-됐어요)** 로 가세요.

---

## Mac

같은 다섯 단계입니다. Mac에서는 게임 전체가 앱 아이콘 하나에 들어 있어서, 폴더가 숨은 위치만 다릅니다. 애플다운 방식이죠 :wbbre:.

1. **Experimental Mode**: Windows와 똑같이, **[1단계](#1단계-experimental-mode-켜기)**. 업데이트 관련 경고도 똑같이 해당됩니다.
2. [같은 릴리스 페이지](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest) 에서 `NeoModLoader.dll` 을 **받습니다**. Windows와 Mac 모두 같은 파일입니다.
3. **WorldBox 폴더 열기**: Steam → 라이브러리 → WorldBox 오른쪽 클릭 → **관리 → 로컬 파일 보기**. Finder 창이 열립니다.
4. **앱 안으로 들어가기**: **worldbox** 앱 아이콘을 오른쪽 클릭하고 **패키지 내용 보기** 를 고릅니다. 그다음 **Contents → Resources → Data → StreamingAssets → Mods** 를 열고 `NeoModLoader.dll` 을 끌어다 넣습니다. 이름에 `NCMS` 가 들어간 것도 이참에 지웁니다.
5. **게임을 켜고** **[5단계](#5단계-게임을-켜고-확인하기)** 와 같은 것들을 확인합니다. 모드용 새 `Mods` 폴더는 앱 안이 아니라, WorldBox 폴더의 앱 옆에 생깁니다.

```text
worldbox/
├── worldbox.app/
│   └── Contents/Resources/Data/StreamingAssets/Mods/
│       └── NeoModLoader.dll     <- NML은 여기
└── Mods/                        <- 모드는 여기
```

---

## Linux 및 Steam Deck

원리는 완전히 동일합니다. Linux의 Steam은 사용자 홈 디렉터리에 게임을 설치하며, Steam Deck에서는 먼저 데스크톱 모드로 전환하기만 하면 됩니다. 펭귄도 환영합니다 :wbpenguin:.

1. **실험 모드(Experimental Mode) 활성화**: Windows와 동일하게 켭니다 (**[1단계](#1단계-experimental-mode-켜기)**).
2. [공식 릴리즈 페이지](https://github.com/WorldBoxOpenMods/ModLoader/releases/tag/latest)에서 `NeoModLoader.dll`을 **다운로드**합니다(모든 플랫폼 동일 파일).
3. **WorldBox 폴더 열기**:
   - **데스크톱 Linux**: Steam → 라이브러리 → WorldBox 우클릭 → **관리 → 로컬 파일 탐색**.
   - **Steam Deck**: **STEAM 버튼 → 전원 → 데스크톱으로 전환**을 선택합니다. 데스크톱 모드에서 Steam을 열고 라이브러리 → WorldBox 우클릭 → **관리 → 로컬 파일 탐색**.
   일반적인 경로는 다음과 같습니다:
   ```text
   ~/.local/share/Steam/steamapps/common/worldbox/
   ```
4. **NML 파일 배치**: `worldbox_Data → StreamingAssets → Mods` 폴더로 이동한 뒤 `NeoModLoader.dll`을 넣습니다. 폴더 안에 `NCMS`가 포함된 파일이 있다면 삭제하세요.
5. **게임 실행**(Steam Deck은 게이밍 모드로 복귀 가능). **[5단계](#5단계-게임을-켜고-확인하기)**와 동일하게 확인합니다. WorldBox 최상위 폴더에 새 `Mods` 폴더가 자동 생성됩니다.

```text
worldbox/
├── worldbox_Data/
│   └── StreamingAssets/
│       └── Mods/
│           └── NeoModLoader.dll     <- NML
└── Mods/                            <- mods
```

---

## 모드 설치하기

이제 쉬운 부분, 앞으로 계속 하게 될 부분입니다.

1. 모드를 받습니다. 먼저 설명을 읽으세요. 뭔가 더 필요한 모드도 있고, 보통 제작자가 적어 둡니다.
2. **`.zip`** 파일 그대로 **`worldbox\Mods/`**, 즉 `worldbox.exe` 옆의 폴더에 넣습니다. 압축을 풀지 마세요. 다음에 게임을 켤 때 NML이 알아서 풉니다.
3. 게임을 켭니다.

습관적으로 이미 압축을 풀었어도 괜찮습니다. `mod.json`이 들어 있는 폴더가 `Mods/` 바로 아래에 있기만 하면 됩니다. 피해야 할 실수는 `Mods/` 안에 폴더가 한 겹 더 들어 있는 경우나, 폴더 없이 파일들만 `Mods/`에 흩어져 있는 경우입니다.

```text
worldbox/
├── worldbox.exe
└── Mods/
    ├── SomeMod/
    │   └── mod.json
    └── AnotherMod/
        └── mod.json
```

> [!TIP] HelloBox로 시험해 보기
> 잘 되는지 모르겠다면, 이 가이드에서 만드는 모드가 바로 쓸 수 있는 테스트입니다. **[완성된 모드](#/nml/all-together)** 에서 받아 `Mods` 에 풀고 게임을 켜세요. 쓸데없는 버튼으로 가득한 새 권능 탭이 보이면 설치는 완벽합니다 :wbpeak:.

**모드를 빼려면** 게임을 끄고 `Mods` 에서 그 폴더를 지웁니다. **지우지 않고 끄려면** 게임 안의 NML 모드 목록을 쓰세요.

**Workshop 모드** 도 됩니다. Steam Workshop에서 구독하면 복사하지 않아도 NML이 알아서 찾습니다.

---

## 안 됐어요

순서대로 확인하세요. 대부분은 첫 번째에서 해결됩니다.

| 보이는 것 | 할 일 |
| --- | --- |
| NML 버튼이 없고, `worldbox.exe` 옆에 `Mods` 폴더도 없다 | Experimental Mode가 꺼져 있습니다. 켜고 다시 시작하세요. 게임 업데이트 후에도 매번 |
| 그래도 아무것도 없고, Experimental Mode는 켜져 있다 | `NeoModLoader.dll` 이 엉뚱한 폴더에 있습니다. `worldbox_Data\StreamingAssets\Mods/` 의 `test_asset_load` 옆에 있어야 합니다 |
| 파일 이름이 `NeoModLoader.dll.dll` 이나 `NeoModLoader (1).dll` 이다 | 정확히 `NeoModLoader.dll` 로 이름을 바꾸세요 |
| NML은 있는데 모드가 안 보인다 | 모드가 엉뚱한 `Mods` 에 있습니다. `worldbox.exe` 옆의 폴더에, `.zip` 그대로 또는 안에 `mod.json` 이 있는 폴더로 넣어야 합니다 |
| 화면이 빨간 글씨로 뒤덮이며 "YOU SHOULD RESTART THE GAME"이 뜬다 | NML이 `NeoModLoader (1).dll` 같은 이름으로 되어 있습니다. **[4단계](#4단계-nml을-제자리에-넣기)** 참고 |
| NML이 모드가 "has been disabled due to an error" 라고 한다 | 모드가 망가졌거나 게임 버전에 비해 너무 오래됐습니다. 그 모드의 업데이트를 찾아보거나 제작자에게 물어보세요 |
| 메인 메뉴 구석의 버전 표시가 계속 그대로다 | 게임이 Steam 베타 브랜치에 있습니다. **[문제 해결](#/troubleshooting)** 참고 |
| WorldBox 업데이트 직후 전부 망가졌다 | Experimental Mode를 다시 켜세요. 그다음 모드가 업데이트되길 기다리세요. 게임 업데이트로 옛 모드가 며칠 동안 망가지는 건 흔한 일입니다 |

그래도 안 되나요? **[문제 해결](#/troubleshooting)** 에 긴 목록이 있고, **[로그 및 디버깅](#/nml/logs-and-debugging)** 에 게임이 무엇이 잘못됐는지 적어 두는 곳이 나옵니다. 도움을 청할 때는 쓰는 모드, 망가지기 직전에 한 일, 에러 문구를 같이 알려 주세요. "안 돼요"만으로는 아무도 못 고칩니다. 저도요 :PESgn_ReadRules:.

---

## 다들 꼭 묻는 것

**NML과 BepInEx를 같이 써도 되나요?**
됩니다. 서로 방해하지 않습니다. 개별 *모드* 끼리는 부딪칠 수 있지만, 그건 모드 문제지 로더 문제가 아닙니다.

**모드 설명에 NML이 아니라 BepInEx가 필요하다고 되어 있어요.**
그럼 `Mods` 에 넣지 않습니다. **[실시간 콘솔 (BepInEx)](#/toolbox/bepinex-console)** 에 나온 대로 BepInEx를 설치하고(Windows), 게임을 한 번 켠 다음, 그 모드를 `BepInEx\plugins/` 에 넣으세요. 어느 로더가 필요한지는 모드 설명에 적혀 있습니다.

**NML이랑 NCMS 중에 뭘 쓰죠?**
NML입니다. NCMS는 업데이트가 끊겼고 현재 버전의 게임에서 돌아가지 않습니다. 옛 NCMS 모드도 NML이 돌려 주니 잃을 건 없습니다.

**NML이 바이러스인가요?**
아닙니다. 브라우저가 경고하는 이유는 `.dll` 이 프로그램이고 받는 사람이 적어서입니다. 위의 GitHub 링크에서만 받으세요. GameBanana의 모드는 운영진이 검토하지만, 누가 채팅으로 보낸 파일은 아무도 검토하지 않습니다 :PESgn_ReadRules:.

**모드마다 NML을 다시 설치해야 하나요?**
아니요. 한 번이면 됩니다. 그다음부터는 모드마다 `Mods` 안의 폴더 하나일 뿐입니다.

**NML은 업데이트해야 하나요?**
보통은 아닙니다. NML은 게임을 켤 때마다 새 버전을 확인하고 스스로 교체합니다(옆에 생기는 `NeoModLoader.AutoUpdate_memload.dll` 이 그 역할입니다). 혹시 실패하면 같은 링크에서 새 `NeoModLoader.dll` 을 받아 옛 파일과 직접 바꾸세요.

**모드 때문에 세이브가 망가지나요?**
그럴 수 있습니다. 모드를 넣고 만든 세이브는 그 모드를 빼면 제대로 안 불러와질 수 있습니다. 새로운 걸 시험하기 전에 아끼는 월드는 복사해 두세요 :PES_MonkaSweat:.

**좋아하는 모드가 옛날 버전이에요. 그래도 할 수 있나요?**
제작자가 업데이트하길 기다리거나, 그 모드가 만들어진 버전으로 게임을 플레이하세요: Steam에서 WorldBox 우클릭 → **속성 → 베타** 에서 해당 브랜치를 고릅니다. 그 버전에 맞는 NML 빌드도 필요하며, WorldBox 디스코드 모딩 채널의 고정 메시지에 링크가 있습니다. 그 브랜치에 있는 동안에는 현재 버전용 모드가 전부 작동하지 않습니다. 돌아오려면 같은 메뉴에서 **없음** 을 선택하세요.

**모드는 어떻게 업데이트하나요?**
Workshop 모드는 스스로 업데이트됩니다. 그 외에는: 게임을 끄고, `Mods` 에서 해당 모드의 옛 폴더(와 옛 `.zip`)를 지운 뒤 새 `.zip` 을 넣으세요.

**모드를 지웠는데 게임에 아직 남아 있어요.**
Steam Workshop에서 온 것입니다. 목록에서 체크만 해제하는 것으로는 부족합니다. Workshop 페이지에서 구독을 취소하세요.

**모드를 직접 고칠 수 있나요?**
`Code` 폴더에 `.cs` 파일이 있다면 가능합니다. 이것들은 그냥 텍스트 파일이고 NML이 게임을 켤 때마다 다시 컴파일하며, 아트는 `GameResources`에 있습니다. 먼저 원본을 복사해 두세요. 수정본을 공유하는 건 별개의 문제이니 제작자에게 먼저 물어보세요. `.dll`만 있는 모드는 편집할 수 없고, 소스부터 다시 만들어야 합니다.

**도와주는 분이 로그를 보내 달라고 하셨어요.**
탐색기 주소창에 `%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox` 를 붙여넣고 `Player.log` 를 보내세요. 스크린샷이 아니라 **파일 자체** 입니다. 게임이 방금 튕겼다면 `Player-prev.log` 를 대신 보내세요. 게임을 다시 켜면 `Player.log` 가 덮어써집니다.

모드를 쓰기만 하는 게 아니라 만들고 싶다면, **[시작하기](#/getting-started)** 에서 시작합니다.
