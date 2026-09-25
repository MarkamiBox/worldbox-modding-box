---
title: 다국어 지원
group: NML 모딩
subgroup: 기본 개발 흐름
icon: :wbscroll:
order: 26
---

# 다국어 지원 :wbscroll:

게임에 추가하는 모든 요소(특성 (trait), 아이템, 권능 (GodPower), 탭, 행동 작업 (task))는 직접 텍스트를 지정해주지 않으면 `trait_hello_swift` 와 같은 원시 키 이름 그대로 노출됩니다. 모딩에서 가장 지루한 작업이지만, 이를 건너뛰는 순간 모드가 미완성된 것처럼 보이는 가장 큰 원인이 됩니다. (콜록.. 내 옛날 모드들.. 콜록콜록 :pensiveanimated: )

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

파일 이름 **자체**가 언어 코드가 됩니다: `en.json`, `cz.json` (중국어 간체), `ch.json` (중국어 번체), `ja.json` (일본어), `ru.json` 등. 이는 `GameLanguageLibrary`에 등록된 ID이지, 추측한 ISO 코드가 아닙니다. 체코어는 `cz`가 아니라 `cs`입니다. 모드 폴더 이름은 대문자 L을 쓴 `Locales`로 유지하세요. 게임 자체의 `locales/` 리소스 경로는 이것과 별개입니다.

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

`NeoModLoader.General.LM`은 로컬라이즈 도우미입니다. 텍스트가 생성되는 경우나, JSON 더미 대신 모든 걸 `.cs` 파일 하나에 두고 싶을 때 편리합니다.

```csharp Mods/HelloBox/Code/HelloLocale.cs
using NeoModLoader.General;

LM.Get("trait_hello_swift");                            // read in the current language
LM.AddToCurrentLocale("trait_hello_swift", "Swift"); // add to whatever language is loaded now
LM.Add("en", "trait_hello_swift", "Swift");          // add to a specific language
LM.LoadLocale("en", "path/to/Locales/en.json");       // load a json manually (language + path)
LM.LoadLocales("path/to/Locales/lang.csv");          // load a csv manually
LM.ApplyLocale(false);                               // apply. false = don't refresh every text on screen
```

HelloBox에서는 그 파일이 이렇게 생겼습니다:

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

`HelloLocale.Initialize();`를 `Main.cs`에 **가장 먼저**, 다른 모든 것보다 앞에 추가하세요. 그래야 텍스트가 없는 상태로 무언가가 등록되는 일이 없습니다.

**모든 것을 한 번에, 로드할 때** 등록하고 마지막에 `ApplyLocale`을 한 번만 호출하세요. 게임에 없는 키를 요청하면 키 자체가 텍스트로 돌아오고, 키마다 로그에 `missing text` 오류가 하나씩 찍힙니다. 누락된 키로 만든 툴팁은 보기 흉할 뿐 아니라 로그도 소음으로 가득 채웁니다 :PES_UghPing:.

## 실제로 사용되는 주요 로케일 키 규칙

게임이 이 키들을 직접 만들기 때문에 정확히 일치해야 하며, 아니면 아무것도 표시되지 않습니다. 그중 두 개는 "ID와 같음" 규칙을 **따르지 않고**, 사람들이 한 시간씩 날리는 게 바로 이 둘입니다:

| 대상 | 이름 키 | 설명 키 |
| --- | --- | --- |
| 특성 | `trait_<id>` | `trait_<id>_info` |
| 아이템 | 설정했다면 `translation_key`, 아니면 `item_<equipment_subtype or id>` | `<id>_description` (`item_` 접두사 없음) |
| 신의 권능 | `<power_id>` | `<power_id>_description` |
| 권능 탭 | 전달한 `locale_key` | 전달한 설명 키 |
| 액터 태스크 | `task_unit_<task_id>` | - |
| 상태 효과 (status) | 설정한 `locale_id` **필드** | 설정한 `locale_description` **필드** |
| 세계 법칙 (world law) | `<law_id>_title` (접미사 주의) | `<law_id>_description` |

> [!WARNING] ID는 이름이 아닙니다
> 여러분의 ID는 어떤 언어에서든 영원히 `hello_swift`이고, 나머지 코드(와 다른 사람들의 모드)가 참조하는 것이 이것입니다. 바뀌는 건 **로컬라이즈된 텍스트** 쪽입니다. 표시 이름의 오타를 고치려고 ID를 바꾸는 일은 절대 하지 마세요 :PESgn_Stop:.

## LM 없이 게임 API 사용하기

현재 로드된 언어에서만 필요한 값이라면:

```csharp
LocalizedTextManager.add("hello_notice", "Hello from HelloBox", pReplace: true);
string notice = LocalizedTextManager.getText("hello_notice");
```

`add(string pKey, string pTranslation, bool pReplace = false, string pFileName = "", bool pCheckForCharacters = true)`는 현재 텍스트 딕셔너리에 씁니다. `pReplace`가 true가 아니면 기존 키는 그대로 유지됩니다. 키는 내부적으로 `Underscore()`를 거쳐 정규화되므로, 처음부터 밑줄 키를 쓰세요. `getText(string pKey, Text text = null, bool pForceEnglish = false)`는 그 딕셔너리를 읽습니다. 여기서 확인한 소스 기준으로는 `pForceEnglish`가 영어를 선택하는 데 쓰이지 않습니다.

> [!NOTE] 현재 텍스트는 번역 파일이 아닙니다
> 언어를 바꾸면 게임의 텍스트 딕셔너리가 다시 만들어집니다. 언어 전환 이후에도 살아남아야 하는 번역이라면 `Locales`나 `LM.Add`를 쓰세요. 직접 `add`를 호출해도 이미 화면에 있는 텍스트 컴포넌트를 알아서 새로고침해주지는 않습니다.

다음: **[스프라이트 및 리소스](#/nml/sprites-and-resources)**, 또는 화면에 텍스트를 띄우는 **[메시지 및 세계 기록](#/nml/messages-and-world-log)**.
