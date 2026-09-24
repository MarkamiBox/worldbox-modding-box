---
title: 世界时代与世界行为
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbsunblessed:
order: 174
---

# 世界时代与世界行为 :wbsunblessed:

游戏中有两类特殊机制不属于任何具体的生物实体，而是直接属于世界本身。**世界时代 (World Age)** 是时代之轮上的纪元（如希望时代、余烬时代），掌管着整个世界的宏观天气、环境光影与运行法则。**世界行为 (World Behaviour)** 则是世界在后台依定时器循环执行的代码段：游戏原版的自然灾害、移民调度与道路老化衰变正是通过该机制进行驱动的。

```csharp Mods/HelloBox/Code/HelloAges.cs
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloAges
    {
        public const string EMBERS = "age_hello_embers";
        public const string SPARKS = "hello_sparks";

        public static void Initialize()
        {
            RegisterAge();
            RegisterBehaviour();
        }

        private static void RegisterAge()
        {
            if (AssetManager.era_library.has(EMBERS)) return;

            WorldAgeAsset age = new WorldAgeAsset
            {
                id = EMBERS,
                path_icon = "ui/Icons/iconHelloAge",
                rate = 2,
                particles_ash = true,
                overlay_ash = true,
                era_effect_overlay_alpha = 0.2f,
                title_color = Toolbox.makeColor("#D14219"),
                bonus_loyalty = 5,
                fire_spread_rate_bonus = 2f,
                cloud_interval = 20f,
                special_effect_interval = 8f
            };
            age.clouds = new List<string> { HelloClouds.EMBER };
            age.biomes = new HashSet<string> { "biome_savanna" };
            age.default_slots = new List<int> { 4 };
            age.special_effect_action = RainEmbers;

            AssetManager.era_library.add(age);

            // post_init() builds this path from the id, at startup. Borrow a vanilla background.
            age.path_background = "ui/AgeWheel/backgrounds/age_sun_background";

            // linkAssets() built both pools at startup: the random pick, and the wheel's default slots
            AssetManager.era_library.list_only_normal.Add(age);
            foreach (int slot in age.default_slots)
            {
                if (AssetManager.era_library.pool_by_slots.TryGetValue(slot, out List<WorldAgeAsset> pool)) pool.Add(age);
            }
        }

        /** Every special_effect_interval seconds while the age lasts. */
        private static void RainEmbers()
        {
            WorldTile[] tiles = World.world.tiles_list;
            if (tiles == null || tiles.Length == 0) return;

            for (int i = 0; i < 5; i++)
            {
                WorldTile tile = tiles[Randy.randomInt(0, tiles.Length)];
                if (tile != null) World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);
            }
        }

        private static void RegisterBehaviour()
        {
            if (AssetManager.world_behaviours.has(SPARKS)) return;

            WorldBehaviourAsset sparks = new WorldBehaviourAsset
            {
                id = SPARKS,
                interval = 30f,          // seconds between runs
                interval_random = 15f,   // plus up to this much, so it does not tick like a metronome
                action = CurseSomebody
            };

            AssetManager.world_behaviours.add(sparks);

            // MapBox creates one manager per behaviour when it wakes up, before your mod.
            // Without this the world loop calls update() on null, every frame.
            sparks.manager = new WorldBehaviour(sparks);
        }

        /** While the chaos law is on, a random creature catches the curse. */
        private static void CurseSomebody()
        {
            WorldLawAsset chaos = AssetManager.world_laws_library.get(HelloLaws.CHAOS);
            if (chaos == null || !chaos.isEnabled()) return;

            List<Actor> units = World.world.units.getSimpleList();
            if (units.Count == 0) return;

            Actor victim = units[Randy.randomInt(0, units.Count)];
            if (victim != null && victim.isAlive()) victim.addStatusEffect(HelloStatus.CURSED);
        }
    }
}
```

## 世界时代 (World Ages)

余烬时代每隔 8 秒便会降下一场余烬之雨，灰烬粒子会使全屏视野暗淡，火焰蔓延速度提升至 2 倍，并让各城市的忠诚度略微上升。新创建的世界可以在时代之轮的第 4 格默认嵌入该时代，时代之轮的随机骰子也可能将其掷入任意轮盘格中。低调从来不是 HelloBox 的目标 :wbfireskull:。

> [!WARNING] 底层库在游戏启动阶段已完成的三大步骤
> `post_init()` 会根据 ID 自动拼接并设置时代的背景贴图，而 `linkAssets()` 则会构建 `list_only_normal`（问号随机时代池）以及 `pool_by_slots`（新世界生成时按轮盘格分配的备选池）。后注册的新时代不会自动进入这些集合。若忽略背景设置，轮盘会展示为空白切片；若忽略注册池注入，时代虽然存在但绝不会被任何世界自然摇出。

> [!NOTE] 时代选择面板中的按钮生成
> 时代选择面板在初次唤醒时会为库中的每个时代构建一个独立按钮，且游戏会对该窗口进行预加载。由于不同环境下该窗口可能早于模组载入完成初始化，你的自制时代是否能在该面板生成按钮需在游戏中实测确认。不过，时代之轮的轮播、随机抽取池与自定义特异效果完全不受该按钮影响。

| 字段 | 功能作用 |
| --- | --- |
| `rate` | 随机摇选时代时的抽取权重 |
| `default_slots` | 允许新地图轮盘默认分配的格子编号（1 至 8） |
| `clouds` + `cloud_interval` | 周期性刷新的云朵类型及生成时间间隔 |
| `special_effect_action` + `special_effect_interval` | 该时代持续期间定时触发的自定义特异委托及周期 |
| `overlay_*`, `particles_*`, `era_effect_overlay_alpha` | 视觉氛围：黑暗度、雨雪、灰烬、烈阳等全局滤镜 |
| `title_color`, `light_color` | 时代标题文本颜色及全局环境光照着色 |
| `bonus_loyalty`, `bonus_opinion`, `bonus_biomes_growth` | 作用于政治倾向、外交关系与植被生态的数值增益 |
| `fire_spread_rate_bonus`, `temperature_damage_bonus`, `range_weapons_multiplier` | 调整的世界物理法则乘数 |
| `flag_night`, `flag_winter`, `flag_chaos`, `flag_light_age`, `flag_crops_grow` | 供其他系统判定的宏观布尔开关（农作物仅在 `flag_crops_grow` 为 true 时生长） |

本地化文本键分别为 `<id>_title` 与 `<id>_description`。

## 世界行为 (World Behaviours)

世界行为的核心由两个数值和一个委托构成：每隔 `interval` 秒执行一次 `action`，并附加最高 `interval_random` 秒的随机浮动偏量（避免像节拍器一样机械式卡顿）。除非设置 `stop_when_world_on_pause = false`，否则在游戏暂停时定时器也会同步挂起，而在载入新世界时会触发 `action_world_clear`。

> [!WARNING] 管理器在游戏启动初期已全量构建
> 游戏世界会为每个世界行为资产保留一个 `WorldBehaviour` 计时器，由地图初次载入时的 `createManagers()` 统一生成（早于模组运行）。模组新追加的资产默认 `manager == null`，而世界的每帧更新循环依然会强行调用它：导致每帧持续报出 `NullReferenceException` 崩溃 :wbfacepalm:。在 `add()` 之后手动为其创建管理器实例即可彻底解决。

HelloBox 中的世界行为在对应世界法则未开启时会直接跳过。这正是推荐的优雅实践：前置条件检查开销极低，让定时器持续走表而在 action 内部判定是否放行。

```json Mods/HelloBox/Locales/en.json
{
  "age_hello_embers_title": "Age of Embers",
  "age_hello_embers_description": "The sky is on fire, a little. Cities like it."
}
```

对于无需依赖游戏世界生命周期的独立定时代码（例如 UI 刷新），直接在主模组类的 NML `Update()` 中处理会更简洁明了：参见 **[整装待发：完整模组工程](#/nml/all-together)** :PES_OkHand:。
