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

모더들이 가장 자주 찾아보게 되는 핵심 참조 표입니다. 애셋마다 그래픽을 가리키는 필드 이름이 다르고, 일부 애셋은 로드 시 특정 폴더명을 암묵적으로 앞에 덧붙이므로, 코드에 적는 경로와 디스크 경로가 **다를 수 있습니다**.

| 애셋 종류 | 필드명 | 실제 파일 위치 |
| --- | --- | --- |
| 특성, 신의 권능, 국가, 그룹 | `path_icon` | `GameResources/` + 코드에 적은 경로 그대로 |
| 아이템 (유닛 손에 쥐었을 때) | `path_gameplay_sprite` | `GameResources/` + 코드에 적은 경로 그대로 |
| 건물 | `sprite_path` | **폴더**: `GameResources/` + `sprite_path` + `/`, 안에 `main_0.png`, `construction_0.png`, `ruin_0.png`. `sprite_path` 가 비어 있으면 `main_path` + id 이고, `main_path` 기본값은 `buildings/` |
| 드롭 아이템 | `path_texture` | **폴더**: `GameResources/` + 코드에 적은 경로 그대로 |
| 구름 | `path_sprites` | `GameResources/` + 리스트 내의 각 경로 |
| 상태 효과 | `texture` | **폴더**: `GameResources/effects/` + 코드에 적은 경로 |
| 투사체 | `texture` | **폴더**: `GameResources/effects/projectiles/` + 코드에 적은 경로 |
| 자원 (손에 들고 운반 시) | `path_gameplay_sprite` | **폴더**: `GameResources/items/resources/` + 코드에 적은 경로 |
| 자원 (인벤토리 아이콘) | `path_icon` | `GameResources/` + 코드에 적은 경로 (바닐라는 `iconResBread` 형식) |
| 지형 타일 및 탑 타일 | *(필드 없음)* | `GameResources/tiles/<타일_id>/` |

> [!WARNING] "폴더"는 취향 문제가 아닙니다
> 위에서 **폴더** 라고 표시한 것은 모두 `getSpriteList()` 로 읽히는데, 이건 폴더 *안의* 프레임을 돌려줍니다. PNG 하나를 가리키면 빈 목록이 옵니다. 드롭은 안 보이게 떨어지고, 투사체는 `QuantumSpriteLibrary.drawProjectiles()` 에서 `ArgumentOutOfRangeException`, 상태는 매 프레임 예외를 냅니다. 프레임 하나면 충분하고, 자기 폴더에만 있으면 됩니다: `drops/hello_ember/hello_ember_0.png` :wbfacepalm:.

주의해야 할 대표적인 함정 세 가지:

- **상태 효과와 투사체는 하위 폴더가 자동으로 붙습니다.** `texture = "effects/status/myThing"` 로 쓰면 게임은 `effects/effects/status/myThing` 을 찾으려 하므로 실패합니다. 바닐라는 `fx_status_burning_t` 처럼 단일 이름만 씁니다.
- **지형 타일은 필드 설정을 아예 무시합니다.** 타일은 여러 변형 그래픽을 가지므로 **타일 ID** 와 일치하는 전용 폴더를 자동으로 찾습니다. `hello_moss` 라면 `GameResources/tiles/hello_moss/` 안에 PNG 파일들을 넣어야 합니다.
- **건물은 필드를 합치지 않지만, 대체 경로가 있습니다.** `sprite_path` 는 적힌 그대로 쓰입니다. `"buildings/hello_shrine"` 은 `GameResources/buildings/hello_shrine/` 입니다. 비워 두면 게임은 `main_path` + id 를 쓰므로, `main_path` 에 폴더를 적으면 `buildings/hello_shrine/hello_shrine` 이 됩니다 :PESgn_Bruh:.

> [!TIP] 바닐라 애셋 경로를 그대로 베끼세요
> 가장 유사한 바닐라 요소를 골라 **[UnityExplorer](#/toolbox/unity-explorer)** 나 **[아이콘 검색](#/tools/icons)** 으로 필드 값을 확인한 뒤 구조를 그대로 흉내 내세요. 이것이 가장 빠르고 정확합니다 :PESgn_Noice:.

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

> [!NOTE] 완전한 커스텀 사운드 추가는 별도의 영역입니다
> FMOD 이벤트는 게임 사운드 뱅크에 내장되어 있어 모드가 직접 추가할 수 없습니다. 자체 `.wav` 파일을 재생하려면 게임 볼륨 설정과 별개로 Unity `AudioSource`를 직접 로드하여 재생해야 합니다. 저는 이것을 모딩해본 적이 없고 해본 척할 생각도 없으므로 이 가이드에서는 다루지 않습니다.

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
