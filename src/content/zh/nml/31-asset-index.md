---
title: 全部底层资源库
group: 游戏内容
subgroup: 底层架构与属性
icon: :wbworld:
order: 94
---

# 全部底层资源库 :wbworld:

`AssetManager` 是整款游戏中所有可存在实体的核心总索引。它掌管着 **129 个独立的资源（resource）库**，且每一个库都是一个由 `List` 与 `Dictionary` 组成的数据结构，你可以直接从模组中读取、修改或向其追加内容。

本页面是所有资源库的完整全景索引。大部分库你可能永远都不会用到。它的意义在于：每当你想修改 WorldBox 中的某些机制时，首要问题永远是“它归哪个库管？”，而答案就在这一页中。

## 阅读本页之前

**[资源库（Asset libraries）](#/nml/asset-libraries)** 详细讲解了这些库的标准通用操作：`has`、`get`、`add`、`clone`、模板的使用、自定义重排序，以及适用于全部 129 个库的四大铁律。请先通读该指南。本页面仅为速查索引。

极简回顾：

```csharp
AssetManager.traits.has("hello_swift");            // 是否已被注册？
AssetManager.traits.get("hello_swift");            // 获取实例（若不存在则返回 null）
AssetManager.traits.add(myTrait);                  // 注册一个新资源
AssetManager.traits.clone("hello_new", "strong");   // 克隆现有资源并自动完成注册
AssetManager.traits.list;                          // 按注册顺序排列的全部资源列表
AssetManager.traits.dict;                          // 按 ID 索引的全部资源字典
```

---

## 生物与特质

你实际最常打交道的是前四个库，其余的列在这里是为了免去盲猜命名的痛苦 :PES2_Shrug:。


| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `actor_library` | `ActorAsset` | 全游戏所有生物种族。**[自定义生物角色](#/nml/custom-actors)** |
| `traits` | `ActorTrait` | 生物个体特质（trait）。**[自定义特质](#/nml/custom-traits)** |
| `trait_groups` | `ActorTraitGroupAsset` | 特质界面的分类标签页。**[特质组与标签页](#/nml/trait-groups)** |
| `subspecies_traits` | `SubspeciesTrait` | 亚种（subspecies）特质及其美术贴图。**[亚种特质](#/nml/subspecies-traits)** |
| `subspecies_trait_groups` | `SubspeciesTraitGroupAsset` | 亚种特质分类标签页 |
| `phenotype_library` | `PhenotypeAsset` | 肤色与外貌表现型变体 |
| `gene_library` | `GeneAsset` | 遗传基因 |
| `chromosome_type_library` | `ChromosomeTypeAsset` | 染色体类型 |
| `trait_rains` | `TraitRainAsset` | “特质之雨”降落事件 |
| `personalities` | `PersonalityAsset` | 单位性格特征 |
| `professions` | `ProfessionAsset` | 市民从事的职业（job）岗位 |
| `base_stats_library` | `BaseStatAsset` | 所有底层战斗属性。**[属性与数值参考](#/nml/stats)** |

## 社会与文明

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `kingdoms` | `KingdomAsset` | 阵营类型模板。**[王国与阵营](#/nml/kingdoms)** |
| `kingdoms_traits` / `kingdoms_traits_groups` | `KingdomTrait` | 王国（kingdom）国策（税收等）。**[王国特质](#/nml/kingdom-traits)** |
| `culture_traits` / `culture_trait_groups` | `CultureTrait` | 文化系统。**[文化特质](#/nml/culture-traits)** |
| `religion_traits` / `religion_trait_groups` | `ReligionTrait` | 宗教（religion）系统。**[宗教特质](#/nml/religion-traits)** |
| `clan_traits` / `clan_trait_groups` | `ClanTrait` | 家族氏族。**[家族特质](#/nml/clan-traits)** |
| `language_traits` / `language_trait_groups` | `LanguageTrait` | 语言系统。**[语言特质](#/nml/language-traits)** |
| `architecture_library` | `ArchitectureAsset` | 各文明建筑（building）的贴图与建造风格 |
| `city_build_orders` | `CityBuildOrderAsset` | 新城市建造设施的先后顺序规则 |
| `war_types_library` | `WarTypeAsset` | 可以发动的战争种类。**[战争类型](#/nml/war-types)** |
| `loyalty_library` | `LoyaltyAsset` | 影响城市忠诚度的因素 |
| `opinion_library` | `OpinionAsset` | 影响外交关系的因素 |
| `happiness_library` | `HappinessAsset` | 影响市民快乐度的因素 |
| `plots_library` | `PlotAsset` | 统治者发起并付出代价的阴谋。**[阴谋](#/nml/plots)** |
| `plot_category_library` | `PlotCategoryAsset` | 阴谋窗口里的分区。**[阴谋](#/nml/plots)** |
| `decisions_library` | `DecisionAsset` | 宏观决策（decision）项 |
| `communication_library` / `communication_topic_library` | `CommunicationAsset` | 单位之间交谈的话题 |
| `book_types` | `BookTypeAsset` | 书籍分类。**[书籍](#/nml/books)** |
| `knowledge_library` | `KnowledgeAsset` | 知识界面的解锁项 |

## 自然与世界万物

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `buildings` | `BuildingAsset` | 所有建筑物。**[自定义建筑](#/nml/custom-buildings)** |
| `tiles` | `TileType` | 底土地面图层。**[地块与地形](#/nml/tiles)** |
| `top_tiles` | `TopTileType` | 表面地块（tile）图层 |
| `tile_tile_effects` | `TileEffectAsset` | 作用于单地块的特效 |
| `terraform` | `TerraformOptions` | 地表地形清理预设 |
| `biome_library` | `BiomeAsset` | 生物群系。**[生物群系](#/nml/biomes)** |
| `resources` | `ResourceAsset` | 食物、工业原料、货币。**[资源与食物](#/nml/resources)** |
| `clouds` | `CloudAsset` | 天气与云朵。**[云朵与天气](#/nml/clouds)** |
| `drops` | `DropAsset` | 下落微粒与雨滴。**[下落物与掉落物品](#/nml/drops-and-loot)** |
| `disasters` | `DisasterAsset` | 自然灾害。**[天灾灾祸](#/nml/disasters)** |
| `projectiles` | `ProjectileAsset` | 飞行物。**[投射物、法术与特效](#/nml/projectiles-spells)** |
| `effects_library` | `EffectAsset` | 视觉粒子特效 |
| `months` | `MonthAsset` | 月份历法 |
| `era_library` | `WorldAgeAsset` | 时代（world age）纪元 |
| `time_scales` | `WorldTimeScaleAsset` | 游戏运行速度挡位。“加速”按钮按顺序遍历 `list`，非调试模式下永远到不了最后一项（原版的 `x40`）。你追加的速度档位就会变成那个够不到的最后一项：请把它 `Insert` 在最后一项之前 |
| `map_sizes` | `MapSizeAsset` | 新建世界窗口里的地图尺寸档位。**[地图生成](#/nml/map-generation)** |
| `map_gen_templates` | `MapGenTemplate` | 世界形状：`continent`、`islands`、`donut`……**[地图生成](#/nml/map-generation)** |
| `map_gen_settings` | `MapGenSettingsAsset` | 模板下方的滑条与开关。**[地图生成](#/nml/map-generation)** |
| `world_behaviours` | `WorldBehaviourAsset` | 全局后台宏观模拟逻辑 |
| `sim_globals_library` | `SimGlobalAsset` | 全局底层仿真常量 |

## 装备与战斗

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `items` | `EquipmentAsset` | 武器、防具、材质。**[自定义装备物品](#/nml/custom-items)** |
| `items_modifiers` | `ItemModAsset` | 武器词条附魔（modifier）。**[武器词条附魔](#/nml/item-modifiers)** |
| `item_groups` | `ItemGroupAsset` | 装备分类栏。**[物品组与标签页](#/nml/item-groups)** |
| `unit_hand_tools` | `UnitHandToolAsset` | 单位工作时手持的专用工具 |
| `status` | `StatusAsset` | 状态效果。**[状态效果](#/nml/status-effects)** |
| `spells` | `SpellAsset` | 单位主动施放的技能法术（spell） |
| `combat_action_library` | `CombatActionAsset` | 战斗攻击招式 |
| `rarity_library` | `RarityAsset` | 装备稀有度品阶 |

## 玩家上帝工具

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `powers` | `GodPower` | 上帝能力。**[上帝能力（God powers）](#/nml/god-powers)** |
| `power_tab_library` | `PowerTabAsset` | 底部工具栏标签页。**[能力标签页与按钮](#/nml/power-buttons)** |
| `world_laws_library` | `WorldLawAsset` | 世界法则（world law）。**[世界法则](#/nml/world-laws)** |
| `world_law_groups` | `WorldLawGroupAsset` | 世界法则窗口里的标签页。**[世界法则](#/nml/world-laws)** |
| `brush_library` | `BrushData` | 笔刷尺寸 |
| `hotkey_library` | `HotkeyAsset` | 键盘快捷键 |
| `debug_tool_library` | `DebugToolAsset` | 调试开发工具 |

## 人工智能（AI）

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `job_actor` / `tasks_actor` | `ActorJob` / `BehaviourTaskActor` | 个体AI。**[自定义AI与行为逻辑](#/nml/custom-ai)** |
| `job_city` / `tasks_city` | `JobCityAsset` / `BehaviourTaskCity` | 城市AI |
| `job_kingdom` / `tasks_kingdom` | `KingdomJob` / `BehaviourTaskKingdom` | 王国AI |
| `citizen_job_library` | `CitizenJobAsset` | 市民日常分工逻辑 |
| `neural_layers` | `NeuralLayerAsset` | 神经网络调试视图 |
| `tester_jobs` / `tester_tasks` | `JobTesterAsset` | 游戏内置的AI自动化测试脚手架 |

## 用户界面

这里 `window_library` 和 `options_library` 都拥有专属教程页面，其余的虽然能用，但非必要请勿随意改动 :PES5_Hmmmm:。


| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `window_library` | `WindowAsset` | 弹出窗口。**[自定义窗口](#/nml/custom-windows)** |
| `list_window_library` | `ListWindowAsset` | 列表视窗（王国列表、城市列表等） |
| `tooltips` | `TooltipAsset` | 提示框排版布局 |
| `nameplates_library` | `NameplateAsset` | 地图模式在王国、城市、家族等对象上方绘制的名称横幅。每个 `MetaType` 只能有一个：对已经有铭牌的地图模式调用 `add()` 会抛出异常，所以要改原版铭牌就用 `get()` |
| `options_library` | `OptionAsset` | 游戏自己的设置窗口。**[游戏选项](#/nml/game-options)** |
| `color_style_library` | `ColorStyleAsset` | UI界面配色方案 |
| `dynamic_sprites_library` | `DynamicSpritesAsset` | 运行时动态合成精灵图 |
| `quantum_sprites` | `QuantumSpriteAsset` | 贴图变体 |
| `meta_type_library` | `MetaTypeAsset` | 元系统核心定义（文化、宗教等） |
| `meta_customization_library` | `MetaCustomizationAsset` | 元系统编辑器选项 |
| `meta_representation_library` | `MetaRepresentationAsset` | 元系统视觉呈现形式 |
| `meta_text_report_library` | `MetaTextReportAsset` | 元系统文本简报 |
| `architect_mood_library` | `ArchitectMood` | 建筑师模式氛围 |

## 旗帜与颜色

分别拥有专属库，但内部均统一承载这两种核心资源：

`kingdom_banners_library` · `culture_banners_library` · `clan_banners_library` · `religion_banners_library` · `language_banners_library` · `subspecies_banners_library` · `family_banners_library` → 均为 `BannerAsset`

`kingdom_colors_library` · `culture_colors_library` · `clan_colors_library` · `religion_colors_library` · `languages_colors_library` · `subspecies_colors_library` · `families_colors_library` · `armies_colors_library` → 均为 `ColorAsset`

## 名字、语言与纪事

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `name_generator` | `NameGeneratorAsset` | 随机起名生成器。**[名字生成器](#/nml/name-generators)** |
| `name_sets` | `NameSetAsset` | 词汇种子语料库 |
| `onomastics_library` / `onomastics_evolution_library` | `OnomasticsAsset` | 专有名词演变规律 |
| `linguistics_library` | `LinguisticsAsset` | 语言构词结构 |
| `words_library` | `WordAsset` | 单词列表 |
| `sentences_library` | `SentenceAsset` | 句式语法 |
| `story_library` | `StoryAsset` | 程序化生成的历史纪事故事 |
| `world_log_library` | `WorldLogAsset` | 世界日志条目类型 |
| `history_data_library` / `history_meta_data_library` | `HistoryDataAsset` | 历史记录归档 |
| `history_groups` | `HistoryGroupAsset` | 历史归档分类 |
| `graph_time_library` | `GraphTimeAsset` | 统计折线图时间轴跨度 |
| `statistics_library` | `StatisticsAsset` | 历史追踪统计项 |

## 音频、语言与成就

| 资源库 | 承载资源类型 | 存储内容说明 |
| --- | --- | --- |
| `music_box` | `MusicAsset` | 游戏音乐曲目 |
| `game_language_library` | `GameLanguageAsset` | 游戏内置UI界面语言 |
| `locale_groups_library` | `LocaleGroupAsset` | 本地化语言分组 |
| `achievements` / `achievement_groups` | `Achievement` | 成就（achievement） |
| `signals` | `SignalAsset` | 内部信号通信系统 |

---

## 如何找到你要的库

1. **推测英文名词。** 几乎每一个库都是直接以它所管理的对象命名的。
2. **在控制台输出列表。** `foreach (var a in AssetManager.buildings.list) LogInfo(a.id);` 两行代码就能彻底搞清有哪些已有的ID。
3. **查阅对应库的 `init()` 方法。** 所有原版资源都在那里用原汁原味的 C# 代码实例化——这是了解一个字段真正用途的最权威文档。参见 **[阅读游戏源代码](#/toolbox/reading-the-game-code)**。

> [!TIP] 优先就地修改，而非凭空添加
> 模组开发中有相当大的比例其实只需要 `get()` 获取现有资源，然后随手改掉上面的两三个字段。这样代码更精简、在游戏后续更新中更健壮，而且完全不需要重新绘制美术素材 :PES2_Wise:。
