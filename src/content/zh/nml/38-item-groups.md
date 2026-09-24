---
title: 物品分组与标签页
group: 游戏内容
subgroup: 物品与装备
icon: :wbgold:
order: 124
---

# 物品分组与标签页 :wbgold:

物品分组是装备窗口中的分类标签：头盔、长剑、护身符。它与绘制特质标签页所用的轻量级 `BaseCategoryAsset` 是完全相同的基类（参见 **[特质分组与标签页](#/nml/trait-groups)**），只不过存放在 `AssetManager.item_groups` 中。

核心区别在于，物品分组必须挂载一个**物品池（Pool）**，而遗漏了这个物品池正是导致 Mod 崩溃的常见元凶 :PESgn_Yikes:。

## 原版分组

`helmet` · `armor` · `boots` · `ring` · `amulet` · `sword` · `axe` · `hammer` · `spear` · `bow` · `staff` · `firearm`

## 自定义分类

```csharp Mods/HelloBox/Code/HelloGroups.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloGroups
    {
        public const string TRAITS = "hello_traits";
        public const string RELICS = "hello_relics";

        public static void Initialize()
        {
            // the trait tab, from the Trait groups page
            if (!AssetManager.trait_groups.has(TRAITS))
            {
                AssetManager.trait_groups.add(new ActorTraitGroupAsset
                {
                    id = TRAITS,
                    name = "trait_group_" + TRAITS,   // the locale key, not the text
                    color = "#7FE7C4"
                });
            }

            // the equipment category
            if (!AssetManager.item_groups.has(RELICS))
            {
                AssetManager.item_groups.add(new ItemGroupAsset
                {
                    id = RELICS,
                    name = "equipment_group_hello_relics",
                    color = "#BAFFDF"
                });
            }

            EnsurePools(RELICS);
            PlaceAfter(RELICS, "amulet");
        }

        /** The game filled its buckets before your mod existed. A new group has none. */
        private static void EnsurePools(string pGroupId)
        {
            if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

            if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
                AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
        }

        /** add() puts a group last. This moves it next to a relative instead. */
        private static void PlaceAfter(string pId, string pAfterId)
        {
            ItemGroupAsset group = AssetManager.item_groups.get(pId);
            int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

            if (group == null || index == -1) return;

            AssetManager.item_groups.list.Remove(group);
            AssetManager.item_groups.list.Insert(index + 1, group);
        }
    }
}
```

| 字段 | 作用 |
| --- | --- |
| `id` | 物品的 `group_id` 所指向的目标 |
| `name` | 标签页标题的本地化语言键 |
| `color` | 渲染分类颜色的十六进制字符串 |
| `show_counter` | 标签页是否显示物品计数。默认为 `true` |

```json Mods/HelloBox/Locales/en.json
{
  "equipment_group_hello_relics": "Relics"
}
```

## 装备池（Pools）

游戏为每个分组维护着一个装备列表，并在自身原生库加载时填充这些列表 —— 这一过程**发生在此处 Mod 存在之前**。全新注册的分组在底层没有任何列表容器，第一个尝试访问它的系统会直接抛出异常：

```text
KeyNotFoundException: The given key was not present in the dictionary.
```

在向该分组注册任何物品之前，请为每个分组手动初始化一次装备池：

```csharp
private static void EnsurePools(string pGroupId)
{
    if (!AssetManager.items.pot_equipment_by_groups_all.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_all[pGroupId] = new List<EquipmentAsset>();

    if (!AssetManager.items.pot_equipment_by_groups_unlocked.ContainsKey(pGroupId))
        AssetManager.items.pot_equipment_by_groups_unlocked[pGroupId] = new List<EquipmentAsset>();
}
```

`_all` 包含该组内的全部物品。`_unlocked` 则是生成器当前被允许抽取的物品。两者都必须初始化。

## 将物品归入分组

```csharp
EquipmentAsset relic = AssetManager.items.clone("hello_relic_ember", "$amulet");
relic.group_id = HelloGroups.RELICS;
relic.equipment_type = EquipmentType.Amulet;   // 占据哪个身体槽位
relic.equipment_subtype = "hello_relic";       // 文化特质所偏好的武器子类别
```

三个容易混淆的独立配置项：

| | |
| --- | --- |
| `group_id` | 在装备界面的哪个**标签页**下显示 |
| `equipment_type` | 装备在角色的哪个**槽位**：`Weapon`, `Helmet`, `Armor`, `Boots`, `Ring`, `Amulet` |
| `equipment_subtype` | 属于哪种**武器类别**：`sword`, `axe`, `bow`… 文化特质所指定的偏好类型 |

创建新分组**并不会**赋予你新的装备槽位。`EquipmentType` 是游戏程序集中不可更改的固定枚举，因此你的圣物依然占用护身符槽位，只是在界面中获得了独立的专属货架。

## 分类标签的显示位置

分组按 `list` 的顺序绘制，`add()` 会把你的放在最后。把它挪到相关分组旁边：

```csharp
private static void PlaceAfter(string pId, string pAfterId)
{
    ItemGroupAsset group = AssetManager.item_groups.get(pId);
    int index = AssetManager.item_groups.list.FindIndex(g => g.id == pAfterId);

    if (group == null || index == -1) return;

    AssetManager.item_groups.list.Remove(group);
    AssetManager.item_groups.list.Insert(index + 1, group);
}
```

## 重命名原版分类

`get()` 会返回内存中的实时对象，因此你可以直接改造原版分类而非新增分类：

```csharp
ItemGroupAsset helmet = AssetManager.item_groups.get("helmet");
if (helmet != null)
{
    helmet.name = "equipment_group_headwear";   // 自定义本地化键
    helmet.color = "#BAD0FF";
}
```

原版所有的头盔依然指向 `helmet`，所以不会破坏任何现有机制，老存档也能完美加载。直接替换该分组反而会导致所有原版头盔丢失引用 :aPES2_HmmmmApprove:。

> [!TIP] 复用既有槽位，重命名分类货架
> 绝大多数所谓"新增装备类型"的 Mod，本质上都是"沿用既有槽位，换个展示分类与名称"。这种方案只需四行代码，绝不会损坏存档。若想真正新增全新槽位，必须修改游戏底层的 `EquipmentType` 枚举，而这是无法做到的。
