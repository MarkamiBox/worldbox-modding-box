---
title: 疑难排查
group: 概览
icon: :wbfractured:
order: 4
---

# 疑难排查 :wbfractured:

在表里找到你的症状，点一下，读三行。整页就这么用 :aPES2_ThumbsUp:。

> [!TIP] 日志回答这些问题比我快
> 十次里有九次，答案已经写在 `Player.log` 里了。**[日志与调试](#/nml/logs-and-debugging)** 告诉你它在哪、崩溃信息怎么读。

## 找到你的症状

**什么都没加载**

| 症状 | |
| --- | --- |
| 菜单里没有 Mods 按钮 | [跳转](#菜单里没有-mods-按钮) |
| Mods 窗口是空的，以前明明能用 | [跳转](#mods-窗口是空的-以前明明能用) |
| mod 文件夹在，列表里却没有 | [跳转](#mod-文件夹在-列表里却没有) |
| mod 是灰色的 | [跳转](#mod-是灰色的) |
| "Compile failed"，报错看不懂 | [跳转](#compile-failed-报错看不懂) |
| 刚粘贴的文件第 1 行报错 | [跳转](#刚粘贴的文件第-1-行报错) |
| 改了代码，什么都没变 | [跳转](#改了代码-什么都没变) |
| 你的修改怎么重启都不生效 | [跳转](#你的修改怎么重启都不生效) |
| 记事本存不进游戏文件夹 | [跳转](#记事本存不进游戏文件夹) |

**加载了，但什么都没出现**

| 症状 | |
| --- | --- |
| 在设置属性的那一行崩溃 | [跳转](#在设置属性的那一行崩溃) |
| 同样的崩溃，顺序明明是对的 | [跳转](#同样的崩溃-顺序明明是对的) |
| 你的建筑一出现就死，或者没有大小 | [跳转](#你的建筑一出现就死-或者没有大小) |
| 注册了，但哪个标签页里都没有 | [跳转](#注册了-但哪个标签页里都没有) |
| 显示的是 `trait_hello_swift` 而不是名字 | [跳转](#显示的是-trait-hello-swift-而不是名字) |
| 名字对特质有效，对物品、状态、神力无效 | [跳转](#名字对特质有效-对物品-状态-神力无效) |
| 图标是个空洞 | [跳转](#图标是个空洞) |
| 按钮占着位置却什么都不画 | [跳转](#按钮占着位置却什么都不画) |
| 状态效果不在单位身上画精灵图 | [跳转](#状态效果不在单位身上画精灵图) |
| 按钮叠在一起 | [跳转](#按钮叠在一起) |
| 按钮在，点了却什么都没激活 | [跳转](#按钮在-点了却什么都没激活) |
| `addOpposite` / `addDecision` / `addSpell` 不起作用 | [跳转](#addopposite-adddecision-addspell-不起作用) |

**注册成功，然后在世界里坏掉**

| 症状 | |
| --- | --- |
| 你的生物报阴影错误 | [跳转](#你的生物报阴影错误) |
| 你的特质、物品或生物一直是锁着的 | [跳转](#你的特质-物品或生物一直是锁着的) |
| 加载你的武器或食物时游戏崩溃 | [跳转](#加载你的武器或食物时游戏崩溃) |
| 云一出现就崩溃 | [跳转](#云一出现就崩溃) |
| 放置你的建筑时报 Index was out of range | [跳转](#放置你的建筑时报-index-was-out-of-range) |
| 你的建筑只要在屏幕上就每帧报错 | [跳转](#你的建筑只要在屏幕上就每帧报错) |
| 你的建筑一出现，小地图就报错 | [跳转](#你的建筑一出现-小地图就报错) |
| 你的地块画得上去，然后地图渲染器报错 | [跳转](#你的地块画得上去-然后地图渲染器报错) |
| 在你的地块上生成动物会崩溃 | [跳转](#在你的地块上生成动物会崩溃) |
| 掉落物隐形落下，或者弹射物报错 | [跳转](#掉落物隐形落下-或者弹射物报错) |
| 日志被弹射物的 ArgumentNullException 刷屏 | [跳转](#日志被弹射物的-argumentnullexception-刷屏) |
| 你的神力标签页始终不出现 | [跳转](#你的神力标签页始终不出现) |
| 设置窗口显示原始 id | [跳转](#设置窗口显示原始-id) |
| 添加世界行为后，每帧都抛出异常报错 | [跳转](#添加世界行为后-每帧都抛出异常报错) |
| 自然灾害在尝试写入世界日志时发生崩溃 | [跳转](#自然灾害在尝试写入世界日志时发生崩溃) |
| 未定义 action 的自然灾害在被抽中时发生崩溃 | [跳转](#未定义-action-的自然灾害在被抽中时发生崩溃) |
| 领袖在扫描并评估自制阴谋时触发崩溃 | [跳转](#领袖在扫描并评估自制阴谋时触发崩溃) |
| 自制决策、阴谋、基因或武器已成功注册，但在游戏里从未被触发或制造 | [跳转](#自制决策-阴谋-基因或武器已成功注册-但在游戏里从未被触发或制造) |

**你那边能编译，别人那边不行**

| 症状 | |
| --- | --- |
| `CS0122: inaccessible due to its protection level` | [跳转](#cs0122-inaccessible-due-to-its-protection-level) |
| 在你机器上能用，在别人机器上没反应 | [跳转](#在你机器上能用-在别人机器上没反应) |

**能用，后来坏了**

| 症状 | |
| --- | --- |
| 别的 mod 悄悄替换了你的内容 | [跳转](#别的-mod-悄悄替换了你的内容) |
| mod 加载时在 `World.world` 上崩溃 | [跳转](#mod-加载时在-world-world-上崩溃) |
| 你的数据开始控制错误的生物 | [跳转](#你的数据开始控制错误的生物) |
| 存档读档后一切都没了 | [跳转](#存档读档后一切都没了) |
| 单位成群地卡住 | [跳转](#单位成群地卡住) |
| 你的 Harmony 补丁有一半从没生效 | [跳转](#你的-harmony-补丁有一半从没生效) |
| 你的 `updateStats` 补丁在别人那里崩溃 | [跳转](#你的-updatestats-补丁在别人那里崩溃) |
| 你补丁了 `getHit`，建筑还是会掉血 | [跳转](#你补丁了-gethit-建筑还是会掉血) |
| 你的 Prefix 弄坏了另外三个 mod | [跳转](#你的-prefix-弄坏了另外三个-mod) |
| 一个单位永远站着不动，或者每帧都崩溃 | [跳转](#一个单位永远站着不动-或者每帧都崩溃) |
| 你接管的 AI 悄悄恢复原样 | [跳转](#你接管的-ai-悄悄恢复原样) |
| 游戏每秒卡四下 | [跳转](#游戏每秒卡四下) |
| 点击穿过你的窗口落到了地图上 | [跳转](#点击穿过你的窗口落到了地图上) |
| 每开一次面板内存就涨一截 | [跳转](#每开一次面板内存就涨一截) |
| 新的默认值到不了老玩家那里 | [跳转](#新的默认值到不了老玩家那里) |
| 设置滑块能动，你的回调却从不执行 | [跳转](#设置滑块能动-你的回调却从不执行) |

---

## 什么都没加载

### 菜单里没有 Mods 按钮

- **你看到**：游戏正常启动，没有报错，没有 Mods 按钮，日志里也没有任何 `[NML]` 行。
- **原因**：有两个叫 "Mods" 的文件夹。加载器的 DLL 放在游戏数据文件夹里；`worldbox\Mods/` 是放*你的* mod 的。
- **解决**：把 `NeoModLoader.dll` 放进 `worldbox\worldbox_Data\StreamingAssets\mods/`，重启，然后在日志里找 `[NML]: NeoModLoader Version:`。

### Mods 窗口是空的，以前明明能用

- **你看到**：窗口能打开，里面什么都没有。没有报错。
- **原因**：**实验模式关了**，而且每次 WorldBox 更新后游戏都会自己把它关掉。
- **解决**：设置 → 实验模式 → 打开 → 重启。每当"昨天还好好的，我什么都没改"，先查这个。

### mod 文件夹在，列表里却没有

- **你看到**：列表里没有，也没有 `Compile Mod <你的 mod>` 这一行。
- **原因**：按常见程度排：文件其实叫 `mod.json.txt`；JSON 写坏了（最后一项后面多了逗号，或者从聊天软件粘来了弯引号 `"`）；文件夹不在 `worldbox\Mods/` 里面。
- **解决**：资源管理器 → **查看 → 显示 → 文件扩展名**，确认真实文件名。用 VS Code 打开 `mod.json`，它会帮你把 JSON 错误划出来。

### mod 是灰色的

- **你看到**：列表里是灰的，你的代码一行都不跑。
- **原因**：它被禁用了，而这个状态记在磁盘上的 `StreamingAssets\mods\NML\mod_compile_records.json` 里。
- **解决**：在 Mods 窗口里点一下 mod 图标，然后重启。

### "Compile failed"，报错看不懂

- **你看到**：`Code\Main.cs(9,42): error CS1002: ; expected`，后面跟一行总结。
- **原因**：总结那行不是错误。它上面那行才是，里面写着文件、行号和列号。
- **解决**：只改**第一个**错误，重启再看：错误会一个连一个。

| 代码 | 意思 |
| --- | --- |
| `CS1002` | 少了 `;` |
| `CS0246` | 一个它不认识的名字，通常是少了 `using` |
| `CS0266` | 该放整数的地方放了小数（`0.5f` 放进 `int`） |
| `CS0122` | 成员是 `internal`，见[这一条](#cs0122-inaccessible-due-to-its-protection-level) |

### 刚粘贴的文件第 1 行报错

- **你看到**：第 1 行有个看起来毫无道理的编译错误。
- **原因**：这里的代码块都标着文件路径。选的时候往上多选了一点，标签就跑进你的 `.cs` 里了。
- **解决**：删掉第 1 行。`.cs` 以 `using`、`namespace` 或类开头；`mod.json` 以 `{` 开头。

### 改了代码，什么都没变

- **你看到**：还是老样子，没有报错。
- **原因**：NML 只在**启动时编译一次** `Code\*.cs`。正在运行的游戏不会重新读你的文件。
- **解决**：保存，彻底退出游戏，再打开。一次重启只改一处，坏了就只有一个嫌疑。

### 你的修改怎么重启都不生效

- **你看到**：重启了，日志里有 `Compile Mod`，游戏跑的还是旧代码。编译只花了零点几秒。
- **原因**：`Mods/` 里有两个文件夹的 `mod.json` 用了同一个 `GUID`，通常是 NML 安装器解压出来的旧副本 `COM_YOURNAME_HELLOBOX/`。NML **一个 GUID 只加载一个 mod**，另一个文件夹被悄悄忽略，而那很可能正是你在改的那个。
- **解决**：在 `Mods/` 里搜你的 GUID，只留一个文件夹。数字对不上时，第一个查这个。

### 记事本存不进游戏文件夹

- **你看到**："你没有权限在此位置保存"，然后让你存到"文档"。
- **原因**：游戏在 `C:\Program Files (x86)/` 下，Windows 保护这个位置。
- **解决**：先在资源管理器里建好文件（右键 → 新建 → 文本文档，改名），再编辑这个已经存在的文件。

---

## 加载了，但什么都没出现

### 在设置属性的那一行崩溃

- **你看到**：你的 `Initialize()` 里出现 `NullReferenceException`，它后面的代码全都没跑。
- **原因**：新建的资源**没有属性块**。库是在 `add()` 里面才创建它的。
- **解决**：先 `add()`，后设属性。特质、状态、物品、建筑、角色都是这条规矩。

```csharp
ActorTrait swift = new ActorTrait { id = SWIFT, group_id = "physique" };
AssetManager.traits.add(swift);      // this is what allocates base_stats
swift.base_stats["speed"] = 20f;     // safe from here
```

`clone()` 会替你调用 `add()`，所以克隆之后属性块已经在了。

### 同样的崩溃，顺序明明是对的

- **你看到**：同样的 `NullReferenceException`，出在 `add()` 之后的一行属性上。
- **原因**：你编了一个属性名。未知的属性 id 会直接崩溃，而不是"什么都不做"。
- **解决**：用真实的 id：`damage`、`health`、`speed`、`armor`、`attack_speed`、`stamina`、`mana`、`range`、`critical_chance`、`lifespan`、`warfare`。倍率是单独的：`multiplier_damage`、`multiplier_health`、`multiplier_speed`。完整列表见 **[属性参考](#/nml/stats)**。

### 你的建筑一出现就死，或者没有大小

- **你看到**：建筑出现了又消失，或者没法被选中。没有报错。
- **原因**：建筑默认的 `health` 和 `size` 只在 `add()` 里设置，而且只在 `base_stats` 还是 null 的时候。你自己先建了属性块，就会得到 `health = 0`。
- **解决**：永远不要预先创建 `base_stats`。先克隆或 `add()`，然后只改需要不同的部分。

### 注册了，但哪个标签页里都没有

- **你看到**：你的日志行打印出来了，没有异常，东西却不在任何分类里。
- **原因**：`group_id` 指向一个不存在的组，所以没有标签页能画它。
- **解决**：用真实的组 id。角色特质：`cognitive`、`mind`、`spirit`、`physique`、`health`、`body`、`appearance`、`protection`、`skills`、`merits`、`acquired`、`fun`、`fate`、`miscellaneous`、`special`。自己的标签页：**[特质分组与标签页](#/nml/trait-groups)**。

### 显示的是 `trait_hello_swift` 而不是名字

- **你看到**：屏幕上是原始键名，提示为空，日志里有 `missing text:`。
- **原因**：没有注册翻译。游戏自己拼出键名：`trait_<id>` 和 `trait_<id>_info`。
- **解决**：把这两个键加进 `Locales/en.json`。小心 `en.json.txt`。

### 名字对特质有效，对物品、状态、神力无效

- **你看到**：你照抄了特质的写法，这个还是显示原始键名。
- **原因**：有四种资源**不**从 id 拼键名：

| 资源 | 名称键 | 描述键 |
| --- | --- | --- |
| `GodPower` | `name` **字段**，snake_case | `<name>_description` |
| `ItemAsset` | `translation_key`，否则 `item_<subtype 或 id>` | `<id>_description`，不带 `item_` |
| `StatusAsset` | `locale_id` **字段** | `locale_description` **字段** |
| `WorldLawAsset` | `<id>_title` | `<id>_description` |

- **解决**：神力把 `name` 设成 id，物品设 `translation_key`，状态设 `locale_id`。键名一律小写 snake_case：存的时候会被规范化，查的时候**不会**，所以 `MyKey` 存成了 `my_key`，之后再也找不到 :PESgn_SMH:。

### 图标是个空洞

- **你看到**：该有图标的地方是个空方块。没有报错。
- **原因**：自动填图标的步骤在你的 mod 存在之前就跑完了，所以没人给你填。而路径写错会返回 `null`，**这个结果会缓存一整局**，不重启就改路径也没用。
- **解决**：永远自己设置 `path_icon`，不带扩展名，用正斜杠，然后重启。加载时检查一下：

```csharp
if (SpriteTextureLoader.getSprite(swift.path_icon) == null)
    LogError("icon path is wrong: " + swift.path_icon);
```

### 按钮占着位置却什么都不画

- **你看到**：标签页里有个永远不会有人点的空位。
- **原因**：`null` 精灵图不是占位图，而是什么都没有 :PES4_Invisible:。
- **解决**：永远不要不检查就传精灵图：退回到 `ui/Icons/iconQuestionMark`，一眼就知道"路径错了"。辅助函数在 **[神力标签页与按钮](#/nml/power-buttons)**。

### 状态效果不在单位身上画精灵图

- **你看到**：要么生物身上什么都没画，要么只要状态还在，`Status.updateAnimationFrame()` **每一帧**都抛 `NullReferenceException`。
- **原因**：`StatusLibrary` 在游戏加载时一次性地从 `"effects/" + texture` 填好 `sprite_list` 并设置 `need_visual_render`，那时你的 mod 还不存在。而且 `texture` 指的是一个帧的**文件夹**，不是一张 PNG。
- **解决**：帧放在 `GameResources/effects/fx_hello_status/`，然后在 `add()` 之后：

```csharp
cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
cursed.need_visual_render = true;
```

### 按钮叠在一起

- **你看到**：标签页看起来是空的，或者一个按钮压在一堆上面。
- **原因**：`recalc()` 只重算宽度；把按钮排开是第二个调用，而且它会跳过未激活的子对象。
- **解决**：加完所有按钮后按顺序调用两个：先 `tab.recalc();`，再 `tab.sortButtons();`。只是不要在 `OnModLoad` 里：在那里 `recalc()` 会崩，见 **[你的神力标签页始终不出现](#你的神力标签页始终不出现)**。

### 按钮在，点了却什么都没激活

- **你看到**：光标不变，点地图没反应。
- **原因**：按钮是**在创建时按 id**绑定到神力的。
- **解决**：先注册神力，再创建按钮，放在同一个辅助函数里，顺序就不会乱。另外 `click_action` 是 `(WorldTile, string)`；`(WorldTile, GodPower)` 那种形状属于 `click_power_action`。

### `addOpposite` / `addDecision` / `addSpell` 不起作用

- **你看到**：对立特质从不被移除，决策从不触发。一片安静。
- **原因**：这些调用只是追加一个 **id**。把 id 变成真正的对象只在启动时做一次，那时你的 mod 还没加载。
- **解决**：在 `add()` 之后自己填好解析后的字段：`linkCombatActions()`、`linkSpells()`，并直接给 `opposite_traits` 赋值。如果设了 `opposite_trait_mod` 却让 `opposite_traits` 保持 null，游戏之后会在社交代码里崩溃；一个空的 `HashSet` 就能避免。

---

## 注册成功，然后在世界里坏掉

这一节的每一条原因都一样。游戏在**加载时一次性地**为每个资源准备好某一部分，而你的 mod 是在那之后才注册资源的。没有任何提示：资源存在，有名字，游戏第一次真正用到它时就抛异常。解决办法也总是一个样子：注册完资源后，立刻自己把那一步补上 :wbfacepalm:。

### 你的生物报阴影错误

- **你看到**：`ActorAssetLibrary: Shadow size is too small : (0.00, 0.00)`，每个生物三次，游戏里还会弹出错误。
- **原因**：库在启动时测量每个角色的阴影精灵图。之后才加的生物从没被测量过。
- **解决**：克隆之后 `asset.texture_asset.loadShadow();`。见 **[自定义角色](#/nml/custom-actors)**。

### 你的特质、物品或生物一直是锁着的

- **你看到**：它存在，但知识之书里显示为灰色，玩家要等它在某个世界里出现后才能用。
- **原因**：凡是能解锁的东西，`needs_to_be_explored` 默认都是 `true`：角色、七种特质、物品、物品词条和世界法则。
- **解决**：创建时设 `needs_to_be_explored = false`。见 **[自定义特质](#/nml/custom-traits)**。

### 加载你的武器或食物时游戏崩溃

- **你看到**：`ItemLibrary.loadSprites()` 或 `ResourceLibrary.loadSprites()` 里出现 `ArgumentNullException: Value cannot be null. Parameter name: key`。
- **原因**：武器的 `path_gameplay_sprite`、资源的 `full_sprite_path`，都是在游戏自己加载时于 `post_init()` 里推导出来的。你的一直是 `null`。
- **解决**：自己设置。见 **[自定义物品](#/nml/custom-items)** 和 **[资源与食物](#/nml/resources)**。

### 云一出现就崩溃

- **你看到**：你的云第一次出现时，`Cloud.prepare()` 里抛 `NullReferenceException`。
- **原因**：`CloudLibrary` 在启动时一次性地把 `path_sprites` 变成 `cached_sprites`，把 `color_hex` 变成 `color`。
- **解决**：在 `add()` 之后两件都自己做。见 **[云与天气](#/nml/clouds)**。

### 放置你的建筑时报 Index was out of range

- **你看到**：放下一座时，`Building.setAnimData()` 里抛 `ArgumentOutOfRangeException: Index was out of range`。
- **原因**：所有建筑的帧都在启动时预加载。你的帧列表是空的，或者它的文件夹里没有 `main_0.png`。
- **解决**：设好 `sprite_path` 后调用 `shrine.loadBuildingSprites();`，帧的名字用 `main_0`、`construction_0`、`ruin_0`、`mini_0`。见 **[自定义建筑](#/nml/custom-buildings)**。

### 你的建筑只要在屏幕上就每帧报错

- **你看到**：`DynamicSprites.getRecoloredBuilding()` 里成百上千的 `NullReferenceException`，只要它在屏幕上就每帧一次。
- **原因**：按主人颜色给建筑上色的图集 `atlas_asset`，是在启动时于 `checkAtlasLink()` 里链接的。克隆不会保留它。
- **解决**：`shrine.atlas_asset = AssetManager.dynamic_sprites_library.get(shrine.atlas_id);`

### 你的建筑一出现，小地图就报错

- **你看到**：每次小地图重绘，`Building.getColorForMinimap()` 里都抛 `NullReferenceException`。
- **原因**：小地图上的点来自建筑文件夹里的 `mini_0.png`，而你没有。
- **解决**：加一个 `mini_0.png`，建筑占几个地块就是几个像素：从 `temple_human` 克隆来的就是 5x4。

### 你的地块画得上去，然后地图渲染器报错

- **你看到**：屏幕上你的每个地块，都会让 `WorldTilemap.getVariation()` 抛 `NullReferenceException`。
- **原因**：`TopTileLibrary` 在启动时把 `tiles/<id>/` 里的 PNG 加载进 `sprites`。
- **解决**：用 `addVariation()` 自己加载。见 **[地块与地形](#/nml/tiles)**。

### 在你的地块上生成动物会崩溃

- **你看到**：`Subspecies.generateName()` 里抛 `NullReferenceException`，只在你的地块上，只对动物。
- **原因**：克隆草地块会保留 `is_biome = true`，但不会保留 `biome_asset`，后者是在启动时于 `linkAssets()` 里链接的。动物会把群系加进物种名里。
- **解决**：`moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);`

### 掉落物隐形落下，或者弹射物报错

- **你看到**：你的掉落物落下时什么都没画，或者 `QuantumSpriteLibrary.drawProjectiles()` 里抛 `ArgumentOutOfRangeException`。
- **原因**：掉落物、弹射物、状态、建筑和手持资源都用 `getSpriteList()` 读图，它返回的是文件夹*里面*的帧。单独一张 PNG 返回的是空列表。
- **解决**：每个动画一个文件夹，哪怕只有一帧：`drops/hello_ember/hello_ember_0.png`。见 **[精灵图与资源](#/nml/sprites-and-resources)**。

### 日志被弹射物的 ArgumentNullException 刷屏

- **你看到**：弹射物在空中时，`ProjectileManager.updateProjectiles()` 里成千上万的 `ArgumentNullException: Value cannot be null`。
- **原因**：没有发射者的弹射物没有王国，而管理器每帧都拿王国当字典的键。
- **解决**：给它一个：`pForcedKingdom: World.world.kingdoms_wild.get("nature")`，游戏自己的中立主人。

### 你的神力标签页始终不出现

- **你看到**：`PowersTab.setNewWidth()` 里抛 `NullReferenceException`，标签页没有，你的神力也都没有。
- **原因**：`recalc()` 是在 `OnModLoad` 里调用的。标签页自己的 `Start()` 还没运行，它的父对象还是 `null`，异常把整个阶段都干掉了。
- **解决**：加载时创建标签页，在 `Update()` 里排布它。见 **[神力标签页与按钮](#/nml/power-buttons)**。

### 设置窗口显示原始 id

- **你看到**：日志里有 `LocalizedTextManager: missing text: strike_radius Description`。
- **原因**：NML 会给每一行设置要两个键：`<id>` 用作标签，`<id> Description`（带空格、大写 D）用作提示文字。
- **解决**：两个都加进 `Locales/en.json`。见 **[Mod 设置](#/nml/mod-config)**。

### 添加世界行为后，每帧都抛出异常报错

- **表现**: 从模组载入的瞬间起，每帧都在 `MapBox.updateWorldBehaviours()` 中抛出 `NullReferenceException`。
- **原因**: 游戏世界会为每个世界行为维护一个计时器，由地图初次载入时生成（早于模组运行）。你的新行为没有关联计时器，而世界循环依然在无脑调用它。
- **修复**: 在 `add()` 之后紧接着执行 `behaviour.manager = new WorldBehaviour(behaviour);`。参见 **[世界时代与世界行为](#/nml/world-ages)**。

### 自然灾害在尝试写入世界日志时发生崩溃

- **表现**: 在 `WorldLog.logDisaster()` 调用的 `WorldLogMessage` 构造函数中抛出 `NullReferenceException`。
- **原因**: `world_log` 字段需要填入 `WorldLogAsset` 的 ID，而非直接填本地化文本键。未注册的 ID 会返回 `null`，导致日志消息构建崩溃。
- **修复**: 克隆 `$basic_disaster$` 模板作为该 ID 的日志资产，并为其指定 `locale_id`。参见 **[自然灾害](#/nml/disasters)**。

### 未定义 action 的自然灾害在被抽中时发生崩溃

- **表现**: 当灾害轮盘恰好摇中你的灾害时，在 `WorldBehaviourActions.updateDisasters()` 中抛出 `NullReferenceException`。
- **原因**: 灾害抽取系统在没有判空的情况下直接调用了 `action`。单纯配置 `spawn_asset_unit` 不会触发任何生成。
- **修复**: 将 `action` 赋值为原版生成器 `AssetManager.disasters.simpleUnitAssetSpawnUsingIslands`，或编写自定义逻辑。

### 领袖在扫描并评估自制阴谋时触发崩溃

- **表现**: 在 `PlotAsset.checkIsPossible()` 中抛出 `NullReferenceException`。
- **原因**: 每当领袖评估是否要发起该阴谋时，`check_is_possible` 都会在未做判空的情况下被直接调用。
- **修复**: 必须为其赋值。若无前置条件请直接返回 `true`。参见 **[阴谋与策划分录](#/nml/plots)**。

### 自制决策、阴谋、基因或武器已成功注册，但在游戏里从未被触发或制造

- **表现**: 没有任何报错。资产安然躺在库中，但游戏世界完全对它视若无睹。
- **原因**: 游戏在做随机抽取时读取的是启动期构建好的特定列表：`basic_plots`、AI 决策列表、基因突变池、武器生成池、时代轮盘格子池等。你的资产是在模组载入后追加的，不在这些预置列表内。
- **修复**: 手动将其添加到游戏实际读取的专用列表中。各功能对应的注册列表在指南各页均有详细说明：**[自定义 AI 与决策行为](#/nml/custom-ai)**、**[阴谋与策划分录](#/nml/plots)**、**[亚种特质与基因系统](#/nml/subspecies-traits)**、**[自定义物品装备](#/nml/custom-items)**、**[世界时代与世界行为](#/nml/world-ages)**。

---
## 你那边能编译，别人那边不行

### `CS0122: inaccessible due to its protection level`

- **你看到**：从一个能用的 mod 里复制来的代码编译不过：`addStatusEffect`、`getHit`、`_localized_text`、`addBuilding`。
- **原因**：这些是 `internal`。NML 用它自己的一份 **publicized** 副本（`StreamingAssets/Mods/NML/Assembly-CSharp-Publicized.dll`）来编译你的 `Code/*.cs`，所以在普通的源码 mod 里它们直接能用。只有当你在 Visual Studio 里对着原版 `Assembly-CSharp.dll` 编译自己的 `.dll` 时，才会出这个错，因为原版把它们藏起来了。
- **解决**：在你的项目里引用那份 publicized 副本，或者走公开的路：

| 不要用 | 改用 |
| --- | --- |
| `actor.addStatusEffect("x", 20f)` | `World.world.statuses.newStatus(actor, AssetManager.status.get("x"), 20f)` |
| `actor.getHit(5f, ...)` | `actor.changeHealth(-5)` |
| `LocalizedTextManager.instance._localized_text[k] = v` | `LM.Add("en", k, v)`，然后 `LM.ApplyLocale(false)` |

### 在你机器上能用，在别人机器上没反应

- **你看到**：有人反馈 mod 加载了但没有内容，或者第一行就报错。
- **原因**：几乎总是四者之一：写死了带你用户名的路径；打包的是 mod 的*内容*而不是*文件夹*；`GUID` 在版本之间改过；`Code/` 旁边还带着一个旧的 `.dll`。
- **解决**：路径从 `GetDeclaration().FolderPath` 推出来。打包整个文件夹。`GUID` 设一次，永远别改。发 `Code/` **或者** `.dll`，不要两个都发。

---

## 能用，后来坏了

### 别的 mod 悄悄替换了你的内容

- **你看到**：某个 mod 一开，你的特质就没了。日志里有一行早就滚过去了：`duplicate asset - overwriting...`
- **原因**：每个库只有一个平坦的 id 空间，原版和所有 mod 共用。最后注册的赢，而加载顺序不由你决定。
- **解决**：每个 id 都加前缀：`hello_swift`，永远不要 `swift`。用 `if (AssetManager.traits.has(SWIFT)) return;` 把关。要*修改*原版内容，就用 `get()` 拿到后原地改，而不是再加一个替代品。

### mod 加载时在 `World.world` 上崩溃

- **你看到**：崩在你第一行碰地图的代码上。
- **原因**：`OnModLoad` 运行时还没有任何世界。资源库准备好了，世界还没有。
- **解决**：在 `OnModLoad` 里注册，碰世界的事放到 `Update()` 里，前面加 `if (!Config.game_loaded) return;`，再对 `World.world`、`World.world.units` 和 `MapBox.instance` 做 null 检查。

### 你的数据开始控制错误的生物

- **你看到**：读档或新建世界之后，不相干的单位像被附身了一样。
- **原因**：单位 id 是**按世界**的，会从头重新分配。保存 `Actor` 对象更糟：死掉的角色会进对象池再被复用，所以你的引用永远不是 null，只是现在已经是别人了。
- **解决**：察觉到世界变了就全部丢掉。世界时间倒着走是最便宜的信号：

```csharp
double now = World.world.getCurWorldTime();
if (_lastWorldTime >= 0.0 && now < _lastWorldTime - 1.0) MyRegister.Clear();
_lastWorldTime = now;
```

### 存档读档后一切都没了

- **你看到**：你的单位回到了原版行为，但身上还带着你的特质。
- **原因**：只有游戏自己的数据类会被序列化；你的静态字典不会。特质按 id 保存，而读档时**不在库里的 id 会被悄悄丢弃**：禁用、读档、再启用，所有单位身上的特质就都没了。
- **解决**：让特质成为那个能活下来的标记，再从它恢复：`trait.action_on_augmentation_load = (pActor, pTrait) => MyRegister.Restore(pActor);`
- **或者**：将状态直接保存在生物自身身上。其附带的自定义数据存储器会连同存档一同持久化保存：参见 **[保存自定义数据](#/nml/saving-data)**。

### 单位成群地卡住

- **你看到**：成群的单位不动了；是哪一群每帧都在变。每帧一个异常，而不是成千上万个。
- **原因**：逐单位的循环没有 try/catch。第 *i* 个单位上的异常，会让那一帧里它之后的所有单位都被跳过。
- **解决**：把每个补丁、每个自定义行为的 `execute` 的主体都包进 try/catch，出错时返回 `BehResult.Stop`。

### 你的 Harmony 补丁有一半从没生效

- **你看到**：九个补丁里只有两个在工作。一个错误，然后就没了。
- **原因**：`PatchAll` 遇到第一个解析不了的补丁类就停了，剩下的根本不处理。
- **解决**：一个类一个类地打补丁，这样一个失败只损失一个补丁。完整循环见 **[Harmony 补丁](#/nml/harmony-patches)**。

### 你的 `updateStats` 补丁在别人那里崩溃

- **你看到**：在你机器上一小时都没事，在测试者那里报线程异常。
- **原因**：游戏把 `updateStats` 当作**并行**任务运行：你的 Postfix 在工作线程上执行，同时处理很多单位。
- **解决**：在那里只动这个单位自己的数值。其他一切（Unity 调用、共享列表、随机数辅助函数）都排队留给你自己的 `Update()`。

### 你补丁了 `getHit`，建筑还是会掉血

- **你看到**：你的伤害规则对单位有效，对建筑无效，或者触发了两次。
- **原因**：`getHit` 存在三次：基类里一次，`Actor` **和** `Building` 里各有一个 override。Harmony 补丁的是方法体，不是分派槽。
- **解决**：对你关心的每个具体 override 都打补丁，并防止重复计算。

### 你的 Prefix 弄坏了另外三个 mod

- **你看到**："你的 mod 弄坏了 X mod。"日志里什么都没有，X 的作者自己单独又复现不出来。
- **原因**：返回 `false` 会跳过原方法，**以及排在你后面的所有其他 mod 的补丁**。在 `updateStats` 上，这还会让单位身上永远留着过期的缓存标记。
- **解决**：优先用 Postfix 调整（`__result *= 0.5f`），而不是用 Prefix 取消。非取消不可时，取消最窄的那个方法，并且对所有你不关心的情况尽早 `return true`。

### 一个单位永远站着不动，或者每帧都崩溃

- **你看到**：一个单位冻住了，没有任务名；或者每个 tick 都有一条堆栈。
- **原因**：未知的**任务** id 是一个悄无声息的永久"什么都不做"；未知的**工作** id 则是每个 tick 都崩溃。
- **解决**：加载时把你的 id 都断言一遍，先注册任务再注册列出它们的工作，永远不要把没验证过的 id 交给 `next_job_delegate`。

### 你接管的 AI 悄悄恢复原样

- **你看到**：过一阵子，一些单位回到了原版 AI，而你的登记表里还列着它们。
- **原因**：角色是对象池里的：一个"新"单位其实是刚被重置了工作委托的回收对象。战斗也会重置它。
- **解决**：按你自己的时钟反复确认，而不是只设一次：`if (pActor.ai.next_job_delegate != MyAI.NextJob) pActor.ai.next_job_delegate = MyAI.NextJob;`

### 游戏每秒卡四下

- **你看到**：平均帧率看着不错，游戏却有节奏地卡顿，找不到单独的热点函数。
- **原因**：所有东西都在同一个 tick 思考，而单位只有当前动作结束才会前进，所以它们一起结束。
- **解决**：用你自己的计时器思考，不要在 `execute` 里。把人口切片，每次处理一片。列表预先分配；这条路径上不要有 LINQ、lambda 和 `Debug.Log`。

### 点击穿过你的窗口落到了地图上

- **你看到**：玩家点你面板上的控件，下面却生成了一个单位。
- **原因**：没有 `GraphicRaycaster` 的 canvas 会被画出来，但不参与点击检测。而 `unselect_when_window` 只认识游戏自己的窗口，所以手搭的面板永远不会解除当前神力。
- **解决**：`Canvas` + `overrideSorting` + `sortingOrder` + `GraphicRaycaster` + 一张背景 `Image`，一起用。标签上设 `raycastTarget = false`。窗口打开时自己解除神力。

### 每开一次面板内存就涨一截

- **你看到**：内存随着打开面板的次数一级级上涨；长时间游玩越来越差。
- **原因**：`Destroy(root)` 会释放 GameObject 树，但**你**创建的 `Texture2D` 或 `Sprite` 是单独的对象，没人回收。
- **解决**：销毁你创建的东西，并把引用置空。**不要**销毁来自 `SpriteTextureLoader` 的精灵图：那些是共享的。

### 新的默认值到不了老玩家那里

- **你看到**：你改了 `default_config.json` 里的默认值，老玩家还是旧值。新安装的没问题。
- **原因**：那个文件只是模板。真正生效的值在 `mods_config\<UID>.config` 里，而它存的是**整个条目**，所以改过的范围和改了名的回调也都被盖住了。
- **解决**：删掉那个文件再测试。当范围或回调必须对老玩家改变时，加一个新的 `Id`，而不是改旧的。

### 设置滑块能动，你的回调却从不执行

- **你看到**：那一行能用，值也保存了，你的方法从没被调用。
- **原因**：回调写法是 `Namespace.Type:MethodName`，方法必须是 **static**，参数类型必须对应（`INT_SLIDER` → `int`，`SLIDER` → `float`，`SWITCH` → `bool`，`TEXT` → `string`）。
- **解决**：写上命名空间，改成 static，类型对上。修改在窗口**关闭**时才生效，拖动时不生效。

---

## 还是卡住了？

发到 **[反馈与需求](#/feedback)**，写三行（你做了什么、期望什么、实际发生了什么），再附上那行日志。新的坑会补到这一页 :aPES4_Noted:。
