---
title: 실시간 콘솔 (BepInEx)
group: 개요
subgroup: 외부 도구 및 설정
icon: :wbvideo:
order: 5
---

# 실시간 콘솔 :wbvideo:

테스트를 진행할 때마다 메모장으로 `Player.log` 파일을 열어보는 일은 그야말로 고역입니다. (솔직히 저도 가끔 그러고 있긴 하지만요 :23062-durrr:). **BepInEx**를 설치하면 게임이 실행되는 동안 실시간으로 로그를 뿜어내는 검은색 콘솔 창을 띄워주므로, 코드가 실행되는 바로 그 순간 로그가 눈앞에 나타납니다.

단 10분만 투자하면 끝나는 세팅이며, 한번 해두면 여러분의 남은 모딩 인생 내내 두고두고 쓰게 됩니다.

## BepInEx란 무엇인가

Unity 게임이 실행되기 직전에 가로채어 구동되는 모드 로더입니다. WorldBox 모더들이 이것을 쓰는 이유는 세 가지입니다: 실시간 콘솔, **[UnityExplorer](#/toolbox/unity-explorer)**, 그리고 독립적인 **[BepInEx 모드 개발](#/toolbox/bepinex-modding)**. 여기 있는 우리는 NML을 쓰는 문명인이지만, 그 콘솔은 건너뛰기엔 너무 좋습니다 :trollface:. NML이 특정 모드의 요구에 따라 대신 설치해 주기도 하지만, 직접 수동으로 세팅해 두면 설정을 온전히 제어할 수 있습니다.

## 설치 방법

1. [BepInEx 공식 릴리스 페이지](https://github.com/BepInEx/BepInEx/releases)로 이동하여 **Assets** 목록으로 스크롤한 뒤, `BepInEx_win_x64_5.4.x.x.zip` 파일을 다운로드합니다. 이 정확한 조합을 지키세요: **win**, **x64**, **5**. 목록에 보이는 `x86`, `unix`, `macos`나 `BepInEx 6 / IL2CPP` 빌드들은 매력적으로 보이지만 여기서는 단 하나도 작동하지 않습니다 :PES5_Dumb:.
2. 압축 파일 우클릭 → **속성** → **차단 해제** 체크박스가 있다면 체크한 뒤, `worldbox.exe`가 위치한 **WorldBox 설치 폴더**에 압축을 풉니다 (기본 Steam 경로: `C:\Program Files (x86)\Steam\steamapps\common\worldbox`, 혹은 Steam 라이브러리에서 WorldBox 우클릭 → **관리** → **로컬 파일 탐색**). 다음과 같은 구조가 나와야 합니다:

```text
worldbox/
├── worldbox.exe
├── BepInEx/
├── doorstop_config.ini
└── winhttp.dll
```

3. **게임을 한 번 실행했다가 종료합니다.** 이 첫 실행을 통해 필요한 기본 설정 파일들이 자동 생성됩니다. 화면에 아무런 변화도 나타나지 않는 것이 지극히 정상이니 안심하세요 :hmm:.

## 콘솔 창 활성화하기

아무 텍스트 에디터로 `BepInEx/config/BepInEx.cfg` 파일을 열고, `[Logging.Console]` 섹션을 찾아 다음과 같이 설정합니다:

```text BepInEx/config/BepInEx.cfg
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
```

게임을 다시 실행합니다. 게임 창 바로 옆에 검은색 서브 윈도우가 함께 뜨면서, 이미 엄청난 속도로 로그가 흘러가기 시작할 것입니다.

## 출력 로그 읽는 법

현재는 모드를 단 하나도 만들지 않은 상태라도, 게임을 켜는 순간 BepInEx와 NeoModLoader가 부팅되는 모습을 볼 수 있습니다:

```text BepInEx console
[Info   :   BepInEx] Loading [NeoModLoader 1.x.x]
[Info   :Application] Initializing WorldBox...
[Info   :Application] [NML]: NeoModLoader initialized!
```

이 문구들이 콘솔에 찍힌다면 축하합니다. 실시간 콘솔이 완벽하게 살아 숨 쉬고 있습니다!

나중에 **[첫 번째 모드 만들기](#/nml/your-first-mod)** 가이드를 따라 모드를 작성하면, 쏟아지는 로그 한가운데에서 내가 만든 모드가 컴파일되며 인사를 건네는 장면을 보게 됩니다:

```text BepInEx console
[Info   :Application] 005: Compile Mod HelloBox                = 2,2480
[Info   :Application] [NML]: [HelloBox]: HelloBox is alive!
```

콘솔을 실질적으로 유용하게 써먹기 위한 3가지 황금 습관:

- **모든 로그 앞에 모드 이름으로 접두사 붙이기** (`[MyMod]`처럼). 그래야 무수히 쏟아지는 로그 속에서 내 모드의 출력만 번개처럼 찾아낼 수 있습니다.
- **각 설정 단계의 시작과 끝을 각각 로깅하기**. "특성 등록 중..."은 찍혔는데 "특성 등록 완료"가 절대 찍히지 않는다면, 코드가 정확히 어디서 뻗었는지 바로 알 수 있습니다.
- **콘솔 창을 서브 모니터(또는 화면 절반)에 항상 띄워두기**. 버튼을 누르는 바로 그 찰나에 로그가 한 줄 툭 튀어나오는 광경을 지켜보는 것만큼 신속한 디버깅은 없습니다 :memes:.

## 실제 활용 예시 (간단 미리보기)

**[첫 번째 모드 만들기](#/nml/your-first-mod)** 가이드에서 모드 파일들을 구성하고 나면, 다음과 같이 실시간 로그를 넣어 게임 내 이벤트를 즉각 테스트할 수 있습니다:

```csharp Mods/HelloBox/Code/Main.cs
public void Update()
{
    if (!Config.game_loaded) return;

    // 마우스 왼쪽 버튼 클릭 시 1회 발동
    if (Input.GetMouseButtonDown(0))
    {
        LogInfo("click!");
    }
}
```

클릭할 때마다 그 즉시 콘솔에 한 줄씩 출력됩니다. 이러한 즉각적인 피드백 루프야말로 BepInEx가 필수 도구로 꼽히는 이유입니다!
