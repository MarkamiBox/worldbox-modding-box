---
title: 게임 내부 들여다보기 (UnityExplorer)
group: 개요
subgroup: 외부 도구 및 설정
icon: :wbeyeball:
order: 6
---

# 게임 내부 들여다보기 :wbeyeball:

**UnityExplorer**는 인게임 인스펙터 도구입니다. 어느 화면에서든 게임을 일시정지하고, 임의의 창이나 버튼, 유닛을 클릭하여 현재 가지고 있는 모든 값을 실시간으로 읽어올 수 있습니다.

이게 왜 필요한가 하면: 바닐라 창이 도대체 뭘로 만들어졌는지 허공에 대고 추측하는 대신, 직접 열어서 *확인*하면 되기 때문입니다. "이걸 도대체 어떻게 구현한 거지?"라는 모든 의문이 2분 만에 해결됩니다.

## 설치 방법

1. 먼저 **BepInEx**가 정상 작동하는지 확인하세요. **[실시간 콘솔](#/toolbox/bepinex-console)** 페이지를 참고하세요.
2. [**UnityExplorer for BepInEx 5 (Mono)**](https://github.com/sinai-dev/UnityExplorer/releases)를 다운로드합니다 (릴리스 페이지에서 `UnityExplorer.BepInEx5.Mono.zip` 파일 받기).
3. 압축 파일을 `C:\Program Files (x86)\Steam\steamapps\common\worldbox\BepInEx\plugins/` 경로에 풉니다. `UnityExplorer.BIE5.Mono.dll`과 필수 종속 항목인 `UniverseLib.Mono.dll` 둘 다 반드시 해당 위치에 들어가야 합니다!
4. 게임을 실행하고 **F7** 키(기본 토글 단축키)를 누릅니다.

```text
worldbox/ (C:\Program Files (x86)\Steam\steamapps\common\worldbox\)
└── BepInEx/
    └── plugins/
        └── sinai-dev-UnityExplorer/ (or directly in plugins/)
            ├── UnityExplorer.BIE5.Mono.dll
            └── UniverseLib.Mono.dll
```

## 실제로 쓰게 될 핵심 패널 3가지

| 패널 | 용도 |
| --- | --- |
| **Object Explorer → Scene Explorer** | 화면에 떠 있는 모든 오브젝트의 실시간 트리 계층. 찾으려는 창도 이 안에 숨어 있습니다 |
| **Inspector** | 트리에서 아무 오브젝트나 클릭하면 모든 컴포넌트와 필드의 현재 값을 확인할 수 있습니다 |
| **C# Console** | C# 코드를 한 줄 입력해서 실행 중인 게임에서 바로 실행합니다. 재시작할 필요가 없습니다 |

## 예제 1: 바닐라 창이 어떻게 구성되어 있는지 파헤치기

내가 만들 커스텀 창을 게임 기본 창과 똑같은 모양으로 만들고 싶다면 다음과 같이 하세요:

1. 게임 내에서 원하는 창(예: 세계 법칙 창)을 엽니다.
2. F7을 누르고 **Object Explorer → Scene Explorer**로 이동한 뒤, `CanvasMain` → `canvas_ui`를 차례로 펼칩니다.
3. 하위 항목들을 하나씩 클릭하면서, 하이라이트 표시되는 오브젝트가 방금 연 창과 일치할 때까지 찾습니다.
4. Inspector에서 해당 창의 컴포넌트들을 살펴봅니다: 9-슬라이스 스프라이트가 적용된 `Image`, `RectTransform` 크기, `ScrollRect` 등.

이제 정확한 크기, 스프라이트 경로, 그리고 구조를 파악했으니 **[커스텀 창](#/nml/custom-windows)** 페이지를 보며 그대로 복사해 쓰면 됩니다. 이렇게 해야 앵커 위치 맞추느라 3시간 동안 삽질하는 대참사를 피할 수 있습니다 :PES5_Peek:.

## 예제 2: 에셋의 실제 필드값 읽어오기

**C# Console**을 열고 다음 코드를 실행해 봅니다:

```csharp UnityExplorer C# console
var t = AssetManager.traits.get("strong");
UnityExplorer.ExplorerCore.Log(t.path_icon);
UnityExplorer.ExplorerCore.Log(t.group_id);
```

UnityExplorer 로그 출력 창에 다음과 같이 즉시 찍힙니다:

```text
[Message:UnityExplorer] ui/Icons/actor_traits/iconStrong
[Message:UnityExplorer] physique
[Message:UnityExplorer] Invoked REPL (no return value)
```

실행 중인 게임에서 바닐라 특성의 아이콘 경로와 그룹 ID를 직접 읽어왔습니다. 이걸 본인의 특성에 복사해 넣으면 UI의 동일한 위치에 깔끔하게 자리 잡고, 실제로 존재하는 아이콘이 제대로 표시됩니다.

## 예제 3: 모드를 본격적으로 만들기 전에 아이디어 검증하기

여전히 C# 콘솔에서:

```csharp UnityExplorer C# console
// 좌표 x=100, y=100 타일에 늑대 한 마리를 스폰
var tile = World.world.GetTile(100, 100);
World.world.units.spawnNewUnit("wolf", tile);
```

여기서 작동한다면 모드 코드에서도 정상 작동합니다. 만약 여기서 예외를 뿜으며 뻗는다면, 컴파일하고 게임을 재시작하는 기나긴 헛수고를 미리 아낀 셈입니다 :aPES2_ThumbsUp:.

> [!TIP] 콘솔과 함께 사용하기
> UnityExplorer는 "이게 뭘로 만들어졌지?"에 답해 주고, BepInEx 콘솔은 "내 코드가 실제로 돌긴 했나?"에 답해 줍니다. 모딩하면서 겪는 거의 모든 문제는 이 두 가지 질문 중 하나로 귀결됩니다.
