---
title: 커스텀 액터
group: 게임 콘텐츠
subgroup: 액터, 건물 및 AI
icon: :wbhuman:
order: 140
---

# 커스텀 액터 :wbhuman:

> [!NOTE] 종족이 아니라 '액터'라고 부릅니다
> 게임 엔진은 인간, 늑대, 드래곤, 좀비, 게 등 살아있는 모든 존재를 **액터**(actor)라고 부릅니다. 이들은 모두 동일한 `ActorAsset` 클래스에서 파생되며 `AssetManager.actor_library` 에 등록됩니다. '종족(Race)'은 구시대의 단어입니다. 코드상에 유일하게 남아있는 `race` 속성에는 `[Obsolete("use .original_actor_asset instead")]` 경고가 붙어 있으며, 오직 고대 세이브파일을 불러오기 위해서만 존재합니다. 모든 코드에서 `actor` 로 작성하세요.

새로운 생명체를 만드는 것은 모든 모더가 꿈꾸지만 거의 아무도 완성하지 못하는 모드입니다. `ActorAsset` 은 애니메이션, 텍스처, 사운드, 분류학, 식성, AI 플래그, 게놈, 문화, 스탯 등 방대한 데이터를 한 몸에 짊어지고 있기 때문입니다. 이 중 단 하나라도 삐끗하면 바다 한가운데에 투명인간 유닛이 우두커니 서 있는 대참사가 일어납니다.

희소식이 있습니다. 게임 본편도 생명체를 무에서 유로 조립하지 않습니다. 바닐라 코드가 엘프를 만드는 방법은 문자 그대로 이것뿐입니다:

```csharp
clone("elf", "$civ_advanced_unit$");
```

그러니 우리도 똑같이 하면 됩니다.

## 템플릿

`$` 로 둘러싸인 id들은 **템플릿**(template)입니다. 다른 액터들이 복제해 갈 수 있도록 게임이 보관하고 있는 미완성 액터들이죠. 인간의 스프라이트를 억지로 물려받지 않으면서도 내부 동작 체계를 온전히 갖추고 있어, 완전히 새로운 생명체를 만들기 위한 가장 완벽한 출발점입니다.

| 템플릿 | 복제 목적 |
| --- | --- |
| `$basic_unit$` | 살아있는 생명체의 최소한의 뼈대 |
| `$animal$` | 야생 동물 |
| `$mob$` | 적대적인 몬스터 |
| `$civ_unit$` | 문명을 이루는 기본 생명체 |
| `$civ_advanced_unit$` | 도시, 왕국, 문화, 종교를 가진 완전한 문명 생명체. 인간, 엘프, 오크, 드워프의 모태 |

물론 `human`, `wolf`, `zombie` 처럼 완성된 액터를 직접 복제할 수도 있습니다. 기증자의 스프라이트가 기본으로 따라와 게임에서 즉시 눈으로 확인할 수 있으므로 첫 모드를 만들 때는 이 방법이 가장 쉽습니다.

## 단일 액터 만들기

```csharp Mods/HelloBox/Code/HelloActors.cs
namespace HelloBox
{
    public static class HelloActors
    {
        public const string SPRITE = "hello_sprite";

        public static void Initialize()
        {
            if (AssetManager.actor_library.has(SPRITE)) return;

            // clone() copies every field, gives the copy the new id, and registers it.
            // Do NOT call add() afterwards: that registers it a second time and the
            // library logs "duplicate asset - overwriting...".
            ActorAsset sprite = AssetManager.actor_library.clone(SPRITE, "human");

            sprite.name_locale = "Sprite";
            sprite.civ = true;                       // founds cities, joins kingdoms, goes to war
            sprite.can_have_subspecies = true;
            sprite.actor_size = ActorSize.S13_Human;
            sprite.color_hex = "#7FE7C4";
            sprite.icon = "iconHelloSprite";

            // visible immediately: no need to discover them first
            sprite.needs_to_be_explored = false;

            // Taxonomy: what the knowledge window shows.
            sprite.name_taxonomic_genus = "spiritus";
            sprite.name_taxonomic_species = "minor";

            // Stats. clone() already ran add(), so base_stats exists here.
            sprite.base_stats["health"] = 80;
            sprite.base_stats["damage"] = 12;
            sprite.base_stats["speed"] = 32f;

            // see the warning below: the shadow is not loaded for you
            sprite.texture_asset.loadShadow();
        }
    }
}
```
> [!WARNING] 그림자는 직접 로드하세요. 안 그러면 액터마다 에러가 납니다
> `ActorAssetLibrary` 는 시작할 때 목록을 돌며 각 액터에 `loadShadow()` 를 부릅니다. 그건 `shadows/<shadow_texture>` 의 스프라이트를 읽고 크기를 잽니다. 그 일은 모드가 무언가를 등록하기 전에 끝났으므로, 당신 액터의 그림자는 `(0.00, 0.00)` 인 채로 남고 게임은 성체·알·새끼 세 번에 걸쳐 에셋 에러를 찍습니다 :wbfacepalm:.
>
> `loadShadow()` 는 `internal` 이라, 가이드의 다른 부분과 마찬가지로 **publicized** 된 `Assembly-CSharp.dll` 이 필요합니다. 없다면 대신 `asset.shadow = false;` 로 두세요. 그림자는 없지만 에러도 없습니다.


> [!WARNING] clone() 은 이미 등록을 완료했습니다
> `AssetManager.<library>.clone(newId, sourceId)` 는 내부적으로 `add()` 를 호출합니다. 모든 에셋 라이브러리가 이렇게 동작합니다. 복제 후 `add()` 를 직접 호출하면 중복 등록이 되어 라이브러리가 첫 사본을 삭제하고 에러 로그를 뿜은 뒤 다시 추가합니다. 치명적이진 않지만 로그를 더럽혀 진짜 버그를 찾기 어렵게 만들고, 코드 리뷰에서 가장 먼저 지적당합니다.
>
> 반대로 생각하면 엄청난 장점입니다: **복제 직후에는 이미 `base_stats` 가 할당되어 있으므로**, **[커스텀 트레잇](#/nml/custom-traits)** 에서 강조했던 "add() 이후에 스탯 수정" 규칙이 저절로 충족됩니다.

## 한 번에 여러 액터 생성하기

대부분의 생명체 모드는 단 한 마리로 끝나지 않습니다. 세 종류의 정령을 만든다면 세 개의 에셋이 필요하고, 위의 코드를 3번 복사해 붙여넣는 순간 버그가 생겼을 때 고쳐야 할 곳도 3배로 늘어납니다.

차이점들을 구조체 테이블로 모으고 루프를 돌리세요:

```csharp Mods/HelloBox/Code/HelloActors.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloActors
    {
        // Everything that actually differs between the three, in one place.
        private struct Def
        {
            public string Id;
            public string From;      // which actor or template to clone
            public string Color;
            public string Icon;
            public float Health;
            public float Damage;
            public float Speed;
            public bool OwnArt;      // true: sprites come from GameResources/actors/species/other/<id>/
        }

        private static readonly Def[] Defs = new Def[]
        {
            new Def { Id = "hello_sprite", From = "human", Color = "#7FE7C4", Icon = "iconHelloSprite", Health = 80,  Damage = 12, Speed = 32f },
            new Def { Id = "hello_wisp",   From = "wolf",  Color = "#C49BFF", Icon = "iconHelloWisp",   Health = 60,  Damage = 20, Speed = 40f, OwnArt = true },
            new Def { Id = "hello_golem",  From = "wolf",  Color = "#8C8C8C", Icon = "iconHelloGolem",  Health = 240, Damage = 30, Speed = 18f, OwnArt = true },
        };

        public static void Initialize()
        {
            for (int i = 0; i < Defs.Length; i++)
            {
                Register(Defs[i]);
            }
        }

        private static void Register(Def pDef)
        {
            if (AssetManager.actor_library.has(pDef.Id)) return;
            if (!AssetManager.actor_library.has(pDef.From)) return;   // donor missing, skip quietly

            ActorAsset asset = AssetManager.actor_library.clone(pDef.Id, pDef.From);

            asset.civ = !pDef.OwnArt;                // a civ needs heads, male and female sheets
            asset.can_have_subspecies = true;
            asset.actor_size = ActorSize.S13_Human;
            asset.color_hex = pDef.Color;
            asset.icon = pDef.Icon;

            if (pDef.OwnArt)
            {
                // clone() copied the donor's texture paths, so point this one at its own folder.
                // The folder holds main/ and child/, one PNG per frame: walk_0..3, swim_0..3.
                asset.texture_asset = new ActorTextureSubAsset("actors/species/other/" + pDef.Id + "/", false);
                asset.has_advanced_textures = false;
                asset.animation_walk = ActorAnimationSequences.walk_0_3;
                asset.animation_swim = ActorAnimationSequences.swim_0_3;
                asset.animation_idle = ActorAnimationSequences.walk_0;
            }

            // visible immediately: no need to discover them first
            asset.needs_to_be_explored = false;

            asset.base_stats["health"] = pDef.Health;
            asset.base_stats["damage"] = pDef.Damage;
            asset.base_stats["speed"] = pDef.Speed;

            // The library loads every actor's shadow during its own startup, which was before
            // your mod existed. Without this the game logs "Shadow size is too small (0.00, 0.00)".
            asset.texture_asset.loadShadow();
        }
    }
}
```

이제 4번째 생명체를 추가하는 일은 테이블에 한 줄을 적는 것으로 끝납니다. 실제로 배포되는 거의 모든 생명체 모드가 이런 깔끔한 형태를 갖추고 있으며, 두 번째 생명체부터는 무조건 이렇게 작성하는 편이 이롭습니다 :PESgn_ThisTBH:.

## 생명체의 정체성을 결정짓는 핵심 필드

| 필드 | 설명 |
| --- | --- |
| `civ` | 문명 생명체 여부: 도시, 왕국, 일자리, 전쟁. `false` = 동물 |
| `auto_civ` | 게임이 스스로 문명화를 진행시키는지 여부 |
| `default_animal` | 게임 내부 판정에서 야생 동물로 분류 |
| `unit_other` | 문명도 동물도 아님: 몬스터, 골렘, 특수 유닛 |
| `actor_size` | `S0_Bug` … `S13_Human` … `S17_Dragon`. 렌더링 크기 및 전투 판정에 관여 |
| `name_locale` | 표시 이름 로컬라이즈 키 |
| `icon` | 목록 및 소환 버튼에 사용될 아이콘 |
| `color_hex` | 색상 변경이 가능한 유닛에 덧입혀지는 색상 코드 |
| `can_have_subspecies` | 세대를 거치며 아종으로 변이할 수 있는지 여부 |
| `has_ai_system` | 일반적인 행동 AI 시스템을 실행할지 여부 |
| `flying` / `hovering` | 지면에서 떠오르는지 여부와 비행 고도 |
| `force_ocean_creature` / `force_land_creature` | 서식 가능한 지형을 바다 또는 육지로 강제 고정 |
| `can_attack_buildings` | 건물을 공격하고 파괴할 수 있는지 |
| `has_soul`, `can_receive_traits`, `can_be_cloned` | 신의 권능이 가할 수 있는 조작 허용 범위 |
| `kingdom_id_wild` / `kingdom_id_civilization` | 소속될 왕국 (야생 상태 및 정착 상태) |
| `texture_atlas` | `UnitTextureAtlasID.Units`, `Boats`, `Zombies` … 스프라이트가 속한 아틀라스 |
| `animation_walk` / `animation_idle` / `animation_swim` | 프레임 시퀀스와 각 애니메이션의 `_speed` 필드 |
| `sound_idle`, `sound_spawn`, `sound_death` … | FMOD 사운드 이벤트 경로 |
| `name_taxonomic_*` | 지식 창에 노출될 계, 문, 강, 목, 과, 속, 종 |
| `collective_term` | 무리를 부르는 표현 ("늑대 **한 무리**") |
| `allowed_status_tiers` | 부여받을 수 있는 상태 효과 등급 |
| `production` | 이들의 도시가 생산하는 품목 |
| `zombie_id_internal`, `skeleton_id`, `mush_id` … | 사망 또는 감염 시 변신할 대상 |

## 문명 생명체를 월드 시스템에 연결하기

`civ` 액터는 스탯만 적어준다고 완성되지 않습니다. 다음은 바닐라가 플레이 가능한 모든 종족에 채워넣는 필수 필드들이며, 이를 누락하는 것이 커스텀 문명이 "아무런 행동도 하지 않는" 가장 흔한 원인입니다:

```csharp
asset.kingdom_id_wild = "nomads_human";          // 정착하기 전 유목민 상태
asset.kingdom_id_civilization = "human";         // 설립할 왕국 유형
asset.banner_id = "human";                       // 국기 생성기
asset.architecture_id = "human";                 // 건축물 외형 양식
asset.build_order_template_id = "build_order_advanced";
asset.name_template_sets = new string[] { "human_default_set" };   // 이름 생성 규칙
asset.civ_base_cities = 3;
asset.family_limit = 20;

asset.addPreferredColors("teal", "lime");
asset.addResource("meat", 1, pNewList: true);
asset.addResource("bones", 1);

// 게놈: 번식과 돌연변이에 작용하는 유전 스탯 분포
asset.addGenome(
    ("health", 70f), ("stamina", 200f), ("lifespan", 500f),
    ("damage", 10f), ("speed", 20f), ("offspring", 2f),
    ("intelligence", 6f), ("diplomacy", 5f), ("warfare", 2f), ("stewardship", 2f));

// 트레잇 시스템별 기본 보유 트레잇
asset.addCultureTrait("bow_lovers");
asset.addReligionTrait("rite_of_change");
asset.addSubspeciesTrait("long_lifespan");
asset.addClanTrait("blood_pact");
asset.addLanguageTrait("melodic");
asset.addKingdomTrait("tax_rate_local_low");
```

나만의 그래픽 리소스가 완성되기 전까지는 바닐라의 `banner_id` 와 `architecture_id` 를 재사용하세요. 건축 양식이 지정되지 않은 생명체는 아무것도 건설하지 못합니다.

## 생명체 소환하기

```csharp
Actor actor = World.world.units.spawnNewUnit("hello_sprite", tile, pSpawnSound: true, pAdultAge: true);
```

`spawnNewUnit` 은 public 메서드이며 소환 사운드, 기적 연출, 소환 높이, 특정 아종 지정, 시작 장비 지급 여부 등을 옵션 인자로 받습니다.

플레이어에게 이를 소환할 신의 권능 버튼을 제공하면 완성입니다. **[권능 탭 & 버튼](#/nml/power-buttons)** 을 참고하세요.

## 아종 (Subspecies)

아종은 액터가 세대를 거치며 환경에 적응해 분화되는 변이 형태입니다. 일반 액터 트레잇과 분리된 자체 트레잇 라이브러리와 그룹 목록을 가집니다:

```csharp
SubspeciesTrait scales = new SubspeciesTrait
{
    id = "hello_scales",
    group_id = "body",
    spawn_random_trait_allowed = true
};
AssetManager.subspecies_traits.add(scales);
scales.base_stats["armor"] = 5;

// 여러분의 액터가 이 트레잇을 기본으로 가지고 시작하도록 설정
asset.addSubspeciesTrait("hello_scales");
```

아종 트레잇은 **외형 아트** 도 탑재할 수 있습니다: `sprite_path`, `animation_walk`, `skin_citizen_male`, `skin_warrior` 등을 지정하여 별도의 액터를 새로 만들지 않고도 부모 종족과 시각적으로 완전히 다른 아종을 연출할 수 있습니다. **[아종 트레잇](#/nml/subspecies-traits)** 을 참고하세요.

## 커스텀 아이콘

본격적인 애니메이션 제작에 들어가기 전, 가장 손쉬운 작업은 목록과 소환 버튼에 쓰일 아이콘을 만드는 것입니다.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSprites.png
```

```csharp
sprite.icon = "iconHelloSprites";
```

생명체의 **몸체** 아트를 그리는 작업은 차원이 다른 영역이며, 본 문서의 마지막 파트에서 다룹니다.

## 스프라이트 제작이 진짜 난관입니다

위에서 다룬 모든 내용은 코드로 따지면 고작 한 페이지 분량에 불과합니다. 진짜 고난은 아트 작업에 있습니다. 생명체 하나를 완성하려면 적절한 아틀라스에, 올바른 크기와 정확한 피벗을 맞춘 완전한 애니메이션 프레임 세트가 필요합니다. 현실적인 선택지는 두 가지입니다:

1. **기증자의 스프라이트를 그대로 재사용하기.** 인간 애니메이션을 재활용하면서 스탯과 색상 틴트만 바꾼 생명체는 훌륭한 첫 모드가 되며, 무엇보다 *완벽하게 작동합니다*.
2. **AssetRipper 로 원본 그래픽을 추출하여**, 복제한 생명체의 아틀라스 레이아웃을 픽셀 단위로 정확히 분석한 뒤 그림을 그리기 시작하세요. **[게임 그래픽 리소스 추출하기](#/toolbox/getting-the-sprites)** 를 참고하세요.

> [!WARNING] 빈 맵이 아닌 실제 월드에서 테스트하세요
> 길을 찾지 못하거나, 건물을 짓지 못하거나, 스폰되자마자 익사하는 결함투성이 문명 생명체도 처음 30초 동안은 지극히 정상적으로 보입니다. 최소 20마리를 소환하고 월드를 5분간 최고 속도로 돌려본 뒤 로그를 반드시 확인하세요 :PES_MonkaSweat:.
