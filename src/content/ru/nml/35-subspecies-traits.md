---
title: Черты подвидов
group: Игровой контент
subgroup: Черты и генетика
icon: :wbelf:
order: 104
---

# Черты подвидов :wbelf:

**Подвид** — это эволюционное ответвление вида: более долгоживущее, покрытое чешуей, яйцекладущее или светящееся. Он распространяется через **размножение**, а не через обучение или культуру, и это единственная система черт, которая несет в себе собственные спрайты; именно поэтому подвид может выглядеть совершенно иначе, чем его исходный вид, не будучи при этом отдельным актором.

| | |
| --- | --- |
| Библиотека | `AssetManager.subspecies_traits` |
| Класс | `SubspeciesTrait` |
| Группы | `AssetManager.subspecies_trait_groups`, класс `SubspeciesTraitGroupAsset` |
| Владелец в рантайме | `Subspecies`, в `World.world.subspecies` |
| Префикс локализации | `subspecies_trait_` |
| Папка иконок по умолчанию | `ui/Icons/subspecies_traits/` |

> [!WARNING] Подвид **заменяет** характеристики ассета актора
> В `Actor.updateStats()` юнит с подвидом объединяет характеристики из `subspecies.base_stats` и полностью **пропускает** `asset.base_stats`. Это жесткая замена, а не суммирование.
>
> Поэтому любое значение, заданное для `human`, не дойдет ни до одного человека с подвидом — а в мире, просуществовавшем некоторое время, таких будет подавляющее большинство :PES4_IDunnoMan:.

Подвид применяет раздельные блоки характеристик для мужчин и женщин, однако они **не** происходят из черт. Они берутся из его генома в `AssetManager.gene_library`. Черта подвида имеет один общий `base_stats` для всех. Если вам нужно гендерное разделение характеристик через черту, используйте черты клана, см. **[Черты кланов](#/nml/clan-traits)**.

## Регистрация черты

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
                in_mutation_pot_add = true,       // мутация может выдать черту
                in_mutation_pot_remove = false,   // мутация не может ее отнять
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

## Мутация

Именно так черта подвида попадает в мир без необходимости раздавать ее вручную. Библиотека хранит два пула вероятностей, и эти два поля определяют, в какие пулы попадет ваша черта:

| Поле | Назначение |
| --- | --- |
| `in_mutation_pot_add` | Событие мутации может наградить этой чертой |
| `in_mutation_pot_remove` | Событие мутации может отобрать ее |
| `spawn_random_trait_allowed` | Может ли черта вообще выпасть случайно |
| `rarity` | Насколько высок шанс выбора при генерации |

Характеристика `mutation` у юнита определяет вероятность подобных событий. См. **[Справочник характеристик](#/nml/stats)**.

## Графика: то, чего нет ни у одной другой системы черт

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

// Библиотека строит это для своих скинов во внутреннем хелпере.
// Мод делает то же самое вручную:
trait.texture_asset = new ActorTextureSubAsset(trait.sprite_path + "/", pHasAdvancedTextures: true);
trait.texture_asset.prevent_unconscious_rotation = trait.prevent_unconscious_rotation;
trait.texture_asset.render_heads_for_children = trait.render_heads_for_children;
trait.texture_asset.shadow = trait.shadow;
```

| Поле | Назначение |
| --- | --- |
| `is_mutation_skin` | Помечает черту как замену скина, а не просто черту |
| `sprite_path` | Папка с текстурами. Обратите внимание на замыкающий слэш `/` |
| `texture_asset` | Скомпилированный набор текстур. Назначается вручную, как выше |
| `skin_citizen_male` / `_female` / `skin_warrior` | Варианты внешности по ролям, случайно для каждого юнита |
| `animation_walk` / `animation_idle` / `animation_swim` | Переопределяют анимации исходного вида |
| `shadow`, `shadow_texture`, `shadow_texture_egg`, `shadow_texture_baby` | Тени для разных жизненных стадий |
| `render_heads_for_children` | Рисовать ли отдельную голову для детей |
| `prevent_unconscious_rotation` | Сохранять вертикальное положение без сознания (для сфер и капель) |
| `remove_for_zombies` | Снимать ли скин при превращении в зомби |
| `priority` | Приоритет скина, если у юнита их два |

Ванильные мутации внешности (бургер, живой камень, щупальцевый кошмар, сфера света, фрактал) — это клоны `$skin_mutation$`, и клонирование этого шаблона является самым быстрым путем к созданию рабочего скина.

## Фенотипы, рацион и яйца

Три подсистемы, с которыми взаимодействуют черты подвидов:

| Поле | Назначение |
| --- | --- |
| `phenotype_skin`, `id_phenotype` | Связывает черту с фенотипом в `AssetManager.phenotype_library` |
| `is_diet_related` | Помечает как элемент рациона. Сочетается с тегом `diet_*` |
| `id_egg`, `phenotype_egg` | Форма яйца для яйцекладущих подвидов |
| `after_hatch_from_egg_action`, `has_after_hatch_from_egg_action` | Код, срабатывающий при вылуплении из яйца |

## Гены

Ген — это способ, с помощью которого черта подвида мутирует в другую черту. Игра опрашивает `AssetManager.genes` во время размножения, чтобы решить, что передать потомству:

```csharp Mods/HelloBox/Code/HelloGenes.cs
namespace HelloBox
{
    public static class HelloGenes
    {
        public static void Initialize()
        {
            GeneAsset gene = new GeneAsset
            {
                id = "hello_swift_gene",
                id_trait = HelloSubspecies.SWIFT,
                rate = 0.05f
            };
            AssetManager.genes.add(gene);
            AssetManager.genes._gene_assets_mutations.Add(gene);
        }
    }
}
```

Два поля:

- `gene.id_trait` связывает его с зарегистрированной вами чертой подвида.
- `gene.rate` — шанс мутации от 0.0 до 1.0.

Без вызова `_gene_assets_mutations.Add(gene)` ген зарегистрируется, но никогда не попадет в выборку мутаций.

## Мета-теги

Некоторые ванильные черты подвидов содержат только мета-тег, поскольку именно на основе этого тега движок игры делает ветвление:

```csharp
trait.base_stats_meta.addTag("can_build_in_biome_permafrost");   // подвид может основывать поселения там
trait.base_stats.addTag("walk_adaptation_snow");                 // его юниты быстро передвигаются по снегу
```

`base_stats_meta` остается на самом подвиде. `base_stats` переходит юнитам. Полный перечень тегов смотрите в **[Справочнике характеристик](#/nml/stats)**.

## Ванильные группы

`harmony` · `advanced_brain` · `mind` · `body` · `diet` · `rebirth` · `growth` · `bioproducts` · `chaos` · `talents` · `sleep_cycles` · `hibernation` · `reproduction_strategy` · `reproductive_methods` · `gestation` · `eggs` · `mutations` · `adaptations` · `fate` · `phenotypes` · `special`

Собственная вкладка: см. **[Группы черт и вкладки](#/nml/trait-groups)**, с `AssetManager.subspecies_trait_groups` и `SubspeciesTraitGroupAsset`.

## Тексты локализации

```json Mods/HelloBox/Locales/en.json
{
  "subspecies_trait_hello_scales": "Scaled",
  "subspecies_trait_hello_scales_info": "Thick, overlapping, and quietly smug about it."
}
```

## Раздача черты

```csharp
ActorAsset asset = AssetManager.actor_library.get("hello_sprite");
if (asset != null) asset.addSubspeciesTrait(HelloSubspecies.SCALES);
```

Это гарантирует, что каждый новый подвид данного существа появится на свет с этой чертой. Если не указывать это и полагаться на `in_mutation_pot_add`, черта со временем возникнет спонтанно сама по себе — что чаще всего куда интереснее.

> [!TIP] Заклинания прекрасно живут здесь
> Ванильные магические родословные представляют собой черты подвида, наделяющие заклинанием и ничем более: `trait.addSpell("summon_lightning")`. Всего одна строчка, передающаяся потомству — и на ваших глазах разрастается династия повелителей бурь на весь континент :PES5_CrazyPog:.
