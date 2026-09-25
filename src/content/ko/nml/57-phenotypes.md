---
title: 표현형 및 유전학
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbgoldenbrain:
order: 115
---

# 표현형 및 유전학 :wbgoldenbrain:

WorldBox의 아종 시스템에서 생물의 외형은 고정된 단일 스프라이트에 묶여 있지 않습니다. 피부 톤, 머리색, 뿔, 머리 장식 등 부모로부터 물려받고 세대를 거쳐 변이하는 **표현형(phenotype)**을 발현합니다.

이 페이지에서는 `AssetManager.phenotype_library` 의 동작 방식과 커스텀 유전 변이를 등록하는 법을 다룹니다.

## 표현형의 작동 방식

모든 아종은 할당된 표현형 풀을 가집니다:

| 속성 | 담당 기능 |
| --- | --- |
| **`id`** | 표현형 에셋의 고유 식별자 |
| **`skin_colors`** | 선택 가능한 피부색 팔레트 |
| **`hair_colors`** | 선택 가능한 머리카락 색상 팔레트 |
| **`head_pieces`** | 머리 장식, 뿔, 귀 및 얼굴 파츠 |
| **`chance`** | 아종 생성 시 선택될 확률 가중치 |

번식 시 자손은 부모의 유전 코드를 조합하며, 희박한 돌연변이 확률을 통해 새로운 표현형이 유전자 풀에 유입됩니다 :PES5_BigBrain:.

## 코드

이 코드는 불타는 피부색과 전용 뿔을 가진 표현형을 등록합니다:

```csharp Mods/HelloBox/Code/HelloPhenotypes.cs
using System;
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloPhenotypes
    {
        public const string PHENOTYPE_ID = "phenotype_hello_ember";

        public static void Initialize()
        {
            if (AssetManager.phenotype_library.has(PHENOTYPE_ID)) return;

            // 1. Create the phenotype asset
            PhenotypeAsset ember = new PhenotypeAsset
            {
                id = PHENOTYPE_ID,
                localized_key = "phenotype_name_hello_ember",
                chance = 10
            };

            // 2. Set allowed skin tone and hair color ranges
            ember.colors_skin = new List<string> { "#FF4500", "#FF8C00", "#FFA500" };
            ember.colors_hair = new List<string> { "#8B0000", "#B22222", "#FF0000" };

            AssetManager.phenotype_library.add(ember);
        }

        /** Attach this phenotype to a subspecies */
        public static void ApplyToSubspecies(Subspecies pSubspecies)
        {
            if (pSubspecies == null) return;

            if (pSubspecies.data != null && pSubspecies.data.phenotypes != null)
            {
                if (!pSubspecies.data.phenotypes.Contains(PHENOTYPE_ID))
                {
                    pSubspecies.data.phenotypes.Add(PHENOTYPE_ID);
                }
            }
        }
    }
}
```

## 커스텀 머리 장식 및 뿔 추가

머리 장식과 뿔은 `GameResources/actors/species/` 의 스프라이트 시트를 사용합니다:

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

이미지는 모드의 `GameResources/` 폴더에 배치합니다 (**[스프라이트와 리소스](#/nml/sprites-and-resources)** 참조).

## 주의해야 할 함정

- **빈 색상 목록**: 색상 목록이 비어 있으면 유닛이 마젠타색이나 검은색으로 깨져 렌더링될 수 있습니다.
- **유전적 부동**: 희귀한 표현형은 수백 년의 시뮬레이션을 거치며 자연 도태될 수 있습니다. `chance` 값을 조절하세요 :PES2_HmmmmNoted:.
- **아종 특성과 병행**: 시각적 차이뿐 아니라 게임플레이 기능도 함께 주려면 **[아종 특성](#/nml/subspecies-traits)** 과 결합하세요.
