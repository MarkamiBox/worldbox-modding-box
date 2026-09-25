---
title: 表型与遗传学
group: 游戏内容
subgroup: 特质与遗传
icon: :wbgoldenbrain:
order: 115
---

# 表型与遗传学 :wbgoldenbrain:

在 WorldBox 的亚种系统中，生物的外观不再局限于单个硬编码贴图。单位会表达出**表型（phenotypes）**：例如肤色、发色、头饰、角与面部特征，这些特征均由亲代遗传并在繁衍世代中发生突变。

本页将解析 `AssetManager.phenotype_library` 的工作原理以及如何注册自定义表型与遗传变体。

## 表型的运行机制

每个生物亚种都拥有专属的表型池：

| 属性 | 控制内容 |
| --- | --- |
| **`id`** | 表型资源的唯一标识符 |
| **`skin_colors`** | 肤色可选的调色板索引列表 |
| **`hair_colors`** | 发色可选的调色板索引列表 |
| **`head_pieces`** | 头饰、兽角、耳朵或面部附加件 |
| **`chance`** | 生成新亚种时的权重概率 |

当生物繁衍时，后代会融合双亲的遗传特征，并有概率通过突变引入新的表型 :PES5_BigBrain:。

## 代码实现

该代码注册了一个包含赤红肤色与定制双角的灰烬表型：

```csharp Mods/HelloBox/Code/HelloPhenotypes.cs
using System;
using System.Collections.Generic;

namespace HelloBox
{
    public static class HelloPhenotypes
    {
        public const string PHENOTYPE_ID = "phenotype_hello_ember";

        public static void Initialize()
        {
            if (AssetManager.phenotype_library.has(PHENOTYPE_ID)) return;

            // 1. Create the phenotype asset
            PhenotypeAsset ember = new PhenotypeAsset
            {
                id = PHENOTYPE_ID,
                localized_key = "phenotype_name_hello_ember",
                chance = 10
            };

            // 2. Set allowed skin tone and hair color ranges
            ember.colors_skin = new List<string> { "#FF4500", "#FF8C00", "#FFA500" };
            ember.colors_hair = new List<string> { "#8B0000", "#B22222", "#FF0000" };

            AssetManager.phenotype_library.add(ember);
        }

        /** Attach this phenotype to a subspecies */
        public static void ApplyToSubspecies(Subspecies pSubspecies)
        {
            if (pSubspecies == null) return;

            if (pSubspecies.data != null && pSubspecies.data.phenotypes != null)
            {
                if (!pSubspecies.data.phenotypes.Contains(PHENOTYPE_ID))
                {
                    pSubspecies.data.phenotypes.Add(PHENOTYPE_ID);
                }
            }
        }
    }
}
```

## 添加自定义角与饰品

头部饰品与角依赖于 `GameResources/actors/species/` 中的贴图切片集：

```csharp
PhenotypeAsset horned = new PhenotypeAsset
{
    id = "phenotype_hello_horns",
    head_pieces = new List<string> { "horns_0", "horns_1", "horns_ember" }
};
AssetManager.phenotype_library.add(horned);
```

切片资源需存放在模组的 `GameResources/` 路径下（详见 **[贴图与资源](#/nml/sprites-and-resources)**）。

## 需要规避的隐患

- **空颜色列表**：若表型的 `colors_skin` 为空，游戏可能会将单位渲染为品红色或纯黑。
- **遗传漂变**：若初始几率过低，稀有表型在历经多代模拟后可能自然绝种。请合理设定 `chance` :PES2_HmmmmNoted:。
- **联动亚种特质**：若想让外观变化伴随真实属性改变，请结合 **[亚种特质](#/nml/subspecies-traits)** 进行配置。
