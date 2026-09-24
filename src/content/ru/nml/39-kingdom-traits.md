---
title: Черты королевств
group: Игровой контент
subgroup: Черты и генетика
icon: :wbcrown:
order: 114
---

# Черты королевств :wbcrown:

**Черта (trait) королевства (kingdom)** — это государственная политика. Не верование и не родословная: указ, принятый короной и действующий на все государство.

Ванильная игра использует эту систему исключительно для одного — налоговых ставок. Это делает ее самой компактной и пустой из всех семи систем черт, а потому и самым заманчивым местом для добавления собственных механик. Никто не конкурирует с вами за это пространство :wbsmirk:.

| | |
| --- | --- |
| Библиотека (library) | `AssetManager.kingdoms_traits` |
| Класс | `KingdomTrait` |
| Группы | `AssetManager.kingdoms_traits_groups`, класс `KingdomTraitGroupAsset` |
| Владелец в рантайме | `Kingdom`, в `World.world.kingdoms` |
| Префикс локализации | `kingdom_trait_` |
| Папка иконок по умолчанию | `ui/Icons/kingdom_traits/` |

> [!WARNING] Характеристики (stats) королевства не доходят до юнитов
> Как и в случае с религией (religion), `kingdom.base_stats` никогда не внедряется в `Actor`. Числа масштаба королевства, видимые в игре, берутся из **личных характеристик монарха** (`king.stats["cities"]` и тому подобных), а не из блока черт государства.
>
> Таким образом, черта королевства трансформирует державу через собственные поля и программный код, а не через `base_stats`.

## Налоговые поля

Три поля, уникальные для черт королевства, и все то, что ванильная игра делает с этой системой:

```csharp
KingdomTrait trait = new KingdomTrait
{
    id = "hello_tax_rate_local_brutal",
    group_id = "local_tax",
    is_local_tax_trait = true,
    tax_rate = 0.9f
};
AssetManager.kingdoms_traits.add(trait);
trait.addOpposite("tax_rate_local_low");
```

| Поле | Назначение |
| --- | --- |
| `is_local_tax_trait` | Помечает черту как задающую **местную** налоговую ставку |
| `is_tribute_tax_trait` | Помечает черту как задающую ставку **дани** |
| `tax_rate` | Сама ставка в виде десятичной доли |

Королевство пересчитывает обе ставки с нуля всякий раз, когда меняются его черты: расчет стартует со значения по умолчанию в `SimGlobals`, после чего игра обходит черты королевства и позволяет каждой подходящей **перезаписать** значение.

> [!WARNING] Побеждает последняя: всегда объявляйте противоположности
> Налоговые черты не суммируются. Если у королевства окажутся две черты `is_local_tax_trait`, победит та, которая встретится позже при переборе.
>
> Все ванильные налоговые черты объявляют друг друга противоположностями именно по этой причине. Поступайте так же с обеих сторон, иначе ваша ставка будет срабатывать лишь время от времени :PES5_HmmmmNo:.

## Правильная регистрация черты

```csharp Mods/HelloBox/Code/HelloKingdomTraits.cs
namespace HelloBox
{
    public static class HelloKingdomTraits
    {
        public const string LEVY = "hello_levy";

        public static void Initialize()
        {
            if (AssetManager.kingdoms_traits.has(LEVY)) return;

            KingdomTrait trait = new KingdomTrait
            {
                id = LEVY,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                group_id = "miscellaneous",
                path_icon = "ui/Icons/iconHelloKingdom",
                spawn_random_trait_allowed = false,
                can_be_given = true,
                can_be_removed = true
            };

            AssetManager.kingdoms_traits.add(trait);
        }
    }
}
```

> [!WARNING] `spawn_random_trait_allowed` читается один раз, при запуске
> Новые королевства получают стартовые черты из пула, который `BaseTraitLibrary.linkAssets()` собирает во время загрузки игры, ещё до появления вашего мода. Сам по себе флаг на вашей черте ничего не меняет: вашей черты нет в этом пуле, и случайно она не выпадет никогда. Добавьте её сами, с тем же весом, что и в ванили:
>
> ```csharp
> trait.spawn_random_trait_allowed = true;
> AssetManager.kingdoms_traits._pot_allowed_to_be_given_randomly.AddTimes(trait.spawn_random_rate, trait);
> ```
>
> `_pot_allowed_to_be_given_randomly` помечен как `protected`, поэтому это компилируется против публицированной сборки, с которой NML и так собирает ваш мод. `spawn_random_rate` по умолчанию равен `5`: увеличьте его, и черта будет выпадать чаще.

## Создание политики, которая реально что-то делает

Поскольку `base_stats` исключен, черта королевства оправдывает свое существование двумя путями. Оба требуют больше работы, чем число, и оба того стоят.

**Поведенческое решение (decision)**, аккуратный и лаконичный вариант:

```csharp
trait.addDecision("some_decision_id");
// ids are resolved at startup, before your mod: resolve yours
trait.decisions_assets = new DecisionAsset[] { AssetManager.decisions_library.get("some_decision_id") };
```

**Патч Harmony, проверяющий черту** — то, как строится настоящая правовая система. Пропатчите метод, к которому обращается логика короны, и проверьте там черты королевства:

```csharp
[HarmonyPatch(typeof(City), nameof(City.getArmyMaxMultiplier))]
public static class Patch_City_ArmyMax
{
    public static void Postfix(City __instance, ref float __result)
    {
        if (__instance == null || __instance.kingdom == null) return;
        if (!__instance.kingdom.hasTrait(HelloKingdomTraits.LEVY)) return;

        __result *= 1.35f;
    }
}
```

Это общий шаблон для любой политики королевства, не являющейся налоговой ставкой: черта выступает переключателем, а ваш патч реализует поведение (behaviour). См. **[Патчи Harmony](#/nml/harmony-patches)**.

## Ванильные группы

`tribute` · `local_tax` · `miscellaneous` · `fate`

Всего четыре группы, две из которых приходятся на налоги. Если вы разрабатываете более двух указов, создайте для них собственную вкладку, см. **[Группы черт и вкладки](#/nml/trait-groups)**, с `AssetManager.kingdoms_traits_groups` и `KingdomTraitGroupAsset`.

## Тексты локализации

```json Mods/HelloBox/Locales/en.json
{
  "kingdom_trait_hello_levy": "Levy",
  "kingdom_trait_hello_levy_info": "Everyone who can carry a spear, carries a spear."
}
```

## Раздача черты

```csharp
ActorAsset asset = AssetManager.actor_library.get("human");
if (asset != null) asset.addKingdomTrait(HelloKingdomTraits.LEVY);
```

```csharp
foreach (Kingdom kingdom in World.world.kingdoms)
{
    if (kingdom == null || kingdom.isRekt()) continue;
    if (!kingdom.isCiv()) continue;

    kingdom.addTrait(HelloKingdomTraits.LEVY, pRemoveOpposites: true);
}
```

Ассет королевства, на основе которого была создана фракция — это отдельная сущность, см. **[Королевства и фракции](#/nml/kingdoms)**.

> [!TIP] Пустая комната
> Шесть из семи систем черт переполнены ванильным контентом, с которым приходится считаться. В этой же насчитывается всего пять черт. Если вам нужен мод, выглядящий абсолютно органично и ни с чем не конфликтующий, набор королевских указов — самый легкий путь к цели :PES2_Cash:.
