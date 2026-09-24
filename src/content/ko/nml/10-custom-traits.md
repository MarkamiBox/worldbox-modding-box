---
title: 커스텀 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbstrongminded:
order: 100
---

# 커스텀 특성 :wbstrongminded:

특성(Trait)은 유닛에게 영구적으로 부여되는 라벨입니다: *용감함*, *빠름*, *불멸*. 인스펙터 창에 표시되고, 유닛의 스탯을 변경하며, 유닛이 태어나거나 피격당하거나 죽을 때 코드를 실행할 수 있고, 자식에게 유전될 수도 있습니다.

또한 게임 전체에서 가장 구현하기 쉬운 요소이기도 하여, 모든 모더의 첫 번째 모드가 되는 이유이기도 합니다. 제 경우는 아니었습니다. 제 첫 모드는 다른 사람 모드를 감싼 래퍼였는데, 그것도 나름의 반칙이죠 :trollface:.

## ID에는 항상 고유 접두사를 붙이세요

월드박스의 모든 에셋은 `id`를 키로 하는 단일 평면 리스트에 보관됩니다. 여러분이 `fast`를 등록했는데 다른 모드도 `fast`를 등록한다면, 나중에 등록된 모드가 앞선 모드를 **덮어써 버리며** 콘솔 창에는 아무도 읽지 않는 경고 로그 한 줄만 남게 됩니다.

따라서: `swift`가 아니라 `hello_swift`로 짓습니다. 짧은 모드 이름, 밑줄, 내가 붙인 이름. 이 규칙은 특성, 아이템, 건물 (building), 능력, 상태 이상 등 모든 것에 예외 없이 적용하세요 :aPES4_Noted:.

## 특성(Trait) 정의하기

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // ID를 한곳에 상수로 정의. 다른 모든 파일에서 HelloTraits.SWIFT를 참조하게 만들면,
        // 오타가 났을 때 조용히 씹히는 대신 컴파일 에러가 발생하여 즉시 잡아낼 수 있습니다.
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // 동일한 ID를 두 번 등록하지 마세요. 라이브러리가 에러를 로깅하고 덮어써 버립니다.
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // 바닐라 아이콘. 나중에 커스텀 아이콘으로 교체 가능
                group_id = "physique",              // 특성 도감의 어느 탭에 들어갈지 지정
                rate_birth = 0,                     // 0 = 자연적으로 태어날 때 발생하지 않음
                can_be_given = true,                // 플레이어가 특성 편집기에서 부여 가능
                can_be_removed = true,
                can_be_cured = false
            };

            // add()는 특성을 등록함과 동시에 스탯 블록을 메모리에 할당합니다 (순서 엄수).
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

그리고 `Main.cs`에 한 줄을 추가합니다:

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### 각 필드의 역할

- **`AssetManager.traits`**: 바닐라와 모드를 통틀어 게임 내 모든 액터 특성을 보관하는 라이브러리입니다. `has`, `get`, `add`, `clone`은 앞으로 살펴볼 모든 라이브러리에서 공통으로 사용할 핵심 메서드 네 가지입니다.
- **`path_icon`**: 인스펙터에 표시될 작은 아이콘 이미지 경로입니다. 파일명이 아니라 *에셋 경로*입니다. 자세한 내용은 **[스프라이트 및 리소스](#/nml/sprites-and-resources)**를 확인하세요. 게임이 자체 라이브러리를 빌드할 때만 자동 완성되므로(모드가 로드되기 전에 완료됨), 모드 특성에서는 직접 지정하지 않으면 빈칸으로 남습니다.
- **`needs_to_be_explored`**: 기본값은 `true` 이고, 플레이어가 월드에서 찾기 전까지 지식의 책에서 잠겨 있습니다. `false` 로 하면 처음부터 쓸 수 있습니다. HelloBox는 전부에 켜 두었으니, 만든 걸 찾아다닐 필요가 없습니다.
- **`group_id`**: 특성 도감의 어느 탭에 나타날지 결정합니다. 전체 목록은 아래에 있습니다.
- **`rate_birth`**: 갓 태어난 아기가 이 특성을 자연적으로 달고 나올 확률입니다. `0`은 "특정 이벤트나 코드가 부여해주지 않는 한 나타나지 않음"을 의미합니다.
- **`can_be_given` / `can_be_removed`**: 플레이어가 특성 편집기에서 붙이거나 뗄 수 있는지 여부입니다. 둘 다 기본값은 `true`입니다. 영구적인 특성이나 내 코드 전용 특성으로 만들고 싶다면 `false`로 설정하세요.
- **`base_stats[...]`**: 스탯 보너스입니다. 전체 스탯 이름 목록은 **[스탯 레퍼런스](#/nml/stats)** 페이지에 정리되어 있습니다.

> [!WARNING] 스탯 설정은 무조건 `add()` **다음**에 와야 합니다
> 새로 인스턴스화한 `ActorTrait`에는 스탯 블록이 아직 없습니다. 라이브러리가 `add()` 내부에서 할당해주기 때문입니다. 그 줄 이전에 `base_stats`를 건드리면 월드박스 모딩에서 가장 흔한 오류를 보게 됩니다:
> `NullReferenceException: Object reference not set to an instance of an object`
>
> 상태 이상, 아이템, 건물, 액터도 동일한 규칙이 적용됩니다. 유일한 예외는 내부에서 `add()`를 대신 호출해주는 `clone()`뿐입니다.

> [!TIP] 같은 스위치가 만드는 것 대부분에 있습니다
> `needs_to_be_explored` 는 잠금 해제 가능한 모든 에셋이 공유하는 기반 클래스에 있어서, 액터, 일곱 종류 특성 전부, 아이템, 수식어 (modifier), 월드 법칙에 다 됩니다. 신의 권능 (GodPower), 상태, 건물, 드롭, 구름 (cloud), 타일, 투사체에는 발견 단계 자체가 없습니다 :wbsmirk:.

### 바닐라 특성 그룹

`group_id`는 반드시 실존하는 그룹이어야 하며, 그렇지 않으면 특성이 미아가 되어 어디에도 나타나지 않습니다:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

자신만의 전용 탭을 만들고 싶다면 **[특성 그룹 및 탭](#/nml/trait-groups)**을 확인하세요.

## 텍스트 및 로컬라이제이션

번역을 추가하지 않으면 인게임에서 `trait_hello_swift`라는 날것의 키로 표시되고, 보이는 그대로 전혀 프로답지 않습니다 :pepeclown:. `Locales/ko.json`을 생성하세요:

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

키는 단순한 id가 아닙니다. 특성의 유형별로 고유한 접두사가 붙습니다:

| 특성 유형 | 이름 키 | 툴팁 설명 키 |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

추가 설명이 필요한 특성을 위해 `<prefix>_<id>_info_2`라는 2차 설명 키도 지원합니다.

## 커스텀 아이콘 설정하기

`path_icon`은 경로이며, 모드의 `GameResources/` 폴더 안의 정확한 위치에 PNG 파일을 넣어야 합니다 (문자열에 확장자는 포함하지 않음).

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

특성 아이콘은 작으며, 게임 내에서 약 32x32 크기로 그려집니다. 원한다면 `ui/Icons/hellobox/iconSwift`처럼 전용 하위 폴더를 만들어도 무방하며, 경로 문자열과 일치하기만 하면 됩니다.

나머지 6가지 특성 시스템도 각각 고유한 바닐라 폴더를 가지고 있습니다 (`ui/Icons/culture_traits/`, `religion_traits/`, `clan_traits/` 등). 반드시 그 폴더를 써야 하는 것은 아니지만, 원본 특성들과 나란히 두면 나중에 리소스를 관리하기가 훨씬 수월합니다. 자세한 표는 **[스프라이트 및 리소스](#/nml/sprites-and-resources)**를 확인하세요.

## 특성이 실제로 무언가를 *수행*하게 만들기

스탯은 정적이지만, 특성은 네 가지 주요 시점에 여러분의 코드를 직접 실행할 수 있습니다:

```csharp
// 유닛이 살아있는 동안 몇 초마다 주기적으로 실행
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// 유닛이 사망할 때
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// 유닛이 태어날 때
swift.action_birth = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// 유닛이 피격당할 때
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };
```

네 가지 모두에 적용되는 두 가지 철칙: **가장 먼저 null 검사와 유닛 생존 검사를 수행할 것**, 그리고 아무 작업도 하지 않았다면 `false`를 반환할 것. 이 델리게이트들은 해당 특성을 가진 모든 유닛에 대해 영원히 실행됩니다.

## 반대 특성 및 상호 배제

```csharp
swift.addOpposite("slow");                            // 두 특성은 절대 함께 공존할 수 없음
swift.traits_to_remove_ids = new string[] { "fat" };  // 이 특성을 얻으면 저 특성을 즉시 제거함
```

## 유닛에게 특성 부여하기

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed`는 게임 시작 시 딱 한 번만 읽힙니다
> 새로 태어나는 유닛은 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만드는 풀에서 초기 특성을 뽑습니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 특성에 이 플래그를 켜는 것만으로는 아무것도 바뀌지 않습니다. 여러분의 특성은 그 풀에 절대 들어가지 않으며, 새로 태어난 유닛에게 우연히 부여되는 일도 없습니다. 바닐라와 같은 가중치로 직접 넣어주세요:
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.

## 정상 작동 여부 확인하기

게임을 실행하고, 유닛 창을 열고, 특성 편집기를 연 뒤, `physique` 탭을 확인하세요. 보이지 않나요? 로그를 열어보면 이유가 나와 있으며, 십중팔구 다음 세 가지 중 하나입니다: `can_be_given`이 false이거나, `group_id`가 존재하지 않거나, `path_icon`이 빈 곳을 가리키고 있거나 :wbreally:.

## 나머지 6가지 유형의 특성

액터 특성은 게임에 존재하는 **7가지** 특성 시스템 중 하나일 뿐입니다. 각각 고유한 라이브러리, 그룹, 소유 대상을 가지고 있으며, 모두 이 페이지의 구조를 완벽히 따릅니다. 클래스 이름, 라이브러리, 로케일 접두사만 바뀔 뿐입니다.

| 시스템 | 소유 대상 | 가이드 페이지 |
| --- | --- | --- |
| Actor | 생물 개체 한 마리 | 이 페이지 |
| Culture | 문화 (culture) (소속 도시 전체가 공유) | **[문화 특성](#/nml/culture-traits)** |
| Religion | 종교 (religion) (해당 종교를 믿는 신자 전체) | **[종교 특성](#/nml/religion-traits)** |
| Subspecies | 생물의 아종 (subspecies) | **[아종 특성](#/nml/subspecies-traits)** |
| Clan | 가문 및 혈통 | **[클랜 특성](#/nml/clan-traits)** |
| Language | 언어 (해당 언어를 구사하는 화자 전체) | **[언어 특성](#/nml/language-traits)** |
| Kingdom | 왕국의 국정 방침 | **[왕국 특성](#/nml/kingdom-traits)** |

특성을 작성하기 전에 먼저 소유 대상을 정하세요. "엘프의 활 솜씨가 뛰어나다"는 도시의 확장에 따라 전파되어야 한다면 문화 특성, 번식을 통해 유전되어야 한다면 아종 특성, 특정 개인의 재능이라면 액터 특성입니다. 이 선택을 잘못하는 것은 한 시간 동안 온 세계로 퍼져나가는 멋진 모드와 아무 일도 하지 못하는 모드의 차이를 만듭니다 :PES_ThinkAboutIt:.
