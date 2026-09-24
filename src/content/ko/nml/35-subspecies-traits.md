---
title: 아종 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbelf:
order: 104
---

# 아종 특성 :wbelf:

**아종**은 본래의 종에서 유전적으로 갈라져 나온 분파입니다(더 긴 수명, 비늘, 난생, 발광 등). 교육이 아닌 **번식**을 통해 전파되며, 고유한 스프라이트를 가질 수 있는 유일한 특성 시스템입니다. 덕분에 별도의 액터를 만들지 않고도 모종과 완전히 다른 외형을 가질 수 있습니다.

| | |
| --- | --- |
| 라이브러리 | `AssetManager.subspecies_traits` |
| 클래스 | `SubspeciesTrait` |
| 그룹 | `AssetManager.subspecies_trait_groups`, 클래스 `SubspeciesTraitGroupAsset` |
| 런타임 소유자 | `Subspecies`, `World.world.subspecies` 내부 |
| 로컬라이제이션 접두사 | `subspecies_trait_` |
| 기본 아이콘 폴더 | `ui/Icons/subspecies_traits/` |

> [!WARNING] 아종은 액터 에셋의 스탯을 **대체합니다**
> `Actor.updateStats()` 에서 아종을 가진 유닛은 `subspecies.base_stats` 를 병합하고 `asset.base_stats` 를 완전히 **건너뜁니다**. 누적 합산이 아니라 둘 중 하나만 취하는 구조입니다.
>
> 따라서 `human` 에셋에 설정한 수치는 아종을 가진 인간에게 전혀 적용되지 않으며, 시간이 어느 정도 흐른 월드에서는 대부분의 인간이 아종에 속합니다 :PES4_IDunnoMan:.

아종은 남성과 여성 유닛에 대해 각각 별도의 추가 스탯 블록을 적용하지만, 이는 특성에서 오는 것이 **아닙니다**. `AssetManager.gene_library` 에 있는 게놈에서 발생합니다. 아종 특성은 모두에게 공통인 단 하나의 `base_stats` 만을 가집니다. 특성을 통해 성별 분기를 나누고 싶다면 가문 특성을 사용하세요. **[가문 특성](#/nml/clan-traits)** 을 확인하세요.

## 등록하기

```csharp Mods/HelloBox/Code/HelloSubspecies.cs
namespace HelloBox
{
    public static class HelloSubspecies
    {
        public const string SCALES = "hello_scales";

        public static void Initialize()
        {
            if (AssetManager.subspecies_traits.has(SCALES)) return;

            SubspeciesTrait trait = new SubspeciesTrait
            {
                id = SCALES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloSubspecies",
                in_mutation_pot_add = true,       // 돌연변이로 획득 가능
                in_mutation_pot_remove = false,   // 돌연변이로 제거되지 않음
                spawn_random_trait_allowed = true,
                rarity = Rarity.R1_Rare
            };

            AssetManager.subspecies_traits.add(trait);

            trait.base_stats["armor"] = 5;
            trait.base_stats.addTag("immunity_fire");
        }
    }
}
```

## 돌연변이

특성을 직접 수동으로 부여하지 않아도 월드에 자연 발생시키는 방식이고, 이게 재미있는 방법입니다. 라이브러리는 두 개의 추첨 풀을 관리하며, 다음 두 필드가 내 특성이 참여할 풀을 결정합니다:

| 필드 | 역할 |
| --- | --- |
| `in_mutation_pot_add` | 돌연변이 이벤트가 이 특성을 부여할 수 있는지 여부 |
| `in_mutation_pot_remove` | 돌연변이 이벤트가 이 특성을 박탈할 수 있는지 여부 |
| `spawn_random_trait_allowed` | 무작위 생성 시 추첨 대상이 되는지 여부 |
| `rarity` | 추첨 시 선택될 확률의 가중치 |

유닛의 `mutation` 능력치가 이러한 현상이 일어날 확률을 결정합니다. **[스탯 레퍼런스](#/nml/stats)** 를 참고하세요.

> [!WARNING] 추첨 풀은 게임 시작 시 딱 한 번만 만들어집니다
> `spawn_random_trait_allowed = true`로 설정하는 것만으로는 부족합니다. 실제 추첨 풀인 `_pot_allowed_to_be_given_randomly`는 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만듭니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 그 이후에 등록한 특성은 이 풀에 절대 들어가지 않으며, 돌연변이로 선택되는 일도 없습니다. 바닐라와 같은 가중치로 직접 추가해주세요:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.subspecies_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.

## 그래픽: 다른 특성 시스템에는 없는 독보적인 기능

```csharp
trait.is_mutation_skin = true;
trait.sprite_path = "actors/species/mutations/hello_scales";
trait.animation_walk = ActorAnimationSequences.walk_0_3;
trait.animation_idle = ActorAnimationSequences.walk_0_3;
trait.animation_swim = ActorAnimationSequences.swim_0_3;
trait.skin_citizen_male = new List<string> { "male_1" };
trait.skin_citizen_female = new List<string> { "female_1" };
trait.skin_warrior = new List<string> { "warrior_1" };
trait.render_heads_for_children = true;

// 라이브러리는 자체 스킨을 위해 내부 헬퍼 메서드로 이를 구성합니다.
// 모드에서는 수동으로 동일하게 생성합니다:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| 필드 | 역할 |
| --- | --- |
| `is_mutation_skin` | 일반 특성이 아닌 외형 스킨 대체재임을 명시 |
| `sprite_path` | 텍스처가 위치한 폴더 경로. 텍스처 에셋이 요구하는 끝 슬래시 `/` 에 주의 |
| `texture_asset` | 빌드된 텍스처 에셋. 위와 같이 직접 설정 |
| `skin_citizen_male` / `_female` / `skin_warrior` | 역할별 스킨 변형. 유닛마다 무작위 배정 |
| `animation_walk` / `animation_idle` / `animation_swim` | 모종의 애니메이션을 덮어씀 |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | 생애 주기 단계별 그림자 텍스처 |
| `render_heads_for_children` | 어린 유닛에게 별도의 머리를 렌더링할지 여부 |
| `prevent_unconscious_rotation` | 기절 시 회전하지 않고 수직을 유지(구체 및 슬라임 형태) |
| `remove_for_zombies` | 좀비로 변이할 때 스킨을 제거할지 여부 |
| `priority` | 유닛이 두 개의 스킨을 가질 때의 우선순위 |

바닐라 외형 변이(버거, 살아있는 바위, 촉수 괴물, 빛의 구체, 프랙탈)는 모두 `$skin_mutation$` 의 복제본이며, 해당 템플릿을 복제하는 것이 작동하는 스킨을 만드는 가장 빠른 지름길입니다. 네, 버거는 진짜 돌연변이입니다. Maxim의 뜻은 헤아릴 수 없습니다 :wbpray:.

## 표현형, 식성 및 알

아종 특성이 연결되는 세 가지 하위 시스템:

| 필드 | 역할 |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | `AssetManager.phenotype_library` 의 표현형과 특성을 결합 |
| `is_diet_related` | 식성 시스템의 일부로 지정. `diet_*` 스탯 태그와 함께 사용 |
| `id_egg`, `phenotype_egg` | 난생 아종의 알 형태 정의 |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | 알에서 부화할 때 실행되는 코드 |

## 유전자

유전자(Gene)는 한 아종 특성이 다른 특성으로 돌연변이를 일으키는 경로입니다. 게임은 번식 시점에 `AssetManager.genes`를 순회하며 물려줄 형질을 결정합니다: 사실상 생물 숙제입니다.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public static void Initialize()
        {
            GeneAsset gene = new GeneAsset
            {
                id = "hello_swift_gene",
                id_trait = HelloSubspecies.SWIFT,
                rate = 0.05f
            };
            AssetManager.genes.add(gene);
            AssetManager.genes._gene_assets_mutations.Add(gene);
        }
    }
}
```

두 가지 핵심 필드:

- `gene.id_trait`는 등록한 아종 특성과 연결합니다.
- `gene.rate`는 돌연변이 발생 확률입니다 (0.0 ~ 1.0).

`_gene_assets_mutations.Add(gene)` 호출이 없으면 유전자가 등록은 되지만 돌연변이 추첨 풀에 영원히 들어가지 않습니다.

## 메타 태그

바닐라의 여러 아종 특성은 태그 하나만 가지고 있는데, 게임 코드가 해당 태그를 기준으로 동작을 분기하기 때문입니다:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // 아종이 해당 바이옴에 정착 가능
trait.base_stats.addTag("walk_adaptation_snow");                 // 유닛들이 눈 위를 빠르게 이동
```

`base_stats_meta` 는 아종 객체에 남습니다. `base_stats` 는 소속 유닛들에게 도달합니다. 전체 태그 목록은 **[스탯 레퍼런스](#/nml/stats)** 에서 확인하세요.

## 바닐라 그룹

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

나만의 탭 만들기: **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 (`AssetManager.subspecies_trait_groups` 및 `SubspeciesTraitGroupAsset`).

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## 특성 부여하기

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

이렇게 하면 해당 생명체에서 파생되는 모든 새로운 아종이 이 특성을 가지고 시작합니다. 이 코드를 생략하고 `in_mutation_pot_add` 에만 의존하면 언젠가 세상 어딘가에서 스스로 발현하게 되며, 대개 이쪽이 훨씬 흥미진진한 결과를 낳습니다.

> [!TIP] 주문과의 궁합이 환상적입니다
> 바닐라의 마법 혈통은 주문 하나만 부여하는 아종 특성입니다: `trait.addSpell("summon_lightning")`. 단 한 줄의 코드가 자손에게 대물림되며 온 대륙을 아우르는 뇌전 소환사 가계도를 탄생시킵니다 :PES5_CrazyPog:.
