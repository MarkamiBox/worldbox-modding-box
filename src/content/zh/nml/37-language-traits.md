---
title: 语言特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbconfused:
order: 112
---

# 语言特质 :wbconfused:

**语言**归属于城镇与王国（kingdom），随着人群扩散而发生演变漂变，并且最关键的是，它是**书籍**撰写所用的载体。语言特质（trait）是书面与口头言语本身的内在属性（stats）。

它是七大特质系统中最精简的一个，拥有最为独特的专用钩子：当有人**阅读该语言撰写的书籍**时所执行的回调代码。没错，真的 :wbscroll:。

| | |
| --- | --- |
| 库 | `AssetManager.language_traits` |
| 类 | `LanguageTrait` |
| 分组 | `AssetManager.language_trait_groups`，类 `LanguageTraitGroupAsset` |
| 运行时持有者 | `Language`，位于 `World.world.languages` |
| 本地化前缀 | `language_trait_` |
| 默认图标路径 | `ui/Icons/language_traits/` |

## 注册一个特质

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
                value = 2f,                    // 该特质的"价值"。详见下文
                rarity = Rarity.R1_Rare
            };

            AssetManager.language_traits.add(trait);

            trait.addOpposite("scribble");
            trait.base_stats["intelligence"] = 2;
        }
    }
}
```

语言的 `base_stats` **确实**会传递给单位：`Actor.updateStats()` 会把 `language.base_stats` 合并进每一位讲这种语言的人身上。合并顺序请参见 **[属性参考](#/nml/stats)**。

## 书籍阅读钩子

`read_book_trait_action` 是仅语言特质才具备的独有字段。当单位读完一本用该语言写成的书时触发：

```csharp
public delegate void BookTraitAction(Actor pActor, LanguageTrait pTrait, Book pBook);
```

```csharp
trait.value = 0.2f;   // 原版将 `value` 作为此钩子触发的概率

trait.read_book_trait_action = delegate(Actor pActor, LanguageTrait pTrait, Book pBook)
{
    if (pActor == null || !pActor.isAlive()) return;
    if (pActor.hasTrait("evil")) return;
    if (!Randy.randomChance(pTrait.value)) return;

    pActor.addTrait("hello_swift");
};
```

原版的诅咒与神圣典籍完全就是这样运行的：`words_of_madness` 判定 `value` 概率赋予 `madness` 特质，`cursed_font` 附加状态效果（status），`font_of_gods` 附加更强大的正面状态。

从原版设计中借鉴两点：

- **从 `pTrait.value` 读取几率，而非写死常量。** 特质对象作为参数传给你，正是为了让同一个委托可以复用于不同强度的多个特质。
- **对理应免疫的单位提前退出。** 原版的每一个实现都会首先检查 `evil` 或 `blessed`。

## 自定义书籍类型

上面的书籍钩子改变的是一本书做什么。**书籍类型**则是一种新的书：它叫什么、谁来写、读了能得到什么。

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

作者每次都会从整个列表里，在 `requirement_check` 通过的类型中，按 `writing_rate`（或你的 `rate_calc`，上限为 10）加权挑选一种：只要 `add()` 就够了。`path_icons` 是 `books/book_icons/` 下的一个文件夹，会被当作封面列表读取，所以借用一个原版的完全不花成本。

```json Mods/HelloBox/Locales/en.json
{
  "book_type_hello_ember_almanac": "Ember Almanac",
  "book_type_info_hello_ember_almanac": "Everything a very fast person learned about fire."
}
```

## `value` 字段

`value` 存在于每一个特质类中，但在语言特质里运用得最为广泛。原版有两种截然不同的用法：

| 用途 | 示例 |
| --- | --- |
| 语言的优雅度或品质 | `melodic` 与 `stylish_writing` 使用 `value = 3f` |
| 读书钩子的触发几率 | `words_of_madness` 使用 `value = 0.1f` |

底层机制并未强制哪种语义；为每个特质选定一种用途并保持前后一致即可。

## 互斥对立

语言特质比其他任何系统都更频繁地成对出现，因为一种语言要么拥有严谨的语法，要么就是混乱的涂鸦：

```csharp
trait.addOpposite("scribble");
```

请双向声明互斥关系，就如原版将 `scribble` 与 `nicely_structured_grammar` 互设为对立特质一样。

## 原版分组

`knowledge` · `spirit` · `harmony` · `chaos` · `miscellaneous` · `fate` · `special`

创建你自己的标签页：参见 **[特质分组与标签页](#/nml/trait-groups)**，使用 `AssetManager.language_trait_groups` 与 `LanguageTraitGroupAsset`。

## 文本本地化

```json Mods/HelloBox/Locales/en.json
{
  "language_trait_hello_clipped": "Clipped",
  "language_trait_hello_clipped_info": "Every sentence ends two words early. Nobody minds."
}
```

## 分发特质

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

`Language` 对象还会暴露出 `cities`、`kingdoms` 与 `books`，当你的代码需要探查某种语言传播到了何处时，读取这些字段最为合适。

> [!TIP] 书籍是一种被低估的传播渠道
> 一本用你的语言撰写的书籍，是一种节奏缓慢、完美融入世界生态的特质与状态传播途径。它在图书馆间流通，历经世代更迭，玩家能真切见证这一演变。极少有 Mod 会涉足此领域，而这正是它值得一试的原因 :PES4_Classy:。

## 允许新创建的语言随机获得该特质

除了通过代码手动授予外，语言特质还可以设置 `spawn_random_trait_allowed` 标志，以便在创建新语言时被自动随机抽取——这与文化（culture）的特质抽取机制完全一致。和其他所有特质页面一样的坑：

> [!WARNING] `spawn_random_trait_allowed` 仅在启动时读取一次
> 新诞生的语言是从一个候选池中随机抽取初始特质的，而该池是在游戏启动阶段由 `BaseTraitLibrary.linkAssets()` 构建完成的——彼时你的模组尚未加载。仅仅在特质上设置此布尔标志没有任何效果：它永远不会进入该池，新语言也永远不会随机获得它。你必须手动将其以原版权重添加到池中：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.language_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` 字段为 `protected`，但在 NML 提供的 publicized 程序集下能够正常编译。默认的 `spawn_random_rate` 为 `5`：调大该数值可提高其随机抽取权重。
