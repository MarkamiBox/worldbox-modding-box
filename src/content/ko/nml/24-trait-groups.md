---
title: 특성 그룹 및 탭
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbfamilies:
order: 102
---

# 특성 그룹 및 탭 :wbfamilies:

모든 특성은 특정 **그룹**에 속하며, 이 그룹이 특성 책에서 탭을 렌더링합니다. 여섯 개의 특성을 만들어 모두 `miscellaneous`에 던져 넣으면 아무도 스크롤하지 않는 목록 속에 묻혀 사라집니다.

자신만의 탭을 만드는 데는 단 네 줄이면 충분합니다.

## 그룹이란 무엇인가

그룹은 게임 전체에서 가장 작은 에셋인 `BaseCategoryAsset`입니다:

| 필드 | 역할 |
| --- | --- |
| `id` | 특성의 `group_id`가 가리키는 대상 |
| `name` | 탭 라벨의 **현지화 키**. 텍스트 원본이 아님 |
| `color` | 16진수 색상 문자열. 탭과 소속 특성들을 색칠함 |
| `show_counter` | 탭에 "3 / 12" 형태의 카운터를 표시할지 여부. 기본값 `true` |

## 나만의 탭 만들기

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // 텍스트가 아닌 로케일 키
                color = "#7FE7C4"
            });
        }
    }
}
```

특성이 이 그룹을 가리키도록 설정합니다:

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

그리고 탭 이름을 지정합니다:

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] 그룹을 특성보다 먼저 등록할 것
> 아직 존재하지 않는 그룹을 `group_id`로 가리키는 특성은 그려질 위치를 찾지 못합니다. `OnModLoad`에서 `HelloGroups.Initialize()`는 반드시 `HelloTraits.Initialize()`보다 앞에 실행되어야 합니다.

## 바닐라 액터 특성 그룹

자신만의 탭이 필요하지 않다면 다음 중 하나를 사용하세요:

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## 탭이 표시되는 위치

그룹은 `list` 순서대로 그려지며, `add()`는 가장 뒤쪽에 추가합니다. 관련된 탭 옆에 배치하려면 등록 후 순서를 이동하세요:

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

모든 라이브러리에서 `list`는 평범한 `List<T>`이므로, 이 방법은 어떤 라이브러리에서든 동일하게 작동합니다. **[에셋 라이브러리](#/nml/asset-libraries)** 를 확인하세요.

## 바닐라 그룹 이름 또는 색상 변경하기

기존 그룹을 변경하기 위해 새 그룹을 추가할 필요는 없습니다. `get()`을 호출하면 활성 객체를 직접 가져옵니다:

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // 자신만의 로케일 키
    fun.color = "#FFB35E";
}
```

바닐라 그룹을 직접 수정하면 해당 그룹을 참조하는 모든 바닐라 특성이 정상 작동하고 기존 세이브 파일도 그대로 유지됩니다. 그룹을 교체해버리면 둘 다 망가집니다 :PES_NoSign:.

## 나머지 6개의 그룹 라이브러리

액터 특성은 총 7가지 특성 시스템 중 하나일 뿐이며, 각 시스템은 고유한 그룹 클래스를 관리하는 전용 그룹 라이브러리를 가집니다. 본 페이지의 코드는 모든 시스템에서 완전히 동일하며, 단지 두 이름만 바뀝니다:

| 특성 시스템 | 그룹 라이브러리 | 그룹 클래스 | 페이지 |
| --- | --- | --- | --- |
| 액터 | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | 본 페이지 |
| 문화 | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[문화 특성](#/nml/culture-traits)** |
| 종교 | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[종교 특성](#/nml/religion-traits)** |
| 아종 | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[아종 특성](#/nml/subspecies-traits)** |
| 가문 | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[가문 특성](#/nml/clan-traits)** |
| 언어 | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[언어 특성](#/nml/language-traits)** |
| 왕국 | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[왕국 특성](#/nml/kingdom-traits)** |

장비 역시 다른 이름 아래 동일한 개념을 사용합니다. **[아이템 그룹 및 탭](#/nml/item-groups)** 을 확인하세요.

> [!TIP] 여섯 개가 아닌 하나의 탭으로
> 규모가 큰 모드를 만들다 보면 기능마다 그룹을 따로 만들고 싶어집니다. 참으세요. 특성 책은 이미 빽빽합니다. 플레이어는 당신의 모드 이름이 적힌 하나의 탭은 쉽게 찾겠지만, 내부 시스템 이름으로 도배된 여섯 개의 탭은 결코 찾아보지 않습니다.
