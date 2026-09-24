---
title: 게임 코드 읽기 (dnSpy)
group: 개요
subgroup: 외부 도구 및 설정
icon: :wbnerd:
order: 7
---

# 게임 코드 읽기 :wbnerd:

WorldBox 모딩에 관한 모든 해답은 이미 적혀 있습니다. 바로 게임 자체의 코드 속에 말이죠 :wbbru:. **dnSpy**(또는 **ILSpy**)는 컴파일된 게임 바이너리를 사람이 읽을 수 있는 C# 코드로 디컴파일해 주어, 메서드 이름이 정확히 무엇인지, 어떤 매개변수를 받는지, 그리고 실제로 어떤 동작을 수행하는지 완벽하게 파악할 수 있게 해줍니다.

이것이야말로 "남의 코드 조각 무작정 긁어다 붙이기"에서 "진짜 모딩"으로 도약하는 가장 결정적인 순간입니다 :3074-woah:.

## 게임 파일 열기

1. [**dnSpy**](https://github.com/dnSpyEx/dnSpy/releases)(또는 [**ILSpy**](https://github.com/icsharpcode/ILSpy/releases) - 원리는 같고 버튼 위치만 다릅니다)를 다운로드합니다.
2. 다음 파일을 엽니다:

```text
worldbox/worldbox_Data/Managed/Assembly-CSharp.dll
```

이 파일 하나에 게임 전체의 모든 코드가 고스란히 담겨 있습니다. 왼쪽 창에 `Actor`, `AssetManager`, `GodPower`, `ScrollWindow` 등 모든 클래스의 트리 계층이 펼쳐집니다.

## 일상적으로 하게 될 4가지 핵심 작업

### 1. 클래스 찾아보기

`Ctrl+Shift+K`로 타입을 검색합니다. `ActorTrait`를 입력해 열면, 설정할 수 있는 모든 필드가 타입과 기본값과 함께 보입니다:

```csharp Assembly-CSharp / ActorTrait
public string path_icon;
public string group_id;
public int rate_birth;
public bool can_be_cured;
```

그 목록이 바로 **[커스텀 특성](#/nml/custom-traits)** 페이지의 문서*입니다*. **타입**도 읽으세요: `rate_birth`는 `int`이므로 `rate_birth = 0.5f`는 컴파일되지 않습니다. `ItemAsset`, `BuildingAsset`, `StatusAsset` 등 무엇이든 같은 방법이 통합니다.

### 2. 메서드의 실제 시그니처 확인하기

메서드 이름을 감으로 때려맞추려다가는 컴파일 에러 하나 잡느라 1시간을 낭비하기 십상입니다. 그냥 직접 찾아보세요. `Actor` 클래스에서 `addTrait`를 검색하면 다음과 같이 나옵니다:

```csharp Assembly-CSharp / Actor
public bool addTrait(string pTraitID, bool pRemoveOpposites = false)
public bool hasTrait(string pTraitID)
public void removeTrait(string pTraitID)
```

이제 이 메서드가 문자열을 인수로 받고, bool을 반환하며, 두 번째 선택적 인수가 존재한다는 사실을 정확히 알 수 있습니다.

### 3. 게임 본래 코드가 어떻게 구현했는지 엿보기

이게 진짜 핵심 비기입니다. 제대로 작동하는 세계 법칙을 하나 만들고 싶나요? `WorldLawLibrary`를 찾아 `init()` 메서드를 열고, 개발자가 직접 작성한 코드를 읽어보세요:

```csharp Assembly-CSharp / WorldLawLibrary.init()
world_law_mutant_box = add(new WorldLawAsset
{
    id = "world_law_mutant_box",
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_mutant_box",
    default_state = false
});
```

이 형태를 그대로 복사한 뒤 id와 아이콘 경로만 바꾸면 나만의 법칙이 완성됩니다. 게임 속 모든 `*Library.init()`은 해당 에셋 유형에 대한 완벽한 무료 튜토리얼입니다.

### 4. 등록된 모든 ID 찾아내기

ID는 단순한 문자열이며, 오타가 나면 게임은 아무런 오류도 띄우지 않고 조용히 실패해 버립니다. 모든 ID는 각 `init()` 메서드에 모여 있습니다: `TileLibrary.init()`에는 모든 지형 타일 ID, `ItemLibrary.init()`에는 모든 무기 ID, `ActorAssetLibrary.init()`에는 모든 생명체 ID가 총망라되어 있습니다.

## public, internal 그리고 모더의 관계

코드를 읽다 보면 메서드 앞에 붙은 세 가지 키워드를 보게 됩니다:

| 단어 | 모더에게 미치는 영향 |
| --- | --- |
| `public` | 언제든 자유롭게 직접 호출할 수 있습니다. |
| `internal` | **publicized**(공개화)된 `Assembly-CSharp.dll`을 참조해 빌드할 때만 호출 가능합니다 |
| `private` | 직접 호출할 수 없습니다. 이를 호출하는 public 메서드를 찾거나, 패치를 적용해야 합니다 (**[Harmony 패치](#/nml/harmony-patches)** 참고) |

"publicized" DLL이란 내부의 모든 멤버를 강제로 public으로 변경한 복사본을 말합니다. 대부분의 WorldBox 모더들이 이를 사용하며, 그렇기 때문에 `actor.getHit(...)` 같은 코드가 그들에게는 잘만 컴파일되고 본인에게는 에러를 뿜는 것입니다. 코드가 도무지 컴파일되지 않는데 dnSpy에서 `internal`로 표시된다면, 바로 이 때문입니다.

> [!TIP] 코드 작성 중에는 항상 띄워두기
> "게임 코드 전체를 정독하라"는 뜻이 절대 아닙니다. 그런 무모한 짓을 하는 사람은 아무도 없습니다. 코드 에디터 옆에 띄워두고 필요한 이름이 나올 때마다 그때그때 확인하세요. 여기서 2초 확인하는 것이 영문 모를 컴파일 에러로 20분 동안 고통받는 것보다 백배 낫습니다 :PES_ThumbsUp:.

메서드 이름과 시그니처만 빠르게 확인하고 싶을 때는 이 사이트의 **[메서드 검색](#/tools/methods)** 기능을 쓰는 편이 훨씬 빠릅니다. 게임의 모든 메서드가 등록되어 있고 `internal` 여부도 미리 다 표시되어 있으니까요. 메서드가 실제로 *무슨 일*을 하는지 그 내부 구현을 직접 뜯어봐야 할 때 dnSpy로 돌아오세요. 그것만큼은 어떤 색인 도구로도 대체할 수 없습니다.
