---
title: 保存自定义数据
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbfloppysavewink:
order: 44
---

# 保存自定义数据 :wbfloppysavewink:

在开发模组时，你迟早会需要记录某些特定生物的状态：它挨了多少次攻击、是否已经领取过奖励、正在哪座神殿前祈祷。如果你用一个以生物为 Key 的静态 Dictionary 来存，当玩家保存地图并重新加载的瞬间，所有数据就会全部化为乌有 :wbfacepalm:。

游戏其实早就为我们准备好了原生方案。每一个生物、城市、王国（kingdom）、建筑物（building）、物品（item）和书籍，都会在自身的数据对象中保存状态，并且它们都附带一个精简的**自定义数据存储器** (Custom Data)，会直接连同地图一同打包存入存档文件中。

## 数据存储器

| 方法调用 | 具体功能 |
| --- | --- |
| `data.set(key, value)` | 在指定键名下存储 `int`、`long`、`float`、`string` 或 `bool` |
| `data.get(key, out value, default)` | 读取数据。若键不存在则返回传入的默认值 |
| `data.change(key, amount, min, max)` | 一步完成对 `int` 的增减并将其限制在指定极值区间 (Clamp) |
| `data.addFlag(key)` | 设置布尔标记 (Flag)。若此前已存在则返回 `false` |
| `data.hasFlag(key)` / `data.removeFlag(key)` | 查询或移除标记 |
| `data.removeInt(key)`, `removeFloat`, `removeString`... | 删除指定类型的键值 |

每种数据类型在底层都有独立的存储字典，因此同名的 `int` 和 `string` 不会发生冲突。但为了你的代码可读性与心智负担，仍强烈建议使用互不相同的键名。未来的你不会记得哪个是哪个。




## 使用 NML 存储复杂对象

如果五种基本类型让你觉得像是 1995 年，而你确实需要把整个类或列表保存在一个角色身上，NML 在 `NeoModLoader.General.Game.extensions` 里提供了 `DataExtension`：两个扩展方法，`Set` 和 `TryGet`，作用于下面任意一种数据对象上。

把你的数据类包进 `BasicCustomData<T>`：

```csharp
using System.Collections.Generic;
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

```

在拥有 `Actor actor` 的方法内部，先创建好这个值再保存它：

```csharp
if (actor == null || !actor.isAlive()) return;
QuestProgress quest = new QuestProgress { quest_id = "hello_first_steps", step = 1 };

// Saving it to the actor:
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// Reading it back:
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress loadedQuest = saved.Data;
}
```

在底层，`Set` 会把你的对象转成 JSON，然后用上面那张表里最朴素的 `data.set(key, string)` 存起来。所以每个单位、每个键其实就是一条字符串，下面那条“保持精简”的规则要加倍重视。你的类需要一个无参构造函数，会被保存的是它的公开字段和属性。

如果你预计数据格式会随模组更新而变化，就直接在你的类上实现 `ICustomData`。它只有两个方法：`Serialize()` 返回一个 `SerializedCustomData(modId, dataVersion, jObject)`，`Deserialize(SerializedCustomData)` 再把它读回来。在里面检查 `ModId` 和 `DataVersion` 是你自己的责任，没有人会替你做。`BasicCustomData<T>` 会往这两个字段里写占位值，读到其他任何值都会直接抛出异常，所以不要在同一个键上混用这两种方式 :PES5_Hmmmm:。

> [!NOTE] 已针对 NML 1.2.0 核实
> 这些名字和签名都是直接从 NML 程序集本身核实的，而不是来自它的文档——文档里根本没提到它们。如果之后的 NML 版本改了名字，编译器会在你的玩家之前先告诉你。

## 在 HelloBox 中的实践

下面我们创建一个特质（trait）：记录持有者每一次成功命中的攻击，并在累计达到 50 次时一次性赋予老兵奖励：

```csharp Mods/HelloBox/Code/HelloMemory.cs
namespace HelloBox
{
    public static class HelloMemory
    {
        public const string GRUDGE = "hello_grudge";      // the trait that remembers
        public const string HITS = "hello_hits";          // int: hits this unit has landed
        public const string VETERAN = "hello_veteran";    // flag: it already got its reward

        public static void Initialize()
        {
            if (AssetManager.traits.has(GRUDGE)) return;

            ActorTrait grudge = new ActorTrait
            {
                id = GRUDGE,
                path_icon = "ui/Icons/iconHelloGrudge",
                group_id = HelloGroups.TRAITS,
                needs_to_be_explored = false
            };

            grudge.action_attack_target = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                Actor actor = pSelf as Actor;
                if (actor == null || !actor.isAlive()) return false;

                // lives in the unit's own save data, so it survives save and load
                actor.data.change(HITS, 1, 0, 100000);
                actor.data.get(HITS, out int hits);

                // addFlag() is false when the flag was already there: the reward happens once
                if (hits >= 50 && actor.data.addFlag(VETERAN))
                {
                    actor.addTrait("veteran");
                }
                return true;
            };

            AssetManager.traits.add(grudge);
            grudge.base_stats["damage"] = 2f;
        }

        /** Anyone can read it back, a window, a patch, another trait. */
        public static int GetHits(Actor pActor)
        {
            if (pActor == null) return 0;
            pActor.data.get(HITS, out int hits);
            return hits;
        }
    }
}
```

保存地图后再重新载入：命中计数依然完好如初，因为它已经成为了该生物专属存档数据的一部分。而 Flag 的存在确保了老兵奖励只会在第 50 次命中时触发一次，不会在后续的每次攻击中重复发放。很慷慨，但依然是个 bug。

配套的本地化文本，与普通特质完全一致：

```json Mods/HelloBox/Locales/en.json
{
  "trait_hello_grudge": "Grudge",
  "trait_hello_grudge_info": "Remembers every blow it lands. Fifty, and it has seen enough to be a veteran."
}
```

> [!WARNING] `Actor.data` 的访问级别是 `internal`
> 生物身上的数据字段在游戏程序集内被标记为 `internal`。NML 默认使用 **Publicized（公开化）** 后的程序集来编译模组，因此在普通源码模组中可以直接访问。只有当你基于未公开的原版程序集在外部独立编译 `.dll` 时才会遇到访问限制报错：详情参见 **[常见问题排查](#/troubleshooting)**。城市与王国的 `data` 则本来就是公开的。

## 数据存储在何处

| 游戏对象 | 数据访问属性 |
| --- | --- |
| 生物个体 | `actor.data` |
| 城市 | `city.data` |
| 国家 | `kingdom.data` |
| 建筑物 | `building.data` |
| 文化（culture）、宗教（religion）、家族、语言、世系、军队、阴谋（plot） | 各自的 `data`（底层存储机制完全一致） |

## 核心要点与注意事项

- **永远为你的 Key 添加唯一样式前缀。** 所有模组共享同一个数据存储器。`hello_hits` 绝不会与他人冲突，但纯粹的 `hits` 早晚会出事故。
- **卸载模组完全安全。** 存储的数据依然留在存档中，只是不再有代码去读取它，绝不会损坏存档。这比直接篡改游戏原版存档格式要稳妥得多。
- **空数据存储器毫无开销。** 游戏在写入存档前会自动丢弃空字典，因此被删除的数据键不会残留任何冗余体积。
- **保持数据小巧精炼。** 数据会随每一个生物一同序列化。每个生物存几个数字或标记微不足道；但若在拥有上万生物的大地图上为每个人都存一段长文本，存档体积就会明显膨胀。

## 整个世界

有些状态根本不属于任何一个具体对象：你的神力已经在这个世界上扔下过多少颗陨石，那个一次性的祝福是否已经发生过。世界本身也有同样的存储器，就在它的地图统计数据里：

```csharp
// map_stats is internal: fine in an NML source mod, same deal as actor.data above
SaveCustomData world = World.world?.map_stats?.custom_data;
if (world == null) return;

world.change("hello_meteors", 1, 0, 1000000);   // change() clamps to 1000 unless you say otherwise
if (world.addFlag("hello_blessed")) { /* first time on this world only */ }
```

`SaveCustomData` 就是同一种 `BaseSystemData` 存储器，所以上面那张表里的每个方法都能用，NML 的 `Set` / `TryGet` 同样也能用。它会和其余的地图统计数据一起保存，所以每个存档槽都有自己独立的一份。一个刚生成的新世界一开始是空的。游戏在构建或加载地图统计数据时都会创建这个存储器，所以那个空判断理论上永远不会触发；但它几乎零成本，留着无妨。

> [!TIP] 该用设置还是世界数据？
> 问自己一个问题：玩家在加载另一个存档时，会不会预期这个值也跟着变？“陨石神力有多强”不会变：那属于 **[模组设置](#/nml/mod-config)**，所有世界共享同一份。“这个世界是否已经被祝福过”会变：那就该用 `custom_data`。

## 能在存档后依然幸存的时间

`Time.time` 是从游戏启动那一刻起经过的秒数。把它存进某个单位的数据里，保存、重启、读档，你写下的每一个时间戳都成了上辈子的记录 :wbfacepalm:。

世界自己有一份独立的时钟，并且会随地图一起保存：

```csharp
if (World.world == null || World.world.map_stats == null || Config.worldLoading) return;
if (actor == null || !actor.isAlive()) return;

// double, in world seconds: 5 is a month, 60 is a year
double now = World.world.getCurWorldTime();

// the store has no double, a float is plenty for a timestamp
actor.data.set("hello_blessed_at", (float)now);

actor.data.get("hello_blessed_at", out float at, -1f);
bool blessedThisYear = at >= 0f && now - at < 60.0;
```

它还会在游戏暂停时停止走动，在更高的速度下走得更快——这几乎总是你真正想要的效果。`Date.getYearsSince(at)` 和 `Date.getMonthsSince(at)` 会替你把除法算好。

## 在世界加载之后运行代码

上面的一切都是按需读取的，所以通常你根本不需要知道世界是什么时候加载的。但如果你确实需要知道——比如要重建自己的一份缓存——下面这些就是模组常用 **[Harmony](#/nml/harmony-patches)** 挂钩的方法：

| 方法 | 触发时机 |
| --- | --- |
| `MapBox.clearWorld`（公开） | 在任何世界被生成或加载之前。把你自己的静态缓存清空放在这里 |
| `SaveManager.loadActors`（私有） | 加载存档过程中，单位重建完成之后 |
| `MapBox.finishMakingWorld`（公开） | 无论是生成世界还是加载世界，都会在接近尾声时触发 |
| `SaveManager.saveWorldToDirectory`（公开，静态） | 每次保存时触发，无论是手动还是自动。Prefix 是你往存储器里写入数据的最后机会 |
| `MapBox.addLastStep`（私有） | 只在游戏启动时触发一次，不是每个世界一次 |
| `MapBox.OnApplicationQuit`（私有） | 游戏正在关闭 |

```csharp Mods/HelloBox/Code/HelloWorldCache.cs
using HarmonyLib;

namespace HelloBox
{
    [HarmonyPatch(typeof(MapBox), nameof(MapBox.finishMakingWorld))]
    public static class HelloWorldCache
    {
        // a cached copy for code that reads it every frame; the save keeps the real one
        public static int MeteorsThisWorld;

        // runs for a brand new world and for a loaded save alike
        public static void Postfix()
        {
            MeteorsThisWorld = 0;
            SaveCustomData world = World.world?.map_stats?.custom_data;
            if (world == null) return;

            world.get("hello_meteors", out int meteors);
            MeteorsThisWorld = meteors;
        }
    }
}
```

私有方法要用字符串写方法名，`[HarmonyPatch(typeof(SaveManager), "loadActors")]`，就像 Harmony 那一页解释的那样。`finishMakingWorld` 运行时加载画面还没有消失，后面还会跟着几个步骤。

## 自己的文件

不少模组干脆跳过这一切，直接用 `File.WriteAllText` 写一个 JSON 文件，通常放在 `Application.persistentDataPath` 下，也就是 `Player.log` 旁边那个 `LocalLow\mkarpenko\WorldBox` 文件夹。对于属于**玩家**本人的东西，这样做没问题：比如他们导出的收藏单位列表，或是跨越他们玩过的每一局游戏的统计数据。

但对于属于**某个世界**的东西，这样做就是错的。文件并不知道当前加载的是哪个存档槽。玩家在存档槽 1 里祝福了一个王国，读取存档槽 2，结果存档槽 2 也变成被祝福的了。然后他们删掉了存档槽 1，而你的文件却把那份状态永远留着 :PES2_F:。如果这个值应该随着存档改变，它就该存进存档里，用上面提到的某个存储器。

## 接下来去哪

玩家只设置一次、所有世界共享的数值，见 **[模组设置](#/nml/mod-config)**。需要每一帧或每个游戏内月份检查一次的代码，见 **[每一帧](#/nml/update-loops)** :PES_OkHand:。
