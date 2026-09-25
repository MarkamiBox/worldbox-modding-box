---
title: 모드 설정
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbsettingsgear:
order: 40
---

# 모드 설정 :wbsettingsgear:

조만간 누군가가 여러분의 모드가 너무 사기라거나, 너무 느리다거나, 너무 시끄럽다고 불평할 것입니다. 디스코드에서 키보드 배틀을 벌이는 대신 :PESgn_WhySoToxic:, 설정 창을 제공하고 직접 조정하게 만드세요.

NML이 창 전체를 대신 그려줍니다. 여러분은 JSON 파일 하나만 작성하면 됩니다.

## default_config.json

모드 루트의 `mod.json` 바로 옆에 `default_config.json` 파일을 넣습니다:

```json default_config.json
{
  "hellobox": [
    {
      "Id": "strike_radius",
      "Type": "INT_SLIDER",
      "IntVal": 25,
      "MinIntVal": 5,
      "MaxIntVal": 100,
      "Callback": "HelloBox.HelloSettings:SetStrikeRadius"
    },
    {
      "Id": "max_spawns",
      "Type": "INT_SLIDER",
      "IntVal": 40,
      "MinIntVal": 1,
      "MaxIntVal": 500
    },
    {
      "Id": "tint_by_mood",
      "Type": "SWITCH",
      "BoolVal": true
    }
  ]
}
```

`"hellobox"`는 **그룹 ID**로, 하나의 설정 탭이 됩니다. 그 내부의 각 객체는 창의 한 행을 구성합니다.

| 키 | 의미 |
| --- | --- |
| `Id` | 그룹 내에서 고유한 값. 코드에서 값을 읽을 때 사용 |
| `Type` | `SWITCH` (켜기/끄기), `SLIDER` (실수), `INT_SLIDER` (정수), `TEXT` (텍스트 입력), `SELECT` (선택지 그리드) |
| `BoolVal` / `FloatVal` / `IntVal` / `TextVal` | 타입에 맞는 기본값 |
| `MinFloatVal` / `MaxFloatVal`, `MinIntVal` / `MaxIntVal` | 슬라이더 범위. `SELECT`에서는 `MaxIntVal`이 선택지 개수, `IntVal`이 선택된 인덱스입니다 |
| `IconPath` | 행에 표시할 선택적 아이콘 |
| `Callback` | 값이 변경될 때 호출될 선택적 `Namespace.Type:MethodName` |

`SELECT`의 경우 NML은 선택지마다 버튼을 하나씩 배치합니다. 라벨은 로컬라이즈 파일에서 `<id>_0`, `<id>_1` 같은 식으로 바로 가져옵니다.

## 설정값 읽기

`BasicMod<T>`를 사용하면 `GetConfig()`가 기본 제공되며, 그룹 이름과 ID로 인덱싱할 수 있습니다:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LoadSettings();
}

private void LoadSettings()
{
    try { HelloSettings.StrikeRadius = GetConfig()["hellobox"]["strike_radius"].IntVal / 100f; }
    catch (System.Exception) { }

    try { HelloSettings.TintByMood = GetConfig()["hellobox"]["tint_by_mood"].BoolVal; }
    catch (System.Exception) { }
}
```

NML은 시작할 때 `persistent_config.MergeWith(default_config)`를 호출합니다. 그래서 `default_config.json`에 새 키를 추가하면 NML이 기본값과 함께 플레이어의 저장된 설정에 자동으로 병합합니다. 누군가 `.config`를 텍스트 편집기로 열어 JSON을 망가뜨렸을 경우를 대비해 `try/catch`는 여전히 좋은 습관이지만, 일반적인 업데이트라면 NML이 알아서 챙겨 줍니다.

## Callbacks

`Callback`은 `Namespace.Type:MethodName` 형식이며, 메서드는 새로운 값을 인자로 받습니다:

```csharp Mods/HelloBox/Code/HelloSettings.cs
namespace HelloBox
{
    public static class HelloSettings
    {
        public static float StrikeRadius = 0.25f;
        public static bool TintByMood = true;

        // 플레이어가 슬라이더를 움직였을 때 NML이 호출함
        public static void SetStrikeRadius(int pValue)
        {
            StrikeRadius = pValue / 100f;
        }
    }
}
```

> [!WARNING] 변경 사항은 창이 닫힐 때 적용됩니다
> 슬라이더를 드래그하는 도중이 아닙니다. 콜백이 무거운 작업을 수행한다면 반가운 소식입니다. 실시간 미리보기를 기대했다면 "왜 작동을 안 하지" 싶었던 이유가 바로 이것입니다 :huh:. 또한 `BasicMod`는 시작할 때 모든 콜백을 한 번씩 호출하므로, 플레이어가 저장해 둔 값이 코드에 반영됩니다.

## 저장 위치

`default_config.json`은 단지 **템플릿**일 뿐입니다. 플레이어의 실제 설정값은 다음 경로에 기록됩니다:

```text
%USERPROFILE%\AppData\LocalLow\mkarpenko\WorldBox\mods_config\<YOUR_GUID>.config
```

기본값을 테스트하면서 "새 값이 왜 반영되지 않지"라며 머리를 쥐어뜯을 때 가장 먼저 지워야 할 파일이기도 합니다 :PESgn_OOF:.

## Don't forget the text (again)

그룹 id와 item id도 로케일 키입니다. `Locales/en.json` 에 넣지 않으면 날것 그대로 나옵니다. 각 줄에는 툴팁용 두 번째 키 **`"<id> Description"`** (띄어쓰기와 대문자 D) 도 필요합니다:

```json Mods/HelloBox/Locales/en.json
{
  "hellobox": "HelloBox",

  "strike_radius": "Strike radius",
  "strike_radius Description": "How far the god power reaches.",

  "max_spawns": "Maximum spawns",
  "max_spawns Description": "Upper limit before the mod stops spawning.",

  "tint_by_mood": "Tint units by mood",
  "tint_by_mood Description": "Colour units by how happy they are."
}
```

> [!TIP] 빠뜨린 건 로그가 알려줍니다
> 라벨이 없으면 `LocalizedTextManager: missing text: strike_radius Description` 가 찍힙니다. 설정 창을 한 번 연 뒤 `missing text:` 를 검색하면 추가할 키 목록이 정확히 나옵니다 :wbsmirk:.


## BasicMod 없이 사용하기

메인 클래스가 `IMod`를 직접 구현한다면, 같은 클래스에서 `IConfigurable`을 구현하고 인스턴스를 직접 반환하면 됩니다:

```csharp
public ModConfig GetConfig()
{
    return _config;   // 직접 생성하거나 로드한 인스턴스
}
```

이 메서드 하나 덕분에 모드 창에서 내 모드 옆에 설정 버튼이 나타나게 됩니다. 메서드 하나로, 더는 아무도 Discord에서 여러분과 싸우지 않습니다. 이론상으로는요.

## 모드 설정이냐, 게임 옵션이냐?

HelloBox의 평범한 설정값들은 `default_config.json`에 두세요. 게임의 `AssetManager.options_library`는 `PlayerConfig`가 뒷받침하는 별개의 시스템이며, 네이티브 토글을 연결할 때 유용합니다. 옵션 에셋을 등록하는 것만으로는 그 저장값이 자동으로 만들어지지 않습니다.

다음: 그 경로를 위한 **[게임 옵션](#/nml/game-options)**, 또는 화면에 컨트롤을 올리는 **[권능 탭 & 버튼](#/nml/power-buttons)**.
