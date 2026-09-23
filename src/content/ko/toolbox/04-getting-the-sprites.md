---
title: 게임 그래픽 추출하기 (AssetRipper)
group: 개요
subgroup: 외부 도구 및 설정
icon: :wbgeneralartist:
order: 8
---

# 게임 그래픽 추출하기 :wbgeneralartist:

코드가 *무엇을* 써야 하는지 알려준다면, **AssetRipper**는 게임 그래픽이 어떻게 생겼는지, 그리고 가장 중요한 **리소스의 정확한 경로가 무엇인지**를 알려줍니다.

WorldBox의 모든 아이콘, 유닛, 건물, 효과는 `ui/Icons/iconFly`와 같은 문자열 경로를 통해 로드됩니다. 이 경로를 틀리는 순간 여러분의 버튼은 UI 상에서 보이지 않는 투명 구멍이 되어버립니다. AssetRipper를 쓰면 이런 막막한 찍기 놀이를 끝낼 수 있습니다.

> [!TIP] 경로만 필요하다면 이 모든 작업은 필요 없습니다
> 이 사이트의 **[아이콘 검색](#/tools/icons)** 은 바로 이 추출 데이터로 제작되어 게임 내 모든 경로를 검색할 수 있습니다. 그래픽을 직접 *보고* 적절한 크기를 선택하거나 색상 팔레트를 맞추고 싶을 때 게임을 직접 리핑하세요. 이 페이지의 나머지 내용은 바로 그것을 위한 것입니다 :PES4_HappyAwesome:.

## 게임 리소스 익스포트하기

1. [**AssetRipper**](https://github.com/AssetRipper/AssetRipper/releases)를 다운로드합니다.
2. WorldBox 설치 폴더(`worldbox_Data`가 있는 위치)를 지정합니다.
3. 원하는 폴더로 추출합니다. 몇 분 정도 걸리고 수 기가바이트의 용량을 차지합니다 :pepehang:.

완료되면 하나의 Unity 프로젝트가 생성됩니다. 여기서 실제로 신경 써야 할 부분은 익스포트된 `Resources` 폴더뿐입니다. 게임이 런타임에 파일을 찾아 들어가는 디렉토리 구조와 완전히 동일합니다.

## 파일 위치를 리소스 경로로 변환하기

규칙은 아주 단순합니다: **`Resources` 폴더 아래의 상대 경로에서 파일 확장자를 뺀 것이 곧 경로입니다.**

```text
ExportedProject/Assets/Resources/ui/Icons/iconFly.png
                                 └───────┬────────┘
                                         │
                      SpriteTextureLoader.getSprite("ui/Icons/iconFly")
```

가장 자주 뒤져보게 될 핵심 폴더들:

| 폴더 | 포함된 내용 |
| --- | --- |
| `ui/Icons/` | 모든 작은 인터페이스 아이콘: 특성, 권능, 버튼 |
| `ui/Icons/worldrules/` | 세계 법칙 아이콘 |
| `actors/` | 유닛 및 각 프레임별 애니메이션 스프라이트 |
| `buildings/` | 건물, 나무, 광물 |
| `effects/` | 폭발, 투사체, 상태 이상 효과 스프라이트 |

## 내 모드에서 직접 활용하기

익스포트된 폴더에서 마음에 드는 아이콘을 찾았다면, 경로만 적어두고 코드에서 곧바로 호출하세요. 파일을 복사해 올 필요도 없습니다. 이미 게임에 들어있으니까요:

```csharp Mods/HelloBox/Code/HelloPowers.cs
Sprite icon = SpriteTextureLoader.getSprite("ui/Icons/iconFly");
```

혹은 에셋 정의 시 문자열로 직접 지정합니다:

```csharp
trait.path_icon = "ui/Icons/iconFly";
```

## 직접 그릴 때 바닐라 화풍과 맞추는 법

아이콘을 직접 도트로 찍는다면, 먼저 바닐라 파일 하나를 열어보고 다음 3가지를 그대로 따라 하세요:

- **크기.** 특성과 권능 아이콘은 매우 작으며, 보통 16~32 px 사이입니다. 원본 파일을 열고 그 규격에 맞추세요.
- **색상 팔레트.** WorldBox는 절제되고 부드러운 색상 팔레트를 사용합니다. 기존 스프라이트에서 스포이트로 색을 뽑아 쓰면 아이콘이 게임 내에서 겉돌지 않습니다 :PES3_BobRoss:.
- **피벗(기준점).** 유닛과 건물은 땅 위에 서 있어야 하므로 기준점이 하단 중앙에 위치합니다. 이것이 `sprites.json` 파일의 `PivotY: 0.0` 값입니다. 자세한 내용은 **[스프라이트와 리소스](#/nml/sprites-and-resources)** 페이지를 참고하세요.

다 그린 PNG 파일을 동일한 폴더 구조를 갖춰 `GameResources/` 폴더에 넣기만 하면, 바닐라 리소스와 똑같이 매끄럽게 로드됩니다:

```text
Mods/HelloBox/GameResources/ui/Icons/iconHello.png   ->   "ui/Icons/iconHello"
```
