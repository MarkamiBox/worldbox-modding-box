---
title: 自定义成就系统
group: 游戏内容
subgroup: 最终完善与成就
icon: :gold_star:
order: 220
---

# 自定义成就系统 :gold_star:

是的，模组完全可以向游戏中添加自定义成就（achievement）。它们会直接陈列在原版的成就窗口中，达成时会像官方成就一样弹出华丽的通知，并且会持久化保存在玩家的存档进度中。在发布带有成就的模组前，请务必仔细阅读本页底部的警示。

```csharp Mods/HelloBox/Code/HelloAchievements.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAchievements
    {
        public const string SWARM = "achievement_hello_wisp_swarm";
        private const string WATCH = "hello_achievement_watch";

        public static void Initialize()
        {
            if (AssetManager.achievements.has(SWARM)) return;

            Achievement swarm = new Achievement
            {
                id = SWARM,
                group = "creatures",
                icon = "ui/Icons/iconHelloWisp",
                locale_key = SWARM,      // post_init() derives it at startup; yours stays null without this
                action = (object pData) => CountWisps() >= 10
            };

            AssetManager.achievements.add(swarm);

            // the achievements window reads each group's list, filled by linkAssets() at startup
            AssetManager.achievement_groups.get(swarm.group).achievements_list.Add(swarm);

            // nothing in the game knows when to check yours: look every 30 seconds
            WorldBehaviourAsset watch = new WorldBehaviourAsset
            {
                id = WATCH,
                interval = 30f,
                interval_random = 0f,
                action = () =>
                {
                    if (!swarm.isUnlocked()) swarm.check();
                }
            };
            AssetManager.world_behaviours.add(watch);
            watch.manager = new WorldBehaviour(watch);
        }

        private static int CountWisps()
        {
            int count = 0;
            List<Actor> units = World.world.units.getSimpleList();
            for (int i = 0; i < units.Count; i++)
            {
                Actor unit = units[i];
                if (unit != null && unit.isAlive() && unit.asset.id == "hello_wisp") count++;
            }
            return count;
        }
    }
}
```

当世界上同时存在 10 只存活的微光精灵时，该成就便会自动解锁。史上十大成就之一 :trollface:。

## 底层系统不会替你自动完成的事项

- **本地化文本键。** 原版成就由 `post_init()` 在启动时根据 ID 自动填入 `locale_key`。你的自定义成就默认该字段为 `null`，导致成就窗口中无法显示文本，必须手动赋值。
- **成就窗口注册。** 成就窗口会遍历由 `linkAssets()` 启动时填充的各分组 `achievements_list`。你必须手动将自制成就加入对应分组列表，否则即便达成了解锁状态玩家也无法在成就面板中看到它。
- **触发时机检测。** 游戏本身并不知道*何时*该检查你的成就条件：原版是在每个具体行为（behaviour）发生的代码处精准调用 `check()`。HelloBox 采用了一个每 30 秒轮询一次的 **[世界行为](#/nml/world-ages)**，对于“同时存在 10 个特定实体”这类条件来说绰绰有余。对于瞬发事件型成就，直接在事件发生的代码处调用 `check()` 即可。

| 字段 | 功能作用 |
| --- | --- |
| `group` | 所在成就面板分类：`creation`, `worlds`, `civilizations`, `creatures`, `destruction`, `nature`, `experiments`, `collection`, `exploration`, `forbidden`, `miscellaneous` |
| `icon` | 成就图标的完整贴图路径 |
| `action` | 达成判定委托。当返回 `true` 时 `check()` 会触发解锁；若无 `action` 则调用 `check()` 时直接无条件解锁 |
| `hidden` | 是否在未解锁前隐藏成就描述（显示为“隐藏成就”） |
| `locale_key` | 本地化名称键名。其描述文本键名为 `<locale_key>_description` |

```json Mods/HelloBox/Locales/en.json
{
  "achievement_hello_wisp_swarm": "Wisp Swarm",
  "achievement_hello_wisp_swarm_description": "Have ten wisps alive at the same time."
}
```

> [!WARNING] 数据将写入玩家真实的账户进度文件
> 成就解锁过程调用的是游戏原生的结算代码：它会将成就 ID 写入玩家的本地进度文件，并尝试调用 Steam API 请求解锁对应 ID 的成就。由于 Steam 官方数据库中没有你定义的 ID，Steam 端不会有任何反应，但该调用依然会发生并在日志中输出 `Unlocking in Steam: <id>`。游戏还会将该 ID 随同统计事件一同上报。此外，在“诅咒世界”法则开启期间，所有成就（包括自制成就）都将彻底禁止解锁。

这些行为本身不会损坏游戏。但这毕竟直接关系到玩家真实的账号进度存档，因此请克制成就的数量，切勿在代码中恶意给玩家强行解锁未达成的成就 :PESgn_ReadRules:.
