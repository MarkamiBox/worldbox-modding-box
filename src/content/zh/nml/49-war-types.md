---
title: 战争类型
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbmartialwarfare:
order: 179
---

# 战争类型 :wbmartialwarfare:

游戏里的每场战争（war）都有一个类型：普通的征服战、对所有人的怨恨战、叛乱。类型决定了战争怎么得名、显示哪个图标、盟友会不会加入，以及几条关于战争怎么结束的规则。原版只有五种，所以新加一种很显眼。

这一页要做的是**余烬世仇**：一场会把双方盟友都卷进来的战争，名字像 "Cinder Feud of Karvia" 这样，并且可以像普通战争一样用和平阴谋（plot）来结束。

## 代码

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

`HelloWars.Initialize()` 放进 `OnModLoad`。不过没有什么会自动发动你的战争：原版战争来自游戏的外交代码，而它只认识自己的五种类型。在合适的地方调用 `HelloWars.Start`：一个 **[神力](#/nml/god-powers)**、一个国王可以尝试的 **[阴谋](#/nml/plots)**，或者一个 **[决策](#/nml/custom-ai)**。

## 字段

| 字段 | 作用 |
| --- | --- |
| `name_template` | 给这场战争起名用的名字生成器。原版：`war_conquest`、`war_spite`、`war_rebellion`、`war_inspire`、`war_whisper` |
| `localized_war_name` | 界面上作为战争类型显示的文本键，出现在提示框和战争窗口里 |
| `localized_type` | 游戏为类型记录的第二个文本键。我没找到它显示在哪里，所以两个都填上 |
| `path_icon` | 战争的图标，按写的路径原样加载 |
| `kingdom_for_name_attacker` | `$kingdom$` 填谁的名字：进攻方（`true`）还是防守方（`false`） |
| `alliance_join` | 战争开始时，双方的同盟都会加入 |
| `total_war` | 进攻方与**所有**王国（kingdom）交战，就像怨恨战。开战时不带防守方 |
| `rebellion` | 标记为叛乱，这会改变谁能加入谁 |
| `can_end_with_plot` | 战争持续够久后，国王可以用和平阴谋结束它 |
| `forced_war` | 只有一个目前没人调用的辅助方法会读它。保持关闭 |

> [!WARNING] 全面战争没有防守方
> 开启 `total_war` 时防守方是 `null`，所以带 `$kingdom$` 且 `kingdom_for_name_attacker = false` 的名字模板会去要一个不存在的名字。全面战争就用进攻方来命名吧 :PES2_Shrug:。

## 文本

```json Mods/HelloBox/Locales/en.json
{
  "war_type_hello_ember_feud": "Ember Feud",
  "war_name_hello_ember_feud": "Ember Feud"
}
```

名字本身（"Cinder Grudge of Karvia"）是生成的，所以没有键。那些词来自 `Names()` 里的词典。想要翻译的话，得每种语言做一个生成器，原版战争也没这么做。

## 你自己的图标

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── wars/
        └── war_hello_ember_feud.png
```

测试时可以先借用原版的：`wars/war_conquest`、`wars/war_spite`、`wars/war_rebellion` 或 `wars/war_whisper`。

> [!NOTE] 存档按 id 记住类型
> 战争会把它的类型 id 存进存档。不带你的 mod 载入那个世界，战争会去要一个已经不存在的类型，什么也拿不到，我可不敢保证结局会好。玩家在战争打到一半时删掉 mod，这个风险你没法完全解决，但值得在 mod 描述里写一句。
