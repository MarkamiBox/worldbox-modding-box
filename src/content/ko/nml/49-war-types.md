---
title: 전쟁 유형
group: 게임 콘텐츠
subgroup: 세계 및 문명
icon: :wbmartialwarfare:
order: 179
---

# 전쟁 유형 :wbmartialwarfare:

게임의 모든 전쟁에는 유형이 있습니다: 평범한 정복 전쟁, 모두를 상대로 하는 원한 전쟁, 반란. 유형은 전쟁이 어떻게 이름을 얻는지, 어떤 아이콘을 보여 주는지, 동맹이 참전하는지, 그리고 어떻게 끝날 수 있는지에 관한 몇 가지 규칙을 정합니다. 바닐라에는 다섯 개뿐이라, 새로운 유형은 눈에 띕니다.

이 페이지에서는 **잿불 반목**을 만듭니다: 양쪽의 동맹을 끌어들이고, "Cinder Feud of Karvia" 같은 이름을 얻고, 평범한 전쟁처럼 평화 음모로 끝낼 수 있는 전쟁입니다.

## 코드

```csharp Mods/HelloBox/Code/HelloWars.cs
namespace HelloBox
{
    public static class HelloWars
    {
        public const string FEUD = "hello_ember_feud";
        public const string NAMES = "hello_war_feud";

        public static void Initialize()
        {
            Names();

            if (AssetManager.war_types_library.has(FEUD)) return;

            AssetManager.war_types_library.add(new WarTypeAsset
            {
                id = FEUD,
                name_template = NAMES,                      // the generator for war names, below
                localized_type = "war_type_hello_ember_feud",
                localized_war_name = "war_name_hello_ember_feud",
                path_icon = "wars/war_hello_ember_feud",    // GameResources/wars/war_hello_ember_feud.png
                kingdom_for_name_attacker = true,           // $kingdom$ in the name = the attacker
                alliance_join = true,                       // both sides' allies join
                can_end_with_plot = true                    // a king can plot to end it
            });
        }

        /** War names in the dictionary style: whole words picked from lists. */
        private static void Names()
        {
            if (AssetManager.name_generator.has(NAMES)) return;

            NameGeneratorAsset names = new NameGeneratorAsset
            {
                id = NAMES,
                use_dictionary = true,
                replacer_kingdom = NameGeneratorReplacers.replaceKingdom   // fills $kingdom$
            };
            names.addDictPart("kingdom_name", "$kingdom$");
            names.addDictPart(" ", " ");
            names.addDictPart("of", "of");
            names.addDictPart("ember", "Ember,Cinder,Ash,Smoke,Soot");
            names.addDictPart("feud", "Feud,Quarrel,Grudge,Blaze");
            names.addTemplate("ember, ,feud");
            names.addTemplate("ember, ,feud, ,of, ,kingdom_name");

            AssetManager.name_generator.add(names);
        }

        /** Start one. The game's own wars go through this same method. */
        public static War Start(Kingdom pAttacker, Kingdom pDefender)
        {
            WarTypeAsset feud = AssetManager.war_types_library.get(FEUD);
            if (feud == null || pAttacker == null || pDefender == null) return null;

            // internal: compiles inside NML. It checks there is no war between them already,
            // logs it in the world history, and pulls in the allies when alliance_join is on.
            return World.world.diplomacy.startWar(pAttacker, pDefender, feud);
        }
    }
}
```

`HelloWars.Initialize()` 는 `OnModLoad` 에 넣습니다. 하지만 여러분의 전쟁이 저절로 시작되지는 않습니다: 바닐라 전쟁은 게임의 외교 코드에서 나오고, 그 코드는 자기 다섯 유형만 압니다. `HelloWars.Start` 는 어울리는 곳에서 부르세요: **[신의 권능](#/nml/god-powers)**, 왕이 시도할 수 있는 **[음모](#/nml/plots)**, 또는 **[결정](#/nml/custom-ai)**.

## 필드

| 필드 | 하는 일 |
| --- | --- |
| `name_template` | 이 전쟁의 이름을 짓는 이름 생성기. 바닐라: `war_conquest`, `war_spite`, `war_rebellion`, `war_inspire`, `war_whisper` |
| `localized_war_name` | UI가 전쟁 유형으로 보여 주는 텍스트 키. 툴팁과 전쟁 창에 나옴 |
| `localized_type` | 게임이 유형용으로 가진 두 번째 텍스트 키. 어디에 표시되는지는 찾지 못했으니 둘 다 채우세요 |
| `path_icon` | 전쟁 아이콘. 쓴 그대로 불러옴 |
| `kingdom_for_name_attacker` | `$kingdom$` 에 들어갈 이름: 공격자(`true`) 또는 방어자(`false`) |
| `alliance_join` | 시작될 때 양쪽의 동맹이 참전 |
| `total_war` | 공격자가 원한 전쟁처럼 **모든** 왕국과 전쟁 상태가 됨. 방어자 없이 시작 |
| `rebellion` | 반란으로 표시. 누가 누구에게 합류할 수 있는지가 바뀜 |
| `can_end_with_plot` | 충분히 오래되면 왕이 평화 음모로 끝낼 수 있음 |
| `forced_war` | 지금은 아무도 부르지 않는 도우미 하나만 읽음. 꺼 두세요 |

> [!WARNING] 총력전에는 방어자가 없습니다
> `total_war` 에서는 방어자가 `null` 이라서, `$kingdom$` 이 있고 `kingdom_for_name_attacker = false` 인 이름 템플릿은 아무도 아닌 자의 이름을 요구합니다. 총력전은 공격자 이름으로 지으세요 :PES2_Shrug:.

## 텍스트

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

이름 자체("Cinder Grudge of Karvia")는 생성되므로 키가 없습니다. 단어들은 `Names()` 의 사전에서 옵니다. 번역하고 싶다면 언어마다 생성기가 필요하고, 바닐라 전쟁도 그렇게까지는 하지 않습니다.

## 직접 만든 아이콘

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

테스트하는 동안에는 바닐라 것을 빌리세요: `wars/war_conquest`, `wars/war_spite`, `wars/war_rebellion`, `wars/war_whisper`.

> [!NOTE] 세이브는 유형을 ID로 기억합니다
> 전쟁은 자기 유형의 ID를 세이브에 저장합니다. 여러분의 모드 없이 그 세계를 불러오면, 전쟁은 더 이상 없는 유형을 찾다가 아무것도 받지 못하고, 좋게 끝날 거라고는 장담 못 합니다. 플레이어가 전쟁 도중에 모드를 빼는 위험은 완전히 막을 수 없지만, 모드 설명에 한 줄 적어 둘 가치는 있습니다.
