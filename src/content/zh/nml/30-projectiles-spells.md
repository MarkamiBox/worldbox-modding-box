---
title: 投射物、法术与特效
group: 游戏内容
subgroup: 生物实体、建筑与 AI
icon: :wblightning:
order: 148
---

# 投射物、法术与特效 :wblightning:

一旦你开始在地图上制作动态战斗或交互事件，就会频繁接触这三个精简的底层资源库：

| | |
| --- | --- |
| `AssetManager.projectiles` | 从点A飞向点B的实体：箭矢、燃烧瓶、投掷的火把 |
| `AssetManager.spells` | 单位自发施放的技能（消耗法力值，受AI触发概率控制） |
| `AssetManager.effects_library` | 纯视觉表现：爆炸、云层、闪光、烟雾扩散 |

## 投射物

```csharp Mods/HelloBox/Code/HelloProjectiles.cs
namespace HelloBox
{
    public static class HelloProjectiles
    {
        public const string EMBER_BOLT = "hello_ember_bolt";

        public static void Initialize()
        {
            if (AssetManager.projectiles.has(EMBER_BOLT)) return;

            AssetManager.projectiles.clone(EMBER_BOLT, "firebomb");

            ProjectileAsset bolt = AssetManager.projectiles.get(EMBER_BOLT);
            bolt.texture = "hello_bolt";                    // sprite in GameResources/effects/projectiles/
            bolt.speed = 16f;
            bolt.speed_random = 2f;
            bolt.look_at_target = true;
            bolt.trail_effect_enabled = true;
            bolt.trail_effect_id = "fx_fire_smoke";
            bolt.end_effect = "fx_firebomb_explosion";
            bolt.terraform_option = "demon_fireball";     // 着弹对地面造成的地形改变
            bolt.terraform_range = 2;

            bolt.impact_actions = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
                return true;
            };
        }
    }
}
```

### 字段详解

| 字段 | 作用 |
| --- | --- |
| `texture`, `texture_shadow` | 精灵图本体及其阴影 |
| `animated`, `animation_speed`, `frames` | 飞行途中是否播放逐帧动画 |
| `speed`, `speed_random` | 飞行速度以及每次出膛的随机偏差 |
| `look_at_target` | 精灵图是否朝向飞行轨迹旋转对齐 |
| `scale_start`, `scale_target` | 出膛与着弹时的缩放大小 |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | 弹道尾迹粒子特效 |
| `end_effect`, `end_effect_scale` | 命中时在落点处生成的特效 |
| `terraform_option`, `terraform_range` | 碰撞时的地形破坏配置。参见 **[地块与地形](#/nml/tiles)** |
| `world_actions` | 飞行过程中周期性运行的委托 |
| `impact_actions` | 命中着弹瞬间运行的委托 |
| `trigger_on_collision` | 碰到第一个阻挡实体即引爆，而非飞到落点再引爆 |
| `hit_freeze`, `hit_shake`, `shake_*` | 击中时的顿挫与屏幕震动打击感 |
| `can_be_blocked`, `can_be_left_on_ground` | 能否被盾牌格挡，是否会掉落在地上成为掉落物 |
| `sound_launch`, `sound_impact` | FMOD 发射音效与撞击音效事件 |
| `draw_light_area`, `draw_light_size` | 飞行途中的发光光晕 |

### 发射一颗投射物

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

发射与目标坐标均要求 `Vector3`。地块的 `posV3` 最容易获取；单位身上的 `current_position` 是 `Vector2`，因此需要先进行坐标转换。

推荐克隆的原版投射物ID：`arrow` · `snowball` · `firebomb` · `torch`。

### 自定义精灵图路径

投射物的 `texture` **不是**完整路径。底层库会自动追加 `effects/projectiles/` 前缀，因此代码中只写文件名。

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // 切勿写成 "effects/projectiles/hello_bolt"
```

投射物同样按精灵列表加载：一个以 `texture` 命名的 **文件夹**，每帧一个 PNG，开启 `animated` 时多帧就成为飞行动画。单独的 `hello_bolt.png` 会返回空列表，绘制投射物时会抛出 `ArgumentOutOfRangeException`。

`texture_shadow` 则是无前缀的完整路径：原版直接引用公用的 `shadows/projectiles/shadow_ball`，直接沿用它几乎总是最省事的做法。

## 法术技能

法术是单位在没有玩家干预的情况下自发施放的技能。AI根据 `chance`、`cost_mana` 与 `min_distance` 自行决断何时施放。

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // AI选用该法术的积极性
    min_distance = 5f,                  // 低于该距离则拒绝施法
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // 仅在生命值低于该比例时施放。0为无限制
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

`action` 是一个 `AttackAction` 委托，与武器词条附魔使用的是同一委托签名，因此法术主体逻辑与附魔打击逻辑完全通用。

### 将法术赋予实体

法术通过ID挂载到赋予它的载体上：

```csharp
trait.addSpell("hello_bolt");        // 七大特质系统中的任意特质
item.addSpell("hello_bolt");         // 装备道具
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

值得参考的原版法术ID：`teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`。

## 战斗动作

`CombatActionAsset` 是一个在战斗事件触发时执行的委托，通常用于触发法术或特效：

```csharp Mods/HelloBox/Code/HelloSpells.cs
CombatActionAsset action = new CombatActionAsset
{
    id = "hello_cast_on_attack",
    action = (pSelf, pTarget, pWorldTile) =>
    {
        if (pSelf == null || !pSelf.isAlive()) return false;

        // do the cast
        return true;
    }
};
AssetManager.combat_actions.add(action);
```

将其挂钩到特质的事件中：

```csharp
trait.addCombatAction(CombatActionAsset.BEFORE_ATTACK_MELEE, "hello_cast_on_attack");
```

> [!WARNING] 只能通过特质进行分发
> 你无法将战斗动作直接挂载到 `ActorAsset` 上。每一个战斗事件都会遍历角色的特质并查询其动作，因此如果你想让单位拥有该动作，请将其配置在特质中，并将特质赋予该单位 :PES2_Shrug:。

## 视觉特效

`EffectAsset` 是纯粹的视觉表现：在指定坐标播放的 Prefab 预制件或精灵图逐帧动画。在开发中，你调用已有特效的频率会远远高于自己新建特效。

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // 部分特效支持携带参数
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| 字段 | 作用 |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | 实例化的 Prefab 预制件 |
| `sprite_path`, `load_texture`, `time_between_frames` | 替代 Prefab 的精灵图逐帧动画 |
| `spawn_action` | 特效生成时运行的委托（`fx_cloud` 正是通过此机制将参数解析为真正的云） |
| `limit`, `limit_unload` | 同屏最大共存数量限制 |
| `cooldown_interval` | 两次生成之间的最小冷却间隔 |
| `sound_launch`, `sound_loop_idle` | FMOD 音效事件 |
| `draw_light_area`, `draw_light_size` | 光照范围 |
| `show_on_mini_map` | 是否在小地图上绘制 |

> [!TIP] 动手画图前先查阅现有资源
> 游戏中已经存在几百种现成的 `fx_*` 特效，且 `EffectsLibrary` 是个非常短小的类。用 dnSpy 打开它（参见 **[阅读游戏源代码](#/toolbox/reading-the-game-code)**）通读一遍所有特效ID。很多时候你想画的爆炸效果早就有人做好了 :PESgn_CheckPins:。
