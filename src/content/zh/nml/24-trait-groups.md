---
title: 特质组与标签页
group: 游戏内容
subgroup: 特质与遗传
icon: :wbfamilies:
order: 102
---

# 特质组与标签页 :wbfamilies:

每个特质都属于一个**组（group）**，而组正是在特质书中绘制标签页的实体。如果你添加了六个特质并全塞进 `miscellaneous`，它们就会淹没在没人会去滚动的长列表里。

拥有一个你自己的标签页只需要四行代码。

## 什么是特质组

组是一个 `BaseCategoryAsset`，也是整款游戏中最精简的底层资源：

| 字段 | 作用 |
| --- | --- |
| `id` | 特质的 `group_id` 所指向的目标 |
| `name` | 标签页显示的**本地化键名**。注意不是文字本身 |
| `color` | 十六进制颜色代码。为标签页及其下方的特质着色 |
| `show_counter` | 标签页是否显示 "3 / 12" 计数。默认为 `true` |

## 注册你自己的标签页

```csharp Mods/HelloBox/Code/HelloGroups.cs
namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";

        public static void Initialize()
        {
            if (AssetManager.trait_groups.has(TRAITS)) return;

            AssetManager.trait_groups.add(new ActorTraitGroupAsset
            {
                id = TRAITS,
                name = "trait_group_" + TRAITS,   // 本地化键名，而非直接文本
                color = "#7FE7C4"
            });
        }
    }
}
```

让你的特质指向它：

```csharp
ActorTrait swift = new ActorTrait
{
    id = HelloTraits.SWIFT,
    group_id = HelloGroups.TRAITS,
    path_icon = "ui/Icons/iconSpeed"
};
AssetManager.traits.add(swift);
```

并为标签页指定本地化文本：

```json Mods/HelloBox/Locales/en.json
{
  "trait_group_hello_traits": "HelloBox"
}
```

> [!WARNING] 组的注册必须先于其内部特质
> 如果特质的 `group_id` 指向了一个尚未创建的组，它就根本没有地方被绘制出来。在 `OnModLoad` 中，`HelloGroups.Initialize()` 必须写在 `HelloTraits.Initialize()` 之前。

## 原版角色特质组

如果你不想开辟独立标签页，可以使用以下原版组之一：

`cognitive` · `mind` · `spirit` · `physique` · `health` · `body` · `appearance` · `protection` · `skills` · `merits` · `acquired` · `fun` · `fate` · `miscellaneous` · `special`

## 你的标签页显示在什么位置

组是按照 `list` 的顺序绘制的，而 `add()` 会把你的标签页追加在最末尾。若想将它插入到某个关联组的旁边，可以在添加后调整其索引：

```csharp
ActorTraitGroupAsset group = AssetManager.trait_groups.get(HelloGroups.TRAITS);
int index = AssetManager.trait_groups.list.FindIndex(g => g.id == "physique");

if (group != null && index != -1)
{
    AssetManager.trait_groups.list.Remove(group);
    AssetManager.trait_groups.list.Insert(index + 1, group);
}
```

每个资源库里的 `list` 都是标准的 `List<T>`，因此这个小技巧在所有库中都能通用。参见 **[资源库（Asset libraries）](#/nml/asset-libraries)**。

## 重命名或修改原版组的颜色

你无需额外添加组也能更改现有组。`get()` 会直接返回内存中的实时对象：

```csharp
ActorTraitGroupAsset fun = AssetManager.trait_groups.get("fun");
if (fun != null)
{
    fun.name = "trait_group_hello_fun";   // 你自己的本地化键名
    fun.color = "#FFB35E";
}
```

就地修改原版组能保持所有指向它的原版特质正常工作，并兼容旧存档。直接替换它则两头不讨好 :PES_NoSign:。

## 另外六个特质组资源库

角色特质只是游戏内七大特质系统之一，每个系统都拥有管理自身组类型的独立组资源库。本页的代码对所有系统完全通用，只需替换两个名称：

| 特质系统 | 组资源库 | 组类型 | 对应页面 |
| --- | --- | --- | --- |
| 角色（Actor） | `AssetManager.trait_groups` | `ActorTraitGroupAsset` | 本页 |
| 文化（Culture） | `AssetManager.culture_trait_groups` | `CultureTraitGroupAsset` | **[文化特质](#/nml/culture-traits)** |
| 宗教（Religion） | `AssetManager.religion_trait_groups` | `ReligionTraitGroupAsset` | **[宗教特质](#/nml/religion-traits)** |
| 亚种（Subspecies） | `AssetManager.subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | **[亚种特质](#/nml/subspecies-traits)** |
| 家族（Clan） | `AssetManager.clan_trait_groups` | `ClanTraitGroupAsset` | **[家族特质](#/nml/clan-traits)** |
| 语言（Language） | `AssetManager.language_trait_groups` | `LanguageTraitGroupAsset` | **[语言特质](#/nml/language-traits)** |
| 王国（Kingdom） | `AssetManager.kingdoms_traits_groups` | `KingdomTraitGroupAsset` | **[王国特质](#/nml/kingdom-traits)** |

装备系统也有类似概念，只是叫法不同。参见 **[物品组与标签页](#/nml/item-groups)**。

> [!TIP] 保持一个标签页，不要开六个
> 开发大型模组时，每个子系统都开新组的诱惑很大。请克制。特质书本来就已经很拥挤：玩家很乐意在一个冠以你模组名称的标签页里浏览，但绝不会愿意去翻找六个以你内部代码架构命名的标签页。
