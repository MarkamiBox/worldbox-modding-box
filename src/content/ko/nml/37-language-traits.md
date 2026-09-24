---
title: 언어 특성
group: 게임 콘텐츠
subgroup: 특성 및 유전
icon: :wbconfused:
order: 112
---

# 언어 특성 :wbconfused:

**언어**는 도시와 왕국에 귀속되며 확산 과정에서 변천하고, 가장 결정적으로 **책**이 저술되는 매개체가 됩니다. 언어 특성은 문자 및 음성 언어 자체의 고유한 성질을 의미합니다.

7가지 특성 (trait) 시스템 중 규모가 가장 작으며, 누군가 그 언어로 쓰인 **책을 읽을 때** 발동하는 가장 독특한 훅을 제공합니다. 네, 정말로요 :wbscroll:.

| | |
| --- | --- |
| 라이브러리 | `AssetManager.language_traits` |
| 클래스 | `LanguageTrait` |
| 그룹 | `AssetManager.language_trait_groups`, 클래스 `LanguageTraitGroupAsset` |
| 런타임 소유자 | `Language`, `World.world.languages` 내부 |
| 로컬라이제이션 접두사 | `language_trait_` |
| 기본 아이콘 폴더 | `ui/Icons/language_traits/` |

## 등록하기

```csharp Mods/HelloBox/Code/HelloLanguage.cs
namespace HelloBox
{
    public static class HelloLanguage
    {
        public const string CLIPPED = "hello_clipped";

        public static void Initialize()
        {
            if (AssetManager.language_traits.has(CLIPPED)) return;

            LanguageTrait trait = new LanguageTrait
            {
                id = CLIPPED,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "knowledge",
                path_icon = "ui/Icons/iconHelloLanguage",
                value = 2f,                    // 이 특성의 "가치". 아래 참고
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

언어의 `base_stats` 는 유닛에게 **실제로 적용됩니다**: `Actor.updateStats()` 가 해당 언어를 구사하는 모든 이에게 `language.base_stats` 를 결합합니다. 결합 순서는 **[스탯 레퍼런스](#/nml/stats)** 를 참고하세요.

## 독서 훅

`read_book_trait_action` 은 오직 언어 특성만이 가진 전용 필드입니다. 유닛이 그 언어로 작성된 책을 다 읽었을 때 실행됩니다:

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // 바닐라는 이 훅의 발동 확률로 `value` 를 재활용함

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

바닐라의 저주받거나 축복받은 서적이 바로 이렇게 작동합니다: `words_of_madness` 는 `value` 에 따라 `madness` 특성을 부여하고, `cursed_font` 는 상태 효과를 입히며, `font_of_gods` 는 한층 강력한 효과를 부여합니다.

바닐라에서 반드시 본받아야 할 두 가지 규칙:

- **상수가 아닌 `pTrait.value` 로부터 확률을 읽어올 것.** 단 하나의 델리게이트로 강도가 다른 여러 특성을 유연하게 처리할 수 있도록 특성 객체가 전달되는 것입니다.
- **면역이어야 할 유닛은 초기에 조기 탈출시킬 것.** 모든 바닐라 코드는 `evil` 이나 `blessed` 특성을 먼저 검사합니다.

## 나만의 책 종류 만들기

위의 책 훅은 책이 하는 일을 바꿉니다. **책 종류**는 새로운 종류의 책으로, 이름이 무엇인지, 누가 쓰는지, 읽으면 무엇을 주는지를 정합니다.

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";

        public static void Initialize()
        {
            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = "book_name_fable",   // a vanilla name template
                color_text = "#D14219",
                writing_rate = 2,                    // weight against the other book types
                path_icons = "fable/",               // borrow the fables' covers: books/book_icons/fable/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT)
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
        }
    }
}
```

작가는 매번 전체 목록에서, `requirement_check`를 통과한 종류들 중 `writing_rate`(또는 여러분의 `rate_calc`, 최대 10)로 가중치를 두어 하나를 고릅니다: `add()`면 충분합니다. `path_icons`는 표지 목록으로 읽히는 `books/book_icons/` 아래의 폴더이므로, 바닐라 것을 빌려 쓰는 데 아무 비용도 들지 않습니다.

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## `value` 필드

`value` 는 모든 특성 클래스에 존재하지만 언어에서 가장 폭넓게 활용됩니다. 바닐라는 이를 두 가지 목적으로 사용합니다:

| 용도 | 예시 |
| --- | --- |
| 언어의 품격 및 완성도 | `melodic` 및 `stylish_writing` 에서 `value = 3f` 사용 |
| 독서 훅 발동 확률 | `words_of_madness` 에서 `value = 0.1f` 사용 |

어느 쪽으로 쓸지는 모더의 자유입니다. 특성당 하나의 용도를 명확히 정하고 일관성을 유지하세요.

## 상반된 특성

언어 특성은 체계적인 문법이 있느냐 엉망진창 낙서 수준이냐처럼 흑백이 갈리는 경우가 많아 반대 특성으로 묶이는 일이 흔합니다:

```csharp
trait.addOpposite("scribble");
```

바닐라가 `scribble` 과 `nicely_structured_grammar` 를 상호 반대로 선언한 것처럼 양방향 모두에서 등록하세요.

## 바닐라 그룹

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

나만의 탭 만들기: **[특성 그룹 및 탭](#/nml/trait-groups)** 참조 (`AssetManager.language_trait_groups` 및 `LanguageTraitGroupAsset`).

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## 특성 부여하기

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addLanguageTrait(HelloLanguage.CLIPPED);
```

```csharp
foreach (Language language in World.world.languages)
{
    if (language == null || language.isRekt()) continue;

    language.addTrait(HelloLanguage.CLIPPED, pRemoveOpposites: true);
}
```

`Language` 객체는 `cities`, `kingdoms`, `books` 도 제공하므로 특정 언어의 전파 현황을 추적할 때 유용하게 쓰입니다.

> [!TIP] 책은 과소평가된 보급 수단입니다
> 내가 만든 언어로 쓰인 책은 특성이나 상태 효과를 세상에 자연스럽게 퍼뜨리는 훌륭한 방법입니다. 도서관을 통해 순환되고 세대를 거쳐 확산되며 플레이어가 그 과정을 지켜볼 수 있습니다. 이 시스템을 건드리는 모더가 거의 없기에 더욱 도전해볼 가치가 있습니다 :PES4_Classy:.

## 새로 생기는 언어가 특성을 스스로 뽑도록 하기

직접 부여하는 방법 외에도, 언어 특성은 `spawn_random_trait_allowed`를 설정해 새 언어가 생겨날 때 뽑히도록 할 수 있습니다. 문화가 초기 특성을 뽑는 방식과 동일합니다. 다른 모든 특성 페이지와 똑같은 함정입니다:

> [!WARNING] `spawn_random_trait_allowed`는 게임 시작 시 딱 한 번만 읽힙니다
> 새로 생기는 언어는 게임이 로드되는 동안 `BaseTraitLibrary.linkAssets()`가 만드는 풀에서 초기 특성을 뽑습니다. 이는 여러분의 모드가 존재하기도 전의 시점입니다. 특성에 이 플래그를 켜는 것만으로는 아무것도 바뀌지 않습니다. 여러분의 특성은 그 풀에 절대 들어가지 않으며, 새로 생긴 언어에게 우연히 부여되는 일도 없습니다. 바닐라와 같은 가중치로 직접 넣어주세요:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.language_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly`는 `protected`이므로, NML이 모드를 빌드할 때 이미 사용하는 publicize된 어셈블리를 기준으로 컴파일됩니다. `spawn_random_rate`의 기본값은 `5`이며, 값을 올릴수록 더 자주 등장합니다.
