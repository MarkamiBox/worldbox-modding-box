---
title: 다국어 지원
group: NML 모딩
subgroup: 기본 개발 흐름
icon: :wbscroll:
order: 26
---

# 다국어 지원 :wbscroll:

게임에 추가하는 모든 요소(특성, 아이템, 권능, 탭, 행동 작업)는 직접 텍스트를 지정해주지 않으면 `trait_hello_swift` 와 같은 원시 키 이름 그대로 노출됩니다. 모딩에서 가장 지루한 작업이지만, 이를 건너뛰는 순간 모드가 미완성된 것처럼 보이는 가장 큰 원인이 됩니다. (콜록.. 내 옛날 모드들.. 콜록콜록 :pensiveanimated: )

## 가장 게으르고 편한 방법: Locales 폴더

메인 클래스가 `BasicMod<T>` 를 상속받는 경우, 모드 안에 `Locales/` 폴더를 만들고 언어 코드 이름을 딴 JSON 파일만 넣어두면 됩니다. NML이 `OnModLoad` 실행 **전**에 코드를 단 한 줄도 작성하지 않아도 자동으로 로드해 줍니다.

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money.",
  "hello_sword_ember": "Ember Blade",
  "hello_strike": "Hello Strike",
  "hello_strike_description": "Shakes the ground and makes a mess."
}
```

파일 이름 **자체**가 언어 코드가 됩니다: `en.json`, `cz.json` (중국어 간체), `ru.json`, `ko.json` 등.

만약 `IMod` 인터페이스를 직접 구현했다면, `ILocalizable` 을 추가하고 폴더 위치를 지정해 줍니다:

```csharp Code/Main.cs
public string GetLocaleFilesDirectory(ModDeclare pModDeclare)
{
    return System.IO.Path.Combine(pModDeclare.FolderPath, "Locales");
}
```

## 모든 언어를 단 하나의 파일로: CSV


스프레드시트 프로그램이 쉼표 대신 세미콜론이나 탭으로 내보내는 경우, 메인 클래스에 `ICsvSepCustomized`를 구현하고 `GetCsvSeparator()`에서 `';'`를 반환하도록 하세요 :PES2_Shrug:。
같은 폴더에 `.csv` 파일 하나만 두면 모든 언어를 한 번에 처리할 수 있어, 15개의 JSON 파일을 개별 관리하는 것보다 훨씬 편리합니다. 이 경우 파일 이름은 아무래도 상관없습니다:

```text Locales/lang.csv
key,en,cz,ru
trait_hello_swift,Swift,迅捷,Быстрый
```

## C# 코드에서 직접 등록하기

`NeoModLoader.General.LM` 은 다국어 처리를 돕는 유틸리티 클래스입니다. 텍스트를 동적으로 생성해야 하거나, 번거로운 JSON 파일 대신 단 하나의 `.cs` 파일 안에서 모든 것을 끝내고 싶을 때 유용합니다.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // 현재 게임 언어로 텍스트 읽기
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // 현재 활성화된 언어에 추가
LM.Add("en", "trait_hello_swift", "Swift");          // 특정 언어에 추가
LM.LoadLocale("en", path);            // JSON 파일을 수동 로드
LM.LoadLocales("path/to/Locales/lang.csv");          // CSV 파일을 수동 로드
LM.ApplyLocale(false);                               // 적용. false = 화면 전체 텍스트 재로드 방지
```

HelloBox에서는 다음과 같이 구성합니다:

```csharp Mods/HelloBox/Code/HelloLocale.cs
using System.Collections.Generic;
using NeoModLoader.General;

namespace HelloBox
{
    public static class HelloLocale
    {
        public static void Initialize()
        {
            Dictionary<string, string> texts = new Dictionary<string, string>
            {
                { "trait_hello_swift", "Swift" },
                { "trait_hello_swift_info", "Moves like the world owes it money." },
                { "hello_strike", "Hello Strike" },
                { "hello_strike_description", "Shakes the ground and makes a mess." }
            };

            foreach (KeyValuePair<string, string> pair in texts)
            {
                LM.AddToCurrentLocale(pair.Key, pair.Value);
                LM.Add("en", pair.Key, pair.Value);
            }

            LM.ApplyLocale(false);
        }
    }
}
```

다른 모든 요소보다 **가장 먼저** `HelloLocale.Initialize();` 를 `Main.cs` 에서 호출하세요. 텍스트가 등록되지 않은 상태에서 애셋이 먼저 로드되는 일을 막기 위함입니다.

**초기화 시점에 모든 텍스트를 일괄 등록**하고, 마지막에 `ApplyLocale` 을 딱 한 번 호출하세요. 게임에 등록되지 않은 키를 요청하면 오류 로그가 기록되고 디스크에 파일까지 쓰기 때문에, 누락된 키로 도배된 툴팁은 보기 흉할 뿐만 아니라 로그를 심각하게 오염시킵니다 :PES_UghPing:.

## 실제로 사용되는 주요 로케일 키 규칙

게임 내부에서 자동으로 이 키들을 조립하므로 정확히 일치해야 합니다:

| 항목 | 이름 키 | 설명 키 |
| --- | --- | --- |
| 특성 (Trait) | `trait_<id>` | `trait_<id>_info` |
| 아이템 | `item_<id>` | `item_<id>_description` |
| 신의 권능 | `<power_id>` | `<power_id>_description` |
| 권능 탭 | 전달한 `locale_key` | 전달한 설명 키 |
| 유닛 작업 | `task_unit_<task_id>` | - |
| 상태 효과 | `<status_id>` | `<status_id>_description` |
| 세계 법률 | `<law_id>_title` (접미사 주의) | `<law_id>_description` |

> [!WARNING] ID는 표시 이름이 아닙니다
> 여러분이 지정한 ID는 모든 언어에서 영원히 `hello_swift` 이며, 코드와 다른 모드가 참조하는 고유 식별자입니다. 변하는 것은 오직 **로케일 텍스트**뿐입니다. 게임 내 표시 이름의 오타를 고치겠다고 ID 자체를 바꾸는 일은 절대 하지 마세요 :PESgn_Stop:.
