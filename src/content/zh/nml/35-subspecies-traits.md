---
title: 亚种特质
group: 游戏内容
subgroup: 特质与遗传
icon: :wbelf:
order: 104
---

# 亚种特质 :wbelf:

**亚种**（subspecies）是物种发生基因漂变产生的分支：寿命更长、长有鳞片、卵生或发光。它通过**繁衍**而非教育来传播，并且它是唯一拥有自身独立贴图精灵的特质（trait）系统；正因如此，亚种可以在无需成为独立 Actor 的情况下，拥有与母物种截然不同的外观形态。

| | |
| --- | --- |
| 库 | `AssetManager.subspecies_traits` |
| 类 | `SubspeciesTrait` |
| 分组 | `AssetManager.subspecies_trait_groups`，类 `SubspeciesTraitGroupAsset` |
| 运行时持有者 | `Subspecies`，位于 `World.world.subspecies` |
| 本地化前缀 | `subspecies_trait_` |
| 默认图标路径 | `ui/Icons/subspecies_traits/` |

> [!WARNING] 亚种会**替换** Actor 基础属性（stats）
> 在 `Actor.updateStats()` 中，拥有亚种的单位会合并 `subspecies.base_stats`，并完全**跳过** `asset.base_stats`。这属于二选一的替换，绝非累加叠加。
>
> 因此，你在 `human` 上配置的任何数值，对任何拥有亚种的人类都是完全不可见的 —— 而在一个运行了一段时间的世界里，绝大多数人类都会演化出亚种 :PES4_IDunnoMan:。

亚种确实会在其上额外应用独立的雄性与雌性属性块，但这些属性**并非**来自特质。它们来自 `AssetManager.gene_library` 中的基因组。亚种特质只有一个对所有人通用的 `base_stats`。如果你希望通过特质实现性别差异，那属于家族特质的范畴，参见 **[家族特质](#/nml/clan-traits)**。

## 注册一个特质

```csharp Mods/HelloBox/Code/HelloSubspecies.cs
namespace HelloBox
{
    public static class HelloSubspecies
    {
        public const string SCALES = "hello_scales";

        public static void Initialize()
        {
            if (AssetManager.subspecies_traits.has(SCALES)) return;

            SubspeciesTrait trait = new SubspeciesTrait
            {
                id = SCALES,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "body",
                path_icon = "ui/Icons/iconHelloSubspecies",
                in_mutation_pot_add = true,       // 突变可以获得此特质
                in_mutation_pot_remove = false,   // 突变不会剥夺此特质
                spawn_random_trait_allowed = true,
                rarity = Rarity.R1_Rare
            };

            AssetManager.subspecies_traits.add(trait);

            trait.base_stats["armor"] = 5;
            trait.base_stats.addTag("immunity_fire");
        }
    }
}
```

## 突变

这是亚种特质在无需你手动赋予的情况下自然进入世界的机制，这也是最好玩的方式。特质库维护着两个随机奖池，以下两个字段决定你的特质加入哪些奖池：

| 字段 | 作用 |
| --- | --- |
| `in_mutation_pot_add` | 突变事件可以赋予此特质 |
| `in_mutation_pot_remove` | 突变事件可以剥离此特质 |
| `spawn_random_trait_allowed` | 是否允许在生成时随机抽中 |
| `rarity` | 被抽中的稀有度权重 |

单位的 `mutation` 属性决定了发生上述突变的概率。参见 **[属性参考](#/nml/stats)**。

> [!WARNING] 随机池只在启动时读取一次
> 光设置 `spawn_random_trait_allowed = true` 是不够的。真正的随机池 `_pot_allowed_to_be_given_randomly` 由 `BaseTraitLibrary.linkAssets()` 在游戏加载时、你的模组还不存在时建好。之后注册的特质永远不在里面，也不会有任何突变抽中它。按原版的权重方式自己把它放进去：
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.subspecies_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` 是 `protected` 的，所以它会针对 NML 本来就用来编译你模组的公开化程序集进行编译。`spawn_random_rate` 默认是 `5`：调高它，特质就会更常出现。

## 贴图美术：其他特质系统所不具备的特性

```csharp
trait.is_mutation_skin = true;
trait.sprite_path = "actors/species/mutations/hello_scales";
trait.animation_walk = ActorAnimationSequences.walk_0_3;
trait.animation_idle = ActorAnimationSequences.walk_0_3;
trait.animation_swim = ActorAnimationSequences.swim_0_3;
trait.skin_citizen_male = new List<string> { "male_1" };
trait.skin_citizen_female = new List<string> { "female_1" };
trait.skin_warrior = new List<string> { "warrior_1" };
trait.render_heads_for_children = true;

// 库在内部私有方法中为其自身皮肤构建该对象。
// Mod 可通过手写完成相同操作：
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| 字段 | 作用 |
| --- | --- |
| `is_mutation_skin` | 将其标记为皮肤替换特质，而非普通特质 |
| `sprite_path` | 纹理所在文件夹。注意纹理资源所需的结尾 `/` |
| `texture_asset` | 构建出的纹理资源包。如上所示自行手动配置 |
| `skin_citizen_male` / `_female` / `skin_warrior` | 各角色的外观变体，每个单位随机抽取 |
| `animation_walk` / `animation_idle` / `animation_swim` | 覆盖母物种的原生动画序列 |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | 各生命阶段的阴影贴图 |
| `render_heads_for_children` | 是否为儿童绘制独立的头部 |
| `prevent_unconscious_rotation` | 昏迷时保持直立不倾斜（适用于球体和粘液怪） |
| `remove_for_zombies` | 当单位变成僵尸时剥除此皮肤 |
| `priority` | 当一个单位拥有两套皮肤时的胜出优先级 |

原版中的皮肤突变（汉堡、活体巨石、触手恐惧、光球、分形）全部克隆自 `$skin_mutation$`，克隆该模板是制作可用自定义皮肤最省时的捷径。没错，汉堡是真实存在的突变。Maxim 的旨意高深莫测 :wbpray:。

## 表型、饮食与卵生

亚种特质接入的三个辅助子系统：

| 字段 | 作用 |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | 将特质绑定至 `AssetManager.phenotype_library` 中的表型 |
| `is_diet_related` | 标记为饮食系统的一部分。与 `diet_*` 属性标签搭配使用 |
| `id_egg`, `phenotype_egg` | 卵生亚种的蛋形态定义 |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | 从蛋中孵化时执行的回调逻辑 |

## 基因

开头提到的雄性和雌性属性块来自亚种的**基因组**：带槽位的染色体，每个槽位里一个基因。基因是一个 `BaseTrait`，所以它的注册方式和本站其他特质一样，只是多了两件杂事。说白了就是生物作业。

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public const string EMBER_BLOOD = "hello_ember_blood";

        public static void Initialize()
        {
            if (AssetManager.gene_library.has(EMBER_BLOOD)) return;

            GeneAsset gene = new GeneAsset
            {
                id = EMBER_BLOOD,
                path_icon = "ui/Icons/iconHelloGene",
                needs_to_be_explored = false
            };

            AssetManager.gene_library.add(gene);
            gene.base_stats["damage"] = 2f;

            // Each world rolls every gene's DNA letters from its life seed when it loads.
            // A world may already be open, so roll yours now the same way.
            if (World.world != null && World.world.map_stats != null)
            {
                gene.generateDNA(World.world.map_stats.life_dna + gene.getIndexID());
            }

            // linkAssets() filled the mutation pool at startup. Without this, only the
            // player's gene editor can ever place it.
            AssetManager.gene_library._gene_assets_mutations.Add(gene);
        }
    }
}
```

- **DNA 字母。** 每个基因都会显示一段简短的 `ACGT` 代码，在世界加载时根据该世界的生命种子逐世界掷出。你的基因没赶上那次掷骰，所以它会用同样的方式为自己掷一个。
- **突变池。** 突变会从 `_gene_assets_mutations` 里挑选，这是 `linkAssets()` 在启动时填好的私有列表。**公开化**的程序集能让你往里加东西，而 NML 正是针对这样的程序集编译的。漏掉这一步，基因就只会出现在玩家手动放置的地方。

基因的文本键是 `gene_<id>`。基因没有描述行：`GeneLibrary.add()` 会把它关掉。

```json Mods/HelloBox/Locales/en.json
{
  "gene_hello_ember_blood": "Ember Blood"
}
```

## Meta 标签

原版的若干亚种特质除了一条标签外空无一物，因为游戏正是根据该标签来决定逻辑分支的：

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // 该亚种可在该生物群落定居
trait.base_stats.addTag("walk_adaptation_snow");                 // 其单位在雪地上行走无阻
```

`base_stats_meta` 保留在亚种上。`base_stats` 传递给其单位。完整标签列表请参见 **[属性参考](#/nml/stats)**。

## 原版分组

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

创建你自己的标签页：参见 **[特质分组与标签页](#/nml/trait-groups)**，使用 `AssetManager.subspecies_trait_groups` 与 `SubspeciesTraitGroupAsset`。

## 文本本地化

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## 分发特质

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

这会让该生物的每一个新亚种都自带这个特质。如果不写这一行，改为依赖 `in_mutation_pot_add`，它就会在某个时候、某个地方自己冒出来，这通常是更有意思的版本。

> [!TIP] 法术（spell）很适合放在这里
> 原版的魔法血脉就是只授予一个法术、别的什么都不做的亚种特质：`trait.addSpell("summon_lightning")`，然后因为资源库在启动时就解析了法术 id，所以再调用 `trait.linkSpells()`。两行代码，由子代继承，就能在整片大陆上形成一支看得见的唤雷者血脉 :PES5_CrazyPog:。
