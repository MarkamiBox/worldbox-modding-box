---
title: Плитки и ландшафт
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbrockies:
order: 170
---

# Плитки и ландшафт :wbrockies:

Карта представляет собой сетку из `WorldTile`, и каждая клетка (tile) содержит **два** слоя плиток, наложенных друг на друга:

| Слой | Поле на клетке | Библиотека (library) | Класс | Примеры |
| --- | --- | --- | --- | --- |
| Земля | `main_type` | `AssetManager.tiles` | `TileType` | почва, песок, скалы, глубокий океан, лава |
| Поверхность | `top_type` | `AssetManager.top_tiles` | `TopTileType` | `grass_low`, `grass_high`, `road`, `field`, `frozen_low`, стены |

Под капотом оба типа наследуются от одного базового класса (`TileTypeBase`), поэтому всё описанное на этой странице применимо к обоим. Разница лишь в том, на каком слое они лежат, что определяется полем `layer_type`.

Если вам нужен новый тип *грунта*, это `TileType`. Если вы хотите создать то, что лежит **поверх** грунта (дорога, стена, посевы, мох), это `TopTileType` — и почти всегда моддерам нужно именно это.

## Клонируйте, а не собирайте с нуля

Тип плитки содержит около сотни полей, большинство из которых имеет значение лишь для одной конкретной ванильной плитки. Перечислять все сто я не собираюсь. Клонируйте наиболее близкого сородича:

```csharp Mods/HelloBox/Code/HelloTiles.cs
using UnityEngine;

namespace HelloBox
{
    public static class HelloTiles
    {
        public const string MOSS = "hello_moss";

        public static void Initialize()
        {
            if (AssetManager.top_tiles.has(MOSS)) return;

            // clone(newId, sourceId) copies every field AND registers the copy.
            TopTileType moss = AssetManager.top_tiles.clone(MOSS, "grass_low");

            moss.color_hex = "#2E6B3F";
            moss.can_be_set_on_fire = true;
            moss.burnable = true;
            moss.burn_rate = 6;
            moss.walk_multiplier = 0.8f;             // slows units down
            moss.can_be_removed_with_sickle = true;
            moss.can_be_removed_with_spade = true;
            moss.strength = 2;

            // grass_low is a biome tile, so the clone says is_biome = true. The library links
            // biome_id to its BiomeAsset during startup, before your mod existed: link yours.
            moss.biome_asset = AssetManager.biome_library.get(moss.biome_id);

            // color and has_biome_tags are [NonSerialized], so clone() skips them, and linkAssets()
            // worked them out at startup. Without this the minimap draws your tile see-through.
            moss.color = Toolbox.makeColor(moss.color_hex);
            moss.has_biome_tags = moss.biome_tags != null && moss.biome_tags.Count > 0;

            // Inherit source tile sprites so rendering never encounters a null TileSprites
            TopTileType source = AssetManager.top_tiles.get("grass_low");
            if (source != null) moss.sprites = source.sprites;

            // The variations in GameResources/tiles/hello_moss/ are loaded at startup too.
            Sprite[] variations = SpriteTextureLoader.getSpriteList("tiles/" + moss.id);
            if (variations != null && variations.Length > 0)
            {
                moss.sprites = new TileSprites();
                foreach (Sprite variation in variations)
                {
                    moss.sprites.addVariation(variation, moss.id);
                }
            }
        }
    }
}
```

> [!WARNING] Тайлу-биому нужен привязанный биом (biome)
> Клон травяного тайла копирует `is_biome = true` и `biome_id`, но сам `BiomeAsset` ищется только в `TopTileLibrary.linkAssets()`, один раз, при загрузке. Пропустите эту строку — и всё работает, пока на вашем тайле не появится животное: к названию вида добавляется суффикс биома, биом `null`, и спавн падает с `NullReferenceException` в `Subspecies.generateName()` :wbfacepalm:.
>
> У картинок та же беда. `TopTileLibrary` превращает PNG из `tiles/<id>/` в `sprites` при старте, так что без последнего блока тайл рисуется, а потом рендер карты кидает исключение в `WorldTilemap.getVariation()` для каждого такого тайла на экране.


## Поля, о которых стоит знать

### К какому типу относится объект

| Поле | Что делает |
| --- | --- |
| `layer_type` | `TileLayerType.Ground` или верхний слой. Определяет принадлежность к библиотеке |
| `ground`, `liquid`, `ocean`, `lava` | Базовые категориальные флаги, по которым ветвится логика всей игры |
| `grass`, `sand`, `rocks`, `mountains`, `summit`, `soil` | Флаги семейств ландшафта |
| `road`, `wall`, `farm_field` | Флаги структур. Городской ИИ считывает именно их |
| `block`, `block_height` | Блокирует ли перемещение и на какую высоту отрисовывается |
| `is_biome`, `can_be_biome`, `biome_id` | Привязывает плитку к биому |
| `biome_tags`, `has_biome_tags` | Какие биомы будут выращивать эту плитку |

### Как она себя ведет

Начните отсюда, если ваша плитка - это идея для геймплея, а не просто новый цвет.

| Поле | Что делает |
| --- | --- |
| `walk_multiplier` | Скорость ходьбы по ней. `1.0` — норма, меньшие значения замедляют |
| `damage_units`, `damage` | Наносит ли ходьба по ней урон и сколько именно |
| `damaged_when_walked` | Изнашивается ли сама плитка от ходьбы существ |
| `step_action`, `step_action_chance` | Ваш код при каждом шаге по плитке |
| `unit_death_action` | Ваш код при гибели существа на ней |
| `can_be_set_on_fire`, `burnable`, `burn_rate` | Поведение (behaviour) при контакте с огнем |
| `can_be_frozen`, `forever_frozen`, `fast_freeze`, `remove_on_freeze` | Поведение при замерзании |
| `remove_on_heat`, `terraform_after_fire` | Что оставляют после себя жар и пламя |
| `explodable`, `explodable_delayed`, `explodable_timed`, `explode_range` | Детонация |
| `strength` | Запас прочности. Моды на стены используют это значение |
| `cost` | Стоимость для поиска пути (Pathfinding) |

### Что с ней может делать игрок

| Поле | Что делает |
| --- | --- |
| `can_be_removed_with_spade` / `_bucket` / `_demolish` / `_pickaxe` / `_axe` / `_sickle` | Какой инструмент счищает плитку |
| `allowed_to_be_finger_copied` | Можно ли скопировать её инструментом "Палец" |
| `can_build_on`, `can_be_farm` | Разрешено ли городу строить или возделывать поля на ней |
| `only_allowed_to_build_with_tag` | Разрешает строительство только с определенным тегом |

### Превращения и переходы

| Поле | Что делает |
| --- | --- |
| `increase_to_id` / `decrease_to_id` | Во что превращается при разрастании или эрозии |
| `freeze_to_id` | Во что превращается при замерзании |
| `fill_to_ocean`, `can_be_filled_with_ocean` | Во что превращается под водой |
| `lava_increase` / `lava_decrease` / `lava_level` | Собственная цепочка фаз лавы |

### Внешний вид

| Поле | Что делает |
| --- | --- |
| `color_hex` | Цвет для миникарты и тонирования |
| `edge_color_hex` | Цвет границы при стыке с другой плиткой |
| `render_z`, `draw_layer_name` | Порядок отрисовки. `setDrawLayer(...)` — вспомогательный метод |
| `force_edge_variation`, `force_edge_variation_frame` | Фиксирует конкретный вариант краевого спрайта |

## Выполнение кода, когда на плитку наступают

```csharp
moss.step_action_chance = 0.05f;   // 5% шагов
moss.step_action = (WorldTile pTile, Actor pActor) =>
{
    if (pActor == null || !pActor.isAlive()) return false;

    pActor.restoreStamina(2);
    return true;
};
```

Здесь действуют те же правила, что и для любого другого действия в этом руководстве: сначала проверяйте на null, возвращайте `false`, если ничего не произошло, и помните, что этот код вызывается для каждого существа на каждой такой плитке.

## Собственная графика

Плитки являются исключением из общего правила: **здесь вообще нет поля для указания пути**. Игра ищет папку, названную в точности по **id** плитки, и загружает все лежащие внутри файлы как случайные вариации.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── tiles/
        └── hello_moss/          <- в точности id вашей плитки
            ├── moss_1.png
            ├── moss_2.png
            └── moss_3.png
```

В коде настраивать ничего не нужно. Назовите папку по зарегистрированному id, и плитка найдет её самостоятельно.

Несколько файлов в папке становятся случайными вариациями, что спасает поле плиток от превращения в однообразные обои. Один файл тоже отлично работает. И плитки грунта, и плитки поверхности загружаются одинаково.

`color_hex` задается отдельно и остается крайне важным: именно этот цвет отображается на миникарте и используется игрой при необходимости тонирования.

## Изменение плиток во время игры

```csharp
WorldTile tile = World.world.GetTile(x, y);
if (tile == null) return;

tile.setTopTileType(AssetManager.top_tiles.get("hello_moss"));   // меняем поверхностный слой
tile.setTileType(AssetManager.tiles.get("sand"));                // меняем грунт
tile.setTileTypes("sand", null);                                 // меняем грунт и очищаем поверхность
```

Все три метода публичны. Изменение плитки помечает чанк как измененный, и рендерер самостоятельно обновляет отображение.

### Проверка того, что находится на клетке

```csharp
if (tile.main_type != null && tile.main_type.ground) { }
if (tile.top_type != null && tile.top_type.road) { }
if (tile.isOnFire()) { }
if (tile.hasBuilding()) { }
```

И `main_type`, и `top_type` могут быть равны `null`. Проверяйте их перед обращением. Это самая распространенная причина падения модов при обходе карты :PES2_F:.

## Опции терраформирования

Класс `TerraformOptions` в `AssetManager.terraform` представляет собой именованный набор правил по расчистке клетки, используемый божественными силами (GodPower) и снарядами (projectile):

| Поле | Что делает |
| --- | --- |
| `remove_top_tile`, `remove_roads`, `remove_borders` | Удаляет структуры |
| `remove_trees_fully`, `remove_burned`, `remove_ruins` | Удаляет остатки |
| `destroy_buildings`, `make_ruins` | Что происходит с постройками |
| `remove_water`, `remove_fire`, `remove_frozen`, `remove_tornado` | Удаляет состояния |
| `add_burned`, `add_heat`, `flash` | Добавляет состояния |

Класс `ProjectileAsset` ссылается на такую опцию в поле `terraform_option` вместе с `terraform_range`: именно так взрывная стрела расчищает землю вокруг точки падения.

## Биомы

Класс `BiomeAsset` в `AssetManager.biome_library` решает, какие плитки где появляются. Плитка включается в биом вызовом `setBiome("biome_forest")` либо наличием подходящих меток в `biome_tags`. Клонирование существующего биома с заменой id плиток — куда более короткий путь, чем сборка с нуля, и правило автоматической регистрации при клонировании здесь также работает.

> [!TIP] Плитки поверхности — главное поле для моддинга
> Практически всё, что моддеры реально создают (стены, дороги, фермы, расползающаяся по континенту порча), представляет собой плитку поверхности с методом `step_action` и логикой размещения. Новые типы грунта требуются куда реже, их сложнее органично вписать в графику, и они могут непредсказуемо конфликтовать с генератором мира :PES3_Yikes:.
