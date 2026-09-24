---
title: 书籍
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbscroll:
order: 187
---

# 书籍 :wbscroll:

单位写书，城市收藏书，其他单位读完之后会有一点变化。书籍类型就是这个循环里的一种新书：谁来写、叫什么、封面长什么样、读了会对你产生什么影响。

**[语言特质](#/nml/language-traits)** 页面已经做过一本小书，余烬年鉴。这一页拿同一本书把它做完整：自己的书名、真正的奖励，以及读书时发生的事。

## 一本书是怎么诞生的

这里什么都不需要打补丁，只要了解这个循环：

1. 一个单位决定写书。游戏收集所有对这个单位 `requirement_check` 通过的书籍类型。
2. 每种类型按 `writing_rate` 次（如果设置了 `rate_calc` 就按它的次数）放进袋子，**最多 10 次**，然后抽出一个。
3. 书需要作者所在**城市**里有一栋带空书位的建筑（building）。没有图书馆，就没有书。
4. 书名来自 `name_template` 里的名字生成器，封面来自 `path_icons` 里的文件夹。
5. 之后，有人读了这本书，得到下面的奖励。

因为游戏每次都重新读取 `book_types.list`，书籍类型只需要 `add()`。不用池，不用 post-init。难得的惊喜 :PESgn_Neat:。

## 代码

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

这个文件**替换**语言特质（trait）页面里的 `HelloBooks.cs`，它就是同一个类长大后的样子。`HelloBooks.Initialize()` 要放在它用到的特质和状态（status）之后。

## 读书能得到什么

`base_stats` 里的数值不是会消失的增益。每读一次就发放一次：

| 属性（stats） | 读者得到什么 |
| --- | --- |
| `happiness` | 这么多幸福度，作为"刚读完一本书"事件。负数也行，用于让人消沉的书 |
| `experience` | 这么多经验 |
| `mana` | 这么多法力 |
| `diplomacy`、`warfare`、`stewardship`、`intelligence` | **永久**加到读者身上。每读一次加一次 |

最后一行最强。一本给 `intelligence = 1` 的书，会让爱读书的城市一代比一代聪明，所以数值要小。一本 +10 的书，就是 50 年内得到一个天才王国（kingdom）的方法 :wbgenius:。

语言和文化（culture）特质能改变前两项：拥有 `beautiful_calligraphy` 的语言会让幸福度更高，拥有 `reading_lovers` 的文化会把悲伤的书变成开心的书。

## 重要字段

| 字段 | 作用 |
| --- | --- |
| `name_template` | 书名用的名字生成器。原版的有：`book_name_fable`、`book_name_love_story`、`book_name_history`... |
| `writing_rate` | 作者挑选类型时它的权重。原版用 1 到 3 |
| `rate_calc` | 返回权重的方法，比如原版战争手册用作者的 `warfare`。同样最多 10 |
| `requirement_check` | 谁可以写它。`null` = 任何人 |
| `read_action` | 你自己的代码，每读一次运行一次 |
| `path_icons` | `books/book_icons/` 下的一个文件夹，作为图片列表读取。每本书挑一张 |
| `color_text` | 界面里书名的颜色 |
| `save_culture` / `save_religion` | 书是否记住作者的文化和宗教（religion）。默认都开启，对传播信仰的书很重要 |

## 书名生成器

书名使用 **[名字生成器](#/nml/name-generators)** 里的词典风格。模板是一串词典键，每个键从自己的列表里挑一个词：

- `addDictPart("almanac", "Almanac,Handbook,Notes")` 创建一个有三个候选词的键。
- `addTemplate("almanac,of,fire")` 从每个键里各取一个词拼起来："Handbook of Ash"。
- 像 `$unit$` 和 `$city$` 这样的词是占位符。**replacer** 会用作者真实的名字或城市填进去。没有对应的 replacer，封面上就会原样印着 `$unit$` :wbfacepalm:。

克隆 `$base_book_template$` 是捷径：它已经有了小词（`of`、`and`、`about`、`the`...）、所有占位符，以及游戏自己的书名整理。

## 文本

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

键是固定的：`book_type_<id>` 和 `book_type_info_<id>`。书名本身是生成的，所以没有键。

## 你自己的封面

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── books/
        └── book_icons/
            └── hello_almanac/     <- one PNG per cover, any names
```

`path_icons` 是一个**文件夹**，末尾带 `/`。一张 PNG 就够，只要放在里面。测试时可以先借用原版文件夹，比如 `fable/`。

想看它生效，就建一个世界，让一座有你那个特质的城市发展到建起图书馆，然后打开城市的书籍列表。要等一阵，毕竟是本书 :PES2_Shrug:。
