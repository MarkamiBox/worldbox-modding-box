---
title: 아이템 그룹 및 탭
group: 게임 콘텐츠
subgroup: 아이템 및 장비
icon: :wbgold:
order: 124
---

# 아이템 그룹 및 탭 :wbgold:

아이템 그룹은 장비 창의 카테고리입니다(투구, 검, 부적 등). 이는 특성 탭을 그리는 것과 완전히 동일한 경량 `BaseCategoryAsset` 이며(**[특성 그룹 및 탭](#/nml/trait-groups)** 참조), `AssetManager.item_groups` 에 상주합니다.

결정적인 차이점은 아이템 그룹이 **풀(Pool)**을 관리한다는 점이며, 이 풀을 누락하는 것이 모드 충돌의 가장 주된 원인입니다 :PESgn_Yikes:.

## 바닐라 그룹

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## 나만의 카테고리 만들기

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

| 필드 | 역할 |
| --- | --- |
| `id` | 아이템의 `group_id` 가 참조하는 대상 |
| `name` | 탭 라벨로 사용할 로컬라이제이션 키 |
| `color` | 카테고리를 물들일 16진수 색상 코드 |
| `show_counter` | 탭에 아이템 개수를 표시할지 여부. 기본값 `true` |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## 풀(Pool)

게임은 그룹마다 장비 바구니를 유지 관리하며, 자체 라이브러리가 로드되는 동안 이 바구니들을 채웁니다. 즉, **여러분의 모드가 존재하기도 전**의 시점입니다. 갓 생성된 신규 그룹에는 바구니가 존재하지 않으므로, 이를 처음 호출하는 코드는 즉시 예외를 발생시킵니다:

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

아이템을 등록하기 전에 그룹당 한 번씩 수동으로 풀을 생성해 주세요:

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` 은 그룹의 모든 장비입니다. `_unlocked` 은 생성기가 현재 시점에 추첨할 수 있는 장비 목록입니다. 두 풀 모두 반드시 존재해야 합니다.

## 그룹에 아이템 등록하기

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // 어떤 착용 슬롯에 들어가는지
relic.equipment_subtype = "hello_relic";       // 문화 특성이 선호도를 판별하는 기준
```

혼동하기 쉬운 세 가지 개별 개념:

| | |
| --- | --- |
| `group_id` | 창의 어떤 **탭** 아래에 나타날지 |
| `equipment_type` | 신체의 어떤 **슬롯**에 장착되는지: `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | 어떤 **무기 분류**인지: `sword`, `axe`, `bow`… 문화 특성이 선호하는 대상 |

새로운 그룹을 만든다고 해서 새로운 장비 슬롯이 생기는 것은 **아닙니다**. `EquipmentType` 은 게임 어셈블리에 고정된 열거형이므로, 여러분의 성물(Relic)은 여전히 부적 슬롯을 공유하면서 창 안에서 별도의 전용 선반을 얻게 될 뿐입니다.

## 카테고리가 표시되는 위치

그룹은 내부 `list` 순서대로 렌더링되며, `add()` 는 맨 뒤에 배치합니다. 인접한 카테고리 옆으로 순서를 조정하세요:

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## 바닐라 카테고리 이름 변경하기

`get()` 은 활성화된 인스턴스를 반환하므로 새 그룹을 추가하는 대신 바닐라 카테고리를 리모델링할 수 있습니다:

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // 나만의 로케일 키
    helmet.color = "#BAD0FF";
}
```

바닐라의 모든 투구는 계속해서 `helmet` 을 가리키므로 아무것도 망가지지 않고 기존 세이브 파일도 온전히 불러와집니다. 그룹 자체를 교체해 버리면 기존 투구들이 전부 고아가 되어버립니다 :aPES2_HmmmmApprove:.

> [!TIP] 슬롯은 재사용하고, 선반 이름만 바꾸세요
> 대다수의 "신규 장비 타입" 모드는 실질적으로 "기존 슬롯을 유지한 채 다른 선반과 다른 이름을 부여하는" 방식입니다. 이 방식은 단 4줄이면 충분하며 세이브를 망가뜨리지 않습니다. 완전히 새로운 슬롯을 만들려면 게임의 `EquipmentType` 열거형을 직접 수정해야 하지만, 이는 불가능합니다.
