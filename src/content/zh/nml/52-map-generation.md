---
title: 地图生成
group: 游戏内容
subgroup: 世界环境与文明
icon: :wbworld:
order: 169
---

# 地图生成 :wbworld:

新建世界窗口读取三个资源库。`map_sizes` 是大小切换器，`map_gen_templates` 是那一排形状卡片（`continent`、`islands`、`donut`……），`map_gen_settings` 则是选完卡片之后出现的滑条和开关。这三者都是普通的资源库。但只有其中一个是即插即用的，本页会提前告诉你哪些部分需要额外的 UI 工作，免得你自己摸黑撞上去。

## 一张更大的地图

一个大小档位是一个 `MapSizeAsset`，只有四个字段：

| 字段 | 含义 |
| --- | --- |
| `id` | 同时也是翻译键，带前缀：`map_size_<id>` |
| `size` | 地图边长，单位是 64 格的区块。`iceberg` 是 `9`，也就是 576 x 576 |
| `path_icon` | 大小名称旁边的图标，相对于 `ui/Icons/` 的路径 |
| `show_warning` | 把窗口的问候语换成“这张地图很大”的警告 |

原版档位：`tiny` 2 · `small` 3 · `standard` 4 · `large` 5 · `huge` 6 · `gigantic` 7 · `titanic` 8 · `iceberg` 9。

```csharp Mods/HelloBox/Code/HelloMapGen.cs
namespace HelloBox
{
    public static class HelloMapGen
    {
        public const string COLOSSAL = "hello_colossal";

        public static void Initialize()
        {
            AddColossal();
            AddRing();
        }

        public const string RING = "hello_ring";

        private static void AddRing()
        {
            if (AssetManager.map_gen_templates.has(RING)) return;

            MapGenTemplate ring = AssetManager.map_gen_templates.clone(RING, "donut");

            // values is a plain object, so the clone shares donut's. give it its own before touching it
            ring.values = new MapGenValues
            {
                gradient_round_edges = true,
                add_center_gradient_land = true,
                add_center_lake = true,
                ring_effect = true,
                perlin_noise_stage_2 = true,
                random_shapes_amount = 3
            };

            // reset copies from a backup table filled at startup, and your id is not in it
            ring.show_reset_button = false;
        }

        public static void OpenRing()
        {
            if (!AssetManager.map_gen_templates.has(RING)) return;

            Config.current_map_template = RING;
            ScrollWindow.showWindow("new_world_templates_2");
        }

        private static void AddColossal()
        {
            if (AssetManager.map_sizes.has(COLOSSAL)) return;

            AssetManager.map_sizes.add(new MapSizeAsset
            {
                id = COLOSSAL,
                size = 10,                   // 10 x 64 = 640 tiles a side
                path_icon = "iconIceberg",   // ui/Icons/ is added for you
                show_warning = true
            });

            // the size switcher reads an array built in linkAssets(), which ran before your mod
            AssetManager.map_sizes.linkAssets();
        }
    }
}
```

```json Mods/HelloBox/Locales/en.json
{
  "map_size_hello_colossal": "Colossal"
}
```

> [!WARNING] 没有 `linkAssets()`，这个大小就永远够不到
> 窗口里的箭头并不会遍历资源库本身。它们遍历的是一个普通的 `string[]`，由 `MapSizeLibrary.linkAssets()` 在启动时、也就是 NML 加载你的模组之前，构建过一次。你的大小档位确实注册进去了，但箭头会永远从它旁边直接划过。重新调用一次 `linkAssets()` 只是重建那个数组，所以是安全的。

箭头是按 `list` 的顺序走的，所以追加进去的大小档位会排在 `iceberg` 之后，这也正是更大地图该待的位置。想加更小的档位，就得在调用 `linkAssets()` 之前先 `list.Remove` 再 `list.Insert(0, ...)`。

从代码里我能告诉你的边界情况：

- **创意工坊上传会拒绝它。** 上传检查会拿这个大小和 `Config.maxMapSize` 比较，而后者就是 `iceberg`，任何更大的都会被打回，提示“Not a valid world size!”。
- **没装你的模组时，存档列表只会显示原始数字。** 存档浏览器按数字查找对应大小，查不到就退回显示“宽 x 高”。这样的存档在没装你的模组的情况下能否顺利加载，我没有测试过。
- **我没有测试过它的极限在哪。** `10` 比 `iceberg` 多 23% 的格子，而且往上每一步的代价都更高。在某个数字之上，玩家的电脑一定会不高兴 :PES5_Hmmmm:。

## 一种新的世界形状

模板是一个 `MapGenTemplate`。真正的生成配方藏在它的 `values` 里，其余字段决定的是它如何呈现：

| 字段 | 含义 |
| --- | --- |
| `values` | 一个 `MapGenValues`：生成器读取的各种开关和数值。见下文 |
| `path_icon` | 预览图，完整路径：`ui/new_world_templates_icons/template_donut` |
| `force_height_to` | 在第一轮噪声之后、其余步骤塑形之前，把每个地块的高度强制设为这个值。`0` 表示跳过这一步 |
| `freeze_mountains` | 陆地生成完毕后，把山顶冻结住 |
| `perlin_replace` | 基于高度的地块替换，比如“高度超过 170 时，`soil_high` 变成 `soil_low`” |
| `special_anthill`、`special_checkerboard`、`special_cubicles` | 启用三种硬编码生成器中的一种 |
| `allow_edit_*` | 玩家在这个模板下能看到哪些设置行。见下一节 |
| `show_reset_button` | 窗口里是否有“重置”按钮 |

原版 id，全部都是合法的 `clone()` 来源：`continent` · `box_world` · `islands` · `toast` · `pancake` · `boring_plains` · `checkerboard` · `cubicles` · `dormant_volcano` · `cheese` · `bad_apple` · `donut` · `lasagna` · `chaos_pearl` · `anthill` · `empty`。

以及值得了解的 `MapGenValues` 字段：

| 字段 | 含义 |
| --- | --- |
| `main_perlin_noise_stage`、`perlin_noise_stage_2`、`perlin_noise_stage_3` | 塑造陆地的三轮噪声 |
| `perlin_scale_stage_1` / `_2` / `_3` | 每一轮的缩放程度。默认为 `5` |
| `gradient_round_edges` / `square_edges` | 让高度向地图边缘淡出，圆形或方形 |
| `add_center_gradient_land`、`add_center_lake`、`center_gradient_mountains` | 把陆地、湖泊或山脉推向地图中心 |
| `ring_effect` | 额外一轮环形的噪声 |
| `add_mountain_edges` / `remove_mountains` | 在地图周围加一圈山脉边界 / 把山脉削平成普通地面 |
| `low_ground` / `high_ground` | 在噪声计算完之后整体降低或抬高地面 |
| `random_shapes_amount` | 会在上面盖多少个随机形状的斑块 |
| `random_biomes`、`add_vegetation`、`add_resources` | 最后这三项默认都是 `true` |

上面的 `AddRing()` 克隆了一个原版模板，并给了它自己的生成配方。把这三个方法都放在同一个 `HelloMapGen` 类里。

```json Mods/HelloBox/Locales/en.json
{
  "template_hello_ring": "Ember Ring",
  "template_hello_ring_info": "A lake in the middle, land around it, and nobody asked for it."
}
```

> [!WARNING] 在你自己的模板上隐藏重置按钮
> “重置”调用的是 `resetTemplateValues()`，它从一个启动时只填充一次、只收录原版 id 的字典里读取模板的默认值。你的模板不在其中，所以这个按钮会抛出 `KeyNotFoundException`。设 `show_reset_button = false`，问题就不存在了。

> [!WARNING] 克隆出来的模板共享同一个 `values`
> `clone()` 会把列表复制成新的列表，但 `values` 是一个普通的类，所以是按引用复制的（参见 **[资源库](#/nml/asset-libraries)**）。如果不写 `new MapGenValues` 那一行就直接改 `ring.values.ring_effect`，每一个原版的 donut 模板都会跟着一起变。`perlin_replace` 里的条目同样是按引用共享的：构建全新的条目，而不是直接修改它们。

### 陷阱所在：没有卡片

模板选择器是一个预制体（prefab）。每个原版模板都有一个自己的按钮，每个按钮都通过自己的 GameObject 名字去找对应的模板。新模板不会自动获得按钮，资源库里的任何设置都改变不了这一点。

真正可行的办法是自己动手做按钮该做的事：设置模板，然后打开第二个窗口，和原版卡片的行为完全一样。

在你自己的按钮里调用 `HelloMapGen.OpenRing()`。

把它挂在一个普通按钮上（参见 **[神力标签页与按钮](#/nml/power-buttons)**），玩家就能获得你的预览图、你的设置行、大小箭头和生成按钮，和任何原版模板一样。要把一张真正的卡片放进选择器，意味着克隆某个已有按钮，并在其 `Awake()` 运行之前给克隆体改名，因为那正是它读取自己名字的时机。这属于我还没验证过的 UI 手术，所以本页不涉及。

> [!NOTE] 换个思路：直接修改原版模板
> `AssetManager.map_gen_templates.get("islands").values.random_shapes_amount = 10;` 是可行的，而且完全不需要按钮。只是要知道，“重置”恢复的是启动时保存的那份副本，而那份副本是在你的模组加载之前取的。点一下重置，你的改动就没了，得等下次重启才能再改。

## 模板下方的设置行

第二个窗口里的每一个滑条和开关，都是一个 `MapGenSettingsAsset`：

| 字段 | 含义 |
| --- | --- |
| `is_switch` | 开/关而不是数值 |
| `min_value` / `max_value` | 数值型设置的范围 |
| `allowed_check` | 在当前模板下，这一行是否显示 |
| `action_get` / `action_set` | 读写数值，通常读写的是当前模板的 `values` |
| `increase` / `decrease` / `action_switch` | 箭头和开关分别执行的动作 |

原版设置行：`gen_perlin_scale_stage_1` · `gen_perlin_scale_stage_2` · `gen_perlin_scale_stage_3` · `gen_random_shapes` · `gen_cubicles_sizes` · `gen_random_biomes` · `gen_mountain_edges` · `gen_add_vegetation` · `gen_add_resources` · `gen_add_center_lake` · `gen_add_center_land` · `gen_round_edges` · `gen_square_edges` · `gen_ring_effect` · `gen_low_ground` · `gen_high_ground` · `gen_remove_mountains` · `gen_forbidden_knowledge`。

模组真正用得上的部分是：每一个原版设置行的 `allowed_check` 读取的都是你模板上的某个 `allow_edit_*` 开关。所以你不是在添加新行，而是在挑选玩家能看到哪些已有的行：

```csharp
// in AddRing(), after the clone: hide everything, then give back the rows that make sense for a ring
AssetManager.map_gen_templates.disableNormalSettings(ring);
ring.allow_edit_random_biomes = true;
ring.allow_edit_random_vegetation = true;
```

一个有趣的细节：三条柏林噪声滑条全都只检查 `allow_edit_perlin_scale_stage_1`。`_2` 和 `_3` 这两个开关确实存在，但没有任何地方读取它们 :PES2_Shrug:。

单独一个新的 `MapGenSettingsAsset` 本身什么都不会显示。这些设置行是烘焙进窗口预制体里的，靠 GameObject 名字去找到自己对应的资源，和模板卡片是同一套把戏。想要自己的一行，就得在窗口内部克隆一个已有的行，并且你注册的东西必须设置好 `allowed_check`，因为窗口会在每一行上调用它，且不做空判断。

> [!TIP] 从形状入手，而不是从设置入手
> 十有八九，你真正想要的只是一个拥有不同 `values` 的模板，加上一个打开它的按钮。这完全不需要改动预制体。游戏更新之后记得再核对一遍这些字段。地形定下来之后，接下来由 **[生物群系](#/nml/biomes)** 决定上面长什么 :PES2_Wise:。
