---
title: 状态效果
group: 游戏内容
subgroup: 生物实体、建筑与 AI
icon: :wbcursed:
order: 146
---

# 状态效果 :wbcursed:

特质代表一个生物“**是**”什么，而状态效果则代表它“**此刻正经历着**”什么：燃烧、冻结、中毒、祝福。状态效果具有寿命并会自动消退，能在生物头顶动态覆盖一层视觉特效贴图，并且能够按计时器定时触发执行逻辑。

## 注册状态效果

状态效果保存在 `AssetManager.status` 资源库中。基本套路与特质如出一辙：实例化对象、配置字段、注册入库。

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] 只有原版状态会加载帧
> `StatusLibrary` 在游戏加载时一次性地从 `"effects/" + texture` 填好 `sprite_list` 并设置 `need_visual_render`。之后加进来的状态 `sprite_list = null`，一旦有生物得到它，只要状态还在，`Status.updateAnimationFrame()` 每帧都抛 `NullReferenceException` :wbfacepalm:。`Initialize` 最后两行就是替你的状态补做这一步。
>
> `texture` 指的是一个 **文件夹**：`GameResources/effects/fx_hello_status/`，每个动画帧一张 PNG。


### 核心字段一览

精简版列表。完整的那份更长，而且大多很无聊 :wbyawn:。

| 字段 | 作用 |
| --- | --- |
| `duration` | 持续时间（秒）。倒计时结束后状态自动解除 |
| `allow_timer_reset` | 重复获得该状态时，是刷新持续时间还是直接忽略 |
| `tier` | `StatusTier.None`, `Basic` 或 `Advanced`。单位的 `allowed_status_tiers` 决定能否挂载该阶级 |
| `can_be_cured` | 能否被神圣治愈能力或治疗药物驱散解除 |
| `removed_on_damage` | 生物一旦受到任何伤害，该状态便瞬间破碎脱落 |
| `cancel_actor_job` | 挂载瞬间是否强行打断生物当前正在做的事 |
| `affects_mind` | 标记为心智精神类状态（供原版特殊机制检测） |
| `opposite_status` | 水火不容的互斥状态（不可共存） |
| `remove_status` | 获得本状态时强制驱散剥夺的指定状态 |
| `base_stats` | 状态生效期间提供的属性加成/减益 |
| `locale_id` / `locale_description` | 状态标题与悬浮描述的本地化键。**必填项** |
| `path_icon` | 状态列表小图标路径 |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | 覆盖在生物头顶身上的特效图。`texture` 仅填写位于 `effects/` 下的纯文件名 |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | 特效图的锚点偏移与渲染参数 |
| `opposite_traits`, `opposite_tags` | 免疫阻断该状态的特质或标签 |
| `action_on_receive`, `action_get_hit` | 挂载生效时及受击时的额外委托回调 |
| `sound_idle` | 状态存续期间循环播放的 FMOD 环境音效 |

## 导入自定义贴图

这里暗藏着一个大坑，每个人都会掉进去一次 :wbbre:。`texture` **绝不是**完整路径：状态库在加载时会自动在前面拼接 `effects/`，所以你只需要写纯文件名。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // 绝不是 "effects/fx_hello_status"
```

如果你自己写上了文件夹路径，游戏就会傻乎乎地去寻找 `effects/effects/fx_hello_status`，结果什么都找不到，贴图彻底隐形。

同属该资源的 `path_icon` 则是另一码事，它*确实*是完整路径——因为它是 UI 栏上的小图标，而不是糊在生物身上的特效贴图。

## 让状态效果真正发挥*作用*

在状态持续期间，`action` 每隔 `action_interval` 秒就会执行一次。`action_finish` 在状态时间自然耗尽时触发，`action_death` 则在生物带着该状态死亡时触发。

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // 属于公开方法，足以实现完美的周期性扣血中毒效果
    return true;
};
```

## 将状态效果附加到单位身上

这里很多人会踩雷。最直观的 `actor.addStatusEffect("hello_cursed")` 方法在游戏程序集中被声明为 `internal`。针对公开化 (publicized) 的 `Assembly-CSharp.dll` 它能顺利编译，而普通的 NML 模组本来就有一份：NML 会用自己的公开化副本来编译你的 `Code/*.cs`，所以本指南里的每个 `internal` 成员在你这里都能编译通过。只有当你在 Visual Studio 里针对原版程序集自己编译 `.dll` 时才会失去它。那种情况下，公开的入口永远可用：

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 持续 20 秒（若传 0 则使用该资源自身的默认持续时间）
```

在 AI 行为树节点中，原版也提供了现成的包装节点：`new BehActorAddStatus("hello_cursed", 20f)` 与 `new BehActorRemoveStatus("hello_cursed")`。

## 切记添加本地化文本

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

本地化键名取决于你在 `locale_id` 和 `locale_description` 中填写的内容。遵循原版的 `status_title_<id>` / `status_description_<id>` 命名规范能让你的语言包井井有条。

> [!TIP] 临时效果请优先使用状态而非特质
> 任何有持续时间、过一会儿就该解除的效果（神圣能力的增益、武器攻击附加的负面减益、目标标记），都应该做成状态效果，而不是特质。特质是永久存在的，还会像基因一样遗传给子女，这几乎绝不是你想要的结果 :PES2_Uhm:.
