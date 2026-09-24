---
title: 保存自定义数据
group: NML 模组开发
subgroup: 高级进阶与发布
icon: :wbfloppysavewink:
order: 44
---

# 保存自定义数据 :wbfloppysavewink:

在开发模组时，你迟早会需要记录某些特定生物的状态：它挨了多少次攻击、是否已经领取过奖励、正在哪座神殿前祈祷。如果你用一个以生物为 Key 的静态 Dictionary 来存，当玩家保存地图并重新加载的瞬间，所有数据就会全部化为乌有 :wbfacepalm:。

游戏其实早就为我们准备好了原生方案。每一个生物、城市、王国、建筑物、物品和书籍，都会在自身的数据对象中保存状态，并且它们都附带一个精简的**自定义数据存储器** (Custom Data)，会直接连同地图一同打包存入存档文件中。

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

如果五种基本类型让你觉得像是 1995 年，而你确实需要把整个类或列表保存在一个角色身上，NML 在 `NeoModLoader.General.Game.extensions` 里提供了 `DataExtension`。

把你的数据类包进 `BasicCustomData<T>`：

```csharp
using NeoModLoader.General.Game.extensions;

public class QuestProgress
{
    public string quest_id;
    public int step;
    public List<string> completed_objectives = new List<string>();
}

// 写入实体数据：
actor.data.Set("hello_quest", new BasicCustomData<QuestProgress>(quest));

// 读取实体数据：
if (actor.data.TryGet("hello_quest", out BasicCustomData<QuestProgress> saved))
{
    QuestProgress quest = saved.Data;
}
```

在底层，NML 会把你的对象序列化成 JSON，并以你的键存进原版的 `custom_data_string` 表里。如果你预计数据格式会随模组更新而变化，就直接在你的类上实现 `ICustomData`，而不是使用 `BasicCustomData<T>`：它会给你显式的 `ModId` 和 `DataVersion` 检查，免得旧存档里的数据悄悄污染你的新状态 :PES5_Hmmmm:。

## 在 HelloBox 中的实践

下面我们创建一个特质：记录持有者每一次成功命中的攻击，并在累计达到 50 次时一次性赋予老兵奖励：

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
| 文化、宗教、家族、语言、世系、军队、阴谋 | 各自的 `data`（底层存储机制完全一致） |

## 核心要点与注意事项

- **永远为你的 Key 添加唯一样式前缀。** 所有模组共享同一个数据存储器。`hello_hits` 绝不会与他人冲突，但纯粹的 `hits` 早晚会出事故。
- **卸载模组完全安全。** 存储的数据依然留在存档中，只是不再有代码去读取它，绝不会损坏存档。这比直接篡改游戏原版存档格式要稳妥得多。
- **空数据存储器毫无开销。** 游戏在写入存档前会自动丢弃空字典，因此被删除的数据键不会残留任何冗余体积。
- **保持数据小巧精炼。** 数据会随每一个生物一同序列化。每个生物存几个数字或标记微不足道；但若在拥有上万生物的大地图上为每个人都存一段长文本，存档体积就会明显膨胀。

对于不属于任何具体实体对象的全局状态（例如影响整个世界的全局开关），请改用模组配置系统：参见 **[Mod 配置系统](#/nml/mod-config)** :PES_OkHand:。
