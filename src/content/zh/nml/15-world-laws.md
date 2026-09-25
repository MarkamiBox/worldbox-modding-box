---
title: 世界法则
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbworldlaws:
order: 176
---

# 世界法则 :wbworldlaws:

世界法则（world law）就是 **世界法则** 窗口中的各项开关：“生老病死”、“饥饿”、“和平怪物”等。这是你能添加的最便于玩家操作的功能，因为它能让玩家无需接触任何配置文件即可开启或关闭你 mod 的行为（behaviour）。

它们也是整款游戏中最简单的资源之一，一共仅有四个字段。

## 添加一个开关

```csharp Mods/HelloBox/Code/HelloLaws.cs
using NeoModLoader.api;

namespace HelloBox
{
    public static class HelloLaws
    {
        public const string CHAOS = "world_law_hello_chaos";

        public static void Initialize()
        {
            if (AssetManager.world_laws_library.has(CHAOS)) return;

            AssetManager.world_laws_library.add(new WorldLawAsset
            {
                id = CHAOS,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "units",                                  // 属于哪个分页标签
                icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
                default_state = false                                // 默认关闭
            });
        }
    }
}
```

在 `Main.cs` 中加入 `HelloLaws.Initialize();`，开关就已经进入游戏了。真的就这么简单 :poggers:。

| 字段 | 含义 |
| --- | --- |
| `id` | 法则名称，同时也是翻译键 |
| `group_id` | 所在标签页。完整列表见下方的 **标签页** 一节，也可以自己新建一个 |
| `icon_path` | 图标，路径规则与其他地方相同 |
| `default_state` | `true` = 新世界默认开启，`false` = 默认关闭 |
| `can_turn_off` | 默认为 `true`。设为 `false` 则该法则一旦开启就无法关闭 |

## 在代码中读取该开关

这就是添加开关的核心意义所在。一个没人读取的开关只是装饰品。在 mod 的任何地方都可以判断：

```csharp
WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);

if (law != null && law.isEnabled())
{
    // 玩家想要混乱，那就赐予他们混乱
}
```

还有一种更简短的写法，直接从世界对象上读取，不用先取出资源实例：

```csharp
bool chaos = World.world.world_laws.isEnabled(HelloLaws.CHAOS);
```

`isEnabled(string)` 对于一个它不认识的 id 会返回 `false` 而不是抛出异常，所以拼错了看起来只是“关闭”，而不是崩溃。这很贴心，但也很要命，因为没有任何提示告诉你出了问题 :PES5_Hmmmm:。`World.world.world_laws` 是 `internal` 的，所以它能编译通过，是因为 NML 用来构建你模组的是公开化的程序集（参见 **[状态效果](#/nml/status-effects)** 中的说明）。上面用资源对象的写法则到处都能用。

实战示例：仅在法则开启时蔓延火星余烬：

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    WorldLawAsset law = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
    bool chaos = law != null && law.isEnabled();

    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);

    if (chaos)
    {
        foreach (WorldTile neighbour in pTile.neighboursAll)
        {
            World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
        }
    }
    return true;
};
```

## 在开关切换的瞬间作出响应

如果开启法则需要立即 *执行* 某些操作，而不仅仅是后续读取：

```csharp
new WorldLawAsset
{
    id = CHAOS,
    group_id = "units",
    icon_path = "ui/Icons/worldrules/icon_hello_law",   // your own icon in GameResources/
    default_state = false,
    on_state_enabled = (PlayerOptionData pOption) => { /* 玩家将其开启时运行 */ }
};
```

## 标签页

窗口被分成若干个标签页，`group_id` 决定落到哪一个。以下是全部原版分组，按窗口实际绘制的顺序排列：

`harmony` · `diplomacy` · `civilizations` · `units` · `mobs` · `spawn` · `nature` · `trees` · `plants` · `fungi` · `biomes` · `weather` · `disasters` · `other`

### 自己的一个标签页

把第一个示例里的 `Initialize()` 替换成下面这个版本，并在 `CHAOS` 旁边加上 `GROUP`。

分组是 `AssetManager.world_law_groups` 里的一个 `WorldLawGroupAsset`。它和特质标签页用的是同一个小型 `BaseCategoryAsset`，参见 **[特质分组与标签页](#/nml/trait-groups)**：

| 字段 | 含义 |
| --- | --- |
| `id` | 法则的 `group_id` 指向的目标 |
| `name` | 标签页标题的**本地化键**。不是标题本身 |
| `color` | 十六进制颜色字符串。给标签页标题上色 |

```csharp Mods/HelloBox/Code/HelloLaws.cs
public const string GROUP = "hello_laws";

public static void Initialize()
{
    // the group first: the laws below point at it
    if (!AssetManager.world_law_groups.has(GROUP))
    {
        AssetManager.world_law_groups.add(new WorldLawGroupAsset
        {
            id = GROUP,
            name = "world_laws_tab_" + GROUP,   // the locale key, not the text
            color = "#FF9A3C"
        });
    }

    if (AssetManager.world_laws_library.has(CHAOS)) return;

    AssetManager.world_laws_library.add(new WorldLawAsset
    {
        id = CHAOS,
        needs_to_be_explored = false,
        group_id = GROUP,
        icon_path = "ui/Icons/worldrules/icon_hello_law",
        default_state = false
    });
}
```

不需要任何 UI 工作：世界法则窗口会为 `world_law_groups.list` 里的每一项生成一个标签页，然后把每条法则丢进它 `group_id` 所指名的那个标签页里。这一切只在窗口第一次创建时发生一次，而你的模组早在玩家看到窗口之前就已经加载完毕。你的标签页会排在最后，`other` 之后。

> [!WARNING] 一个不存在的 `group_id` 会拖垮整个窗口
> 窗口是用一个普普通通的字典索引来查找标签页的。一条法则如果指向了一个没人注册过的分组，就会在窗口构建期间抛出 `KeyNotFoundException`，而且注册在它之后的每一条法则——不管是你的还是别的模组的——都永远进不了这个窗口。请先注册分组再注册法则，并且两处的拼写要完全一致 :PESgn_ToughLuck:。

## 文本与本地化

```json Mods/HelloBox/Locales/en.json
{
  "world_law_hello_chaos_title": "Hello Chaos",
  "world_law_hello_chaos_description": "Embers spread to the neighbouring tiles instead of falling on one.",
  "world_laws_tab_hello_laws": "HelloBox"
}
```

> [!WARNING] 世界法则用的是 `_title`，不是纯 id
> 几乎所有其他资源都直接用纯 id 作为名称键。世界法则要的是 `<id>_title`。写错的话，开关就会显示成完全没有标签 :PESgn_Really:。

> [!TIP] 法则胜过设置
> 模组设置藏在玩家只会打开一次的菜单里。世界法则就在游戏里，紧挨着原版法则，每个世界独立，还能在游戏中途切换。如果你的模组有开/关式的行为，它就该放在这里 :wbblessed:。
