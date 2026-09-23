---
title: Капли и падающие объекты
group: Игровой контент
subgroup: Предметы и снаряжение
icon: :wbloot:
order: 126
---

# Капли и падающие объекты :wbloot:

**Капля** (drop) - это небольшой объект, который падает с неба, приземляется на тайл и что-то делает: дождь, кровь, семена, огонь, кислота, монеты. Это самый дешевый способ во всей игре заставить что-то *происходить* на карте, к тому же со встроенной анимацией и звуком абсолютно бесплатно.

## Регистрация капли

Капли живут в `AssetManager.drops`. Вот капля, которая приземляется и поджигает тайл:

```csharp Mods/HelloBox/Code/HelloDrops.cs
using NeoModLoader.api;
using UnityEngine;

namespace HelloBox
{
    public static class HelloDrops
    {
        public static void Initialize()
        {
            DropAsset ember = new DropAsset
            {
                id = "hello_ember",
                path_texture = "drops/hello_ember",   // sprite in GameResources/drops/
                type = DropType.DropMagic,
                animated = true,
                animation_speed = 0.03f,
                default_scale = 0.1f,
                falling_speed = 3.2f,
                sound_drop = "event:/SFX/DROPS/DropBlessing"
            };

            // что происходит в момент касания земли
            ember.action_landed = (WorldTile pTile, string pDropID) =>
            {
                if (pTile == null) return;
                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
            };

            AssetManager.drops.add(ember);
        }
    }
}
```

Затем в `Main.cs` добавьте строчку: `HelloDrops.Initialize();`

### Что делают поля

| Поле | Назначение |
| --- | --- |
| `id` | Имя, которое вы используете везде |
| `path_texture` | Спрайт, правила путей те же, что и для остального |
| `type` | `DropType.DropMagic`, `DropGeneric`, … Определяет часть встроенной логики игры |
| `animated` + `animation_speed` | Воспроизводит список спрайтов как анимацию |
| `default_scale` | Размер объекта. `0.1f` - стандарт для мелких капель |
| `falling_speed` | Скорость падения |
| `sound_drop` / `sound_launch` | Звуковые события FMOD |
| `action_landed` | **Самое интересное**: ваш код, выполняющийся при приземлении |
| `action_launch` | Выполняется при запуске/броске |

## Свой собственный спрайт

`path_texture` загружается в точности так, как указано, из папки `GameResources/`.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── drops/
        └── hello_ember/
            ├── hello_ember_0.png
            └── hello_ember_1.png
```

```csharp
ember.path_texture = "drops/hello_ember";   // a folder
```

Дропы загружаются как **список спрайтов**: игра читает каждый PNG *внутри* этой папки, поэтому и работает `animated`. Неподвижный дроп - это тоже папка, просто с одним кадром. Отдельный `drops/hello_ember.png` возвращается пустым списком, и дроп падает невидимым.

## Как заставить капли падать

Два способа, оба через `World.world.drop_manager`:

```csharp
// строго вниз на тайл: (tile, dropId, height, ?, ownerId)
World.world.drop_manager.spawn(tile, "hello_ember", 15f, -1f, -1L);

// бросок по дуге, как разлетающиеся от взрыва осколки
World.world.drop_manager.spawnParabolicDrop(tile, "hello_ember", 0f, 0.1f, 5f, 0.5f, 4f, 0.15f);
```

В 90% случаев вам нужен именно `spawn`. `15f` - это высота, с которой она падает: чем больше число, тем дольше падение.

## Реальный пример: божественная сила, вызывающая дождь из углей

Если вы уже изучили страницу **[Божественные силы](#/nml/god-powers)**, вот вам награда: одна сила, поджигающая весь тайл.

```csharp Mods/HelloBox/Code/HelloPowers.cs
power.click_action = (WorldTile pTile, string pPowerID) =>
{
    if (pTile == null) return false;

    // одна в центре, по одной на каждом соседнем тайле
    World.world.drop_manager.spawn(pTile, "hello_ember", 15f, -1f, -1L);
    foreach (WorldTile neighbour in pTile.neighboursAll)
    {
        World.world.drop_manager.spawn(neighbour, "hello_ember", 15f, -1f, -1L);
    }
    return true;
};
```

> [!TIP] Капли - спецэффект для ленивых
> Прежде чем писать систему частиц, спросите себя: не решит ли задачу капля со спрайтом и `action_landed`? Обычно решает, за десять строк кода и уже со звуком :PESgn_Noice:.
