---
title: 에셋 라이브러리
group: 게임 콘텐츠
subgroup: 구조 및 스탯
icon: :wbbrain:
order: 90
---

# 에셋 라이브러리 :wbbrain:

이후에 이어지는 문서들을 제대로 이해하려면 먼저 이 문서를 완벽히 파악해야 합니다. WorldBox에 존재하는 모든 요소(특성, 무기, 건물, 타일, 구름, 왕국)는 **라이브러리**에 저장된 **에셋**이며, 게임 내의 모든 라이브러리는 동일한 4개의 메서드를 공유하는 똑같은 클래스 구조를 가집니다.

여기서 작동 원리를 한 번만 깨우치면, 나머지 30여 개 문서의 내용은 전부 "어느 라이브러리의 어느 필드를 수정하는가"로 단순화됩니다.

## 라이브러리란 무엇인가

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // 등록 순서대로 정렬된 모든 에셋
    public Dictionary<string, T> dict;   // ID로 인덱싱된 모든 에셋
}
```

이것이 전부입니다. 둘 다 public으로 열려 있는 리스트와 딕셔너리이며, 모드에서 마음껏 읽고 수정할 수 있습니다. `AssetManager`는 이런 라이브러리를 129개 보유하고 있습니다. 전체 목록은 **[모든 에셋 라이브러리](#/nml/asset-index)** 를 참고하세요.

## 4가지 핵심 메서드

```csharp
AssetManager.traits.has("hello_swift");            // 이 ID가 이미 등록되어 있는가?
AssetManager.traits.get("hello_swift");            // 가져오기 (없으면 null)
AssetManager.traits.add(myTrait);                  // 새 에셋 등록하기
AssetManager.traits.clone("hello_new", "brave");   // 기존 에셋을 복제하고 복제본 자동 등록까지 완료
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
ActorTrait brave = AssetManager.traits.get("brave");
if (brave == null) return;   // 언제나. 예외 없이 매번.
```

`get`이 *살아있는 실제 객체*를 반환한다는 점은 이 문서에서 가장 유용한 특성입니다. 즉, 바닐라 콘텐츠를 완전히 새로 교체하지 않고도 특정 속성만 수정할 수 있음을 의미합니다:

```csharp
// 바닐라 드래곤의 다른 특성은 건드리지 않고 체력만 강화하기
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

새 에셋을 등록합니다. 내부적으로 반드시 숙지해야 할 3가지 작업이 일어납니다:

1. **ID가 이미 선점되어 있다면 기존 에셋이 제거되고 여러분의 에셋이 덮어씌워지며**, 로그에 다음 메시지가 남습니다:
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   이것이 바로 한 모드가 다른 모드를 조용히 망가뜨리는 원인입니다. ID에 항상 고유 접두사를 붙이세요.
2. 에셋의 `create()` 메서드가 실행됩니다.
3. **라이브러리가 `base_stats`(및 에셋에 존재하는 경우 `base_stats_meta`) 메모리를 할당합니다.** 이 가이드의 모든 페이지에서 "스탯 설정은 무조건 `add()` 이후"라고 강조하는 이유가 바로 여기에 있습니다.

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- 여기서 스탯 블록이 할당됨
swift.base_stats["speed"] = 20f;       // <- 이 줄이 지나야 안전하게 접근 가능
```

이 순서를 어기면 WorldBox 모딩에서 가장 흔하게 마주치는 치명적 에러가 발생합니다:

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

`sourceId`의 모든 직렬화 가능한 필드를 완전히 새로운 객체로 복사하고, `newId`를 부여한 다음, **내부적으로 `add()`를 자동 호출합니다.** 그리고 복제된 인스턴스를 반환합니다.

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // 바꾸고자 하는 필드만 수정
shrine.base_stats["health"] = 200;         // add()가 이미 실행되었으므로 안전하게 접근 가능
```

> [!WARNING] `clone()` 직후에 절대로 `add()`를 호출하지 마세요
> `add()`를 한 번 더 호출하면 방금 만든 복제본이 삭제되고, `duplicate asset overwriting...` 로그를 남기며 다시 추가됩니다. 작동은 하지만, 실제 에러를 가리는 로그 공해를 유발합니다.

필드가 10개 이상인 대부분의 요소(건물, 액터, 아이템, 타일 등)를 만들 때는 복제가 가장 안전한 표준 방식입니다. 이미 검증된 정상 구성을 그대로 물려받으므로, 바꾸고 싶은 필드만 이해하면 됩니다.

## 템플릿

라이브러리에는 ID가 `$`나 `_`로 시작하는 반제품 에셋들이 보관되어 있습니다. 이들은 `dict`에는 등록되지만 `list`에서는 의도적으로 제외되어 있어 인게임에 절대 나타나지 않으며, 오직 복제용으로만 존재합니다.

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

완성된 에셋보다 템플릿을 복제 원본으로 삼는 것이 거의 항상 현명합니다. 원본의 잡다한 설정까지 불필요하게 물려받지 않기 때문입니다. 유일한 예외는 그래픽 리소스입니다. `human`을 복제하면 인간 스프라이트를 그대로 얻을 수 있으며, 눈에 보이는 생명체가 완벽하지만 투명한 생명체보다 훨씬 낫기 때문입니다 :PES4_AlrightThen:.

## 존재하는 에셋 목록 출력하기

어떤 ID를 복제할 수 있는지 확인하는 가장 빠른 방법은 콘솔에 직접 출력해보는 것입니다:

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

단 두 줄이면 다시는 ID를 추측하느라 시간을 낭비할 필요가 없습니다. `list`에는 템플릿이 빠져 있지만, `dict.Keys`를 순회하면 템플릿까지 모두 확인할 수 있습니다.

## 표시 순서 재배치

`list`는 평범한 `List<T>`이며, 게임은 이 리스트의 순서대로 그룹과 탭을 렌더링합니다. 따라서 내 에셋을 원하는 정확한 위치에 끼워 넣을 수 있습니다:

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
