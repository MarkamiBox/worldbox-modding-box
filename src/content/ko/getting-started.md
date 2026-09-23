---
title: 시작하기
group: 개요
icon: :wbsalut:
order: 3
---

# 시작하기 :wbsalut:

첫 줄의 코드를 작성하기 전에 준비해야 할 모든 것들입니다. 순서대로 따라 하면 약 15분 정도 소요됩니다.

> [!NOTE] 아직 프로그래밍을 몰라도 괜찮습니다
> Visual Studio나 컴파일러 같은 복잡한 도구는 **전혀 필요하지 않습니다**. NML이 모드 폴더 안의 `.cs` 텍스트 파일을 읽어 게임이 시작될 때마다 자동으로 컴파일해 줍니다. **메모장만으로도 첫 번째 모드를 완벽하게 만들 수 있습니다** :PES_OkHand:. 더 고급 도구는 나중에 기능이 아쉬워질 때 도입해도 늦지 않습니다.

## 1. WorldBox 설치 폴더 찾기

이 가이드에서는 "WorldBox 폴더에 파일을 넣으라"는 지시를 수십 번 하게 됩니다. 지금 한 번 확실하게 찾아두세요:

**Steam → WorldBox 우클릭 → 관리 → 로컬 파일 탐색**

`worldbox.exe`가 위치한 폴더가 탐색기 창으로 열립니다. 대부분의 PC에서는 다음과 같습니다:

```text
C:\Program Files (x86)\Steam\steamapps\common\worldbox\
```

이 창을 열어두거나 즐겨찾기에 고정해 두세요. 가이드에서 *WorldBox 폴더*라고 부를 때는 항상 이 경로를 의미합니다 :gatoxd:.

## 2. 실험 모드 활성화

실험 모드가 켜져 있지 않으면 모드가 전혀 로드되지 않습니다. "오작동하는" 수준이 아니라 에러 메시지도 없이 완전히 무시됩니다.

게임 내: **설정**을 열고 **실험 모드(Experimental Mode)**를 찾아 켭니다. 게임이 업데이트될 때마다 자동으로 비활성화되므로 패치 후에는 반드시 다시 확인하세요.

## 3. NeoModLoader 설치

**NML**은 작성한 모드를 검색하고 컴파일하여 실행해 주는 모드 로더입니다. NML 없이는 모딩이 불가능합니다. 처음 설치하시나요? **[NML 설치 가이드](#/install-nml)**에 Mac을 포함한 모든 클릭 과정이 정리되어 있습니다.

1. [NML 릴리즈 페이지](https://github.com/WorldBoxOpenMods/ModLoader/releases)에서 최신 `NeoModLoader.dll`을 다운로드합니다. 이 파일 하나면 충분합니다.
2. WorldBox 폴더 내 `worldbox_Data\StreamingAssets\Mods/` 경로로 이동합니다.
3. 그곳에 `NeoModLoader.dll`을 넣습니다.

```text
worldbox/
└── worldbox_Data/
    └── StreamingAssets/
        └── Mods/
            └── NeoModLoader.dll   <- 여기에 위치
```

게임을 시작합니다. 정상적으로 적용되었다면 하단 탭에 NML 로고 버튼이 생기고 `worldbox.exe` 옆에 빈 `Mods` 폴더가 생성됩니다. 보이지 않는다면 2단계를 다시 점검하세요 :PES5_Hmmmm:.

> [!NOTE] 창작마당 버전을 같이 쓸 필요는 없습니다
> NML은 게임을 시작할 때마다 새 버전을 자동으로 확인하고 스스로 교체하므로, 위의 수동 설치만으로도 항상 최신 상태가 유지됩니다. [Steam 창작마당의 NML 항목](https://steamcommunity.com/sharedfiles/filedetails/?id=3080294469)도 있지만, 방금 수동으로 설치한 것 옆에 이것까지 구독하면 두 사본이 충돌하여 "모드가 표시되지 않음"이나 "모드가 사라지지 않음" 문제의 흔한 원인이 됩니다. 둘 중 하나만 쓰세요. 그리고 창작마당에서 무언가를 구독했다면, 모드 목록에서 체크를 해제하는 것은 구독 취소와 같지 않습니다.

## 4. 텍스트 에디터 준비

| | |
| --- | --- |
| **메모장** | 이미 PC에 설치되어 있습니다. 첫 모드를 만들기에는 충분합니다 |
| **[VS Code](https://code.visualstudio.com/)** | 무료이며 가볍고 코드 색상 강조 및 오타 검사를 지원합니다. 대다수 모더에게 가장 추천하는 에디터 |
| **Visual Studio** | 전문 통합 개발 환경. 게임 `.dll`을 연결하면 메서드 자동 완성을 제공하지만 대규모 개발 전까지는 과합니다 |

어떤 에디터를 선택하든 `.cs` 파일을 저장할 때 파일명이 `.cs.txt`가 되지 않도록 주의하세요. 메모장은 종종 뒤에 몰래 `.txt`를 붙이곤 합니다 :PESgn_SMH:.

## 5. 준비 완료! 이제 만들어 보세요

NML 모딩 섹션의 **[모드 기본 구조](#/nml/mod-structure)**로 이동한 뒤 **[첫 번째 모드 만들기](#/nml/your-first-mod)**를 진행하세요 :gatoxd: !

---

## 나중에 설치할 도구들 (지금 당장은 불필요)

모드를 작성하는 데 지금 당장 이것들이 **필요하지는 않습니다**. 각 페이지에서 필요하다고 할 때 돌아오세요.

- **[실시간 콘솔 (BepInEx)](#/toolbox/bepinex-console)**: 로그 파일을 뒤지지 않고도 플레이 도중 검은 콘솔 창에 실시간 로그를 출력해 줍니다. 매우 편리하므로 빠른 시일 내에 설치를 추천합니다.
- **[UnityExplorer](#/toolbox/unity-explorer)**: 인게임에서 모든 오브젝트를 클릭하여 내부 상태를 확인합니다.
- **[dnSpy 또는 ILSpy](#/toolbox/reading-the-game-code)**: 게임의 원본 코드를 열어 개발자들이 기능을 어떻게 구현했는지 확인합니다.
- **[AssetRipper](#/toolbox/getting-the-sprites)**: 게임의 스프라이트와 사운드를 추출하여 아트 스타일을 맞출 수 있습니다.

> [!WARNING] NCMS는 사용이 중단되었습니다 :sadcat:
> NCMS는 더 이상 업데이트되지 않습니다. 이 사이트의 모든 가이드는 NML을 기준으로 작성되었습니다. NCMS용 모드를 작성할 수는 있지만 이제는 아무도 사용하지 않습니다 :PES2_Shrug:.
