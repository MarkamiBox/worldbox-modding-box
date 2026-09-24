---
title: 책
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbscroll:
order: 187
---

# 책 :wbscroll:

유닛은 책을 쓰고, 도시는 책을 보관하고, 다른 유닛은 그걸 읽고 조금 달라져서 나옵니다. 책 종류란 이 순환 속의 새로운 종류의 책입니다: 누가 쓰는지, 제목이 뭔지, 표지가 어떻게 생겼는지, 읽으면 무슨 일이 생기는지.

**[언어 특성](#/nml/language-traits)** 페이지에서 이미 작은 책 하나, 잿불 연감을 만들었습니다. 이 페이지는 같은 책을 가져와 완성합니다: 자기만의 제목, 제대로 된 보상, 그리고 읽을 때 일어나는 일.

## 책이 태어나는 과정

여기선 패치가 전혀 필요 없고, 순환만 알면 됩니다:

1. 유닛이 글을 쓰기로 합니다. 게임은 그 유닛에 대해 `requirement_check` 를 통과하는 모든 책 종류를 모읍니다.
2. 각각이 `writing_rate` 번(설정했다면 `rate_calc` 번) 주머니에 들어가고, **최대 10번**, 그중 하나를 뽑습니다.
3. 책에는 작가의 **도시**에 빈 책 자리가 있는 건물이 필요합니다. 도서관이 없으면 책도 없습니다.
4. 제목은 `name_template` 의 이름 생성기에서, 표지는 `path_icons` 의 폴더에서 옵니다.
5. 나중에 누군가 그걸 읽고 아래의 보상을 받습니다.

게임이 매번 `book_types.list` 를 새로 읽기 때문에, 책 종류에는 `add()` 하나면 충분합니다. 풀도, post-init도 없습니다. 드문 반가운 일이죠 :PESgn_Neat:.

## 코드

```csharp Mods/HelloBox/Code/HelloBooks.cs
namespace HelloBox
{
    public static class HelloBooks
    {
        public const string ALMANAC = "hello_ember_almanac";
        public const string TITLES = "hello_book_titles";

        public static void Initialize()
        {
            Titles();

            if (AssetManager.book_types.has(ALMANAC)) return;

            BookTypeAsset almanac = new BookTypeAsset
            {
                id = ALMANAC,
                name_template = TITLES,              // our own titles, below
                color_text = "#D14219",
                writing_rate = 2,
                path_icons = "hello_almanac/",       // GameResources/books/book_icons/hello_almanac/
                requirement_check = (Actor pActor, BookTypeAsset pAsset) => pActor.hasTrait(HelloTraits.SWIFT),
                read_action = (Actor pActor, BookTypeAsset pAsset) =>
                {
                    // runs once per read, on the reader
                    StatusAsset curse = AssetManager.status.get(HelloStatus.CURSED);
                    if (curse != null) World.world.statuses.newStatus(pActor, curse, 0f);
                }
            };

            AssetManager.book_types.add(almanac);

            // what a reader gets out of it
            almanac.base_stats["experience"] = 5f;
            almanac.base_stats["happiness"] = 5f;
            almanac.base_stats["intelligence"] = 1f;   // this one is permanent, see below
        }

        /** A title generator in the dictionary style, built on the game's own book template. */
        private static void Titles()
        {
            if (AssetManager.name_generator.has(TITLES)) return;

            // $base_book_template$ already knows "of", "and", "about" and all the $name$ slots
            NameGeneratorAsset titles = AssetManager.name_generator.clone(TITLES, "$base_book_template$");
            titles.replacer += NameGeneratorReplacers.replaceOwnName;   // fills $unit$ with the writer
            titles.replacer += NameGeneratorReplacers.replaceOwnCity;   // fills $city$

            titles.addDictPart("almanac", "Almanac,Handbook,Notes,Scribbles,Field Guide");
            titles.addDictPart("fire", "Fire,Embers,Ash,Sparks,Smoke");
            titles.addTemplate("almanac,of,fire");
            titles.addTemplate("almanac,of,$unit$");
            titles.addTemplate("fire,and,$city$");
        }
    }
}
```

이 파일은 언어 특성 페이지의 `HelloBooks.cs` 를 **대체합니다**. 같은 클래스가 자란 모습입니다. `HelloBooks.Initialize()` 는 이 클래스가 쓰는 특성과 상태 뒤에 둡니다.

## 읽으면 얻는 것

`base_stats` 의 숫자는 시간이 지나면 사라지는 버프가 아닙니다. 읽을 때마다 한 번씩 나눠 줍니다:

| 능력치 | 읽은 사람이 받는 것 |
| --- | --- |
| `happiness` | 그만큼의 행복, "방금 책을 읽음" 이벤트로. 음수도 됩니다, 우울한 책용 |
| `experience` | 그만큼의 경험치 |
| `mana` | 그만큼의 마나 |
| `diplomacy`, `warfare`, `stewardship`, `intelligence` | 읽은 사람에게 **영구히** 더해짐. 읽을 때마다 또 |

마지막 줄이 강력합니다. `intelligence = 1` 을 주는 책은 책 읽는 도시를 세대마다 더 똑똑하게 만드니, 값을 작게 두세요. +10짜리 책이면 50년 안에 천재 왕국이 됩니다 :wbgenius:.

언어와 문화 특성이 처음 두 개를 바꿀 수 있습니다: `beautiful_calligraphy` 를 가진 언어는 행복을 더 크게 만들고, `reading_lovers` 를 가진 문화는 슬픈 책을 즐거운 책으로 바꿉니다.

## 중요한 필드

| 필드 | 하는 일 |
| --- | --- |
| `name_template` | 제목용 이름 생성기. 바닐라 예시: `book_name_fable`, `book_name_love_story`, `book_name_history`... |
| `writing_rate` | 작가가 종류를 고를 때의 가중치. 바닐라는 1~3 |
| `rate_calc` | 대신 가중치를 돌려주는 메서드. 바닐라 전쟁 교본은 작가의 `warfare` 를 씁니다. 여전히 최대 10 |
| `requirement_check` | 누가 쓸 수 있는지. `null` = 누구나 |
| `read_action` | 여러분의 코드, 읽을 때마다 한 번 |
| `path_icons` | `books/book_icons/` 아래 폴더로, 그림 목록으로 읽힘. 책마다 하나가 골라짐 |
| `color_text` | UI에서 제목의 색 |
| `save_culture` / `save_religion` | 책이 작가의 문화와 종교를 기억하는지. 둘 다 기본으로 켜져 있고, 신앙을 퍼뜨리는 책에 중요 |

## 제목 생성기

제목은 **[이름 생성기](#/nml/name-generators)** 의 사전 스타일을 씁니다. 템플릿은 사전 키 목록이고, 각 키가 자기 목록에서 단어 하나를 고릅니다:

- `addDictPart("almanac", "Almanac,Handbook,Notes")` 는 후보 단어가 세 개인 키를 만듭니다.
- `addTemplate("almanac,of,fire")` 는 각 키에서 단어 하나씩 이어 붙입니다: "Handbook of Ash".
- `$unit$` 과 `$city$` 같은 단어는 자리 표시자입니다. **replacer** 가 작가의 실제 이름이나 도시로 채웁니다. 맞는 replacer가 없으면 표지에 `$unit$` 이 글자 그대로 나옵니다 :wbfacepalm:.

`$base_book_template$` 을 복제하는 게 지름길입니다: 작은 단어들(`of`, `and`, `about`, `the`...), 모든 자리 표시자, 게임 자체의 제목 다듬기가 이미 들어 있습니다.

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

키는 고정입니다: `book_type_<id>` 와 `book_type_info_<id>`. 제목 자체는 생성되므로 키가 없습니다.

## 직접 만든 표지

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` 는 끝에 `/` 가 붙은 **폴더**입니다. PNG 하나면 충분하고, 안에만 있으면 됩니다. 테스트하는 동안에는 `fable/` 같은 바닐라 폴더를 빌려 쓰세요.

작동하는 걸 보려면 세계를 만들고, 여러분의 특성을 가진 도시가 도서관을 지을 때까지 키운 다음, 도시의 책을 열어 보세요. 시간이 걸립니다, 책이니까요 :PES2_Shrug:.
