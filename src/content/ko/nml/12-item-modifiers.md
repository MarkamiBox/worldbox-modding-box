---
title: 무기 마법부여
group: 게임 콘텐츠
subgroup: 아이템 및 장비
icon: :wbmagehrm:
order: 122
---

# 무기 마법부여 :wbmagehrm:

좋은 검에 붙어 있는 작은 초록색 텍스트들을 보셨을 것입니다: *"+3 공격력"*, *"불타는"*. 이것들은 **아이템 모디파이어(마법부여)**이며, 한 번 만들어두기만 하면 게임이 알아서 드롭되는 무기에 확률적으로 굴려주기 때문에 파밍을 흥미진진하게 만드는 가장 빠른 지름길입니다.

## 쉬운 방법: NML Creator 활용하기

바닐라의 `ItemAsset`은 하나의 클래스가 7가지 역할을 동시에 수행하며, 목적에 따라 각 필드의 의미가 완전히 달라집니다. NML은 안전하고 직관적인 기능들을 `ItemAssetCreator`에 모아두었으며, 모디파이어의 경우 등록까지 자동으로 대신 처리해 줍니다:

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```
> [!WARNING] 등록만으로는 부족하다
> `add()` 는 라이브러리의 `list` 에 넣을 뿐이고, 생성기가 읽는 건 `list` 가 아니라 `pools` 입니다. 그 pools 는 로드 중에 `linkAssets()` 에서 딱 한 번 채워집니다. `list` 에만 있는 수식어는 존재하고 이름도 있지만, 어디에도 붙지 않습니다 :wbfacepalm:.



`Main.cs`에 `HelloModifiers.Initialize();`를 추가하면, 그때부터 게임이 생성되는 무기에 "hello_sharp"를 무작위로 부여할 수 있게 됩니다.

### 핵심 인수 목록

| 인자 | 설명 |
| --- | --- |
| `id` | 고유 식별자 |
| `mod_type` | 계열(패밀리). 동일한 타입의 두 모디파이어는 절대 동시에 붙지 않으며, `mod_rank`가 높은 쪽이 채택됨 |
| `mod_rank` | 계열 내의 등급 레벨. 무기의 가치 평가 점수도 함께 높여줌 |
| `translation_key` | 플레이어가 보게 될 초록색 텍스트의 로케일 키 |
| `rarity` | 등장 빈도. 숫자가 클수록 더 흔하게 뜸 |
| `base_stats` | 추가되는 스탯 보너스 |
| `quality` | 이 모디파이어가 붙을 수 있는 최소 무기 품질 |
| `equipment_value` | AI가 평가하는 추가 장비 점수 |

## 실제로 효과를 발동시키기

단순 스탯 증가도 좋지만, 모디파이어는 코드를 직접 실행할 수도 있습니다. `action_attack_target`은 해당 무기로 공격을 적중시킬 때마다 호출됩니다:

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

이제 "hello_burning" 옵션이 붙은 모든 무기는 적을 타격할 때마다 바닥에 불을 지르게 됩니다. 단 열 줄의 코드로 타 모드의 무기를 포함한 게임 내 모든 무기에 적용됩니다 :wbfireskull:.

## 텍스트 및 로컬라이제이션

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

`translation_key`는 아이템 툴팁에 표시되는 문구이므로, 스탯 옆에 깔끔하게 한 줄로 들어가도록 짧게 작성하세요.

> [!TIP] 무기보다 마법부여를 먼저 만드세요
> 새로운 무기를 만드는 것은 큰 작업입니다(스프라이트, 애니메이션, 재질 설정). 반면 새로운 모디파이어는 스무 줄이면 만들 수 있고, 게임 내에서 생성되는 **모든** 무기에 자동으로 적용됩니다. 게임을 빠르게 바꾸고 싶다면 여기서 시작하세요 :PES_Stonks:.
