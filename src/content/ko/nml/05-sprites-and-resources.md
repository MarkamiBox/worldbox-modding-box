---
title: 스프라이트 및 리소스
group: NML 모딩
subgroup: 기본 개발 흐름
icon: :wbfanartist:
order: 28
---

# 스프라이트 및 리소스 :wbfanartist:

특성의 이름, 스탯, 멋진 설명문까지 준비되었습니다. 하지만 게임 안에서는 커다랗고 흉측한 물음표 아이콘이 덩그러니 떠 있습니다. 이제 이것을 고쳐봅시다.

## 게임에 이미 있는 아이콘 사용하기

가장 간단하고 가장 자주 사용하게 될 방법입니다: 기본 바닐라 스프라이트 경로를 그대로 가리킵니다.

```csharp
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
Sprite[] frames = SpriteTextureLoader.getSpriteList("effects/projectiles/arrow");
```

`getSprite` 는 캐시가 적용된 `Resources.Load`, `getSpriteList` 는 캐시가 적용된 `Resources.LoadAll` 입니다. 경로에는 확장자를 붙이지 않습니다: 항상 `ui/Icons/iconFly` 형식이며, `ui/Icons/iconFly.png` 가 아닙니다.

대부분의 애셋 필드는 로드된 Sprite 객체 대신 **문자열 경로(string)** 를 요구합니다:

```csharp
trait.path_icon = "ui/Icons/iconHelloSwift";
power.path_icon = "ui/Icons/iconHelloStrike";
```

> [!TIP] 어떤 경로가 존재하는지 어떻게 알 수 있나요?
> 이 사이트의 **[아이콘 검색](#/tools/icons)** 도구를 사용하세요. 게임 내 모든 스프라이트 경로가 수록되어 있으며, "death king"이나 "lightning bolt" 같은 일상 단어로 검색하여 바로 복사할 수 있습니다. 또는 게임 내에서 **[UnityExplorer](#/toolbox/unity-explorer)** 를 열고 원하는 바닐라 애셋의 `path_icon` 값을 직접 확인하세요 :aPES_Magnifying:.

## 나만의 그래픽 추가하기

모드 폴더 안에 **`GameResources/`** 라는 폴더를 만듭니다. NML은 이 폴더를 유니티의 내부 `Resources` 폴더와 동일하게 취급하므로, 다음 경로에 둔 파일은:

```text
HelloBox/GameResources/ui/Icons/iconHelloSwift.png
```

`ui/Icons/iconHelloSwift` 로 로드되어 바닐라 경로가 동작하는 모든 곳에서 완벽히 작동합니다. `.png`, `.jpg`, `.jpeg` 확장자가 자동으로 지원됩니다.

### sprites.json

이미지 파일 옆에 `sprites.json` 을 두면 NML에게 텍스처 슬라이스 방식을 지정해 줄 수 있습니다. 이 파일이 없으면 유니티 기본값이 적용되어 픽셀 아트에서는 엉뚱하게 보일 수 있습니다. (항상 필수인 것은 아닙니다 :PESgn_Maybe: )

```json GameResources/ui/Icons/sprites.json
{
  "Default": {
    "PixelsPerUnit": 1,
    "PivotX": 0.5,
    "PivotY": 0.5
  },
  "Specific": [
    {
      "Path": "iconHelloSwift.png",
      "PivotX": 0.5,
      "PivotY": 0.0
    }
  ]
}
```

| 필드 | 기능 |
| --- | --- |
| `PixelsPerUnit` | 특별한 이유가 없다면 항상 `1` 로 유지하세요 |
| `PivotX` / `PivotY` | 기준 앵커 포인트. `0.5 / 0.0` 은 하단 중앙을 뜻하며, 유닛과 건물에 주로 사용됩니다 |
| `BorderL/R/T/B` | 늘어나는 창 테두리와 버튼을 위한 9-슬라이스 여백 설정 |
| `Path` | 이 특정 규칙을 적용할 개별 파일명 |

`Default` 는 `Specific` 에 명시되지 않은 해당 폴더 내의 모든 파일에 공통 적용됩니다.

## 각 그래픽 유형별 파일 저장 위치

모두가 계속 다시 찾아오는 표입니다. 에셋마다 그림을 가리키는 필드가 다르고, 몇몇은 불러오기 전에 몰래 폴더를 앞에 붙입니다. 그래서 여러분이 쓰는 값이 파일이 있는 경로와 항상 같지는 **않습니다**.

| 에셋 | 필드 | 파일 위치 |
| --- | --- | --- |
| 특성, 신의 권능, 왕국, 그룹 | `path_icon` | `GameResources/` + 쓴 그대로 |
| 아이템(유닛이 손에 든 것) | `path_gameplay_sprite` | `GameResources/` + 쓴 그대로 |
| 건물 | `sprite_path` | **폴더**: `GameResources/` + `sprite_path` + `/` 안에 `main_0.png`, `construction_0.png`, `ruin_0.png`. `sprite_path`가 비어 있으면 `main_path` + ID이고, `main_path`의 기본값은 `buildings/` |
| 드롭 | `path_texture` | **폴더**: `GameResources/` + 쓴 그대로, 프레임당 PNG 1장 |
| 구름 | `path_sprites` | `GameResources/` + 목록의 각 경로 |
| 상태 효과 | `texture` | **폴더**: `GameResources/effects/` + 쓴 값, 프레임당 PNG 1장 |
| 투사체 | `texture` | **폴더**: `GameResources/effects/projectiles/` + 쓴 값, 프레임당 PNG 1장 |
| 자원(손에 든 것) | `path_gameplay_sprite` | **폴더**: `GameResources/items/resources/` + 쓴 값, 프레임당 PNG 1장 |
| 자원(인벤토리 아이콘) | `path_icon` | `GameResources/` + 쓴 값. 바닐라는 `iconResBread` 같은 이름만 쓰므로 파일은 루트에 있습니다 |
| 타일과 상단 타일 | *(필드 없음)* | `GameResources/tiles/<the tile's id>/` |

> [!WARNING] "폴더"는 취향 문제가 아닙니다
> 위에서 **폴더**로 표시한 에셋은 모두 `getSpriteList()`로 읽히며, 이 메서드는 폴더 *안의* 프레임들을 돌려줍니다. PNG 한 장을 가리키면 빈 결과가 돌아옵니다: 드롭은 투명하게 떨어지고, 투사체는 `QuantumSpriteLibrary.drawProjectiles()`에서 `ArgumentOutOfRangeException`을 던지고, 상태 효과는 매 프레임 오류가 납니다. 프레임이 하나여도 괜찮습니다, 자기 폴더에 들어 있기만 하면 됩니다: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

이 중 세 가지가 발목을 잡습니다:

- **상태 효과와 투사체는 폴더를 앞에 붙입니다.** 상태 효과에 `texture = "effects/status/myThing"`이라고 쓰면 게임은 `effects/effects/status/myThing`을 찾는데, 그런 건 없습니다. 바닐라 상태 효과는 이름만 씁니다: `fx_status_burning_t`.
- **타일은 필드를 완전히 무시합니다.** 타일의 그림은 **ID**로, 전용 폴더에서 찾습니다. 타일에는 변형이 여러 개 있기 때문입니다. `hello_moss`라면 `GameResources/tiles/hello_moss/` 안에 PNG를 넣으세요.
- **건물은 아무것도 붙이지 않지만, 대체 경로가 있습니다.** `sprite_path`는 쓴 그대로 사용됩니다: `"buildings/hello_shrine"`은 `GameResources/buildings/hello_shrine/`입니다. 비워 두면 게임은 대신 `main_path` + ID를 쓰기 때문에, `main_path`에 폴더를 쓰면 `buildings/hello_shrine/hello_shrine`이 되어 버립니다 :PESgn_Bruh:.

> [!TIP] 바닐라 에셋에서 경로를 베끼세요
> 가장 비슷한 바닐라 것을 골라 **[UnityExplorer](#/toolbox/unity-explorer)**나 **[스프라이트 경로 검색](#/tools/icons)** 도구로 그 필드를 읽고, 형태를 그대로 따라 하세요. 머리로 따지는 것보다 빠르고, 한 번에 맞습니다 :PESgn_Noice:.

## 디스크에서 파일 직접 읽어오기

창 프레임을 직접 9-슬라이스하거나 외부 데이터 파일을 읽어야 할 때처럼 순수 텍스처가 필요할 때가 있습니다. `ModDeclare` 가 모드의 설치 경로를 알고 있으므로 경로를 절대로 하드코딩하지 마세요.

```csharp
string path = System.IO.Path.Combine(GetDeclaration().FolderPath, "GameResources", "ui", "frame.png");

Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
texture.filterMode = FilterMode.Point;      // 도트 그래픽 번짐 방지
texture.LoadImage(System.IO.File.ReadAllBytes(path));
```

직접 구현하기 번거롭다면 `NeoModLoader.utils.SpriteLoadUtils` 의 `LoadSingleSprite(path)` 와 `LoadSprites(path)` 유틸리티를 활용할 수도 있습니다.

## 사운드

WorldBox의 모든 사운드는 FMOD 이벤트이며, 경로를 지정하여 재생합니다. 게임 내의 모든 사운드를 자유롭게 재생할 수 있습니다:

```csharp
MusicBox.playSound("event:/SFX/WEAPONS/WeaponFireballStart", pTile);   // at a place in the world
MusicBox.playSoundUI("event:/SFX/UI/WindowWhoosh");                     // on the interface
```

첫 번째 메서드는 해당 월드 타일 위치에서 소리를 재생합니다. HelloBox는 전투 액션에서 불씨를 던질 때 파이어볼 사운드를 재생합니다. **[투사체, 주문 및 효과](#/nml/projectiles-spells)**를 참조하세요. 경로를 찾으려면 게임 코드에서 `event:/SFX/`를 검색하세요. 소리의 종류별로 분류된 수백 개의 경로가 존재합니다. 테스트를 시작하기 전에 볼륨부터 줄이세요.

### 나만의 사운드 추가하기

NML은 사실 내부적으로 FMOD를 패치하기 때문에, 차고에서 두 번째 사운드 엔진을 만들 필요 없이 직접 만든 `.wav` 파일이 작동합니다 :PESgn_Noice:.

`.wav` 파일을 `GameResources/`에 그대로 넣으세요. 예를 들면:

```text
GameResources/sounds/hello_boom.wav
```

NML이 `MusicBox.playSound`와 `playDrawingSound`를 후킹하므로, 바닐라 사운드와 똑같은 메서드로 재생하면 됩니다(파일 확장자는 빼고):

```csharp
MusicBox.playSound("sounds/hello_boom", pTile);
```

파일 옆에 선택 사항인 `hello_boom.json`을 두면 동작 방식을 설정할 수 있습니다:

```json GameResources/sounds/hello_boom.json
{
  "Volume": 60,
  "Mode": "Stereo3D",
  "Type": "Sound"
}
```

| 필드 | 값 |
| --- | --- |
| `Mode` | `Basic` (평면 2D, 볼륨 일정), `Stereo3D` (거리에 따른 바닐라 감쇠), `Mono3D` (방향성) |
| `Type` | `Sound` (효과음 슬라이더), `Music` (음악 슬라이더), `UI` (UI 슬라이더) |
| `Volume` | 기본 볼륨 0~100 |
| `LoopCount` | 반복 횟수 (0 = 한 번) |

무엇보다 좋은 점: NML이 게임의 채널 그룹에 연결해 주기 때문에, 여러분의 사운드는 한밤중에 플레이어의 귀를 멀게 하는 대신 플레이어의 볼륨 설정을 제대로 따릅니다.

## 게임에 절대 null 스프라이트를 넘기지 마세요

스프라이트가 누락된 버튼은 "아이콘만 없는 버튼"이 아니라, UI 상에서 **보이지 않는 투명한 구멍**이 되어 플레이어가 누를 수조차 없게 됩니다. 항상 대체 스프라이트를 지정하세요:

```csharp
private static Sprite Icon(string pName)
{
    Sprite sprite = SpriteTextureLoader.getSprite("ui/Icons/" + pName);
    if (sprite == null) sprite = SpriteTextureLoader.getSprite("ui/Icons/iconWarning");
    return sprite;
}
```

경고 아이콘이 뜨면 "경로가 잘못되었구나" 하고 즉시 알 수 있습니다. 완전히 사라진 투명 구멍은 버튼이 어디로 증발했는지 2시간 동안 헤매게 만듭니다 :PES4_Invisible:.
