---
title: 运行时的游戏世界
group: Game Content
subgroup: Architecture & Stats
icon: :wbworld:
order: 96
---

# 运行时的游戏世界 :wbworld:

指南前面的所有页面都在讲解如何在游戏启动加载期注册新的游戏内容。而本页则聚焦于下半部分：如何在正在运行的游戏世界中与已有对象进行交互并修改它们。摧毁一座城市、将其转让给另一个国家、发动战争（war），或者用城市自身的居民重新填充它。

所有这些操作都应该在神力（GodPower）的 `click_action`、`Update()` 循环或世界行为 (world behaviour) 中执行，**绝不能**在 `OnModLoad` 中调用——因为此时游戏世界甚至还不存在。关于安全的调用时机检查，参见 **[日志与调试](#/nml/logs-and-debugging)**。

## 遍历世界中现有的对象

```csharp
foreach (City city in World.world.cities)
{
    if (city == null || city.isRekt()) continue;
    // city.kingdom, city.units, city.buildings, city.zones
}

foreach (Building building in World.world.buildings)
{
    if (building == null || building.isRekt()) continue;
}
```

`World.world.kingdoms` 的用法完全相同，参见 **[王国与阵营](#/nml/kingdoms)**。遍历这些列表时**务必**对每个元素调用 `isRekt()`：这些列表中可能包含正在被销毁或死亡的对象 :PES2_F:。

## 将城市转让给另一个国家

```csharp
city.joinAnotherKingdom(pNewSetKingdom: kingdom);
```

传入 `pCaptured: true` 会在统计数据中将其记录为被征服，`pRebellion: true` 则记录为叛乱。城市中的所有居民单位会自动跟随其城市效忠新国家。

## 销毁对象

```csharp
city.destroyCity();              // 城市解体，其占领的区域重新变为中立无主土地
building.startDestroyBuilding(); // 如果建筑配有废墟贴图则先变为废墟，随后彻底销毁
```

`destroyCity()` 是公共方法。`startDestroyBuilding()` 被声明为 `internal`：它能够正常编译是因为 NML 使用了 publicized 程序集来构建你的模组。如果要消灭整个国家，请逐个销毁其所属的所有城市：遍历时请复制一份 `kingdom.cities` 的副本，而不要直接遍历活动列表，因为每次调用 `destroyCity()` 都会就地修改该列表。

## 发动战争

```csharp
World.world.diplomacy.startWar(pAttacker, pDefender, WarTypeLibrary.normal);
```

与上面相同，这也是 `internal` 方法。战争类型为 `WarTypeLibrary` 中的静态字段：`normal`, `spite`, `inspire`, `rebellion`, `whisper_of_war`, `clash`。

## 用城市自身的居民填充城市

```csharp
Subspecies main = city.getMainSubspecies();
WorldTile tile = city.getTile();
if (main == null || tile == null) return;

Actor actor = World.world.units.createNewUnit(city.getActorAsset().id, tile, pSubspecies: main, pAdultAge: true);
actor?.joinCity(city);
```

**[自定义角色](#/nml/custom-actors)** 中的 `spawnNewUnit` 会自动为你挑选亚种（subspecies）。而 `createNewUnit` 允许你自行指定亚种，这就是“生成一个人类”和“生成一个*属于这个亚种*的人类”之间的区别。

## 父母亲属

```csharp
foreach (Actor parent in actor.getParents())
{
    // 仅包含依然存活的父母
}

long first = actor.data.parent_id_1;   // 即使死后 ID 也会一直保留
```

`getParents()` 仅返回依然存活的父母：它使用 `World.world.units.get(id)` 查找每个 ID 并跳过所有缺失或死亡的对象。ID 会永远保留在单位的数据中，但游戏并不会保留死者背后的具体信息。想要记住死者的族谱树，就必须在每个孩子出生时将其需要的信息直接写入其自身的数据中，参见 **[保存数据](#/nml/saving-data)**，因为在整个游戏世界中并没有专门用来存放全局记录的地方 :PES_ThinkAboutIt:。
