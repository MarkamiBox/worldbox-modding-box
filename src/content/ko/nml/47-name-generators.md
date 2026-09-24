---
title: 이름 생성기
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbscroll:
order: 186
---

# 이름 생성기 :wbscroll:

WorldBox의 모든 이름은 생성기에서 나옵니다: 유닛, 도시, 왕국, 씨족, 전쟁, 책. 여러분의 생물도 자기만의 생성기를 가질 수 있어서, 잿불 정령 마을을 사람 이름을 빌려 쓰는 대신 Ashra와 Cindox로 가득 채울 수 있습니다.

## 이름은 어디서 오는가

생물에서 글자까지, 세 단계입니다:

| 단계 | 에셋 | 담고 있는 것 |
| --- | --- | --- |
| 생물 | `ActorAsset.name_template_sets` | **이름 세트** ID 목록. 문화마다 하나가 골라짐 |
| 이름 세트 | `NameSetAsset` (`name_sets`) | 종류마다 쓸 생성기: `unit`, `city`, `kingdom`, `clan`, `family`, `culture`, `language`, `religion` |
| 생성기 | `NameGeneratorAsset` (`name_generator`) | 이름을 실제로 어떻게 만드는지 |

그러니 종족 전체의 이름을 바꾸려면 생성기를 만들고, 그걸 쓰는 이름 세트를 만들고, 생물이 그 세트를 가리키게 하면 됩니다.

## 이름을 만드는 세 가지 방법

생성기는 세 가지 스타일 중 하나로 작동하고, 어떤 필드를 채웠는지에 따라 게임이 고릅니다:

- **파트 그룹.** 그룹 목록이 있고, 각 그룹에서 무작위 조각 하나씩을 붙입니다. 가장 간단하고, 이 페이지에서 쓰는 방법입니다.
- **사전.** 이름 붙은 목록에서 단어를 통째로 골라 문장으로 만듭니다. 전쟁과 책이 "Bloody Hatred" 같은 제목을 얻는 방식입니다. **[전쟁 유형](#/nml/war-types)** 과 **[책](#/nml/books)** 을 보세요.
- **오노마스틱스.** 대부분의 바닐라 문명이 쓰는 압축된 문자열 형식으로, 문화 안에서 이름이 시간이 지나며 변하게도 해 줍니다. 강력하지만 이걸로 시작하진 않겠습니다. 쓰고 싶다면 `NameGeneratorLibrary` 에서 하나를 복사해 음절만 바꾸세요.

## 코드

```csharp Mods/HelloBox/Code/HelloNames.cs
namespace HelloBox
{
    public static class HelloNames
    {
        public const string GENERATOR = "hello_sprite_name";
        public const string SET = "hello_sprite_set";

        public static void Initialize()
        {
            if (AssetManager.name_generator.has(GENERATOR)) return;

            NameGeneratorAsset generator = new NameGeneratorAsset
            {
                id = GENERATOR,
                // post_init() fills these two for part-group generators, and it already ran.
                // Female names add a vowel from this list, so leaving it null crashes.
                vowels = new string[] { "a", "e", "i", "o" },
                consonants = NameGeneratorAsset.consonants_sounds
            };

            // one piece from each group, in order. An empty entry means "sometimes nothing"
            generator.addPartGroup("ash,cin,em,sol,vol,ky");
            generator.addPartGroup("a,e,i,o,,");
            generator.addPartGroup("ra,dox,ber,rin,th,x");
            generator.addTemplate("Part_group");   // capital P = first letter upper case

            AssetManager.name_generator.add(generator);

            // the same generator for everything these creatures ever name
            AssetManager.name_sets.add(new NameSetAsset
            {
                id = SET,
                unit = GENERATOR,
                city = GENERATOR,
                kingdom = GENERATOR,
                clan = GENERATOR,
                family = GENERATOR,
                culture = GENERATOR,
                language = GENERATOR,
                religion = GENERATOR
            });
        }
    }
}
```

그다음 **[사용자 정의 액터](#/nml/custom-actors)** 의 생물에:

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

액터가 세트를 가리키므로, `HelloNames.Initialize()` 는 `OnModLoad` 에서 액터보다 **먼저** 둡니다.

> [!WARNING] 이름 세트의 모든 칸을 채우세요
> 문화는 종류마다 이름 세트에 생성기를 물어봅니다. `city` 칸이 비어 있으면 게임은 `""` 라는 생성기를 찾아 `null` 을 받고, 여러분의 생물이 세운 첫 도시가 게임을 통째로 무너뜨립니다. 더 나은 게 없다면 모든 칸에 같은 생성기를 넣으세요 :PESgn_Stop:.

## 템플릿 단어

템플릿은 쉼표로 구분한 단어 목록입니다. 파트 그룹 생성기에서 쓸모 있는 것들은 이렇습니다:

| 단어 | 추가하는 것 |
| --- | --- |
| `part_group` / `Part_group` | 각 `addPartGroup` 그룹에서 조각 하나씩. 대문자 P는 첫 글자를 대문자로 |
| `part_group2`, `part_group3` | `addPartGroup2` 와 `addPartGroup3` 에 대해 같은 일. 두 번째, 세 번째 단어용 |
| `space` | 공백. 그래서 `Part_group,space,Part_group2` 는 이름과 성이 됨 |
| `vowel` / `consonant` | 여러분의 `vowels` / `consonants` 에서 글자 하나 |
| `number` | 0~9 숫자 하나. 로봇용이겠죠 |

`addTemplate` 을 여러 번 부르면 게임이 이름마다 무작위로 템플릿을 고릅니다.

## 아기를 기다리지 않고 테스트하기

`NameGenerator.getName` 은 public이라서, 로드할 때 로그에 이름 열 개를 찍을 수 있습니다:

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

절반이 고양이가 키보드 위를 걸어간 것처럼 보인다면 그룹이 너무 깁니다. 조각은 짧게, 그룹은 많게. 게임 블랙리스트에 걸리는 이름은 버려지고 다시 뽑히니, 그런 이름은 절대 보지 않습니다 :PES5_Noted:.

단어를 통째로 쓰는 제목(전쟁, 책, 표어)에는 사전 스타일이 맞고, 다음 두 페이지에서 각각 하나씩 만듭니다.
