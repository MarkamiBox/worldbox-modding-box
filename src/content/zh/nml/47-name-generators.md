---
title: 名字生成器
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbscroll:
order: 186
---

# 名字生成器 :wbscroll:

WorldBox 里的每个名字都出自某个生成器：单位、城市、王国、氏族、战争、书籍。你的生物也可以有自己的生成器，这样一个余烬精灵的村子里满是 Ashra 和 Cindox，而不是借用人类的名字。

## 名字是从哪来的

三步，从生物一直到字母：

| 步骤 | 资产 | 里面有什么 |
| --- | --- | --- |
| 生物 | `ActorAsset.name_template_sets` | 一组**名字集**的 id。每个文化选其中一个 |
| 名字集 | `NameSetAsset`（`name_sets`） | 每类东西用哪个生成器：`unit`、`city`、`kingdom`、`clan`、`family`、`culture`、`language`、`religion` |
| 生成器 | `NameGeneratorAsset`（`name_generator`） | 名字具体怎么拼出来 |

所以要给整个物种改名，你需要做一个生成器、一个使用它的名字集，再让生物指向这个名字集。

## 拼名字的三种方式

生成器有三种风格，游戏根据你填了哪些字段来决定用哪种：

- **片段组。** 一组组片段，从每组里随机取一段拼在一起。最简单，也是本页用的方式。
- **词典。** 从有名字的词表里挑出完整的词，组成一句话。战争和书籍就是这样得到 "Bloody Hatred" 这种标题的。见 **[战争类型](#/nml/war-types)** 和 **[书籍](#/nml/books)**。
- **命名学（Onomastics）。** 大多数原版文明使用的一种紧凑文本格式，还能让名字在文化中随时间演变。很强大，但我不建议从它开始：想用的话从 `NameGeneratorLibrary` 里复制一个，改改音节就好。

## 代码

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

然后在你 **[自定义生物](#/nml/custom-actors)** 里的生物上：

```csharp
asset.name_template_sets = new string[] { HelloNames.SET };
```

`HelloNames.Initialize()` 在 `OnModLoad` 里要放在生物**之前**，因为生物指向了名字集。

> [!WARNING] 名字集的每一栏都要填
> 文化会向名字集为每类东西要一个生成器。`city` 栏空着，意味着游戏会去找一个叫 `""` 的生成器，拿到 `null`，然后你的生物建立的第一座城市就会把游戏一起带崩。实在没有更好的，就每栏都填同一个生成器 :PESgn_Stop:。

## 模板里的词

模板是一串用逗号分隔的词。对片段组生成器来说，有用的是这些：

| 词 | 添加什么 |
| --- | --- |
| `part_group` / `Part_group` | 从每个 `addPartGroup` 组里取一段。大写 P 会把首字母变成大写 |
| `part_group2`、`part_group3` | 对 `addPartGroup2` 和 `addPartGroup3` 做同样的事，用于第二或第三个词 |
| `space` | 一个空格，所以 `Part_group,space,Part_group2` 就是名加姓 |
| `vowel` / `consonant` | 从你的 `vowels` / `consonants` 里取一个字母 |
| `number` | 0 到 9 的一个数字。给机器人用的吧，我猜 |

多调用几次 `addTemplate`，游戏会为每个名字随机挑一个模板。

## 不用等生孩子就能测试

`NameGenerator.getName` 是公开的，所以可以在加载时往日志里打印十个名字：

```csharp
for (int i = 0; i < 10; i++)
{
    LogInfo(NameGenerator.getName(HelloNames.GENERATOR));
}
```

如果一半名字看起来像猫踩过键盘，说明你的片段组太长了。片段短一点，组多一点。命中游戏黑名单的名字会被丢弃重新生成，所以你永远不会看到那些名字 :PES5_Noted:。

至于由完整单词组成的标题（战争、书籍、格言），你要的是词典风格，接下来的两页各会做一个。
