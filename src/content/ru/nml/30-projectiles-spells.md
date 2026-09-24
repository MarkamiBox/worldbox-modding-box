---
title: Снаряды, заклинания и эффекты
group: Игровой контент
subgroup: Актеры, здания и ИИ
icon: :wblightning:
order: 148
---

# Снаряды, заклинания и эффекты :wblightning:

Три компактные библиотеки, которые требуются постоянно, как только вы начинаете создавать активные события на карте:

| | |
| --- | --- |
| `AssetManager.projectiles` | Всё, что летит из точки А в точку Б: стрела, зажигательная бомба, брошенный факел |
| `AssetManager.spells` | То, что существо колдует само по себе, с затратами маны и вероятностью выбора ИИ |
| `AssetManager.effects_library` | Чистая визуализация: взрыв, облако, вспышка света, клуб дыма |

## Снаряды

```csharp Mods/HelloBox/Code/HelloProjectiles.cs
namespace HelloBox
{
    public static class HelloProjectiles
    {
        public const string EMBER_BOLT = "hello_ember_bolt";

        public static void Initialize()
        {
            if (AssetManager.projectiles.has(EMBER_BOLT)) return;

            AssetManager.projectiles.clone(EMBER_BOLT, "firebomb");

            ProjectileAsset bolt = AssetManager.projectiles.get(EMBER_BOLT);
            bolt.texture = "hello_bolt";                    // sprite in GameResources/effects/projectiles/
            bolt.speed = 16f;
            bolt.speed_random = 2f;
            bolt.look_at_target = true;
            bolt.trail_effect_enabled = true;
            bolt.trail_effect_id = "fx_fire_smoke";
            bolt.end_effect = "fx_firebomb_explosion";
            bolt.terraform_option = "demon_fireball";     // воздействие на землю при ударе
            bolt.terraform_range = 2;

            bolt.impact_actions = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
            {
                if (pTile == null) return false;

                World.world.drop_manager.spawn(pTile, "fire", 15f, -1f, -1L);
                return true;
            };
        }
    }
}
```

### Описание полей

Большинство из них приходит вместе с тем, что вы клонировали, и вы на них больше не смотрите. `speed` и `texture` - те два, что вы действительно будете менять.

| Поле | Что делает |
| --- | --- |
| `texture`, `texture_shadow` | Спрайт и его тень |
| `animated`, `animation_speed`, `frames` | Анимируется ли снаряд во время полета |
| `speed`, `speed_random` | Скорость полета и случайный разброс при выстреле |
| `look_at_target` | Поворачивается ли спрайт по направлению движения |
| `scale_start`, `scale_target` | Размер при вылете и при падении |
| `trail_effect_enabled`, `trail_effect_id`, `trail_effect_scale`, `trail_effect_timer` | Шлейф позади снаряда |
| `end_effect`, `end_effect_scale` | Эффект в точке попадания |
| `terraform_option`, `terraform_range` | Изменение ландшафта при ударе. См. **[Плитки и ландшафт](#/nml/tiles)** |
| `world_actions` | Срабатывает во время полета |
| `impact_actions` | Срабатывает в момент попадания |
| `trigger_on_collision` | Взрывается при первом столкновении вместо точки назначения |
| `hit_freeze`, `hit_shake`, `shake_*` | Физическая отдача от удара |
| `can_be_blocked`, `can_be_left_on_ground` | Блокируется ли щитами, остается ли лежать на земле |
| `sound_launch`, `sound_impact` | Звуковые события FMOD |
| `draw_light_area`, `draw_light_size` | Свечение в полете |

### Запуск снаряда

```csharp
if (actor?.current_tile == null || target?.current_tile == null) return;

World.world.projectiles.spawn(
    pInitiator: actor,
    pTargetObject: target,
    pAssetID: HelloProjectiles.EMBER_BOLT,
    pLaunchPosition: actor.current_tile.posV3,
    pTargetPosition: target.current_tile.posV3);
```

Обе позиции имеют тип `Vector3`. Поле `posV3` клетки получить проще всего; а `current_position` существа — это `Vector2`, поэтому его нужно предварительно сконвертировать.

Ванильные id для клонирования: `arrow` · `snowball` · `firebomb` · `torch`.

### Собственный спрайт

Поле `texture` у снаряда — это **не** полный путь. Библиотека сама приписывает спереди `effects/projectiles/`, поэтому указывать нужно только имя файла.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/projectiles/
        └── hello_bolt/
            ├── hello_bolt_0.png
            └── hello_bolt_1.png
```

```csharp
bolt.texture = "hello_bolt";   // НЕ "effects/projectiles/hello_bolt"
```

Снаряды тоже загружаются как список спрайтов: **папка** с именем `texture`, по PNG на кадр, и несколько кадров становятся анимацией полета, когда включен `animated`. Отдельный `hello_bolt.png` возвращается пустым списком, и отрисовка снаряда бросает `ArgumentOutOfRangeException` :PESgn_Oops:.

Поле `texture_shadow` — это полный путь без автопрефиксов: в ванили оно указывает на общий `shadows/projectiles/shadow_ball`, и использовать его повторно почти всегда разумнее всего.

## Заклинания

Заклинание — это способность, которую существо использует по собственному решению, без участия игрока. ИИ решает, когда её кастовать, на основе `chance`, `cost_mana` и `min_distance`.

```csharp
SpellAsset bolt = new SpellAsset
{
    id = "hello_bolt",
    chance = 0.15f,                     // насколько охотно ИИ выбирает заклинание
    min_distance = 5f,                  // не кастует ближе этой дистанции
    cost_mana = 8,
    cast_target = CastTarget.Enemy,     // Enemy, Himself, Region, Friendly
    cast_entity = CastEntity.UnitsOnly, // UnitsOnly, BuildingsOnly, Both, Tile
    can_be_used_in_combat = true,
    health_ratio = 0f                   // кастует только при здоровье ниже этой доли. 0 = всегда
};

bolt.action = (BaseSimObject pSelf, BaseSimObject pTarget, WorldTile pTile) =>
{
    if (pTarget == null || pTile == null) return false;

    MapBox.spawnLightningSmall(pTile, 0.15f);
    return true;
};

AssetManager.spells.add(bolt);
```

Поле `action` представляет собой делегат `AttackAction` — ту же сигнатуру, что используют оружейные модификаторы, поэтому тело заклинания и логика чар оружия взаимозаменяемы.

### Выдача заклинания сущности

Заклинания привязываются по id к тому, что их дает:

```csharp
trait.addSpell("hello_bolt");        // любая черта из всех 7 систем
item.addSpell("hello_bolt");         // предмет экипировки
actorAsset.spell_ids = new List<string> { "hello_bolt" };
```

Полезные ванильные заклинания для изучения: `teleport` · `summon_lightning` · `summon_tornado` · `cast_curse` · `cast_fire` · `cast_silence`.

## Боевые действия

`CombatActionAsset` — это делегат, срабатывающий при боевом событии, обычно для вызова заклинания или эффекта:

```csharp Mods/HelloBox/Code/HelloSpells.cs
CombatActionAsset action = new CombatActionAsset
{
    id = "hello_cast_on_attack",
    action = (pSelf, pTarget, pWorldTile) =>
    {
        if (pSelf == null || !pSelf.isAlive()) return false;

        // do the cast
        return true;
    }
};
AssetManager.combat_actions.add(action);
```

Привяжите его к событию в вашей черте:

```csharp
trait.addCombatAction(CombatActionAsset.BEFORE_ATTACK_MELEE, "hello_cast_on_attack");
```

> [!WARNING] Их раздают только черты
> Вы не можете прикрепить боевое действие напрямую к `ActorAsset`. Каждое боевое событие перебирает черты актора и опрашивает их действия, поэтому если вам нужно действие на существе, поместите его в черту, а черту выдайте существу :PES2_Shrug:.

## Эффекты

Класс `EffectAsset` — это чисто визуальное оформление: префаб или покадровая анимация спрайтов в заданных координатах. Вы будете вызывать существующие эффекты в сотни раз чаще, чем делать новые.

```csharp
EffectsLibrary.spawn("fx_firebomb_explosion", tile);
EffectsLibrary.spawn("fx_cloud", tile, "cloud_rain");   // некоторые эффекты принимают параметр
EffectsLibrary.spawnExplosionWave(tile.posV3, 3f, 0.5f);
```

| Поле | Что делает |
| --- | --- |
| `prefab_id`, `use_basic_prefab` | Какой префаб инстанцировать |
| `sprite_path`, `load_texture`, `time_between_frames` | Спрайтовая анимация взамен префаба |
| `spawn_action` | Код при появлении эффекта (так `fx_cloud` превращает аргумент в облако) |
| `limit`, `limit_unload` | Сколько может одновременно существовать на экране |
| `cooldown_interval` | Минимальная пауза между повторными появлениями |
| `sound_launch`, `sound_loop_idle` | Звуковые события FMOD |
| `draw_light_area`, `draw_light_size` | Освещение |
| `show_on_mini_map` | Отображается ли на миникарте |

> [!TIP] Сначала проверьте наличие
> В игре уже есть сотни эффектов `fx_*`, а класс `EffectsLibrary` весьма компактен. Откройте его в dnSpy (см. **[Чтение кода игры](#/toolbox/reading-the-game-code)**) и пробегитесь по списку идентификаторов. Почти всегда взрыв, который вы собирались рисовать, уже давно готов :PESgn_CheckPins:.
