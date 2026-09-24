---
title: 자원 및 음식
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbtomato:
order: 182
---

# 자원 및 음식 :wbtomato:

자원이란 도시가 보관하고, 거래하고, 먹거나, 대장간에서 주조하는 모든 대상을 뜻합니다. 밀, 빵, 돌, 미스릴, 뼈, 보석 등이 여기에 해당합니다. 이들은 `AssetManager.resources`에 위치하며, 전체 경제 시스템의 근간을 이룹니다. 농장이 재배하는 것, 제빵사가 굽는 것, 대장장이가 필요로 하는 것, 배고픈 시민이 먹는 것이 모두 자원입니다. 이 경제 상황에선 빵조차 자료 구조입니다 :PES2_Cash:.

## 템플릿으로부터 복제하기

> [!WARNING] `full_sprite_path` 를 넣지 않으면 로더가 죽는다
> `path_gameplay_sprite` 만으로는 절반입니다. 라이브러리는 그걸로 `full_sprite_path` 를 `post_init()` 에서 딱 한 번 만듭니다. 게임 자신이 로드할 때라서, 모드가 등록한 자원은 거기가 `null` 로 남습니다. 그러면 스프라이트 프리로더가 `getSpriteList(null)` 을 불러 로드 전체가 `ArgumentNullException: Value cannot be null. Parameter name: key` 로 죽습니다 :wbfacepalm:.

```csharp Mods/HelloBox/Code/HelloResources.cs
namespace HelloBox
{
    public static class HelloResources
    {
        public const string CAKE = "hello_cake";

        public static void Initialize()
        {
            if (AssetManager.resources.has(CAKE)) return;

            // $TEMPLATE_FOOD$와 $TEMPLATE_STRATEGIC_MINERAL$이 가장 이상적인 두 출발점입니다.
            ResourceAsset cake = AssetManager.resources.clone(CAKE, "$TEMPLATE_FOOD$");

            cake.path_icon = "iconHelloCake";       // inventory icon in GameResources/
            cake.path_gameplay_sprite = "hello_cake";   // in-hand sprite in GameResources/

            // 이건 라이브러리가 post_init()에서 정하는데, 이미 지나갔습니다. 직접 넣으세요.
            cake.full_sprite_path = "items/resources/" + cake.path_gameplay_sprite;   // 유닛이 손에 들고 나르는 스프라이트

            cake.ingredients = new string[] { "wheat", "honey" };
            cake.ingredients_amount = 1;

            cake.restore_nutrition = 140;
            cake.restore_happiness = 25;
            cake.restore_stamina = 15;
            cake.give_experience = 10;

            cake.produce_min = 40;
            cake.maximum = 999;
            cake.trade_bound = 50;
            cake.trade_give = 5;
        }
    }
}
```

## 주요 필드

### 기본 속성

| 필드 | 역할 |
| --- | --- |
| `type` | `ResType.Food`, `Ingredient_Food`, `Ingredient`, `Strategic`, `Currency` |
| `food` | 유닛이 식사로 섭취 가능한지 여부 |
| `wood`, `mineral` | 채집 도구 및 관련 직업 매칭 |
| `path_icon` | 인벤토리와 목록에 표시되는 아이콘 |
| `path_gameplay_sprite` | 운반 시 유닛이 손에 들고 있는 스프라이트 |

### 섭취 및 효과

| 필드 | 역할 |
| --- | --- |
| `restore_nutrition` | 회복되는 허기 수치 |
| `restore_health` | 회복되는 체력(비율) |
| `restore_stamina`, `restore_mana`, `restore_happiness` | 기타 요구치 바 회복량 |
| `give_experience` | 섭취 시 획득하는 경험치 |
| `tastiness`, `favorite_food_chance` | 유닛이 가장 좋아하는 음식으로 선호할 확률 |
| `diet` | 섭취 가능한 생물학적 식성 |
| `eat_action` | 유닛이 섭취했을 때 실행되는 커스텀 코드 |
| `give_trait_id`, `give_status_id`, `give_chance` | 섭취 시 부여되는 특성이나 상태 효과 |

### 생산 및 물류

| 필드 | 역할 |
| --- | --- |
| `ingredients`, `ingredients_amount` | 조리 또는 제작에 필요한 재료 및 소모량 |
| `produce_min` | 1회 생산 작업으로 만들어지는 최소 수량 |
| `mine_rate` | 채굴 및 수확 속도 |
| `drop_max`, `drop_per_mass` | 원천 오브젝트가 파괴될 때 떨어지는 드롭량 |
| `stack_size`, `storage_max`, `maximum` | 운반 및 도시 저장 한도 |
| `supply_give`, `supply_bound_give`, `supply_bound_take` | 군대 보급품 처리 규정 |
| `trade_cost`, `trade_give`, `trade_bound` | 도시 간 교역 특성 |
| `money_cost`, `loot_value` | 화폐 가치 및 전리품 가치 |

## 바닐라 자원 목록

기존 자원을 활용하는 편이 새로운 자원을 등록하는 것보다 훨씬 편리하므로 알아두는 것이 좋습니다:

**음식 및 식재료:** `wheat` `bread` `berries` `bananas` `coconut` `mushrooms` `peppers` `herbs` `fish` `meat` `honey` `lemons` `worms` `pine_cones` `candy` `sushi` `jam` `cider` `ale` `burger` `pie` `tea` `crystal_salt` `desert_berries` `evil_beets` `snow_cucumbers` `celestial_avocado`

**전략 자원 및 기타:** `wood` `stone` `common_metals` `silver` `mythril` `adamantine` `gems` `bones` `leather` `dragon_scales` `fertilizer` `gold`

## 나만의 스프라이트 등록하기

자원은 두 개의 그래픽을 필요로 하며, 이들은 **완전히 다른 방식**으로 경로를 찾습니다. 많은 모더들이 여기서 실수를 범합니다: 여러분도 한 번은 당할 겁니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    ├── iconHelloCake.png              <- 인벤토리 아이콘 (루트 디렉토리)
    └── items/resources/
        └── hello_cake/hello_cake_0.png             <- 유닛이 손에 들고 나르는 이미지
```

```csharp
cake.path_icon = "iconHelloCake";        // 작성한 이름 그대로 로드됨
cake.path_gameplay_sprite = "hello_cake";   // 자동으로 items/resources/hello_cake로 확장됨
```

`path_icon`은 일반적인 경로이며, 바닐라에서는 단순 파일명만 기재하므로 해당 파일은 `GameResources/`의 루트에 위치합니다. 반면 `path_gameplay_sprite`는 게임 내부에서 `items/resources/`를 자동으로 접두사로 붙여줍니다. 따라서 경로에 폴더명까지 적으면 `items/resources/items/resources/...`를 찾으려 하므로 스프라이트가 나타나지 않습니다.

## 자원을 세상에 연결하기

자원은 무언가가 그것을 생산하지 않으면 아무런 쓸모가 없습니다. 연결되는 3가지 핵심 지점:

```csharp
// 1. 크리처가 도축되거나 사망할 때 드롭.
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 2. 건물을 수확할 때 산출.
BuildingAsset tree = AssetManager.buildings.get("hello_tree");
tree.addResource("wood", 3, pNewList: true);

// 3. 문화가 도시에서 생산.
asset.production = new string[] { "bread", "jam", "hello_cake" };
```

첫 번째 호출의 `pNewList: true`는 "도너의 기존 목록에 추가하지 않고 새로운 목록을 시작한다"는 의미입니다. 클론 후 이를 빠뜨리면 당신의 크리처는 원본의 드롭 자원과 당신의 자원을 한꺼번에 떨어뜨리게 됩니다.

## 재료(Material)는 자원이 아닙니다

장비의 **재료**(철, 강철, 미스릴)는 재료 라이브러리의 `ItemAsset`이지 `ResourceAsset`이 아닙니다. 비록 그 재료를 만드는 데 자원이 소모된다 하더라도 말입니다. 이는 게임의 명명 규칙에서 가장 혼란스러운 부분 중 하나입니다. **[커스텀 아이템](#/nml/custom-items)** 을 참고하세요.

둘 사이를 잇는 다리는 재료 에셋에 정의된 `cost_resources`이며, 이곳에 필요한 자원 ID와 소모량이 지정됩니다.

> [!TIP] 재료가 아니라 레시피를 추가하세요
> 새로운 *식재료*를 추가하려면 공급처가 필요합니다. 재배하는 식물, 자생하는 바이옴, 채집하는 직무까지 모두 구현해야 합니다. 반면 새로운 *레시피*는 이미 존재하는 재료들만 지정하면 기존 제빵소와 교역로에 즉시 녹아듭니다. 전자는 일주일이 걸리지만 후자는 반나절이면 충분합니다 :PES_ChillPill:.
