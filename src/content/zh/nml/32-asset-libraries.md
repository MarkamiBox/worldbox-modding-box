---
title: 底层资源库（Asset libraries）
group: 游戏内容
subgroup: 底层架构与属性
icon: :wbbrain:
order: 90
---

# 底层资源库（Asset libraries） :wbbrain:

在阅读后续的所有页面之前，你必须先搞懂这一页。WorldBox 中存在的任何事物（特质（trait）、武器、建筑（building）、地块（tile）、云朵、王国（kingdom））全都是存放在**资源（resource）库**里的**资源（Asset）**，而游戏中所有的资源库在底层都是拥有相同四个方法的同一个泛型基类。

在这里把它们彻底弄懂，后续三十个页面的内容就会全部简化为：“在哪个资源库、修改哪些字段”。

## 什么是资源库

```csharp
public abstract class AssetLibrary<T> : BaseAssetLibrary where T : Asset
{
    public List<T> list;                 // 按注册顺序存放的全部资源列表
    public Dictionary<string, T> dict;   // 按 ID 索引的全部资源字典
}
```

底层本质就这么简单：一个公开的 List 加上一个公开的 Dictionary，二者都允许你的模组自由读取和改动。`AssetManager` 中掌管着整整 129 个这样的库。完整索引请参见 **[全部底层资源库](#/nml/asset-index)**。

## 四大核心方法

```csharp
AssetManager.traits.has("hello_swift");            // 该 ID 是否已被占用？
AssetManager.traits.get("hello_swift");            // 获取其实例，不存在则返回 null
AssetManager.traits.add(myTrait);                  // 注册一个全新资源
AssetManager.traits.clone("hello_new", "strong");   // 克隆现有资源并自动完成注册
```

### `has(id)`

如果 ID 已被注册则返回 `true`。**你编写的每一个 `Initialize()` 方法的第一行，都必须写成这样**：

```csharp
if (AssetManager.traits.has(SWIFT)) return;
```

若漏掉这行防御代码，模组热重载或重新加载世界时就会把所有资源重复注册一遍。

### `get(id)`

返回内存中处于运行状态的实时对象；若找不到该 ID 则返回 `null`。它**不会**抛出异常，因此空引用错误往往会在距此极远的下游代码中猝不及防地引爆：

```csharp
ActorTrait strong = AssetManager.traits.get("strong");
if (strong == null) return;   // 永远如此。每一次调用都必须判空。
```

`get` 返回的是内存中的*活对象*，这是本页中最具杀伤力的特性。这意味着你可以直接就地修改原版游戏内容，而完全不需要整盘推翻替换：

```csharp
// 直接让原版的巨龙血量暴增，同时丝毫不破坏其原有的任何其他属性
ActorAsset dragon = AssetManager.actor_library.get("dragon");
if (dragon != null) dragon.base_stats["health"] += 500;
```

### `add(asset)`

向库中注册一个新资源。其内部发生的三件事你必须了然于胸：

1. **若该 ID 已被占用，旧资源会被踢除并由你的新资源顶替**，控制台会输出如下日志：
   ```text
   <e>AssetLibrary<ActorTrait></e>: duplicate asset - overwriting...
   ```
   模组之间神不知鬼不觉的相互冲突破坏正是由此发生的。务必给你的 ID 加上模组专属前缀。
2. 触发调用该资源的 `create()` 生命周期方法。
3. **资源库为其分配并初始化 `base_stats`**（以及 `base_stats_meta`，若该资源支持）。这就是为什么本指南所有页面都在强调“属性（stats）数值必须在 `add()` 之后赋值”。

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };

AssetManager.traits.add(swift);        // <- 此时才会开辟数值字典内存
swift.base_stats["speed"] = 20f;       // <- 仅在这行之后访问才安全
```

如果把这个先后顺序弄反，就会遭遇 WorldBox 模组开发中最著名的崩溃：

```text
NullReferenceException: Object reference not set to an instance of an object
```

### `clone(newId, sourceId)`

把 `sourceId` 的所有可序列化字段复制到一个全新的对象里，给它 `newId`，**并对它调用 `add()`**。它返回这个副本。

```csharp
BuildingAsset shrine = AssetManager.buildings.clone("hello_shrine", "temple_human");
shrine.max_houses = 0;                     // 仅修改你关心的属性
shrine.base_stats["health"] = 200;         // 已由内部调用的 add() 完成内存分配
```

> [!WARNING] 永远不要在 `clone()` 之后调用 `add()`
> 第二次 `add()` 会移除第一个副本，记录 `duplicate asset overwriting...`，然后重新添加。能用，但这是日志噪音，会让真正的错误更难发现。

对于字段超过大约十个的东西，克隆才是正确的默认做法：建筑、角色、物品（item）、地块。你继承的是一份已知能用的配置，只需要理解你改动的那些字段。

## 模板资源（Templates）

资源库中常年维护着一批以 `$` 或 `_` 开头的半成品资源。它们登记在 `dict` 字典中，但被特意排除在 `list` 列表之外，因此绝不会直接暴露在游戏世界里——它们存在的唯一价值就是供开发者克隆。

```csharp
AssetManager.actor_library.clone("hello_sprite", "$civ_advanced_unit$");
AssetManager.items.clone("hello_sword_ember", "$sword");
AssetManager.buildings.clone("hello_shrine", "$city_building$");
AssetManager.resources.clone("hello_cake", "$TEMPLATE_FOOD$");
AssetManager.kingdoms.clone("hello_sprites", "$TEMPLATE_CIV$");
```

以模板作为克隆源几乎总是比克隆一个成品资源要干净得多，因为你不会意外继承母体自带的杂七杂八的个性配置。唯一的例外是美术贴图：克隆 `human` 能让你直接拿到现成的人类精灵图，而一个肉眼看得见的生物，永远比一个逻辑正确却隐形的幽灵生物强得多 :PES4_AlrightThen:。

## 遍历查看现有资源

查阅有哪些 ID 可供克隆的最快方式，就是在控制台把它们一口气打印出来：

```csharp
foreach (BuildingAsset asset in AssetManager.buildings.list)
{
    LogInfo(asset.id);
}
```

只需两行代码，你就再也不用靠猜来写 ID 了。`list` 会自动剔除模板；而遍历 `dict.Keys` 则能查看到包括模板在内的所有隐藏资源。

## 自定义显示顺序

`list` 就是一个最朴素的 `List<T>`，而游戏界面是严格按照该列表的先后顺序来绘制标签页和图标网格的。因此你可以精确地把自己的资源插在任何想要的位置：

```csharp
ItemGroupAsset group = AssetManager.item_groups.get("hello_relics");
int index = AssetManager.item_groups.list.FindIndex(g => g.id == "amulet");

if (group != null && index != -1)
{
    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## 你的代码何时被执行

游戏在启动时构建全部 129 个资源库，然后对它们运行 `post_init()`，**之后** NML 才加载你的模组。大家（包括我）总会栽在这两个后果上：

- **资源库在 `post_init` 里自动完成的事情已经做完了。** 比如角色特质会在那里自动填上默认的 `path_icon`。你的不会，因为那时你的特质还不存在。自己设置它。
- **你的 `OnModLoad` 运行时，所有原版资源都已经存在。** 所以 `get("human")` 能用，`clone(..., "human")` 能用，直接修改原版内容也能用。你永远不会太早。

> [!NOTE] 给这些方法打补丁不会影响原版内容
> `has`、`get`、`add`、`clone` 和 `post_init` 都是在游戏启动期间、在 NML 加载任何模组之前，在这 129 个资源库上运行的。给其中任何一个打 Harmony 补丁，都只会影响你的模组加载*之后*的调用，永远碰不到那时已经完成的原版注册。想要不一样的原版内容？像本页其他部分那样，之后用 `get()` 去改。

## 三种会翻车的写法

这三种写法都能编译通过，看起来都挺合理，而且我三个都踩过。

### 删掉一个原版资源，好换上自己的版本

```csharp
// don't
AssetManager.traits.list.RemoveAll(a => a.id == "strong");
AssetManager.traits.add(myStrong);
```

`RemoveAll` 只动了 `list`。`dict` 里那个旧的 `strong` 还在，所以 `add()` 会发现一个重复项，打印一条 `duplicate asset - overwriting...`，然后照样把它换掉——也就是说第一行等于白做了。真正的问题在于那些在启动阶段就已经抓到了旧对象引用的一切：像 `WorldLawLibrary.world_law_hunger` 这样的静态字段，以及所有在 `linkAssets()` 里关联过它的资源，这一切都发生在你的模组存在之前。它们手里握着的依然是旧的那个。现在同一个 id 对应着两个资源，游戏用哪一个，完全取决于是谁在什么时候缓存了什么 :PESgn_Really:。

想要修改原版内容，正确做法是直接改那个已经存在的对象：

```csharp
ActorTrait strong = AssetManager.traits.get("strong");
if (strong == null) return;
strong.base_stats["damage"] = 10f;   // same object, every cached reference sees it
```

### 编辑克隆体，结果原件也跟着变了

`clone()` 会把列表复制成新的列表，并且会克隆任何实现了 `ICloneable` 的对象（比如 `base_stats`）。除此之外的其他对象都是**按引用**复制的。比如 `MapGenTemplate.values` 就是一个普通的类：克隆 `continent`，在你副本的 `values` 上翻转一个开关，结果原版的所有大陆地图都会跟着一起变。只要某个字段存的是一个对象，就要在编辑它之前先给你的克隆体换一个全新的实例。**[地图生成](#/nml/map-generation)** 里有具体的案例。

### 克隆另一个模组添加的资源

`clone("hello_new", "their_id")` 内部做的是不带检查的 `dict[pFrom]`。如果对方模组还没运行过它的 `Initialize()`，或者压根没装，这里就是一个 `KeyNotFoundException`，你的整个 `OnModLoad` 会在这一行直接中断。不要依赖文件夹的加载顺序。声明依赖关系，并且在克隆之前依然要检查该资源是否存在；对方模组也可能已经改过它的 id 了。

```csharp
if (!AssetManager.buildings.has("their_id")) return;   // not there (yet): skip, don't crash
AssetManager.buildings.clone("hello_new", "their_id");
```

正确检测其他模组、处理好加载顺序的方法，见 **[与其他模组协作](#/nml/other-mods)**。

## 后续所有页面通用的标准骨架

```csharp Mods/HelloBox/Code/HelloSomething.cs
namespace HelloBox
{
    public static class HelloSomething
    {
        public const string ID = "hello_something";

        public static void Initialize()
        {
            // 1. 防御重入，绝不重复注册
            if (AssetManager.<library>.has(ID)) return;

            // 2. 有近似模版则克隆，无则从零 new
            SomeAsset asset = AssetManager.<library>.clone(ID, "$template$");

            // 3. 按需修改关心的属性
            asset.some_field = true;

            // 4. 属性数值设置永远放在最后
            asset.base_stats["damage"] = 10;
        }
    }
}
```

本指南后续所有的资源讲解页面，剥离掉具体的领域名词后，骨子里全都是这副骨架。每当你感到迷茫时，随时翻回本页对照 :PESgn_GoOn:。

## 贴在显示器上方的四大铁律

1. **`has()` 优先。** 绝不重复注册相同的 ID。
2. **`clone()` 自带 `add()`。** 永远不要在克隆之后补调 `add()`。
3. **`base_stats` 仅在 `add()` 之后产生。** 数值赋值永远放在最后。
4. **务必加专属前缀。** 叫 `hello_swift`，绝不叫 `swift`。整个游戏与所有外部模组共用同一个扁平命名空间。
