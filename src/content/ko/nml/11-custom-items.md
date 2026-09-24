---
title: 커스텀 아이템
group: 게임 콘텐츠
subgroup: 아이템 및 장비
icon: :wbcrystalsword:
order: 120
---

# 커스텀 아이템 :wbcrystalsword:

무기, 갑옷, 반지, 목걸이는 모두 `AssetManager.items` 라이브러리에 `EquipmentAsset`이라는 클래스로 저장됩니다.

가장 먼저 이해해야 할 핵심은, **런타임에 재질을 골라 끼울 수 있는 단일 "검" 아이템 같은 것은 존재하지 않는다**는 사실입니다. 게임 안에는 `sword_wood`, `sword_stone`, `sword_copper`, `sword_bronze`, `sword_silver`, `sword_iron`, `sword_steel`, `sword_mythril`, `sword_adamantine`이 개별적으로 존재합니다. 비용, 능력치 (stats), `material` 문자열이 제각각 다른 9개의 완전한 별개 에셋입니다. 모든 갑옷 부위, 모든 활, 모든 목걸이도 마찬가지입니다.

그렇기 때문에 복제(`clone`)는 여기서 단순히 편한 방법이 아니라, 유일하게 제정신을 유지할 수 있는 방법입니다.

## 템플릿 살펴보기

`$` 기호로 시작하는 ID는 템플릿 에셋이며, 특정 무기군 전체의 표준적인 구조를 미리 갖추고 있습니다:

`$equipment` · `$weapon` · `$melee` · `$range` · `$sword` · `$axe` · `$hammer` · `$spear` · `$bow` · `$helmet` · `$armor` · `$boots` · `$ring` · `$amulet` · `$accessory`

`$sword`는 이미 `equipment_subtype`, `is_pool_weapon`, `pool_rate`, 베기 애니메이션, 이름 템플릿, `group_id`를 전부 설정해 두었습니다. 이것들을 그대로 가져다 쓰면 됩니다.

## 무기 아이템 만들기

> [!WARNING] 스프라이트 경로 없는 무기는 로더를 죽인다
> 풀 무기에는 게임이 `path_gameplay_sprite`를 `items/weapons/w_<id>`로, `path_icon`을 `ui/Icons/items/icon_<id>`로 채웁니다. 그 일은 게임 자신의 로드 중 `post_init()`에서 일어나므로, 당신의 무기는 아직 목록에 없고 두 필드는 `null`로 남습니다. 그러면 프리로더가 `getSpriteList(null)`을 불러 로드 전체가 `ArgumentNullException: Value cannot be null. Parameter name: key`로 죽습니다 :wbfacepalm:.
>
> 둘 다 직접 넣으세요. `GameResources/` 의 자기 파일을 가리키거나, 나머지를 시험하는 동안은 바닐라 것을 빌려 쓰세요.

```csharp Mods/HelloBox/Code/HelloItems.cs
namespace HelloBox
{
    public static class HelloItems
    {
        public const string EMBER_BLADE = "hello_sword_ember";

        public static void Initialize()
        {
            if (AssetManager.items.has(EMBER_BLADE)) return;

            // clone() copies every field, renames it, and registers it. No add() afterwards.
            EquipmentAsset blade = AssetManager.items.clone(EMBER_BLADE, "$sword");

            blade.material = "ember";              // the material name used in its display name
            blade.metallic = true;                 // decides hit and clash sounds
            blade.equipment_value = 45;            // "how good is this" score the AI compares
            blade.rigidity_rating = 5;
            blade.quality = Rarity.R2_Epic;        // minimum quality it can roll at

            // What a city needs to forge it.
            blade.setCost(0, "common_metals", 4);
            blade.minimum_city_storage_resource_1 = 10;

            // Stats. clone() already ran add(), so base_stats exists.
            blade.base_stats["damage"] = 9f;
            blade.base_stats["critical_chance"] = 0.08f;
            blade.base_stats["attack_speed"] = 2f;

            blade.path_slash_animation = "effects/slashes/slash_fire";

            // The game derives these two in post_init(), which ran before your mod existed.
            // Set them yourself or the sprite preloader throws on a null path.
            blade.path_gameplay_sprite = "items/weapons/w_hello_sword";   // in-hand sprite in GameResources/
            blade.path_icon = "ui/Icons/items/icon_hello_sword";

            // visible immediately: no need to discover them first
            blade.needs_to_be_explored = false;

            // linkAssets() sorted every item into these lists at startup. Cities forge from
            // the subtype list, and new weapons roll from the pools: skip this and nobody
            // ever makes yours.
            AssetManager.items.equipment_by_subtypes[blade.equipment_subtype].Add(blade);
            if (blade.is_pool_weapon)
            {
                AssetManager.items.pot_weapon_assets_all.Add(blade);
                AssetManager.items.pot_weapon_assets_unlocked.Add(blade);
            }

            // Optional: code that runs on every hit landed with it.
            blade.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 10f, -1f, -1L);
                return true;
            };
        }
    }
}
```

> [!WARNING] 등록되었다고 해서 단조되는 것은 아닙니다
> 도시가 단조할 무기는 `equipment_by_subtypes`(무기 종류별 목록)에서 선택되며, 새로 획득되는 전리품 무기는 `pot_weapon_assets_all` 및 `pot_weapon_assets_unlocked`에서 추첨됩니다. `ItemLibrary.linkAssets()`는 게임 시작 시 모드 로드 전에 이 세 목록을 모두 채웁니다. 뒷부분의 4줄이 없으면 무기는 존재하고 명령어로 지급할 수는 있지만, 세계의 어떤 대장장이도 이를 만들지 않습니다 :PES5_Hmmmm:. 방어구와 장신구는 무기 풀 대신 `group_id`로 분류되는 `pot_equipment_by_groups_all` 및 `pot_equipment_by_groups_unlocked`를 사용합니다.


## 에셋 필드 상세

### Identity

| 필드 | 설명 |
| --- | --- |
| `material` | 재질 이름. 표시 이름의 일부가 되며 AI가 장비 업그레이드 시 비교함 |
| `equipment_type` | `Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet`. 착용 슬롯 |
| `equipment_subtype` | `sword`, `axe`, `bow`, … 무기 분류. 문화마다 선호하는 서브타입이 존재 |
| `group_id` | 장비 도감 탭. **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 |
| `attack_type` | 근접 또는 원거리 공격 동작 방식 |
| `quality` | 생성 가능한 최소 품질 등급 |
| `rarity`, `pool_rate` | 아이템 생성 시 선택될 확률 빈도 |
| `is_pool_weapon` | 일반 무기 드롭 풀에 포함될지 여부 |

### 비용과 가치

가격은 상식적으로 정하세요. 4300만 코인짜리 철검은 밸런스가 아니라 사기입니다 :trollface:.

| 필드 | 설명 |
| --- | --- |
| `setCost(gold, res1, amount1, res2, amount2)` | 모든 비용을 한 번에 설정하는 권장 메서드. 개별 필드 설정 대신 이것을 사용하세요 |
| `minimum_city_storage_resource_1` | 도시의 창고 비축량이 이 수치 미만이면 제련하지 않음 |
| `equipment_value` | AI가 판단하는 무기의 우수성 수치. 군인이 무기를 교체할지 결정하는 기준 |
| `durability`, `rigidity_rating` | 내구도 및 단단함 등급 |

### 외형 및 시각 효과

| 필드 | 설명 |
| --- | --- |
| `path_gameplay_sprite` | 유닛의 손에 들려있는 스프라이트 |
| `colored`, `animated` | 색상 틴팅 적용 여부, 애니메이션 여부 |
| `path_slash_animation` | 공격 휘두르기 이펙트 |
| `projectile` | 원거리 무기일 때 발사될 투사체 (projectile). **[투사체, 주문 및 이펙트](#/nml/projectiles-spells)** 참조 |
| `name_class`, `name_templates` | 전설 등급이 되었을 때의 작명 규칙 |

### Behaviour

여기서부터 아이템은 숫자 묶음이 아니게 됩니다.

| 필드 | 하는 일 |
| --- | --- |
| `action_attack_target` | 공격이 적중할 때마다 실행됩니다 |
| `action_special_effect` + `special_effect_interval` | 장착하고 있는 동안 타이머로 실행됩니다 |
| `item_modifier_ids` | 붙을 수 있는 인챈트. **[무기 인챈트](#/nml/item-modifiers)** 참고 |
| `addSpell(id)` + `linkSpells()` | 착용자가 시전할 수 있는 주문 (spell). 연결은 직접 호출해야 합니다, 아래 참고 |
| `addCombatAction(id)` | 컴파일은 되지만 아이템에서는 아무것도 하지 않습니다: 유닛은 전투 행동을 특성 (trait)(과 아종 (subspecies), 씨족 (clan), 종교 (religion))에서 모으고, 장비에서는 절대 모으지 않습니다. 특성에 붙이세요. **[투사체, 주문과 효과](#/nml/projectiles-spells)** 참고 |

게임은 이 ID들을 시작할 때, 여러분의 모드가 로드되기 전에 한 번만 객체로 바꿉니다. 직접 등록한 아이템에서는 마지막에 `linkSpells()`를 호출하고, `decisions_assets`를 직접 설정하세요(그쪽에는 연결 메서드가 없습니다). 그러지 않으면 부여가 아무 효과도 없습니다. **[커스텀 AI](#/nml/custom-ai)**를 보세요.

## 장착 중에만 발동하는 효과

"엠버 블레이드를 든 사람은 신속해진다"는 특성처럼 들리지만, 아이템에는 특성을 붙일 수 없습니다. 대신 위 표의 `action_special_effect`로 장착 중 일정 간격마다 코드를 실행할 수 있고, **상태 효과** (status)는 내버려 두면 스스로 만료됩니다. 즉 아이템이 짧은 상태 효과를 주기적으로 다시 걸어 주고, 아이템을 빼면 상태 효과는 그대로 자연스럽게 사라집니다:

```csharp Mods/HelloBox/Code/HelloItems.cs
blade.special_effect_interval = 1f;
blade.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    StatusAsset status = AssetManager.status.get(HelloStatus.CURSED);
    if (status == null) return false;

    // 3초 지속, 들고 있는 동안 매초 갱신. 검을 내려놓으면 자연히 사라짐
    World.world.statuses.newStatus(actor, status, 3f);
    return true;
};
```

이 상태 효과에는 `allow_timer_reset = true`가 필요합니다(새로 만든 `StatusAsset`은 기본값이 true지만, 복제한 원본에 따라 false일 수 있습니다). 설정하지 않으면 미리 다시 걸어도 아무 효과가 없어 전투 중에 그대로 만료됩니다. HelloBox에서는 이 검이 착용자 자신을 저주하는데, 엠버 블레이드다운 동작입니다 :wbfacepalm:.

특성을 쓰지 않는 이유: 특성은 무언가 제거하기 전까지 계속 남아 있으므로, 검이 사라진 걸 감지해서 제거하는 별도의 타이머가 필요해집니다. 상태 효과는 스스로 뒷정리를 합니다.

## 나만의 스프라이트 적용하기

아이템은 두 가지 그래픽 리소스를 가지며, 각각 별개의 필드로 지정합니다:

```text
HelloBox/
└── GameResources/
    ├── items/
    │   └── weapons/
    │       ├── sprites.json                 <- bottom-center pivot
    │       └── w_hello_sword/
    │           └── w_hello_sword.png        <- what the unit holds
    └── effects/slashes/
        └── slash_fire.png                   <- the swing
```

```csharp
blade.path_gameplay_sprite = "items/weapons/w_hello_sword";
blade.path_slash_animation = "effects/slashes/slash_fire";
```

> [!NOTE] 무기 스프라이트는 LoadAll을 위해 폴더가 필요합니다
> 게임의 무기 프리로더는 `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`를 호출하며 내부적으로 `Resources.LoadAll<Sprite>`를 실행합니다. NeoModLoader에서 `LoadAll`은 폴더 이름으로 검색합니다. `path_gameplay_sprite`가 `"items/weapons/w_hello_sword"`인 경우, NML은 `GameResources/items/weapons/w_hello_sword/` 디렉터리를 찾습니다. 폴더 없이 `w_hello_sword.png` 파일만 두면 0개의 스프라이트를 반환하고 `Weapon Texture is Missing` 로그를 남깁니다. 해당 이름의 폴더 안에 이미지를 넣으면 정상 로드됩니다.

> [!NOTE] 무기 스프라이트는 LoadAll을 위해 폴더가 필요합니다
> 게임의 무기 프리로더는 `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`를 호출하며 내부적으로 `Resources.LoadAll<Sprite>`를 실행합니다. NeoModLoader에서 `LoadAll`은 폴더 이름으로 검색합니다. `path_gameplay_sprite`가 `"items/weapons/w_hello_sword"`인 경우, NML은 `GameResources/items/weapons/w_hello_sword/` 디렉터리를 찾습니다. 폴더 없이 `w_hello_sword.png` 파일만 두면 0개의 스프라이트를 반환하고 `Weapon Texture is Missing` 로그를 남깁니다. 해당 이름의 폴더 안에 이미지를 넣으면 정상 로드됩니다.

> [!NOTE] 무기는 LoadAll 호출을 위해 폴더 구조가 필요합니다
> 게임의 무기 프리로더는 `SpriteTextureLoader.getSpriteList(path_gameplay_sprite)`를 호출하며 내부적으로 `Resources.LoadAll<Sprite>`를 실행합니다. NeoModLoader에서 `LoadAll`은 폴더 이름을 기준으로 탐색합니다. `path_gameplay_sprite`가 `"items/weapons/w_hello_sword"`라면 NML은 `GameResources/items/weapons/w_hello_sword/` 폴더를 찾습니다. 폴더 없이 `w_hello_sword.png` 단일 파일만 두면 0개의 스프라이트를 반환하여 게임 로그에 `Weapon Texture is Missing` 오류가 남게 됩니다. 해당 이름의 하위 폴더 안에 스프라이트를 넣어두면 문제없이 로드됩니다.

무기 스프라이트는 유닛의 스케일에 맞춰 렌더링되며 피벗 기준점을 하단 중앙(`sprites.json`의 `PivotX: 0.5, PivotY: 0.0`)으로 잡아야 손 밖으로 붕 뜨지 않습니다 (**[스프라이트 및 리소스](#/nml/sprites-and-resources)** 참고).

어느 쪽이든 경로를 바닐라 값(예: `"items/weapons/w_sword_iron"`) 그대로 두면 기본 게임의 아트가 사용되며, 처음 무기를 제작할 때 유용합니다 :PESgn_Neat:.

## 전체 재료 라인업 구성하기

생물과 마찬가지로, 무기 하나만 만들어서 끝나는 경우는 거의 없습니다. 9개의 재질은 9개의 에셋을 의미하고, 코드를 9번 복붙하면 버그를 수정해야 할 곳도 9군데가 됩니다.

```csharp
private struct Mat
{
    public string Suffix;
    public int Value;
    public float Damage;
    public int Cost;
}

private static readonly Mat[] Mats = new Mat[]
{
    new Mat { Suffix = "copper", Value = 15, Damage = 4f, Cost = 2 },
    new Mat { Suffix = "iron",   Value = 30, Damage = 6f, Cost = 3 },
    new Mat { Suffix = "steel",  Value = 40, Damage = 7f, Cost = 4 },
};

private static void RegisterLine(string pPrefix, string pTemplate)
{
    for (int i = 0; i < Mats.Length; i++)
    {
        string id = pPrefix + "_" + Mats[i].Suffix;
        if (AssetManager.items.has(id)) continue;

        EquipmentAsset item = AssetManager.items.clone(id, pTemplate);
        item.material = Mats[i].Suffix;
        item.metallic = true;
        item.equipment_value = Mats[i].Value;
        item.setCost(0, "common_metals", Mats[i].Cost);
        item.base_stats["damage"] = Mats[i].Damage;
    }
}

// RegisterLine("hello_glaive", "$spear");
```

## 텍스트 및 로컬라이제이션

아이템의 작명 방식은 이 가이드의 다른 모든 에셋과 달라서 많은 사람들을 헷갈리게 합니다. 저도 포함해서요 :PESgn_Oops:. 아이템의 표시 이름은 다음과 같이 결정됩니다:

```text
translation_key   ?? "item_" + (equipment_subtype ?? id)
```

따라서 위에서 `$sword`로부터 복제한 검은 `equipment_subtype = "sword"`를 물려받아 여러분의 ID가 아니라 바닐라 기본 키인 **검**으로 표시됩니다. 해결책은 두 가지입니다:

```csharp
blade.translation_key = "hello_sword_ember";   // 검 분류를 유지하면서 고유한 이름을 직접 지정
```

또는 서브타입 이름을 건드리지 않고 바닐라처럼 **재질**이 이름을 대신 말하게 두는 것입니다. 바닐라에서는 모든 검이 기본적으로 "검"이며, `sword_iron`은 재질 키 덕분에 "철제 검"으로 합성되어 표시됩니다.

```json Mods/HelloBox/Locales/en.json
{
  "hello_sword_ember": "Ember Blade",
  "hello_sword_ember_description": "Forged in something that is still angry about it.",

  "item_mat_ember": "Ember"
}
```

| 키 | 출처 |
| --- | --- |
| `item_<subtype>` 또는 자체 `translation_key` | 아이템 기본 이름 |
| `<id>_description` | 툴팁 설명문 |
| `item_mat_<material>` | 이름 앞에 붙는 재질 단어 |

새로운 재질은 **반드시** `item_mat_` 키가 필요합니다. 그렇지 않으면 무기 이름 앞에 번역되지 않은 날것의 키가 흉하게 붙어 나옵니다.

## 유닛의 손에 아이템 쥐어주기

**에셋**은 레시피입니다. **아이템**은 특정 유닛이 들고 있는 실제 물리적 객체로, 품질 등급과 모디파이어, 고유 이름이 무작위로 부여되어 있습니다. 지급하는 과정은 2단계입니다:

```csharp
EquipmentAsset asset = AssetManager.items.get(HelloItems.EMBER_BLADE);
if (asset == null || actor == null) return;

// 1. 레시피로부터 실제 인게임 아이템 생성
Item item = World.world.items.generateItem(asset, actor.kingdom, actor.getName(), 1, actor);

// 2. 유닛에게 전달 - setItem이 item의 equipment_type에 맞춰 알맞은 슬롯에 장착시킴
actor.equipment.setItem(item, actor);
```

`generateItem`은 일반적인 필드 드롭 아이템처럼 무작위로 품질과 옵션을 굴리기 때문에, 유닛이 최종적으로 쥐게 되는 아이템은 등록했던 원본 에셋과 완전히 같지 않습니다.

## 손에 쥐는 도구

건축가가 휘두르는 망치와 채집자가 들고 다니는 바구니는 인벤토리 아이템이 아닙니다. 이들은 **손 도구(Hand Tool)**이며, 특정 태스크가 실행되는 동안에만 표시되고 끝나면 사라지는 순수 비주얼 요소입니다.

```csharp Mods/HelloBox/Code/HelloTools.cs
using ai.behaviours;   // BehaviourTaskActor

namespace HelloBox
{
    public static class HelloTools
    {
        public const string TORCH = "hello_torch";

        public static void Initialize()
        {
            if (AssetManager.unit_hand_tools.has(TORCH)) return;

            UnitHandToolAsset torch = new UnitHandToolAsset
            {
                id = TORCH,
                path_gameplay_sprite = "items/tools/tool_hello_torch"   // a folder of frames
            };

            AssetManager.unit_hand_tools.add(torch);

            // loadSprites() ran at startup. An empty list here is a hand holding nothing.
            torch.gameplay_sprites = SpriteTextureLoader.getSpriteList(torch.path_gameplay_sprite);

            // A tool shows up while a task forces it. Give it to the task from the AI page.
            BehaviourTaskActor drive = AssetManager.tasks_actor.get(HelloAI.TASK);
            if (drive != null) drive.force_hand_tool = TORCH;
        }
    }
}
```

태스크는 `force_hand_tool`을 통해 도구를 표시하므로, 생명체가 **[커스텀 AI](#/nml/custom-ai)**의 배회 태스크를 실행할 때마다 횃불을 손에 듭니다.

> [!WARNING] 프레임 이미지를 직접 로드하세요
> `UnitHandToolLibrary.loadSprites()`는 시작 시 모든 도구의 `gameplay_sprites`를 채웁니다. 나중에 추가된 도구에는 스프라이트 목록이 비어 있어 유닛이 빈손을 쥐게 됩니다. 경로는 `getSpriteList()`로 읽히므로 단일 프레임이라도 `items/tools/tool_hello_torch/`와 같은 **폴더**여야 합니다. `sprites.json` 피벗이 없으면 도구가 이미지 정중앙을 기준으로 잡힙니다.

| 필드 | 역할 |
| --- | --- |
| `path_gameplay_sprite` | 프레임 폴더 경로입니다. 바니라는 ID를 기반으로 `items/tools/tool_<id>`를 지정합니다 |
| `animated` | 커피잔처럼 프레임을 반복 재생할지 여부 |
| `colored` | 깃발처럼 왕국 (kingdom) 색상으로 염색할지 여부 |

> [!TIP] 무기보다 인챈트를 먼저 만들어 보세요
> 새로운 무기를 만드는 데는 스프라이트, 재료 라인업, 비용 및 밸런스 작업이 필요합니다. 반면 새로운 **모디파이어(인챈트)**는 단 20줄이면 구현되며 다른 모드의 무기를 포함한 게임 내 모든 무기에 적용됩니다. 오늘 밤 당장 색다른 재미를 느끼고 싶다면 **[무기 인챈트](#/nml/item-modifiers)**를 먼저 읽어보세요 :PESgn_DoIt:.
