---
title: Эффекты статуса
group: Игровой контент
subgroup: Актеры, здания и ИИ
icon: :wbcursed:
order: 146
---

# Эффекты статуса :wbcursed:

Черта определяет то, кем существо **является**. Эффект статуса определяет то, что происходит с ним **прямо сейчас**: горение, заморозка, отравление, благословение. Статусы спадают со временем, накладывают поверх существа свой спрайт и могут выполнять действия по таймеру.

## Регистрация эффекта состояния

Статусы живут в библиотеке `AssetManager.status`. Та же схема, что и с чертами: создаём объект ассета, заполняем поля, добавляем в библиотеку.

```csharp Mods/HelloBox/Code/HelloStatus.cs
namespace HelloBox
{
    public static class HelloStatus
    {
        public const string CURSED = "hello_cursed";

        public static void Initialize()
        {
            if (AssetManager.status.has(CURSED)) return;

            StatusAsset cursed = new StatusAsset
            {
                id = CURSED,

                // Statuses do NOT derive their locale keys from the id.
                // Set both, or the unit shows a blank tooltip.
                locale_id = "status_title_hello_cursed",
                locale_description = "status_description_hello_cursed",

                texture = "fx_hello_status",          // a folder of frames in GameResources/effects/
                path_icon = "ui/Icons/iconHelloStatus",       // icon in GameResources/ui/Icons/
                duration = 20f,                           // seconds, then it removes itself
                tier = StatusTier.Advanced,               // None, Basic or Advanced
                can_be_cured = true,
                allow_timer_reset = true,                 // re-applying refreshes the timer
                animated = true,
                animation_speed = 0.15f,
                loop = true,
                scale = 1f,
                offset_y = 0.2f,
                affects_mind = false,
                removed_on_damage = false,
                opposite_status = new string[] { "blessed" },
                remove_status = new string[] { "shield" }
            };

            // StatusAsset allocates its own base_stats, so unlike traits you can set
            // these before add(). Doing it after works too, and is the safer habit.
            cursed.base_stats["damage"] = -5;
            cursed.base_stats["speed"] = -10f;

            AssetManager.status.add(cursed);

            // StatusLibrary turns texture into frames, and flags the status as drawable, in its
            // own post-init: before your mod existed. Without these two the first unit that gets
            // the status throws NullReferenceException every frame.
            cursed.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + cursed.texture);
            cursed.need_visual_render = true;
        }
    }
}
```

> [!WARNING] Кадры загружаются только для ванильных статусов
> `StatusLibrary` заполняет `sprite_list` из `"effects/" + texture` и ставит `need_visual_render` один раз при загрузке. У статуса, добавленного позже, `sprite_list = null`, и как только существо его получает, `Status.updateAnimationFrame()` кидает `NullReferenceException` каждый кадр, пока статус длится :wbfacepalm:. Последние две строки `Initialize` делают это для вашего.
>
> `texture` — это **папка**: `GameResources/effects/fx_hello_status/`, по одному PNG на кадр.


### Важнейшие поля

Короткий список. Настоящий длиннее и по большей части скучный :wbyawn:.

| Поле | Что делает |
| --- | --- |
| `duration` | Время действия в секундах. Статус снимается сам по истечении времени |
| `allow_timer_reset` | Сбрасывает ли повторное наложение таймер в исходное состояние |
| `tier` | `StatusTier.None`, `Basic` или `Advanced`. Сверяется с `allowed_status_tiers` существа |
| `can_be_cured` | Может ли исцеляющая магия снять этот статус |
| `removed_on_damage` | Спадает в момент получения удара существом |
| `cancel_actor_job` | Сбивает текущее действие существа при наложении |
| `affects_mind` | Помечает эффект как воздействие на разум |
| `opposite_status` | Статусы, несовместимые с данным |
| `remove_status` | Статусы, принудительно снимаемые при наложении этого |
| `base_stats` | Бонусы/штрафы к характеристикам во время действия |
| `locale_id` / `locale_description` | Ключи названия и описания. **Обязательны** |
| `path_icon` | Маленькая иконка в интерфейсном списке статусов |
| `texture`, `sprite_list`, `animated`, `loop`, `animation_speed` | Спрайт поверх существа. В `texture` указывается простое имя из `effects/` |
| `offset_x`, `offset_y`, `scale`, `rotation_z`, `render_priority` | Настройки отображения и смещения |
| `opposite_traits`, `opposite_tags` | Черты и теги, блокирующие получение этого статуса |
| `action_on_receive`, `action_get_hit` | Дополнительные колбэки при наложении и получении урона |
| `sound_idle` | Зацикленный звук FMOD во время действия статуса |

## Собственный спрайт

Здесь есть ловушка, и все хоть раз в неё попадают :wbbre:. `texture` - это **не** полный путь: библиотека статусов перед загрузкой добавляет спереди `effects/`, поэтому вы пишете только имя.

```text Mods/HelloBox/
HelloBox/
└── GameResources/
    └── effects/
        └── fx_hello_status/
            ├── fx_hello_status_0.png
            ├── fx_hello_status_1.png
            └── fx_hello_status_2.png
```

```csharp
cursed.texture = "fx_hello_status";   // НЕ "effects/fx_hello_status"
```

Если вписать папку самому, игра будет искать `effects/effects/fx_hello_status`, ничего не найдёт и вообще не нарисует спрайт. Ванильные имена выглядят как `fx_status_burning_t` и `fx_status_drowning_t`, так что, копируя эту форму, вы избежите проблем.

`path_icon` у того же ассета - это другое, и он *является* полным путём: это маленькая иконка в списке статусов, а не спрайт, нарисованный на юните.

## Как заставить эффект *действовать*

Делегат `action` вызывается каждые `action_interval` секунд, пока статус активен. `action_finish` срабатывает при окончании времени действия, а `action_death` — если существо погибло со статусом.

```csharp
cursed.action_interval = 1f;
cursed.action = (BaseSimObject pTarget, WorldTile pTile) =>
{
    Actor actor = pTarget as Actor;
    if (actor == null || !actor.isAlive()) return false;

    actor.changeHealth(-2);   // публичный метод, идеально подходящий для периодического урона
    return true;
};
```

## Наложение эффекта на юнита

Самый очевидный метод, `actor.addStatusEffect("hello_cursed")`, помечен в коде игры как `internal`. Он спокойно компилируется против публицизированной `Assembly-CSharp.dll`, и у обычного мода NML она уже есть: NML компилирует ваш `Code/*.cs` против своей публицизированной копии, поэтому каждый `internal`-член из этого гайда у вас компилируется. Теряете вы это только когда собираете собственную `.dll` в Visual Studio против оригинальной сборки. Для этого случая публичный путь работает всегда:

```csharp
StatusAsset asset = AssetManager.status.get(HelloStatus.CURSED);
World.world.statuses.newStatus(actor, asset, 20f);   // 20 сек (или 0 для стандартного времени ассета)
```

В деревьях поведения для этого есть готовые узлы: `new BehActorAddStatus("hello_cursed", 20f)` и `new BehActorRemoveStatus("hello_cursed")`.

## Не забудьте про тексты

```json Mods/HelloBox/Locales/en.json
{
  "status_title_hello_cursed": "Cursed",
  "status_description_hello_cursed": "Something very old is very annoyed at this creature."
}
```

Используйте в файле локализации те же ключи, что прописали в `locale_id` и `locale_description`. Ванильная схема `status_title_<id>` / `status_description_<id>` помогает поддерживать порядок в текстах.

> [!TIP] Статусы — лучший инструмент для временных эффектов
> Любой временный эффект (бафф от божественной силы, дебафф от удара мечом, временная метка) должен быть статусом, а не чертой. Черты остаются навсегда и передаются потомству, что почти наверняка не входит в ваши планы :PES2_Uhm:.
