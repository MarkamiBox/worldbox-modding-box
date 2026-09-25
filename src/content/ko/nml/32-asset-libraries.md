---
title: 에셋 라이브러리
group: NML 모딩
subgroup: 고급 기능 및 배포
icon: :wbbrain:
order: 90
---

# 에셋 라이브러리 :wbbrain:

게임 내의 모든 요소(특성, 아이템, 건물, 문명 기술, 종족, 날씨, 신의 권능)는 모두 **에셋 라이브러리(Asset Library)**에 보관됩니다. 여러분이 모드를 통해 게임에 무언가를 추가한다는 것은, 결국 이 라이브러리에 새 에셋을 하나 등록하는 작업에 지나지 않습니다.

## 라이브러리의 구조

각 라이브러리는 `AssetManager`의 정적 필드로 존재하며, 내부 구조는 대단히 단순합니다:

```csharp
public class AssetLibrary<T>
{
    public List<T> list;                   // 표시 순서를 결정하는 일반 리스트
    public Dictionary<string, T> dict;     // ID로 1:1 빠른 조회가 가능한 딕셔너리
}
```

이것이 전부입니다. 둘 다 public으로 열려 있는 리스트와 딕셔너리이며, 모드에서 마음껏 읽고 수정할 수 있습니다. `AssetManager`는 이런 라이브러리를 129개 보유하고 있습니다. 전체 목록은 **[모든 에셋 라이브러리](#/nml/asset-index)** 를 참고하세요.

## 4가지 핵심 메서드

```csharp
AssetManager.traits.has("hello_swift");            // 이 ID가 이미 등록되어 있는가?
AssetManager.traits.get("hello_swift");            // 가져오기 (없으면 null)
AssetManager.traits.add(myTrait);                  // 새 에셋 등록하기
AssetManager.traits.clone("hello_new", "strong");   // 기존 에셋을 복제하고 복제본 자동 등록까지 완료
```

### `has(id)`

ID가 이미 등록되어 있다면 `true`를 반환합니다. **여러분이 작성하는 모든 `Initialize()` 메서드의 첫 줄은 항상 이 검사로 시작해야 합니다**:

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

이 가드가 없으면 모드가 다시 로드될 때 모든 에셋이 중복 등록됩니다.

### `get(id)`

메모리에 상주하는 실제 에셋 객체를 반환하며, 해당 ID가 없으면 `null`을 반환합니다. 예외를 던지지 **않으므로**, null 체크를 하지 않으면 실제 실수한 지점에서 한참 떨어진 곳에서 크래시가 발생합니다:

```csharp
ActorTrait strong = AssetManager.traits.get("strong");
if (strong == null) return;   // 언제나. 예외 없이 매번.
```

`get`이 *살아있는 실제 객체*를 반환한다는 점은 이 문서에서 가장 유용한 특성입니다. 즉, 바닐라 콘텐츠를 완전히 새로 교체하지 않고도 특정 속성만 수정할 수 있음을 의미합니다:

```csharp
// 바닐라 드래곤의 다른 특성은 건드리지 않고 체력만 강화하기
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

새 에셋을 등록합니다. 그 안에서 알아 둬야 할 일이 세 가지 일어납니다:

1. **ID가 이미 쓰이고 있으면 기존 에셋이 제거되고 내 에셋이 그 자리를 차지합니다.** 로그에는 이렇게 남습니다:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   한 모드가 다른 모드를 조용히 망가뜨리는 방법이 바로 이겁니다. ID에 접두사를 붙이세요.
2. 에셋에서 `create()`가 실행됩니다.
3. **라이브러리가 `base_stats`를 할당합니다** (에셋에 있다면 `base_stats_meta`도). 이 가이드 곳곳에서 "스탯은 `add()` 다음에"라는 규칙이 나오는 이유입니다.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- 스탯 블록을 할당
swift.base_stats["speed"] = 20f;       // <- 이 줄 다음에만 안전
```

순서를 틀리면 WorldBox 모딩에서 가장 흔한 크래시가 납니다:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

`sourceId`의 모든 직렬화 가능한 필드를 새 객체에 복사하고, `newId`를 부여한 뒤, **그 객체에 대해 `add()`를 호출합니다**. 복사본을 반환합니다.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // 원하는 필드만 수정
shrine.base_stats["health"] = 200;         // add()가 실행되었으므로 이미 할당되어 있음
```

> [!WARNING] clone() 이후에 add()를 호출하지 마세요
> 두 번째 `add()`는 첫 번째 복사본을 제거하고, `duplicate asset overwriting...` 로그를 남기며 다시 추가합니다. 작동은 하지만 로그가 지저분해져 실제 오류를 찾기 어려워집니다.

10개 이상의 필드를 가진 것(건물, 액터, 아이템, 타일)을 만들 때 클론은 가장 올바른 기본 선택입니다. 이미 작동이 검증된 구성을 그대로 물려받으므로, 여러분이 변경할 필드만 이해하면 됩니다.

## 템플릿 (Templates)

라이브러리는 ID가 `$` 또는 `_`로 시작하는 미완성 에셋을 보관합니다. 이들은 `dict`에 등록되지만 `list`에는 포함되지 않으므로 게임 내에 절대 나타나지 않으며, 순수하게 클론 용도로만 존재합니다.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

템플릿은 완성된 에셋보다 거의 항상 더 나은 클론 원본입니다. 기증자의 고유 정체성과 내부 연결까지 함께 물려받지 않기 때문입니다. 유일한 예외는 아트입니다: `human`을 클론하면 인간 스프라이트를 얻게 되며, 실제로 볼 수 있는 생명체는 볼 수 없는 완벽한 생명체보다 낫습니다 :PES4_AlrightThen:.

## 존재하는 에셋 목록 확인하기

"어떤 ID에서 클론할 수 있는가"에 답하는 가장 빠른 방법은 출력해 보는 것입니다:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

두 줄이면 더 이상 ID를 추측할 필요가 없습니다. `list`는 템플릿을 제외하며, `dict.Keys`는 템플릿을 포함합니다.

## 표시 순서 재배치

`list`는 평범한 `List<T>`이며, 게임은 리스트 순서대로 그룹과 카테고리를 렌더링합니다. 따라서 내 에셋을 원하는 정확한 위치에 끼워 넣을 수 있습니다:

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## 코드가 실행되는 시점

게임은 시작할 때 129개 라이브러리를 모두 만들고, 그다음 `post_init()`을 실행한 **뒤에야** NML이 여러분의 모드를 불러옵니다. 저를 포함해 사람들이 계속 걸려 넘어지는 결과가 두 가지 있습니다:

- **라이브러리가 `post_init`에서 자동으로 하는 일은 이미 끝났습니다.** 예를 들어 액터 특성은 거기서 기본 `path_icon`을 받습니다. 여러분의 특성은 받지 못합니다, 그때는 아직 존재하지 않았으니까요. 직접 설정하세요.
- **여러분의 `OnModLoad`가 실행될 때 모든 바닐라 에셋은 이미 존재합니다.** 그래서 `get("human")`도, `clone(..., "human")`도 되고, 바닐라 콘텐츠를 그 자리에서 수정하는 것도 됩니다. 너무 이른 경우는 없습니다.

> [!NOTE] 이 메서드들을 패치해도 바닐라 콘텐츠는 건드리지 않습니다
> `has`, `get`, `add`, `clone`, `post_init`은 모두 게임이 시작되는 동안, NML이 모드를 하나라도 불러오기 전에 129개 라이브러리에서 실행됩니다. 그중 어느 것에 Harmony 패치를 걸어도 여러분의 모드가 로드된 *뒤의* 호출에만 영향을 줍니다. 그때 이미 끝난 바닐라 등록은 절대 건드리지 않습니다. 바닐라 콘텐츠를 바꾸고 싶나요? 이 페이지의 나머지 부분처럼 나중에 `get()`으로 바꾸세요.

## 저지르기 쉬운 3가지 실수

셋 다 컴파일되고, 셋 다 그럴듯해 보이며, 저 역시 셋 다 직접 겪어보았습니다.

### 바닐라 에셋을 삭제하고 내 버전으로 교체하기

```csharp
// don't
AssetManager.traits.list.RemoveAll(a => a.id == "strong");
AssetManager.traits.add(myStrong);
```

`RemoveAll`은 `list`만 건드립니다. `dict`에는 여전히 예전 `strong`이 남아 있으므로, `add()`는 중복을 감지하고 `duplicate asset - overwriting...` 로그를 남기며 어쨌든 덮어씁니다. 즉 첫 번째 줄은 아무런 쓸모가 없었던 셈입니다. 진짜 문제는 시작할 때 예전 객체를 가져가 버린 쪽입니다: `WorldLawLibrary.world_law_hunger` 같은 정적 필드나, 여러분의 모드가 존재하기 전에 `linkAssets()`에서 여기에 연결된 모든 에셋들입니다. 이들은 계속 예전 객체를 유지합니다. 결국 동일한 ID를 가진 두 개의 에셋이 존재하게 되며, 게임이 어느 쪽을 사용할지는 누가 무엇을 캐시했느냐에 따라 달라집니다 :PESgn_Really:.

바닐라 콘텐츠를 바꾸고 싶다면, 이미 존재하는 객체 자체를 수정하세요:

```csharp
ActorTrait strong = AssetManager.traits.get("strong");
if (strong == null) return;
strong.base_stats["damage"] = 10f;   // same object, every cached reference sees it
```

### 클론을 수정하다가 원본까지 바꿔버리기

`clone()`은 리스트를 새 리스트로 복사하고 `ICloneable`(`base_stats` 등)인 항목을 복제합니다. 그 외의 모든 객체는 **참조**로 복사됩니다. 예를 들어 `MapGenTemplate.values`는 일반 클래스입니다: `continent`를 복제한 뒤 복사본의 `values`에서 플래그 하나를 바꾸면 바닐라 대륙도 함께 바뀝니다. 필드가 객체를 담고 있다면, 수정하기 전에 복제본에 새 객체를 할당하세요. 구체적인 사례는 **[맵 생성](#/nml/map-generation)** 에 나와 있습니다.

### 다른 모드가 추가한 에셋을 클론하기

`clone("hello_new", "their_id")`는 아무런 검사 없이 `dict[pFrom]`을 실행합니다. 상대 모드가 아직 `Initialize()`를 실행하지 않았거나 설치되지 않은 경우, `KeyNotFoundException`이 발생하며 그 줄에서 `OnModLoad` 전체가 중단됩니다. 폴더 정렬 순서에 의존하지 마세요. 의존성을 선언하고, 복제하기 전에 여전히 에셋이 존재하는지 확인하세요. 상대 모드가 ID를 변경했을 수도 있습니다.

```csharp
if (!AssetManager.buildings.has("their_id")) return;   // not there (yet): skip, don't crash
AssetManager.buildings.clone("hello_new", "their_id");
```

다른 모드를 감지하고 로드 순서를 올바르게 처리하는 방법은 **[다른 모드와 협력하기](#/nml/other-mods)** 에 나와 있습니다.

## 이후 모든 문서가 따르는 공통 패턴

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. 중복 등록 방지
            if (AssetManager.<library>.has(ID)) return;

            // 2. 유사한 대상이 있으면 클론, 없으면 신규 생성
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. 원하는 필드만 수정
            asset.some_field = true;

            // 4. 스탯 설정은 반드시 마지막에
            asset.base_stats["damage"] = 10;
        }
    }
}
```

이 가이드의 모든 에셋 문서는 명사만 다를 뿐 정확히 이 골격을 따릅니다. 갈피를 못 잡겠다면 언제든 이 페이지로 돌아오세요 :PESgn_GoOn:.

## 책상 위에 붙여둘 4가지 황금률

1. **`has()` 먼저.** 동일한 ID를 절대 두 번 등록하지 마세요.
2. **`clone()`은 이미 `add()`를 포함합니다.** 둘을 연달아 호출하지 마세요.
3. **`base_stats`는 `add()` 이후에만 존재합니다.** 스탯 대입은 무조건 마지막에.
4. **ID에 접두사를 붙이세요.** `swift`가 아니라 `hello_swift`입니다. 모든 모드가 공유하는 단 하나의 전역 네임스페이스입니다.
