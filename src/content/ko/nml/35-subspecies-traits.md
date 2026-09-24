---
title: 아종 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbelf:
order: 104
---

# 아종 특성 :wbelf:

**아종** (subspecies)은 본래의 종에서 유전적으로 갈라져 나온 분파입니다(더 긴 수명, 비늘, 난생, 발광 등). 교육이 아닌 **번식**을 통해 전파되며, 고유한 스프라이트를 가질 수 있는 유일한 특성 (trait) 시스템입니다. 덕분에 별도의 액터를 만들지 않고도 모종과 완전히 다른 외형을 가질 수 있습니다.

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

처음에 언급한 수컷과 암컷 스탯 블록은 아종의 **게놈**에서 옵니다: 슬롯이 있는 염색체와, 각 슬롯에 들어 있는 유전자 하나. 유전자는 `BaseTrait`이므로 이 사이트의 다른 모든 특성처럼 등록하되, 추가로 할 일이 두 가지 있습니다. 사실상 생물 숙제입니다.

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public const string EMBER_BLOOD = "hello_ember_blood";

        public static void Initialize()
        {
            if (AssetManager.gene_library.has(EMBER_BLOOD)) return;

            GeneAsset gene = new GeneAsset
            {
                id = EMBER_BLOOD,
                path_icon = "ui/Icons/iconHelloGene",
                needs_to_be_explored = false
            };

            AssetManager.gene_library.add(gene);
            gene.base_stats["damage"] = 2f;

            // Each world rolls every gene's DNA letters from its life seed when it loads.
            // A world may already be open, so roll yours now the same way.
            if (World.world != null && World.world.map_stats != null)
            {
                gene.generateDNA(World.world.map_stats.life_dna + gene.getIndexID());
            }

            // linkAssets() filled the mutation pool at startup. Without this, only the
            // player's gene editor can ever place it.
            AssetManager.gene_library._gene_assets_mutations.Add(gene);
        }
    }
}
```

- **DNA 글자.** 모든 유전자는 짧은 `ACGT` 코드를 보여 주는데, 세계가 로드될 때 그 세계의 생명 시드로부터 세계마다 추첨됩니다. 여러분의 유전자는 그 추첨 때 없었으므로, 같은 방식으로 자기 코드를 추첨합니다.
- **돌연변이 풀.** 돌연변이는 시작할 때 `linkAssets()`가 채운 비공개 목록 `_gene_assets_mutations`에서 고릅니다. **퍼블리사이즈된** 어셈블리라면 여기에 추가할 수 있고, NML은 그런 어셈블리로 컴파일합니다. 빼먹으면 유전자는 플레이어가 직접 넣은 곳에만 나타납니다.

유전자의 텍스트 키는 `gene_<id>`입니다. 유전자에는 설명 줄이 없습니다: `GeneLibrary.add()`가 그것을 끕니다.

```json Mods/HelloBox/Locales/en.json
{
  "gene_hello_ember_blood": "Ember Blood"
}
```

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

이러면 그 생명체의 새 아종이 모두 이 특성을 가지고 시작합니다. 이걸 빼고 대신 `in_mutation_pot_add`에 맡기면, 언젠가 어딘가에서 저절로 나타나는데, 보통은 그쪽이 더 재미있습니다.

> [!TIP] 주문은 여기에 잘 어울립니다
> 바닐라의 마법 혈통은 주문 (spell) 하나만 주고 다른 건 없는 아종 특성입니다: `trait.addSpell("summon_lightning")` 다음, 라이브러리가 시작할 때 주문 ID를 해석했기 때문에 `trait.linkSpells()`. 두 줄이면 자식에게 이어지고, 대륙을 가로지르는 폭풍 소환사들의 눈에 보이는 혈통이 생깁니다 :PES5_CrazyPog:.
