---
title: Облака и погода
group: Игровой контент
subgroup: Мир и цивилизации
icon: :wbtornado:
order: 172
---

# Облака и погода :wbtornado:

Облако (cloud) — это спрайт, плывущий по карте и сбрасывающий объекты на всё, что оказывается под ним. Дождь, кислота, лава, снег, огонь: все они представляют собой один и тот же ассет с разным цветом и разным `drop_id`.

Облака — самое выгодное вложение сил для моддера во всей игре. Один ассет, никакой собственной графики не требуется — при этом он движется, сбрасывает капли, подсвечивает землю и самостоятельно появляется в списке стихийных бедствий.

## Регистрация облака

```csharp Mods/HelloBox/Code/HelloClouds.cs
using System.Collections.Generic;
using UnityEngine;

namespace HelloBox
{
    public static class HelloClouds
    {
        public const string EMBER = "hello_cloud_ember";

        // Your own art: GameResources/effects/clouds/hello_cloud.png
        private static readonly string[] Sprites = new string[]
        {
            "effects/clouds/hello_cloud"
        };

        public static void Initialize()
        {
            if (AssetManager.clouds.has(EMBER)) return;

            AssetManager.clouds.add(new CloudAsset
            {
                id = EMBER,
                color_hex = "#D14219",
                max_alpha = 0.8f,
                drop_id = "hello_ember",          // a drop id: see Drops & falling things
                cloud_action_1 = CloudLibrary.dropAction,
                interval_action_1 = 0.05f,
                speed_min = 1f,
                speed_max = 3f,
                considered_disaster = true,       // counts as a disaster in the game's own lists
                draw_light_area = true,
                draw_light_size = 4f,
                path_sprites = Sprites
            });

            // CloudLibrary turns path_sprites into sprites and color_hex into a colour during
            // the game's own startup, before your mod existed. Do both for yours.
            CloudAsset cloud = AssetManager.clouds.get(EMBER);
            List<Sprite> loaded = new List<Sprite>();
            foreach (string path in cloud.path_sprites)
            {
                Sprite sprite = SpriteTextureLoader.getSprite(path);
                if (sprite != null) loaded.Add(sprite);
            }
            cloud.cached_sprites = loaded.ToArray();
            cloud.color = Toolbox.makeColor(cloud.color_hex);
        }
    }
}
```

> [!WARNING] У облака, зарегистрированного поздно, нет спрайтов
> `CloudLibrary` собирает `cached_sprites` из `path_sprites` и `color` из `color_hex` за один проход при загрузке. Вашего облака в списке тогда не было, оба поля пустые, и при первом появлении игра кидает `NullReferenceException` в `Cloud.prepare()` :wbfacepalm:. Последние шесть строк `Initialize` делают этот проход для вашего.


### Описание полей

Клонируйте ванильное облако, затем поменяйте `drop_id` и `color_hex`. Многим облакам больше ничего и не нужно.

| Поле | Что делает |
| --- | --- |
| `color_hex` | Оттенок. Определяет практически всю визуальную индивидуальность |
| `max_alpha` | Степень непрозрачности. По умолчанию `0.8` |
| `drop_id` | Сбрасываемый объект. Любой id в `AssetManager.drops`, ванильный или ваш |
| `cloud_action_1` / `cloud_action_2` | Два независимых действия, каждое со своим таймером |
| `interval_action_1` / `interval_action_2` | Интервал в секундах между запусками каждого действия |
| `speed_min` / `speed_max` | Скорость дрейфа. Каждое облако выбирает случайное значение из диапазона |
| `path_sprites` | Список спрайтов. Игра случайным образом выбирает один для каждого облака |
| `considered_disaster` | Считает ли игра облако полноценным бедствием |
| `normal_cloud` | Помечает его как обычную погоду, а не особое событие |
| `draw_light_area`, `draw_light_size`, `draw_light_area_offset_x/y` | Подсветка на земле для огненных и лавовых облаков |

## Что такое действие облака

`CloudAction` принимает активный экземпляр облака и ничего не возвращает:

```csharp
public delegate void CloudAction(Cloud pCloud);
```

`CloudLibrary.dropAction` — это стандартное ванильное действие: оно выбирает случайную клетку (tile) под спрайтом облака и спавнит там один объект `drop_id`. В 90% случаев это единственное, что вам нужно: привяжите его к `cloud_action_1` и на этом всё. Лениво и правильно, моё любимое сочетание :pepeOK:.

Если требуется что-то особенное, напишите свой метод и назначьте его на `cloud_action_2`:

```csharp
private static void SparkAction(Cloud pCloud)
{
    // Выполняется каждые interval_action_2 секунд для каждого такого облака на карте.
    // Держите код легковесным и добавьте проверку шанса, чтобы он не стрелял беспрерывно.
    if (!Randy.randomChance(0.02f)) return;

    int x = (int)pCloud.transform.localPosition.x;
    int y = (int)pCloud.transform.localPosition.y;

    WorldTile tile = World.world.GetTile(x, y);
    if (tile == null) return;

    MapBox.spawnLightningSmall(tile, 0.15f);
}
```

Затем пропишите `cloud_action_2 = SparkAction; interval_action_2 = 0.1f;`.

## Собственные спрайты

`path_sprites` — это список, и каждый элемент загружается ровно по указанному пути из папки `GameResources/`. Игра выбирает одну текстуру на облако, именно поэтому в ванили передаются три варианта.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/clouds/
        ├── cloud_hello_1.png
        ├── cloud_hello_2.png
        └── cloud_hello_3.png
```

```csharp
path_sprites = new string[]
{
    "effects/clouds/cloud_hello_1",
    "effects/clouds/cloud_hello_2",
    "effects/clouds/cloud_hello_3"
}
```

Спрайт облака представляет собой большое мягкое пятно в оттенках серого. Всю цветовую работу выполняет `color_hex`, поэтому не красьте текстуру вручную — оставьте её белой и доверьте тонирование игре :wbsmirk:.

## Создание облака в небе

Облака появляются через систему эффектов, а не через специальный менеджер облаков:

```csharp
EffectsLibrary.spawn("fx_cloud", tile, HelloClouds.EMBER);
```

Именно это делает каждая ванильная сила облаков. Оберните вызов в божественную силу (GodPower), и у игрока появится инструмент призыва:

```csharp
GodPower power = new GodPower
{
    id = "hello_cloud_power",
    name = "hello_cloud_power",
    rank = PowerRank.Rank0_free,
    path_icon = "ui/Icons/iconFire",
    click_action = (WorldTile pTile, string pPowerID) =>
    {
        if (pTile == null) return false;

        EffectsLibrary.spawn("fx_cloud", pTile, HelloClouds.EMBER);
        MusicBox.playSound("event:/SFX/UNIQUE/SpawnCloud", pTile.pos.x, pTile.pos.y);
        return true;
    }
};
AssetManager.powers.add(power);
```

О создании кнопки читайте в разделах **[Божественные силы](#/nml/god-powers)** и **[Вкладки и кнопки сил](#/nml/power-buttons)**.

## Ванильные облака

Полезны как основа для клонирования и как напоминание о том, что уже есть в игре:

`cloud_rain` · `cloud_lightning` · `cloud_snow` · `cloud_fire` · `cloud_lava` · `cloud_acid` · `cloud_ash` · `cloud_rage`

```csharp
// Начните с готового рабочего облака и измените только цвет и тип капли.
CloudAsset mine = AssetManager.clouds.clone("hello_cloud_blood", "cloud_rain");
mine.color_hex = "#8B1A1A";
mine.drop_id = "blood";
```

Помните, что метод `clone()` регистрирует ассет автоматически: не вызывайте `add()` следом.

## Свои спрайты с нуля

`path_sprites` — это список путей внутри вашей папки `GameResources/`, подчиняющийся тем же правилам. См. **[Спрайты и ресурсы](#/nml/sprites-and-resources)**. Спрайт облака — это пушистая клякса; `color_hex` делает всю работу, поэтому полупрозрачного силуэта в градациях серого более чем достаточно.

> [!TIP] Облака вместо сложных бедствий
> "Бедствие" в игровых списках зачастую представляет собой обычное облако с параметром `considered_disaster = true`. Прежде чем писать сложную катастрофу (disaster) с условиями появления и таймерами, проверьте, не решает ли облако с вашей каплей ту же задачу гораздо проще :PES2_HmmmmThumbsUp:.
