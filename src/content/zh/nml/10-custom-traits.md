---
title: 自定义特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbstrongminded:
order: 100
---

# 自定义特质 :wbstrongminded:

特质 (Trait) 是打在生物身上的永久属性（stats）标签：*勇敢*、*神速*、*永生*。它会直接显示在生物面板上，能够修改单位的基础属性数值，可以在生物诞生、受击或死亡时执行你编写的代码，甚至能像遗传基因一样传给下一代。

它同时也是整个游戏里制作成本最低的模组内容，正因如此，几乎所有人的第一个 WorldBox 模组都是从特质起步的。我的不是：我的第一个模组只是套在别人模组外面的一层包装，这本身就是一种作弊 :trollface:。

## 永远为你的 ID 加上唯一样式前缀

WorldBox 中的所有资源（resource）都保存在一个以 `id` 为键名的单层扁平字典中。如果你注册了一个名为 `fast` 的特质，而另一个模组也注册了一个 `fast`，后加载的那一个就会直接**覆盖抹掉**前一个，并且在没人注意的控制台日志里只轻描淡写地留下一句覆盖警告。

因此：请使用 `hello_swift`，而不是单单叫 `swift`。模组简称 + 下划线 + 你的特质名。这个命名铁律适用于特质、装备、建筑（building）、神圣能力、状态效果（status），适用于一切资源 :aPES4_Noted:。

## 定义与注册特质

```csharp Mods/HelloBox/Code/HelloTraits.cs
namespace HelloBox
{
    public static class HelloTraits
    {
        // ID 只在常量里完整书写一次。其他所有代码文件全部引用 HelloTraits.SWIFT，
        // 这样手滑拼错就会在编译阶段直接报错，而不是作为一个无动于衷的特质静默失效。
        public const string SWIFT = "hello_swift";

        public static void Initialize()
        {
            // 绝不要重复注册同一个 ID。资源库会抛出警告并直接覆盖。
            if (AssetManager.traits.has(SWIFT)) return;

            ActorTrait swift = new ActorTrait
            {
                id = SWIFT,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                path_icon = "ui/Icons/iconSpeed",   // 原版已有图标，后续可随时替换成自己的
                group_id = "physique",              // 该特质归属于特质图鉴的哪一个分类标签页
                rate_birth = 0,                     // 0 = 婴儿自然出生时绝不会天生携带
                can_be_given = true,                // 允许玩家在特质编辑器中手动添加
                can_be_removed = true,
                can_be_cured = false
            };

            // add() 会向系统注册该特质，并同时在内存中为其分配属性字典块。两者按此顺序依次完成。
            AssetManager.traits.add(swift);

            swift.base_stats["speed"] = 20f;
            swift.base_stats["attack_speed"] = 10f;
            swift.base_stats["damage"] = 5;
        }
    }
}
```

然后在 `Main.cs` 中补上一行初始化调用：

```csharp Mods/HelloBox/Code/Main.cs
protected override void OnModLoad()
{
    LogInfo("HelloBox is alive!");
    HelloTraits.Initialize();
}
```

### 各项字段详解

- **`AssetManager.traits`**：容纳游戏中所有生物特质（包括官方原版与第三方模组）的资源库。`has`、`get`、`add` 和 `clone` 是你之后在每一页、对每一个资源库都会用到的核心四神技。
- **`path_icon`**：面板上显示的特质小图标。是一个*资源路径*，不是具体带后缀的文件名。详见 **[精灵与资源](#/nml/sprites-and-resources)**。原版游戏只会在启动阶段构建自带资源库时自动填补路径，因此对于模组特质，如果不手动指定，图标位置就会空空如也。
- **`needs_to_be_explored`**：默认是 `true`，也就是在玩家于世界中发现它之前，它在知识之书里一直是锁着的。设成 `false` 就从第一秒起可用。HelloBox 给所有东西都设了，这样你不用四处找就能看到自己做的东西。
- **`group_id`**：决定特质显示在图鉴的哪个标签分类下。下方附有完整分类列表。
- **`rate_birth`**：新生儿自然获得该特质的概率基数。`0` 代表“除非外力赋予，否则绝不会自然生成”。
- **`can_be_given` / `can_be_removed`**：玩家能否在雨刷特质编辑器里给生物附加或剥夺该特质。二者默认均为 `true`；若希望做成永久锁定特质或只允许你的代码赋予，可将其置为 `false`。
- **`base_stats[...]`**：属性加成数值。完整的属性键名可在 **[属性数值速查](#/nml/stats)** 页面查阅。

> [!WARNING] 属性赋值必须**永远在 `add()` 之后**进行
> 刚通过 `new ActorTrait` 实例化的特质本身并没有属性字典。资源库是在 `add()` 内部才完成其内存分配的。如果在该行之前修改 `base_stats`，就会触发 WorldBox 模组开发中最经典的空指针闪退：
> `NullReferenceException: Object reference not set to an instance of an object`
>
> 状态效果、物品（item）装备、建筑与生物全都遵照这一死理。唯一的特例是 `clone()`，因为它内部早已替你调用了 `add()`，所以克隆出来的对象属性字典早已准备就绪。

> [!TIP] 你做的大部分东西上都有同一个开关
> `needs_to_be_explored` 位于所有可解锁资源共用的基类上，所以对角色、七种特质、物品、词条和世界法则（world law）都有效。神力（GodPower）、状态、建筑、掉落物、云、地块（tile）和弹射物压根没有发现这一步 :wbsmirk:。

### 原版特质分组列表

`group_id` 必须填入现存的有效分组，否则你的特质会被系统丢到虚空之中：

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

想给自己开辟一个专属分类标签页？参见 **[特质分组与标签页](#/nml/trait-groups)**。

## 本地化文本

如果没有添加本地化文本，你的特质在游戏里就会直接显示为粗糙的裸代码键名 `trait_hello_swift`，看起来就跟听上去一样“专业” :pepeclown:。在 `Locales/zh.json` 中添加：

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_swift": "Swift",
  "trait_hello_swift_info": "Moves like the world owes it money."
}
```

本地化键名**绝不是**单纯的特质 ID。每种特质体系都会按自己的分类加上前缀：

| 特质体系 | 名称本地化键 | 悬浮提示说明键 |
| --- | --- | --- |
| Actor trait | `trait_<id>` | `trait_<id>_info` |
| Culture trait | `culture_trait_<id>` | `culture_trait_<id>_info` |
| Religion trait | `religion_trait_<id>` | `religion_trait_<id>_info` |
| Subspecies trait | `subspecies_trait_<id>` | `subspecies_trait_<id>_info` |
| Clan trait | `clan_trait_<id>` | `clan_trait_<id>_info` |
| Language trait | `language_trait_<id>` | `language_trait_<id>_info` |
| Kingdom trait | `kingdom_trait_<id>` | `kingdom_trait_<id>_info` |

系统还支持第二行进阶说明文本 `<prefix>_<id>_info_2`，适用于需要展开描述的特质。

## 使用自定义图标

`path_icon` 是一个路径，对应的 PNG 图像文件需要精准存放在你模组的 `GameResources/` 文件夹对应层级下。字符串内不要加 `.png` 扩展名。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── ui/Icons/
        └── iconHelloSwift.png
```

```csharp
swift.path_icon = "ui/Icons/iconHelloSwift";
```

特质图标尺寸较小，游戏实机渲染一般在 32x32 左右。如果你希望归类整洁，放进子目录同样没问题——例如 `ui/Icons/hellobox/iconSwift` 表现完全一致，只要字符串路径与实际文件对齐即可。

其他六套特质系统在原版中各自拥有专属文件夹（`ui/Icons/culture_traits/`、`religion_traits/`、`clan_traits/` 等）。你并非必须遵循原版路径，但紧挨着你所模仿的原版特质归档素材，日后维护会轻松很多。详见 **[精灵与资源](#/nml/sprites-and-resources)** 中的完整表格。

## 让特质真正产生*效果*

属性数值是静态的，而特质还可以在以下四个核心生命周期回调中执行你的 C# 逻辑：

```csharp
// 生物存活期间，每隔数秒周期性触发
swift.special_effect_interval = 3f;
swift.action_special_effect = (BaseSimObject pSelf, WorldTile pTile) =>
{
    Actor actor = pSelf as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.restoreStamina(5);
    return true;
};

// 当生物死亡结算时
swift.action_death = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// 当生物刚诞生降临世界时
swift.action_birth = (BaseSimObject pSelf, WorldTile pTile) => { return true; };

// 当生物遭受攻击受击时
swift.action_get_hit = (BaseSimObject pSelf, BaseSimObject pAttacker, WorldTile pTile) => { return true; };
```

四个回调必须共同遵守的两条黄金法则：**永远首先检查 null 判空并检查生物是否还活着**，以及没有做任何实际操作时请返回 `false`。这些委托逻辑会在全地图每一个持有该特质的生物身上永久运行。

## 互斥与对立特质

```csharp
swift.addOpposite("slow");                            // 两者水火不容，绝不可同时共存
swift.traits_to_remove_ids = new string[] { "fat" };  // 获得本特质时，强制自动剥夺该特质
```

## 将特质赋予生物单位

```csharp
actor.addTrait(HelloTraits.SWIFT);

if (actor.hasTrait(HelloTraits.SWIFT))
{
    // ...
}
```

> [!WARNING] `spawn_random_trait_allowed` 只在启动时读取一次
> 新单位的初始特质是从一个随机池里抽的，这个池子由 `BaseTraitLibrary.linkAssets()` 在游戏加载时、你的模组还不存在时建好。光在你的特质上打开这个开关什么都不会改变：你的特质根本不在那个池子里，也永远不会随机出现。按原版的权重方式自己把它放进去：
>
> ```csharp
> swift.spawn_random_trait_allowed = true;
> AssetManager.traits._pot_allowed_to_be_given_randomly.AddTimes(swift.spawn_random_rate, swift);
> ```
>
> `_pot_allowed_to_be_given_randomly` 是 `protected` 的，所以它会针对 NML 本来就用来编译你模组的公开化程序集进行编译。`spawn_random_rate` 默认是 `5`：调高它，特质就会更常出现。

## 验证特质是否正常生效

启动游戏，点击查看任意生物，点开特质编辑器，在 `physique` 标签页中查找。没找到？日志里一定记录了原因，且真相绝大多数属于这三类之一：`can_be_given` 设为了 false、`group_id` 拼写错误不存在、或是 `path_icon` 指向了一个空虚的路径 :wbreally:。

## 其他六种特质系统

生物单体特质仅仅是游戏内**七大**特质体系中的冰山一角。每一套体系都拥有自己独立的资源库、分组以及宿主对象，并且每一套都完全沿用本页所讲的相同逻辑模式。你唯一需要改变的只有类名、资源库名称以及本地化键名前缀。

| 特质体系 | 归属主体 | 对应详细指南 |
| --- | --- | --- |
| Actor | 单个具体生物个体 | 本页面 |
| Culture | 文化（culture）（由其所有下辖城市共享） | **[文化特质](#/nml/culture-traits)** |
| Religion | 宗教（religion）（及其全天下的信众） | **[宗教特质](#/nml/religion-traits)** |
| Subspecies | 生物物种的亚种（subspecies）分支 | **[亚种特质](#/nml/subspecies-traits)** |
| Clan | 名门血脉家族 | **[家族特质](#/nml/clan-traits)** |
| Language | 一门语言及所有讲该语言的人 | **[语言特质](#/nml/language-traits)** |
| Kingdom | 王国（kingdom）的国家政策大纲 | **[王国特质](#/nml/kingdom-traits)** |

在动手编写特质前，务必先想清楚它究竟该归属于谁。“精灵射术精湛”如果应该随着城市版图扩张而传播，它就是文化特质；如果应该通过繁衍生息基因遗传，它就是亚种特质；如果是某位传奇神射手专属的天赋，它才是生物单体特质。搞清楚这一点，才是一个模组能在一小时内深刻重塑世界还是最终沦为空气的根本区别 :PES_ThinkAboutIt:。
