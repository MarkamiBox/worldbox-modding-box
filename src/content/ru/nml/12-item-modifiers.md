---
title: Зачарования оружия
group: Игровой контент
subgroup: Предметы и снаряжение
icon: :wbmagehrm:
order: 122
---

# Зачарования оружия :wbmagehrm:

Вы наверняка видели аккуратные зелёные строчки в описании хороших мечей: *«+3 к урону»*, *«огненный»*. Это **модификаторы предметов**, и они представляют собой самый быстрый способ сделать экипировку интересной, ведь игра сама случайно распределяет их по выпадающему оружию.

## Простой путь: генератор NML

Ванильный класс `ItemAsset` выполняет семь совершенно разных задач одновременно, и смысл его полей кардинально меняется в зависимости от контекста. NML упаковал понятные инструменты в класс `ItemAssetCreator`, а для модификаторов он ещё и берёт на себя всю регистрацию:

```csharp Mods/HelloBox/Code/HelloModifiers.cs
namespace HelloBox
{
    public static class HelloModifiers
    {
        public const string SHARP = "hello_sharp";

        public static void Initialize()
        {
            if (AssetManager.items_modifiers.has(SHARP)) return;

            ItemModAsset sharp = new ItemModAsset
            {
                id = SHARP,
                needs_to_be_explored = false,   // already discovered, no exploring needed
                mod_type = "sharpness",          // same type: only the higher mod_rank shows up
                mod_rank = 2,
                translation_key = "mod_hello_sharp",
                rarity = 3,                      // bigger = rolled more often. Vanilla uses 1 and 3
                pool = ItemModifierLibrary.WEAPON
            };

            AssetManager.items_modifiers.add(sharp);   // add() first
            sharp.base_stats["damage"] = 8f;           // then the stats

            AddToPool(sharp);                          // and this is the part everybody forgets
        }

        /** The game built its pools while it loaded, which was before your mod existed. */
        private static void AddToPool(ItemModAsset pAsset)
        {
            foreach (string pool in new[] { "weapon", "armor", "accessory" })
            {
                if (!pAsset.pool.Contains(pool)) continue;
                if (!AssetManager.items_modifiers.pools.ContainsKey(pool)) continue;

                // vanilla adds each modifier `rarity` times over: that is the whole weighting system
                for (int i = 0; i < pAsset.rarity; i++)
                {
                    AssetManager.items_modifiers.pools[pool].Add(pAsset);
                }
            }
        }
    }
}
```
> [!WARNING] Зарегистрировать — этого мало
> `add()` кладёт ваш модификатор в `list` библиотеки, а генератор читает не `list`, а `pools`. Эти пулы заполняются в `linkAssets()`, один раз, при загрузке. Модификатор, который есть только в `list`, существует, у него есть имя, и он никогда ни на что не выпадет :wbfacepalm:.



Добавьте `HelloModifiers.Initialize();` в метод `OnModLoad` в `Main.cs`, и с этого момента игра сможет наделять выпадающее оружие зачарованием "hello_sharp".

### Ключевые аргументы

| Аргумент | Что делает |
| --- | --- |
| `id` | Уникальное имя |
| `mod_type` | Семейство. Два модификатора одного типа никогда не выпадут вместе: побеждает больший `mod_rank` |
| `mod_rank` | Ступень внутри семейства. Также увеличивает расчётную ценность оружия |
| `translation_key` | Ключ локализации для зелёной строки, которую читает игрок |
| `rarity` | Частота выпадения. Больше — выпадает чаще |
| `base_stats` | Прибавка к характеристикам |
| `quality` | Минимальное качество оружия, на котором может появиться модификатор |
| `equipment_value` | Добавочная ценность предмета для ИИ |

## Добавление реального эффекта

Прибавка к характеристикам — это здорово, но модификатор может выполнять и код. Делегат `action_attack_target` срабатывает при каждом успешном ударе:

```csharp
ItemAssetCreator.CreateAndAddModifier(
    id: "hello_burning",
    mod_type: "elemental",
    mod_rank: 1,
    translation_key: "hello_burning",
    rarity: 1,
    action_attack_target: (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
    {
        if (pTarget == null || pTile == null) return false;
        World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
        return true;
    });
```

Теперь любое оружие, получившее зачарование "hello_burning", при ударе поджигает землю под целью. Десять строк кода — и это работает на абсолютно любом оружии в игре, включая созданное другими модами :wbfireskull:.

## Тексты и локализация

```json Locales/en.json
{
  "hello_sharp": "Sharpened",
  "hello_burning": "Burning"
}
```

Значение `translation_key` отображается в подсказке предмета, поэтому делайте его коротким — оно занимает одну строчку рядом с характеристиками.

> [!TIP] Сначала зачарования, потом оружие
> Новое оружие требует много сил (спрайты, анимации, линейка материалов). Новый модификатор пишется за двадцать строк и автоматически применяется ко **всему** генерируемому в мире оружию. Если хочется быстрого результата — начните отсюда :PES_Stonks:.
